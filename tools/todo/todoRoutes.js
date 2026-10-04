// Todo Routes - API endpoint definitions
// Industry standard: Clean, RESTful routing

import express from 'express';
import * as TodoController from './todoController.js';

const router = express.Router();

// Create todo
router.post('/', TodoController.addTodo);

// Get all todos (with optional filters)
router.get('/', TodoController.getTodos);

// Search todos
router.get('/search', TodoController.searchTodos);

// Get single todo
router.get('/:id', TodoController.getTodo);

// Update todo
router.put('/:id', TodoController.updateTodo);

// Delete todo
router.delete('/:id', TodoController.deleteTodo);

// Mark as complete
router.patch('/:id/complete', TodoController.completeTodo);

// Mark as pending (uncomplete)
router.patch('/:id/uncomplete', TodoController.uncompleteTodo);

export default router;
