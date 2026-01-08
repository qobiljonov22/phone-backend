// Real API Server - Phone Backend Test API
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.TEST_API_PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Mock data storage
let testData = {
  users: new Map(),
  orders: new Map(),
  reviews: new Map(),
  comparisons: new Map(),
  wishlists: new Map(),
  notifications: new Map(),
  analytics: new Map(),
  userCounter: 1,
  orderCounter: 1000
};

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Phone Backend Test API Server',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/api/health',
      testSuite: '/api/test/run',
      users: '/api/test/users',
      orders: '/api/test/orders',
      reviews: '/api/test/reviews',
      analytics: '/api/test/analytics',
      dashboard: '/api/test/dashboard'
    }
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Test API Server is healthy',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    timestamp: new Date()
  });
});

// Run complete test suite
app.post('/api/test/run', async (req, res) => {
  const { mainApiUrl = 'http://localhost:5000' } = req.body;
  
  try {
    console.log('🧪 Running comprehensive API test suite...');
    
    const testResults = {
      startTime: new Date(),
      mainApiUrl,
      tests: [],
      summary: {
        total: 0,
        passed: 0,
        failed: 0,
        duration: 0
      }
    };
    
    // Test 1: Health Check
    const healthResult = await runTest('Health Check', async () => {
      const response = await fetch(`${mainApiUrl}/api/health`);
      const data = await response.json();
      return {
        status: response.status,
        data,
        success: response.ok && data.status === 'OK'
      };
    });
    testResults.tests.push(healthResult);
    
    // Test 2: Seed Database
    const seedResult = await runTest('Database Seeding', async () => {
      const response = await fetch(`${mainApiUrl}/api/seed`, { method: 'POST' });
      const data = await response.json();
      return {
        status: response.status,
        data,
        success: response.ok && data.insertedCount > 0
      };
    });
    testResults.tests.push(seedResult);
    
    // Test 3: Get Phones
    const phonesResult = await runTest('Get All Phones', async () => {
      const response = await fetch(`${mainApiUrl}/api/phones`);
      const data = await response.json();
      return {
        status: response.status,
        data: { count: data.phones?.length || 0 },
        success: response.ok && data.phones && data.phones.length > 0
      };
    });
    testResults.tests.push(phonesResult);
    
    // Test 4: User Registration
    const userResult = await runTest('User Registration', async () => {
      const userData = {
        name: 'Test User',
        email: `test${Date.now()}@example.com`,
        phone: '+1234567890'
      };
      
      const response = await fetch(`${mainApiUrl}/api/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      const data = await response.json();
      
      if (response.ok && data.user) {
        testData.users.set(data.user.userId, data.user);
      }
      
      return {
        status: response.status,
        data: { userId: data.user?.userId },
        success: response.ok && data.user && data.user.userId
      };
    });
    testResults.tests.push(userResult);
    
    // Test 5: Shopping Cart
    const cartResult = await runTest('Shopping Cart', async () => {
      const userId = Array.from(testData.users.keys())[0];
      if (!userId) throw new Error('No user available for cart test');
      
      const response = await fetch(`${mainApiUrl}/api/cart/${userId}/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneId: 'iphone-15-pro-128',
          price: 999,
          quantity: 1,
          phone: { brand: 'iPhone', model: '15 Pro', storage: '128GB' }
        })
      });
      const data = await response.json();
      
      return {
        status: response.status,
        data: { total: data.cart?.total },
        success: response.ok && data.cart && data.cart.total > 0
      };
    });
    testResults.tests.push(cartResult);
    
    // Test 6: Order Creation
    const orderResult = await runTest('Order Creation', async () => {
      const userId = Array.from(testData.users.keys())[0];
      if (!userId) throw new Error('No user available for order test');
      
      const orderData = {
        userId,
        items: [{
          phoneId: 'iphone-15-pro-128',
          phone: { brand: 'iPhone', model: '15 Pro' },
          quantity: 1,
          price: 999
        }],
        total: 999,
        shippingAddress: {
          street: '123 Test St',
          city: 'Test City',
          state: 'TS',
          zip: '12345'
        },
        paymentMethod: 'credit_card'
      };
      
      const response = await fetch(`${mainApiUrl}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });
      const data = await response.json();
      
      if (response.ok && data.order) {
        testData.orders.set(data.order.orderId, data.order);
      }
      
      return {
        status: response.status,
        data: { orderId: data.order?.orderId },
        success: response.ok && data.order && data.order.orderId
      };
    });
    testResults.tests.push(orderResult);
    
    // Test 7: Reviews
    const reviewResult = await runTest('Review System', async () => {
      const userId = Array.from(testData.users.keys())[0];
      if (!userId) throw new Error('No user available for review test');
      
      const reviewData = {
        phoneId: 'iphone-15-pro-128',
        userId,
        userName: 'Test User',
        rating: 5,
        title: 'Amazing phone!',
        comment: 'Great performance and camera quality.',
        pros: ['Fast performance', 'Great camera'],
        cons: ['Expensive']
      };
      
      const response = await fetch(`${mainApiUrl}/api/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reviewData)
      });
      const data = await response.json();
      
      if (response.ok && data.review) {
        testData.reviews.set(data.review.reviewId, data.review);
      }
      
      return {
        status: response.status,
        data: { reviewId: data.review?.reviewId },
        success: response.ok && data.review && data.review.reviewId
      };
    });
    testResults.tests.push(reviewResult);
    
    // Test 8: Categories
    const categoriesResult = await runTest('Categories System', async () => {
      const response = await fetch(`${mainApiUrl}/api/categories/tree`);
      const data = await response.json();
      
      return {
        status: response.status,
        data: { categories: data.categoryTree?.length || 0 },
        success: response.ok && data.categoryTree && data.categoryTree.length > 0
      };
    });
    testResults.tests.push(categoriesResult);
    
    // Test 9: Filters
    const filtersResult = await runTest('Advanced Filters', async () => {
      const response = await fetch(`${mainApiUrl}/api/filters/options`);
      const data = await response.json();
      
      return {
        status: response.status,
        data: { filterTypes: Object.keys(data.filterOptions || {}).length },
        success: response.ok && data.filterOptions && Object.keys(data.filterOptions).length > 0
      };
    });
    testResults.tests.push(filtersResult);
    
    // Test 10: Dashboard
    const dashboardResult = await runTest('Admin Dashboard', async () => {
      const response = await fetch(`${mainApiUrl}/api/dashboard/overview`);
      const data = await response.json();
      
      return {
        status: response.status,
        data: { revenue: data.metrics?.totalRevenue?.current },
        success: response.ok && data.metrics && data.metrics.totalRevenue
      };
    });
    testResults.tests.push(dashboardResult);
    
    // Calculate summary
    testResults.summary.total = testResults.tests.length;
    testResults.summary.passed = testResults.tests.filter(t => t.success).length;
    testResults.summary.failed = testResults.tests.filter(t => !t.success).length;
    testResults.summary.duration = Date.now() - testResults.startTime.getTime();
    testResults.endTime = new Date();
    
    console.log(`✅ Test suite completed: ${testResults.summary.passed}/${testResults.summary.total} passed`);
    
    res.json({
      message: 'Test suite completed',
      results: testResults
    });
    
  } catch (error) {
    console.error('❌ Test suite failed:', error);
    res.status(500).json({
      error: 'Test suite failed',
      message: error.message,
      timestamp: new Date()
    });
  }
});

