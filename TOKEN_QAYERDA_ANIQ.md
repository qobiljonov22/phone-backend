# 🔑 Token Qayerda? - Aniq Ko'rsatma

## 📍 Token 3 Joyda Topiladi:

### 1️⃣ Postman Environment'da (Asosiy Joy)

**Qadam-baqadam:**

1. **Postman'ni oching**
2. O'ng yuqorida **Environment** dropdown'ni oching
3. **"Phone Store API - Environment"** ni tanlang
4. **Environments** tugmasini bosing (⚙️ ikonka yoki o'ng tomonda)
5. **"Phone Store API - Environment"** ni oching
6. `auth_token` o'zgaruvchisini ko'rasiz

**Yoki:**

1. **View** → **Show Postman Console** (yoki `Ctrl+Alt+C`)
2. **Environments** panel'ni oching (o'ng tomonda)
3. **"Phone Store API - Environment"** ni tanlang
4. `auth_token` o'zgaruvchisini ko'rasiz

**Hozir bo'sh bo'lishi mumkin** - Login yoki Register qilgandan keyin to'ldiriladi!

---

### 2️⃣ API Response'da (Login/Register'dan Keyin)

**Register qilgandan keyin:**

```json
{
  "success": true,
  "status": "created",
  "data": {
    "user": { ... },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ1c2VyXzEiLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJpYXQiOjE3MDQwNjQwMDAsImV4cCI6MTcwNDY2ODAwMH0.abc123def456ghi789jkl012mno345pqr678stu901vwx234yz",  ← TOKEN BURDA
    "expiresIn": "7 days"
  }
}
```

**Login qilgandan keyin:**

```json
{
  "success": true,
  "status": "authenticated",
  "data": {
    "user": { ... },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",  ← TOKEN BURDA
    "expiresIn": "7 days"
  }
}
```

---

### 3️⃣ Postman Console'da (Log'da)

**Login yoki Register qilgandan keyin:**

1. **View** → **Show Postman Console** (yoki `Ctrl+Alt+C`)
2. Console'da quyidagilarni ko'rasiz:

```
✅ Token saved: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ1c2VyXzEiLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJpYXQiOjE3MDQwNjQwMDAsImV4cCI6MTcwNDY2ODAwMH0.abc123def456ghi789jkl012mno345pqr678stu901vwx234yz
✅ User ID saved: user_1
```

---

## 🚀 Token Qanday Olinadi?

### Usul 1: Register qilish

1. **Authentication** → **Register**
2. Body'da o'z ma'lumotlaringizni kiriting:
```json
{
  "name": "O'z ismingiz",
  "email": "o'z-email@example.com",
  "password": "o'z-parolingiz",
  "confirmPassword": "o'z-parolingiz"
}
```
3. **Send** tugmasini bosing
4. ✅ **Token avtomatik saqlanadi** (`auth_token` environment'ga)

### Usul 2: Login qilish

1. **Authentication** → **Login**
2. Body'da email va password kiriting:
```json
{
  "email": "o'z-email@example.com",
  "password": "o'z-parolingiz"
}
```
3. **Send** tugmasini bosing
4. ✅ **Token avtomatik saqlanadi** (`auth_token` environment'ga)

---

## ✅ Token Avtomatik Ishlatiladi

Token saqlangandan keyin, quyidagi endpoint'larda **avtomatik** ishlatiladi:

- ✅ **Get Current User (Me)** - `Authorization: Bearer {{auth_token}}`
- ✅ **Refresh Token** - `Authorization: Bearer {{auth_token}}`
- ✅ **Logout** - `Authorization: Bearer {{auth_token}}`
- ✅ **Barcha boshqa endpoint'lar** - Token kerak bo'lsa, avtomatik qo'shiladi

**Eslatma:** `{{auth_token}}` Postman'da environment variable sifatida ishlatiladi va avtomatik to'ldiriladi!

---

## 🔍 Token'ni Tekshirish

### Postman'da:

1. **Environments** → **Phone Store API - Environment**
2. `auth_token` o'zgaruvchisini ko'ring
3. Agar **bo'sh bo'lsa** → **Login** yoki **Register** qiling

### Console'da:

1. **View** → **Show Postman Console**
2. Login/Register qilgandan keyin log'larni ko'ring
3. `✅ Token saved:` yozuvini ko'rasiz

---

## 📝 Token Format

Token quyidagi formatda bo'ladi (3 qismdan iborat):

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ1c2VyXzEiLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJpYXQiOjE3MDQwNjQwMDAsImV4cCI6MTcwNDY2ODAwMH0.abc123def456ghi789jkl012mno345pqr678stu901vwx234yz
```

**Eslatma:** Har safar yangi token yaratilganda, u boshqacha bo'ladi. Yuqoridagi faqat misol.

---

## ⏰ Token Muddati

- **7 kun** davomida amal qiladi
- Agar eskirgan bo'lsa → **Qayta login qiling**
- Yoki **Refresh Token** endpoint'ini ishlating

---

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

---

## 💡 Maslahat

- ✅ **Token avtomatik saqlanadi** - Login/Register'dan keyin
- ✅ **Token avtomatik ishlatiladi** - Barcha endpoint'larda
- ✅ **Token 7 kun amal qiladi** - Keyin qayta login qiling
- ✅ **Environment'ni tekshiring** - `auth_token` o'zgaruvchisi borligini

---

## 🎯 Qisqa Yo'riqnoma

1. **Postman'ni oching**
2. **Authentication** → **Register** yoki **Login**
3. Ma'lumotlarni kiriting va **Send** bosing
4. ✅ **Token avtomatik saqlanadi**
5. **Environments** → **Phone Store API - Environment** → `auth_token` ni ko'ring

---

**Tayyor!** Endi token'ni topishingiz va ishlatishingiz mumkin! 🚀
