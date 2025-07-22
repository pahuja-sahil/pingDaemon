import logging
from datetime import datetime
from sqlalchemy.orm import Session
from uuid import UUID

from ..database import get_db
from ..email.resend_client import ResendClient
from ..models.job import Job
from ..models.user import User
from ..models.alert import Alert

logger = logging.getLogger(__name__)

# Import the main Celery app instance
from ..celery_worker import celery_app

@celery_app.task(bind=True, retry_backoff=True, max_retries=3)
def send_alert_email(self, job_id: str, failure_count: int, error_message: str = None):
    """
    Celery task to send email alert for job failure
    
    Args:
        job_id: UUID of the job that failed
        failure_count: Number of consecutive failures
        error_message: Error message from health check
    """
    db = next(get_db())
    
    try:
        # Get job and user information
        job = db.query(Job).filter(Job.id == UUID(job_id)).first()
        if not job:
            logger.error(f"Job {job_id} not found")
            return
        
        user = db.query(User).filter(User.id == job.user_id).first()
        if not user:
            logger.error(f"User for job {job_id} not found")
            return
        
        # Create alert record
        alert = Alert(
            alert_type="email",
            recipient=user.email,
            subject=f"🚨 Health Check Alert: {job.url} is DOWN",
            message=f"URL {job.url} has failed {failure_count} consecutive health checks.",
            job_id=job.id
        )
        
        db.add(alert)
        db.commit()
        
        # Send email using Resend
        resend_client = ResendClient()
        result = resend_client.send_alert_email(
            recipient_email=user.email,
            recipient_name=user.email,  # Using email as name for now
            job_url=job.url,
            failure_count=failure_count,
            error_message=error_message
        )
        
        # Update alert record with result
        if result['success']:
            alert.is_sent = True
            alert.sent_at = datetime.utcnow()
            logger.info(f"Alert email sent successfully for job {job_id}")
        else:
            error_msg = result.get('error', 'Unknown error')
            logger.error(f"Failed to send alert email for job {job_id}: {error_msg}")
            logger.error(f"Full result: {result}")
            # Retry the task if it failed
            raise self.retry(countdown=60, exc=Exception(f"Email send failed: {error_msg}"))
        
        db.commit()
        
    except Exception as e:
        logger.error(f"Error sending alert email for job {job_id}: {str(e)}")
        db.rollback()
        raise self.retry(countdown=60)
    
    finally:
        db.close()