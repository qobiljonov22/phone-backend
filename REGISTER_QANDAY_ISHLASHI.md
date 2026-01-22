# Register Endpoint - Qanday Ishlaydi?

## 📋 Umumiy Ma'lumot

Register endpoint foydalanuvchilarni ro'yxatdan o'tkazish uchun ishlatiladi. Har bir yangi foydalanuvchi o'z ma'lumotlarini kiritadi va tizimga ro'yxatdan o'tadi.

## 🔄 Ishlash Jarayoni

### 1. Request Yuborish

**URL:** `POST /api/auth/register`

**Body (JSON format):**
```json
{
  "name": "Ali Valiyev",
  "email": "ali@example.com",
  "password": "parol123",
  "confirmPassword": "parol123",
  "phone": "+998901234567",
  "address": {
    "city": "Tashkent",
    "street": "Main Street"
  }
}
```

### 2. Validation (Tekshirish)

API quyidagi tekshiruvlarni amalga oshiradi:

#### A. Majburiy Field'lar Tekshiruvi
```javascript
if (!name || !email || !password || !confirmPassword) {
  return 400 error: "Ism, email, parol va parol tasdiqlash kiritilishi shart"
}
```

#### B. Email Format Tekshiruvi
```javascript
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(email)) {
  return 400 error: "Noto'g'ri email format"
}
```

#### C. Password Uzunligi Tekshiruvi
```javascript
if (password.length < 6) {
  return 400 error: "Parol kamida 6 ta belgidan iborat bo'lishi kerak"
}
```

#### D. Password Tasdiqlash Tekshiruvi
```javascript
if (password !== confirmPassword) {
  return 400 error: "Parollar mos kelmaydi"
}
```

#### E. Email Mavjudligi Tekshiruvi
```javascript
if (existingUser) {
  return 409 error: "Bu email bilan foydalanuvchi allaqachon mavjud"
}
```

### 3. Ma'lumotlarni Saqlash

Agar barcha tekshiruvlar muvaffaqiyatli bo'lsa:

#### A. User ID Yaratish
```javascript
const userId = `user_${userCounter}`; // masalan: "user_1"
```

#### B. Password Hash Qilish
```javascript
const hashedPassword = hashPassword(password);
// "parol123" → "a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3"
```

#### C. User Object Yaratish
```javascript
const user = {
  userId: "user_1",
  name: "Ali Valiyev",
  email: "ali@example.com",
  password: "hashed_password",
  phone: "+998901234567",
  address: { city: "Tashkent", street: "Main Street" },
  preferences: { notifications: true, newsletter: false, ... },
  wishlist: [],
  orderHistory: [],
  createdAt: "2024-01-15T10:30:00.000Z",
  role: "user"
};
```

#### D. Database'ga Saqlash
```javascript
users.set(userId, user);
saveUsers(users, userCounter);
// users_database.json fayliga yoziladi
```

### 4. Token Yaratish

```javascript
const token = generateToken(userId, email);
// JWT token yaratiladi va qaytariladi
```

### 5. Response Qaytarish

**Muvaffaqiyatli Response (201 Created):**
```json
{
  "success": true,
  "status": "registered",
  "data": {
    "user": {
      "userId": "user_1",
      "name": "Ali Valiyev",
      "email": "ali@example.com",
      "phone": "+998901234567",
      "role": "user",
      "createdAt": "2024-01-15T10:30:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": "7d"
  },
  "message": "Foydalanuvchi muvaffaqiyatli ro'yxatdan o'tdi",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "version": "1.0.0"
}
```

## 📊 Diagramma

```
┌─────────────────┐
│   Client        │
│  (Postman)      │
└────────┬────────┘
         │
         │ POST /api/auth/register
         │ { name, email, password, confirmPassword }
         │
         ▼
┌─────────────────┐
│   API Server    │
│  (Express)      │
└────────┬────────┘
         │
         │ 1. Validation
         │    ├─ Majburiy field'lar?
         │    ├─ Email format?
         │    ├─ Password uzunligi?
         │    ├─ Password = confirmPassword?
         │    └─ Email mavjudmi?
         │
         ▼
    ┌────────┐
    │ 400/409 │  ← Xato bo'lsa
    └────────┘
         │
         │ 2. Ma'lumotlarni tayyorlash
         │    ├─ User ID yaratish
         │    ├─ Password hash qilish
         │    └─ User object yaratish
         │
         ▼
┌─────────────────┐
│   Database      │
│  (JSON file)    │
└────────┬────────┘
         │
         │ 3. Saqlash
         │    └─ users_database.json
         │
         ▼
┌─────────────────┐
│   Token         │
│   Generation    │
└────────┬────────┘
         │
         │ 4. JWT Token yaratish
         │
         ▼
┌─────────────────┐
│   Response      │
│   (201 Created) │
└─────────────────┘
```

