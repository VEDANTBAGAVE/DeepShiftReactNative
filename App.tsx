/**
 * DeepShift React Native App
 * Mining Shift Management System
 *
 * @format
 */

import React from 'react';
import { StatusBar } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import { WorkerProvider } from './src/context/WorkerContext';
import { ForemanProvider } from './src/context/ForemanContext';
import { AuthProvider } from './src/context/AuthContext';

const App = () => {
  return (
    <AuthProvider>
      <WorkerProvider>
        <ForemanProvider>
          <StatusBar barStyle="light-content" backgroundColor="#1e3a5f" />
          <AppNavigator />
        </ForemanProvider>
      </WorkerProvider>
    </AuthProvider>
  );
};

export default App;
