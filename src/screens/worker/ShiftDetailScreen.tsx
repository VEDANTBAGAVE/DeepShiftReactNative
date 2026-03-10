import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';
import { shiftService } from '../../services/shiftService';
import { ShiftWithRelations } from '../../types/database';

type ShiftDetailNavigationProp = StackNavigationProp<
  RootStackParamList,
  'ShiftDetailScreen'
>;
type ShiftDetailRouteProp = RouteProp<RootStackParamList, 'ShiftDetailScreen'>;

const STATUS_BANNER_COLORS: Record<string, string> = {
  draft: '#e2e8f0',
  submitted: '#d1fae5',
  approved: '#dbeafe',
  archived: '#f1f5f9',
  flagged: '#fef3c7',
};

const ShiftDetailScreen: React.FC = () => {
  const navigation = useNavigation<ShiftDetailNavigationProp>();
  const route = useRoute<ShiftDetailRouteProp>();
  const { shiftId } = route.params;

  const [shift, setShift] = useState<ShiftWithRelations | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    shiftService.getShiftById(shiftId)
      .then(setShift)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [shiftId]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#1e3a5f" style={{ marginTop: 80 }} />
      </SafeAreaView>
    );
  }

  if (!shift) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorState}>
          <Text style={styles.errorText}>Shift not found</Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.errorButton}>← Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const workerLogs = shift.worker_logs ?? [];
  const equipmentLogs = shift.equipment_logs ?? [];
  const incidents = shift.incidents ?? [];

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
          <Text style={styles.headerTitle}>Shift Details</Text>
        </View>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Status Banner */}
        <View
          style={[
            styles.statusBanner,
            { backgroundColor: STATUS_BANNER_COLORS[shift.status] ?? '#e2e8f0' },
          ]}
        >
          <Text style={styles.statusBannerText}>
            Status: {shift.status.toUpperCase()}
          </Text>
        </View>

        {shift.handover_notes ? (
          <View style={styles.reopenedAlert}>
            <Text style={styles.reopenedIcon}>📝</Text>
            <View style={styles.reopenedContent}>
              <Text style={styles.reopenedTitle}>Handover Notes</Text>
              <Text style={styles.reopenedReason}>{shift.handover_notes}</Text>
            </View>
          </View>
        ) : null}

        {/* Shift Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 Shift Details</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Date:</Text>
            <Text style={styles.detailValue}>{shift.shift_date}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Shift:</Text>
            <Text style={styles.detailValue}>{shift.shift_type.toUpperCase()}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Status:</Text>
            <Text style={styles.detailValue}>{shift.status}</Text>
          </View>
          {shift.submitted_at && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Submitted:</Text>
              <Text style={styles.detailValue}>
                {new Date(shift.submitted_at).toLocaleString()}
              </Text>
            </View>
          )}
        </View>

        {/* Worker Attendance */}
        {workerLogs.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>👥 Worker Attendance ({workerLogs.length})</Text>
            {workerLogs.map(log => (
              <View key={log.id} style={styles.equipmentItem}>
                <Text style={styles.equipmentName}>{log.worker_id}</Text>
                <Text style={styles.equipmentCondition}>{log.attendance_status ?? 'unknown'}</Text>
                {log.tasks_performed ? (
                  <Text style={styles.equipmentNotes}>{log.tasks_performed}</Text>
                ) : null}
              </View>
            ))}
          </View>
        )}

        {/* Equipment */}
        {equipmentLogs.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>⚙️ Equipment ({equipmentLogs.length})</Text>
            {equipmentLogs.map(eq => (
              <View key={eq.id} style={styles.equipmentItem}>
                <Text style={styles.equipmentName}>{eq.equipment_name}</Text>
                <Text style={styles.equipmentCondition}>{eq.condition_status}</Text>
                {eq.issue_description ? (
                  <Text style={styles.equipmentNotes}>{eq.issue_description}</Text>
                ) : null}
              </View>
            ))}
          </View>
        )}

        {/* Incidents */}
        {incidents.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>⚠️ Incidents ({incidents.length})</Text>
            {incidents.map(incident => (
              <View key={incident.id} style={styles.incidentItem}>
                <View
                  style={[
                    styles.severityDot,
                    incident.severity_level === 'low' && styles.severityLow,
                    incident.severity_level === 'medium' && styles.severityMedium,
                    incident.severity_level === 'high' && styles.severityHigh,
                  ]}
                />
                <View style={styles.incidentContent}>
                  <Text style={styles.incidentDescription}>{incident.description}</Text>
                  <Text style={styles.incidentMeta}>
                    {incident.severity_level?.toUpperCase()} • {incident.incident_type}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
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
  headerPlaceholder: {
    width: 60,
  },
  scrollView: {
    flex: 1,
  },
  errorState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ef4444',
    marginBottom: 16,
  },
  errorButton: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3b82f6',
  },
  statusBanner: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  statusDraft: {
    backgroundColor: '#e2e8f0',
  },
  statusSubmitted: {
    backgroundColor: '#d1fae5',
  },
  statusReopened: {
    backgroundColor: '#fef3c7',
  },
  statusAcknowledged: {
    backgroundColor: '#dbeafe',
  },
  statusBannerText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e293b',
  },
  reopenedAlert: {
    flexDirection: 'row',
    backgroundColor: '#fef3c7',
    marginHorizontal: 16,
    marginTop: 12,
    padding: 14,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  reopenedIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  reopenedContent: {
    flex: 1,
  },
  reopenedTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#92400e',
    marginBottom: 4,
  },
  reopenedReason: {
    fontSize: 14,
    color: '#b45309',
  },
  section: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 12,
    padding: 18,
    borderRadius: 12,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 14,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
    width: 120,
  },
  detailValue: {
    flex: 1,
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '600',
  },
  confirmedBadge: {
    backgroundColor: '#d1fae5',
    padding: 10,
    borderRadius: 8,
    marginTop: 8,
  },
  confirmedText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#065f46',
  },
  equipmentItem: {
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#f59e0b',
  },
  equipmentName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  equipmentCondition: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
    marginBottom: 4,
  },
  equipmentNotes: {
    fontSize: 13,
    color: '#475569',
    fontStyle: 'italic',
  },
  equipmentPhotos: {
    fontSize: 12,
    color: '#f59e0b',
    fontWeight: '600',
    marginTop: 4,
  },
  summaryText: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
    marginBottom: 10,
  },
  productionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10b981',
    marginBottom: 10,
  },
  problemsBox: {
    backgroundColor: '#fef2f2',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#ef4444',
  },
  problemsTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#991b1b',
    marginBottom: 4,
  },
  problemsText: {
    fontSize: 13,
    color: '#7f1d1d',
  },
  incidentItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  severityDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
    marginTop: 4,
  },
  severityLow: {
    backgroundColor: '#10b981',
  },
  severityMedium: {
    backgroundColor: '#f59e0b',
  },
  severityHigh: {
    backgroundColor: '#ef4444',
  },
  incidentContent: {
    flex: 1,
  },
  incidentDescription: {
    fontSize: 14,
    color: '#1e293b',
    marginBottom: 4,
  },
  incidentMeta: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
  },
  auditEntry: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  auditDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3b82f6',
    marginRight: 12,
    marginTop: 6,
  },
  auditContent: {
    flex: 1,
  },
  auditDescription: {
    fontSize: 14,
    color: '#1e293b',
    marginBottom: 2,
  },
  auditTime: {
    fontSize: 12,
    color: '#94a3b8',
  },
});

export default ShiftDetailScreen;
