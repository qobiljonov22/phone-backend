# Phone Shop API 📱

Telefon do'koni uchun FastAPI asosida yaratilgan REST API.

## 🚀 O'rnatish va Ishga tushirish

### 1. Kerakli kutubxonalarni o'rnatish

```bash
pip install -r requirements.txt
```

### 2. Serverni ishga tushirish

**Barcha qurilmalardan kirish uchun (default):**
```bash
python main.py
```

Bu buyruq server ni `0.0.0.0` host da ishga tushiradi, ya'ni:
- ✅ Localhost dan: `http://127.0.0.1:8000`
- ✅ Boshqa kompyuterdan (tarmoqda): `http://YOUR_IP:8000`
- ✅ Telefondan (bir xil Wi-Fi): `http://YOUR_IP:8000`

**Yoki uvicorn orqali:**
```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

**IP manzilingizni topish:**
```bash
# Windows:
ipconfig
# IPv4 Address ni toping (masalan: 192.168.1.100)

# Mac/Linux:
ifconfig
# yoki
ip addr show
```

### 3. API ga kirish

**Local kompyuterdan:**
- **API Base URL**: `http://127.0.0.1:8000` yoki `http://localhost:8000`
- **Swagger Dokumentatsiya**: `http://127.0.0.1:8000/docs`

**Boshqa kompyuterdan (tarmoqda):**
- **API Base URL**: `http://YOUR_IP:8000` (masalan: `http://192.168.1.100:8000`)
- **Swagger Dokumentatsiya**: `http://YOUR_IP:8000/docs`

**Muhim:** Firewall da 8000 port ni ochish kerak bo'lishi mumkin!

### 4. 🌐 Deploy qilingan API (Production)

**Live URL (Render.com):**
- **API Base URL**: `https://phone-backend-kn1h.onrender.com`
- **Swagger Dokumentatsiya**: `https://phone-backend-kn1h.onrender.com/docs`
- **ReDoc Dokumentatsiya**: `https://phone-backend-kn1h.onrender.com/redoc`

**Misol endpointlar:**
- **Mahsulotlar**: `https://phone-backend-kn1h.onrender.com/products`
- **Kategoriyalar**: `https://phone-backend-kn1h.onrender.com/categories`
- **Qidiruv**: `https://phone-backend-kn1h.onrender.com/search?query=iPhone`

**Eslatma:** Free tier da server inactivity bo'lganda to'xtaydi. Birinchi so'rov 50+ soniya olishi mumkin (cold start).

## 📚 API Endpointlar

### Authentication (Avtorizatsiya)

- `POST /auth/register` - Ro'yxatdan o'tish (telefon raqamiga kod yuboriladi)
- `POST /auth/verify` - Telefon raqamini tasdiqlash (kodni tekshirish)
- `POST /auth/resend-code` - Tasdiqlovchi kodni qayta yuborish
- `POST /auth/login` - Login (email/username va parol)
- `GET /auth/me` - Joriy foydalanuvchi ma'lumotlari
- `POST /auth/delivery-addresses` - Yetkazib berish manzili yaratish
- `GET /auth/delivery-addresses` - Foydalanuvchining manzillarini olish
- `GET /auth/delivery-addresses/default` - Asosiy manzilni olish

### Products (Mahsulotlar)

