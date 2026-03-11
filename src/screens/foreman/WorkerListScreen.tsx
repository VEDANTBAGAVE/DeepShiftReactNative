import React, { useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  ScrollView,
  TextInput,
  Alert,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';
import { useForemanDashboard } from '../../hooks/useDashboard';
import { User } from '../../types/database';

type AttendanceStatus = 'present' | 'absent' | 'not-marked';
type WorkerListNavigationProp = StackNavigationProp<RootStackParamList>;

const STATUS_FILTERS: {
  value: AttendanceStatus | 'all';
  label: string;
  color: string;
}[] = [
  { value: 'all', label: 'All', color: '#64748b' },
  { value: 'present', label: 'Present', color: '#10b981' },
  { value: 'absent', label: 'Absent', color: '#ef4444' },
  { value: 'not-marked', label: 'Not Marked', color: '#94a3b8' },
];

const WorkerListScreen: React.FC = () => {
  const navigation = useNavigation<WorkerListNavigationProp>();
  const {
    workers,
    workerLogs,
    stats,
    markAttendance,
    bulkMarkAttendance,
    isLoading,
    refreshData,
  } = useForemanDashboard();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<AttendanceStatus | 'all'>(
    'all',
  );
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);
  const [selectedWorkers, setSelectedWorkers] = useState<Set<string>>(
    new Set(),
  );

  // Map workers + logs to display format
  const workersWithAttendance = useMemo(() => {
    return workers.map(w => {
      const log = workerLogs.find(l => l.worker_id === w.id);
      return {
        ...w,
        todayAttendance:
          (log?.attendance_status as AttendanceStatus) || 'not-marked',
      };
    });
  }, [workers, workerLogs]);

  const filteredWorkers = useMemo(() => {
    return workersWithAttendance.filter(w => {
      const matchesSearch =
        searchQuery === '' ||
        w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.employee_code.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === 'all' || w.todayAttendance === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [workersWithAttendance, searchQuery, statusFilter]);

  const todayStats = useMemo(
    () => ({
      total: stats.totalWorkers,
      present: stats.workersPresent,
      absent: stats.workersAbsent,
      notMarked:
        stats.totalWorkers - stats.workersPresent - stats.workersAbsent,
    }),
    [stats],
  );

  const toggleWorkerSelection = (workerId: string) => {
    const newSelection = new Set(selectedWorkers);
    if (newSelection.has(workerId)) {
      newSelection.delete(workerId);
    } else {
      newSelection.add(workerId);
    }
    setSelectedWorkers(newSelection);
  };

  const selectAll = () => {
    setSelectedWorkers(new Set(filteredWorkers.map(w => w.id)));
  };

  const deselectAll = () => {
    setSelectedWorkers(new Set());
  };

  const handleBulkAttendance = (status: AttendanceStatus) => {
    if (selectedWorkers.size === 0) {
      Alert.alert('No Selection', 'Please select workers first');
      return;
    }
    Alert.alert(
      'Bulk Update Attendance',
      `Mark ${selectedWorkers.size} worker(s) as ${status}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            await bulkMarkAttendance(
              Array.from(selectedWorkers).map(id => ({
                workerId: id,
                status: status as 'present' | 'absent',
              })),
            );
            Alert.alert(
              'Success',
              `${selectedWorkers.size} worker(s) marked as ${status}`,
            );
            setIsMultiSelectMode(false);
            setSelectedWorkers(new Set());
          },
        },
      ],
    );
  };

  const handleMarkPresent = async (workerId: string) => {
    await markAttendance(workerId, 'present');
    Alert.alert('Success', 'Worker marked as present');
  };

  const handleMarkAbsent = (workerId: string) => {
    Alert.alert('Mark Absent', 'Mark this worker as absent?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Confirm',
        onPress: async () => {
          await markAttendance(workerId, 'absent');
          Alert.alert('Success', 'Worker marked as absent');
        },
      },
    ]);
  };

  const handleAssignTask = (workerId: string) => {
    // Navigate to CreateTaskScreen with pre-selected worker
    navigation.navigate('CreateTaskScreen', { selectedWorkers: [workerId] });
  };

  const handleAddRemark = (workerId: string) => {
    // Navigate to CreateRemarkScreen with pre-selected worker
    navigation.navigate('CreateRemarkScreen', { workerId });
  };

  const handleViewProfile = (workerId: string) => {
    // Open worker profile sheet
    navigation.navigate('WorkerProfileSheet', { workerId });
  };

  const getStatusColor = (status?: AttendanceStatus) => {
    switch (status) {
      case 'present':
        return '#10b981';
      case 'absent':
        return '#ef4444';
      default:
        return '#94a3b8';
    }
  };

  const getStatusLabel = (status?: AttendanceStatus) => {
    return status === 'not-marked' || !status
      ? 'Not Marked'
      : status.charAt(0).toUpperCase() + status.slice(1);
  };

  const formatTime = (timestamp?: number) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Handle long press to enter multi-select mode
  const handleLongPress = (workerId: string) => {
    if (!isMultiSelectMode) {
      setIsMultiSelectMode(true);
      setSelectedWorkers(new Set([workerId]));
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
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Worker List</Text>
          <Text style={styles.headerSubtitle}>
            {filteredWorkers.length} workers
          </Text>
        </View>
        <TouchableOpacity
          style={styles.multiSelectButton}
          onPress={() => {
            setIsMultiSelectMode(!isMultiSelectMode);
            setSelectedWorkers(new Set());
          }}
        >
          <Text style={styles.multiSelectButtonText}>
            {isMultiSelectMode ? 'Cancel' : '☑️'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Today's Counter */}
      <View style={styles.todayCounterContainer}>
        <View style={styles.todayCounterHeader}>
          <Text style={styles.todayCounterTitle}>📊 Today's Attendance</Text>
          <Text style={styles.todayCounterDate}>
            {new Date().toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </Text>
        </View>
        <View style={styles.todayStatsGrid}>
          <View style={styles.todayStatCard}>
            <Text style={styles.todayStatValue}>{todayStats.present}</Text>
            <Text style={[styles.todayStatLabel, { color: '#10b981' }]}>
              Present
            </Text>
          </View>
          <View style={styles.todayStatCard}>
            <Text style={styles.todayStatValue}>{todayStats.absent}</Text>
            <Text style={[styles.todayStatLabel, { color: '#ef4444' }]}>
              Absent
            </Text>
          </View>
          <View style={styles.todayStatCard}>
            <Text style={styles.todayStatValue}>{todayStats.notMarked}</Text>
            <Text style={[styles.todayStatLabel, { color: '#94a3b8' }]}>
              Not Marked
            </Text>
          </View>
        </View>
        <View style={styles.todayProgressBar}>
          <View
            style={[
              styles.todayProgressFill,
              {
                width: `${(todayStats.present / todayStats.total) * 100}%`,
              },
            ]}
          />
        </View>
        <Text style={styles.todayProgressText}>
          {Math.round((todayStats.present / todayStats.total) * 100)}% Marked
          Present
        </Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name or employee ID..."
          placeholderTextColor="#94a3b8"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Filter Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterTabs}
      >
        {STATUS_FILTERS.map(filter => (
          <TouchableOpacity
            key={filter.value}
            style={[
              styles.filterTab,
              statusFilter === filter.value && styles.filterTabActive,
              { borderBottomColor: filter.color },
            ]}
            onPress={() => setStatusFilter(filter.value)}
          >
            <Text
              style={[
                styles.filterTabText,
                statusFilter === filter.value && styles.filterTabTextActive,
              ]}
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Section Filter removed - no section data in scope */}

      {/* Multi-Select Actions */}
      {isMultiSelectMode && (
        <View style={styles.bulkActionsBar}>
          <View style={styles.bulkActionsLeft}>
            <Text style={styles.bulkActionsCount}>
              {selectedWorkers.size} selected
            </Text>
            <TouchableOpacity onPress={selectAll} style={styles.bulkActionLink}>
              <Text style={styles.bulkActionLinkText}>Select All</Text>
            </TouchableOpacity>
            {selectedWorkers.size > 0 && (
              <TouchableOpacity
                onPress={deselectAll}
                style={styles.bulkActionLink}
              >
                <Text style={styles.bulkActionLinkText}>Deselect</Text>
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.bulkActionsRight}>
            <TouchableOpacity
              style={[styles.bulkButton, styles.bulkButtonPresent]}
              onPress={() => handleBulkAttendance('present')}
            >
              <Text style={styles.bulkButtonText}>✓ Present</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.bulkButton, styles.bulkButtonAbsent]}
              onPress={() => handleBulkAttendance('absent')}
            >
              <Text style={styles.bulkButtonText}>✕ Absent</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Worker List */}
      <FlatList
        data={filteredWorkers}
        keyExtractor={item => item.id}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refreshData} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>👤</Text>
            <Text style={styles.emptyStateTitle}>No Workers Found</Text>
            <Text style={styles.emptyStateText}>
              {searchQuery
                ? 'Try adjusting your search or filters'
                : 'No workers in this section'}
            </Text>
          </View>
        }
        renderItem={({ item: worker }) => (
          <TouchableOpacity
            key={worker.id}
            style={[
              styles.workerCard,
              selectedWorkers.has(worker.id) && styles.workerCardSelected,
            ]}
            onPress={() => {
              if (isMultiSelectMode) {
                toggleWorkerSelection(worker.id);
              } else {
                handleViewProfile(worker.id);
              }
            }}
            onLongPress={() => handleLongPress(worker.id)}
          >
            {isMultiSelectMode && (
              <View style={styles.checkboxContainer}>
                <View
                  style={[
                    styles.checkbox,
                    selectedWorkers.has(worker.id) && styles.checkboxChecked,
                  ]}
                >
                  {selectedWorkers.has(worker.id) && (
                    <Text style={styles.checkboxCheck}>✓</Text>
                  )}
                </View>
              </View>
            )}

            <View style={styles.workerInfo}>
              <View style={styles.workerHeader}>
                <Text style={styles.workerName}>{worker.name}</Text>
                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor: getStatusColor(worker.todayAttendance),
                    },
                  ]}
                >
                  <Text style={styles.statusBadgeText}>
                    {getStatusLabel(worker.todayAttendance)}
                  </Text>
                </View>
              </View>

              <Text style={styles.workerRole}>
                {worker.role} • {worker.employee_code}
              </Text>

              <View style={styles.workerStats}>
                <View style={styles.workerStat}>
                  <Text style={styles.workerStatIcon}>📋</Text>
                  <Text style={styles.workerStatText}>
                    {worker.section_id
                      ? worker.section_id.slice(0, 8)
                      : 'No section'}
                  </Text>
                </View>
              </View>
            </View>

            {!isMultiSelectMode && (
              <View style={styles.quickActions}>
                <TouchableOpacity
                  style={styles.quickActionButton}
                  onPress={e => {
                    e.stopPropagation();
                    handleMarkPresent(worker.id);
                  }}
                >
                  <Text style={styles.quickActionIcon}>✓</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.quickActionButton}
                  onPress={e => {
                    e.stopPropagation();
                    handleMarkAbsent(worker.id);
                  }}
                >
                  <Text style={styles.quickActionIcon}>✕</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.quickActionButton}
                  onPress={e => {
                    e.stopPropagation();
                    handleAssignTask(worker.id);
                  }}
                >
                  <Text style={styles.quickActionIcon}>📋</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.quickActionButton}
                  onPress={e => {
                    e.stopPropagation();
                    handleAddRemark(worker.id);
                  }}
                >
                  <Text style={styles.quickActionIcon}>💬</Text>
                </TouchableOpacity>
              </View>
            )}
          </TouchableOpacity>
        )}
      />
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
  headerSubtitle: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.75)',
    marginTop: 2,
  },
  multiSelectButton: {
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  multiSelectButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  searchInput: {
    backgroundColor: '#f8fafc',
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1e293b',
  },
  filterTabs: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingHorizontal: 12,
  },
  filterTab: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 4,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  filterTabActive: {
    borderBottomWidth: 3,
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  filterTabTextActive: {
    color: '#1e293b',
  },
  sectionFilter: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  sectionChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  sectionChipActive: {
    backgroundColor: '#f59e0b',
    borderColor: '#f59e0b',
  },
  sectionChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
  },
  sectionChipTextActive: {
    color: '#fff',
  },
  bulkActionsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fef3c7',
    borderBottomWidth: 2,
    borderBottomColor: '#f59e0b',
  },
  bulkActionsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  bulkActionsCount: {
    fontSize: 14,
    fontWeight: '700',
    color: '#92400e',
    marginRight: 12,
  },
  bulkActionLink: {
    marginRight: 12,
  },
  bulkActionLinkText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1e3a5f',
    textDecorationLine: 'underline',
  },
  bulkActionsRight: {
    flexDirection: 'row',
  },
  bulkButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginLeft: 8,
  },
  bulkButtonPresent: {
    backgroundColor: '#10b981',
  },
  bulkButtonAbsent: {
    backgroundColor: '#ef4444',
  },
  bulkButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    padding: 16,
    paddingBottom: 32,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
  },
  workerCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    borderWidth: 2,
    borderColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
  },
  workerCardSelected: {
    borderColor: '#f59e0b',
    backgroundColor: '#fffbeb',
  },
  checkboxContainer: {
    marginRight: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#f59e0b',
    borderColor: '#f59e0b',
  },
  checkboxCheck: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  workerInfo: {
    flex: 1,
  },
  workerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  workerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statusBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  workerRole: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 8,
  },
  workerStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  workerStat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    marginBottom: 4,
  },
  workerStatIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  workerStatText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '500',
  },
  workerReason: {
    fontSize: 12,
    color: '#64748b',
    fontStyle: 'italic',
    marginTop: 4,
  },
  quickActions: {
    flexDirection: 'row',
    marginLeft: 8,
  },
  quickActionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
  quickActionIcon: {
    fontSize: 16,
  },
  // Today's Counter Styles
  todayCounterContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  todayCounterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  todayCounterTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  todayCounterDate: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  todayStatsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  todayStatCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  todayStatValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  todayStatLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  todayProgressBar: {
    height: 6,
    backgroundColor: '#e2e8f0',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  todayProgressFill: {
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: 3,
  },
  todayProgressText: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    fontWeight: '500',
  },
  // Audit Stamp Styles
  auditStamp: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#bbf7d0',
    marginTop: 8,
  },
  auditStampIcon: {
    fontSize: 12,
    color: '#16a34a',
    marginRight: 6,
  },
  auditStampText: {
    fontSize: 11,
    color: '#15803d',
    fontWeight: '600',
    flex: 1,
  },
});

export default WorkerListScreen;
