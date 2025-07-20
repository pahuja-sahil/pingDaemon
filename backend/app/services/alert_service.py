import logging
from sqlalchemy.orm import Session
from uuid import UUID
from typing import Dict, Any

from ..models.job import Job
from ..models.log import HealthLog
from ..workers.mailer import send_alert_email

logger = logging.getLogger(__name__)

class AlertService:
    """Service for handling alert logic and triggering notifications"""
    
    @staticmethod
    def should_send_alert(db: Session, job: Job) -> bool:
        """
        Determine if an alert should be sent for this job
        
        Args:
            db: Database session
            job: Job to check
            
        Returns:
            bool: True if alert should be sent
        """
        # Get recent health logs to check failure count
        recent_logs = db.query(HealthLog).filter(
            HealthLog.job_id == job.id
        ).order_by(HealthLog.checked_at.desc()).limit(job.failure_threshold).all()
        
        # Must have enough logs to meet threshold
        if len(recent_logs) < job.failure_threshold:
            return False
        
        # All recent logs must be failures
        all_failures = all(not log.is_healthy for log in recent_logs)
        
        # Only send alert if we've just crossed the threshold
        # (to avoid spam on subsequent failures)
        if all_failures:
            # Check if we have exactly threshold failures
            # If we have more than threshold, check if the (threshold+1)th log was healthy
            next_logs = db.query(HealthLog).filter(
                HealthLog.job_id == job.id
            ).order_by(HealthLog.checked_at.desc()).limit(job.failure_threshold + 1).all()
            
            if len(next_logs) == job.failure_threshold + 1:
                # If the next log was healthy, this is the first time we hit threshold
                return next_logs[-1].is_healthy
            else:
                # This is the first time we have enough failures
                return True
        
        return False
    
    @staticmethod
    def trigger_alert(
        job_id: UUID, 
        failure_count: int, 
        error_message: str = None
    ) -> Dict[str, Any]:
        """
        Trigger an email alert for job failure
        
        Args:
            job_id: UUID of the job that failed
            failure_count: Number of consecutive failures
            error_message: Error message from health check
            
        Returns:
            Dict with trigger result
        """
        try:
            # Send alert email asynchronously via Celery
            task = send_alert_email.delay(
                job_id=str(job_id),
                failure_count=failure_count,
                error_message=error_message
            )
            
            logger.info(f"Alert email task queued for job {job_id} (task_id: {task.id})")
            
            return {
                'success': True,
                'task_id': task.id,
                'message': 'Alert email queued for sending'
            }
            
        except Exception as e:
            logger.error(f"Failed to queue alert email for job {job_id}: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'message': 'Failed to queue alert email'
            }