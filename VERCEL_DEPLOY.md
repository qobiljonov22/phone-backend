# Vercel'ga Deploy Qilish

## Avtomatik Deploy

Vercel GitHub repository'ga bog'langan bo'lsa, har safar `git push` qilganda avtomatik deploy qiladi.

## Manual Deploy

Agar avtomatik deploy ishlamasa, manual deploy qiling:

### 1. Vercel Dashboard orqali

1. [Vercel Dashboard](https://vercel.com/dashboard) ga kiring
2. Project'ni tanlang
3. **Deployments** tab'ga o'ting
4. **Redeploy** tugmasini bosing
5. Yoki **...** menu'dan **Redeploy** tanlang

### 2. Vercel CLI orqali

```bash
# Vercel CLI o'rnatish (agar yo'q bo'lsa)
npm i -g vercel

# Login qilish
vercel login

# Deploy qilish
vercel --prod
```

## GitHub'ga Yangi Commit

Agar o'zgarishlar yo'q bo'lsa, yangi commit yarating:

```bash
# O'zgarishlarni qo'shish
git add .

# Commit qilish
git commit -m "Update: Database integration and API improvements"

# Push qilish
git push origin main
```

## Deploy Status

Deploy holatini tekshirish:

1. Vercel Dashboard > Project > Deployments
2. Yoki GitHub Actions (agar sozlangan bo'lsa)

## Environment Variables

Vercel'da quyidagi environment variable'larni tekshiring:

- `MONGODB_URI` - MongoDB connection string (ixtiyoriy)
- `DATABASE_URL` - PostgreSQL connection string (ixtiyoriy)
- `JWT_SECRET` - JWT token secret key
- `NODE_ENV` - `production`

## Deploy URL

Deploy qilingan URL:
```
https://phone-backend-fkezys5on-qobiljonovumidjon22s-projects.vercel.app
```

## Testing

Deploy qilingandan keyin test qiling:

1. Health check:
   ```
   GET https://phone-backend-fkezys5on-qobiljonovumidjon22s-projects.vercel.app/api/health
   ```

2. API info:
   ```
   GET https://phone-backend-fkezys5on-qobiljonovumidjon22s-projects.vercel.app/api
   ```

3. Categories (public endpoint):
   ```
   GET https://phone-backend-fkezys5on-qobiljonovumidjon22s-projects.vercel.app/api/categories
   ```

## Notes

- ✅ Database integration tayyor
- ✅ Barcha route'lar database bilan ishlaydi
- ✅ Public endpoint'lar authentication talab qilmaydi
- ⚠️ WebSocket Vercel'da ishlamaydi (faqat local development)

## Troubleshooting

Agar deploy xatosi bo'lsa:

1. Vercel Dashboard > Project > Settings > Environment Variables
2. Barcha environment variable'lar to'g'ri sozlanganligini tekshiring
3. Deploy logs'ni ko'ring
4. Build logs'ni tekshiring
