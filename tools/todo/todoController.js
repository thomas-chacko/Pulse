// Todo Controller - Business logic and request handling
// Industry standard: Keep routes thin, controllers handle logic

import * as TodoModel from './todoModel.js';

/**
 * Add a new todo
 */
export async function addTodo(req, res) {
  try {
    const { title, description, priority, tags, dueDate } = req.body;
    
    // Validation
    if (!title || title.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Title is required'
      });
    }
    
    if (title.length > 200) {
      return res.status(400).json({
        success: false,
        error: 'Title must be 200 characters or less'
      });
    }
    
    if (priority && !['low', 'medium', 'high'].includes(priority)) {
      return res.status(400).json({
        success: false,
        error: 'Priority must be: low, medium, or high'
      });
    }
    
    // Create todo
    const todo = await TodoModel.createTodo({
      title: title.trim(),
      description: description?.trim(),
      priority,
      tags: Array.isArray(tags) ? tags : [],
      dueDate
    });
    
    res.status(201).json({
      success: true,
      todo
    });
  } catch (error) {
    console.error('Error adding todo:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add todo',
      message: error.message
    });
  }
}

/**
 * Get all todos with filters
 */
export async function getTodos(req, res) {
  try {
    const { status, priority, tag, limit } = req.query;
    
    const filters = {};
    
    if (status) filters.status = status;
    if (priority) filters.priority = priority;
    if (tag) filters.tag = tag;
    if (limit) filters.limit = parseInt(limit);
    
    const todos = await TodoModel.getTodos(filters);
    const stats = await TodoModel.getTodoStats();
    
    res.json({
      success: true,
      todos,
      count: todos.length,
      stats
    });
  } catch (error) {
    console.error('Error getting todos:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get todos',
      message: error.message
    });
  }
}

/**
 * Get single todo by ID
 */
export async function getTodo(req, res) {
  try {
    const { id } = req.params;
    
    const todo = await TodoModel.getTodoById(id);
    
    if (!todo) {
      return res.status(404).json({
        success: false,
        error: 'Todo not found'
      });
    }
    
    res.json({
      success: true,
      todo
    });
  } catch (error) {
    console.error('Error getting todo:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get todo',
      message: error.message
    });
  }
}

/**
 * Update todo
 */
export async function updateTodo(req, res) {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Validation
    if (updates.title !== undefined) {
      if (!updates.title || updates.title.trim().length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Title cannot be empty'
        });
      }
      
      if (updates.title.length > 200) {
        return res.status(400).json({
          success: false,
          error: 'Title must be 200 characters or less'
        });
      }
      
      updates.title = updates.title.trim();
    }
    
    if (updates.status && !['pending', 'completed'].includes(updates.status)) {
      return res.status(400).json({
        success: false,
        error: 'Status must be: pending or completed'
      });
    }
    
    if (updates.priority && !['low', 'medium', 'high'].includes(updates.priority)) {
      return res.status(400).json({
        success: false,
        error: 'Priority must be: low, medium, or high'
      });
    }
    
    const todo = await TodoModel.updateTodo(id, updates);
    
    if (!todo) {
      return res.status(404).json({
        success: false,
        error: 'Todo not found'
      });
    }
    
    res.json({
      success: true,
      todo
    });
  } catch (error) {
    console.error('Error updating todo:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update todo',
      message: error.message
    });
  }
}

/**
 * Delete todo
 */
export async function deleteTodo(req, res) {
  try {
    const { id } = req.params;
    
    const deleted = await TodoModel.deleteTodo(id);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Todo not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Todo deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting todo:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete todo',
      message: error.message
    });
  }
}

/**
 * Mark todo as complete
 */
export async function completeTodo(req, res) {
  try {
    const { id } = req.params;
    
    const todo = await TodoModel.completeTodo(id);
    
    if (!todo) {
      return res.status(404).json({
        success: false,
        error: 'Todo not found'
      });
    }
    
    res.json({
      success: true,
      todo,
      message: 'Todo marked as complete'
    });
  } catch (error) {
    console.error('Error completing todo:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to complete todo',
      message: error.message
    });
  }
}

/**
 * Mark todo as pending (uncomplete)
 */
export async function uncompleteTodo(req, res) {
  try {
    const { id } = req.params;
    
    const todo = await TodoModel.uncompleteTodo(id);
    
    if (!todo) {
      return res.status(404).json({
        success: false,
        error: 'Todo not found'
      });
    }
    
    res.json({
      success: true,
      todo,
      message: 'Todo marked as pending'
    });
  } catch (error) {
    console.error('Error uncompleting todo:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to uncomplete todo',
      message: error.message
    });
  }
}

/**
 * Search todos
 */
export async function searchTodos(req, res) {
  try {
    const { q } = req.query;
    
    if (!q || q.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Search query is required'
      });
    }
    
    const todos = await TodoModel.searchTodos(q.trim());
    
    res.json({
      success: true,
      todos,
      count: todos.length,
      query: q
    });
  } catch (error) {
    console.error('Error searching todos:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search todos',
      message: error.message
    });
  }
}
