"""
Ma'lumotlar bazasi xizmati
Hozircha in-memory (xotirada) saqlanadi, keyinroq haqiqiy database ga o'zgartirish mumkin
"""
from typing import Dict, List, Optional
from datetime import datetime, timedelta
from models import (
    ProductCreate, ProductResponse, CategoryCreate, CategoryResponse,
    CartItemCreate, CartItemResponse, OrderCreate, OrderResponse, OrderStatus,
    ReviewCreate, ReviewResponse, WishlistItemResponse, StatisticsResponse,
    VideoCreate, VideoResponse,
    UserCreate, UserResponse, UserRole, DeliveryAddressCreate, DeliveryAddressResponse,
    OneClickBuyRequest, CompareProductsResponse
)
import hashlib
import random
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# ============ IN-MEMORY DATABASES ============
# Haqiqiy loyihada SQLAlchemy, PostgreSQL, MySQL yoki MongoDB ishlatiladi

# Products database
products_db: Dict[int, dict] = {}
products_counter = 0

# Categories database
categories_db: Dict[int, dict] = {}
categories_counter = 0

# Cart database (session-based, haqiqiy loyihada user_id bilan bog'lash kerak)
cart_db: Dict[int, dict] = {}  # cart_item_id -> cart_item_data
cart_counter = 0

# Orders database
orders_db: Dict[int, dict] = {}
orders_counter = 0

# Form submissions database
callbacks_db: List[dict] = []
credit_applications_db: List[dict] = []
trade_in_requests_db: List[dict] = []
price_match_requests_db: List[dict] = []
newsletter_subscribers_db: List[dict] = []

# Reviews database
reviews_db: Dict[int, dict] = {}  # review_id -> review_data
reviews_counter = 0

# Wishlist database
wishlist_db: Dict[int, dict] = {}  # wishlist_item_id -> wishlist_item_data
wishlist_counter = 0

# Users database
users_db: Dict[int, dict] = {}  # user_id -> user_data
users_counter = 0

# Verification codes database (phone -> code, expires_at)
verification_codes_db: Dict[str, dict] = {}  # phone -> {code, expires_at, user_id}

# Delivery addresses database
delivery_addresses_db: Dict[int, dict] = {}  # address_id -> address_data
delivery_addresses_counter = 0

# Videos database
videos_db: Dict[int, dict] = {}
videos_counter = 0


# ============ PRODUCT FUNCTIONS ============
def create_product(product: ProductCreate) -> ProductResponse:
    """Yangi mahsulot yaratish"""
    global products_counter
    products_counter += 1
    
    product_data = {
        "id": products_counter,
        "name": product.name,
        "description": product.description,
        "price": product.price,
        "storage": product.storage,
        "category_id": product.category_id,
        "image_url": product.image_url,
        "in_stock": product.in_stock,
        "created_at": datetime.now()
    }
    
    products_db[products_counter] = product_data
    return ProductResponse(**product_data)


def get_product(product_id: int) -> Optional[ProductResponse]:
    """Mahsulotni ID bo'yicha olish"""
    product = products_db.get(product_id)
    if product:
        return ProductResponse(**product)
    return None


def get_all_products(category_id: Optional[int] = None) -> List[ProductResponse]:
    """Barcha mahsulotlarni olish (kategoriya bo'yicha filtrlash mumkin)"""
    products = list(products_db.values())
    
    if category_id:
        products = [p for p in products if p.get("category_id") == category_id]
    
    return [ProductResponse(**p) for p in products]


def search_products(query: str) -> List[ProductResponse]:
    """Mahsulotlarni qidirish"""
    query_lower = query.lower()
    results = []
    
    for product in products_db.values():
        # Nom, tavsif yoki boshqa maydonlarda qidirish
        if (query_lower in product["name"].lower() or 
            (product["description"] and query_lower in product["description"].lower())):
            results.append(ProductResponse(**product))
    
    return results


# ============ CATEGORY FUNCTIONS ============
def create_category(category: CategoryCreate) -> CategoryResponse:
    """Yangi kategoriya yaratish"""
    global categories_counter
    categories_counter += 1
    
    category_data = {
        "id": categories_counter,
        "name": category.name,
        "slug": category.slug or category.name.lower().replace(" ", "-")
    }
    
    categories_db[categories_counter] = category_data
    return CategoryResponse(**category_data)


def get_category(category_id: int) -> Optional[CategoryResponse]:
    """Kategoriyani ID bo'yicha olish"""
    category = categories_db.get(category_id)
    if category:
        return CategoryResponse(**category)
    return None


