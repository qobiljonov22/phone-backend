import express from 'express';
const router = express.Router();

// Order tracking data
let orderTracking = new Map();

// Order statuses
const ORDER_STATUSES = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  OUT_FOR_DELIVERY: 'out_for_delivery',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled'
};

// Create new order tracking
router.post('/create', (req, res) => {
  const { orderId, phoneId, userId, shippingAddress } = req.body;
  
  if (!orderId || !phoneId || !userId) {
    return res.status(400).json({ 
      error: 'Order ID, Phone ID, and User ID are required' 
    });
  }
  
  const tracking = {
    orderId,
    phoneId,
    userId,
    status: ORDER_STATUSES.PENDING,
    shippingAddress: shippingAddress || {},
    estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    trackingNumber: 'TRK' + Date.now(),
    history: [{
      status: ORDER_STATUSES.PENDING,
      timestamp: new Date().toISOString(),
      message: 'Order received and is being processed'
    }],
    createdAt: new Date().toISOString()
  };
  
  orderTracking.set(orderId, tracking);
  
  res.status(201).json({
    tracking,
    message: 'Order tracking created successfully'
  });
});

// Get order tracking info
router.get('/:orderId', (req, res) => {
  const { orderId } = req.params;
  
  const tracking = orderTracking.get(orderId);
  
  if (!tracking) {
    return res.status(404).json({ 
      error: 'Order not found',
      orderId 
    });
  }
  
  res.json({
    tracking,
    timestamp: new Date().toISOString()
  });
});

// Update order status
router.put('/:orderId/status', (req, res) => {
  const { orderId } = req.params;
  const { status, message, location } = req.body;
  
  const tracking = orderTracking.get(orderId);
  
  if (!tracking) {
    return res.status(404).json({ 
      error: 'Order not found',
      orderId 
    });
  }
  
  if (!Object.values(ORDER_STATUSES).includes(status)) {
    return res.status(400).json({ 
      error: 'Invalid status',
      validStatuses: Object.values(ORDER_STATUSES)
    });
  }
  
  // Update tracking
  tracking.status = status;
  tracking.lastUpdated = new Date().toISOString();
  
  if (location) {
    tracking.currentLocation = location;
  }
  
  // Add to history
  tracking.history.push({
    status,
    timestamp: new Date().toISOString(),
    message: message || `Order status updated to ${status}`,
    location
  });
  
  orderTracking.set(orderId, tracking);
  
  res.json({
    tracking,
    message: 'Order status updated successfully'
  });
});

// Get all orders for a user
router.get('/user/:userId', (req, res) => {
  const { userId } = req.params;
  
  const userOrders = Array.from(orderTracking.values())
    .filter(order => order.userId === userId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
  res.json({
    orders: userOrders,
    total: userOrders.length,
    userId,
    timestamp: new Date().toISOString()
  });
});

// Get delivery statistics
router.get('/stats/delivery', (req, res) => {
  const orders = Array.from(orderTracking.values());
  
  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === ORDER_STATUSES.PENDING).length,
    processing: orders.filter(o => o.status === ORDER_STATUSES.PROCESSING).length,
    shipped: orders.filter(o => o.status === ORDER_STATUSES.SHIPPED).length,
    delivered: orders.filter(o => o.status === ORDER_STATUSES.DELIVERED).length,
    cancelled: orders.filter(o => o.status === ORDER_STATUSES.CANCELLED).length,
    averageDeliveryTime: '3-5 days',
    onTimeDeliveryRate: '94%'
  };
  
  res.json({
    stats,
    timestamp: new Date().toISOString()
  });
});

// Update order status (already exists, but let's enhance it)
router.put('/:orderId/status', (req, res) => {
  const { orderId } = req.params;
  const { status, message, location, estimatedDelivery } = req.body;
  
  const tracking = orderTracking.get(orderId);
  
  if (!tracking) {
    return res.status(404).json({ 
      error: 'Order not found',
      orderId 
    });
  }
  
  if (!Object.values(ORDER_STATUSES).includes(status)) {
    return res.status(400).json({ 
      error: 'Invalid status',
      validStatuses: Object.values(ORDER_STATUSES)
    });
  }
  
  // Update tracking
  tracking.status = status;
  tracking.lastUpdated = new Date().toISOString();
  
  if (location) {
    tracking.currentLocation = location;
  }
  
  if (estimatedDelivery) {
    tracking.estimatedDelivery = estimatedDelivery;
  }
  
  // Add to history
  tracking.history.push({
    status,
    timestamp: new Date().toISOString(),
    message: message || `Order status updated to ${status}`,
    location
  });
  
  orderTracking.set(orderId, tracking);
  
  res.json({
    tracking,
    message: 'Order status updated successfully'
  });
});

