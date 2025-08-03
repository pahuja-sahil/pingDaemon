import httpx
import logging
from google.oauth2 import id_token
from google.auth.transport import requests
from sqlalchemy.orm import Session
from typing import Optional, Dict, Any
from fastapi import HTTPException, status

from ..models.user import User
from ..config import settings
from ..utils.security import create_access_token

logger = logging.getLogger(__name__)

class GoogleOAuthService:
    
    @staticmethod
    async def verify_google_token(token: str) -> Optional[Dict[str, Any]]:
        """Verify Google ID token and return user info"""
        try:
            # Check if Google Client ID is configured
            if not settings.GOOGLE_CLIENT_ID:
                logger.error("GOOGLE_CLIENT_ID not configured")
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Google OAuth not configured properly"
                )
            
            logger.info(f"Verifying Google token with client ID: {settings.GOOGLE_CLIENT_ID[:20]}...")
            
            # Verify the token with Google
            idinfo = id_token.verify_oauth2_token(
                token, 
                requests.Request(), 
                settings.GOOGLE_CLIENT_ID
            )
            
            # Check if the token is from the correct issuer
            if idinfo['iss'] not in ['accounts.google.com', 'https://accounts.google.com']:
                logger.error(f"Invalid token issuer: {idinfo.get('iss')}")
                raise ValueError('Wrong issuer.')
                
            logger.info("Google token verification successful")
            return idinfo
        except ValueError as e:
            logger.error(f"Google token verification failed: {str(e)}")
            return None
        except Exception as e:
            logger.error(f"Unexpected error verifying Google token: {str(e)}", exc_info=True)
            return None
    
    @staticmethod
    async def get_google_user_info(access_token: str) -> Optional[Dict[str, Any]]:
        """Get user info from Google People API using access token"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    'https://www.googleapis.com/oauth2/v2/userinfo',
                    headers={'Authorization': f'Bearer {access_token}'}
                )
                
                if response.status_code == 200:
                    return response.json()
                else:
                    logger.error(f"Failed to get Google user info: {response.status_code}")
                    return None
        except Exception as e:
            logger.error(f"Error getting Google user info: {str(e)}", exc_info=True)
            return None
    
    @staticmethod
    def find_or_create_google_user(db: Session, google_user_info: Dict[str, Any]) -> User:
        """Find existing user or create new one from Google info"""
        google_id = google_user_info.get('sub')  # 'sub' is the Google user ID
        email = google_user_info.get('email')
        name = google_user_info.get('name')
        picture = google_user_info.get('picture')
        
        if not google_id or not email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid Google user information"
            )
        
        # Try to find by Google ID first
        user = db.query(User).filter(User.google_id == google_id).first()
        
        # If not found by Google ID, try to find by email
        if not user:
            user = db.query(User).filter(User.email == email).first()
            if user:
                # Link existing email account to Google
                user.google_id = google_id
                user.provider = "google"
                user.avatar_url = picture
                user.name = name
                db.commit()
                db.refresh(user)
        
        # Create new user if not found
        if not user:
            user = User(
                email=email,
                google_id=google_id,
                provider="google",
                avatar_url=picture,
                name=name,
                is_active=True,
                hashed_password=None  # No password for OAuth users
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        
        return user
    
    @staticmethod
    def create_access_token_for_google_user(user: User) -> str:
        """Create JWT token for Google authenticated user"""
        token_data = {
            "sub": str(user.id), 
            "email": user.email,
            "provider": user.provider
        }
        return create_access_token(token_data)
    
    @staticmethod
    async def authenticate_with_google(db: Session, google_token: str) -> Dict[str, Any]:
        """Complete Google OAuth authentication flow"""
        try:
            # Verify the Google token
            google_user_info = await GoogleOAuthService.verify_google_token(google_token)
            
            if not google_user_info:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid Google token"
                )
            
            # Find or create user
            user = GoogleOAuthService.find_or_create_google_user(db, google_user_info)
            
            # Create JWT token
            access_token = GoogleOAuthService.create_access_token_for_google_user(user)
            
            return {
                "access_token": access_token,
                "token_type": "bearer",
                "user": {
                    "id": user.id,
                    "email": user.email,
                    "name": user.name,
                    "avatar_url": user.avatar_url,
                    "provider": user.provider,
                    "is_active": user.is_active
                }
            }
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Google authentication error: {str(e)}", exc_info=True)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Google authentication failed: {str(e)}"
            )