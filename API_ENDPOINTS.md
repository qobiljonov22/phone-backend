# API Endpoints - To'liq Ro'yxat

## Base URL
- **Local**: `http://localhost:3001/api`
- **Vercel**: `https://your-vercel-url.vercel.app/api`

## API Info
```
GET /api
```
Barcha endpoint'lar haqida ma'lumot olish

## Health Check
```
GET /api/health
```
Server holatini tekshirish

---

## 🔐 Authentication (Auth)

### Register
```
POST /api/auth/register
```
**Body:**
```json
{
  "name": "Ism",
  "email": "email@example.com",
  "password": "parol123",
  "confirmPassword": "parol123",
  "phone": "+998901234567",
  "address": {
    "city": "Tashkent",
    "street": "Main Street"
  }
}
```

### Login
```
POST /api/auth/login
```
**Body:**
```json
{
  "email": "email@example.com",
  "password": "parol123"
}
```

### Get Current User
```
GET /api/auth/me
```
**Headers:**
```
Authorization: Bearer <token>
```

### Refresh Token
```
POST /api/auth/refresh
```
**Headers:**
```
Authorization: Bearer <token>
```

### Logout
```
POST /api/auth/logout
```

---

## 📱 Phone Verification

### Send OTP
```
POST /api/verification/send-otp
```
**Body:**
```json
{
  "phone": "+998901234567"
}
```

### Verify OTP
```
POST /api/verification/verify-otp
```
**Body:**
```json
{
  "phone": "+998901234567",
  "code": "123456"
}
```

### Check Verification Status
```
GET /api/verification/status/:phone
```

---

## 👤 Users

### Get All Users
```
GET /api/users
```
**Query:**
- `page` - sahifa raqami
- `limit` - limit
- `search` - qidiruv

### Get User by ID
```
GET /api/users/:userId
```

### Update User
```
PUT /api/users/:userId
```

### Delete User by Email
```
DELETE /api/users/email/:email
```

### Delete User by ID
```
DELETE /api/users/:userId
```

### Get User Wishlist
```
GET /api/users/:userId/wishlist
```

### Add to Wishlist
```
POST /api/users/:userId/wishlist
```
**Body:**
```json
{
  "phoneId": "phone_1",
  "phone": { ... }
}
```

### Remove from Wishlist
```
DELETE /api/users/:userId/wishlist/:phoneId
```

### Update User Preferences
```
PUT /api/users/:userId/preferences
```

---

## 📱 Phones

### Get All Phones
```
GET /api/phones
```
**Query:**
- `page` - sahifa
- `limit` - limit
- `brand` - brand filter
- `category` - category filter
- `minPrice` - minimal narx
- `maxPrice` - maksimal narx
- `sort` - sort (price, name, date)

### Get Phone by ID
```
GET /api/phones/:id
```

### Create Phone
```
POST /api/phones
```
**Headers:**
```
Authorization: Bearer <token>
```

### Update Phone
```
PUT /api/phones/:id
```

### Delete Phone
```
DELETE /api/phones/:id
```

### Bulk Create Phones
```
POST /api/phones/bulk
```

### Bulk Delete Phones
```
DELETE /api/phones/bulk
```

---

## 🔍 Search & Filters

### Search Phones
```
GET /api/search?q=iphone
```

### Get Featured Phones
```
GET /api/featured
```

### Get Brands
```
GET /api/brands
```

### Get Categories
```
GET /api/categories
```

### Get Filters
```
GET /api/filters
```

### Compare Phones
```
POST /api/compare
```
**Body:**
```json
{
  "phoneIds": ["phone_1", "phone_2"]
}
```

---

## 🛒 Cart

### Get User Cart
```
GET /api/cart/:userId
```

### Add to Cart
```
POST /api/cart/:userId
```

### Update Cart Item
```
PUT /api/cart/:userId/:itemId
```

### Remove from Cart
```
DELETE /api/cart/:userId/:itemId
```

### Clear Cart
```
DELETE /api/cart/:userId
```

---

## 📦 Orders

### Get All Orders
```
GET /api/orders
```

### Get Order by ID
```
GET /api/orders/:orderId
```

### Create Order
```
POST /api/orders
```

### Update Order
```
PUT /api/orders/:orderId
```

### Cancel Order
```
DELETE /api/orders/:orderId
```

---

## 💳 Payments

### Get Payment Methods
```
GET /api/payments/methods
```

### Process Payment
```
POST /api/payments/process
```

### Get Payment Status
```
GET /api/payments/:paymentId
```

---

## 📬 Newsletter

### Subscribe
```
POST /api/newsletter/subscribe
```
**Body:**
```json
{
  "email": "email@example.com",
  "name": "Ism"
}
```

### Unsubscribe
```
POST /api/newsletter/unsubscribe
```
**Body:**
```json
{
  "email": "email@example.com"
}
```

### Get All Subscribers (Admin)
```
GET /api/newsletter/subscribers
```

---

## 🔔 Alerts

