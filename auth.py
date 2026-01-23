"""
Authentication va Authorization tizimi
JWT token yaratish, tekshirish va foydalanuvchi rollarini boshqarish
"""
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from models import UserResponse, UserRole
from database import get_user_by_id

# JWT sozlamalari
SECRET_KEY = "your-secret-key-change-in-production-very-important"  # Production da o'zgartirish kerak!
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30 * 24 * 60  # 30 kun

# OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """JWT access token yaratish"""
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def verify_token(token: str) -> Optional[dict]:
    """Token ni tekshirish va decode qilish"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None


async def get_current_user(token: str = Depends(oauth2_scheme)) -> UserResponse:
    """
    Joriy foydalanuvchini olish (token dan)
    Har bir protected endpoint da ishlatiladi
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Autentifikatsiya qilinmagan",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    payload = verify_token(token)
    if payload is None:
        raise credentials_exception
    
    user_id: int = payload.get("sub")
    if user_id is None:
        raise credentials_exception
    
    user = get_user_by_id(user_id)
    if user is None:
        raise credentials_exception
    
    return user


async def get_current_active_user(current_user: UserResponse = Depends(get_current_user)) -> UserResponse:
    """Faol foydalanuvchini olish"""
    if not current_user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Telefon raqamingiz tasdiqlanmagan. Iltimos, avval tasdiqlang"
        )
    return current_user


async def get_current_admin(current_user: UserResponse = Depends(get_current_user)) -> UserResponse:
    """Admin foydalanuvchini olish"""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin huquqi kerak"
        )
    return current_user
