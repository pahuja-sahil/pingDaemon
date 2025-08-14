from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import logging
from .config import settings
from .models import Base

logger = logging.getLogger(__name__)

engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,        
    pool_recycle=300          
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def create_tables():
    """Create tables if they don't exist"""
    try:
        # Create any missing tables based on current models
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables checked/created successfully")
    except Exception as e:
        logger.error(f"Error creating tables: {e}")
        raise

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()