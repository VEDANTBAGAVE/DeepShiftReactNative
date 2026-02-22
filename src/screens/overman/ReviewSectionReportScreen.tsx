import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';

type ReviewSectionReportScreenNavigationProp =
  StackNavigationProp<RootStackParamList>;
type ReviewSectionReportScreenRouteProp = RouteProp<
  RootStackParamList,
  'ReviewSectionReportScreen'
>;

interface Equipment {
  id: string;
  name: string;
  condition: 'good' | 'needs-maintenance' | 'faulty';
  remarks?: string;
}

interface Worker {
  id: string;
  name: string;
  status: 'present' | 'absent';
}

interface Incident {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
  time: string;
}

interface SafetyReading {
  parameter: string;
  value: string;
  status: 'normal' | 'warning' | 'critical';
  unit: string;
}

const ReviewSectionReportScreen: React.FC = () => {
  const navigation = useNavigation<ReviewSectionReportScreenNavigationProp>();
  const route = useRoute<ReviewSectionReportScreenRouteProp>();

  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [comment, setComment] = useState('');
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [actionMessage, setActionMessage] = useState('');

  // Demo data - In real app, this would come from route params or API
  const reportData = {
    reportId: 'SR001',
    sectionName: 'Panel 5-A',
    foremanName: 'Rajesh Kumar',
    foremanId: 'FM001',
    shiftType: 'Morning Shift',
    shiftDate: 'Oct 27, 2025',
    submittedAt: '08:15 AM',
    status: 'pending' as const,
    workers: [
      { id: 'W001', name: 'Ramesh Yadav', status: 'present' as const },
      { id: 'W002', name: 'Sunil Kumar', status: 'present' as const },
      { id: 'W003', name: 'Prakash Singh', status: 'present' as const },
      { id: 'W004', name: 'Dinesh Patil', status: 'present' as const },
      { id: 'W005', name: 'Anil Sharma', status: 'present' as const },
      { id: 'W006', name: 'Vijay Verma', status: 'present' as const },
      { id: 'W007', name: 'Rajesh Gupta', status: 'present' as const },
      { id: 'W008', name: 'Mohan Das', status: 'absent' as const },
    ],
    equipment: [
      {
        id: 'E001',
        name: 'Pump-03',
        condition: 'needs-maintenance' as const,
        remarks: 'Unusual noise detected',
      },
      { id: 'E002', name: 'Conveyor Belt-2A', condition: 'good' as const },
      { id: 'E003', name: 'Drilling Machine-05', condition: 'good' as const },
      { id: 'E004', name: 'Ventilation Fan-12', condition: 'good' as const },
      {
        id: 'E005',
        name: 'Hydraulic Support-8B',
        condition: 'faulty' as const,
        remarks: 'Pressure leak detected',
      },
    ],
    safetyReadings: [
      {
        parameter: 'Methane (CH₄)',
        value: '0.4',
        status: 'normal' as const,
        unit: '%',
      },
      {
        parameter: 'Carbon Monoxide (CO)',
        value: '12',
        status: 'normal' as const,
        unit: 'ppm',
      },
      {
        parameter: 'Oxygen (O₂)',
        value: '20.8',
        status: 'normal' as const,
        unit: '%',
      },
      {
        parameter: 'Temperature',
        value: '28',
        status: 'normal' as const,
        unit: '°C',
      },
      {
        parameter: 'Ventilation Flow',
        value: '850',
        status: 'normal' as const,
        unit: 'm³/min',
      },
    ],
    incidents: [
      {
        id: 'INC001',
        type: 'Equipment Malfunction',
        severity: 'medium' as const,
        description:
          'Hydraulic support system showed pressure drop. Maintenance team notified immediately.',
        time: '10:30 AM',
      },
    ],
    productionMetrics: {
      coalExtracted: '145',
      targetsAchieved: '92',
    },
    foremanRemarks:
      'All operations conducted smoothly. Minor equipment issues noted and reported. Crew performed well with good safety compliance.',
  };

  const presentWorkers = reportData.workers.filter(
    w => w.status === 'present',
  ).length;
  const absentWorkers = reportData.workers.filter(
    w => w.status === 'absent',
  ).length;
  const faultyEquipment = reportData.equipment.filter(
    e => e.condition === 'faulty' || e.condition === 'needs-maintenance',
  ).length;

  const getEquipmentConditionColor = (condition: string) => {
    switch (condition) {
      case 'good':
        return '#10b981';
      case 'needs-maintenance':
        return '#f59e0b';
      case 'faulty':
        return '#ef4444';
      default:
        return '#64748b';
    }
  };

  const getEquipmentConditionLabel = (condition: string) => {
    switch (condition) {
      case 'good':
        return 'Good';
      case 'needs-maintenance':
        return 'Needs Maintenance';
      case 'faulty':
        return 'Faulty';
      default:
        return condition;
    }
  };

  const getSafetyStatusColor = (status: string) => {
    switch (status) {
      case 'normal':
        return '#10b981';
      case 'warning':
        return '#f59e0b';
      case 'critical':
        return '#ef4444';
      default:
        return '#64748b';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low':
        return '#10b981';
      case 'medium':
        return '#f59e0b';
      case 'high':
        return '#ef4444';
      default:
        return '#64748b';
    }
  };

  const handleApprove = () => {
    setActionMessage('Section Approved');
    setActionModalVisible(true);
    setTimeout(() => {
      setActionModalVisible(false);
      // In real app: Update status and navigate back
    }, 2000);
  };

  const handleReopen = () => {
    setActionMessage('Reopened for Revision');
    setActionModalVisible(true);
    setTimeout(() => {
      setActionModalVisible(false);
      // In real app: Update status and navigate back
    }, 2000);
  };

  const handleAddComment = () => {
    if (comment.trim()) {
      Alert.alert(
        'Comment Added',
        `Your comment has been saved:\n\n"${comment}"`,
      );
      setComment('');
      setCommentModalVisible(false);
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
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Review Report</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Report Header Card */}
        <View style={styles.headerCard}>
          <View style={styles.headerCardTop}>
            <View>
              <Text style={styles.sectionName}>{reportData.sectionName}</Text>
              <Text style={styles.reportId}>
                Report ID: {reportData.reportId}
              </Text>
            </View>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>⏱ Pending Review</Text>
            </View>
          </View>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Foreman</Text>
              <Text style={styles.metaValue}>👨‍🔧 {reportData.foremanName}</Text>
            </View>
            <View style={styles.metaDivider} />
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Shift</Text>
              <Text style={styles.metaValue}>🕒 {reportData.shiftType}</Text>
            </View>
          </View>

          <View style={styles.timestampRow}>
            <Text style={styles.timestamp}>📅 {reportData.shiftDate}</Text>
            <Text style={styles.timestamp}>
              📥 Submitted: {reportData.submittedAt}
            </Text>
          </View>
        </View>

        {/* Quick Summary Stats */}
        <View style={styles.quickStatsCard}>
          <Text style={styles.sectionTitle}>Quick Summary</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={styles.statIcon}>👥</Text>
              <Text style={styles.statNumber}>{presentWorkers}</Text>
              <Text style={styles.statLabel}>Present</Text>
            </View>
            <View style={styles.statBox}>
              <Text
                style={[styles.statIcon, absentWorkers > 0 && { opacity: 0.5 }]}
              >
                👥
              </Text>
              <Text
                style={[
                  styles.statNumber,
                  { color: absentWorkers > 0 ? '#f59e0b' : '#64748b' },
                ]}
              >
                {absentWorkers}
              </Text>
              <Text style={styles.statLabel}>Absent</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statIcon}>⚙️</Text>
              <Text
                style={[
                  styles.statNumber,
                  { color: faultyEquipment > 0 ? '#ef4444' : '#10b981' },
                ]}
              >
                {faultyEquipment}
              </Text>
              <Text style={styles.statLabel}>Issues</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statIcon}>⚠️</Text>
              <Text
                style={[
                  styles.statNumber,
                  {
                    color:
                      reportData.incidents.length > 0 ? '#ef4444' : '#10b981',
                  },
                ]}
              >
                {reportData.incidents.length}
              </Text>
              <Text style={styles.statLabel}>Incidents</Text>
            </View>
          </View>
        </View>

        {/* Workers Section */}
        <View style={styles.dataCard}>
          <Text style={styles.sectionTitle}>
            👥 Workers ({reportData.workers.length})
          </Text>
          <View style={styles.workerList}>
            {reportData.workers.map(worker => (
              <View key={worker.id} style={styles.workerRow}>
                <Text style={styles.workerName}>{worker.name}</Text>
                <View
                  style={[
                    styles.workerStatusBadge,
                    {
                      backgroundColor:
                        worker.status === 'present' ? '#d1fae5' : '#fed7d7',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.workerStatusText,
                      {
                        color:
                          worker.status === 'present' ? '#065f46' : '#991b1b',
                      },
                    ]}
                  >
                    {worker.status === 'present' ? '✓ Present' : '✗ Absent'}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Equipment Section */}
        <View style={styles.dataCard}>
          <Text style={styles.sectionTitle}>
            ⚙️ Equipment ({reportData.equipment.length})
          </Text>
          {reportData.equipment.map(equipment => (
            <View key={equipment.id} style={styles.equipmentCard}>
              <View style={styles.equipmentHeader}>
                <Text style={styles.equipmentName}>{equipment.name}</Text>
                <View
                  style={[
                    styles.conditionBadge,
                    {
                      backgroundColor:
                        getEquipmentConditionColor(equipment.condition) + '20',
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.conditionDot,
                      {
                        backgroundColor: getEquipmentConditionColor(
                          equipment.condition,
                        ),
                      },
                    ]}
                  />
                  <Text
                    style={[
                      styles.conditionText,
                      {
                        color: getEquipmentConditionColor(equipment.condition),
                      },
                    ]}
                  >
                    {getEquipmentConditionLabel(equipment.condition)}
                  </Text>
                </View>
              </View>
              {equipment.remarks && (
                <Text style={styles.equipmentRemarks}>
                  💬 {equipment.remarks}
                </Text>
              )}
            </View>
          ))}
        </View>

        {/* Safety Readings Section */}
        <View style={styles.dataCard}>
          <Text style={styles.sectionTitle}>🛡️ Safety Readings</Text>
          {reportData.safetyReadings.map((reading, index) => (
            <View key={index} style={styles.safetyRow}>
              <View style={styles.safetyLeft}>
                <Text style={styles.safetyParameter}>{reading.parameter}</Text>
              </View>
              <View style={styles.safetyRight}>
                <Text style={styles.safetyValue}>
                  {reading.value} {reading.unit}
                </Text>
                <View
                  style={[
                    styles.safetyStatusDot,
                    { backgroundColor: getSafetyStatusColor(reading.status) },
                  ]}
                />
              </View>
            </View>
          ))}
        </View>

        {/* Production Metrics Section */}
        <View style={styles.dataCard}>
          <Text style={styles.sectionTitle}>📊 Production Metrics</Text>
          <View style={styles.productionGrid}>
            <View style={styles.productionItem}>
              <Text style={styles.productionLabel}>Coal Extracted</Text>
              <Text style={styles.productionValue}>
                {reportData.productionMetrics.coalExtracted} tons
              </Text>
            </View>
            <View style={styles.productionDivider} />
            <View style={styles.productionItem}>
              <Text style={styles.productionLabel}>Target Achieved</Text>
              <Text style={styles.productionValue}>
                {reportData.productionMetrics.targetsAchieved}%
              </Text>
            </View>
          </View>
        </View>

        {/* Incidents Section */}
        {reportData.incidents.length > 0 && (
          <View style={styles.dataCard}>
            <Text style={styles.sectionTitle}>
              ⚠️ Incidents Reported ({reportData.incidents.length})
            </Text>
            {reportData.incidents.map(incident => (
              <View key={incident.id} style={styles.incidentCard}>
                <View style={styles.incidentHeader}>
                  <Text style={styles.incidentType}>{incident.type}</Text>
                  <View
                    style={[
                      styles.severityBadge,
                      { backgroundColor: getSeverityColor(incident.severity) },
                    ]}
                  >
                    <Text style={styles.severityText}>
                      {incident.severity.toUpperCase()}
                    </Text>
                  </View>
                </View>
                <Text style={styles.incidentDescription}>
                  {incident.description}
                </Text>
                <Text style={styles.incidentTime}>🕒 {incident.time}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Foreman Remarks Section */}
        <View style={styles.dataCard}>
          <Text style={styles.sectionTitle}>💬 Foreman's Remarks</Text>
          <View style={styles.remarksBox}>
            <Text style={styles.remarksText}>{reportData.foremanRemarks}</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsCard}>
          <TouchableOpacity
            style={[styles.actionButton, styles.approveButton]}
            onPress={handleApprove}
            activeOpacity={0.8}
          >
            <Text style={styles.actionButtonIcon}>✓</Text>
            <Text style={styles.actionButtonText}>Approve</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.reopenButton]}
            onPress={handleReopen}
            activeOpacity={0.8}
          >
            <Text style={styles.actionButtonIcon}>🔁</Text>
            <Text style={styles.actionButtonText}>Reopen</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.commentButton]}
            onPress={() => setCommentModalVisible(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.actionButtonIcon}>💬</Text>
            <Text style={styles.actionButtonText}>Comment</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>

      {/* Comment Modal */}
      <Modal
        visible={commentModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setCommentModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Comment</Text>
            <TextInput
              style={styles.commentInput}
              placeholder="Enter your comment or feedback..."
              placeholderTextColor="#94a3b8"
              multiline
              numberOfLines={6}
              value={comment}
              onChangeText={setComment}
              textAlignVertical="top"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setComment('');
                  setCommentModalVisible(false);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.submitButton]}
                onPress={handleAddComment}
              >
                <Text style={styles.submitButtonText}>Add Comment</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Action Success Modal */}
      <Modal
        visible={actionModalVisible}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.actionModalOverlay}>
          <View style={styles.actionModalContent}>
            <Text style={styles.actionModalIcon}>✓</Text>
            <Text style={styles.actionModalText}>{actionMessage}</Text>
          </View>
        </View>
      </Modal>
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
    width: 60,
  },
  scrollView: {
    flex: 1,
  },
  headerCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
  },
  headerCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  sectionName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  reportId: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '600',
  },
  statusBadge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f59e0b',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#92400e',
  },
  metaRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#f1f5f9',
    marginBottom: 12,
  },
  metaItem: {
    flex: 1,
  },
  metaLabel: {
    fontSize: 11,
    color: '#64748b',
    marginBottom: 6,
    fontWeight: '600',
  },
  metaValue: {
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '600',
  },
  metaDivider: {
    width: 1,
    backgroundColor: '#e2e8f0',
    marginHorizontal: 16,
  },
  timestampRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  timestamp: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
  },
  quickStatsCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 6,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
  },
  dataCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
  },
  workerList: {
    gap: 8,
  },
  workerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
  },
  workerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    flex: 1,
  },
  workerStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  workerStatusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  equipmentCard: {
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  equipmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  equipmentName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    flex: 1,
  },
  conditionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 6,
  },
  conditionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  conditionText: {
    fontSize: 11,
    fontWeight: '700',
  },
  equipmentRemarks: {
    fontSize: 12,
    color: '#64748b',
    fontStyle: 'italic',
  },
  safetyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    marginBottom: 8,
  },
  safetyLeft: {
    flex: 1,
  },
  safetyParameter: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  safetyRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  safetyValue: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  safetyStatusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  productionGrid: {
    flexDirection: 'row',
    paddingVertical: 8,
  },
  productionItem: {
    flex: 1,
    alignItems: 'center',
  },
  productionLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 8,
  },
  productionValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  productionDivider: {
    width: 1,
    backgroundColor: '#e2e8f0',
    marginHorizontal: 16,
  },
  incidentCard: {
    backgroundColor: '#fef3c7',
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#f59e0b',
  },
  incidentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  incidentType: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e293b',
    flex: 1,
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  severityText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },
  incidentDescription: {
    fontSize: 13,
    color: '#1e293b',
    lineHeight: 18,
    marginBottom: 6,
  },
  incidentTime: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
  },
  remarksBox: {
    backgroundColor: '#f8fafc',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  remarksText: {
    fontSize: 14,
    color: '#1e293b',
    lineHeight: 20,
  },
  actionsCard: {
    flexDirection: 'row',
    gap: 12,
    marginHorizontal: 16,
    marginTop: 20,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    elevation: 3,
  },
  approveButton: {
    backgroundColor: '#10b981',
  },
  reopenButton: {
    backgroundColor: '#f59e0b',
  },
  commentButton: {
    backgroundColor: '#3b82f6',
  },
  actionButtonIcon: {
    fontSize: 18,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  commentInput: {
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    padding: 14,
    fontSize: 14,
    color: '#1e293b',
    minHeight: 120,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f1f5f9',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748b',
  },
  submitButton: {
    backgroundColor: '#3b82f6',
  },
  submitButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  actionModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionModalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    minWidth: 200,
    elevation: 8,
  },
  actionModalIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  actionModalText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
});

export default ReviewSectionReportScreen;
