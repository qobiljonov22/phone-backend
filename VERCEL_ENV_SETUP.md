# 🚀 Vercel Environment Variables Setup Guide

## 📋 Qadam 1: Vercel Dashboard'ga kirish

1. **Vercel Dashboard'ga kiring:**
   - https://vercel.com/dashboard
   - Yoki: https://vercel.com/login

2. **Project'ni tanlang:**
   - `phone-backend` project'ni toping va oching

3. **Settings'ga o'ting:**
   - Project page'da **Settings** tab'ni tanlang
   - Yoki: https://vercel.com/qobiljonovumidjon22s-projects/phone-backend/settings

---

## 🔧 Qadam 2: Environment Variables qo'shish

### Settings → Environment Variables

1. **Environment Variables** bo'limini oching
2. **Add New** tugmasini bosing
3. Har bir variable'ni quyidagicha qo'shing:

---

## ✅ Majburiy Environment Variables

### 1. NODE_ENV
```
Key: NODE_ENV
Value: production
Environment: Production, Preview, Development (hamma uchun)
```

### 2. JWT_SECRET (MUHIM!)
```
Key: JWT_SECRET
Value: <random-string-yarating>
Environment: Production, Preview, Development

⚠️ Muhim: Random string yarating:
- Windows PowerShell: 
  [Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
- Linux/Mac:
  openssl rand -base64 32
- Yoki online: https://randomkeygen.com/
```

### 3. BASE_URL
```
Key: BASE_URL
Value: https://phone-backend-eosin.vercel.app
Environment: Production, Preview, Development
```

### 4. WEBSOCKET_URL
```
Key: WEBSOCKET_URL
Value: wss://phone-backend-eosin.vercel.app
Environment: Production, Preview, Development
```

---

## ⚪ Ixtiyoriy Environment Variables

### Database (MongoDB yoki PostgreSQL - birini tanlang)

#### MongoDB Atlas:
```
Key: MONGODB_URI
Value: mongodb+srv://username:password@cluster.mongodb.net/phone-store?retryWrites=true&w=majority
Environment: Production, Preview, Development
```

**Qanday olish:**
1. https://www.mongodb.com/cloud/atlas ga kiring
2. Free account yarating
3. **Create Cluster** → Free tier tanlang
4. **Database Access** → Add New Database User
5. **Network Access** → Add IP Address → `0.0.0.0/0` (yoki Vercel IP'larini qo'shing)
6. **Connect** → Connect your application → Connection string'ni copy qiling
7. Username va password'ni almashtiring

#### PostgreSQL (Supabase):
```
Key: DATABASE_URL
Value: postgresql://user:password@host:5432/dbname?sslmode=require
Environment: Production, Preview, Development
```

**Qanday olish:**
1. https://supabase.com ga kiring
2. Free account yarating
3. **New Project** yarating
4. **Settings** → **Database** → **Connection String** → **URI** ni copy qiling

---

### SMS Service (Twilio)

```
Key: TWILIO_ACCOUNT_SID
Value: ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
Environment: Production, Preview, Development

Key: TWILIO_AUTH_TOKEN
Value: your_auth_token_here
Environment: Production, Preview, Development

Key: TWILIO_PHONE_NUMBER
Value: +1234567890
Environment: Production, Preview, Development
```