def get_all_categories() -> List[CategoryResponse]:
    """Barcha kategoriyalarni olish"""
    return [CategoryResponse(**c) for c in categories_db.values()]


# ============ CART FUNCTIONS ============
def add_to_cart(cart_item: CartItemCreate) -> CartItemResponse:
    """Savatchaga mahsulot qo'shish"""
    global cart_counter
    
    # Mahsulot ma'lumotlarini olish
    product = get_product(cart_item.product_id)
    if not product:
        raise ValueError(f"Mahsulot topilmadi: {cart_item.product_id}")
    
    # Agar bu mahsulot allaqachon savatchada bo'lsa, miqdorini oshirish
    existing_item = None
    for item_id, item_data in cart_db.items():
        if item_data["product_id"] == cart_item.product_id:
            existing_item = item_id
            break
    
    if existing_item:
        # Miqdorni yangilash
        cart_db[existing_item]["quantity"] += cart_item.quantity
        item_data = cart_db[existing_item]
    else:
        # Yangi item qo'shish
        cart_counter += 1
        item_data = {
            "id": cart_counter,
            "product_id": cart_item.product_id,
            "product_name": product.name,
            "product_price": product.price,
            "product_image": product.image_url,
            "quantity": cart_item.quantity,
            "total_price": product.price * cart_item.quantity
        }
        cart_db[cart_counter] = item_data
    
    return CartItemResponse(**item_data)


def get_cart() -> List[CartItemResponse]:
    """Savatchadagi barcha mahsulotlarni olish"""
    return [CartItemResponse(**item) for item in cart_db.values()]


def update_cart_item(item_id: int, quantity: int) -> Optional[CartItemResponse]:
    """Savatchadagi mahsulot miqdorini yangilash"""
    if item_id not in cart_db:
        return None
    
    item_data = cart_db[item_id]
    item_data["quantity"] = quantity
    item_data["total_price"] = item_data["product_price"] * quantity
    
    return CartItemResponse(**item_data)


def remove_from_cart(item_id: int) -> bool:
    """Savatchadan mahsulotni olib tashlash"""
    if item_id in cart_db:
        del cart_db[item_id]
        return True
    return False


def clear_cart():
    """Savatchani tozalash"""
    global cart_db
    cart_db = {}


# ============ ORDER FUNCTIONS ============
def create_order(order: OrderCreate, cart_items: List[CartItemResponse], user: UserResponse) -> OrderResponse:
    """Yangi buyurtma yaratish"""
    global orders_counter
    orders_counter += 1
    
    # Jami narxni hisoblash
    total_price = sum(item.total_price for item in cart_items)
    
    # Yetkazib berish manzilini olish
    delivery_address_text = order.delivery_address
    if order.delivery_address_id:
        address = get_default_delivery_address(user.id)
        if address:
            delivery_address_text = f"{address.address}, {address.city}"
    
    order_data = {
        "id": orders_counter,
        "user_id": user.id,
        "customer_name": user.full_name,
        "customer_phone": user.phone,
        "customer_email": user.email,
        "delivery_address": delivery_address_text,
        "delivery_address_id": order.delivery_address_id,
        "status": OrderStatus.PENDING,
        "total_price": total_price,
        "items": [item.dict() for item in cart_items],
        "notes": order.notes,
        "created_at": datetime.now()
    }
    
    orders_db[orders_counter] = order_data
    
    # Buyurtma yaratilgandan keyin savatni tozalash
    clear_cart()
    
    return OrderResponse(**order_data)


def create_one_click_order(request: OneClickBuyRequest) -> OrderResponse:
    """1-click buy - bir bosishda sotib olish (savatga qo'shmasdan)"""
    global orders_counter
    orders_counter += 1
    
    # Mahsulotni tekshirish
    product = get_product(request.product_id)
    if not product:
        raise ValueError(f"Mahsulot topilmadi: {request.product_id}")
    
    if not product.in_stock:
        raise ValueError(f"Mahsulot omborda yo'q: {product.name}")
    
    # Jami narxni hisoblash
    total_price = product.price * request.quantity
    
    # Cart item yaratish (buyurtma uchun)
    cart_item = CartItemResponse(
        id=1,
        product_id=product.id,
        product_name=product.name,
        product_price=product.price,
        product_image=product.image_url,
        quantity=request.quantity,
        total_price=total_price
    )
    
    order_data = {
        "id": orders_counter,
        "user_id": None,  # 1-click buy da foydalanuvchi ro'yxatdan o'tmagan bo'lishi mumkin
        "customer_name": request.name,
        "customer_phone": request.phone,
        "customer_email": None,
        "delivery_address": request.delivery_address,
        "delivery_address_id": None,
        "status": OrderStatus.PENDING,
        "total_price": total_price,
        "items": [cart_item.dict()],
        "notes": request.notes,
        "created_at": datetime.now()
    }
    
    orders_db[orders_counter] = order_data
    
    return OrderResponse(**order_data)