// Get test users
app.get('/api/test/users', (req, res) => {
  const users = Array.from(testData.users.values());
  res.json({
    users,
    total: users.length,
    timestamp: new Date()
  });
});

// Create test user
app.post('/api/test/users', (req, res) => {
  const { name, email, phone } = req.body;
  
  const userId = `test_user_${testData.userCounter++}`;
  const user = {
    userId,
    name: name || `Test User ${testData.userCounter - 1}`,
    email: email || `test${Date.now()}@example.com`,
    phone: phone || '+1234567890',
    createdAt: new Date(),
    isTestUser: true
  };
  
  testData.users.set(userId, user);
  
  res.status(201).json({
    user,
    message: 'Test user created successfully'
  });
});

// Get test orders
app.get('/api/test/orders', (req, res) => {
  const orders = Array.from(testData.orders.values());
  res.json({
    orders,
    total: orders.length,
    totalValue: orders.reduce((sum, order) => sum + order.total, 0),
    timestamp: new Date()
  });
});

// Create test order
app.post('/api/test/orders', (req, res) => {
  const { userId, items, total } = req.body;
  
  if (!userId || !items || !total) {
    return res.status(400).json({ error: 'userId, items, and total are required' });
  }
  
  const orderId = `TEST-${testData.orderCounter++}`;
  const order = {
    orderId,
    userId,
    items,
    total,
    status: 'pending',
    createdAt: new Date(),
    isTestOrder: true
  };
  
  testData.orders.set(orderId, order);
  
  res.status(201).json({
    order,
    message: 'Test order created successfully'
  });
});

