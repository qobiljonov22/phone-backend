# 🎯 Vercel Environment Variables - Qadam-baqadam

## 📸 Ko'rib turgan sahifangiz:
- ✅ Environment Variables bo'limi ochilgan
- ✅ "Add Environment Variable" tugmasi ko'rinadi
- ⚠️ Hech qanday variable qo'shilmagan

---

## 🚀 Qadam 1: Birinchi Variable Qo'shish

### "Add Environment Variable" tugmasini bosing

1. **Yuqorida o'ng tomonda** "Add Environment Variable" (qora tugma) ni bosing
2. Modal oyna ochiladi

---

## 📝 Qadam 2: NODE_ENV Qo'shish

### Form'ni to'ldiring:

```
Key: NODE_ENV
Value: production
```

### Environment'ni tanlang:
- ✅ **Production** (checkbox)
- ✅ **Preview** (checkbox)
- ✅ **Development** (checkbox)

**Save** tugmasini bosing

---

## 🔑 Qadam 3: JWT_SECRET Qo'shish

### Avval JWT_SECRET yarating:

**Windows PowerShell'da:**
```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

**Yoki online:**
- https://randomkeygen.com/ ga kiring
- "CodeIgniter Encryption Keys" ni tanlang
- Birinchi key'ni copy qiling

### Keyin qo'shing:

```
Key: JWT_SECRET
Value: <yaratilgan-random-string>
```

### Environment:
- ✅ Production
- ✅ Preview
- ✅ Development

**Save** tugmasini bosing

---

## 🌐 Qadam 4: BASE_URL Qo'shish

### Avval Deployment URL'ni oling:

1. **Chap menuda** "Domains" ni bosing
2. Yoki yuqorida "Domains" tab'ni bosing
3. U yerda deployment URL ko'rinadi
   - Masalan: `phone-backend-abc123.vercel.app`
   - Yoki: `phone-backend.vercel.app`

### Keyin qo'shing:

```
Key: BASE_URL
Value: https://<deployment-url>
```

**Misol:**
```
Key: BASE_URL
Value: https://phone-backend-abc123.vercel.app
```

### Environment:
- ✅ Production
- ✅ Preview
- ✅ Development

**Save** tugmasini bosing

---

## 🔌 Qadam 5: WEBSOCKET_URL (ixtiyoriy)

```
Key: WEBSOCKET_URL
Value: wss://<deployment-url>
```

**Misol:**
```
Key: WEBSOCKET_URL
Value: wss://phone-backend-abc123.vercel.app
```

### Environment:
- ✅ Production
- ✅ Preview
- ✅ Development

**Eslatma:** Vercel'da WebSocket ishlamaydi, lekin variable qo'shish mumkin

**Save** tugmasini bosing

---

## ✅ Qadam 6: Tekshirish

### Qo'shilgan variable'lar ro'yxati:

Sahifada quyidagilar ko'rinishi kerak:

1. ✅ **NODE_ENV** = `production`
2. ✅ **JWT_SECRET** = `<random-string>`
3. ✅ **BASE_URL** = `https://...`
4. ✅ **WEBSOCKET_URL** = `wss://...` (ixtiyoriy)

---

## 🔄 Qadam 7: Redeploy

### Environment variables qo'shgandan keyin:

1. **Chap menuda** "Deployments" ni bosing
2. Eng so'nggi deployment'ni toping
3. **...** (three dots) → **Redeploy**
4. Yoki yangi commit push qiling (auto-deploy)

---

## 🧪 Qadam 8: Test Qilish

### Deployment tugagach:

```bash
curl https://your-deployment-url.vercel.app/api/health
```

Yoki browser'da:
```
https://your-deployment-url.vercel.app/api/health
```

---

## 📋 Checklist

- [ ] "Add Environment Variable" tugmasini bosdim
- [ ] NODE_ENV qo'shdim (`production`)
- [ ] JWT_SECRET yaratdim va qo'shdim
- [ ] Deployment URL'ni oldim (Domains bo'limidan)
- [ ] BASE_URL qo'shdim
- [ ] WEBSOCKET_URL qo'shdim (ixtiyoriy)
- [ ] Barcha variable'larni Production, Preview, Development uchun qo'shdim
- [ ] Redeploy qildim
- [ ] Test qildim

---

## 💡 Maslahatlar

1. **Barcha variable'larni 3 ta environment uchun qo'shing** (Production, Preview, Development)
2. **JWT_SECRET** - har doim random, uzun string bo'lishi kerak
3. **BASE_URL** - to'g'ri deployment URL'ni qo'ying
4. **Redeploy** - Variable qo'shgandan keyin mutlaqo redeploy qiling
5. **Filter** - "All Environments" dropdown'dan environment'ni filter qilishingiz mumkin

---

## 🐛 Muammo Bo'lsa

### Variable ko'rinmayapti:
- **Redeploy** qiling
- Browser'ni refresh qiling
- Variable nomini tekshiring (katta-kichik harf)

### Save qilmayapti:
- Key va Value to'ldirilganini tekshiring
- Kamida bitta environment tanlanganini tekshiring
- Internet aloqasini tekshiring

### Deployment ishlamayapti:
- Logs'ni tekshiring (Deployments → Latest → Logs)
- Environment variables to'g'ri qo'shilganini tekshiring
- Redeploy qiling
