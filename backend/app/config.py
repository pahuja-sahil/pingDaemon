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
        print(f"🔍 Processing URL: {redis_url}")
        
        # Handle URLs with query parameters
        if '?' in redis_url:
            base_url, query_params = redis_url.split('?', 1)
            # Remove trailing slashes from base URL
            base_url = base_url.rstrip('/')
            # Add database number if not present
            if not base_url.endswith('/0'):
                base_url += '/0'
            redis_url = f"{base_url}?{query_params}"
        else:
            # Simple URL without query parameters
            redis_url = redis_url.rstrip('/')
            if not redis_url.endswith('/0'):
                redis_url += '/0'
        
        print(f"🔍 Final URL: {redis_url}")
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
    
    # Frontend URL configuration
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:3000")
    
    # CORS configuration - dynamic based on environment
    @property
    def CORS_ORIGINS(self) -> list:
        cors_origins = os.getenv("CORS_ORIGINS", self.FRONTEND_URL)
        return [origin.strip() for origin in cors_origins.split(",")]
    
    class Config:
        case_sensitive = True

settings = Settings()