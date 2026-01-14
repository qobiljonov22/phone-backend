import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Import routes
import trackingRoutes from './routes/tracking.js';
import paymentsRoutes from './routes/payments.js';
import adminRoutes from './routes/admin.js';
import imageRoutes from './routes/images.js';

dotenv.config();

// Load phones database
let phonesData = JSON.parse(fs.readFileSync('phones_database.json', 'utf8'));

// Helper function to save data
const saveData = () => {
  fs.writeFileSync('phones_database.json', JSON.stringify(phonesData, null, 2));
};

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

// API Routes
app.get('/', (req, res) => {
  res.send(`<!DOCTYPE html>
<html>
<head>
    <title>Phone Store API</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        .container {
            max-width: 900px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(90deg, #00bcd4, #2196f3);
            color: white;
            padding: 20px 30px;
            display: flex;
            align-items: center;
            gap: 12px;
        }
        .header h1 {
            font-size: 1.5em;
            font-weight: 600;
        }
        .content {
            padding: 30px;
            text-align: center;
        }
        .api-info {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
        }
        .endpoint {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 12px;
            margin: 5px 0;
            background: white;
            border-radius: 4px;
            border: 1px solid #e0e0e0;
        }
        .method {
            padding: 2px 6px;
            border-radius: 3px;
            font-size: 0.7em;
            font-weight: 600;
            color: white;
            min-width: 45px;
            text-align: center;
        }
        .method.get { background: #4caf50; }
        .method.post { background: #ff9800; }
        .method.put { background: #2196f3; }
        .method.delete { background: #f44336; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <span>📱</span>
            <h1>Phone Store API</h1>
        </div>
        
        <div class="content">
            <h2>Phone Store Backend API</h2>
            <p>Complete e-commerce backend with real-time features</p>
            
            <div class="api-info">
                <h3>Main Endpoints</h3>
                <div class="endpoint">
                    <span><span class="method get">GET</span> /api/health</span>
                    <span>API Health Check</span>
                </div>
                <div class="endpoint">
                    <span><span class="method get">GET</span> /api/phones</span>
                    <span>Get all phones with filters</span>
                </div>
                <div class="endpoint">
                    <span><span class="method get">GET</span> /api/phones/:id</span>
                    <span>Get phone details</span>
                </div>
                <div class="endpoint">
                    <span><span class="method get">GET</span> /api/search</span>
                    <span>Search phones</span>
                </div>
                <div class="endpoint">
                    <span><span class="method get">GET</span> /api/featured</span>
                    <span>Featured phones</span>
                </div>
                <div class="endpoint">
                    <span><span class="method get">GET</span> /api/categories</span>
                    <span>Phone categories</span>
                </div>
                <div class="endpoint">
                    <span><span class="method get">GET</span> /api/brands</span>
                    <span>Phone brands</span>
                </div>
                <div class="endpoint">
                    <span><span class="method post">POST</span> /api/phones</span>
                    <span>Add new phone</span>
                </div>
                <div class="endpoint">
                    <span><span class="method post">POST</span> /api/images/upload/:phoneId</span>
                    <span>Upload phone images</span>
                </div>
                <div class="endpoint">
                    <span><span class="method get">GET</span> /api/images/phone/:phoneId</span>
                    <span>Get phone images</span>
                </div>
                <div class="endpoint">
                    <span><span class="method get">GET</span> /api/cart/:userId</span>
                    <span>Get user cart</span>
                </div>
                <div class="endpoint">
                    <span><span class="method post">POST</span> /api/cart/:userId/add</span>
                    <span>Add to cart</span>
                </div>
                <div class="endpoint">
                    <span><span class="method get">GET</span> /api/orders/:userId</span>
                    <span>Get user orders</span>
                </div>
                <div class="endpoint">
                    <span><span class="method post">POST</span> /api/orders</span>
                    <span>Create order</span>
                </div>
            </div>
            
            <p><strong>WebSocket:</strong> ${process.env.WEBSOCKET_URL || `ws://localhost:${PORT}`}</p>
            <p><strong>Database:</strong> ${Object.keys(phonesData.phones).length} phones available</p>
        </div>
    </div>
</body>
</html>`);
});

// API Routes
app.use('/api/tracking', trackingRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/images', imageRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Phone Backend is healthy',
    uptime: process.uptime(),
    websocket: {
      connectedClients: clients.size,
      status: 'active'
    },
    database: {
      phones: Object.keys(phonesData.phones).length,
      users: Object.keys(phonesData.users).length,
      orders: Object.keys(phonesData.orders).length,
      reviews: Object.keys(phonesData.reviews).length
    },
    timestamp: new Date().toISOString()
  });
});

// Get all phones with pagination and filters
app.get('/api/phones', (req, res) => {
  const { 
    page = 1, 
    limit = 12, 
    category, 
    brand, 
    minPrice, 
    maxPrice, 
    inStock, 
    sortBy = 'createdAt', 
    sortOrder = 'desc',
    tags
  } = req.query;
  
  let phones = Object.values(phonesData.phones);
  
  // Apply filters
  if (category) {
    phones = phones.filter(phone => phone.category === category);
  }
  
  if (brand) {
    phones = phones.filter(phone => phone.brand.toLowerCase() === brand.toLowerCase());
  }
  
  if (minPrice) {
    phones = phones.filter(phone => phone.price >= parseInt(minPrice));
  }
  
  if (maxPrice) {
    phones = phones.filter(phone => phone.price <= parseInt(maxPrice));
  }
  
  if (inStock === 'true') {
    phones = phones.filter(phone => phone.inStock && phone.quantity > 0);
  }
  
  if (tags) {
    const tagArray = tags.split(',');
    phones = phones.filter(phone => 
      phone.tags && phone.tags.some(tag => tagArray.includes(tag))
    );
  }
  
  // Sort phones
  phones.sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];
    
    if (sortBy === 'price' || sortBy === 'rating') {
      aValue = parseFloat(aValue);
      bValue = parseFloat(bValue);
    }
    
    if (sortOrder === 'desc') {
      return bValue > aValue ? 1 : -1;
    } else {
      return aValue > bValue ? 1 : -1;
    }
  });
  
  // Pagination
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + parseInt(limit);
  const paginatedPhones = phones.slice(startIndex, endIndex);
  
  res.json({
    phones: paginatedPhones,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(phones.length / limit),
      totalItems: phones.length,
      itemsPerPage: parseInt(limit),
      hasNext: endIndex < phones.length,
      hasPrev: startIndex > 0
    },
    filters: {
      category,
      brand,
      minPrice,
      maxPrice,
      inStock,
      tags
    },
    metadata: phonesData.metadata,
    timestamp: new Date().toISOString()
  });
});

// Phone details API with real data integration
app.get('/api/phones/:id', (req, res) => {
  const { id } = req.params;
  
  const phone = phonesData.phones[id];
  
  if (!phone) {
    return res.status(404).json({
      error: 'Phone not found',
      message: `Phone with ID '${id}' does not exist`,
      id,
      availablePhones: Object.keys(phonesData.phones),
      totalAvailable: phonesData.metadata.totalPhones,
      timestamp: new Date().toISOString()
    });
  }
  
  res.json({
    phone,
    metadata: {
      totalPhones: phonesData.metadata.totalPhones,
      category: phone.category,
      brand: phone.brand,
      relatedPhones: Object.values(phonesData.phones)
        .filter(p => p.brand === phone.brand && p.id !== phone.id)
        .slice(0, 3)
    },
    timestamp: new Date().toISOString()
  });
});

// Enhanced Search API with advanced filtering
app.get('/api/search', (req, res) => {
  const { 
    q, 
    category, 
    brand, 
    minPrice, 
    maxPrice, 
    inStock, 
    tags, 
    sortBy = 'relevance',
    page = 1,
    limit = 12
  } = req.query;
  
  let phones = Object.values(phonesData.phones);
  let relevanceScores = {};
  
  // Search by query with relevance scoring
  if (q) {
    const searchTerm = q.toLowerCase();
    phones = phones.filter(phone => {
      let score = 0;
      const brand = phone.brand.toLowerCase();
      const model = phone.model.toLowerCase();
      const description = phone.description.toLowerCase();
      const features = phone.features.join(' ').toLowerCase();
      
      // Exact matches get higher scores
      if (brand.includes(searchTerm)) score += 10;
      if (model.includes(searchTerm)) score += 8;
      if (description.includes(searchTerm)) score += 3;
      if (features.includes(searchTerm)) score += 2;
      
      // Tag matches
      if (phone.tags && phone.tags.some(tag => tag.toLowerCase().includes(searchTerm))) {
        score += 5;
      }
      
      relevanceScores[phone.id] = score;
      return score > 0;
    });
  }
  
  // Apply other filters
  if (category) {
    phones = phones.filter(phone => phone.category === category);
  }
  
  if (brand) {
    phones = phones.filter(phone => phone.brand.toLowerCase() === brand.toLowerCase());
  }
  
  if (minPrice) {
    phones = phones.filter(phone => phone.price >= parseInt(minPrice));
  }
  
  if (maxPrice) {
    phones = phones.filter(phone => phone.price <= parseInt(maxPrice));
  }
  
  if (inStock === 'true') {
    phones = phones.filter(phone => phone.inStock && phone.quantity > 0);
  }
  
  if (tags) {
    const tagArray = tags.split(',');
    phones = phones.filter(phone => 
      phone.tags && phone.tags.some(tag => tagArray.includes(tag))
    );
  }
  
  // Sort by relevance or other criteria
  if (sortBy === 'relevance' && q) {
    phones.sort((a, b) => (relevanceScores[b.id] || 0) - (relevanceScores[a.id] || 0));
  } else {
    phones.sort((a, b) => {
      switch (sortBy) {
        case 'price_low':
          return a.price - b.price;
        case 'price_high':
          return b.price - a.price;
        case 'rating':
          return b.rating - a.rating;
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'popular':
          return b.reviews - a.reviews;
        default:
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });
  }
  
  // Pagination
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + parseInt(limit);
  const paginatedPhones = phones.slice(startIndex, endIndex);
  
  res.json({
    phones: paginatedPhones,
    total: phones.length,
    query: { q, category, brand, minPrice, maxPrice, inStock, tags },
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(phones.length / limit),
      totalItems: phones.length,
      itemsPerPage: parseInt(limit)
    },
    suggestions: q ? generateSearchSuggestions(q) : [],
    metadata: phonesData.metadata,
    timestamp: new Date().toISOString()
  });
});

// Generate search suggestions
function generateSearchSuggestions(query) {
  const suggestions = [];
  const searchTerm = query.toLowerCase();
  
  // Brand suggestions
  Object.values(phonesData.brands).forEach(brand => {
    if (brand.name.toLowerCase().includes(searchTerm)) {
      suggestions.push({
        type: 'brand',
        text: brand.name,
        count: brand.phoneCount
      });
    }
  });
  
  // Model suggestions
  Object.values(phonesData.phones).forEach(phone => {
    if (phone.model.toLowerCase().includes(searchTerm)) {
      suggestions.push({
        type: 'model',
        text: phone.model,
        brand: phone.brand
      });
    }
  });
  
  return suggestions.slice(0, 5);
}

// Enhanced Featured phones API
app.get('/api/featured', (req, res) => {
  const { limit = 6 } = req.query;
  
  // Get featured phones based on tags and ratings
  const featuredPhones = Object.values(phonesData.phones)
    .filter(phone => 
      phone.tags && (
        phone.tags.includes('bestseller') || 
        phone.tags.includes('new') || 
        phone.rating >= 4.5
      )
    )
    .sort((a, b) => {
      // Prioritize bestsellers, then new, then by rating
      const aScore = (a.tags.includes('bestseller') ? 10 : 0) + 
                    (a.tags.includes('new') ? 5 : 0) + 
                    a.rating;
      const bScore = (b.tags.includes('bestseller') ? 10 : 0) + 
                    (b.tags.includes('new') ? 5 : 0) + 
                    b.rating;
      return bScore - aScore;
    })
    .slice(0, parseInt(limit));
  
  res.json({
    phones: featuredPhones,
    total: featuredPhones.length,
    criteria: 'bestseller, new, high-rating',
    timestamp: new Date().toISOString()
  });
});

// Enhanced Categories API with real data
app.get('/api/categories', (req, res) => {
  const categories = Object.values(phonesData.categories).map(category => ({
    ...category,
    phones: Object.values(phonesData.phones)
      .filter(phone => phone.category === category.id)
      .slice(0, 3) // Show 3 sample phones per category
  }));
  
  res.json({
    categories,
    total: categories.length,
    timestamp: new Date().toISOString()
  });
});

// Enhanced Brands API with real data
app.get('/api/brands', (req, res) => {
  const brands = Object.values(phonesData.brands).map(brand => ({
    ...brand,
    phones: Object.values(phonesData.phones)
      .filter(phone => phone.brand === brand.name)
      .slice(0, 2), // Show 2 sample phones per brand
    priceRange: {
      min: Math.min(...Object.values(phonesData.phones)
        .filter(phone => phone.brand === brand.name)
        .map(phone => phone.price)),
      max: Math.max(...Object.values(phonesData.phones)
        .filter(phone => phone.brand === brand.name)
        .map(phone => phone.price))
    }
  }));
  
  res.json({
    brands,
    total: brands.length,
    timestamp: new Date().toISOString()
  });
});

// Create/Update phone with real data integration
app.post('/api/phones', (req, res) => {
  const { 
    brand, 
    model, 
    price, 
    originalPrice,
    storage, 
    colors, 
    category,
    specifications,
    features,
    description,
    images,
    tags
  } = req.body;
  
  if (!brand || !model || !price) {
    return res.status(400).json({
      error: 'Brand, model, and price are required'
    });
  }
  
  const phoneId = `${brand.toLowerCase()}-${model.toLowerCase().replace(/\s+/g, '-')}`;
  
  const newPhone = {
    id: phoneId,
    brand,
    model,
    price: parseFloat(price),
    originalPrice: originalPrice ? parseFloat(originalPrice) : parseFloat(price),
    discount: originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0,
    storage: storage || ['128GB'],
    colors: colors || ['Black'],
    inStock: true,
    quantity: 50,
    rating: 0,
    reviews: 0,
    category: category || 'premium',
    tags: tags || ['new'],
    images: images || ['/uploads/phones/default.jpg'],
    specifications: specifications || {
      display: '6.1" OLED',
      processor: 'Octa-core',
      camera: '48MP Main',
      battery: '4000 mAh',
      os: 'Android 14',
      weight: '180g',
      dimensions: '150 x 75 x 8 mm',
      waterResistance: 'IP68',
      wireless: '5G, Wi-Fi 6, Bluetooth 5.3',
      ram: '8GB',
      charging: '25W Fast Charging'
    },
    features: features || [
      'Advanced Camera System',
      'Fast Charging',
      'Premium Design',
      'Latest OS'
    ],
    description: description || `${brand} ${model} with advanced features and premium design.`,
    warranty: '1 year international warranty',
    seller: `Official ${brand} Store`,
    shipping: {
      free: true,
      days: '2-3 kun',
      express: true
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  // Add to database
  phonesData.phones[phoneId] = newPhone;
  
  // Update metadata
  phonesData.metadata.totalPhones = Object.keys(phonesData.phones).length;
  phonesData.metadata.lastUpdated = new Date().toISOString();
  
  // Update price range
  const prices = Object.values(phonesData.phones).map(p => p.price);
  phonesData.metadata.priceRange = {
    min: Math.min(...prices),
    max: Math.max(...prices)
  };
  
  // Update brand count
  if (!phonesData.brands[brand.toLowerCase()]) {
    phonesData.brands[brand.toLowerCase()] = {
      id: brand.toLowerCase(),
      name: brand,
      logo: `/uploads/brands/${brand.toLowerCase()}.png`,
      phoneCount: 1,
      popular: false,
      description: `${brand} smartphones`
    };
  } else {
    phonesData.brands[brand.toLowerCase()].phoneCount++;
  }
  
  // Update category count
  if (phonesData.categories[category]) {
    phonesData.categories[category].phoneCount++;
  }
  
  saveData();
  
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
    message: 'Phone created successfully',
    phone: newPhone,
    timestamp: new Date().toISOString()
  });
});

// Update phone with real data integration
app.put('/api/phones/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  
  if (!phonesData.phones[id]) {
    return res.status(404).json({ error: 'Phone not found' });
  }
  
  const currentPhone = phonesData.phones[id];
  
  // Update phone data
  const updatedPhone = {
    ...currentPhone,
    ...updates,
    id, // Ensure ID doesn't change
    updatedAt: new Date().toISOString()
  };
  
  // Recalculate discount if price or originalPrice changed
  if (updates.price || updates.originalPrice) {
    const price = updates.price || currentPhone.price;
    const originalPrice = updates.originalPrice || currentPhone.originalPrice;
    updatedPhone.discount = originalPrice > price ? 
      Math.round(((originalPrice - price) / originalPrice) * 100) : 0;
  }
  
  phonesData.phones[id] = updatedPhone;
  
  // Update metadata
  phonesData.metadata.lastUpdated = new Date().toISOString();
  
  // Update price range if price changed
  if (updates.price) {
    const prices = Object.values(phonesData.phones).map(p => p.price);
    phonesData.metadata.priceRange = {
      min: Math.min(...prices),
      max: Math.max(...prices)
    };
  }
  
  saveData();
  
  // Broadcast update to all WebSocket clients
  const broadcastMessage = {
    type: 'phone_updated',
    message: `Phone ${id} has been updated`,
    phone: updatedPhone,
    changes: Object.keys(updates),
    timestamp: new Date().toISOString()
  };
  
  clients.forEach((client) => {
    if (client.readyState === client.OPEN) {
      client.send(JSON.stringify(broadcastMessage));
    }
  });
  
  res.json({
    message: 'Phone updated successfully',
    phone: updatedPhone,
    timestamp: new Date().toISOString()
  });
});

// Delete phone with real data integration
app.delete('/api/phones/:id', (req, res) => {
  const { id } = req.params;
  
  if (!phonesData.phones[id]) {
    return res.status(404).json({ error: 'Phone not found' });
  }
  
  const deletedPhone = phonesData.phones[id];
  
  // Remove from database
  delete phonesData.phones[id];
  
  // Update metadata
  phonesData.metadata.totalPhones = Object.keys(phonesData.phones).length;
  phonesData.metadata.lastUpdated = new Date().toISOString();
  
  // Update brand count
  const brandKey = deletedPhone.brand.toLowerCase();
  if (phonesData.brands[brandKey]) {
    phonesData.brands[brandKey].phoneCount--;
    if (phonesData.brands[brandKey].phoneCount <= 0) {
      delete phonesData.brands[brandKey];
    }
  }
  
  // Update category count
  if (phonesData.categories[deletedPhone.category]) {
    phonesData.categories[deletedPhone.category].phoneCount--;
  }
  
  // Update price range
  if (Object.keys(phonesData.phones).length > 0) {
    const prices = Object.values(phonesData.phones).map(p => p.price);
    phonesData.metadata.priceRange = {
      min: Math.min(...prices),
      max: Math.max(...prices)
    };
  }
  
  saveData();
  
  // Broadcast deletion to all WebSocket clients
  const broadcastMessage = {
    type: 'phone_deleted',
    message: `Phone ${id} has been deleted`,
    phone: { ...deletedPhone, deletedAt: new Date().toISOString() },
    timestamp: new Date().toISOString()
  };
  
  clients.forEach((client) => {
    if (client.readyState === client.OPEN) {
      client.send(JSON.stringify(broadcastMessage));
    }
  });
  
  res.json({
    message: 'Phone deleted successfully',
    phone: { ...deletedPhone, deletedAt: new Date().toISOString() },
    timestamp: new Date().toISOString()
  });
});

// Real-time notifications API
app.post('/api/notifications', (req, res) => {
  const { type, title, message, userId } = req.body;
  
  const notification = {
    id: Date.now().toString(),
    type: type || 'info',
    title: title || 'New Notification',
    message: message || 'You have a new notification',
    userId,
    timestamp: new Date().toISOString(),
    read: false
  };
  
  // Broadcast notification to all WebSocket clients
  const broadcastMessage = {
    type: 'notification',
    notification,
    timestamp: new Date().toISOString()
  };
  
  clients.forEach((client) => {
    if (client.readyState === client.OPEN) {
      client.send(JSON.stringify(broadcastMessage));
    }
  });
  
  res.json({
    notification,
    message: 'Notification sent successfully'
  });
});

// Live price updates API
app.post('/api/price-update', (req, res) => {
  const { phoneId, newPrice, oldPrice } = req.body;
  
  if (!phoneId || !newPrice) {
    return res.status(400).json({
      error: 'Phone ID and new price are required'
    });
  }
  
  const priceUpdate = {
    phoneId,
    newPrice: parseFloat(newPrice),
    oldPrice: oldPrice ? parseFloat(oldPrice) : null,
    discount: oldPrice ? Math.round(((oldPrice - newPrice) / oldPrice) * 100) : 0,
    timestamp: new Date().toISOString()
  };
  
  // Broadcast price update to all WebSocket clients
  const broadcastMessage = {
    type: 'price_update',
    data: priceUpdate,
    message: `Price updated for ${phoneId}`,
    timestamp: new Date().toISOString()
  };
  
  clients.forEach((client) => {
    if (client.readyState === client.OPEN) {
      client.send(JSON.stringify(broadcastMessage));
    }
  });
  
  res.json({
    priceUpdate,
    message: 'Price update broadcasted successfully'
  });
});

// Stock status API
app.post('/api/stock-update', (req, res) => {
  const { phoneId, inStock, quantity } = req.body;
  
  if (!phoneId || inStock === undefined) {
    return res.status(400).json({
      error: 'Phone ID and stock status are required'
    });
  }
  
  const stockUpdate = {
    phoneId,
    inStock: Boolean(inStock),
    quantity: quantity || 0,
    timestamp: new Date().toISOString()
  };
  
  // Broadcast stock update to all WebSocket clients
  const broadcastMessage = {
    type: 'stock_update',
    data: stockUpdate,
    message: `Stock updated for ${phoneId}`,
    timestamp: new Date().toISOString()
  };
  
  clients.forEach((client) => {
    if (client.readyState === client.OPEN) {
      client.send(JSON.stringify(broadcastMessage));
    }
  });
  
  res.json({
    stockUpdate,
    message: 'Stock update broadcasted successfully'
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
      'GET /api/phones/:id',
      'GET /api/search',
      'GET /api/featured',
      'GET /api/categories',
      'GET /api/brands',
      'POST /api/phones',
      'PUT /api/phones/:id',
      'DELETE /api/phones/:id',
      'POST /api/notifications',
      'POST /api/price-update',
      'POST /api/stock-update'
    ]
  });
});

server.listen(PORT, () => {
  const baseUrl = process.env.BASE_URL || `http://localhost:${PORT}`;
  const wsUrl = process.env.WEBSOCKET_URL || `ws://localhost:${PORT}`;
  
  console.log(`🚀 Phone Backend Server running on ${baseUrl}`);
  console.log(`🔍 Health check: ${baseUrl}/api/health`);
  console.log(`📱 Phones API: ${baseUrl}/api/phones`);
  console.log(`🔌 WebSocket: ${wsUrl}`);
  console.log(`🌐 Demo: ${baseUrl}`);
});