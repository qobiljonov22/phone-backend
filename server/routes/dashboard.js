// Admin dashboard with comprehensive metrics
import express from 'express';
const router = express.Router();

// Main dashboard overview
router.get('/overview', (req, res) => {
  const { period = '7d' } = req.query;
  
  const overview = {
    period,
    metrics: {
      totalRevenue: {
        current: 125000,
        previous: 108000,
        change: 15.7,
        trend: 'up'
      },
      totalOrders: {
        current: 342,
        previous: 298,
        change: 14.8,
        trend: 'up'
      },
      totalCustomers: {
        current: 1250,
        previous: 1180,
        change: 5.9,
        trend: 'up'
      },
      averageOrderValue: {
        current: 365,
        previous: 362,
        change: 0.8,
        trend: 'up'
      },
      conversionRate: {
        current: 2.8,
        previous: 2.3,
        change: 21.7,
        trend: 'up'
      },
      inventoryValue: {
        current: 450000,
        previous: 420000,
        change: 7.1,
        trend: 'up'
      }
    },
    quickStats: {
      activeUsers: 156,
      pendingOrders: 23,
      lowStockItems: 8,
      unreadNotifications: 12,
      todayRevenue: 18500,
      todayOrders: 47
    },
    recentActivity: [
      {
        type: 'order',
        message: 'New order #ORD-1045 placed',
        amount: 999,
        timestamp: new Date(Date.now() - 5 * 60 * 1000)
      },
      {
        type: 'user',
        message: 'New user registered: john.doe@email.com',
        timestamp: new Date(Date.now() - 12 * 60 * 1000)
      },
      {
        type: 'inventory',
        message: 'iPhone 15 Pro stock is running low (5 remaining)',
        timestamp: new Date(Date.now() - 18 * 60 * 1000)
      },
      {
        type: 'review',
        message: 'New 5-star review for Galaxy S24 Ultra',
        timestamp: new Date(Date.now() - 25 * 60 * 1000)
      }
    ],
    topProducts: [
      {
        phoneId: 'iphone-15-pro-128',
        name: 'iPhone 15 Pro 128GB',
        sales: 45,
        revenue: 44955,
        trend: 'up'
      },
      {
        phoneId: 'galaxy-s24-ultra-512',
        name: 'Galaxy S24 Ultra 512GB',
        sales: 28,
        revenue: 36372,
        trend: 'up'
      },
      {
        phoneId: 'pixel-8-pro-256',
        name: 'Pixel 8 Pro 256GB',
        sales: 22,
        revenue: 21978,
        trend: 'stable'
      }
    ],
    alerts: [
      {
        type: 'critical',
        message: 'Pixel 8 Pro is out of stock',
        action: 'Restock now'
      },
      {
        type: 'warning',
        message: '3 orders pending for more than 24 hours',
        action: 'Review orders'
      },
      {
        type: 'info',
        message: 'Monthly sales report is ready',
        action: 'View report'
      }
    ],
    generatedAt: new Date()
  };
  
  res.json(overview);
});

// Sales dashboard
router.get('/sales', (req, res) => {
  const { period = '30d', groupBy = 'day' } = req.query;
  
  const salesDashboard = {
    period,
    groupBy,
    summary: {
      totalSales: 125000,
      totalOrders: 342,
      averageOrderValue: 365,
      topSellingDay: 'Friday',
      bestPerformingHour: '14:00-15:00'
    },
    chartData: {
      salesByDay: generateTimeSeriesData(30, 'sales'),
      ordersByDay: generateTimeSeriesData(30, 'orders'),
      salesByHour: generateHourlyData(),
      salesByCategory: [
        { category: 'Flagship', sales: 75000, percentage: 60 },
        { category: 'Mid-range', sales: 37500, percentage: 30 },
        { category: 'Budget', sales: 12500, percentage: 10 }
      ]
    },
    topPerformers: {
      products: [
        { name: 'iPhone 15 Pro', sales: 44955, units: 45 },
        { name: 'Galaxy S24 Ultra', sales: 36372, units: 28 },
        { name: 'Pixel 8 Pro', sales: 21978, units: 22 }
      ],
      brands: [
        { brand: 'iPhone', sales: 67500, percentage: 54 },
        { brand: 'Samsung', sales: 37500, percentage: 30 },
        { brand: 'Google', sales: 20000, percentage: 16 }
      ],
      regions: [
        { region: 'North America', sales: 62500, percentage: 50 },
        { region: 'Europe', sales: 37500, percentage: 30 },
        { region: 'Asia', sales: 25000, percentage: 20 }
      ]
    },
    trends: {
      weekOverWeek: 12.5,
      monthOverMonth: 8.3,
      yearOverYear: 24.7
    },
    generatedAt: new Date()
  };
  
  res.json(salesDashboard);
});

