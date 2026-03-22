import React, { useEffect, useState } from 'react';
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
import { RootStackParamList } from '../navigation/types';
import { useAuth } from '../context/AuthContext';
import safetyIntelligenceService, {
  SafetyAlert,
} from '../services/safetyIntelligenceService';
import workerFeedbackService from '../services/workerFeedbackService';
import { shiftService } from '../services/shiftService';
import { userService } from '../services/userService';

type SupervisorDashboardNavigationProp =
  StackNavigationProp<RootStackParamList>;

interface FeatureCardProps {
  icon: string;
  title: string;
  subtitle: string;
  onPress: () => void;
  badge?: string;
  badgeColor?: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  subtitle,
  onPress,
  badge,
  badgeColor = '#f59e0b',
}) => (
  <TouchableOpacity
    style={styles.featureCard}
    onPress={onPress}
    activeOpacity={0.7}
  >
    {badge && (
      <View style={[styles.badge, { backgroundColor: badgeColor }]}>
        <Text style={styles.badgeText}>{badge}</Text>
      </View>
    )}
    <View style={styles.iconContainer}>
      <Text style={styles.featureIcon}>{icon}</Text>
    </View>
    <Text style={styles.featureTitle}>{title}</Text>
    <Text style={styles.featureSubtitle}>{subtitle}</Text>
  </TouchableOpacity>
);

