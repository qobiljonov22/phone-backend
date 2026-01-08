// Advanced filtering system for phones
const express = require('express');
const router = express.Router();

// Get available filter options
router.get('/options', (req, res) => {
  // Mock filter options based on available phones
  const filterOptions = {
    brands: [
      { value: 'iPhone', label: 'iPhone', count: 5 },
      { value: 'Samsung', label: 'Samsung', count: 3 },
      { value: 'Google', label: 'Google Pixel', count: 2 },
      { value: 'OnePlus', label: 'OnePlus', count: 1 },
      { value: 'Xiaomi', label: 'Xiaomi', count: 1 }
    ],
    priceRanges: [
      { value: '0-500', label: 'Under $500', count: 2 },
      { value: '500-800', label: '$500 - $800', count: 3 },
      { value: '800-1200', label: '$800 - $1200', count: 5 },
      { value: '1200-2000', label: '$1200+', count: 2 }
    ],
    storage: [
      { value: '128GB', label: '128GB', count: 6 },
      { value: '256GB', label: '256GB', count: 4 },
      { value: '512GB', label: '512GB', count: 2 },
      { value: '1TB', label: '1TB', count: 1 }
    ],
    colors: [
      { value: 'Black', label: 'Black', count: 4 },
      { value: 'White', label: 'White', count: 3 },
      { value: 'Blue', label: 'Blue', count: 3 },
      { value: 'Pink', label: 'Pink', count: 2 },
      { value: 'Titanium', label: 'Titanium', count: 2 },
      { value: 'Gray', label: 'Gray', count: 2 }
    ],
    ratings: [
      { value: '4.5+', label: '4.5+ Stars', count: 8 },
      { value: '4.0+', label: '4.0+ Stars', count: 10 },
      { value: '3.5+', label: '3.5+ Stars', count: 12 },
      { value: '3.0+', label: '3.0+ Stars', count: 12 }
    ],
    features: [
      { value: 'wireless_charging', label: 'Wireless Charging', count: 8 },
      { value: 'water_resistant', label: 'Water Resistant', count: 10 },
      { value: 'dual_sim', label: 'Dual SIM', count: 6 },
      { value: 'fast_charging', label: 'Fast Charging', count: 11 },
      { value: 'face_unlock', label: 'Face Unlock', count: 9 },
      { value: 'fingerprint', label: 'Fingerprint Scanner', count: 12 }
    ],
    availability: [
      { value: 'in_stock', label: 'In Stock', count: 10 },
      { value: 'pre_order', label: 'Pre-order', count: 1 },
      { value: 'coming_soon', label: 'Coming Soon', count: 1 }
    ],
    sortOptions: [
      { value: 'relevance', label: 'Most Relevant' },
      { value: 'price_asc', label: 'Price: Low to High' },
      { value: 'price_desc', label: 'Price: High to Low' },
      { value: 'rating', label: 'Highest Rated' },
      { value: 'newest', label: 'Newest First' },
      { value: 'popular', label: 'Most Popular' },
      { value: 'name_asc', label: 'Name: A to Z' },
      { value: 'name_desc', label: 'Name: Z to A' }
    ]
  };
  
  res.json({
    filterOptions,
    totalFilters: Object.keys(filterOptions).length - 1 // Exclude sortOptions
  });
});

// Apply filters to get filtered results
router.post('/apply', (req, res) => {
  const {
    brands = [],
    priceRange,
    storage = [],
    colors = [],
    minRating,
    features = [],
    availability = [],
    sortBy = 'relevance',
    page = 1,
    limit = 20
  } = req.body;
  
  // Mock filtered results - in real app, this would query the database
  let filteredPhones = generateMockFilteredResults(req.body);
  
  // Apply sorting
  filteredPhones = applySorting(filteredPhones, sortBy);
  
  // Apply pagination
  const startIndex = (parseInt(page) - 1) * parseInt(limit);
  const endIndex = startIndex + parseInt(limit);
  const paginatedPhones = filteredPhones.slice(startIndex, endIndex);
  
  res.json({
    phones: paginatedPhones,
    appliedFilters: {
      brands,
      priceRange,
      storage,
      colors,
      minRating,
      features,
      availability,
      sortBy
    },
    results: {
      total: filteredPhones.length,
      showing: paginatedPhones.length,
      page: parseInt(page),
      pages: Math.ceil(filteredPhones.length / parseInt(limit))
    },
    suggestions: generateFilterSuggestions(req.body, filteredPhones.length)
  });
});

// Get popular filter combinations
router.get('/popular-combinations', (req, res) => {
  const popularCombinations = [
    {
      name: 'Premium iPhones',
      filters: {
        brands: ['iPhone'],
        priceRange: '800-1200',
        minRating: 4.5
      },
      usage: 1250,
      description: 'High-end iPhone models'
    },
    {
      name: 'Budget Android',
      filters: {
        brands: ['Samsung', 'Xiaomi'],
        priceRange: '0-500',
        features: ['fast_charging']
      },
      usage: 890,
      description: 'Affordable Android phones with fast charging'
    },
    {
      name: 'Photography Phones',
      filters: {
        brands: ['Google', 'iPhone'],
        features: ['wireless_charging'],
        minRating: 4.0
      },
      usage: 650,
      description: 'Best phones for photography'
    },
    {
      name: 'Gaming Phones',
      filters: {
        storage: ['256GB', '512GB'],
        priceRange: '500-1200',
        features: ['fast_charging', 'water_resistant']
      },
      usage: 420,
      description: 'High-performance phones for gaming'
    }
  ];
  
  res.json({
    popularCombinations,
    totalCombinations: popularCombinations.length
  });
});

