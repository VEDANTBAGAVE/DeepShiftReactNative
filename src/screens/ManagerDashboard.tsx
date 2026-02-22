import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';

const { width } = Dimensions.get('window');

type ManagerDashboardNavigationProp = StackNavigationProp<RootStackParamList>;

interface MetricCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  color: string;
}

interface StatisticCardProps {
  icon: string;
  title: string;
  value: string;
  status: 'normal' | 'warning' | 'critical';
}

const StatisticCard: React.FC<StatisticCardProps> = ({
  icon,
  title,
  value,
  status,
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'critical':
        return '#ef4444';
      case 'warning':
        return '#f59e0b';
      default:
        return '#10b981';
    }
  };

  return (
    <View style={[styles.statisticCard, { borderTopColor: getStatusColor() }]}>
      <Text style={styles.statisticIcon}>{icon}</Text>
      <Text style={styles.statisticValue}>{value}</Text>
      <Text style={styles.statisticTitle}>{title}</Text>
    </View>
  );
};

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendValue,
  color,
}) => (
  <View style={[styles.metricCard, { borderLeftColor: color }]}>
    <View style={styles.metricHeader}>
      <Text style={styles.metricIcon}>{icon}</Text>
      <Text style={styles.metricTitle}>{title}</Text>
    </View>
    <Text style={styles.metricValue}>{value}</Text>
    <View style={styles.metricFooter}>
      <Text style={styles.metricSubtitle}>{subtitle}</Text>
      {trend && trendValue && (
        <View style={styles.trendContainer}>
          <Text
            style={[
              styles.trendText,
              trend === 'up'
                ? styles.trendUp
                : trend === 'down'
                ? styles.trendDown
                : styles.trendNeutral,
            ]}
          >
            {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'} {trendValue}
          </Text>
        </View>
      )}
    </View>
  </View>
);

interface ActionCardProps {
  icon: string;
  title: string;
  subtitle: string;
  badge?: string;
  badgeColor?: string;
  onPress: () => void;
}

const ActionCard: React.FC<ActionCardProps> = ({
  icon,
  title,
  subtitle,
  badge,
  badgeColor = '#f59e0b',
  onPress,
}) => (
  <TouchableOpacity
    style={styles.actionCard}
    onPress={onPress}
    activeOpacity={0.7}
  >
    {badge && (
      <View style={[styles.badge, { backgroundColor: badgeColor }]}>
        <Text style={styles.badgeText}>{badge}</Text>
      </View>
    )}
    <View style={styles.iconCircle}>
      <Text style={styles.actionIcon}>{icon}</Text>
    </View>
    <Text style={styles.actionTitle}>{title}</Text>
    <Text style={styles.actionSubtitle}>{subtitle}</Text>
  </TouchableOpacity>
);

const ManagerDashboard: React.FC = () => {
  const navigation = useNavigation<ManagerDashboardNavigationProp>();

  // Demo data for current shift overview
  const [shiftData] = useState({
    currentShift: 'Morning Shift',
    shiftTime: '06:00 AM - 02:00 PM',
    date: 'October 27, 2025',
    activeOvermen: 3,
    totalWorkers: 156,
    presentWorkers: 148,
    absentWorkers: 8,
    totalSections: 24,
    operationalSections: 22,
    safetyScore: 94,
    productionRate: 102,
    pendingApprovals: 5,
    criticalIncidents: 2,
    openIssues: 7,
  });

  const handleLogout = () => {
    navigation.navigate('HomeScreen');
  };

  const handleProfile = () => {
    console.log('Opening Profile...');
    // TODO: Navigate to profile
  };

  const handleShiftLogs = () => {
    navigation.navigate('ShiftReportsOverview');
  };

  const handlePerformanceAnalytics = () => {
    navigation.navigate('CrewPerformance');
  };

  const handleSafetyReports = () => {
    navigation.navigate('SafetyAnalytics');
  };

  const handleIncidentReview = () => {
    navigation.navigate('EquipmentOverview');
  };

  const handleStaffManagement = () => {
    navigation.navigate('CrewPerformance');
  };

  const handleReportsArchive = () => {
    console.log('Opening Reports Archive...');
    // TODO: Navigate to reports archive
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>DeepShift</Text>
          <Text style={styles.headerSubtitle}>Manager Dashboard</Text>
        </View>
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
        {/* Current Shift Header */}
        <View style={styles.shiftHeaderCard}>
          <View style={styles.shiftBadgeContainer}>
            <View style={styles.liveBadge}>
              <View style={styles.pulseDot} />
              <Text style={styles.liveBadgeText}>LIVE</Text>
            </View>
            <Text style={styles.shiftDate}>{shiftData.date}</Text>
          </View>
          <Text style={styles.shiftTitle}>{shiftData.currentShift}</Text>
          <Text style={styles.shiftTime}>{shiftData.shiftTime}</Text>

          {/* Quick Overview Grid */}
          <View style={styles.quickOverviewGrid}>
            <View style={styles.quickOverviewItem}>
              <Text style={styles.quickOverviewNumber}>
                {shiftData.activeOvermen}
              </Text>
              <Text style={styles.quickOverviewLabel}>Overmen</Text>
            </View>
            <View style={styles.quickDivider} />
            <View style={styles.quickOverviewItem}>
              <Text style={styles.quickOverviewNumber}>
                {shiftData.presentWorkers}/{shiftData.totalWorkers}
              </Text>
              <Text style={styles.quickOverviewLabel}>Workers</Text>
            </View>
            <View style={styles.quickDivider} />
            <View style={styles.quickOverviewItem}>
              <Text style={styles.quickOverviewNumber}>
                {shiftData.operationalSections}/{shiftData.totalSections}
              </Text>
              <Text style={styles.quickOverviewLabel}>Sections</Text>
            </View>
          </View>
        </View>

        {/* Statistics Grid */}
        <View style={styles.statisticsGrid}>
          <StatisticCard
            icon="🔄"
            title="Total Active Shifts"
            value="3"
            status="normal"
          />
          <StatisticCard
            icon="⏳"
            title="Pending Approvals"
            value={shiftData.pendingApprovals.toString()}
            status="warning"
          />
          <StatisticCard
            icon="🛡️"
            title="Safety Alerts"
            value={shiftData.openIssues.toString()}
            status="warning"
          />
          <StatisticCard
            icon="⚠️"
            title="Incidents Reported"
            value={shiftData.criticalIncidents.toString()}
            status="critical"
          />
        </View>

        {/* Key Performance Metrics */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Key Performance Metrics</Text>

          <MetricCard
            icon="⚡"
            title="Production Rate"
            value={`${shiftData.productionRate}%`}
            subtitle="of daily target"
            trend="up"
            trendValue="2% vs yesterday"
            color="#10b981"
          />

          <MetricCard
            icon="🛡️"
            title="Safety Score"
            value={`${shiftData.safetyScore}%`}
            subtitle="compliance rate"
            trend="down"
            trendValue="1% vs yesterday"
            color="#f59e0b"
          />

          <MetricCard
            icon="⚠️"
            title="Critical Incidents"
            value={shiftData.criticalIncidents.toString()}
            subtitle="requiring immediate attention"
            trend="up"
            trendValue="1 new today"
            color="#ef4444"
          />

          <MetricCard
            icon="📋"
            title="Pending Approvals"
            value={shiftData.pendingApprovals.toString()}
            subtitle="shift logs awaiting review"
            trend="neutral"
            trendValue="Same as yesterday"
            color="#3b82f6"
          />
        </View>

        {/* Management Actions Grid */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Quick Navigation</Text>

          <View style={styles.actionGrid}>
            <ActionCard
              icon="📊"
              title="Shift Reports"
              subtitle="Review & approve logs"
              badge={shiftData.pendingApprovals.toString()}
              badgeColor="#f59e0b"
              onPress={handleShiftLogs}
            />
            <ActionCard
              icon="�️"
              title="Safety Analytics"
              subtitle="Compliance & incidents"
              badge={shiftData.openIssues.toString()}
              badgeColor="#ef4444"
              onPress={handleSafetyReports}
            />
            <ActionCard
              icon="⚙️"
              title="Equipment Overview"
              subtitle="Status & maintenance"
              onPress={handleIncidentReview}
            />
            <ActionCard
              icon="👥"
              title="Crew Performance"
              subtitle="Team analytics"
              onPress={handleStaffManagement}
            />
          </View>
        </View>

        {/* Real-time Alerts Bar */}
        <View style={styles.alertsBar}>
          <View style={styles.alertsHeader}>
            <Text style={styles.alertsIcon}>🔔</Text>
            <Text style={styles.alertsTitle}>Real-time Alerts</Text>
          </View>
          <Text style={styles.alertsText}>
            • Section A-7 reported equipment malfunction (15 min ago)
          </Text>
          <Text style={styles.alertsText}>
            • Overman Sharma submitted shift log for approval (22 min ago)
          </Text>
          <Text style={styles.alertsText}>
            • Safety score dropped to 94% - Review recommended (1 hr ago)
          </Text>
        </View>

        {/* Reports & Archive Section */}
        <TouchableOpacity
          style={styles.archiveCard}
          onPress={() => navigation.navigate('ReportsArchive')}
          activeOpacity={0.7}
        >
          <View style={styles.archiveHeader}>
            <Text style={styles.archiveIcon}>📁</Text>
            <View style={styles.archiveHeaderText}>
              <Text style={styles.archiveTitle}>Reports & Archive</Text>
              <Text style={styles.archiveSubtitle}>
                Digital repository of all shift logs
              </Text>
            </View>
            <Text style={styles.archiveArrow}>→</Text>
          </View>
          <View style={styles.archiveStats}>
            <View style={styles.archiveStat}>
              <Text style={styles.archiveStatValue}>6</Text>
              <Text style={styles.archiveStatLabel}>Total Records</Text>
            </View>
            <View style={styles.archiveStat}>
              <Text style={[styles.archiveStatValue, { color: '#10b981' }]}>
                4
              </Text>
              <Text style={styles.archiveStatLabel}>Approved</Text>
            </View>
            <View style={styles.archiveStat}>
              <Text style={[styles.archiveStatValue, { color: '#64748b' }]}>
                2
              </Text>
              <Text style={styles.archiveStatLabel}>Archived</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Operations Status Summary */}
        <View style={styles.statusSummaryCard}>
          <Text style={styles.statusSummaryTitle}>
            Current Operations Status
          </Text>
          <View style={styles.statusRow}>
            <View style={styles.statusItem}>
              <View style={[styles.statusDot, styles.statusGreen]} />
              <Text style={styles.statusText}>
                {shiftData.operationalSections} Sections Operational
              </Text>
            </View>
          </View>
          <View style={styles.statusRow}>
            <View style={styles.statusItem}>
              <View style={[styles.statusDot, styles.statusYellow]} />
              <Text style={styles.statusText}>
                2 Sections Under Maintenance
              </Text>
            </View>
          </View>
          <View style={styles.statusRow}>
            <View style={styles.statusItem}>
              <View style={[styles.statusDot, styles.statusBlue]} />
              <Text style={styles.statusText}>
                {shiftData.absentWorkers} Workers Absent Today
              </Text>
            </View>
          </View>
          <View style={styles.statusRow}>
            <View style={styles.statusItem}>
              <View style={[styles.statusDot, styles.statusRed]} />
              <Text style={styles.statusText}>
                {shiftData.criticalIncidents} Critical Incidents Active
              </Text>
            </View>
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
    backgroundColor: '#f5f7fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#0f172a',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 2,
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
  shiftHeaderCard: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
    borderRadius: 16,
    elevation: 3,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#10b981',
  },
  shiftBadgeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dcfce7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#10b981',
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10b981',
    marginRight: 6,
  },
  liveBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#166534',
    letterSpacing: 0.5,
  },
  shiftDate: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
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
  quickOverviewGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  quickOverviewItem: {
    flex: 1,
    alignItems: 'center',
  },
  quickOverviewNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 4,
  },
  quickOverviewLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
  },
  quickDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#e2e8f0',
    marginHorizontal: 8,
  },
  sectionContainer: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
    letterSpacing: 0.3,
  },
  statisticCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    borderTopWidth: 4,
    minWidth: (width - 64) / 2,
    marginBottom: 12,
  },
  statisticIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  statisticValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  statisticTitle: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '600',
    textAlign: 'center',
  },
  statisticsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  metricCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    borderLeftWidth: 4,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  metricTitle: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '600',
  },
  metricValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  metricFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metricSubtitle: {
    fontSize: 12,
    color: '#94a3b8',
  },
  trendContainer: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#f8fafc',
  },
  trendText: {
    fontSize: 11,
    fontWeight: '700',
  },
  trendUp: {
    color: '#10b981',
  },
  trendDown: {
    color: '#ef4444',
  },
  trendNeutral: {
    color: '#64748b',
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: (width - 48) / 2,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#0f172a',
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
  iconCircle: {
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
  actionIcon: {
    fontSize: 32,
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
  },
  alertsBar: {
    backgroundColor: '#1e293b',
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  alertsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  alertsIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  alertsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.3,
  },
  alertsText: {
    fontSize: 13,
    color: '#e2e8f0',
    marginBottom: 8,
    lineHeight: 18,
  },
  statusSummaryCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 20,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  statusSummaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  statusRow: {
    marginBottom: 12,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 12,
  },
  statusGreen: {
    backgroundColor: '#10b981',
  },
  statusYellow: {
    backgroundColor: '#f59e0b',
  },
  statusBlue: {
    backgroundColor: '#3b82f6',
  },
  statusRed: {
    backgroundColor: '#ef4444',
  },
  statusText: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '500',
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
  archiveCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#1e3a5f',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  archiveHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  archiveIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  archiveHeaderText: {
    flex: 1,
  },
  archiveTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  archiveSubtitle: {
    fontSize: 13,
    color: '#64748b',
  },
  archiveArrow: {
    fontSize: 24,
    color: '#f59e0b',
    fontWeight: 'bold',
  },
  archiveStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  archiveStat: {
    alignItems: 'center',
  },
  archiveStatValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  archiveStatLabel: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
  },
});

export default ManagerDashboard;
