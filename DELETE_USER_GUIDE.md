# 🗑️ User O'chirish - Qo'llanma

## ✅ Qilingan O'zgarishlar:

Yangi endpoint qo'shildi:
- `DELETE /api/users/email/:email` - Email bo'yicha user o'chirish
- `DELETE /api/users/:userId` - User ID bo'yicha user o'chirish

---

## 🚀 Usul 1: API Endpoint Orqali (Tavsiya etiladi)

### Email bo'yicha o'chirish:

**Postman'da:**
```
DELETE {{base_url}}/api/users/email/test@example.com
```

**Curl:**
```bash
curl -X DELETE https://phone-backend-fkezys5on-qobiljonovumidjon22s-projects.vercel.app/api/users/email/test@example.com
```

### User ID bo'yicha o'chirish:

**Postman'da:**
```
DELETE {{base_url}}/api/users/user_1
```

**Curl:**
```bash
curl -X DELETE https://phone-backend-fkezys5on-qobiljonovumidjon22s-projects.vercel.app/api/users/user_1
```

---

## 📝 Response:

### Muvaffaqiyatli (200 OK):
```json
{
  "success": true,
  "status": "deleted",
  "data": {
    "deletedUser": {
      "userId": "user_1",
      "email": "test@example.com",
      "name": "Test User"
    },
    "deletedAt": "2024-01-01T12:00:00.000Z"
  },
  "message": "Foydalanuvchi \"test@example.com\" muvaffaqiyatli o'chirildi"
}
```

### User topilmadi (404):
```json
{
  "success": false,
  "status": "not_found",
  "error": "User not found",
  "message": "Email \"test@example.com\" bilan foydalanuvchi topilmadi"
}
```

---

## 🛠️ Usul 2: Manual O'chirish (Local Development)

### Local Development:

1. **`users_database.json`** faylini oching
2. User'ni toping va o'chiring
3. Faylni saqlang

**Fayl joylashuvi:**
```
phone-backend/users_database.json
```

**Misol:**
```json
{
  "users": {
    "user_1": {
      "userId": "user_1",
      "email": "test@example.com",
      ...
    }
  },
  "userCounter": 1
}
```

User'ni o'chirish:
```json
{
  "users": {},
  "userCounter": 1
}
```

### Vercel'da (Serverless):

Vercel'da fayl `/tmp/users_database.json` da saqlanadi, lekin serverless'da bu vaqtinchalik. Har bir deployment yangi boshlanadi.

**Yechim:** API endpoint orqali o'chirish (Usul 1)

---

## 🧪 Test Qilish:

### 1. User'ni o'chirish:
```bash
curl -X DELETE https://phone-backend-fkezys5on-qobiljonovumidjon22s-projects.vercel.app/api/users/email/test@example.com
```

### 2. Register qilib tekshirish:
```bash
curl -X POST https://phone-backend-fkezys5on-qobiljonovumidjon22s-projects.vercel.app/api/auth/register \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "name=Test User&email=test@example.com&password=test123456"
```

Endi **201 Created** kelishi kerak (409 emas)!

---

## 📋 Checklist:

- [ ] User email'ini aniqlash
- [ ] DELETE endpoint'ni ishlatish
- [ ] Response'ni tekshirish (200 OK)
- [ ] Register qilib tekshirish (201 Created)

---

## 💡 Maslahatlar:

1. **API endpoint ishlating** - Eng oson va xavfsiz usul
2. **Email ishlating** - Email bo'yicha o'chirish qulayroq
3. **Test qiling** - O'chirgandan keyin register qilib tekshiring
4. **Vercel'da** - API endpoint ishlating, chunki fayl vaqtinchalik

---

## ⚠️ Eslatmalar:

1. **O'chirilgan user'ni qayta tiklash mumkin emas**
2. **Vercel'da** - Serverless'da fayl har deployment'da yangilanadi
3. **Production'da** - Real database ishlatish tavsiya etiladi
4. **Backup** - Muhim ma'lumotlarni backup qiling

---

## 🔄 Keyingi Qadamlar:

1. **User'ni o'chiring** (API endpoint orqali)
2. **Register qiling** (yangi yoki o'chirilgan email bilan)
3. **Token oling** va test qiling
