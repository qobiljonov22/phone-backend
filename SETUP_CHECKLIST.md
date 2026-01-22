# ✅ Setup Checklist

## 1. Environment Variables - Vercel Dashboard

### Qadam-baqadam:

1. **Vercel Dashboard'ga kiring:**
   - https://vercel.com/dashboard
   - Project: `phone-backend` ni tanlang

2. **Settings → Environment Variables:**
   - Har bir variable'ni qo'shing
   - **Production**, **Preview**, va **Development** uchun qo'shing

3. **Majburiy Variable'lar:**
   ```
   ✅ NODE_ENV=production
   ✅ JWT_SECRET=<random-string> (openssl rand -base64 32)
   ✅ BASE_URL=https://phone-backend-eosin.vercel.app
   ```

4. **Ixtiyoriy Variable'lar:**
   ```
   ⚪ MONGODB_URI (agar MongoDB ishlatsangiz)
   ⚪ DATABASE_URL (agar PostgreSQL ishlatsangiz)
   ⚪ TWILIO_ACCOUNT_SID (agar SMS kerak bo'lsa)
   ⚪ TWILIO_AUTH_TOKEN
   ⚪ TWILIO_PHONE_NUMBER
   ⚪ SENTRY_DSN (agar error tracking kerak bo'lsa)
   ```

---

## 2. Database Setup (Optional)

### MongoDB Atlas:

1. **MongoDB Atlas'ga kiring:** https://www.mongodb.com/cloud/atlas
2. **Free cluster yarating**
3. **Database User yarating:**
   - Username va Password yarating
   - Network Access: `0.0.0.0/0` (yoki Vercel IP'larini qo'shing)
4. **Connection String oling:**
   - Connect → Connect your application
   - Connection string'ni copy qiling
5. **Vercel'da qo'shing:**
   - `MONGODB_URI` = `mongodb+srv://username:password@cluster.mongodb.net/phone-store`

### PostgreSQL (Supabase):

1. **Supabase'ga kiring:** https://supabase.com
2. **New Project yarating**
3. **Settings → Database → Connection String oling**
4. **Vercel'da qo'shing:**
   - `DATABASE_URL` = connection string

---

## 3. SMS Service - Twilio (Optional)

### Setup:

1. **Twilio'ga kiring:** https://www.twilio.com
2. **Free account yarating**
3. **Phone Number oling:**
   - Phone Numbers → Buy a number
   - Trial account'da faqat verified raqamlarga SMS yuboradi
4. **Credentials oling:**
   - Account SID va Auth Token
5. **Vercel'da qo'shing:**
   - `TWILIO_ACCOUNT_SID`
   - `TWILIO_AUTH_TOKEN`
   - `TWILIO_PHONE_NUMBER`

---

## 4. Error Tracking - Sentry (Optional)

### Setup:

1. **Sentry'ga kiring:** https://sentry.io
2. **Free account yarating**
3. **New Project yarating:**
   - Platform: Node.js
   - Framework: Express
4. **DSN oling**
5. **Vercel'da qo'shing:**
   - `SENTRY_DSN` = DSN URL

---

## 5. Test Qilish

### Local Test:

```bash
# Environment variables'ni test qiling
npm run dev

# Health check
curl http://localhost:3001/api/health

# Register test
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"test123"}'
```

### Production Test:

```bash
# Health check
curl https://phone-backend-eosin.vercel.app/api/health

# API Info
curl https://phone-backend-eosin.vercel.app/api
```

---

## 6. Postman Collection Yangilash

1. **Postman'ni oching**
2. **Environment'ni yangilang:**
   - `base_url` = `https://phone-backend-eosin.vercel.app`
3. **Test qiling:**
   - Register
   - Login
   - Send OTP
   - Verify OTP

---

## ✅ Final Checklist:

- [ ] Environment variables Vercel'da sozlangan
- [ ] JWT_SECRET random string yaratilgan
- [ ] Database (agar kerak bo'lsa) sozlangan va test qilingan
- [ ] SMS service (agar kerak bo'lsa) sozlangan va test qilingan
- [ ] Error tracking (agar kerak bo'lsa) sozlangan
- [ ] Production URL test qilingan
- [ ] Postman collection yangilangan
- [ ] Barcha endpoint'lar ishlayapti

---

## 🆘 Muammo bo'lsa:

1. **Vercel Logs tekshiring:**
   - Dashboard → Deployments → Logs

2. **Environment Variables tekshiring:**
   - Settings → Environment Variables

3. **Database Connection test qiling:**
   - Local'da test qiling

4. **SMS Service test qiling:**
   - Twilio Console'da test qiling
