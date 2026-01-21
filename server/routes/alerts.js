// Price and stock alerts functionality
import express from 'express';
import fs from 'fs';

const router = express.Router();

const alertsFile = 'alerts_database.json';

// Load alerts
const loadAlerts = () => {
  try {
    if (fs.existsSync(alertsFile)) {
      return JSON.parse(fs.readFileSync(alertsFile, 'utf8'));
  }
  } catch (error) {
    console.error('Error loading alerts:', error);
  }
  return { alerts: [], counter: 1 };
};

// Save alerts
const saveAlerts = (data) => {
  try {
    fs.writeFileSync(alertsFile, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error saving alerts:', error);
  }
};

// Create price alert
router.post('/price', (req, res) => {
  const { phoneId, email, phone, targetPrice } = req.body;
  
  if (!phoneId || !targetPrice) {
    return res.status(400).json({ 
      error: 'Phone ID and target price are required',
      message: 'Telefon ID va maqsadli narx kiritilishi shart' 
    });
  }
  
  if (!email && !phone) {
    return res.status(400).json({ 
      error: 'Email or phone is required',
      message: 'Email yoki telefon raqami kiritilishi shart' 
    });
  }
  
  const data = loadAlerts();
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
  
  data.alerts.push(alert);
  data.counter = (data.counter || 0) + 1;
  saveAlerts(data);
  
  res.status(201).json({
    success: true,
    message: 'Narx xabarnomasi sozlandi. Narx pasayganda sizga xabar beramiz!',
    alert: {
      id: alert.id,
      phoneId: alert.phoneId,
      targetPrice: alert.targetPrice
    }
  });
});

// Create stock alert
router.post('/stock', (req, res) => {
  const { phoneId, email, phone } = req.body;
  
  if (!phoneId) {
    return res.status(400).json({ 
      error: 'Phone ID is required',
      message: 'Telefon ID kiritilishi shart' 
    });
  }
  
  if (!email && !phone) {
    return res.status(400).json({ 
      error: 'Email or phone is required',
      message: 'Email yoki telefon raqami kiritilishi shart' 
    });
  }
  
  const data = loadAlerts();
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
  
  data.alerts.push(alert);
  data.counter = (data.counter || 0) + 1;
  saveAlerts(data);
  
  res.status(201).json({
    success: true,
    message: 'Ombor xabarnomasi sozlandi. Mahsulot omborda paydo bo\'lganda sizga xabar beramiz!',
    alert: {
      id: alert.id,
      phoneId: alert.phoneId
    }
  });
});

// Get user alerts
router.get('/user', (req, res) => {
  const { email, phone } = req.query;
  
  if (!email && !phone) {
    return res.status(400).json({ error: 'Email or phone is required' });
  }
  
  const data = loadAlerts();
  let alerts = data.alerts || [];
  
  if (email) {
    alerts = alerts.filter(a => a.email.toLowerCase() === email.toLowerCase());
  } else if (phone) {
    alerts = alerts.filter(a => a.phone === phone);
  }
  
  res.json({ alerts });
});

// Delete alert
router.delete('/:alertId', (req, res) => {
  const { alertId } = req.params;
  
  const data = loadAlerts();
  const alertIndex = data.alerts.findIndex(a => a.id === alertId);
  
  if (alertIndex === -1) {
    return res.status(404).json({ error: 'Alert not found' });
  }
  
  data.alerts.splice(alertIndex, 1);
  saveAlerts(data);
  
  res.json({
    success: true,
    message: 'Xabarnoma o\'chirildi'
  });
});

// Get all alerts (admin)
router.get('/', (req, res) => {
  const data = loadAlerts();
  const { type, status } = req.query;
  
  let alerts = data.alerts || [];
  
  if (type) {
    alerts = alerts.filter(a => a.type === type);
  }
  
  if (status) {
    alerts = alerts.filter(a => a.status === status);
  }
  
  res.json({
    alerts,
    total: alerts.length,
    priceAlerts: alerts.filter(a => a.type === 'price').length,
    stockAlerts: alerts.filter(a => a.type === 'stock').length
  });
});

export default router;
