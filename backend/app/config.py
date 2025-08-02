import os
from typing import Optional
from dotenv import load_dotenv

load_dotenv()

class Settings:
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "postgresql://pingAdmin:Shockingstar15@postgres:5432/pingDaemon"
    )
    
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://redis:6379/0")
    
    @property
    def REDIS_URL_FIXED(self) -> str:
        """Fix Redis URL format for cloud providers like Upstash"""
        redis_url = self.REDIS_URL
        
        if '?' in redis_url:
            base_url, query_params = redis_url.split('?', 1)
            base_url = base_url.rstrip('/')
            if not base_url.endswith('/0'):
                base_url += '/0'
            redis_url = f"{base_url}?{query_params}"
        else:
            redis_url = redis_url.rstrip('/')
            if not redis_url.endswith('/0'):
                redis_url += '/0'
        
        return redis_url
    
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
    
    RESEND_API_KEY: Optional[str] = os.getenv("RESEND_API_KEY")
    
    # Google OAuth Configuration
    GOOGLE_CLIENT_ID: str = os.getenv("GOOGLE_CLIENT_ID", "")
    GOOGLE_CLIENT_SECRET: str = os.getenv("GOOGLE_CLIENT_SECRET", "")
    GOOGLE_REDIRECT_URI: str = os.getenv("GOOGLE_REDIRECT_URI", "http://localhost:3000/auth/google/callback")
    
    DEBUG: bool = os.getenv("DEBUG", "False").lower() == "true"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:3000")
    @property
    def CORS_ORIGINS(self) -> list:
        cors_origins = os.getenv("CORS_ORIGINS", self.FRONTEND_URL)
        origins = [origin.strip() for origin in cors_origins.split(",")]
        # Always include the primary domain
        if "https://ping-daemon.me" not in origins:
            origins.append("https://ping-daemon.me")
        return origins
    
    class Config:
        case_sensitive = True

settings = Settings()