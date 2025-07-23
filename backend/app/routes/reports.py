from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from ..models.user import User
from ..schemas.reports import UptimeHistoryItem, ResponseTimeItem, IncidentItem, PerformanceMetrics, ReportsData
from ..services.reports_service import ReportsService
from .auth import get_current_user

router = APIRouter(prefix="/reports", tags=["reports"])

@router.get("/uptime-history", response_model=List[UptimeHistoryItem])
async def get_uptime_history(
    days: int = Query(7, ge=1, le=30, description="Number of days to retrieve (1-30)"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get uptime history for the last N days"""
    return ReportsService.get_uptime_history(db, current_user, days)

@router.get("/response-times", response_model=List[ResponseTimeItem])
async def get_response_time_history(
    hours: int = Query(24, ge=6, le=168, description="Number of hours to retrieve (6-168)"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get response time trends for the last N hours"""
    return ReportsService.get_response_time_history(db, current_user, hours)

@router.get("/incidents", response_model=List[IncidentItem])
async def get_incidents_by_day(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get incidents count for each day of the current week"""
    return ReportsService.get_incidents_by_day(db, current_user)

@router.get("/metrics", response_model=PerformanceMetrics)
async def get_performance_metrics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get overall performance metrics for the last 30 days"""
    return ReportsService.get_performance_metrics(db, current_user)

@router.get("/", response_model=ReportsData)
async def get_all_reports_data(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all reports data in one response"""
    return ReportsService.get_all_reports_data(db, current_user)