const SupervisorDashboard: React.FC = () => {
  const navigation = useNavigation<SupervisorDashboardNavigationProp>();
  const { user, logout } = useAuth();
  const [ruleAlerts, setRuleAlerts] = useState<SafetyAlert[]>([]);
  const [pendingFeedbackCount, setPendingFeedbackCount] = useState(0);

  const [shiftData, setShiftData] = useState({
    currentShift: 'No Active Shift',
    shiftTime: '—',
    totalSections: 0,
    totalWorkers: 0,
    pendingReports: 0,
    incidentsReported: 0,
    safetyScore: 0,
  });

  useEffect(() => {
    let mounted = true;
    safetyIntelligenceService
      .getRuleBasedAlerts()
      .then(alerts => {
        if (mounted) {
          setRuleAlerts(alerts);
        }
      })
      .catch(() => {
        if (mounted) {
          setRuleAlerts([]);
        }
      });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const loadPendingFeedback = async () => {
      if (!user?.section_id) return;
      try {
        const pending = await workerFeedbackService.getFeedbackForSection(
          user.section_id,
          'pending_supervisor_review',
        );
        setPendingFeedbackCount(pending.length);
      } catch {
        setPendingFeedbackCount(0);
      }
    };
    loadPendingFeedback();
  }, [user?.section_id, ruleAlerts.length]);

  useEffect(() => {
    const loadShiftSummary = async () => {
      if (!user?.section_id) return;
      try {
        const [sectionWorkers, shiftsWithRelations] = await Promise.all([
          userService.getWorkersForSection(user.section_id),
          shiftService.getShiftsWithRelations(),
        ]);

        const today = new Date().toISOString().split('T')[0];
        const sectionShifts = shiftsWithRelations.filter(
          s => s.section_id === user.section_id,
        );
        const todaySectionShifts = sectionShifts.filter(
          s => s.shift_date === today,
        );
        const activeShift = todaySectionShifts[0] ?? sectionShifts[0] ?? null;

        const shiftLogs = activeShift?.worker_logs ?? [];
        const safetyPassed = shiftLogs.filter(l => l.safety_check_passed).length;
        const safetyScore =
          shiftLogs.length > 0
            ? Math.round((safetyPassed / shiftLogs.length) * 100)
            : 0;

        setShiftData({
          currentShift: activeShift
            ? `${activeShift.shift_type.charAt(0).toUpperCase()}${activeShift.shift_type.slice(1)} Shift`
            : 'No Active Shift',
          shiftTime: activeShift
            ? activeShift.submitted_at
              ? `Submitted ${new Date(activeShift.submitted_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
              : 'In Progress'
            : '—',
          totalSections: new Set(sectionShifts.map(s => s.section_id)).size,
          totalWorkers: sectionWorkers.length,
          pendingReports: sectionShifts.filter(s => s.status === 'draft').length,
          incidentsReported: activeShift?.incidents?.length ?? 0,
          safetyScore,
        });
      } catch {
        setShiftData(prev => ({ ...prev }));
      }
    };

    loadShiftSummary();
  }, [user?.section_id, ruleAlerts.length, pendingFeedbackCount]);

  const handleLogout = async () => {
    await logout();
    navigation.reset({ index: 0, routes: [{ name: 'LoginScreen' }] });
  };

  const handleProfile = () => {
    navigation.navigate('OvermanProfileScreen');
  };

  const handleSectionReports = () => {
    navigation.navigate('SectionReportsScreen');
  };

  const handleSafetyOverview = () => {
    navigation.navigate('SafetyOverviewScreen');
  };

  const handleCreateShiftLog = () => {
    navigation.navigate('CreateShiftLogScreen');
  };

  const handleSubmittedLogs = () => {
    navigation.navigate('SubmittedLogsScreen');
  };

  const handleSectionSummary = () => {
    navigation.navigate('SectionSummaryScreen');
  };

  const handleRemarksPanel = () => {
    navigation.navigate('RemarksPanelScreen');
  };

  const handleFeedbackReview = () => {
    navigation.navigate('FeedbackReviewScreen');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>DeepShift</Text>
        <TouchableOpacity
          style={styles.profileIconButton}
          onPress={handleProfile}
        >
          <Text style={styles.profileIcon}>👤</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Shift Summary Card */}
        <View style={styles.shiftSummaryCard}>
          <View style={styles.shiftHeader}>
            <View style={styles.shiftBadge}>
              <Text style={styles.shiftBadgeText}>🌅 ACTIVE SHIFT</Text>
            </View>
          </View>

          <Text style={styles.shiftTitle}>{shiftData.currentShift}</Text>
          <Text style={styles.shiftTime}>{shiftData.shiftTime}</Text>

          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryNumber}>
                {shiftData.totalSections}
              </Text>
              <Text style={styles.summaryLabel}>Sections</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryNumber}>{shiftData.totalWorkers}</Text>
              <Text style={styles.summaryLabel}>Workers</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryNumber, styles.pendingNumber]}>
                {shiftData.pendingReports}
              </Text>
              <Text style={styles.summaryLabel}>Pending</Text>
            </View>
          </View>
        </View>

        {/* Main Feature Cards Grid */}
        <View style={styles.featureGrid}>
          <FeatureCard
            icon="�"
            title="Section Reports"
            subtitle="Review submissions"
            onPress={handleSectionReports}
            badge={shiftData.pendingReports.toString()}
            badgeColor="#f59e0b"
          />
          <FeatureCard
            icon="⚠️"
            title="Safety Overview"
            subtitle="Incidents & compliance"
            onPress={handleSafetyOverview}
            badge={
              ruleAlerts.length > 0 ? ruleAlerts.length.toString() : undefined
            }
            badgeColor="#ef4444"
          />
          <FeatureCard
            icon=""
            title="Section Summary"
            subtitle="All sections overview"
            onPress={handleSectionSummary}
          />
          <FeatureCard
            icon=""
            title="Remarks Panel"
            subtitle="Chat with foremen"
            onPress={handleRemarksPanel}
            badge={
              ruleAlerts.filter(a => a.type === 'operational').length > 0
                ? ruleAlerts
                    .filter(a => a.type === 'operational')
                    .length.toString()
                : undefined
            }
            badgeColor="#3b82f6"
          />
          <FeatureCard
            icon="📝"
            title="Create Shift Log"
            subtitle="Finalize report"
            onPress={handleCreateShiftLog}
          />
          <FeatureCard
            icon="�"
            title="Submitted Logs"
            subtitle="View history"
            onPress={handleSubmittedLogs}
          />
          <FeatureCard
            icon="🛡️"
            title="Worker Feedback"
            subtitle="Review pending reports"
            onPress={handleFeedbackReview}
            badge={
              pendingFeedbackCount > 0
                ? pendingFeedbackCount.toString()
                : undefined
            }
            badgeColor="#2563eb"
          />
        </View>

        {/* Live Updates Bar */}
        <View style={styles.liveUpdatesBar}>
          <View style={styles.liveIndicator}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>Live Updates</Text>
          </View>
          <Text style={styles.updateText}>
            {ruleAlerts.length === 0
              ? `${shiftData.pendingReports} reports pending • ${shiftData.incidentsReported} incident reported`
              : `${ruleAlerts.length} rule-based alerts active`}
          </Text>
          {ruleAlerts.slice(0, 2).map(alert => (
            <Text
              key={alert.id}
              style={[styles.updateText, { marginTop: 6, fontSize: 12 }]}
            >
              • [{alert.severity.toUpperCase()}] {alert.title}
            </Text>
          ))}
        </View>

        {/* Safety Score Widget */}
        <View style={styles.safetyScoreWidget}>
          <Text style={styles.safetyScoreLabel}>Today's Safety Score</Text>
          <View style={styles.safetyScoreCircle}>
            <Text style={styles.safetyScoreNumber}>
              {shiftData.safetyScore}
            </Text>
            <Text style={styles.safetyScorePercent}>%</Text>
          </View>
          <Text style={styles.safetyScoreStatus}>✓ Excellent Performance</Text>
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
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 0.5,
  },
  profileIconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileIcon: {
    fontSize: 24,
  },
  scrollView: {
    flex: 1,
  },
  shiftSummaryCard: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
    borderRadius: 16,
    elevation: 3,
    shadowColor: '#1e3a5f',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  shiftHeader: {
    marginBottom: 12,
  },
  shiftBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#fef3c7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#f59e0b',
  },
  shiftBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#92400e',
    letterSpacing: 0.5,
  },
  shiftTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  shiftTime: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 20,
  },
  summaryGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e3a5f',
    marginBottom: 4,
  },
  pendingNumber: {
    color: '#f59e0b',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
  },
  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#e2e8f0',
    marginHorizontal: 8,
  },
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  featureCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#1e3a5f',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    position: 'relative',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  badge: {
    position: 'absolute',
    top: 12,
    right: 12,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 24,
    alignItems: 'center',
    elevation: 2,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  featureIcon: {
    fontSize: 32,
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
  liveUpdatesBar: {
    backgroundColor: '#1e293b',
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10b981',
    marginRight: 8,
  },
  liveText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#10b981',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  updateText: {
    fontSize: 14,
    color: '#e2e8f0',
    fontWeight: '600',
  },
  safetyScoreWidget: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    borderWidth: 2,
    borderColor: '#d1fae5',
  },
  safetyScoreLabel: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '600',
    marginBottom: 16,
  },
  safetyScoreCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#d1fae5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 8,
    borderColor: '#10b981',
  },
  safetyScoreNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#059669',
  },
  safetyScorePercent: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#059669',
    marginTop: -8,
  },
  safetyScoreStatus: {
    fontSize: 14,
    color: '#059669',
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: '#dc2626',
    marginHorizontal: 16,
    marginVertical: 20,
    marginBottom: 30,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default SupervisorDashboard;
