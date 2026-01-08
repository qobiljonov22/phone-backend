// Shopping Cart functionality
const express = require('express');
const router = express.Router();

// In-memory cart storage (in production, use database)
let carts = new Map();

// Get cart by user ID
router.get('/:userId', (req, res) => {
  const { userId } = req.params;
  const cart = carts.get(userId) || { items: [], total: 0, itemCount: 0 };
  
  res.json({
    cart,
    message: 'Cart retrieved successfully'
  });
});

// Add item to cart
router.post('/:userId/add', (req, res) => {
  const { userId } = req.params;
  const { phoneId, quantity = 1, price, phone } = req.body;
  
  if (!phoneId || !price || !phone) {
    return res.status(400).json({ error: 'Phone ID, price, and phone details are required' });
  }
  
  let cart = carts.get(userId) || { items: [], total: 0, itemCount: 0 };
  
  // Check if item already exists in cart
  const existingItemIndex = cart.items.findIndex(item => item.phoneId === phoneId);
  
  if (existingItemIndex > -1) {
    // Update quantity
    cart.items[existingItemIndex].quantity += quantity;
  } else {
    // Add new item
    cart.items.push({
      phoneId,
      phone,
      quantity,
      price,
      subtotal: price * quantity,
      addedAt: new Date()
    });
  }
  
  // Recalculate totals
  cart.total = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  cart.itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);
  cart.updatedAt = new Date();
  
  carts.set(userId, cart);
  
  res.json({
    cart,
    message: 'Item added to cart successfully'
  });
});

// Update item quantity
router.put('/:userId/item/:phoneId', (req, res) => {
  const { userId, phoneId } = req.params;
  const { quantity } = req.body;
  
  if (!quantity || quantity < 0) {
    return res.status(400).json({ error: 'Valid quantity is required' });
  }
  
  let cart = carts.get(userId);
  if (!cart) {
    return res.status(404).json({ error: 'Cart not found' });
  }
  
  const itemIndex = cart.items.findIndex(item => item.phoneId === phoneId);
  if (itemIndex === -1) {
    return res.status(404).json({ error: 'Item not found in cart' });
  }
  
  if (quantity === 0) {
    // Remove item
    cart.items.splice(itemIndex, 1);
  } else {
    // Update quantity
    cart.items[itemIndex].quantity = quantity;
    cart.items[itemIndex].subtotal = cart.items[itemIndex].price * quantity;
  }
  
  // Recalculate totals
  cart.total = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  cart.itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);
  cart.updatedAt = new Date();
  
  carts.set(userId, cart);
  
  res.json({
    cart,
    message: 'Cart updated successfully'
  });
});

// Remove item from cart
router.delete('/:userId/item/:phoneId', (req, res) => {
  const { userId, phoneId } = req.params;
  
  let cart = carts.get(userId);
  if (!cart) {
    return res.status(404).json({ error: 'Cart not found' });
  }
  
  const itemIndex = cart.items.findIndex(item => item.phoneId === phoneId);
  if (itemIndex === -1) {
    return res.status(404).json({ error: 'Item not found in cart' });
  }
  
  cart.items.splice(itemIndex, 1);
  
  // Recalculate totals
  cart.total = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  cart.itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);
  cart.updatedAt = new Date();
  
  carts.set(userId, cart);
  
  res.json({
    cart,
    message: 'Item removed from cart successfully'
  });
});

// Clear cart
router.delete('/:userId', (req, res) => {
  const { userId } = req.params;
  
  carts.set(userId, { items: [], total: 0, itemCount: 0, updatedAt: new Date() });
  
  res.json({
    message: 'Cart cleared successfully'
  });
});

module.exports = router;