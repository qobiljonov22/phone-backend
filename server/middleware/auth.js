// Authentication middleware
import { verifyToken } from '../routes/auth.js';
import fs from 'fs';

// Middleware to verify JWT token
export const authenticate = (req, res, next) => {
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
  
  // Attach user info to request
  req.user = {
    userId: payload.userId,
    email: payload.email
  };
  
  next();
};

// Middleware to check if user is admin
export const isAdmin = (req, res, next) => {
  // First authenticate
  authenticate(req, res, () => {
    // Load user to check role
    try {
      const isVercelEnv = process.env.VERCEL === '1' || process.env.VERCEL_ENV;
      const usersFile = isVercelEnv ? '/tmp/users_database.json' : 'users_database.json';
      
      if (fs.existsSync(usersFile)) {
        const data = JSON.parse(fs.readFileSync(usersFile, 'utf8'));
        const users = new Map(Object.entries(data.users || {}));
        const user = users.get(req.user.userId);
        
        if (!user || user.role !== 'admin') {
          return res.status(403).json({
            success: false,
            status: 'forbidden',
            error: 'Admin access required',
            message: 'Admin huquqi kerak',
            timestamp: new Date().toISOString(),
            version: '1.0.0'
          });
        }
        
        req.user.role = 'admin';
        next();
      } else {
        return res.status(403).json({
          success: false,
          status: 'forbidden',
          error: 'Admin access required',
          message: 'Admin huquqi kerak',
          timestamp: new Date().toISOString(),
          version: '1.0.0'
        });
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        status: 'error',
        error: 'Server error',
        message: 'Server xatosi',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      });
    }
  });
};

// Optional authentication (doesn't fail if no token)
export const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const payload = verifyToken(token);
    
    if (payload) {
      req.user = {
        userId: payload.userId,
        email: payload.email
      };
    }
  }
  
  next();
};

export default { authenticate, isAdmin, optionalAuth };
