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
                # Simplified: no degraded status, go straight to unhealthy on first failure
                job.current_status = "unhealthy"
        
        db.commit()
        db.refresh(job)
        return job
    
    @staticmethod
    def perform_health_check(db: Session, job: Job) -> Dict[str, Any]:
        """
        Perform complete health check workflow for a job
        
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
        
        # Debug logging for status change detection
        logger.info(f"🔍 DEBUG: Job {job.id} - Previous: '{previous_status}' → Current: '{updated_job.current_status}' | Health: {check_result['is_healthy']} | Status Change: {previous_status != updated_job.current_status}")
        
        # Check for status change and send email if needed
        alert_triggered = None
        if previous_status != updated_job.current_status:
            try:
                # Get job owner
                user = db.query(User).filter(User.id == job.user_id).first()
                if user:
                    try:
                        email_queue = EmailQueueService.queue_status_change_alert(
                            db=db,
                            job=updated_job,
                            user=user,
                            previous_status=previous_status,
                            current_status=updated_job.current_status,
                            error_message=check_result.get('error_message')
                        )
                        alert_triggered = {
                            'method': 'queued',
                            'email_queue_id': email_queue.id,
                            'status_change': f"{previous_status} → {updated_job.current_status}"
                        }
                        logger.info(f"✅ CELERY WORKING: Status change email queued for job {job.id} ({previous_status} → {updated_job.current_status})")
                    except Exception as queue_error:
                        logger.warning(f"❌ CELERY FAILED: Using direct send fallback for job {job.id}. Error: {str(queue_error)}")
                        from ..email.resend_client import ResendClient
                        
                        resend_client = ResendClient()
                        email_result = resend_client.send_status_change_email(
                            recipient_email=user.email,
                            recipient_name=user.email,
                            job_url=updated_job.url,
                            previous_status=previous_status,
                            current_status=updated_job.current_status,
                            error_message=check_result.get('error_message'),
                            job_interval=updated_job.interval,
                            failure_threshold=updated_job.failure_threshold
                        )
                        
                        alert_triggered = {
                            'method': 'direct',
                            'email_success': email_result['success'],
                            'status_change': f"{previous_status} → {updated_job.current_status}",
                            'fallback_reason': str(queue_error)
                        }
                        
                        if email_result['success']:
                            logger.info(f"📧 DIRECT EMAIL SUCCESS: Status change email sent directly for job {job.id} ({previous_status} → {updated_job.current_status})")
                        else:
                            logger.error(f"💥 TOTAL FAILURE: Both queue and direct email failed for job {job.id}: {email_result.get('error')}")
                            
            except Exception as e:
                logger.error(f"Failed to send status change alert: {str(e)}")
                alert_triggered = {'error': str(e)}

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
            'alert_triggered': alert_triggered
        }