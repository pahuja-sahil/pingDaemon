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
    result_expires=7200,  # Task results expire after 2 hours
    # Connection pooling and optimization
    broker_pool_limit=10,
    broker_connection_max_retries=5,
    broker_connection_retry_delay=2,
    result_backend_max_retries=5,
    result_backend_retry_delay=2,
    # Reduce connection overhead
    task_always_eager=False,
    task_eager_propagates=False,
    # Connection persistence
    broker_heartbeat=30,
    result_backend_heartbeat=30,
    
    broker_use_ssl={
        'ssl_cert_reqs': 'CERT_NONE'
    }
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
    # Process email queue every 10 minutes (reduce Redis load)
    'process-email-batch': {
        'task': 'app.workers.email_batch.process_email_batch',
        'schedule': 600.0,  # Every 10 minutes to reduce Redis requests
        'args': (8,)  # Increase batch size to maintain throughput
    },
}