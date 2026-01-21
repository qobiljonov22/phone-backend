// Phone comparison functionality
import express from 'express';
const router = express.Router();

// In-memory comparison storage
let comparisons = new Map();
let comparisonCounter = 1;

// Create new comparison
router.post('/', (req, res) => {
  const { phoneIds, userId, comparisonName } = req.body;
  
  if (!Array.isArray(phoneIds) || phoneIds.length < 2 || phoneIds.length > 4) {
    return res.status(400).json({ 
      error: 'Please provide 2-4 phone IDs for comparison' 
    });
  }
  
  const comparisonId = `comp_${comparisonCounter++}`;
  
  // Mock phone data - in real app, fetch from database
  const phones = phoneIds.map(id => getMockPhoneForComparison(id));
  
  const comparison = {
    comparisonId,
    userId: userId || null,
    name: comparisonName || `Comparison ${comparisonCounter - 1}`,
    phones,
    phoneIds,
    createdAt: new Date(),
    lastViewed: new Date(),
    viewCount: 1,
    isPublic: false
  };
  
  // Generate detailed comparison
  comparison.analysis = generateComparisonAnalysis(phones);
  comparison.summary = generateComparisonSummary(phones);
  comparison.recommendations = generateRecommendations(phones);
  
  comparisons.set(comparisonId, comparison);
  
  res.status(201).json({
    comparison,
    message: 'Comparison created successfully'
  });
});

// Get comparison by ID
router.get('/:comparisonId', (req, res) => {
  const { comparisonId } = req.params;
  
  const comparison = comparisons.get(comparisonId);
  if (!comparison) {
    return res.status(404).json({ error: 'Comparison not found' });
  }
  
  // Update view count and last viewed
  comparison.viewCount += 1;
  comparison.lastViewed = new Date();
  comparisons.set(comparisonId, comparison);
  
  res.json({ comparison });
});

// Update comparison (add/remove phones)
router.put('/:comparisonId', (req, res) => {
  const { comparisonId } = req.params;
  const { phoneIds, comparisonName } = req.body;
  
  const comparison = comparisons.get(comparisonId);
  if (!comparison) {
    return res.status(404).json({ error: 'Comparison not found' });
  }
  
  if (phoneIds && Array.isArray(phoneIds)) {
    if (phoneIds.length < 2 || phoneIds.length > 4) {
      return res.status(400).json({ 
        error: 'Please provide 2-4 phone IDs for comparison' 
      });
    }
    
    comparison.phoneIds = phoneIds;
    comparison.phones = phoneIds.map(id => getMockPhoneForComparison(id));
    comparison.analysis = generateComparisonAnalysis(comparison.phones);
    comparison.summary = generateComparisonSummary(comparison.phones);
    comparison.recommendations = generateRecommendations(comparison.phones);
  }
  
  if (comparisonName) {
    comparison.name = comparisonName;
  }
  
  comparison.updatedAt = new Date();
  comparisons.set(comparisonId, comparison);
  
  res.json({
    comparison,
    message: 'Comparison updated successfully'
  });
});

// Delete comparison
router.delete('/:comparisonId', (req, res) => {
  const { comparisonId } = req.params;
  
  const comparison = comparisons.get(comparisonId);
  if (!comparison) {
    return res.status(404).json({ error: 'Comparison not found' });
  }
  
  comparisons.delete(comparisonId);
  
  res.json({
    message: 'Comparison deleted successfully'
  });
});

// Get user's comparisons
router.get('/user/:userId', (req, res) => {
  const { userId } = req.params;
  const { limit = 10, page = 1 } = req.query;
  
  let userComparisons = Array.from(comparisons.values())
    .filter(comp => comp.userId === userId)
    .sort((a, b) => new Date(b.lastViewed) - new Date(a.lastViewed));
  
  // Pagination
  const startIndex = (parseInt(page) - 1) * parseInt(limit);
  const endIndex = startIndex + parseInt(limit);
  const paginatedComparisons = userComparisons.slice(startIndex, endIndex);
  
  res.json({
    comparisons: paginatedComparisons,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: userComparisons.length,
      pages: Math.ceil(userComparisons.length / parseInt(limit))
    }
  });
});

