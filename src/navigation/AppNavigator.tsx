import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { RootStackParamList } from './types';

// Import screens
import LoginScreen from '../screens/LoginScreen';
import WorkerDashboard from '../screens/WorkerDashboard';
import ForemanDashboard from '../screens/ForemanDashboard';
import OvermanDashboard from '../screens/OvermanDashboard';
import SupervisorDashboard from '../screens/SupervisorDashboard';
import ManagerDashboard from '../screens/ManagerDashboard';
import ResetPasswordScreen from '../screens/ResetPasswordScreen';
import HomeScreen from '../screens/HomeScreen';
import NewShiftLogScreen from '../screens/NewShiftLogScreen';

// Worker module screens
import MarkAttendanceScreen from '../screens/worker/MarkAttendanceScreen';
import ReportIncidentScreen from '../screens/worker/ReportIncidentScreen';
import NewShiftScreen from '../screens/worker/NewShiftScreen';
import ShiftHistoryScreen from '../screens/worker/ShiftHistoryScreen';
import ShiftDetailScreen from '../screens/worker/ShiftDetailScreen';
import SupervisorRemarksScreen from '../screens/worker/SupervisorRemarksScreen';
import ViewTasksScreen from '../screens/worker/ViewTasksScreen';
import WorkerSettingsScreen from '../screens/worker/WorkerSettingsScreen';

// Foreman module screens
import WorkerListScreen from '../screens/foreman/WorkerListScreen';
import WorkerProfileSheet from '../screens/foreman/WorkerProfileSheet';
import CreateTaskScreen from '../screens/foreman/CreateTaskScreen';
import CreateRemarkScreen from '../screens/foreman/CreateRemarkScreen';
import SectionReportScreen from '../screens/foreman/SectionReportScreen';
import SectionIncidentsScreen from '../screens/foreman/SectionIncidentsScreen';
import SubmittedReportsScreen from '../screens/foreman/SubmittedReportsScreen';
import NotificationsScreen from '../screens/foreman/NotificationsScreen';
import ForemanProfileScreen from '../screens/foreman/ForemanProfileScreen';

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="HomeScreen"
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: '#f6f7fb' },
        }}
      >
        <Stack.Screen name="LoginScreen" component={LoginScreen} />
        <Stack.Screen name="HomeScreen" component={HomeScreen} />
        <Stack.Screen name="WorkerDashboard" component={WorkerDashboard} />
        <Stack.Screen name="ForemanDashboard" component={ForemanDashboard} />
        <Stack.Screen name="OvermanDashboard" component={OvermanDashboard} />
        <Stack.Screen
          name="SupervisorDashboard"
          component={SupervisorDashboard}
        />
        <Stack.Screen name="ManagerDashboard" component={ManagerDashboard} />
        <Stack.Screen
          name="ResetPasswordScreen"
          component={ResetPasswordScreen}
        />
        <Stack.Screen name="NewShiftLogScreen" component={NewShiftLogScreen} />

        {/* Worker module screens */}
        <Stack.Screen
          name="MarkAttendanceScreen"
          component={MarkAttendanceScreen}
        />
        <Stack.Screen
          name="ReportIncidentScreen"
          component={ReportIncidentScreen}
        />
        <Stack.Screen name="NewShiftScreen" component={NewShiftScreen} />
        <Stack.Screen
          name="ShiftHistoryScreen"
          component={ShiftHistoryScreen}
        />
        <Stack.Screen name="ShiftDetailScreen" component={ShiftDetailScreen} />
        <Stack.Screen
          name="SupervisorRemarksScreen"
          component={SupervisorRemarksScreen}
        />
        <Stack.Screen name="ViewTasksScreen" component={ViewTasksScreen} />
        <Stack.Screen
          name="WorkerSettingsScreen"
          component={WorkerSettingsScreen}
        />

        {/* Foreman module screens */}
        <Stack.Screen name="WorkerListScreen" component={WorkerListScreen} />
        <Stack.Screen
          name="WorkerProfileSheet"
          component={WorkerProfileSheet}
          options={{
            presentation: 'modal',
            headerShown: false,
          }}
        />
        <Stack.Screen name="CreateTaskScreen" component={CreateTaskScreen} />
        <Stack.Screen
          name="CreateRemarkScreen"
          component={CreateRemarkScreen}
        />
        <Stack.Screen
          name="SectionReportScreen"
          component={SectionReportScreen}
        />
        <Stack.Screen
          name="SectionIncidentsScreen"
          component={SectionIncidentsScreen}
        />
        <Stack.Screen
          name="SubmittedReportsScreen"
          component={SubmittedReportsScreen}
        />
        <Stack.Screen
          name="NotificationsScreen"
          component={NotificationsScreen}
        />
        <Stack.Screen
          name="ForemanProfileScreen"
          component={ForemanProfileScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
