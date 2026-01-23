"""
Pydantic modellar - API request/response uchun ma'lumotlar strukturasi
Bu modellar API ga keladigan va ketadigan ma'lumotlarni tekshiradi va validatsiya qiladi
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


# ============ PRODUCT MODELS ============
class ProductBase(BaseModel):
    """Product uchun asosiy model"""
    name: str = Field(..., description="Mahsulot nomi")
    description: Optional[str] = Field(None, description="Mahsulot tavsifi")
    price: float = Field(..., gt=0, description="Narxi (sum)")
    storage: Optional[str] = Field(None, description="Xotira hajmi (masalan: 128 GB)")
    category_id: Optional[int] = Field(None, description="Kategoriya ID")
    image_url: Optional[str] = Field(None, description="Rasm URL")
    in_stock: bool = Field(True, description="Omborida bormi")


class ProductCreate(ProductBase):
    """Yangi mahsulot yaratish uchun model"""
    pass


class ProductResponse(ProductBase):
    """Mahsulot ma'lumotlarini qaytarish uchun model"""
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True  # SQLAlchemy modellardan avtomatik konvertatsiya


# ============ CATEGORY MODELS ============
class CategoryBase(BaseModel):
    """Kategoriya uchun asosiy model"""
    name: str = Field(..., description="Kategoriya nomi")
    slug: Optional[str] = Field(None, description="URL uchun slug")


class CategoryCreate(CategoryBase):
    """Yangi kategoriya yaratish uchun model"""
    pass


class CategoryResponse(CategoryBase):
    """Kategoriya ma'lumotlarini qaytarish uchun model"""
    id: int
    
    class Config:
        from_attributes = True


# ============ CART MODELS ============
class CartItemCreate(BaseModel):
    """Savatchaga mahsulot qo'shish uchun model"""
    product_id: int = Field(..., description="Mahsulot ID")
    quantity: int = Field(1, gt=0, le=10, description="Miqdori (1-10 oralig'ida)")


class CartItemResponse(BaseModel):
    """Savatchadagi mahsulot ma'lumotlari"""
    id: int
    product_id: int
    product_name: str
    product_price: float
    product_image: Optional[str]
    quantity: int
    total_price: float  # quantity * product_price
    
    class Config:
        from_attributes = True


class CartResponse(BaseModel):
    """To'liq savat ma'lumotlari"""
    items: List[CartItemResponse]
    total_items: int  # Jami mahsulotlar soni
    total_price: float  # Jami narx


# ============ ORDER MODELS ============
class OrderStatus(str, Enum):
    """Buyurtma holati"""
    PENDING = "pending"  # Kutilmoqda
    CONFIRMED = "confirmed"  # Tasdiqlandi
    PROCESSING = "processing"  # Jarayonda
    SHIPPED = "shipped"  # Yuborildi
    DELIVERED = "delivered"  # Yetkazildi
    CANCELLED = "cancelled"  # Bekor qilindi


class OrderCreate(BaseModel):
    """Yangi buyurtma yaratish uchun model"""
    delivery_address_id: Optional[int] = Field(None, description="Yetkazib berish manzili ID (ixtiyoriy)")
    delivery_address: Optional[str] = Field(None, description="Yetkazib berish manzili (agar manzil ID ko'rsatilmagan bo'lsa)")
    notes: Optional[str] = Field(None, description="Qo'shimcha eslatmalar")


class OrderResponse(BaseModel):
    """Buyurtma ma'lumotlarini qaytarish uchun model"""
    id: int
    user_id: Optional[int] = None  # Foydalanuvchi ID
    customer_name: str
    customer_phone: str
    customer_email: Optional[str]
    delivery_address: Optional[str] = None
    status: OrderStatus
    total_price: float
    items: List[CartItemResponse]
    notes: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


# ============ SEARCH MODELS ============
class SearchResponse(BaseModel):
    """Qidiruv natijalari"""
    query: str
    results: List[ProductResponse]
    total: int  # Jami topilgan mahsulotlar soni