def get_order(order_id: int) -> Optional[OrderResponse]:
    """Buyurtmani ID bo'yicha olish"""
    order = orders_db.get(order_id)
    if order:
        # items ni CartItemResponse ga konvertatsiya qilish
        order["items"] = [CartItemResponse(**item) for item in order["items"]]
        # user_id va delivery_address ni qo'shish (agar yo'q bo'lsa)
        if "user_id" not in order:
            order["user_id"] = None
        if "delivery_address" not in order:
            order["delivery_address"] = None
        if "notes" not in order:
            order["notes"] = None
        return OrderResponse(**order)
    return None


def get_all_orders() -> List[OrderResponse]:
    """Barcha buyurtmalarni olish"""
    orders = []
    for order_data in orders_db.values():
        order_data["items"] = [CartItemResponse(**item) for item in order_data["items"]]
        # user_id va delivery_address ni qo'shish (agar yo'q bo'lsa)
        if "user_id" not in order_data:
            order_data["user_id"] = None
        if "delivery_address" not in order_data:
            order_data["delivery_address"] = None
        if "notes" not in order_data:
            order_data["notes"] = None
        orders.append(OrderResponse(**order_data))
    return orders


# ============ INITIAL DATA (Dummy data for testing) ============
def initialize_sample_data():
    """Namuna ma'lumotlar bilan to'ldirish (test uchun)"""
    # Admin foydalanuvchi yaratish
    try:
        admin_user = create_user(
            UserCreate(
                username="admin",
                email="admin@phoneshop.uz",
                phone="+998901234567",
                password="admin123",
                full_name="Admin User"
            ),
            role=UserRole.ADMIN
        )
        # Admin ni tasdiqlash
        users_db[admin_user.id]["is_verified"] = True
        print(f"✅ Admin foydalanuvchi yaratildi: {admin_user.username} (ID: {admin_user.id})")
    except ValueError:
        print("ℹ️  Admin foydalanuvchi allaqachon mavjud")
    
    # Kategoriyalar yaratish
    category1 = create_category(CategoryCreate(name="iPhone", slug="iphone"))
    category2 = create_category(CategoryCreate(name="Samsung", slug="samsung"))
    
    # Mahsulotlar yaratish
    create_product(ProductCreate(
        name="iPhone 14",
        description="Eng yangi iPhone modeli",
        price=719900.0,
        storage="128 GB",
        category_id=category1.id,
        image_url="https://appsource.ru/upload/iblock/192/2ko4otz5ktybh07uo71t27tsf8e079n0.jpg",
        in_stock=True
    ))
    
    create_product(ProductCreate(
        name="iPhone 14 Pro Max",
        description="Pro Max versiyasi, kuchli protsessor va katta ekran",
        price=1200000.0,
        storage="256 GB",
        category_id=category1.id,
        image_url="https://asset.openshop.uz/storage/uploads/products/photos/202210/xx15zjHFUby9NXWJGquU61lyjFgc2MWc7s8Z55ck.jpg",
        in_stock=True
    ))
    
    create_product(ProductCreate(
        name="Samsung Galaxy S23",
        description="Eng yangi Samsung flagship",
        price=899900.0,
        storage="256 GB",
        category_id=category2.id,
        image_url="https://images.samsung.com/is/image/samsung/p6pim/levant/2302/gallery/levant-sm-s911b-sm-s911bzdxme-535923677?$720_576_PNG$",
        in_stock=True
    ))
    
    create_product(ProductCreate(
        name="Samsung Galaxy S23 Ultra",
        description="Ultra versiyasi, S Pen bilan",
        price=1499000.0,
        storage="512 GB",
        category_id=category2.id,
        image_url="https://images.samsung.com/is/image/samsung/p6pim/levant/2302/gallery/levant-sm-s918b-sm-s918bzdxme-535923674?$720_576_PNG$",
        in_stock=True
    ))
    
    # Yangi mahsulotlar qo'shish
    create_product(ProductCreate(
        name="iPhone 13",
        description="iPhone 13 - A15 Bionic chip, 5G support",
        price=629900.0,
        storage="128 GB",
        category_id=category1.id,
        image_url="https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-13-finish-select-202203-blue?wid=3200&hei=1800&fmt=jpeg&qlt=95&.v=1646083216900",
        in_stock=True
    ))
    
    create_product(ProductCreate(
        name="iPhone 15 Pro",
        description="iPhone 15 Pro - Titanium design, A17 Pro chip",
        price=1399000.0,
        storage="256 GB",
        category_id=category1.id,
        image_url="https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-pro-finish-select-202309-6-1inch-naturaltitanium?wid=3200&hei=1800&fmt=jpeg&qlt=95&.v=1693016289892",
        in_stock=True
    ))
    
    create_product(ProductCreate(
        name="Samsung Galaxy S24",
        description="Samsung Galaxy S24 - AI features, powerful performance",
        price=979900.0,
        storage="256 GB",
        category_id=category2.id,
        image_url="https://images.samsung.com/is/image/samsung/p6pim/levant/2401/gallery/levant-sm-s921-sm-s921bzdxme-539928282?$720_576_PNG$",
        in_stock=True
    ))
    
    create_product(ProductCreate(
        name="Samsung Galaxy S24 Ultra",
        description="Samsung Galaxy S24 Ultra - S Pen, AI camera, premium design",
        price=1699000.0,
        storage="512 GB",
        category_id=category2.id,
        image_url="https://images.samsung.com/is/image/samsung/p6pim/levant/2401/gallery/levant-sm-s928-sm-s928bzdxme-539928285?$720_576_PNG$",
        in_stock=True
    ))
    
    create_product(ProductCreate(
        name="iPhone 15 Pro Max",
        description="iPhone 15 Pro Max - Largest display, best camera system",
        price=1599000.0,
        storage="256 GB",
        category_id=category1.id,
        image_url="https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-pro-max-finish-select-202309-6-7inch-naturaltitanium?wid=3200&hei=1800&fmt=jpeg&qlt=95&.v=1693016292398",
        in_stock=True
    ))
    
    print("✅ Namuna ma'lumotlar bilan to'ldirildi")
    
    # return None


