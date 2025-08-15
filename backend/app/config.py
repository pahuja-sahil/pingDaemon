import os
from typing import Optional
from dotenv import load_dotenv

load_dotenv()

class Settings:
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "postgresql://pingAdmin:Shockingstar15@postgres:5432/pingDaemon"
    )
    
    @property
    def CELERY_BROKER_URL(self) -> str:
        """PostgreSQL broker URL for Celery"""
        db_url = self.DATABASE_URL
        if db_url.startswith("postgresql://"):
            return f"sqlalchemy+{db_url}"
        elif db_url.startswith("postgres://"):
            # Railway/Heroku style URL
            return db_url.replace("postgres://", "sqlalchemy+postgresql://", 1)
        return f"sqlalchemy+{db_url}"
    
    @property  
    def CELERY_RESULT_BACKEND(self) -> str:
        """PostgreSQL result backend URL for Celery"""
        db_url = self.DATABASE_URL
        if db_url.startswith("postgresql://"):
            return f"db+{db_url}"
        elif db_url.startswith("postgres://"):
            # Railway/Heroku style URL  
            return db_url.replace("postgres://", "db+postgresql://", 1)
        return f"db+{db_url}"
    
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