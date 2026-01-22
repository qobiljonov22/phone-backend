# Postman'da GET Request 401 Xatosi - Qisqa Yechim

## ❌ Muammo
Postman'da GET request qilganda **401 Unauthorized** xatosi kelayapti.

## ✅ Yechim

### 1. Authorization Tab'da No Auth Tanlang

**Postman'da:**
1. Request'ni oching
2. **Authorization** tab'ga o'ting
3. **Type** dropdown'dan **No Auth** tanlang

### 2. Public GET Endpoints (Token talab qilmaydi)

Quyidagi endpoint'lar **public** (token talab qilmaydi):

- ✅ `GET /api` - API info
- ✅ `GET /api/health` - Health check
- ✅ `GET /api/phones` - Get all phones
- ✅ `GET /api/phones/:id` - Get phone by ID
- ✅ `GET /api/search` - Search phones
- ✅ `GET /api/featured` - Get featured phones
- ✅ `GET /api/brands` - Get brands
- ✅ `GET /api/categories` - Get categories
- ✅ `GET /api/filters/options` - Get filter options

**Bu endpoint'lar uchun:**
- Authorization tab'da **No Auth** tanlang

### 3. Protected GET Endpoints (Token kerak)

Quyidagi endpoint'lar uchun **token** kerak:

- 🔒 `GET /api/auth/me` - Get current user
- 🔒 `GET /api/users` - Get all users
- 🔒 `GET /api/users/:userId` - Get user by ID
- 🔒 `GET /api/cart/:userId` - Get user cart
- 🔒 `GET /api/orders/user/:userId` - Get user orders

**Token olish:**
1. **Authentication** → **Login** yoki **Register**
2. Token avtomatik saqlanadi (`auth_token`)
3. Protected endpoint'lar uchun token avtomatik qo'shiladi

## 🔍 Tekshirish

**Public endpoint'ni test qilish:**
1. `GET /api/health` - **No Auth** tanlang
2. **Send** bosing
3. ✅ 200 OK bo'lishi kerak

**Agar 401 bo'lsa:**
1. **Authorization** tab'da **No Auth** tanlang
2. **Headers** tab'da `Authorization` header bor bo'lsa → o'chiring
3. Qayta **Send** bosing

## 💡 Maslahat

- ✅ **Public endpoint'lar** uchun har doim **No Auth** tanlang
- ✅ **Protected endpoint'lar** uchun token avtomatik qo'shiladi
- ✅ **Postman collection** yangilandi - barcha public endpoint'lar uchun `noauth` sozlangan

---

**Tayyor!** Endi GET request'lar to'g'ri ishlaydi! 🚀
