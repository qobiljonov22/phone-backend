// Security headers middleware
export const securityHeaders = (req, res, next) => {
  // Security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Remove X-Powered-By header
  res.removeHeader('X-Powered-By');
  
  next();
};

// API key validation (optional)
export const validateApiKey = (req, res, next) => {
  // Skip for public endpoints
  const publicPaths = ['/api/health', '/api/phones', '/api/search', '/api/featured', '/api/brands', '/api/categories'];
  if (publicPaths.some(path => req.path.startsWith(path))) {
    return next();
  }
  
  // For protected endpoints, check API key
  const apiKey = req.headers['x-api-key'] || req.query.apiKey;
  const validApiKey = process.env.API_KEY || 'phone-backend-2024';
  
  if (apiKey && apiKey === validApiKey) {
    return next();
  }
  
  // Allow if no API key required for now
  next();
};

export default { securityHeaders, validateApiKey };
