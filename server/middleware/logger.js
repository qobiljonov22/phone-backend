// Request logging middleware
export const requestLogger = (req, res, next) => {
  const start = Date.now();
  const timestamp = new Date().toISOString();
  
  // Log request
  console.log(`[${timestamp}] ${req.method} ${req.path} - IP: ${req.ip}`);
  
  // Log response when finished
  res.on('finish', () => {
    const duration = Date.now() - start;
    const statusColor = res.statusCode >= 400 ? '\x1b[31m' : '\x1b[32m'; // Red for errors, green for success
    console.log(`${statusColor}[${timestamp}] ${req.method} ${req.path} - ${res.statusCode} - ${duration}ms\x1b[0m`);
  });
  
  next();
};

export default requestLogger;
