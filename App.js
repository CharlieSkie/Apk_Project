import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { View, Text, ActivityIndicator } from 'react-native';

import ErrorBoundary from './src/components/ErrorBoundary';
import { initDatabase } from './src/database/database';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import TaskListScreen from './src/screens/TaskListScreen';
import AddEditTaskScreen from './src/screens/AddEditTaskScreen';
import ShareTaskScreen from './src/screens/ShareTaskScreen';

const Stack = createNativeStackNavigator();

function LoadingScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color="#007AFF" />
      <Text style={{ marginTop: 10 }}>Loading Todo App...</Text>
    </View>
  );
}

function ErrorScreen({ error }) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', color: 'red', marginBottom: 10 }}>
        App Loading Error
      </Text>
      <Text style={{ textAlign: 'center', color: '#666' }}>
        {error || 'Failed to initialize the app. Please restart.'}
      </Text>
    </View>
  );
}

export default function App() {
  const [dbInitialized, setDbInitialized] = useState(false);
  const [initError, setInitError] = useState(null);

  useEffect(() => {
    const initializeDb = async () => {
      try {
        await initDatabase();
        setDbInitialized(true);
      } catch (err) {
        console.error('Failed to initialize database:', err);
        setInitError(err.message);
        setDbInitialized(true); // Continue to app anyway
      }
    };

    initializeDb();
  }, []);

  if (!dbInitialized) {
    return <LoadingScreen />;
  }

  if (initError) {
    return <ErrorScreen error={initError} />;
  }

  return (
    <ErrorBoundary>
      <NavigationContainer>
        <StatusBar style="auto" />
        <Stack.Navigator initialRouteName="Login">
          <Stack.Screen 
            name="Login" 
            component={LoginScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="Register" 
            component={RegisterScreen}
            options={{ title: 'Register' }}
          />
          <Stack.Screen 
            name="TaskList" 
            component={TaskListScreen}
            options={{ title: 'My Tasks', headerBackVisible: false }}
          />
          <Stack.Screen 
            name="AddEditTask" 
            component={AddEditTaskScreen}
            options={({ route }) => ({ 
              title: route.params?.task ? 'Edit Task' : 'Add Task' 
            })}
          />
          <Stack.Screen 
            name="ShareTask" 
            component={ShareTaskScreen}
            options={{ title: 'Share Task' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </ErrorBoundary>
  );
}