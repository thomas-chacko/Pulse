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

// Create dummy data for testing (POST request)
router.post('/test-insert', async (req, res) => {
  try {
    const db = getDB();
    
    // Insert dummy data into 'test_collection'
    const result = await db.collection('test_collection').insertOne({
      message: 'Hello from production!',
      timestamp: new Date(),
      environment: process.env.NODE_ENV || 'development',
      testData: {
        user: 'test_user',
        status: 'active',
        version: '1.0.0'
      }
    });
    
    res.json({
      success: true,
      message: 'Test data inserted successfully',
      database: db.databaseName,
      collection: 'test_collection',
      insertedId: result.insertedId
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to insert test data',
      message: error.message
    });
  }
});

// GET version for easy browser testing
router.get('/test-insert', async (req, res) => {
  try {
    const db = getDB();
    
    // Insert dummy data into 'test_collection'
    const result = await db.collection('test_collection').insertOne({
      message: 'Hello from production!',
      timestamp: new Date(),
      environment: process.env.NODE_ENV || 'development',
      testData: {
        user: 'test_user',
        status: 'active',
        version: '1.0.0'
      }
    });
    
    res.json({
      success: true,
      message: 'Test data inserted successfully',
      database: db.databaseName,
      collection: 'test_collection',
      insertedId: result.insertedId
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to insert test data',
      message: error.message
    });
  }
});

// Get all test data (verify data was inserted)
router.get('/test-data', async (req, res) => {
  try {
    const db = getDB();
    
    // Get all documents from test_collection
    const data = await db.collection('test_collection').find({}).toArray();
    
    res.json({
      success: true,
      database: db.databaseName,
      collection: 'test_collection',
      count: data.length,
      data: data
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch test data',
      message: error.message
    });
  }
});

// Delete test data (cleanup)
router.delete('/test-cleanup', async (req, res) => {
  try {
    const db = getDB();
    
    // Drop the test collection
    await db.collection('test_collection').drop();
    
    res.json({
      success: true,
      message: 'Test collection deleted successfully',
      database: db.databaseName
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to cleanup',
      message: error.message
    });
  }
});

export default router;
