// Promotions and discounts system
const express = require('express');
const router = express.Router();

// In-memory promotions storage
let promotions = new Map();
let promoCounter = 1;

// Get active promotions
router.get('/active', (req, res) => {
  const now = new Date();
  const activePromotions = Array.from(promotions.values())
    .filter(promo => 
      promo.isActive && 
      new Date(promo.startDate) <= now && 
      new Date(promo.endDate) >= now
    )
    .sort((a, b) => b.discountPercent - a.discountPercent);
  
  res.json({
    promotions: activePromotions,
    count: activePromotions.length
  });
});

// Get all promotions
router.get('/', (req, res) => {
  const { status, type, limit = 20, page = 1 } = req.query;
  
  let allPromotions = Array.from(promotions.values());
  
  // Filter by status
  if (status === 'active') {
    const now = new Date();
    allPromotions = allPromotions.filter(promo => 
      promo.isActive && 
      new Date(promo.startDate) <= now && 
      new Date(promo.endDate) >= now
    );
  } else if (status === 'expired') {
    const now = new Date();
    allPromotions = allPromotions.filter(promo => 
      new Date(promo.endDate) < now
    );
  } else if (status === 'upcoming') {
    const now = new Date();
    allPromotions = allPromotions.filter(promo => 
      new Date(promo.startDate) > now
    );
  }
  
  // Filter by type
  if (type) {
    allPromotions = allPromotions.filter(promo => promo.type === type);
  }
  
  // Sort by creation date (newest first)
  allPromotions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
  // Pagination
  const startIndex = (parseInt(page) - 1) * parseInt(limit);
  const endIndex = startIndex + parseInt(limit);
  const paginatedPromotions = allPromotions.slice(startIndex, endIndex);
  
  res.json({
    promotions: paginatedPromotions,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: allPromotions.length,
      pages: Math.ceil(allPromotions.length / parseInt(limit))
    }
  });
});