// Get popular comparisons
router.get('/popular/trending', (req, res) => {
  const { limit = 10 } = req.query;
  
  const popularComparisons = Array.from(comparisons.values())
    .filter(comp => comp.isPublic)
    .sort((a, b) => b.viewCount - a.viewCount)
    .slice(0, parseInt(limit))
    .map(comp => ({
      comparisonId: comp.comparisonId,
      name: comp.name,
      phoneIds: comp.phoneIds,
      phones: comp.phones.map(phone => ({
        phoneId: phone.phoneId,
        brand: phone.brand,
        model: phone.model,
        price: phone.price
      })),
      viewCount: comp.viewCount,
      createdAt: comp.createdAt
    }));
  
  res.json({
    popularComparisons,
    total: popularComparisons.length
  });
});

// Share comparison
router.post('/:comparisonId/share', (req, res) => {
  const { comparisonId } = req.params;
  const { isPublic = true, shareMessage } = req.body;
  
  const comparison = comparisons.get(comparisonId);
  if (!comparison) {
    return res.status(404).json({ error: 'Comparison not found' });
  }
  
  comparison.isPublic = isPublic;
  comparison.shareMessage = shareMessage || '';
  comparison.sharedAt = new Date();
  
  const shareUrl = `https://phonestore.com/compare/${comparisonId}`;
  
  comparisons.set(comparisonId, comparison);
  
  res.json({
    shareUrl,
    comparison: {
      comparisonId: comparison.comparisonId,
      name: comparison.name,
      isPublic: comparison.isPublic
    },
    message: 'Comparison shared successfully'
  });
});

// Get comparison analytics
router.get('/:comparisonId/analytics', (req, res) => {
  const { comparisonId } = req.params;
  
  const comparison = comparisons.get(comparisonId);
  if (!comparison) {
    return res.status(404).json({ error: 'Comparison not found' });
  }
  
  const analytics = {
    comparisonId,
    viewCount: comparison.viewCount,
    createdAt: comparison.createdAt,
    lastViewed: comparison.lastViewed,
    phoneCount: comparison.phones.length,
    priceRange: {
      min: Math.min(...comparison.phones.map(p => p.price)),
      max: Math.max(...comparison.phones.map(p => p.price)),
      average: Math.round(comparison.phones.reduce((sum, p) => sum + p.price, 0) / comparison.phones.length)
    },
    brandDistribution: getBrandDistribution(comparison.phones),
    topFeatures: getTopFeatures(comparison.phones),
    winner: comparison.recommendations?.overall?.winner || null,
    generatedAt: new Date()
  };
  
  res.json({ analytics });
});

// Helper functions
function getMockPhoneForComparison(phoneId) {
  const mockPhones = {
    'iphone-15-pro-128': {
      phoneId: 'iphone-15-pro-128',
      brand: 'iPhone',
      model: '15 Pro',
      price: 999,
      storage: '128GB',
      color: 'Natural Titanium',
      display: '6.1-inch Super Retina XDR',
      processor: 'A17 Pro',
      camera: 'Triple 48MP system',
      battery: '3274 mAh',
      os: 'iOS 17',
      weight: '187g',
      rating: 4.8,
      reviews: 1850,
      features: ['Face ID', 'Wireless Charging', 'Water Resistant', 'MagSafe'],
      pros: ['Excellent camera', 'Premium build', 'Great performance'],
      cons: ['Expensive', 'No USB-C'],
      image: 'iphone-15-pro.jpg'
    },
    'galaxy-s24-ultra-512': {
      phoneId: 'galaxy-s24-ultra-512',
      brand: 'Samsung',
      model: 'Galaxy S24 Ultra',
      price: 1299,
      storage: '512GB',
      color: 'Titanium Gray',
      display: '6.8-inch Dynamic AMOLED 2X',
      processor: 'Snapdragon 8 Gen 3',
      camera: 'Quad 200MP system',
      battery: '5000 mAh',
      os: 'Android 14',
      weight: '232g',
      rating: 4.7,
      reviews: 1200,
      features: ['S Pen', 'Wireless Charging', 'Water Resistant', 'Fast Charging'],
      pros: ['S Pen included', 'Large display', 'Excellent camera'],
      cons: ['Heavy', 'Expensive'],
      image: 'galaxy-s24-ultra.jpg'
    },
    'pixel-8-pro-256': {
      phoneId: 'pixel-8-pro-256',
      brand: 'Google',
      model: 'Pixel 8 Pro',
      price: 999,
      storage: '256GB',
      color: 'Bay',
      display: '6.7-inch LTPO OLED',
      processor: 'Google Tensor G3',
      camera: 'Triple 50MP system',
      battery: '5050 mAh',
      os: 'Android 14',
      weight: '213g',
      rating: 4.5,
      reviews: 890,
      features: ['Magic Eraser', 'Wireless Charging', 'Water Resistant', 'Pure Android'],
      pros: ['Pure Android', 'Great AI features', 'Excellent camera'],
      cons: ['Average performance', 'Limited availability'],
      image: 'pixel-8-pro.jpg'
    }
  };
  
  return mockPhones[phoneId] || {
    phoneId,
    brand: 'Unknown',
    model: 'Unknown',
    price: 0,
    storage: 'Unknown',
    rating: 0,
    reviews: 0,
    features: [],
    pros: [],
    cons: []
  };
}

