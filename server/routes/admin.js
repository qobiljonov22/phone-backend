import express from 'express';
const router = express.Router();

// Admin authentication middleware (sodda versiya)
const adminAuth = (req, res, next) => {
  const { authorization } = req.headers;
  
  if (!authorization || authorization !== 'Bearer admin-token-2024') {
    return res.status(401).json({
      error: 'Unauthorized access',
      message: 'Admin token required'
    });
  }
  
  next();
};

// Apply admin auth to all routes
router.use(adminAuth);

// Dashboard overview
router.get('/dashboard', (req, res) => {
  const dashboardData = {
    overview: {
      totalUsers: 1250,
      totalOrders: 890,
      totalRevenue: 125000,
      totalProducts: 45,
      newUsersToday: 23,
      ordersToday: 15,
      revenueToday: 8500
    },
    recentOrders: [
      {
        id: 'ORD001',
        customer: 'John Doe',
        phone: 'iPhone 15 Pro',
        amount: 999,
        status: 'shipped',
        date: new Date().toISOString()
      },
      {
        id: 'ORD002',
        customer: 'Jane Smith',
        phone: 'Galaxy S24 Ultra',
        amount: 1299,
        status: 'processing',
        date: new Date(Date.now() - 3600000).toISOString()
      }
    ],
    topProducts: [
      { name: 'iPhone 15 Pro', sales: 156, revenue: 155844 },
      { name: 'Galaxy S24 Ultra', sales: 98, revenue: 127302 },
      { name: 'Pixel 8 Pro', sales: 67, revenue: 66933 }
    ],
    salesChart: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      data: [12000, 15000, 18000, 22000, 25000, 28000]
    }
  };
  
  res.json({
    dashboard: dashboardData,
    timestamp: new Date().toISOString()
  });
});

// User management
router.get('/users', (req, res) => {
  const { page = 1, limit = 20, search } = req.query;
  
  const users = [
    {
      id: 'user1',
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+1234567890',
      status: 'active',
      totalOrders: 5,
      totalSpent: 2500,
      joinDate: '2024-01-15',
      lastLogin: new Date().toISOString()
    },
    {
      id: 'user2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      phone: '+1234567891',
      status: 'active',
      totalOrders: 3,
      totalSpent: 1800,
      joinDate: '2024-02-20',
      lastLogin: new Date(Date.now() - 86400000).toISOString()
    }
  ];
  
  res.json({
    users,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: users.length,
      totalPages: Math.ceil(users.length / limit)
    },
    timestamp: new Date().toISOString()
  });
});

// Order management
router.get('/orders', (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  
  const orders = [
    {
      id: 'ORD001',
      customer: {
        name: 'John Doe',
        email: 'john@example.com'
      },
      items: [
        {
          phone: 'iPhone 15 Pro',
          quantity: 1,
          price: 999
        }
      ],
      total: 999,
      status: 'shipped',
      paymentStatus: 'paid',
      shippingAddress: '123 Main St, City, State 12345',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];
  
  const filteredOrders = status 
    ? orders.filter(order => order.status === status)
    : orders;
  
  res.json({
    orders: filteredOrders,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: filteredOrders.length,
      totalPages: Math.ceil(filteredOrders.length / limit)
    },
    timestamp: new Date().toISOString()
  });
});

// Product management
router.get('/products', (req, res) => {
  const products = [
    {
      id: 'iphone-15-pro',
      name: 'iPhone 15 Pro',
      brand: 'Apple',
      price: 999,
      stock: 25,
      status: 'active',
      sales: 156,
      revenue: 155844,
      rating: 4.8,
      reviews: 1250
    },
    {
      id: 'galaxy-s24-ultra',
      name: 'Galaxy S24 Ultra',
      brand: 'Samsung',
      price: 1299,
      stock: 18,
      status: 'active',
      sales: 98,
      revenue: 127302,
      rating: 4.7,
      reviews: 890
    }
  ];
  
  res.json({
    products,
    total: products.length,
    timestamp: new Date().toISOString()
  });
});

// Update product
router.put('/products/:productId', (req, res) => {
  const { productId } = req.params;
  const updates = req.body;
  
  res.json({
    productId,
    updates,
    message: 'Product updated successfully',
    timestamp: new Date().toISOString()
  });
});

