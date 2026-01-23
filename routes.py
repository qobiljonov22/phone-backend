"""
API Routes - Barcha endpointlar bu yerda
FastAPI da har bir endpoint funksiya sifatida yoziladi
"""
from fastapi import APIRouter, HTTPException, status, Depends
from typing import List, Optional
from models import (
    ProductCreate, ProductResponse, ProductWithReviews, CategoryCreate, CategoryResponse,
    CartItemCreate, CartItemResponse, CartResponse, OrderCreate, OrderResponse,
    SearchResponse, CallbackRequest, CreditApplication, TradeInRequest,
    PriceMatchRequest, NewsletterSubscribe, MessageResponse, ErrorResponse,
    PaginatedResponse, ReviewCreate, ReviewResponse, WishlistResponse, WishlistItemResponse,
    OrderStatusUpdate, StatisticsResponse, RelatedProductsResponse, ProductWithReviews
)
from database import (
    create_product, get_product, get_all_products, search_products,
    update_product, delete_product,
    create_category, get_category, get_all_categories,
    update_category, delete_category,
    add_to_cart, get_cart, update_cart_item, remove_from_cart, clear_cart,
    create_order, get_order, get_all_orders, update_order_status,
    get_orders_by_phone, get_orders_by_email,
    create_review, get_product_reviews, get_all_reviews,
    get_product_with_reviews,
    add_to_wishlist, get_wishlist, remove_from_wishlist,
    get_products_paginated, get_statistics, get_related_products,
    callbacks_db, credit_applications_db, trade_in_requests_db,
    price_match_requests_db, newsletter_subscribers_db
)
from datetime import datetime
from auth import get_current_active_user, get_current_admin
from models import UserResponse

# Router yaratish - barcha endpointlarni bitta router ga to'plash
router = APIRouter()


# ============ PRODUCT ENDPOINTS ============

@router.get("/products", response_model=List[ProductResponse], tags=["Products"])
def get_products(category_id: Optional[int] = None):
    """
    Barcha mahsulotlarni olish
    
    - **category_id**: Ixtiyoriy. Faqat shu kategoriyadagi mahsulotlarni qaytaradi
    """
    return get_all_products(category_id=category_id)


@router.get("/products-paginated", response_model=PaginatedResponse, tags=["Products"])
def get_products_paginated_endpoint(
    page: int = 1,
    page_size: int = 10,
    category_id: Optional[int] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    sort_by: Optional[str] = None
):
    """
    Sahifalangan mahsulotlar ro'yxati (Pagination)
    
    - **page**: Sahifa raqami (default: 1)
    - **page_size**: Sahifadagi mahsulotlar soni (default: 10)
    - **category_id**: Kategoriya bo'yicha filtrlash
    - **min_price**: Minimal narx
    - **max_price**: Maksimal narx
    - **sort_by**: Tartiblash ("price_asc", "price_desc", "name_asc", "name_desc")
    """
    products, total = get_products_paginated(
        page=page,
        page_size=page_size,
        category_id=category_id,
        min_price=min_price,
        max_price=max_price,
        sort_by=sort_by
    )
    
    total_pages = (total + page_size - 1) // page_size
    
    return PaginatedResponse(
        items=products,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages
    )


@router.get("/products/{product_id}", response_model=ProductResponse, tags=["Products"])
def get_product_by_id(product_id: int):
    """
    Bitta mahsulotni ID bo'yicha olish
    
    - **product_id**: Mahsulot ID si
    """
    product = get_product(product_id)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Mahsulot topilmadi: {product_id}"
        )
    return product


@router.post("/products", response_model=ProductResponse, status_code=status.HTTP_201_CREATED, tags=["Products"])
def create_new_product(
    product: ProductCreate,
    current_user: UserResponse = Depends(get_current_admin)
):
    """
    Yangi mahsulot yaratish (Admin uchun)
    
    - **name**: Mahsulot nomi (majburiy)
    - **price**: Narxi (majburiy, 0 dan katta bo'lishi kerak)
    - **description**: Tavsif (ixtiyoriy)
    - **storage**: Xotira hajmi (ixtiyoriy)
    - **category_id**: Kategoriya ID (ixtiyoriy)
    - **image_url**: Rasm URL (ixtiyoriy)
    - **in_stock**: Omborida bormi (default: True)
    """
    return create_product(product)