# ============ REVIEW FUNCTIONS ============
def create_review(review: ReviewCreate) -> ReviewResponse:
    """Yangi sharh yaratish"""
    global reviews_counter
    reviews_counter += 1
    
    # Mahsulot mavjudligini tekshirish
    product = get_product(review.product_id)
    if not product:
        raise ValueError(f"Mahsulot topilmadi: {review.product_id}")
    
    review_data = {
        "id": reviews_counter,
        "product_id": review.product_id,
        "customer_name": review.customer_name,
        "rating": review.rating,
        "comment": review.comment,
        "created_at": datetime.now()
    }
    
    reviews_db[reviews_counter] = review_data
    return ReviewResponse(**review_data)


def get_product_reviews(product_id: int) -> List[ReviewResponse]:
    """Mahsulot sharhlarini olish"""
    reviews = [r for r in reviews_db.values() if r["product_id"] == product_id]
    return [ReviewResponse(**r) for r in reviews]


def get_all_reviews() -> List[ReviewResponse]:
    """Barcha sharhlarni olish"""
    return [ReviewResponse(**r) for r in reviews_db.values()]


# ============ WISHLIST FUNCTIONS ============
def add_to_wishlist(product_id: int) -> WishlistItemResponse:
    """Wishlist ga mahsulot qo'shish"""
    global wishlist_counter
    
    # Mahsulot mavjudligini tekshirish
    product = get_product(product_id)
    if not product:
        raise ValueError(f"Mahsulot topilmadi: {product_id}")
    
    # Agar allaqachon wishlist da bo'lsa
    for item_id, item_data in wishlist_db.items():
        if item_data["product_id"] == product_id:
            # ProductResponse ga konvertatsiya
            stored_product = ProductResponse(**item_data["product"])
            return WishlistItemResponse(
                id=item_data["id"],
                product_id=item_data["product_id"],
                product=stored_product,
                added_at=item_data["added_at"]
            )
    
    # Yangi item qo'shish
    wishlist_counter += 1
    item_data = {
        "id": wishlist_counter,
        "product_id": product_id,
        "product": product.dict(),
        "added_at": datetime.now()
    }
    wishlist_db[wishlist_counter] = item_data
    
    return WishlistItemResponse(
        id=wishlist_counter,
        product_id=product_id,
        product=product,
        added_at=item_data["added_at"]
    )


def get_wishlist() -> List[WishlistItemResponse]:
    """Wishlist dagi barcha mahsulotlarni olish"""
    items = []
    for item_data in wishlist_db.values():
        product = ProductResponse(**item_data["product"])
        item = WishlistItemResponse(
            id=item_data["id"],
            product_id=item_data["product_id"],
            product=product,
            added_at=item_data["added_at"]
        )
        items.append(item)
    return items