// Analytics
router.get('/analytics', (req, res) => {
  const { period = '7d' } = req.query;
  
  const analytics = {
    period,
    metrics: {
      totalRevenue: 125000,
      totalOrders: 890,
      averageOrderValue: 140.45,
      conversionRate: 3.2,
      customerRetentionRate: 68.5,
      topSellingProducts: [
        { name: 'iPhone 15 Pro', units: 156 },
        { name: 'Galaxy S24 Ultra', units: 98 },
        { name: 'Pixel 8 Pro', units: 67 }
      ],
      revenueByDay: [
        { date: '2024-01-01', revenue: 2500 },
        { date: '2024-01-02', revenue: 3200 },
        { date: '2024-01-03', revenue: 2800 }
      ],
      userGrowth: {
        newUsers: 145,
        returningUsers: 320,
        churnRate: 5.2
      }
    }
  };
  
  res.json({
    analytics,
    timestamp: new Date().toISOString()
  });
});

// System settings
router.get('/settings', (req, res) => {
  const settings = {
    site: {
      name: 'Phone Store',
      description: 'Best phones at best prices',
      logo: '/images/logo.png',
      favicon: '/images/favicon.ico'
    },
    payment: {
      enabledMethods: ['card', 'paypal', 'apple_pay'],
      currency: 'USD',
      taxRate: 8.5
    },
    shipping: {
      freeShippingThreshold: 100,
      standardShippingCost: 9.99,
      expressShippingCost: 19.99
    },
    notifications: {
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true
    }
  };
  
  res.json({
    settings,
    timestamp: new Date().toISOString()
  });
});

// Update settings
router.put('/settings', (req, res) => {
  const updates = req.body;
  
  res.json({
    updates,
    message: 'Settings updated successfully',
    timestamp: new Date().toISOString()
  });
});

// Update user account
router.put('/users/:userId', (req, res) => {
  const { userId } = req.params;
  const { name, email, phone, status, role, permissions } = req.body;
  
  const updatedUser = {
    id: userId,
    name: name || 'Updated User',
    email: email || 'updated@example.com',
    phone: phone || '+1234567890',
    status: status || 'active',
    role: role || 'customer',
    permissions: permissions || [],
    updatedAt: new Date().toISOString(),
    updatedBy: 'admin'
  };
  
  res.json({
    message: 'User account updated successfully',
    user: updatedUser,
    timestamp: new Date().toISOString()
  });
});

// Update order
router.put('/orders/:orderId', (req, res) => {
  const { orderId } = req.params;
  const { status, priority, assignedTo, notes } = req.body;
  
  const updatedOrder = {
    id: orderId,
    status: status || 'processing',
    priority: priority || 'normal',
    assignedTo: assignedTo || 'auto',
    notes: notes || '',
    updatedAt: new Date().toISOString(),
    updatedBy: 'admin'
  };
  
  res.json({
    message: 'Order updated successfully',
    order: updatedOrder,
    timestamp: new Date().toISOString()
  });
});

// Update product (already exists, but let's enhance it)
router.put('/products/:productId', (req, res) => {
  const { productId } = req.params;
  const { name, price, stock, status, category, featured, discount } = req.body;
  
  const updatedProduct = {
    id: productId,
    name: name || 'Updated Product',
    price: price ? parseFloat(price) : 999,
    stock: stock !== undefined ? parseInt(stock) : 100,
    status: status || 'active',
    category: category || 'smartphones',
    featured: featured !== undefined ? Boolean(featured) : false,
    discount: discount || 0,
    updatedAt: new Date().toISOString(),
    updatedBy: 'admin'
  };
  
  res.json({
    message: 'Product updated successfully',
    product: updatedProduct,
    timestamp: new Date().toISOString()
  });
});

// Update system settings (already exists, but let's enhance it)
router.put('/settings', (req, res) => {
  const { site, payment, shipping, notifications, security } = req.body;
  
  const updatedSettings = {
    site: site || {
      name: 'Phone Store',
      description: 'Updated description'
    },
    payment: payment || {
      enabledMethods: ['card', 'paypal'],
      currency: 'USD'
    },
    shipping: shipping || {
      freeShippingThreshold: 100,
      standardCost: 9.99
    },
    notifications: notifications || {
      email: true,
      sms: false
    },
    security: security || {
      twoFactorAuth: false,
      sessionTimeout: 30
    },
    updatedAt: new Date().toISOString(),
    updatedBy: 'admin'
  };
  
  res.json({
    message: 'System settings updated successfully',
    settings: updatedSettings,
    timestamp: new Date().toISOString()
  });
});

