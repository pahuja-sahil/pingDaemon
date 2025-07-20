from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from typing import List, Optional
from uuid import UUID

from ..models.job import Job
from ..models.user import User
from ..schemas.job import JobCreate, JobUpdate

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
        
        # Create new job
        db_job = Job(
            url=str(job_data.url),
            interval=job_data.interval,
            is_enabled=job_data.is_enabled,
            failure_threshold=job_data.failure_threshold,
            user_id=user.id
        )
        
        db.add(db_job)
        db.commit()
        db.refresh(db_job)
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
        """Update an existing job"""
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
                setattr(job, field, str(value))
            else:
                setattr(job, field, value)
        
        db.commit()
        db.refresh(job)
        return job
    
    @staticmethod
    def delete_job(db: Session, job_id: UUID, user: User) -> bool:
        """Delete a job"""
        job = JobService.get_job_by_id(db, job_id, user)
        
        db.delete(job)
        db.commit()
        return True
    
    @staticmethod
    def toggle_job_status(db: Session, job_id: UUID, user: User) -> Job:
        """Toggle job enabled/disabled status"""
        job = JobService.get_job_by_id(db, job_id, user)
        
        job.is_enabled = not job.is_enabled
        db.commit()
        db.refresh(job)
        return job