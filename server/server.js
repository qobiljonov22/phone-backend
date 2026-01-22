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

// Import routes
import authRoutes from './routes/auth.js';
import verificationRoutes from './routes/verification.js';
import trackingRoutes from './routes/tracking.js';
import paymentsRoutes from './routes/payments.js';
import adminRoutes from './routes/admin.js';
import imageRoutes from './routes/images.js';
import usersRoutes from './routes/users.js';
import cartRoutes from './routes/cart.js';
import ordersRoutes from './routes/orders.js';
import categoriesRoutes from './routes/categories.js';
import notificationsRoutes from './routes/notifications.js';
import reviewsRoutes from './routes/reviews.js';
import wishlistRoutes from './routes/wishlist.js';
import filtersRoutes from './routes/filters.js';
import comparisonRoutes from './routes/comparison.js';
import dashboardRoutes from './routes/dashboard.js';
import modalsRoutes from './routes/modals.js';
import newsletterRoutes from './routes/newsletter.js';
import alertsRoutes from './routes/alerts.js';

// Import middleware
import requestLogger from './middleware/logger.js';
import { securityHeaders, validateApiKey } from './middleware/security.js';
import rateLimiter from './middleware/rateLimiter.js';
import { validatePhone, validatePagination } from './middleware/validator.js';

dotenv.config();

// Load phones database
// In Vercel/serverless, use /tmp directory for file writes
const isVercel = process.env.VERCEL === '1' || process.env.VERCEL_ENV;
const phonesFile = isVercel ? '/tmp/phones_database.json' : 'phones_database.json';
let phonesData = { phones: {} };

// Load phones from file
const loadPhones = () => {
  try {
    if (fs.existsSync(phonesFile)) {
      phonesData = JSON.parse(fs.readFileSync(phonesFile, 'utf8'));
    } else {
      // Try to load from root if /tmp doesn't exist (for local dev)
      const rootFile = 'phones_database.json';
      if (fs.existsSync(rootFile) && !isVercel) {
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
    // Ensure /tmp directory exists in Vercel
    if (isVercel) {
      if (!fs.existsSync('/tmp')) {
        fs.mkdirSync('/tmp', { recursive: true });
      }
    }
    fs.writeFileSync(phonesFile, JSON.stringify(phonesData, null, 2));
  } catch (error) {
    console.error('Error saving phones:', error);
    // In serverless, file writes may fail - use in-memory only
  }
};

// Initialize: load phones on startup
loadPhones();

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key']
}));

// Security headers
app.use(securityHeaders);

// Request logging
app.use(requestLogger);

// Rate limiting
app.use('/api', rateLimiter(15 * 60 * 1000, 100)); // 100 requests per 15 minutes

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use(express.static('public'));
app.use('/uploads', express.static('uploads')); // Serve uploaded images

// API key validation (optional)
app.use('/api', validateApiKey);

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