# ============ FORM MODELS (Callback, Credit, Trade-in, va hokazo) ============
class CallbackRequest(BaseModel):
    """Qayta qo'ng'iroq qilish so'rovi"""
    name: str = Field(..., min_length=2, description="Ism")
    phone: str = Field(..., description="Telefon raqami")


class CreditApplication(BaseModel):
    """Kredit ariza modeli"""
    name: str = Field(..., min_length=2, description="Ism")
    phone: str = Field(..., description="Telefon raqami")
    email: Optional[str] = Field(None, description="Email")
    monthly_income: Optional[float] = Field(None, description="Oylik daromad")
    desired_product_id: Optional[int] = Field(None, description="Kerakli mahsulot ID")
    notes: Optional[str] = Field(None, description="Qo'shimcha ma'lumotlar")


class TradeInRequest(BaseModel):
    """Trade-in (eski telefon almashtirish) so'rovi"""
    name: str = Field(..., min_length=2, description="Ism")
    phone: str = Field(..., description="Telefon raqami")
    old_device_brand: Optional[str] = Field(None, description="Eski qurilma brendi")
    old_device_model: Optional[str] = Field(None, description="Eski qurilma modeli")
    old_device_condition: Optional[str] = Field(None, description="Holati")
    desired_product_id: Optional[int] = Field(None, description="Kerakli yangi mahsulot ID")


class PriceMatchRequest(BaseModel):
    """Narx solishtirish so'rovi"""
    name: str = Field(..., min_length=2, description="Ism")
    phone: str = Field(..., description="Telefon raqami")
    product_id: int = Field(..., description="Mahsulot ID")
    competitor_price: float = Field(..., gt=0, description="Raqib narxi")
    competitor_url: Optional[str] = Field(None, description="Raqib sayt URL")


class NewsletterSubscribe(BaseModel):
    """Newsletter (xabar yuborish) obuna"""
    email: str = Field(..., description="Email manzil")


class OneClickBuyRequest(BaseModel):
    """1-click buy (bir bosishda sotib olish) so'rovi"""
    product_id: int = Field(..., description="Mahsulot ID")
    name: str = Field(..., min_length=2, description="Ism")
    phone: str = Field(..., description="Telefon raqami")
    quantity: int = Field(1, gt=0, le=10, description="Miqdori (default: 1)")
    delivery_address: Optional[str] = Field(None, description="Yetkazib berish manzili (ixtiyoriy)")
    notes: Optional[str] = Field(None, description="Qo'shimcha eslatmalar (ixtiyoriy)")


# ============ RESPONSE MODELS ============
class MessageResponse(BaseModel):
    """Oddiy xabar qaytarish uchun model"""
    message: str
    success: bool = True


class ErrorResponse(BaseModel):
    """Xato qaytarish uchun model"""
    error: str
    detail: Optional[str] = None


# ============ PAGINATION MODELS ============
class PaginatedResponse(BaseModel):
    """Sahifalash (pagination) uchun model"""
    items: List[ProductResponse]
    total: int  # Jami mahsulotlar soni
    page: int  # Joriy sahifa
    page_size: int  # Sahifadagi mahsulotlar soni
    total_pages: int  # Jami sahifalar soni


# ============ REVIEW/RATING MODELS ============
class ReviewCreate(BaseModel):
    """Mahsulotga sharh yozish uchun model"""
    product_id: int = Field(..., description="Mahsulot ID")
    customer_name: str = Field(..., min_length=2, description="Mijoz ismi")
    rating: int = Field(..., ge=1, le=5, description="Baholash (1-5)")
    comment: Optional[str] = Field(None, description="Sharh matni")


class ReviewResponse(BaseModel):
    """Sharh ma'lumotlari"""
    id: int
    product_id: int
    customer_name: str
    rating: int
    comment: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True