// Get test reviews
app.get('/api/test/reviews', (req, res) => {
  const reviews = Array.from(testData.reviews.values());
  res.json({
    reviews,
    total: reviews.length,
    averageRating: reviews.length > 0 ? 
      reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0,
    timestamp: new Date()
  });
});

// Analytics endpoint
app.get('/api/test/analytics', (req, res) => {
  const analytics = {
    users: {
      total: testData.users.size,
      testUsers: Array.from(testData.users.values()).filter(u => u.isTestUser).length
    },
    orders: {
      total: testData.orders.size,
      testOrders: Array.from(testData.orders.values()).filter(o => o.isTestOrder).length,
      totalValue: Array.from(testData.orders.values()).reduce((sum, order) => sum + order.total, 0)
    },
    reviews: {
      total: testData.reviews.size,
      averageRating: testData.reviews.size > 0 ? 
        Array.from(testData.reviews.values()).reduce((sum, review) => sum + review.rating, 0) / testData.reviews.size : 0
    },
    serverUptime: process.uptime(),
    memoryUsage: process.memoryUsage(),
    timestamp: new Date()
  };
  
  res.json(analytics);
});

// Dashboard endpoint
app.get('/api/test/dashboard', (req, res) => {
  const users = Array.from(testData.users.values());
  const orders = Array.from(testData.orders.values());
  const reviews = Array.from(testData.reviews.values());
  
  const dashboard = {
    overview: {
      totalUsers: users.length,
      totalOrders: orders.length,
      totalRevenue: orders.reduce((sum, order) => sum + order.total, 0),
      totalReviews: reviews.length,
      averageRating: reviews.length > 0 ? 
        reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0
    },
    recentActivity: [
      ...orders.slice(-3).map(order => ({
        type: 'order',
        message: `Order ${order.orderId} created`,
        timestamp: order.createdAt,
        value: order.total
      })),
      ...reviews.slice(-3).map(review => ({
        type: 'review',
        message: `${review.rating}-star review posted`,
        timestamp: review.createdAt || new Date(),
        value: review.rating
      }))
    ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 5),
    performance: {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      responseTime: Math.random() * 100 + 50 // Mock response time
    },
    timestamp: new Date()
  };
  
  res.json(dashboard);
});

// Clear test data
app.delete('/api/test/clear', (req, res) => {
  testData = {
    users: new Map(),
    orders: new Map(),
    reviews: new Map(),
    comparisons: new Map(),
    wishlists: new Map(),
    notifications: new Map(),
    analytics: new Map(),
    userCounter: 1,
    orderCounter: 1000
  };
  
  res.json({
    message: 'All test data cleared successfully',
    timestamp: new Date()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message,
    timestamp: new Date()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.originalUrl,
    availableEndpoints: [
      'GET /',
      'GET /api/health',
      'POST /api/test/run',
      'GET /api/test/users',
      'POST /api/test/users',
      'GET /api/test/orders',
      'POST /api/test/orders',
      'GET /api/test/reviews',
      'GET /api/test/analytics',
      'GET /api/test/dashboard',
      'DELETE /api/test/clear'
    ],
    timestamp: new Date()
  });
});

// Helper function to run individual tests
async function runTest(testName, testFunction) {
  const startTime = Date.now();
  
  try {
    console.log(`🧪 Running: ${testName}`);
    const result = await testFunction();
    const duration = Date.now() - startTime;
    
    console.log(`${result.success ? '✅' : '❌'} ${testName}: ${result.success ? 'PASSED' : 'FAILED'} (${duration}ms)`);
    
    return {
      name: testName,
      success: result.success,
      duration,
      status: result.status,
      data: result.data,
      timestamp: new Date()
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    console.log(`❌ ${testName}: FAILED (${duration}ms) - ${error.message}`);
    
    return {
      name: testName,
      success: false,
      duration,
      error: error.message,
      timestamp: new Date()
    };
  }
}

// Start server
app.listen(PORT, () => {
  console.log(`🧪 Phone Backend Test API Server running on http://localhost:${PORT}`);
  console.log(`📊 Dashboard: http://localhost:${PORT}/api/test/dashboard`);
  console.log(`🔍 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🚀 Run tests: POST http://localhost:${PORT}/api/test/run`);
});

module.exports = app;