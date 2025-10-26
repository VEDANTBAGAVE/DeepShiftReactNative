import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { useWorker } from '../context/WorkerContext';

type WorkerDashboardNavigationProp = StackNavigationProp<RootStackParamList>;

interface FeatureCardProps {
  icon: string;
  title: string;
  subtitle: string;
  onPress: () => void;
  badge?: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  subtitle,
  onPress,
  badge,
}) => (
  <TouchableOpacity style={styles.featureCard} onPress={onPress}>
    {badge && (
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{badge}</Text>
      </View>
    )}
    <Text style={styles.featureIcon}>{icon}</Text>
    <Text style={styles.featureTitle}>{title}</Text>
    <Text style={styles.featureSubtitle}>{subtitle}</Text>
  </TouchableOpacity>
);

const WorkerDashboard: React.FC = () => {
  const navigation = useNavigation<WorkerDashboardNavigationProp>();
  const {
    getTodayAttendance,
    getTodayIncidents,
    getTodayTasks,
    getUnreadRemarksCount,
    settings,
    loadDemoData,
    isLoading,
  } = useWorker();

  const [stats, setStats] = useState({
    attendanceMarked: false,
    tasksCount: 0,
    incidentsCount: 0,
    unreadRemarks: 0,
  });

  // Refresh stats when screen focuses
  useFocusEffect(
    React.useCallback(() => {
      refreshStats();
    }, []),
  );

  const refreshStats = () => {
    const attendance = getTodayAttendance();
    const tasks = getTodayTasks();
    const incidents = getTodayIncidents();
    const unreads = getUnreadRemarksCount();

    setStats({
      attendanceMarked: !!attendance,
      tasksCount: tasks.length,
      incidentsCount: incidents.length,
      unreadRemarks: unreads,
    });
  };

  // Load demo data on first launch if empty
  useEffect(() => {
    if (!isLoading && !getTodayAttendance() && !settings.demoMode) {
      // Optionally prompt to load demo data
      // For now, automatically load it
      loadDemoData();
    }
  }, [isLoading]);

  const handleLogout = () => {
    navigation.navigate('HomeScreen');
  };

  const handleMarkAttendance = () => {
    navigation.navigate('MarkAttendanceScreen');
  };

  const handleReportIncident = () => {
    navigation.navigate('ReportIncidentScreen');
  };

  const handleViewTasks = () => {
    navigation.navigate('ViewTasksScreen');
  };

  const handleSupervisorRemarks = () => {
    navigation.navigate('SupervisorRemarksScreen');
  };

  const handleProfileSettings = () => {
    navigation.navigate('WorkerSettingsScreen');
  };

  const handleNotifications = () => {
    // Navigate to remarks which acts as notification center
    navigation.navigate('SupervisorRemarksScreen');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Bar with Role Badge */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.appName}>DEEPSHIFT</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleBadgeText}>👷 WORKER</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.notificationIcon}
            onPress={handleNotifications}
          >
            <Text style={styles.notificationIconText}>🔔</Text>
            {stats.unreadRemarks > 0 && <View style={styles.notificationDot} />}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.profileIcon}
            onPress={handleProfileSettings}
          >
            <Text style={styles.profileIconText}>👤</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Current Shift Info Banner */}
      <View style={styles.shiftBanner}>
        <Text style={styles.shiftBannerText}>
          🕐 Morning Shift | 📍 Section: Panel 5 | � Foreman: Rajesh Kumar
        </Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Welcome Message */}
        <View style={styles.welcomeCard}>
          <Text style={styles.welcomeTitle}>Welcome, Worker!</Text>
          <Text style={styles.welcomeText}>
            Mark your attendance, report incidents, and view your daily tasks
            assigned by your foreman.
          </Text>
        </View>

        {/* Feature Grid */}
        <View style={styles.featureGrid}>
          <FeatureCard
            icon="✅"
            title="Mark Attendance"
            subtitle="Present / Absent"
            onPress={handleMarkAttendance}
          />
          <FeatureCard
            icon="⚠️"
            title="Report Incident"
            subtitle="With Photo Upload"
            onPress={handleReportIncident}
          />
          <FeatureCard
            icon="📋"
            title="View Tasks"
            subtitle="Today's Assignment"
            onPress={handleViewTasks}
          />
          <FeatureCard
            icon="💬"
            title="Foreman Remarks"
            subtitle="Messages & Notes"
            onPress={handleSupervisorRemarks}
            badge={
              stats.unreadRemarks > 0
                ? stats.unreadRemarks.toString()
                : undefined
            }
          />
        </View>

        {/* Quick Status */}
        <View style={styles.statusCard}>
          <Text style={styles.statusTitle}>Today's Status</Text>
          <View style={styles.statusRow}>
            <Text style={styles.statusItem}>
              {stats.attendanceMarked ? '✅' : '⏺'} Attendance:{' '}
              {stats.attendanceMarked ? 'Marked' : 'Not marked'}
            </Text>
            <Text style={styles.statusItem}>
              📋 Tasks: {stats.tasksCount} assigned
            </Text>
          </View>
          <View style={styles.statusRow}>
            <Text style={styles.statusItem}>
              ⚠️ Incidents: {stats.incidentsCount} reported
            </Text>
            <Text style={styles.statusItem}>
              💬 Messages: {stats.unreadRemarks} new
            </Text>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>🚪 Logout</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Bottom Info Bar */}
      <View style={styles.bottomBar}>
        <Text style={styles.bottomBarText}>
          📊 2 pending shifts • 1 reopened • 0 incidents
        </Text>
      </View>
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
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  appName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 1.5,
  },
  roleBadge: {
    backgroundColor: '#f59e0b',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleBadgeText: {
    fontSize: 11,
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
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 2,
    borderBottomColor: '#f59e0b',
  },
  shiftBannerText: {
    fontSize: 13,
    color: '#92400e',
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
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
    backgroundColor: '#ef4444',
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
  welcomeCard: {
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
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  welcomeTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
  },
  statusCard: {
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
  statusTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statusItem: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '500',
  },
  logoutButton: {
    backgroundColor: '#dc2626',
    marginHorizontal: 16,
    marginVertical: 20,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    elevation: 2,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomBar: {
    backgroundColor: '#1e293b',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  bottomBarText: {
    color: '#e2e8f0',
    fontSize: 13,
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default WorkerDashboard;
