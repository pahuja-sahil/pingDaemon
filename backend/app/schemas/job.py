# Job CRUD schemas
from pydantic import BaseModel, HttpUrl, Field, validator
from typing import Optional
from datetime import datetime
from uuid import UUID

class JobBase(BaseModel):
    url: HttpUrl
    interval: int = Field(..., description="Monitoring interval in minutes (5, 10, 15, 30, 60)")
    is_enabled: bool = True
    failure_threshold: int = Field(3, ge=1, le=10, description="Number of failures before alert (1-10)")
    
    @validator('interval')
    def validate_interval(cls, v):
        allowed_intervals = [5, 10, 15, 30, 60]
        if v not in allowed_intervals:
            raise ValueError(f'Interval must be one of {allowed_intervals} minutes')
        return v

class JobCreate(JobBase):
    pass

class JobUpdate(BaseModel):
    url: Optional[HttpUrl] = None
    interval: Optional[int] = Field(None, description="Monitoring interval in minutes (5, 10, 15, 30, 60)")
    is_enabled: Optional[bool] = None
    failure_threshold: Optional[int] = Field(None, ge=1, le=10, description="Number of failures before alert (1-10)")
    
    @validator('interval')
    def validate_interval(cls, v):
        if v is not None:
            allowed_intervals = [5, 10, 15, 30, 60]
            if v not in allowed_intervals:
                raise ValueError(f'Interval must be one of {allowed_intervals} minutes')
        return v

class JobResponse(JobBase):
    id: UUID
    current_status: str
    user_id: UUID
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True