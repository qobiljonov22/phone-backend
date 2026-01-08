// Advanced reporting system
const express = require('express');
const router = express.Router();

// Sales report
router.get('/sales', (req, res) => {
  const { 
    startDate, 
    endDate, 
    groupBy = 'day', // day, week, month, year
    phoneId,
    brand 
  } = req.query;
  
  // Mock sales data - in real app, this would come from orders
  const salesData = generateMockSalesData(startDate, endDate, groupBy);
  
  const report = {
    period: {
      startDate: startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      endDate: endDate || new Date().toISOString().split('T')[0],
      groupBy
    },
    summary: {
      totalRevenue: salesData.reduce((sum, item) => sum + item.revenue, 0),
      totalOrders: salesData.reduce((sum, item) => sum + item.orders, 0),
      totalUnits: salesData.reduce((sum, item) => sum + item.units, 0),
      averageOrderValue: 0
    },
    data: salesData,
    topProducts: [
      { phoneId: 'iphone-15-pro-128', revenue: 15000, units: 15 },
      { phoneId: 'galaxy-s24-ultra-512', revenue: 12000, units: 9 },
      { phoneId: 'pixel-8-pro-256', revenue: 8000, units: 8 }
    ],
    generatedAt: new Date()
  };
  
  report.summary.averageOrderValue = report.summary.totalOrders > 0 ? 
    Math.round((report.summary.totalRevenue / report.summary.totalOrders) * 100) / 100 : 0;
  
  res.json(report);
});

// Inventory report
router.get('/inventory', (req, res) => {
  const { includeValuation = true, lowStockOnly = false } = req.query;
  
  // Mock inventory data
  const inventoryData = [
    { phoneId: 'iphone-15-pro-128', stock: 45, cost: 600, value: 27000, status: 'in_stock' },
    { phoneId: 'galaxy-s24-ultra-512', stock: 8, cost: 780, value: 6240, status: 'low_stock' },
    { phoneId: 'pixel-8-pro-256', stock: 0, cost: 600, value: 0, status: 'out_of_stock' },
    { phoneId: 'oneplus-12-256', stock: 25, cost: 480, value: 12000, status: 'in_stock' },
    { phoneId: 'xiaomi-14-256', stock: 12, cost: 420, value: 5040, status: 'low_stock' }
  ];
  
  let filteredData = inventoryData;
  if (lowStockOnly) {
    filteredData = inventoryData.filter(item => 
      item.status === 'low_stock' || item.status === 'out_of_stock'
    );
  }
  
  const report = {
    summary: {
      totalItems: filteredData.length,
      totalValue: filteredData.reduce((sum, item) => sum + item.value, 0),
      inStock: filteredData.filter(item => item.status === 'in_stock').length,
      lowStock: filteredData.filter(item => item.status === 'low_stock').length,
      outOfStock: filteredData.filter(item => item.status === 'out_of_stock').length
    },
    data: filteredData,
    alerts: filteredData.filter(item => 
      item.status === 'low_stock' || item.status === 'out_of_stock'
    ),
    generatedAt: new Date()
  };
  
  res.json(report);
});

// Customer analytics report
router.get('/customers', (req, res) => {
  const { period = '30d' } = req.query;
  
  const report = {
    period,
    summary: {
      totalCustomers: 1250,
      newCustomers: 85,
      returningCustomers: 320,
      customerRetentionRate: 68.5,
      averageLifetimeValue: 1850
    },
    demographics: {
      ageGroups: {
        '18-25': 25,
        '26-35': 35,
        '36-45': 22,
        '46-55': 12,
        '55+': 6
      },
      topLocations: [
        { city: 'New York', customers: 180 },
        { city: 'Los Angeles', customers: 145 },
        { city: 'Chicago', customers: 120 },
        { city: 'Houston', customers: 95 },
        { city: 'Phoenix', customers: 80 }
      ]
    },
    behavior: {
      averageOrdersPerCustomer: 2.3,
      mostPopularBrands: [
        { brand: 'iPhone', percentage: 45 },
        { brand: 'Samsung', percentage: 30 },
        { brand: 'Google', percentage: 15 },
        { brand: 'OnePlus', percentage: 7 },
        { brand: 'Xiaomi', percentage: 3 }
      ],
      purchasePatterns: {
        peakHours: ['10:00-12:00', '14:00-16:00', '19:00-21:00'],
        peakDays: ['Friday', 'Saturday', 'Sunday']
      }
    },
    generatedAt: new Date()
  };
  
  res.json(report);
});

// Financial report
router.get('/financial', (req, res) => {
  const { 
    startDate, 
    endDate, 
    includeProjections = false 
  } = req.query;
  
  const report = {
    period: {
      startDate: startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      endDate: endDate || new Date().toISOString().split('T')[0]
    },
    revenue: {
      total: 125000,
      growth: 15.5, // percentage
      breakdown: {
        iPhone: 56250,
        Samsung: 37500,
        Google: 18750,
        OnePlus: 8750,
        Xiaomi: 3750
      }
    },
    costs: {
      totalCost: 75000,
      breakdown: {
        inventory: 65000,
        shipping: 5000,
        marketing: 3000,
        operations: 2000
      }
    },
    profit: {
      gross: 50000,
      margin: 40, // percentage
      net: 45000,
      netMargin: 36
    },
    taxes: {
      estimated: 5000,
      rate: 10 // percentage
    },
    cashFlow: {
      operating: 48000,
      investing: -15000,
      financing: -5000,
      net: 28000
    },
    generatedAt: new Date()
  };
  
  if (includeProjections === 'true') {
    report.projections = {
      nextMonth: {
        revenue: 135000,
        growth: 8,
        confidence: 85
      },
      nextQuarter: {
        revenue: 400000,
        growth: 12,
        confidence: 75
      }
    };
  }
  
  res.json(report);
});

