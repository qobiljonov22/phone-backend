// Modal endpoints for UI mockups
import express from 'express';
import fs from 'fs';

const router = express.Router();

// Storage files
const callbacksFile = 'callbacks_database.json';
const lowpriceFile = 'lowprice_database.json';
const ordersFile = 'orders_database.json';
const creditFile = 'credit_database.json';
const tradeFile = 'trade_database.json';

// Load data from files
const loadData = (file) => {
  try {
    if (fs.existsSync(file)) {
      return JSON.parse(fs.readFileSync(file, 'utf8'));
    }
  } catch (error) {
    console.error(`Error loading ${file}:`, error);
  }
  return { items: [], counter: 1 };
};

// Save data to files
const saveData = (file, data) => {
  try {
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error(`Error saving ${file}:`, error);
  }
};

// ========== CALLBACK MODAL ==========
// POST /api/callback - Request callback
router.post('/callback', (req, res) => {
  const { phone, name, preferredTime, message } = req.body;
  
  if (!phone) {
    return res.status(400).json({ 
      error: 'Phone number is required',
      message: 'Telefon raqami kiritilishi shart' 
    });
  }
  
  const data = loadData(callbacksFile);
  const callbackId = `callback_${Date.now()}`;
  
  const callback = {
    id: callbackId,
    phone,
    name: name || '',
    preferredTime: preferredTime || '',
    message: message || '',
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  data.items.push(callback);
  data.counter = (data.counter || 0) + 1;
  saveData(callbacksFile, data);
  
  res.status(201).json({
    success: true,
    message: 'Callback so\'rovi qabul qilindi. Tez orada sizga qo\'ng\'iroq qilamiz!',
    callback: {
      id: callback.id,
      phone: callback.phone,
      status: callback.status
    }
  });
});

// GET /api/callback - Get all callbacks (admin)
router.get('/callback', (req, res) => {
  const data = loadData(callbacksFile);
  const { page = 1, limit = 10, status } = req.query;
  
  let items = data.items || [];
  
  if (status) {
    items = items.filter(item => item.status === status);
  }
  
  // Sort by date (newest first)
  items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
  // Pagination
  const startIndex = (parseInt(page) - 1) * parseInt(limit);
  const endIndex = startIndex + parseInt(limit);
  const paginatedItems = items.slice(startIndex, endIndex);
  
  res.json({
    callbacks: paginatedItems,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: items.length,
      pages: Math.ceil(items.length / parseInt(limit))
    }
  });
});