// Create promotion
router.post('/', (req, res) => {
  const {
    title,
    description,
    type, // 'percentage', 'fixed_amount', 'buy_one_get_one', 'free_shipping'
    discountPercent,
    discountAmount,
    minOrderAmount,
    maxDiscountAmount,
    applicablePhones = [], // empty array means all phones
    applicableBrands = [], // empty array means all brands
    promoCode,
    startDate,
    endDate,
    usageLimit,
    isActive = true
  } = req.body;
  
  if (!title || !description || !type || !startDate || !endDate) {
    return res.status(400).json({ 
      error: 'Title, description, type, start date, and end date are required' 
    });
  }
  
  const validTypes = ['percentage', 'fixed_amount', 'buy_one_get_one', 'free_shipping'];
  if (!validTypes.includes(type)) {
    return res.status(400).json({ 
      error: 'Invalid promotion type',
      validTypes 
    });
  }
  
  if (type === 'percentage' && (!discountPercent || discountPercent <= 0 || discountPercent > 100)) {
    return res.status(400).json({ error: 'Valid discount percentage (1-100) is required' });
  }
  
  if (type === 'fixed_amount' && (!discountAmount || discountAmount <= 0)) {
    return res.status(400).json({ error: 'Valid discount amount is required' });
  }
  
  const promotionId = `promo_${promoCounter++}`;
  const promotion = {
    promotionId,
    title,
    description,
    type,
    discountPercent: discountPercent || 0,
    discountAmount: discountAmount || 0,
    minOrderAmount: minOrderAmount || 0,
    maxDiscountAmount: maxDiscountAmount || null,
    applicablePhones,
    applicableBrands,
    promoCode: promoCode || null,
    startDate: new Date(startDate),
    endDate: new Date(endDate),
    usageLimit: usageLimit || null,
    usageCount: 0,
    isActive,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  promotions.set(promotionId, promotion);
  
  res.status(201).json({
    promotion,
    message: 'Promotion created successfully'
  });
});

// Apply promotion to order
router.post('/apply', (req, res) => {
  const { 
    promoCode, 
    orderTotal, 
    phoneIds = [], 
    brands = [],
    userId 
  } = req.body;
  
  if (!promoCode || !orderTotal) {
    return res.status(400).json({ 
      error: 'Promo code and order total are required' 
    });
  }
  
  // Find promotion by code
  const promotion = Array.from(promotions.values())
    .find(promo => promo.promoCode === promoCode);
  
  if (!promotion) {
    return res.status(404).json({ error: 'Invalid promo code' });
  }
  
  // Check if promotion is active
  const now = new Date();
  if (!promotion.isActive || 
      new Date(promotion.startDate) > now || 
      new Date(promotion.endDate) < now) {
    return res.status(400).json({ error: 'Promotion is not active' });
  }
  
  // Check usage limit
  if (promotion.usageLimit && promotion.usageCount >= promotion.usageLimit) {
    return res.status(400).json({ error: 'Promotion usage limit exceeded' });
  }
  
  // Check minimum order amount
  if (promotion.minOrderAmount && orderTotal < promotion.minOrderAmount) {
    return res.status(400).json({ 
      error: `Minimum order amount of $${promotion.minOrderAmount} required` 
    });
  }
  
  // Check applicable phones
  if (promotion.applicablePhones.length > 0) {
    const hasApplicablePhone = phoneIds.some(phoneId => 
      promotion.applicablePhones.includes(phoneId)
    );
    if (!hasApplicablePhone) {
      return res.status(400).json({ error: 'Promotion not applicable to selected phones' });
    }
  }
  
  // Check applicable brands
  if (promotion.applicableBrands.length > 0) {
    const hasApplicableBrand = brands.some(brand => 
      promotion.applicableBrands.includes(brand)
    );
    if (!hasApplicableBrand) {
      return res.status(400).json({ error: 'Promotion not applicable to selected brands' });
    }
  }
  
  // Calculate discount
  let discountAmount = 0;
  
  switch (promotion.type) {
    case 'percentage':
      discountAmount = (orderTotal * promotion.discountPercent) / 100;
      if (promotion.maxDiscountAmount) {
        discountAmount = Math.min(discountAmount, promotion.maxDiscountAmount);
      }
      break;
    case 'fixed_amount':
      discountAmount = Math.min(promotion.discountAmount, orderTotal);
      break;
    case 'free_shipping':
      discountAmount = 10; // Assume $10 shipping cost
      break;
    case 'buy_one_get_one':
      // This would require more complex logic based on cart items
      discountAmount = orderTotal * 0.5; // Simplified: 50% off
      break;
  }
  
  const finalTotal = Math.max(0, orderTotal - discountAmount);
  
  // Update usage count
  promotion.usageCount += 1;
  promotions.set(promotion.promotionId, promotion);
  
  res.json({
    promotion: {
      promotionId: promotion.promotionId,
      title: promotion.title,
      type: promotion.type,
      promoCode: promotion.promoCode
    },
    discount: {
      amount: Math.round(discountAmount * 100) / 100,
      originalTotal: orderTotal,
      finalTotal: Math.round(finalTotal * 100) / 100,
      savings: Math.round(discountAmount * 100) / 100
    },
    message: 'Promotion applied successfully'
  });
});

// Validate promo code
router.post('/validate', (req, res) => {
  const { promoCode, orderTotal, phoneIds = [], brands = [] } = req.body;
  
  if (!promoCode) {
    return res.status(400).json({ error: 'Promo code is required' });
  }
  
  const promotion = Array.from(promotions.values())
    .find(promo => promo.promoCode === promoCode);
  
  if (!promotion) {
    return res.json({ valid: false, message: 'Invalid promo code' });
  }
  
  const now = new Date();
  const isActive = promotion.isActive && 
    new Date(promotion.startDate) <= now && 
    new Date(promotion.endDate) >= now;
  
  if (!isActive) {
    return res.json({ valid: false, message: 'Promotion is not active' });
  }
  
  if (promotion.usageLimit && promotion.usageCount >= promotion.usageLimit) {
    return res.json({ valid: false, message: 'Promotion usage limit exceeded' });
  }
  
  if (orderTotal && promotion.minOrderAmount && orderTotal < promotion.minOrderAmount) {
    return res.json({ 
      valid: false, 
      message: `Minimum order amount of $${promotion.minOrderAmount} required` 
    });
  }
  
  res.json({
    valid: true,
    promotion: {
      title: promotion.title,
      description: promotion.description,
      type: promotion.type,
      discountPercent: promotion.discountPercent,
      discountAmount: promotion.discountAmount,
      minOrderAmount: promotion.minOrderAmount
    },
    message: 'Promo code is valid'
  });
});

// Update promotion
router.put('/:promotionId', (req, res) => {
  const { promotionId } = req.params;
  const updateData = req.body;
  
  const promotion = promotions.get(promotionId);
  if (!promotion) {
    return res.status(404).json({ error: 'Promotion not found' });
  }
  
  // Update allowed fields
  const allowedFields = [
    'title', 'description', 'discountPercent', 'discountAmount',
    'minOrderAmount', 'maxDiscountAmount', 'endDate', 'isActive'
  ];
  
  allowedFields.forEach(field => {
    if (updateData[field] !== undefined) {
      promotion[field] = updateData[field];
    }
  });
  
  promotion.updatedAt = new Date();
  promotions.set(promotionId, promotion);
  
  res.json({
    promotion,
    message: 'Promotion updated successfully'
  });
});

// Delete promotion
router.delete('/:promotionId', (req, res) => {
  const { promotionId } = req.params;
  
  const promotion = promotions.get(promotionId);
  if (!promotion) {
    return res.status(404).json({ error: 'Promotion not found' });
  }
  
  promotions.delete(promotionId);
  
  res.json({
    message: 'Promotion deleted successfully'
  });
});

// Get promotion statistics
router.get('/stats', (req, res) => {
  const allPromotions = Array.from(promotions.values());
  const now = new Date();
  
  const stats = {
    total: allPromotions.length,
    active: allPromotions.filter(p => 
      p.isActive && 
      new Date(p.startDate) <= now && 
      new Date(p.endDate) >= now
    ).length,
    expired: allPromotions.filter(p => new Date(p.endDate) < now).length,
    upcoming: allPromotions.filter(p => new Date(p.startDate) > now).length,
    totalUsage: allPromotions.reduce((sum, p) => sum + p.usageCount, 0),
    byType: {
      percentage: allPromotions.filter(p => p.type === 'percentage').length,
      fixed_amount: allPromotions.filter(p => p.type === 'fixed_amount').length,
      buy_one_get_one: allPromotions.filter(p => p.type === 'buy_one_get_one').length,
      free_shipping: allPromotions.filter(p => p.type === 'free_shipping').length
    },
    mostUsed: allPromotions
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, 5)
      .map(p => ({
        promotionId: p.promotionId,
        title: p.title,
        usageCount: p.usageCount
      }))
  };
  
  res.json(stats);
});

module.exports = router;