from sqlalchemy.orm import Session
from sqlalchemy import func, and_, desc
from datetime import datetime, timedelta
from typing import List, Dict
from collections import defaultdict

from ..models.job import Job
from ..models.log import HealthLog
from ..models.user import User
from ..schemas.reports import UptimeHistoryItem, ResponseTimeItem, IncidentItem, PerformanceMetrics, ReportsData

class ReportsService:
    
    @staticmethod
    def get_uptime_history(db: Session, user: User, days: int = 7) -> List[UptimeHistoryItem]:
        """Get uptime history for the last N days"""
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=days)
        
        # Get user's jobs
        user_jobs = db.query(Job).filter(Job.user_id == user.id).all()
        if not user_jobs:
            return []
        
        job_ids = [job.id for job in user_jobs]
        
        # Group logs by date and calculate uptime percentage
        results = []
        for i in range(days):
            current_date = start_date + timedelta(days=i)
            date_start = current_date.replace(hour=0, minute=0, second=0, microsecond=0)
            date_end = date_start + timedelta(days=1)
            
            # Get all health checks for this date
            health_checks = db.query(HealthLog).filter(
                and_(
                    HealthLog.job_id.in_(job_ids),
                    HealthLog.checked_at >= date_start,
                    HealthLog.checked_at < date_end
                )
            ).all()
            
            if health_checks:
                healthy_count = sum(1 for check in health_checks if check.is_healthy)
                total_count = len(health_checks)
                uptime_percentage = round((healthy_count / total_count) * 100, 1)
            else:
                uptime_percentage = 100.0  # No data means no issues
            
            results.append(UptimeHistoryItem(
                date=current_date.strftime("%Y-%m-%d"),
                uptime=uptime_percentage
            ))
        
        return results
    
    @staticmethod
    def get_response_time_history(db: Session, user: User, hours: int = 24) -> List[ResponseTimeItem]:
        """Get response time trends for the last N hours"""
        end_time = datetime.utcnow()
        start_time = end_time - timedelta(hours=hours)
        
        # Get user's jobs
        user_jobs = db.query(Job).filter(Job.user_id == user.id).all()
        if not user_jobs:
            return []
        
        job_ids = [job.id for job in user_jobs]
        
        # Group by 4-hour intervals
        interval_count = 6  # 24 hours / 4 = 6 intervals
        results = []
        
        for i in range(interval_count):
            interval_start = start_time + timedelta(hours=i * 4)
            interval_end = interval_start + timedelta(hours=4)
            
            # Get average response time for this interval
            avg_response = db.query(func.avg(HealthLog.response_time)).filter(
                and_(
                    HealthLog.job_id.in_(job_ids),
                    HealthLog.checked_at >= interval_start,
                    HealthLog.checked_at < interval_end,
                    HealthLog.response_time.isnot(None)
                )
            ).scalar()
            
            response_time = round(avg_response, 0) if avg_response else 0.0
            
            results.append(ResponseTimeItem(
                time=interval_start.strftime("%H:%M"),
                responseTime=response_time
            ))
        
        return results
    
    @staticmethod
    def get_incidents_by_day(db: Session, user: User) -> List[IncidentItem]:
        """Get incidents count for each day of the current week"""
        # Get start of current week (Monday)
        today = datetime.utcnow()
        days_since_monday = today.weekday()
        week_start = today - timedelta(days=days_since_monday)
        week_start = week_start.replace(hour=0, minute=0, second=0, microsecond=0)
        
        # Get user's jobs
        user_jobs = db.query(Job).filter(Job.user_id == user.id).all()
        if not user_jobs:
            return [IncidentItem(day=day, incidents=0) for day in ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']]
        
        job_ids = [job.id for job in user_jobs]
        
        # Count incidents (failed health checks) for each day
        days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        results = []
        
        for i, day_name in enumerate(days):
            day_start = week_start + timedelta(days=i)
            day_end = day_start + timedelta(days=1)
            
            incident_count = db.query(HealthLog).filter(
                and_(
                    HealthLog.job_id.in_(job_ids),
                    HealthLog.checked_at >= day_start,
                    HealthLog.checked_at < day_end,
                    HealthLog.is_healthy == False
                )
            ).count()
            
            results.append(IncidentItem(day=day_name, incidents=incident_count))
        
        return results
    
    @staticmethod
    def get_performance_metrics(db: Session, user: User) -> PerformanceMetrics:
        """Get overall performance metrics"""
        # Get user's jobs
        user_jobs = db.query(Job).filter(Job.user_id == user.id).all()
        if not user_jobs:
            return PerformanceMetrics(
                avgUptime="100.0%",
                avgResponseTime="0ms",
                totalIncidents=0,
                checksPerformed=0
            )
        
        job_ids = [job.id for job in user_jobs]
        
        # Calculate metrics for the last 30 days
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=30)
        
        # Get all health checks in the period
        health_checks = db.query(HealthLog).filter(
            and_(
                HealthLog.job_id.in_(job_ids),
                HealthLog.checked_at >= start_date
            )
        ).all()
        
        if not health_checks:
            return PerformanceMetrics(
                avgUptime="100.0%",
                avgResponseTime="0ms",
                totalIncidents=0,
                checksPerformed=0
            )
        
        # Calculate uptime percentage
        healthy_count = sum(1 for check in health_checks if check.is_healthy)
        total_checks = len(health_checks)
        avg_uptime = round((healthy_count / total_checks) * 100, 1)
        
        # Calculate average response time
        response_times = [check.response_time for check in health_checks if check.response_time is not None]
        avg_response_time = round(sum(response_times) / len(response_times), 0) if response_times else 0
        
        # Count incidents (failures)
        incident_count = sum(1 for check in health_checks if not check.is_healthy)
        
        return PerformanceMetrics(
            avgUptime=f"{avg_uptime}%",
            avgResponseTime=f"{avg_response_time:.0f}ms",
            totalIncidents=incident_count,
            checksPerformed=total_checks
        )
    
    @staticmethod
    def get_all_reports_data(db: Session, user: User) -> ReportsData:
        """Get all reports data in one response"""
        return ReportsData(
            uptimeHistory=ReportsService.get_uptime_history(db, user),
            responseTimeHistory=ReportsService.get_response_time_history(db, user),
            incidentsByDay=ReportsService.get_incidents_by_day(db, user),
            metrics=ReportsService.get_performance_metrics(db, user)
        )