### Create Price Alert
```
POST /api/alerts/price
```
**Body:**
```json
{
  "phoneId": "phone_1",
  "email": "email@example.com",
  "phone": "+998901234567",
  "targetPrice": 1000000
}
```

### Create Stock Alert
```
POST /api/alerts/stock
```
**Body:**
```json
{
  "phoneId": "phone_1",
  "email": "email@example.com",
  "phone": "+998901234567"
}
```

### Get User Alerts
```
GET /api/alerts/user?email=email@example.com
GET /api/alerts/user?phone=+998901234567
```

### Get All Alerts (Admin)
```
GET /api/alerts
```

### Delete Alert
```
DELETE /api/alerts/:alertId
```

---

## 📞 Modals

### Callback Request
```
POST /api/modals/callback
```
**Body:**
```json
{
  "phone": "+998901234567",
  "name": "Ism",
  "preferredTime": "10:00-12:00",
  "message": "Xabar"
}
```

### Get All Callbacks (Admin)
```
GET /api/modals/callback
```

### Low Price Report
```
POST /api/modals/lowprice
```
**Body:**
```json
{
  "phoneId": "phone_1",
  "competitorUrl": "https://...",
  "competitorPrice": 900000,
  "phone": "+998901234567",
  "name": "Ism",
  "email": "email@example.com"
}
```

### Get All Low Price Reports (Admin)
```
GET /api/modals/lowprice
```

### One-Click Order
```
POST /api/modals/oneclick
```
**Body:**
```json
{
  "phoneId": "phone_1",
  "phone": "+998901234567",
  "name": "Ism",
  "address": "Manzil",
  "paymentMethod": "cash"
}
```

### Credit Application
```
POST /api/modals/credit
```
**Body:**
```json
{
  "phoneId": "phone_1",
  "name": "Ism",
  "phone": "+998901234567",
  "email": "email@example.com",
  "passport": "AB1234567",
  "salary": 5000000,
  "creditAmount": 10000000,
  "months": 12
}
```

### Get All Credit Applications (Admin)
```
GET /api/modals/credit
```

### Trade-In Request
```
POST /api/modals/trade
```
**Body:**
```json
{
  "newPhoneId": "phone_1",
  "oldPhoneBrand": "Samsung",
  "oldPhoneModel": "Galaxy S10",
  "oldPhoneCondition": "good",
  "name": "Ism",
  "phone": "+998901234567",
  "email": "email@example.com"
}
```

### Get All Trade Requests (Admin)
```
GET /api/modals/trade
```

---

## 📊 Dashboard

### Get Dashboard Stats
```
GET /api/dashboard
```

---

## 🔔 Notifications

### Get All Notifications
```
GET /api/notifications
```

### Get Notification by ID
```
GET /api/notifications/:id
```

### Mark as Read
```
PUT /api/notifications/:id/read
```

---

## ⭐ Reviews

### Get All Reviews
```
GET /api/reviews
```

### Get Review by ID
```
GET /api/reviews/:id
```

### Create Review
```
POST /api/reviews
```

### Update Review
```
PUT /api/reviews/:id
```

### Delete Review
```
DELETE /api/reviews/:id
```

---

## 📦 Inventory

### Get Inventory
```
GET /api/inventory/:phoneId
```

### Update Inventory
```
PUT /api/inventory/:phoneId
```

---

## 🖼️ Images

### Upload Image
```
POST /api/images/upload
```
**Content-Type:** `multipart/form-data`

### Get Image
```
GET /api/images/:imageId
```

### Delete Image
```
DELETE /api/images/:imageId
```

---

## 🛡️ Admin

### Get Admin Dashboard
```
GET /api/admin/dashboard
```

### Get Admin Users
```
GET /api/admin/users
```

### Get Admin Orders
```
GET /api/admin/orders
```

---

## 📍 Tracking

### Get Tracking Info
```
GET /api/tracking/:orderId
```

---

## 🔄 WebSocket

### WebSocket Connection
```
ws://localhost:3001
```
**Note:** Faqat local development uchun. Vercel'da ishlamaydi.

---

## Response Format

Barcha response'lar quyidagi formatda:

```json
{
  "success": true,
  "status": "ok",
  "data": { ... },
  "message": "Xabar",
  "links": {
    "self": "...",
    "next": "..."
  },
  "timestamp": "2024-01-01T00:00:00.000Z",
  "version": "1.0.0"
}
```

---

## Error Format

```json
{
  "success": false,
  "status": "error",
  "error": "Error name",
  "message": "Error message",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "version": "1.0.0"
}
```

---

## Authentication

Ko'pchilik endpoint'lar uchun token kerak:

```
Authorization: Bearer <token>
```

Token `POST /api/auth/register` yoki `POST /api/auth/login` orqali olinadi.

---

## Rate Limiting

- **Limit**: 100 requests per 15 minutes
- **Headers**:
  - `X-RateLimit-Limit`
  - `X-RateLimit-Remaining`
  - `X-RateLimit-Reset`

---

## Postman Collection

Postman collection fayl: `Phone_Store_Postman_Collection.json`

Import qiling va test qiling!
