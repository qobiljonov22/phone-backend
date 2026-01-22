# 📍 Qayerdan Bilish - Vercel Environment Variables

## 🎯 1. Vercel Dashboard'ga Kirish

### URL:
```
https://vercel.com/dashboard
```

### Yoki to'g'ridan-to'g'ri:
```
https://vercel.com/login
```

---

## 🔍 2. Project'ni Topish

### Qadam 1: Dashboard'da
1. Vercel Dashboard'ga kiring
2. **Projects** bo'limida `phone-backend` yoki `phone-shop-api` ni toping
3. Project'ni bosing

### Qadam 2: To'g'ridan-to'g'ri Link
Agar project nomini bilsangiz:
```
https://vercel.com/[username]/phone-backend
```

---

## ⚙️ 3. Environment Variables Qayerda?

### Qadam-baqadam:

1. **Project'ni oching** (yugoridagi qadamlar)
2. **Settings** tab'ni bosing (yuqorida)
3. **Environment Variables** bo'limini toping (chap menuda)
4. **Add New** tugmasini bosing

### To'g'ridan-to'g'ri Link:
```
https://vercel.com/[username]/phone-backend/settings/environment-variables
```

---

## 🌐 4. Deployment URL'ni Qayerdan Olish?

### Usul 1: Deployments Tab
1. Project'ni oching
2. **Deployments** tab'ni bosing
3. Eng so'nggi deployment'ni toping
4. **Visit** yoki **URL** ni ko'ring
   - Masalan: `https://phone-backend-abc123.vercel.app`

### Usul 2: Settings → Domains
1. Project'ni oching
2. **Settings** → **Domains**
3. U yerda barcha URL'lar ko'rinadi

### Usul 3: Project Overview
1. Project'ni oching
2. Yuqorida **Overview** bo'limida
3. **Domains** yoki **URL** ko'rinadi

---

## 🔑 5. JWT_SECRET Qayerdan Olish?

### Windows PowerShell:
```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

### Online Generator:
```
https://randomkeygen.com/
```
Yoki:
```
https://www.random.org/strings/
```

### Linux/Mac Terminal:
```bash
openssl rand -base64 32
```

---

## 📊 6. Deployment Status Qayerdan Ko'rish?

### Deployments Tab:
1. Project'ni oching
2. **Deployments** tab'ni bosing
3. Barcha deployment'lar ko'rinadi
4. Status: ✅ Ready, ⏳ Building, ❌ Error

### Real-time Logs:
1. Deployment'ni bosing
2. **Functions** → Function'ni bosing
3. **Logs** tab'ni oching
4. Real-time logs ko'rinadi

---

## 🧪 7. Test Qilish - Qayerdan?

### Browser'da:
```
https://your-project.vercel.app/api/health
```

### Terminal'da (curl):
```bash
curl https://your-project.vercel.app/api/health
```

### Postman'da:
1. Postman'ni oching
2. New Request yarating
3. GET request qiling
4. URL: `https://your-project.vercel.app/api/health`
5. Send tugmasini bosing

---

## 📱 8. Vercel Mobile App

Agar telefon'da ko'rmoqchi bo'lsangiz:
- **App Store** yoki **Google Play** dan "Vercel" qidiring
- Login qiling
- Barcha project'lar va settings'lar ko'rinadi

---

## 🔗 9. Tezkor Linklar

### Dashboard:
- https://vercel.com/dashboard

### Login:
- https://vercel.com/login

### Settings (umumiy):
- https://vercel.com/[username]/[project]/settings

### Environment Variables:
- https://vercel.com/[username]/[project]/settings/environment-variables

### Deployments:
- https://vercel.com/[username]/[project]/deployments

---

## 💡 Maslahatlar:

1. **Bookmark qiling** - Vercel Dashboard'ni browser bookmark qiling
2. **Email notifications** - Vercel deployment status'ni email'ga yuboradi
3. **GitHub Integration** - GitHub'ga push qilsangiz, Vercel avtomatik deploy qiladi
4. **Vercel CLI** - Terminal'da ham boshqarishingiz mumkin:
   ```bash
   npm i -g vercel
   vercel login
   vercel
   ```

---

## ❓ Muammo Bo'lsa:

### Project topilmayapti:
1. GitHub'da repository'ni tekshiring
2. Vercel'da **Add New Project** → **Import Git Repository**
3. Repository'ni tanlang

### Environment Variables ko'rinmayapti:
1. **Settings** → **Environment Variables** ga kiring
2. **Add New** tugmasini bosing
3. Key va Value'ni kiriting
4. **Save** tugmasini bosing
5. **Redeploy** qiling

### Deployment ishlamayapti:
1. **Deployments** → Latest deployment'ni bosing
2. **Logs** ni ko'ring
3. Xatolarni tekshiring
4. **Redeploy** qiling

---

## ✅ Checklist:

- [ ] Vercel Dashboard'ga kirdim: https://vercel.com/dashboard
- [ ] Project'ni topdim
- [ ] Settings → Environment Variables ga kirdim
- [ ] NODE_ENV qo'shdim
- [ ] JWT_SECRET yaratdim va qo'shdim
- [ ] BASE_URL ni deployment URL'dan oldim
- [ ] Redeploy qildim
- [ ] Test qildim
