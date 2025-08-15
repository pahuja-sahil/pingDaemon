from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from typing import List, Optional
from uuid import UUID
import logging

from ..models.job import Job
from ..models.user import User
from ..schemas.job import JobCreate, JobUpdate

logger = logging.getLogger(__name__)

class JobService:
    
    @staticmethod
    def create_job(db: Session, job_data: JobCreate, user: User) -> Job:
        """Create a new monitoring job for a user"""
        # Validate interval values
        allowed_intervals = [5, 10, 15, 30, 60]
        if job_data.interval not in allowed_intervals:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Interval must be one of {allowed_intervals} minutes"
            )
        
        # Validate failure threshold
        if job_data.failure_threshold < 1 or job_data.failure_threshold > 10:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failure threshold must be between 1 and 10"
            )
        
        # Create new job with unknown status (will be updated after first health check)
        db_job = Job(
            url=str(job_data.url),
            interval=job_data.interval,
            is_enabled=job_data.is_enabled,
            failure_threshold=job_data.failure_threshold,
            user_id=user.id,
            current_status="unknown",    # Initial status for new monitors
            previous_status="unknown"    # Initial previous status
        )
        
        db.add(db_job)
        db.commit()
        db.refresh(db_job)
        
        # Schedule immediate health check for new monitor if enabled
        if db_job.is_enabled:
            try:
                from ..services.scheduler_service import SchedulerService
                result = SchedulerService.schedule_immediate_check(db_job.id)
                if result.get('success'):
                    logger.info(f"✅ NEW MONITOR CREATED: {db_job.url} - Immediate health check scheduled (task: {result.get('task_id')})")
                else:
                    logger.warning(f"⚠️ NEW MONITOR CREATED: {db_job.url} - Failed to schedule immediate check: {result.get('error')}")
            except Exception as e:
                logger.error(f"❌ NEW MONITOR CREATED: {db_job.url} - Exception scheduling immediate check: {str(e)}")
        else:
            logger.info(f"📝 NEW MONITOR CREATED: {db_job.url} - Monitor disabled, no health check scheduled")
        
        return db_job
    
    @staticmethod
    def get_user_jobs(db: Session, user: User, skip: int = 0, limit: int = 100) -> List[Job]:
        """Get all jobs for a user with pagination"""
        return db.query(Job).filter(
            Job.user_id == user.id
        ).offset(skip).limit(limit).all()
    
    @staticmethod
    def get_job_by_id(db: Session, job_id: UUID, user: User) -> Optional[Job]:
        """Get a specific job by ID (only if it belongs to the user)"""
        job = db.query(Job).filter(
            Job.id == job_id,
            Job.user_id == user.id
        ).first()
        
        if not job:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Job not found"
            )
        return job
    
    @staticmethod
    def update_job(db: Session, job_id: UUID, job_data: JobUpdate, user: User) -> Job:
        """Update an existing job WITHOUT resetting status"""
        job = JobService.get_job_by_id(db, job_id, user)
        
        # Validate interval if provided
        if job_data.interval is not None:
            allowed_intervals = [5, 10, 15, 30, 60]
            if job_data.interval not in allowed_intervals:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Interval must be one of {allowed_intervals} minutes"
                )
        
        # Validate failure threshold if provided
        if job_data.failure_threshold is not None:
            if job_data.failure_threshold < 1 or job_data.failure_threshold > 10:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Failure threshold must be between 1 and 10"
                )
        
        # Update fields that are provided
        update_data = job_data.dict(exclude_unset=True)
        
        for field, value in update_data.items():
            if field == "url" and value is not None:
                old_url = job.url
                new_url = str(value)
                if old_url != new_url:
                    logger.info(f"🔄 URL CHANGED: Job {job.id} URL changed from '{old_url}' to '{new_url}' - Status kept as '{job.current_status}'")
                setattr(job, field, new_url)
            else:
                setattr(job, field, value)
        
        db.commit()
        db.refresh(job)
        return job
    
    @staticmethod
    def delete_job(db: Session, job_id: UUID, user: User) -> bool:
        """Delete a job and all related records with proper error handling"""
        from ..models.log import HealthLog
        from ..models.alert import Alert
        from ..models.email_queue import EmailQueue
        
        try:
            # Verify job exists and user owns it
            job = JobService.get_job_by_id(db, job_id, user)
            job_url = job.url  # Store for logging
            
            # Get counts for logging
            email_count = db.query(EmailQueue).filter(EmailQueue.job_id == job_id).count()
            log_count = db.query(HealthLog).filter(HealthLog.job_id == job_id).count()
            alert_count = db.query(Alert).filter(Alert.job_id == job_id).count()
            
            print(f"Deleting job {job_id} ({job_url}) with {email_count} emails, {log_count} logs, {alert_count} alerts")
            
            # Delete related records in proper order
            # 1. Delete email queue entries
            deleted_emails = db.query(EmailQueue).filter(EmailQueue.job_id == job_id).delete(synchronize_session=False)
            
            # 2. Delete health logs
            deleted_logs = db.query(HealthLog).filter(HealthLog.job_id == job_id).delete(synchronize_session=False)
            
            # 3. Delete alerts
            deleted_alerts = db.query(Alert).filter(Alert.job_id == job_id).delete(synchronize_session=False)
            
            # 4. Finally delete the job itself
            db.delete(job)
            
            # Commit all changes
            db.commit()
            
            print(f"Successfully deleted job {job_id}. Removed: {deleted_emails} emails, {deleted_logs} logs, {deleted_alerts} alerts")
            return True
            
        except Exception as e:
            # Rollback on any error
            db.rollback()
            print(f"Failed to delete job {job_id}: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to delete monitor: {str(e)}"
            )
    
    @staticmethod
    def toggle_job_status(db: Session, job_id: UUID, user: User) -> Job:
        """Toggle job enabled/disabled status"""
        job = JobService.get_job_by_id(db, job_id, user)
        
        job.is_enabled = not job.is_enabled
        db.commit()
        db.refresh(job)
        return job