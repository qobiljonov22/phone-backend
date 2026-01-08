// Analytics and reporting functionality
const express = require('express');
const router = express.Router();

// In-memory analytics storage
let analytics = {
  pageViews: new Map(),
  phoneViews: new Map(),
  searchQueries: new Map(),
  userSessions: new Map()
};

// Track page view
router.post('/track/pageview', (req, res) => {
  const { page, userId, sessionId, timestamp = new Date() } = req.body;
  
  if (!page) {
    return res.status(400).json({ error: 'Page is required' });
  }
  
  const viewId = `view_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const pageView = {
    viewId,
    page,
    userId: userId || 'anonymous',
    sessionId: sessionId || 'unknown',
    timestamp: new Date(timestamp),
    userAgent: req.headers['user-agent'] || '',
    ip: req.ip || req.connection.remoteAddress
  };
  
  analytics.pageViews.set(viewId, pageView);
  
  res.json({ message: 'Page view tracked successfully' });
});

// Track phone view
router.post('/track/phone-view', (req, res) => {
  const { phoneId, userId, sessionId, timestamp = new Date() } = req.body;
  
  if (!phoneId) {
    return res.status(400).json({ error: 'Phone ID is required' });
  }
  
  const viewId = `phone_view_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const phoneView = {
    viewId,
    phoneId,
    userId: userId || 'anonymous',
    sessionId: sessionId || 'unknown',
    timestamp: new Date(timestamp),
    userAgent: req.headers['user-agent'] || '',
    ip: req.ip || req.connection.remoteAddress
  };
  
  analytics.phoneViews.set(viewId, phoneView);
  
  res.json({ message: 'Phone view tracked successfully' });
});

