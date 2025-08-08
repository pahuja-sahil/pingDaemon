from celery import Celery
from .config import settings
celery_app = Celery(
    "pingdaemon",
    broker=settings.REDIS_URL_FIXED,
    backend=settings.REDIS_URL_FIXED,
    include=[
        "app.workers.checker",
        "app.workers.mailer",
        "app.workers.email_batch"
    ]
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    broker_connection_retry_on_startup=True,
    result_expires=600,  # Reduced from 2 hours to 10 minutes - saves ~80% Redis storage
    # Disable result backend for periodic tasks that don't need results
    task_ignore_result=True,  # Default to ignore results
    # Connection pooling and optimization - increased pool to reduce connections
    broker_pool_limit=20,  # Increased from 10
    broker_connection_max_retries=5,
    broker_connection_retry_delay=2,
    result_backend_max_retries=5,
    result_backend_retry_delay=2,
    # Batch message acknowledgment to reduce Redis calls
    worker_prefetch_multiplier=4,  # Fetch 4 tasks at once
    task_acks_late=True,  # Acknowledge after task completion
    # Reduce connection overhead
    task_always_eager=False,
    task_eager_propagates=False,
    # Connection persistence - increased to reduce reconnections
    broker_heartbeat=60,  # Increased from 30 to 60
    result_backend_heartbeat=60,
    # Additional optimizations
    task_compression='gzip',  # Compress task messages
    result_compression='gzip',  # Compress results
    task_track_started=False,  # Don't track task start events
)

# Periodic task configuration
celery_app.conf.beat_schedule = {
    # Check jobs every 5 minutes
    'check-5-minute-jobs': {
        'task': 'app.workers.checker.check_jobs_by_interval',
        'schedule': 300.0,  # 5 minutes in seconds
        'args': (5,)
    },
    # Check jobs every 10 minutes
    'check-10-minute-jobs': {
        'task': 'app.workers.checker.check_jobs_by_interval',
        'schedule': 600.0,  # 10 minutes in seconds
        'args': (10,)
    },
    # Check jobs every 15 minutes
    'check-15-minute-jobs': {
        'task': 'app.workers.checker.check_jobs_by_interval',
        'schedule': 900.0,  # 15 minutes in seconds
        'args': (15,)
    },
    # Check jobs every 30 minutes
    'check-30-minute-jobs': {
        'task': 'app.workers.checker.check_jobs_by_interval',
        'schedule': 1800.0,  # 30 minutes in seconds
        'args': (30,)
    },
    # Check jobs every 60 minutes
    'check-60-minute-jobs': {
        'task': 'app.workers.checker.check_jobs_by_interval',
        'schedule': 3600.0,  # 60 minutes in seconds
        'args': (60,)
    },
    # Process email queue every 15 minutes (further reduce Redis load)
    'process-email-batch': {
        'task': 'app.workers.email_batch.process_email_batch',
        'schedule': 900.0,  # Every 15 minutes to reduce Redis requests
        'args': (12,)  # Increase batch size to maintain throughput
    },
}