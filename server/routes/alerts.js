// Price and stock alerts functionality
import express from 'express';
import { storage } from '../utils/storage.js';

const router = express.Router();

// Create price alert
router.post('/price', async (req, res) => {
  const { phoneId, email, phone, targetPrice } = req.body;
  
  if (!phoneId || !targetPrice) {
    return res.status(400).json({
      success: false,
      status: 'validation_error',
      error: 'Phone ID and target price are required',
      message: 'Telefon ID va maqsadli narx kiritilishi shart',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    });
  }
  
  if (!email && !phone) {
    return res.status(400).json({
      success: false,
      status: 'validation_error',
      error: 'Email or phone is required',
      message: 'Email yoki telefon raqami kiritilishi shart',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    });
  }
  
  const alertId = `price_alert_${Date.now()}`;
  
  const alert = {
    id: alertId,
    phoneId,
    type: 'price',
    email: email || '',
    phone: phone || '',
    targetPrice: parseFloat(targetPrice),
    status: 'active',
    createdAt: new Date().toISOString(),
    notifiedAt: null
  };
  
  await storage.insert('alerts', alert);
  
  res.status(201).json({
    success: true,
    status: 'created',
    data: {
      alert: {
        id: alert.id,
        phoneId: alert.phoneId,
        type: alert.type,
        targetPrice: alert.targetPrice,
        formattedTargetPrice: alert.targetPrice.toLocaleString('uz-UZ') + ' so\'m',
        email: alert.email,
        phone: alert.phone,
        status: alert.status,
        createdAt: alert.createdAt
      }
    },
    message: 'Narx xabarnomasi sozlandi. Narx pasayganda sizga xabar beramiz!',
    links: {
      self: `${req.protocol}://${req.get('host')}/api/alerts/${alert.id}`,
      userAlerts: `${req.protocol}://${req.get('host')}/api/alerts/user?${alert.email ? 'email=' + alert.email : 'phone=' + alert.phone}`,
      delete: `${req.protocol}://${req.get('host')}/api/alerts/${alert.id}`
    },
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Create stock alert
router.post('/stock', async (req, res) => {
  const { phoneId, email, phone } = req.body;
  
  if (!phoneId) {
    return res.status(400).json({
      success: false,
      status: 'validation_error',
      error: 'Phone ID is required',
      message: 'Telefon ID kiritilishi shart',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    });
  }
  
  if (!email && !phone) {
    return res.status(400).json({
      success: false,
      status: 'validation_error',
      error: 'Email or phone is required',
      message: 'Email yoki telefon raqami kiritilishi shart',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    });
  }
  
  const alertId = `stock_alert_${Date.now()}`;
  
  const alert = {
    id: alertId,
    phoneId,
    type: 'stock',
    email: email || '',
    phone: phone || '',
    status: 'active',
    createdAt: new Date().toISOString(),
    notifiedAt: null
  };
  
  await storage.insert('alerts', alert);
  
  res.status(201).json({
    success: true,
    status: 'created',
    data: {
      alert: {
        id: alert.id,
        phoneId: alert.phoneId,
        type: alert.type,
        email: alert.email,
        phone: alert.phone,
        status: alert.status,
        createdAt: alert.createdAt
      }
    },
    message: 'Ombor xabarnomasi sozlandi. Mahsulot omborda paydo bo\'lganda sizga xabar beramiz!',
    links: {
      self: `${req.protocol}://${req.get('host')}/api/alerts/${alert.id}`,
      userAlerts: `${req.protocol}://${req.get('host')}/api/alerts/user?${alert.email ? 'email=' + alert.email : 'phone=' + alert.phone}`,
      delete: `${req.protocol}://${req.get('host')}/api/alerts/${alert.id}`
    },
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Get user alerts
router.get('/user', async (req, res) => {
  const { email, phone } = req.query;
  
  if (!email && !phone) {
    return res.status(400).json({
      success: false,
      status: 'validation_error',
      error: 'Email or phone is required',
      message: 'Email yoki telefon raqami kiritilishi shart',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    });
  }
  
  let alerts = [];
  if (email) {
    alerts = await storage.find('alerts', { email: email.toLowerCase() });
  } else if (phone) {
    alerts = await storage.find('alerts', { phone });
  }
  
  res.json({
    success: true,
    status: 'ok',
    data: {
      alerts: alerts,
      count: alerts.length,
      priceAlerts: alerts.filter(a => a.type === 'price').length,
      stockAlerts: alerts.filter(a => a.type === 'stock').length
    },
    message: `${alerts.length} ta xabarnoma topildi`,
    links: {
      self: `${req.protocol}://${req.get('host')}${req.originalUrl}`,
      createPrice: `${req.protocol}://${req.get('host')}/api/alerts/price`,
      createStock: `${req.protocol}://${req.get('host')}/api/alerts/stock`
    },
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Delete alert
router.delete('/:alertId', async (req, res) => {
  const { alertId } = req.params;
  
  const alert = await storage.findOne('alerts', { id: alertId });
  
  if (!alert) {
    return res.status(404).json({
      success: false,
      status: 'not_found',
      error: 'Alert not found',
      message: 'Xabarnoma topilmadi',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    });
  }
  
  await storage.delete('alerts', { id: alertId });
  
  res.json({
    success: true,
    status: 'deleted',
    data: {
      deletedAlert: {
        id: alert.id,
        phoneId: alert.phoneId,
        type: alert.type
      }
    },
    message: 'Xabarnoma o\'chirildi',
    links: {
      createPrice: `${req.protocol}://${req.get('host')}/api/alerts/price`,
      createStock: `${req.protocol}://${req.get('host')}/api/alerts/stock`
    },
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Get all alerts (admin)
router.get('/', async (req, res) => {
  const { type, status } = req.query;
  
  let alerts = await storage.find('alerts');
  
  if (type) {
    alerts = alerts.filter(a => a.type === type);
  }
  
  if (status) {
    alerts = alerts.filter(a => a.status === status);
  }
  
  res.json({
    success: true,
    status: 'ok',
    data: {
      alerts: alerts,
      stats: {
        total: alerts.length,
        priceAlerts: alerts.filter(a => a.type === 'price').length,
        stockAlerts: alerts.filter(a => a.type === 'stock').length,
        active: alerts.filter(a => a.status === 'active').length
      }
    },
    message: `${alerts.length} ta xabarnoma topildi`,
    links: {
      self: `${req.protocol}://${req.get('host')}${req.originalUrl}`,
      createPrice: `${req.protocol}://${req.get('host')}/api/alerts/price`,
      createStock: `${req.protocol}://${req.get('host')}/api/alerts/stock`
    },
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

export default router;
