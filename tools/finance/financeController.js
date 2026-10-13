// Finance Controller - Business logic and request handling

import * as FinanceModel from './financeModel.js';

// Common expense and income categories
const EXPENSE_CATEGORIES = [
  'food', 'transport', 'utilities', 'entertainment', 'shopping',
  'health', 'education', 'bills', 'rent', 'insurance', 'other'
];

const INCOME_CATEGORIES = [
  'salary', 'freelance', 'investment', 'gift', 'refund', 'other'
];

/**
 * Create a new transaction
 */
export async function addTransaction(req, res) {
  try {
    const { amount, type, category, description, date } = req.body;
    
    // Validation
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Amount must be greater than 0'
      });
    }
    
    if (!type || !['income', 'expense'].includes(type)) {
      return res.status(400).json({
        success: false,
        error: 'Type must be: income or expense'
      });
    }
    
    if (!category || category.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Category is required'
      });
    }
    
    // Validate category based on type
    const validCategories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
    if (!validCategories.includes(category.toLowerCase())) {
      return res.status(400).json({
        success: false,
        error: `Invalid category for ${type}. Valid categories: ${validCategories.join(', ')}`
      });
    }
    
    // Create transaction
    const transaction = await FinanceModel.createTransaction({
      amount: parseFloat(amount),
      type,
      category: category.toLowerCase(),
      description: description?.trim(),
      date
    });
    
    res.status(201).json({
      success: true,
      transaction
    });
  } catch (error) {
    console.error('Error adding transaction:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add transaction',
      message: error.message
    });
  }
}

/**
 * Get all transactions with filters
 */
export async function getTransactions(req, res) {
  try {
    const { type, category, startDate, endDate, limit } = req.query;
    
    const filters = {};
    
    if (type) filters.type = type;
    if (category) filters.category = category.toLowerCase();
    if (startDate) filters.startDate = startDate;
    if (endDate) filters.endDate = endDate;
    if (limit) filters.limit = parseInt(limit);
    
    const transactions = await FinanceModel.getTransactions(filters);
    
    res.json({
      success: true,
      transactions,
      count: transactions.length
    });
  } catch (error) {
    console.error('Error getting transactions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get transactions',
      message: error.message
    });
  }
}

/**
 * Get single transaction by ID
 */
export async function getTransaction(req, res) {
  try {
    const { id } = req.params;
    
    const transaction = await FinanceModel.getTransactionById(id);
    
    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: 'Transaction not found'
      });
    }
    
    res.json({
      success: true,
      transaction
    });
  } catch (error) {
    console.error('Error getting transaction:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get transaction',
      message: error.message
    });
  }
}

/**
 * Update transaction
 */
export async function updateTransaction(req, res) {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Validation
    if (updates.amount !== undefined && updates.amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Amount must be greater than 0'
      });
    }
    
    if (updates.type && !['income', 'expense'].includes(updates.type)) {
      return res.status(400).json({
        success: false,
        error: 'Type must be: income or expense'
      });
    }
    
    if (updates.category) {
      const type = updates.type || 'expense'; // Default to expense if not specified
      const validCategories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
      if (!validCategories.includes(updates.category.toLowerCase())) {
        return res.status(400).json({
          success: false,
          error: `Invalid category for ${type}. Valid categories: ${validCategories.join(', ')}`
        });
      }
      updates.category = updates.category.toLowerCase();
    }
    
    if (updates.amount !== undefined) {
      updates.amount = parseFloat(updates.amount);
    }
    
    const transaction = await FinanceModel.updateTransaction(id, updates);
    
    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: 'Transaction not found'
      });
    }
    
    res.json({
      success: true,
      transaction
    });
  } catch (error) {
    console.error('Error updating transaction:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update transaction',
      message: error.message
    });
  }
}

/**
 * Delete transaction
 */
export async function deleteTransaction(req, res) {
  try {
    const { id } = req.params;
    
    const deleted = await FinanceModel.deleteTransaction(id);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Transaction not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Transaction deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete transaction',
      message: error.message
    });
  }
}

/**
 * Get financial summary
 */
export async function getSummary(req, res) {
  try {
    const { startDate, endDate } = req.query;
    
    const filters = {};
    if (startDate) filters.startDate = startDate;
    if (endDate) filters.endDate = endDate;
    
    const summary = await FinanceModel.getSummary(filters);
    
    res.json({
      success: true,
      summary,
      period: {
        startDate: startDate || 'all time',
        endDate: endDate || 'now'
      }
    });
  } catch (error) {
    console.error('Error getting summary:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get summary',
      message: error.message
    });
  }
}

/**
 * Get spending by category
 */
export async function getSpendingByCategory(req, res) {
  try {
    const { startDate, endDate } = req.query;
    
    const filters = {};
    if (startDate) filters.startDate = startDate;
    if (endDate) filters.endDate = endDate;
    
    const spending = await FinanceModel.getSpendingByCategory(filters);
    
    res.json({
      success: true,
      spending,
      count: spending.length
    });
  } catch (error) {
    console.error('Error getting spending by category:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get spending by category',
      message: error.message
    });
  }
}

/**
 * Get available categories
 */
export async function getCategories(req, res) {
  try {
    res.json({
      success: true,
      categories: {
        income: INCOME_CATEGORIES,
        expense: EXPENSE_CATEGORIES
      }
    });
  } catch (error) {
    console.error('Error getting categories:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get categories',
      message: error.message
    });
  }
}
