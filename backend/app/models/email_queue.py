from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from uuid import uuid4
from . import Base

class EmailQueue(Base):
    __tablename__ = "email_queue"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4, index=True)
    recipient_email = Column(String, nullable=False)
    recipient_name = Column(String, nullable=False)
    subject = Column(String, nullable=False)
    html_content = Column(Text, nullable=False)
    text_content = Column(Text, nullable=False)
    
    # Status tracking
    status = Column(String, default="pending")  # pending, processing, sent, failed
    attempts = Column(Integer, default=0)
    max_attempts = Column(Integer, default=3)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    scheduled_at = Column(DateTime(timezone=True), server_default=func.now())
    processed_at = Column(DateTime(timezone=True), nullable=True)
    
    # Error tracking
    error_message = Column(Text, nullable=True)
    
    # Foreign keys
    job_id = Column(UUID(as_uuid=True), ForeignKey("jobs.id"), nullable=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    
    # Relationships
    job = relationship("Job")
    user = relationship("User")