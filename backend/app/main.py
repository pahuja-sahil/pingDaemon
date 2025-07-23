from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .database import create_tables
from .routes import auth, jobs, reports

app = FastAPI(title="pingDaemon", description="Uptime Monitor - Health Check System")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(jobs.router)
app.include_router(reports.router)

@app.get("/")
async def root():
    return {"message": "pingDaemon API is running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.on_event("startup")
async def startup_event():
    create_tables()