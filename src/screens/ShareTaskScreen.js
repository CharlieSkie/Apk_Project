import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  FlatList 
} from 'react-native';
import { shareTaskWithUser, getCollaboratorsForTask, getAllUsers } from '../database/database';

const ShareTaskScreen = ({ navigation, route }) => {
  const { task, currentUserId, onTaskShared } = route.params;
  const [email, setEmail] = useState('');
  const [collaborators, setCollaborators] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadCollaborators();
    loadAllUsers();
  }, []);

  const loadCollaborators = async () => {
    try {
      const taskCollaborators = await getCollaboratorsForTask(task.id);
      setCollaborators(taskCollaborators);
    } catch (error) {
      console.error('Failed to load collaborators:', error);
    }
  };

  const loadAllUsers = async () => {
    try {
      const users = await getAllUsers();
      const filteredUsers = users.filter(user => 
        user.id !== currentUserId && user.id !== task.ownerId
      );
      setAllUsers(filteredUsers);
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

  const handleShare = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter an email address');
      return;
    }

    if (email === task.ownerEmail) {
      Alert.alert('Error', 'Cannot share with task owner');
      return;
    }

    setIsLoading(true);

    try {
      await shareTaskWithUser(task.id, email.trim());
      Alert.alert('Success', 'Task shared successfully!');
      setEmail('');
      await loadCollaborators();
      
      if (onTaskShared) {
        onTaskShared();
      }
    } catch (error) {
      console.error('Failed to share task:', error);
      Alert.alert('Error', error.message || 'Failed to share task');
    } finally {
      setIsLoading(false);
    }
  };

  const renderCollaborator = ({ item }) => (
    <View style={styles.collaboratorItem}>
      <Text style={styles.collaboratorName}>{item.name}</Text>
      <Text style={styles.collaboratorEmail}>{item.email}</Text>
    </View>
  );

  const renderUser = ({ item }) => (
    <TouchableOpacity 
      style={styles.userItem}
      onPress={() => setEmail(item.email)}
    >
      <Text style={styles.userName}>{item.name}</Text>
      <Text style={styles.userEmail}>{item.email}</Text>
      <Text style={styles.shareHint}>Tap to select</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.taskTitle}>Share: {task.title}</Text>
      <Text style={styles.taskOwner}>Created by: {task.ownerName}</Text>
      
      <View style={styles.shareSection}>
        <Text style={styles.sectionTitle}>Share with User</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter user's email"
          placeholderTextColor="#999"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        
        <TouchableOpacity 
          style={[styles.shareButton, isLoading && styles.disabledButton]} 
          onPress={handleShare}
          disabled={isLoading}
        >
          <Text style={styles.shareButtonText}>
            {isLoading ? 'Sharing...' : 'Share Task'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.collaboratorsSection}>
        <Text style={styles.sectionTitle}>Current Collaborators</Text>
        {collaborators.length > 0 ? (
          <FlatList
            data={collaborators}
            renderItem={renderCollaborator}
            keyExtractor={(item) => item.id.toString()}
          />
        ) : (
          <Text style={styles.noDataText}>No collaborators yet</Text>
        )}
      </View>

      <View style={styles.usersSection}>
        <Text style={styles.sectionTitle}>Available Users</Text>
        {allUsers.length > 0 ? (
          <FlatList
            data={allUsers}
            renderItem={renderUser}
            keyExtractor={(item) => item.id.toString()}
          />
        ) : (
          <Text style={styles.noDataText}>No other users available</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'center',
    color: '#333',
  },
  taskOwner: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
  },
  shareSection: {
    marginBottom: 30,
  },
  collaboratorsSection: {
    marginBottom: 30,
  },
  usersSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
    color: '#333',
  },
  shareButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  shareButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  collaboratorItem: {
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 8,
  },
  collaboratorName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  collaboratorEmail: {
    fontSize: 12,
    color: '#666',
  },
  userItem: {
    padding: 12,
    backgroundColor: '#e7f3ff',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  userName: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: 'bold',
  },
  userEmail: {
    fontSize: 12,
    color: '#007AFF',
  },
  shareHint: {
    fontSize: 10,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 4,
  },
  noDataText: {
    textAlign: 'center',
    color: '#999',
    fontStyle: 'italic',
    marginVertical: 10,
  },
});

export default ShareTaskScreen;