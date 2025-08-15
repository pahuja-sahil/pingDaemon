import logging
from datetime import datetime
from sqlalchemy.orm import Session
from ..database import get_db
from ..email.resend_client import ResendClient
from ..services.email_queue_service import EmailQueueService
from ..celery_worker import celery_app


logger = logging.getLogger(__name__)

# Import the main Celery app instance

@celery_app.task(bind=True, retry_backoff=True, max_retries=3)
def process_email_batch(self, batch_size: int = 2):
    """
    Process a batch of queued emails with rate limiting
    
    Args:
        batch_size: Number of emails to process in this batch (default: 2 for Resend rate limit)
    """
    db = next(get_db())
    
    try:
        # Get pending emails for batch processing
        pending_emails = EmailQueueService.get_pending_emails(db, limit=batch_size)
        
        if not pending_emails:
            logger.debug("No pending emails to process")
            return {"processed": 0, "success": True}
        
        successful_sends = 0
        failed_sends = 0
        resend_client = ResendClient()
        
        for email in pending_emails:
            try:
                # Mark email as processing
                EmailQueueService.mark_email_processing(db, email.id)
                
                # Prepare email parameters for Resend with CLEAN SENDER ADDRESS
                params = {
                    "from": "PingDaemon <noreply@ping-daemon.me>",  # UPDATED: Clean, professional sender
                    "to": [email.recipient_email],
                    "subject": email.subject,
                    "html": email.html_content,
                    "text": email.text_content,
                }
                
                # Send email using Resend client
                result = resend_client._send_email_direct(params)
                
                if result['success']:
                    EmailQueueService.mark_email_sent(db, email.id)
                    successful_sends += 1
                    logger.info(f"✅ Successfully sent email {email.id} to {email.recipient_email} from PingDaemon")
                else:
                    EmailQueueService.mark_email_failed(db, email.id, result['error'])
                    failed_sends += 1
                    logger.error(f"❌ Failed to send email {email.id}: {result['error']}")
                
            except Exception as e:
                EmailQueueService.mark_email_failed(db, email.id, str(e))
                failed_sends += 1
                logger.error(f"💥 Exception processing email {email.id}: {str(e)}")
        
        result = {
            "processed": len(pending_emails),
            "successful": successful_sends,
            "failed": failed_sends,
            "success": True,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        logger.info(f"📊 Batch processing complete: {successful_sends} sent, {failed_sends} failed")
        return result
        
    except Exception as e:
        logger.error(f"🚨 Error in batch email processing: {str(e)}")
        db.rollback()
        raise self.retry(countdown=60, exc=Exception(f"Batch processing failed: {str(e)}"))
    
    finally:
        db.close()

# Helper method to add to ResendClient for direct email sending
def _add_direct_send_method_to_resend_client():
    """Add a direct send method to ResendClient for batch processing"""
    import resend
    
    def _send_email_direct(self, params):
        """Send email directly without additional formatting"""
        try:
            email = resend.Emails.send(params)
            logger.info(f"📧 Email sent successfully via Resend from {params.get('from', 'PingDaemon')}")
            return {
                'success': True,
                'message_id': email.get('id'),
                'status': 'sent'
            }
        except Exception as e:
            error_msg = str(e) if str(e) else f"{type(e).__name__}: Unknown error"
            logger.error(f"💥 Exception sending email via Resend: {error_msg}")
            logger.error(f"Exception type: {type(e).__name__}")
            logger.error(f"Email params: {params}")
            if hasattr(e, 'response'):
                logger.error(f"Response status: {getattr(e.response, 'status_code', 'N/A')}")
                logger.error(f"Response text: {getattr(e.response, 'text', 'N/A')}")
            return {
                'success': False,
                'error': error_msg,
                'error_type': type(e).__name__,
                'status': 'failed'
            }
    
    # Add method to ResendClient class
    ResendClient._send_email_direct = _send_email_direct

# Add the method when module is imported
_add_direct_send_method_to_resend_client()