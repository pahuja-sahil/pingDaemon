# Login/signup endpoints
from fastapi import APIRouter

router = APIRouter(prefix="/auth", tags=["authentication"])

# TODO: Implement auth endpoints in Phase 1 Step 3