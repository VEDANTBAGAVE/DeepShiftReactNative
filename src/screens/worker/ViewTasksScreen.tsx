import React from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';
type ViewTasksNavigationProp = StackNavigationProp<RootStackParamList>;

const ViewTasksScreen: React.FC = () => {
  const navigation = useNavigation<ViewTasksNavigationProp>();

  const todayTasks: never[] = [];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Today's Tasks</Text>
          <Text style={styles.headerSubtitle}>{todayTasks.length} tasks</Text>
        </View>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📋</Text>
          <Text style={styles.emptyTitle}>No Tasks Today</Text>
          <Text style={styles.emptyText}>
            Your foreman hasn't assigned any tasks yet
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f8',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#1e3a5f',
    elevation: 4,
  },
  backButton: {
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.75)',
    marginTop: 2,
  },
  headerPlaceholder: {
    width: 60,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    color: '#64748b',
    textAlign: 'center',
  },
  taskCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
  },
  taskCheckbox: {
    marginRight: 12,
  },
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
  checkboxChecked: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  checkmark: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  taskContent: {
    flex: 1,
  },
  taskDescription: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 6,
  },
  taskDescriptionDone: {
    textDecorationLine: 'line-through',
    color: '#94a3b8',
  },
  taskAssignedBy: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 4,
  },
  taskNote: {
    fontSize: 12,
    color: '#10b981',
    fontStyle: 'italic',
  },
});

export default ViewTasksScreen;
