# Alert schemas
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class AlertResponse(BaseModel):
    id: int
    alert_type: str
    recipient: str
    subject: str
    message: str
    is_sent: bool
    sent_at: Optional[datetime]
    created_at: datetime
    job_id: int
    
    class Config:
        from_attributes = True