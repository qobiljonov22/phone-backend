# 401 Error Fix - Register Endpoint (Password Confirmation)

## 🔴 Muammo: 401 Unauthorized

Register endpoint'ida 401 xatosi kelayapti.

## ✅ Yechim

### 1. Postman'da Authorization Tab'ni Tekshiring

1. **Register** request'ni oching
2. **Authorization** tab'ga o'ting
3. **Type** dropdown'dan **No Auth** tanlang
4. Agar boshqa type tanlangan bo'lsa (Bearer Token, Basic Auth, va h.k.), **No Auth** ga o'zgartiring

### 2. Headers Tab'ni Tekshiring

1. **Headers** tab'ga o'ting
2. **Authorization** header bor bo'lsa, **o'chiring** (Delete tugmasi)
3. Faqat quyidagi header bo'lishi kerak:
   - `Content-Type: application/json`

### 3. Body'ni To'g'ri To'ldiring

**⚠️ MUHIM:** Endi `confirmPassword` ham kerak!

```json
{
  "name": "O'z ismingiz",
  "email": "o'z-email@example.com",
  "password": "parol123",
  "confirmPassword": "parol123"
}
```

**Eslatma:**
- `password` va `confirmPassword` **bir xil** bo'lishi kerak!
- Agar mos kelmasa, 400 error qaytadi: "Parollar mos kelmaydi"

### 4. Collection'ni Qayta Import Qiling

Agar hali ham 401 bo'lsa:

1. Postman'da **File** → **Import**
2. `Phone_Store_Postman_Collection.json` faylini import qiling
3. **Register** request'ni qayta oching
4. **Authorization** tab'da **No Auth** ekanligini tekshiring

### 5. Environment Variable'ni Tekshiring

1. **Environments** tab'ga o'ting
2. `base_url` to'g'ri ekanligini tekshiring:
   - Local: `http://localhost:3001`
   - Vercel: `https://phone-backend-fkezys5on-qobiljonovumidjon22s-projects.vercel.app`

### 6. To'liq Request Format

**URL:**
```
{{base_url}}/api/auth/register
```

**Method:**
```
POST
```

**Headers:**
```
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "name": "Test User",
  "email": "test@example.com",
  "password": "password123",
  "confirmPassword": "password123"
}
```

**Authorization:**
```
No Auth (hech qanday token kerak emas!)
```

## 🔍 Debug Qilish

### Console'da Ko'rish

Postman'da **Console** tab'ni oching va request'ni yuboring. Quyidagilarni tekshiring:

1. **Request Headers** - Authorization header bo'lmasligi kerak
2. **Request Body** - `confirmPassword` borligini tekshiring
3. **Response Status** - 201 bo'lishi kerak (yoki 400 validation error)

### Agar Hali Ham 401 Bo'lsa

1. **Postman Settings** → **General** → **SSL certificate verification** - o'chiring (faqat test uchun)
2. **Collection** → **Variables** → `base_url` to'g'ri ekanligini tekshiring
3. **Environment** → **Variables** → `base_url` to'g'ri ekanligini tekshiring

## ✅ Muvaffaqiyatli Response

Agar hammasi to'g'ri bo'lsa, quyidagi response keladi:

```json
{
  "success": true,
  "status": "registered",
  "data": {
    "user": {
      "userId": "user_1",
      "name": "Test User",
      "email": "test@example.com",
      "phone": "",
      "role": "user",
      "createdAt": "2024-01-01T12:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": "7d"
  },
  "message": "Foydalanuvchi muvaffaqiyatli ro'yxatdan o'tdi",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "version": "1.0.0"
}
```

## ❌ Xatolar

### 400 - Validation Error

**Sabab:** `confirmPassword` kiritilmagan yoki `password` bilan mos kelmaydi

**Yechim:** `password` va `confirmPassword` bir xil kiriting

### 401 - Unauthorized

**Sabab:** Authorization header yuborilgan

**Yechim:** Authorization tab'da **No Auth** tanlang

### 409 - Conflict

**Sabab:** Email allaqachon mavjud

**Yechim:** Boshqa email ishlating yoki login qiling