**Qanday olish:**
1. https://www.twilio.com ga kiring
2. Free account yarating (trial)
3. **Console Dashboard** → **Account SID** va **Auth Token** ni ko'ring
4. **Phone Numbers** → **Buy a number** (trial account'da faqat verified raqamlarga SMS yuboradi)
5. Phone number'ni copy qiling

**Eslatma:** Trial account'da:
- Faqat verified telefon raqamlarga SMS yuboradi
- SMS matnida "Sent from a Twilio trial account" ko'rinadi
- Production uchun paid account kerak

---

### Error Tracking (Sentry)

```
Key: SENTRY_DSN
Value: https://your-sentry-dsn@sentry.io/project-id
Environment: Production, Preview, Development
```

**Qanday olish:**
1. https://sentry.io ga kiring
2. Free account yarating
3. **Create Project** → **Node.js** → **Express** tanlang
4. **DSN** ni copy qiling (masalan: `https://abc123@o123456.ingest.sentry.io/123456`)

---

### Qo'shimcha (Optional)

```
Key: CORS_ORIGIN
Value: *
Environment: Production, Preview, Development

Key: API_KEY
Value: phone-backend-2024
Environment: Production, Preview, Development

Key: PORT
Value: 3001
Environment: Production, Preview, Development
```

---

## 📝 Qadam 3: Variable'larni qo'shish

### Har bir variable uchun:

1. **Key** ni kiriting (masalan: `JWT_SECRET`)
2. **Value** ni kiriting (masalan: `your-secret-key`)
3. **Environment** ni tanlang:
   - ✅ Production
   - ✅ Preview
   - ✅ Development
4. **Save** tugmasini bosing

### Misol:
```
Key: JWT_SECRET
Value: aB3xY9mK2pL8nQ5rT7vW1zA4cE6gH0jM
Environment: [✓] Production [✓] Preview [✓] Development
```

---

## 🔄 Qadam 4: Redeploy

Environment variables'ni qo'shgandan keyin:

1. **Deployments** tab'ga o'ting
2. Eng so'nggi deployment'ni toping
3. **Redeploy** tugmasini bosing
4. Yoki yangi commit push qiling (auto-deploy)

---

## ✅ Qadam 5: Test Qilish

### Health Check:
```bash
curl https://phone-backend-eosin.vercel.app/api/health
```

### API Info:
```bash
curl https://phone-backend-eosin.vercel.app/api
```

### Register Test:
```bash
curl -X POST https://phone-backend-eosin.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"test123456"}'
```

---

## 🐛 Muammo bo'lsa:

### 1. Variable ko'rinmayapti:
- **Redeploy** qiling
- Variable nomini tekshiring (katta-kichik harf)
- Environment'ni tekshiring (Production/Preview/Development)

### 2. Database connection xatosi:
- Connection string'ni tekshiring
- Network Access'ni tekshiring (MongoDB Atlas)
- SSL mode'ni tekshiring (PostgreSQL)

### 3. SMS yuborilmayapti:
- Twilio credentials'ni tekshiring
- Phone number format'ni tekshiring (+998...)
- Trial account limit'ini tekshiring

### 4. Sentry ishlamayapti:
- DSN'ni tekshiring
- Project settings'ni tekshiring
- Logs'ni tekshiring

---

## 📊 Vercel Logs tekshirish:

1. **Deployments** → Deployment'ni tanlang
2. **Functions** → Function'ni tanlang
3. **Logs** tab'ni oching
4. Real-time logs'ni ko'ring

---

## 🔗 Foydali Linklar:

- **Vercel Dashboard:** https://vercel.com/dashboard
- **MongoDB Atlas:** https://www.mongodb.com/cloud/atlas
- **Supabase:** https://supabase.com
- **Twilio Console:** https://console.twilio.com
- **Sentry Dashboard:** https://sentry.io/organizations

---

## 📋 Checklist:

- [ ] NODE_ENV qo'shildi
- [ ] JWT_SECRET qo'shildi (random string)
- [ ] BASE_URL qo'shildi
- [ ] WEBSOCKET_URL qo'shildi
- [ ] Database (MongoDB yoki PostgreSQL) qo'shildi (ixtiyoriy)
- [ ] Twilio credentials qo'shildi (ixtiyoriy)
- [ ] Sentry DSN qo'shildi (ixtiyoriy)
- [ ] Redeploy qilindi
- [ ] Test qilindi

---

## 💡 Maslahatlar:

1. **JWT_SECRET** - har doim random, uzun string bo'lishi kerak
2. **Database** - production uchun real database ishlatish tavsiya etiladi
3. **SMS** - trial account'da faqat verified raqamlarga ishlaydi
4. **Sentry** - free tier'da yaxshi ishlaydi
5. **Environment** - barcha variable'larni Production, Preview, va Development uchun qo'shing