- `GET /products` - Barcha mahsulotlarni olish
- `GET /products?category_id={id}` - Kategoriya bo'yicha filtrlash
- `GET /products-paginated` - Sahifalangan mahsulotlar (pagination, filtering, sorting)
- `GET /products/{product_id}` - Bitta mahsulotni olish
- `GET /products/{product_id}/detail` - Mahsulot batafsil (sharhlar bilan, o'rtacha baholash)
- `GET /products/{product_id}/related` - O'xshash mahsulotlar
- `POST /products/compare` - Mahsulotlarni solishtirish (2-5 ta mahsulot)
- `POST /products` - Yangi mahsulot yaratish (Admin)
- `PUT /products/{product_id}` - Mahsulotni yangilash (Admin)
- `DELETE /products/{product_id}` - Mahsulotni o'chirish (Admin)

### Categories (Kategoriyalar)

- `GET /categories` - Barcha kategoriyalarni olish
- `GET /categories/{category_id}` - Bitta kategoriyani olish
- `POST /categories` - Yangi kategoriya yaratish (Admin)
- `PUT /categories/{category_id}` - Kategoriyani yangilash (Admin)
- `DELETE /categories/{category_id}` - Kategoriyani o'chirish (Admin)

### Search (Qidiruv)

- `GET /search?query={qidiruv_so'rovi}` - Mahsulotlarni qidirish

### Cart (Savatcha)

- `GET /cart` - Savatchadagi mahsulotlarni olish
- `POST /cart/add` - Savatchaga mahsulot qo'shish
- `PUT /cart/{item_id}` - Savatchadagi mahsulot miqdorini yangilash
- `DELETE /cart/{item_id}` - Savatchadan mahsulotni olib tashlash
- `DELETE /cart` - Savatchani tozalash

### Orders (Buyurtmalar)

- `POST /orders` - Yangi buyurtma yaratish (Faqat autentifikatsiya qilingan foydalanuvchilar)
- `POST /orders/one-click` - 1-click buy - Bir bosishda sotib olish (Autentifikatsiya talab qilmaydi)
- `GET /orders/{order_id}` - Buyurtmani olish (Faqat o'z buyurtmalari yoki Admin)
- `GET /orders` - Buyurtmalarni olish (Foydalanuvchi o'z buyurtmalari, Admin barcha buyurtmalar)
- `PUT /orders/{order_id}/status` - Buyurtma holatini yangilash (Admin)

### Reviews (Sharhlar va Baholash)

- `POST /reviews` - Mahsulotga sharh yozish
- `GET /products/{product_id}/reviews` - Mahsulot sharhlarini olish
- `GET /reviews` - Barcha sharhlarni olish

### Wishlist (Sevimli Mahsulotlar)

- `GET /wishlist` - Wishlist dagi mahsulotlarni olish
- `POST /wishlist/add/{product_id}` - Wishlist ga qo'shish
- `DELETE /wishlist/remove/{product_id}` - Wishlist dan olib tashlash

### Statistics (Statistikalar)

- `GET /statistics` - Umumiy statistikalar (Admin)

### Forms (Formalar)

- `POST /callbacks` - Qayta qo'ng'iroq so'rovi
- `POST /credit-applications` - Kredit arizasi
- `POST /trade-in-requests` - Trade-in so'rovi
- `POST /price-match-requests` - Narx solishtirish so'rovi
- `POST /newsletter/subscribe` - Newsletter obunasi

## 📝 Misol So'rovlar

**Eslatma:** Quyidagi misollarda `http://127.0.0.1:8000` o'rniga `https://phone-backend-kn1h.onrender.com` ishlatishingiz mumkin (deploy qilingan versiya uchun).

### Ro'yxatdan o'tish

**Local:**
```bash
curl -X POST http://127.0.0.1:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "ali_valiyev",      # MAJBURIY (kamida 3 belgi)
    "email": "ali@example.com",     # MAJBURIY
    "phone": "+998901234567",        # MAJBURIY
    "password": "parol123",          # MAJBURIY (kamida 6 belgi)
    "full_name": "Ali Valiyev"       # MAJBURIY (kamida 2 belgi)
  }'
```

**Majburiy maydonlar:** `username`, `email`, `phone`, `password`, `full_name`

### Telefon raqamini tasdiqlash

```bash
curl -X POST http://127.0.0.1:8000/auth/verify \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+998901234567",
    "verification_code": "123456"
  }'
```

### Login

```bash
curl -X POST http://127.0.0.1:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "ali_valiyev",
    "password": "parol123"
  }'
```

### Yetkazib berish manzili yaratish

```bash
curl -X POST http://127.0.0.1:8000/auth/delivery-addresses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "address": "Chilonzor tumani, 5-mavze",
    "city": "Toshkent",
    "postal_code": "100000",
    "is_default": true
  }'
```

### Mahsulotlarni olish

```bash
curl http://127.0.0.1:8000/products
```

### Savatchaga mahsulot qo'shish

```bash
curl -X POST http://127.0.0.1:8000/cart/add \
  -H "Content-Type: application/json" \
  -d '{"product_id": 1, "quantity": 2}'
```

### Buyurtma yaratish (Token kerak)

```bash
curl -X POST http://127.0.0.1:8000/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "delivery_address_id": 1,
    "notes": "Tezroq yetkazib bering"
  }'

### 1-click buy (Bir bosishda sotib olish)

```bash
curl -X POST http://127.0.0.1:8000/orders/one-click \
  -H "Content-Type: application/json" \
  -d '{
    "product_id": 1,
    "name": "Ali Valiyev",
    "phone": "+998901234567",
    "quantity": 1,
    "delivery_address": "Chilonzor tumani, 5-mavze",
    "notes": "Tezroq yetkazib bering"
  }'
```

**Eslatma:** Bu endpoint autentifikatsiya talab qilmaydi. Foydalanuvchi ro'yxatdan o'tmasdan ham buyurtma berishi mumkin.

### Qidiruv

```bash
curl http://127.0.0.1:8000/search?query=iPhone
```

### Sahifalangan mahsulotlar (Pagination)

```bash
curl "http://127.0.0.1:8000/products-paginated?page=1&page_size=10&sort_by=price_asc&min_price=500000&max_price=1000000"
```

### Mahsulotga sharh yozish

```bash
curl -X POST http://127.0.0.1:8000/reviews \
  -H "Content-Type: application/json" \
  -d '{
    "product_id": 1,
    "customer_name": "Ali Valiyev",
    "rating": 5,
    "comment": "Ajoyib mahsulot!"
  }'
```

### Wishlist ga qo'shish

```bash
curl -X POST http://127.0.0.1:8000/wishlist/add/1
```

### Mahsulotlarni solishtirish

```bash
curl -X POST http://127.0.0.1:8000/products/compare \
  -H "Content-Type: application/json" \
  -d '{
    "product_ids": [1, 2, 3]
  }'
