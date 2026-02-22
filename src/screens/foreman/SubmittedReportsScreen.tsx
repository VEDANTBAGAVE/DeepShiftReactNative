import React, { useState } from 'react';
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

type SubmittedReportsScreenNavigationProp =
  StackNavigationProp<RootStackParamList>;

// Sample reports data for UI/UX preview
const SAMPLE_REPORTS = [
  {
    id: 'RPT-2025-0426',
    date: '2025-10-26',
    shift: 'Morning Shift',
    section: 'Panel 5-A',
    status: 'pending',
    submittedBy: 'Foreman Rajesh Kumar',
    submittedAt: '2025-10-26T10:30:00',
    overmanComments: null,
    summary: {
      crewPresent: 7,
      crewAbsent: 1,
      equipmentOperational: 5,
      equipmentDown: 1,
      safetyIssues: 0,
      productionTarget: 50,
      productionActual: 45,
    },
  },
  {
    id: 'RPT-2025-0425',
    date: '2025-10-25',
    shift: 'Evening Shift',
    section: 'Panel 5-A',
    status: 'reopened',
    submittedBy: 'Foreman Amit Singh',
    submittedAt: '2025-10-25T18:45:00',
    overmanComments:
      'Need clarification on equipment downtime. Please provide more details.',
    summary: {
      crewPresent: 8,
      crewAbsent: 0,
      equipmentOperational: 6,
      equipmentDown: 0,
      safetyIssues: 1,
      productionTarget: 48,
      productionActual: 52,
    },
  },
  {
    id: 'RPT-2025-0424',
    date: '2025-10-24',
    shift: 'Morning Shift',
    section: 'Panel 5-A',
    status: 'approved',
    submittedBy: 'Foreman Rajesh Kumar',
    submittedAt: '2025-10-24T11:00:00',
    overmanComments: 'Excellent work. All safety protocols followed.',
    summary: {
      crewPresent: 8,
      crewAbsent: 0,
      equipmentOperational: 6,
      equipmentDown: 0,
      safetyIssues: 0,
      productionTarget: 50,
      productionActual: 48,
    },
  },
];

