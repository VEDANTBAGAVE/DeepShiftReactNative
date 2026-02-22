import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';

type SubmittedLogsScreenNavigationProp =
  StackNavigationProp<RootStackParamList>;

interface ShiftLog {
  id: string;
  date: string;
  dayOfWeek: string;
  shiftType: string;
  shiftTime: string;
  totalSections: number;
  totalWorkers: number;
  workersPresent: number;
  workersAbsent: number;
  totalIncidents: number;
  safetyScore: number;
  productionAchieved: number;
  status: 'submitted' | 'reviewed' | 'approved';
  submittedBy: string;
  submittedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  remarks: string;
}

const SubmittedLogsScreen: React.FC = () => {
  const navigation = useNavigation<SubmittedLogsScreenNavigationProp>();

  const [filterStatus, setFilterStatus] = useState<
    'all' | 'submitted' | 'reviewed' | 'approved'
  >('all');
  const [selectedLog, setSelectedLog] = useState<ShiftLog | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  // Demo data - historical shift logs
  const [shiftLogs] = useState<ShiftLog[]>([
    {
      id: 'LOG001',
      date: 'Oct 27, 2025',
      dayOfWeek: 'Monday',
      shiftType: 'Morning Shift',
      shiftTime: '06:00 AM - 02:00 PM',
      totalSections: 8,
      totalWorkers: 56,
      workersPresent: 51,
      workersAbsent: 5,
      totalIncidents: 2,
      safetyScore: 92,
      productionAchieved: 91,
      status: 'submitted',
      submittedBy: 'You',
      submittedAt: '02:15 PM',
      remarks:
        'Shift completed with minor equipment issues. All safety protocols followed. Production target nearly achieved despite hydraulic support maintenance delay.',
    },
    {
      id: 'LOG002',
      date: 'Oct 26, 2025',
      dayOfWeek: 'Sunday',
      shiftType: 'Morning Shift',
      shiftTime: '06:00 AM - 02:00 PM',
      totalSections: 8,
      totalWorkers: 54,
      workersPresent: 54,
      workersAbsent: 0,
      totalIncidents: 0,
      safetyScore: 98,
      productionAchieved: 105,
      status: 'approved',
      submittedBy: 'You',
      submittedAt: '02:10 PM',
      reviewedBy: 'Manager Singh',
      reviewedAt: '04:30 PM',
      remarks:
        'Excellent shift performance. All workers present, no incidents reported. Production target exceeded by 5%. Commendable work by all foremen and crews.',
    },
    {
      id: 'LOG003',
      date: 'Oct 25, 2025',
      dayOfWeek: 'Saturday',
      shiftType: 'Morning Shift',
      shiftTime: '06:00 AM - 02:00 PM',
      totalSections: 8,
      totalWorkers: 55,
      workersPresent: 52,
      workersAbsent: 3,
      totalIncidents: 1,
      safetyScore: 95,
      productionAchieved: 98,
      status: 'reviewed',
      submittedBy: 'You',
      submittedAt: '02:20 PM',
      reviewedBy: 'Manager Singh',
      reviewedAt: '05:15 PM',
      remarks:
        'Shift operations normal. Minor incident in Panel 6-A resolved quickly. Good response time from maintenance team. Nearly met production targets.',
    },
    {
      id: 'LOG004',
      date: 'Oct 24, 2025',
      dayOfWeek: 'Friday',
      shiftType: 'Morning Shift',
      shiftTime: '06:00 AM - 02:00 PM',
      totalSections: 8,
      totalWorkers: 56,
      workersPresent: 53,
      workersAbsent: 3,
      totalIncidents: 0,
      safetyScore: 94,
      productionAchieved: 89,
      status: 'approved',
      submittedBy: 'You',
      submittedAt: '02:25 PM',
      reviewedBy: 'Manager Singh',
      reviewedAt: '06:00 PM',
      remarks:
        'Steady shift with no incidents. Production slightly below target due to equipment maintenance in Panel 5-A. All safety checks completed successfully.',
    },
    {
      id: 'LOG005',
      date: 'Oct 23, 2025',
      dayOfWeek: 'Thursday',
      shiftType: 'Morning Shift',
      shiftTime: '06:00 AM - 02:00 PM',
      totalSections: 8,
      totalWorkers: 57,
      workersPresent: 55,
      workersAbsent: 2,
      totalIncidents: 3,
      safetyScore: 88,
      productionAchieved: 85,
      status: 'approved',
      submittedBy: 'You',
      submittedAt: '02:30 PM',
      reviewedBy: 'Manager Singh',
      reviewedAt: '04:45 PM',
      remarks:
        'Challenging shift with multiple equipment issues. All incidents handled properly. Crew safety maintained. Production impacted but recovery plan in place.',
    },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted':
        return '#3b82f6';
      case 'reviewed':
        return '#f59e0b';
      case 'approved':
        return '#10b981';
      default:
        return '#64748b';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'submitted':
        return 'Submitted';
      case 'reviewed':
        return 'Reviewed';
      case 'approved':
        return 'Approved';
      default:
        return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'submitted':
        return '📤';
      case 'reviewed':
        return '👁';
      case 'approved':
        return '✓';
      default:
        return '•';
    }
  };

  const filteredLogs = shiftLogs.filter(
    log => filterStatus === 'all' || log.status === filterStatus,
  );

  const statusCounts = {
    all: shiftLogs.length,
    submitted: shiftLogs.filter(l => l.status === 'submitted').length,
    reviewed: shiftLogs.filter(l => l.status === 'reviewed').length,
    approved: shiftLogs.filter(l => l.status === 'approved').length,
  };

  const handleViewLog = (log: ShiftLog) => {
    setSelectedLog(log);
    setDetailModalVisible(true);
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
        <Text style={styles.headerTitle}>Submitted Logs</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Summary Stats */}
      <View style={styles.summaryBar}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryNumber}>{shiftLogs.length}</Text>
          <Text style={styles.summaryLabel}>Total Logs</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryNumber, { color: '#3b82f6' }]}>
            {statusCounts.submitted}
          </Text>
          <Text style={styles.summaryLabel}>Submitted</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryNumber, { color: '#10b981' }]}>
            {statusCounts.approved}
          </Text>
          <Text style={styles.summaryLabel}>Approved</Text>
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterTabs}>
        <TouchableOpacity
          style={[
            styles.filterTab,
            filterStatus === 'all' && styles.filterTabActive,
          ]}
          onPress={() => setFilterStatus('all')}
        >
          <Text
            style={[
              styles.filterTabText,
              filterStatus === 'all' && styles.filterTabTextActive,
            ]}
          >
            All ({statusCounts.all})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterTab,
            filterStatus === 'submitted' && styles.filterTabActive,
          ]}
          onPress={() => setFilterStatus('submitted')}
        >
          <Text
            style={[
              styles.filterTabText,
              filterStatus === 'submitted' && styles.filterTabTextActive,
            ]}
          >
            Submitted ({statusCounts.submitted})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterTab,
            filterStatus === 'reviewed' && styles.filterTabActive,
          ]}
          onPress={() => setFilterStatus('reviewed')}
        >
          <Text
            style={[
              styles.filterTabText,
              filterStatus === 'reviewed' && styles.filterTabTextActive,
            ]}
          >
            Reviewed ({statusCounts.reviewed})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterTab,
            filterStatus === 'approved' && styles.filterTabActive,
          ]}
          onPress={() => setFilterStatus('approved')}
        >
          <Text
            style={[
              styles.filterTabText,
              filterStatus === 'approved' && styles.filterTabTextActive,
            ]}
          >
            Approved ({statusCounts.approved})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Logs List */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {filteredLogs.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>📋</Text>
            <Text style={styles.emptyStateText}>No logs found</Text>
            <Text style={styles.emptyStateSubtext}>
              Try adjusting your filter
            </Text>
          </View>
        ) : (
          filteredLogs.map(log => (
            <TouchableOpacity
              key={log.id}
              style={styles.logCard}
              onPress={() => handleViewLog(log)}
              activeOpacity={0.7}
            >
              {/* Status Indicator Bar */}
              <View
                style={[
                  styles.statusBar,
                  { backgroundColor: getStatusColor(log.status) },
                ]}
              />

              {/* Card Header */}
              <View style={styles.cardHeader}>
                <View style={styles.cardHeaderLeft}>
                  <Text style={styles.logDate}>{log.date}</Text>
                  <Text style={styles.logDayOfWeek}>{log.dayOfWeek}</Text>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(log.status) },
                  ]}
                >
                  <Text style={styles.statusIcon}>
                    {getStatusIcon(log.status)}
                  </Text>
                  <Text style={styles.statusText}>
                    {getStatusLabel(log.status)}
                  </Text>
                </View>
              </View>

              {/* Shift Info */}
              <View style={styles.shiftInfo}>
                <Text style={styles.shiftType}>{log.shiftType}</Text>
                <Text style={styles.shiftTime}>🕒 {log.shiftTime}</Text>
              </View>

              {/* Quick Stats Grid */}
              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Workers</Text>
                  <Text style={styles.statValue}>
                    {log.workersPresent}/{log.totalWorkers}
                  </Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Safety</Text>
                  <Text
                    style={[
                      styles.statValue,
                      {
                        color:
                          log.safetyScore >= 90
                            ? '#10b981'
                            : log.safetyScore >= 75
                            ? '#f59e0b'
                            : '#ef4444',
                      },
                    ]}
                  >
                    {log.safetyScore}%
                  </Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Production</Text>
                  <Text
                    style={[
                      styles.statValue,
                      {
                        color:
                          log.productionAchieved >= 100
                            ? '#10b981'
                            : log.productionAchieved >= 90
                            ? '#3b82f6'
                            : '#f59e0b',
                      },
                    ]}
                  >
                    {log.productionAchieved}%
                  </Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Incidents</Text>
                  <Text
                    style={[
                      styles.statValue,
                      {
                        color: log.totalIncidents === 0 ? '#10b981' : '#ef4444',
                      },
                    ]}
                  >
                    {log.totalIncidents}
                  </Text>
                </View>
              </View>

              {/* Submission Info */}
              <View style={styles.submissionInfo}>
                <Text style={styles.submissionText}>
                  📤 Submitted by {log.submittedBy} at {log.submittedAt}
                </Text>
                {log.reviewedBy && (
                  <Text style={styles.submissionText}>
                    ✓ Reviewed by {log.reviewedBy} at {log.reviewedAt}
                  </Text>
                )}
              </View>

              {/* View Details Button */}
              <View style={styles.viewDetailsRow}>
                <Text style={styles.viewDetailsText}>
                  Tap to view full report
                </Text>
                <Text style={styles.viewDetailsArrow}>→</Text>
              </View>
            </TouchableOpacity>
          ))
        )}

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Detail Modal */}
      <Modal
        visible={detailModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setDetailModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Shift Log Details</Text>
              <TouchableOpacity
                onPress={() => setDetailModalVisible(false)}
                style={styles.modalCloseButton}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            {selectedLog && (
              <ScrollView
                style={styles.modalScrollView}
                showsVerticalScrollIndicator={false}
              >
                {/* Log ID & Status */}
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>
                    Report Information
                  </Text>
                  <View style={styles.modalInfoRow}>
                    <Text style={styles.modalLabel}>Log ID</Text>
                    <Text style={styles.modalValue}>{selectedLog.id}</Text>
                  </View>
                  <View style={styles.modalInfoRow}>
                    <Text style={styles.modalLabel}>Date</Text>
                    <Text style={styles.modalValue}>
                      {selectedLog.date} ({selectedLog.dayOfWeek})
                    </Text>
                  </View>
                  <View style={styles.modalInfoRow}>
                    <Text style={styles.modalLabel}>Shift</Text>
                    <Text style={styles.modalValue}>
                      {selectedLog.shiftType}
                    </Text>
                  </View>
                  <View style={styles.modalInfoRow}>
                    <Text style={styles.modalLabel}>Status</Text>
                    <View
                      style={[
                        styles.modalStatusBadge,
                        { backgroundColor: getStatusColor(selectedLog.status) },
                      ]}
                    >
                      <Text style={styles.modalStatusText}>
                        {getStatusLabel(selectedLog.status)}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Workers Summary */}
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>
                    👥 Workers Summary
                  </Text>
                  <View style={styles.modalStatsGrid}>
                    <View style={styles.modalStatBox}>
                      <Text style={styles.modalStatValue}>
                        {selectedLog.totalWorkers}
                      </Text>
                      <Text style={styles.modalStatLabel}>Total</Text>
                    </View>
                    <View style={styles.modalStatBox}>
                      <Text
                        style={[styles.modalStatValue, { color: '#10b981' }]}
                      >
                        {selectedLog.workersPresent}
                      </Text>
                      <Text style={styles.modalStatLabel}>Present</Text>
                    </View>
                    <View style={styles.modalStatBox}>
                      <Text
                        style={[
                          styles.modalStatValue,
                          {
                            color:
                              selectedLog.workersAbsent > 0
                                ? '#f59e0b'
                                : '#64748b',
                          },
                        ]}
                      >
                        {selectedLog.workersAbsent}
                      </Text>
                      <Text style={styles.modalStatLabel}>Absent</Text>
                    </View>
                  </View>
                </View>

                {/* Safety & Production */}
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>
                    📊 Performance Metrics
                  </Text>
                  <View style={styles.modalMetricRow}>
                    <Text style={styles.modalMetricLabel}>Safety Score</Text>
                    <Text
                      style={[
                        styles.modalMetricValue,
                        {
                          color:
                            selectedLog.safetyScore >= 90
                              ? '#10b981'
                              : selectedLog.safetyScore >= 75
                              ? '#f59e0b'
                              : '#ef4444',
                        },
                      ]}
                    >
                      {selectedLog.safetyScore}%
                    </Text>
                  </View>
                  <View style={styles.modalMetricRow}>
                    <Text style={styles.modalMetricLabel}>
                      Production Achievement
                    </Text>
                    <Text
                      style={[
                        styles.modalMetricValue,
                        {
                          color:
                            selectedLog.productionAchieved >= 100
                              ? '#10b981'
                              : selectedLog.productionAchieved >= 90
                              ? '#3b82f6'
                              : '#f59e0b',
                        },
                      ]}
                    >
                      {selectedLog.productionAchieved}%
                    </Text>
                  </View>
                  <View style={styles.modalMetricRow}>
                    <Text style={styles.modalMetricLabel}>Total Incidents</Text>
                    <Text
                      style={[
                        styles.modalMetricValue,
                        {
                          color:
                            selectedLog.totalIncidents === 0
                              ? '#10b981'
                              : '#ef4444',
                        },
                      ]}
                    >
                      {selectedLog.totalIncidents}
                    </Text>
                  </View>
                  <View style={styles.modalMetricRow}>
                    <Text style={styles.modalMetricLabel}>Total Sections</Text>
                    <Text style={styles.modalMetricValue}>
                      {selectedLog.totalSections}
                    </Text>
                  </View>
                </View>

                {/* Remarks */}
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>
                    💬 Supervisor Remarks
                  </Text>
                  <View style={styles.remarksBox}>
                    <Text style={styles.remarksText}>
                      {selectedLog.remarks}
                    </Text>
                  </View>
                </View>

                {/* Audit Trail */}
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>📋 Audit Trail</Text>
                  <View style={styles.auditItem}>
                    <Text style={styles.auditIcon}>📤</Text>
                    <View style={styles.auditContent}>
                      <Text style={styles.auditAction}>Submitted</Text>
                      <Text style={styles.auditDetails}>
                        by {selectedLog.submittedBy} at{' '}
                        {selectedLog.submittedAt}
                      </Text>
                    </View>
                  </View>
                  {selectedLog.reviewedBy && (
                    <View style={styles.auditItem}>
                      <Text style={styles.auditIcon}>👁</Text>
                      <View style={styles.auditContent}>
                        <Text style={styles.auditAction}>Reviewed</Text>
                        <Text style={styles.auditDetails}>
                          by {selectedLog.reviewedBy} at{' '}
                          {selectedLog.reviewedAt}
                        </Text>
                      </View>
                    </View>
                  )}
                </View>

                <View style={{ height: 20 }} />
              </ScrollView>
            )}
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
  summaryBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 2,
    borderBottomColor: '#e2e8f0',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
  },
  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#e2e8f0',
    marginHorizontal: 4,
  },
  filterTabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    backgroundColor: '#fff',
  },
  filterTab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  filterTabActive: {
    backgroundColor: '#1e3a5f',
    borderColor: '#1e3a5f',
  },
  filterTabText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
  },
  filterTabTextActive: {
    color: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#64748b',
  },
  logCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#1e3a5f',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    position: 'relative',
  },
  statusBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardHeaderLeft: {
    flex: 1,
  },
  logDate: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 2,
  },
  logDayOfWeek: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  statusIcon: {
    fontSize: 14,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
  shiftInfo: {
    backgroundColor: '#f8fafc',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  shiftType: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  shiftTime: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#f1f5f9',
    marginBottom: 12,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 10,
    color: '#64748b',
    marginBottom: 4,
    fontWeight: '600',
  },
  statValue: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#e2e8f0',
    marginHorizontal: 4,
  },
  submissionInfo: {
    gap: 4,
    marginBottom: 12,
  },
  submissionText: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
  },
  viewDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  viewDetailsText: {
    fontSize: 13,
    color: '#3b82f6',
    fontWeight: '600',
  },
  viewDetailsArrow: {
    fontSize: 16,
    color: '#3b82f6',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  modalCloseButton: {
    padding: 4,
  },
  modalCloseText: {
    fontSize: 24,
    color: '#64748b',
    fontWeight: '300',
  },
  modalScrollView: {
    paddingHorizontal: 20,
  },
  modalSection: {
    paddingTop: 20,
  },
  modalSectionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
  },
  modalInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  modalLabel: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '600',
  },
  modalValue: {
    fontSize: 13,
    color: '#1e293b',
    fontWeight: 'bold',
  },
  modalStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  modalStatusText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
  },
  modalStatsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  modalStatBox: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  modalStatValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  modalStatLabel: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '600',
  },
  modalMetricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  modalMetricLabel: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '600',
  },
  modalMetricValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  remarksBox: {
    backgroundColor: '#f8fafc',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  remarksText: {
    fontSize: 13,
    color: '#1e293b',
    lineHeight: 20,
  },
  auditItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 10,
    gap: 12,
  },
  auditIcon: {
    fontSize: 20,
  },
  auditContent: {
    flex: 1,
  },
  auditAction: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 2,
  },
  auditDetails: {
    fontSize: 12,
    color: '#64748b',
  },
});

export default SubmittedLogsScreen;
