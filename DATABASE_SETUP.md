# Database Setup Guide

## Database Support

API endi **database** bilan ishlaydi! JSON fayllar o'rniga MongoDB yoki PostgreSQL ishlatiladi.

## Qanday Ishlaydi?

### 1. **MongoDB** (Agar `MONGODB_URI` environment variable bo'lsa)
```bash
MONGODB_URI=mongodb://localhost:27017/phone-store
```

### 2. **PostgreSQL** (Agar `DATABASE_URL` environment variable bo'lsa)
```bash
DATABASE_URL=postgresql://user:password@localhost:5432/phone-store
```

### 3. **In-Memory Storage** (Agar database bo'lmasa)
- Database bo'lmasa, in-memory storage ishlatiladi
- Server restart qilinganda ma'lumotlar yo'qoladi
- Faqat development/testing uchun

## Environment Variables

Vercel yoki `.env` faylida quyidagilarni qo'shing:

```env
# MongoDB (bittasini tanlang)
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/phone-store

# Yoki PostgreSQL
DATABASE_URL=postgresql://user:password@localhost:5432/phone-store

# JWT Secret
JWT_SECRET=your-secret-key-here
```

## Database Collections/Tables

API quyidagi collection/table'larni ishlatadi:

1. **users** - Foydalanuvchilar
2. **otps** - OTP kodlar
3. **alerts** - Narx va ombor xabarnomalari
4. **newsletter** - Newsletter obunachilar
5. **callbacks** - Qo'ng'iroq so'rovlari
6. **lowprice** - Past narx xabarlari
7. **orders** - Bir bosilish buyurtmalar
8. **credit** - Kredit arizalari
9. **trade** - Almashtirish so'rovlari

## MongoDB Setup

### 1. MongoDB Atlas (Cloud - Recommended)
1. [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) ga kiring
2. Free cluster yarating
3. Connection string oling
4. Environment variable qo'shing:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/phone-store
   ```

### 2. Local MongoDB
```bash
# Install MongoDB
# macOS
brew install mongodb-community

# Ubuntu
sudo apt-get install mongodb

# Start MongoDB
mongod

# Connection string
MONGODB_URI=mongodb://localhost:27017/phone-store
```

## PostgreSQL Setup

### 1. PostgreSQL Cloud (Recommended)
- [Supabase](https://supabase.com) - Free PostgreSQL
- [Neon](https://neon.tech) - Serverless PostgreSQL
- [Railway](https://railway.app) - PostgreSQL hosting

### 2. Local PostgreSQL
```bash
# Install PostgreSQL
# macOS
brew install postgresql

# Ubuntu
sudo apt-get install postgresql

# Create database
createdb phone-store

# Connection string
DATABASE_URL=postgresql://user:password@localhost:5432/phone-store
```

## Vercel Setup

1. Vercel Dashboard ga kiring
2. Project Settings > Environment Variables
3. Quyidagilarni qo'shing:
   - `MONGODB_URI` yoki `DATABASE_URL`
   - `JWT_SECRET`

## Testing

Database bo'lmasa ham ishlaydi - in-memory storage ishlatiladi.

```bash
# Database bilan
MONGODB_URI=mongodb://localhost:27017/phone-store npm start

# Database'siz (in-memory)
npm start
```

## Migration

Eski JSON fayllardan database'ga ma'lumotlarni ko'chirish:

1. JSON fayllarni o'qing
2. Database'ga import qiling
3. API endi database bilan ishlaydi

## Notes

- **MongoDB** - NoSQL, eshik va moslashuvchan
- **PostgreSQL** - SQL, kuchli va ishonchli
- **In-Memory** - Faqat development/testing uchun
