import AsyncStorage from '@react-native-async-storage/async-storage';

// Keys for AsyncStorage
const USERS_KEY = 'todoapp_users';
const TASKS_KEY = 'todoapp_tasks';
const COLLABORATORS_KEY = 'todoapp_collaborators';

// Load data from AsyncStorage
const loadData = async () => {
  try {
    const usersData = await AsyncStorage.getItem(USERS_KEY);
    const tasksData = await AsyncStorage.getItem(TASKS_KEY);
    const collaboratorsData = await AsyncStorage.getItem(COLLABORATORS_KEY);
    
    return {
      users: usersData ? JSON.parse(usersData) : [],
      tasks: tasksData ? JSON.parse(tasksData) : [],
      collaborators: collaboratorsData ? JSON.parse(collaboratorsData) : [],
    };
  } catch (error) {
    console.error('Error loading data:', error);
    return { users: [], tasks: [], collaborators: [] };
  }
};

// Save data to AsyncStorage
const saveData = async (data) => {
  try {
    await AsyncStorage.setItem(USERS_KEY, JSON.stringify(data.users));
    await AsyncStorage.setItem(TASKS_KEY, JSON.stringify(data.tasks));
    await AsyncStorage.setItem(COLLABORATORS_KEY, JSON.stringify(data.collaborators));
  } catch (error) {
    console.error('Error saving data:', error);
  }
};

// Get next IDs
const getNextIds = async () => {
  const data = await loadData();
  const nextUserId = data.users.length > 0 ? Math.max(...data.users.map(u => u.id)) + 1 : 1;
  const nextTaskId = data.tasks.length > 0 ? Math.max(...data.tasks.map(t => t.id)) + 1 : 1;
  const nextCollaboratorId = data.collaborators.length > 0 ? Math.max(...data.collaborators.map(tc => tc.id)) + 1 : 1;
  
  return { nextUserId, nextTaskId, nextCollaboratorId };
};

export const initDatabase = async () => {
  try {
    // Just load data to initialize
    await loadData();
    console.log('Database initialized with persistent storage');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
};

export const addUser = async (name, email, password) => {
  try {
    const data = await loadData();
    const { nextUserId } = await getNextIds();
    
    // Check if user already exists
    if (data.users.find(u => u.email === email)) {
      throw new Error('User already exists');
    }
    
    const newUser = { 
      id: nextUserId, 
      name, 
      email, 
      password 
    };
    
    data.users.push(newUser);
    await saveData(data);
    return newUser.id;
  } catch (error) {
    console.error('Error adding user:', error);
    throw error;
  }
};

export const getUserByEmail = async (email) => {
  try {
    const data = await loadData();
    return data.users.find(u => u.email === email) || null;
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
};

export const addTask = async (title, description, ownerId) => {
  try {
    const data = await loadData();
    const { nextTaskId } = await getNextIds();
    
    const user = data.users.find(u => u.id === ownerId);
    const newTask = {
      id: nextTaskId,
      title,
      description,
      completed: false,
      ownerId,
      ownerName: user?.name || 'Unknown',
      ownerEmail: user?.email || 'Unknown'
    };
    
    data.tasks.push(newTask);
    await saveData(data);
    return newTask.id;
  } catch (error) {
    console.error('Error adding task:', error);
    throw error;
  }
};

export const getTasksForUser = async (userId) => {
  try {
    const data = await loadData();
    const userCollaborations = data.collaborators
      .filter(tc => tc.userId === userId)
      .map(tc => tc.taskId);
    
    return data.tasks.filter(task => 
      task.ownerId === userId || userCollaborations.includes(task.id)
    );
  } catch (error) {
    console.error('Error getting tasks:', error);
    return [];
  }
};

export const updateTask = async (taskId, title, description, completed) => {
  try {
    const data = await loadData();
    const taskIndex = data.tasks.findIndex(t => t.id === taskId);
    
    if (taskIndex !== -1) {
      data.tasks[taskIndex] = {
        ...data.tasks[taskIndex],
        title,
        description,
        completed
      };
      await saveData(data);
    }
  } catch (error) {
    console.error('Error updating task:', error);
    throw error;
  }
};

export const deleteTask = async (taskId) => {
  try {
    const data = await loadData();
    data.tasks = data.tasks.filter(t => t.id !== taskId);
    data.collaborators = data.collaborators.filter(tc => tc.taskId !== taskId);
    await saveData(data);
  } catch (error) {
    console.error('Error deleting task:', error);
    throw error;
  }
};

export const toggleTaskCompletion = async (taskId, completed) => {
  try {
    const data = await loadData();
    const taskIndex = data.tasks.findIndex(t => t.id === taskId);
    
    if (taskIndex !== -1) {
      data.tasks[taskIndex].completed = completed;
      await saveData(data);
    }
  } catch (error) {
    console.error('Error toggling task completion:', error);
    throw error;
  }
};

export const shareTaskWithUser = async (taskId, userEmail) => {
  try {
    const data = await loadData();
    const { nextCollaboratorId } = await getNextIds();
    
    const user = data.users.find(u => u.email === userEmail);
    if (!user) {
      throw new Error('User not found');
    }

    const existingCollaboration = data.collaborators.find(
      tc => tc.taskId === taskId && tc.userId === user.id
    );

    if (!existingCollaboration) {
      const newCollaboration = {
        id: nextCollaboratorId,
        taskId,
        userId: user.id
      };
      data.collaborators.push(newCollaboration);
      await saveData(data);
    }
  } catch (error) {
    console.error('Error sharing task:', error);
    throw error;
  }
};

export const getCollaboratorsForTask = async (taskId) => {
  try {
    const data = await loadData();
    const collaborators = data.collaborators
      .filter(tc => tc.taskId === taskId)
      .map(tc => {
        const user = data.users.find(u => u.id === tc.userId);
        return { id: user.id, name: user.name, email: user.email };
      });
    return collaborators;
  } catch (error) {
    console.error('Error getting collaborators:', error);
    return [];
  }
};

export const getAllUsers = async () => {
  try {
    const data = await loadData();
    return data.users.map(u => ({ id: u.id, name: u.name, email: u.email }));
  } catch (error) {
    console.error('Error getting all users:', error);
    return [];
  }
};

// Optional: Clear all data (for testing)
export const clearAllData = async () => {
  try {
    await AsyncStorage.multiRemove([USERS_KEY, TASKS_KEY, COLLABORATORS_KEY]);
    console.log('All data cleared');
  } catch (error) {
    console.error('Error clearing data:', error);
  }
};