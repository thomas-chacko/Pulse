// System Controller
// Handles health checks and system status endpoints

import { isConnected, getDB } from '../config/database.js';

export const healthCheck = (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: isConnected() ? 'connected' : 'disconnected'
  });
};

export const testConnection = async (req, res) => {
  try {
    const db = getDB();
    const collections = await db.listCollections().toArray();
    
    res.json({
      message: 'Database connection successful',
      database: db.databaseName,
      collections: collections.map(c => c.name)
    });
  } catch (error) {
    res.status(500).json({
      error: 'Database error',
      message: error.message
    });
  }
};