def remove_from_wishlist(product_id: int) -> bool:
    """Wishlist dan mahsulotni olib tashlash"""
    for item_id, item_data in list(wishlist_db.items()):
        if item_data["product_id"] == product_id:
            del wishlist_db[item_id]
            return True
    return False


# ============ PAGINATION FUNCTIONS ============
def get_products_paginated(
    page: int = 1,
    page_size: int = 10,
    category_id: Optional[int] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    sort_by: Optional[str] = None  # "price_asc", "price_desc", "name_asc", "name_desc"
) -> tuple[List[ProductResponse], int]:
    """Sahifalangan mahsulotlar ro'yxati"""
    products = get_all_products(category_id=category_id)
    
    # Narx bo'yicha filtrlash
    if min_price:
        products = [p for p in products if p.price >= min_price]
    if max_price:
        products = [p for p in products if p.price <= max_price]
    
    # Sortlash
    if sort_by == "price_asc":
        products = sorted(products, key=lambda x: x.price)
    elif sort_by == "price_desc":
        products = sorted(products, key=lambda x: x.price, reverse=True)
    elif sort_by == "name_asc":
        products = sorted(products, key=lambda x: x.name)
    elif sort_by == "name_desc":
        products = sorted(products, key=lambda x: x.name, reverse=True)
    
    # Pagination
    total = len(products)
    start = (page - 1) * page_size
    end = start + page_size
    paginated_products = products[start:end]
    
    return paginated_products, total


# ============ ORDER STATUS UPDATE ============
def update_order_status(order_id: int, new_status: OrderStatus) -> Optional[OrderResponse]:
    """Buyurtma holatini yangilash"""
    if order_id not in orders_db:
        return None
    
    orders_db[order_id]["status"] = new_status
    order = orders_db[order_id]
    order["items"] = [CartItemResponse(**item) for item in order["items"]]
    return OrderResponse(**order)


# ============ STATISTICS FUNCTIONS ============
def get_statistics() -> StatisticsResponse:
    """Statistikalar"""
    total_products = len(products_db)
    total_categories = len(categories_db)
    total_orders = len(orders_db)
    
    # Jami daromad
    total_revenue = sum(order["total_price"] for order in orders_db.values() 
                       if order["status"] == OrderStatus.DELIVERED)
    
    # Holat bo'yicha buyurtmalar
    pending_orders = sum(1 for order in orders_db.values() 
                         if order["status"] == OrderStatus.PENDING)
    completed_orders = sum(1 for order in orders_db.values() 
                           if order["status"] == OrderStatus.DELIVERED)
    
    # O'rtacha buyurtma summasi
    if total_orders > 0:
        all_order_prices = [order["total_price"] for order in orders_db.values()]
        average_order_value = sum(all_order_prices) / total_orders
    else:
        average_order_value = None
    
    return StatisticsResponse(
        total_products=total_products,
        total_categories=total_categories,
        total_orders=total_orders,
        total_revenue=total_revenue,
        pending_orders=pending_orders,
        completed_orders=completed_orders,
        average_order_value=average_order_value
    )


# ============ RELATED PRODUCTS FUNCTIONS ============
def get_related_products(product_id: int, limit: int = 4) -> List[ProductResponse]:
    """O'xshash mahsulotlarni olish (bir xil kategoriyadagi)"""
    product = get_product(product_id)
    if not product:
        return []
    
    # Bir xil kategoriyadagi boshqa mahsulotlar
    related = [
        p for p in products_db.values()
        if p.get("category_id") == product.category_id and p["id"] != product_id
    ]
    
    # Limit qo'yish
    related = related[:limit]
    return [ProductResponse(**p) for p in related]


def compare_products(product_ids: List[int]) -> List[ProductResponse]:
    """Mahsulotlarni solishtirish"""
    compared_products = []
    for product_id in product_ids:
        product = get_product(product_id)
        if product:
            compared_products.append(product)
    return compared_products


# ============ VIDEO FUNCTIONS ============
def create_video(video: VideoCreate) -> VideoResponse:
    """Yangi video yaratish (mahsulotga bog'lash mumkin)"""
    global videos_counter
    videos_counter += 1

    video_data = {
        "id": videos_counter,
        "product_id": video.product_id,
        "title": video.title,
        "description": video.description,
        "url": video.url,
        "thumbnail_url": video.thumbnail_url,
        "duration": video.duration,
        "created_at": datetime.now()
    }

    videos_db[videos_counter] = video_data
    return VideoResponse(**video_data)


