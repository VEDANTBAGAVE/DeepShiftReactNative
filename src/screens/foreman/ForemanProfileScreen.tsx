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
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/userService';

type ForemanProfileScreenNavigationProp =
  StackNavigationProp<RootStackParamList>;

const ForemanProfileScreen: React.FC = () => {
  const navigation = useNavigation<ForemanProfileScreenNavigationProp>();
  const { user, logout } = useAuth();
  const [sectionName, setSectionName] = useState<string>('—');

  useEffect(() => {
    const fetchSection = async () => {
      if (!user?.section_id) return;
      try {
        const sections = await userService.getSections();
        const found = sections.find(s => s.id === user.section_id);
        if (found) setSectionName(found.section_name);
      } catch {}
    };
    fetchSection();
  }, [user]);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await logout();
          navigation.reset({ index: 0, routes: [{ name: 'LoginScreen' }] });
        },
      },
    ]);
  };

  const getInitials = (name?: string | null) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
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
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Avatar & Name */}
        <View style={styles.profileHero}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{getInitials(user?.name)}</Text>
          </View>
          <Text style={styles.profileName}>{user?.name ?? '—'}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>Foreman</Text>
          </View>
        </View>

        {/* Info Cards */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionLabel}>Account Details</Text>

          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoIcon}>🪪</Text>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Employee Code</Text>
                <Text style={styles.infoValue}>
                  {user?.employee_code ?? '—'}
                </Text>
              </View>
            </View>

            <View style={styles.infoDivider} />

            <View style={styles.infoRow}>
              <Text style={styles.infoIcon}>🏗️</Text>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Section</Text>
                <Text style={styles.infoValue}>{sectionName}</Text>
              </View>
            </View>

            {user?.phone && (
              <>
                <View style={styles.infoDivider} />
                <View style={styles.infoRow}>
                  <Text style={styles.infoIcon}>📞</Text>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Phone</Text>
                    <Text style={styles.infoValue}>{user.phone}</Text>
                  </View>
                </View>
              </>
            )}

            {user?.email && (
              <>
                <View style={styles.infoDivider} />
                <View style={styles.infoRow}>
                  <Text style={styles.infoIcon}>✉️</Text>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Email</Text>
                    <Text style={styles.infoValue}>{user.email}</Text>
                  </View>
                </View>
              </>
            )}
          </View>
        </View>

        {/* Logout */}
        <View style={styles.logoutSection}>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <Text style={styles.logoutIcon}>🚪</Text>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
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
  backButton: {
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  backButtonText: {
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
  scrollView: {
    flex: 1,
  },
  profileHero: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: '#1e3a5f',
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f59e0b',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e3a5f',
  },
  profileName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  roleBadge: {
    backgroundColor: '#f59e0b',
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1e3a5f',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  infoSection: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  infoIcon: {
    fontSize: 20,
    marginRight: 14,
    width: 28,
    textAlign: 'center',
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '500',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
    color: '#1e293b',
    fontWeight: '600',
  },
  infoDivider: {
    height: 1,
    backgroundColor: '#f1f5f9',
  },
  logoutSection: {
    paddingHorizontal: 16,
    paddingTop: 32,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fee2e2',
    borderRadius: 12,
    paddingVertical: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  logoutIcon: {
    fontSize: 20,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#dc2626',
  },
});

export default ForemanProfileScreen;
