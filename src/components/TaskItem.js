import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const TaskItem = ({ task, onToggle, onEdit, onDelete, onShare }) => {
  return (
    <View style={[styles.taskItem, task.completed && styles.completedTask]}>
      <View style={styles.taskContent}>
        <TouchableOpacity onPress={() => onToggle(task.id, !task.completed)}>
          <View style={[styles.checkbox, task.completed && styles.checkboxCompleted]}>
            {task.completed && <Text style={styles.checkmark}>✓</Text>}
          </View>
        </TouchableOpacity>
        
        <View style={styles.taskInfo}>
          <Text style={[styles.taskTitle, task.completed && styles.completedText]}>
            {task.title}
          </Text>
          {task.description ? (
            <Text style={[styles.taskDescription, task.completed && styles.completedText]}>
              {task.description}
            </Text>
          ) : null}
          <Text style={styles.ownerText}>
            Owner: {task.ownerEmail}
          </Text>
        </View>
      </View>

      <View style={styles.taskActions}>
        <TouchableOpacity onPress={() => onShare(task)} style={styles.actionButton}>
          <Text style={styles.actionText}>Share</Text>
        </TouchableOpacity>
        
        <TouchableOpacity onPress={() => onEdit(task)} style={styles.actionButton}>
          <Text style={styles.actionText}>Edit</Text>
        </TouchableOpacity>
        
        <TouchableOpacity onPress={() => onDelete(task.id)} style={[styles.actionButton, styles.deleteButton]}>
          <Text style={styles.actionText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
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
    borderLeftColor: '#007AFF',
  },
  completedTask: {
    backgroundColor: '#e9ecef',
    borderLeftColor: '#28a745',
  },
  taskContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#007AFF',
    borderRadius: 12,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxCompleted: {
    backgroundColor: '#28a745',
    borderColor: '#28a745',
  },
  checkmark: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  taskDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  ownerText: {
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic',
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  taskActions: {
    flexDirection: 'row',
  },
  actionButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginLeft: 5,
    backgroundColor: '#007AFF',
    borderRadius: 4,
  },
  deleteButton: {
    backgroundColor: '#dc3545',
  },
  actionText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default TaskItem;