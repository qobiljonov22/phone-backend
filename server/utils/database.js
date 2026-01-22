// Database utility functions
// Supports both MongoDB and PostgreSQL

// ========== MONGODB ==========
let mongoClient = null;
let mongoDb = null;

export const connectMongoDB = async () => {
  if (process.env.MONGODB_URI) {
    try {
      const { MongoClient } = await import('mongodb');
      mongoClient = new MongoClient(process.env.MONGODB_URI);
      await mongoClient.connect();
      mongoDb = mongoClient.db('phone-store');
      console.log('✅ MongoDB connected');
      return mongoDb;
    } catch (error) {
      console.error('❌ MongoDB connection error:', error);
      throw error;
    }
  }
  return null;
};

export const getMongoDB = () => mongoDb;

// ========== POSTGRESQL ==========
let pgPool = null;

export const connectPostgreSQL = async () => {
  if (process.env.DATABASE_URL) {
    try {
      const pg = await import('pg');
      const { Pool } = pg.default || pg;
      
      pgPool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
      });
      
      // Test connection
      await pgPool.query('SELECT NOW()');
      console.log('✅ PostgreSQL connected');
      return pgPool;
    } catch (error) {
      console.error('❌ PostgreSQL connection error:', error);
      throw error;
    }
  }
  return null;
};

export const query = async (text, params) => {
  if (!pgPool) {
    throw new Error('PostgreSQL not connected');
  }
  
  const start = Date.now();
  try {
    const res = await pgPool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

// ========== INITIALIZE ==========
export const initializeDatabase = async () => {
  if (process.env.MONGODB_URI) {
    await connectMongoDB();
  } else if (process.env.DATABASE_URL) {
    await connectPostgreSQL();
  } else {
    console.log('ℹ️  No database configured - using file-based storage');
  }
};
