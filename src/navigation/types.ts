export type RootStackParamList = {
  LoginScreen: undefined;
  RegisterScreen: undefined;
  WorkerDashboard: undefined;
  ForemanDashboard: undefined;
  OvermanDashboard: undefined;
  SupervisorDashboard: undefined;
  AdminDashboard: undefined;
  ManagerDashboard: undefined;
  ResetPasswordScreen: undefined;
  MainScreen: undefined;
  HomeScreen: undefined;
  ProfileScreen: undefined;
  SettingsScreen: undefined;
  NewShiftLogScreen: undefined;
  // Worker module screens
  MarkAttendanceScreen: undefined;
  ReportIncidentScreen: undefined;
  NewShiftScreen: undefined;
  ShiftHistoryScreen: undefined;
  ShiftDetailScreen: { shiftId: string };
  SupervisorRemarksScreen: undefined;
  ViewTasksScreen: undefined;
  WorkerSettingsScreen: undefined;
  // Foreman module screens
  WorkerListScreen: undefined;
  WorkerProfileSheet: { workerId: string };
  CreateTaskScreen: { selectedWorkers?: string[] };
  CreateRemarkScreen: { workerId: string };
  SectionReportScreen: { reportId?: string };
  SectionIncidentsScreen: undefined;
  SubmittedReportsScreen: undefined;
  NotificationsScreen: undefined;
  ForemanProfileScreen: undefined;
};
