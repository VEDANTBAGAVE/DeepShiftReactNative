import React from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';
import { useWorker } from '../../context/WorkerContext';

type ShiftDetailNavigationProp = StackNavigationProp<
  RootStackParamList,
  'ShiftDetailScreen'
>;
type ShiftDetailRouteProp = RouteProp<RootStackParamList, 'ShiftDetailScreen'>;

const ShiftDetailScreen: React.FC = () => {
  const navigation = useNavigation<ShiftDetailNavigationProp>();
  const route = useRoute<ShiftDetailRouteProp>();
  const { shiftId } = route.params;
  const { getShiftById, incidents } = useWorker();

  const shift = getShiftById(shiftId);

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

  const linkedIncidents = incidents.filter(i =>
    shift.incidentIds.includes(i.id),
  );

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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
            shift.status === 'draft' && styles.statusDraft,
            shift.status === 'submitted' && styles.statusSubmitted,
            shift.status === 'reopened' && styles.statusReopened,
            shift.status === 'acknowledged' && styles.statusAcknowledged,
          ]}
        >
          <Text style={styles.statusBannerText}>
            Status: {shift.status.toUpperCase()}
          </Text>
        </View>

        {shift.reopenedReason && (
          <View style={styles.reopenedAlert}>
            <Text style={styles.reopenedIcon}>🔄</Text>
            <View style={styles.reopenedContent}>
              <Text style={styles.reopenedTitle}>Reopened</Text>
              <Text style={styles.reopenedReason}>{shift.reopenedReason}</Text>
            </View>
          </View>
        )}

        {/* Shift Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 Shift Details</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Date:</Text>
            <Text style={styles.detailValue}>{shift.date}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Shift:</Text>
            <Text style={styles.detailValue}>
              {shift.shiftType.toUpperCase()}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Area:</Text>
            <Text style={styles.detailValue}>{shift.area}</Text>
          </View>
          {shift.presenceConfirmed && (
            <View style={styles.confirmedBadge}>
              <Text style={styles.confirmedText}>
                ✓ Presence confirmed at {formatTimestamp(shift.confirmedAt!)}
              </Text>
            </View>
          )}
        </View>

        {/* Equipment */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            ⚙️ Equipment ({shift.equipment.length})
          </Text>
          {shift.equipment.map((eq, index) => (
            <View key={eq.id} style={styles.equipmentItem}>
              <Text style={styles.equipmentName}>
                {index + 1}. {eq.name}
              </Text>
              <Text style={styles.equipmentCondition}>{eq.condition}</Text>
              {eq.notes && (
                <Text style={styles.equipmentNotes}>{eq.notes}</Text>
              )}
              {eq.photos.length > 0 && (
                <Text style={styles.equipmentPhotos}>
                  📷 {eq.photos.length} photo(s)
                </Text>
              )}
            </View>
          ))}
        </View>

        {/* Safety */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚠️ Safety</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Gas CH₄:</Text>
            <Text style={styles.detailValue}>{shift.gasCH4}%</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Ventilation:</Text>
            <Text style={styles.detailValue}>
              {shift.ventilationStatus.toUpperCase()}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>PPE:</Text>
            <Text style={styles.detailValue}>
              {shift.ppeChecklist.join(', ')}
            </Text>
          </View>
        </View>

        {/* Work Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📝 Work Summary</Text>
          <Text style={styles.summaryText}>{shift.tasksDone}</Text>
          {shift.productionPercent && (
            <Text style={styles.productionText}>
              Production: {shift.productionPercent}%
            </Text>
          )}
          {shift.problemsFaced && (
            <View style={styles.problemsBox}>
              <Text style={styles.problemsTitle}>Problems:</Text>
              <Text style={styles.problemsText}>{shift.problemsFaced}</Text>
            </View>
          )}
        </View>

        {/* Incidents */}
        {linkedIncidents.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              ⚠️ Linked Incidents ({linkedIncidents.length})
            </Text>
            {linkedIncidents.map(incident => (
              <View key={incident.id} style={styles.incidentItem}>
                <View
                  style={[
                    styles.severityDot,
                    incident.severity === 'low' && styles.severityLow,
                    incident.severity === 'medium' && styles.severityMedium,
                    incident.severity === 'high' && styles.severityHigh,
                  ]}
                />
                <View style={styles.incidentContent}>
                  <Text style={styles.incidentDescription}>
                    {incident.description}
                  </Text>
                  <Text style={styles.incidentMeta}>
                    {incident.severity.toUpperCase()} • {incident.area}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Audit Log */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📜 Audit Trail</Text>
          {shift.auditLog.map(entry => (
            <View key={entry.id} style={styles.auditEntry}>
              <View style={styles.auditDot} />
              <View style={styles.auditContent}>
                <Text style={styles.auditDescription}>{entry.description}</Text>
                <Text style={styles.auditTime}>
                  {formatTimestamp(entry.timestamp)}
                </Text>
              </View>
            </View>
          ))}
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
