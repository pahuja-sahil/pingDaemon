import os

# Check if we're running on Cloud Run
if os.getenv("CLOUD_SQL_CONNECTION_NAME") or os.getenv("K_SERVICE"):
    # Import Cloud Run config
    from .config_cloudrun import settings
else:
    # Original local config
    from typing import Optional
    from dotenv import load_dotenv

    load_dotenv()

    class Settings:
        # Your original local settings
        DATABASE_URL: str = os.getenv(
            "DATABASE_URL", 
            "postgresql://pingAdmin:Shockingstar15@localhost:5432/pingDaemon"
        )
        
        REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")
        
        SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
        ALGORITHM: str = "HS256"
        ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
        
        RESEND_API_KEY: Optional[str] = os.getenv("RESEND_API_KEY")
        
        DEBUG: bool = os.getenv("DEBUG", "False").lower() == "true"
        CORS_ORIGINS: list = ["http://localhost:3000"]

        
        class Config:
            case_sensitive = True

    settings = Settings()