// Helper function to broadcast to all WebSocket clients
const broadcast = (data) => {
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
      description: 'Professional Phone E-commerce Backend API with WebSocket',
      baseUrl: baseUrl,
    endpoints: {
      health: 'GET /api/health',
      phones: {
        list: 'GET /api/phones',
        get: 'GET /api/phones/:id',
        create: 'POST /api/phones',
        update: 'PUT /api/phones/:id',
        delete: 'DELETE /api/phones/:id',
        bulk: {
          create: 'POST /api/phones/bulk',
          delete: 'DELETE /api/phones/bulk'
        }
      },
      search: 'GET /api/search',
      featured: 'GET /api/featured',
      brands: 'GET /api/brands',
      inventory: {
        get: 'GET /api/inventory/:phoneId',
        update: 'PUT /api/inventory/:phoneId'
      },
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        me: 'GET /api/auth/me',
        refresh: 'POST /api/auth/refresh',
        logout: 'POST /api/auth/logout'
      },
      verification: {
        sendOTP: 'POST /api/verification/send-otp',
        verifyOTP: 'POST /api/verification/verify-otp',
        status: 'GET /api/verification/status/:phone'
      },
      users: 'GET /api/users',
      cart: 'GET /api/cart/:userId',
      orders: 'GET /api/orders',
      categories: 'GET /api/categories',
      notifications: 'GET /api/notifications',
      reviews: 'GET /api/reviews',
      wishlist: 'GET /api/wishlist',
      filters: 'GET /api/filters',
      compare: 'POST /api/compare',
      dashboard: 'GET /api/dashboard',
      tracking: 'GET /api/tracking',
      payments: {
        methods: 'GET /api/payments/methods',
        process: 'POST /api/payments/process',
        get: 'GET /api/payments/:paymentId'
      },
      admin: 'GET /api/admin',
      images: 'GET /api/images',
      chat: {
        rooms: {
          list: 'GET /api/chat/rooms',
          create: 'POST /api/chat/rooms'
        }
      },
      modals: {
        callback: {
          create: 'POST /api/callback',
          list: 'GET /api/callback'
        },
        lowprice: {
          create: 'POST /api/lowprice',
          list: 'GET /api/lowprice'
        },
        oneclick: 'POST /api/oneclick',
        credit: {
          create: 'POST /api/credit',
          list: 'GET /api/credit'
        },
        trade: {
          create: 'POST /api/trade',
          list: 'GET /api/trade'
        }
      },
      newsletter: {
        subscribe: 'POST /api/newsletter/subscribe',
        unsubscribe: 'POST /api/newsletter/unsubscribe',
        subscribers: 'GET /api/newsletter/subscribers'
      },
      alerts: {
        price: 'POST /api/alerts/price',
        stock: 'POST /api/alerts/stock',
        user: 'GET /api/alerts/user',
        list: 'GET /api/alerts',
        delete: 'DELETE /api/alerts/:alertId'
      },
      broadcast: 'POST /api/broadcast'
    },
      websocket: {
        url: `ws://${req.get('host')}`,
        status: 'active',
        connected: clients.size
      },
      server: {
        environment: process.env.NODE_ENV || 'development',
        port: PORT,
        uptime: Math.floor(process.uptime())
      },
      statistics: {
        totalEndpoints: 50,
        totalPhones: Object.keys(phonesData.phones || {}).length,
        activeConnections: clients.size
      }
    },
    message: 'API is running successfully',
    links: {
      self: baseUrl,
      health: `${baseUrl}/health`,
      docs: `${req.protocol}://${req.get('host')}/demo`,
      websocket: `ws://${req.get('host')}`
    },
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  const phonesCount = Object.keys(phonesData.phones || {}).length;
  const uptimeSeconds = Math.floor(process.uptime());
  const uptimeMinutes = Math.floor(uptimeSeconds / 60);
  const uptimeHours = Math.floor(uptimeMinutes / 60);
  
  res.json({
    success: true,
    status: 'healthy',
    data: {
      server: {
        uptime: {
          seconds: uptimeSeconds,
          minutes: uptimeMinutes,
          hours: uptimeHours,
          formatted: `${uptimeHours}s ${uptimeMinutes % 60}m ${uptimeSeconds % 60}s`
        },
        environment: process.env.NODE_ENV || 'development',
        port: PORT,
        nodeVersion: process.version
      },
      websocket: {
        connected: clients.size,
        status: 'active',
        url: `ws://localhost:${PORT}`
      },
      database: {
        phones: phonesCount,
        status: phonesCount > 0 ? 'loaded' : 'empty'
      }
    },
    message: 'Server is running normally',
    timestamp: new Date().toISOString()
  });
});

// Helper function to format price in so'm (multiply by 1000 for USD to so'm conversion)
const formatPrice = (price) => {
  // Convert USD to so'm (1 USD = ~12000 so'm)
  return Math.round(price * 12000);
};

// Helper function to format phone data for UI
const formatPhoneForUI = (phone) => {
  return {
    ...phone,
    priceFormatted: formatPrice(phone.price).toLocaleString('uz-UZ') + ' so\'m',
    originalPriceFormatted: phone.originalPrice ? formatPrice(phone.originalPrice).toLocaleString('uz-UZ') + ' so\'m' : null,
    priceInSom: formatPrice(phone.price),
    originalPriceInSom: phone.originalPrice ? formatPrice(phone.originalPrice) : null,
    displayName: `${phone.brand} ${phone.model}`,
    mainImage: phone.images?.[0] || '/uploads/phones/default.jpg',
    inStockText: phone.inStock ? 'Mavjud' : 'Mavjud emas',
    ratingStars: '⭐'.repeat(Math.floor(phone.rating || 0))
  };
};

