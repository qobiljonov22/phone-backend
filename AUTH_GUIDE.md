# Authentication va Authorization Qo'llanmasi

## 🔐 Qanday ishlaydi

### 1. Ro'yxatdan o'tish (Registration)

```bash
POST /auth/register
{
  "username": "ali_valiyev",      # MAJBURIY (kamida 3 belgi)
  "email": "ali@example.com",     # MAJBURIY
  "phone": "+998901234567",        # MAJBURIY
  "password": "parol123",          # MAJBURIY (kamida 6 belgi)
  "full_name": "Ali Valiyev"      # MAJBURIY (kamida 2 belgi)
}
```

**Majburiy maydonlar:**
- ✅ `username` - Foydalanuvchi nomi (kamida 3 belgi)
- ✅ `email` - Email manzil
- ✅ `phone` - Telefon raqami
- ✅ `password` - Parol (kamida 6 belgi)
- ✅ `full_name` - To'liq ism (kamida 2 belgi)

**Javob:**
- Telefon raqamiga 6 xonali tasdiqlovchi kod yuboriladi
- Terminalda kod ko'rinadi (simulyatsiya)

### 2. Telefon raqamini tasdiqlash (Verification)

```bash
POST /auth/verify
{
  "phone": "+998901234567",
  "verification_code": "123456"
}
```

**Javob:**
- JWT access token qaytariladi
- Foydalanuvchi tasdiqlangan bo'ladi
- Endi saytga kirish mumkin

### 3. Login

```bash
POST /auth/login
{
  "username": "ali_valiyev",  # yoki "email": "ali@example.com"
  "password": "parol123"
}
```

**Javob:**
- JWT access token qaytariladi

### 4. Token ishlatish

Har bir protected endpoint uchun header'da token yuborish:

```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

## 👤 Foydalanuvchi rollari

### USER (Oddiy mijoz)
- ✅ Mahsulotlarni ko'rish
- ✅ Savatchaga qo'shish
- ✅ Buyurtma berish (faqat autentifikatsiya qilingan)
- ✅ O'z buyurtmalarini ko'rish
- ✅ Yetkazib berish manzilini belgilash
- ✅ Wishlist, Reviews

### ADMIN (Sayt egasi)
- ✅ USER huquqlari +
- ✅ Mahsulotlar yaratish, yangilash, o'chirish
- ✅ Kategoriyalar yaratish, yangilash, o'chirish
- ✅ Barcha buyurtmalarni ko'rish
- ✅ Buyurtma holatini yangilash
- ✅ Statistikalar

## 📋 Protected Endpoints

### Faqat autentifikatsiya qilingan foydalanuvchilar uchun:
- `POST /orders` - Buyurtma berish
- `GET /orders` - Buyurtmalarni ko'rish
- `GET /orders/{order_id}` - Buyurtma tafsilotlari
- `POST /auth/delivery-addresses` - Manzil yaratish
- `GET /auth/delivery-addresses` - Manzillarni ko'rish

### Faqat Admin uchun:
- `POST /products` - Mahsulot yaratish
- `PUT /products/{id}` - Mahsulot yangilash
- `DELETE /products/{id}` - Mahsulot o'chirish
- `POST /categories` - Kategoriya yaratish
- `PUT /categories/{id}` - Kategoriya yangilash
- `DELETE /categories/{id}` - Kategoriya o'chirish
- `PUT /orders/{id}/status` - Buyurtma holatini yangilash
- `GET /statistics` - Statistikalar

## 🔑 Admin foydalanuvchi

Server ishga tushganda avtomatik yaratiladi:
- **Username**: `admin`
- **Password**: `admin123`
- **Email**: `admin@phoneshop.uz`

**Eslatma:** Production da parolni o'zgartiring!

## 📱 SMS Kod (Simulyatsiya)

Hozircha SMS kod terminalda ko'rinadi. Production da:
- Twilio
- SMS.ru
- yoki boshqa SMS provider ishlatish kerak

## 🛡️ Xavfsizlik

1. **Parollar** - SHA256 hash bilan saqlanadi
2. **JWT Token** - 30 kun muddati
3. **Phone Verification** - Kod 10 daqiqa davomida amal qiladi
4. **Role-based Access** - Admin va User rollari

## 📝 Misol: To'liq workflow

1. **Ro'yxatdan o'tish:**
   ```bash
   POST /auth/register
   {
     "username": "ali_valiyev",      # MAJBURIY
     "email": "ali@example.com",     # MAJBURIY
     "phone": "+998901234567",        # MAJBURIY
     "password": "parol123"           # MAJBURIY
     # full_name ixtiyoriy
   }
   ```

2. **Kodni olish** (terminalda ko'rinadi)

3. **Telefon raqamini tasdiqlash:**
   ```bash
   POST /auth/verify
   # Token olinadi
   ```

4. **Manzil yaratish:**
   ```bash
   POST /auth/delivery-addresses
   Authorization: Bearer TOKEN
   ```

5. **Buyurtma berish:**
   ```bash
   POST /orders
   Authorization: Bearer TOKEN
   {
     "delivery_address_id": 1
   }
   ```
