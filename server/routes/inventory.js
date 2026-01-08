// Inventory management system
const express = require('express');
const router = express.Router();

// In-memory inventory storage
let inventory = new Map();
let inventoryLogs = new Map();
let logCounter = 1;

// Initialize inventory for seed data
const phonesSeedData = require('../data/phones-seed');

// Initialize inventory with seed data
function initializeInventory() {
  phonesSeedData.forEach(phone => {
    inventory.set(phone._id, {
      phoneId: phone._id,
      currentStock: Math.floor(Math.random() * 100) + 10, // Random stock 10-110
      reservedStock: 0,
      minStockLevel: 5,
      maxStockLevel: 200,
      reorderPoint: 20,
      lastRestocked: new Date(),
      supplier: getRandomSupplier(),
      location: getRandomLocation(),
      cost: Math.round(phone.price * 0.6), // 60% of selling price
      updatedAt: new Date()
    });
  });
}

// Get inventory status
router.get('/', (req, res) => {
  const { lowStock, outOfStock, phoneId, location, page = 1, limit = 20 } = req.query;
  
  let inventoryItems = Array.from(inventory.values());
  
  // Filters
  if (lowStock === 'true') {
    inventoryItems = inventoryItems.filter(item => 
      item.currentStock <= item.reorderPoint
    );
  }
  
  if (outOfStock === 'true') {
    inventoryItems = inventoryItems.filter(item => item.currentStock === 0);
  }
  
  if (phoneId) {
    inventoryItems = inventoryItems.filter(item => item.phoneId === phoneId);
  }
  
  if (location) {
    inventoryItems = inventoryItems.filter(item => 
      item.location.toLowerCase().includes(location.toLowerCase())
    );
  }
  
  // Sort by current stock (lowest first for attention)
  inventoryItems.sort((a, b) => a.currentStock - b.currentStock);
  
  // Pagination
  const startIndex = (parseInt(page) - 1) * parseInt(limit);
  const endIndex = startIndex + parseInt(limit);
  const paginatedItems = inventoryItems.slice(startIndex, endIndex);
  
  res.json({
    inventory: paginatedItems,
    summary: {
      totalItems: inventoryItems.length,
      lowStockItems: inventoryItems.filter(item => 
        item.currentStock <= item.reorderPoint
      ).length,
      outOfStockItems: inventoryItems.filter(item => item.currentStock === 0).length,
      totalValue: inventoryItems.reduce((sum, item) => 
        sum + (item.currentStock * item.cost), 0
      )
    },
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: inventoryItems.length,
      pages: Math.ceil(inventoryItems.length / parseInt(limit))
    }
  });
});

// Get specific phone inventory
router.get('/phone/:phoneId', (req, res) => {
  const { phoneId } = req.params;
  
  const item = inventory.get(phoneId);
  if (!item) {
    return res.status(404).json({ error: 'Phone not found in inventory' });
  }
  
  // Get recent logs for this phone
  const recentLogs = Array.from(inventoryLogs.values())
    .filter(log => log.phoneId === phoneId)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 10);
  
  res.json({
    inventory: item,
    recentActivity: recentLogs,
    status: getStockStatus(item)
  });
});

// Update stock levels
router.put('/phone/:phoneId/stock', (req, res) => {
  const { phoneId } = req.params;
  const { 
    quantity, 
    type, // 'restock', 'sale', 'return', 'adjustment', 'reserve', 'release'
    reason,
    cost,
    supplier 
  } = req.body;
  
  if (!quantity || !type) {
    return res.status(400).json({ 
      error: 'Quantity and type are required' 
    });
  }
  
  const validTypes = ['restock', 'sale', 'return', 'adjustment', 'reserve', 'release'];
  if (!validTypes.includes(type)) {
    return res.status(400).json({ 
      error: 'Invalid type',
      validTypes 
    });
  }
  
  let item = inventory.get(phoneId);
  if (!item) {
    // Create new inventory item if doesn't exist
    item = {
      phoneId,
      currentStock: 0,
      reservedStock: 0,
      minStockLevel: 5,
      maxStockLevel: 200,
      reorderPoint: 20,
      lastRestocked: new Date(),
      supplier: supplier || 'Unknown',
      location: 'Main Warehouse',
      cost: cost || 0,
      updatedAt: new Date()
    };
  }
  
  const previousStock = item.currentStock;
  const previousReserved = item.reservedStock;
  
  // Update stock based on type
  switch (type) {
    case 'restock':
      item.currentStock += parseInt(quantity);
      item.lastRestocked = new Date();
      if (cost) item.cost = cost;
      if (supplier) item.supplier = supplier;
      break;
    case 'sale':
      if (item.currentStock < parseInt(quantity)) {
        return res.status(400).json({ error: 'Insufficient stock' });
      }
      item.currentStock -= parseInt(quantity);
      break;
    case 'return':
      item.currentStock += parseInt(quantity);
      break;
    case 'adjustment':
      item.currentStock = parseInt(quantity);
      break;
    case 'reserve':
      if (item.currentStock < parseInt(quantity)) {
        return res.status(400).json({ error: 'Insufficient stock to reserve' });
      }
      item.currentStock -= parseInt(quantity);
      item.reservedStock += parseInt(quantity);
      break;
    case 'release':
      if (item.reservedStock < parseInt(quantity)) {
        return res.status(400).json({ error: 'Insufficient reserved stock' });
      }
      item.reservedStock -= parseInt(quantity);
      item.currentStock += parseInt(quantity);
      break;
  }
  
  item.updatedAt = new Date();
  inventory.set(phoneId, item);
  
  // Log the transaction
  const logId = `log_${logCounter++}`;
  const log = {
    logId,
    phoneId,
    type,
    quantity: parseInt(quantity),
    previousStock,
    newStock: item.currentStock,
    previousReserved,
    newReserved: item.reservedStock,
    reason: reason || '',
    cost: cost || item.cost,
    supplier: supplier || item.supplier,
    timestamp: new Date()
  };
  
  inventoryLogs.set(logId, log);
  
  res.json({
    inventory: item,
    log,
    status: getStockStatus(item),
    message: 'Stock updated successfully'
  });
});

