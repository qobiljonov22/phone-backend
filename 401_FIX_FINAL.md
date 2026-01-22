# 🔧 401 Register - To'liq Yechim

## ❌ Muammo:
**401 Unauthorized** Register endpoint'ida

**Sabab:**
- Request'da `Authorization: Bearer` token bor ❌
- Register endpoint'i token talab qilmaydi
- Token noto'g'ri yoki eskirgan bo'lishi mumkin

## ✅ Yechim:

### 1️⃣ Authorization Header'ni Olib Tashlang

**Postman'da:**
1. **Register** request'ni oching
2. **Headers** tab'ni oching
3. **Authorization** header'ni toping
4. ❌ **O'chiring** yoki **disabled** qiling
5. Yoki **Authorization** tab'da **No Auth** tanlang

### 2️⃣ Body Format'ni To'g'rilang

**Ikkita variant:**

#### Variant A: JSON Format (Tavsiya etiladi)
1. **Body** tab → **raw** → **JSON** tanlang
2. Body'da **o'z ma'lumotlaringizni** kiriting:
```json
{
  "name": "O'z ismingiz",
  "email": "o'z-email@example.com",
  "password": "o'z-parolingiz"
}
```

**Misol:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

#### Variant B: x-www-form-urlencoded
1. **Body** tab → **x-www-form-urlencoded** tanlang
2. Key-Value pairs'da **o'z ma'lumotlaringizni** kiriting:
   - `name`: O'z ismingiz
   - `email`: o'z-email@example.com
   - `password`: o'z-parolingiz

**Misol:**
   - `name`: John Doe
   - `email`: john@example.com
   - `password`: password123

### 3️⃣ Content-Type'ni Tekshiring

**Headers'da:**
- JSON uchun: `Content-Type: application/json`
- x-www-form-urlencoded uchun: `Content-Type: application/x-www-form-urlencoded`
- ❌ **multipart/form-data** bo'lmasligi kerak

### 4️⃣ Request'ni To'liq Tozalash

**Postman'da:**
1. **Register** request'ni oching
2. **Authorization** tab → **No Auth** tanlang
3. **Headers** tab → Barcha Authorization header'larni o'chiring
4. **Body** tab → **raw** → **JSON** tanlang
5. Body'ni to'ldiring
6. **Send** tugmasini bosing

## 📋 To'liq Checklist:

- [ ] **Authorization header yo'q** (No Auth)
- [ ] **Content-Type to'g'ri** (application/json yoki x-www-form-urlencoded)
- [ ] **Body to'ldirilgan** (name, email, password)
- [ ] **URL to'g'ri** (`{{base_url}}/api/auth/register`)
- [ ] **Environment tanlangan**

## 🚀 Qadam-baqadam:

1. **Postman'da Register request'ni oching**
2. **Authorization** tab → **No Auth** tanlang
3. **Headers** tab → Authorization header bor bo'lsa, o'chiring
4. **Body** tab → **raw** → **JSON** tanlang
5. Body'da **o'z ma'lumotlaringizni** kiriting:
```json
{
  "name": "O'z ismingiz",
  "email": "o'z-email@example.com",
  "password": "o'z-parolingiz"
}
```

**Misol:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```
6. **Send** tugmasini bosing
7. ✅ **201 Created** qaytishi kerak

## 💡 Eslatma:

- **Register endpoint'i token talab qilmaydi**
- **Authorization header bo'lmasligi kerak**
- **Login endpoint'i ham token talab qilmaydi**
- **Token faqat boshqa endpoint'larda kerak** (Get Current User, Refresh Token, va h.k.)

## ❌ Xato Bo'lsa:

### 409 Conflict:
- ✅ **Normal** - Email allaqachon mavjud
- **Yechim:** Login qiling yoki boshqa email ishlating

### 400 Bad Request:
- ✅ **Normal** - Ma'lumot noto'g'ri
- **Yechim:** Body'dagi ma'lumotlarni tekshiring

### 401 Unauthorized:
- ❌ **Muammo** - Authorization header bor
- **Yechim:** Authorization header'ni olib tashlang

---

**Tayyor!** Endi Register ishlashi kerak! 🚀
