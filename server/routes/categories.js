// Product categories management
import express from 'express';
const router = express.Router();

// Categories data based on Figma design
const categories = new Map([
  ['smartphones', {
    categoryId: 'smartphones',
    name: 'Smartphones',
    description: 'Latest smartphones from top brands',
    icon: '📱',
    parentId: null,
    subcategories: ['flagship', 'mid-range', 'budget'],
    isActive: true,
    sortOrder: 1,
    seoTitle: 'Buy Latest Smartphones Online',
    seoDescription: 'Shop the latest smartphones from iPhone, Samsung, Google Pixel and more',
    createdAt: new Date(),
    updatedAt: new Date()
  }],
  ['flagship', {
    categoryId: 'flagship',
    name: 'Flagship Phones',
    description: 'Premium flagship smartphones',
    icon: '⭐',
    parentId: 'smartphones',
    subcategories: [],
    isActive: true,
    sortOrder: 1,
    priceRange: { min: 800, max: 2000 },
    createdAt: new Date(),
    updatedAt: new Date()
  }],
  ['mid-range', {
    categoryId: 'mid-range',
    name: 'Mid-Range Phones',
    description: 'Best value smartphones',
    icon: '💎',
    parentId: 'smartphones',
    subcategories: [],
    isActive: true,
    sortOrder: 2,
    priceRange: { min: 300, max: 800 },
    createdAt: new Date(),
    updatedAt: new Date()
  }],
  ['budget', {
    categoryId: 'budget',
    name: 'Budget Phones',
    description: 'Affordable smartphones',
    icon: '💰',
    parentId: 'smartphones',
    subcategories: [],
    isActive: true,
    sortOrder: 3,
    priceRange: { min: 100, max: 300 },
    createdAt: new Date(),
    updatedAt: new Date()
  }],
  ['accessories', {
    categoryId: 'accessories',
    name: 'Accessories',
    description: 'Phone accessories and cases',
    icon: '🎧',
    parentId: null,
    subcategories: ['cases', 'chargers', 'headphones'],
    isActive: true,
    sortOrder: 2,
    createdAt: new Date(),
    updatedAt: new Date()
  }]
]);

// Get all categories
router.get('/', (req, res) => {
  const { includeInactive = false, parentId } = req.query;
  
  let categoryList = Array.from(categories.values());
  
  // Filter by active status
  if (includeInactive !== 'true') {
    categoryList = categoryList.filter(cat => cat.isActive);
  }
  
  // Filter by parent category
  if (parentId) {
    categoryList = categoryList.filter(cat => cat.parentId === parentId);
  } else if (parentId === 'null') {
    categoryList = categoryList.filter(cat => cat.parentId === null);
  }
  
  // Sort by sortOrder
  categoryList.sort((a, b) => a.sortOrder - b.sortOrder);
  
  res.json({
    categories: categoryList,
    total: categoryList.length
  });
});

// Get category tree (hierarchical structure)
router.get('/tree', (req, res) => {
  const categoryTree = [];
  
  // Get root categories
  const rootCategories = Array.from(categories.values())
    .filter(cat => cat.parentId === null && cat.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder);
  
  rootCategories.forEach(rootCat => {
    const categoryWithChildren = {
      ...rootCat,
      children: Array.from(categories.values())
        .filter(cat => cat.parentId === rootCat.categoryId && cat.isActive)
        .sort((a, b) => a.sortOrder - b.sortOrder)
    };
    categoryTree.push(categoryWithChildren);
  });
  
  res.json({
    categoryTree,
    totalCategories: categories.size
  });
});

// Get specific category
router.get('/:categoryId', (req, res) => {
  const { categoryId } = req.params;
  
  const category = categories.get(categoryId);
  if (!category) {
    return res.status(404).json({ error: 'Category not found' });
  }
  
  // Get subcategories
  const subcategories = Array.from(categories.values())
    .filter(cat => cat.parentId === categoryId)
    .sort((a, b) => a.sortOrder - b.sortOrder);
  
  // Get parent category if exists
  let parentCategory = null;
  if (category.parentId) {
    parentCategory = categories.get(category.parentId);
  }
  
  res.json({
    category: {
      ...category,
      subcategories,
      parentCategory
    }
  });
});