// Inventory dashboard
router.get('/inventory', (req, res) => {
  const inventoryDashboard = {
    summary: {
      totalItems: 156,
      totalValue: 450000,
      lowStockItems: 8,
      outOfStockItems: 3,
      overstockItems: 2
    },
    stockLevels: {
      healthy: 143,
      low: 8,
      critical: 3,
      overstock: 2
    },
    topMovers: {
      fastMoving: [
        { phoneId: 'iphone-15-pro-128', name: 'iPhone 15 Pro', velocity: 15.2 },
        { phoneId: 'galaxy-s24-128', name: 'Galaxy S24', velocity: 12.8 },
        { phoneId: 'pixel-8-128', name: 'Pixel 8', velocity: 9.5 }
      ],
      slowMoving: [
        { phoneId: 'xiaomi-14-256', name: 'Xiaomi 14', velocity: 1.2 },
        { phoneId: 'oneplus-12-256', name: 'OnePlus 12', velocity: 2.1 }
      ]
    },
    reorderAlerts: [
      {
        phoneId: 'pixel-8-pro-256',
        name: 'Pixel 8 Pro 256GB',
        currentStock: 0,
        reorderPoint: 5,
        suggestedOrder: 25,
        priority: 'urgent'
      },
      {
        phoneId: 'iphone-15-128',
        name: 'iPhone 15 128GB',
        currentStock: 3,
        reorderPoint: 10,
        suggestedOrder: 30,
        priority: 'high'
      }
    ],
    valueAnalysis: {
      totalInventoryValue: 450000,
      averageItemValue: 2885,
      highValueItems: 12,
      lowValueItems: 45
    },
    turnoverRates: {
      overall: 4.2,
      byCategory: [
        { category: 'Flagship', turnover: 5.8 },
        { category: 'Mid-range', turnover: 3.9 },
        { category: 'Budget', turnover: 2.1 }
      ]
    },
    generatedAt: new Date()
  };
  
  res.json(inventoryDashboard);
});

// Customer dashboard
router.get('/customers', (req, res) => {
  const { period = '30d' } = req.query;
  
  const customerDashboard = {
    period,
    summary: {
      totalCustomers: 1250,
      newCustomers: 85,
      activeCustomers: 420,
      returningCustomers: 320,
      churnRate: 5.2
    },
    demographics: {
      ageGroups: [
        { group: '18-25', count: 312, percentage: 25 },
        { group: '26-35', count: 437, percentage: 35 },
        { group: '36-45', count: 275, percentage: 22 },
        { group: '46-55', count: 150, percentage: 12 },
        { group: '55+', count: 76, percentage: 6 }
      ],
      genderDistribution: {
        male: 52,
        female: 45,
        other: 3
      },
      topLocations: [
        { city: 'New York', customers: 180 },
        { city: 'Los Angeles', customers: 145 },
        { city: 'Chicago', customers: 120 },
        { city: 'Houston', customers: 95 }
      ]
    },
    behavior: {
      averageOrderValue: 365,
      averageOrdersPerCustomer: 2.3,
      customerLifetimeValue: 850,
      repeatPurchaseRate: 34.5,
      averageTimeBetweenOrders: '45 days'
    },
    segments: [
      {
        name: 'VIP Customers',
        count: 45,
        criteria: 'Orders > $2000',
        averageValue: 2850,
        percentage: 3.6
      },
      {
        name: 'Regular Customers',
        count: 320,
        criteria: '2+ orders',
        averageValue: 650,
        percentage: 25.6
      },
      {
        name: 'New Customers',
        count: 885,
        criteria: '1 order only',
        averageValue: 285,
        percentage: 70.8
      }
    ],
    satisfaction: {
      averageRating: 4.6,
      npsScore: 72,
      reviewsCount: 1250,
      complaintRate: 2.1
    },
    generatedAt: new Date()
  };
  
  res.json(customerDashboard);
});