```

**Eslatma:** 2-5 ta mahsulotni solishtirish mumkin.

### Statistikalar

```bash
curl http://127.0.0.1:8000/statistics
```

### Buyurtma holatini yangilash

```bash
curl -X PUT http://127.0.0.1:8000/orders/1/status \
  -H "Content-Type: application/json" \
  -d '{"status": "confirmed"}'
```

## 🏗️ Loyiha Strukturasi

```
phone-shop-api/
├── main.py          # Asosiy FastAPI ilovasi
├── models.py        # Pydantic modellar (ma'lumotlar strukturasi)
├── database.py      # Ma'lumotlar bazasi funksiyalari (in-memory)
├── routes.py        # API endpointlar
├── requirements.txt # Kerakli kutubxonalar
└── README.md        # Bu fayl
```

## ✨ Yangi Qo'shilgan Funksiyalar

1. ✅ **Authentication & Authorization** - JWT token bilan autentifikatsiya
2. ✅ **Registration** - Ro'yxatdan o'tish (telefon raqamiga kod yuborish)
3. ✅ **Phone Verification** - Telefon raqamini tasdiqlash
4. ✅ **Login** - Email/username va parol bilan kirish
5. ✅ **User Roles** - User va Admin rollari
6. ✅ **Protected Routes** - Admin va User uchun alohida huquqlar
7. ✅ **Delivery Addresses** - Yetkazib berish manzillarini boshqarish
8. ✅ **Pagination** - Sahifalangan mahsulotlar ro'yxati
9. ✅ **Filtering & Sorting** - Narx va nom bo'yicha filtrlash va tartiblash
10. ✅ **Reviews & Ratings** - Mahsulotlarga sharh va baholash (1-5 yulduz)
11. ✅ **Wishlist** - Sevimli mahsulotlarni saqlash
12. ✅ **Order Status Update** - Buyurtma holatini yangilash
13. ✅ **Statistics** - Umumiy statistikalar (daromad, buyurtmalar, va hokazo)
14. ✅ **Related Products** - O'xshash mahsulotlarni ko'rsatish
15. ✅ **Product Detail Page** - Mahsulot batafsil (sharhlar + o'rtacha baholash)
16. ✅ **Product Update/Delete** - Mahsulotni yangilash va o'chirish
17. ✅ **Category Update/Delete** - Kategoriyani yangilash va o'chirish
18. ✅ **1-Click Buy** - Bir bosishda sotib olish (autentifikatsiya talab qilmaydi)
19. ✅ **Product Comparison** - Mahsulotlarni solishtirish (2-5 ta mahsulot)

## 🔐 Authentication

### Admin foydalanuvchi

Server ishga tushganda avtomatik admin foydalanuvchi yaratiladi:
- **Username**: `admin`
- **Email**: `admin@phoneshop.uz`
- **Phone**: `+998901234567`
- **Password**: `admin123`
- **Role**: `admin`

**Eslatma:** Production da parolni o'zgartiring!

### Token ishlatish

Barcha protected endpointlar uchun `Authorization` header'da token yuborish kerak:

```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

