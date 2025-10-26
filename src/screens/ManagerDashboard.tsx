import React, { useState } from 'react';
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

type AdminDashboardNavigationProp = StackNavigationProp<RootStackParamList>;

interface FeatureCardProps {
  icon: string;
  title: string;
  subtitle: string;
  onPress: () => void;
  statusColor?: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  subtitle,
  onPress,
  statusColor = '#10b981',
}) => (
  <TouchableOpacity style={styles.featureCard} onPress={onPress}>
    <View style={[styles.statusIndicator, { backgroundColor: statusColor }]} />
    <Text style={styles.featureIcon}>{icon}</Text>
    <Text style={styles.featureTitle}>{title}</Text>
    <Text style={styles.featureSubtitle}>{subtitle}</Text>
  </TouchableOpacity>
);

const AdminDashboard: React.FC = () => {
  const navigation = useNavigation<AdminDashboardNavigationProp>();
  const [selectedDate, setSelectedDate] = useState('Today');

  const handleLogout = () => {
    navigation.navigate('HomeScreen');
  };

  const handleProfileSettings = () => {
    console.log('Opening Profile & Settings...');
    // TODO: Navigate to profile settings
  };

  const handleDateSelector = () => {
    console.log('Opening Date Selector...');
    // TODO: Show date picker modal
  };

  const handleShiftSummary = () => {
    console.log('Opening Shift Summary...');
    // TODO: Navigate to detailed shift summary with charts
  };

  const handleIncidentOverview = () => {
    console.log('Opening Incident Overview...');
    // TODO: Navigate to incidents table with filters
  };

  const handleWorkerAttendance = () => {
    console.log('Opening Worker Attendance...');
    // TODO: Navigate to attendance roster
  };

  const handleReportsAudit = () => {
    console.log('Opening Reports & Audit Logs...');
    // TODO: Navigate to reports and audit section
  };

  const handleNotifications = () => {
    console.log('Opening Notifications...');
    // TODO: Navigate to notifications
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with Role Badge */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View>
            <Text style={styles.headerTitle}>DEEPSHIFT</Text>
            <Text style={styles.headerSubtitle}>Mine Manager Dashboard</Text>
          </View>
          <View style={styles.roleBadge}>
            <Text style={styles.roleBadgeText}>⚡ MANAGER</Text>
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

      {/* Date Selector Banner */}
      <TouchableOpacity
        style={styles.dateSelectorBanner}
        onPress={handleDateSelector}
      >
        <Text style={styles.dateSelectorText}>
          📅 Date Selector: {selectedDate} ▼
        </Text>
      </TouchableOpacity>

      {/* Auto Alerts Banner */}
      <View style={styles.alertsBanner}>
        <Text style={styles.alertsText}>
          Auto Alerts: 1 Reopened | 0 High-Severity Incident 🚨
        </Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Feature Grid */}
        <View style={styles.featureGrid}>
          <FeatureCard
            icon="📊"
            title="Shift Summary"
            subtitle="Production Overview"
            onPress={handleShiftSummary}
            statusColor="#10b981"
          />
          <FeatureCard
            icon="⚠️"
            title="Incident Overview"
            subtitle="Safety Monitoring"
            onPress={handleIncidentOverview}
            statusColor="#f59e0b"
          />
          <FeatureCard
            icon="👷"
            title="Worker Attendance"
            subtitle="Roster & Presence"
            onPress={handleWorkerAttendance}
            statusColor="#3b82f6"
          />
          <FeatureCard
            icon="📄"
            title="Reports & Audit Logs"
            subtitle="Compliance & Export"
            onPress={handleReportsAudit}
            statusColor="#8b5cf6"
          />
        </View>

        {/* Shift Summary Stats Section */}
        <View style={styles.statsSection}>
          <Text style={styles.statsSectionTitle}>Today's Shift Summary</Text>
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, styles.statCardSuccess]}>
              <Text style={styles.statNumber}>42</Text>
              <Text style={styles.statLabel}>Total Shifts</Text>
            </View>
            <View style={[styles.statCard, styles.statCardSuccess]}>
              <Text style={styles.statNumber}>40</Text>
              <Text style={styles.statLabel}>Acknowledged</Text>
            </View>
            <View style={[styles.statCard, styles.statCardWarning]}>
              <Text style={styles.statNumber}>2</Text>
              <Text style={styles.statLabel}>Pending</Text>
            </View>
            <View style={[styles.statCard, styles.statCardSuccess]}>
              <Text style={styles.statNumber}>92%</Text>
              <Text style={styles.statLabel}>Productivity</Text>
            </View>
          </View>
          <View style={styles.trendInfo}>
            <Text style={styles.trendText}>📈 +5% compared to yesterday</Text>
          </View>
        </View>

        {/* Incident Overview Section */}
        <View style={styles.incidentSection}>
          <Text style={styles.statsSectionTitle}>Incident Overview</Text>
          <View style={styles.incidentCard}>
            <View style={styles.incidentRow}>
              <View
                style={[styles.severityDot, { backgroundColor: '#ef4444' }]}
              />
              <Text style={styles.incidentLabel}>High Severity</Text>
              <Text style={styles.incidentCount}>0</Text>
            </View>
            <View style={styles.incidentRow}>
              <View
                style={[styles.severityDot, { backgroundColor: '#f59e0b' }]}
              />
              <Text style={styles.incidentLabel}>Medium Severity</Text>
              <Text style={styles.incidentCount}>2</Text>
            </View>
            <View style={styles.incidentRow}>
              <View
                style={[styles.severityDot, { backgroundColor: '#10b981' }]}
              />
              <Text style={styles.incidentLabel}>Low Severity</Text>
              <Text style={styles.incidentCount}>1</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions Section */}
        <View style={styles.quickActionsSection}>
          <Text style={styles.statsSectionTitle}>Quick Actions</Text>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>
              📄 Generate Daily PDF Report
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.actionButtonSecondary]}
          >
            <Text style={styles.actionButtonTextSecondary}>
              📧 Email Summary to DGMS
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.actionButtonSecondary]}
          >
            <Text style={styles.actionButtonTextSecondary}>
              📊 Export Attendance CSV
            </Text>
          </TouchableOpacity>
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
  dateSelectorBanner: {
    backgroundColor: '#fef3c7',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 2,
    borderBottomColor: '#f59e0b',
  },
  dateSelectorText: {
    fontSize: 14,
    color: '#92400e',
    fontWeight: '700',
  },
  alertsBanner: {
    backgroundColor: '#fee2e2',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 2,
    borderBottomColor: '#fca5a5',
  },
  alertsText: {
    fontSize: 12,
    color: '#991b1b',
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
  },
  statusIndicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 5,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
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
  statsSection: {
    backgroundColor: '#fff',
    margin: 12,
    padding: 16,
    borderRadius: 20,
    elevation: 3,
    borderTopWidth: 4,
    borderTopColor: '#10b981',
  },
  statsSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statCard: {
    width: '48%',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    borderWidth: 2,
  },
  statCardSuccess: {
    backgroundColor: '#d1fae5',
    borderColor: '#10b981',
  },
  statCardWarning: {
    backgroundColor: '#fef3c7',
    borderColor: '#f59e0b',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#64748b',
    textAlign: 'center',
    fontWeight: '600',
  },
  trendInfo: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  trendText: {
    fontSize: 13,
    color: '#10b981',
    fontWeight: '600',
    textAlign: 'center',
  },
  incidentSection: {
    backgroundColor: '#fff',
    margin: 12,
    padding: 16,
    borderRadius: 20,
    elevation: 3,
    borderTopWidth: 4,
    borderTopColor: '#f59e0b',
  },
  incidentCard: {
    gap: 12,
  },
  incidentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  severityDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  incidentLabel: {
    flex: 1,
    fontSize: 14,
    color: '#475569',
    fontWeight: '500',
  },
  incidentCount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    minWidth: 30,
    textAlign: 'right',
  },
  quickActionsSection: {
    backgroundColor: '#fff',
    margin: 12,
    padding: 16,
    borderRadius: 20,
    elevation: 3,
    borderTopWidth: 4,
    borderTopColor: '#3b82f6',
  },
  actionButton: {
    backgroundColor: '#1e3a5f',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10,
    elevation: 2,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  actionButtonSecondary: {
    backgroundColor: '#f0f4f8',
    borderWidth: 2,
    borderColor: '#f59e0b',
  },
  actionButtonTextSecondary: {
    color: '#92400e',
    fontSize: 14,
    fontWeight: '700',
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

export default AdminDashboard;
