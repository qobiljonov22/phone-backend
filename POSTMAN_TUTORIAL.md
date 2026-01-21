# Postman'da Authentication API - Qanday Ishlatish

## 1. Collection va Environment Import Qilish

### Qadam 1: Collection Import
1. Postman'ni oching
2. **Import** tugmasini bosing (yuqori chapda)
3. `Phone_Store_Postman_Collection.json` faylini tanlang
4. **Import** tugmasini bosing

### Qadam 2: Environment Import
1. Yana **Import** tugmasini bosing
2. `Phone_Store_Environment.json` faylini tanlang
3. **Import** tugmasini bosing

### Qadam 3: Environment Tanlash
1. Yuqori o'ngda **Environments** dropdown'ni oching
2. **Phone Store API - Environment** ni tanlang

---

## 2. Register (Ro'yxatdan o'tish)

### Qadam 1: Request Tanlash
1. **Phone Store API - Complete Collection** ni kengaytiring
2. **Authentication** folder'ini oching
3. **Register** request'ni tanlang

### Qadam 2: Body Tahrirlash
**Body** tab'ga o'ting va quyidagilarni kiriting:

```json
{
  "name": "Test User",
  "email": "test@example.com",
  "password": "password123",
  "phone": "+998901234567",
  "address": {
    "city": "Tashkent",
    "street": "Test Street 123"
  }
}
```

### Qadam 3: Request Yuborish
1. **Send** tugmasini bosing
2. Response'ni ko'ring

### Qadam 4: Token Saqlash (Muhim!)
Response'dan `token` ni olish va saqlash:

**Test Script qo'shish:**
1. **Tests** tab'ga o'ting
2. Quyidagi kodni yozing:

```javascript
if (pm.response.code === 201) {
    const jsonData = pm.response.json();
    if (jsonData.success && jsonData.data.token) {
        pm.environment.set("auth_token", jsonData.data.token);
        pm.environment.set("user_id", jsonData.data.user.userId);
        console.log("✅ Token saved:", jsonData.data.token);
        console.log("✅ User ID saved:", jsonData.data.user.userId);
    }
}
```

3. **Send** tugmasini yana bosing
4. Token avtomatik saqlanadi!

---

## 3. Login (Kirish)

### Qadam 1: Request Tanlash
1. **Authentication** folder'ida
2. **Login** request'ni tanlang

### Qadam 2: Body Tahrirlash
**Body** tab'ga o'ting:

```json
{
  "email": "test@example.com",
  "password": "password123"
}
```

### Qadam 3: Request Yuborish
1. **Send** tugmasini bosing
2. Response'ni ko'ring

### Qadam 4: Token Saqlash
**Tests** tab'ga quyidagi kodni qo'shing:

```javascript
if (pm.response.code === 200) {
    const jsonData = pm.response.json();
    if (jsonData.success && jsonData.data.token) {
        pm.environment.set("auth_token", jsonData.data.token);
        pm.environment.set("user_id", jsonData.data.user.userId);
        console.log("✅ Login successful! Token saved.");
    }
}
```

---

## 4. Get Current User (Me) - Token Bilan

### Qadam 1: Request Tanlash
1. **Authentication** folder'ida
2. **Get Current User (Me)** request'ni tanlang

### Qadam 2: Header Tekshirish
**Headers** tab'ga o'ting va quyidagini ko'ring:

```
Authorization: Bearer {{auth_token}}
```

Bu avtomatik environment'dan token'ni oladi!

### Qadam 3: Request Yuborish
1. **Send** tugmasini bosing
2. Agar token to'g'ri bo'lsa, user ma'lumotlari ko'rinadi

---

## 5. Protected Route'larni Test Qilish

### Misol: Cart API

### Qadam 1: Cart Request Tanlash
1. **Cart** folder'ini oching
2. **Get Cart** request'ni tanlang

