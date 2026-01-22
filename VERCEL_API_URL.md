# Vercel API URL

## Production URL
```
https://phone-backend-fkezys5on-qobiljonovumidjon22s-projects.vercel.app
```

## API Base URL
```
https://phone-backend-fkezys5on-qobiljonovumidjon22s-projects.vercel.app/api
```

---

## Asosiy Endpoint'lar

### Health Check
```
GET https://phone-backend-fkezys5on-qobiljonovumidjon22s-projects.vercel.app/api/health
```

### API Info
```
GET https://phone-backend-fkezys5on-qobiljonovumidjon22s-projects.vercel.app/api
```

---

## Authentication

### Register
```
POST https://phone-backend-fkezys5on-qobiljonovumidjon22s-projects.vercel.app/api/auth/register
```

**Body (JSON):**
```json
{
  "name": "Ism",
  "email": "email@example.com",
  "password": "parol123",
  "confirmPassword": "parol123",
  "phone": "+998901234567"
}
```

### Login
```
POST https://phone-backend-fkezys5on-qobiljonovumidjon22s-projects.vercel.app/api/auth/login
```

**Body (JSON):**
```json
{
  "email": "email@example.com",
  "password": "parol123"
}
```

### Get Current User
```
GET https://phone-backend-fkezys5on-qobiljonovumidjon22s-projects.vercel.app/api/auth/me
```

**Headers:**
```
Authorization: Bearer <token>
```

---

## Phone Verification

### Send OTP
```
POST https://phone-backend-fkezys5on-qobiljonovumidjon22s-projects.vercel.app/api/verification/send-otp
```

**Body (JSON):**
```json
{
  "phone": "+998901234567"
}
```

### Verify OTP
```
POST https://phone-backend-fkezys5on-qobiljonovumidjon22s-projects.vercel.app/api/verification/verify-otp
```

**Body (JSON):**
```json
{
  "phone": "+998901234567",
  "code": "123456"
}
```

---

## Users

### Get All Users
```
GET https://phone-backend-fkezys5on-qobiljonovumidjon22s-projects.vercel.app/api/users
```

### Get User by ID
```
GET https://phone-backend-fkezys5on-qobiljonovumidjon22s-projects.vercel.app/api/users/:userId
```

### Delete User by Email
```
DELETE https://phone-backend-fkezys5on-qobiljonovumidjon22s-projects.vercel.app/api/users/email/:email
```

---

## Newsletter

### Subscribe
```
POST https://phone-backend-fkezys5on-qobiljonovumidjon22s-projects.vercel.app/api/newsletter/subscribe
```

**Body (JSON):**
```json
{
  "email": "email@example.com",
  "name": "Ism"
}
```

### Unsubscribe
```
POST https://phone-backend-fkezys5on-qobiljonovumidjon22s-projects.vercel.app/api/newsletter/unsubscribe
```

---

## Alerts

### Create Price Alert
```
POST https://phone-backend-fkezys5on-qobiljonovumidjon22s-projects.vercel.app/api/alerts/price
```

### Create Stock Alert
```
POST https://phone-backend-fkezys5on-qobiljonovumidjon22s-projects.vercel.app/api/alerts/stock
```

---

## Modals

### Callback Request
```
POST https://phone-backend-fkezys5on-qobiljonovumidjon22s-projects.vercel.app/api/modals/callback
```

### Low Price Report
```
POST https://phone-backend-fkezys5on-qobiljonovumidjon22s-projects.vercel.app/api/modals/lowprice
```

### One-Click Order
```
POST https://phone-backend-fkezys5on-qobiljonovumidjon22s-projects.vercel.app/api/modals/oneclick
```

### Credit Application
```
POST https://phone-backend-fkezys5on-qobiljonovumidjon22s-projects.vercel.app/api/modals/credit
```

### Trade-In Request
```
POST https://phone-backend-fkezys5on-qobiljonovumidjon22s-projects.vercel.app/api/modals/trade
```

---

## Postman Environment

Postman'da `base_url` environment variable'ni quyidagicha o'rnating:

```
base_url = https://phone-backend-fkezys5on-qobiljonovumidjon22s-projects.vercel.app
```

Keyin barcha request'lar `{{base_url}}/api/...` formatida ishlaydi.

---

## Testing

### Browser'da tekshirish:
1. Health check: https://phone-backend-fkezys5on-qobiljonovumidjon22s-projects.vercel.app/api/health
2. API info: https://phone-backend-fkezys5on-qobiljonovumidjon22s-projects.vercel.app/api

### Postman'da:
1. `Phone_Store_Postman_Collection.json` ni import qiling
2. Environment'da `base_url` ni o'rnating
3. Request'larni test qiling

---

## Notes

- ✅ API database bilan ishlaydi (MongoDB/PostgreSQL yoki in-memory)
- ✅ Barcha endpoint'lar ishlayapti
- ✅ Authentication token kerak (register/login orqali olinadi)
- ⚠️ WebSocket Vercel'da ishlamaydi (faqat local development uchun)

---

## Environment Variables (Vercel)

Vercel Dashboard'da quyidagi environment variable'larni qo'shing:

- `MONGODB_URI` - MongoDB connection string (ixtiyoriy)
- `DATABASE_URL` - PostgreSQL connection string (ixtiyoriy)
- `JWT_SECRET` - JWT token secret key
- `NODE_ENV` - `production`

Database bo'lmasa ham ishlaydi - in-memory storage ishlatiladi.
