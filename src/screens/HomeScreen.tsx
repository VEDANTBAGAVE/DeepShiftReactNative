import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';

type HomeScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'HomeScreen'
>;

const HomeScreen = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();

  const navigateToManagerDashboard = () => {
    navigation.navigate('ManagerDashboard');
  };

  const navigateToOvermanDashboard = () => {
    navigation.navigate('OvermanDashboard');
  };

  const navigateToForemanDashboard = () => {
    navigation.navigate('ForemanDashboard');
  };

  const navigateToWorkerDashboard = () => {
    navigation.navigate('WorkerDashboard');
  };

  return (
    <View style={styles.container}>
      <View style={styles.surface}>
        <Text style={styles.title}>DEEPSHIFT</Text>
        <Text style={styles.subtitle}>Mining Shift Management System</Text>
        <Text style={styles.description}>Select Your Role</Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.buttonWorker]}
            onPress={navigateToWorkerDashboard}
          >
            <Text style={styles.buttonIcon}>👷</Text>
            <Text style={styles.buttonText}>Worker</Text>
            <Text style={styles.buttonDesc}>
              Mark Attendance & Report Incidents
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.buttonForeman]}
            onPress={navigateToForemanDashboard}
          >
            <Text style={styles.buttonIcon}>👨‍🔧</Text>
            <Text style={styles.buttonText}>Foreman</Text>
            <Text style={styles.buttonDesc}>Section In-Charge</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.buttonOverman]}
            onPress={navigateToOvermanDashboard}
          >
            <Text style={styles.buttonIcon}>👔</Text>
            <Text style={styles.buttonText}>Overman</Text>
            <Text style={styles.buttonDesc}>Supervisor / Shift In-Charge</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.buttonManager]}
            onPress={navigateToManagerDashboard}
          >
            <Text style={styles.buttonIcon}>⚡</Text>
            <Text style={styles.buttonText}>Manager</Text>
            <Text style={styles.buttonDesc}>Safety Officer / Mine Manager</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e3a5f',
    justifyContent: 'center',
    padding: 20,
  },
  surface: {
    padding: 28,
    borderRadius: 16,
    elevation: 8,
    alignItems: 'center',
    backgroundColor: 'white',
    width: '100%',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#1e3a5f',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e3a5f',
    marginBottom: 24,
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    flexDirection: 'column',
  },
  button: {
    paddingVertical: 18,
    paddingHorizontal: 20,
    marginBottom: 14,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 3,
    borderWidth: 2,
  },
  buttonWorker: {
    backgroundColor: '#f0f9ff',
    borderColor: '#3b82f6',
  },
  buttonForeman: {
    backgroundColor: '#fef3c7',
    borderColor: '#f59e0b',
  },
  buttonOverman: {
    backgroundColor: '#f3e8ff',
    borderColor: '#a855f7',
  },
  buttonManager: {
    backgroundColor: '#fef2f2',
    borderColor: '#ef4444',
  },
  buttonIcon: {
    fontSize: 28,
    marginBottom: 4,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e3a5f',
    marginBottom: 2,
  },
  buttonDesc: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
});

export default HomeScreen;
