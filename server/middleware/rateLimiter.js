// Simple rate limiter middleware
const requestCounts = new Map();

export const rateLimiter = (windowMs = 15 * 60 * 1000, maxRequests = 100) => {
  return (req, res, next) => {
    const clientId = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    const windowStart = now - windowMs;
    
    if (!requestCounts.has(clientId)) {
      requestCounts.set(clientId, []);
    }
    
    const requests = requestCounts.get(clientId);
    const recentRequests = requests.filter(time => time > windowStart);
    
    if (recentRequests.length >= maxRequests) {
      return res.status(429).json({
        success: false,
        error: 'Too many requests',
        message: `Rate limit exceeded. Max ${maxRequests} requests per ${windowMs / 1000} seconds.`,
        retryAfter: Math.ceil((recentRequests[0] + windowMs - now) / 1000),
        timestamp: new Date().toISOString()
      });
    }
    
    recentRequests.push(now);
    requestCounts.set(clientId, recentRequests);
    
    // Set rate limit headers
    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', maxRequests - recentRequests.length);
    res.setHeader('X-RateLimit-Reset', new Date(now + windowMs).toISOString());
    
    next();
  };
};

// Cleanup old entries periodically
setInterval(() => {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000;
  
  requestCounts.forEach((requests, clientId) => {
    const recentRequests = requests.filter(time => time > now - windowMs);
    if (recentRequests.length === 0) {
      requestCounts.delete(clientId);
    } else {
      requestCounts.set(clientId, recentRequests);
    }
  });
}, 5 * 60 * 1000); // Cleanup every 5 minutes

export default rateLimiter;
