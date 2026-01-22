# Phone Backend API - To'liq Ko'rsatma (0 dan)

## 📋 Tarkib

1. [Server Setup](#server-setup)
2. [Middleware](#middleware)
3. [Routes](#routes)
4. [Authentication](#authentication)
5. [Database](#database)
6. [Deployment](#deployment)

---

## 🚀 Server Setup

### `server/server.js`

```javascript
import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ES6 __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize services
let initPromise = null;
const initializeServices = async () => {
  if (initPromise) return initPromise;
  
  initPromise = (async () => {
    try {
      const { initSentry } = await import('./utils/monitoring.js');
      await initSentry();
      const { initializeDatabase } = await import('./utils/database.js');
      await initializeDatabase();
    } catch (error) {
      console.error('Initialization error:', error);
    }
  })();
  
  return initPromise;
};

// Import routes
import authRoutes from './routes/auth.js';
import verificationRoutes from './routes/verification.js';
import usersRoutes from './routes/users.js';
import cartRoutes from './routes/cart.js';
import ordersRoutes from './routes/orders.js';
import categoriesRoutes from './routes/categories.js';
import reviewsRoutes from './routes/reviews.js';
import wishlistRoutes from './routes/wishlist.js';
import filtersRoutes from './routes/filters.js';
import comparisonRoutes from './routes/comparison.js';
import dashboardRoutes from './routes/dashboard.js';
import modalsRoutes from './routes/modals.js';
import newsletterRoutes from './routes/newsletter.js';
import alertsRoutes from './routes/alerts.js';
import adminRoutes from './routes/admin.js';
import imageRoutes from './routes/images.js';
import notificationsRoutes from './routes/notifications.js';
import paymentsRoutes from './routes/payments.js';
import trackingRoutes from './routes/tracking.js';

// Import middleware
import requestLogger from './middleware/logger.js';
import { securityHeaders, validateApiKey } from './middleware/security.js';
import rateLimiter from './middleware/rateLimiter.js';
import { validatePhone, validatePagination } from './middleware/validator.js';

dotenv.config();

// Vercel detection
const isVercelEnv = process.env.VERCEL === '1' || process.env.VERCEL_ENV;
const phonesFile = isVercelEnv ? '/tmp/phones_database.json' : 'phones_database.json';
let phonesData = { phones: {} };

// Load phones from file
const loadPhones = () => {
  try {
    if (fs.existsSync(phonesFile)) {
      phonesData = JSON.parse(fs.readFileSync(phonesFile, 'utf8'));
    } else {
      const rootFile = 'phones_database.json';
      if (fs.existsSync(rootFile) && !isVercelEnv) {
        phonesData = JSON.parse(fs.readFileSync(rootFile, 'utf8'));
      }
    }
  } catch (error) {
    console.error('Error loading phones:', error);
    phonesData = { phones: {} };
  }
};

// Save phones to file
const savePhones = () => {
  try {
    if (isVercelEnv) {
      if (!fs.existsSync('/tmp')) {
        fs.mkdirSync('/tmp', { recursive: true });
      }
    }
    fs.writeFileSync(phonesFile, JSON.stringify(phonesData, null, 2));
  } catch (error) {
    console.error('Error saving phones:', error);
  }
};

loadPhones();

const app = express();
const PORT = process.env.PORT || 3001;

// Create HTTP server (only for local development)
const server = isVercelEnv ? null : createServer(app);

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key']
}));

app.use(securityHeaders);
app.use(requestLogger);
app.use('/api', rateLimiter(15 * 60 * 1000, 100));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));
app.use('/api', validateApiKey);

// WebSocket Server (only for local development)
let wss = null;
const clients = new Map();

if (!isVercelEnv && server) {
  wss = new WebSocketServer({ server });

  wss.on('connection', (ws, req) => {
    const clientId = Date.now().toString();
    clients.set(clientId, ws);
    
    console.log(`New WebSocket connection: ${clientId}`);
    
    ws.send(JSON.stringify({
      type: 'connection',
      message: 'Connected to Phone Backend WebSocket',
      clientId,
      timestamp: new Date().toISOString()
    }));
    
    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString());
        const broadcastMessage = {
          type: 'message',
          clientId,
          data: message,
          timestamp: new Date().toISOString()
        };
        
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
    
    ws.on('close', () => {
      clients.delete(clientId);
      console.log(`Client disconnected: ${clientId}`);
    });
    
    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      clients.delete(clientId);
    });
  });
} else {
  console.log('WebSocket disabled in Vercel/serverless environment');
}

// Helper function to broadcast to all WebSocket clients
const broadcast = (data) => {
  if (isVercelEnv || !wss) return;
  
  const message = JSON.stringify({
    type: 'broadcast',
    data,
    timestamp: new Date().toISOString()
  });
  
  clients.forEach((client, id) => {
    if (client.readyState === client.OPEN) {
      client.send(message);
    }
  });
};

// API Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.get('/demo', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/demo.html'));
});

// API info endpoint
app.get('/api', (req, res) => {
  const baseUrl = `${req.protocol}://${req.get('host')}/api`;
  
  res.json({
    success: true,
    status: 'ok',
    data: {
      name: 'Phone Store Backend API',
      version: '1.0.0',
      description: 'Professional Phone E-commerce Backend API',
      baseUrl: baseUrl,
      endpoints: {
        auth: `${baseUrl}/auth`,
        users: `${baseUrl}/users`,
        phones: `${baseUrl}/phones`,
        orders: `${baseUrl}/orders`,
        cart: `${baseUrl}/cart`,
        wishlist: `${baseUrl}/wishlist`,
        reviews: `${baseUrl}/reviews`,
        categories: `${baseUrl}/categories`,
        verification: `${baseUrl}/verification`,
        admin: `${baseUrl}/admin`
      },
      websocket: isVercelEnv ? {
        url: null,
        status: 'disabled',
        connected: 0,
        note: 'WebSocket is not available in Vercel serverless environment'
      } : {
        url: `ws://${req.get('host')}`,
        status: 'active',
        connected: clients.size
      },
      timestamp: new Date().toISOString()
    },
    message: 'Phone Store Backend API is running',
    links: {
      self: baseUrl,
      health: `${baseUrl}/health`,
      docs: `${baseUrl}/docs`,
      websocket: isVercelEnv ? null : `ws://${req.get('host')}`
    },
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'ok',
    data: {
      server: 'running',
      uptime: process.uptime(),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024)
      },
      websocket: isVercelEnv ? {
        connected: 0,
        status: 'disabled',
        url: null,
        note: 'WebSocket not available in serverless'
      } : {
        connected: clients.size,
        status: 'active',
        url: `ws://localhost:${PORT}`
      },
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString()
    },
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Register all route modules
app.use('/api/auth', authRoutes);
app.use('/api/verification', verificationRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/filters', filtersRoutes);
app.use('/api/comparison', comparisonRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/modals', modalsRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/alerts', alertsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/images', imageRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/tracking', trackingRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  res.status(err.status || 500).json({
    success: false,
    status: 'error',
    error: err.message || 'Internal server error',
    message: 'Server xatosi yuz berdi',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    status: 'not_found',
    error: 'Endpoint not found',
    message: 'Endpoint topilmadi',
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Initialize services
initializeServices().catch(console.error);

// Vercel serverless: export app
export default app;

// Local development: start server
if (!isVercelEnv) {
  server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
    console.log(`WebSocket server ready at ws://localhost:${PORT}`);
    console.log(`API available at http://localhost:${PORT}/api`);
    console.log(`Demo page at http://localhost:${PORT}`);
  });
} else {
  console.log('Vercel serverless mode - app exported');
}
```

---

## 🔐 Middleware

### `server/middleware/auth.js`

```javascript
import { verifyToken } from '../routes/auth.js';
import fs from 'fs';

export const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      status: 'unauthorized',
      error: 'Authorization token required',
      message: 'Tasdiqlash tokeni kerak',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    });
  }
  
  const token = authHeader.substring(7);
  const payload = verifyToken(token);
  
  if (!payload) {
    return res.status(401).json({
      success: false,
      status: 'unauthorized',
      error: 'Invalid or expired token',
      message: 'Token noto\'g\'ri yoki muddati o\'tgan',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    });
  }
  
  req.user = {
    userId: payload.userId,
    email: payload.email
  };
  
  next();
};

export const isAdmin = (req, res, next) => {
  authenticate(req, res, () => {
    try {
      const isVercel = process.env.VERCEL === '1' || process.env.VERCEL_ENV;
      const usersFile = isVercel ? '/tmp/users_database.json' : 'users_database.json';
      
      if (fs.existsSync(usersFile)) {
        const data = JSON.parse(fs.readFileSync(usersFile, 'utf8'));
        const users = new Map(Object.entries(data.users || {}));
        const user = users.get(req.user.userId);
        
        if (!user || user.role !== 'admin') {
          return res.status(403).json({
            success: false,
            status: 'forbidden',
            error: 'Admin access required',
            message: 'Admin huquqi kerak',
            timestamp: new Date().toISOString(),
            version: '1.0.0'
          });
        }
        
        req.user.role = 'admin';
        next();
      } else {
        return res.status(403).json({
          success: false,
          status: 'forbidden',
          error: 'Admin access required',
          message: 'Admin huquqi kerak',
          timestamp: new Date().toISOString(),
          version: '1.0.0'
        });
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        status: 'error',
        error: 'Server error',
        message: 'Server xatosi',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      });
    }
  });
};

export const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const payload = verifyToken(token);
    
    if (payload) {
      req.user = {
        userId: payload.userId,
        email: payload.email
      };
    }
  }
  
  next();
};

export default { authenticate, isAdmin, optionalAuth };
```

### `server/middleware/logger.js`

```javascript
export const requestLogger = (req, res, next) => {
  const start = Date.now();
  const timestamp = new Date().toISOString();
  
  console.log(`[${timestamp}] ${req.method} ${req.path} - IP: ${req.ip}`);
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const statusColor = res.statusCode >= 400 ? '\x1b[31m' : '\x1b[32m';
    console.log(`${statusColor}[${timestamp}] ${req.method} ${req.path} - ${res.statusCode} - ${duration}ms\x1b[0m`);
  });
  
  next();
};

