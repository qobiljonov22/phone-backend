"""
Authentication endpointlar
Registration, Login, Verification va boshqalar
"""
from fastapi import APIRouter, HTTPException, status, Depends
from typing import List, Optional
from models import (
    RegistrationRequest, LoginRequest, TokenResponse, UserResponse,
    VerificationRequest, VerificationResponse, ResendCodeRequest, MessageResponse,
    DeliveryAddressCreate, DeliveryAddressResponse
)
from database import (
    create_user, authenticate_user, verify_user_phone, send_verification_code,
    resend_verification_code, get_user_delivery_addresses,
    create_delivery_address, get_default_delivery_address
)
from auth import create_access_token, get_current_active_user

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
def register_user(registration: RegistrationRequest):
    """
    Ro'yxatdan o'tish
    
    - **username**: Foydalanuvchi nomi (majburiy, kamida 3 belgi)
    - **email**: Email manzil (majburiy)
    - **phone**: Telefon raqami (majburiy)
    - **password**: Parol (majburiy, kamida 6 belgi)
    - **full_name**: To'liq ism (majburiy, kamida 2 belgi)
    
    Telefon raqamiga tasdiqlovchi kod yuboriladi
    """
    try:
        user = create_user(registration)
        
        # Tasdiqlovchi kod yuborish
        code = send_verification_code(user.phone, user.id)
        
        return MessageResponse(
            message=f"Ro'yxatdan muvaffaqiyatli o'tdingiz! {user.phone} raqamiga tasdiqlovchi kod yuborildi.",
            success=True
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.post("/verify", response_model=VerificationResponse)
def verify_phone(verification: VerificationRequest):
    """
    Telefon raqamini tasdiqlash
    
    - **phone**: Telefon raqami (majburiy)
    - **verification_code**: Tasdiqlovchi kod (majburiy)
    
    Kod to'g'ri bo'lsa, JWT token qaytariladi va foydalanuvchi saytga kirishi mumkin
    """
    user = verify_user_phone(verification.phone, verification.verification_code)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Noto'g'ri kod yoki kod muddati o'tgan"
        )
    
    # JWT token yaratish
    access_token = create_access_token(data={"sub": user.id})
    
    return VerificationResponse(
        message="Telefon raqamingiz muvaffaqiyatli tasdiqlandi!",
        user=user,
        access_token=access_token,
        token_type="bearer"
    )


@router.post("/resend-code", response_model=MessageResponse)
def resend_verification_code_endpoint(request: ResendCodeRequest):
    """
    Tasdiqlovchi kodni qayta yuborish
    
    - **phone**: Telefon raqami (majburiy)
    """
    code = resend_verification_code(request.phone)
    
    if not code:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bu telefon raqami ro'yxatdan o'tmagan"
        )
    
    return MessageResponse(
        message=f"Tasdiqlovchi kod {request.phone} raqamiga qayta yuborildi",
        success=True
    )


@router.post("/login", response_model=TokenResponse)
def login(login_data: LoginRequest):
    """
    Login (Kirish)
    
    - **username**: Username yoki email (majburiy)
    - **email**: Email (username o'rniga, ixtiyoriy)
    - **password**: Parol (majburiy)
    
    Email yoki username va parol bilan kirish
    """
    username_or_email = login_data.username or login_data.email
    
    if not username_or_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username yoki email ko'rsatilishi kerak"
        )
    
    user = authenticate_user(username_or_email, login_data.password)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Noto'g'ri username/email yoki parol"
        )
    
    # JWT token yaratish
    access_token = create_access_token(data={"sub": user.id})
    
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=user
    )


@router.get("/me", response_model=UserResponse)
def get_current_user_info(current_user: UserResponse = Depends(get_current_active_user)):
    """
    Joriy foydalanuvchi ma'lumotlarini olish
    
    Token orqali autentifikatsiya qilingan foydalanuvchi ma'lumotlarini qaytaradi
    """
    return current_user


# ============ DELIVERY ADDRESS ENDPOINTS ============

@router.post("/delivery-addresses", response_model=DeliveryAddressResponse, status_code=status.HTTP_201_CREATED)
def create_user_delivery_address(
    address: DeliveryAddressCreate,
    current_user: UserResponse = Depends(get_current_active_user)
):
    """
    Yetkazib berish manzili yaratish
    
    - **address**: To'liq manzil (majburiy)
    - **city**: Shahar (majburiy)
    - **postal_code**: Pochta indeksi (ixtiyoriy)
    - **is_default**: Asosiy manzil (default: False)
    """
    return create_delivery_address(current_user.id, address)


@router.get("/delivery-addresses", response_model=List[DeliveryAddressResponse])
def get_user_delivery_addresses_endpoint(
    current_user: UserResponse = Depends(get_current_active_user)
):
    """
    Foydalanuvchining barcha manzillarini olish
    """
    return get_user_delivery_addresses(current_user.id)


@router.get("/delivery-addresses/default", response_model=Optional[DeliveryAddressResponse])
def get_default_address(
    current_user: UserResponse = Depends(get_current_active_user)
):
    """
    Foydalanuvchining asosiy manzilini olish
    """
    return get_default_delivery_address(current_user.id)
