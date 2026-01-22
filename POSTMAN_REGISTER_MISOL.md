# Postman'da Register Request - To'liq Misol

## 📋 Qadam-baqadam Ko'rsatma

### 1. Request'ni O'rnatish

#### A. Method va URL
- **Method:** `POST`
- **URL:** `{{base_url}}/api/auth/register`
  - Yoki to'g'ridan-to'g'ri: `https://phone-backend-fkezys5on-qobiljonovumidjon22s-projects.vercel.app/api/auth/register`

#### B. Authorization Tab
1. **Authorization** tab'ga o'ting
2. **Type** dropdown'dan **No Auth** tanlang
3. Hech qanday token yoki parol kiritmang!

#### C. Headers Tab
1. **Headers** tab'ga o'ting
2. Quyidagi header bo'lishi kerak:
   - **Key:** `Content-Type`
   - **Value:** `application/json`
3. **Authorization** header bo'lmasligi kerak!

#### D. Body Tab (MUHIM!)

1. **Body** tab'ga o'ting
2. **raw** radio button'ni tanlang
3. Dropdown'dan **JSON** tanlang
4. Quyidagi JSON'ni kiriting:

```json
{
  "name": "",
  "email": "",
  "password": "",
  "confirmPassword": "",
  "phone": "",
  "address": {
    "city": "",
    "street": ""
  },
  "preferences": {
    "notifications": true,
    "newsletter": false,
    "currency": "USD",
    "language": "en"
  }
}
```

**⚠️ MUHIM:** Bo'sh field'larni o'z ma'lumotlaringiz bilan to'ldiring! Masalan:
- `name`: "O'z ismingiz" (masalan: "Ali Valiyev")
- `email`: "o'z-email@example.com" (masalan: "ali@example.com")
- `password`: "o'z-parolingiz" (masalan: "mypassword123")
- `confirmPassword`: "o'z-parolingiz" (password bilan bir xil!)

### 2. Minimal Misol (Faqat Majburiy Field'lar)

Agar faqat majburiy field'larni kiritmoqchi bo'lsangiz:

```json
{
  "name": "",
  "email": "",
  "password": "",
  "confirmPassword": ""
}
```

**⚠️ MUHIM:** Bo'sh field'larni o'z ma'lumotlaringiz bilan to'ldiring!

### 3. To'liq Misol (Barcha Field'lar)

```json
{
  "name": "",
  "email": "",
  "password": "",
  "confirmPassword": "",
  "phone": "",
  "address": {
    "city": "",
    "street": ""
  },
  "preferences": {
    "notifications": true,
    "newsletter": false,
    "currency": "USD",
    "language": "en"
  }
}
```

**⚠️ MUHIM:** Bo'sh field'larni o'z ma'lumotlaringiz bilan to'ldiring!

## ⚠️ MUHIM Eslatmalar

### 1. Password va ConfirmPassword
- **`password`** va **`confirmPassword`** **bir xil** bo'lishi kerak!
- Agar mos kelmasa, 400 error qaytadi: "Parollar mos kelmaydi"

### 2. Email Format
- Email to'g'ri formatda bo'lishi kerak: `user@example.com`
- Email allaqachon mavjud bo'lsa, 409 error qaytadi

### 3. Password Uzunligi
- Password kamida 6 belgidan iborat bo'lishi kerak
- Agar qisqa bo'lsa, 400 error qaytadi

### 4. Body Format
- **Body** tab'da **raw** → **JSON** tanlang
- **x-www-form-urlencoded** yoki **form-data** ishlamaydi!
- Faqat **JSON** format ishlaydi!

## ✅ Muvaffaqiyatli Response

Agar hammasi to'g'ri bo'lsa, quyidagi response keladi:

