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
    
    # Cloud SQL Connection - this is the key fix!
    CLOUD_SQL_CONNECTION_NAME = os.getenv("CLOUD_SQL_CONNECTION_NAME")
    
    # Build DATABASE_URL based on environment
    if CLOUD_SQL_CONNECTION_NAME:
        # Running on Cloud Run - use Unix socket
        DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASS}@/{DB_NAME}?host=/cloudsql/{CLOUD_SQL_CONNECTION_NAME}"
    else:
        # Local development
        DATABASE_URL = os.getenv("DATABASE_URL", f"postgresql://{DB_USER}:{DB_PASS}@localhost:5432/{DB_NAME}")
    
    # Upstash Redis configuration
    UPSTASH_REDIS_REST_URL = os.getenv("UPSTASH_REDIS_REST_URL")
    UPSTASH_REDIS_REST_TOKEN = os.getenv("UPSTASH_REDIS_REST_TOKEN")
    
    # For Celery compatibility
    if UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN:
        REDIS_URL = f"redis://default:{UPSTASH_REDIS_REST_TOKEN}@{UPSTASH_REDIS_REST_URL.replace('https://', '').replace('/', '')}:6379"
    else:
        REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    
    # JWT configuration
    SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
    ALGORITHM = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
    
    # Resend configuration
    RESEND_API_KEY = os.getenv("RESEND_API_KEY")
    
    # App configuration
    DEBUG = os.getenv("DEBUG", "False").lower() == "true"
    CORS_ORIGINS = ["https://*.vercel.app", "http://localhost:3000", "https://localhost:3000"]
    
    class Config:
        case_sensitive = True

settings = Settings()