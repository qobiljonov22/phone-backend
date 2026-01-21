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

dotenv.config();

// Load phones database
const phonesFile = 'phones_database.json';
let phonesData = { phones: {} };

// Load phones from file
const loadPhones = () => {
  try {
    if (fs.existsSync(phonesFile)) {
      phonesData = JSON.parse(fs.readFileSync(phonesFile, 'utf8'));
    }
  } catch (error) {
    console.error('Error loading phones:', error);
    phonesData = { phones: {} };
  }
};

// Save phones to file
const savePhones = () => {
  try {
    fs.writeFileSync(phonesFile, JSON.stringify(phonesData, null, 2));
  } catch (error) {
    console.error('Error saving phones:', error);
  }
};

// Initialize: load phones on startup
loadPhones();

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.use('/uploads', express.static('uploads')); // Serve uploaded images

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
  res.json({
    name: 'Phone Store Backend API',
    version: '1.0.0',
    description: 'Professional Phone E-commerce Backend API with WebSocket',
    baseUrl: `http://localhost:${PORT}/api`,
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
      url: `ws://localhost:${PORT}`,
      status: 'active',
      connected: clients.size
    },
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    websocket: {
      connected: clients.size,
      status: 'active'
    },
    database: {
      phones: Object.keys(phonesData.phones || {}).length
    }
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
app.get('/api/phones', (req, res) => {
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
  
  res.json({
    phones: formattedPhones,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: phones.length,
      pages: Math.ceil(phones.length / parseInt(limit))
    }
  });
});

app.get('/api/phones/:id', (req, res) => {
  const { id } = req.params;
  const phone = phonesData.phones?.[id];
  
  if (!phone) {
    return res.status(404).json({ error: 'Phone not found', message: 'Telefon topilmadi' });
  }
  
  res.json(formatPhoneForUI(phone));
});

app.post('/api/phones', (req, res) => {
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
  
  res.status(201).json({
    message: 'Phone created successfully',
    phone: phonesData.phones[id]
  });
});

app.put('/api/phones/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  
  if (!phonesData.phones?.[id]) {
    return res.status(404).json({ error: 'Phone not found' });
  }
  
  phonesData.phones[id] = {
    ...phonesData.phones[id],
    ...updates,
    id,
    updatedAt: new Date().toISOString()
  };
  
  savePhones();
  broadcast({ type: 'phone_updated', phone: phonesData.phones[id] });
  
  res.json({
    message: 'Phone updated successfully',
    phone: phonesData.phones[id]
  });
});

app.delete('/api/phones/:id', (req, res) => {
  const { id } = req.params;
  
  if (!phonesData.phones?.[id]) {
    return res.status(404).json({ error: 'Phone not found' });
  }
  
  delete phonesData.phones[id];
  savePhones();
  broadcast({ type: 'phone_deleted', id });
  
  res.json({ message: 'Phone deleted successfully' });
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
  
  res.json({ phones: formattedPhones, count: phones.length });
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
  
  res.json({ phones: formattedPhones });
});

// Brands endpoint
app.get('/api/brands', (req, res) => {
  const phones = Object.values(phonesData.phones || {});
  const brands = [...new Set(phones.map(p => p.brand).filter(Boolean))];
  res.json({ brands });
});

// Broadcast endpoint
app.post('/api/broadcast', (req, res) => {
  const { message, type } = req.body;
  broadcast({ type: type || 'notification', message });
  res.json({ success: true, message: 'Broadcast sent to all clients' });
});

// Register all route modules
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
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: `Route ${req.method} ${req.path} not found`
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
  console.log(`WebSocket server ready at ws://localhost:${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
  console.log(`Demo page at http://localhost:${PORT}`);
});