// Performance metrics report
router.get('/performance', (req, res) => {
  const { period = '7d' } = req.query;
  
  const report = {
    period,
    website: {
      pageViews: 15420,
      uniqueVisitors: 8750,
      bounceRate: 35.2,
      averageSessionDuration: '4:32',
      conversionRate: 2.8,
      topPages: [
        { page: '/phones', views: 4500 },
        { page: '/phones/iphone-15-pro', views: 2100 },
        { page: '/phones/galaxy-s24', views: 1800 },
        { page: '/cart', views: 1200 },
        { page: '/checkout', views: 850 }
      ]
    },
    api: {
      totalRequests: 125000,
      averageResponseTime: 145, // milliseconds
      errorRate: 0.8, // percentage
      uptime: 99.95,
      slowestEndpoints: [
        { endpoint: '/api/phones/search', avgTime: 280 },
        { endpoint: '/api/analytics/traffic', avgTime: 220 },
        { endpoint: '/api/orders', avgTime: 180 }
      ]
    },
    business: {
      orderFulfillmentTime: '2.3 days',
      customerSatisfaction: 4.6, // out of 5
      returnRate: 3.2, // percentage
      supportTickets: 45,
      averageResolutionTime: '6.5 hours'
    },
    generatedAt: new Date()
  };
  
  res.json(report);
});

// Custom report builder
router.post('/custom', (req, res) => {
  const {
    reportName,
    metrics = [],
    filters = {},
    groupBy,
    dateRange
  } = req.body;
  
  if (!reportName || metrics.length === 0) {
    return res.status(400).json({ 
      error: 'Report name and metrics are required' 
    });
  }
  
  // Mock custom report generation
  const report = {
    reportName,
    configuration: {
      metrics,
      filters,
      groupBy,
      dateRange
    },
    data: generateCustomReportData(metrics, filters, groupBy),
    summary: {
      totalRecords: 150,
      dateGenerated: new Date(),
      executionTime: '0.45s'
    },
    exportOptions: {
      formats: ['json', 'csv', 'pdf'],
      downloadUrl: `/api/reports/custom/download/${Date.now()}`
    }
  };
  
  res.json(report);
});

// Export report
router.get('/export/:reportType', (req, res) => {
  const { reportType } = req.params;
  const { format = 'json' } = req.query;
  
  if (!['sales', 'inventory', 'customers', 'financial', 'performance'].includes(reportType)) {
    return res.status(400).json({ error: 'Invalid report type' });
  }
  
  if (!['json', 'csv', 'pdf'].includes(format)) {
    return res.status(400).json({ error: 'Invalid format' });
  }
  
  // Mock export functionality
  const exportData = {
    reportType,
    format,
    downloadUrl: `https://api.example.com/downloads/${reportType}-${Date.now()}.${format}`,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    fileSize: '2.5 MB',
    generatedAt: new Date()
  };
  
  res.json({
    message: 'Report export prepared successfully',
    export: exportData
  });
});

// Scheduled reports
router.get('/scheduled', (req, res) => {
  const scheduledReports = [
    {
      id: 'weekly-sales',
      name: 'Weekly Sales Report',
      type: 'sales',
      schedule: 'weekly',
      nextRun: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      recipients: ['admin@company.com', 'sales@company.com'],
      active: true
    },
    {
      id: 'monthly-inventory',
      name: 'Monthly Inventory Report',
      type: 'inventory',
      schedule: 'monthly',
      nextRun: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      recipients: ['inventory@company.com'],
      active: true
    }
  ];
  
  res.json({ scheduledReports });
});

// Helper functions
function generateMockSalesData(startDate, endDate, groupBy) {
  const data = [];
  const days = 30; // Mock 30 days of data
  
  for (let i = 0; i < days; i++) {
    const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    data.push({
      date: date.toISOString().split('T')[0],
      revenue: Math.floor(Math.random() * 5000) + 1000,
      orders: Math.floor(Math.random() * 20) + 5,
      units: Math.floor(Math.random() * 30) + 10,
      averageOrderValue: 0
    });
  }
  
  // Calculate average order value
  data.forEach(item => {
    item.averageOrderValue = Math.round((item.revenue / item.orders) * 100) / 100;
  });
  
  return data.reverse();
}

function generateCustomReportData(metrics, filters, groupBy) {
  // Mock custom report data generation
  const data = [];
  
  for (let i = 0; i < 10; i++) {
    const record = {};
    
    metrics.forEach(metric => {
      switch (metric) {
        case 'revenue':
          record.revenue = Math.floor(Math.random() * 10000) + 1000;
          break;
        case 'orders':
          record.orders = Math.floor(Math.random() * 50) + 10;
          break;
        case 'customers':
          record.customers = Math.floor(Math.random() * 100) + 20;
          break;
        case 'inventory':
          record.inventory = Math.floor(Math.random() * 200) + 50;
          break;
      }
    });
    
    record.date = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    data.push(record);
  }
  
  return data.reverse();
}

module.exports = router;