# Alert-related endpoints
from fastapi import APIRouter

router = APIRouter(prefix="/alerts", tags=["alerts"])

# TODO: Implement alert management endpoints