// Track search query
router.post('/track/search', (req, res) => {
  const { query, results, userId, sessionId, timestamp = new Date() } = req.body;
  
  if (!query) {
    return res.status(400).json({ error: 'Search query is required' });
  }
  
  const searchId = `search_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const searchQuery = {
    searchId,
    query: query.toLowerCase(),
    results: results || 0,
    userId: userId || 'anonymous',
    sessionId: sessionId || 'unknown',
    timestamp: new Date(timestamp)
  };
  
  analytics.searchQueries.set(searchId, searchQuery);
  
  res.json({ message: 'Search query tracked successfully' });
});

// Get popular phones
router.get('/popular-phones', (req, res) => {
  const { limit = 10, period = '7d' } = req.query;
  
  const periodMs = getPeriodInMs(period);
  const cutoffDate = new Date(Date.now() - periodMs);
  
  // Count phone views within the period
  const phoneViewCounts = new Map();
  
  Array.from(analytics.phoneViews.values())
    .filter(view => view.timestamp >= cutoffDate)
    .forEach(view => {
      const count = phoneViewCounts.get(view.phoneId) || 0;
      phoneViewCounts.set(view.phoneId, count + 1);
    });
  
  // Sort by view count
  const popularPhones = Array.from(phoneViewCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, parseInt(limit))
    .map(([phoneId, views]) => ({ phoneId, views }));
  
  res.json({
    popularPhones,
    period,
    generatedAt: new Date()
  });
});

// Get search analytics
router.get('/search-analytics', (req, res) => {
  const { limit = 20, period = '7d' } = req.query;
  
  const periodMs = getPeriodInMs(period);
  const cutoffDate = new Date(Date.now() - periodMs);
  
  // Count search queries within the period
  const queryCount = new Map();
  const zeroResultQueries = [];
  
  Array.from(analytics.searchQueries.values())
    .filter(search => search.timestamp >= cutoffDate)
    .forEach(search => {
      const count = queryCount.get(search.query) || 0;
      queryCount.set(search.query, count + 1);
      
      if (search.results === 0) {
        zeroResultQueries.push(search.query);
      }
    });
  
  // Sort by frequency
  const topQueries = Array.from(queryCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, parseInt(limit))
    .map(([query, count]) => ({ query, count }));
  
  // Count zero result queries
  const zeroResultCount = new Map();
  zeroResultQueries.forEach(query => {
    const count = zeroResultCount.get(query) || 0;
    zeroResultCount.set(query, count + 1);
  });
  
  const topZeroResultQueries = Array.from(zeroResultCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([query, count]) => ({ query, count }));
  
  res.json({
    topQueries,
    topZeroResultQueries,
    totalSearches: Array.from(analytics.searchQueries.values())
      .filter(search => search.timestamp >= cutoffDate).length,
    period,
    generatedAt: new Date()
  });
});

// Get traffic analytics
router.get('/traffic', (req, res) => {
  const { period = '7d' } = req.query;
  
  const periodMs = getPeriodInMs(period);
  const cutoffDate = new Date(Date.now() - periodMs);
  
  const recentViews = Array.from(analytics.pageViews.values())
    .filter(view => view.timestamp >= cutoffDate);
  
  // Group by day
  const dailyViews = new Map();
  recentViews.forEach(view => {
    const day = view.timestamp.toISOString().split('T')[0];
    const count = dailyViews.get(day) || 0;
    dailyViews.set(day, count + 1);
  });
  
  // Count unique users
  const uniqueUsers = new Set(recentViews.map(view => view.userId)).size;
  
  // Count page views by page
  const pageViews = new Map();
  recentViews.forEach(view => {
    const count = pageViews.get(view.page) || 0;
    pageViews.set(view.page, count + 1);
  });
  
  const topPages = Array.from(pageViews.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([page, views]) => ({ page, views }));
  
  res.json({
    totalViews: recentViews.length,
    uniqueUsers,
    dailyViews: Array.from(dailyViews.entries()).map(([date, views]) => ({ date, views })),
    topPages,
    period,
    generatedAt: new Date()
  });
});

// Get conversion analytics
router.get('/conversions', (req, res) => {
  const { period = '7d' } = req.query;
  
  // This would typically integrate with order data
  // For now, return mock conversion data
  
  res.json({
    conversionRate: 2.5, // percentage
    totalVisitors: 1250,
    totalOrders: 31,
    averageOrderValue: 850,
    topConvertingPhones: [
      { phoneId: 'iphone-15-pro-128', conversions: 8, conversionRate: 3.2 },
      { phoneId: 'galaxy-s24-ultra-512', conversions: 6, conversionRate: 2.8 },
      { phoneId: 'pixel-8-pro-256', conversions: 4, conversionRate: 2.1 }
    ],
    period,
    generatedAt: new Date()
  });
});

// Get real-time analytics
router.get('/realtime', (req, res) => {
  const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
  
  const recentViews = Array.from(analytics.pageViews.values())
    .filter(view => view.timestamp >= last24Hours);
  
  const recentPhoneViews = Array.from(analytics.phoneViews.values())
    .filter(view => view.timestamp >= last24Hours);
  
  const recentSearches = Array.from(analytics.searchQueries.values())
    .filter(search => search.timestamp >= last24Hours);
  
  // Active users (last 30 minutes)
  const last30Min = new Date(Date.now() - 30 * 60 * 1000);
  const activeUsers = new Set(
    Array.from(analytics.pageViews.values())
      .filter(view => view.timestamp >= last30Min)
      .map(view => view.userId)
  ).size;
  
  res.json({
    activeUsers,
    last24Hours: {
      pageViews: recentViews.length,
      phoneViews: recentPhoneViews.length,
      searches: recentSearches.length,
      uniqueUsers: new Set(recentViews.map(view => view.userId)).size
    },
    currentHour: {
      pageViews: recentViews.filter(view => 
        view.timestamp >= new Date(Date.now() - 60 * 60 * 1000)
      ).length
    },
    generatedAt: new Date()
  });
});

function getPeriodInMs(period) {
  const periods = {
    '1h': 60 * 60 * 1000,
    '24h': 24 * 60 * 60 * 1000,
    '7d': 7 * 24 * 60 * 60 * 1000,
    '30d': 30 * 24 * 60 * 60 * 1000,
    '90d': 90 * 24 * 60 * 60 * 1000
  };
  
  return periods[period] || periods['7d'];
}

module.exports = router;