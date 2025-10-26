import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { useForeman } from '../context/ForemanContext';

type ForemanDashboardNavigationProp = StackNavigationProp<RootStackParamList>;

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
  badgeColor = '#ef4444',
}) => (
  <TouchableOpacity style={styles.featureCard} onPress={onPress}>
    {badge && (
      <View style={[styles.badge, { backgroundColor: badgeColor }]}>
        <Text style={styles.badgeText}>{badge}</Text>
      </View>
    )}
    <Text style={styles.featureIcon}>{icon}</Text>
    <Text style={styles.featureTitle}>{title}</Text>
    <Text style={styles.featureSubtitle}>{subtitle}</Text>
  </TouchableOpacity>
);

const ForemanDashboard: React.FC = () => {
  const navigation = useNavigation<ForemanDashboardNavigationProp>();
  const { getDashboardStats } = useForeman();
  const [stats, setStats] = useState({
    totalWorkers: 0,
    presentWorkers: 0,
    absentWorkers: 0,
    attendancePercentage: 0,
    openIncidents: 0,
    pendingReports: 0,
    reopenedReports: 0,
    unreadNotifications: 0,
  });

  // Refresh stats when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      const refreshStats = () => {
        const dashboardStats = getDashboardStats();
        setStats(dashboardStats);
      };
      refreshStats();
    }, [getDashboardStats]),
  );

  const handleLogout = () => {
    navigation.navigate('HomeScreen');
  };

  const handleProfileSettings = () => {
    navigation.navigate('ForemanProfileScreen');
  };

  const handleWorkerList = () => {
    navigation.navigate('WorkerListScreen');
  };

  const handleSectionReport = () => {
    navigation.navigate('SectionReportScreen', {});
  };

  const handleIncidents = () => {
    navigation.navigate('SectionIncidentsScreen');
  };

  const handleSubmittedReports = () => {
    navigation.navigate('SubmittedReportsScreen');
  };

  const handleNotifications = () => {
    navigation.navigate('NotificationsScreen');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with Role Badge */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View>
            <Text style={styles.headerTitle}>DEEPSHIFT</Text>
            <Text style={styles.headerSubtitle}>Foreman Panel</Text>
          </View>
          <View style={styles.roleBadge}>
            <Text style={styles.roleBadgeText}>👨‍🔧 FOREMAN</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.notificationIcon}
            onPress={handleNotifications}
          >
            <Text style={styles.notificationIconText}>🔔</Text>
            {stats.unreadNotifications > 0 && (
              <View style={styles.notificationDot}>
                <Text style={styles.notificationCount}>
                  {stats.unreadNotifications}
                </Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.profileIcon}
            onPress={handleProfileSettings}
          >
            <Text style={styles.profileIconText}>👤</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Section Assignment Banner */}
      <View style={styles.sectionBanner}>
        <Text style={styles.sectionBannerText}>
          🏗️ Section: Panel 5-A | 👷 Team Size: 8 workers | 🕐 Morning Shift
        </Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Section Overview */}
        <View style={styles.overviewCard}>
          <Text style={styles.overviewTitle}>Section Overview</Text>
          <View style={styles.overviewStats}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.presentWorkers}</Text>
              <Text style={styles.statLabel}>Present</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.absentWorkers}</Text>
              <Text style={styles.statLabel}>Absent</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.openIncidents}</Text>
              <Text style={styles.statLabel}>Incidents</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.pendingReports}</Text>
              <Text style={styles.statLabel}>Pending</Text>
            </View>
          </View>
        </View>

        {/* Feature Grid */}
        <View style={styles.featureGrid}>
          <FeatureCard
            icon="👥"
            title="Worker List"
            subtitle="View Team & Attendance"
            onPress={handleWorkerList}
            badge={
              stats.totalWorkers > 0 ? stats.totalWorkers.toString() : undefined
            }
            badgeColor="#3b82f6"
          />
          <FeatureCard
            icon="📝"
            title="Section Report"
            subtitle="Equipment & Safety"
            onPress={handleSectionReport}
          />
          <FeatureCard
            icon="⚠️"
            title="Section Incidents"
            subtitle="Review & Document"
            onPress={handleIncidents}
            badge={
              stats.openIncidents > 0
                ? stats.openIncidents.toString()
                : undefined
            }
            badgeColor="#ef4444"
          />
          <FeatureCard
            icon="📄"
            title="Submitted Reports"
            subtitle="Pending Overman Review"
            onPress={handleSubmittedReports}
            badge={
              stats.reopenedReports > 0
                ? stats.reopenedReports.toString()
                : undefined
            }
            badgeColor="#f59e0b"
          />
        </View>

        {/* Quick Action: Submit Section Report */}
        <View style={styles.actionSection}>
          <Text style={styles.actionTitle}>Ready to Submit?</Text>
          <TouchableOpacity
            style={styles.submitReportButton}
            onPress={handleSectionReport}
          >
            <Text style={styles.submitReportButtonText}>
              ✓ Fill & Submit Section Report
            </Text>
          </TouchableOpacity>
          <Text style={styles.actionNote}>
            Complete equipment check, safety inspection, and progress notes
            before submitting to Overman.
          </Text>
        </View>

        {/* Today's Progress */}
        <View style={styles.progressCard}>
          <Text style={styles.progressTitle}>Today's Progress</Text>
          <View style={styles.progressItem}>
            <Text style={styles.progressLabel}>✅ Attendance Recorded</Text>
            <Text style={styles.progressValue}>7/8 workers</Text>
          </View>
          <View style={styles.progressItem}>
            <Text style={styles.progressLabel}>🔧 Equipment Status</Text>
            <Text style={styles.progressValue}>Drill-02 needs maintenance</Text>
          </View>
          <View style={styles.progressItem}>
            <Text style={styles.progressLabel}>📊 Production</Text>
            <Text style={styles.progressValue}>45 tons (target: 50)</Text>
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
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#ef4444',
    borderWidth: 1.5,
    borderColor: '#1e3a5f',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationCount: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
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
  sectionBanner: {
    backgroundColor: '#fef3c7',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 2,
    borderBottomColor: '#f59e0b',
  },
  sectionBannerText: {
    fontSize: 13,
    color: '#92400e',
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
    borderTopColor: '#10b981',
  },
  overviewTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  overviewStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
    fontWeight: '600',
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
    borderLeftColor: '#3b82f6',
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
  },
  submitReportButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
    marginBottom: 10,
  },
  submitReportButtonText: {
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
  progressCard: {
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
  progressTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 14,
  },
  progressItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  progressLabel: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '500',
  },
  progressValue: {
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '600',
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

export default ForemanDashboard;
