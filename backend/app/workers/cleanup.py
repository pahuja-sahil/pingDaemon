import logging
from datetime import datetime
from sqlalchemy.orm import Session
from typing import Dict, Any

from ..celery_worker import celery_app
from ..database import SessionLocal
from ..services.data_retention_service import DataRetentionService

logger = logging.getLogger(__name__)

@celery_app.task
def cleanup_old_data() -> Dict[str, Any]:
    """
    Periodic task to clean up old data and prevent database bloat
    
    Runs weekly to:
    - Delete health logs older than 30 days
    - Delete processed emails older than 7 days
    - Report cleanup statistics
    
    Returns:
        Dict with cleanup results
    """
    db: Session = SessionLocal()
    
    try:
        logger.info("Starting periodic data cleanup")
        
        # Get stats before cleanup
        stats_before = DataRetentionService.get_database_stats(db)
        
        # Clean up old health logs (keep 30 days)
        health_result = DataRetentionService.cleanup_old_health_logs(db, days_to_keep=30)
        
        # Clean up old email queue (keep 7 days)  
        email_result = DataRetentionService.cleanup_old_email_queue(db, days_to_keep=7)
        
        # Get stats after cleanup
        stats_after = DataRetentionService.get_database_stats(db)
        
        result = {
            'success': True,
            'timestamp': datetime.utcnow().isoformat(),
            'health_logs_cleanup': health_result,
            'email_queue_cleanup': email_result,
            'stats_before': stats_before,
            'stats_after': stats_after,
            'total_deleted': health_result.get('deleted_count', 0) + email_result.get('deleted_count', 0)
        }
        
        logger.info(f"Data cleanup completed. Total records deleted: {result['total_deleted']}")
        
        return result
        
    except Exception as e:
        logger.error(f"Error during data cleanup: {str(e)}")
        return {
            'success': False,
            'error': str(e),
            'timestamp': datetime.utcnow().isoformat(),
            'message': 'Data cleanup failed'
        }
    
    finally:
        db.close()

@celery_app.task
def get_database_stats() -> Dict[str, Any]:
    """
    Get current database statistics (for monitoring)
    
    Returns:
        Dict with database statistics
    """
    db: Session = SessionLocal()
    
    try:
        stats = DataRetentionService.get_database_stats(db)
        logger.info(f"Database stats collected: {stats.get('health_logs', {}).get('total', 0)} health logs, {stats.get('email_queue', {}).get('total', 0)} emails")
        return stats
        
    except Exception as e:
        logger.error(f"Error getting database stats: {str(e)}")
        return {
            'success': False,
            'error': str(e),
            'timestamp': datetime.utcnow().isoformat()
        }
    
    finally:
        db.close()