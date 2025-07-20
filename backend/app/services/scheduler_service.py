from celery import current_app
from typing import Dict, Any, Optional
from uuid import UUID
from datetime import datetime, timedelta

from ..workers.checker import check_single_job


class SchedulerService:
    """Service for managing dynamic job scheduling with Celery"""
    
    @staticmethod
    def schedule_immediate_check(job_id: UUID) -> Dict[str, Any]:
        """
        Schedule an immediate health check for a specific job
        
        Args:
            job_id: UUID of the job to check
            
        Returns:
            Dict containing task information
        """
        try:
            # Schedule the task to run immediately
            task = check_single_job.delay(str(job_id))
            
            return {
                'success': True,
                'task_id': task.id,
                'job_id': str(job_id),
                'scheduled_at': datetime.utcnow().isoformat(),
                'message': 'Health check scheduled successfully'
            }
            
        except Exception as e:
            return {
                'success': False,
                'job_id': str(job_id),
                'error': str(e),
                'message': 'Failed to schedule health check'
            }
    
    @staticmethod
    def schedule_delayed_check(job_id: UUID, delay_seconds: int) -> Dict[str, Any]:
        """
        Schedule a delayed health check for a specific job
        
        Args:
            job_id: UUID of the job to check
            delay_seconds: Number of seconds to delay the check
            
        Returns:
            Dict containing task information
        """
        try:
            # Calculate when the task should run
            eta = datetime.utcnow() + timedelta(seconds=delay_seconds)
            
            # Schedule the task with delay
            task = check_single_job.apply_async(
                args=[str(job_id)],
                eta=eta
            )
            
            return {
                'success': True,
                'task_id': task.id,
                'job_id': str(job_id),
                'scheduled_at': datetime.utcnow().isoformat(),
                'eta': eta.isoformat(),
                'delay_seconds': delay_seconds,
                'message': f'Health check scheduled to run in {delay_seconds} seconds'
            }
            
        except Exception as e:
            return {
                'success': False,
                'job_id': str(job_id),
                'error': str(e),
                'message': 'Failed to schedule delayed health check'
            }
    
    @staticmethod
    def get_task_status(task_id: str) -> Dict[str, Any]:
        """
        Get the status of a scheduled task
        
        Args:
            task_id: Celery task ID
            
        Returns:
            Dict containing task status information
        """
        try:
            # Get task result
            result = current_app.AsyncResult(task_id)
            
            return {
                'task_id': task_id,
                'status': result.status,
                'ready': result.ready(),
                'successful': result.successful() if result.ready() else None,
                'result': result.result if result.ready() else None,
                'info': str(result.info) if result.info else None
            }
            
        except Exception as e:
            return {
                'task_id': task_id,
                'error': str(e),
                'message': 'Failed to get task status'
            }
    
    @staticmethod
    def cancel_task(task_id: str) -> Dict[str, Any]:
        """
        Cancel a scheduled task
        
        Args:
            task_id: Celery task ID to cancel
            
        Returns:
            Dict containing cancellation result
        """
        try:
            # Revoke/cancel the task
            current_app.control.revoke(task_id, terminate=True)
            
            return {
                'success': True,
                'task_id': task_id,
                'message': 'Task cancelled successfully'
            }
            
        except Exception as e:
            return {
                'success': False,
                'task_id': task_id,
                'error': str(e),
                'message': 'Failed to cancel task'
            }
    
    @staticmethod
    def get_worker_stats() -> Dict[str, Any]:
        """
        Get statistics about Celery workers
        
        Returns:
            Dict containing worker statistics
        """
        try:
            # Get worker statistics
            inspect = current_app.control.inspect()
            
            stats = {
                'active_tasks': inspect.active(),
                'scheduled_tasks': inspect.scheduled(),
                'worker_stats': inspect.stats(),
                'registered_tasks': inspect.registered(),
                'timestamp': datetime.utcnow().isoformat()
            }
            
            return {
                'success': True,
                'stats': stats
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'message': 'Failed to get worker statistics'
            }
    
    @staticmethod 
    def validate_job_interval(interval_minutes: int) -> bool:
        """
        Validate if the job interval is supported by the periodic tasks
        
        Args:
            interval_minutes: Interval in minutes
            
        Returns:
            bool: True if interval is supported
        """
        supported_intervals = [5, 10, 15, 30, 60]
        return interval_minutes in supported_intervals
    
    @staticmethod
    def get_next_check_time(interval_minutes: int, last_checked: Optional[datetime] = None) -> datetime:
        """
        Calculate when the next check should occur for a job
        
        Args:
            interval_minutes: Job check interval in minutes
            last_checked: When the job was last checked (None if never)
            
        Returns:
            datetime: When the next check should occur
        """
        if last_checked is None:
            # If never checked, schedule for immediate check
            return datetime.utcnow()
        
        # Calculate next check time based on interval
        next_check = last_checked + timedelta(minutes=interval_minutes)
        
        # If next check time has already passed, schedule immediately
        if next_check <= datetime.utcnow():
            return datetime.utcnow()
        
        return next_check