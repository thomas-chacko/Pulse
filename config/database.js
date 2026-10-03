// MongoDB Connection Configuration
// Industry standard: Separate config from main server file

import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('MONGODB_URI environment variable is not defined');
}

// MongoDB client instance
let client = null;
let db = null;

// Connection options (industry best practices)
const options = {
  maxPoolSize: 10,           // Max number of connections (default: 10)
  minPoolSize: 2,            // Min connections to keep open
  serverSelectionTimeoutMS: 5000,  // Timeout for server selection
  socketTimeoutMS: 45000,    // Socket timeout
  family: 4                  // Use IPv4
};

/**
 * Connect to MongoDB
 * @returns {Promise<Db>} Database instance
 */
export async function connectDB() {
  try {
    if (db) {
      // Already connected, return existing connection
      console.log('📊 Using existing MongoDB connection');
      return db;
    }

    console.log('🔄 Connecting to MongoDB...');
    
    client = new MongoClient(MONGODB_URI, options);
    await client.connect();
    
    // Get database name from URI or use default
    const dbName = new URL(MONGODB_URI).pathname.slice(1) || 'pulse';
    db = client.db(dbName);
    
    console.log(`✅ MongoDB connected successfully to database: ${dbName}`);
    
    return db;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    throw error;
  }
}

/**
 * Get database instance
 * @returns {Db} Database instance
 */
export function getDB() {
  if (!db) {
    throw new Error('Database not initialized. Call connectDB() first.');
  }
  return db;
}

/**
 * Close MongoDB connection
 * @returns {Promise<void>}
 */
export async function closeDB() {
  if (client) {
    await client.close();
    client = null;
    db = null;
    console.log('🔌 MongoDB connection closed');
  }
}

/**
 * Check if database is connected
 * @returns {boolean}
 */
export function isConnected() {
  return db !== null;
}
