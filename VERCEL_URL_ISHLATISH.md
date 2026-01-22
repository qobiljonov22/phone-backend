# Vercel URL'ni Postman'da Ishlatish

## 🌐 Vercel Deployment URL

```
https://phone-backend-fkezys5on-qobiljonovumidjon22s-projects.vercel.app
```

## 📋 Postman'da Qanday Ishlatish

### 1. Environment'ni Tekshiring

1. Postman'da **Environments** tab'ga o'ting
2. **Phone Store API - Environment** ni tanlang
3. `base_url` variable'ni tekshiring:
   ```
   base_url = https://phone-backend-fkezys5on-qobiljonovumidjon22s-projects.vercel.app
   ```

### 2. Register Request'ni Yuborish

#### A. Postman Collection'dan

1. **Phone Store API - Complete Collection** ni oching
2. **Auth** folder → **Register** request'ni tanlang
3. **Send** tugmasini bosing

URL avtomatik quyidagicha bo'ladi:
```
{{base_url}}/api/auth/register
```

Bu quyidagiga aylanadi:
```
https://phone-backend-fkezys5on-qobiljonovumidjon22s-projects.vercel.app/api/auth/register
```

#### B. To'g'ridan-to'g'ri URL

1. **New Request** yarating
2. **Method:** `POST`
3. **URL:** 
   ```
   https://phone-backend-fkezys5on-qobiljonovumidjon22s-projects.vercel.app/api/auth/register
   ```
4. **Body** tab → **raw** → **JSON**:
   ```json
   {
     "name": "",
     "email": "",
     "password": "",
     "confirmPassword": ""
   }
   ```
5. Bo'sh field'larni o'z ma'lumotlaringiz bilan to'ldiring
6. **Send** tugmasini bosing

## 🔍 Tekshirish

### Health Check

**URL:**
```
GET https://phone-backend-fkezys5on-qobiljonovumidjon22s-projects.vercel.app/api/health
```

**Response:**
```json
{
  "success": true,
  "status": "ok",
  "data": {
    "server": "running",
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

### API Info

**URL:**
```
GET https://phone-backend-fkezys5on-qobiljonovumidjon22s-projects.vercel.app/api
```

## 📝 To'liq Register Request Misoli

### Postman'da:

**Method:** `POST`

**URL:**
```
https://phone-backend-fkezys5on-qobiljonovumidjon22s-projects.vercel.app/api/auth/register
```

**Headers:**
```
Content-Type: application/json
```

**Body (raw JSON):**
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

**Authorization:**
```
No Auth (hech qanday token kerak emas)
```

## ✅ Muvaffaqiyatli Response

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

## 🔗 Boshqa Endpoint'lar

### Login
```
POST https://phone-backend-fkezys5on-qobiljonovumidjon22s-projects.vercel.app/api/auth/login
```

### Get User Profile
```
GET https://phone-backend-fkezys5on-qobiljonovumidjon22s-projects.vercel.app/api/users/:userId
```

### Get All Phones
```
GET https://phone-backend-fkezys5on-qobiljonovumidjon22s-projects.vercel.app/api/phones
```

## ⚠️ Eslatmalar

1. **Environment Variable:**
   - `base_url` to'g'ri sozlangan bo'lishi kerak
   - Collection'da `{{base_url}}` ishlatiladi

2. **Authorization:**
   - Register va Login uchun token kerak emas
   - Boshqa endpoint'lar uchun token kerak

3. **Body Format:**
   - Faqat **JSON** format ishlaydi
   - `x-www-form-urlencoded` ishlamaydi

4. **HTTPS:**
   - Vercel URL **HTTPS** ishlatadi
   - Xavfsiz ulanish

## 🚀 Tezkor Test

1. Postman'da **New Request** yarating
2. **Method:** `POST`
3. **URL:** Yuqoridagi Register URL'ni kiriting
4. **Body:** JSON formatda ma'lumotlaringizni kiriting
5. **Send** tugmasini bosing

Agar hammasi to'g'ri bo'lsa, **201 Created** response keladi va token saqlanadi!
