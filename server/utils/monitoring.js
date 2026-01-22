// Monitoring and Error Tracking
// Supports Sentry for error tracking

let sentryInitialized = false;

// Initialize Sentry
export const initSentry = async () => {
  if (process.env.SENTRY_DSN && !sentryInitialized) {
    try {
      const Sentry = await import('@sentry/node');
      
      Sentry.init({
        dsn: process.env.SENTRY_DSN,
        environment: process.env.NODE_ENV || 'production',
        tracesSampleRate: 1.0,
        beforeSend(event, hint) {
          // Filter sensitive data
          if (event.request) {
            if (event.request.headers) {
              delete event.request.headers['Authorization'];
            }
            if (event.request.data) {
              if (typeof event.request.data === 'object') {
                delete event.request.data.password;
                delete event.request.data.token;
              }
            }
          }
          return event;
        }
      });
      
      sentryInitialized = true;
      console.log('✅ Sentry initialized');
    } catch (error) {
      console.error('❌ Sentry initialization error:', error);
    }
  }
};

// Log error to Sentry
export const logError = async (error, context = {}) => {
  if (sentryInitialized) {
    try {
      const Sentry = await import('@sentry/node');
      Sentry.captureException(error, {
        contexts: {
          custom: context
        }
      });
    } catch (err) {
      console.error('Sentry error:', err);
    }
  }
  
  // Also log to console
  console.error('ERROR:', {
    timestamp: new Date().toISOString(),
    error: error.message,
    stack: error.stack,
    context
  });
};

// Log custom event
export const logEvent = async (message, level = 'info', context = {}) => {
  if (sentryInitialized) {
    try {
      const Sentry = await import('@sentry/node');
      Sentry.captureMessage(message, {
        level,
        contexts: {
          custom: context
        }
      });
    } catch (err) {
      console.error('Sentry error:', err);
    }
  }
  
  console.log(`[${level.toUpperCase()}]`, message, context);
};
