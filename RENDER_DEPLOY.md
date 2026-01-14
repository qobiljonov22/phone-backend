# 🚀 Render.com ga Deploy (3 daqiqa)

## ✅ **Nima uchun Render?**
- GitLab bilan ishlaydi
- Bepul tier mavjud
- WebSocket support
- Oson setup

## 📋 **Deploy Qilish:**

### **1. Render.com ga kiring:**
**Link:** [render.com](https://render.com)

### **2. GitLab ni ulang:**
1. "Sign Up" yoki "Login" bosing
2. "Connect GitLab" ni tanlang
3. GitLab account bilan kiring
4. Render ga access bering

### **3. Web Service yarating:**
1. Dashboard da "New +" tugmasini bosing
2. "Web Service" ni tanlang
3. `phone-backend` repository ni tanlang
4. Quyidagi sozlamalarni kiriting:

```
Name: phone-backend
Region: Frankfurt (yoki Oregon)
Branch: main
Runtime: Node
Build Command: npm install
Start Command: npm start
```

### **4. Environment Variables:**
"Advanced" bo'limida qo'shing:
```
NODE_ENV = production
```

### **5. Deploy bosing:**
"Create Web Service" tugmasini bosing

### **6. Kutib turing (2-3 daqiqa):**
Render deploy qiladi va sizga URL beradi:
```
https://phone-backend.onrender.com
```

### **7. Test qiling:**
```
https://phone-backend.onrender.com/api/phones
```

## 🎉 **Tayyor!**

Sizning API endi internetda ishlaydi!

## 📱 **Postman da Test:**
1. `Phone_Store_Environment.json` ni oching
2. `base_url` ni yangilang:
```json
"value": "https://phone-backend.onrender.com"
```
3. Test qiling!

## ⚡ **Render vs Railway:**

| Feature | Render | Railway |
|---------|--------|---------|
| GitLab Support | ✅ Ha | ❌ Yo'q |
| Bepul Tier | ✅ Ha | ✅ Ha |
| Deploy Vaqti | 3 min | 2 min |
| WebSocket | ✅ Ha | ✅ Ha |

**Render GitLab bilan yaxshi ishlaydi!**