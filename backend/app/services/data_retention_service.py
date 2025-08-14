import logging
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from typing import Dict, Any

from ..models.log import HealthLog
from ..models.email_queue import EmailQueue

logger = logging.getLogger(__name__)

class DataRetentionService:
    """Service for cleaning up old data to prevent database bloat"""
    
    @staticmethod
    def cleanup_old_health_logs(db: Session, days_to_keep: int = 30) -> Dict[str, Any]:
        """
        Delete health logs older than specified days
        
        Args:
            db: Database session
            days_to_keep: Number of days of logs to retain (default: 30)
            
        Returns:
            Dict with cleanup results
        """
        try:
            cutoff_date = datetime.utcnow() - timedelta(days=days_to_keep)
            
            # Count records before deletion
            old_logs_count = db.query(HealthLog).filter(
                HealthLog.checked_at < cutoff_date
            ).count()
            
            if old_logs_count == 0:
                logger.info("No old health logs to clean up")
                return {
                    'success': True,
                    'deleted_count': 0,
                    'message': 'No old health logs found'
                }
            
            # Delete old logs
            deleted = db.query(HealthLog).filter(
                HealthLog.checked_at < cutoff_date
            ).delete(synchronize_session=False)
            
            db.commit()
            
            logger.info(f"Cleaned up {deleted} health logs older than {days_to_keep} days")
            
            return {
                'success': True,
                'deleted_count': deleted,
                'cutoff_date': cutoff_date.isoformat(),
                'days_kept': days_to_keep,
                'message': f'Successfully deleted {deleted} old health logs'
            }
            
        except Exception as e:
            db.rollback()
            logger.error(f"Error cleaning up health logs: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'message': 'Failed to clean up health logs'
            }
    
    @staticmethod
    def cleanup_old_email_queue(db: Session, days_to_keep: int = 7) -> Dict[str, Any]:
        """
        Delete processed email queue entries older than specified days
        
        Args:
            db: Database session
            days_to_keep: Number of days of email queue to retain (default: 7)
            
        Returns:
            Dict with cleanup results
        """
        try:
            cutoff_date = datetime.utcnow() - timedelta(days=days_to_keep)
            
            # Only delete successfully sent or permanently failed emails
            old_emails_count = db.query(EmailQueue).filter(
                EmailQueue.created_at < cutoff_date,
                EmailQueue.status.in_(["sent", "failed"])
            ).count()
            
            if old_emails_count == 0:
                logger.info("No old email queue entries to clean up")
                return {
                    'success': True,
                    'deleted_count': 0,
                    'message': 'No old email queue entries found'
                }
            
            # Delete old processed emails
            deleted = db.query(EmailQueue).filter(
                EmailQueue.created_at < cutoff_date,
                EmailQueue.status.in_(["sent", "failed"])
            ).delete(synchronize_session=False)
            
            db.commit()
            
            logger.info(f"Cleaned up {deleted} email queue entries older than {days_to_keep} days")
            
            return {
                'success': True,
                'deleted_count': deleted,
                'cutoff_date': cutoff_date.isoformat(),
                'days_kept': days_to_keep,
                'message': f'Successfully deleted {deleted} old email queue entries'
            }
            
        except Exception as e:
            db.rollback()
            logger.error(f"Error cleaning up email queue: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'message': 'Failed to clean up email queue'
            }
    
    @staticmethod
    def get_database_stats(db: Session) -> Dict[str, Any]:
        """
        Get database statistics for monitoring
        
        Returns:
            Dict with database stats
        """
        try:
            # Count health logs
            total_health_logs = db.query(HealthLog).count()
            recent_health_logs = db.query(HealthLog).filter(
                HealthLog.checked_at > datetime.utcnow() - timedelta(days=7)
            ).count()
            
            # Count email queue
            total_emails = db.query(EmailQueue).count()
            pending_emails = db.query(EmailQueue).filter(
                EmailQueue.status == "pending"
            ).count()
            
            # Get oldest records
            oldest_health_log = db.query(HealthLog).order_by(
                HealthLog.checked_at.asc()
            ).first()
            
            oldest_email = db.query(EmailQueue).order_by(
                EmailQueue.created_at.asc()
            ).first()
            
            return {
                'health_logs': {
                    'total': total_health_logs,
                    'last_7_days': recent_health_logs,
                    'oldest_date': oldest_health_log.checked_at.isoformat() if oldest_health_log else None
                },
                'email_queue': {
                    'total': total_emails,
                    'pending': pending_emails,
                    'oldest_date': oldest_email.created_at.isoformat() if oldest_email else None
                },
                'collected_at': datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error getting database stats: {str(e)}")
            return {
                'error': str(e),
                'message': 'Failed to get database statistics'
            }