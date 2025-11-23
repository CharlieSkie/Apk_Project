import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const TaskItem = ({ task, onToggle, onEdit, onDelete, onShare }) => {
  console.log('🔍 TaskItem: Rendering task:', task?.id, task?.title);

  // ULTRA-SAFE: Validate all props and data
  if (!task || typeof task !== 'object') {
    console.error('❌ TaskItem: Invalid task prop:', task);
    return (
      <View style={[styles.taskItem, { borderLeftColor: '#FCA5A5' }]}>
        <Text style={styles.errorText}>Invalid thought data</Text>
      </View>
    );
  }

  // ULTRA-SAFE: Ensure all required properties with safe fallbacks
  const safeTask = {
    id: task.id || 'unknown-id',
    title: task.title || 'Untitled Thought',
    description: task.description || '',
    completed: Boolean(task.completed),
    ownerName: task.ownerName || 'Unknown',
    ownerEmail: task.ownerEmail || 'unknown@email.com',
  };

  // ULTRA-SAFE: Validate callback functions
  const safeOnToggle = typeof onToggle === 'function' ? onToggle : () => console.warn('onToggle not a function');
  const safeOnEdit = typeof onEdit === 'function' ? onEdit : () => console.warn('onEdit not a function');
  const safeOnDelete = typeof onDelete === 'function' ? onDelete : () => console.warn('onDelete not a function');
  const safeOnShare = typeof onShare === 'function' ? onShare : () => console.warn('onShare not a function');

  return (
    <View style={[styles.taskItem, safeTask.completed && styles.completedTask]}>
      <View style={styles.taskContent}>
        <TouchableOpacity 
          onPress={() => safeOnToggle(safeTask.id, !safeTask.completed)}
          style={styles.checkboxContainer}
        >
          <View style={[styles.checkbox, safeTask.completed && styles.checkboxCompleted]}>
            {safeTask.completed && <Text style={styles.checkmark}>✓</Text>}
          </View>
        </TouchableOpacity>
        
        <View style={styles.taskInfo}>
          <Text 
            style={[styles.taskTitle, safeTask.completed && styles.completedText]}
            numberOfLines={2}
          >
            {safeTask.title}
          </Text>
          
          {safeTask.description && safeTask.description.trim() ? (
            <Text 
              style={[styles.taskDescription, safeTask.completed && styles.completedText]}
              numberOfLines={2}
            >
              {safeTask.description}
            </Text>
          ) : null}
          
          <View style={styles.ownerContainer}>
            <Text style={styles.ownerText}>
              by {safeTask.ownerName}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.taskActions}>
        <TouchableOpacity 
          onPress={() => safeOnShare(safeTask)} 
          style={[styles.actionButton, styles.shareButton]}
        >
          <Text style={styles.actionIcon}>🔗</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={() => safeOnEdit(safeTask)} 
          style={[styles.actionButton, styles.editButton]}
        >
          <Text style={styles.actionIcon}>✏️</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={() => safeOnDelete(safeTask.id)} 
          style={[styles.actionButton, styles.deleteButton]}
        >
          <Text style={styles.actionIcon}>🗑️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  taskItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 16,
    marginVertical: 6,
    marginHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#84A59D',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  completedTask: {
    backgroundColor: '#F8FAFC',
    borderLeftColor: '#10B981',
    opacity: 0.8,
  },
  taskContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    marginRight: 12,
  },
  checkboxContainer: {
    padding: 4,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    borderRadius: 11,
    marginRight: 12,
    marginTop: 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  checkboxCompleted: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  checkmark: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 12,
    includeFontPadding: false,
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
    lineHeight: 20,
  },
  taskDescription: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 6,
    lineHeight: 18,
  },
  ownerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ownerText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '400',
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#94A3B8',
  },
  taskActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  shareButton: {
    backgroundColor: '#84A59D20',
    borderWidth: 1,
    borderColor: '#84A59D40',
  },
  editButton: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  deleteButton: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  actionIcon: {
    fontSize: 14,
  },
  errorText: {
    color: '#DC2626',
    fontWeight: '500',
    fontSize: 14,
  },
});

export default TaskItem;