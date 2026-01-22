# 🌐 Vercel Deployment URL - Sozlash

## ✅ Sizning Deployment URL'ingiz:

```
https://phone-backend-fkezys5on-qobiljonovumidjon22s-projects.vercel.app
```

---

## 🔧 Environment Variables Sozlash

### 1. BASE_URL

**Vercel Dashboard'da:**

```
Key: BASE_URL
Value: https://phone-backend-fkezys5on-qobiljonovumidjon22s-projects.vercel.app
Environment: ✅ Production ✅ Preview ✅ Development
```

### 2. WEBSOCKET_URL (ixtiyoriy)

```
Key: WEBSOCKET_URL
Value: wss://phone-backend-fkezys5on-qobiljonovumidjon22s-projects.vercel.app
Environment: ✅ Production ✅ Preview ✅ Development
```

**Eslatma:** Vercel serverless'da WebSocket ishlamaydi, lekin variable qo'shish mumkin.

---

## 📝 To'liq Environment Variables Ro'yxati

### Majburiy:

1. **NODE_ENV**
   ```
   Key: NODE_ENV
   Value: production
   Environment: ✅ Production ✅ Preview ✅ Development
   ```

2. **JWT_SECRET**
   ```
   Key: JWT_SECRET
   Value: <random-string>
   Environment: ✅ Production ✅ Preview ✅ Development
   
   Yaratish:
   - PowerShell: [Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
   - Online: https://randomkeygen.com/
   ```

3. **BASE_URL**
   ```
   Key: BASE_URL
   Value: https://phone-backend-fkezys5on-qobiljonovumidjon22s-projects.vercel.app
   Environment: ✅ Production ✅ Preview ✅ Development
   ```

### Ixtiyoriy:

4. **WEBSOCKET_URL**
   ```
   Key: WEBSOCKET_URL
   Value: wss://phone-backend-fkezys5on-qobiljonovumidjon22s-projects.vercel.app
   Environment: ✅ Production ✅ Preview ✅ Development
   ```

---

## 🧪 Test Qilish

### Health Check:
```bash
curl https://phone-backend-fkezys5on-qobiljonovumidjon22s-projects.vercel.app/api/health
```

Yoki browser'da:
```
https://phone-backend-fkezys5on-qobiljonovumidjon22s-projects.vercel.app/api/health
```

### API Info:
```
https://phone-backend-fkezys5on-qobiljonovumidjon22s-projects.vercel.app/api
```

### Phones API:
```
https://phone-backend-fkezys5on-qobiljonovumidjon22s-projects.vercel.app/api/phones
```

### Register Test:
```bash
curl -X POST https://phone-backend-fkezys5on-qobiljonovumidjon22s-projects.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"test123456"}'
```

---

## 🔄 Redeploy

Environment variables qo'shgandan keyin:

1. **Vercel Dashboard** → **Deployments**
2. Eng so'nggi deployment'ni toping
3. **...** (three dots) → **Redeploy**
4. Yoki yangi commit push qiling (auto-deploy)

---

## 📋 Checklist

- [ ] NODE_ENV qo'shildi (`production`)
- [ ] JWT_SECRET yaratildi va qo'shildi
- [ ] BASE_URL qo'shildi (yuqoridagi URL)
- [ ] WEBSOCKET_URL qo'shildi (ixtiyoriy)
- [ ] Barcha variable'lar Production, Preview, Development uchun qo'shildi
- [ ] Redeploy qilindi
- [ ] Health check test qilindi
- [ ] API endpoint'lar test qilindi

---

## 💡 Eslatmalar

1. **URL o'zgarishi mumkin** - Vercel'da har deployment yangi URL olishi mumkin
2. **Custom Domain** - Agar custom domain qo'shsangiz, BASE_URL'ni yangilang
3. **Production URL** - Production deployment uchun asosiy URL'ni ishlating
4. **Preview URL** - Preview deployment'lar uchun alohida URL bo'ladi

---

## 🔗 Tezkor Linklar

### Environment Variables:
```
https://vercel.com/qobiljonovumidjon22s-projects/phone-backend/settings/environment-variables
```

### Deployments:
```
https://vercel.com/qobiljonovumidjon22s-projects/phone-backend/deployments
```

### Domains:
```
https://vercel.com/qobiljonovumidjon22s-projects/phone-backend/settings/domains
```
