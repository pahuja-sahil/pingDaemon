from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float, ForeignKey, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationship to URL monitors
    url_monitors = relationship("UrlMonitor", back_populates="owner")

class UrlMonitor(Base):
    __tablename__ = "url_monitors"
    
    id = Column(Integer, primary_key=True, index=True)
    url = Column(String, nullable=False)
    interval = Column(Integer, nullable=False)  # in minutes (1, 5, 10)
    is_enabled = Column(Boolean, default=True)
    failure_threshold = Column(Integer, default=3)  # repeated failures before alert
    current_status = Column(String, default="unknown")  # healthy, unhealthy, unknown
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Foreign key to user
    user_id = Column(Integer, ForeignKey("users.id"))
    
    # Relationships
    owner = relationship("User", back_populates="url_monitors")
    health_logs = relationship("HealthLog", back_populates="url_monitor")

class HealthLog(Base):
    __tablename__ = "health_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    status_code = Column(Integer)
    response_time = Column(Float)  # in milliseconds
    is_healthy = Column(Boolean, nullable=False)
    error_message = Column(Text, nullable=True)
    checked_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Foreign key to URL monitor
    url_monitor_id = Column(Integer, ForeignKey("url_monitors.id"))
    
    # Relationship
    url_monitor = relationship("UrlMonitor", back_populates="health_logs")

class Alert(Base):
    __tablename__ = "alerts"
    
    id = Column(Integer, primary_key=True, index=True)
    alert_type = Column(String, nullable=False)  # email, sms
    recipient = Column(String, nullable=False)
    subject = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    is_sent = Column(Boolean, default=False)
    sent_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Foreign key to URL monitor
    url_monitor_id = Column(Integer, ForeignKey("url_monitors.id"))