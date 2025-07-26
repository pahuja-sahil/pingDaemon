import os
from typing import Optional
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class Settings:
    # Database configuration for Cloud Run
    DB_USER = os.getenv("DB_USER", "pingAdmin")
    DB_PASS = os.getenv("DB_PASS", "Shockingstar15")
    DB_NAME = os.getenv("DB_NAME", "pingDaemon")
    
    # Cloud SQL Connection
    CLOUD_SQL_CONNECTION_NAME = os.getenv("CLOUD_SQL_CONNECTION_NAME")
    
    # Build DATABASE_URL based on environment
    if CLOUD_SQL_CONNECTION_NAME:
        # Running on Cloud Run - use Unix socket
        DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASS}@/{DB_NAME}?host=/cloudsql/{CLOUD_SQL_CONNECTION_NAME}"
    else:
        # Local development
        DATABASE_URL = os.getenv("DATABASE_URL", f"postgresql://{DB_USER}:{DB_PASS}@localhost:5432/{DB_NAME}")
    
    # Redis configuration - Simplified for Memorystore
    REDIS_HOST = os.getenv("REDIS_HOST")
    if REDIS_HOST:
        # Using Google Cloud Memorystore
        REDIS_URL = f"redis://{REDIS_HOST}:6379/0"
    else:
        # Local development fallback
        REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    
    # JWT configuration
    SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
    ALGORITHM = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
    
    # Resend configuration
    RESEND_API_KEY = os.getenv("RESEND_API_KEY")
    
    # App configuration
    DEBUG = os.getenv("DEBUG", "False").lower() == "true"
    CORS_ORIGINS = [
        "https://ping-daemon.vercel.app",
        "https://pingdaemon.vercel.app", 
        "http://localhost:3000",
        "https://localhost:3000",
        "http://localhost:5173",  # Vite dev server
        "https://localhost:5173"
    ]
    
    class Config:
        case_sensitive = True

settings = Settings()