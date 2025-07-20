import logging
from datetime import datetime
from celery import Celery
from sqlalchemy.orm import Session
from uuid import UUID

from ..database import get_db
from ..email.mailjet_client import MailjetClient
from ..models.job import Job
from ..models.user import User
from ..models.alert import Alert
from ..config import settings

logger = logging.getLogger(__name__)

# Create Celery instance
celery_app = Celery(
    "mailer",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL
)

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
        
        # Send email using Mailjet
        mailjet_client = MailjetClient()
        result = mailjet_client.send_alert_email(
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
            logger.error(f"Failed to send alert email for job {job_id}: {result['error']}")
            # Retry the task if it failed
            raise self.retry(countdown=60)
        
        db.commit()
        
    except Exception as e:
        logger.error(f"Error sending alert email for job {job_id}: {str(e)}")
        db.rollback()
        raise self.retry(countdown=60)
    
    finally:
        db.close()