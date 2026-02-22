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

type SectionSummaryScreenNavigationProp =
  StackNavigationProp<RootStackParamList>;

interface Section {
  id: string;
  panelName: string;
  foremanName: string;
  foremanId: string;
  status: 'pending' | 'approved' | 'reopened';
  shiftType: string;
  crewCount: number;
  submittedAt: string;
  lastUpdated: string;
  safetyScore: number;
  hasIncidents: boolean;
  productionStatus: 'on-track' | 'delayed' | 'ahead';
}

const SectionSummaryScreen: React.FC = () => {
  const navigation = useNavigation<SectionSummaryScreenNavigationProp>();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<
    'all' | 'pending' | 'approved' | 'reopened'
  >('all');

  // Demo data - all mine sections under Overman supervision
  const [sections] = useState<Section[]>([
    {
      id: 'SEC001',
      panelName: 'Panel 1',
      foremanName: 'Suresh Patil',
      foremanId: 'FM001',
      status: 'pending',
      shiftType: 'Morning Shift',
      crewCount: 8,
      submittedAt: '08:15 AM',
      lastUpdated: '08:15 AM',
      safetyScore: 95,
      hasIncidents: false,
      productionStatus: 'on-track',
    },
    {
      id: 'SEC002',
      panelName: 'Panel 2',
      foremanName: 'Rajesh Kumar',
      foremanId: 'FM002',
      status: 'approved',
      shiftType: 'Morning Shift',
      crewCount: 7,
      submittedAt: '08:22 AM',
      lastUpdated: '09:30 AM',
      safetyScore: 98,
      hasIncidents: false,
      productionStatus: 'ahead',
    },
    {
      id: 'SEC003',
      panelName: 'Panel 3',
      foremanName: 'Mohammed Khan',
      foremanId: 'FM003',
      status: 'reopened',
      shiftType: 'Morning Shift',
      crewCount: 6,
      submittedAt: '08:45 AM',
      lastUpdated: '10:15 AM',
      safetyScore: 78,
      hasIncidents: true,
      productionStatus: 'delayed',
    },
    {
      id: 'SEC004',
      panelName: 'Panel 4',
      foremanName: 'Vijay Singh',
      foremanId: 'FM004',
      status: 'approved',
      shiftType: 'Morning Shift',
      crewCount: 7,
      submittedAt: '09:10 AM',
      lastUpdated: '10:45 AM',
      safetyScore: 92,
      hasIncidents: false,
      productionStatus: 'on-track',
    },
    {
      id: 'SEC005',
      panelName: 'Panel 5-A',
      foremanName: 'Deepak Yadav',
      foremanId: 'FM005',
      status: 'pending',
      shiftType: 'Morning Shift',
      crewCount: 5,
      submittedAt: '09:30 AM',
      lastUpdated: '09:30 AM',
      safetyScore: 90,
      hasIncidents: false,
      productionStatus: 'on-track',
    },
    {
      id: 'SEC006',
      panelName: 'Panel 5-B',
      foremanName: 'Amit Sharma',
      foremanId: 'FM006',
      status: 'approved',
      shiftType: 'Morning Shift',
      crewCount: 8,
      submittedAt: '08:50 AM',
      lastUpdated: '10:20 AM',
      safetyScore: 96,
      hasIncidents: false,
      productionStatus: 'on-track',
    },
    {
      id: 'SEC007',
      panelName: 'Panel 6-A',
      foremanName: 'Anil Deshmukh',
      foremanId: 'FM007',
      status: 'pending',
      shiftType: 'Morning Shift',
      crewCount: 6,
      submittedAt: '09:45 AM',
      lastUpdated: '09:45 AM',
      safetyScore: 88,
      hasIncidents: false,
      productionStatus: 'on-track',
    },
    {
      id: 'SEC008',
      panelName: 'Panel 7-A',
      foremanName: 'Ravi Verma',
      foremanId: 'FM008',
      status: 'approved',
      shiftType: 'Morning Shift',
      crewCount: 7,
      submittedAt: '08:30 AM',
      lastUpdated: '09:50 AM',
      safetyScore: 94,
      hasIncidents: false,
      productionStatus: 'on-track',
    },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return '#f59e0b';
      case 'approved':
        return '#10b981';
      case 'reopened':
        return '#ef4444';
      default:
        return '#64748b';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return '⏱';
      case 'approved':
        return '✓';
      case 'reopened':
        return '🔁';
      default:
        return '•';
    }
  };

  const getStatusLabel = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const getProductionStatusColor = (status: string) => {
    switch (status) {
      case 'on-track':
        return '#10b981';
      case 'delayed':
        return '#ef4444';
      case 'ahead':
        return '#3b82f6';
      default:
        return '#64748b';
    }
  };

  const filteredSections = sections.filter(section => {
    const matchesSearch =
      section.panelName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      section.foremanName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      filterStatus === 'all' || section.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const statusCounts = {
    all: sections.length,
    pending: sections.filter(s => s.status === 'pending').length,
    approved: sections.filter(s => s.status === 'approved').length,
    reopened: sections.filter(s => s.status === 'reopened').length,
  };

  const handleViewDetails = (sectionId: string, sectionName: string) => {
    console.log('Viewing details for section:', sectionId, sectionName);
    // TODO: Navigate to Review Section Report screen
  };

  const handleForemanPress = (foremanId: string, foremanName: string) => {
    console.log('Viewing foreman profile:', foremanId, foremanName);
    // TODO: Navigate to foreman profile or contact
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
        <Text style={styles.headerTitle}>Section Summary</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Summary Stats Bar */}
      <View style={styles.summaryStatsBar}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{sections.length}</Text>
          <Text style={styles.statLabel}>Total Sections</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: '#f59e0b' }]}>
            {statusCounts.pending}
          </Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: '#10b981' }]}>
            {statusCounts.approved}
          </Text>
          <Text style={styles.statLabel}>Approved</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: '#ef4444' }]}>
            {statusCounts.reopened}
          </Text>
          <Text style={styles.statLabel}>Reopened</Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by panel or foreman name..."
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
            All ({statusCounts.all})
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
            Pending ({statusCounts.pending})
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
        <TouchableOpacity
          style={[
            styles.filterTab,
            filterStatus === 'reopened' && styles.filterTabActive,
          ]}
          onPress={() => setFilterStatus('reopened')}
        >
          <Text
            style={[
              styles.filterTabText,
              filterStatus === 'reopened' && styles.filterTabTextActive,
            ]}
          >
            Reopened ({statusCounts.reopened})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Sections List */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {filteredSections.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>📭</Text>
            <Text style={styles.emptyStateText}>No sections found</Text>
            <Text style={styles.emptyStateSubtext}>
              Try adjusting your search or filter
            </Text>
          </View>
        ) : (
          filteredSections.map(section => (
            <View key={section.id} style={styles.sectionCard}>
              {/* Status Indicator Bar */}
              <View
                style={[
                  styles.statusBar,
                  { backgroundColor: getStatusColor(section.status) },
                ]}
              />

              {/* Card Header */}
              <View style={styles.cardHeader}>
                <View style={styles.cardHeaderLeft}>
                  <Text style={styles.panelName}>{section.panelName}</Text>
                  {section.hasIncidents && (
                    <View style={styles.incidentBadge}>
                      <Text style={styles.incidentBadgeText}>⚠️ Incident</Text>
                    </View>
                  )}
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(section.status) },
                  ]}
                >
                  <Text style={styles.statusIcon}>
                    {getStatusIcon(section.status)}
                  </Text>
                  <Text style={styles.statusText}>
                    {getStatusLabel(section.status)}
                  </Text>
                </View>
              </View>

              {/* Foreman Info */}
              <TouchableOpacity
                style={styles.foremanRow}
                onPress={() =>
                  handleForemanPress(section.foremanId, section.foremanName)
                }
                activeOpacity={0.7}
              >
                <View style={styles.foremanIconContainer}>
                  <Text style={styles.foremanIcon}>👨‍🔧</Text>
                </View>
                <View style={styles.foremanDetails}>
                  <Text style={styles.foremanLabel}>Foreman</Text>
                  <Text style={styles.foremanName}>{section.foremanName}</Text>
                </View>
                <Text style={styles.foremanArrow}>→</Text>
              </TouchableOpacity>

              {/* Info Grid */}
              <View style={styles.infoGrid}>
                <View style={styles.infoItem}>
                  <Text style={styles.infoIcon}>🕒</Text>
                  <View>
                    <Text style={styles.infoLabel}>Shift</Text>
                    <Text style={styles.infoValue}>{section.shiftType}</Text>
                  </View>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoIcon}>👥</Text>
                  <View>
                    <Text style={styles.infoLabel}>Crew</Text>
                    <Text style={styles.infoValue}>
                      {section.crewCount} workers
                    </Text>
                  </View>
                </View>
              </View>

              {/* Metrics Row */}
              <View style={styles.metricsRow}>
                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>Safety Score</Text>
                  <Text
                    style={[
                      styles.metricValue,
                      {
                        color:
                          section.safetyScore >= 90
                            ? '#10b981'
                            : section.safetyScore >= 75
                            ? '#f59e0b'
                            : '#ef4444',
                      },
                    ]}
                  >
                    {section.safetyScore}%
                  </Text>
                </View>
                <View style={styles.metricDivider} />
                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>Production</Text>
                  <View style={styles.productionStatus}>
                    <View
                      style={[
                        styles.productionDot,
                        {
                          backgroundColor: getProductionStatusColor(
                            section.productionStatus,
                          ),
                        },
                      ]}
                    />
                    <Text
                      style={[
                        styles.metricValue,
                        {
                          color: getProductionStatusColor(
                            section.productionStatus,
                          ),
                          fontSize: 13,
                        },
                      ]}
                    >
                      {section.productionStatus === 'on-track'
                        ? 'On Track'
                        : section.productionStatus === 'delayed'
                        ? 'Delayed'
                        : 'Ahead'}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Timestamps */}
              <View style={styles.timestampsRow}>
                <Text style={styles.timestamp}>
                  📥 Submitted: {section.submittedAt}
                </Text>
                {section.status !== 'pending' && (
                  <Text style={styles.timestamp}>
                    🔄 Updated: {section.lastUpdated}
                  </Text>
                )}
              </View>

              {/* View Details Button */}
              <TouchableOpacity
                style={styles.viewDetailsButton}
                onPress={() => handleViewDetails(section.id, section.panelName)}
                activeOpacity={0.7}
              >
                <Text style={styles.viewDetailsText}>View Details</Text>
                <Text style={styles.viewDetailsArrow}>→</Text>
              </TouchableOpacity>
            </View>
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
  summaryStatsBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 2,
    borderBottomColor: '#e2e8f0',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
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
    paddingHorizontal: 8,
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
  sectionCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
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
    marginBottom: 16,
  },
  cardHeaderLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  panelName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  incidentBadge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#f59e0b',
  },
  incidentBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#92400e',
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
  foremanRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
  },
  foremanIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  foremanIcon: {
    fontSize: 24,
  },
  foremanDetails: {
    flex: 1,
  },
  foremanLabel: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
    marginBottom: 2,
  },
  foremanName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  foremanArrow: {
    fontSize: 20,
    color: '#3b82f6',
  },
  infoGrid: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 12,
  },
  infoItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 8,
    gap: 10,
  },
  infoIcon: {
    fontSize: 24,
  },
  infoLabel: {
    fontSize: 11,
    color: '#64748b',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1e293b',
  },
  metricsRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    marginBottom: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#f1f5f9',
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 11,
    color: '#64748b',
    marginBottom: 6,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  metricDivider: {
    width: 1,
    height: '100%',
    backgroundColor: '#e2e8f0',
    marginHorizontal: 12,
  },
  productionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  productionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  timestampsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    flexWrap: 'wrap',
    gap: 8,
  },
  timestamp: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
  },
  viewDetailsButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1e3a5f',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginTop: 8,
  },
  viewDetailsText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
  viewDetailsArrow: {
    fontSize: 18,
    color: '#fff',
  },
});

export default SectionSummaryScreen;
