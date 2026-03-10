import React from 'react';
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

type WorkerSettingsNavigationProp = StackNavigationProp<RootStackParamList>;

const WorkerSettingsScreen: React.FC = () => {
  const navigation = useNavigation<WorkerSettingsNavigationProp>();
  const { logout } = useAuth();

  const [language, setLanguage] = React.useState<'en' | 'hi' | 'mr'>('en');

  const handleLanguageChange = (lang: 'en' | 'hi' | 'mr') => {
    setLanguage(lang);
    Alert.alert('Language Changed', `Language set to ${lang.toUpperCase()}`);
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => logout() },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Settings</Text>
        </View>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Language */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🌐 Language</Text>
          <View style={styles.languageGrid}>
            {[
              { code: 'en', label: 'English' },
              { code: 'hi', label: 'हिंदी (Hindi)' },
              { code: 'mr', label: 'मराठी (Marathi)' },
            ].map(lang => (
              <TouchableOpacity
                key={lang.code}
                style={[
                  styles.languageButton,
                  language === lang.code && styles.languageButtonActive,
                ]}
                onPress={() =>
                  handleLanguageChange(lang.code as 'en' | 'hi' | 'mr')
                }
              >
                <Text
                  style={[
                    styles.languageButtonText,
                    language === lang.code && styles.languageButtonTextActive,
                  ]}
                >
                  {lang.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Account */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔐 Account</Text>
          <TouchableOpacity
            style={styles.actionButtonDanger}
            onPress={handleSignOut}
          >
            <Text style={styles.actionButtonIcon}>🚪</Text>
            <Text style={styles.actionButtonTextDanger}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        {/* Help */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>❓ Help</Text>
          <TouchableOpacity style={styles.helpButton}>
            <Text style={styles.helpButtonText}>
              📷 Camera Permission Guide
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.helpButton}>
            <Text style={styles.helpButtonText}>📖 How to Use This App</Text>
          </TouchableOpacity>
        </View>

        {/* About */}
        <View style={styles.aboutSection}>
          <Text style={styles.aboutText}>DEEPSHIFT v1.0</Text>
          <Text style={styles.aboutSubtext}>
            Mining Shift Management System
          </Text>
        </View>
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
  headerPlaceholder: {
    width: 60,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  languageGrid: {
    gap: 10,
  },
  languageButton: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    backgroundColor: '#f8fafc',
  },
  languageButtonActive: {
    backgroundColor: '#1e3a5f',
    borderColor: '#1e3a5f',
  },
  languageButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#64748b',
    textAlign: 'center',
  },
  languageButtonTextActive: {
    color: '#fff',
  },
  demoBanner: {
    backgroundColor: '#fef3c7',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  demoBannerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400e',
    textAlign: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10b981',
    paddingVertical: 14,
    borderRadius: 10,
    marginBottom: 10,
    gap: 8,
  },
  actionButtonDanger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ef4444',
    paddingVertical: 14,
    borderRadius: 10,
    gap: 8,
  },
  actionButtonIcon: {
    fontSize: 18,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  actionButtonTextDanger: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  helpButton: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    marginBottom: 10,
  },
  helpButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#475569',
  },
  aboutSection: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  aboutText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  aboutSubtext: {
    fontSize: 13,
    color: '#64748b',
  },
});

export default WorkerSettingsScreen;
