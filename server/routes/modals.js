// Modal endpoints for UI mockups
import express from 'express';
import { storage } from '../utils/storage.js';

const router = express.Router();

// ========== CALLBACK MODAL ==========
// POST /api/callback - Request callback
router.post('/callback', async (req, res) => {
  const { phone, name, preferredTime, message } = req.body;
  
  if (!phone) {
    return res.status(400).json({
      success: false,
      status: 'validation_error',
      error: 'Phone number is required',
      message: 'Telefon raqami kiritilishi shart',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    });
  }
  
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
  
  await storage.insert('callbacks', callback);
  
  res.status(201).json({
    success: true,
    status: 'created',
    data: {
      callback: {
        id: callback.id,
        phone: callback.phone,
        name: callback.name,
        status: callback.status,
        createdAt: callback.createdAt
      }
    },
    message: 'Qo\'ng\'iroq so\'rovi qabul qilindi. Tez orada sizga qo\'ng\'iroq qilamiz!',
    links: {
      self: `${req.protocol}://${req.get('host')}/api/modals/callback/${callback.id}`,
      list: `${req.protocol}://${req.get('host')}/api/modals/callback`
    },
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// GET /api/callback - Get all callbacks (admin)
router.get('/callback', async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;
  
  let items = await storage.find('callbacks');
  
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
    success: true,
    status: 'ok',
    data: {
      callbacks: paginatedItems,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: items.length,
        pages: Math.ceil(items.length / parseInt(limit)),
        hasNext: parseInt(page) < Math.ceil(items.length / parseInt(limit)),
        hasPrev: parseInt(page) > 1
      }
    },
    message: `${paginatedItems.length} ta qo'ng'iroq so'rovi topildi`,
    links: {
      self: `${req.protocol}://${req.get('host')}${req.originalUrl}`,
      create: `${req.protocol}://${req.get('host')}/api/modals/callback`
    },
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// ========== LOWPRICE MODAL ==========
// POST /api/lowprice - Report lower price
router.post('/lowprice', async (req, res) => {
  const { phoneId, competitorUrl, competitorPrice, phone, name, email } = req.body;
  
  if (!phoneId || !competitorPrice) {
    return res.status(400).json({
      success: false,
      status: 'validation_error',
      error: 'Phone ID and competitor price are required',
      message: 'Telefon ID va raqib narxi kiritilishi shart',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    });
  }
  
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
  
  await storage.insert('lowprice', report);
  
  res.status(201).json({
    success: true,
    status: 'created',
    data: {
      report: {
        id: report.id,
        phoneId: report.phoneId,
        phone: report.phone,
        competitorPrice: report.competitorPrice,
        competitorUrl: report.competitorUrl,
        status: report.status,
        createdAt: report.createdAt
      }
    },
    message: 'Past narx haqidagi xabar qabul qilindi. Tekshirib ko\'ramiz!',
    links: {
      self: `${req.protocol}://${req.get('host')}/api/modals/lowprice/${report.id}`,
      list: `${req.protocol}://${req.get('host')}/api/modals/lowprice`
    },
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// GET /api/lowprice - Get all reports (admin)
router.get('/lowprice', async (req, res) => {
  const reports = await storage.find('lowprice');
  
  res.json({
    success: true,
    status: 'ok',
    data: {
      reports: reports
    },
    message: `${reports.length} ta past narx xabari topildi`,
    links: {
      self: `${req.protocol}://${req.get('host')}${req.originalUrl}`,
      create: `${req.protocol}://${req.get('host')}/api/modals/lowprice`
    },
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// ========== 1CLICK ORDER MODAL ==========
// POST /api/oneclick - One-click order
router.post('/oneclick', async (req, res) => {
  const { phoneId, phone, name, address, paymentMethod } = req.body;
  
  if (!phoneId || !phone) {
    return res.status(400).json({
      success: false,
      status: 'validation_error',
      error: 'Phone ID and phone number are required',
      message: 'Telefon ID va telefon raqami kiritilishi shart',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    });
  }
  
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
  
  await storage.insert('orders', order);
  
  res.status(201).json({
    success: true,
    status: 'created',
    data: {
      order: {
        id: order.id,
        phoneId: order.phoneId,
        phone: order.phone,
        name: order.name,
        address: order.address,
        paymentMethod: order.paymentMethod,
        type: order.type,
        status: order.status,
        createdAt: order.createdAt
      }
    },
    message: 'Bir bosilish buyurtma qabul qilindi! Tez orada sizga qo\'ng\'iroq qilamiz.',
    links: {
      self: `${req.protocol}://${req.get('host')}/api/modals/oneclick/${order.id}`,
      list: `${req.protocol}://${req.get('host')}/api/modals/oneclick`
    },
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// ========== CREDIT MODAL ==========
// POST /api/credit - Apply for credit
router.post('/credit', async (req, res) => {
  const { phoneId, name, phone, email, passport, salary, creditAmount, months } = req.body;
  
  if (!phoneId || !name || !phone || !passport) {
    return res.status(400).json({
      success: false,
      status: 'validation_error',
      error: 'Required fields are missing',
      message: 'Barcha majburiy maydonlar to\'ldirilishi shart',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    });
  }
  
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
  
  await storage.insert('credit', application);
  
  res.status(201).json({
    success: true,
    status: 'created',
    data: {
      application: {
        id: application.id,
        phoneId: application.phoneId,
        name: application.name,
        phone: application.phone,
        creditAmount: application.creditAmount,
        months: application.months,
        monthlyPayment: application.creditAmount / application.months,
        status: application.status,
        createdAt: application.createdAt
      }
    },
    message: 'Kredit arizasi qabul qilindi. Tez orada sizga qo\'ng\'iroq qilamiz!',
    links: {
      self: `${req.protocol}://${req.get('host')}/api/modals/credit/${application.id}`,
      list: `${req.protocol}://${req.get('host')}/api/modals/credit`
    },
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// GET /api/credit - Get all applications (admin)
router.get('/credit', async (req, res) => {
  const applications = await storage.find('credit');
  
  res.json({
    success: true,
    status: 'ok',
    data: {
      applications: applications
    },
    message: `${applications.length} ta kredit arizasi topildi`,
    links: {
      self: `${req.protocol}://${req.get('host')}${req.originalUrl}`,
      create: `${req.protocol}://${req.get('host')}/api/modals/credit`
    },
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// ========== TRADE-IN MODAL ==========
// POST /api/trade - Trade-in request
router.post('/trade', async (req, res) => {
  const { newPhoneId, oldPhoneBrand, oldPhoneModel, oldPhoneCondition, name, phone, email } = req.body;
  
  if (!newPhoneId || !oldPhoneBrand || !oldPhoneModel || !name || !phone) {
    return res.status(400).json({
      success: false,
      status: 'validation_error',
      error: 'Required fields are missing',
      message: 'Barcha majburiy maydonlar to\'ldirilishi shart',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    });
  }
  
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
  
  await storage.insert('trade', trade);
  
  res.status(201).json({
    success: true,
    status: 'created',
    data: {
      trade: {
        id: trade.id,
        newPhoneId: trade.newPhoneId,
        oldPhoneBrand: trade.oldPhoneBrand,
        oldPhoneModel: trade.oldPhoneModel,
        oldPhoneCondition: trade.oldPhoneCondition,
        name: trade.name,
        phone: trade.phone,
        estimatedValue: trade.estimatedValue,
        status: trade.status,
        createdAt: trade.createdAt
      }
    },
    message: 'Almashtirish so\'rovi qabul qilindi. Tez orada baholash natijasini e\'lon qilamiz!',
    links: {
      self: `${req.protocol}://${req.get('host')}/api/modals/trade/${trade.id}`,
      list: `${req.protocol}://${req.get('host')}/api/modals/trade`
    },
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// GET /api/trade - Get all trade requests (admin)
router.get('/trade', async (req, res) => {
  const trades = await storage.find('trade');
  
  res.json({
    success: true,
    status: 'ok',
    data: {
      trades: trades
    },
    message: `${trades.length} ta almashtirish so'rovi topildi`,
    links: {
      self: `${req.protocol}://${req.get('host')}${req.originalUrl}`,
      create: `${req.protocol}://${req.get('host')}/api/modals/trade`
    },
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

export default router;
