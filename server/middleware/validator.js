// Input validation middleware
export const validatePhone = (req, res, next) => {
  if (req.method === 'POST' || req.method === 'PUT') {
    const { brand, model, price } = req.body;
    const errors = [];
    
    if (!brand || typeof brand !== 'string' || brand.trim().length === 0) {
      errors.push('Brand is required and must be a non-empty string');
    }
    
    if (!model || typeof model !== 'string' || model.trim().length === 0) {
      errors.push('Model is required and must be a non-empty string');
    }
    
    if (price !== undefined && (typeof price !== 'number' || price < 0)) {
      errors.push('Price must be a positive number');
    }
    
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        message: 'Input validation error',
        errors: errors,
        timestamp: new Date().toISOString()
      });
    }
  }
  
  next();
};

export const validatePagination = (req, res, next) => {
  const { page, limit } = req.query;
  
  if (page && (isNaN(page) || parseInt(page) < 1)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid page parameter',
      message: 'Page must be a positive integer',
      timestamp: new Date().toISOString()
    });
  }
  
  if (limit && (isNaN(limit) || parseInt(limit) < 1 || parseInt(limit) > 100)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid limit parameter',
      message: 'Limit must be between 1 and 100',
      timestamp: new Date().toISOString()
    });
  }
  
  next();
};

export default { validatePhone, validatePagination };
