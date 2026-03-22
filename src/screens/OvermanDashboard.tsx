import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { useAuth } from '../context/AuthContext';
import { useOvermanDashboard } from '../hooks/useDashboard';
import { shiftService } from '../services/shiftService';
import { userService } from '../services/userService';
import { ShiftWithRelations } from '../types/database';

type OvermanDashboardNavigationProp = StackNavigationProp<RootStackParamList>;

interface FeatureCardProps {
  icon: string;
  title: string;
  subtitle: string;
  onPress: () => void;
  badge?: string;
  badgeColor?: string;
  hasWarning?: boolean;
}

type StatusTone = 'pending' | 'review' | 'ok';

interface SectionStatusRow {
  sectionId: string;
  sectionName: string;
  foremanName: string;
  presentWorkers: number;
  totalWorkers: number;
  incidentsCount: number;
  statusText: string;
  tone: StatusTone;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  subtitle,
  onPress,
  badge,
  badgeColor = '#ef4444',
  hasWarning = false,
}) => (
  <TouchableOpacity style={styles.featureCard} onPress={onPress}>
    {badge && (
      <View style={[styles.badge, { backgroundColor: badgeColor }]}>
        <Text style={styles.badgeText}>{badge}</Text>
      </View>
    )}
    {hasWarning && (
      <View style={styles.warningIndicator}>
        <Text style={styles.warningIcon}>⚠️</Text>
      </View>
    )}
    <Text style={styles.featureIcon}>{icon}</Text>
    <Text style={styles.featureTitle}>{title}</Text>
    <Text style={styles.featureSubtitle}>{subtitle}</Text>
  </TouchableOpacity>
);

