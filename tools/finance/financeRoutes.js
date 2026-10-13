// Finance Routes - API endpoint definitions

import express from 'express';
import * as FinanceController from './financeController.js';

const router = express.Router();

// Get available categories
router.get('/categories', FinanceController.getCategories);

// Get summary
router.get('/summary', FinanceController.getSummary);

// Get spending by category
router.get('/spending', FinanceController.getSpendingByCategory);

// Create transaction
router.post('/', FinanceController.addTransaction);

// Get all transactions (with optional filters)
router.get('/', FinanceController.getTransactions);

// Get single transaction
router.get('/:id', FinanceController.getTransaction);

// Update transaction
router.put('/:id', FinanceController.updateTransaction);

// Delete transaction
router.delete('/:id', FinanceController.deleteTransaction);

export default router;
