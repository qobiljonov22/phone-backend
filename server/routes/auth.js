// Authentication and Authorization routes
import express from 'express';
import fs from 'fs';
import crypto from 'crypto';

const router = express.Router();

// Users database file
// In Vercel/serverless, use /tmp directory for file writes
const isVercel = process.env.VERCEL === '1' || process.env.VERCEL_ENV;
const usersFile = isVercel ? '/tmp/users_database.json' : 'users_database.json';

// Load users from file
const loadUsers = () => {
  try {
    if (fs.existsSync(usersFile)) {
      const data = JSON.parse(fs.readFileSync(usersFile, 'utf8'));
      return new Map(Object.entries(data.users || {}));
    }
  } catch (error) {
    console.error('Error loading users:', error);
  }
  return new Map();
};

// Save users to file
const saveUsers = (users, userCounter) => {
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

// Simple password hashing (using crypto)
const hashPassword = (password) => {
  return crypto.createHash('sha256').update(password).digest('hex');
};

// Simple JWT-like token generation
const generateToken = (userId, email) => {
  const header = {
    alg: 'HS256',
    typ: 'JWT'
  };
  
  const payload = {
    userId,
    email,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7 days
  };
  
  // Simple base64 encoding (in production, use proper JWT library)
  const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  
  // Simple signature (in production, use proper HMAC)
  const signature = crypto
    .createHash('sha256')
    .update(`${encodedHeader}.${encodedPayload}.${process.env.JWT_SECRET || 'phone-store-secret-2024'}`)
    .digest('base64url');
  
  return `${encodedHeader}.${encodedPayload}.${signature}`;
};

// Verify token
const verifyToken = (token) => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const [encodedHeader, encodedPayload, signature] = parts;
    
    // Verify signature
    const expectedSignature = crypto
      .createHash('sha256')
      .update(`${encodedHeader}.${encodedPayload}.${process.env.JWT_SECRET || 'phone-store-secret-2024'}`)
      .digest('base64url');
    
    if (signature !== expectedSignature) return null;
    
    // Decode payload
    const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString());
    
    // Check expiration
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    
    return payload;
  } catch (error) {
    return null;
  }
};

