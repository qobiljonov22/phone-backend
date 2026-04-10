"""
Authentication endpointlar
Registration, Login, Verification va boshqalar
"""
from fastapi import APIRouter, HTTPException, status, Depends, Form
from typing import List, Optional
from models import (
    RegistrationRequest, LoginRequest, TokenResponse, UserResponse,
    VerificationRequest, VerificationResponse, ResendCodeRequest, MessageResponse,
    DeliveryAddressCreate, DeliveryAddressResponse,
    ForgotPasswordRequest, ResetPasswordRequest, ResetPasswordResponse,
    UserRole
)
from database import (
    create_user, authenticate_user, verify_user_phone, send_verification_code,
    resend_verification_code, get_user_delivery_addresses,
    create_delivery_address, get_default_delivery_address,
    forgot_password, verify_password_reset_token, reset_user_password,
    get_user_by_id
)
from auth import create_access_token, get_current_active_user

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
def register_user(registration: RegistrationRequest):
    """
    Ro'yxatdan o'tish
    
    - **email**: Email manzil (majburiy)
    - **password**: Parol (majburiy, 8-12 belgi)
    - **full_name**: To'liq ism (majburiy, kamida 2 belgi)
    - **username**: Foydalanuvchi nomi (ixtiyoriy)
    - **phone**: Telefon raqami (ixtiyoriy)
    
    User darhol avtomatik tasdiqlanadi
    """
    try:
        user = create_user(registration)
        
        return MessageResponse(
            message=f"Ro'yxatdan muvaffaqiyatli o'tdingiz! Endi login qilishingiz mumkin.",
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
    
    Telefon raqamiga yangi 6 xonali kod yuboriladi
    """
    code = resend_verification_code(request.phone)
    
    if not code:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Bu telefon raqami ro'yxatdan o'tmagan"
        )
    
    return MessageResponse(
        message=f"{request.phone} raqamiga yangi kod yuborildi",
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


@router.post("/admin-login", response_model=TokenResponse)
def admin_login(
    username: str = Form(...),
    password: str = Form(...)
):
    """
    Admin va sayt egasi uchun login
    
    - **username**: Admin username (majburiy)
    - **password**: Admin parol (majburiy)
    
    Faqat bitta admin login va paroli bilan kirish
    """
    if not username:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username ko'rsatilishi kerak"
        )
    
    user = authenticate_user(username, password)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Noto'g'ri admin login yoki parol"
        )
    
    # Admin ekanligini tekshirish
    if user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bu endpoint faqat admin va sayt egasi uchun"
        )
    
    # JWT token yaratish
    access_token = create_access_token(data={"sub": user.id})
    
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=user
    )


@router.post("/login-email", response_model=TokenResponse)
def login_with_email(
    email: str = Form(...),
    password: str = Form(...)
):
    """
    Client login - Email va parol bilan kirish
    
    - **email**: Client email manzili (majburiy)
    - **password**: Client paroli (majburiy)
    
    Har bir client o'zining email va paroli bilan kiradi
    """
    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email ko'rsatilishi kerak"
        )
    
    user = authenticate_user(email, password)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Noto'g'ri email yoki parol"
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
    Foydalanuvchi uchun yetkazib berish manzili yaratish
    
    - **address**: Manzil (majburiy)
    - **city**: Shahar (majburiy)
    - **postal_code**: Pochta indeksi (ixtiyoriy)
    - **is_default**: Asosiy manzil ekanligi (ixtiyoriy)
    """
    return create_delivery_address(current_user.id, address)


@router.get("/delivery-addresses", response_model=List[DeliveryAddressResponse])
def get_user_delivery_addresses_endpoint(
    current_user: UserResponse = Depends(get_current_active_user)
):
    """
    Foydalanuvchining barcha yetkazib berish manzillarini olish
    """
    return get_user_delivery_addresses(current_user.id)


@router.get("/delivery-addresses/default", response_model=Optional[DeliveryAddressResponse])
def get_default_address(
    current_user: UserResponse = Depends(get_current_active_user)
):
    """
    Foydalanuvchining asosiy yetkazib berish manzilini olish
    """
    return get_default_delivery_address(current_user.id)


# ============ FORGOT PASSWORD ENDPOINTS ============

@router.post("/forgot-password", response_model=MessageResponse, status_code=status.HTTP_200_OK)
def forgot_password_endpoint(request: ForgotPasswordRequest):
    """
    Parolni unutish
    
    - **gmail**: Gmail manzil (majburiy)
    
    Email yoki telefon raqamiga parolni tiklash linki yuboriladi
    """
    try:
        token = forgot_password(email=request.email, phone=request.phone)
        
        if not token:
            # Agar user topilmasa, xavfsizlik uchun bir xil xabar
            return MessageResponse(
                message="Agar bu email yoki telefon raqami ro'yxatdan o'tgan bo'lsa, parolni tiklash linki yuborildi",
                success=True
            )
        
        # Qaysi usul bilan yuborilganiga qarab xabar
        if request.email:
            return MessageResponse(
                message=f"Parolni tiklash linki {request.email} manziliga yuborildi",
                success=True
            )
        elif request.phone:
            return MessageResponse(
                message=f"Parolni tiklash linki {request.phone} raqamiga yuborildi",
                success=True
            )
        
        return MessageResponse(
            message="Parolni tiklash linki yuborildi",
            success=True
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.post("/reset-password", response_model=ResetPasswordResponse, status_code=status.HTTP_200_OK)
def reset_password_endpoint(request: ResetPasswordRequest):
    """
    Parolni tiklash
    
    - **token**: Parolni tiklash tokeni (majburiy)
    - **new_password**: Yangi parol (majburiy, 8-12 belgi)
    
    Token orqali parolni yangilash
    """
    try:
        # Tokenni tekshirish
        token_data = verify_password_reset_token(request.token)
        if not token_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Token noto'g'ri yoki muddati o'tgan"
            )
        
        # Parolni yangilash
        success = reset_user_password(token_data["user_id"], request.new_password)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Parolni yangilab bo'lmadi"
            )
        
        # Yangilangan userni olish
        user = get_user_by_id(token_data["user_id"])
        
        return ResetPasswordResponse(
            message="Parol muvaffaqiyatli yangilandi!",
            user=user
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.get("/debug/reset-tokens", tags=["Debug"])
def get_active_reset_tokens():
    """
    Faol parolni tiklash tokenlarini ko'rish (faqat test uchun)
    """
    from database import password_reset_tokens_db
    
    tokens_info = []
    for email, token_data in password_reset_tokens_db.items():
        tokens_info.append({
            "email": email,
            "token": token_data["token"],
            "expires_at": token_data["expires_at"],
            "created_at": token_data["created_at"],
            "user_id": token_data["user_id"]
        })
    
    return {
        "active_tokens": tokens_info,
        "total_count": len(tokens_info)
    }
