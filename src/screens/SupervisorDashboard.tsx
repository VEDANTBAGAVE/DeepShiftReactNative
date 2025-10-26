import React from 'react';
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

type SupervisorDashboardNavigationProp =
  StackNavigationProp<RootStackParamList>;

interface FeatureCardProps {
  icon: string;
  title: string;
  subtitle: string;
  onPress: () => void;
  badge?: string;
  badgeColor?: string;
  hasWarning?: boolean;
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

const SupervisorDashboard: React.FC = () => {
  const navigation = useNavigation<SupervisorDashboardNavigationProp>();

  const handleLogout = () => {
    navigation.navigate('HomeScreen');
  };

  const handleProfileSettings = () => {
    console.log('Opening Profile & Settings...');
    // TODO: Navigate to profile settings
  };

  const handlePendingShifts = () => {
    console.log('Opening Pending Shifts...');
    // TODO: Navigate to pending shifts list
  };

  const handleReopenedRequests = () => {
    console.log('Opening Reopened Requests...');
    // TODO: Navigate to reopened requests
  };

  const handleIncidents = () => {
    console.log('Opening Incidents...');
    // TODO: Navigate to incidents list
  };

  const handleReports = () => {
    console.log('Opening Reports & Analytics...');
    // TODO: Navigate to reports/analytics
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
            <Text style={styles.headerSubtitle}>Supervisor Panel</Text>
          </View>
          <View style={styles.roleBadge}>
            <Text style={styles.roleBadgeText}>👨‍💼 SUPERVISOR</Text>
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

      {/* Current Shift Info Banner */}
      <View style={styles.shiftInfoBanner}>
        <Text style={styles.shiftInfoText}>
          🕒 Current Shift: Morning | 📍 Area: Panel 5
        </Text>
      </View>

      {/* Last Acknowledged Shift Banner */}
      <View style={styles.lastAckBanner}>
        <Text style={styles.lastAckText}>
          Last Acknowledged: Shift #245 (Vedant) ✅
        </Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Feature Grid */}
        <View style={styles.featureGrid}>
          <FeatureCard
            icon="📥"
            title="Pending Shifts"
            subtitle="Review Submissions"
            onPress={handlePendingShifts}
            badge="3"
            hasWarning={true}
          />
          <FeatureCard
            icon="🔁"
            title="Reopened Requests"
            subtitle="Awaiting Correction"
            onPress={handleReopenedRequests}
            badge="1"
            badgeColor="#f59e0b"
          />
          <FeatureCard
            icon="⚠️"
            title="Incidents"
            subtitle="Section Incidents"
            onPress={handleIncidents}
            badge="2"
            badgeColor="#ef4444"
          />
          <FeatureCard
            icon="📈"
            title="Reports / Analytics"
            subtitle="View & Generate"
            onPress={handleReports}
          />
        </View>

        {/* Quick Stats Section */}
        <View style={styles.statsSection}>
          <Text style={styles.statsSectionTitle}>Today's Overview</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>12</Text>
              <Text style={styles.statLabel}>Total Shifts</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>8</Text>
              <Text style={styles.statLabel}>Acknowledged</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>1</Text>
              <Text style={styles.statLabel}>Reopened</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>3</Text>
              <Text style={styles.statLabel}>Open Incidents</Text>
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
  shiftInfoBanner: {
    backgroundColor: '#fef3c7',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 2,
    borderBottomColor: '#f59e0b',
  },
  shiftInfoText: {
    fontSize: 13,
    color: '#92400e',
    fontWeight: '600',
  },
  lastAckBanner: {
    backgroundColor: '#d1fae5',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 2,
    borderBottomColor: '#10b981',
  },
  lastAckText: {
    fontSize: 12,
    color: '#065f46',
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
    borderRadius: 12,
    elevation: 2,
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
  statBox: {
    width: '48%',
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#64748b',
    textAlign: 'center',
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
});

export default SupervisorDashboard;
