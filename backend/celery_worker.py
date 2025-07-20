#!/usr/bin/env python3
"""
Celery worker entrypoint
Run with: celery -A celery_worker worker --loglevel=info
"""

import os
import sys
from pathlib import Path

# Add the app directory to Python path
app_dir = Path(__file__).parent / "app"
sys.path.insert(0, str(app_dir))

from app.celery_worker import celery_app

if __name__ == "__main__":
    celery_app.start()