def get_video(video_id: int) -> Optional[VideoResponse]:
    """Video ni ID bo'yicha olish"""
    v = videos_db.get(video_id)
    if v:
        return VideoResponse(**v)
    return None


def get_videos_by_product(product_id: int) -> List[VideoResponse]:
    """Berilgan mahsulotga tegishli videolarni olish"""
    vids = [VideoResponse(**v) for v in videos_db.values() if v.get("product_id") == product_id]
    return vids


def get_all_videos() -> List[VideoResponse]:
    """Barcha videolarni olish"""
    return [VideoResponse(**v) for v in videos_db.values()]


def delete_video(video_id: int) -> bool:
    """Videoni o'chirish"""
    if video_id in videos_db:
        del videos_db[video_id]
        return True
    return False


def get_product_with_reviews(product_id: int):
    """Mahsulot + sharhlar + o'rtacha baholash"""
    from models import ProductWithReviews
    
    product = get_product(product_id)
    if not product:
        return None
    
    reviews = get_product_reviews(product_id)
    
    # O'rtacha baholashni hisoblash
    if reviews:
        average_rating = sum(r.rating for r in reviews) / len(reviews)
    else:
        average_rating = None
    
    return ProductWithReviews(
        **product.dict(),
        reviews=reviews,
        average_rating=average_rating,
        total_reviews=len(reviews)
    )


def update_product(product_id: int, product_update: dict) -> Optional[ProductResponse]:
    """Mahsulotni yangilash"""
    if product_id not in products_db:
        return None
    
    # Yangilash
    for key, value in product_update.items():
        if value is not None:
            products_db[product_id][key] = value
    
    return ProductResponse(**products_db[product_id])


def delete_product(product_id: int) -> bool:
    """Mahsulotni o'chirish"""
    if product_id in products_db:
        del products_db[product_id]
        return True
    return False


def update_category(category_id: int, category_update: dict) -> Optional[CategoryResponse]:
    """Kategoriyani yangilash"""
    if category_id not in categories_db:
        return None
    
    for key, value in category_update.items():
        if value is not None:
            categories_db[category_id][key] = value
    
    return CategoryResponse(**categories_db[category_id])


def delete_category(category_id: int) -> bool:
    """Kategoriyani o'chirish"""
    if category_id in categories_db:
        del categories_db[category_id]
        return True
    return False


def get_orders_by_phone(phone: str) -> List[OrderResponse]:
    """Telefon raqami bo'yicha buyurtmalarni olish"""
    orders = []
    for order_data in orders_db.values():
        if order_data.get("customer_phone") == phone:
            order_data["items"] = [CartItemResponse(**item) for item in order_data["items"]]
            if "user_id" not in order_data:
                order_data["user_id"] = None
            if "delivery_address" not in order_data:
                order_data["delivery_address"] = None
            if "notes" not in order_data:
                order_data["notes"] = None
            orders.append(OrderResponse(**order_data))
    return orders


def get_orders_by_email(email: str) -> List[OrderResponse]:
    """Email bo'yicha buyurtmalarni olish"""
    orders = []
    for order_data in orders_db.values():
        if order_data.get("customer_email") == email:
            order_data["items"] = [CartItemResponse(**item) for item in order_data["items"]]
            if "user_id" not in order_data:
                order_data["user_id"] = None
            if "delivery_address" not in order_data:
                order_data["delivery_address"] = None
            if "notes" not in order_data:
                order_data["notes"] = None
            orders.append(OrderResponse(**order_data))
    return orders


# ============ USER FUNCTIONS ============
def hash_password(password: str) -> str:
    """Parolni hash qilish"""
    return hashlib.sha256(password.encode()).hexdigest()


def verify_password(password: str, hashed: str) -> bool:
    """Parolni tekshirish"""
    return hash_password(password) == hashed


def create_user(user: UserCreate, role: UserRole = UserRole.USER) -> UserResponse:
    """Yangi foydalanuvchi yaratish"""
    global users_counter
    users_counter += 1
    
    # Email yoki username takrorlanmasligini tekshirish
    for existing_user in users_db.values():
        if existing_user["email"] == user.email:
            raise ValueError("Bu email allaqachon ro'yxatdan o'tgan")
        if existing_user["username"] == user.username:
            raise ValueError("Bu username allaqachon band")
    
    user_data = {
        "id": users_counter,
        "username": user.username,
        "email": user.email,
        "phone": user.phone,  # Telefon raqami majburiy
        "full_name": user.full_name,
        "password_hash": hash_password(user.password),
        "role": role,
        "is_verified": True,  # SMS tasdiqlash kerak
        "created_at": datetime.now()
    }
    
    users_db[users_counter] = user_data
    return UserResponse(**user_data)