function generateComparisonAnalysis(phones) {
  return {
    price: {
      cheapest: phones.reduce((min, phone) => phone.price < min.price ? phone : min),
      mostExpensive: phones.reduce((max, phone) => phone.price > max.price ? phone : max),
      averagePrice: Math.round(phones.reduce((sum, phone) => sum + phone.price, 0) / phones.length)
    },
    performance: {
      topRated: phones.reduce((max, phone) => phone.rating > max.rating ? phone : max),
      mostReviewed: phones.reduce((max, phone) => phone.reviews > max.reviews ? phone : max)
    },
    features: {
      commonFeatures: getCommonFeatures(phones),
      uniqueFeatures: getUniqueFeatures(phones)
    },
    specifications: {
      displaySizes: phones.map(p => ({ phoneId: p.phoneId, display: p.display })),
      storageOptions: phones.map(p => ({ phoneId: p.phoneId, storage: p.storage })),
      batteryCapacities: phones.map(p => ({ phoneId: p.phoneId, battery: p.battery }))
    }
  };
}

function generateComparisonSummary(phones) {
  return {
    totalPhones: phones.length,
    priceRange: `$${Math.min(...phones.map(p => p.price))} - $${Math.max(...phones.map(p => p.price))}`,
    brands: [...new Set(phones.map(p => p.brand))],
    averageRating: Math.round((phones.reduce((sum, p) => sum + p.rating, 0) / phones.length) * 10) / 10,
    totalReviews: phones.reduce((sum, p) => sum + p.reviews, 0)
  };
}

function generateRecommendations(phones) {
  return {
    overall: {
      winner: phones.reduce((max, phone) => phone.rating > max.rating ? phone : max),
      reason: 'Highest overall rating and user satisfaction'
    },
    bestValue: {
      winner: phones.reduce((best, phone) => {
        const valueScore = phone.rating / (phone.price / 1000);
        const bestScore = best.rating / (best.price / 1000);
        return valueScore > bestScore ? phone : best;
      }),
      reason: 'Best balance of features and price'
    },
    budget: {
      winner: phones.reduce((min, phone) => phone.price < min.price ? phone : min),
      reason: 'Most affordable option'
    },
    premium: {
      winner: phones.reduce((max, phone) => phone.price > max.price ? phone : max),
      reason: 'Most premium features and build quality'
    }
  };
}

function getCommonFeatures(phones) {
  if (phones.length === 0) return [];
  
  return phones[0].features.filter(feature =>
    phones.every(phone => phone.features.includes(feature))
  );
}

function getUniqueFeatures(phones) {
  const uniqueFeatures = {};
  
  phones.forEach(phone => {
    phone.features.forEach(feature => {
      const otherPhones = phones.filter(p => p.phoneId !== phone.phoneId);
      const isUnique = !otherPhones.some(p => p.features.includes(feature));
      
      if (isUnique) {
        if (!uniqueFeatures[phone.phoneId]) {
          uniqueFeatures[phone.phoneId] = [];
        }
        uniqueFeatures[phone.phoneId].push(feature);
      }
    });
  });
  
  return uniqueFeatures;
}

function getBrandDistribution(phones) {
  const distribution = {};
  phones.forEach(phone => {
    distribution[phone.brand] = (distribution[phone.brand] || 0) + 1;
  });
  return distribution;
}

function getTopFeatures(phones) {
  const featureCount = {};
  phones.forEach(phone => {
    phone.features.forEach(feature => {
      featureCount[feature] = (featureCount[feature] || 0) + 1;
    });
  });
  
  return Object.entries(featureCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([feature, count]) => ({ feature, count }));
}

export default router;