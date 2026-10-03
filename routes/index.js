import express from 'express';
import { healthCheck, testConnection } from '../controllers/systemController.js';

const router = express.Router();

// Health check
router.get('/health', healthCheck);

// Test endpoint to verify DB connection
router.get('/test', testConnection);

export default router;
