# Phone Backend API with WebSocket

Professional Express.js backend for phone e-commerce platform with real-time WebSocket support.

## 🚀 Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the server:**
   ```bash
   npm start
   ```

3. **Open demo:** http://localhost:5000

## 📱 API Endpoints

### Core Endpoints
- `GET /` - Interactive WebSocket demo page
- `GET /api/health` - Health check with WebSocket stats
- `GET /api/phones` - Get all phones
- `POST /api/phones` - Create new phone (broadcasts to WebSocket)
- `POST /api/broadcast` - Send message to all WebSocket clients

### WebSocket
- `ws://localhost:5000` - Real-time connection
- Automatic broadcasting of new phones
- Real-time messaging between clients

## 🧪 Testing

### Get all phones
```bash
curl http://localhost:5000/api/phones
```

### Create new phone (will broadcast to WebSocket)
```bash
curl -X POST http://localhost:5000/api/phones \
  -H "Content-Type: application/json" \
  -d '{
    "brand": "iPhone",
    "model": "15 Pro Max",
    "price": 1199,
    "storage": "256GB",
    "color": "Natural Titanium"
  }'
```

### Broadcast message to all WebSocket clients
```bash
curl -X POST http://localhost:5000/api/broadcast \
  -H "Content-Type: application/json" \
  -d '{
    "message": "New promotion: 20% off all phones!",
    "type": "promotion"
  }'
```

### Health check
```bash
curl http://localhost:5000/api/health
```

## 🔌 WebSocket Features

- **Real-time messaging** between clients
- **Automatic broadcasting** when new phones are added
- **Connection status** monitoring
- **Error handling** and reconnection
- **Client management** with unique IDs

## 🎨 Demo Features

The interactive demo page includes:
- Real-time WebSocket connection status
- Live messaging between multiple browser tabs
- Automatic updates when new phones are added via API
- Professional UI with responsive design

## 🔧 Environment Variables

```env
PORT=5000
NODE_ENV=development
API_KEY=phone-backend-2024
```

## 📊 Features

- ✅ RESTful API design
- ✅ Real-time WebSocket communication
- ✅ CORS enabled
- ✅ Request logging
- ✅ Error handling
- ✅ Client connection management
- ✅ Broadcast messaging
- ✅ Interactive demo page
- ✅ Professional structure
- ✅ ES6 modules

## 🌐 WebSocket Events

### Client to Server
```javascript
// Send message
ws.send(JSON.stringify({
  text: "Hello World",
  timestamp: new Date().toISOString()
}));
```

### Server to Client
```javascript
// Connection established
{
  "type": "connection",
  "message": "Connected to Phone Backend WebSocket",
  "clientId": "1234567890",
  "timestamp": "2024-01-08T10:00:00.000Z"
}

// New phone added
{
  "type": "new_phone",
  "message": "New phone added to catalog",
  "phone": { ... },
  "timestamp": "2024-01-08T10:00:00.000Z"
}

// Broadcast message
{
  "type": "broadcast",
  "message": "Server announcement",
  "timestamp": "2024-01-08T10:00:00.000Z"
}
```

## License

MIT