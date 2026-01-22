# ⚡ Quick Start - 5 daqiqada sozlash

## 🎯 Eng muhim 3 ta variable:

### 1. Vercel Dashboard'ga kiring:
https://vercel.com/dashboard → phone-backend → Settings → Environment Variables

### 2. Quyidagi 3 ta variable'ni qo'shing:

```
✅ NODE_ENV = production
✅ JWT_SECRET = <random-string> (openssl rand -base64 32 yoki online generator)
✅ BASE_URL = https://phone-backend-eosin.vercel.app
```

### 3. Redeploy qiling:
Deployments → Latest → Redeploy

### 4. Test qiling:
```bash
curl https://phone-backend-eosin.vercel.app/api/health
```

---

## 🚀 Keyingi qadamlar (ixtiyoriy):

### Database qo'shish:
1. MongoDB Atlas: https://www.mongodb.com/cloud/atlas
2. Free cluster yarating
3. Connection string'ni Vercel'ga qo'shing: `MONGODB_URI`

### SMS qo'shish:
1. Twilio: https://www.twilio.com
2. Free account yarating
3. Credentials'ni Vercel'ga qo'shing: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`

### Error Tracking qo'shish:
1. Sentry: https://sentry.io
2. Free account yarating
3. DSN'ni Vercel'ga qo'shing: `SENTRY_DSN`

---

## 📚 Batafsil qo'llanma:
`VERCEL_ENV_SETUP.md` faylini o'qing
