// Validation utilities for phone data
const validatePhone = (phoneData) => {
  const errors = [];
  
  // Required fields
  if (!phoneData.brand || phoneData.brand.trim().length === 0) {
    errors.push('Brand is required');
  }
  
  if (!phoneData.model || phoneData.model.trim().length === 0) {
    errors.push('Model is required');
  }
  
  if (!phoneData.price || isNaN(phoneData.price) || phoneData.price <= 0) {
    errors.push('Valid price is required');
  }
  
  // Optional field validation
  if (phoneData.storage && !isValidStorage(phoneData.storage)) {
    errors.push('Invalid storage format (e.g., 128GB, 256GB, 1TB)');
  }
  
  if (phoneData.price && phoneData.price > 10000) {
    errors.push('Price seems too high (max $10,000)');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

const isValidStorage = (storage) => {
  const storagePattern = /^\d+(GB|TB)$/i;
  return storagePattern.test(storage);
};

const sanitizePhone = (phoneData) => {
  return {
    brand: phoneData.brand?.trim(),
    model: phoneData.model?.trim(),
    price: parseFloat(phoneData.price),
    storage: phoneData.storage?.trim() || '128GB',
    color: phoneData.color?.trim() || 'Default',
    description: phoneData.description?.trim() || '',
    specifications: phoneData.specifications || {},
    inStock: phoneData.inStock !== undefined ? Boolean(phoneData.inStock) : true
  };
};

const validateBulkPhones = (phones) => {
  if (!Array.isArray(phones)) {
    return { isValid: false, errors: ['Phones must be an array'] };
  }
  
  if (phones.length === 0) {
    return { isValid: false, errors: ['At least one phone is required'] };
  }
  
  if (phones.length > 100) {
    return { isValid: false, errors: ['Maximum 100 phones allowed per bulk operation'] };
  }
  
  const errors = [];
  phones.forEach((phone, index) => {
    const validation = validatePhone(phone);
    if (!validation.isValid) {
      errors.push(`Phone ${index + 1}: ${validation.errors.join(', ')}`);
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

module.exports = {
  validatePhone,
  sanitizePhone,
  validateBulkPhones,
  isValidStorage
};