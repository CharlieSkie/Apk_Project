import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  FlatList,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { shareTaskWithUser, getCollaboratorsForTask, getAllUsers } from '../database/database';

const ShareTaskScreen = ({ navigation, route }) => {
  const { task, currentUserId, onTaskShared } = route.params || {};
  const [email, setEmail] = useState('');
  const [collaborators, setCollaborators] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (task?.id) {
      loadCollaborators();
      loadAllUsers();
    }
  }, [task]);

  const loadCollaborators = async () => {
    try {
      const taskCollaborators = await getCollaboratorsForTask(task.id);
      setCollaborators(taskCollaborators || []);
    } catch (error) {
      console.error('Failed to load collaborators:', error);
      setCollaborators([]);
    }
  };

  const loadAllUsers = async () => {
    try {
      const users = await getAllUsers();
      const filteredUsers = (users || []).filter(user => 
        user.id !== currentUserId && user.id !== task.ownerId
      );
      setAllUsers(filteredUsers);
    } catch (error) {
      console.error('Failed to load users:', error);
      setAllUsers([]);
    }
  };

  const handleShare = async () => {
    if (!email.trim()) {
      Alert.alert('Quiet Notice', 'Please enter an email address');
      return;
    }

    if (email === task.ownerEmail) {
      Alert.alert('Quiet Notice', 'Cannot share with thought owner');
      return;
    }

    setIsLoading(true);

    try {
      await shareTaskWithUser(task.id, email.trim());
      Alert.alert('Shared', 'Thought shared peacefully');
      setEmail('');
      await loadCollaborators();
      
      if (onTaskShared) {
        onTaskShared();
      }
    } catch (error) {
      console.error('Failed to share task:', error);
      Alert.alert('Quiet Notice', error.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Collaborator Item Component
  const CollaboratorItem = ({ item }) => {
    return (
      <View style={styles.collaboratorItem}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {(item.name || 'U').charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.collaboratorInfo}>
          <Text style={styles.collaboratorName}>{item.name || 'Unknown User'}</Text>
          <Text style={styles.collaboratorEmail}>{item.email || 'No email'}</Text>
        </View>
        <View style={styles.collaboratorBadge}>
          <Text style={styles.collaboratorBadgeText}>Collaborator</Text>
        </View>
      </View>
    );
  };

  // User Item Component
  const UserItem = ({ item }) => {
    return (
      <TouchableOpacity 
        style={styles.userItem}
        onPress={() => setEmail(item.email || '')}
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {(item.name || 'U').charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.name || 'Unknown User'}</Text>
          <Text style={styles.userEmail}>{item.email || 'No email'}</Text>
        </View>
        <View style={styles.selectIndicator}>
          <Text style={styles.selectIndicatorText}>Select</Text>
        </View>
      </TouchableOpacity>
    );
  };

  // Collaborators List Component
  const CollaboratorsList = () => {
    return (
      <View style={styles.listContainer}>
        {collaborators.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateEmoji}>👥</Text>
            <Text style={styles.emptyStateText}>No collaborators yet</Text>
            <Text style={styles.emptyStateSubtext}>Share this thought to start collaborating</Text>
          </View>
        ) : (
          <FlatList
            data={collaborators}
            renderItem={({ item }) => <CollaboratorItem item={item} />}
            keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    );
  };

  // Users List Component
  const UsersList = () => {
    return (
      <View style={styles.listContainer}>
        {allUsers.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateEmoji}>🌱</Text>
            <Text style={styles.emptyStateText}>No other users available</Text>
            <Text style={styles.emptyStateSubtext}>Invite friends to join your peaceful space</Text>
          </View>
        ) : (
          <FlatList
            data={allUsers}
            renderItem={({ item }) => <UserItem item={item} />}
            keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    );
  };

  // Safe check for task object
  if (!task) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorEmoji}>😔</Text>
          <Text style={styles.errorText}>Thought not found</Text>
          <TouchableOpacity 
            style={styles.primaryButton} 
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.primaryButtonText}>Return to Thoughts</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Share Thought</Text>
            <View style={styles.taskInfo}>
              <Text style={styles.taskTitle} numberOfLines={2}>
                {task.title || 'Untitled Thought'}
              </Text>
              <Text style={styles.taskOwner}>by {task.ownerName || 'Unknown'}</Text>
            </View>
          </View>
          <View style={styles.headerSpacer} />
        </View>
        
        {/* Share Section */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Share with someone</Text>
          <Text style={styles.sectionDescription}>
            Enter an email address to share this thought
          </Text>
          <TextInput
            style={styles.input}
            placeholder="friend@example.com"
            placeholderTextColor="#94A3B8"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            editable={!isLoading}
          />
          
          <TouchableOpacity 
            style={[styles.primaryButton, isLoading && styles.disabledButton]} 
            onPress={handleShare}
            disabled={isLoading}
          >
            <Text style={styles.primaryButtonText}>
              {isLoading ? 'Sharing...' : 'Share Thought'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Current Collaborators */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Current Collaborators</Text>
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>{collaborators.length}</Text>
            </View>
          </View>
          <CollaboratorsList />
        </View>

        {/* Available Users */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Available Friends</Text>
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>{allUsers.length}</Text>
            </View>
          </View>
          <UsersList />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 24,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  backButtonText: {
    fontSize: 20,
    color: '#64748B',
    fontWeight: '300',
  },
  headerContent: {
    flex: 1,
    marginHorizontal: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '300',
    color: '#1E293B',
    letterSpacing: -0.5,
    textAlign: 'center',
    marginBottom: 12,
  },
  taskInfo: {
    alignItems: 'center',
  },
  taskTitle: {
    fontSize: 16,
    color: '#84A59D',
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 20,
  },
  taskOwner: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
  },
  headerSpacer: {
    width: 40,
  },
  card: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 24,
    marginBottom: 20,
    padding: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
  },
  sectionDescription: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 16,
    lineHeight: 20,
  },
  countBadge: {
    backgroundColor: '#84A59D',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  countBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  input: {
    height: 56,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    paddingHorizontal: 20,
    marginBottom: 20,
    fontSize: 16,
    color: '#1E293B',
    backgroundColor: '#FFFFFF',
  },
  primaryButton: {
    height: 56,
    backgroundColor: '#84A59D',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#84A59D',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  disabledButton: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  listContainer: {
    minHeight: 80,
  },
  collaboratorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#84A59D',
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#84A59D',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  collaboratorInfo: {
    flex: 1,
  },
  userInfo: {
    flex: 1,
  },
  collaboratorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 2,
  },
  collaboratorEmail: {
    fontSize: 14,
    color: '#64748B',
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    color: '#64748B',
  },
  collaboratorBadge: {
    backgroundColor: '#84A59D20',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  collaboratorBadgeText: {
    color: '#84A59D',
    fontSize: 12,
    fontWeight: '500',
  },
  selectIndicator: {
    backgroundColor: '#84A59D',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  selectIndicatorText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
  },
  emptyStateEmoji: {
    fontSize: 36,
    marginBottom: 12,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 6,
    fontWeight: '500',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 18,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 18,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 24,
    fontWeight: '500',
  },
});

export default ShareTaskScreen;