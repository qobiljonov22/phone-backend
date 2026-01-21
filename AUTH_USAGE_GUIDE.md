# Authentication API - Qanday Ishlaydi

## 1. REGISTER (Ro'yxatdan o'tish)

### Request:
```http
POST http://localhost:3001/api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "+998901234567",
  "address": {
    "city": "Tashkent",
    "street": "Main Street 123"
  }
}
```

### Response:
```json
{
  "success": true,
  "status": "registered",
  "data": {
    "user": {
      "userId": "user_1",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+998901234567",
      "role": "user",
      "createdAt": "2024-01-01T12:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ1c2VyXzEiLCJlbWFpbCI6ImpvaG5AZXhhbXBsZS5jb20iLCJpYXQiOjE3MDQxMDgwMDAsImV4cCI6MTcwNDcxMjgwMH0.signature",
    "expiresIn": "7d"
  },
  "message": "Foydalanuvchi muvaffaqiyatli ro'yxatdan o'tdi",
  "links": {
    "self": "http://localhost:3001/api/auth/me",
    "profile": "http://localhost:3001/api/users/user_1",
    "login": "http://localhost:3001/api/auth/login"
  },
  "timestamp": "2024-01-01T12:00:00.000Z",
  "version": "1.0.0"
}
```

### Qanday ishlaydi:
1. Email va password tekshiriladi
2. Email allaqachon mavjudligi tekshiriladi
3. Password SHA-256 hash qilinadi
4. Yangi user yaratiladi
5. JWT token yaratiladi (7 kunlik)
6. Token va user ma'lumotlari qaytariladi

---

## 2. LOGIN (Kirish)

### Request:
```http
POST http://localhost:3001/api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

### Response:
```json
{
  "success": true,
  "status": "authenticated",
  "data": {
    "user": {
      "userId": "user_1",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+998901234567",
      "role": "user"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": "7d"
  },
  "message": "Muvaffaqiyatli kirildi",
  "links": {
    "self": "http://localhost:3001/api/auth/me",
    "profile": "http://localhost:3001/api/users/user_1",
    "refresh": "http://localhost:3001/api/auth/refresh"
  },
  "timestamp": "2024-01-01T12:00:00.000Z",
  "version": "1.0.0"
}
```

### Qanday ishlaydi:
1. Email va password tekshiriladi
2. Password hash qilinadi va tekshiriladi
3. User topiladi va aktivligi tekshiriladi
4. JWT token yaratiladi
5. Token va user ma'lumotlari qaytariladi

---

## 3. GET CURRENT USER (Me) - Joriy foydalanuvchi

### Request:
```http
GET http://localhost:3001/api/auth/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Response:
```json
{
  "success": true,
  "status": "ok",
  "data": {
    "user": {
      "userId": "user_1",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+998901234567",
      "address": {
        "city": "Tashkent",
        "street": "Main Street 123"
      },
      "preferences": {
        "notifications": true,
        "newsletter": false,
        "currency": "USD",
        "language": "en"
      },
      "role": "user",
      "createdAt": "2024-01-01T12:00:00.000Z"
    }
  },
  "message": "Foydalanuvchi ma'lumotlari yuklandi",
  "links": {
    "self": "http://localhost:3001/api/auth/me",
    "profile": "http://localhost:3001/api/users/user_1",
    "logout": "http://localhost:3001/api/auth/logout"
  },
  "timestamp": "2024-01-01T12:00:00.000Z",
  "version": "1.0.0"
}
```

### Qanday ishlaydi:
1. Authorization header'dan token olinadi
2. Token tekshiriladi (signature va expiration)
3. User topiladi
4. User ma'lumotlari qaytariladi

---

## 4. REFRESH TOKEN - Token yangilash

### Request:
```http
POST http://localhost:3001/api/auth/refresh
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Response:
```json
{
  "success": true,
  "status": "refreshed",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": "7d"
  },
  "message": "Token yangilandi",
  "links": {
    "self": "http://localhost:3001/api/auth/me"
  },
  "timestamp": "2024-01-01T12:00:00.000Z",
  "version": "1.0.0"
}
```

### Qanday ishlaydi:
1. Eski token tekshiriladi
2. User topiladi va aktivligi tekshiriladi
3. Yangi token yaratiladi (7 kunlik)
4. Yangi token qaytariladi

---

## 5. LOGOUT - Chiqish

### Request:
```http
POST http://localhost:3001/api/auth/logout
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Response:
```json
{
  "success": true,
  "status": "logged_out",
  "data": {},
  "message": "Muvaffaqiyatli chiqildi",
  "links": {
    "login": "http://localhost:3001/api/auth/login",
    "register": "http://localhost:3001/api/auth/register"
  },
  "timestamp": "2024-01-01T12:00:00.000Z",
  "version": "1.0.0"
}
```

