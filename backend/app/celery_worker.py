# Celery app instance
from celery import Celery
from .config import settings

# Create Celery app instance
celery_app = Celery(
    "pingdaemon",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
    include=[
        "app.workers.checker",
        "app.workers.mailer"
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

# TODO: Configure periodic tasks in Phase 3 Step 7