def get_user_by_email(email: str) -> Optional[UserResponse]:
    """Email bo'yicha foydalanuvchini olish"""
    for user_data in users_db.values():
        if user_data["email"] == email:
            return UserResponse(**user_data)
    return None


def get_user_by_username(username: str) -> Optional[UserResponse]:
    """Username bo'yicha foydalanuvchini olish"""
    for user_data in users_db.values():
        if user_data["username"] == username:
            return UserResponse(**user_data)
    return None


def get_user_by_id(user_id: int) -> Optional[UserResponse]:
    """ID bo'yicha foydalanuvchini olish"""
    user_data = users_db.get(user_id)
    if user_data:
        return UserResponse(**user_data)
    return None


def get_user_by_phone(phone: str) -> Optional[UserResponse]:
    """Telefon raqami bo'yicha foydalanuvchini olish"""
    for user_data in users_db.values():
        if user_data["phone"] == phone:
            return UserResponse(**user_data)
    return None


def authenticate_user(username_or_email: str, password: str) -> Optional[UserResponse]:
    """Foydalanuvchini autentifikatsiya qilish"""
    # Email yoki username bo'yicha qidirish
    user_data = None
    for u in users_db.values():
        if u["email"] == username_or_email or u["username"] == username_or_email:
            user_data = u
            break
    
    if not user_data:
        return None
    
    # Parolni tekshirish
    if verify_password(password, user_data["password_hash"]):
        return UserResponse(**user_data)
    return None


def verify_user_phone(phone: str, code: str) -> Optional[UserResponse]:
    """Telefon raqamini tasdiqlash"""
    if phone not in verification_codes_db:
        return None
    
    verification_data = verification_codes_db[phone]
    
    # Kodni tekshirish
    if verification_data["code"] != code:
        return None
    
    # Kod muddati o'tganmi tekshirish (10 daqiqa)
    expires_at = verification_data["expires_at"]
    if datetime.now() > expires_at:
        del verification_codes_db[phone]
        return None
    
    # Foydalanuvchini tasdiqlash
    user_id = verification_data["user_id"]
    if user_id in users_db:
        users_db[user_id]["is_verified"] = True
        # Kodni o'chirish
        del verification_codes_db[phone]
        return UserResponse(**users_db[user_id])
    
    return None


def generate_verification_code() -> str:
    """Tasdiqlovchi kod yaratish (6 xonali)"""
    return str(random.randint(100000, 999999))


def send_verification_code(phone: str, user_id: int) -> str:
    """Tasdiqlovchi kod yuborish (simulyatsiya)"""
    code = generate_verification_code()
    expires_at = datetime.now().replace(second=0, microsecond=0)
    expires_at = expires_at.replace(minute=expires_at.minute + 10)  # 10 daqiqa
    
    verification_codes_db[phone] = {
        "code": code,
        "expires_at": expires_at,
        "user_id": user_id,
        "created_at": datetime.now()
    }
    
    # Simulyatsiya - haqiqiy loyihada SMS yuboriladi
    print(f"📱 SMS yuborildi {phone} ga: Tasdiqlovchi kod: {code}")
    
    return code


def resend_verification_code(phone: str) -> Optional[str]:
    """Kodni qayta yuborish"""
    # Foydalanuvchini topish
    user = None
    for user_data in users_db.values():
        if user_data["phone"] == phone:
            user = user_data
            break
    
    if not user:
        return None
    
    return send_verification_code(phone, user["id"])


# ============ PASSWORD RESET FUNCTIONS ============
# Password reset tokens database (email -> token_data)
password_reset_tokens_db: Dict[str, dict] = {}  # email -> {token, expires_at, user_id}

def generate_password_reset_token() -> str:
    """Parolni tiklash uchun token yaratish"""
    import secrets
    return secrets.token_urlsafe(32)


