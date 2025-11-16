import * as SQLite from 'expo-sqlite';

// Simple in-memory mock database for development

let tasks = [];
let taskCollaborators = [];

let nextUserId = 3;
let nextTaskId = 1;
let nextCollaboratorId = 1;

export const initDatabase = () => {
  console.log('Mock database initialized');
  return Promise.resolve();
};

export const addUser = (email, password) => {
  return new Promise((resolve, reject) => {
    if (users.find(u => u.email === email)) {
      reject(new Error('User already exists'));
      return;
    }
    
    const newUser = { id: nextUserId++, email, password };
    users.push(newUser);
    resolve(newUser.id);
  });
};

export const getUserByEmail = (email) => {
  return Promise.resolve(users.find(u => u.email === email) || null);
};

export const addTask = (title, description, ownerId) => {
  const user = users.find(u => u.id === ownerId);
  const newTask = {
    id: nextTaskId++,
    title,
    description,
    completed: false,
    ownerId,
    ownerEmail: user?.email || 'Unknown'
  };
  tasks.push(newTask);
  return Promise.resolve(newTask.id);
};

export const getTasksForUser = (userId) => {
  const userCollaborations = taskCollaborators
    .filter(tc => tc.userId === userId)
    .map(tc => tc.taskId);
  
  return Promise.resolve(tasks.filter(task => 
    task.ownerId === userId || userCollaborations.includes(task.id)
  ));
};

export const updateTask = (taskId, title, description, completed) => {
  const taskIndex = tasks.findIndex(t => t.id === taskId);
  if (taskIndex !== -1) {
    tasks[taskIndex] = {
      ...tasks[taskIndex],
      title,
      description,
      completed
    };
  }
  return Promise.resolve();
};

export const deleteTask = (taskId) => {
  tasks = tasks.filter(t => t.id !== taskId);
  taskCollaborators = taskCollaborators.filter(tc => tc.taskId !== taskId);
  return Promise.resolve();
};

export const toggleTaskCompletion = (taskId, completed) => {
  const taskIndex = tasks.findIndex(t => t.id === taskId);
  if (taskIndex !== -1) {
    tasks[taskIndex].completed = completed;
  }
  return Promise.resolve();
};

export const shareTaskWithUser = (taskId, userEmail) => {
  return new Promise((resolve, reject) => {
    const user = users.find(u => u.email === userEmail);
    if (!user) {
      reject(new Error('User not found'));
      return;
    }

    const existingCollaboration = taskCollaborators.find(
      tc => tc.taskId === taskId && tc.userId === user.id
    );

    if (!existingCollaboration) {
      const newCollaboration = {
        id: nextCollaboratorId++,
        taskId,
        userId: user.id
      };
      taskCollaborators.push(newCollaboration);
    }
    resolve();
  });
};

export const getCollaboratorsForTask = (taskId) => {
  const collaborators = taskCollaborators
    .filter(tc => tc.taskId === taskId)
    .map(tc => {
      const user = users.find(u => u.id === tc.userId);
      return { id: user.id, email: user.email };
    });
  return Promise.resolve(collaborators);
};

export const getAllUsers = () => {
  return Promise.resolve(users.map(u => ({ id: u.id, email: u.email })));
};