// ========== REGISTER ==========
router.post('/register', (req, res) => {
  const { 
    name, 
    email, 
    password,
    phone, 
    address,
    preferences = {} 
  } = req.body;
  
  // Validation
  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      status: 'validation_error',
      error: 'Name, email and password are required',
      message: 'Ism, email va parol kiritilishi shart',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    });
  }
  
  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      status: 'validation_error',
      error: 'Invalid email format',
      message: 'Noto\'g\'ri email format',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    });
  }
  
  // Password validation (min 6 characters)
  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      status: 'validation_error',
      error: 'Password must be at least 6 characters',
      message: 'Parol kamida 6 ta belgidan iborat bo\'lishi kerak',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    });
  }
  
  const users = loadUsers();
  let userCounter = 1;
  
  // Get user counter
  try {
    if (fs.existsSync(usersFile)) {
      const data = JSON.parse(fs.readFileSync(usersFile, 'utf8'));
      userCounter = (data.userCounter || 0) + 1;
    }
  } catch (error) {
    console.error('Error loading user counter:', error);
  }
  
  // Check if user already exists
  const existingUser = Array.from(users.values()).find(user => user.email.toLowerCase() === email.toLowerCase());
  if (existingUser) {
    return res.status(409).json({
      success: false,
      status: 'already_exists',
      error: 'User with this email already exists',
      message: 'Bu email bilan foydalanuvchi allaqachon mavjud. Iltimos, login qiling yoki boshqa email ishlating.',
      data: {
        existingEmail: existingUser.email,
        suggestion: 'Login qiling yoki boshqa email ishlating'
      },
      links: {
        login: `${req.protocol}://${req.get('host')}/api/auth/login`,
        register: `${req.protocol}://${req.get('host')}/api/auth/register`
      },
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    });
  }
  
  const userId = `user_${userCounter}`;
  const hashedPassword = hashPassword(password);
  
  const user = {
    userId,
    name,
    email: email.toLowerCase(),
    password: hashedPassword,
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
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isActive: true,
    role: 'user' // user, admin
  };
  
  users.set(userId, user);
  saveUsers(users, userCounter);
  
  // Generate token
  const token = generateToken(userId, user.email);
  
  res.status(201).json({
    success: true,
    status: 'registered',
    data: {
      user: {
        userId: user.userId,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        createdAt: user.createdAt
      },
      token: token,
      expiresIn: '7d'
    },
    message: 'Foydalanuvchi muvaffaqiyatli ro\'yxatdan o\'tdi',
    links: {
      self: `${req.protocol}://${req.get('host')}/api/auth/me`,
      profile: `${req.protocol}://${req.get('host')}/api/users/${user.userId}`,
      login: `${req.protocol}://${req.get('host')}/api/auth/login`
    },
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// ========== LOGIN ==========
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  
  // Validation
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      status: 'validation_error',
      error: 'Email and password are required',
      message: 'Email va parol kiritilishi shart',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    });
  }
  
  const users = loadUsers();
  const hashedPassword = hashPassword(password);
  
  // Find user by email and password
  const user = Array.from(users.values()).find(
    u => u.email.toLowerCase() === email.toLowerCase() && u.password === hashedPassword
  );
  
  if (!user) {
    return res.status(401).json({
      success: false,
      status: 'unauthorized',
      error: 'Invalid email or password',
      message: 'Noto\'g\'ri email yoki parol',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    });
  }
  
  if (!user.isActive) {
    return res.status(403).json({
      success: false,
      status: 'forbidden',
      error: 'Account is deactivated',
      message: 'Hisob o\'chirilgan',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    });
  }
  
  // Generate token
  const token = generateToken(user.userId, user.email);
  
  res.json({
    success: true,
    status: 'authenticated',
    data: {
      user: {
        userId: user.userId,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        createdAt: user.createdAt
      },
      token: token,
      expiresIn: '7d'
    },
    message: 'Muvaffaqiyatli kirildi',
    links: {
      self: `${req.protocol}://${req.get('host')}/api/auth/me`,
      profile: `${req.protocol}://${req.get('host')}/api/users/${user.userId}`,
      refresh: `${req.protocol}://${req.get('host')}/api/auth/refresh`
    },
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// ========== GET CURRENT USER (ME) ==========
router.get('/me', (req, res) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      status: 'unauthorized',
      error: 'Authorization token required',
      message: 'Tasdiqlash tokeni kerak',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    });
  }
  
  const token = authHeader.substring(7);
  const payload = verifyToken(token);
  
  if (!payload) {
    return res.status(401).json({
      success: false,
      status: 'unauthorized',
      error: 'Invalid or expired token',
      message: 'Token noto\'g\'ri yoki muddati o\'tgan',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    });
  }
  
  const users = loadUsers();
  const user = users.get(payload.userId);
  
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
      user: {
        userId: user.userId,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        preferences: user.preferences,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    },
    message: 'Foydalanuvchi ma\'lumotlari yuklandi',
    links: {
      self: `${req.protocol}://${req.get('host')}/api/auth/me`,
      profile: `${req.protocol}://${req.get('host')}/api/users/${user.userId}`,
      logout: `${req.protocol}://${req.get('host')}/api/auth/logout`
    },
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// ========== REFRESH TOKEN ==========
router.post('/refresh', (req, res) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      status: 'unauthorized',
      error: 'Authorization token required',
      message: 'Tasdiqlash tokeni kerak',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    });
  }
  
  const token = authHeader.substring(7);
  const payload = verifyToken(token);
  
  if (!payload) {
    return res.status(401).json({
      success: false,
      status: 'unauthorized',
      error: 'Invalid or expired token',
      message: 'Token noto\'g\'ri yoki muddati o\'tgan',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    });
  }
  
  const users = loadUsers();
  const user = users.get(payload.userId);
  
  if (!user || !user.isActive) {
    return res.status(401).json({
      success: false,
      status: 'unauthorized',
      error: 'User not found or inactive',
      message: 'Foydalanuvchi topilmadi yoki o\'chirilgan',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    });
  }
  
  // Generate new token
  const newToken = generateToken(user.userId, user.email);
  
  res.json({
    success: true,
    status: 'refreshed',
    data: {
      token: newToken,
      expiresIn: '7d'
    },
    message: 'Token yangilandi',
    links: {
      self: `${req.protocol}://${req.get('host')}/api/auth/me`
    },
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// ========== LOGOUT ==========
router.post('/logout', (req, res) => {
  // In a stateless JWT system, logout is handled client-side
  // But we can log it for analytics
  res.json({
    success: true,
    status: 'logged_out',
    data: {},
    message: 'Muvaffaqiyatli chiqildi',
    links: {
      login: `${req.protocol}://${req.get('host')}/api/auth/login`,
      register: `${req.protocol}://${req.get('host')}/api/auth/register`
    },
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Export verifyToken for use in other routes
export { verifyToken, generateToken };
export default router;
