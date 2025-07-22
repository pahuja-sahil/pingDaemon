import logging
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from uuid import UUID

from ..models.email_queue import EmailQueue
from ..models.job import Job
from ..models.user import User

logger = logging.getLogger(__name__)

class EmailQueueService:
    
    @staticmethod
    def queue_status_change_alert(
        db: Session,
        job: Job,
        user: User,
        previous_status: str,
        current_status: str,
        error_message: str = None
    ) -> EmailQueue:
        """
        Queue an email alert for a status change
        
        Args:
            db: Database session
            job: The job that changed status
            user: The user to notify
            previous_status: Previous status
            current_status: Current status
            error_message: Optional error message
        """
        
        # Determine email content based on status change
        subject, html_content, text_content = EmailQueueService._get_status_change_email_content(
            job, previous_status, current_status, error_message
        )
        
        # Create email queue entry
        email_queue = EmailQueue(
            recipient_email=user.email,
            recipient_name=user.email,  # Using email as name for now
            subject=subject,
            html_content=html_content,
            text_content=text_content,
            job_id=job.id,
            user_id=user.id,
            status="pending"
        )
        
        db.add(email_queue)
        db.commit()
        db.refresh(email_queue)
        
        logger.info(f"Queued status change alert for job {job.id}: {previous_status} → {current_status}")
        return email_queue
    
    @staticmethod
    def _get_status_change_email_content(
        job: Job, 
        previous_status: str, 
        current_status: str, 
        error_message: str = None
    ) -> tuple:
        """Generate email content based on status change"""
        
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S UTC")
        
        # Determine email type and content
        if previous_status in ['healthy', 'unknown'] and current_status == 'unhealthy':
            # Service went down
            subject = f"🚨 Service Down Alert: {job.url}"
            status_text = "DOWN"
            status_emoji = "🔴"
        elif previous_status == 'unhealthy' and current_status == 'healthy':
            # Service recovered  
            subject = f"✅ Service Restored: {job.url}"
            status_text = "RESTORED"
            status_emoji = "🟢"
        elif previous_status == 'unknown' and current_status == 'healthy':
            # Service came online
            subject = f"✅ Service Online: {job.url}"
            status_text = "ONLINE"
            status_emoji = "🟢"
        else:
            # Generic status change
            subject = f"📊 Status Change: {job.url}"
            status_text = f"{previous_status.upper()} → {current_status.upper()}"
            status_emoji = "📊"
        
        # HTML email content
        html_content = f"""
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="margin: 0; font-size: 24px;">{status_emoji} Status Change Alert</h1>
                <p style="margin: 10px 0 0; opacity: 0.9;">pingDaemon Monitoring System</p>
            </div>
            
            <div style="background: white; padding: 40px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h2 style="color: #667eea; margin: 0; font-size: 20px;">{status_text}</h2>
                </div>
                
                <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <p style="margin: 0 0 10px;"><strong>URL:</strong> <a href="{job.url}" style="color: #667eea;">{job.url}</a></p>
                    <p style="margin: 0 0 10px;"><strong>Previous Status:</strong> {previous_status.title()}</p>
                    <p style="margin: 0 0 10px;"><strong>Current Status:</strong> {current_status.title()}</p>
                    <p style="margin: 0 0 10px;"><strong>Check Interval:</strong> Every {job.interval} minutes</p>
                    <p style="margin: 0;"><strong>Failure Threshold:</strong> {job.failure_threshold} consecutive failures</p>
                </div>
                
                {f'<div style="background: #fee; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f56565;"><p style="margin: 0; color: #c53030;"><strong>Error Details:</strong> {error_message}</p></div>' if error_message else ''}
                
                <p style="text-align: center; margin: 30px 0 0; color: #6c757d; font-size: 14px;">
                    Alert generated at {timestamp}<br>
                    <a href="http://localhost:3000/monitors" style="color: #667eea;">View Dashboard</a>
                </p>
            </div>
        </div>
        """
        
        # Plain text email content
        text_content = f"""
        Status Change Alert - pingDaemon
        
        {status_text}
        
        URL: {job.url}
        Previous Status: {previous_status.title()}
        Current Status: {current_status.title()}
        Check Interval: Every {job.interval} minutes
        Failure Threshold: {job.failure_threshold} consecutive failures
        
        {f'Error Details: {error_message}' if error_message else ''}
        
        Alert generated at {timestamp}
        View Dashboard: http://localhost:3000/monitors
        """
        
        return subject, html_content, text_content
    
    @staticmethod
    def get_pending_emails(db: Session, limit: int = 2) -> List[EmailQueue]:
        """Get pending emails for batch processing"""
        return db.query(EmailQueue).filter(
            EmailQueue.status == "pending",
            EmailQueue.attempts < EmailQueue.max_attempts,
            EmailQueue.scheduled_at <= datetime.utcnow()
        ).order_by(EmailQueue.scheduled_at).limit(limit).all()
    
    @staticmethod
    def mark_email_processing(db: Session, email_id: UUID) -> EmailQueue:
        """Mark an email as currently being processed"""
        email = db.query(EmailQueue).filter(EmailQueue.id == email_id).first()
        if email:
            email.status = "processing"
            email.attempts += 1
            db.commit()
            db.refresh(email)
        return email
    
    @staticmethod
    def mark_email_sent(db: Session, email_id: UUID) -> EmailQueue:
        """Mark an email as successfully sent"""
        email = db.query(EmailQueue).filter(EmailQueue.id == email_id).first()
        if email:
            email.status = "sent"
            email.processed_at = datetime.utcnow()
            email.error_message = None
            db.commit()
            db.refresh(email)
        return email
    
    @staticmethod
    def mark_email_failed(db: Session, email_id: UUID, error_message: str) -> EmailQueue:
        """Mark an email as failed and schedule retry if attempts remain"""
        email = db.query(EmailQueue).filter(EmailQueue.id == email_id).first()
        if email:
            email.error_message = error_message
            
            if email.attempts >= email.max_attempts:
                email.status = "failed"
                email.processed_at = datetime.utcnow()
            else:
                # Schedule retry with exponential backoff
                email.status = "pending"
                retry_delay = min(60 * (2 ** email.attempts), 3600)  # Max 1 hour delay
                email.scheduled_at = datetime.utcnow() + timedelta(seconds=retry_delay)
            
            db.commit()
            db.refresh(email)
        return email
    
    @staticmethod
    def cleanup_old_emails(db: Session, days: int = 7) -> int:
        """Clean up old email queue entries"""
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        
        deleted = db.query(EmailQueue).filter(
            EmailQueue.created_at < cutoff_date,
            EmailQueue.status.in_(["sent", "failed"])
        ).delete()
        
        db.commit()
        logger.info(f"Cleaned up {deleted} old email queue entries")
        return deleted