@router.get("/products/{product_id}/detail", response_model=ProductWithReviews, tags=["Products"])
def get_product_detail(product_id: int):
    """
    Mahsulot batafsil ma'lumotlari (sharhlar bilan)
    
    - **product_id**: Mahsulot ID
    
    Qaytaradi:
    - Mahsulot ma'lumotlari
    - Barcha sharhlar
    - O'rtacha baholash
    - Jami sharhlar soni
    """
    product_detail = get_product_with_reviews(product_id)
    if not product_detail:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Mahsulot topilmadi: {product_id}"
        )
    return product_detail


@router.put("/products/{product_id}", response_model=ProductResponse, tags=["Products"])
def update_product_endpoint(
    product_id: int,
    product_update: ProductCreate,
    current_user: UserResponse = Depends(get_current_admin)
):
    """
    Mahsulotni yangilash (Admin uchun)
    
    - **product_id**: Mahsulot ID
    """
    updated = update_product(product_id, product_update.dict(exclude_unset=True))
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Mahsulot topilmadi: {product_id}"
        )
    return updated


@router.delete("/products/{product_id}", response_model=MessageResponse, tags=["Products"])
def delete_product_endpoint(
    product_id: int,
    current_user: UserResponse = Depends(get_current_admin)
):
    """
    Mahsulotni o'chirish (Admin uchun)
    
    - **product_id**: Mahsulot ID
    """
    success = delete_product(product_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Mahsulot topilmadi: {product_id}"
        )
    return MessageResponse(message="Mahsulot muvaffaqiyatli o'chirildi")


# ============ CATEGORY ENDPOINTS ============

@router.get("/categories", response_model=List[CategoryResponse], tags=["Categories"])
def get_categories():
    """
    Barcha kategoriyalarni olish
    """
    return get_all_categories()


@router.get("/categories/{category_id}", response_model=CategoryResponse, tags=["Categories"])
def get_category_by_id(category_id: int):
    """
    Bitta kategoriyani ID bo'yicha olish
    
    - **category_id**: Kategoriya ID si
    """
    category = get_category(category_id)
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Kategoriya topilmadi: {category_id}"
        )
    return category


@router.post("/categories", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED, tags=["Categories"])
def create_new_category(
    category: CategoryCreate,
    current_user: UserResponse = Depends(get_current_admin)
):
    """
    Yangi kategoriya yaratish (Admin uchun)
    
    - **name**: Kategoriya nomi (majburiy)
    - **slug**: URL uchun slug (ixtiyoriy, avtomatik yaratiladi)
    """
    return create_category(category)


@router.put("/categories/{category_id}", response_model=CategoryResponse, tags=["Categories"])
def update_category_endpoint(
    category_id: int,
    category_update: CategoryCreate,
    current_user: UserResponse = Depends(get_current_admin)
):
    """
    Kategoriyani yangilash (Admin uchun)
    
    - **category_id**: Kategoriya ID
    """
    updated = update_category(category_id, category_update.dict(exclude_unset=True))
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Kategoriya topilmadi: {category_id}"
        )
    return updated


@router.delete("/categories/{category_id}", response_model=MessageResponse, tags=["Categories"])
def delete_category_endpoint(
    category_id: int,
    current_user: UserResponse = Depends(get_current_admin)
):
    """
    Kategoriyani o'chirish (Admin uchun)
    
    - **category_id**: Kategoriya ID
    """
    success = delete_category(category_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Kategoriya topilmadi: {category_id}"
        )
    return MessageResponse(message="Kategoriya muvaffaqiyatli o'chirildi")


# ============ SEARCH ENDPOINT ============

@router.get("/search", response_model=SearchResponse, tags=["Search"])
def search_products_endpoint(query: str):
    """
    Mahsulotlarni qidirish
    
    - **query**: Qidiruv so'rovi (majburiy)
    
    Qidiruv mahsulot nomi va tavsifida amalga oshiriladi
    """
    results = search_products(query)
    return SearchResponse(
        query=query,
        results=results,
        total=len(results)
    )


# ============ CART ENDPOINTS ============

@router.get("/cart", response_model=CartResponse, tags=["Cart"])
def get_cart_items():
    """
    Savatchadagi barcha mahsulotlarni olish
    
    Jami mahsulotlar soni va jami narxni ham qaytaradi
    """
    items = get_cart()
    total_items = sum(item.quantity for item in items)
    total_price = sum(item.total_price for item in items)
    
    return CartResponse(
        items=items,
        total_items=total_items,
        total_price=total_price
    )


