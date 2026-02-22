import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  TextInput,
  Modal,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';

type ReportsArchiveNavigationProp = StackNavigationProp<RootStackParamList>;

const { width: screenWidth } = Dimensions.get('window');

interface ArchiveRecord {
  id: string;
  date: string;
  shiftType: 'Morning' | 'Evening' | 'Night';
  area: string;
  overmanName: string;
  overmanId: string;
  totalWorkers: number;
  presentWorkers: number;
  incidents: number;
  status: 'Approved' | 'Archived';
  approvedBy: string;
  approvedDate: string;
  safetyScore: number;
  productionRate: number;
  remarks: string;
}

const ReportsArchive: React.FC = () => {
  const navigation = useNavigation<ReportsArchiveNavigationProp>();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonth, setSelectedMonth] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<
    'All' | 'Approved' | 'Archived'
  >('All');
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [exportModalVisible, setExportModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<ArchiveRecord | null>(
    null,
  );

  // Demo archive records
  const archiveRecords: ArchiveRecord[] = [
    {
      id: 'SR-001',
      date: 'October 25, 2025',
      shiftType: 'Morning',
      area: 'Panel A-3',
      overmanName: 'Rajesh Patil',
      overmanId: 'OVM-105',
      totalWorkers: 26,
      presentWorkers: 24,
      incidents: 2,
      status: 'Approved',
      approvedBy: 'Manager Admin',
      approvedDate: 'October 25, 2025 14:30',
      safetyScore: 92,
      productionRate: 98,
      remarks:
        'Shift completed with minor delays due to equipment maintenance. Pump-03 requires immediate attention.',
    },
    {
      id: 'SR-002',
      date: 'October 25, 2025',
      shiftType: 'Evening',
      area: 'Panel B-1',
      overmanName: 'Amit Sharma',
      overmanId: 'OVM-112',
      totalWorkers: 28,
      presentWorkers: 28,
      incidents: 0,
      status: 'Approved',
      approvedBy: 'Manager Admin',
      approvedDate: 'October 25, 2025 22:45',
      safetyScore: 100,
      productionRate: 105,
      remarks:
        'Excellent shift with no incidents. All safety protocols followed. Target exceeded.',
    },
    {
      id: 'SR-004',
      date: 'October 26, 2025',
      shiftType: 'Morning',
      area: 'Panel A-2',
      overmanName: 'Suresh Singh',
      overmanId: 'FOR-045',
      totalWorkers: 30,
      presentWorkers: 30,
      incidents: 0,
      status: 'Approved',
      approvedBy: 'Manager Admin',
      approvedDate: 'October 26, 2025 14:15',
      safetyScore: 98,
      productionRate: 102,
      remarks:
        'Smooth operations throughout the shift. Equipment functioning optimally.',
    },
    {
      id: 'SR-006',
      date: 'October 27, 2025',
      shiftType: 'Night',
      area: 'Panel B-2',
      overmanName: 'Amit Sharma',
      overmanId: 'OVM-112',
      totalWorkers: 28,
      presentWorkers: 27,
      incidents: 0,
      status: 'Approved',
      approvedBy: 'Manager Admin',
      approvedDate: 'October 27, 2025 06:30',
      safetyScore: 100,
      productionRate: 110,
      remarks: 'Outstanding performance. All targets met ahead of schedule.',
    },
    {
      id: 'SR-OLD-045',
      date: 'September 15, 2025',
      shiftType: 'Morning',
      area: 'Panel A-1',
      overmanName: 'Vijay Kumar',
      overmanId: 'OVM-108',
      totalWorkers: 24,
      presentWorkers: 22,
      incidents: 1,
      status: 'Archived',
      approvedBy: 'Manager Admin',
      approvedDate: 'September 15, 2025 14:20',
      safetyScore: 94,
      productionRate: 96,
      remarks:
        'Minor equipment malfunction resolved. One worker minor injury treated on-site.',
    },
    {
      id: 'SR-OLD-032',
      date: 'September 10, 2025',
      shiftType: 'Evening',
      area: 'Section C',
      overmanName: 'Ramesh Das',
      overmanId: 'FOR-032',
      totalWorkers: 20,
      presentWorkers: 19,
      incidents: 0,
      status: 'Archived',
      approvedBy: 'Manager Admin',
      approvedDate: 'September 10, 2025 22:10',
      safetyScore: 96,
      productionRate: 100,
      remarks:
        'Standard operations. All procedures followed as per guidelines.',
    },
  ];

  const months = ['All', 'October 2025', 'September 2025', 'August 2025'];

  const filteredRecords = archiveRecords.filter(record => {
    const matchesSearch =
      record.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.overmanName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.area.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesMonth =
      selectedMonth === 'All' || record.date.includes(selectedMonth);

    const matchesStatus =
      selectedStatus === 'All' || record.status === selectedStatus;

    return matchesSearch && matchesMonth && matchesStatus;
  });

  const getShiftIcon = (shiftType: ArchiveRecord['shiftType']) => {
    switch (shiftType) {
      case 'Morning':
        return '🌅';
      case 'Evening':
        return '🌆';
      case 'Night':
        return '🌙';
    }
  };

  const getStatusColor = (status: ArchiveRecord['status']) => {
    return status === 'Approved' ? '#10b981' : '#64748b';
  };

  const handleViewRecord = (record: ArchiveRecord) => {
    setSelectedRecord(record);
    setViewModalVisible(true);
  };

  const handleExportRecord = (record: ArchiveRecord) => {
    setSelectedRecord(record);
    setExportModalVisible(true);
  };

  const handleDownloadPDF = () => {
    console.log('Downloading PDF for:', selectedRecord?.id);
    // TODO: Implement PDF generation/download
    setExportModalVisible(false);
  };

  const handleExportExcel = () => {
    console.log('Exporting to Excel:', selectedRecord?.id);
    // TODO: Implement Excel export
    setExportModalVisible(false);
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const counts = {
    total: archiveRecords.length,
    approved: archiveRecords.filter(r => r.status === 'Approved').length,
    archived: archiveRecords.filter(r => r.status === 'Archived').length,
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
          <Text style={styles.headerTitle}>Reports & Archive</Text>
          <Text style={styles.headerSubtitle}>Digital Document Repository</Text>
        </View>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Summary Cards */}
        <View style={styles.summaryGrid}>
          <View style={[styles.summaryCard, { borderTopColor: '#1e3a5f' }]}>
            <Text style={styles.summaryIcon}>📁</Text>
            <Text style={styles.summaryValue}>{counts.total}</Text>
            <Text style={styles.summaryLabel}>Total Records</Text>
          </View>
          <View style={[styles.summaryCard, { borderTopColor: '#10b981' }]}>
            <Text style={styles.summaryIcon}>✓</Text>
            <Text style={[styles.summaryValue, { color: '#10b981' }]}>
              {counts.approved}
            </Text>
            <Text style={styles.summaryLabel}>Approved</Text>
          </View>
          <View style={[styles.summaryCard, { borderTopColor: '#64748b' }]}>
            <Text style={styles.summaryIcon}>📦</Text>
            <Text style={[styles.summaryValue, { color: '#64748b' }]}>
              {counts.archived}
            </Text>
            <Text style={styles.summaryLabel}>Archived</Text>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by ID, Overman, or Area..."
            placeholderTextColor="#94a3b8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Filters */}
        <View style={styles.filtersRow}>
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Month:</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterScroll}
            >
              {months.map(month => (
                <TouchableOpacity
                  key={month}
                  style={[
                    styles.filterChip,
                    selectedMonth === month && styles.filterChipActive,
                  ]}
                  onPress={() => setSelectedMonth(month)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      selectedMonth === month && styles.filterChipTextActive,
                    ]}
                  >
                    {month}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Status:</Text>
            <View style={styles.statusFilters}>
              {(['All', 'Approved', 'Archived'] as const).map(status => (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.statusFilterButton,
                    selectedStatus === status &&
                      styles.statusFilterButtonActive,
                  ]}
                  onPress={() => setSelectedStatus(status)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.statusFilterText,
                      selectedStatus === status &&
                        styles.statusFilterTextActive,
                    ]}
                  >
                    {status}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Records List */}
        <View style={styles.recordsSection}>
          <View style={styles.recordsHeader}>
            <Text style={styles.recordsTitle}>
              📄 Document Records ({filteredRecords.length})
            </Text>
          </View>

          {filteredRecords.length > 0 ? (
            filteredRecords.map(record => (
              <View key={record.id} style={styles.recordCard}>
                <View style={styles.recordHeader}>
                  <View style={styles.recordHeaderLeft}>
                    <Text style={styles.shiftIcon}>
                      {getShiftIcon(record.shiftType)}
                    </Text>
                    <View>
                      <Text style={styles.recordId}>{record.id}</Text>
                      <Text style={styles.recordDate}>{record.date}</Text>
                    </View>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(record.status) },
                    ]}
                  >
                    <Text style={styles.statusBadgeText}>{record.status}</Text>
                  </View>
                </View>

                <View style={styles.recordInfo}>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Shift Type:</Text>
                    <Text style={styles.infoValue}>{record.shiftType}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Area:</Text>
                    <Text style={styles.infoValue}>{record.area}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Overman:</Text>
                    <Text style={styles.infoValue}>{record.overmanName}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Workers:</Text>
                    <Text style={styles.infoValue}>
                      {record.presentWorkers}/{record.totalWorkers}
                    </Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Incidents:</Text>
                    <Text
                      style={[
                        styles.infoValue,
                        record.incidents > 0 && styles.incidentsWarning,
                      ]}
                    >
                      {record.incidents}
                    </Text>
                  </View>
                </View>

                <View style={styles.metricsRow}>
                  <View style={styles.metricBadge}>
                    <Text style={styles.metricLabel}>Safety</Text>
                    <Text style={[styles.metricValue, { color: '#10b981' }]}>
                      {record.safetyScore}%
                    </Text>
                  </View>
                  <View style={styles.metricBadge}>
                    <Text style={styles.metricLabel}>Production</Text>
                    <Text style={[styles.metricValue, { color: '#3b82f6' }]}>
                      {record.productionRate}%
                    </Text>
                  </View>
                </View>

                <View style={styles.approvalInfo}>
                  <Text style={styles.approvalText}>
                    ✓ Approved by {record.approvedBy}
                  </Text>
                  <Text style={styles.approvalDate}>{record.approvedDate}</Text>
                </View>

                <View style={styles.recordActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleViewRecord(record)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.actionButtonIcon}>👁️</Text>
                    <Text style={styles.actionButtonText}>View</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleExportRecord(record)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.actionButtonIcon}>⬇️</Text>
                    <Text style={styles.actionButtonText}>Export</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => console.log('Share:', record.id)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.actionButtonIcon}>📤</Text>
                    <Text style={styles.actionButtonText}>Share</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📭</Text>
              <Text style={styles.emptyText}>No records found</Text>
              <Text style={styles.emptySubtext}>
                Try adjusting your search or filters
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* View Record Modal */}
      <Modal
        visible={viewModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setViewModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.viewModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>📄 Shift Log Report</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setViewModalVisible(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalScroll}
              showsVerticalScrollIndicator={false}
            >
              {selectedRecord && (
                <View style={styles.reportContent}>
                  <View style={styles.reportSection}>
                    <Text style={styles.reportSectionTitle}>
                      SHIFT INFORMATION
                    </Text>
                    <Text style={styles.reportText}>
                      Report ID: {selectedRecord.id}
                    </Text>
                    <Text style={styles.reportText}>
                      Date: {selectedRecord.date}
                    </Text>
                    <Text style={styles.reportText}>
                      Shift Type: {selectedRecord.shiftType}
                    </Text>
                    <Text style={styles.reportText}>
                      Area: {selectedRecord.area}
                    </Text>
                  </View>

                  <View style={styles.reportDivider} />

                  <View style={styles.reportSection}>
                    <Text style={styles.reportSectionTitle}>
                      SUPERVISORY DETAILS
                    </Text>
                    <Text style={styles.reportText}>
                      Overman: {selectedRecord.overmanName}
                    </Text>
                    <Text style={styles.reportText}>
                      ID: {selectedRecord.overmanId}
                    </Text>
                  </View>

                  <View style={styles.reportDivider} />

                  <View style={styles.reportSection}>
                    <Text style={styles.reportSectionTitle}>
                      CREW ATTENDANCE
                    </Text>
                    <Text style={styles.reportText}>
                      Total Workers: {selectedRecord.totalWorkers}
                    </Text>
                    <Text style={styles.reportText}>
                      Present: {selectedRecord.presentWorkers}
                    </Text>
                    <Text style={styles.reportText}>
                      Absent:{' '}
                      {selectedRecord.totalWorkers -
                        selectedRecord.presentWorkers}
                    </Text>
                  </View>

                  <View style={styles.reportDivider} />

                  <View style={styles.reportSection}>
                    <Text style={styles.reportSectionTitle}>
                      PERFORMANCE METRICS
                    </Text>
                    <Text style={styles.reportText}>
                      Safety Score: {selectedRecord.safetyScore}%
                    </Text>
                    <Text style={styles.reportText}>
                      Production Rate: {selectedRecord.productionRate}%
                    </Text>
                    <Text style={styles.reportText}>
                      Incidents Reported: {selectedRecord.incidents}
                    </Text>
                  </View>

                  <View style={styles.reportDivider} />

                  <View style={styles.reportSection}>
                    <Text style={styles.reportSectionTitle}>REMARKS</Text>
                    <Text style={styles.reportText}>
                      {selectedRecord.remarks}
                    </Text>
                  </View>

                  <View style={styles.reportDivider} />

                  <View style={styles.reportSection}>
                    <Text style={styles.reportSectionTitle}>
                      APPROVAL STATUS
                    </Text>
                    <Text style={styles.reportText}>
                      Status: {selectedRecord.status}
                    </Text>
                    <Text style={styles.reportText}>
                      Approved By: {selectedRecord.approvedBy}
                    </Text>
                    <Text style={styles.reportText}>
                      Approved On: {selectedRecord.approvedDate}
                    </Text>
                  </View>

                  <View style={styles.reportFooter}>
                    <Text style={styles.reportFooterText}>
                      This is a digitally approved record.
                    </Text>
                    <Text style={styles.reportFooterText}>
                      Generated by DeepShift Management System
                    </Text>
                  </View>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Export Modal */}
      <Modal
        visible={exportModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setExportModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.exportModal}>
            <Text style={styles.exportTitle}>📥 Export Report</Text>
            <Text style={styles.exportSubtitle}>
              Choose export format for {selectedRecord?.id}
            </Text>

            <TouchableOpacity
              style={styles.exportOption}
              onPress={handleDownloadPDF}
              activeOpacity={0.7}
            >
              <Text style={styles.exportIcon}>📄</Text>
              <View style={styles.exportOptionContent}>
                <Text style={styles.exportOptionTitle}>Export as PDF</Text>
                <Text style={styles.exportOptionDesc}>
                  Formatted document with full details
                </Text>
              </View>
              <Text style={styles.exportArrow}>→</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.exportOption}
              onPress={handleExportExcel}
              activeOpacity={0.7}
            >
              <Text style={styles.exportIcon}>📊</Text>
              <View style={styles.exportOptionContent}>
                <Text style={styles.exportOptionTitle}>Export as Excel</Text>
                <Text style={styles.exportOptionDesc}>
                  Spreadsheet format for data analysis
                </Text>
              </View>
              <Text style={styles.exportArrow}>→</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelExportButton}
              onPress={() => setExportModalVisible(false)}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelExportText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  summaryGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#1e3a5f',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    borderTopWidth: 4,
  },
  summaryIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    elevation: 1,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#1e293b',
  },
  filtersRow: {
    gap: 16,
    marginBottom: 20,
  },
  filterGroup: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    elevation: 1,
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 10,
  },
  filterScroll: {
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  filterChipActive: {
    backgroundColor: '#1e3a5f',
    borderColor: '#1e3a5f',
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
  },
  filterChipTextActive: {
    color: '#fff',
  },
  statusFilters: {
    flexDirection: 'row',
    gap: 8,
  },
  statusFilterButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
  },
  statusFilterButtonActive: {
    backgroundColor: '#1e3a5f',
  },
  statusFilterText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
  },
  statusFilterTextActive: {
    color: '#fff',
  },
  recordsSection: {
    marginBottom: 20,
  },
  recordsHeader: {
    marginBottom: 16,
  },
  recordsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  recordCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#1e3a5f',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    borderLeftWidth: 4,
    borderLeftColor: '#1e3a5f',
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  recordHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  shiftIcon: {
    fontSize: 32,
  },
  recordId: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
  },
  recordDate: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
  recordInfo: {
    gap: 8,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  incidentsWarning: {
    color: '#ef4444',
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  metricBadge: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  approvalInfo: {
    backgroundColor: '#f0fdf4',
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
  },
  approvalText: {
    fontSize: 13,
    color: '#15803d',
    fontWeight: '600',
    marginBottom: 4,
  },
  approvalDate: {
    fontSize: 12,
    color: '#16a34a',
  },
  recordActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f1f5f9',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 6,
  },
  actionButtonIcon: {
    fontSize: 16,
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1e293b',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#94a3b8',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  viewModal: {
    backgroundColor: '#fff',
    borderRadius: 20,
    width: '100%',
    maxWidth: 500,
    maxHeight: '80%',
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: '#64748b',
    fontWeight: 'bold',
  },
  modalScroll: {
    flex: 1,
  },
  reportContent: {
    padding: 20,
  },
  reportSection: {
    marginBottom: 20,
  },
  reportSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1e3a5f',
    letterSpacing: 1,
    marginBottom: 12,
  },
  reportText: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 22,
    marginBottom: 6,
  },
  reportDivider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginVertical: 16,
  },
  reportFooter: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 2,
    borderTopColor: '#e2e8f0',
    alignItems: 'center',
  },
  reportFooterText: {
    fontSize: 12,
    color: '#94a3b8',
    fontStyle: 'italic',
    marginBottom: 4,
  },
  exportModal: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    elevation: 5,
  },
  exportTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  exportSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 24,
  },
  exportOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  exportIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  exportOptionContent: {
    flex: 1,
  },
  exportOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  exportOptionDesc: {
    fontSize: 13,
    color: '#64748b',
  },
  exportArrow: {
    fontSize: 20,
    color: '#64748b',
  },
  cancelExportButton: {
    marginTop: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelExportText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#64748b',
  },
});

export default ReportsArchive;