// ========== LOWPRICE MODAL ==========
// POST /api/lowprice - Report lower price
router.post('/lowprice', (req, res) => {
  const { phoneId, competitorUrl, competitorPrice, phone, name, email } = req.body;
  
  if (!phoneId || !competitorPrice) {
    return res.status(400).json({ 
      error: 'Phone ID and competitor price are required',
      message: 'Telefon ID va raqib narxi kiritilishi shart' 
    });
  }
  
  const data = loadData(lowpriceFile);
  const reportId = `lowprice_${Date.now()}`;
  
  const report = {
    id: reportId,
    phoneId,
    competitorUrl: competitorUrl || '',
    competitorPrice: parseFloat(competitorPrice),
    phone: phone || '',
    name: name || '',
    email: email || '',
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  data.items.push(report);
  data.counter = (data.counter || 0) + 1;
  saveData(lowpriceFile, data);
  
  res.status(201).json({
    success: true,
    message: 'Past narx haqidagi xabar qabul qilindi. Tekshirib ko\'ramiz!',
    report: {
      id: report.id,
      phoneId: report.phoneId,
      competitorPrice: report.competitorPrice,
      status: report.status
    }
  });
});

// GET /api/lowprice - Get all reports (admin)
router.get('/lowprice', (req, res) => {
  const data = loadData(lowpriceFile);
  res.json({ reports: data.items || [] });
});

// ========== 1CLICK ORDER MODAL ==========
// POST /api/oneclick - One-click order
router.post('/oneclick', (req, res) => {
  const { phoneId, phone, name, address, paymentMethod } = req.body;
  
  if (!phoneId || !phone) {
    return res.status(400).json({ 
      error: 'Phone ID and phone number are required',
      message: 'Telefon ID va telefon raqami kiritilishi shart' 
    });
  }
  
  const data = loadData(ordersFile);
  const orderId = `oneclick_${Date.now()}`;
  
  const order = {
    id: orderId,
    phoneId,
    phone,
    name: name || '',
    address: address || '',
    paymentMethod: paymentMethod || 'cash',
    type: 'oneclick',
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  data.items.push(order);
  data.counter = (data.counter || 0) + 1;
  saveData(ordersFile, data);
  
  res.status(201).json({
    success: true,
    message: 'Buyurtma qabul qilindi! Tez orada sizga qo\'ng\'iroq qilamiz.',
    order: {
      id: order.id,
      phoneId: order.phoneId,
      status: order.status
    }
  });
});

// ========== CREDIT MODAL ==========
// POST /api/credit - Apply for credit
router.post('/credit', (req, res) => {
  const { phoneId, name, phone, email, passport, salary, creditAmount, months } = req.body;
  
  if (!phoneId || !name || !phone || !passport) {
    return res.status(400).json({ 
      error: 'Required fields are missing',
      message: 'Barcha majburiy maydonlar to\'ldirilishi shart' 
    });
  }
  
  const data = loadData(creditFile);
  const applicationId = `credit_${Date.now()}`;
  
  const application = {
    id: applicationId,
    phoneId,
    name,
    phone,
    email: email || '',
    passport,
    salary: parseFloat(salary) || 0,
    creditAmount: parseFloat(creditAmount) || 0,
    months: parseInt(months) || 12,
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  data.items.push(application);
  data.counter = (data.counter || 0) + 1;
  saveData(creditFile, data);
  
  res.status(201).json({
    success: true,
    message: 'Kredit arizasi qabul qilindi. Tez orada sizga qo\'ng\'iroq qilamiz!',
    application: {
      id: application.id,
      phoneId: application.phoneId,
      creditAmount: application.creditAmount,
      months: application.months,
      status: application.status
    }
  });
});

// GET /api/credit - Get all applications (admin)
router.get('/credit', (req, res) => {
  const data = loadData(creditFile);
  res.json({ applications: data.items || [] });
});

// ========== TRADE-IN MODAL ==========
// POST /api/trade - Trade-in request
router.post('/trade', (req, res) => {
  const { newPhoneId, oldPhoneBrand, oldPhoneModel, oldPhoneCondition, name, phone, email } = req.body;
  
  if (!newPhoneId || !oldPhoneBrand || !oldPhoneModel || !name || !phone) {
    return res.status(400).json({ 
      error: 'Required fields are missing',
      message: 'Barcha majburiy maydonlar to\'ldirilishi shart' 
    });
  }
  
  const data = loadData(tradeFile);
  const tradeId = `trade_${Date.now()}`;
  
  const trade = {
    id: tradeId,
    newPhoneId,
    oldPhoneBrand,
    oldPhoneModel,
    oldPhoneCondition: oldPhoneCondition || 'good',
    name,
    phone,
    email: email || '',
    estimatedValue: 0, // Will be calculated by admin
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  data.items.push(trade);
  data.counter = (data.counter || 0) + 1;
  saveData(tradeFile, data);
  
  res.status(201).json({
    success: true,
    message: 'Almashtirish so\'rovi qabul qilindi. Tez orada baholash natijasini e\'lon qilamiz!',
    trade: {
      id: trade.id,
      newPhoneId: trade.newPhoneId,
      oldPhoneBrand: trade.oldPhoneBrand,
      oldPhoneModel: trade.oldPhoneModel,
      status: trade.status
    }
  });
});

// GET /api/trade - Get all trade requests (admin)
router.get('/trade', (req, res) => {
  const data = loadData(tradeFile);
  res.json({ trades: data.items || [] });
});

export default router;
