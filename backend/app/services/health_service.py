import requests
import time
import logging
from datetime import datetime
from sqlalchemy.orm import Session
from typing import Dict, Any
from uuid import UUID

from ..models.job import Job
from ..models.log import HealthLog
from ..models.user import User
from .email_queue_service import EmailQueueService

logger = logging.getLogger(__name__)

class HealthService:
    
    @staticmethod
    def check_url_health(url: str, timeout: int = 10) -> Dict[str, Any]:
        """
        Perform health check on a URL and return results
        
        Returns:
            Dict containing:
            - is_healthy: bool
            - status_code: int | None
            - response_time: float (milliseconds)
            - error_message: str | None
        """
        start_time = time.time()
        
        try:
            session = requests.Session()
            session.headers.update({'User-Agent': 'pingDaemon/1.0 Health Checker'})
            
            response = session.get(
                url,
                timeout=timeout,
                allow_redirects=True
            )
            
            response_time = (time.time() - start_time) * 1000
            is_healthy = 200 <= response.status_code < 300
            
            return {
                'is_healthy': is_healthy,
                'status_code': response.status_code,
                'response_time': round(response_time, 2),
                'error_message': None if is_healthy else f"HTTP {response.status_code}"
            }
            
        except requests.exceptions.Timeout:
            response_time = (time.time() - start_time) * 1000
            logger.warning(f"Health check timeout for {url} after {timeout}s")
            return {
                'is_healthy': False,
                'status_code': None,
                'response_time': round(response_time, 2),
                'error_message': f"Request timeout after {timeout}s"
            }
            
        except requests.exceptions.ConnectionError as e:
            response_time = (time.time() - start_time) * 1000
            logger.warning(f"Health check connection failed for {url}: {str(e)}")
            return {
                'is_healthy': False,
                'status_code': None,
                'response_time': round(response_time, 2),
                'error_message': "Connection failed"
            }
            
        except requests.exceptions.RequestException as e:
            response_time = (time.time() - start_time) * 1000
            return {
                'is_healthy': False,
                'status_code': None,
                'response_time': round(response_time, 2),
                'error_message': f"Request error: {str(e)}"
            }
    
    @staticmethod
    def log_health_check(db: Session, job_id: UUID, check_result: Dict[str, Any]) -> HealthLog:
        """Log health check result to database"""
        health_log = HealthLog(
            job_id=job_id,
            status_code=check_result['status_code'],
            response_time=check_result['response_time'],
            is_healthy=check_result['is_healthy'],
            error_message=check_result['error_message']
        )
        
        db.add(health_log)
        db.commit()
        db.refresh(health_log)
        return health_log
    
    @staticmethod
    def check_failure_threshold(db: Session, job: Job) -> bool:
        """
        Check if job has exceeded failure threshold
        
        Returns:
            bool: True if threshold exceeded, False otherwise
        """
        # Get recent health logs for this job (limit to threshold + 1)
        recent_logs = db.query(HealthLog).filter(
            HealthLog.job_id == job.id
        ).order_by(HealthLog.checked_at.desc()).limit(job.failure_threshold).all()
        
        # If we don't have enough logs, threshold not exceeded
        if len(recent_logs) < job.failure_threshold:
            return False
        
        # Check if all recent logs are failures
        all_failures = all(not log.is_healthy for log in recent_logs)
        
        return all_failures
    
    @staticmethod
    def update_job_status(db: Session, job: Job, is_healthy: bool) -> Job:
        """Update job current status based on health check"""
        # Store previous status for status change detection
        job.previous_status = job.current_status
        
        if is_healthy:
            job.current_status = "healthy"
        else:
            # Check if we've exceeded failure threshold
            if HealthService.check_failure_threshold(db, job):
                job.current_status = "unhealthy"
            else:
                # Still mark as unhealthy immediately for simplicity
                job.current_status = "unhealthy"
        
        db.commit()
        db.refresh(job)
        return job
    
    @staticmethod
    def perform_health_check(db: Session, job: Job) -> Dict[str, Any]:
        """
        Perform complete health check workflow for a job with simplified email logic
        
        Returns:
            Dict containing check results and status updates
        """
        # Skip if job is disabled
        if not job.is_enabled:
            return {
                'job_id': job.id,
                'skipped': True,
                'reason': 'Job is disabled'
            }
        
        # Store current status before update
        previous_status = job.current_status
        
        # Perform health check
        check_result = HealthService.check_url_health(job.url)
        
        # Log the result
        health_log = HealthService.log_health_check(db, job.id, check_result)
        
        # Update job status (this also sets previous_status in the job)
        updated_job = HealthService.update_job_status(db, job, check_result['is_healthy'])
        
        # SIMPLIFIED: Check for ANY status change and queue email
        email_queued = None
        status_changed = previous_status != updated_job.current_status
        
        if status_changed:
            logger.info(f"🔄 STATUS CHANGE: {previous_status} → {updated_job.current_status} for job {job.id}")
            try:
                # Get job owner
                user = db.query(User).filter(User.id == job.user_id).first()
                if user:
                    # Queue email for ANY status change (handles all transitions)
                    email_queue = EmailQueueService.queue_status_change_alert(
                        db=db,
                        job=updated_job,
                        user=user,
                        previous_status=previous_status,
                        current_status=updated_job.current_status,
                        error_message=check_result.get('error_message')
                    )
                    
                    email_queued = {
                        'method': 'unified_format',
                        'email_queue_id': email_queue.id,
                        'status_change': f"{previous_status} → {updated_job.current_status}"
                    }
                    
                    logger.info(f"📧 Email queued for {user.email}: {previous_status} → {updated_job.current_status}")
                else:
                    logger.error(f"❌ No user found for job {job.id}")
                    email_queued = {'error': f'User not found: {job.user_id}'}
            except Exception as e:
                logger.error(f"💥 Exception queuing email for job {job.id}: {str(e)}")
                email_queued = {'error': str(e)}

        should_alert = (
            not check_result['is_healthy'] and 
            HealthService.check_failure_threshold(db, job)
        )
        
        return {
            'job_id': job.id,
            'job_url': job.url,
            'check_result': check_result,
            'current_status': updated_job.current_status,
            'previous_status': previous_status,
            'should_alert': should_alert,
            'health_log_id': health_log.id,
            'skipped': False,
            'email_queued': email_queued,
            'status_changed': status_changed
        }