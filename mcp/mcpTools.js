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
      },

      // ==================== GITHUB TOOLS ====================
      {
        name: "github_get_profile",
        description: "Get GitHub profile info for personal or company account",
        inputSchema: {
          type: "object",
          properties: {
            account: { type: "string", description: "Which account to use: 'personal' or 'company' (default: personal)" }
          }
        }
      },
      {
        name: "github_get_summary",
        description: "Get a full summary of a GitHub account: profile, repo stats, top languages, recent repos",
        inputSchema: {
          type: "object",
          properties: {
            account: { type: "string", description: "Which account to use: 'personal' or 'company' (default: personal)" }
          }
        }
      },
      {
        name: "github_get_repos",
        description: "List repositories for personal or company GitHub account",
        inputSchema: {
          type: "object",
          properties: {
            account: { type: "string", description: "Which account: 'personal' or 'company' (default: personal)" },
            type: { type: "string", description: "Filter: all, owner, member (default: all)" },
            sort: { type: "string", description: "Sort by: updated, created, pushed, full_name (default: updated)" },
            limit: { type: "number", description: "Max repos to return (default: 20)" }
          }
        }
      },
      {
        name: "github_search_repos",
        description: "Search repositories by keyword within a GitHub account",
        inputSchema: {
          type: "object",
          properties: {
            account: { type: "string", description: "Which account: 'personal' or 'company' (default: personal)" },
            query: { type: "string", description: "Search keyword" },
            limit: { type: "number", description: "Max results (default: 10)" }
          },
          required: ["query"]
        }
      },
      {
        name: "github_get_repo",
        description: "Get detailed info about a specific repository",
        inputSchema: {
          type: "object",
          properties: {
            account: { type: "string", description: "Which account: 'personal' or 'company' (default: personal)" },
            owner: { type: "string", description: "Repository owner (username or org)" },
            repo: { type: "string", description: "Repository name" }
          },
          required: ["owner", "repo"]
        }
      },
      {
        name: "github_get_issues",
        description: "List issues for a GitHub repository",
        inputSchema: {
          type: "object",
          properties: {
            account: { type: "string", description: "Which account: 'personal' or 'company' (default: personal)" },
            owner: { type: "string", description: "Repository owner" },
            repo: { type: "string", description: "Repository name" },
            state: { type: "string", description: "Filter by state: open, closed, all (default: open)" },
            limit: { type: "number", description: "Max issues to return (default: 20)" }
          },
          required: ["owner", "repo"]
        }
      },
      {
        name: "github_create_issue",
        description: "Create a new issue in a GitHub repository",
        inputSchema: {
          type: "object",
          properties: {
            account: { type: "string", description: "Which account: 'personal' or 'company' (default: personal)" },
            owner: { type: "string", description: "Repository owner" },
            repo: { type: "string", description: "Repository name" },
            title: { type: "string", description: "Issue title" },
            body: { type: "string", description: "Issue description" },
            labels: { type: "array", items: { type: "string" }, description: "Labels to apply" },
            assignees: { type: "array", items: { type: "string" }, description: "Usernames to assign" }
          },
          required: ["owner", "repo", "title"]
        }
      },
      {
        name: "github_get_pull_requests",
        description: "List pull requests for a GitHub repository",
        inputSchema: {
          type: "object",
          properties: {
            account: { type: "string", description: "Which account: 'personal' or 'company' (default: personal)" },
            owner: { type: "string", description: "Repository owner" },
            repo: { type: "string", description: "Repository name" },
            state: { type: "string", description: "Filter: open, closed, all (default: open)" },
            limit: { type: "number", description: "Max PRs to return (default: 20)" }
          },
          required: ["owner", "repo"]
        }
      },
      {
        name: "github_get_commits",
        description: "List recent commits for a GitHub repository",
        inputSchema: {
          type: "object",
          properties: {
            account: { type: "string", description: "Which account: 'personal' or 'company' (default: personal)" },
            owner: { type: "string", description: "Repository owner" },
            repo: { type: "string", description: "Repository name" },
            limit: { type: "number", description: "Max commits to return (default: 15)" }
          },
          required: ["owner", "repo"]
        }
      }
    ]
  };
}
