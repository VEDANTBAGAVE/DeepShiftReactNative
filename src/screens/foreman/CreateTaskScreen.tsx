import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';
import { useForeman } from '../../context/ForemanContext';
import { TaskPriority, TaskCategory } from '../../types/worker';

type CreateTaskScreenRouteProp = RouteProp<
  RootStackParamList,
  'CreateTaskScreen'
>;
type CreateTaskScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const CATEGORIES: { value: TaskCategory; label: string; icon: string }[] = [
  { value: 'safety', label: 'Safety', icon: '🛡️' },
  { value: 'maintenance', label: 'Maintenance', icon: '🔧' },
  { value: 'inspection', label: 'Inspection', icon: '🔍' },
  { value: 'production', label: 'Production', icon: '⚙️' },
  { value: 'other', label: 'Other', icon: '📌' },
];

const PRIORITIES: { value: TaskPriority; label: string; color: string }[] = [
  { value: 'low', label: 'Low', color: '#10b981' },
  { value: 'normal', label: 'Normal', color: '#3b82f6' },
  { value: 'high', label: 'High', color: '#ef4444' },
];

const CreateTaskScreen: React.FC = () => {
  const navigation = useNavigation<CreateTaskScreenNavigationProp>();
  const route = useRoute<CreateTaskScreenRouteProp>();
  const { selectedWorkers = [] } = route.params || {};
  const { createTask, getWorkers, getWorkerById } = useForeman();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<TaskCategory>('other');
  const [priority, setPriority] = useState<TaskPriority>('normal');
  const [dueDate, setDueDate] = useState(new Date());
  const [assigneeIds, setAssigneeIds] = useState<string[]>(selectedWorkers);
  const [instructions, setInstructions] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAssigneePicker, setShowAssigneePicker] = useState(false);

  const allWorkers = getWorkers();
  const selectedWorkerNames = assigneeIds
    .map(id => getWorkerById(id)?.name || 'Unknown')
    .join(', ');

  const handleSubmit = async () => {
    // Validation
    if (!title.trim()) {
      Alert.alert('Validation Error', 'Please enter a task title');
      return;
    }

    if (title.length > 100) {
      Alert.alert('Validation Error', 'Title must be 100 characters or less');
      return;
    }

    if (assigneeIds.length === 0) {
      Alert.alert(
        'Validation Error',
        'Please select at least one worker to assign this task to',
      );
      return;
    }

    if (instructions.length > 500) {
      Alert.alert(
        'Validation Error',
        'Instructions must be 500 characters or less',
      );
      return;
    }

    setIsSubmitting(true);

    try {
      await createTask({
        description: title.trim(),
        assignedBy: 'Foreman',
        isDone: false,
        category,
        priority,
        dueDate: formatDate(dueDate),
        assignedTo: assigneeIds,
        assignedToNames: assigneeIds.map(
          id => getWorkerById(id)?.name || 'Unknown',
        ),
        instructions: instructions.trim() || undefined,
        photos: [],
      });

      Alert.alert(
        'Success',
        `Task assigned to ${assigneeIds.length} worker(s)`,
        [
          {
            text: 'View Workers',
            onPress: () => navigation.navigate('WorkerListScreen'),
          },
          {
            text: 'Done',
            onPress: () => navigation.goBack(),
          },
        ],
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to create task. Please try again.');
      setIsSubmitting(false);
    }
  };

  const toggleAssignee = (workerId: string) => {
    setAssigneeIds(prev =>
      prev.includes(workerId)
        ? prev.filter(id => id !== workerId)
        : [...prev, workerId],
    );
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const incrementDate = () => {
    const newDate = new Date(dueDate);
    newDate.setDate(newDate.getDate() + 1);
    setDueDate(newDate);
  };

  const decrementDate = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const newDate = new Date(dueDate);
    newDate.setDate(newDate.getDate() - 1);
    if (newDate >= today) {
      setDueDate(newDate);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>← Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Assign Task</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
      >
        {/* Title Input */}
        <View style={styles.section}>
          <Text style={styles.label}>
            Task Title <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.textInput}
            placeholder="Enter task title..."
            placeholderTextColor="#94a3b8"
            value={title}
            onChangeText={setTitle}
            maxLength={100}
          />
          <Text style={styles.charCount}>{title.length}/100</Text>
        </View>

        {/* Category Selector */}
        <View style={styles.section}>
          <Text style={styles.label}>Category</Text>
          <View style={styles.buttonGroup}>
            {CATEGORIES.map(cat => (
              <TouchableOpacity
                key={cat.value}
                style={[
                  styles.optionButton,
                  category === cat.value && styles.optionButtonActive,
                ]}
                onPress={() => setCategory(cat.value)}
              >
                <Text style={styles.optionIcon}>{cat.icon}</Text>
                <Text
                  style={[
                    styles.optionLabel,
                    category === cat.value && styles.optionLabelActive,
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Priority Selector */}
        <View style={styles.section}>
          <Text style={styles.label}>Priority</Text>
          <View style={styles.priorityGroup}>
            {PRIORITIES.map(p => (
              <TouchableOpacity
                key={p.value}
                style={[
                  styles.priorityButton,
                  priority === p.value && {
                    backgroundColor: p.color,
                    borderColor: p.color,
                  },
                ]}
                onPress={() => setPriority(p.value)}
              >
                <Text
                  style={[
                    styles.priorityLabel,
                    priority === p.value && styles.priorityLabelActive,
                  ]}
                >
                  {p.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Due Date Picker */}
        <View style={styles.section}>
          <Text style={styles.label}>Due Date</Text>
          <View style={styles.datePicker}>
            <TouchableOpacity style={styles.dateButton} onPress={decrementDate}>
              <Text style={styles.dateButtonText}>−</Text>
            </TouchableOpacity>
            <View style={styles.dateDisplay}>
              <Text style={styles.dateDisplayText}>{formatDate(dueDate)}</Text>
            </View>
            <TouchableOpacity style={styles.dateButton} onPress={incrementDate}>
              <Text style={styles.dateButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Assignee Selector */}
        <View style={styles.section}>
          <Text style={styles.label}>
            Assign To <Text style={styles.required}>*</Text>
          </Text>
          <TouchableOpacity
            style={styles.assigneeSelector}
            onPress={() => setShowAssigneePicker(!showAssigneePicker)}
          >
            <Text style={styles.assigneeText}>
              {assigneeIds.length === 0
                ? 'Select workers...'
                : assigneeIds.length === 1
                ? selectedWorkerNames
                : `${assigneeIds.length} workers selected`}
            </Text>
            <Text style={styles.assigneeIcon}>
              {showAssigneePicker ? '▲' : '▼'}
            </Text>
          </TouchableOpacity>

          {showAssigneePicker && (
            <View style={styles.assigneePicker}>
              {allWorkers.map(worker => (
                <TouchableOpacity
                  key={worker.id}
                  style={styles.assigneeOption}
                  onPress={() => toggleAssignee(worker.id)}
                >
                  <View style={styles.assigneeOptionLeft}>
                    <View
                      style={[
                        styles.checkbox,
                        assigneeIds.includes(worker.id) &&
                          styles.checkboxChecked,
                      ]}
                    >
                      {assigneeIds.includes(worker.id) && (
                        <Text style={styles.checkboxCheck}>✓</Text>
                      )}
                    </View>
                    <View>
                      <Text style={styles.assigneeOptionName}>
                        {worker.name}
                      </Text>
                      <Text style={styles.assigneeOptionDetail}>
                        {worker.role} • {worker.section}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Instructions */}
        <View style={styles.section}>
          <Text style={styles.label}>Instructions (Optional)</Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            placeholder="Enter detailed instructions..."
            placeholderTextColor="#94a3b8"
            value={instructions}
            onChangeText={setInstructions}
            maxLength={500}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
          <Text style={styles.charCount}>{instructions.length}/500</Text>
        </View>

        {/* Photo Attachment Placeholder */}
        <View style={styles.section}>
          <Text style={styles.label}>Attachments (Optional)</Text>
          <TouchableOpacity style={styles.photoPlaceholder}>
            <Text style={styles.photoPlaceholderIcon}>📷</Text>
            <Text style={styles.photoPlaceholderText}>Add Photo</Text>
            <Text style={styles.photoPlaceholderHint}>
              Photo attachment feature coming soon
            </Text>
          </TouchableOpacity>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            isSubmitting && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          <Text style={styles.submitButtonText}>
            {isSubmitting ? 'Creating Task...' : '✓ Assign Task'}
          </Text>
        </TouchableOpacity>
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
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 0.5,
  },
  headerSpacer: {
    width: 80,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    padding: 16,
    paddingBottom: 32,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 10,
  },
  required: {
    color: '#ef4444',
  },
  textInput: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1e293b',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'right',
    marginTop: 4,
  },
  buttonGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  optionButton: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginRight: 10,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionButtonActive: {
    backgroundColor: '#f59e0b',
    borderColor: '#f59e0b',
  },
  optionIcon: {
    fontSize: 18,
    marginRight: 6,
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  optionLabelActive: {
    color: '#fff',
  },
  priorityGroup: {
    flexDirection: 'row',
  },
  priorityButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    paddingVertical: 12,
    marginRight: 8,
    alignItems: 'center',
  },
  priorityLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748b',
  },
  priorityLabelActive: {
    color: '#fff',
  },
  datePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    padding: 8,
  },
  dateButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e3a5f',
  },
  dateDisplay: {
    flex: 1,
    alignItems: 'center',
  },
  dateDisplayText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
  },
  assigneeSelector: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  assigneeText: {
    fontSize: 15,
    color: '#1e293b',
    flex: 1,
  },
  assigneeIcon: {
    fontSize: 12,
    color: '#64748b',
    marginLeft: 8,
  },
  assigneePicker: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    marginTop: 8,
    maxHeight: 300,
  },
  assigneeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  assigneeOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkboxChecked: {
    backgroundColor: '#f59e0b',
    borderColor: '#f59e0b',
  },
  checkboxCheck: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  assigneeOptionName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
  },
  assigneeOptionDetail: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  photoPlaceholder: {
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    borderStyle: 'dashed',
    paddingVertical: 24,
    alignItems: 'center',
  },
  photoPlaceholderIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  photoPlaceholderText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 4,
  },
  photoPlaceholderHint: {
    fontSize: 12,
    color: '#94a3b8',
    fontStyle: 'italic',
  },
  submitButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    elevation: 3,
    marginTop: 16,
  },
  submitButtonDisabled: {
    backgroundColor: '#94a3b8',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default CreateTaskScreen;
