// User management functionality
import express from 'express';
import { storage } from '../utils/storage.js';

const router = express.Router();

// Get user profile
router.get('/:userId', async (req, res) => {
  const { userId } = req.params;
  
  const user = await storage.findOne('users', { userId });
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
  
  // Remove password from response
  const { password, ...safeUser } = user;
  
  res.json({
    success: true,
    status: 'ok',
    data: {
      user: safeUser
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
router.put('/:userId', async (req, res) => {
  const { userId } = req.params;
  const updateData = req.body;
  
  const user = await storage.findOne('users', { userId });
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
  const updates = {};
  allowedFields.forEach(field => {
    if (updateData[field] !== undefined) {
      updates[field] = updateData[field];
    }
  });
  
  updates.updatedAt = new Date().toISOString();
  
  const updatedUser = await storage.update('users', { userId }, updates);
  
  // Remove password from response
  const { password, ...safeUser } = updatedUser;
  
  res.json({
    success: true,
    status: 'updated',
    data: {
      user: safeUser
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
router.get('/:userId/wishlist', async (req, res) => {
  const { userId } = req.params;
  
  const user = await storage.findOne('users', { userId });
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

router.post('/:userId/wishlist', async (req, res) => {
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
  
  const user = await storage.findOne('users', { userId });
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
  
  const wishlist = user.wishlist || [];
  
  // Check if already in wishlist
  const existingIndex = wishlist.findIndex(item => item.phoneId === phoneId);
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
  
  wishlist.push({
    phoneId,
    phone,
    addedAt: new Date().toISOString()
  });
  
  await storage.update('users', { userId }, {
    wishlist,
    updatedAt: new Date().toISOString()
  });
  
  res.status(201).json({
    success: true,
    status: 'added',
    data: {
      wishlist: wishlist,
      addedItem: wishlist[wishlist.length - 1],
      count: wishlist.length
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

router.delete('/:userId/wishlist/:phoneId', async (req, res) => {
  const { userId, phoneId } = req.params;
  
  const user = await storage.findOne('users', { userId });
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
  
  const wishlist = user.wishlist || [];
  
  if (wishlist.length === 0) {
    return res.status(404).json({
      success: false,
      status: 'not_found',
      error: 'Wishlist is empty',
      message: 'Xohlar ro\'yxati bo\'sh',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    });
  }
  
  const itemIndex = wishlist.findIndex(item => item.phoneId === phoneId);
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
  
  const removedItem = wishlist[itemIndex];
  wishlist.splice(itemIndex, 1);
  
  await storage.update('users', { userId }, {
    wishlist,
    updatedAt: new Date().toISOString()
  });
  
  res.json({
    success: true,
    status: 'removed',
    data: {
      wishlist: wishlist,
      removedItem: removedItem,
      count: wishlist.length
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
router.put('/:userId/preferences', async (req, res) => {
  const { userId } = req.params;
  const { preferences } = req.body;
  
  const user = await storage.findOne('users', { userId });
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
  
  const updatedPreferences = { ...user.preferences, ...preferences };
  
  await storage.update('users', { userId }, {
    preferences: updatedPreferences,
    updatedAt: new Date().toISOString()
  });
  
  res.json({
    success: true,
    status: 'updated',
    data: {
      preferences: updatedPreferences
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
router.get('/', async (req, res) => {
  const { page = 1, limit = 10, search } = req.query;
  
  let allUsers = await storage.find('users');
  
  // Search functionality
  if (search) {
    const searchLower = search.toLowerCase();
    allUsers = allUsers.filter(user => 
      user.name?.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower)
    );
  }
  
  // Pagination
  const startIndex = (parseInt(page) - 1) * parseInt(limit);
  const endIndex = startIndex + parseInt(limit);
  const paginatedUsers = allUsers.slice(startIndex, endIndex);
  
  // Remove sensitive data
  const safeUsers = paginatedUsers.map(user => {
    const { password, ...safeUser } = user;
    return safeUser;
  });
  
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

// Delete user by email (for testing/development)
router.delete('/email/:email', async (req, res) => {
  const { email } = req.params;
  
  // Find user by email
  const userToDelete = await storage.findOne('users', { email: email.toLowerCase() });
  
  if (!userToDelete) {
    return res.status(404).json({
      success: false,
      status: 'not_found',
      error: 'User not found',
      message: `Email "${email}" bilan foydalanuvchi topilmadi`,
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    });
  }
  
  // Delete user
  await storage.delete('users', { userId: userToDelete.userId });
  
  res.json({
    success: true,
    status: 'deleted',
    data: {
      deletedUser: {
        userId: userToDelete.userId,
        email: userToDelete.email,
        name: userToDelete.name
      },
      deletedAt: new Date().toISOString()
    },
    message: `Foydalanuvchi "${email}" muvaffaqiyatli o'chirildi`,
    links: {
      list: `${req.protocol}://${req.get('host')}/api/users`,
      register: `${req.protocol}://${req.get('host')}/api/auth/register`
    },
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Delete user by userId
router.delete('/:userId', async (req, res) => {
  const { userId } = req.params;
  
  const user = await storage.findOne('users', { userId });
  
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
  
  // Delete user
  await storage.delete('users', { userId });
  
  res.json({
    success: true,
    status: 'deleted',
    data: {
      deletedUser: {
        userId: user.userId,
        email: user.email,
        name: user.name
      },
      deletedAt: new Date().toISOString()
    },
    message: 'Foydalanuvchi muvaffaqiyatli o\'chirildi',
    links: {
      list: `${req.protocol}://${req.get('host')}/api/users`,
      register: `${req.protocol}://${req.get('host')}/api/auth/register`
    },
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

export default router;