// Update shipping address
router.put('/:orderId/address', (req, res) => {
  const { orderId } = req.params;
  const { shippingAddress } = req.body;
  
  const tracking = orderTracking.get(orderId);
  
  if (!tracking) {
    return res.status(404).json({ 
      error: 'Order not found',
      orderId 
    });
  }
  
  if (!shippingAddress) {
    return res.status(400).json({
      error: 'Shipping address is required'
    });
  }
  
  tracking.shippingAddress = shippingAddress;
  tracking.lastUpdated = new Date().toISOString();
  
  // Add to history
  tracking.history.push({
    status: tracking.status,
    timestamp: new Date().toISOString(),
    message: 'Shipping address updated',
    addressChange: true
  });
  
  orderTracking.set(orderId, tracking);
  
  res.json({
    tracking,
    message: 'Shipping address updated successfully'
  });
});

// Update delivery preferences
router.put('/:orderId/preferences', (req, res) => {
  const { orderId } = req.params;
  const { deliveryInstructions, preferredTimeSlot, contactPhone } = req.body;
  
  const tracking = orderTracking.get(orderId);
  
  if (!tracking) {
    return res.status(404).json({ 
      error: 'Order not found',
      orderId 
    });
  }
  
  // Update preferences
  tracking.deliveryPreferences = {
    instructions: deliveryInstructions || tracking.deliveryPreferences?.instructions || '',
    timeSlot: preferredTimeSlot || tracking.deliveryPreferences?.timeSlot || 'anytime',
    contactPhone: contactPhone || tracking.deliveryPreferences?.contactPhone || ''
  };
  
  tracking.lastUpdated = new Date().toISOString();
  
  orderTracking.set(orderId, tracking);
  
  res.json({
    tracking,
    message: 'Delivery preferences updated successfully'
  });
});

// Cancel/Delete order tracking
router.delete('/:orderId', (req, res) => {
  const { orderId } = req.params;
  const { reason, refundAmount } = req.body;
  
  const tracking = orderTracking.get(orderId);
  
  if (!tracking) {
    return res.status(404).json({ 
      error: 'Order not found',
      orderId 
    });
  }
  
  // Update tracking to cancelled
  tracking.status = ORDER_STATUSES.CANCELLED;
  tracking.cancelledAt = new Date().toISOString();
  tracking.cancellationReason = reason || 'Customer request';
  tracking.refundAmount = refundAmount || 0;
  
  // Add to history
  tracking.history.push({
    status: ORDER_STATUSES.CANCELLED,
    timestamp: new Date().toISOString(),
    message: `Order cancelled: ${reason || 'Customer request'}`,
    refundAmount
  });
  
  orderTracking.set(orderId, tracking);
  
  res.json({
    message: 'Order cancelled successfully',
    tracking,
    timestamp: new Date().toISOString()
  });
});

// Delete tracking history entry
router.delete('/:orderId/history/:historyId', (req, res) => {
  const { orderId, historyId } = req.params;
  
  const tracking = orderTracking.get(orderId);
  
  if (!tracking) {
    return res.status(404).json({ 
      error: 'Order not found',
      orderId 
    });
  }
  
  const historyIndex = tracking.history.findIndex(h => h.timestamp === historyId);
  
  if (historyIndex === -1) {
    return res.status(404).json({ 
      error: 'History entry not found',
      historyId 
    });
  }
  
  const deletedEntry = tracking.history.splice(historyIndex, 1)[0];
  orderTracking.set(orderId, tracking);
  
  res.json({
    message: 'History entry deleted successfully',
    deletedEntry,
    tracking,
    timestamp: new Date().toISOString()
  });
});

export default router;