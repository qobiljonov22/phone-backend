# 🔑 Token Qayerda va Qanday Olinadi?

## 📍 Token Qayerda?

### 1️⃣ Postman Environment'da

**Qadam-baqadam:**

1. **Postman'ni oching**
2. O'ng yuqorida **Environment** dropdown'ni oching
3. **"Phone Store API - Environment"** ni tanlang
4. **Environments** tugmasini bosing (⚙️ ikonka)
5. **"Phone Store API - Environment"** ni oching
6. `auth_token` o'zgaruvchisini ko'rasiz

**Yoki:**

1. **Environments** panel'ni oching (o'ng tomonda)
2. **"Phone Store API - Environment"** ni tanlang
3. `auth_token` o'zgaruvchisini ko'rasiz

### 2️⃣ API Response'da

**Login yoki Register qilgandan keyin:**

```json
{
  "success": true,
  "status": "authenticated",
  "data": {
    "user": { ... },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ1c2VyXzEiLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJpYXQiOjE3MDQwNjQwMDAsImV4cCI6MTcwNDY2ODAwMH0.signature",  ← TOKEN BURDA
    "expiresIn": "7d"
  }
}
```

## 🚀 Token Qanday Olinadi?

### Usul 1: Login qilish

1. **Authentication** → **Login**
2. Body'da email va password kiriting:
```json
{
  "email": "test@example.com",
  "password": "password123"
}
```
3. **Send** tugmasini bosing
4. ✅ **Token avtomatik saqlanadi** (`auth_token`)

### Usul 2: Register qilish

1. **Authentication** → **Register**
2. Body'da ma'lumot kiriting:
```json
{
  "name": "John Doe",
  "email": "test@example.com",
  "password": "password123"
}
```
3. **Send** tugmasini bosing
4. ✅ **Token avtomatik saqlanadi** (`auth_token`)

## ✅ Token Avtomatik Ishlatiladi

Token saqlangandan keyin, quyidagi endpoint'larda **avtomatik** ishlatiladi:

- ✅ **Get Current User (Me)** - `Authorization: Bearer {{auth_token}}`
- ✅ **Refresh Token** - `Authorization: Bearer {{auth_token}}`
- ✅ **Logout** - `Authorization: Bearer {{auth_token}}`
- ✅ **Barcha boshqa endpoint'lar** - Token kerak bo'lsa, avtomatik qo'shiladi

## 🔍 Token'ni Tekshirish

### Postman'da:

1. **Environments** → **Phone Store API - Environment**
2. `auth_token` o'zgaruvchisini ko'ring
3. Agar **bo'sh bo'lsa** → **Login qiling**

### Console'da:

Login yoki Register qilgandan keyin, **Postman Console**'da (pastda) ko'rasiz:

```
✅ Token saved: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ1c2VyXzEiLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJpYXQiOjE3MDQwNjQwMDAsImV4cCI6MTcwNDY2ODAwMH0.abc123def456ghi789jkl012mno345pqr678stu901vwx234yz
✅ User ID saved: user_1
```

## 📝 Token Format

Token quyidagi formatda bo'ladi:

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ1c2VyXzEiLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJpYXQiOjE3MDQwNjQwMDAsImV4cCI6MTcwNDY2ODAwMH0.abc123def456ghi789jkl012mno345pqr678stu901vwx234yz
```

**Eslatma:** Har safar yangi token yaratilganda, u boshqacha bo'ladi. Yuqoridagi faqat misol.

## ⏰ Token Muddati

- **7 kun** davomida amal qiladi
- Agar eskirgan bo'lsa → **Qayta login qiling**
- Yoki **Refresh Token** endpoint'ini ishlating

## 🔄 Token Yangilash

1. **Authentication** → **Refresh Token**
2. **Send** tugmasini bosing
3. ✅ **Yangi token avtomatik saqlanadi**

## ❌ Muammo Bo'lsa

### Token yo'q:
1. **Login** yoki **Register** qiling
2. Token avtomatik saqlanadi

### Token eskirgan:
1. **Qayta login qiling**
2. Yoki **Refresh Token** ishlating

### Token noto'g'ri:
1. **Environment'ni tekshiring**
2. **Qayta login qiling**

## 💡 Maslahat

- **Token avtomatik saqlanadi** - Login/Register'dan keyin
- **Token avtomatik ishlatiladi** - Barcha endpoint'larda
- **Token 7 kun amal qiladi** - Keyin qayta login qiling

---

**Tayyor!** Endi token'ni topishingiz va ishlatishingiz mumkin! 🚀
