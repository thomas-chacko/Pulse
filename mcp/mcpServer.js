// MCP Server Configuration - Server setup and initialization

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { getToolDefinitions } from './mcpTools.js';
import { handleToolCall } from './mcpHandlers.js';

/**
 * Create and configure MCP server instance
 */
export function createMcpServer() {
  const mcpServer = new Server({
    name: "personal-mcp-server",
    version: "1.0.0"
  }, {
    capabilities: { tools: {} }
  });

  // Register tool list handler
  mcpServer.setRequestHandler(ListToolsRequestSchema, async () => {
    return getToolDefinitions();
  });

  // Register tool execution handler
  mcpServer.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    return await handleToolCall(name, args);
  });

  return mcpServer;
}