### Qadam 2: URL Tekshirish
URL quyidagicha bo'lishi kerak:
```
{{base_url}}/api/cart/{{user_id}}
```

### Qadam 3: Authorization Qo'shish
Agar request'da Authorization header bo'lmasa:

1. **Headers** tab'ga o'ting
2. **Authorization** header qo'shing:
   - Key: `Authorization`
   - Value: `Bearer {{auth_token}}`

### Qadam 4: Request Yuborish
1. **Send** tugmasini bosing
2. Response'ni ko'ring

---

## 6. Environment Variables Ko'rish

### Qadam 1: Environment O'zgaruvchilarini Ko'rish
1. Yuqori o'ngda **Environments** dropdown'ni oching
2. **Phone Store API - Environment** ni tanlang
3. **Eye icon** (👁️) ni bosing

### Qadam 2: O'zgaruvchilar
Quyidagi o'zgaruvchilar ko'rinadi:
- `base_url` = `http://localhost:3001`
- `auth_token` = (Register/Login dan keyin to'ldiriladi)
- `user_id` = (Register/Login dan keyin to'ldiriladi)
- `phone_id` = `iphone-15-pro`
- va boshqalar...

---

## 7. Pre-request Script (Avtomatik Token)

Agar har safar token'ni qo'lda qo'shishni xohlamasangiz:

### Qadam 1: Collection Level Script
1. **Phone Store API - Complete Collection** ga o'ng click
2. **Edit** ni tanlang
3. **Pre-request Script** tab'ga o'ting
4. Quyidagi kodni qo'shing:

```javascript
// Avtomatik token qo'shish (agar mavjud bo'lsa)
const token = pm.environment.get("auth_token");
if (token && !pm.request.headers.has("Authorization")) {
    pm.request.headers.add({
        key: "Authorization",
        value: `Bearer ${token}`
    });
}
```

Bu har bir request'ga avtomatik token qo'shadi!

---

## 8. Test Script Misollari

### Register Test Script:
```javascript
// Status code tekshirish
pm.test("Status code is 201", function () {
    pm.response.to.have.status(201);
});

// Response structure tekshirish
pm.test("Response has success field", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('success');
    pm.expect(jsonData.success).to.eql(true);
});

// Token mavjudligini tekshirish
pm.test("Token is returned", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.data).to.have.property('token');
    
    // Token'ni saqlash
    if (jsonData.data.token) {
        pm.environment.set("auth_token", jsonData.data.token);
        pm.environment.set("user_id", jsonData.data.user.userId);
    }
});
```

### Login Test Script:
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Login successful", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.success).to.eql(true);
    pm.expect(jsonData.status).to.eql("authenticated");
    
    // Token saqlash
    if (jsonData.data.token) {
        pm.environment.set("auth_token", jsonData.data.token);
        pm.environment.set("user_id", jsonData.data.user.userId);
    }
});
```

### Me (Get Current User) Test Script:
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("User data is returned", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.success).to.eql(true);
    pm.expect(jsonData.data).to.have.property('user');
    pm.expect(jsonData.data.user).to.have.property('email');
});
```

---

## 9. Collection Runner (Bir Nechta Request)

### Qadam 1: Collection Runner Ochish
1. **Phone Store API - Complete Collection** ga o'ng click
2. **Run collection** ni tanlang

### Qadam 2: Request'larni Tanlash
1. Faqat **Authentication** folder'idagi request'larni tanlang
2. **Run Phone Store API** tugmasini bosing

### Qadam 3: Natijalarni Ko'rish
- Barcha request'lar ketma-ket bajariladi
- Token avtomatik saqlanadi
- Har bir request natijasi ko'rsatiladi

---

## 10. Troubleshooting (Muammolarni Hal Qilish)

### Muammo 1: "Unauthorized" xatosi
**Yechim:**
1. **Login** yoki **Register** request'ni yuboring
2. Token saqlanganligini tekshiring (Environment variables)
3. **Authorization** header to'g'ri ekanligini tekshiring