@router.post("/cart/add", response_model=CartItemResponse, tags=["Cart"])
def add_product_to_cart(cart_item: CartItemCreate):
    """
    Savatchaga mahsulot qo'shish
    
    - **product_id**: Mahsulot ID si (majburiy)
    - **quantity**: Miqdori (default: 1, maksimal: 10)
    
    Agar mahsulot allaqachon savatchada bo'lsa, miqdori oshiriladi
    """
    try:
        return add_to_cart(cart_item)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )


@router.put("/cart/{item_id}", response_model=CartItemResponse, tags=["Cart"])
def update_cart_item_quantity(item_id: int, quantity: int):
    """
    Savatchadagi mahsulot miqdorini yangilash
    
    - **item_id**: Savatchadagi item ID si
    - **quantity**: Yangi miqdor (1-10 oralig'ida)
    """
    if quantity < 1 or quantity > 10:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Miqdor 1-10 oralig'ida bo'lishi kerak"
        )
    
    updated_item = update_cart_item(item_id, quantity)
    if not updated_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Savatchada bunday item topilmadi: {item_id}"
        )
    return updated_item


@router.delete("/cart/{item_id}", response_model=MessageResponse, tags=["Cart"])
def delete_cart_item(item_id: int):
    """
    Savatchadan mahsulotni olib tashlash
    
    - **item_id**: Savatchadagi item ID si
    """
    success = remove_from_cart(item_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Savatchada bunday item topilmadi: {item_id}"
        )
    return MessageResponse(message="Mahsulot savatchadan olib tashlandi")


@router.delete("/cart", response_model=MessageResponse, tags=["Cart"])
def clear_cart_items():
    """
    Savatchani to'liq tozalash
    """
    clear_cart()
    return MessageResponse(message="Savatcha tozalandi")


# ============ ORDER ENDPOINTS ============

@router.post("/orders", response_model=OrderResponse, status_code=status.HTTP_201_CREATED, tags=["Orders"])
def create_new_order(
    order: OrderCreate,
    current_user: UserResponse = Depends(get_current_active_user)
):
    """
    Yangi buyurtma yaratish (Faqat autentifikatsiya qilingan foydalanuvchilar uchun)
    
    - **delivery_address_id**: Yetkazib berish manzili ID (ixtiyoriy)
    - **delivery_address**: Yetkazib berish manzili (agar manzil ID ko'rsatilmagan bo'lsa)
    - **notes**: Qo'shimcha eslatmalar (ixtiyoriy)
    
    Buyurtma yaratilgandan keyin savatcha avtomatik tozalanadi.
    Foydalanuvchi ma'lumotlari avtomatik olinadi.
    """
    # Avval savatchani tekshirish
    cart_items = get_cart()
    if not cart_items:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Savatcha bo'sh. Avval mahsulot qo'shing"
        )
    
    # Yetkazib berish manzilini tekshirish
    if not order.delivery_address_id and not order.delivery_address:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Yetkazib berish manzili ko'rsatilishi kerak"
        )
    
    return create_order(order, cart_items, current_user)


@router.get("/orders/{order_id}", response_model=OrderResponse, tags=["Orders"])
def get_order_by_id(
    order_id: int,
    current_user: UserResponse = Depends(get_current_active_user)
):
    """
    Buyurtmani ID bo'yicha olish
    
    - **order_id**: Buyurtma ID si
    
    Foydalanuvchi faqat o'z buyurtmalarini ko'radi.
    Admin barcha buyurtmalarni ko'radi.
    """
    order = get_order(order_id)
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Buyurtma topilmadi: {order_id}"
        )
    
    # Foydalanuvchi faqat o'z buyurtmalarini ko'rishi mumkin
    from models import UserRole
    if current_user.role != UserRole.ADMIN and order.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bu buyurtmaga kirish huquqingiz yo'q"
        )
    
    return order


@router.get("/orders", response_model=List[OrderResponse], tags=["Orders"])
def get_all_orders_endpoint(
    phone: Optional[str] = None,
    email: Optional[str] = None,
    current_user: UserResponse = Depends(get_current_active_user)
):
    """
    Buyurtmalarni olish
    
    - **phone**: Telefon raqami bo'yicha filtrlash (ixtiyoriy)
    - **email**: Email bo'yicha filtrlash (ixtiyoriy)
    
    Oddiy foydalanuvchilar faqat o'z buyurtmalarini ko'radi.
    Admin barcha buyurtmalarni ko'radi.
    """
    # Agar admin bo'lsa, barcha buyurtmalarni ko'rsatish
    from models import UserRole
    if current_user.role == UserRole.ADMIN:
        if phone:
            return get_orders_by_phone(phone)
        elif email:
            return get_orders_by_email(email)
        else:
            return get_all_orders()
    else:
        # Oddiy foydalanuvchi faqat o'z buyurtmalarini ko'radi
        return get_orders_by_phone(current_user.phone)


