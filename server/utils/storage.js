// Universal storage utility - works with database or in-memory fallback
// Supports MongoDB, PostgreSQL, or in-memory storage

let dbType = null;
let mongoDb = null;
let pgPool = null;
let inMemoryStorage = new Map(); // Fallback storage

// Initialize storage
export const initializeStorage = async () => {
  // Try MongoDB first
  if (process.env.MONGODB_URI) {
    try {
      const { MongoClient } = await import('mongodb');
      const client = new MongoClient(process.env.MONGODB_URI);
      await client.connect();
      mongoDb = client.db('phone-store');
      dbType = 'mongodb';
      console.log('✅ Using MongoDB for storage');
      return;
    } catch (error) {
      console.error('❌ MongoDB connection failed:', error);
    }
  }

  // Try PostgreSQL
  if (process.env.DATABASE_URL) {
    try {
      const pg = await import('pg');
      const { Pool } = pg.default || pg;
      pgPool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
      });
      await pgPool.query('SELECT NOW()');
      dbType = 'postgresql';
      console.log('✅ Using PostgreSQL for storage');
      return;
    } catch (error) {
      console.error('❌ PostgreSQL connection failed:', error);
    }
  }

  // Fallback to in-memory storage
  dbType = 'memory';
  console.log('ℹ️  Using in-memory storage (no database configured)');
};

// ========== MONGODB OPERATIONS ==========
const mongoFind = async (collection, query = {}) => {
  if (!mongoDb) return [];
  const col = mongoDb.collection(collection);
  return await col.find(query).toArray();
};

const mongoFindOne = async (collection, query) => {
  if (!mongoDb) return null;
  const col = mongoDb.collection(collection);
  return await col.findOne(query);
};

const mongoInsertOne = async (collection, doc) => {
  if (!mongoDb) return null;
  const col = mongoDb.collection(collection);
  const result = await col.insertOne(doc);
  return result.insertedId;
};

const mongoUpdateOne = async (collection, query, update) => {
  if (!mongoDb) return null;
  const col = mongoDb.collection(collection);
  return await col.updateOne(query, { $set: update });
};

const mongoDeleteOne = async (collection, query) => {
  if (!mongoDb) return null;
  const col = mongoDb.collection(collection);
  return await col.deleteOne(query);
};

// ========== POSTGRESQL OPERATIONS ==========
const pgFind = async (table, where = '1=1', params = []) => {
  if (!pgPool) return [];
  const query = `SELECT * FROM ${table} WHERE ${where}`;
  const result = await pgPool.query(query, params);
  return result.rows;
};

const pgFindOne = async (table, where, params = []) => {
  if (!pgPool) return null;
  const query = `SELECT * FROM ${table} WHERE ${where} LIMIT 1`;
  const result = await pgPool.query(query, params);
  return result.rows[0] || null;
};

const pgInsert = async (table, data) => {
  if (!pgPool) return null;
  const keys = Object.keys(data);
  const values = Object.values(data);
  const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
  const query = `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders}) RETURNING *`;
  const result = await pgPool.query(query, values);
  return result.rows[0];
};

const pgUpdate = async (table, where, data, params = []) => {
  if (!pgPool) return null;
  const keys = Object.keys(data);
  const values = Object.values(data);
  const setClause = keys.map((key, i) => `${key} = $${params.length + i + 1}`).join(', ');
  const query = `UPDATE ${table} SET ${setClause} WHERE ${where} RETURNING *`;
  const result = await pgPool.query(query, [...params, ...values]);
  return result.rows[0] || null;
};

const pgDelete = async (table, where, params = []) => {
  if (!pgPool) return null;
  const query = `DELETE FROM ${table} WHERE ${where} RETURNING *`;
  const result = await pgPool.query(query, params);
  return result.rows[0] || null;
};

// ========== IN-MEMORY OPERATIONS ==========
const memoryGet = (key) => {
  return inMemoryStorage.get(key) || [];
};

const memorySet = (key, value) => {
  inMemoryStorage.set(key, value);
};

