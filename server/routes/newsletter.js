// Newsletter subscription functionality
import express from 'express';
import { storage } from '../utils/storage.js';

const router = express.Router();

// Subscribe to newsletter
router.post('/subscribe', async (req, res) => {
  const { email, name } = req.body;
  
  if (!email) {
    return res.status(400).json({
      success: false,
      status: 'validation_error',
      error: 'Email is required',
      message: 'Email manzili kiritilishi shart',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    });
  }
  
  // Simple email validation
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
  
  // Check if already subscribed
  const existing = await storage.findOne('newsletter', { email: email.toLowerCase() });
  if (existing) {
    return res.status(409).json({
      success: false,
      status: 'already_exists',
      error: 'Already subscribed',
      message: 'Bu email allaqachon ro\'yxatdan o\'tgan',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    });
  }
  
  const subscriber = {
    id: `sub_${Date.now()}`,
    email: email.toLowerCase(),
    name: name || '',
    subscribedAt: new Date().toISOString(),
    status: 'active',
    unsubscribedAt: null
  };
  
  await storage.insert('newsletter', subscriber);
  
  res.status(201).json({
    success: true,
    status: 'subscribed',
    data: {
      subscriber: {
        id: subscriber.id,
        email: subscriber.email,
        name: subscriber.name,
        subscribedAt: subscriber.subscribedAt,
        status: subscriber.status
      }
    },
    message: 'Muvaffaqiyatli ro\'yxatdan o\'tdingiz!',
    links: {
      self: `${req.protocol}://${req.get('host')}/api/newsletter/subscribers/${subscriber.id}`,
      unsubscribe: `${req.protocol}://${req.get('host')}/api/newsletter/unsubscribe`
    },
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Unsubscribe from newsletter
router.post('/unsubscribe', async (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({
      success: false,
      status: 'validation_error',
      error: 'Email is required',
      message: 'Email manzili kiritilishi shart',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    });
  }
  
  const subscriber = await storage.findOne('newsletter', { email: email.toLowerCase() });
  
  if (!subscriber) {
    return res.status(404).json({
      success: false,
      status: 'not_found',
      error: 'Subscriber not found',
      message: 'Obunachi topilmadi',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    });
  }
  
  await storage.update('newsletter', { id: subscriber.id }, {
    status: 'unsubscribed',
    unsubscribedAt: new Date().toISOString()
  });
  
  res.json({
    success: true,
    status: 'unsubscribed',
    data: {
      subscriber: {
        id: subscriber.id,
        email: subscriber.email,
        status: 'unsubscribed',
        unsubscribedAt: new Date().toISOString()
      }
    },
    message: 'Obuna bekor qilindi',
    links: {
      subscribe: `${req.protocol}://${req.get('host')}/api/newsletter/subscribe`
    },
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Get all subscribers (admin)
router.get('/subscribers', async (req, res) => {
  const { status } = req.query;
  
  let subscribers = await storage.find('newsletter');
  
  if (status) {
    subscribers = subscribers.filter(s => s.status === status);
  }
  
  res.json({
    success: true,
    status: 'ok',
    data: {
      subscribers: subscribers,
      stats: {
        total: subscribers.length,
        active: subscribers.filter(s => s.status === 'active').length,
        unsubscribed: subscribers.filter(s => s.status === 'unsubscribed').length
      }
    },
    message: `${subscribers.length} ta obunachi topildi`,
    links: {
      self: `${req.protocol}://${req.get('host')}${req.originalUrl}`,
      subscribe: `${req.protocol}://${req.get('host')}/api/newsletter/subscribe`
    },
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

export default router;