## 🔍 Qadam-baqadam Misol

### Misol 1: Muvaffaqiyatli Registration

**Request:**
```json
POST /api/auth/register
{
  "name": "Ali Valiyev",
  "email": "ali@example.com",
  "password": "parol123",
  "confirmPassword": "parol123"
}
```

**Jarayon:**
1. ✅ Majburiy field'lar bor
2. ✅ Email format to'g'ri
3. ✅ Password uzunligi 6+ belgi
4. ✅ Password = confirmPassword
5. ✅ Email yangi (mavjud emas)
6. ✅ User yaratildi: `user_1`
7. ✅ Password hash qilindi
8. ✅ Database'ga saqlandi
9. ✅ Token yaratildi

**Response:**
```json
{
  "success": true,
  "status": "registered",
  "data": {
    "user": { "userId": "user_1", ... },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Misol 2: Password Mos Kelmaydi

**Request:**
```json
{
  "name": "Ali Valiyev",
  "email": "ali@example.com",
  "password": "parol123",
  "confirmPassword": "parol456"  // ❌ Mos kelmaydi!
}
```

**Jarayon:**
1. ✅ Majburiy field'lar bor
2. ✅ Email format to'g'ri
3. ✅ Password uzunligi 6+ belgi
4. ❌ Password ≠ confirmPassword

**Response:**
```json
{
  "success": false,
  "status": "validation_error",
  "error": "Passwords do not match",
  "message": "Parollar mos kelmaydi. Iltimos, parol va tasdiqlash parolini bir xil kiriting",
  "code": 400
}
```

### Misol 3: Email Allaqachon Mavjud

**Request:**
```json
{
  "name": "Ali Valiyev",
  "email": "ali@example.com",  // ❌ Bu email allaqachon mavjud!
  "password": "parol123",
  "confirmPassword": "parol123"
}
```

**Jarayon:**
1. ✅ Majburiy field'lar bor
2. ✅ Email format to'g'ri
3. ✅ Password uzunligi 6+ belgi
4. ✅ Password = confirmPassword
5. ❌ Email allaqachon mavjud

**Response:**
```json
{
  "success": false,
  "status": "already_exists",
  "error": "User with this email already exists",
  "message": "Bu email bilan foydalanuvchi allaqachon mavjud. Iltimos, login qiling yoki boshqa email ishlating",
  "code": 409
}
```

## 🔐 Xavfsizlik

### 1. Password Hash Qilish
- Password to'g'ridan-to'g'ri saqlanmaydi
- SHA-256 hash algoritmi ishlatiladi
- Database'da faqat hash saqlanadi

### 2. Token
- JWT token yaratiladi
- 7 kun muddatga ega
- User ID va email'ni o'z ichiga oladi

### 3. Validation
- Barcha input'lar tekshiriladi
- Xavfsizlik uchun qo'shimcha tekshiruvlar

## 📝 Fayllar

### users_database.json
```json
{
  "users": {
    "user_1": {
      "userId": "user_1",
      "name": "Ali Valiyev",
      "email": "ali@example.com",
      "password": "hashed_password",
      ...
    }
  },
  "userCounter": 1
}
```

## 🎯 Keyingi Qadamlar

1. **Register** muvaffaqiyatli bo'lgach:
   - Token avtomatik saqlanadi (`auth_token`)
   - User ID avtomatik saqlanadi (`user_id`)

2. **Boshqa endpoint'larni ishlatish:**
   - Token bilan boshqa request'larni yuborishingiz mumkin
   - Masalan: `GET /api/users/:userId` (token kerak)

3. **Login qilish:**
   - Agar allaqachon ro'yxatdan o'tgan bo'lsangiz, login qiling
   - `POST /api/auth/login` endpoint'ini ishlating

## ❓ Tekshirish

### Qanday tekshirish mumkin?

1. **Postman Console:**
   - Request va Response'ni ko'rish
   - Headers va Body'ni tekshirish

2. **Database fayl:**
   - `users_database.json` faylini ochish
   - User'lar ro'yxatini ko'rish

3. **Response:**
   - Status code: 201 (muvaffaqiyatli)
   - Status code: 400 (validation error)
   - Status code: 409 (email mavjud)

## 🚀 Misol: To'liq Jarayon

```bash
# 1. Register request
POST /api/auth/register
{
  "name": "Ali Valiyev",
  "email": "ali@example.com",
  "password": "parol123",
  "confirmPassword": "parol123"
}

# 2. Response
{
  "success": true,
  "data": {
    "user": { "userId": "user_1", ... },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}

# 3. Token saqlanadi (Postman Environment)
auth_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# 4. Keyingi request (token bilan)
GET /api/users/user_1
Headers: Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Bu jarayon har bir yangi foydalanuvchi ro'yxatdan o'tganda takrorlanadi!
