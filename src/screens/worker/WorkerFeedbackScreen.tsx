import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';
import { useAuth } from '../../context/AuthContext';
import { FeedbackTypeDB, WorkerFeedbackReport } from '../../types/database';
import workerFeedbackService from '../../services/workerFeedbackService';
import userService from '../../services/userService';
import { notificationService } from '../../services/notificationService';
import { shiftService } from '../../services/shiftService';

type WorkerFeedbackNavigationProp = StackNavigationProp<RootStackParamList>;

const FEEDBACK_TYPES: Array<{ value: FeedbackTypeDB; label: string }> = [
  { value: 'unreported_incident', label: 'Unreported incident' },
  { value: 'equipment_hazard', label: 'Equipment hazard' },
  { value: 'attendance_dispute', label: 'Attendance dispute' },
  { value: 'unsafe_condition', label: 'Unsafe condition' },
  { value: 'other', label: 'Other' },
];

const STATUS_STYLE: Record<string, { bg: string; text: string }> = {
  pending_supervisor_review: { bg: '#fef3c7', text: '#92400e' },
  pending_manager_verification: { bg: '#dbeafe', text: '#1e40af' },
  confirmed: { bg: '#dcfce7', text: '#166534' },
  rejected: { bg: '#fee2e2', text: '#991b1b' },
};

const WorkerFeedbackScreen: React.FC = () => {
  const navigation = useNavigation<WorkerFeedbackNavigationProp>();
  const { user } = useAuth();

  const [feedbackType, setFeedbackType] = useState<FeedbackTypeDB>('other');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [items, setItems] = useState<WorkerFeedbackReport[]>([]);

  const loadMyFeedback = useCallback(async () => {
    if (!user?.id) return;
    try {
      const data = await workerFeedbackService.getFeedbackForWorker(user.id);
      setItems(data);
    } catch {
      setItems([]);
    }
  }, [user?.id]);

  useEffect(() => {
    loadMyFeedback();
  }, [loadMyFeedback]);

  const submit = async () => {
    if (!user?.id || !user.section_id) {
      Alert.alert(
        'Unavailable',
        'Worker profile is missing section information.',
      );
      return;
    }
    if (description.trim().length < 10) {
      Alert.alert(
        'Validation',
        'Please provide at least 10 characters for feedback.',
      );
      return;
    }

    setSubmitting(true);
    try {
      const shifts = await shiftService.getTodayShifts(user.section_id);
      const currentShiftId = shifts[0]?.id;

      const created = await workerFeedbackService.createFeedback({
        worker_id: user.id,
        section_id: user.section_id,
        shift_id: currentShiftId,
        feedback_type: feedbackType,
        description: description.trim(),
      });

      const [overmen, managers] = await Promise.all([
        userService.getOvermen(),
        userService.getManagers(),
      ]);

      const recipients = [...overmen, ...managers].filter(
        r => r.id !== user.id,
      );

      await Promise.all(
        recipients.map(r =>
          notificationService.createNotification({
            user_id: r.id,
            type: 'safety',
            title: 'Worker Report – Pending Verification',
            body: `${user.name} submitted ${feedbackType.replace(
              '_',
              ' ',
            )} feedback requiring verification.`,
            related_entity_id: created.id,
          }),
        ),
      );

      setDescription('');
      setFeedbackType('other');
      await loadMyFeedback();
      Alert.alert(
        'Submitted',
        'Safety feedback submitted for supervisor/manager verification.',
      );
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Failed to submit feedback.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Safety Feedback</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <View style={styles.noticeBar}>
          <Text style={styles.noticeText}>
            Submit post-shift safety feedback. Reports are marked as “Worker
            Report – Pending Verification”.
          </Text>
        </View>

        <Text style={styles.label}>Feedback Type</Text>
        <View style={styles.typeWrap}>
          {FEEDBACK_TYPES.map(t => (
            <TouchableOpacity
              key={t.value}
              style={[
                styles.typeChip,
                feedbackType === t.value && styles.typeChipActive,
              ]}
              onPress={() => setFeedbackType(t.value)}
            >
              <Text
                style={[
                  styles.typeText,
                  feedbackType === t.value && styles.typeTextActive,
                ]}
              >
                {t.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Description</Text>
        <TextInput
          style={styles.input}
          multiline
          numberOfLines={5}
          value={description}
          onChangeText={setDescription}
          placeholder="Describe what was missed or unsafe..."
          placeholderTextColor="#94a3b8"
        />

        <TouchableOpacity
          style={[styles.submitBtn, submitting && { opacity: 0.7 }]}
          onPress={submit}
          disabled={submitting}
        >
          <Text style={styles.submitText}>
            {submitting ? 'Submitting...' : 'Submit Feedback'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>My Feedback Reports</Text>
        {items.length === 0 ? (
          <Text style={styles.emptyText}>No feedback reports yet.</Text>
        ) : (
          items.map(item => {
            const state =
              STATUS_STYLE[item.status] ??
              STATUS_STYLE.pending_supervisor_review;
            return (
              <View key={item.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardType}>
                    {item.feedback_type.replace(/_/g, ' ')}
                  </Text>
                  <View style={[styles.status, { backgroundColor: state.bg }]}>
                    <Text style={[styles.statusText, { color: state.text }]}>
                      {item.status.replace(/_/g, ' ')}
                    </Text>
                  </View>
                </View>
                <Text style={styles.cardDesc}>{item.description}</Text>
                <Text style={styles.cardMeta}>
                  {new Date(item.created_at).toLocaleString()}
                </Text>
              </View>
            );
          })
        )}
      </ScrollView>
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
  },
  backButton: { paddingHorizontal: 8, paddingVertical: 6 },
  backButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
  scroll: { flex: 1 },
  content: { padding: 14, paddingBottom: 24 },
  noticeBar: {
    backgroundColor: '#e0f2fe',
    borderColor: '#bae6fd',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
  },
  noticeText: { color: '#0c4a6e', fontSize: 12, fontWeight: '600' },
  label: { fontSize: 13, fontWeight: '700', color: '#334155', marginBottom: 8 },
  typeWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  typeChip: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 14,
    backgroundColor: '#e2e8f0',
  },
  typeChipActive: { backgroundColor: '#1e3a5f' },
  typeText: { color: '#334155', fontSize: 12, fontWeight: '600' },
  typeTextActive: { color: '#fff' },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    minHeight: 110,
    padding: 10,
    color: '#0f172a',
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  submitBtn: {
    backgroundColor: '#2563eb',
    borderRadius: 10,
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 16,
  },
  submitText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 10,
  },
  emptyText: { color: '#64748b', fontSize: 13 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  cardType: {
    textTransform: 'capitalize',
    fontWeight: '700',
    color: '#1e293b',
    fontSize: 13,
  },
  status: { borderRadius: 10, paddingHorizontal: 8, paddingVertical: 4 },
  statusText: { fontSize: 10, fontWeight: '700', textTransform: 'capitalize' },
  cardDesc: { fontSize: 13, color: '#334155', marginBottom: 6 },
  cardMeta: { fontSize: 11, color: '#94a3b8' },
});

export default WorkerFeedbackScreen;