# ============ FORM ENDPOINTS ============

@router.post("/callbacks", response_model=MessageResponse, status_code=status.HTTP_201_CREATED, tags=["Forms"])
def submit_callback(callback: CallbackRequest):
    """
    Qayta qo'ng'iroq qilish so'rovi yuborish
    
    - **name**: Ism (majburiy)
    - **phone**: Telefon raqami (majburiy)
    """
    callback_data = {
        "name": callback.name,
        "phone": callback.phone,
        "submitted_at": datetime.now().isoformat()
    }
    callbacks_db.append(callback_data)
    
    return MessageResponse(
        message="So'rovingiz qabul qilindi. Tez orada sizga qo'ng'iroq qilamiz!",
        success=True
    )


@router.post("/credit-applications", response_model=MessageResponse, status_code=status.HTTP_201_CREATED, tags=["Forms"])
def submit_credit_application(application: CreditApplication):
    """
    Kredit arizasi yuborish
    
    - **name**: Ism (majburiy)
    - **phone**: Telefon raqami (majburiy)
    - **email**: Email (ixtiyoriy)
    - **monthly_income**: Oylik daromad (ixtiyoriy)
    - **desired_product_id**: Kerakli mahsulot ID (ixtiyoriy)
    - **notes**: Qo'shimcha ma'lumotlar (ixtiyoriy)
    """
    application_data = {
        **application.dict(),
        "submitted_at": datetime.now().isoformat()
    }
    credit_applications_db.append(application_data)
    
    return MessageResponse(
        message="Kredit arizangiz qabul qilindi. Menejerlarimiz tez orada siz bilan bog'lanishadi!",
        success=True
    )


@router.post("/trade-in-requests", response_model=MessageResponse, status_code=status.HTTP_201_CREATED, tags=["Forms"])
def submit_trade_in_request(request: TradeInRequest):
    """
    Trade-in (eski telefon almashtirish) so'rovi yuborish
    
    - **name**: Ism (majburiy)
    - **phone**: Telefon raqami (majburiy)
    - **old_device_brand**: Eski qurilma brendi (ixtiyoriy)
    - **old_device_model**: Eski qurilma modeli (ixtiyoriy)
    - **old_device_condition**: Holati (ixtiyoriy)
    - **desired_product_id**: Kerakli yangi mahsulot ID (ixtiyoriy)
    """
    request_data = {
        **request.dict(),
        "submitted_at": datetime.now().isoformat()
    }
    trade_in_requests_db.append(request_data)
    
    return MessageResponse(
        message="Trade-in so'rovingiz qabul qilindi. Eski qurilmaning narxini baholash uchun siz bilan bog'lanamiz!",
        success=True
    )


@router.post("/price-match-requests", response_model=MessageResponse, status_code=status.HTTP_201_CREATED, tags=["Forms"])
def submit_price_match_request(request: PriceMatchRequest):
    """
    Narx solishtirish so'rovi yuborish
    
    - **name**: Ism (majburiy)
    - **phone**: Telefon raqami (majburiy)
    - **product_id**: Mahsulot ID (majburiy)
    - **competitor_price**: Raqib narxi (majburiy)
    - **competitor_url**: Raqib sayt URL (ixtiyoriy)
    """
    # Mahsulot mavjudligini tekshirish
    product = get_product(request.product_id)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Mahsulot topilmadi: {request.product_id}"
        )
    
    request_data = {
        **request.dict(),
        "our_price": product.price,
        "submitted_at": datetime.now().isoformat()
    }
    price_match_requests_db.append(request_data)
    
    return MessageResponse(
        message="Narx solishtirish so'rovingiz qabul qilindi. Tez orada javob beramiz!",
        success=True
    )


@router.post("/newsletter/subscribe", response_model=MessageResponse, status_code=status.HTTP_201_CREATED, tags=["Forms"])
def subscribe_newsletter(subscription: NewsletterSubscribe):
    """
    Newsletter ga obuna bo'lish
    
    - **email**: Email manzil (majburiy)
    
    Agar email allaqachon ro'yxatda bo'lsa, xabar qaytariladi
    """
    # Duplicate tekshirish
    if any(sub["email"] == subscription.email for sub in newsletter_subscribers_db):
        return MessageResponse(
            message="Bu email allaqachon ro'yxatda!",
            success=True
        )
    
    subscription_data = {
        "email": subscription.email,
        "subscribed_at": datetime.now().isoformat()
    }
    newsletter_subscribers_db.append(subscription_data)
    
    return MessageResponse(
        message="Newsletter ga muvaffaqiyatli obuna bo'ldingiz!",
        success=True
    )


