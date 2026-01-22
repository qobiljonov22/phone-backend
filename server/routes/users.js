// User management functionality
import express from 'express';
import fs from 'fs';
import path from 'path';

const router = express.Router();

// Users database file
// In Vercel/serverless, use /tmp directory for file writes
const isVercel = process.env.VERCEL === '1' || process.env.VERCEL_ENV;
const usersFile = isVercel ? '/tmp/users_database.json' : 'users_database.json';

// Load users from file or initialize empty
let users = new Map();
let userCounter = 1;

// Load users from file
const loadUsers = () => {
  try {
    if (fs.existsSync(usersFile)) {
      const data = JSON.parse(fs.readFileSync(usersFile, 'utf8'));
      users = new Map(Object.entries(data.users || {}));
      userCounter = data.userCounter || 1;
    }
  } catch (error) {
    console.error('Error loading users:', error);
    users = new Map();
    userCounter = 1;
  }
};

// Save users to file
const saveUsers = () => {
  try {
    const data = {
      users: Object.fromEntries(users),
      userCounter
    };
    fs.writeFileSync(usersFile, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error saving users:', error);
  }
};

// Initialize: load users on startup
loadUsers();

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
      success: false,
      status: 'validation_error',
      error: 'Name and email are required',
      message: 'Ism va email kiritilishi shart',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    });
  }
  
  // Check if user already exists
  const existingUser = Array.from(users.values()).find(user => user.email === email);
  if (existingUser) {
    return res.status(409).json({
      success: false,
      status: 'already_exists',
      error: 'User with this email already exists',
      message: 'Bu email bilan foydalanuvchi allaqachon mavjud',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    });
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
  saveUsers(); // Save to file
  
  res.status(201).json({
    success: true,
    status: 'created',
    data: {
      user: { ...user, password: undefined } // Don't return password
    },
    message: 'Foydalanuvchi muvaffaqiyatli ro\'yxatdan o\'tdi',
    links: {
      self: `${req.protocol}://${req.get('host')}/api/users/${user.userId}`,
      profile: `${req.protocol}://${req.get('host')}/api/users/${user.userId}`,
      wishlist: `${req.protocol}://${req.get('host')}/api/users/${user.userId}/wishlist`
    },
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Get user profile
router.get('/:userId', (req, res) => {
  const { userId } = req.params;
  
  const user = users.get(userId);
  if (!user) {
    return res.status(404).json({
      success: false,
      status: 'not_found',
      error: 'User not found',
      message: 'Foydalanuvchi topilmadi',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    });
  }
  
  res.json({
    success: true,
    status: 'ok',
    data: {
      user: { ...user, password: undefined }
    },
    message: 'Foydalanuvchi ma\'lumotlari yuklandi',
    links: {
      self: `${req.protocol}://${req.get('host')}${req.originalUrl}`,
      update: `${req.protocol}://${req.get('host')}/api/users/${userId}`,
      wishlist: `${req.protocol}://${req.get('host')}/api/users/${userId}/wishlist`
    },
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Update user profile
router.put('/:userId', (req, res) => {
  const { userId } = req.params;
  const updateData = req.body;
  
  const user = users.get(userId);
  if (!user) {
    return res.status(404).json({
      success: false,
      status: 'not_found',
      error: 'User not found',
      message: 'Foydalanuvchi topilmadi',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    });
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
  saveUsers(); // Save to file
  
  res.json({
    success: true,
    status: 'updated',
    data: {
      user: { ...user, password: undefined }
    },
    message: 'Profil muvaffaqiyatli yangilandi',
    links: {
      self: `${req.protocol}://${req.get('host')}${req.originalUrl}`,
      profile: `${req.protocol}://${req.get('host')}/api/users/${userId}`
    },
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Wishlist management
router.get('/:userId/wishlist', (req, res) => {
  const { userId } = req.params;
  
  const user = users.get(userId);
  if (!user) {
    return res.status(404).json({
      success: false,
      status: 'not_found',
      error: 'User not found',
      message: 'Foydalanuvchi topilmadi',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    });
  }
  
  res.json({
    success: true,
    status: 'ok',
    data: {
      wishlist: user.wishlist || [],
      count: user.wishlist?.length || 0,
      isEmpty: (user.wishlist?.length || 0) === 0
    },
    message: `${user.wishlist?.length || 0} ta mahsulot xohlar ro'yxatida`,
    links: {
      self: `${req.protocol}://${req.get('host')}${req.originalUrl}`,
      add: `${req.protocol}://${req.get('host')}/api/users/${userId}/wishlist`
    },
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

router.post('/:userId/wishlist', (req, res) => {
  const { userId } = req.params;
  const { phoneId, phone } = req.body;
  
  if (!phoneId || !phone) {
    return res.status(400).json({
      success: false,
      status: 'validation_error',
      error: 'Phone ID and phone details are required',
      message: 'Telefon ID va telefon ma\'lumotlari kiritilishi shart',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    });
  }
  
  const user = users.get(userId);
  if (!user) {
    return res.status(404).json({
      success: false,
      status: 'not_found',
      error: 'User not found',
      message: 'Foydalanuvchi topilmadi',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    });
  }
  
  if (!user.wishlist) {
    user.wishlist = [];
  }
  
  // Check if already in wishlist
  const existingIndex = user.wishlist.findIndex(item => item.phoneId === phoneId);
  if (existingIndex > -1) {
    return res.status(409).json({
      success: false,
      status: 'already_exists',
      error: 'Phone already in wishlist',
      message: 'Bu telefon allaqachon xohlar ro\'yxatida',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    });
  }
  
  user.wishlist.push({
    phoneId,
    phone,
    addedAt: new Date()
  });
  
  user.updatedAt = new Date();
  users.set(userId, user);
  saveUsers(); // Save to file
  
  res.status(201).json({
    success: true,
    status: 'added',
    data: {
      wishlist: user.wishlist,
      addedItem: user.wishlist[user.wishlist.length - 1],
      count: user.wishlist.length
    },
    message: 'Telefon xohlar ro\'yxatiga qo\'shildi',
    links: {
      self: `${req.protocol}://${req.get('host')}${req.originalUrl}`,
      remove: `${req.protocol}://${req.get('host')}/api/users/${userId}/wishlist/${phoneId}`
    },
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

router.delete('/:userId/wishlist/:phoneId', (req, res) => {
  const { userId, phoneId } = req.params;
  
  const user = users.get(userId);
  if (!user) {
    return res.status(404).json({
      success: false,
      status: 'not_found',
      error: 'User not found',
      message: 'Foydalanuvchi topilmadi',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    });
  }
  
  if (!user.wishlist) {
    return res.status(404).json({
      success: false,
      status: 'not_found',
      error: 'Wishlist is empty',
      message: 'Xohlar ro\'yxati bo\'sh',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    });
  }
  
  const itemIndex = user.wishlist.findIndex(item => item.phoneId === phoneId);
  if (itemIndex === -1) {
    return res.status(404).json({
      success: false,
      status: 'not_found',
      error: 'Phone not found in wishlist',
      message: 'Telefon xohlar ro\'yxatida topilmadi',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    });
  }
  
  const removedItem = user.wishlist[itemIndex];
  user.wishlist.splice(itemIndex, 1);
  user.updatedAt = new Date();
  users.set(userId, user);
  saveUsers(); // Save to file
  
  res.json({
    success: true,
    status: 'removed',
    data: {
      wishlist: user.wishlist,
      removedItem: removedItem,
      count: user.wishlist.length
    },
    message: 'Telefon xohlar ro\'yxatidan olib tashlandi',
    links: {
      self: `${req.protocol}://${req.get('host')}/api/users/${userId}/wishlist`,
      add: `${req.protocol}://${req.get('host')}/api/users/${userId}/wishlist`
    },
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// User preferences
router.put('/:userId/preferences', (req, res) => {
  const { userId } = req.params;
  const { preferences } = req.body;
  
  const user = users.get(userId);
  if (!user) {
    return res.status(404).json({
      success: false,
      status: 'not_found',
      error: 'User not found',
      message: 'Foydalanuvchi topilmadi',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    });
  }
  
  user.preferences = { ...user.preferences, ...preferences };
  user.updatedAt = new Date();
  users.set(userId, user);
  saveUsers(); // Save to file
  
  res.json({
    success: true,
    status: 'updated',
    data: {
      preferences: user.preferences
    },
    message: 'Sozlamalar muvaffaqiyatli yangilandi',
    links: {
      self: `${req.protocol}://${req.get('host')}${req.originalUrl}`,
      profile: `${req.protocol}://${req.get('host')}/api/users/${userId}`
    },
    timestamp: new Date().toISOString(),
    version: '1.0.0'
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
    success: true,
    status: 'ok',
    data: {
      users: safeUsers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: allUsers.length,
        pages: Math.ceil(allUsers.length / parseInt(limit)),
        hasNext: parseInt(page) < Math.ceil(allUsers.length / parseInt(limit)),
        hasPrev: parseInt(page) > 1,
        showing: `${startIndex + 1}-${endIndex > allUsers.length ? allUsers.length : endIndex} of ${allUsers.length}`
      }
    },
    message: `${paginatedUsers.length} ta foydalanuvchi topildi`,
    links: {
      self: `${req.protocol}://${req.get('host')}${req.originalUrl}`,
      register: `${req.protocol}://${req.get('host')}/api/users/register`
    },
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

export default router;