const memoryFind = (key, queryFn) => {
  const items = memoryGet(key);
  if (!queryFn) return items;
  return items.filter(queryFn);
};

const memoryFindOne = (key, queryFn) => {
  const items = memoryGet(key);
  return items.find(queryFn) || null;
};

const memoryInsert = (key, item) => {
  const items = memoryGet(key);
  items.push(item);
  memorySet(key, items);
  return item;
};

const memoryUpdate = (key, queryFn, updateFn) => {
  const items = memoryGet(key);
  const index = items.findIndex(queryFn);
  if (index !== -1) {
    items[index] = updateFn(items[index]);
    memorySet(key, items);
    return items[index];
  }
  return null;
};

const memoryDelete = (key, queryFn) => {
  const items = memoryGet(key);
  const index = items.findIndex(queryFn);
  if (index !== -1) {
    const deleted = items.splice(index, 1)[0];
    memorySet(key, items);
    return deleted;
  }
  return null;
};

// ========== UNIVERSAL API ==========
export const storage = {
  // Find all items
  async find(collection, query = {}) {
    if (dbType === 'mongodb') {
      return await mongoFind(collection, query);
    } else if (dbType === 'postgresql') {
      const where = Object.keys(query).map((key, i) => `${key} = $${i + 1}`).join(' AND ') || '1=1';
      const params = Object.values(query);
      return await pgFind(collection, where, params);
    } else {
      return memoryFind(collection, (item) => {
        return Object.keys(query).every(key => item[key] === query[key]);
      });
    }
  },

  // Find one item
  async findOne(collection, query) {
    if (dbType === 'mongodb') {
      return await mongoFindOne(collection, query);
    } else if (dbType === 'postgresql') {
      const where = Object.keys(query).map((key, i) => `${key} = $${i + 1}`).join(' AND ');
      const params = Object.values(query);
      return await pgFindOne(collection, where, params);
    } else {
      return memoryFindOne(collection, (item) => {
        return Object.keys(query).every(key => item[key] === query[key]);
      });
    }
  },

  // Insert one item
  async insert(collection, data) {
    if (dbType === 'mongodb') {
      return await mongoInsertOne(collection, data);
    } else if (dbType === 'postgresql') {
      return await pgInsert(collection, data);
    } else {
      return memoryInsert(collection, data);
    }
  },

  // Update one item
  async update(collection, query, data) {
    if (dbType === 'mongodb') {
      return await mongoUpdateOne(collection, query, data);
    } else if (dbType === 'postgresql') {
      const where = Object.keys(query).map((key, i) => `${key} = $${i + 1}`).join(' AND ');
      const params = Object.values(query);
      return await pgUpdate(collection, where, data, params);
    } else {
      return memoryUpdate(collection, 
        (item) => Object.keys(query).every(key => item[key] === query[key]),
        (item) => ({ ...item, ...data })
      );
    }
  },

  // Delete one item
  async delete(collection, query) {
    if (dbType === 'mongodb') {
      return await mongoDeleteOne(collection, query);
    } else if (dbType === 'postgresql') {
      const where = Object.keys(query).map((key, i) => `${key} = $${i + 1}`).join(' AND ');
      const params = Object.values(query);
      return await pgDelete(collection, where, params);
    } else {
      return memoryDelete(collection, (item) => {
        return Object.keys(query).every(key => item[key] === query[key]);
      });
    }
  },

  // Get collection count
  async count(collection, query = {}) {
    if (dbType === 'mongodb') {
      if (!mongoDb) return 0;
      const col = mongoDb.collection(collection);
      return await col.countDocuments(query);
    } else if (dbType === 'postgresql') {
      const where = Object.keys(query).map((key, i) => `${key} = $${i + 1}`).join(' AND ') || '1=1';
      const params = Object.values(query);
      const result = await pgPool.query(`SELECT COUNT(*) FROM ${collection} WHERE ${where}`, params);
      return parseInt(result.rows[0].count);
    } else {
      const items = memoryFind(collection, (item) => {
        return Object.keys(query).every(key => item[key] === query[key]);
      });
      return items.length;
    }
  }
};

// Export storage type
export const getStorageType = () => dbType;
