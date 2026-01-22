# 🔑 Token Qo'llanmasi

## 🎯 JWT_SECRET Yaratish (Environment Variable uchun)

### Windows PowerShell:
```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

### Online Generator:
1. https://randomkeygen.com/ ga kiring
2. "CodeIgniter Encryption Keys" ni tanlang
3. Birinchi key'ni copy qiling

### Linux/Mac Terminal:
```bash
openssl rand -base64 32
```

---

## 🔐 Authentication Token Olish (API uchun)

### 1. Register qilib token olish:

**Postman'da:**
1. **POST** `/api/auth/register`
2. Body (JSON):
```json
{
  "name": "Test User",
  "email": "test@example.com",
  "password": "test123456"
}
```
3. Response'da `token` keladi:
```json
{
  "success": true,
  "data": {
    "user": {...},
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 2. Login qilib token olish:

**Postman'da:**
1. **POST** `/api/auth/login`
2. Body (JSON):
```json
{
  "email": "test@example.com",
  "password": "test123456"
}
```
3. Response'da `token` keladi

---

## 📝 Postman'da Token Ishlatish

### Automatic Token Save:

Postman collection'da test script'lar bor:
```javascript
// Register yoki Login response'dan token'ni avtomatik saqlaydi
if (pm.response.code === 200 || pm.response.code === 201) {
    const response = pm.response.json();
    if (response.data && response.data.token) {
        pm.environment.set("auth_token", response.data.token);
    }
}
```

### Manual Token Set:

1. Register yoki Login qiling
2. Response'dan `token` ni copy qiling
3. Postman → Environment → `auth_token` variable'ga qo'ying

### Token'ni Request'da Ishlatish:

1. Request'ni oching
2. **Authorization** tab'ni bosing
3. **Type:** Bearer Token
4. **Token:** `{{auth_token}}` (environment variable)

---

## 🧪 Test Qilish

### 1. Register:
```bash
curl -X POST https://phone-backend-fkezys5on-qobiljonovumidjon22s-projects.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"test123456"}'
```

### 2. Login:
```bash
curl -X POST https://phone-backend-fkezys5on-qobiljonovumidjon22s-projects.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123456"}'
```

### 3. Token bilan Request:
```bash
curl -X GET https://phone-backend-fkezys5on-qobiljonovumidjon22s-projects.vercel.app/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 🔄 Token Refresh

### Refresh Token Endpoint:
```bash
POST /api/auth/refresh
```

Body:
```json
{
  "token": "your-current-token"
}
```

---

## 📋 Checklist

### JWT_SECRET (Environment Variable):
- [ ] JWT_SECRET yaratildi (random string)
- [ ] Vercel'da Environment Variables'ga qo'shildi
- [ ] Production, Preview, Development uchun qo'shildi
- [ ] Redeploy qilindi

### Authentication Token (API):
- [ ] Register qilindi
- [ ] Token olindi
- [ ] Postman'da `auth_token` variable'ga saqlandi
- [ ] Token bilan protected endpoint test qilindi

---

## 💡 Maslahatlar

1. **JWT_SECRET** - Environment variable (Vercel'da)
2. **auth_token** - API token (Postman'da yoki frontend'da)
3. **Token expiry** - 7 kun (default)
4. **Token refresh** - `/api/auth/refresh` endpoint'idan foydalaning
5. **Token storage** - Postman environment variable'da saqlang

---

## 🐛 Muammo Bo'lsa

### Token ishlamayapti:
- Token'ni to'g'ri copy qilganingizni tekshiring
- Token expired bo'lishi mumkin (7 kun)
- JWT_SECRET to'g'ri sozlanganini tekshiring

### Register/Login ishlamayapti:
- Email va password to'g'ri kiritilganini tekshiring
- API endpoint'ni tekshiring
- Vercel deployment ishlayotganini tekshiring
