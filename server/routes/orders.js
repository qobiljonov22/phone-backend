// Order management functionality
const express = require('express');
const router = express.Router();

// In-memory orders storage (in production, use database)
let orders = new Map();
let orderCounter = 1000;

// Create new order
router.post('/', (req, res) => {
  const { 
    userId, 
    items, 
    shippingAddress, 
    paymentMethod, 
    total,
    customerInfo 
  } = req.body;
  
  if (!userId || !items || !shippingAddress || !paymentMethod || !total) {
    return res.status(400).json({ 
      error: 'Missing required fields: userId, items, shippingAddress, paymentMethod, total' 
    });
  }
  
  const orderId = `ORD-${orderCounter++}`;
  const order = {
    orderId,
    userId,
    items,
    customerInfo: customerInfo || {},
    shippingAddress,
    paymentMethod,
    total,
    status: 'pending',
    orderDate: new Date(),
    estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    tracking: {
      status: 'order_placed',
      updates: [
        {
          status: 'order_placed',
          message: 'Order has been placed successfully',
          timestamp: new Date()
        }
      ]
    }
  };
  
  orders.set(orderId, order);
  
  res.status(201).json({
    order,
    message: 'Order created successfully'
  });
});

// Get all orders for a user
router.get('/user/:userId', (req, res) => {
  const { userId } = req.params;
  const { status, limit = 10, page = 1 } = req.query;
  
  let userOrders = Array.from(orders.values()).filter(order => order.userId === userId);
  
  if (status) {
    userOrders = userOrders.filter(order => order.status === status);
  }
  
  // Sort by order date (newest first)
  userOrders.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
  
  // Pagination
  const startIndex = (parseInt(page) - 1) * parseInt(limit);
  const endIndex = startIndex + parseInt(limit);
  const paginatedOrders = userOrders.slice(startIndex, endIndex);
  
  res.json({
    orders: paginatedOrders,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: userOrders.length,
      pages: Math.ceil(userOrders.length / parseInt(limit))
    }
  });
});

// Get specific order
router.get('/:orderId', (req, res) => {
  const { orderId } = req.params;
  
  const order = orders.get(orderId);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }
  
  res.json({ order });
});

// Update order status
router.put('/:orderId/status', (req, res) => {
  const { orderId } = req.params;
  const { status, message } = req.body;
  
  const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
  
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ 
      error: 'Invalid status',
      validStatuses 
    });
  }
  
  const order = orders.get(orderId);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }
  
  order.status = status;
  order.updatedAt = new Date();
  
  // Add tracking update
  order.tracking.status = status;
  order.tracking.updates.push({
    status,
    message: message || getStatusMessage(status),
    timestamp: new Date()
  });
  
  orders.set(orderId, order);
  
  res.json({
    order,
    message: 'Order status updated successfully'
  });
});

// Cancel order
router.post('/:orderId/cancel', (req, res) => {
  const { orderId } = req.params;
  const { reason } = req.body;
  
  const order = orders.get(orderId);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }
  
  if (order.status === 'delivered') {
    return res.status(400).json({ error: 'Cannot cancel delivered order' });
  }
  
  if (order.status === 'cancelled') {
    return res.status(400).json({ error: 'Order is already cancelled' });
  }
  
  order.status = 'cancelled';
  order.cancelReason = reason;
  order.cancelledAt = new Date();
  
  order.tracking.status = 'cancelled';
  order.tracking.updates.push({
    status: 'cancelled',
    message: `Order cancelled. Reason: ${reason || 'Customer request'}`,
    timestamp: new Date()
  });
  
  orders.set(orderId, order);
  
  res.json({
    order,
    message: 'Order cancelled successfully'
  });
});

// Get order statistics
router.get('/stats/summary', (req, res) => {
  const allOrders = Array.from(orders.values());
  
  const stats = {
    totalOrders: allOrders.length,
    totalRevenue: allOrders.reduce((sum, order) => sum + order.total, 0),
    ordersByStatus: {
      pending: allOrders.filter(o => o.status === 'pending').length,
      confirmed: allOrders.filter(o => o.status === 'confirmed').length,
      processing: allOrders.filter(o => o.status === 'processing').length,
      shipped: allOrders.filter(o => o.status === 'shipped').length,
      delivered: allOrders.filter(o => o.status === 'delivered').length,
      cancelled: allOrders.filter(o => o.status === 'cancelled').length
    },
    averageOrderValue: allOrders.length > 0 ? 
      allOrders.reduce((sum, order) => sum + order.total, 0) / allOrders.length : 0,
    recentOrders: allOrders
      .sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate))
      .slice(0, 5)
  };
  
  res.json(stats);
});

function getStatusMessage(status) {
  const messages = {
    pending: 'Order is pending confirmation',
    confirmed: 'Order has been confirmed',
    processing: 'Order is being processed',
    shipped: 'Order has been shipped',
    delivered: 'Order has been delivered',
    cancelled: 'Order has been cancelled'
  };
  
  return messages[status] || 'Status updated';
}

module.exports = router;