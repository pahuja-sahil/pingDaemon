import requests
import time
from datetime import datetime
from sqlalchemy.orm import Session
from typing import Dict, Any
from uuid import UUID

from ..models.job import Job
from ..models.log import HealthLog

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
            # Make HTTP request with timeout
            response = requests.get(
                url,
                timeout=timeout,
                allow_redirects=True,
                headers={'User-Agent': 'pingDaemon/1.0 Health Checker'}
            )
            
            # Calculate response time in milliseconds
            response_time = (time.time() - start_time) * 1000
            
            # Consider status codes 200-299 as healthy
            is_healthy = 200 <= response.status_code < 300
            
            return {
                'is_healthy': is_healthy,
                'status_code': response.status_code,
                'response_time': round(response_time, 2),
                'error_message': None if is_healthy else f"HTTP {response.status_code}"
            }
            
        except requests.exceptions.Timeout:
            response_time = (time.time() - start_time) * 1000
            return {
                'is_healthy': False,
                'status_code': None,
                'response_time': round(response_time, 2),
                'error_message': f"Request timeout after {timeout}s"
            }
            
        except requests.exceptions.ConnectionError:
            response_time = (time.time() - start_time) * 1000
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
        if is_healthy:
            job.current_status = "healthy"
        else:
            # Check if we've exceeded failure threshold
            if HealthService.check_failure_threshold(db, job):
                job.current_status = "unhealthy"
            else:
                job.current_status = "degraded"  # Some failures but not threshold
        
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
        
        # Perform health check
        check_result = HealthService.check_url_health(job.url)
        
        # Log the result
        health_log = HealthService.log_health_check(db, job.id, check_result)
        
        # Update job status
        updated_job = HealthService.update_job_status(db, job, check_result['is_healthy'])
        
        # Check if alert should be triggered
        should_alert = (
            not check_result['is_healthy'] and 
            HealthService.check_failure_threshold(db, job)
        )
        
        return {
            'job_id': job.id,
            'job_url': job.url,
            'check_result': check_result,
            'current_status': updated_job.current_status,
            'should_alert': should_alert,
            'health_log_id': health_log.id,
            'skipped': False
        }