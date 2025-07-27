import os
from typing import Optional
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Settings:
    # Database configuration
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "postgresql://pingAdmin:Shockingstar15@postgres:5432/pingDaemon"
    )
    
    # Redis configuration for Celery
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://redis:6379/0")
    
    @property
    def REDIS_URL_FIXED(self) -> str:
        """Fix Redis URL format for cloud providers like Upstash"""
        redis_url = self.REDIS_URL
        # Fix double slash issue in Upstash URLs - remove trailing //
        if redis_url.endswith("//"):
            redis_url = redis_url[:-1]  # Remove one trailing slash
        return redis_url
    
    # JWT configuration
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
    
    # Resend configuration
    RESEND_API_KEY: Optional[str] = os.getenv("RESEND_API_KEY")
    
    # App configuration
    DEBUG: bool = os.getenv("DEBUG", "False").lower() == "true"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    
    # CORS configuration - dynamic based on environment
    @property
    def CORS_ORIGINS(self) -> list:
        cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:3000")
        return [origin.strip() for origin in cors_origins.split(",")]
    
    class Config:
        case_sensitive = True

settings = Settings()