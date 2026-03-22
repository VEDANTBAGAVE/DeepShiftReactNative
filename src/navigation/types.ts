export type RootStackParamList = {
  LoginScreen: undefined;
  WorkerDashboard: undefined;
  ForemanDashboard: undefined;
  OvermanDashboard: undefined;
  SupervisorDashboard: undefined;
  ManagerDashboard: undefined;
  ResetPasswordScreen: undefined;
  HomeScreen: undefined;
  NewShiftLogScreen: undefined;
  // Worker module screens
  MarkAttendanceScreen: undefined;
  ReportIncidentScreen: undefined;
  NewShiftScreen: undefined;
  ShiftHistoryScreen: undefined;
  ShiftDetailScreen: { shiftId: string };
  SupervisorRemarksScreen: undefined;
  ViewTasksScreen: undefined;
  WorkerFeedbackScreen: undefined;
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
  // Overman module screens
  SectionReportsScreen: undefined;
  SafetyOverviewScreen: undefined;
  CreateShiftLogScreen: undefined;
  SubmittedLogsScreen: undefined;
  SectionSummaryScreen: undefined;
  ReviewSectionReportScreen: { sectionId?: string; reportId?: string };
  RemarksPanelScreen: undefined;
  OvermanProfileScreen: undefined;
  FeedbackReviewScreen: undefined;

  // Manager module screens
  ShiftReportsOverview: undefined;
  ShiftLogDetail: { reportId?: string };
  SafetyAnalytics: undefined;
  EquipmentOverview: undefined;
  CrewPerformance: undefined;
  CommunicationPanel: undefined;
  ReportsArchive: undefined;
};
