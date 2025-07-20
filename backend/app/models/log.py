from sqlalchemy import Column, Integer, Boolean, DateTime, Float, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from uuid import uuid4
from . import Base

class HealthLog(Base):
    __tablename__ = "health_logs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4, index=True)
    status_code = Column(Integer)
    response_time = Column(Float)  # in milliseconds
    is_healthy = Column(Boolean, nullable=False)
    error_message = Column(Text, nullable=True)
    checked_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Foreign key to monitoring job
    job_id = Column(UUID(as_uuid=True), ForeignKey("jobs.id"))
    
    # Relationship
    job = relationship("Job", back_populates="health_logs")