// Set reorder levels
router.put('/phone/:phoneId/reorder-levels', (req, res) => {
  const { phoneId } = req.params;
  const { minStockLevel, maxStockLevel, reorderPoint } = req.body;
  
  const item = inventory.get(phoneId);
  if (!item) {
    return res.status(404).json({ error: 'Phone not found in inventory' });
  }
  
  if (minStockLevel !== undefined) item.minStockLevel = parseInt(minStockLevel);
  if (maxStockLevel !== undefined) item.maxStockLevel = parseInt(maxStockLevel);
  if (reorderPoint !== undefined) item.reorderPoint = parseInt(reorderPoint);
  
  item.updatedAt = new Date();
  inventory.set(phoneId, item);
  
  res.json({
    inventory: item,
    message: 'Reorder levels updated successfully'
  });
});

// Get inventory alerts
router.get('/alerts', (req, res) => {
  const alerts = [];
  
  Array.from(inventory.values()).forEach(item => {
    // Low stock alert
    if (item.currentStock <= item.reorderPoint && item.currentStock > 0) {
      alerts.push({
        type: 'low_stock',
        phoneId: item.phoneId,
        currentStock: item.currentStock,
        reorderPoint: item.reorderPoint,
        severity: 'warning',
        message: `Stock is running low (${item.currentStock} remaining)`
      });
    }
    
    // Out of stock alert
    if (item.currentStock === 0) {
      alerts.push({
        type: 'out_of_stock',
        phoneId: item.phoneId,
        severity: 'critical',
        message: 'Product is out of stock'
      });
    }
    
    // Overstock alert
    if (item.currentStock > item.maxStockLevel) {
      alerts.push({
        type: 'overstock',
        phoneId: item.phoneId,
        currentStock: item.currentStock,
        maxStockLevel: item.maxStockLevel,
        severity: 'info',
        message: `Stock exceeds maximum level (${item.currentStock}/${item.maxStockLevel})`
      });
    }
  });
  
  // Sort by severity
  const severityOrder = { critical: 3, warning: 2, info: 1 };
  alerts.sort((a, b) => severityOrder[b.severity] - severityOrder[a.severity]);
  
  res.json({
    alerts,
    summary: {
      total: alerts.length,
      critical: alerts.filter(a => a.severity === 'critical').length,
      warning: alerts.filter(a => a.severity === 'warning').length,
      info: alerts.filter(a => a.severity === 'info').length
    }
  });
});

// Get inventory logs
router.get('/logs', (req, res) => {
  const { phoneId, type, limit = 50, page = 1 } = req.query;
  
  let logs = Array.from(inventoryLogs.values());
  
  if (phoneId) {
    logs = logs.filter(log => log.phoneId === phoneId);
  }
  
  if (type) {
    logs = logs.filter(log => log.type === type);
  }
  
  // Sort by timestamp (newest first)
  logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  
  // Pagination
  const startIndex = (parseInt(page) - 1) * parseInt(limit);
  const endIndex = startIndex + parseInt(limit);
  const paginatedLogs = logs.slice(startIndex, endIndex);
  
  res.json({
    logs: paginatedLogs,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: logs.length,
      pages: Math.ceil(logs.length / parseInt(limit))
    }
  });
});

// Generate reorder report
router.get('/reorder-report', (req, res) => {
  const reorderItems = Array.from(inventory.values())
    .filter(item => item.currentStock <= item.reorderPoint)
    .map(item => ({
      phoneId: item.phoneId,
      currentStock: item.currentStock,
      reorderPoint: item.reorderPoint,
      suggestedOrderQuantity: item.maxStockLevel - item.currentStock,
      estimatedCost: (item.maxStockLevel - item.currentStock) * item.cost,
      supplier: item.supplier,
      priority: item.currentStock === 0 ? 'urgent' : 'normal'
    }))
    .sort((a, b) => a.currentStock - b.currentStock);
  
  const totalEstimatedCost = reorderItems.reduce((sum, item) => 
    sum + item.estimatedCost, 0
  );
  
  res.json({
    reorderItems,
    summary: {
      totalItems: reorderItems.length,
      urgentItems: reorderItems.filter(item => item.priority === 'urgent').length,
      totalEstimatedCost: Math.round(totalEstimatedCost * 100) / 100
    },
    generatedAt: new Date()
  });
});

// Initialize inventory on first load
if (inventory.size === 0) {
  initializeInventory();
}

// Helper functions
function getStockStatus(item) {
  if (item.currentStock === 0) return 'out_of_stock';
  if (item.currentStock <= item.reorderPoint) return 'low_stock';
  if (item.currentStock > item.maxStockLevel) return 'overstock';
  return 'in_stock';
}

function getRandomSupplier() {
  const suppliers = ['Apple Inc.', 'Samsung Electronics', 'Google LLC', 'OnePlus', 'Xiaomi Corp.'];
  return suppliers[Math.floor(Math.random() * suppliers.length)];
}

function getRandomLocation() {
  const locations = ['Main Warehouse', 'Store A', 'Store B', 'Distribution Center'];
  return locations[Math.floor(Math.random() * locations.length)];
}

module.exports = router;