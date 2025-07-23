# User signup/login schemas
from pydantic import BaseModel, EmailStr, validator
from typing import Optional
from uuid import UUID

class UserBase(BaseModel):
    email: EmailStr
    
    @validator('email')
    def email_must_be_gmail(cls, v):
        if not str(v).lower().endswith('@gmail.com'):
            raise ValueError('Only Gmail accounts (@gmail.com) are allowed')
        return v

class UserCreate(UserBase):
    password: str

class UserLogin(UserBase):
    password: str

class UserResponse(UserBase):
    id: UUID
    is_active: bool
    
    class Config:
        from_attributes = True

class ForgotPasswordRequest(BaseModel):
    email: EmailStr
    
    @validator('email')
    def email_must_be_gmail(cls, v):
        if not str(v).lower().endswith('@gmail.com'):
            raise ValueError('Only Gmail accounts (@gmail.com) are allowed')
        return v

class ResetPasswordRequest(BaseModel):
    token: str
    password: str

class PasswordResetResponse(BaseModel):
    message: str