// Create new category
router.post('/', (req, res) => {
  const {
    categoryId,
    name,
    description,
    icon,
    parentId,
    sortOrder = 1,
    priceRange,
    seoTitle,
    seoDescription
  } = req.body;
  
  if (!categoryId || !name) {
    return res.status(400).json({ 
      error: 'Category ID and name are required' 
    });
  }
  
  if (categories.has(categoryId)) {
    return res.status(409).json({ error: 'Category already exists' });
  }
  
  const newCategory = {
    categoryId,
    name,
    description: description || '',
    icon: icon || '📂',
    parentId: parentId || null,
    subcategories: [],
    isActive: true,
    sortOrder: parseInt(sortOrder),
    priceRange: priceRange || null,
    seoTitle: seoTitle || name,
    seoDescription: seoDescription || description,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  categories.set(categoryId, newCategory);
  
  // Update parent category's subcategories array
  if (parentId && categories.has(parentId)) {
    const parentCat = categories.get(parentId);
    if (!parentCat.subcategories.includes(categoryId)) {
      parentCat.subcategories.push(categoryId);
      categories.set(parentId, parentCat);
    }
  }
  
  res.status(201).json({
    category: newCategory,
    message: 'Category created successfully'
  });
});

// Update category
router.put('/:categoryId', (req, res) => {
  const { categoryId } = req.params;
  const updateData = req.body;
  
  const category = categories.get(categoryId);
  if (!category) {
    return res.status(404).json({ error: 'Category not found' });
  }
  
  // Update allowed fields
  const allowedFields = [
    'name', 'description', 'icon', 'sortOrder', 
    'priceRange', 'seoTitle', 'seoDescription', 'isActive'
  ];
  
  allowedFields.forEach(field => {
    if (updateData[field] !== undefined) {
      category[field] = updateData[field];
    }
  });
  
  category.updatedAt = new Date();
  categories.set(categoryId, category);
  
  res.json({
    category,
    message: 'Category updated successfully'
  });
});

// Delete category
router.delete('/:categoryId', (req, res) => {
  const { categoryId } = req.params;
  
  const category = categories.get(categoryId);
  if (!category) {
    return res.status(404).json({ error: 'Category not found' });
  }
  
  // Check if category has subcategories
  const hasSubcategories = Array.from(categories.values())
    .some(cat => cat.parentId === categoryId);
  
  if (hasSubcategories) {
    return res.status(400).json({ 
      error: 'Cannot delete category with subcategories' 
    });
  }
  
  // Remove from parent's subcategories array
  if (category.parentId && categories.has(category.parentId)) {
    const parentCat = categories.get(category.parentId);
    parentCat.subcategories = parentCat.subcategories.filter(id => id !== categoryId);
    categories.set(category.parentId, parentCat);
  }
  
  categories.delete(categoryId);
  
  res.json({
    message: 'Category deleted successfully'
  });
});

// Get category statistics
router.get('/:categoryId/stats', (req, res) => {
  const { categoryId } = req.params;
  
  const category = categories.get(categoryId);
  if (!category) {
    return res.status(404).json({ error: 'Category not found' });
  }
  
  // Mock statistics - in real app, this would query the phones collection
  const stats = {
    totalProducts: Math.floor(Math.random() * 50) + 10,
    averagePrice: Math.floor(Math.random() * 500) + 200,
    priceRange: category.priceRange || { min: 100, max: 1500 },
    topBrands: ['iPhone', 'Samsung', 'Google'],
    popularProducts: [
      { phoneId: 'iphone-15-pro-128', views: 1250 },
      { phoneId: 'galaxy-s24-ultra-512', views: 980 },
      { phoneId: 'pixel-8-pro-256', views: 750 }
    ],
    salesData: {
      thisMonth: Math.floor(Math.random() * 100) + 20,
      lastMonth: Math.floor(Math.random() * 100) + 15,
      growth: Math.floor(Math.random() * 30) - 10 // -10 to +20
    }
  };
  
  res.json({
    category: {
      categoryId: category.categoryId,
      name: category.name
    },
    stats,
    generatedAt: new Date()
  });
});

export default router;