import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { useAuth } from '../context/AuthContext';
import workerFeedbackService from '../services/workerFeedbackService';
import { WorkerFeedbackReport } from '../types/database';
import userService from '../services/userService';
import { notificationService } from '../services/notificationService';
import { incidentService } from '../services/incidentService';
import { IncidentType, SeverityLevel } from '../types/database';

type FeedbackReviewNavigationProp = StackNavigationProp<RootStackParamList>;

const badgeColor = (status: string) => {
  if (status === 'pending_supervisor_review') return '#f59e0b';
  if (status === 'pending_manager_verification') return '#3b82f6';
  if (status === 'confirmed') return '#10b981';
  return '#ef4444';
};

const FeedbackReviewScreen: React.FC = () => {
  const navigation = useNavigation<FeedbackReviewNavigationProp>();
  const { user } = useAuth();
  const [items, setItems] = useState<WorkerFeedbackReport[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const isManager = user?.role === 'manager';

  const load = useCallback(async () => {
    if (!user) return;

    try {
      if (isManager) {
        const data = await workerFeedbackService.getAllFeedback(
          'pending_manager_verification',
        );
        setItems(data);
      } else {
        const sectionId = user.section_id;
        if (!sectionId) {
          setItems([]);
        } else {
          const data = await workerFeedbackService.getFeedbackForSection(
            sectionId,
            'pending_supervisor_review',
          );
          setItems(data);
        }
      }
    } catch {
      setItems([]);
    } finally {
      setRefreshing(false);
    }
  }, [user, isManager]);

  useEffect(() => {
    load();
  }, [load]);

  const notifyWorker = async (
    workerId: string,
    title: string,
    body: string,
    relatedId: string,
  ) => {
    await notificationService.createNotification({
      user_id: workerId,
      type: 'report_status',
      title,
      body,
      related_entity_id: relatedId,
    });
  };

  const handleSupervisorForward = async (item: WorkerFeedbackReport) => {
    if (!user?.id) return;
    try {
      await workerFeedbackService.supervisorReview(
        item.id,
        user.id,
        'pending_manager_verification',
      );

      const managers = await userService.getManagers();
      await Promise.all(
        managers.map(m =>
          notificationService.createNotification({
            user_id: m.id,
            type: 'safety',
            title: 'Worker Feedback Awaiting Verification',
            body: `Feedback ${item.id.slice(
              0,
              8,
            )} has been reviewed by supervisor and awaits manager verification.`,
            related_entity_id: item.id,
          }),
        ),
      );

      await notifyWorker(
        item.worker_id,
        'Worker Feedback Reviewed by Supervisor',
        'Your feedback has been forwarded for manager verification.',
        item.id,
      );

      await load();
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Failed to forward feedback.');
    }
  };

  const handleSupervisorReject = async (item: WorkerFeedbackReport) => {
    if (!user?.id) return;
    try {
      await workerFeedbackService.supervisorReview(
        item.id,
        user.id,
        'rejected',
      );
      await notifyWorker(
        item.worker_id,
        'Worker Feedback Rejected in Supervisor Review',
        'Your feedback was rejected during supervisor review.',
        item.id,
      );
      await load();
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Failed to reject feedback.');
    }
  };

  const handleManagerConfirm = async (item: WorkerFeedbackReport) => {
    if (!user?.id) return;
    try {
      await workerFeedbackService.managerVerify(item.id, user.id, 'confirmed');

      if (item.shift_id) {
        const typeMap: Record<string, IncidentType> = {
          unreported_incident: 'other',
          equipment_hazard: 'equipment',
          attendance_dispute: 'other',
          unsafe_condition: 'other',
          other: 'other',
        };

        const severityMap: Record<string, SeverityLevel> = {
          unreported_incident: 'medium',
          equipment_hazard: 'high',
          attendance_dispute: 'low',
          unsafe_condition: 'high',
          other: 'low',
        };

        await incidentService.createIncident({
          shift_id: item.shift_id,
          section_id: item.section_id,
          incident_type: typeMap[item.feedback_type] ?? 'other',
          severity_level: severityMap[item.feedback_type] ?? 'low',
          title: 'Worker Feedback Confirmed',
          description: item.description,
          location_details: 'Generated from verified worker feedback report',
          reported_by: user.id,
        });
      }

      await notifyWorker(
        item.worker_id,
        'Worker Feedback Confirmed',
        'Your feedback has been manager-verified and confirmed. Official records were updated where applicable.',
        item.id,
      );
      await load();
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Failed to confirm feedback.');
    }
  };

  const handleManagerReject = async (item: WorkerFeedbackReport) => {
    if (!user?.id) return;
    try {
      await workerFeedbackService.managerVerify(item.id, user.id, 'rejected');
      await notifyWorker(
        item.worker_id,
        'Worker Feedback Rejected',
        'Your feedback has been reviewed and rejected by manager verification.',
        item.id,
      );
      await load();
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Failed to reject feedback.');
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
        <Text style={styles.title}>Worker Feedback Review</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 12, paddingBottom: 24 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              load();
            }}
          />
        }
      >
        <View style={styles.notice}>
          <Text style={styles.noticeText}>
            {isManager
              ? 'Manager verification queue: pending manager verification.'
              : 'Supervisor queue: pending supervisor review.'}
          </Text>
        </View>

        {items.length === 0 ? (
          <Text style={styles.empty}>No worker feedback pending review.</Text>
        ) : (
          items.map(item => (
            <View key={item.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardType}>
                  {item.feedback_type.replace(/_/g, ' ')}
                </Text>
                <View
                  style={[
                    styles.badge,
                    { backgroundColor: badgeColor(item.status) },
                  ]}
                >
                  <Text style={styles.badgeText}>
                    {item.status.replace(/_/g, ' ')}
                  </Text>
                </View>
              </View>

              <Text style={styles.desc}>{item.description}</Text>
              <Text style={styles.meta}>
                Worker: {item.worker_id.slice(0, 8)} •{' '}
                {new Date(item.created_at).toLocaleString()}
              </Text>

              <View style={styles.actions}>
                {isManager ? (
                  <>
                    <TouchableOpacity
                      style={[styles.btn, styles.btnPrimary]}
                      onPress={() => handleManagerConfirm(item)}
                    >
                      <Text style={styles.btnText}>Confirm</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.btn, styles.btnDanger]}
                      onPress={() => handleManagerReject(item)}
                    >
                      <Text style={styles.btnText}>Reject</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <TouchableOpacity
                      style={[styles.btn, styles.btnPrimary]}
                      onPress={() => handleSupervisorForward(item)}
                    >
                      <Text style={styles.btnText}>Forward to Manager</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.btn, styles.btnDanger]}
                      onPress={() => handleSupervisorReject(item)}
                    >
                      <Text style={styles.btnText}>Reject</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </View>
          ))
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
  title: { color: '#fff', fontSize: 17, fontWeight: '700' },
  notice: {
    backgroundColor: '#e0f2fe',
    borderColor: '#bae6fd',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
  },
  noticeText: { color: '#0c4a6e', fontSize: 12, fontWeight: '600' },
  empty: { color: '#64748b', fontSize: 13, marginTop: 8 },
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
    marginBottom: 8,
  },
  cardType: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'capitalize',
    color: '#1e293b',
  },
  badge: { borderRadius: 10, paddingHorizontal: 8, paddingVertical: 4 },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  desc: { color: '#334155', fontSize: 13, marginBottom: 6 },
  meta: { color: '#94a3b8', fontSize: 11, marginBottom: 10 },
  actions: { flexDirection: 'row', gap: 8 },
  btn: { flex: 1, borderRadius: 8, paddingVertical: 10, alignItems: 'center' },
  btnPrimary: { backgroundColor: '#2563eb' },
  btnDanger: { backgroundColor: '#dc2626' },
  btnText: { color: '#fff', fontSize: 12, fontWeight: '700' },
});

export default FeedbackReviewScreen;
