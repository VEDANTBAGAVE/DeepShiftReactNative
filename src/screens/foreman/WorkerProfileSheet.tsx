import React, { useMemo } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';
import { useForeman } from '../../context/ForemanContext';
import { AttendanceStatus } from '../../types/worker';

type WorkerProfileSheetRouteProp = RouteProp<
  RootStackParamList,
  'WorkerProfileSheet'
>;
type WorkerProfileSheetNavigationProp = StackNavigationProp<RootStackParamList>;

const WorkerProfileSheet: React.FC = () => {
  const navigation = useNavigation<WorkerProfileSheetNavigationProp>();
  const route = useRoute<WorkerProfileSheetRouteProp>();
  const { workerId } = route.params;
  const { getWorkerById } = useForeman();

  const worker = useMemo(
    () => getWorkerById(workerId),
    [workerId, getWorkerById],
  );

  if (!worker) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.closeButton}
          >
            <Text style={styles.closeButtonText}>✕ Close</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorText}>Worker not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const getStatusColor = (status?: AttendanceStatus) => {
    switch (status) {
      case 'present':
        return '#10b981';
      case 'absent':
        return '#ef4444';
      case 'tardy':
        return '#f59e0b';
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
    if (!timestamp) return 'Not marked yet';
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const handleAddRemark = () => {
    navigation.navigate('CreateRemarkScreen', { workerId });
  };

  const handleAssignTask = () => {
    navigation.navigate('CreateTaskScreen', { selectedWorkers: [workerId] });
  };

  const handleViewIncidents = () => {
    // Navigate to incidents screen filtered for this worker
    navigation.navigate('SectionIncidentsScreen');
  };

  // Generate recent attendance (mock data - last 7 days)
  const recentAttendance = useMemo(() => {
    const today = new Date();
    const attendance = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const timestamp = date.getTime();

      // Today's attendance comes from worker data
      if (i === 0) {
        attendance.push({
          date: timestamp,
          status: worker.todayAttendance || 'not-marked',
        });
      } else {
        // Mock previous days (mostly present with occasional variations)
        const rand = Math.random();
        let status: AttendanceStatus;
        if (rand > 0.9) status = 'absent';
        else if (rand > 0.85) status = 'tardy';
        else status = 'present';
        attendance.push({ date: timestamp, status });
      }
    }
    return attendance;
  }, [worker.todayAttendance]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.closeButton}
        >
          <Text style={styles.closeButtonText}>✕ Close</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Worker Profile</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
      >
        {/* Worker Overview */}
        <View style={styles.overviewCard}>
          <View style={styles.overviewHeader}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>{worker.name.charAt(0)}</Text>
            </View>
            <View style={styles.overviewInfo}>
              <Text style={styles.workerName}>{worker.name}</Text>
              <Text style={styles.workerRole}>{worker.role}</Text>
              <Text style={styles.workerDetail}>ID: {worker.employeeId}</Text>
              <Text style={styles.workerDetail}>Section: {worker.section}</Text>
              {worker.contactNumber && (
                <Text style={styles.workerDetail}>
                  📞 {worker.contactNumber}
                </Text>
              )}
            </View>
          </View>

          <View
            style={[
              styles.statusBanner,
              { backgroundColor: getStatusColor(worker.todayAttendance) },
            ]}
          >
            <View style={styles.statusBannerRow}>
              <View style={styles.statusBannerLeft}>
                <Text style={styles.statusBannerText}>
                  Today: {getStatusLabel(worker.todayAttendance)}
                </Text>
                {worker.attendanceMarkedAt && (
                  <View style={styles.attendanceTimestamp}>
                    <Text style={styles.attendanceTimestampIcon}>🕐</Text>
                    <Text style={styles.attendanceTimestampText}>
                      Marked at {formatTime(worker.attendanceMarkedAt)}
                    </Text>
                  </View>
                )}
              </View>
              {worker.attendanceMarkedAt && (
                <View style={styles.verifiedBadge}>
                  <Text style={styles.verifiedBadgeText}>✓ Verified</Text>
                </View>
              )}
            </View>
          </View>

          {worker.attendanceReason && (
            <View style={styles.reasonBox}>
              <Text style={styles.reasonLabel}>Reason:</Text>
              <Text style={styles.reasonText}>{worker.attendanceReason}</Text>
            </View>
          )}
        </View>

        {/* Recent Attendance */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            📅 Recent Attendance (Last 7 Days)
          </Text>
          <View style={styles.attendanceGrid}>
            {recentAttendance.map((day, index) => (
              <View key={index} style={styles.attendanceDay}>
                <Text style={styles.attendanceDayLabel}>
                  {formatDate(day.date)}
                </Text>
                <View
                  style={[
                    styles.attendanceDayBadge,
                    { backgroundColor: getStatusColor(day.status) },
                  ]}
                >
                  <Text style={styles.attendanceDayBadgeText}>
                    {day.status === 'present'
                      ? '✓'
                      : day.status === 'absent'
                      ? '✕'
                      : '◷'}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Open Tasks */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>📋 Open Tasks</Text>
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>{worker.openTasksCount}</Text>
            </View>
          </View>
          {worker.openTasksCount > 0 ? (
            <View style={styles.placeholderBox}>
              <Text style={styles.placeholderText}>
                {worker.openTasksCount} task(s) assigned
              </Text>
              <Text style={styles.placeholderHint}>
                Task details will be shown here when task management is fully
                integrated
              </Text>
            </View>
          ) : (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>No open tasks</Text>
            </View>
          )}
        </View>

        {/* Recent Incidents */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>⚠️ Recent Incidents</Text>
            <View
              style={[
                styles.countBadge,
                worker.recentIncidentsCount > 0 && {
                  backgroundColor: '#ef4444',
                },
              ]}
            >
              <Text style={styles.countBadgeText}>
                {worker.recentIncidentsCount}
              </Text>
            </View>
          </View>
          {worker.recentIncidentsCount > 0 ? (
            <>
              <View style={styles.incidentAlert}>
                <Text style={styles.incidentAlertIcon}>⚠️</Text>
                <View style={styles.incidentAlertContent}>
                  <Text style={styles.incidentAlertText}>
                    {worker.recentIncidentsCount} incident(s) in the last 30
                    days
                  </Text>
                  <Text style={styles.incidentAlertSubtext}>
                    Requires attention and review
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.viewMoreButton}
                onPress={handleViewIncidents}
              >
                <Text style={styles.viewMoreButtonText}>
                  View All Incidents →
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>✅ No recent incidents</Text>
              <Text style={styles.emptySubtext}>
                Good safety record maintained
              </Text>
            </View>
          )}
        </View>

        {/* Latest Remarks */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💬 Latest Remarks</Text>
          {worker.latestRemark ? (
            <View style={styles.remarkPreview}>
              <View style={styles.remarkHeader}>
                <Text style={styles.remarkDate}>
                  {formatDate(worker.latestRemark.timestamp)}
                </Text>
                <View style={styles.remarkTypeBadge}>
                  <Text style={styles.remarkTypeBadgeText}>
                    {worker.latestRemark.type}
                  </Text>
                </View>
              </View>
              <Text style={styles.remarkText} numberOfLines={2}>
                {worker.latestRemark.text}
              </Text>
              <View style={styles.remarkFooter}>
                <Text style={styles.remarkAuthor}>
                  By: {worker.latestRemark.author}
                </Text>
                <TouchableOpacity onPress={handleAddRemark}>
                  <Text style={styles.remarkViewAll}>View All →</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.placeholderBox}>
              <Text style={styles.placeholderText}>No remarks yet</Text>
              <Text style={styles.placeholderHint}>
                Add remarks to track performance and behavior
              </Text>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.actionButtonPrimary]}
            onPress={handleAddRemark}
          >
            <Text style={styles.actionButtonText}>💬 Add Remark</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.actionButtonSecondary]}
            onPress={handleAssignTask}
          >
            <Text style={styles.actionButtonText}>📋 Assign Task</Text>
          </TouchableOpacity>
        </View>

        {/* Last Activity */}
        {worker.lastActivityAt && (
          <View style={styles.lastActivity}>
            <Text style={styles.lastActivityText}>
              Last activity: {formatTime(worker.lastActivityAt)}
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
  closeButton: {
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  closeButtonText: {
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 18,
    color: '#64748b',
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    padding: 16,
    paddingBottom: 32,
  },
  overviewCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 3,
    borderTopWidth: 4,
    borderTopColor: '#f59e0b',
  },
  overviewHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  avatarCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#1e3a5f',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  overviewInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  workerName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  workerRole: {
    fontSize: 15,
    color: '#64748b',
    fontWeight: '600',
    marginBottom: 6,
  },
  workerDetail: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 2,
  },
  statusBanner: {
    borderRadius: 10,
    padding: 12,
    marginTop: 8,
  },
  statusBannerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  statusBannerLeft: {
    flex: 1,
  },
  statusBannerText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  attendanceTimestamp: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  attendanceTimestampIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  attendanceTimestampText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  verifiedBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  verifiedBadgeText: {
    fontSize: 11,
    color: '#fff',
    fontWeight: 'bold',
  },
  statusBannerTime: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  reasonBox: {
    backgroundColor: '#fef3c7',
    borderRadius: 8,
    padding: 10,
    marginTop: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#f59e0b',
  },
  reasonLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#92400e',
    marginBottom: 4,
  },
  reasonText: {
    fontSize: 13,
    color: '#78350f',
    fontStyle: 'italic',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
  },
  countBadge: {
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    minWidth: 28,
    alignItems: 'center',
  },
  countBadgeText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  attendanceGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  attendanceDay: {
    alignItems: 'center',
    flex: 1,
  },
  attendanceDayLabel: {
    fontSize: 10,
    color: '#64748b',
    marginBottom: 6,
    fontWeight: '600',
  },
  attendanceDayBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  attendanceDayBadgeText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  placeholderBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 14,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderStyle: 'dashed',
  },
  placeholderText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '600',
    marginBottom: 4,
  },
  placeholderHint: {
    fontSize: 12,
    color: '#94a3b8',
    fontStyle: 'italic',
  },
  emptyBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#94a3b8',
    fontStyle: 'italic',
  },
  emptySubtext: {
    fontSize: 12,
    color: '#cbd5e1',
    fontStyle: 'italic',
    marginTop: 4,
  },
  incidentAlert: {
    flexDirection: 'row',
    backgroundColor: '#fef2f2',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#ef4444',
  },
  incidentAlertIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  incidentAlertContent: {
    flex: 1,
  },
  incidentAlertText: {
    fontSize: 14,
    color: '#991b1b',
    fontWeight: '600',
    marginBottom: 4,
  },
  incidentAlertSubtext: {
    fontSize: 12,
    color: '#b91c1c',
    fontStyle: 'italic',
  },
  remarkPreview: {
    backgroundColor: '#fef3c7',
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#f59e0b',
  },
  remarkHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  remarkDate: {
    fontSize: 11,
    color: '#92400e',
    fontWeight: '600',
  },
  remarkTypeBadge: {
    backgroundColor: '#fbbf24',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  remarkTypeBadgeText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  remarkText: {
    fontSize: 13,
    color: '#78350f',
    marginBottom: 8,
    lineHeight: 18,
  },
  remarkFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  remarkAuthor: {
    fontSize: 11,
    color: '#92400e',
    fontStyle: 'italic',
  },
  remarkViewAll: {
    fontSize: 12,
    color: '#1e3a5f',
    fontWeight: '600',
  },
  viewMoreButton: {
    backgroundColor: '#fef3c7',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    borderLeftWidth: 3,
    borderLeftColor: '#f59e0b',
  },
  viewMoreButtonText: {
    fontSize: 14,
    color: '#92400e',
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    marginTop: 8,
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 6,
    elevation: 2,
  },
  actionButtonPrimary: {
    backgroundColor: '#f59e0b',
  },
  actionButtonSecondary: {
    backgroundColor: '#3b82f6',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  lastActivity: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  lastActivityText: {
    fontSize: 12,
    color: '#94a3b8',
    fontStyle: 'italic',
  },
});

export default WorkerProfileSheet;