### Muammo 2: Token saqlanmayapti
**Yechim:**
1. **Tests** tab'da script borligini tekshiring
2. Environment tanlanganligini tekshiring
3. Console'da xatolarni ko'ring (Postman Console: View → Show Postman Console)

### Muammo 3: "Invalid token" xatosi
**Yechim:**
1. Token muddati o'tgan bo'lishi mumkin
2. **Refresh Token** request'ni yuboring
3. Yoki qayta **Login** qiling

### Muammo 4: Variable ishlamayapti
**Yechim:**
1. Environment tanlanganligini tekshiring
2. Variable nomi to'g'ri ekanligini tekshiring: `{{auth_token}}`
3. Variable qiymati mavjudligini tekshiring

---

## 11. Quick Start (Tezkor Boshlash)

### Eng Tez Yo'l:
1. **Register** request'ni yuborish
2. **Tests** tab'da token saqlash script'i borligini tekshirish
3. **Get Current User (Me)** request'ni yuborish
4. Token ishlayotganini ko'rish ✅

### Video Tutorial (Qadam-baqadam):
1. Postman'ni oching
2. Collection import qiling
3. Environment import qiling
4. Environment tanlang
5. **Register** request'ni yuboring
6. Response'dan token'ni ko'ring
7. **Get Current User (Me)** request'ni yuboring
8. User ma'lumotlari ko'rinadi! 🎉

---

## 12. Foydali Maslahatlar

### Tip 1: Token Avtomatik Yangilash
**Refresh Token** request'ga Pre-request Script qo'shing:

```javascript
// Token muddati tekshirish va yangilash
const token = pm.environment.get("auth_token");
if (token) {
    // Token decode qilish (oddiy versiya)
    const parts = token.split('.');
    if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1]));
        const exp = payload.exp;
        const now = Math.floor(Date.now() / 1000);
        
        // 1 kundan kam qolsa, yangilash
        if (exp - now < 86400) {
            console.log("Token expires soon, refreshing...");
            // Refresh token request yuborish
        }
    }
}
```

### Tip 2: Response Formatting
Postman'da response'ni chiroyli ko'rish:
1. **Pretty** tab'ni tanlang
2. **JSON** format tanlang
3. Response chiroyli ko'rinadi

### Tip 3: Save Response
Response'ni saqlash:
1. **Save Response** tugmasini bosing
2. **Save as Example** ni tanlang
3. Keyinchalik foydalanish uchun saqlanadi

---

## 13. Misol: To'liq Workflow

### Step 1: Register
```
POST /api/auth/register
Body: { name, email, password }
→ Token olinadi va saqlanadi
```

### Step 2: Get Me
```
GET /api/auth/me
Headers: Authorization: Bearer {{auth_token}}
→ User ma'lumotlari ko'rinadi
```

### Step 3: Add to Cart
```
POST /api/cart/{{user_id}}/add
Headers: Authorization: Bearer {{auth_token}}
Body: { phoneId, quantity, price, phone }
→ Mahsulot savatga qo'shiladi
```

### Step 4: Get Cart
```
GET /api/cart/{{user_id}}
Headers: Authorization: Bearer {{auth_token}}
→ Savat ma'lumotlari ko'rinadi
```

### Step 5: Create Order
```
POST /api/orders
Headers: Authorization: Bearer {{auth_token}}
Body: { userId, items, shippingAddress, paymentMethod, total }
→ Buyurtma yaratiladi
```

---

## Xulosa

1. ✅ Collection va Environment import qiling
2. ✅ Register yoki Login qiling
3. ✅ Token avtomatik saqlanadi (Test Script bilan)
4. ✅ Boshqa request'larda `{{auth_token}}` ishlatiladi
5. ✅ Protected route'lar ishlaydi!

**Muhim:** Har doim Environment tanlanganligini tekshiring! 🎯