const SubmittedReportsScreen: React.FC = () => {
  const navigation = useNavigation<SubmittedReportsScreenNavigationProp>();
  const [filter, setFilter] = useState<
    'all' | 'pending' | 'approved' | 'reopened'
  >('all');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return '#10b981';
      case 'pending':
        return '#f59e0b';
      case 'reopened':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return '✅';
      case 'pending':
        return '⏳';
      case 'reopened':
        return '🔄';
      default:
        return '📄';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredReports = SAMPLE_REPORTS.filter(report => {
    if (filter === 'all') return true;
    return report.status === filter;
  });

  const pendingCount = SAMPLE_REPORTS.filter(
    r => r.status === 'pending',
  ).length;
  const approvedCount = SAMPLE_REPORTS.filter(
    r => r.status === 'approved',
  ).length;
  const reopenedCount = SAMPLE_REPORTS.filter(
    r => r.status === 'reopened',
  ).length;

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
        <Text style={styles.headerTitle}>Submitted Reports</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Stats Bar */}
      <View style={styles.statsBar}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{SAMPLE_REPORTS.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={[styles.statBox, styles.statBoxBorder]}>
          <Text style={[styles.statNumber, { color: '#f59e0b' }]}>
            {pendingCount}
          </Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
        <View style={[styles.statBox, styles.statBoxBorder]}>
          <Text style={[styles.statNumber, { color: '#ef4444' }]}>
            {reopenedCount}
          </Text>
          <Text style={styles.statLabel}>Reopened</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={[styles.statNumber, { color: '#10b981' }]}>
            {approvedCount}
          </Text>
          <Text style={styles.statLabel}>Approved</Text>
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterTabs}>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'all' && styles.filterTabActive]}
          onPress={() => setFilter('all')}
        >
          <Text
            style={[
              styles.filterTabText,
              filter === 'all' && styles.filterTabTextActive,
            ]}
          >
            All
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterTab,
            filter === 'pending' && styles.filterTabActive,
          ]}
          onPress={() => setFilter('pending')}
        >
          <Text
            style={[
              styles.filterTabText,
              filter === 'pending' && styles.filterTabTextActive,
            ]}
          >
            Pending
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterTab,
            filter === 'reopened' && styles.filterTabActive,
          ]}
          onPress={() => setFilter('reopened')}
        >
          <Text
            style={[
              styles.filterTabText,
              filter === 'reopened' && styles.filterTabTextActive,
            ]}
          >
            Reopened
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterTab,
            filter === 'approved' && styles.filterTabActive,
          ]}
          onPress={() => setFilter('approved')}
        >
          <Text
            style={[
              styles.filterTabText,
              filter === 'approved' && styles.filterTabTextActive,
            ]}
          >
            Approved
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Preview Notice */}
        <View style={styles.previewNotice}>
          <Text style={styles.previewIcon}>�️</Text>
          <Text style={styles.previewText}>
            UI Preview: Sample report data shown for design purposes
          </Text>
        </View>

        {/* Reports List */}
        {filteredReports.map(report => (
          <TouchableOpacity
            key={report.id}
            style={styles.reportCard}
            activeOpacity={0.7}
          >
            {/* Status Bar */}
            <View
              style={[
                styles.statusBar,
                { backgroundColor: getStatusColor(report.status) },
              ]}
            />

            {/* Card Content */}
            <View style={styles.reportContent}>
              {/* Header */}
              <View style={styles.reportHeader}>
                <View style={styles.reportIdRow}>
                  <Text style={styles.reportIcon}>
                    {getStatusIcon(report.status)}
                  </Text>
                  <Text style={styles.reportId}>{report.id}</Text>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(report.status) },
                  ]}
                >
                  <Text style={styles.statusBadgeText}>
                    {report.status.toUpperCase()}
                  </Text>
                </View>
              </View>

              {/* Date & Shift Info */}
              <View style={styles.infoRow}>
                <View style={styles.infoItem}>
                  <Text style={styles.infoIcon}>📅</Text>
                  <Text style={styles.infoText}>{formatDate(report.date)}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoIcon}>🕐</Text>
                  <Text style={styles.infoText}>{report.shift}</Text>
                </View>
              </View>

              {/* Section Info */}
              <View style={styles.sectionRow}>
                <Text style={styles.sectionIcon}>🏗️</Text>
                <Text style={styles.sectionText}>{report.section}</Text>
              </View>

              {/* Summary Stats */}
              <View style={styles.summaryContainer}>
                <Text style={styles.summaryTitle}>Report Summary</Text>
                <View style={styles.summaryGrid}>
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryLabel}>Crew</Text>
                    <Text style={styles.summaryValue}>
                      {report.summary.crewPresent}/
                      {report.summary.crewPresent + report.summary.crewAbsent}
                    </Text>
                  </View>
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryLabel}>Equipment</Text>
                    <Text style={styles.summaryValue}>
                      {report.summary.equipmentOperational}/
                      {report.summary.equipmentOperational +
                        report.summary.equipmentDown}
                    </Text>
                  </View>
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryLabel}>Production</Text>
                    <Text style={styles.summaryValue}>
                      {report.summary.productionActual}/
                      {report.summary.productionTarget} tons
                    </Text>
                  </View>
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryLabel}>Safety</Text>
                    <Text
                      style={[
                        styles.summaryValue,
                        {
                          color:
                            report.summary.safetyIssues > 0
                              ? '#ef4444'
                              : '#10b981',
                        },
                      ]}
                    >
                      {report.summary.safetyIssues === 0
                        ? '✓ OK'
                        : `${report.summary.safetyIssues} Issue${
                            report.summary.safetyIssues > 1 ? 's' : ''
                          }`}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Overman Comments */}
              {report.overmanComments && (
                <View style={styles.commentsContainer}>
                  <Text style={styles.commentsTitle}>🗨️ Overman Comments</Text>
                  <Text style={styles.commentsText}>
                    {report.overmanComments}
                  </Text>
                </View>
              )}

              {/* Footer */}
              <View style={styles.footerRow}>
                <View style={styles.submitterInfo}>
                  <Text style={styles.submitterIcon}>👤</Text>
                  <Text style={styles.submitterText}>{report.submittedBy}</Text>
                </View>
                <Text style={styles.timeText}>
                  {formatTime(report.submittedAt)}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
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
    width: 70,
  },
  statsBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 14,
    paddingHorizontal: 12,
    justifyContent: 'space-around',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statBoxBorder: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#e2e8f0',
  },
  statNumber: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  statLabel: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 4,
    fontWeight: '600',
  },
  filterTabs: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  filterTab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 6,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
  },
  filterTabActive: {
    backgroundColor: '#3b82f6',
  },
  filterTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
  filterTabTextActive: {
    color: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  previewNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef3c7',
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#f59e0b',
  },
  previewIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  previewText: {
    flex: 1,
    fontSize: 12,
    color: '#92400e',
    fontWeight: '600',
  },
  reportCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#1e3a5f',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statusBar: {
    height: 4,
    width: '100%',
  },
  reportContent: {
    padding: 16,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  reportIdRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reportIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  reportId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    letterSpacing: 0.5,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 10,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  infoText: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  sectionIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  sectionText: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '600',
  },
  summaryContainer: {
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  summaryTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 10,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  summaryItem: {
    width: '47%',
  },
  summaryLabel: {
    fontSize: 11,
    color: '#64748b',
    marginBottom: 4,
    fontWeight: '600',
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  commentsContainer: {
    backgroundColor: '#fef3c7',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#f59e0b',
  },
  commentsTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#92400e',
    marginBottom: 6,
  },
  commentsText: {
    fontSize: 13,
    color: '#78350f',
    lineHeight: 18,
    fontStyle: 'italic',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  submitterInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  submitterIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  submitterText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  timeText: {
    fontSize: 11,
    color: '#94a3b8',
    fontStyle: 'italic',
  },
});

export default SubmittedReportsScreen;
