from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from uuid import uuid4
from . import Base

class Job(Base):
    __tablename__ = "jobs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4, index=True)
    url = Column(String, nullable=False)
    interval = Column(Integer, nullable=False)  # in minutes (1, 5, 10)
    is_enabled = Column(Boolean, default=True)
    failure_threshold = Column(Integer, default=3)  # repeated failures before alert
    current_status = Column(String, default="unknown")  # healthy, unhealthy, unknown
    previous_status = Column(String, default="unknown")  # for status change tracking
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Foreign key to user
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    
    # Relationships
    owner = relationship("User", back_populates="jobs")
    health_logs = relationship("HealthLog", back_populates="job")
    alerts = relationship("Alert")
    email_queue = relationship("EmailQueue")