// Phones API
app.get('/api/phones', validatePagination, (req, res) => {
  const { page = 1, limit = 10, brand, minPrice, maxPrice, sort } = req.query;
  let phones = Object.values(phonesData.phones || {});
  
  // Filter by brand
  if (brand) {
    phones = phones.filter(p => p.brand?.toLowerCase().includes(brand.toLowerCase()));
  }
  
  // Filter by price (in so'm)
  if (minPrice) {
    const minPriceUSD = parseFloat(minPrice) / 12000;
    phones = phones.filter(p => p.price >= minPriceUSD);
  }
  if (maxPrice) {
    const maxPriceUSD = parseFloat(maxPrice) / 12000;
    phones = phones.filter(p => p.price <= maxPriceUSD);
  }
  
  // Sort
  if (sort === 'price_asc') {
    phones.sort((a, b) => a.price - b.price);
  } else if (sort === 'price_desc') {
    phones.sort((a, b) => b.price - a.price);
  } else if (sort === 'name') {
    phones.sort((a, b) => (a.model || '').localeCompare(b.model || ''));
  } else {
    // Default: newest first
    phones.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }
  
  // Pagination
  const startIndex = (parseInt(page) - 1) * parseInt(limit);
  const endIndex = startIndex + parseInt(limit);
  const paginatedPhones = phones.slice(startIndex, endIndex);
  
  // Format phones for UI
  const formattedPhones = paginatedPhones.map(formatPhoneForUI);
  const totalPages = Math.ceil(phones.length / parseInt(limit));
  const currentPage = parseInt(page);
  
  res.json({
    success: true,
    status: 'ok',
    data: {
      phones: formattedPhones,
      pagination: {
        currentPage: currentPage,
        limit: parseInt(limit),
        total: phones.length,
        totalPages: totalPages,
        hasNext: currentPage < totalPages,
        hasPrev: currentPage > 1,
        nextPage: currentPage < totalPages ? currentPage + 1 : null,
        prevPage: currentPage > 1 ? currentPage - 1 : null
      },
      filters: {
        brand: brand || null,
        minPrice: minPrice || null,
        maxPrice: maxPrice || null,
        sort: sort || 'default'
      },
      meta: {
        count: formattedPhones.length,
        showing: `${(currentPage - 1) * parseInt(limit) + 1}-${Math.min(currentPage * parseInt(limit), phones.length)} of ${phones.length}`
      }
    },
    message: `${formattedPhones.length} ta telefon topildi`,
    links: {
      self: `${req.protocol}://${req.get('host')}${req.originalUrl}`,
      first: currentPage > 1 ? `${req.protocol}://${req.get('host')}${req.path}?page=1&limit=${limit}` : null,
      last: currentPage < totalPages ? `${req.protocol}://${req.get('host')}${req.path}?page=${totalPages}&limit=${limit}` : null,
      next: currentPage < totalPages ? `${req.protocol}://${req.get('host')}${req.path}?page=${currentPage + 1}&limit=${limit}` : null,
      prev: currentPage > 1 ? `${req.protocol}://${req.get('host')}${req.path}?page=${currentPage - 1}&limit=${limit}` : null
    },
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

app.get('/api/phones/:id', (req, res) => {
  const { id } = req.params;
  const phone = phonesData.phones?.[id];
  
  if (!phone) {
    return res.status(404).json({ 
      success: false,
      error: 'Phone not found', 
      message: 'Telefon topilmadi',
      data: null,
      timestamp: new Date().toISOString()
    });
  }
  
  const formattedPhone = formatPhoneForUI(phone);
  
  res.json({
    success: true,
    status: 'ok',
    data: formattedPhone,
    message: 'Telefon ma\'lumotlari muvaffaqiyatli yuklandi',
    links: {
      self: `${req.protocol}://${req.get('host')}${req.originalUrl}`,
      images: formattedPhone.images?.map(img => `${req.protocol}://${req.get('host')}${img}`) || [],
      related: `${req.protocol}://${req.get('host')}/api/phones?brand=${encodeURIComponent(phone.brand)}&limit=5`
    },
    meta: {
      id: phone.id,
      brand: phone.brand,
      model: phone.model,
      inStock: phone.inStock,
      rating: phone.rating,
      reviews: phone.reviews
    },
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

app.post('/api/phones', validatePhone, (req, res) => {
  const phone = req.body;
  const id = phone.id || `phone-${Date.now()}`;
  
  phonesData.phones[id] = {
    ...phone,
    id,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  savePhones();
  broadcast({ type: 'phone_created', phone: phonesData.phones[id] });
  
  const newPhone = formatPhoneForUI(phonesData.phones[id]);
  
  res.status(201).json({
    success: true,
    status: 'created',
    data: newPhone,
    message: 'Telefon muvaffaqiyatli qo\'shildi',
    links: {
      self: `${req.protocol}://${req.get('host')}/api/phones/${id}`,
      list: `${req.protocol}://${req.get('host')}/api/phones`
    },
    meta: {
      id: id,
      createdAt: phonesData.phones[id].createdAt
    },
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

app.put('/api/phones/:id', validatePhone, (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  
  if (!phonesData.phones?.[id]) {
    return res.status(404).json({
      success: false,
      status: 'not_found',
      error: 'Phone not found',
      message: 'Telefon topilmadi',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    });
  }
  
  phonesData.phones[id] = {
    ...phonesData.phones[id],
    ...updates,
    id,
    updatedAt: new Date().toISOString()
  };
  
  savePhones();
  broadcast({ type: 'phone_updated', phone: phonesData.phones[id] });
  
  const updatedPhone = formatPhoneForUI(phonesData.phones[id]);
  
  res.json({
    success: true,
    status: 'updated',
    data: updatedPhone,
    message: 'Telefon muvaffaqiyatli yangilandi',
    links: {
      self: `${req.protocol}://${req.get('host')}/api/phones/${id}`,
      list: `${req.protocol}://${req.get('host')}/api/phones`
    },
    meta: {
      id: id,
      updatedAt: phonesData.phones[id].updatedAt,
      changes: Object.keys(req.body)
    },
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

app.delete('/api/phones/:id', (req, res) => {
  const { id } = req.params;
  
  if (!phonesData.phones?.[id]) {
    return res.status(404).json({
      success: false,
      status: 'not_found',
      error: 'Phone not found',
      message: 'Telefon topilmadi',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    });
  }
  
  const deletedPhone = phonesData.phones[id];
  delete phonesData.phones[id];
  savePhones();
  broadcast({ type: 'phone_deleted', id });
  
  res.json({ 
    success: true,
    status: 'deleted',
    data: { 
      id,
      deleted: true
    },
    message: 'Telefon muvaffaqiyatli o\'chirildi',
    links: {
      list: `${req.protocol}://${req.get('host')}/api/phones`
    },
    meta: {
      deletedAt: new Date().toISOString()
    },
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Bulk operations
app.post('/api/phones/bulk', (req, res) => {
  const { phones } = req.body;
  
  if (!Array.isArray(phones) || phones.length === 0) {
    return res.status(400).json({ error: 'Phones array is required' });
  }
  
  const created = [];
  const errors = [];
  
  phones.forEach((phone, index) => {
    try {
      const id = phone.id || `phone-${Date.now()}-${index}`;
      phonesData.phones[id] = {
        ...phone,
        id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      created.push(phonesData.phones[id]);
    } catch (error) {
      errors.push({ index, error: error.message });
    }
  });
  
  savePhones();
  broadcast({ type: 'phones_bulk_created', count: created.length });
  
  res.status(201).json({
    message: `${created.length} phones created successfully`,
    created,
    errors: errors.length > 0 ? errors : undefined
  });
});

app.delete('/api/phones/bulk', (req, res) => {
  const { ids } = req.body;
  
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: 'IDs array is required' });
  }
  
  const deleted = [];
  const notFound = [];
  
  ids.forEach(id => {
    if (phonesData.phones?.[id]) {
      delete phonesData.phones[id];
      deleted.push(id);
    } else {
      notFound.push(id);
    }
  });
  
  savePhones();
  broadcast({ type: 'phones_bulk_deleted', count: deleted.length });
  
  res.json({
    message: `${deleted.length} phones deleted successfully`,
    deleted,
    notFound: notFound.length > 0 ? notFound : undefined
  });
});

// Inventory management
app.get('/api/inventory/:phoneId', (req, res) => {
  const { phoneId } = req.params;
  const phone = phonesData.phones?.[phoneId];
  
  if (!phone) {
    return res.status(404).json({ error: 'Phone not found' });
  }
  
  res.json({
    phoneId,
    inStock: phone.inStock || false,
    quantity: phone.quantity || 0,
    reserved: phone.reserved || 0,
    available: (phone.quantity || 0) - (phone.reserved || 0),
    lastUpdated: phone.updatedAt || phone.createdAt
  });
});

app.put('/api/inventory/:phoneId', (req, res) => {
  const { phoneId } = req.params;
  const { quantity, inStock, reserved } = req.body;
  
  if (!phonesData.phones?.[phoneId]) {
    return res.status(404).json({ error: 'Phone not found' });
  }
  
  const phone = phonesData.phones[phoneId];
  
  if (quantity !== undefined) phone.quantity = quantity;
  if (inStock !== undefined) phone.inStock = inStock;
  if (reserved !== undefined) phone.reserved = reserved;
  phone.updatedAt = new Date().toISOString();
  
  savePhones();
  broadcast({ 
    type: 'inventory_updated', 
    phoneId, 
    inventory: {
      quantity: phone.quantity,
      inStock: phone.inStock,
      available: (phone.quantity || 0) - (phone.reserved || 0)
    }
  });
  
  res.json({
    message: 'Inventory updated successfully',
    phoneId,
    inventory: {
      quantity: phone.quantity,
      inStock: phone.inStock,
      reserved: phone.reserved,
      available: (phone.quantity || 0) - (phone.reserved || 0)
    }
  });
});

// Chat rooms endpoint
app.get('/api/chat/rooms', (req, res) => {
  // Simple chat rooms implementation
  const rooms = [
    {
      id: 'general',
      name: 'General Discussion',
      description: 'General phone store discussion',
      members: clients.size,
      createdAt: new Date().toISOString()
    },
    {
      id: 'support',
      name: 'Customer Support',
      description: 'Get help with your orders',
      members: 0,
      createdAt: new Date().toISOString()
    },
    {
      id: 'reviews',
      name: 'Product Reviews',
      description: 'Share your phone reviews',
      members: 0,
      createdAt: new Date().toISOString()
    }
  ];
  
  res.json({ rooms });
});

app.post('/api/chat/rooms', (req, res) => {
  const { name, description } = req.body;
  
  if (!name) {
    return res.status(400).json({ error: 'Room name is required' });
  }
  
  const room = {
    id: `room-${Date.now()}`,
    name,
    description: description || '',
    members: 0,
    createdAt: new Date().toISOString()
  };
  
  broadcast({ type: 'chat_room_created', room });
  
  res.status(201).json({
    message: 'Chat room created successfully',
    room
  });
});

// Search endpoint
app.get('/api/search', (req, res) => {
  const { q, category, brand, minPrice, maxPrice } = req.query;
  let phones = Object.values(phonesData.phones || {});
  
  if (q) {
    const query = q.toLowerCase();
    phones = phones.filter(p => 
      p.brand?.toLowerCase().includes(query) ||
      p.model?.toLowerCase().includes(query) ||
      p.description?.toLowerCase().includes(query)
    );
  }
  
  if (category) {
    phones = phones.filter(p => p.category === category);
  }
  
  if (brand) {
    phones = phones.filter(p => p.brand?.toLowerCase().includes(brand.toLowerCase()));
  }
  
  if (minPrice) {
    const minPriceUSD = parseFloat(minPrice) / 12000;
    phones = phones.filter(p => p.price >= minPriceUSD);
  }
  
  if (maxPrice) {
    const maxPriceUSD = parseFloat(maxPrice) / 12000;
    phones = phones.filter(p => p.price <= maxPriceUSD);
  }
  
  // Format phones for UI
  const formattedPhones = phones.map(formatPhoneForUI);
  
  res.json({ 
    success: true,
    status: 'ok',
    data: {
      phones: formattedPhones,
      count: phones.length,
      query: q || null,
      filters: {
        category: category || null,
        brand: brand || null,
        minPrice: minPrice || null,
        maxPrice: maxPrice || null
      }
    },
    message: `${phones.length} ta natija topildi`,
    links: {
      self: `${req.protocol}://${req.get('host')}${req.originalUrl}`,
      allPhones: `${req.protocol}://${req.get('host')}/api/phones`
    },
    meta: {
      searchQuery: q || null,
      resultsCount: phones.length
    },
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Featured phones
app.get('/api/featured', (req, res) => {
  const phones = Object.values(phonesData.phones || {});
  const featured = phones
    .filter(p => p.rating >= 4.5 || p.tags?.includes('bestseller') || p.tags?.includes('new'))
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, 12); // Show 12 featured phones
  
  // Format phones for UI
  const formattedPhones = featured.map(formatPhoneForUI);
  
  res.json({ 
    success: true,
    status: 'ok',
    data: {
      phones: formattedPhones,
      count: formattedPhones.length
    },
    message: `${formattedPhones.length} ta tavsiya etilgan telefon`,
    links: {
      self: `${req.protocol}://${req.get('host')}${req.originalUrl}`,
      allPhones: `${req.protocol}://${req.get('host')}/api/phones`
    },
    meta: {
      type: 'featured',
      criteria: 'high_rating_or_bestseller',
      averageRating: formattedPhones.length > 0 ? 
        (formattedPhones.reduce((sum, p) => sum + (p.rating || 0), 0) / formattedPhones.length).toFixed(1) : 0
    },
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Brands endpoint
app.get('/api/brands', (req, res) => {
  const phones = Object.values(phonesData.phones || {});
  const brands = [...new Set(phones.map(p => p.brand).filter(Boolean))].sort();
  
  // Count phones per brand
  const brandsWithCount = brands.map(brand => ({
    name: brand,
    count: phones.filter(p => p.brand === brand).length,
    icon: brand === 'Apple' ? '🍎' : brand === 'Samsung' ? '📱' : brand === 'Google' ? '🔵' : '📲'
  }));
  
  res.json({ 
    success: true,
    status: 'ok',
    data: {
      brands: brands,
      brandsWithCount: brandsWithCount,
      total: brands.length
    },
    message: `${brands.length} ta brend topildi`,
    links: {
      self: `${req.protocol}://${req.get('host')}${req.originalUrl}`,
      phones: `${req.protocol}://${req.get('host')}/api/phones`
    },
    meta: {
      totalPhones: phones.length,
      topBrand: brandsWithCount.length > 0 ? brandsWithCount.sort((a, b) => b.count - a.count)[0] : null
    },
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Broadcast endpoint
app.post('/api/broadcast', (req, res) => {
  const { message, type } = req.body;
  broadcast({ type: type || 'notification', message });
  res.json({ success: true, message: 'Broadcast sent to all clients' });
});

// Register all route modules
// Authentication routes (no auth required)
app.use('/api/auth', authRoutes);
// Phone verification routes
app.use('/api/verification', verificationRoutes);

// Other routes
app.use('/api/tracking', trackingRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/images', imageRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/filters', filtersRoutes);
app.use('/api/compare', comparisonRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api', modalsRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/alerts', alertsRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  res.status(err.status || 500).json({
    success: false,
    status: 'error',
    error: err.name || 'Internal server error',
    message: err.message || 'An unexpected error occurred',
    ...(isDevelopment && { stack: err.stack }),
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// 404 handler - Always return JSON response
app.use((req, res) => {
  res.status(404).json({
    success: false,
    status: 'not_found',
    error: 'Not found',
    message: `Route ${req.method} ${req.path} not found`,
    data: {
      requestedPath: req.path,
      requestedMethod: req.method,
      availableEndpoints: {
        api: `${req.protocol}://${req.get('host')}/api`,
        health: `${req.protocol}://${req.get('host')}/api/health`,
        phones: `${req.protocol}://${req.get('host')}/api/phones`,
        search: `${req.protocol}://${req.get('host')}/api/search`,
        featured: `${req.protocol}://${req.get('host')}/api/featured`,
        brands: `${req.protocol}://${req.get('host')}/api/brands`,
        users: `${req.protocol}://${req.get('host')}/api/users`,
        cart: `${req.protocol}://${req.get('host')}/api/cart`,
        orders: `${req.protocol}://${req.get('host')}/api/orders`,
        categories: `${req.protocol}://${req.get('host')}/api/categories`,
        modals: {
          callback: `${req.protocol}://${req.get('host')}/api/modals/callback`,
          lowprice: `${req.protocol}://${req.get('host')}/api/modals/lowprice`,
          oneclick: `${req.protocol}://${req.get('host')}/api/modals/oneclick`,
          credit: `${req.protocol}://${req.get('host')}/api/modals/credit`,
          trade: `${req.protocol}://${req.get('host')}/api/modals/trade`
        },
        newsletter: `${req.protocol}://${req.get('host')}/api/newsletter`,
        alerts: `${req.protocol}://${req.get('host')}/api/alerts`
      }
    },
    links: {
      self: `${req.protocol}://${req.get('host')}${req.originalUrl}`,
      api: `${req.protocol}://${req.get('host')}/api`,
      docs: `${req.protocol}://${req.get('host')}/demo`,
      home: `${req.protocol}://${req.get('host')}/`,
      health: `${req.protocol}://${req.get('host')}/api/health`
    },
    meta: {
      suggestion: 'Check /api endpoint for available routes',
      timestamp: new Date().toISOString()
    },
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
  console.log(`WebSocket server ready at ws://localhost:${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
  console.log(`Demo page at http://localhost:${PORT}`);
});
