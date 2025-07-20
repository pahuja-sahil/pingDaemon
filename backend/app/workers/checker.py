from ..celery_worker import celery_app
from sqlalchemy.orm import Session
from sqlalchemy import and_
from datetime import datetime, timedelta
from typing import List, Dict, Any

from ..database import SessionLocal
from ..models.job import Job
from ..services.health_service import HealthService
from ..services.alert_service import AlertService


@celery_app.task(bind=True)
def check_single_job(self, job_id: str) -> Dict[str, Any]:
    """
    Check health of a single job
    
    Args:
        job_id: UUID string of the job to check
    
    Returns:
        Dict containing check results
    """
    db: Session = SessionLocal()
    
    try:
        # Get job by ID
        job = db.query(Job).filter(Job.id == job_id).first()
        
        if not job:
            return {
                'job_id': job_id,
                'error': 'Job not found',
                'success': False
            }
        
        # Perform health check using existing service
        result = HealthService.perform_health_check(db, job)
        
        # Trigger alert if needed
        if result.get('should_alert', False):
            alert_result = AlertService.trigger_alert(
                job_id=job.id,
                failure_count=job.failure_threshold,
                error_message=result.get('check_result', {}).get('error_message')
            )
            result['alert_triggered'] = alert_result
        
        return {
            'success': True,
            'task_id': self.request.id,
            'checked_at': datetime.utcnow().isoformat(),
            **result
        }
        
    except Exception as e:
        return {
            'job_id': job_id,
            'error': str(e),
            'success': False,
            'task_id': self.request.id
        }
    
    finally:
        db.close()


@celery_app.task
def check_all_active_jobs() -> Dict[str, Any]:
    """
    Check health of all active (enabled) jobs
    
    Returns:
        Dict containing summary of all checks
    """
    db: Session = SessionLocal()
    
    try:
        # Get all enabled jobs
        active_jobs = db.query(Job).filter(Job.is_enabled == True).all()
        
        results = []
        for job in active_jobs:
            try:
                # Perform health check
                result = HealthService.perform_health_check(db, job)
                
                # Trigger alert if needed
                if result.get('should_alert', False):
                    alert_result = AlertService.trigger_alert(
                        job_id=job.id,
                        failure_count=job.failure_threshold,
                        error_message=result.get('check_result', {}).get('error_message')
                    )
                    result['alert_triggered'] = alert_result
                
                results.append({
                    'job_id': str(job.id),
                    'job_url': job.url,
                    'success': True,
                    **result
                })
            except Exception as e:
                results.append({
                    'job_id': str(job.id),
                    'job_url': job.url if job else 'unknown',
                    'success': False,
                    'error': str(e)
                })
        
        return {
            'total_jobs': len(active_jobs),
            'checked_at': datetime.utcnow().isoformat(),
            'results': results,
            'success': True
        }
        
    except Exception as e:
        return {
            'error': str(e),
            'success': False,
            'checked_at': datetime.utcnow().isoformat()
        }
    
    finally:
        db.close()


@celery_app.task
def check_jobs_by_interval(interval_minutes: int) -> Dict[str, Any]:
    """
    Check jobs that should be checked based on their interval
    
    Args:
        interval_minutes: Check jobs with this specific interval
    
    Returns:
        Dict containing results of checks
    """
    db: Session = SessionLocal()
    
    try:
        # Get jobs with specific interval that are enabled
        jobs_to_check = db.query(Job).filter(
            and_(
                Job.is_enabled == True,
                Job.interval == interval_minutes
            )
        ).all()
        
        results = []
        for job in jobs_to_check:
            try:
                # Perform health check (removed last_checked logic since field doesn't exist)
                result = HealthService.perform_health_check(db, job)
                
                # Trigger alert if needed
                if result.get('should_alert', False):
                    alert_result = AlertService.trigger_alert(
                        job_id=job.id,
                        failure_count=job.failure_threshold,
                        error_message=result.get('check_result', {}).get('error_message')
                    )
                    result['alert_triggered'] = alert_result
                
                results.append({
                    'job_id': str(job.id),
                    'job_url': job.url,
                    'success': True,
                    **result
                })
                
            except Exception as e:
                results.append({
                    'job_id': str(job.id),
                    'job_url': job.url if job else 'unknown',
                    'success': False,
                    'error': str(e)
                })
        
        return {
            'interval_minutes': interval_minutes,
            'total_jobs_checked': len(results),
            'checked_at': datetime.utcnow().isoformat(),
            'results': results,
            'success': True
        }
        
    except Exception as e:
        return {
            'interval_minutes': interval_minutes,
            'error': str(e),
            'success': False,
            'checked_at': datetime.utcnow().isoformat()
        }
    
    finally:
        db.close()