def send_password_reset_email(email: str, user_id: int) -> str:
    """Parolni tiklash email yuborish"""
    token = generate_password_reset_token()
    expires_at = datetime.now() + timedelta(hours=1)  # 1 soat amal qiladi
    
    password_reset_tokens_db[email] = {
        "token": token,
        "expires_at": expires_at,
        "user_id": user_id,
        "created_at": datetime.now()
    }
    
    # Email yuborish
    try:
        reset_link = f"https://phone-shop-frontend.vercel.app/reset-password?token={token}"
        
        # Environment variables dan olish
        import os
        smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
        smtp_port = int(os.getenv("SMTP_PORT", "587"))
        smtp_username = os.getenv("SMTP_USERNAME", "")
        smtp_password = os.getenv("SMTP_PASSWORD", "")
        
        # Agar SMTP konfiguratsiyasi bo'lsa, email yuborish
        if smtp_username and smtp_password:
            # Email yaratish
            msg = MIMEMultipart()
            msg['From'] = smtp_username
            msg['To'] = email
            msg['Subject'] = "Parolni tiklash - Phone Shop"
            
            # Email body
            body = f"""
Assalomu alaykum!

Parolni tiklash so'rovi qabul qilindi.

Quyidagi link orqali parolni yangilashingiz mumkin:
{reset_link}

Link 1 soat davomida amal qiladi.

Agar siz parolni tiklashni so'ramagan bo'lsangiz, ushbu xabarni e'tiborsiz qoldiring.

Hurmat bilan,
Phone Shop jamoasi
"""
            
            msg.attach(MIMEText(body, 'plain', 'utf-8'))
            
            # Email yuborish
            import smtplib
            server = smtplib.SMTP(smtp_server, smtp_port)
            server.starttls()
            server.login(smtp_username, smtp_password)
            server.sendmail(smtp_username, email, msg.as_string())
            server.quit()
            
            print(f"📧 EMAIL YUBORILDI: {email}")
        else:
            # SMTP konfiguratsiyasi bo'lmasa, console ga chiqaramiz
            print(f"📧 EMAIL CONFIG YO'Q - Console ga chiqariladi: {email}")
        
        # Har holda ham console ga chiqaramiz (test uchun)
        print(f"🔑 TOKEN: {token}")
        print(f"🔗 RESET LINK: {reset_link}")
        print(f"⏰ EXPIRES: {expires_at}")
        
        return token
        
    except Exception as e:
        print(f"Email yuborishda xatolik: {e}")
        # Xatolik bo'lsa ham token qaytaramiz
        return token


def verify_password_reset_token(token: str) -> Optional[dict]:
    """Parolni tiklash tokenini tekshirish"""
    for email, token_data in password_reset_tokens_db.items():
        if token_data["token"] == token:
            # Token muddati o'tganmi tekshirish
            if datetime.now() > token_data["expires_at"]:
                del password_reset_tokens_db[email]
                return None
            return token_data
    return None


def reset_user_password(user_id: int, new_password: str) -> bool:
    """Foydalanuvchi parolini yangilash"""
    if user_id not in users_db:
        return False
    
    users_db[user_id]["password_hash"] = hash_password(new_password)
    
    # Tokenlarni tozalash
    tokens_to_remove = []
    for email, token_data in password_reset_tokens_db.items():
        if token_data["user_id"] == user_id:
            tokens_to_remove.append(email)
    
    for email in tokens_to_remove:
        del password_reset_tokens_db[email]
    
    return True


def forgot_password(email: str) -> Optional[str]:
    """Parolni unutish - email ga tiklash link yuborish"""
    user = get_user_by_email(email)
    if not user:
        return None
    
    return send_password_reset_email(email, user.id)


# ============ DELIVERY ADDRESS FUNCTIONS ============
def create_delivery_address(user_id: int, address: DeliveryAddressCreate) -> DeliveryAddressResponse:
    """Yetkazib berish manzili yaratish"""
    global delivery_addresses_counter
    delivery_addresses_counter += 1
    
    # Agar asosiy manzil bo'lsa, boshqa asosiy manzillarni o'chirish
    if address.is_default:
        for addr_id, addr_data in delivery_addresses_db.items():
            if addr_data["user_id"] == user_id:
                addr_data["is_default"] = False
    
    address_data = {
        "id": delivery_addresses_counter,
        "user_id": user_id,
        "address": address.address,
        "city": address.city,
        "postal_code": address.postal_code,
        "is_default": address.is_default,
        "created_at": datetime.now()
    }
    
    delivery_addresses_db[delivery_addresses_counter] = address_data
    return DeliveryAddressResponse(**address_data)


def get_user_delivery_addresses(user_id: int) -> List[DeliveryAddressResponse]:
    """Foydalanuvchining manzillarini olish"""
    addresses = [
        addr for addr in delivery_addresses_db.values()
        if addr["user_id"] == user_id
    ]
    return [DeliveryAddressResponse(**addr) for addr in addresses]


def get_default_delivery_address(user_id: int) -> Optional[DeliveryAddressResponse]:
    """Foydalanuvchining asosiy manzilini olish"""
    for addr_data in delivery_addresses_db.values():
        if addr_data["user_id"] == user_id and addr_data.get("is_default", False):
            return DeliveryAddressResponse(**addr_data)
    return None
