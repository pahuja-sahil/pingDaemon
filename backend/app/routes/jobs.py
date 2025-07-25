from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from ..database import get_db
from ..models.user import User
from ..schemas.job import JobCreate, JobUpdate, JobResponse
from ..services.job_service import JobService
from ..services.scheduler_service import SchedulerService
from ..services.health_service import HealthService
from .auth import get_current_user

router = APIRouter(prefix="/jobs", tags=["jobs"])

@router.post("", response_model=JobResponse)
@router.post("/", response_model=JobResponse)
async def create_job(
    job_data: JobCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new monitoring job"""
    return JobService.create_job(db, job_data, current_user)

@router.get("", response_model=List[JobResponse])
@router.get("/", response_model=List[JobResponse])
async def get_user_jobs(
    page: int = Query(1, ge=1, description="Page number (starts from 1)"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get monitoring jobs for the current user with pagination (10 jobs per page)"""
    skip = (page - 1) * 10
    limit = 10
    return JobService.get_user_jobs(db, current_user, skip, limit)

@router.get("/{job_id}", response_model=JobResponse)
async def get_job(
    job_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific monitoring job by ID"""
    return JobService.get_job_by_id(db, job_id, current_user)

@router.put("/{job_id}", response_model=JobResponse)
async def update_job(
    job_id: UUID,
    job_data: JobUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update an existing monitoring job"""
    return JobService.update_job(db, job_id, job_data, current_user)

@router.delete("/{job_id}")
async def delete_job(
    job_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a monitoring job"""
    success = JobService.delete_job(db, job_id, current_user)
    return {"message": "Job deleted successfully"}

@router.patch("/{job_id}/toggle", response_model=JobResponse)
async def toggle_job_status(
    job_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Toggle job enabled/disabled status"""
    return JobService.toggle_job_status(db, job_id, current_user)

@router.post("/{job_id}/check", response_model=dict)
async def trigger_immediate_health_check(
    job_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Trigger an immediate health check for a specific job"""
    # Verify job belongs to user
    job = JobService.get_job_by_id(db, job_id, current_user)
    
    # Schedule immediate check
    result = SchedulerService.schedule_immediate_check(job_id)
    return result

@router.post("/{job_id}/check-now", response_model=dict)
async def perform_direct_health_check(
    job_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Perform immediate synchronous health check and return results directly"""
    # Verify job belongs to user
    job = JobService.get_job_by_id(db, job_id, current_user)
    
    # Perform immediate health check directly
    result = HealthService.perform_health_check(db, job)
    
    return {
        "success": True,
        "job_id": str(result['job_id']),
        "job_url": result['job_url'],
        "health_check": result['check_result'],
        "current_status": result['current_status'],
        "previous_status": result['previous_status'],
        "status_changed": result['previous_status'] != result['current_status'],
        "alert_triggered": result.get('alert_triggered'),
        "checked_at": result['check_result'].get('timestamp', 'now')
    }


@router.get("/tasks/{task_id}/status", response_model=dict)
async def get_task_status(
    task_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get the status of a scheduled health check task"""
    result = SchedulerService.get_task_status(task_id)
    return result


