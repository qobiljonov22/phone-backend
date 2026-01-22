# ✅ Postman Collection Yangilandi

## 🔄 Qilingan O'zgarishlar:

### 1. Collection Description Yangilandi
- Vercel deployment URL qo'shildi
- Environment variables haqida ma'lumot
- Setup qo'llanmasi

### 2. Response Example'lar Yangilandi
- Hardcoded `localhost:3001` URL'lar `{{base_url}}` ga o'zgartirildi
- Verification endpoint response'larida

### 3. Default Variable Yangilandi
- `base_url` default value: Vercel deployment URL
- Local development uchun Environment'da o'zgartirish mumkin

### 4. Version Yangilandi
- `1.0.0` → `1.1.0`

---

## 📥 Postman'da Yangilash:

### Usul 1: Qayta Import (Tavsiya etiladi)

1. **Postman'ni oching**
2. **Import** tugmasini bosing
3. **File** ni tanlang
4. `Phone_Store_Postman_Collection.json` ni tanlang
5. **Import** tugmasini bosing
6. **Replace** yoki **Merge** tanlang

### Usul 2: Manual Yangilash

1. **Collection'ni oching**
2. **...** (three dots) → **Edit**
3. **Variables** tab'ni oching
4. `base_url` ni yangilang:
   ```
   https://phone-backend-fkezys5on-qobiljonovumidjon22s-projects.vercel.app
   ```
5. **Save** tugmasini bosing

---

## ✅ Tekshirish:

### 1. Environment'ni Tekshiring:

1. **Environments** → **Phone Store API - Environment**
2. `base_url` ni tekshiring:
   ```
   https://phone-backend-fkezys5on-qobiljonovumidjon22s-projects.vercel.app
   ```

### 2. Collection Variable'ni Tekshiring:

1. **Collection** → **Variables**
2. `base_url` ni tekshiring

### 3. Test Request:

1. **Register** request'ni oching
2. **Send** tugmasini bosing
3. Response'da 201 yoki 200 kelishi kerak

---

## 🔧 Local Development uchun:

Agar local server ishlatmoqchi bo'lsangiz:

1. **Environment'da** `base_url` ni o'zgartiring:
   ```
   http://localhost:3001
   ```

2. Yoki **Collection Variables** da o'zgartiring

---

## 📋 Checklist:

- [x] Collection description yangilandi
- [x] Response example'lar yangilandi
- [x] Default `base_url` Vercel URL'ga o'zgartirildi
- [x] Version yangilandi (1.1.0)
- [ ] Postman'da qayta import qilindi
- [ ] Environment'da `base_url` tekshirildi
- [ ] Test request yuborildi

---

## 💡 Maslahatlar:

1. **Environment ishlating** - Collection variable o'rniga Environment variable ishlatish tavsiya etiladi
2. **Import qiling** - Yangi collection'ni import qilish eng yaxshi usul
3. **Backup qiling** - Eski collection'ni backup qiling
4. **Test qiling** - Har bir endpoint'ni test qiling
