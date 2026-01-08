import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// WebSocket Server
const wss = new WebSocketServer({ server });

// Store connected clients
const clients = new Map();

wss.on('connection', (ws, req) => {
  const clientId = Date.now().toString();
  clients.set(clientId, ws);
  
  console.log(`New WebSocket connection: ${clientId}`);
  
  // Send welcome message
  ws.send(JSON.stringify({
    type: 'connection',
    message: 'Connected to Phone Backend WebSocket',
    clientId,
    timestamp: new Date().toISOString()
  }));
  
  // Handle incoming messages
  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data.toString());
      console.log('Received message:', message);
      
      // Broadcast message to all clients
      const broadcastMessage = {
        type: 'message',
        clientId,
        data: message,
        timestamp: new Date().toISOString()
      };
      
      // Send to all connected clients
      clients.forEach((client, id) => {
        if (client.readyState === client.OPEN) {
          client.send(JSON.stringify(broadcastMessage));
        }
      });
      
    } catch (error) {
      console.error('Error parsing message:', error);
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Invalid message format'
      }));
    }
  });
  
  // Handle client disconnect
  ws.on('close', () => {
    clients.delete(clientId);
    console.log(`Client disconnected: ${clientId}`);
  });
  
  // Handle errors
  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
    clients.delete(clientId);
  });
});

// API Routes
app.get('/', (req, res) => {
  res.send(`<!DOCTYPE html>
<html>
<head>
    <title>Phone Backend WebSocket Demo</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            margin: 40px; 
            background: #f5f5f5;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 { 
            color: #333; 
            text-align: center;
        }
        #messages { 
            border: 1px solid #ddd; 
            height: 400px; 
            overflow-y: scroll; 
            padding: 15px; 
            margin-bottom: 15px;
            background: #fafafa;
            border-radius: 4px;
        }
        .message {
            margin-bottom: 10px;
            padding: 8px;
            border-radius: 4px;
            background: #e3f2fd;
        }
        .system-message {
            background: #f3e5f5;
            font-style: italic;
        }
        #messageInput { 
            width: 70%; 
            padding: 10px; 
            border: 1px solid #ddd;
            border-radius: 4px;
        }
        button { 
            padding: 10px 20px;
            background: #2196F3;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            margin-left: 10px;
        }
        button:hover {
            background: #1976D2;
        }
        .status {
            padding: 10px;
            margin-bottom: 15px;
            border-radius: 4px;
            text-align: center;
        }
        .connected { background: #c8e6c9; color: #2e7d32; }
        .disconnected { background: #ffcdd2; color: #c62828; }
        .api-info {
            margin-top: 20px;
            padding: 15px;
            background: #f0f0f0;
            border-radius: 4px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>📱 Phone Backend WebSocket Demo</h1>
        
        <div id="status" class="status disconnected">
            Connecting to WebSocket...
        </div>
        
        <div id="messages"></div>
        
        <div>
            <input type="text" id="messageInput" placeholder="Enter your message">
            <button onclick="sendMessage()">Send Message</button>
        </div>
        
        <div class="api-info">
            <h3>API Endpoints:</h3>
            <ul>
                <li><strong>GET /api/health</strong> - Health check</li>
                <li><strong>GET /api/phones</strong> - Get all phones</li>
                <li><strong>POST /api/phones</strong> - Create new phone</li>
                <li><strong>WebSocket:</strong> ws://localhost:${PORT}</li>
            </ul>
        </div>
    </div>

    <script>
        const ws = new WebSocket('ws://localhost:${PORT}');
        const messages = document.getElementById('messages');
        const status = document.getElementById('status');
        
        ws.onopen = function() {
            status.textContent = '✅ Connected to WebSocket';
            status.className = 'status connected';
        };
        
        ws.onclose = function() {
            status.textContent = '❌ Disconnected from WebSocket';
            status.className = 'status disconnected';
        };
        
        ws.onerror = function(error) {
            status.textContent = '⚠️ WebSocket Error';
            status.className = 'status disconnected';
        };
        
        ws.onmessage = function(event) {
            try {
                const data = JSON.parse(event.data);
                const messageDiv = document.createElement('div');
                messageDiv.className = 'message';
                
                if (data.type === 'connection') {
                    messageDiv.className += ' system-message';
                    messageDiv.innerHTML = '<strong>System:</strong> ' + data.message;
                } else if (data.type === 'message') {
                    messageDiv.innerHTML = 
                        '<strong>Client ' + data.clientId + ':</strong> ' + 
                        JSON.stringify(data.data) +
                        '<small style="color: #666; float: right;">' + new Date(data.timestamp).toLocaleTimeString() + '</small>';
                } else {
                    messageDiv.textContent = event.data;
                }
                
                messages.appendChild(messageDiv);
                messages.scrollTop = messages.scrollHeight;
            } catch (error) {
                const messageDiv = document.createElement('div');
                messageDiv.className = 'message';
                messageDiv.textContent = event.data;
                messages.appendChild(messageDiv);
                messages.scrollTop = messages.scrollHeight;
            }
        };
        
        function sendMessage() {
            const input = document.getElementById('messageInput');
            if (input.value.trim()) {
                const message = {
                    text: input.value,
                    timestamp: new Date().toISOString()
                };
                ws.send(JSON.stringify(message));
                input.value = '';
            }
        }
        
        document.getElementById('messageInput').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    </script>
</body>
</html>`);
});

