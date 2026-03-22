import React, { useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';
import { useManagerDashboard } from '../../hooks/useDashboard';

type ShiftReportsOverviewNavigationProp =
  StackNavigationProp<RootStackParamList>;

interface ShiftReport {
  id: string;
  date: string;
  shiftType: string;
  overmanName: string;
  totalWorkers: number;
  presentWorkers: number;
  incidents: number;
  status: string;
  submittedAt: string;
  safetyScore: number;
  productionRate: number;
}

const ShiftReportsOverview: React.FC = () => {
  const navigation = useNavigation<ShiftReportsOverviewNavigationProp>();
  const { allShifts, incidentSummary, overallStats, isLoading } =
    useManagerDashboard();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('All');

  const reports = useMemo<ShiftReport[]>(
    () =>
      allShifts.map(s => {
        const logs = s.worker_logs ?? [];
        const totalWorkers = logs.length;
        const presentWorkers = logs.filter(
          l => l.attendance_status === 'present',
        ).length;
        const safetyPassed = logs.filter(l => l.safety_check_passed).length;
        const incidentsCount = (s.incidents ?? []).length;

        return {
          id: s.id,
          date: new Date(s.shift_date).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
          }),
          shiftType:
            s.shift_type.charAt(0).toUpperCase() + s.shift_type.slice(1),
          overmanName: s.overman?.name ?? s.overman_id ?? '—',
          totalWorkers,
          presentWorkers,
          incidents: incidentsCount,
          status:
            s.status === 'submitted'
              ? 'Submitted'
              : s.status === 'approved'
              ? 'Approved'
              : s.status === 'draft'
              ? 'Under Review'
              : s.status,
          submittedAt: s.submitted_at
            ? new Date(s.submitted_at).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })
            : '—',
          safetyScore:
            totalWorkers > 0
              ? Math.round((safetyPassed / totalWorkers) * 100)
              : 0,
          productionRate:
            totalWorkers > 0
              ? Math.round((presentWorkers / totalWorkers) * 100)
              : 0,
        };
      }),
    [allShifts, incidentSummary, overallStats],
  );
  const filters = ['All', 'Submitted', 'Under Review', 'Approved', 'Flagged'];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved':
        return '#10b981';
      case 'Under Review':
        return '#3b82f6';
      case 'Flagged':
        return '#ef4444';
      default:
        return '#f59e0b';
    }
  };

  const getShiftIcon = (shiftType: string) => {
    switch (shiftType) {
      case 'Morning':
        return '🌅';
      case 'Evening':
        return '🌆';
      case 'Night':
        return '🌙';
      default:
        return '🕒';
    }
  };

  const filteredReports = reports.filter(report => {
    const matchesFilter =
      selectedFilter === 'All' || report.status === selectedFilter;
    const matchesSearch =
      report.overmanName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleReportPress = (report: ShiftReport) => {
    navigation.navigate('ShiftLogDetail', { reportId: report.id });
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          activeOpacity={0.7}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Shift Reports</Text>
          <Text style={styles.headerSubtitle}>
            {filteredReports.length} reports
          </Text>
        </View>
        <View style={styles.backButton} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by overman or ID..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#94a3b8"
        />
      </View>

      {/* Filter Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        {filters.map(filter => {
          const count = reports.filter(r =>
            filter === 'All' ? true : r.status === filter,
          ).length;
          return (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterTab,
                selectedFilter === filter && styles.filterTabActive,
              ]}
              onPress={() => setSelectedFilter(filter)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.filterTabText,
                  selectedFilter === filter && styles.filterTabTextActive,
                ]}
              >
                {filter}
              </Text>
              <View
                style={[
                  styles.filterBadge,
                  selectedFilter === filter && styles.filterBadgeActive,
                ]}
              >
                <Text
                  style={[
                    styles.filterBadgeText,
                    selectedFilter === filter && styles.filterBadgeTextActive,
                  ]}
                >
                  {count}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Reports List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredReports.map(report => (
          <TouchableOpacity
            key={report.id}
            style={styles.reportCard}
            onPress={() => handleReportPress(report)}
            activeOpacity={0.7}
          >
            {/* Status Badge */}
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(report.status) },
              ]}
            >
              <Text style={styles.statusBadgeText}>{report.status}</Text>
            </View>

            {/* Header Row */}
            <View style={styles.reportHeader}>
              <View style={styles.reportHeaderLeft}>
                <Text style={styles.shiftIcon}>
                  {getShiftIcon(report.shiftType)}
                </Text>
                <View>
                  <Text style={styles.shiftType}>{report.shiftType}</Text>
                  <Text style={styles.reportDate}>{report.date}</Text>
                </View>
              </View>
              <Text style={styles.reportId} numberOfLines={1} ellipsizeMode="middle">
                {report.id}
              </Text>
            </View>

            {/* Overman Info */}
            <View style={styles.overmanRow}>
              <Text style={styles.overmanLabel}>Overman:</Text>
              <Text style={styles.overmanName} numberOfLines={1} ellipsizeMode="tail">
                {report.overmanName}
              </Text>
              <Text style={styles.submittedTime}>• {report.submittedAt}</Text>
            </View>

            {/* Stats Grid */}
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statIcon}>👥</Text>
                <Text style={styles.statValue}>
                  {report.presentWorkers}/{report.totalWorkers}
                </Text>
                <Text style={styles.statLabel}>Workers</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statIcon}>⚠️</Text>
                <Text
                  style={[
                    styles.statValue,
                    report.incidents > 0 && styles.statValueWarning,
                  ]}
                >
                  {report.incidents}
                </Text>
                <Text style={styles.statLabel}>Incidents</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statIcon}>🛡️</Text>
                <Text style={styles.statValue}>{report.safetyScore}%</Text>
                <Text style={styles.statLabel}>Safety</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statIcon}>⚡</Text>
                <Text style={styles.statValue}>{report.productionRate}%</Text>
                <Text style={styles.statLabel}>Production</Text>
              </View>
            </View>

            {/* Action Hint */}
            <View style={styles.actionHint}>
              <Text style={styles.actionHintText}>Tap to view full report</Text>
              <Text style={styles.actionHintIcon}>→</Text>
            </View>
          </TouchableOpacity>
        ))}

        {filteredReports.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>📋</Text>
            <Text style={styles.emptyStateText}>No reports found</Text>
            <Text style={styles.emptyStateSubtext}>
              Try adjusting your filters or search
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#1e3a5f',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
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
    shadowColor: '#1e3a5f',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  searchIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#1e293b',
  },
  filterContainer: {
    maxHeight: 62,
    marginBottom: 8,
  },
  filterContent: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  filterTab: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    height: 42,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  filterTabActive: {
    backgroundColor: '#1e3a5f',
    borderColor: '#1e3a5f',
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
    marginRight: 8,
  },
  filterTabTextActive: {
    color: '#fff',
  },
  filterBadge: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 24,
    alignItems: 'center',
  },
  filterBadgeActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  filterBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
  },
  filterBadgeTextActive: {
    color: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  reportCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#1e3a5f',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    borderLeftWidth: 4,
    borderLeftColor: '#1e3a5f',
    position: 'relative',
  },
  statusBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    elevation: 1,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.3,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingRight: 82,
  },
  reportHeaderLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  shiftIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  shiftType: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  reportDate: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  reportId: {
    maxWidth: 120,
    fontSize: 13,
    fontWeight: '600',
    color: '#94a3b8',
  },
  overmanRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  overmanLabel: {
    fontSize: 14,
    color: '#64748b',
    marginRight: 8,
  },
  overmanName: {
    flexShrink: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
  },
  submittedTime: {
    fontSize: 13,
    color: '#94a3b8',
    marginLeft: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 20,
    marginBottom: 6,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 2,
  },
  statValueWarning: {
    color: '#ef4444',
  },
  statLabel: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#e2e8f0',
    marginHorizontal: 4,
  },
  actionHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  actionHintText: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
    marginRight: 6,
  },
  actionHintIcon: {
    fontSize: 16,
    color: '#1e3a5f',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: 16,
    opacity: 0.5,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#94a3b8',
  },
});

export default ShiftReportsOverview;
