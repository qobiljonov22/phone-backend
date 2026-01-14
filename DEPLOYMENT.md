# 🚀 Phone Store Backend - Railway Deployment

## 📋 Production URLs

### **Main URLs:**
- **API Base:** `https://phone-store-backend.railway.app`
- **Health Check:** `https://phone-store-backend.railway.app/api/health`
- **Demo Page:** `https://phone-store-backend.railway.app`
- **WebSocket:** `wss://phone-store-backend.railway.app`

## 🔧 Environment Variables

```env
PORT=3001
NODE_ENV=production
API_KEY=phone-backend-2024
BASE_URL=https://phone-store-backend.railway.app
WEBSOCKET_URL=wss://phone-store-backend.railway.app
```

## 🚂 Railway Deployment

### **Quick Deploy:**
1. Connect GitHub repository to Railway
2. Set environment variables in Railway dashboard
3. Deploy automatically on push

### **Manual Deploy:**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Deploy
railway up
```

### **Environment Setup in Railway:**
```
PORT=3001
NODE_ENV=production
BASE_URL=https://phone-store-backend.railway.app
WEBSOCKET_URL=wss://phone-store-backend.railway.app
```

## 📱 API Endpoints

### **Core APIs:**
- `GET /api/health` - Health check
- `GET /api/phones` - Get all phones
- `GET /api/phones/:id` - Get phone by ID
- `GET /api/search` - Search phones
- `GET /api/featured` - Featured phones
- `GET /api/categories` - Phone categories
- `GET /api/brands` - Phone brands

### **Image Management:**
- `POST /api/images/upload/:phoneId` - Upload image
- `GET /api/images/phone/:phoneId` - Get phone images
- `GET /api/images/all` - Get all images
- `DELETE /api/images/:phoneId/:imageId` - Delete image

### **CRUD Operations:**
- `POST /api/phones` - Create phone
- `PUT /api/phones/:id` - Update phone
- `DELETE /api/phones/:id` - Delete phone

## 📦 Postman Collections

### **Import Files:**
1. `Phone_Store_Postman_Collection.json` - Main API collection
2. `Phone_Store_Images_Collection.json` - Image management
3. `Phone_Store_Environment.json` - Environment variables

### **Usage:**
1. Import all 3 files into Postman
2. Select "Phone Store - Production" environment
3. Test any endpoint

## 🔌 WebSocket Features

### **Real-time Updates:**
- New phone notifications
- Price updates
- Stock changes
- Live messaging

### **Connection:**
```javascript
const ws = new WebSocket('wss://phone-store-backend.railway.app');
```

## 📊 Database

### **JSON Database:**
- `phones_database.json` - Main data storage
- Real-time updates
- Automatic backups

### **Current Data:**
- 6 phones available
- Categories: flagship, premium, budget
- Brands: Apple, Samsung, Google, OnePlus

## 🛠️ Deployment Commands

### **Local Development:**
```bash
npm run dev
```

### **Production:**
```bash
npm run prod
```

### **Standard Start:**
```bash
npm start
```

## 🔍 Testing

### **Health Check:**
```bash
curl https://phone-store-backend.railway.app/api/health
```

### **Get Phones:**
```bash
curl https://phone-store-backend.railway.app/api/phones
```

### **Upload Image:**
```bash
curl -X POST \
  https://phone-store-backend.railway.app/api/images/upload/iphone-15-pro \
  -F 'image=@phone.jpg' \
  -F 'isPrimary=true'
```

## 📝 Notes

- Server automatically detects environment
- Production URLs are configured in .env
- WebSocket supports real-time features
- Image uploads stored in /uploads/phones/
- All endpoints support CORS
- JSON database auto-saves changes

## 🆘 Troubleshooting

### **404 Error:**
- Check if server is running
- Verify domain configuration
- Check environment variables

### **WebSocket Issues:**
- Use WSS (not WS) for HTTPS domains
- Check firewall settings
- Verify WebSocket support

### **Image Upload Issues:**
- Check file size (max 5MB)
- Verify file format (JPEG, PNG, WebP)
- Ensure phone exists before upload