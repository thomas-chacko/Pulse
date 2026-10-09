// Personal MCP Server
// Modern, scalable architecture with feature-based structure

import express from 'express';
import dotenv from 'dotenv';
import { connectDB, closeDB, isConnected, getDB } from './config/database.js';
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import * as TodoModel from './tools/todo/todoModel.js';

// Tool routes
import todoRoutes from './tools/todo/todoRoutes.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Set up MCP Server
const mcpServer = new Server({
  name: "personal-mcp-server",
  version: "1.0.0"
}, {
  capabilities: { tools: {} }
});

// Configure MCP Tools
mcpServer.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "get_todos",
        description: "Get a list of todos with optional filters",
        inputSchema: {
          type: "object",
          properties: {
            status: { type: "string", description: "Filter by status (pending, completed)" },
            priority: { type: "string", description: "Filter by priority (low, medium, high)" },
            limit: { type: "number", description: "Maximum number of todos to return" }
          }
        }
      },
      {
        name: "create_todo",
        description: "Create a new todo item",
        inputSchema: {
          type: "object",
          properties: {
            title: { type: "string", description: "Title of the todo" },
            description: { type: "string", description: "Description of the todo" },
            priority: { type: "string", description: "Priority (low, medium, high)" }
          },
          required: ["title"]
        }
      }
    ]
  };
});

mcpServer.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === "get_todos") {
    const filters = request.params.arguments || {};
    const todos = await TodoModel.getTodos(filters);
    return {
      content: [{ type: "text", text: JSON.stringify(todos, null, 2) }]
    };
  } else if (request.params.name === "create_todo") {
    const newTodo = await TodoModel.createTodo(request.params.arguments);
    return {
      content: [{ type: "text", text: JSON.stringify(newTodo, null, 2) }]
    };
  }
  
  throw new Error(`Tool not found: ${request.params.name}`);
});

let transport = null;

// SSE Endpoint for MCP connectors
app.get('/mcp', async (req, res) => {
  console.log('Received MCP connection request');
  transport = new SSEServerTransport("/message", res);
  await mcpServer.connect(transport);
});

// Message Endpoint for MCP connectors
app.post('/message', async (req, res) => {
  if (transport) {
    await transport.handlePostMessage(req, res);
  } else {
    res.status(400).send("MCP transport not initialized");
  }
});

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
