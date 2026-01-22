# Postman'da 401 Xatosi - To'liq Yechim

## ❌ Muammo
Postman'da request yuborganida **401 Unauthorized** xatosi kelayapti.

## ✅ Yechim

### 1. Authorization Header'ni O'chirish

**Postman'da:**
1. Request'ni oching
2. **Authorization** tab'ga o'ting
3. **Type** dropdown'dan **No Auth** tanlang
4. Yoki **Headers** tab'da **Authorization** header'ni o'chiring

### 2. Pre-request Script Qo'shish

Agar har safar o'chirishni xohlamasangiz, **Pre-request Script** qo'shing:

**Postman'da:**
1. Request'ni oching
2. **Pre-request Script** tab'ga o'ting
3. Quyidagi kodni qo'shing:

```javascript
// Remove Authorization header for public endpoints
pm.request.headers.remove('Authorization');
console.log('✅ Authorization header removed');
```

### 3. Public Endpoints (Authentication talab qilmaydi)

Quyidagi endpoint'lar **public** (token talab qilmaydi):

- ✅ `GET /api/health`
- ✅ `GET /api/phones`
- ✅ `GET /api/search`
- ✅ `GET /api/featured`
- ✅ `GET /api/brands`
- ✅ `GET /api/categories` ⭐
- ✅ `POST /api/auth/register`
- ✅ `POST /api/auth/login`
- ✅ `POST /api/verification/send-otp`
- ✅ `POST /api/verification/verify-otp`
- ✅ `POST /api/newsletter/subscribe`
- ✅ `POST /api/modals/*`
- ✅ `POST /api/alerts/*`

**Bu endpoint'lar uchun:**
- Authorization tab'da **No Auth** tanlang
- Yoki Pre-request Script qo'shing

### 4. Protected Endpoints (Token kerak)

Quyidagi endpoint'lar uchun **token** kerak:

- 🔒 `GET /api/auth/me`
- 🔒 `POST /api/auth/refresh`
- 🔒 `GET /api/users`
- 🔒 `GET /api/users/:userId`
- 🔒 `PUT /api/users/:userId`
- 🔒 `DELETE /api/users/:userId`

**Token olish:**
1. `POST /api/auth/register` yoki `POST /api/auth/login` orqali token oling
2. Response'dan `data.token` ni oling
3. Keyingi request'larda `Authorization: Bearer <token>` header'ini qo'shing

### 5. Postman Collection'da Avtomatik Sozlash

**Collection Level Pre-request Script:**

1. **Phone Store API - Complete Collection** ga o'ng click
2. **Edit** ni tanlang
3. **Pre-request Script** tab'ga o'ting
4. Quyidagi kodni qo'shing:

```javascript
// Public endpoints list
const publicEndpoints = [
    '/api/health',
    '/api/phones',
    '/api/search',
    '/api/featured',
    '/api/brands',
    '/api/categories',
    '/api/auth/register',
    '/api/auth/login',
    '/api/verification',
    '/api/newsletter/subscribe',
    '/api/modals',
    '/api/alerts'
];

// Get current request path
const requestPath = pm.request.url.toString();

// Check if current endpoint is public
const isPublic = publicEndpoints.some(endpoint => requestPath.includes(endpoint));

// Remove Authorization header for public endpoints
if (isPublic) {
    pm.request.headers.remove('Authorization');
    console.log('✅ Public endpoint - Authorization header removed');
} else {
    // For protected endpoints, add token if available
    const token = pm.environment.get('auth_token');
    if (token && !pm.request.headers.has('Authorization')) {
        pm.request.headers.add({
            key: 'Authorization',
            value: `Bearer ${token}`
        });
        console.log('✅ Token added for protected endpoint');
    }
}
```

### 6. Categories Endpoint - Maxsus Sozlash

**Categories endpoint'i uchun:**

1. **Get All Categories** request'ni oching
2. **Authorization** tab → **No Auth** tanlang
3. **Pre-request Script** tab'ga quyidagi kodni qo'shing:

```javascript
// Remove Authorization header for Categories
pm.request.headers.remove('Authorization');
console.log('✅ Authorization header removed for Categories');
```

### 7. Tekshirish

**URL:**
```
GET https://phone-backend-fkezys5on-qobiljonovumidjon22s-projects.vercel.app/api/categories
```

**Headers:**
- `Content-Type: application/json` (ixtiyoriy)
- ❌ **Authorization header BO'LMASLIGI KERAK!**

**Response:**
```json
{
  "categories": [...],
  "total": 5
}
```

## 📋 Checklist

- [ ] Authorization tab'da **No Auth** tanlangan
- [ ] Headers'da Authorization header yo'q
- [ ] Pre-request Script qo'shilgan (ixtiyoriy)
- [ ] URL to'g'ri (`{{base_url}}/api/categories`)
- [ ] Environment'da `base_url` o'rnatilgan

## 🔧 Troubleshooting

### Agar hali ham 401 bo'lsa:

1. **Collection Level Authorization'ni tekshiring:**
   - Collection → Edit → Authorization tab
   - **Inherit auth from parent** o'chirilgan bo'lishi kerak
   - Yoki **No Auth** tanlang

2. **Environment Variable'ni tekshiring:**
   - `base_url` to'g'ri o'rnatilganligini tekshiring
   - `auth_token` mavjud bo'lsa, public endpoint'lar uchun o'chirilganligini tekshiring

3. **Request'ni yangilash:**
   - Request'ni saqlang
   - Postman'ni qayta ishga tushiring
   - Request'ni qayta yuboring

## Notes

- ✅ Categories endpoint'i **public** - authentication talab qilmaydi
- ✅ Postman collection yangilandi - avtomatik Authorization header o'chiriladi
- ✅ Pre-request Script qo'shildi - har safar avtomatik o'chiriladi
