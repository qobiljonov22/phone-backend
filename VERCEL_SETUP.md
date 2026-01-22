# Vercel Deployment Setup Guide

## 1. Environment Variables - Vercel Dashboard'da sozlash

### Qanday qo'shish:

1. Vercel dashboard'ga kiring: https://vercel.com/dashboard
2. Project'ni tanlang: `phone-backend`
3. **Settings** → **Environment Variables** ga o'ting
4. Quyidagi variable'larni qo'shing:

### Kerakli Environment Variables:

```env
# Server Configuration
NODE_ENV=production
PORT=3001

# Base URLs
BASE_URL=https://phone-backend-eosin.vercel.app
WEBSOCKET_URL=wss://phone-backend-eosin.vercel.app

# JWT Secret (muhim - random string yarating)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# CORS
CORS_ORIGIN=*

# API Key (optional)
API_KEY=phone-backend-2024

# Database (agar MongoDB yoki PostgreSQL ishlatsangiz)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/phone-store
DATABASE_URL=postgresql://user:password@host:5432/dbname

# SMS Service (Twilio)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890

# Error Tracking (Sentry)
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
```

### Muhim eslatmalar:

- **JWT_SECRET** - random, uzun string bo'lishi kerak (masalan: `openssl rand -base64 32`)
- **TWILIO_ACCOUNT_SID** va **TWILIO_AUTH_TOKEN** - Twilio dashboard'dan oling
- Barcha variable'larni **Production**, **Preview**, va **Development** uchun qo'shing

---

## 2. Database - Production uchun real database

### Variant A: MongoDB (MongoDB Atlas)

#### Qo'shish:

1. MongoDB Atlas'ga kiring: https://www.mongodb.com/cloud/atlas
2. Free cluster yarating
3. Database User yarating
4. Connection String oling
5. Vercel'da `MONGODB_URI` variable'ni qo'shing

#### Kod o'zgartirish:

```javascript
// server/utils/database.js
import { MongoClient } from 'mongodb';

const client = new MongoClient(process.env.MONGODB_URI);
let db;

export const connectDB = async () => {
  try {
    await client.connect();
    db = client.db('phone-store');
    console.log('✅ MongoDB connected');
    return db;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    throw error;
  }
};

export const getDB = () => db;
```

#### Package.json'ga qo'shing:

```json
{
  "dependencies": {
    "mongodb": "^6.0.0"
  }
}
```

### Variant B: PostgreSQL (Supabase yoki Neon)

#### Qo'shish:

1. Supabase'ga kiring: https://supabase.com (yoki Neon: https://neon.tech)
2. Free database yarating
3. Connection String oling
4. Vercel'da `DATABASE_URL` variable'ni qo'shing

#### Kod o'zgartirish:

```javascript
// server/utils/database.js
import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

export const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};
```

#### Package.json'ga qo'shing:

```json
{
  "dependencies": {
    "pg": "^8.11.0"
  }
}
```

---

## 3. SMS Service - Real SMS yuborish (Twilio)

### Twilio Setup:

1. Twilio'ga kiring: https://www.twilio.com
2. Free account yarating
3. Phone number oling (trial account'da faqat verified raqamlarga SMS yuboradi)
4. Account SID va Auth Token oling
5. Vercel'da quyidagi variable'larni qo'shing:
   - `TWILIO_ACCOUNT_SID`
   - `TWILIO_AUTH_TOKEN`
   - `TWILIO_PHONE_NUMBER`

### Kod o'zgartirish:

```javascript
// server/routes/verification.js - sendOTP funksiyasini yangilash

import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

const sendOTP = async (phone, code, isDevelopment = true) => {
  try {
    if (isDevelopment || process.env.NODE_ENV === 'development') {
      // Development mode: Log to console
      console.log(`📱 SMS sent to ${phone}: Your verification code is ${code}`);
      return { success: true, code: code, mode: 'development' };
    } else {
      // Production mode: Send real SMS via Twilio
      if (!accountSid || !authToken || !twilioPhone) {
        console.error('❌ Twilio credentials not configured');
        return { success: false, error: 'SMS service not configured' };
      }

      const client = twilio(accountSid, authToken);
      
      const message = await client.messages.create({
        body: `Your verification code is: ${code}. Valid for 5 minutes.`,
        from: twilioPhone,
        to: phone
      });

      console.log(`✅ SMS sent via Twilio: ${message.sid}`);
      return { success: true, messageId: message.sid, mode: 'production' };
    }
  } catch (error) {
    console.error('Error sending SMS:', error);
    return { success: false, error: error.message };
  }
};
```

### Package.json'ga qo'shing:

```json
{
  "dependencies": {
    "twilio": "^4.19.0"
  }
}
```

---

## 4. Monitoring - Error Tracking va Analytics

### Variant A: Sentry (Error Tracking)

#### Setup:

1. Sentry'ga kiring: https://sentry.io
2. Free account yarating
3. Node.js project yarating
4. DSN oling
5. Vercel'da `SENTRY_DSN` variable'ni qo'shing

#### Kod o'zgartirish:

```javascript
// server/server.js - eng yuqoriga qo'shing
import * as Sentry from '@sentry/node';

if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'production',
    tracesSampleRate: 1.0,
  });
}

// Error handling middleware qo'shing
app.use((err, req, res, next) => {
  Sentry.captureException(err);
  res.status(500).json({
    success: false,
    status: 'error',
    error: err.message,
    timestamp: new Date().toISOString()
  });
});
```

#### Package.json'ga qo'shing:

```json
{
  "dependencies": {
    "@sentry/node": "^7.80.0"
  }
}
```

### Variant B: Vercel Analytics

Vercel dashboard'da **Analytics** tab'ni oching - u avtomatik ishlaydi.

### Variant C: Custom Logging

```javascript
// server/utils/logger.js
export const logError = (error, context = {}) => {
  const logData = {
    timestamp: new Date().toISOString(),
    error: error.message,
    stack: error.stack,
    context
  };
  
  // Console'ga yozish
  console.error('ERROR:', logData);
  
  // Yoki external service'ga yuborish (Logtail, LogRocket, va h.k.)
  // fetch('https://api.logtail.com/logs', { ... });
};
```

---

## Deployment Checklist:

- [ ] Environment variables Vercel'da sozlangan
- [ ] Database connection test qilingan
- [ ] SMS service test qilingan
- [ ] Error tracking ishlayapti
- [ ] Production URL test qilingan
- [ ] Postman collection yangilangan (yangi URL bilan)

---

## Foydali linklar:

- **Vercel Dashboard:** https://vercel.com/dashboard
- **MongoDB Atlas:** https://www.mongodb.com/cloud/atlas
- **Supabase:** https://supabase.com
- **Twilio:** https://www.twilio.com
- **Sentry:** https://sentry.io