// Marketing dashboard
router.get('/marketing', (req, res) => {
  const { period = '30d' } = req.query;
  
  const marketingDashboard = {
    period,
    campaigns: {
      active: 3,
      total: 12,
      totalSpend: 15000,
      totalRevenue: 85000,
      roi: 466.7
    },
    channels: [
      {
        channel: 'Organic Search',
        visitors: 4500,
        conversions: 126,
        conversionRate: 2.8,
        revenue: 45900
      },
      {
        channel: 'Social Media',
        visitors: 2800,
        conversions: 84,
        conversionRate: 3.0,
        revenue: 30600
      },
      {
        channel: 'Email Marketing',
        visitors: 1200,
        conversions: 48,
        conversionRate: 4.0,
        revenue: 17500
      },
      {
        channel: 'Paid Ads',
        visitors: 1800,
        conversions: 36,
        conversionRate: 2.0,
        revenue: 13100
      }
    ],
    topKeywords: [
      { keyword: 'iphone 15 pro', searches: 1250, ranking: 3 },
      { keyword: 'samsung galaxy s24', searches: 980, ranking: 2 },
      { keyword: 'best smartphone 2024', searches: 750, ranking: 5 },
      { keyword: 'pixel 8 pro review', searches: 620, ranking: 4 }
    ],
    socialMedia: {
      followers: 15420,
      engagement: 4.2,
      mentions: 340,
      sentiment: 78.5
    },
    emailMarketing: {
      subscribers: 8500,
      openRate: 24.5,
      clickRate: 3.8,
      unsubscribeRate: 0.5
    },
    generatedAt: new Date()
  };
  
  res.json(marketingDashboard);
});

// Performance dashboard
router.get('/performance', (req, res) => {
  const performanceDashboard = {
    website: {
      uptime: 99.95,
      averageLoadTime: 1.2,
      pageViews: 25420,
      uniqueVisitors: 8750,
      bounceRate: 35.2,
      pagesPerSession: 3.4
    },
    api: {
      totalRequests: 125000,
      averageResponseTime: 145,
      errorRate: 0.8,
      uptime: 99.98,
      peakRps: 450
    },
    database: {
      connectionPool: 85,
      queryTime: 23,
      slowQueries: 12,
      cacheHitRate: 94.5
    },
    server: {
      cpuUsage: 45,
      memoryUsage: 68,
      diskUsage: 34,
      networkIO: 125
    },
    errors: {
      total: 23,
      critical: 1,
      warnings: 8,
      info: 14
    },
    generatedAt: new Date()
  };
  
  res.json(performanceDashboard);
});

// Helper functions
function generateTimeSeriesData(days, type) {
  const data = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    const value = type === 'sales' 
      ? Math.floor(Math.random() * 5000) + 1000
      : Math.floor(Math.random() * 20) + 5;
    
    data.push({
      date: date.toISOString().split('T')[0],
      value
    });
  }
  return data;
}

function generateHourlyData() {
  const data = [];
  for (let hour = 0; hour < 24; hour++) {
    data.push({
      hour: `${hour.toString().padStart(2, '0')}:00`,
      sales: Math.floor(Math.random() * 2000) + 200
    });
  }
  return data;
}

export default router;