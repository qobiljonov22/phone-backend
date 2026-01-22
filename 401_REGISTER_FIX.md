# 🔧 401 Register Endpoint'ida - Yechim

## ❌ Muammo:
**401 Unauthorized** Register endpoint'ida

## ✅ Yechim:

### 1️⃣ `base_url` ni Tekshiring

**Postman'da:**
1. O'ng yuqorida **Environment** dropdown
2. **"Phone Store API - Environment"** tanlanganligini tekshiring
3. **Environments** → **Phone Store API - Environment**
4. `base_url` quyidagicha bo'lishi kerak:
   ```
   https://phone-backend-fkezys5on-qobiljonovumidjon22s-projects.vercel.app
   ```

### 2️⃣ URL'ni To'g'ri Kiriting

**Postman'da:**
- URL: `{{base_url}}/api/auth/register`
- Agar `{{base_url}}` ishlamasa, to'g'ridan-to'g'ri URL kiriting:
  ```
  https://phone-backend-fkezys5on-qobiljonovumidjon22s-projects.vercel.app/api/auth/register
  ```

### 3️⃣ Body Format'ni Tekshiring

**`x-www-form-urlencoded` formatda:**
- ✅ **To'g'ri** - Bu format qo'llab-quvvatlanadi
- Key-Value pairs:
  - `name`: Umidjon
  - `email`: telikx96uwu@gmail.com
  - `password`: 21111999Qu@

**Yoki JSON formatda:**
- Body → **raw** → **JSON** tanlang
- Body:
```json
{
  "name": "Umidjon",
  "email": "telikx96uwu@gmail.com",
  "password": "21111999Qu@"
}
```

### 4️⃣ Headers'ni Tekshiring

**Headers tab'da:**
- `Content-Type` header **avtomatik** qo'shiladi
- `x-www-form-urlencoded` uchun: `application/x-www-form-urlencoded`
- JSON uchun: `application/json`

### 5️⃣ API Ishlamayaptimi?

**Tekshirish:**
1. **API Info** endpoint'ini sinab ko'ring:
   ```
   GET {{base_url}}/api
   ```
2. Agar ishlamasa → Vercel deployment'ni tekshiring

## 🔍 Qaysi Xato?

### 401 Unauthorized:
- ❌ **Register endpoint'ida bo'lishi mumkin emas** - Token talab qilmaydi
- ✅ **Ehtimol:** `base_url` noto'g'ri yoki API ishlamayapti

### 400 Bad Request:
- ✅ **Normal** - Ma'lumot noto'g'ri
- **Yechim:** Body'dagi ma'lumotlarni tekshiring

### 409 Conflict:
- ✅ **Normal** - Email allaqachon mavjud
- **Yechim:** Boshqa email ishlating yoki Login qiling

## 📋 Checklist:

- [ ] Environment tanlangan
- [ ] `base_url` to'g'ri: `https://phone-backend-fkezys5on-qobiljonovumidjon22s-projects.vercel.app`
- [ ] URL to'g'ri: `{{base_url}}/api/auth/register`
- [ ] Body'da `name`, `email`, `password` bor
- [ ] `Content-Type` header mavjud
- [ ] API ishlayapti (GET /api sinab ko'ring)

## 🚀 Tezkor Test:

1. **API Info** endpoint'ini sinab ko'ring:
   ```
   GET {{base_url}}/api
   ```
2. Agar 200 qaytsa → API ishlayapti
3. Endi **Register** ni sinab ko'ring

## 💡 Maslahat:

- **Register endpoint'i token talab qilmaydi**
- Agar 401 bo'lsa → `base_url` yoki API muammosi
- **JSON format** ham ishlaydi
- **`x-www-form-urlencoded`** ham ishlaydi

---

**Agar muammo davom etsa:**
1. `base_url` ni to'g'ridan-to'g'ri URL bilan almashtiring
2. Vercel deployment'ni tekshiring
3. Console'da xatolarni ko'ring
