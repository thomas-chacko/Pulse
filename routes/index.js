// API Routes - Centralized routing
// Industry standard: Keep routes separate from server.js

import express from 'express';
import { getDB } from '../config/database.js';

const router = express.Router();

// Test endpoint to verify DB connection
router.get('/test', async (req, res) => {
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
});

export default router;