export default requestLogger;
```

### `server/middleware/security.js`

```javascript
export const securityHeaders = (req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.removeHeader('X-Powered-By');
  next();
};

export const validateApiKey = (req, res, next) => {
  const publicPaths = ['/api/health', '/api/phones', '/api/search', '/api/featured', '/api/brands', '/api/categories'];
  if (publicPaths.some(path => req.path.startsWith(path))) {
    return next();
  }
  
  const apiKey = req.headers['x-api-key'] || req.query.apiKey;
  const validApiKey = process.env.API_KEY || 'phone-backend-2024';
  
  if (apiKey && apiKey === validApiKey) {
    return next();
  }
  
  next();
};

export default { securityHeaders, validateApiKey };
```

### `server/middleware/rateLimiter.js`

```javascript
const requestCounts = new Map();

export const rateLimiter = (windowMs = 15 * 60 * 1000, maxRequests = 100) => {
  return (req, res, next) => {
    const clientId = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    const windowStart = now - windowMs;
    
    if (!requestCounts.has(clientId)) {
      requestCounts.set(clientId, []);
    }
    
    const requests = requestCounts.get(clientId);
    const recentRequests = requests.filter(time => time > windowStart);
    
    if (recentRequests.length >= maxRequests) {
      return res.status(429).json({
        success: false,
        error: 'Too many requests',
        message: `Rate limit exceeded. Max ${maxRequests} requests per ${windowMs / 1000} seconds.`,
        retryAfter: Math.ceil((recentRequests[0] + windowMs - now) / 1000),
        timestamp: new Date().toISOString()
      });
    }
    
    recentRequests.push(now);
    requestCounts.set(clientId, recentRequests);
    
    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', maxRequests - recentRequests.length);
    res.setHeader('X-RateLimit-Reset', new Date(now + windowMs).toISOString());
    
    next();
  };
};

