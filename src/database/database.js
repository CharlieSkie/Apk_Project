import * as SQLite from 'expo-sqlite';

// Safe database initialization
let db = null;

const initDb = () => {
  if (!db) {
    try {
      // Use the new synchronous opening method
      db = SQLite.openDatabaseSync('todoapp.db');
      console.log('✅ Database opened successfully');
    } catch (error) {
      console.error('❌ Error opening database:', error);
      throw error;
    }
  }
  return db;
};

export const initDatabase = async () => {
  try {
    const database = initDb();
    
    // Create users table
    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
      );
    `);
    console.log('✅ Users table ready');

    // Create tasks table
    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        completed INTEGER DEFAULT 0,
        ownerId INTEGER NOT NULL
      );
    `);
    console.log('✅ Tasks table ready');

    // Create task_collaborators table
    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS task_collaborators (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        taskId INTEGER NOT NULL,
        userId INTEGER NOT NULL,
        UNIQUE(taskId, userId)
      );
    `);
    console.log('✅ Collaborators table ready');

    console.log('🎉 Database initialized successfully');
    return database;
  } catch (error) {
    console.error('❌ Database initialization error:', error);
    throw error;
  }
};

// User operations
export const addUser = async (name, email, password) => {
  try {
    const db = initDb();
    const result = await db.runAsync(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?);',
      [name, email, password]
    );
    console.log('✅ User added:', result.lastInsertRowId);
    return result.lastInsertRowId;
  } catch (error) {
    console.log('❌ Add user error:', error);
    throw error;
  }
};

export const getUserByEmail = async (email) => {
  try {
    const db = initDb();
    const result = await db.getFirstAsync(
      'SELECT * FROM users WHERE email = ?;',
      [email]
    );
    return result;
  } catch (error) {
    console.log('❌ Get user error:', error);
    throw error;
  }
};

// Task operations
export const addTask = async (title, description, ownerId) => {
  try {
    const db = initDb();
    const result = await db.runAsync(
      'INSERT INTO tasks (title, description, ownerId) VALUES (?, ?, ?);',
      [title, description, ownerId]
    );
    console.log('✅ Task added:', result.lastInsertRowId);
    return result.lastInsertRowId;
  } catch (error) {
    console.log('❌ Add task error:', error);
    throw error;
  }
};

export const getTasksForUser = async (userId) => {
  try {
    const db = initDb();
    const result = await db.getAllAsync(
      `SELECT t.*, u.name as ownerName, u.email as ownerEmail 
       FROM tasks t 
       LEFT JOIN users u ON t.ownerId = u.id 
       WHERE t.ownerId = ? OR t.id IN (
         SELECT taskId FROM task_collaborators WHERE userId = ?
       )
       ORDER BY t.completed ASC, t.id DESC;`,
      [userId, userId]
    );
    console.log('✅ Tasks loaded:', result.length);
    return result;
  } catch (error) {
    console.log('❌ Get tasks error:', error);
    throw error;
  }
};

export const updateTask = async (taskId, title, description, completed) => {
  try {
    const db = initDb();
    const result = await db.runAsync(
      'UPDATE tasks SET title = ?, description = ?, completed = ? WHERE id = ?;',
      [title, description, completed ? 1 : 0, taskId]
    );
    return result;
  } catch (error) {
    console.log('❌ Update task error:', error);
    throw error;
  }
};

export const deleteTask = async (taskId) => {
  try {
    const db = initDb();
    
    // First delete collaborators
    await db.runAsync('DELETE FROM task_collaborators WHERE taskId = ?;', [taskId]);
    
    // Then delete the task
    const result = await db.runAsync('DELETE FROM tasks WHERE id = ?;', [taskId]);
    return result;
  } catch (error) {
    console.log('❌ Delete task error:', error);
    throw error;
  }
};

export const toggleTaskCompletion = async (taskId, completed) => {
  try {
    const db = initDb();
    const result = await db.runAsync(
      'UPDATE tasks SET completed = ? WHERE id = ?;',
      [completed ? 1 : 0, taskId]
    );
    return result;
  } catch (error) {
    console.log('❌ Toggle task error:', error);
    throw error;
  }
};

// Collaboration functions
export const shareTaskWithUser = async (taskId, userEmail) => {
  try {
    const user = await getUserByEmail(userEmail);
    if (!user) {
      throw new Error('User not found');
    }

    const db = initDb();
    const result = await db.runAsync(
      'INSERT OR IGNORE INTO task_collaborators (taskId, userId) VALUES (?, ?);',
      [taskId, user.id]
    );
    return result;
  } catch (error) {
    console.log('❌ Share task error:', error);
    throw error;
  }
};

export const getCollaboratorsForTask = async (taskId) => {
  try {
    const db = initDb();
    const result = await db.getAllAsync(
      `SELECT u.id, u.name, u.email 
       FROM users u 
       INNER JOIN task_collaborators tc ON u.id = tc.userId 
       WHERE tc.taskId = ?;`,
      [taskId]
    );
    return result;
  } catch (error) {
    console.log('❌ Get collaborators error:', error);
    throw error;
  }
};

export const getAllUsers = async () => {
  try {
    const db = initDb();
    const result = await db.getAllAsync(
      'SELECT id, name, email FROM users;',
      []
    );
    return result;
  } catch (error) {
    console.log('❌ Get all users error:', error);
    throw error;
  }
};

export default initDb;