# ============ REVIEW/RATING ENDPOINTS ============

@router.post("/reviews", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED, tags=["Reviews"])
def create_product_review(review: ReviewCreate):
    """
    Mahsulotga sharh yozish
    
    - **product_id**: Mahsulot ID (majburiy)
    - **customer_name**: Mijoz ismi (majburiy)
    - **rating**: Baholash 1-5 oralig'ida (majburiy)
    - **comment**: Sharh matni (ixtiyoriy)
    """
    try:
        return create_review(review)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )


@router.get("/products/{product_id}/reviews", response_model=List[ReviewResponse], tags=["Reviews"])
def get_reviews_for_product(product_id: int):
    """
    Mahsulot sharhlarini olish
    
    - **product_id**: Mahsulot ID
    """
    product = get_product(product_id)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Mahsulot topilmadi: {product_id}"
        )
    return get_product_reviews(product_id)


@router.get("/reviews", response_model=List[ReviewResponse], tags=["Reviews"])
def get_all_reviews_endpoint():
    """
    Barcha sharhlarni olish
    """
    return get_all_reviews()


# ============ WISHLIST ENDPOINTS ============

@router.get("/wishlist", response_model=WishlistResponse, tags=["Wishlist"])
def get_wishlist_items():
    """
    Wishlist dagi barcha mahsulotlarni olish
    """
    items = get_wishlist()
    return WishlistResponse(
        items=items,
        total_items=len(items)
    )


@router.post("/wishlist/add/{product_id}", response_model=WishlistItemResponse, tags=["Wishlist"])
def add_product_to_wishlist(product_id: int):
    """
    Wishlist ga mahsulot qo'shish
    
    - **product_id**: Mahsulot ID
    """
    try:
        return add_to_wishlist(product_id)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )


@router.delete("/wishlist/remove/{product_id}", response_model=MessageResponse, tags=["Wishlist"])
def remove_product_from_wishlist(product_id: int):
    """
    Wishlist dan mahsulotni olib tashlash
    
    - **product_id**: Mahsulot ID
    """
    success = remove_from_wishlist(product_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Wishlist da bunday mahsulot topilmadi: {product_id}"
        )
    return MessageResponse(message="Mahsulot wishlist dan olib tashlandi")


# ============ ORDER STATUS UPDATE ============

@router.put("/orders/{order_id}/status", response_model=OrderResponse, tags=["Orders"])
def update_order_status_endpoint(
    order_id: int,
    status_update: OrderStatusUpdate,
    current_user: UserResponse = Depends(get_current_admin)
):
    """
    Buyurtma holatini yangilash (Admin uchun)
    
    - **order_id**: Buyurtma ID
    - **status**: Yangi holat (pending, confirmed, processing, shipped, delivered, cancelled)
    """
    updated_order = update_order_status(order_id, status_update.status)
    if not updated_order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Buyurtma topilmadi: {order_id}"
        )
    return updated_order


# ============ STATISTICS ENDPOINT ============

@router.get("/statistics", response_model=StatisticsResponse, tags=["Statistics"])
def get_statistics_endpoint(
    current_user: UserResponse = Depends(get_current_admin)
):
    """
    Umumiy statistikalar (Admin uchun)
    
    Qaytaradi:
    - Jami mahsulotlar soni
    - Jami kategoriyalar soni
    - Jami buyurtmalar soni
    - Jami daromad
    - Kutilayotgan buyurtmalar
    - Tugallangan buyurtmalar
    - O'rtacha buyurtma summasi
    """
    return get_statistics()


# ============ RELATED PRODUCTS ENDPOINT ============

@router.get("/products/{product_id}/related", response_model=RelatedProductsResponse, tags=["Products"])
def get_related_products_endpoint(product_id: int, limit: int = 4):
    """
    O'xshash mahsulotlarni olish
    
    - **product_id**: Mahsulot ID
    - **limit**: Qaytariladigan mahsulotlar soni (default: 4)
    
    Bir xil kategoriyadagi boshqa mahsulotlarni qaytaradi
    """
    product = get_product(product_id)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Mahsulot topilmadi: {product_id}"
        )
    
    related = get_related_products(product_id, limit)
    return RelatedProductsResponse(
        product_id=product_id,
        related_products=related
    )