```json
{
  "success": true,
  "status": "registered",
  "data": {
    "user": {
      "userId": "user_1",
      "name": "Umidjon Qobiljonov",
      "email": "umidjon@example.com",
      "phone": "+998901234567",
      "role": "user",
      "createdAt": "2024-01-15T10:30:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ1c2VyXzEiLCJlbWFpbCI6InVtaWRqb25AZXhhbXBsZS5jb20iLCJpYXQiOjE3MDQwNjQwMDAsImV4cCI6MTcwNDY2ODAwMH0.abc123def456ghi789jkl012mno345pqr678stu901vwx234yz",
    "expiresIn": "7d"
  },
  "message": "Foydalanuvchi muvaffaqiyatli ro'yxatdan o'tdi",
  "links": {
    "self": "https://phone-backend-fkezys5on-qobiljonovumidjon22s-projects.vercel.app/api/auth/me",
    "profile": "https://phone-backend-fkezys5on-qobiljonovumidjon22s-projects.vercel.app/api/users/user_1",
    "login": "https://phone-backend-fkezys5on-qobiljonovumidjon22s-projects.vercel.app/api/auth/login"
  },
  "timestamp": "2024-01-15T10:30:00.000Z",
  "version": "1.0.0"
}
```

## ❌ Xatolar va Yechimlar

### 400 - Validation Error

**Sabab:** `confirmPassword` kiritilmagan yoki `password` bilan mos kelmaydi

**Misol:**
```json
{
  "name": "Umidjon",
  "email": "umidjon@example.com",
  "password": "parol123",
  "confirmPassword": "parol456"  // ❌ Mos kelmaydi!
}
```

**Yechim:** `password` va `confirmPassword` bir xil kiriting

### 401 - Unauthorized

**Sabab:** Authorization header yuborilgan

**Yechim:**
1. **Authorization** tab → **No Auth** tanlang
2. **Headers** tab → Authorization header o'chiring
3. Collection'ni qayta import qiling

### 409 - Conflict

**Sabab:** Email allaqachon mavjud

**Misol:**
```json
{
  "name": "Umidjon",
  "email": "umidjon@example.com",  // ❌ Bu email allaqachon mavjud!
  "password": "parol123",
  "confirmPassword": "parol123"
}
```

**Yechim:**
1. Boshqa email ishlating
2. Yoki avval login qiling
3. Yoki eski email'ni o'chiring: `DELETE /api/users/email/umidjon@example.com`

## 📸 Postman'da Ko'rinish

### Body Tab - To'g'ri Format

```
┌─────────────────────────────────────────┐
│ Body                                     │
├─────────────────────────────────────────┤
│ ○ none                                   │
│ ○ form-data                              │
│ ○ x-www-form-urlencoded                  │
│ ● raw                                    │  ← Bu tanlang!
│ ○ binary                                 │
│ ○ GraphQL                                │
│                                          │
│ [JSON ▼]  ← JSON tanlang!                │
│                                          │
│ ┌─────────────────────────────────────┐ │
│ │ {                                    │ │
│ │   "name": "Umidjon Qobiljonov",     │ │
│ │   "email": "umidjon@example.com",   │ │
│ │   "password": "mypassword123",      │ │
│ │   "confirmPassword": "mypassword123"│ │
│ │ }                                    │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

### Authorization Tab - To'g'ri Format

```
┌─────────────────────────────────────────┐
│ Authorization                            │
├─────────────────────────────────────────┤
│ Type: [No Auth ▼]  ← Bu tanlang!        │
│                                          │
│ (Hech qanday field ko'rsatilmaydi)      │
└─────────────────────────────────────────┘
```

### Headers Tab - To'g'ri Format

```
┌─────────────────────────────────────────┐
│ Headers                                  │
├─────────────────────────────────────────┤
│ Key              Value                   │
│ Content-Type     application/json        │
│                                          │
│ (Authorization header bo'lmasligi kerak!)│
└─────────────────────────────────────────┘
```

## 🎯 Tekshirish Ro'yxati

Request yuborishdan oldin quyidagilarni tekshiring:

- [ ] **Method:** POST
- [ ] **URL:** `{{base_url}}/api/auth/register`
- [ ] **Authorization:** No Auth
- [ ] **Headers:** Faqat `Content-Type: application/json`
- [ ] **Body:** raw → JSON
- [ ] **Body ichida:**
  - [ ] `name` kiritilgan
  - [ ] `email` kiritilgan
  - [ ] `password` kiritilgan
  - [ ] `confirmPassword` kiritilgan
  - [ ] `password` va `confirmPassword` bir xil

## 🚀 Keyingi Qadamlar

1. **Register** request'ni yuboring
2. **201 Created** response keladi
3. **Token** avtomatik saqlanadi (`auth_token`)
4. **User ID** avtomatik saqlanadi (`user_id`)
5. Endi boshqa endpoint'larni token bilan ishlatishingiz mumkin!
