# Postman'da GET Request 401 Xatosi - To'liq Yechim

## ❌ Muammo
Postman'da GET request qilganda **401 Unauthorized** xatosi kelayapti.

## ✅ Yechim

### 1. Public Endpoint'lar uchun Authorization Header'ni O'chirish

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

### 3. Public GET Endpoints (Authentication talab qilmaydi)

Quyidagi GET endpoint'lar **public** (token talab qilmaydi):

- ✅ `GET /api` - API info
- ✅ `GET /api/health` - Health check
- ✅ `GET /api/phones` - Get all phones
- ✅ `GET /api/phones/:id` - Get phone by ID
- ✅ `GET /api/search` - Search phones
- ✅ `GET /api/featured` - Get featured phones
- ✅ `GET /api/brands` - Get brands
- ✅ `GET /api/categories` - Get categories ⭐
- ✅ `GET /api/filters/options` - Get filter options
- ✅ `GET /api/payments/methods` - Get payment methods
- ✅ `GET /api/reviews/phone/:phoneId` - Get reviews for phone
- ✅ `GET /api/verification/status/:phone` - Check verification status

**Bu endpoint'lar uchun:**
- Authorization tab'da **No Auth** tanlang
- Yoki Pre-request Script qo'shing

### 4. Protected GET Endpoints (Token kerak)

Quyidagi GET endpoint'lar uchun **token** kerak:

- 🔒 `GET /api/auth/me` - Get current user
- 🔒 `GET /api/users` - Get all users
- 🔒 `GET /api/users/:userId` - Get user by ID
- 🔒 `GET /api/users/:userId/wishlist` - Get user wishlist
- 🔒 `GET /api/cart/:userId` - Get user cart
- 🔒 `GET /api/orders/user/:userId` - Get user orders
- 🔒 `GET /api/orders/:orderId` - Get order by ID
- 🔒 `GET /api/alerts/user` - Get user alerts
- 🔒 `GET /api/wishlist/:userId` - Get wishlist
- 🔒 `GET /api/notifications/user/:userId` - Get notifications
- 🔒 `GET /api/tracking/:orderId` - Get tracking info
- 🔒 `GET /api/admin/*` - Admin endpoints

**Token olish:**
1. `POST /api/auth/register` yoki `POST /api/auth/login` orqali token oling
2. Response'dan `data.token` ni oling
3. Keyingi request'larda `Authorization: Bearer <token>` header'ini qo'shing

### 5. Postman Collection'da Avtomatik Sozlash

**Collection Level Pre-request Script:**

Postman collection'da barcha public endpoint'lar uchun avtomatik sozlangan:
- ✅ `noauth` type
- ✅ Pre-request script Authorization header'ni o'chiradi

**Agar 401 bo'lsa:**
1. Request'ni oching
2. **Authorization** tab'da **No Auth** tanlang
3. Yoki **Pre-request Script** tab'da script borligini tekshiring

### 6. Tekshirish

**Public endpoint'ni test qilish:**
1. `GET /api/health` - Token bo'lmasa ham ishlashi kerak
2. `GET /api/categories` - Token bo'lmasa ham ishlashi kerak
3. `GET /api/phones` - Token bo'lmasa ham ishlashi kerak

**Protected endpoint'ni test qilish:**
1. Avval **Login** yoki **Register** qiling
2. Token avtomatik saqlanadi (`auth_token`)
3. Keyin protected endpoint'ga request qiling
4. Token avtomatik qo'shiladi

## 🔍 Muammo Tuzatish

### 401 xatosi kelayapti:

1. **Authorization tab'ni tekshiring:**
   - Public endpoint uchun: **No Auth** tanlang
   - Protected endpoint uchun: **Bearer Token** tanlang va `{{auth_token}}` kiriting

2. **Headers tab'ni tekshiring:**
   - `Authorization` header bor bo'lsa va public endpoint bo'lsa → o'chiring
   - `Authorization` header yo'q bo'lsa va protected endpoint bo'lsa → qo'shing

3. **Pre-request Script'ni tekshiring:**
   - Public endpoint uchun script borligini tekshiring
   - Script Authorization header'ni o'chirayotganini tekshiring

4. **Token'ni tekshiring:**
   - Environment'da `auth_token` borligini tekshiring
   - Token eskirgan bo'lishi mumkin → Qayta login qiling

## 💡 Maslahat

- ✅ **Public endpoint'lar** uchun har doim **No Auth** tanlang
- ✅ **Protected endpoint'lar** uchun **Bearer Token** va `{{auth_token}}` ishlating
- ✅ **Pre-request Script** qo'shing - avtomatik ishlaydi
- ✅ **Token eskirgan bo'lsa** → Qayta login qiling

---

**Tayyor!** Endi GET request'lar to'g'ri ishlaydi! 🚀
