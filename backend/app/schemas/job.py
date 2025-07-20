# Job CRUD schemas
from pydantic import BaseModel, HttpUrl
from typing import Optional
from datetime import datetime

class JobBase(BaseModel):
    url: HttpUrl
    interval: int  # in minutes
    is_enabled: bool = True
    failure_threshold: int = 3

class JobCreate(JobBase):
    pass

class JobUpdate(BaseModel):
    url: Optional[HttpUrl] = None
    interval: Optional[int] = None
    is_enabled: Optional[bool] = None
    failure_threshold: Optional[int] = None

class JobResponse(JobBase):
    id: int
    current_status: str
    user_id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True