// Update user permissions
router.put('/users/:userId/permissions', (req, res) => {
  const { userId } = req.params;
  const { permissions, role } = req.body;
  
  if (!permissions || !Array.isArray(permissions)) {
    return res.status(400).json({
      error: 'Permissions array is required'
    });
  }
  
  const updatedPermissions = {
    userId,
    permissions,
    role: role || 'customer',
    updatedAt: new Date().toISOString(),
    updatedBy: 'admin'
  };
  
  res.json({
    message: 'User permissions updated successfully',
    permissions: updatedPermissions,
    timestamp: new Date().toISOString()
  });
});

// Update analytics settings
router.put('/analytics/settings', (req, res) => {
  const { trackingEnabled, retentionDays, anonymizeData, exportFormat } = req.body;
  
  const updatedSettings = {
    trackingEnabled: trackingEnabled !== undefined ? Boolean(trackingEnabled) : true,
    retentionDays: retentionDays || 365,
    anonymizeData: anonymizeData !== undefined ? Boolean(anonymizeData) : true,
    exportFormat: exportFormat || 'json',
    updatedAt: new Date().toISOString(),
    updatedBy: 'admin'
  };
  
  res.json({
    message: 'Analytics settings updated successfully',
    settings: updatedSettings,
    timestamp: new Date().toISOString()
  });
});

// Delete user account
router.delete('/users/:userId', (req, res) => {
  const { userId } = req.params;
  const { reason, transferDataTo } = req.body;
  
  const deletedUser = {
    id: userId,
    deletedAt: new Date().toISOString(),
    reason: reason || 'Admin action',
    dataTransferredTo: transferDataTo || null,
    status: 'deleted'
  };
  
  res.json({
    message: 'User account deleted successfully',
    user: deletedUser,
    timestamp: new Date().toISOString()
  });
});

// Delete order
router.delete('/orders/:orderId', (req, res) => {
  const { orderId } = req.params;
  const { reason, refundAmount } = req.body;
  
  const deletedOrder = {
    id: orderId,
    deletedAt: new Date().toISOString(),
    reason: reason || 'Admin cancellation',
    refundAmount: refundAmount || 0,
    status: 'cancelled'
  };
  
  res.json({
    message: 'Order deleted successfully',
    order: deletedOrder,
    timestamp: new Date().toISOString()
  });
});

// Delete product
router.delete('/products/:productId', (req, res) => {
  const { productId } = req.params;
  const { reason, archiveOnly = false } = req.body;
  
  const deletedProduct = {
    id: productId,
    deletedAt: new Date().toISOString(),
    reason: reason || 'Product discontinued',
    archived: archiveOnly,
    status: archiveOnly ? 'archived' : 'deleted'
  };
  
  res.json({
    message: `Product ${archiveOnly ? 'archived' : 'deleted'} successfully`,
    product: deletedProduct,
    timestamp: new Date().toISOString()
  });
});

// Bulk delete products
router.delete('/products/bulk', (req, res) => {
  const { productIds, reason, archiveOnly = false } = req.body;
  
  if (!productIds || !Array.isArray(productIds)) {
    return res.status(400).json({
      error: 'Product IDs array is required'
    });
  }
  
  const deletedProducts = productIds.map(id => ({
    id,
    deletedAt: new Date().toISOString(),
    reason: reason || 'Bulk operation',
    archived: archiveOnly,
    status: archiveOnly ? 'archived' : 'deleted'
  }));
  
  res.json({
    message: `${productIds.length} products ${archiveOnly ? 'archived' : 'deleted'} successfully`,
    products: deletedProducts,
    count: productIds.length,
    timestamp: new Date().toISOString()
  });
});

// Delete system logs
router.delete('/logs', (req, res) => {
  const { olderThan, logType } = req.body;
  
  const deletedLogs = {
    deletedAt: new Date().toISOString(),
    criteria: {
      olderThan: olderThan || '30 days',
      logType: logType || 'all'
    },
    deletedCount: Math.floor(Math.random() * 1000) + 100
  };
  
  res.json({
    message: 'System logs deleted successfully',
    logs: deletedLogs,
    timestamp: new Date().toISOString()
  });
});

// Delete analytics data
router.delete('/analytics/:dataType', (req, res) => {
  const { dataType } = req.params;
  const { dateRange, confirm } = req.body;
  
  if (!confirm) {
    return res.status(400).json({
      error: 'Confirmation required for analytics data deletion'
    });
  }
  
  const deletedData = {
    dataType,
    dateRange: dateRange || 'all',
    deletedAt: new Date().toISOString(),
    recordsDeleted: Math.floor(Math.random() * 10000) + 1000
  };
  
  res.json({
    message: `Analytics data (${dataType}) deleted successfully`,
    data: deletedData,
    timestamp: new Date().toISOString()
  });
});

export default router;