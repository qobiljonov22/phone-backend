# 🚀 Production Deployment Guide

## Quick Start

Barcha qo'llanmalar `VERCEL_SETUP.md` faylida batafsil yozilgan.

## 📋 Checklist

### 1. Environment Variables ✅
- [ ] Vercel dashboard'ga kiring
- [ ] Settings → Environment Variables
- [ ] Quyidagi variable'larni qo'shing:
  - `JWT_SECRET` (muhim!)
  - `NODE_ENV=production`
  - `BASE_URL` (Vercel URL)
  - `TWILIO_ACCOUNT_SID` (agar SMS kerak bo'lsa)
  - `TWILIO_AUTH_TOKEN`
  - `TWILIO_PHONE_NUMBER`
  - `MONGODB_URI` yoki `DATABASE_URL` (agar database kerak bo'lsa)
  - `SENTRY_DSN` (agar error tracking kerak bo'lsa)

### 2. Database Setup (Optional) 🗄️

#### MongoDB Atlas:
```bash
npm install mongodb
```
Vercel'da `MONGODB_URI` variable'ni qo'shing.

#### PostgreSQL (Supabase/Neon):
```bash
npm install pg
```
Vercel'da `DATABASE_URL` variable'ni qo'shing.

### 3. SMS Service (Optional) 📱

#### Twilio Setup:
```bash
npm install twilio
```
Vercel'da quyidagi variable'larni qo'shing:
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_PHONE_NUMBER`

### 4. Error Tracking (Optional) 🔍

#### Sentry Setup:
```bash
npm install @sentry/node
```
Vercel'da `SENTRY_DSN` variable'ni qo'shing.

## 📝 Utility Files

Yaratilgan utility fayllar:

1. **`server/utils/database.js`** - MongoDB va PostgreSQL support
2. **`server/utils/sms.js`** - Twilio SMS integration
3. **`server/utils/monitoring.js`** - Sentry error tracking

## 🔗 Foydali Linklar

- **Vercel Dashboard:** https://vercel.com/dashboard
- **MongoDB Atlas:** https://www.mongodb.com/cloud/atlas
- **Supabase:** https://supabase.com
- **Twilio:** https://www.twilio.com
- **Sentry:** https://sentry.io

## ⚠️ Muhim Eslatmalar

1. **JWT_SECRET** - random, uzun string bo'lishi kerak
2. **Database** - file-based storage Vercel'da ishlamaydi, real database kerak
3. **SMS** - Twilio trial account'da faqat verified raqamlarga SMS yuboradi
4. **Error Tracking** - Sentry free tier'da yaxshi ishlaydi

## 🎯 Keyingi Qadamlar

1. Environment variables'ni sozlang
2. Database'ni test qiling
3. SMS service'ni test qiling
4. Error tracking'ni test qiling
5. Production'da barcha endpoint'larni sinab ko'ring
