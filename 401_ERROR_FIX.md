# 🔧 401 Error Fix - Qadam-baqadam

## ❌ Muammo:
**401 Unauthorized** - Register endpoint'da xato

## 🔍 Sabablar:

### 1. base_url noto'g'ri
- Postman Environment'da `base_url` hali `localhost:3001`
- Vercel deployment URL'ga o'zgartirish kerak

### 2. Required field'lar bo'sh
- `name`, `email`, `password` to'ldirilmagan

### 3. API endpoint noto'g'ri
- Vercel deployment ishlamayapti

---

## ✅ Yechim:

### Qadam 1: Postman Environment'ni yangilang

1. **Postman'da** → **Environments** (o'ng tomonda)
2. **Phone Store API - Environment** ni oching
3. `base_url` ni yangilang:
   ```
   https://phone-backend-fkezys5on-qobiljonovumidjon22s-projects.vercel.app
   ```
4. **Save** tugmasini bosing

### Qadam 2: Required Field'larni To'ldiring

**Postman'da Register request'da:**

1. **Body** tab'ni oching
2. **x-www-form-urlencoded** tanlangan bo'lishi kerak
3. Quyidagi field'larni to'ldiring:

```
✅ name: Test User
✅ email: test@example.com
✅ password: test123456
```

**Optional field'lar:**
- phone: +998901234567
- address[city]: Tashkent
- address[street]: Main Street
- preferences[notifications]: true
- preferences[newsletter]: false
- preferences[currency]: USD
- preferences[language]: en

### Qadam 3: Send Tugmasini Bosing

---

## 🧪 Test Qilish

### 1. Environment'ni Tekshiring:

Postman'da:
1. **Environments** → **Phone Store API - Environment**
2. `base_url` ni tekshiring:
   ```
   https://phone-backend-fkezys5on-qobiljonovumidjon22s-projects.vercel.app
   ```

### 2. Request'ni Tekshiring:

1. **POST** `/api/auth/register`
2. **Body** → **x-www-form-urlencoded**
3. **Required field'lar to'ldirilgan:**
   - ✅ name
   - ✅ email
   - ✅ password

### 3. Send Qiling:

Response'da quyidagilar kelishi kerak:
```json
{
  "success": true,
  "status": "registered",
  "data": {
    "user": {...},
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

## 📋 Checklist:

- [ ] Postman Environment'da `base_url` yangilandi
- [ ] `name` field to'ldirildi
- [ ] `email` field to'ldirildi
- [ ] `password` field to'ldirildi (min 6 belgi)
- [ ] Body mode: `x-www-form-urlencoded`
- [ ] Send tugmasi bosildi
- [ ] Response'da token olindi

---

## 🐛 Boshqa Muammolar:

### 400 Bad Request:
- Required field'lar to'ldirilmagan
- Email format noto'g'ri
- Password 6 belgidan kam

### 409 Conflict:
- Email allaqachon mavjud
- Login qiling yoki boshqa email ishlating

### 500 Internal Server Error:
- Vercel deployment ishlamayapti
- Logs'ni tekshiring

---

## 💡 Maslahatlar:

1. **Environment'ni tanlang** - Postman'da to'g'ri environment tanlanganini tekshiring
2. **base_url** - Vercel deployment URL'ni ishlating
3. **Required field'lar** - name, email, password mutlaqo to'ldirilishi kerak
4. **Email format** - to'g'ri email format (test@example.com)
5. **Password** - kamida 6 belgi
