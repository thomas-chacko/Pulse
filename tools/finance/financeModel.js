// Finance Model - Database operations
// Handles all transaction data operations

import { getDB } from '../../config/database.js';
import { ObjectId } from 'mongodb';

const COLLECTION_NAME = 'transactions';

/**
 * Get transactions collection
 */
function getTransactionsCollection() {
  const db = getDB();
  return db.collection(COLLECTION_NAME);
}

/**
 * Create a new transaction
 */
export async function createTransaction(transactionData) {
  const collection = getTransactionsCollection();
  
  const transaction = {
    amount: transactionData.amount,
    type: transactionData.type,
    category: transactionData.category,
    description: transactionData.description || '',
    date: transactionData.date ? new Date(transactionData.date) : new Date(),
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  const result = await collection.insertOne(transaction);
  return { _id: result.insertedId, ...transaction };
}

/**
 * Get all transactions with optional filters
 */
export async function getTransactions(filters = {}) {
  const collection = getTransactionsCollection();
  
  const query = {};
  
  // Filter by type
  if (filters.type) {
    query.type = filters.type;
  }
  
  // Filter by category
  if (filters.category) {
    query.category = filters.category;
  }
  
  // Filter by date range
  if (filters.startDate || filters.endDate) {
    query.date = {};
    if (filters.startDate) {
      query.date.$gte = new Date(filters.startDate);
    }
    if (filters.endDate) {
      query.date.$lte = new Date(filters.endDate);
    }
  }
  
  // Sorting (newest first by default)
  const sort = { date: -1 };
  
  // Limit
  const limit = filters.limit || 100;
  
  const transactions = await collection
    .find(query)
    .sort(sort)
    .limit(limit)
    .toArray();
  
  return transactions;
}

/**
 * Get single transaction by ID
 */
export async function getTransactionById(id) {
  const collection = getTransactionsCollection();
  
  if (!ObjectId.isValid(id)) {
    return null;
  }
  
  return await collection.findOne({ _id: new ObjectId(id) });
}

/**
 * Update transaction
 */
export async function updateTransaction(id, updates) {
  const collection = getTransactionsCollection();
  
  if (!ObjectId.isValid(id)) {
    return null;
  }
  
  const updateData = {
    updatedAt: new Date()
  };
  
  // Only include allowed fields
  const allowedFields = ['amount', 'type', 'category', 'description', 'date'];
  
  for (const field of allowedFields) {
    if (updates[field] !== undefined) {
      if (field === 'date') {
        updateData[field] = new Date(updates[field]);
      } else {
        updateData[field] = updates[field];
      }
    }
  }
  
  const result = await collection.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: updateData },
    { returnDocument: 'after' }
  );
  
  return result;
}

/**
 * Delete transaction
 */
export async function deleteTransaction(id) {
  const collection = getTransactionsCollection();
  
  if (!ObjectId.isValid(id)) {
    return false;
  }
  
  const result = await collection.deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount > 0;
}

/**
 * Get summary statistics
 */
export async function getSummary(filters = {}) {
  const collection = getTransactionsCollection();
  
  const query = {};
  
  // Filter by date range
  if (filters.startDate || filters.endDate) {
    query.date = {};
    if (filters.startDate) {
      query.date.$gte = new Date(filters.startDate);
    }
    if (filters.endDate) {
      query.date.$lte = new Date(filters.endDate);
    }
  }
  
  const transactions = await collection.find(query).toArray();
  
  const summary = {
    totalIncome: 0,
    totalExpenses: 0,
    netBalance: 0,
    transactionCount: transactions.length,
    incomeCount: 0,
    expenseCount: 0,
    byCategory: {}
  };
  
  transactions.forEach(t => {
    if (t.type === 'income') {
      summary.totalIncome += t.amount;
      summary.incomeCount++;
    } else {
      summary.totalExpenses += t.amount;
      summary.expenseCount++;
    }
    
    // Category breakdown
    if (!summary.byCategory[t.category]) {
      summary.byCategory[t.category] = {
        total: 0,
        count: 0,
        type: t.type
      };
    }
    summary.byCategory[t.category].total += t.amount;
    summary.byCategory[t.category].count++;
  });
  
  summary.netBalance = summary.totalIncome - summary.totalExpenses;
  
  // Round to 2 decimals
  summary.totalIncome = Math.round(summary.totalIncome * 100) / 100;
  summary.totalExpenses = Math.round(summary.totalExpenses * 100) / 100;
  summary.netBalance = Math.round(summary.netBalance * 100) / 100;
  
  Object.keys(summary.byCategory).forEach(cat => {
    summary.byCategory[cat].total = Math.round(summary.byCategory[cat].total * 100) / 100;
  });
  
  return summary;
}

/**
 * Get spending by category
 */
export async function getSpendingByCategory(filters = {}) {
  const collection = getTransactionsCollection();
  
  const query = { type: 'expense' };
  
  if (filters.startDate || filters.endDate) {
    query.date = {};
    if (filters.startDate) {
      query.date.$gte = new Date(filters.startDate);
    }
    if (filters.endDate) {
      query.date.$lte = new Date(filters.endDate);
    }
  }
  
  const pipeline = [
    { $match: query },
    {
      $group: {
        _id: '$category',
        total: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    },
    {
      $project: {
        category: '$_id',
        total: { $round: ['$total', 2] },
        count: 1,
        _id: 0
      }
    },
    { $sort: { total: -1 } }
  ];
  
  return await collection.aggregate(pipeline).toArray();
}

/**
 * Create indexes for better performance
 */
export async function createIndexes() {
  const collection = getTransactionsCollection();
  
  await collection.createIndex({ type: 1 });
  await collection.createIndex({ category: 1 });
  await collection.createIndex({ date: -1 });
  await collection.createIndex({ type: 1, date: -1 });
}
