// User management functionality
import express from 'express';
const router = express.Router();

// In-memory users storage (in production, use database with proper authentication)
let users = new Map();
let userCounter = 1;

// Create user profile
router.post('/register', (req, res) => {
  const { 
    name, 
    email, 
    phone, 
    address,
    preferences = {} 
  } = req.body;
  
  if (!name || !email) {
    return res.status(400).json({ 
      error: 'Name and email are required' 
    });
  }
  
  // Check if user already exists
  const existingUser = Array.from(users.values()).find(user => user.email === email);
  if (existingUser) {
    return res.status(409).json({ error: 'User with this email already exists' });
  }
  
  const userId = `user_${userCounter++}`;
  const user = {
    userId,
    name,
    email,
    phone: phone || '',
    address: address || {},
    preferences: {
      notifications: true,
      newsletter: false,
      currency: 'USD',
      language: 'en',
      ...preferences
    },
    wishlist: [],
    orderHistory: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true
  };
  
  users.set(userId, user);
  
  res.status(201).json({
    user: { ...user, password: undefined }, // Don't return password
    message: 'User registered successfully'
  });
});

// Get user profile
router.get('/:userId', (req, res) => {
  const { userId } = req.params;
  
  const user = users.get(userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  res.json({ 
    user: { ...user, password: undefined } 
  });
});

// Update user profile
router.put('/:userId', (req, res) => {
  const { userId } = req.params;
  const updateData = req.body;
  
  const user = users.get(userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  // Update allowed fields
  const allowedFields = ['name', 'phone', 'address', 'preferences'];
  allowedFields.forEach(field => {
    if (updateData[field] !== undefined) {
      user[field] = updateData[field];
    }
  });
  
  user.updatedAt = new Date();
  users.set(userId, user);
  
  res.json({
    user: { ...user, password: undefined },
    message: 'Profile updated successfully'
  });
});

// Wishlist management
router.get('/:userId/wishlist', (req, res) => {
  const { userId } = req.params;
  
  const user = users.get(userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  res.json({ 
    wishlist: user.wishlist || [],
    count: user.wishlist?.length || 0
  });
});

router.post('/:userId/wishlist', (req, res) => {
  const { userId } = req.params;
  const { phoneId, phone } = req.body;
  
  if (!phoneId || !phone) {
    return res.status(400).json({ error: 'Phone ID and phone details are required' });
  }
  
  const user = users.get(userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  if (!user.wishlist) {
    user.wishlist = [];
  }
  
  // Check if already in wishlist
  const existingIndex = user.wishlist.findIndex(item => item.phoneId === phoneId);
  if (existingIndex > -1) {
    return res.status(409).json({ error: 'Phone already in wishlist' });
  }
  
  user.wishlist.push({
    phoneId,
    phone,
    addedAt: new Date()
  });
  
  user.updatedAt = new Date();
  users.set(userId, user);
  
  res.json({
    wishlist: user.wishlist,
    message: 'Phone added to wishlist'
  });
});

router.delete('/:userId/wishlist/:phoneId', (req, res) => {
  const { userId, phoneId } = req.params;
  
  const user = users.get(userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  if (!user.wishlist) {
    return res.status(404).json({ error: 'Wishlist is empty' });
  }
  
  const itemIndex = user.wishlist.findIndex(item => item.phoneId === phoneId);
  if (itemIndex === -1) {
    return res.status(404).json({ error: 'Phone not found in wishlist' });
  }
  
  user.wishlist.splice(itemIndex, 1);
  user.updatedAt = new Date();
  users.set(userId, user);
  
  res.json({
    wishlist: user.wishlist,
    message: 'Phone removed from wishlist'
  });
});

// User preferences
router.put('/:userId/preferences', (req, res) => {
  const { userId } = req.params;
  const { preferences } = req.body;
  
  const user = users.get(userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  user.preferences = { ...user.preferences, ...preferences };
  user.updatedAt = new Date();
  users.set(userId, user);
  
  res.json({
    preferences: user.preferences,
    message: 'Preferences updated successfully'
  });
});

// Get all users (admin endpoint)
router.get('/', (req, res) => {
  const { page = 1, limit = 10, search } = req.query;
  
  let allUsers = Array.from(users.values());
  
  // Search functionality
  if (search) {
    const searchLower = search.toLowerCase();
    allUsers = allUsers.filter(user => 
      user.name.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower)
    );
  }
  
  // Pagination
  const startIndex = (parseInt(page) - 1) * parseInt(limit);
  const endIndex = startIndex + parseInt(limit);
  const paginatedUsers = allUsers.slice(startIndex, endIndex);
  
  // Remove sensitive data
  const safeUsers = paginatedUsers.map(user => ({
    ...user,
    password: undefined
  }));
  
  res.json({
    users: safeUsers,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: allUsers.length,
      pages: Math.ceil(allUsers.length / parseInt(limit))
    }
  });
});

export default router;