// Todo Model - Database operations
// Industry standard: Separation of data layer from business logic

import { getDB } from '../../config/database.js';
import { ObjectId } from 'mongodb';

const COLLECTION_NAME = 'todos';

/**
 * Get todos collection
 */
function getTodosCollection() {
  const db = getDB();
  return db.collection(COLLECTION_NAME);
}

/**
 * Create a new todo
 */
export async function createTodo(todoData) {
  const collection = getTodosCollection();
  
  const todo = {
    title: todoData.title,
    description: todoData.description || '',
    status: 'pending',
    priority: todoData.priority || 'medium',
    tags: todoData.tags || [],
    dueDate: todoData.dueDate || null,
    createdAt: new Date(),
    updatedAt: new Date(),
    completedAt: null
  };
  
  const result = await collection.insertOne(todo);
  return { _id: result.insertedId, ...todo };
}

/**
 * Get all todos with optional filters
 */
export async function getTodos(filters = {}) {
  const collection = getTodosCollection();
  
  const query = {};
  
  // Apply filters
  if (filters.status) {
    query.status = filters.status;
  }
  
  if (filters.priority) {
    query.priority = filters.priority;
  }
  
  if (filters.tag) {
    query.tags = filters.tag;
  }
  
  // Sorting (newest first by default)
  const sort = { createdAt: -1 };
  
  // Limit
  const limit = filters.limit || 100;
  
  const todos = await collection
    .find(query)
    .sort(sort)
    .limit(limit)
    .toArray();
  
  return todos;
}

/**
 * Get single todo by ID
 */
export async function getTodoById(id) {
  const collection = getTodosCollection();
  
  if (!ObjectId.isValid(id)) {
    return null;
  }
  
  return await collection.findOne({ _id: new ObjectId(id) });
}

/**
 * Update todo
 */
export async function updateTodo(id, updates) {
  const collection = getTodosCollection();
  
  if (!ObjectId.isValid(id)) {
    return null;
  }
  
  // Prepare update data
  const updateData = {
    updatedAt: new Date()
  };
  
  // Only include allowed fields
  const allowedFields = ['title', 'description', 'status', 'priority', 'tags', 'dueDate'];
  
  for (const field of allowedFields) {
    if (updates[field] !== undefined) {
      updateData[field] = updates[field];
    }
  }
  
  // If status changed to completed, set completedAt
  if (updates.status === 'completed') {
    updateData.completedAt = new Date();
  }
  
  // If status changed to pending, clear completedAt
  if (updates.status === 'pending') {
    updateData.completedAt = null;
  }
  
  const result = await collection.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: updateData },
    { returnDocument: 'after' }
  );
  
  return result;
}

/**
 * Delete todo
 */
export async function deleteTodo(id) {
  const collection = getTodosCollection();
  
  if (!ObjectId.isValid(id)) {
    return false;
  }
  
  const result = await collection.deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount > 0;
}

/**
 * Mark todo as complete
 */
export async function completeTodo(id) {
  return await updateTodo(id, { 
    status: 'completed',
    completedAt: new Date()
  });
}

/**
 * Mark todo as pending (uncomplete)
 */
export async function uncompleteTodo(id) {
  return await updateTodo(id, { 
    status: 'pending',
    completedAt: null
  });
}

/**
 * Search todos by text
 */
export async function searchTodos(query) {
  const collection = getTodosCollection();
  
  const searchQuery = {
    $or: [
      { title: { $regex: query, $options: 'i' } },
      { description: { $regex: query, $options: 'i' } }
    ]
  };
  
  return await collection.find(searchQuery).sort({ createdAt: -1 }).toArray();
}

/**
 * Get todo statistics
 */
export async function getTodoStats() {
  const collection = getTodosCollection();
  
  const [total, pending, completed] = await Promise.all([
    collection.countDocuments(),
    collection.countDocuments({ status: 'pending' }),
    collection.countDocuments({ status: 'completed' })
  ]);
  
  return { total, pending, completed };
}

/**
 * Create indexes for better performance
 */
export async function createIndexes() {
  const collection = getTodosCollection();
  
  await collection.createIndex({ status: 1, priority: 1 });
  await collection.createIndex({ createdAt: -1 });
  await collection.createIndex({ dueDate: 1 });
  await collection.createIndex({ tags: 1 });
}
