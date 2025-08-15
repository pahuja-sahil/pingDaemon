import logging
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from uuid import UUID
import html

from ..models.email_queue import EmailQueue
from ..models.job import Job
from ..models.user import User
from ..config import settings

logger = logging.getLogger(__name__)

# UPDATED HEALTH SERVICE - SIMPLIFIED STATUS CHANGE DETECTION

class HealthService:
    
    @staticmethod
    def perform_health_check(db: Session, job: Job) -> Dict[str, Any]:
        """
        Perform complete health check workflow for a job with simplified email logic
        
        Returns:
            Dict containing check results and status updates
        """
        from ..services.health_service import HealthService as OriginalHealthService
        from ..models.user import User
        
        # Skip if job is disabled
        if not job.is_enabled:
            return {
                'job_id': job.id,
                'skipped': True,
                'reason': 'Job is disabled'
            }
        
        # Store current status before update
        previous_status = job.current_status
        
        # Perform health check using original logic
        check_result = OriginalHealthService.check_url_health(job.url)
        health_log = OriginalHealthService.log_health_check(db, job.id, check_result)
        updated_job = OriginalHealthService.update_job_status(db, job, check_result['is_healthy'])
        
        # SIMPLIFIED: Check for ANY status change and queue email
        email_queued = None
        status_changed = previous_status != updated_job.current_status
        
        if status_changed:
            logger.info(f"🔄 STATUS CHANGE: {previous_status} → {updated_job.current_status} for job {job.id}")
            try:
                # Get job owner
                user = db.query(User).filter(User.id == job.user_id).first()
                if user:
                    # Queue email for ANY status change (no special first-time logic)
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
                    
                    logger.info(f"📧 EMAIL QUEUED: {previous_status} → {updated_job.current_status} for {user.email}")
                else:
                    logger.error(f"❌ USER NOT FOUND: No user found for job {job.id}")
                    email_queued = {'error': f'User not found: {job.user_id}'}
            except Exception as e:
                logger.error(f"💥 EXCEPTION queuing email for job {job.id}: {str(e)}")
                email_queued = {'error': str(e)}

        should_alert = (
            not check_result['is_healthy'] and 
            OriginalHealthService.check_failure_threshold(db, job)
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
        Queue an email alert for any status change using unified format
        
        Args:
            db: Database session
            job: The job that changed status
            user: The user to notify
            previous_status: Previous status
            current_status: Current status
            error_message: Optional error message
        """
        
        # Generate unified email content
        subject, html_content, text_content = EmailQueueService._get_unified_email_content(
            job, previous_status, current_status, error_message
        )
        
        # Create email queue entry
        email_queue = EmailQueue(
            recipient_email=user.email,
            recipient_name=user.email,
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
        
        # Simplified logging
        logger.info(f"📧 Queued status change email: {previous_status} → {current_status} for job {job.id}")
        
        return email_queue
    
    @staticmethod
    def _get_unified_email_content(
        job: Job, 
        previous_status: str, 
        current_status: str, 
        error_message: str = None
    ) -> tuple:
        """
        Generate unified email content for any status change
        
        Uses the same format regardless of whether it's first-time or regular status change
        """
        
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S UTC")
        
        # Determine email type based on current status (simplified logic)
        if current_status == 'unhealthy':
            subject = f"🚨 Service Down: {job.url}"
            status_text = "SERVICE DOWN"
            status_emoji = "🔴"
            intro_text = "Your monitored service is currently down."
            
        elif current_status == 'healthy':
            if previous_status == 'unhealthy':
                subject = f"✅ Service Restored: {job.url}"
                status_text = "SERVICE RESTORED"
                status_emoji = "🟢"
                intro_text = "Your monitored service has been restored."
            else:
                # Covers both first-time checks and other transitions to healthy
                subject = f"✅ Service Online: {job.url}"
                status_text = "SERVICE ONLINE" 
                status_emoji = "🟢"
                intro_text = "Your monitored service is online and healthy."
                
        else:
            # Generic status change
            subject = f"📊 Status Update: {job.url}"
            status_text = f"{previous_status.upper()} → {current_status.upper()}"
            status_emoji = "📊"
            intro_text = "Your monitored service has changed status."
        
        # Unified HTML email content (same template for all cases)
        html_content = f"""
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="margin: 0; font-size: 24px;">{status_emoji} Status Update</h1>
                <p style="margin: 10px 0 0; opacity: 0.9;">pingDaemon Monitoring System</p>
            </div>
            
            <div style="background: white; padding: 40px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h2 style="color: #667eea; margin: 0; font-size: 20px;">{status_text}</h2>
                    <p style="margin: 10px 0 0; color: #6c757d;">{intro_text}</p>
                </div>
                
                <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <p style="margin: 0 0 10px;"><strong>URL:</strong> <a href="{html.escape(job.url)}" style="color: #667eea;">{html.escape(job.url)}</a></p>
                    <p style="margin: 0 0 10px;"><strong>Previous Status:</strong> {previous_status.title()}</p>
                    <p style="margin: 0 0 10px;"><strong>Current Status:</strong> {current_status.title()}</p>
                    <p style="margin: 0 0 10px;"><strong>Check Interval:</strong> Every {job.interval} minutes</p>
                    <p style="margin: 0;"><strong>Failure Threshold:</strong> {job.failure_threshold} consecutive failures</p>
                </div>
                
                {f'<div style="background: #fee; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f56565;"><p style="margin: 0; color: #c53030;"><strong>Error Details:</strong> {html.escape(error_message)}</p></div>' if error_message else ''}
                
                <p style="text-align: center; margin: 30px 0 0; color: #6c757d; font-size: 14px;">
                    Status change detected at {timestamp}<br>
                    <a href="{settings.FRONTEND_URL}/monitors" style="color: #667eea;">View Dashboard</a>
                </p>
            </div>
        </div>
        """
        
        # Unified plain text email content
        text_content = f"""
        Status Update - pingDaemon
        
        {status_text}
        
        {intro_text}
        
        URL: {job.url}
        Previous Status: {previous_status.title()}
        Current Status: {current_status.title()}
        Check Interval: Every {job.interval} minutes
        Failure Threshold: {job.failure_threshold} consecutive failures
        
        {f'Error Details: {error_message}' if error_message else ''}
        
        Status change detected at {timestamp}
        View Dashboard: {settings.FRONTEND_URL}/monitors
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