### User rollari

- **USER** - Oddiy mijoz (buyurtma berish, o'z ma'lumotlarini ko'rish)
- **ADMIN** - Sayt egasi (barcha CRUD operatsiyalari)

## 🔧 Keyingi Qadamlar

1. **Haqiqiy Database**: Hozir in-memory saqlanadi. SQLAlchemy + PostgreSQL yoki MongoDB ga o'tkazish kerak
2. **SMS Integration**: Haqiqiy SMS yuborish (Twilio, SMS.ru yoki boshqa)
3. **File Upload**: Mahsulot rasmlarini yuklash funksiyasi
4. **Testing**: Unit testlar va integration testlar
5. **Logging**: Xatolarni kuzatish va log qilish
6. **Caching**: Redis yoki boshqa cache tizimi
7. **Rate Limiting**: API so'rovlarini cheklash
8. **Password Reset**: Parolni tiklash funksiyasi

## 📌 Eslatmalar

- Hozirgi versiyada ma'lumotlar xotirada saqlanadi (in-memory)
- Serverni qayta ishga tushirganda barcha ma'lumotlar yo'qoladi
- Production uchun haqiqiy database ishlatish kerak
- CORS sozlamalari hozircha barcha domain'lardan kirishga ruxsat beradi (production da o'zgartirish kerak)

## 🔥 Firewall Sozlamalari (Boshqa kompyuterdan kirish uchun)

Agar boshqa kompyuterdan kirishda muammo bo'lsa, firewall da port ni oching:

**Windows:**
1. Windows Defender Firewall → Advanced settings
2. Inbound Rules → New Rule
3. Port → TCP → 8000 → Allow connection
4. Finish

**Yoki PowerShell orqali:**
```powershell
New-NetFirewallRule -DisplayName "Phone Shop API" -Direction Inbound -LocalPort 8000 -Protocol TCP -Action Allow
```

**Linux:**
```bash
sudo ufw allow 8000/tcp
# yoki
sudo firewall-cmd --permanent --add-port=8000/tcp
sudo firewall-cmd --reload
```

## 🎯 API Dokumentatsiya

Barcha endpointlar va ularning parametrlarini ko'rish uchun:
- Swagger UI: `http://127.0.0.1:8000/docs` yoki `http://192.168.1.100:8000/docs`
- ReDoc: `http://127.0.0.1:8000/redoc` yoki `http://192.168.1.100:8000/redoc`

Bu sahifalarda har bir endpointni to'g'ridan-to'g'ri sinab ko'rishingiz mumkin!

## 📱 Postman Collection

Postman da API ni sinab ko'rish uchun:

1. `Phone_Shop_API.postman_collection.json` ni import qiling
2. `Phone_Shop_API.postman_environment.json` ni import qiling
3. Environment da `base_url` ni o'z IP manzilingizga o'zgartiring
   - Masalan: `http://192.168.1.100:8000`

Batafsil ko'rsatma: `POSTMAN_SETUP.md` faylida
