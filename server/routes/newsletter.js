// Newsletter subscription functionality
import express from 'express';
import fs from 'fs';

const router = express.Router();

const newsletterFile = 'newsletter_database.json';

// Load subscribers
const loadSubscribers = () => {
  try {
    if (fs.existsSync(newsletterFile)) {
      return JSON.parse(fs.readFileSync(newsletterFile, 'utf8'));
    }
  } catch (error) {
    console.error('Error loading newsletter:', error);
  }
  return { subscribers: [], counter: 1 };
};

// Save subscribers
const saveSubscribers = (data) => {
  try {
    fs.writeFileSync(newsletterFile, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error saving newsletter:', error);
  }
};

// Subscribe to newsletter
router.post('/subscribe', (req, res) => {
  const { email, name } = req.body;
  
  if (!email) {
    return res.status(400).json({ 
      error: 'Email is required',
      message: 'Email manzili kiritilishi shart' 
    });
  }
  
  // Simple email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ 
      error: 'Invalid email format',
      message: 'Noto\'g\'ri email format' 
    });
  }
  
  const data = loadSubscribers();
  
  // Check if already subscribed
  const existing = data.subscribers.find(s => s.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(409).json({ 
      error: 'Already subscribed',
      message: 'Bu email allaqachon ro\'yxatdan o\'tgan' 
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
  
  data.subscribers.push(subscriber);
  data.counter = (data.counter || 0) + 1;
  saveSubscribers(data);
  
  res.status(201).json({
    success: true,
    message: 'Muvaffaqiyatli ro\'yxatdan o\'tdingiz!',
    subscriber: {
      id: subscriber.id,
      email: subscriber.email
    }
  });
});

// Unsubscribe from newsletter
router.post('/unsubscribe', (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }
  
  const data = loadSubscribers();
  const subscriber = data.subscribers.find(s => s.email.toLowerCase() === email.toLowerCase());
  
  if (!subscriber) {
    return res.status(404).json({ error: 'Subscriber not found' });
  }
  
  subscriber.status = 'unsubscribed';
  subscriber.unsubscribedAt = new Date().toISOString();
  saveSubscribers(data);
  
  res.json({
    success: true,
    message: 'Obuna bekor qilindi'
  });
});

// Get all subscribers (admin)
router.get('/subscribers', (req, res) => {
  const data = loadSubscribers();
  const { status } = req.query;
  
  let subscribers = data.subscribers || [];
  
  if (status) {
    subscribers = subscribers.filter(s => s.status === status);
  }
  
  res.json({
    subscribers,
    total: subscribers.length,
    active: subscribers.filter(s => s.status === 'active').length
  });
});

export default router;
