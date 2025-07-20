# Health log schemas
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from uuid import UUID

class HealthLogResponse(BaseModel):
    id: UUID
    status_code: Optional[int]
    response_time: Optional[float]
    is_healthy: bool
    error_message: Optional[str]
    checked_at: datetime
    job_id: UUID
    
    class Config:
        from_attributes = True