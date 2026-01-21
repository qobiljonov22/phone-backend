// Enhanced wishlist functionality
import express from 'express';
const router = express.Router();

// In-memory wishlist storage
let wishlists = new Map();

// Get user's wishlist with detailed phone information
router.get('/:userId', (req, res) => {
  const { userId } = req.params;
  const { includeDetails = true } = req.query;
  
  const userWishlist = wishlists.get(userId) || {
    userId,
    items: [],
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  let wishlistItems = userWishlist.items;
  
  if (includeDetails === 'true') {
    // In real app, this would fetch phone details from database
    wishlistItems = wishlistItems.map(item => ({
      ...item,
      phoneDetails: getMockPhoneDetails(item.phoneId)
    }));
  }
  
  res.json({
    wishlist: {
      ...userWishlist,
      items: wishlistItems,
      totalItems: wishlistItems.length
    }
  });
});

// Add item to wishlist
router.post('/:userId/add', (req, res) => {
  const { userId } = req.params;
  const { phoneId, phone, notes } = req.body;
  
  if (!phoneId) {
    return res.status(400).json({ error: 'Phone ID is required' });
  }
  
  let userWishlist = wishlists.get(userId) || {
    userId,
    items: [],
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  // Check if item already exists
  const existingIndex = userWishlist.items.findIndex(item => item.phoneId === phoneId);
  
  if (existingIndex > -1) {
    return res.status(409).json({ error: 'Phone already in wishlist' });
  }
  
  const wishlistItem = {
    phoneId,
    phone: phone || { brand: 'Unknown', model: 'Unknown' },
    notes: notes || '',
    addedAt: new Date(),
    priority: 'normal', // normal, high, low
    priceAlert: null, // user can set price alerts
    inStock: true
  };
  
  userWishlist.items.push(wishlistItem);
  userWishlist.updatedAt = new Date();
  
  wishlists.set(userId, userWishlist);
  
  res.status(201).json({
    wishlist: userWishlist,
    addedItem: wishlistItem,
    message: 'Phone added to wishlist successfully'
  });
});

// Remove item from wishlist
router.delete('/:userId/item/:phoneId', (req, res) => {
  const { userId, phoneId } = req.params;
  
  const userWishlist = wishlists.get(userId);
  if (!userWishlist) {
    return res.status(404).json({ error: 'Wishlist not found' });
  }
  
  const itemIndex = userWishlist.items.findIndex(item => item.phoneId === phoneId);
  if (itemIndex === -1) {
    return res.status(404).json({ error: 'Phone not found in wishlist' });
  }
  
  const removedItem = userWishlist.items.splice(itemIndex, 1)[0];
  userWishlist.updatedAt = new Date();
  
  wishlists.set(userId, userWishlist);
  
  res.json({
    wishlist: userWishlist,
    removedItem,
    message: 'Phone removed from wishlist successfully'
  });
});

// Update wishlist item (notes, priority, price alert)
router.put('/:userId/item/:phoneId', (req, res) => {
  const { userId, phoneId } = req.params;
  const { notes, priority, priceAlert } = req.body;
  
  const userWishlist = wishlists.get(userId);
  if (!userWishlist) {
    return res.status(404).json({ error: 'Wishlist not found' });
  }
  
  const itemIndex = userWishlist.items.findIndex(item => item.phoneId === phoneId);
  if (itemIndex === -1) {
    return res.status(404).json({ error: 'Phone not found in wishlist' });
  }
  
  const item = userWishlist.items[itemIndex];
  
  if (notes !== undefined) item.notes = notes;
  if (priority !== undefined) item.priority = priority;
  if (priceAlert !== undefined) item.priceAlert = priceAlert;
  
  item.updatedAt = new Date();
  userWishlist.updatedAt = new Date();
  
  wishlists.set(userId, userWishlist);
  
  res.json({
    wishlist: userWishlist,
    updatedItem: item,
    message: 'Wishlist item updated successfully'
  });
});

// Move item from wishlist to cart
router.post('/:userId/move-to-cart/:phoneId', (req, res) => {
  const { userId, phoneId } = req.params;
  const { quantity = 1 } = req.body;
  
  const userWishlist = wishlists.get(userId);
  if (!userWishlist) {
    return res.status(404).json({ error: 'Wishlist not found' });
  }
  
  const itemIndex = userWishlist.items.findIndex(item => item.phoneId === phoneId);
  if (itemIndex === -1) {
    return res.status(404).json({ error: 'Phone not found in wishlist' });
  }
  
  const wishlistItem = userWishlist.items[itemIndex];
  
  // Mock adding to cart - in real app, this would call cart API
  const cartItem = {
    phoneId: wishlistItem.phoneId,
    phone: wishlistItem.phone,
    quantity: parseInt(quantity),
    price: getMockPhoneDetails(phoneId).price,
    addedAt: new Date()
  };
  
  // Remove from wishlist
  userWishlist.items.splice(itemIndex, 1);
  userWishlist.updatedAt = new Date();
  wishlists.set(userId, userWishlist);
  
  res.json({
    message: 'Phone moved from wishlist to cart successfully',
    cartItem,
    wishlist: userWishlist
  });
});

// Share wishlist
router.post('/:userId/share', (req, res) => {
  const { userId } = req.params;
  const { shareWith, message, privacy = 'private' } = req.body;
  
  const userWishlist = wishlists.get(userId);
  if (!userWishlist) {
    return res.status(404).json({ error: 'Wishlist not found' });
  }
  
  const shareId = `share_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const shareLink = `https://phonestore.com/wishlist/shared/${shareId}`;
  
  const sharedWishlist = {
    shareId,
    userId,
    shareLink,
    sharedWith: shareWith || [],
    message: message || '',
    privacy, // private, public, friends
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    viewCount: 0
  };
  
  res.json({
    sharedWishlist,
    message: 'Wishlist shared successfully'
  });
});

// Get wishlist analytics for user
router.get('/:userId/analytics', (req, res) => {
  const { userId } = req.params;
  
  const userWishlist = wishlists.get(userId);
  if (!userWishlist) {
    return res.status(404).json({ error: 'Wishlist not found' });
  }
  
  const analytics = {
    totalItems: userWishlist.items.length,
    totalValue: userWishlist.items.reduce((sum, item) => {
      const phoneDetails = getMockPhoneDetails(item.phoneId);
      return sum + phoneDetails.price;
    }, 0),
    averagePrice: 0,
    brandDistribution: {},
    priceRanges: {
      'under_500': 0,
      '500_1000': 0,
      '1000_1500': 0,
      'over_1500': 0
    },
    priorityDistribution: {
      high: userWishlist.items.filter(item => item.priority === 'high').length,
      normal: userWishlist.items.filter(item => item.priority === 'normal').length,
      low: userWishlist.items.filter(item => item.priority === 'low').length
    },
    oldestItem: userWishlist.items.length > 0 ? 
      userWishlist.items.reduce((oldest, item) => 
        item.addedAt < oldest.addedAt ? item : oldest
      ) : null,
    newestItem: userWishlist.items.length > 0 ? 
      userWishlist.items.reduce((newest, item) => 
        item.addedAt > newest.addedAt ? item : newest
      ) : null
  };
  
  // Calculate average price
  if (userWishlist.items.length > 0) {
    analytics.averagePrice = Math.round(analytics.totalValue / userWishlist.items.length);
  }
  
  // Calculate brand distribution
  userWishlist.items.forEach(item => {
    const brand = item.phone.brand;
    analytics.brandDistribution[brand] = (analytics.brandDistribution[brand] || 0) + 1;
  });
  
  // Calculate price ranges
  userWishlist.items.forEach(item => {
    const price = getMockPhoneDetails(item.phoneId).price;
    if (price < 500) analytics.priceRanges.under_500++;
    else if (price < 1000) analytics.priceRanges['500_1000']++;
    else if (price < 1500) analytics.priceRanges['1000_1500']++;
    else analytics.priceRanges.over_1500++;
  });
  
  res.json({
    userId,
    analytics,
    generatedAt: new Date()
  });
});

// Get popular wishlist items across all users
router.get('/popular/items', (req, res) => {
  const { limit = 10 } = req.query;
  
  const phoneCount = new Map();
  
  // Count occurrences of each phone across all wishlists
  Array.from(wishlists.values()).forEach(wishlist => {
    wishlist.items.forEach(item => {
      const count = phoneCount.get(item.phoneId) || 0;
      phoneCount.set(item.phoneId, count + 1);
    });
  });
  
  // Sort by popularity
  const popularItems = Array.from(phoneCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, parseInt(limit))
    .map(([phoneId, count]) => ({
      phoneId,
      phone: getMockPhoneDetails(phoneId),
      wishlistCount: count,
      popularity: Math.round((count / wishlists.size) * 100)
    }));
  
  res.json({
    popularItems,
    totalWishlists: wishlists.size,
    generatedAt: new Date()
  });
});

// Helper function to get mock phone details
function getMockPhoneDetails(phoneId) {
  const mockPhones = {
    'iphone-15-pro-128': {
      brand: 'iPhone',
      model: '15 Pro',
      storage: '128GB',
      price: 999,
      image: 'iphone-15-pro.jpg',
      inStock: true
    },
    'galaxy-s24-ultra-512': {
      brand: 'Samsung',
      model: 'Galaxy S24 Ultra',
      storage: '512GB',
      price: 1299,
      image: 'galaxy-s24-ultra.jpg',
      inStock: true
    },
    'pixel-8-pro-256': {
      brand: 'Google',
      model: 'Pixel 8 Pro',
      storage: '256GB',
      price: 999,
      image: 'pixel-8-pro.jpg',
      inStock: false
    }
  };
  
  return mockPhones[phoneId] || {
    brand: 'Unknown',
    model: 'Unknown',
    storage: 'Unknown',
    price: 0,
    image: 'placeholder.jpg',
    inStock: false
  };
}

export default router;