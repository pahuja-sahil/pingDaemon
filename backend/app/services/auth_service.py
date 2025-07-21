from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from jose import JWTError, jwt
from datetime import datetime, timedelta
from typing import Optional
from uuid import UUID
import secrets
import string

from ..models.user import User
from ..schemas.user import UserCreate
from ..utils.security import hash_password, verify_password, create_access_token
from ..config import settings
from ..email.resend_client import ResendClient

class AuthService:
    
    @staticmethod
    def create_user(db: Session, user_data: UserCreate) -> User:
        """Create a new user with hashed password"""
        # Check if user already exists
        existing_user = db.query(User).filter(User.email == user_data.email).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Create new user
        hashed_password = hash_password(user_data.password)
        db_user = User(
            email=user_data.email,
            hashed_password=hashed_password
        )
        
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user
    
    @staticmethod
    def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
        """Authenticate user with email and password"""
        user = db.query(User).filter(User.email == email).first()
        if not user:
            return None
        if not verify_password(password, user.hashed_password):
            return None
        return user
    
    @staticmethod
    def create_access_token_for_user(user: User) -> str:
        """Create JWT access token for user"""
        token_data = {"sub": str(user.id), "email": user.email}
        return create_access_token(token_data)
    
    @staticmethod
    def verify_token(token: str) -> dict:
        """Verify JWT token and return payload"""
        try:
            payload = jwt.decode(
                token, 
                settings.SECRET_KEY, 
                algorithms=[settings.ALGORITHM]
            )
            return payload
        except JWTError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
    
    @staticmethod
    def get_current_user(db: Session, token: str) -> User:
        """Get current user from JWT token"""
        payload = AuthService.verify_token(token)
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        user = db.query(User).filter(User.id == UUID(user_id)).first()
        if user is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return user
    
    @staticmethod
    def generate_reset_token() -> str:
        """Generate a secure random token for password reset"""
        return ''.join(secrets.choice(string.ascii_letters + string.digits) for _ in range(32))
    
    @staticmethod
    def request_password_reset(db: Session, email: str) -> bool:
        """Generate password reset token for user"""
        user = db.query(User).filter(User.email == email).first()
        if not user:
            # For security, don't reveal if email exists or not
            return True
        
        # Generate reset token and set expiry (1 hour from now)
        reset_token = AuthService.generate_reset_token()
        reset_expires = datetime.utcnow() + timedelta(hours=1)
        
        # Update user with reset token
        user.reset_token = reset_token
        user.reset_token_expires = reset_expires
        db.commit()
        
        # Send password reset email
        try:
            email_client = ResendClient()
            result = email_client.send_password_reset_email(
                recipient_email=email,
                recipient_name=email,  # Using email as name for now
                reset_token=reset_token
            )
            
            if not result.get('success'):
                print(f"Failed to send password reset email: {result.get('error')}")
                # Still return True for security - don't reveal email send failures
                
        except Exception as e:
            print(f"Exception sending password reset email: {str(e)}")
            # For development, also print the token to console as fallback
            print(f"Password reset token for {email}: {reset_token}")
        
        return True
    
    @staticmethod
    def verify_reset_token(db: Session, token: str) -> Optional[User]:
        """Verify reset token and return user if valid"""
        user = db.query(User).filter(
            User.reset_token == token,
            User.reset_token_expires > datetime.utcnow()
        ).first()
        
        return user
    
    @staticmethod
    def reset_password(db: Session, token: str, new_password: str) -> bool:
        """Reset user password using token"""
        user = AuthService.verify_reset_token(db, token)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired reset token"
            )
        
        # Update password and clear reset token
        user.hashed_password = hash_password(new_password)
        user.reset_token = None
        user.reset_token_expires = None
        db.commit()
        
        return True