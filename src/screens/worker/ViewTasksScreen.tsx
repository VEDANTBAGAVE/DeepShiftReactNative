import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';
import { useAuth } from '../../context/AuthContext';
import { taskService } from '../../services/taskService';
import { Task, TaskStatus } from '../../types/database';

type ViewTasksNavigationProp = StackNavigationProp<RootStackParamList>;

const PRIORITY_COLORS: Record<string, string> = {
  low: '#10b981',
  normal: '#3b82f6',
  high: '#ef4444',
};

const PRIORITY_LABELS: Record<string, string> = {
  low: 'Low',
  normal: 'Normal',
  high: 'High',
};

const STATUS_LABELS: Record<TaskStatus, string> = {
  pending: 'Pending',
  in_progress: 'In Progress',
  completed: 'Done',
  cancelled: 'Cancelled',
};

const ViewTasksScreen: React.FC = () => {
  const navigation = useNavigation<ViewTasksNavigationProp>();
  const { user } = useAuth();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchTasks = useCallback(async () => {
    if (!user?.id) return;
    try {
      const result = await taskService.getTasksForWorker(user.id);
      setTasks(result);
    } catch (err) {
      Alert.alert('Error', 'Failed to load tasks. Please try again.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const activeTasks = tasks.filter(
    t => t.status !== 'completed' && t.status !== 'cancelled',
  );
  const doneTasks = tasks.filter(
    t => t.status === 'completed' || t.status === 'cancelled',
  );

  const renderTask = (task: Task) => {
    const isDone = task.status === 'completed' || task.status === 'cancelled';
    return (
      <View key={task.id} style={styles.taskCard}>
        <View style={styles.taskCheckbox}>
          <View style={[styles.checkbox, isDone && styles.checkboxChecked]}>
            {isDone && <Text style={styles.checkmark}>✓</Text>}
          </View>
        </View>
        <View style={styles.taskContent}>
          <Text style={[styles.taskTitle, isDone && styles.taskTitleDone]}>
            {task.title}
          </Text>
          <View style={styles.taskMeta}>
            <View
              style={[
                styles.priorityBadge,
                { backgroundColor: PRIORITY_COLORS[task.priority] + '20' },
              ]}
            >
              <Text
                style={[
                  styles.priorityText,
                  { color: PRIORITY_COLORS[task.priority] },
                ]}
              >
                {PRIORITY_LABELS[task.priority]}
              </Text>
            </View>
            <Text style={styles.categoryText}>
              {task.category.charAt(0).toUpperCase() + task.category.slice(1)}
            </Text>
          </View>
          {task.instructions ? (
            <Text style={styles.instructions} numberOfLines={2}>
              {task.instructions}
            </Text>
          ) : null}
          <Text style={styles.statusText}>{STATUS_LABELS[task.status]}</Text>
          {task.due_date ? (
            <Text style={styles.dueDateText}>
              Due:{' '}
              {new Date(task.due_date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })}
            </Text>
          ) : null}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Task Records</Text>
          <Text style={styles.headerSubtitle}>
            {activeTasks.length} active · {doneTasks.length} done
          </Text>
        </View>
        <View style={styles.headerPlaceholder} />
      </View>

      <View style={styles.noticeBar}>
        <Text style={styles.noticeText}>
          ℹ️ Viewer Mode: task updates are recorded by foreman/supervisor.
        </Text>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1e3a5f" />
          <Text style={styles.loadingText}>Loading tasks...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={() => {
                setIsRefreshing(true);
                fetchTasks();
              }}
              colors={['#1e3a5f']}
            />
          }
        >
          {tasks.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📋</Text>
              <Text style={styles.emptyTitle}>No Tasks Yet</Text>
              <Text style={styles.emptyText}>
                No assigned task records are available yet
              </Text>
            </View>
          ) : (
            <>
              {activeTasks.length > 0 && (
                <>
                  <Text style={styles.sectionLabel}>Active</Text>
                  {activeTasks.map(renderTask)}
                </>
              )}
              {doneTasks.length > 0 && (
                <>
                  <Text style={styles.sectionLabel}>Completed</Text>
                  {doneTasks.map(renderTask)}
                </>
              )}
            </>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4f8' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#1e3a5f',
    elevation: 4,
  },
  backButton: { paddingVertical: 6, paddingHorizontal: 8 },
  backButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 2,
  },
  headerPlaceholder: { width: 60 },
  noticeBar: {
    backgroundColor: '#e0f2fe',
    borderBottomWidth: 1,
    borderBottomColor: '#bae6fd',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  noticeText: {
    color: '#0369a1',
    fontSize: 12,
    fontWeight: '600',
  },
  scrollView: { flex: 1, padding: 16 },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: { fontSize: 15, color: '#64748b' },
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyIcon: { fontSize: 64, marginBottom: 16 },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  emptyText: { fontSize: 15, color: '#64748b', textAlign: 'center' },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginTop: 4,
  },
  taskCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    elevation: 2,
  },
  taskCheckbox: { marginRight: 12 },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: { backgroundColor: '#10b981', borderColor: '#10b981' },
  checkmark: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  taskContent: { flex: 1 },
  taskTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 6,
  },
  taskTitleDone: { textDecorationLine: 'line-through', color: '#94a3b8' },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  priorityBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 },
  priorityText: { fontSize: 11, fontWeight: '700' },
  categoryText: { fontSize: 12, color: '#64748b' },
  instructions: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
    lineHeight: 16,
  },
  statusText: { fontSize: 12, color: '#94a3b8', fontStyle: 'italic' },
  dueDateText: { fontSize: 12, color: '#f59e0b', marginTop: 2 },
});

export default ViewTasksScreen;