const OvermanDashboard: React.FC = () => {
  const navigation = useNavigation<OvermanDashboardNavigationProp>();
  const { user, logout } = useAuth();
  const { shifts, pendingShifts, isLoading, refreshData } = useOvermanDashboard();
  const [sectionRows, setSectionRows] = useState<SectionStatusRow[]>([]);
  const [summary, setSummary] = useState({
    shiftLabel: 'No Active Shift',
    foremenCount: 0,
    totalWorkers: 0,
    presentWorkers: 0,
    incidentsCount: 0,
    submittedLogs: 0,
    pendingReports: 0,
    safetyRate: 0,
    productionRate: 0,
    productionTarget: 0,
  });

  useEffect(() => {
    const loadLiveData = async () => {
      if (!user?.id) return;

      try {
        await refreshData();

        const [allShiftsWithRelations, foremen] = await Promise.all([
          shiftService.getShiftsWithRelations(),
          userService.getUsers({ role: 'foreman', is_active: true }),
        ]);

        const overmanShifts = allShiftsWithRelations.filter(
          s => s.overman_id === user.id,
        );

        const today = new Date().toISOString().split('T')[0];
        const todayShifts = overmanShifts.filter(s => s.shift_date === today);
        const referenceDateShifts =
          todayShifts.length > 0
            ? todayShifts
            : overmanShifts.filter(
                s => s.shift_date === overmanShifts[0]?.shift_date,
              );

        const latestBySection = new Map<string, ShiftWithRelations>();
        for (const shift of referenceDateShifts) {
          if (!latestBySection.has(shift.section_id)) {
            latestBySection.set(shift.section_id, shift);
          }
        }

        const rows: SectionStatusRow[] = Array.from(
          latestBySection.values(),
        ).map(shift => {
          const logs = shift.worker_logs ?? [];
          const presentWorkers = logs.filter(
            l => l.attendance_status === 'present',
          ).length;
          const incidentsCount = (shift.incidents ?? []).length;

          const statusText =
            shift.status === 'approved'
              ? 'Approved'
              : shift.status === 'submitted'
              ? 'Submitted'
              : 'Pending';

          const tone: StatusTone =
            shift.status === 'approved'
              ? 'ok'
              : shift.status === 'submitted'
              ? 'review'
              : 'pending';

          const foreman = foremen.find(f => f.section_id === shift.section_id);

          return {
            sectionId: shift.section_id,
            sectionName: shift.section?.section_name ?? 'Unknown Section',
            foremanName: foreman?.name ?? 'Unassigned',
            presentWorkers,
            totalWorkers: logs.length,
            incidentsCount,
            statusText,
            tone,
          };
        });

        const totalWorkers = rows.reduce((acc, row) => acc + row.totalWorkers, 0);
        const presentWorkers = rows.reduce(
          (acc, row) => acc + row.presentWorkers,
          0,
        );
        const incidentsCount = rows.reduce(
          (acc, row) => acc + row.incidentsCount,
          0,
        );

        const safetyPassed = referenceDateShifts
          .flatMap(s => s.worker_logs ?? [])
          .filter(l => l.safety_check_passed).length;

        const firstShift = referenceDateShifts[0];
        const shiftLabel = firstShift
          ? `${firstShift.shift_type.charAt(0).toUpperCase()}${firstShift.shift_type.slice(1)} Shift`
          : 'No Active Shift';

        setSectionRows(rows);
        setSummary({
          shiftLabel,
          foremenCount: new Set(rows.map(r => r.foremanName)).size,
          totalWorkers,
          presentWorkers,
          incidentsCount,
          submittedLogs: overmanShifts.filter(s => s.status === 'submitted')
            .length,
          pendingReports: rows.filter(r => r.statusText !== 'Approved').length,
          safetyRate:
            totalWorkers > 0 ? Math.round((safetyPassed / totalWorkers) * 100) : 0,
          productionRate:
            totalWorkers > 0
              ? Math.round((presentWorkers / totalWorkers) * 100)
              : 0,
          productionTarget: totalWorkers,
        });
      } catch {
        setSectionRows([]);
      }
    };

    loadLiveData();
  }, [user?.id, shifts.length, pendingShifts.length, refreshData]);

  const getStatusStyle = (tone: StatusTone) => {
    switch (tone) {
      case 'ok':
        return styles.statusApproved;
      case 'review':
        return styles.statusReview;
      default:
        return styles.statusPending;
    }
  };

  const handleLogout = async () => {
    await logout();
    navigation.reset({ index: 0, routes: [{ name: 'LoginScreen' }] });
  };

  const handleProfileSettings = () => {
    navigation.navigate('SectionSummaryScreen');
  };

  const handleReviewSectionReports = () => {
    navigation.navigate('SectionReportsScreen');
  };

  const handleMergeShiftLog = () => {
    navigation.navigate('CreateShiftLogScreen');
  };

  const handleIncidentReview = () => {
    navigation.navigate('SafetyOverviewScreen');
  };

  const handleSubmittedLogs = () => {
    navigation.navigate('SubmittedLogsScreen');
  };

  const handleNotifications = () => {
    navigation.navigate('RemarksPanelScreen');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with Role Badge */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View>
            <Text style={styles.headerTitle}>DEEPSHIFT</Text>
            <Text style={styles.headerSubtitle}>{user?.name || 'Overman'}</Text>
          </View>
          <View style={styles.roleBadge}>
            <Text style={styles.roleBadgeText}>👔 OVERMAN</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.notificationIcon}
            onPress={handleNotifications}
          >
            <Text style={styles.notificationIconText}>🔔</Text>
            <View style={styles.notificationDot} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.profileIcon}
            onPress={handleProfileSettings}
          >
            <Text style={styles.profileIconText}>👤</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Shift Info Banner */}
      <View style={styles.shiftBanner}>
        <Text style={styles.shiftBannerText}>
          🕐 {summary.shiftLabel} | 📍 All Sections | 👥 {summary.foremenCount}{' '}
          Foremen | {summary.totalWorkers} Workers
        </Text>
      </View>

      {/* Pending Section Reports Alert */}
      <View style={styles.alertBanner}>
        <Text style={styles.alertText}>
          ⚠️ {summary.pendingReports} Section Reports Pending Review → Merge &
          Submit Shift Log
        </Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Section Reports Overview */}
        <View style={styles.overviewCard}>
          <Text style={styles.overviewTitle}>Section Reports Status</Text>
          {sectionRows.length === 0 ? (
            <Text style={styles.sectionDetails}>No section reports found</Text>
          ) : (
            sectionRows.map(row => (
              <View key={row.sectionId} style={styles.sectionReportItem}>
                <View style={styles.sectionInfo}>
                  <Text style={styles.sectionName}>
                    {row.sectionName} (Foreman: {row.foremanName})
                  </Text>
                  <Text style={styles.sectionDetails}>
                    {row.presentWorkers}/{row.totalWorkers} present •{' '}
                    {row.incidentsCount} incidents
                  </Text>
                </View>
                <View style={[styles.statusBadge, getStatusStyle(row.tone)]}>
                  <Text style={styles.statusBadgeText}>{row.statusText}</Text>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Feature Grid */}
        <View style={styles.featureGrid}>
          <FeatureCard
            icon="📑"
            title="Review Section Reports"
            subtitle={`${summary.pendingReports} Pending Review`}
            onPress={handleReviewSectionReports}
            badge={
              summary.pendingReports > 0
                ? summary.pendingReports.toString()
                : undefined
            }
            badgeColor="#f59e0b"
            hasWarning={summary.pendingReports > 0}
          />
          <FeatureCard
            icon="🔄"
            title="Merge Shift Log"
            subtitle="Combine & Submit"
            onPress={handleMergeShiftLog}
          />
          <FeatureCard
            icon="⚠️"
            title="Incident Review"
            subtitle="All Sections"
            onPress={handleIncidentReview}
            badge={
              summary.incidentsCount > 0
                ? summary.incidentsCount.toString()
                : undefined
            }
            badgeColor="#ef4444"
          />
          <FeatureCard
            icon="📄"
            title="Submitted Logs"
            subtitle="Sent to Manager"
            onPress={handleSubmittedLogs}
            badge={shifts.filter(s => s.status === 'submitted').length > 0 ? shifts.filter(s => s.status === 'submitted').length.toString() : undefined}
            badgeColor="#10b981"
          />
        </View>

        {/* Quick Action: Merge and Submit */}
        <View style={styles.actionSection}>
          <Text style={styles.actionTitle}>
            Ready to Submit Final Shift Log?
          </Text>
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleMergeShiftLog}
          >
            <Text style={styles.submitButtonText}>
              ✓ Merge & Submit to Manager
            </Text>
          </TouchableOpacity>
          <Text style={styles.actionNote}>
            Review all section reports, add overall safety notes, gas readings,
            and production figures before final submission.
          </Text>
        </View>

        {/* Today's Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Today's Shift Summary</Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryNumber}>{summary.totalWorkers}</Text>
              <Text style={styles.summaryLabel}>Total Workers</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryNumber}>{summary.presentWorkers}</Text>
              <Text style={styles.summaryLabel}>Present</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryNumber}>{summary.incidentsCount}</Text>
              <Text style={styles.summaryLabel}>Incidents</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryNumber}>{summary.submittedLogs}</Text>
              <Text style={styles.summaryLabel}>Submitted Logs</Text>
            </View>
          </View>
        </View>

        {/* Safety & Production Notes */}
        <View style={styles.notesCard}>
          <Text style={styles.notesTitle}>Key Notes</Text>
          <View style={styles.noteItem}>
            <Text style={styles.noteIcon}>🛡️</Text>
            <Text style={styles.noteText}>
              Safety pass rate: {summary.safetyRate}%
            </Text>
          </View>
          <View style={styles.noteItem}>
            <Text style={styles.noteIcon}>📊</Text>
            <Text style={styles.noteText}>
              Attendance productivity: {summary.productionRate}% ({summary.presentWorkers}/{summary.productionTarget})
            </Text>
          </View>
          <View style={styles.noteItem}>
            <Text style={styles.noteIcon}>🔧</Text>
            <Text style={styles.noteText}>
              Open incident reports: {summary.incidentsCount}
            </Text>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>🚪 Logout</Text>
        </TouchableOpacity>
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#1e3a5f',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 1.5,
  },
  headerSubtitle: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 2,
  },
  roleBadge: {
    backgroundColor: '#f59e0b',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
  },
  notificationIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notificationIconText: {
    fontSize: 18,
  },
  notificationDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
    borderWidth: 1.5,
    borderColor: '#1e3a5f',
  },
  profileIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileIconText: {
    fontSize: 18,
  },
  shiftBanner: {
    backgroundColor: '#fef3c7',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 2,
    borderBottomColor: '#f59e0b',
  },
  shiftBannerText: {
    fontSize: 13,
    color: '#92400e',
    fontWeight: '600',
  },
  alertBanner: {
    backgroundColor: '#fee2e2',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 2,
    borderBottomColor: '#fca5a5',
  },
  alertText: {
    fontSize: 12,
    color: '#991b1b',
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  overviewCard: {
    backgroundColor: '#fff',
    margin: 16,
    marginTop: 12,
    padding: 18,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#1e3a5f',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    borderTopWidth: 4,
    borderTopColor: '#f59e0b',
  },
  overviewTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  sectionReportItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  sectionInfo: {
    flex: 1,
  },
  sectionName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  sectionDetails: {
    fontSize: 12,
    color: '#64748b',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusPending: {
    backgroundColor: '#fef3c7',
  },
  statusReview: {
    backgroundColor: '#dbeafe',
  },
  statusApproved: {
    backgroundColor: '#dcfce7',
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#92400e',
  },
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
    justifyContent: 'space-between',
  },
  featureCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#1e3a5f',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    position: 'relative',
    borderTopWidth: 4,
    borderTopColor: '#f59e0b',
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
    minWidth: 24,
    alignItems: 'center',
    elevation: 2,
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '800',
  },
  warningIndicator: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#fef3c7',
    borderRadius: 14,
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#f59e0b',
  },
  warningIcon: {
    fontSize: 14,
  },
  featureIcon: {
    fontSize: 40,
    marginBottom: 12,
    marginTop: 8,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 4,
  },
  featureSubtitle: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
  },
  actionSection: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 18,
    borderRadius: 16,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: '#10b981',
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
  },
  submitButton: {
    backgroundColor: '#10b981',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
    marginBottom: 10,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  actionNote: {
    fontSize: 12,
    color: '#64748b',
    lineHeight: 18,
    fontStyle: 'italic',
  },
  summaryCard: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 18,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#1e3a5f',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  summaryItem: {
    width: '48%',
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  summaryNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
    fontWeight: '600',
  },
  notesCard: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 18,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#1e3a5f',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  notesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
  },
  noteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  noteIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  noteText: {
    fontSize: 14,
    color: '#475569',
    flex: 1,
  },
  logoutButton: {
    backgroundColor: '#dc2626',
    marginHorizontal: 16,
    marginVertical: 20,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 3,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default OvermanDashboard;
