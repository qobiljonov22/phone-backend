# Postman Collection - Qanday Ishlatish

## 📥 Import Qilish

1. **Postman'ni oching**
2. **Import** tugmasini bosing (yuqori chapda)
3. **File** tanlang
4. `Phone_Store_Postman_Collection.json` faylini tanlang
5. **Import** qiling

## 🌍 Environment O'rnatish

1. **Import** tugmasini bosing
2. `Phone_Store_Environment.json` faylini tanlang
3. **Import** qiling
4. O'ng yuqorida **Environment** dropdown'dan **"Phone Store API - Environment"** ni tanlang

## 🔑 Asosiy O'zgaruvchilar

Environment'da quyidagi o'zgaruvchilar mavjud:

- `base_url` - API URL (Vercel deployment)
- `user_id` - Foydalanuvchi ID
- `phone_id` - Telefon ID
- `auth_token` - JWT token (avtomatik saqlanadi)
- `test_phone` - Test telefon raqami
- `otp_code` - OTP kodi (avtomatik saqlanadi)
- `email` - Email manzil

## 📝 Qadam-baqadam Ishlatish

### 1️⃣ Ro'yxatdan O'tish (Register)

1. **Authentication** → **Register** ni oching
2. **Body** bo'limida JSON formatda ma'lumot kiriting:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "+998901234567"
}
```
3. **Send** tugmasini bosing
4. ✅ **Muvaffaqiyatli bo'lsa:**
   - `auth_token` avtomatik saqlanadi
   - `user_id` avtomatik saqlanadi
   - Response'da token va user ma'lumotlari ko'rinadi

### 2️⃣ Kirish (Login)

1. **Authentication** → **Login** ni oching
2. **Body** da email va password kiriting:
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```
3. **Send** tugmasini bosing
4. ✅ **Token avtomatik saqlanadi**

### 3️⃣ OTP Yuborish

1. **Phone Verification** → **Send OTP** ni oching
2. **Body** da telefon raqam kiriting:
```json
{
  "phone": "+998901234567"
}
```
3. **Send** tugmasini bosing
4. ✅ **Response'da OTP kodi ko'rinadi** (development mode)
5. ✅ `test_phone` va `otp_code` avtomatik saqlanadi

### 4️⃣ OTP Tasdiqlash

1. **Phone Verification** → **Verify OTP** ni oching
2. **Body** avtomatik to'ldiriladi (`{{test_phone}}` va `{{otp_code}}`)
3. **Send** tugmasini bosing
4. ✅ **Telefon raqam tasdiqlanadi**

### 5️⃣ Foydalanuvchini O'chirish

**Email orqali:**
1. **Users** → **Delete User by Email** ni oching
2. URL'dagi `{{email}}` ni o'z email'ingiz bilan almashtiring
   - Masalan: `{{base_url}}/api/users/email/test@example.com`
3. **Send** tugmasini bosing

**ID orqali:**
1. **Users** → **Delete User by ID** ni oching
2. `{{user_id}}` avtomatik to'ldiriladi
3. **Send** tugmasini bosing

## 🔐 Token Ishlatish

Token avtomatik saqlanadi va quyidagi endpoint'larda ishlatiladi:

- **Get Current User (Me)** - `Authorization: Bearer {{auth_token}}`
- **Refresh Token** - `Authorization: Bearer {{auth_token}}`
- **Logout** - `Authorization: Bearer {{auth_token}}`

Token **avtomatik** header'ga qo'shiladi.

## 📱 Barcha Endpoint'lar

### Authentication
- ✅ Register (JSON)
- ✅ Login (JSON)
- ✅ Get Current User (Me)
- ✅ Refresh Token
- ✅ Logout

### Phone Verification
- ✅ Send OTP (JSON)
- ✅ Verify OTP (JSON)
- ✅ Check Verification Status

### Users
- ✅ Register User
- ✅ Get User Profile
- ✅ Update User Profile
- ✅ Get All Users
- ✅ Delete User by Email
- ✅ Delete User by ID

### Phones
- ✅ Get All Phones
- ✅ Get Phone by ID
- ✅ Create Phone
- ✅ Update Phone
- ✅ Delete Phone
- ✅ Bulk Create Phones

### Cart
- ✅ Get Cart
- ✅ Add to Cart
- ✅ Update Cart Item
- ✅ Remove from Cart
- ✅ Clear Cart

### Orders
- ✅ Create Order
- ✅ Get User Orders
- ✅ Get Order by ID

### Modals
- ✅ Callback Request
- ✅ Low Price Report
- ✅ One-Click Order
- ✅ Credit Application
- ✅ Trade-In Request

### Newsletter
- ✅ Subscribe
- ✅ Unsubscribe
- ✅ Get Subscribers

### Alerts
- ✅ Create Price Alert
- ✅ Create Stock Alert
- ✅ Get User Alerts
- ✅ Delete Alert

## 🎯 Maslahatlar

1. **Environment'ni tanlang** - Har doim to'g'ri environment tanlanganligini tekshiring
2. **Token saqlanadi** - Login yoki Register'dan keyin token avtomatik saqlanadi
3. **O'zgaruvchilar** - `{{variable_name}}` formatida ishlatiladi
4. **JSON format** - Barcha POST request'lar JSON formatda
5. **Response'ni ko'ring** - Har bir request'dan keyin response'ni tekshiring

## ❓ Muammo Bo'lsa

1. **401 Unauthorized** - Token yo'q yoki eskirgan
   - **Yechim:** Qayta login qiling
   
2. **409 Conflict** - Email allaqachon mavjud
   - **Yechim:** Boshqa email ishlating yoki foydalanuvchini o'chiring
   
3. **400 Bad Request** - Noto'g'ri ma'lumot
   - **Yechim:** Body'dagi ma'lumotlarni tekshiring

## 🔄 Yangilash

Agar collection yangilansa:
1. **Collection** → **...** (3 nuqta) → **Export**
2. Eski faylni saqlang
3. Yangi faylni import qiling

---

**Tayyor!** Endi Postman'da API'ni sinab ko'rishingiz mumkin! 🚀
