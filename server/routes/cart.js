// Shopping Cart functionality
import express from 'express';
const router = express.Router();

// In-memory cart storage (in production, use database)
let carts = new Map();

// Get cart by user ID
router.get('/:userId', (req, res) => {
  const { userId } = req.params;
  const cart = carts.get(userId) || { items: [], total: 0, itemCount: 0, updatedAt: new Date() };
  
  res.json({
    success: true,
    status: 'ok',
    data: {
      cart: {
        ...cart,
        isEmpty: cart.items.length === 0,
        formattedTotal: cart.total.toLocaleString('uz-UZ') + ' so\'m'
      }
    },
    message: cart.items.length === 0 ? 'Savatcha bo\'sh' : `${cart.itemCount} ta mahsulot savatchada`,
    links: {
      self: `${req.protocol}://${req.get('host')}${req.originalUrl}`,
      checkout: cart.items.length > 0 ? `${req.protocol}://${req.get('host')}/api/orders` : null
    },
    timestamp: new Date().toISOString(),
    version: '1.0.0'
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
  
  const addedItem = cart.items.find(item => item.phoneId === phoneId);
  
  res.status(201).json({
    success: true,
    status: 'added',
    data: {
      cart: {
        ...cart,
        formattedTotal: cart.total.toLocaleString('uz-UZ') + ' so\'m'
      },
      addedItem: addedItem
    },
    message: 'Mahsulot savatga qo\'shildi',
    links: {
      cart: `${req.protocol}://${req.get('host')}/api/cart/${userId}`,
      checkout: `${req.protocol}://${req.get('host')}/api/orders`
    },
    timestamp: new Date().toISOString(),
    version: '1.0.0'
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
    success: true,
    status: 'updated',
    data: {
      cart: {
        ...cart,
        formattedTotal: cart.total.toLocaleString('uz-UZ') + ' so\'m'
      }
    },
    message: 'Savatcha yangilandi',
    links: {
      self: `${req.protocol}://${req.get('host')}${req.originalUrl}`,
      cart: `${req.protocol}://${req.get('host')}/api/cart/${userId}`
    },
    timestamp: new Date().toISOString(),
    version: '1.0.0'
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
    success: true,
    status: 'removed',
    data: {
      cart: {
        ...cart,
        formattedTotal: cart.total.toLocaleString('uz-UZ') + ' so\'m',
        isEmpty: cart.items.length === 0
      }
    },
    message: 'Mahsulot savatdan olib tashlandi',
    links: {
      cart: `${req.protocol}://${req.get('host')}/api/cart/${userId}`
    },
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Clear cart
router.delete('/:userId', (req, res) => {
  const { userId } = req.params;
  
  const clearedCart = { items: [], total: 0, itemCount: 0, updatedAt: new Date() };
  carts.set(userId, clearedCart);
  
  res.json({
    success: true,
    status: 'cleared',
    data: {
      cart: clearedCart
    },
    message: 'Savatcha tozalandi',
    links: {
      cart: `${req.protocol}://${req.get('host')}/api/cart/${userId}`,
      phones: `${req.protocol}://${req.get('host')}/api/phones`
    },
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

export default router;