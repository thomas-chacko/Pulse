// Personal MCP Server
// Modern, scalable architecture with feature-based structure

import express from 'express';
import dotenv from 'dotenv';
import { connectDB, closeDB, isConnected, getDB } from './config/database.js';

// Tool routes
import todoRoutes from './tools/todo/todoRoutes.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Health check endpoint
app.get('/health', async (req, res) => {
  const healthData = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    
    // Server info
    server: {
      port: PORT,
      nodeVersion: process.version,
      platform: process.platform,
      memory: {
        used: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
        total: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)}MB`,
        rss: `${Math.round(process.memoryUsage().rss / 1024 / 1024)}MB`
      }
    },
    
    // Database info
    database: {
      status: isConnected() ? 'connected' : 'disconnected',
      name: isConnected() ? getDB().databaseName : null
    },
    
    // Available tools
    tools: {
      todo: {
        status: 'active',
        endpoint: '/api/tools/todo'
      },
      finance: {
        status: 'coming soon',
        endpoint: '/api/tools/finance'
      },
      calendar: {
        status: 'coming soon',
        endpoint: '/api/tools/calendar'
      },
      github: {
        status: 'coming soon',
        endpoint: '/api/tools/github'
      }
    }
  };
  
  // If database is connected, add collection stats
  if (isConnected()) {
    try {
      const db = getDB();
      const collections = await db.listCollections().toArray();
      healthData.database.collections = collections.map(c => c.name);
      healthData.database.collectionsCount = collections.length;
    } catch (error) {
      healthData.database.error = 'Failed to fetch collections';
    }
  }
  
  res.status(200).json(healthData);
});

// Mount tool routes
app.use('/api/tools/todo', todoRoutes);
// app.use('/api/tools/finance', financeRoutes);
// app.use('/api/tools/calendar', calendarRoutes);
// app.use('/api/tools/github', githubRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// Start server
async function startServer() {
  try {
    await connectDB();
    
    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`🏥 Health: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('❌ Failed to start:', error.message);
    process.exit(1);
  }
}

// Graceful shutdown
const shutdown = async (signal) => {
  console.log(`${signal} received: closing server`);
  await closeDB();
  process.exit(0);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Start
startServer();
