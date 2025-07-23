from pydantic import BaseModel
from typing import List
from datetime import datetime

class UptimeHistoryItem(BaseModel):
    date: str
    uptime: float

class ResponseTimeItem(BaseModel):
    time: str
    responseTime: float

class IncidentItem(BaseModel):
    day: str
    incidents: int

class PerformanceMetrics(BaseModel):
    avgUptime: str
    avgResponseTime: str
    totalIncidents: int
    checksPerformed: int

class ReportsData(BaseModel):
    uptimeHistory: List[UptimeHistoryItem]
    responseTimeHistory: List[ResponseTimeItem]
    incidentsByDay: List[IncidentItem]
    metrics: PerformanceMetrics