// API Routes
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Phone Backend is healthy',
    uptime: process.uptime(),
    websocket: {
      connectedClients: clients.size,
      status: 'active'
    },
    timestamp: new Date().toISOString()
  });
});

app.get('/api/phones', (req, res) => {
  const phones = [
    {
      id: 'iphone-15-pro',
      brand: 'iPhone',
      model: '15 Pro',
      price: 999,
      storage: '128GB',
      color: 'Natural Titanium',
      inStock: true,
      rating: 4.8,
      reviews: 1250
    },
    {
      id: 'galaxy-s24-ultra',
      brand: 'Samsung',
      model: 'Galaxy S24 Ultra',
      price: 1299,
      storage: '512GB',
      color: 'Titanium Gray',
      inStock: true,
      rating: 4.7,
      reviews: 890
    },
    {
      id: 'pixel-8-pro',
      brand: 'Google',
      model: 'Pixel 8 Pro',
      price: 999,
      storage: '256GB',
      color: 'Bay',
      inStock: false,
      rating: 4.5,
      reviews: 650
    }
  ];
  
  res.json({
    phones,
    total: phones.length,
    timestamp: new Date().toISOString()
  });
});

app.post('/api/phones', (req, res) => {
  const { brand, model, price, storage, color } = req.body;
  
  if (!brand || !model || !price) {
    return res.status(400).json({
      error: 'Brand, model, and price are required'
    });
  }
  
  const newPhone = {
    id: `${brand.toLowerCase()}-${model.toLowerCase().replace(/\s+/g, '-')}`,
    brand,
    model,
    price: parseFloat(price),
    storage: storage || '128GB',
    color: color || 'Default',
    inStock: true,
    rating: 0,
    reviews: 0,
    createdAt: new Date().toISOString()
  };
  
  // Broadcast new phone to all WebSocket clients
  const broadcastMessage = {
    type: 'new_phone',
    message: 'New phone added to catalog',
    phone: newPhone,
    timestamp: new Date().toISOString()
  };
  
  clients.forEach((client) => {
    if (client.readyState === client.OPEN) {
      client.send(JSON.stringify(broadcastMessage));
    }
  });
  
  res.status(201).json({
    phone: newPhone,
    message: 'Phone created successfully'
  });
});

// WebSocket API endpoint
app.post('/api/broadcast', (req, res) => {
  const { message, type = 'broadcast' } = req.body;
  
  if (!message) {
    return res.status(400).json({
      error: 'Message is required'
    });
  }
  
  const broadcastMessage = {
    type,
    message,
    timestamp: new Date().toISOString()
  };
  
  let sentCount = 0;
  clients.forEach((client) => {
    if (client.readyState === client.OPEN) {
      client.send(JSON.stringify(broadcastMessage));
      sentCount++;
    }
  });
  
  res.json({
    message: 'Broadcast sent successfully',
    sentTo: sentCount,
    totalClients: clients.size
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: err.message
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
    availableEndpoints: [
      'GET /',
      'GET /api/health',
      'GET /api/phones',
      'POST /api/phones',
      'POST /api/broadcast'
    ]
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Phone Backend Server running on http://localhost:${PORT}`);
  console.log(`🔍 Health check: http://localhost:${PORT}/api/health`);
  console.log(`� Phones API: http://localhost:${PORT}/api/phones`);
  console.log(`� WebSocket: ws://localhost:${PORT}`);
  console.log(`� Demo: http://localhost:${PORT}`);
});