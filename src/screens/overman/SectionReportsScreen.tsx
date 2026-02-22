import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';

type SectionReportsScreenNavigationProp =
  StackNavigationProp<RootStackParamList>;

interface SectionReport {
  id: string;
  sectionName: string;
  foremanName: string;
  shiftType: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected' | 'flagged';
  crewPresent: number;
  crewAbsent: number;
  incidents: number;
  safetyScore: number;
}

const SectionReportsScreen: React.FC = () => {
  const navigation = useNavigation<SectionReportsScreenNavigationProp>();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<
    'all' | 'pending' | 'approved' | 'flagged'
  >('all');

  // Demo data - section reports submitted by foremen
  const [reports] = useState<SectionReport[]>([
    {
      id: 'SR001',
      sectionName: 'Panel 5-A',
      foremanName: 'Rajesh Kumar',
      shiftType: 'Morning Shift',
      submittedAt: '08:15 AM',
      status: 'pending',
      crewPresent: 7,
      crewAbsent: 1,
      incidents: 0,
      safetyScore: 95,
    },
    {
      id: 'SR002',
      sectionName: 'Panel 5-B',
      foremanName: 'Suresh Patil',
      shiftType: 'Morning Shift',
      submittedAt: '08:22 AM',
      status: 'approved',
      crewPresent: 8,
      crewAbsent: 0,
      incidents: 0,
      safetyScore: 98,
    },
    {
      id: 'SR003',
      sectionName: 'Panel 6-A',
      foremanName: 'Amit Sharma',
      shiftType: 'Morning Shift',
      submittedAt: '08:45 AM',
      status: 'flagged',
      crewPresent: 6,
      crewAbsent: 2,
      incidents: 1,
      safetyScore: 78,
    },
    {
      id: 'SR004',
      sectionName: 'Panel 7-A',
      foremanName: 'Vijay Singh',
      shiftType: 'Morning Shift',
      submittedAt: '09:10 AM',
      status: 'pending',
      crewPresent: 7,
      crewAbsent: 1,
      incidents: 0,
      safetyScore: 92,
    },
    {
      id: 'SR005',
      sectionName: 'Panel 8-C',
      foremanName: 'Deepak Yadav',
      shiftType: 'Morning Shift',
      submittedAt: '09:30 AM',
      status: 'pending',
      crewPresent: 5,
      crewAbsent: 0,
      incidents: 0,
      safetyScore: 90,
    },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return '#f59e0b';
      case 'approved':
        return '#10b981';
      case 'rejected':
        return '#ef4444';
      case 'flagged':
        return '#f97316';
      default:
        return '#64748b';
    }
  };

  const getStatusLabel = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch =
      report.sectionName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.foremanName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      filterStatus === 'all' || report.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const handleReportPress = (reportId: string) => {
    console.log('Opening report:', reportId);
    // TODO: Navigate to detailed report view
  };

  const handleApproveReport = (reportId: string) => {
    console.log('Approving report:', reportId);
    // TODO: Implement approve logic
  };

  const handleFlagReport = (reportId: string) => {
    console.log('Flagging report:', reportId);
    // TODO: Implement flag logic
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
        <Text style={styles.headerTitle}>Section Reports</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by section or foreman..."
          placeholderTextColor="#94a3b8"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
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
            All ({reports.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterTab,
            filterStatus === 'pending' && styles.filterTabActive,
          ]}
          onPress={() => setFilterStatus('pending')}
        >
          <Text
            style={[
              styles.filterTabText,
              filterStatus === 'pending' && styles.filterTabTextActive,
            ]}
          >
            Pending ({reports.filter(r => r.status === 'pending').length})
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
            Approved ({reports.filter(r => r.status === 'approved').length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterTab,
            filterStatus === 'flagged' && styles.filterTabActive,
          ]}
          onPress={() => setFilterStatus('flagged')}
        >
          <Text
            style={[
              styles.filterTabText,
              filterStatus === 'flagged' && styles.filterTabTextActive,
            ]}
          >
            Flagged ({reports.filter(r => r.status === 'flagged').length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Reports List */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {filteredReports.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>📭</Text>
            <Text style={styles.emptyStateText}>No reports found</Text>
          </View>
        ) : (
          filteredReports.map(report => (
            <TouchableOpacity
              key={report.id}
              style={styles.reportCard}
              onPress={() => handleReportPress(report.id)}
              activeOpacity={0.7}
            >
              {/* Status Badge */}
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(report.status) },
                ]}
              >
                <Text style={styles.statusBadgeText}>
                  {getStatusLabel(report.status)}
                </Text>
              </View>

              {/* Report Header */}
              <View style={styles.reportHeader}>
                <View style={styles.reportHeaderLeft}>
                  <Text style={styles.sectionName}>{report.sectionName}</Text>
                  <Text style={styles.reportId}>ID: {report.id}</Text>
                </View>
                <View style={styles.reportHeaderRight}>
                  <Text style={styles.submittedTime}>{report.submittedAt}</Text>
                </View>
              </View>

              {/* Foreman Info */}
              <View style={styles.foremanInfo}>
                <Text style={styles.foremanIcon}>👨‍🔧</Text>
                <Text style={styles.foremanName}>{report.foremanName}</Text>
                <Text style={styles.shiftType}>• {report.shiftType}</Text>
              </View>

              {/* Stats Grid */}
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Crew Present</Text>
                  <Text style={styles.statValue}>{report.crewPresent}</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Absent</Text>
                  <Text
                    style={[
                      styles.statValue,
                      report.crewAbsent > 0 && styles.statValueWarning,
                    ]}
                  >
                    {report.crewAbsent}
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Incidents</Text>
                  <Text
                    style={[
                      styles.statValue,
                      report.incidents > 0 && styles.statValueDanger,
                    ]}
                  >
                    {report.incidents}
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Safety Score</Text>
                  <Text
                    style={[
                      styles.statValue,
                      {
                        color:
                          report.safetyScore >= 90
                            ? '#10b981'
                            : report.safetyScore >= 75
                            ? '#f59e0b'
                            : '#ef4444',
                      },
                    ]}
                  >
                    {report.safetyScore}%
                  </Text>
                </View>
              </View>

              {/* Action Buttons - Show only for pending reports */}
              {report.status === 'pending' && (
                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.approveButton]}
                    onPress={() => handleApproveReport(report.id)}
                  >
                    <Text style={styles.actionButtonText}>✓ Approve</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.flagButton]}
                    onPress={() => handleFlagReport(report.id)}
                  >
                    <Text style={styles.actionButtonText}>⚠ Flag</Text>
                  </TouchableOpacity>
                </View>
              )}
            </TouchableOpacity>
          ))
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
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 0.5,
  },
  headerSpacer: {
    width: 60,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    elevation: 2,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#1e293b',
  },
  filterTabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 12,
    gap: 8,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#fff',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  filterTabActive: {
    backgroundColor: '#1e3a5f',
    borderColor: '#1e3a5f',
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
    fontSize: 16,
    color: '#64748b',
    fontWeight: '600',
  },
  reportCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#1e3a5f',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    position: 'relative',
  },
  statusBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingRight: 80,
  },
  reportHeaderLeft: {
    flex: 1,
  },
  sectionName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  reportId: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
  },
  reportHeaderRight: {
    alignItems: 'flex-end',
  },
  submittedTime: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '600',
  },
  foremanInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  foremanIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  foremanName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  shiftType: {
    fontSize: 13,
    color: '#64748b',
    marginLeft: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 11,
    color: '#64748b',
    marginBottom: 6,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  statValueWarning: {
    color: '#f59e0b',
  },
  statValueDanger: {
    color: '#ef4444',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  approveButton: {
    backgroundColor: '#10b981',
  },
  flagButton: {
    backgroundColor: '#f59e0b',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
});

export default SectionReportsScreen;
