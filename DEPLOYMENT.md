# 🚀 Serverga Deploy Qilish

Bu loyihani turli platformalarga deploy qilish bo'yicha qo'llanma.

## 📦 Docker orqali Deploy

### 1. Docker Image yaratish

```bash
docker build -t phone-shop-api .
```

### 2. Docker Container ishga tushirish

```bash
docker run -d -p 8000:8000 --name phone-shop-api phone-shop-api
```

### 3. Container ni to'xtatish

```bash
docker stop phone-shop-api
docker rm phone-shop-api
```

## 🌐 Railway orqali Deploy

1. [Railway](https://railway.app) ga kirib, yangi project yarating
2. GitHub repository ni ulang
3. Railway avtomatik `Dockerfile` ni topib deploy qiladi
4. Environment variable lar kerak bo'lsa, Settings dan qo'shing

**Eslatma:** Railway `railway.json` faylini avtomatik o'qiydi.

## 🎨 Render orqali Deploy

1. [Render](https://render.com) ga kirib, yangi Web Service yarating
2. GitHub repository ni ulang
3. Quyidagi sozlamalarni kiriting:
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Environment:** `Python 3`

**Yoki** `render.yaml` faylidan avtomatik deploy qiling.

## ☁️ Heroku orqali Deploy

1. Heroku CLI o'rnating
2. Heroku ga login qiling:
   ```bash
   heroku login
   ```
3. Yangi app yarating:
   ```bash
   heroku create phone-shop-api
   ```
4. Deploy qiling:
   ```bash
   git push heroku main
   ```

## 🖥️ VPS/Server ga Deploy

### 1. Server ga kirish

```bash
ssh user@your-server-ip
```

### 2. Git dan kodni olish

```bash
git clone https://github.com/qobiljonov22/phone-backend.git
cd phone-backend
```

### 3. Virtual environment yaratish

```bash
python3 -m venv venv
source venv/bin/activate  # Linux/Mac
# yoki
venv\Scripts\activate  # Windows
```

### 4. Dependencies o'rnatish

```bash
pip install -r requirements.txt
```

### 5. PM2 yoki systemd orqali ishga tushirish

**PM2 orqali:**
```bash
npm install -g pm2
pm2 start "uvicorn main:app --host 0.0.0.0 --port 8000" --name phone-shop-api
pm2 save
pm2 startup
```

**Systemd orqali:**
`/etc/systemd/system/phone-shop-api.service` faylini yarating:

```ini
[Unit]
Description=Phone Shop API
After=network.target

[Service]
User=your-user
WorkingDirectory=/path/to/phone-shop-api
Environment="PATH=/path/to/venv/bin"
ExecStart=/path/to/venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000

[Install]
WantedBy=multi-user.target
```

Keyin:
```bash
sudo systemctl enable phone-shop-api
sudo systemctl start phone-shop-api
```

## 🔒 Nginx Reverse Proxy (Ixtiyoriy)

Nginx orqali API ni reverse proxy qilish:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

## 📝 Environment Variables

Production uchun quyidagi environment variable larni sozlang:

- `SECRET_KEY` - JWT token uchun secret key
- `DATABASE_URL` - Database connection string (agar haqiqiy DB ishlatsangiz)

## ✅ Deploy dan keyin tekshirish

1. API ishlayotganini tekshiring:
   ```bash
   curl http://your-server:8000/
   ```

2. Dokumentatsiyani oching:
   ```
   http://your-server:8000/docs
   ```

## 🐛 Muammolarni hal qilish

- **Port band:** Boshqa port ishlating yoki band port ni to'xtating
- **Permission denied:** `sudo` ishlating yoki user permissions ni tekshiring
- **Module not found:** `requirements.txt` dagi barcha paketlar o'rnatilganini tekshiring
