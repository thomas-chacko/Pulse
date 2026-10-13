// MCP Request Handlers - Business logic for tool execution

import * as TodoModel from '../tools/todo/todoModel.js';
import * as FinanceModel from '../tools/finance/financeModel.js';

/**
 * Handle all MCP tool calls
 */
export async function handleToolCall(name, args) {
  try {
    switch (name) {
      // ==================== TODO HANDLERS ====================
      case "get_todos": {
        const todos = await TodoModel.getTodos(args || {});
        const stats = await TodoModel.getTodoStats();
        return {
          content: [{ 
            type: "text", 
            text: JSON.stringify({ todos, stats, count: todos.length }, null, 2) 
          }]
        };
      }
      
      case "create_todo": {
        const newTodo = await TodoModel.createTodo(args);
        return {
          content: [{ type: "text", text: JSON.stringify(newTodo, null, 2) }]
        };
      }
      
      case "get_todo": {
        const todo = await TodoModel.getTodoById(args.id);
        if (!todo) {
          throw new Error("Todo not found");
        }
        return {
          content: [{ type: "text", text: JSON.stringify(todo, null, 2) }]
        };
      }
      
      case "update_todo": {
        const { id, ...updates } = args;
        const updatedTodo = await TodoModel.updateTodo(id, updates);
        if (!updatedTodo) {
          throw new Error("Todo not found");
        }
        return {
          content: [{ type: "text", text: JSON.stringify(updatedTodo, null, 2) }]
        };
      }
      
      case "delete_todo": {
        const deleted = await TodoModel.deleteTodo(args.id);
        if (!deleted) {
          throw new Error("Todo not found");
        }
        return {
          content: [{ type: "text", text: JSON.stringify({ success: true, message: "Todo deleted" }, null, 2) }]
        };
      }
      
      case "complete_todo": {
        const completedTodo = await TodoModel.completeTodo(args.id);
        if (!completedTodo) {
          throw new Error("Todo not found");
        }
        return {
          content: [{ type: "text", text: JSON.stringify(completedTodo, null, 2) }]
        };
      }
      
      case "uncomplete_todo": {
        const uncompletedTodo = await TodoModel.uncompleteTodo(args.id);
        if (!uncompletedTodo) {
          throw new Error("Todo not found");
        }
        return {
          content: [{ type: "text", text: JSON.stringify(uncompletedTodo, null, 2) }]
        };
      }
      
      case "search_todos": {
        const todos = await TodoModel.searchTodos(args.query);
        return {
          content: [{ 
            type: "text", 
            text: JSON.stringify({ todos, count: todos.length, query: args.query }, null, 2) 
          }]
        };
      }
      
      // ==================== FINANCE HANDLERS ====================
      case "get_transactions": {
        const transactions = await FinanceModel.getTransactions(args || {});
        return {
          content: [{ 
            type: "text", 
            text: JSON.stringify({ transactions, count: transactions.length }, null, 2) 
          }]
        };
      }
      
      case "create_transaction": {
        const newTransaction = await FinanceModel.createTransaction(args);
        return {
          content: [{ type: "text", text: JSON.stringify(newTransaction, null, 2) }]
        };
      }
      
      case "get_transaction": {
        const transaction = await FinanceModel.getTransactionById(args.id);
        if (!transaction) {
          throw new Error("Transaction not found");
        }
        return {
          content: [{ type: "text", text: JSON.stringify(transaction, null, 2) }]
        };
      }
      
      case "update_transaction": {
        const { id, ...updates } = args;
        const updatedTransaction = await FinanceModel.updateTransaction(id, updates);
        if (!updatedTransaction) {
          throw new Error("Transaction not found");
        }
        return {
          content: [{ type: "text", text: JSON.stringify(updatedTransaction, null, 2) }]
        };
      }
      
      case "delete_transaction": {
        const deleted = await FinanceModel.deleteTransaction(args.id);
        if (!deleted) {
          throw new Error("Transaction not found");
        }
        return {
          content: [{ type: "text", text: JSON.stringify({ success: true, message: "Transaction deleted" }, null, 2) }]
        };
      }
      
      case "get_financial_summary": {
        const summary = await FinanceModel.getSummary(args || {});
        return {
          content: [{ type: "text", text: JSON.stringify(summary, null, 2) }]
        };
      }
      
      case "get_spending_by_category": {
        const spending = await FinanceModel.getSpendingByCategory(args || {});
        return {
          content: [{ 
            type: "text", 
            text: JSON.stringify({ spending, count: spending.length }, null, 2) 
          }]
        };
      }
      
      default:
        throw new Error(`Tool not found: ${name}`);
    }
  } catch (error) {
    return {
      content: [{ 
        type: "text", 
        text: JSON.stringify({ error: error.message }, null, 2) 
      }],
      isError: true
    };
  }
}