class ProductWithReviews(ProductResponse):
    """Mahsulot + sharhlar"""
    reviews: List[ReviewResponse] = []
    average_rating: Optional[float] = None  # O'rtacha baholash
    total_reviews: int = 0  # Jami sharhlar soni


# ============ WISHLIST MODELS ============
class WishlistItemResponse(BaseModel):
    """Sevimli mahsulotlar ro'yxatidagi item"""
    id: int
    product_id: int
    product: ProductResponse
    added_at: datetime
    
    class Config:
        from_attributes = True


class WishlistResponse(BaseModel):
    """To'liq wishlist ma'lumotlari"""
    items: List[WishlistItemResponse]
    total_items: int


# ============ ORDER STATUS UPDATE ============
class OrderStatusUpdate(BaseModel):
    """Buyurtma holatini yangilash uchun model"""
    status: OrderStatus = Field(..., description="Yangi holat")


# ============ STATISTICS MODELS ============
class StatisticsResponse(BaseModel):
    """Statistikalar"""
    total_products: int
    total_categories: int
    total_orders: int
    total_revenue: float  # Jami daromad
    pending_orders: int
    completed_orders: int
    average_order_value: Optional[float]  # O'rtacha buyurtma summasi


# ============ RELATED PRODUCTS ============
class RelatedProductsResponse(BaseModel):
    """O'xshash mahsulotlar"""
    product_id: int
    related_products: List[ProductResponse]


# ============ AUTHENTICATION & AUTHORIZATION MODELS ============
class UserRole(str, Enum):
    """Foydalanuvchi rollari"""
    USER = "user"  # Oddiy mijoz
    ADMIN = "admin"  # Sayt egasi/admin


class UserBase(BaseModel):
    """Foydalanuvchi uchun asosiy model"""
    username: str = Field(..., min_length=3, description="Foydalanuvchi nomi")
    email: str = Field(..., description="Email manzil")
    phone: str = Field(..., description="Telefon raqami")
    full_name: str = Field(..., min_length=2, description="To'liq ism")


class UserCreate(UserBase):
    """Yangi foydalanuvchi yaratish uchun model"""
    password: str = Field(..., min_length=6, description="Parol (kamida 6 belgi)")


class UserResponse(UserBase):
    """Foydalanuvchi ma'lumotlarini qaytarish uchun model"""
    id: int
    role: UserRole
    is_verified: bool = False  # Telefon raqami tasdiqlanganmi
    created_at: datetime
    
    class Config:
        from_attributes = True


class LoginRequest(BaseModel):
    """Login so'rovi"""
    username: Optional[str] = Field(None, description="Username yoki email")
    email: Optional[str] = Field(None, description="Email (username o'rniga)")
    password: str = Field(..., description="Parol")


class TokenResponse(BaseModel):
    """JWT token javobi"""
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class RegistrationRequest(UserCreate):
    """Ro'yxatdan o'tish so'rovi"""
    pass


class VerificationRequest(BaseModel):
    """Telefon raqamini tasdiqlash so'rovi"""
    phone: str = Field(..., description="Telefon raqami")
    verification_code: str = Field(..., description="Tasdiqlovchi kod")


class VerificationResponse(BaseModel):
    """Tasdiqlash javobi"""
    message: str
    user: UserResponse
    access_token: str
    token_type: str = "bearer"


class ResendCodeRequest(BaseModel):
    """Kodni qayta yuborish so'rovi"""
    phone: str = Field(..., description="Telefon raqami")


class DeliveryAddressCreate(BaseModel):
    """Yetkazib berish manzili yaratish"""
    address: str = Field(..., min_length=5, description="To'liq manzil")
    city: str = Field(..., description="Shahar")
    postal_code: Optional[str] = Field(None, description="Pochta indeksi")
    is_default: bool = Field(False, description="Asosiy manzil")


class DeliveryAddressResponse(DeliveryAddressCreate):
    """Yetkazib berish manzili javobi"""
    id: int
    user_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True
