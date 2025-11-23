import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet, 
  Alert,
  RefreshControl
} from 'react-native';
import { getTasksForUser, toggleTaskCompletion, deleteTask } from '../database/database';
import TaskItem from '../components/TaskItem';

const TaskListScreen = ({ navigation, route }) => {
  const { userId, userName, userEmail } = route.params || {};
  const [tasks, setTasks] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const userTasks = await getTasksForUser(userId);
      const safeTasks = (userTasks || []).map((task, index) => {
        if (!task || typeof task !== 'object') {
          return {
            id: `invalid-${index}-${Date.now()}`,
            title: 'Invalid Task',
            description: '',
            completed: false,
            ownerName: 'Unknown',
            ownerEmail: 'Unknown'
          };
        }
        
        return {
          id: task.id || `missing-id-${index}-${Date.now()}`,
          title: task.title || 'Untitled Thought',
          description: task.description || '',
          completed: Boolean(task.completed),
          ownerName: task.ownerName || 'Unknown Owner',
          ownerEmail: task.ownerEmail || 'unknown@email.com',
          ...task
        };
      });
      
      setTasks(safeTasks);
    } catch (error) {
      console.error('Failed to load tasks:', error);
      Alert.alert('Quiet Notice', 'Something went wrong. Please try again.');
      setTasks([]);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTasks();
    setRefreshing(false);
  };

  const handleToggleTask = async (taskId, completed) => {
    try {
      await toggleTaskCompletion(taskId, completed);
      await loadTasks();
    } catch (error) {
      console.error('Failed to update task:', error);
      Alert.alert('Quiet Notice', 'Something went wrong. Please try again.');
    }
  };

  const handleEditTask = (task) => {
    navigation.navigate('AddEditTask', { 
      task, 
      userId,
      onTaskUpdated: loadTasks 
    });
  };

  const handleDeleteTask = (taskId) => {
    Alert.alert(
      'Delete Thought',
      'Are you sure you want to delete this thought?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteTask(taskId);
              await loadTasks();
            } catch (error) {
              console.error('Failed to delete task:', error);
              Alert.alert('Quiet Notice', 'Something went wrong. Please try again.');
            }
          }
        }
      ]
    );
  };

  const handleShareTask = (task) => {
    navigation.navigate('ShareTask', { 
      task, 
      currentUserId: userId,
      onTaskShared: loadTasks 
    });
  };

  const handleAddTask = () => {
    navigation.navigate('AddEditTask', { 
      userId,
      onTaskUpdated: loadTasks 
    });
  };

  const handleLogout = () => {
    Alert.alert(
      'Leave Quiet Space',
      'Are you sure you want to log out?',
      [
        { text: 'Stay', style: 'cancel' },
        { 
          text: 'Leave', 
          style: 'destructive',
          onPress: () => {
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          }
        }
      ]
    );
  };

  const filteredTasks = tasks.filter(task => {
    switch (activeTab) {
      case 'pending':
        return !task.completed;
      case 'completed':
        return task.completed;
      default:
        return true;
    }
  });

  const completedTasks = tasks.filter(task => task.completed);
  const pendingTasks = tasks.filter(task => !task.completed);

  const renderTaskItem = ({ item, index }) => {
    if (!item || typeof item !== 'object') {
      return (
        <View style={[styles.taskItem, { borderLeftColor: '#FCA5A5' }]}>
          <Text style={styles.errorText}>Invalid thought data</Text>
        </View>
      );
    }

    const safeTask = {
      id: item.id || `missing-${index}`,
      title: item.title || 'Missing Title',
      description: item.description || '',
      completed: Boolean(item.completed),
      ownerName: item.ownerName || 'Unknown',
      ownerEmail: item.ownerEmail || 'Unknown',
      ...item
    };

    return (
      <TaskItem
        task={safeTask}
        onToggle={handleToggleTask}
        onEdit={handleEditTask}
        onDelete={handleDeleteTask}
        onShare={handleShareTask}
      />
    );
  };

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyEmoji}>
        {activeTab === 'completed' ? '🎉' : activeTab === 'pending' ? '📝' : '✨'}
      </Text>
      <Text style={styles.emptyTitle}>
        {activeTab === 'completed' 
          ? "No completed thoughts yet" 
          : activeTab === 'pending'
          ? "No pending thoughts"
          : "Your peaceful space awaits"
        }
      </Text>
      <Text style={styles.emptyText}>
        {activeTab === 'completed' 
          ? "Complete some thoughts to see them here!"
          : activeTab === 'pending'
          ? "All caught up! Everything is completed."
          : "Add your first thought to begin your journey"
        }
      </Text>
      {activeTab !== 'all' && (
        <TouchableOpacity 
          style={styles.viewAllButton}
          onPress={() => setActiveTab('all')}
        >
          <Text style={styles.viewAllButtonText}>View All Thoughts</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const keyExtractor = (item, index) => {
    if (!item || !item.id) {
      return `fallback-${index}-${Date.now()}`;
    }
    return item.id.toString();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Text style={styles.welcomeText}>Peaceful space</Text>
          <Text style={styles.emailText}>{userName || 'Friend'} • {userEmail || ''}</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Leave</Text>
        </TouchableOpacity>
      </View>

      {/* Fixed Stats Grid - Absolute Dimensions */}
      <View style={styles.statsGrid}>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber} numberOfLines={1} adjustsFontSizeToFit>
              {tasks.length}
            </Text>
            <Text style={styles.statLabel}>Total Thoughts</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber} numberOfLines={1} adjustsFontSizeToFit>
              {pendingTasks.length}
            </Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
        </View>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber} numberOfLines={1} adjustsFontSizeToFit>
              {completedTasks.length}
            </Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber} numberOfLines={1} adjustsFontSizeToFit>
              {tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0}%
            </Text>
            <Text style={styles.statLabel}>Progress</Text>
          </View>
        </View>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'all' && styles.activeTab]} 
          onPress={() => setActiveTab('all')}
        >
          <View style={styles.tabContent}>
            <Text style={[styles.tabIcon, activeTab === 'all' && styles.activeTabIcon]}>📝</Text>
            <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>
              All Thoughts
            </Text>
          </View>
          {activeTab === 'all' && <View style={styles.activeTabIndicator} />}
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'pending' && styles.activeTab]} 
          onPress={() => setActiveTab('pending')}
        >
          <View style={styles.tabContent}>
            <Text style={[styles.tabIcon, activeTab === 'pending' && styles.activeTabIcon]}>⏳</Text>
            <Text style={[styles.tabText, activeTab === 'pending' && styles.activeTabText]}>
              Pending
            </Text>
            {pendingTasks.length > 0 && (
              <View style={styles.tabBadge}>
                <Text style={styles.tabBadgeText}>{pendingTasks.length}</Text>
              </View>
            )}
          </View>
          {activeTab === 'pending' && <View style={styles.activeTabIndicator} />}
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'completed' && styles.activeTab]} 
          onPress={() => setActiveTab('completed')}
        >
          <View style={styles.tabContent}>
            <Text style={[styles.tabIcon, activeTab === 'completed' && styles.activeTabIcon]}>✅</Text>
            <Text style={[styles.tabText, activeTab === 'completed' && styles.activeTabText]}>
              Completed
            </Text>
            {completedTasks.length > 0 && (
              <View style={styles.tabBadge}>
                <Text style={styles.tabBadgeText}>{completedTasks.length}</Text>
              </View>
            )}
          </View>
          {activeTab === 'completed' && <View style={styles.activeTabIndicator} />}
        </TouchableOpacity>
      </View>

      {/* Tasks List */}
      <FlatList
        data={filteredTasks}
        keyExtractor={keyExtractor}
        renderItem={renderTaskItem}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={['#84A59D']}
            tintColor="#84A59D"
          />
        }
        ListEmptyComponent={renderEmptyComponent}
        contentContainerStyle={filteredTasks.length === 0 ? styles.emptyListContent : styles.listContent}
        extraData={filteredTasks}
        showsVerticalScrollIndicator={false}
      />

      {/* Add Button */}
      <TouchableOpacity style={styles.addButton} onPress={handleAddTask}>
        <Text style={styles.addButtonIcon}>+</Text>
        <Text style={styles.addButtonText}>New Thought</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  userInfo: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '300',
    color: '#1E293B',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  emailText: {
    fontSize: 14,
    color: '#64748B',
  },
  logoutButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
  },
  logoutText: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '500',
  },
  statsGrid: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    height: 120, // Absolute fixed height
    width: '100%', // Take full width
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 50, // Fixed row height
    width: '100%', // Full width
  },
  statItem: {
    width: '45%', // Fixed width with some margin
    height: 50, // Fixed height
    alignItems: 'center',
    justifyContent: 'center',
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#F1F5F9',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#84A59D',
    marginBottom: 4,
    textAlign: 'center',
    minWidth: 30, // Prevent text compression
    includeFontPadding: false,
    lineHeight: 24, // Fixed line height
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
    textAlign: 'center',
    includeFontPadding: false,
    lineHeight: 14, // Fixed line height
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: 'transparent',
    position: 'relative',
    overflow: 'hidden',
  },
  activeTab: {
    backgroundColor: '#84A59D15',
    borderColor: '#84A59D',
    transform: [{ scale: 1.02 }],
  },
  tabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  tabIcon: {
    fontSize: 16,
    opacity: 0.7,
  },
  activeTabIcon: {
    opacity: 1,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
    letterSpacing: -0.2,
  },
  activeTabText: {
    color: '#84A59D',
    fontWeight: '700',
  },
  activeTabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: '#84A59D',
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  tabBadge: {
    backgroundColor: '#84A59D',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  listContent: {
    padding: 16,
  },
  emptyListContent: {
    flex: 1,
    justifyContent: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  viewAllButton: {
    backgroundColor: '#84A59D',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  viewAllButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  taskItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    marginVertical: 5,
    marginHorizontal: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderLeftWidth: 4,
  },
  errorText: {
    color: '#DC2626',
    fontWeight: '500',
  },
  addButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: '#84A59D',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 20,
    shadowColor: '#84A59D',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  addButtonIcon: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '300',
    marginRight: 8,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default TaskListScreen;