setInterval(() => {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000;
  
  requestCounts.forEach((requests, clientId) => {
    const recentRequests = requests.filter(time => time > now - windowMs);
    if (recentRequests.length === 0) {
      requestCounts.delete(clientId);
    } else {
      requestCounts.set(clientId, recentRequests);
    }
  });
}, 5 * 60 * 1000);

export default rateLimiter;
```

### `server/middleware/validator.js`

```javascript
export const validatePhone = (req, res, next) => {
  if (req.method === 'POST' || req.method === 'PUT') {
    const { brand, model, price } = req.body;
    const errors = [];
    
    if (!brand || typeof brand !== 'string' || brand.trim().length === 0) {
      errors.push('Brand is required and must be a non-empty string');
    }
    
    if (!model || typeof model !== 'string' || model.trim().length === 0) {
      errors.push('Model is required and must be a non-empty string');
    }
    
    if (price !== undefined && (typeof price !== 'number' || price < 0)) {
      errors.push('Price must be a positive number');
    }
    
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        message: 'Input validation error',
        errors: errors,
        timestamp: new Date().toISOString()
      });
    }
  }
  
  next();
};

export const validatePagination = (req, res, next) => {
  const { page, limit } = req.query;
  
  if (page && (isNaN(page) || parseInt(page) < 1)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid page parameter',
      message: 'Page must be a positive integer',
      timestamp: new Date().toISOString()
    });
  }
  
  if (limit && (isNaN(limit) || parseInt(limit) < 1 || parseInt(limit) > 100)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid limit parameter',
      message: 'Limit must be between 1 and 100',
      timestamp: new Date().toISOString()
    });
  }
  
  next();
};

