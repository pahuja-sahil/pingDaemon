from sqlalchemy import create_engine, text
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
    """Create tables and add missing columns for Google OAuth"""
    try:
        # First, create any new tables
        Base.metadata.create_all(bind=engine)
        
        # Check if Google OAuth columns exist and add them if missing
        with engine.connect() as conn:
            # Check if google_id column exists
            result = conn.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'users' AND column_name = 'google_id'
            """))
            
            if not result.fetchone():
                logger.info("Adding missing Google OAuth columns to users table")
                
                # Add Google OAuth columns
                conn.execute(text("ALTER TABLE users ADD COLUMN google_id VARCHAR"))
                conn.execute(text("ALTER TABLE users ADD COLUMN provider VARCHAR DEFAULT 'email'"))
                conn.execute(text("ALTER TABLE users ADD COLUMN avatar_url VARCHAR"))
                conn.execute(text("ALTER TABLE users ADD COLUMN name VARCHAR"))
                
                # Create index on google_id
                conn.execute(text("CREATE INDEX ix_users_google_id ON users (google_id)"))
                
                # Make hashed_password nullable for OAuth users
                conn.execute(text("ALTER TABLE users ALTER COLUMN hashed_password DROP NOT NULL"))
                
                conn.commit()
                logger.info("Successfully added Google OAuth columns")
            else:
                logger.info("Google OAuth columns already exist")
                
    except Exception as e:
        logger.error(f"Error creating tables or adding columns: {e}")
        # Still call the original create_all as fallback
        Base.metadata.create_all(bind=engine)
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()