### Qanday ishlaydi:
- JWT stateless bo'lgani uchun, logout client-side'da token'ni o'chirish orqali amalga oshiriladi
- Server-side'da faqat log qilinadi

---

## Protected Routes - Himoyalangan Route'lar

### Misol: Cart API

```http
GET http://localhost:3001/api/cart/user_1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Middleware qo'llash:

```javascript
import { authenticate } from './middleware/auth.js';

// Protected route
app.get('/api/cart/:userId', authenticate, (req, res) => {
  // req.user.userId - authenticated user ID
  // req.user.email - authenticated user email
  // ...
});
```

---

## Token Format

JWT token 3 qismdan iborat:
1. **Header** - Algorithm va type
2. **Payload** - User ID, email, iat (issued at), exp (expiration)
3. **Signature** - HMAC SHA-256 signature

### Token payload misoli:
```json
{
  "userId": "user_1",
  "email": "john@example.com",
  "iat": 1704108000,
  "exp": 1704712800
}
```

---

## Xatolar

### 401 Unauthorized:
```json
{
  "success": false,
  "status": "unauthorized",
  "error": "Invalid email or password",
  "message": "Noto'g'ri email yoki parol",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "version": "1.0.0"
}
```

### 400 Validation Error:
```json
{
  "success": false,
  "status": "validation_error",
  "error": "Name, email and password are required",
  "message": "Ism, email va parol kiritilishi shart",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "version": "1.0.0"
}
```

### 409 Already Exists:
```json
{
  "success": false,
  "status": "already_exists",
  "error": "User with this email already exists",
  "message": "Bu email bilan foydalanuvchi allaqachon mavjud",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "version": "1.0.0"
}
```

---

## Postman'da Test Qilish

1. **Register** request'ni yuborish
2. Response'dan `token` ni olish
3. Environment variable'ga saqlash: `auth_token`
4. Boshqa request'larda `Authorization: Bearer {{auth_token}}` header qo'shish

### Postman Test Script (Register dan keyin):
```javascript
if (pm.response.code === 201) {
    const jsonData = pm.response.json();
    pm.environment.set("auth_token", jsonData.data.token);
    console.log("Token saved:", jsonData.data.token);
}
```

---

## Frontend'da Foydalanish

### JavaScript Fetch API:

```javascript
// Register
const register = async (userData) => {
  const response = await fetch('http://localhost:3001/api/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(userData)
  });
  const data = await response.json();
  if (data.success) {
    localStorage.setItem('token', data.data.token);
    localStorage.setItem('user', JSON.stringify(data.data.user));
  }
  return data;
};

// Login
const login = async (email, password) => {
  const response = await fetch('http://localhost:3001/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password })
  });
  const data = await response.json();
  if (data.success) {
    localStorage.setItem('token', data.data.token);
    localStorage.setItem('user', JSON.stringify(data.data.user));
  }
  return data;
};

// Get Current User
const getCurrentUser = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch('http://localhost:3001/api/auth/me', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return await response.json();
};

// Protected API Call
const getCart = async (userId) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`http://localhost:3001/api/cart/${userId}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return await response.json();
};
```

---

## Xulosa

1. **Register** - Yangi foydalanuvchi yaratish va token olish
2. **Login** - Mavjud foydalanuvchi bilan kirish va token olish
3. **Me** - Token bilan joriy foydalanuvchi ma'lumotlarini olish
4. **Refresh** - Token muddati tugashidan oldin yangilash
5. **Logout** - Client-side'da token'ni o'chirish

Barcha response'lar professional JSON formatda va o'zbek tilida xabarlar bilan.
