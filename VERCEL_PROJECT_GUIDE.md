# 🎯 Sizning Vercel Project'ingiz

## 📍 Project URL:
**https://vercel.com/qobiljonovumidjon22s-projects/phone-backend**

---

## ⚙️ Environment Variables Sozlash

### Qadam 1: Settings'ga kiring
```
https://vercel.com/qobiljonovumidjon22s-projects/phone-backend/settings
```

### Qadam 2: Environment Variables'ga kiring
```
https://vercel.com/qobiljonovumidjon22s-projects/phone-backend/settings/environment-variables
```

Yoki:
1. Project page'da **Settings** tab'ni bosing
2. Chap menuda **Environment Variables** ni bosing
3. **Add New** tugmasini bosing

---

## 🌐 Deployment URL'ni Olish

### Usul 1: Domains bo'limidan
```
https://vercel.com/qobiljonovumidjon22s-projects/phone-backend/settings/domains
```

### Usul 2: Deployments bo'limidan
```
https://vercel.com/qobiljonovumidjon22s-projects/phone-backend/deployments
```
1. Eng so'nggi deployment'ni bosing
2. **Visit** yoki **URL** ni ko'ring

### Usul 3: Overview bo'limidan
```
https://vercel.com/qobiljonovumidjon22s-projects/phone-backend
```
- Yuqorida **Domains** yoki **URL** ko'rinadi

---

## 🔑 Majburiy Environment Variables

### 1. NODE_ENV
```
Key: NODE_ENV
Value: production
Environment: ✅ Production ✅ Preview ✅ Development
```

### 2. JWT_SECRET
```
Key: JWT_SECRET
Value: <random-string>
Environment: ✅ Production ✅ Preview ✅ Development

Yaratish:
- Online: https://randomkeygen.com/
- PowerShell: [Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

### 3. BASE_URL
```
Key: BASE_URL
Value: <deployment-url>
Environment: ✅ Production ✅ Preview ✅ Development

Qayerdan olish:
1. Settings → Domains
2. Yoki Deployments → Latest → Visit
3. Masalan: https://phone-backend-abc123.vercel.app
```

### 4. WEBSOCKET_URL (ixtiyoriy)
```
Key: WEBSOCKET_URL
Value: wss://<deployment-url>
Environment: ✅ Production ✅ Preview ✅ Development

Eslatma: Vercel'da WebSocket ishlamaydi, lekin variable qo'shish mumkin
```

---

## 📝 Qadam-baqadam Sozlash

### 1. Environment Variables'ga kiring:
```
https://vercel.com/qobiljonovumidjon22s-projects/phone-backend/settings/environment-variables
```

### 2. Har bir variable uchun:
- **Key** ni kiriting (masalan: `NODE_ENV`)
- **Value** ni kiriting (masalan: `production`)
- **Environment** ni tanlang:
  - ✅ Production
  - ✅ Preview  
  - ✅ Development
- **Save** tugmasini bosing

### 3. Redeploy qiling:
```
https://vercel.com/qobiljonovumidjon22s-projects/phone-backend/deployments
```
1. Eng so'nggi deployment'ni toping
2. **...** (three dots) → **Redeploy**
3. Yoki yangi commit push qiling (auto-deploy)

---

## 🧪 Test Qilish

### Health Check:
Deployment URL'ni oling va test qiling:
```bash
curl https://your-deployment-url.vercel.app/api/health
```

### API Info:
```bash
curl https://your-deployment-url.vercel.app/api
```

---

## 📊 Deployment Status

### Deployments'ni ko'rish:
```
https://vercel.com/qobiljonovumidjon22s-projects/phone-backend/deployments
```

### Logs'ni ko'rish:
1. Deployment'ni bosing
2. **Functions** → Function'ni bosing
3. **Logs** tab'ni oching

---

## 🔗 Tezkor Linklar

### Project Overview:
- https://vercel.com/qobiljonovumidjon22s-projects/phone-backend

### Settings:
- https://vercel.com/qobiljonovumidjon22s-projects/phone-backend/settings

### Environment Variables:
- https://vercel.com/qobiljonovumidjon22s-projects/phone-backend/settings/environment-variables

### Deployments:
- https://vercel.com/qobiljonovumidjon22s-projects/phone-backend/deployments

### Domains:
- https://vercel.com/qobiljonovumidjon22s-projects/phone-backend/settings/domains

### Logs:
- https://vercel.com/qobiljonovumidjon22s-projects/phone-backend/logs

---

## ✅ Checklist

- [ ] Environment Variables'ga kirdim
- [ ] NODE_ENV qo'shdim (`production`)
- [ ] JWT_SECRET yaratdim va qo'shdim
- [ ] Deployment URL'ni oldim
- [ ] BASE_URL qo'shdim (deployment URL)
- [ ] WEBSOCKET_URL qo'shdim (ixtiyoriy)
- [ ] Redeploy qildim
- [ ] Test qildim (`/api/health`)

---

## 💡 Maslahatlar

1. **Barcha variable'larni Production, Preview, va Development uchun qo'shing**
2. **Redeploy qiling** - Environment variables qo'shgandan keyin
3. **Deployment URL'ni to'g'ri oling** - Settings → Domains yoki Deployments'dan
4. **Logs'ni tekshiring** - Agar muammo bo'lsa, Logs bo'limida ko'ring
