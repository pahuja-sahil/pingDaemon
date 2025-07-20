# Health log schemas
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class HealthLogResponse(BaseModel):
    id: int
    status_code: Optional[int]
    response_time: Optional[float]
    is_healthy: bool
    error_message: Optional[str]
    checked_at: datetime
    job_id: int
    
    class Config:
        from_attributes = True