// Save user filter preferences
router.post('/save-preferences', (req, res) => {
  const { userId, filterPreferences, preferenceName } = req.body;
  
  if (!userId || !filterPreferences) {
    return res.status(400).json({ 
      error: 'User ID and filter preferences are required' 
    });
  }
  
  // Mock saving preferences - in real app, save to database
  const savedPreference = {
    preferenceId: `pref_${Date.now()}`,
    userId,
    name: preferenceName || 'My Filter',
    filters: filterPreferences,
    createdAt: new Date(),
    lastUsed: new Date()
  };
  
  res.status(201).json({
    preference: savedPreference,
    message: 'Filter preferences saved successfully'
  });
});

// Get user's saved filter preferences
router.get('/preferences/:userId', (req, res) => {
  const { userId } = req.params;
  
  // Mock user preferences
  const userPreferences = [
    {
      preferenceId: 'pref_1',
      userId,
      name: 'My Favorite iPhones',
      filters: {
        brands: ['iPhone'],
        priceRange: '800-1200',
        storage: ['256GB', '512GB']
      },
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      lastUsed: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    },
    {
      preferenceId: 'pref_2',
      userId,
      name: 'Budget Options',
      filters: {
        priceRange: '0-500',
        minRating: 4.0,
        availability: ['in_stock']
      },
      createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      lastUsed: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
    }
  ];
  
  res.json({
    preferences: userPreferences,
    total: userPreferences.length
  });
});

// Get filter analytics
router.get('/analytics', (req, res) => {
  const { period = '30d' } = req.query;
  
  const analytics = {
    period,
    mostUsedFilters: [
      { filter: 'brands', usage: 2450, percentage: 85 },
      { filter: 'priceRange', usage: 2100, percentage: 73 },
      { filter: 'storage', usage: 1680, percentage: 58 },
      { filter: 'colors', usage: 1200, percentage: 42 },
      { filter: 'ratings', usage: 980, percentage: 34 }
    ],
    popularBrands: [
      { brand: 'iPhone', searches: 1250, percentage: 45 },
      { brand: 'Samsung', searches: 850, percentage: 31 },
      { brand: 'Google', searches: 420, percentage: 15 },
      { brand: 'OnePlus', searches: 180, percentage: 6 },
      { brand: 'Xiaomi', searches: 80, percentage: 3 }
    ],
    priceRangePreferences: [
      { range: '800-1200', searches: 980, percentage: 35 },
      { range: '500-800', searches: 750, percentage: 27 },
      { range: '0-500', searches: 650, percentage: 23 },
      { range: '1200-2000', searches: 420, percentage: 15 }
    ],
    filterCombinations: [
      { combination: 'brand + price', usage: 1850 },
      { combination: 'brand + storage', usage: 1200 },
      { combination: 'price + rating', usage: 980 },
      { combination: 'brand + features', usage: 750 }
    ],
    conversionRates: {
      withFilters: 3.2, // percentage
      withoutFilters: 1.8,
      improvement: 77.8
    },
    generatedAt: new Date()
  };
  
  res.json(analytics);
});

// Helper functions
function generateMockFilteredResults(filters) {
  // Mock implementation - in real app, this would query the database
  const mockPhones = [
    { id: 'iphone-15-pro', brand: 'iPhone', price: 999, rating: 4.8, storage: '128GB' },
    { id: 'galaxy-s24-ultra', brand: 'Samsung', price: 1299, rating: 4.7, storage: '512GB' },
    { id: 'pixel-8-pro', brand: 'Google', price: 999, rating: 4.5, storage: '256GB' },
    // ... more mock data
  ];
  
  let filtered = mockPhones;
  
  // Apply brand filter
  if (filters.brands && filters.brands.length > 0) {
    filtered = filtered.filter(phone => filters.brands.includes(phone.brand));
  }
  
  // Apply price range filter
  if (filters.priceRange) {
    const [min, max] = filters.priceRange.split('-').map(Number);
    filtered = filtered.filter(phone => phone.price >= min && phone.price <= max);
  }
  
  // Apply rating filter
  if (filters.minRating) {
    const minRating = parseFloat(filters.minRating.replace('+', ''));
    filtered = filtered.filter(phone => phone.rating >= minRating);
  }
  
  return filtered;
}

function applySorting(phones, sortBy) {
  switch (sortBy) {
    case 'price_asc':
      return phones.sort((a, b) => a.price - b.price);
    case 'price_desc':
      return phones.sort((a, b) => b.price - a.price);
    case 'rating':
      return phones.sort((a, b) => b.rating - a.rating);
    case 'name_asc':
      return phones.sort((a, b) => a.brand.localeCompare(b.brand));
    case 'name_desc':
      return phones.sort((a, b) => b.brand.localeCompare(a.brand));
    default:
      return phones; // relevance - no sorting
  }
}

function generateFilterSuggestions(appliedFilters, resultCount) {
  const suggestions = [];
  
  if (resultCount === 0) {
    suggestions.push({
      type: 'expand_search',
      message: 'Try removing some filters to see more results',
      action: 'Remove filters'
    });
  } else if (resultCount < 5) {
    suggestions.push({
      type: 'similar_options',
      message: 'Consider similar brands or expand your price range',
      action: 'Show similar'
    });
  } else if (resultCount > 50) {
    suggestions.push({
      type: 'narrow_search',
      message: 'Add more filters to narrow down your search',
      action: 'Add filters'
    });
  }
  
  return suggestions;
}

module.exports = router;