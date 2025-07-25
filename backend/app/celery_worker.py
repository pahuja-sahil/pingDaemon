# Celery app instance
from celery import Celery
from .config import settings

# Handle Upstash Redis URL format for Celery
if hasattr(settings, 'UPSTASH_REDIS_REST_URL') and settings.UPSTASH_REDIS_REST_URL:
    # Convert Upstash HTTP URL to Redis protocol
    redis_host = settings.UPSTASH_REDIS_REST_URL.replace('https://', '').replace('/', '')
    broker_url = f"redis://default:{settings.UPSTASH_REDIS_REST_TOKEN}@{redis_host}:6379"
else:
    # Fallback to regular Redis URL
    broker_url = settings.REDIS_URL

# Create Celery app instance
celery_app = Celery(
    "pingdaemon",
    broker=broker_url,
    backend=broker_url,
    include=[
        "app.workers.checker",
        "app.workers.mailer",
        "app.workers.email_batch"
    ]
)

# Celery configuration
celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
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
    # Process email queue every 45 seconds (respects rate limit)
    'process-email-batch': {
        'task': 'app.workers.email_batch.process_email_batch',
        'schedule': 30.0,  # Every 45 seconds for production efficiency
        'args': (2,)  # Batch size of 2 emails
    },
}