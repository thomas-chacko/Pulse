// MCP Tool Definitions - Schema for all available tools

/**
 * Get all tool definitions for MCP ListToolsRequest
 */
export function getToolDefinitions() {
  return {
    tools: [
      // ==================== TODO TOOLS ====================
      {
        name: "get_todos",
        description: "Get a list of todos with optional filters",
        inputSchema: {
          type: "object",
          properties: {
            status: { type: "string", description: "Filter by status (pending, completed)" },
            priority: { type: "string", description: "Filter by priority (low, medium, high)" },
            tag: { type: "string", description: "Filter by tag" },
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
            priority: { type: "string", description: "Priority (low, medium, high)" },
            tags: { type: "array", items: { type: "string" }, description: "Array of tags" },
            dueDate: { type: "string", description: "Due date (YYYY-MM-DD)" }
          },
          required: ["title"]
        }
      },
      {
        name: "get_todo",
        description: "Get a single todo by ID",
        inputSchema: {
          type: "object",
          properties: {
            id: { type: "string", description: "Todo ID" }
          },
          required: ["id"]
        }
      },
      {
        name: "update_todo",
        description: "Update a todo item",
        inputSchema: {
          type: "object",
          properties: {
            id: { type: "string", description: "Todo ID" },
            title: { type: "string", description: "New title" },
            description: { type: "string", description: "New description" },
            priority: { type: "string", description: "New priority (low, medium, high)" },
            status: { type: "string", description: "New status (pending, completed)" },
            tags: { type: "array", items: { type: "string" }, description: "New tags" },
            dueDate: { type: "string", description: "New due date (YYYY-MM-DD)" }
          },
          required: ["id"]
        }
      },
      {
        name: "delete_todo",
        description: "Delete a todo item",
        inputSchema: {
          type: "object",
          properties: {
            id: { type: "string", description: "Todo ID" }
          },
          required: ["id"]
        }
      },
      {
        name: "complete_todo",
        description: "Mark a todo as complete",
        inputSchema: {
          type: "object",
          properties: {
            id: { type: "string", description: "Todo ID" }
          },
          required: ["id"]
        }
      },
      {
        name: "uncomplete_todo",
        description: "Mark a todo as pending (uncomplete)",
        inputSchema: {
          type: "object",
          properties: {
            id: { type: "string", description: "Todo ID" }
          },
          required: ["id"]
        }
      },
      {
        name: "search_todos",
        description: "Search todos by keyword in title or description",
        inputSchema: {
          type: "object",
          properties: {
            query: { type: "string", description: "Search query" }
          },
          required: ["query"]
        }
      },
      
      // ==================== FINANCE TOOLS ====================
      {
        name: "get_transactions",
        description: "Get a list of transactions with optional filters",
        inputSchema: {
          type: "object",
          properties: {
            type: { type: "string", description: "Filter by type (income, expense)" },
            category: { type: "string", description: "Filter by category" },
            startDate: { type: "string", description: "Start date (YYYY-MM-DD)" },
            endDate: { type: "string", description: "End date (YYYY-MM-DD)" },
            limit: { type: "number", description: "Maximum number of transactions to return" }
          }
        }
      },
      {
        name: "create_transaction",
        description: "Create a new transaction (income or expense)",
        inputSchema: {
          type: "object",
          properties: {
            amount: { type: "number", description: "Transaction amount" },
            type: { type: "string", description: "Type (income or expense)" },
            category: { type: "string", description: "Category (e.g., food, salary)" },
            description: { type: "string", description: "Transaction description" },
            date: { type: "string", description: "Transaction date (YYYY-MM-DD)" }
          },
          required: ["amount", "type", "category"]
        }
      },
      {
        name: "get_transaction",
        description: "Get a single transaction by ID",
        inputSchema: {
          type: "object",
          properties: {
            id: { type: "string", description: "Transaction ID" }
          },
          required: ["id"]
        }
      },
      {
        name: "update_transaction",
        description: "Update a transaction",
        inputSchema: {
          type: "object",
          properties: {
            id: { type: "string", description: "Transaction ID" },
            amount: { type: "number", description: "New amount" },
            type: { type: "string", description: "New type (income, expense)" },
            category: { type: "string", description: "New category" },
            description: { type: "string", description: "New description" },
            date: { type: "string", description: "New date (YYYY-MM-DD)" }
          },
          required: ["id"]
        }
      },
      {
        name: "delete_transaction",
        description: "Delete a transaction",
        inputSchema: {
          type: "object",
          properties: {
            id: { type: "string", description: "Transaction ID" }
          },
          required: ["id"]
        }
      },
      {
        name: "get_financial_summary",
        description: "Get financial summary with income, expenses, and balance",
        inputSchema: {
          type: "object",
          properties: {
            startDate: { type: "string", description: "Start date (YYYY-MM-DD)" },
            endDate: { type: "string", description: "End date (YYYY-MM-DD)" }
          }
        }
      },
      {
        name: "get_spending_by_category",
        description: "Get spending breakdown by category",
        inputSchema: {
          type: "object",
          properties: {
            startDate: { type: "string", description: "Start date (YYYY-MM-DD)" },
            endDate: { type: "string", description: "End date (YYYY-MM-DD)" }
          }
        }
      }
    ]
  };
}