export default { validatePhone, validatePagination };
```

---

## 🔑 Authentication Routes

### `server/routes/auth.js`

Bu fayl allaqachon to'liq yozilgan. Asosiy qismlar:

- **POST /api/auth/register** - Ro'yxatdan o'tish (password va confirmPassword kerak)
- **POST /api/auth/login** - Kirish
- **GET /api/auth/me** - Joriy foydalanuvchi ma'lumotlari
- **POST /api/auth/refresh** - Token yangilash
- **POST /api/auth/logout** - Chiqish

---

## 📦 Package.json

```json
{
  "name": "phone-backend",
  "version": "1.0.0",
  "description": "Professional Phone E-commerce Backend API",
  "main": "server/server.js",
  "type": "module",
  "scripts": {
    "start": "node server/server.js",
    "dev": "cross-env NODE_ENV=development node server/server.js",
    "prod": "cross-env NODE_ENV=production node server/server.js"
  },
  "dependencies": {
    "cors": "^2.8.5",
    "dotenv": "^17.2.3",
    "express": "^5.2.1",
    "multer": "^1.4.5-lts.1",
    "ws": "^8.18.0"
  },
  "optionalDependencies": {
    "@sentry/node": "^7.120.4",
    "mongodb": "^6.21.0",
    "pg": "^8.17.2",
    "twilio": "^4.23.0"
  },
  "devDependencies": {
    "cross-env": "^7.0.3"
  }
}
```

---

## 🚀 Ishga Tushirish

1. **Dependencies o'rnatish:**
   ```bash
   npm install
   ```

2. **Environment variables sozlash:**
   `.env` fayl yaratish:
   ```
   PORT=3001
   NODE_ENV=development
   JWT_SECRET=your-secret-key-here
   BASE_URL=http://localhost:3001
   ```

3. **Server ishga tushirish:**
   ```bash
   npm start
   # yoki
   npm run dev
   ```

---

## 📝 Eslatmalar

- Barcha route'lar `server/routes/` papkasida
- Barcha middleware'lar `server/middleware/` papkasida
- Database fayllar JSON formatida saqlanadi
- Vercel deployment uchun `/tmp` papkasi ishlatiladi
- WebSocket faqat local development'da ishlaydi

Bu to'liq API strukturasidir. Barcha fayllar allaqachon mavjud va ishlayapti!
