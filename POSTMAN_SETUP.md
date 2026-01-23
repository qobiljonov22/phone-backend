# Postman Setup - Phone Shop API

## 📥 Postman Collection ni Import qilish

1. **Postman ni oching** (agar o'rnatilmagan bo'lsa, [postman.com](https://www.postman.com/downloads/) dan yuklab oling)

2. **Collection ni import qiling:**
   - Postman da `Import` tugmasini bosing
   - `Phone_Shop_API.postman_collection.json` faylini tanlang
   - Yoki faylni Postman oynasiga sudrab tashlang

3. **Environment ni import qiling:**
   - `Phone_Shop_API.postman_environment.json` faylini ham import qiling
   - Postman da `Environments` bo'limiga kiring
   - "Phone Shop API - Local Network" environment ni tanlang

4. **IP manzilni o'zgartiring:**
   - Environment da `base_url` ni o'z IP manzilingizga o'zgartiring
   - Masalan: `http://192.168.1.100:8000` yoki `https://192.168.1.100:8000`

## 🚀 Qanday ishlatish

### 1. Serverni ishga tushiring
```bash
python main.py
```

### 2. Postman da collection ni oching

### 3. Endpointlarni sinab ko'ring

**Misol:**
- `Products` > `Get All Products` - barcha mahsulotlarni ko'rish
- `Cart` > `Add to Cart` - savatchaga qo'shish
- `Orders` > `Create Order` - buyurtma yaratish

## 📋 Collection Strukturasi

Collection quyidagi bo'limlarga bo'lingan:

- **Products** - Mahsulotlar bilan ishlash
- **Categories** - Kategoriyalar
- **Search** - Qidiruv
- **Cart** - Savatcha
- **Orders** - Buyurtmalar
- **Reviews** - Sharhlar va baholash
- **Wishlist** - Sevimli mahsulotlar
- **Forms** - Formalar (callback, credit, trade-in, va hokazo)
- **Statistics** - Statistikalar

## 🔧 Environment Variables

### IP manzilni o'zgartirish:

1. Postman da `Environments` bo'limiga kiring
2. "Phone Shop API - Local Network" ni tanlang
3. `base_url` ni o'zgartiring:
   - **HTTP uchun**: `http://192.168.1.100:8000`
   - **HTTPS uchun**: `https://192.168.1.100:8000`
   - O'z IP manzilingizni topish uchun:
     - Windows: `ipconfig` (Command Prompt da)
     - Mac/Linux: `ifconfig` yoki `ip addr`

### Server IP manzilini topish:

**Windows:**
```bash
ipconfig
# IPv4 Address ni toping (masalan: 192.168.1.100)
```

**Mac/Linux:**
```bash
ifconfig
# yoki
ip addr
```

Keyin `main.py` da server ni shu IP da ishga tushiring:
```python
uvicorn.run("main:app", host="192.168.1.100", port=8000, reload=True)
```

## 💡 Maslahatlar

1. **Avval namuna ma'lumotlar yuklanganligini tekshiring:**
   - `GET /products` - kamida 3 ta mahsulot bo'lishi kerak

2. **Buyurtma yaratishdan oldin:**
   - Avval savatchaga mahsulot qo'shing
   - Keyin buyurtma yarating

3. **Test qilish tartibi:**
   ```
   1. Products > Get All Products
   2. Cart > Add to Cart
   3. Cart > Get Cart
   4. Orders > Create Order
   5. Orders > Get Order by ID
   ```

## 🎯 Tez Test

Eng tez test uchun quyidagi tartibni bajaring:

1. `GET /products` - mahsulotlarni ko'rish
2. `POST /cart/add` - savatchaga qo'shish (product_id: 1, quantity: 2)
3. `GET /cart` - savatni ko'rish
4. `POST /orders` - buyurtma yaratish
5. `GET /statistics` - statistikani ko'rish

## 📝 Eslatma

- Barcha endpointlar `http://127.0.0.1:8000` da ishlaydi
- Agar server boshqa portda ishlayotgan bo'lsa, `base_url` ni o'zgartiring
- Swagger dokumentatsiyani ham ko'rishingiz mumkin: `http://127.0.0.1:8000/docs`
