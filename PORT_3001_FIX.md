# Port 3001 Xatosi - Yechim

## ❌ Muammo
```
Error: listen EADDRINUSE: address already in use :::3001
```

Bu xato shuni anglatadiki, port 3001 allaqachon boshqa process tomonidan ishlatilmoqda.

## ✅ Yechim

### 1. Process'ni Topish va O'chirish

**PowerShell'da:**
```powershell
# Port 3001 ni ishlatayotgan process'ni topish
netstat -ano | findstr :3001

# Process ID'ni ko'ring (masalan: 4936)
# Process'ni o'chirish
taskkill /F /PID 4936
```

### 2. Barcha Node Process'larni O'chirish

Agar qaysi process ekanligini bilmasangiz:

```powershell
# Barcha node process'larni o'chirish
taskkill /F /IM node.exe
```

### 3. Boshqa Port Ishlatish

Agar port 3001 ni boshqa dastur ishlatayotgan bo'lsa, boshqa port ishlating:

**`.env` faylida:**
```
PORT=3002
```

Yoki **environment variable:**
```powershell
$env:PORT=3002
node server/server.js
```

### 4. Avtomatik Port O'zgartirish

Agar port band bo'lsa, avtomatik boshqa port ishlatish:

```javascript
// server.js da
const PORT = process.env.PORT || 3001;

// Port band bo'lsa, keyingi port'ni sinab ko'rish
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`Port ${PORT} is in use, trying ${PORT + 1}`);
    server.listen(PORT + 1);
  }
});
```

## 🔧 Tekshirish

Server ishlayotganini tekshirish:

```powershell
# Health check
curl http://localhost:3001/api/health

# Yoki browser'da
http://localhost:3001/api/health
```

## Notes

- ✅ Process o'chirildi
- ✅ Server qayta ishga tushirildi
- ✅ Port 3001 endi bo'sh
