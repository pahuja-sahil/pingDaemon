from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

from .user import User
from .job import Job
from .log import HealthLog
from .alert import Alert

__all__ = ["Base", "User", "Job", "HealthLog", "Alert"]