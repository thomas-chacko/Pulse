// Personal MCP Server - Clean, scalable architecture
// Server setup and Express configuration

import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import { connectDB, closeDB, isConnected, getDB } from './config/database.js';
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { createMcpServer } from './mcp/mcpServer.js';

// Middleware
import { authenticate } from './middleware/auth.js';
import { generalLimiter, strictLimiter } from './middleware/rateLimiter.js';

// Tool routes
import todoRoutes from './tools/todo/todoRoutes.js';
import financeRoutes from './tools/finance/financeRoutes.js';
import githubRoutes from './tools/github/githubRoutes.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ── Security Middleware ─────────────────────────────────────

// Security headers (XSS, clickjacking, MIME sniffing protection, etc.)
app.use(helmet());

// CORS configuration
const corsOptions = (() => {
  const env = process.env.NODE_ENV || 'development';

  // In development: allow all origins
  if (env === 'development') {
    return {};
  }

  // In production: restrict to allowed origins
  const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
    : null;

  // If ALLOWED_ORIGINS is not set, allow all (backwards compatible)
  if (!allowedOrigins) {
    return {};
  }

  return {
    origin: (origin, callback) => {
      // Allow requests with no origin (curl, server-to-server, MCP clients)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    }
  };
})();

app.use(cors(corsOptions));

// Body parser
app.use(express.json());

// Rate limiting (applies to all routes)
app.use(generalLimiter);

// ── Public Routes (no auth required) ────────────────────────

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
        status: 'active',
        endpoint: '/api/tools/finance'
      },
      calendar: {
        status: 'coming soon',
        endpoint: '/api/tools/calendar'
      },
      github: {
        status: 'active',
        endpoint: '/api/tools/github'
      }
    },

    // Security info
    security: {
      authentication: process.env.API_KEY ? 'enabled' : 'disabled',
      rateLimiting: 'enabled',
      helmet: 'enabled'
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

// ── Authentication (all routes below require API key) ───────

app.use(authenticate);

// ── Strict rate limiter for write operations ────────────────

app.use(strictLimiter);

// ── Protected Routes ────────────────────────────────────────

// Streamable HTTP Endpoint for MCP connectors
app.post('/mcp', async (req, res) => {
  const mcpServer = createMcpServer();
  const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
  res.on('close', () => {
    transport.close();
    mcpServer.close();
  });
  await mcpServer.connect(transport);
  await transport.handleRequest(req, res, req.body);
});

// Stateless server HTTP GET fallback
app.get('/mcp', (req, res) => res.status(405).json({
  jsonrpc: '2.0', error: { code: -32000, message: 'Method not allowed.' }, id: null
}));

// Mount tool routes
app.use('/api/tools/todo', todoRoutes);
app.use('/api/tools/finance', financeRoutes);
app.use('/api/tools/github', githubRoutes);
// app.use('/api/tools/calendar', calendarRoutes);

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
      console.log(`🔐 Auth: ${process.env.API_KEY ? 'ENABLED' : 'DISABLED (set API_KEY in .env)'}`);
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
