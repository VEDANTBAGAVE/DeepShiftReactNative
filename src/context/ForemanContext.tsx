import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { storage } from '../utils/storage';
import {
  ForemanState,
  Worker,
  SectionReport,
  Notification,
  TaskAssignment,
  RemarkMessage,
  AttendanceStatus,
  ForemanProfile,
  AppSettings,
  IncidentRecord,
  AuditEntry,
  TaskPriority,
  TaskCategory,
  NotificationType,
} from '../types/worker';

const FOREMAN_STORAGE_KEYS = {
  WORKERS: '@foreman_workers',
  REPORTS: '@foreman_reports',
  NOTIFICATIONS: '@foreman_notifications',
  DRAFT_REPORT: '@foreman_draft_report',
  PROFILE: '@foreman_profile',
};

interface ForemanContextType extends ForemanState {
  // Workers
  getWorkers: (filters?: {
    section?: string;
    status?: AttendanceStatus;
    search?: string;
  }) => Worker[];
  getWorkerById: (id: string) => Worker | null;
  updateWorkerAttendance: (
    workerId: string,
    status: AttendanceStatus,
    reason?: string,
  ) => Promise<void>;
  bulkUpdateAttendance: (
    workerIds: string[],
    status: AttendanceStatus,
    reason?: string,
  ) => Promise<void>;

  // Tasks
  createTask: (task: Omit<TaskAssignment, 'id' | 'createdAt'>) => Promise<void>;
  assignTaskToWorkers: (
    task: Omit<TaskAssignment, 'id' | 'createdAt'>,
    workerIds: string[],
  ) => Promise<void>;

  // Remarks
  addRemark: (remark: Omit<RemarkMessage, 'id' | 'createdAt'>) => Promise<void>;

  // Section Reports
  createSectionReport: (
    report: Omit<SectionReport, 'id' | 'createdAt' | 'updatedAt' | 'auditLog'>,
  ) => Promise<string>;
  updateSectionReport: (
    id: string,
    updates: Partial<SectionReport>,
  ) => Promise<void>;
  getSectionReportById: (id: string) => SectionReport | null;
  saveDraftReport: (draft: Partial<SectionReport>) => Promise<void>;
  clearDraftReport: () => Promise<void>;
  submitSectionReport: (id: string) => Promise<void>;
  validateSectionReport: (report: Partial<SectionReport>) => {
    errors: string[];
    warnings: string[];
    canSubmit: boolean;
  };

  // Incidents (extend worker context)
  addIncident: (
    incident: Omit<IncidentRecord, 'id' | 'createdAt'>,
  ) => Promise<void>;
  updateIncidentStatus: (
    id: string,
    status: string,
    note?: string,
  ) => Promise<void>;

  // Notifications
  addNotification: (
    notification: Omit<Notification, 'id' | 'createdAt'>,
  ) => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  getUnreadNotificationsCount: () => number;

  // Dashboard KPIs
  getDashboardStats: () => {
    totalWorkers: number;
    presentWorkers: number;
    absentWorkers: number;
    attendancePercentage: number;
    openIncidents: number;
    pendingReports: number;
    reopenedReports: number;
    unreadNotifications: number;
  };

  // Profile
  profile: ForemanProfile | null;
  updateProfile: (updates: Partial<ForemanProfile>) => Promise<void>;

  // Demo data
  loadDemoData: () => Promise<void>;
  clearAllData: () => Promise<void>;

  isLoading: boolean;
}

const defaultProfile: ForemanProfile = {
  id: 'foreman-1',
  name: 'Rajesh Kumar',
  employeeId: 'FM001',
  sections: ['Panel 5-A', 'Panel 5-B'],
  contactNumber: '+91 98765 43210',
  email: 'rajesh.kumar@deepshift.com',
};

const ForemanContext = createContext<ForemanContextType | undefined>(undefined);

export const ForemanProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [state, setState] = useState<ForemanState>({
    workers: [],
    sectionReports: [],
    notifications: [],
    draftReport: null,
  });
  const [profile, setProfile] = useState<ForemanProfile | null>(defaultProfile);
  const [isLoading, setIsLoading] = useState(true);

  // Load all data on mount
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      const [workers, reports, notifications, draft, profileData] =
        await Promise.all([
          storage.get<Worker[]>(FOREMAN_STORAGE_KEYS.WORKERS),
          storage.get<SectionReport[]>(FOREMAN_STORAGE_KEYS.REPORTS),
          storage.get<Notification[]>(FOREMAN_STORAGE_KEYS.NOTIFICATIONS),
          storage.get<Partial<SectionReport>>(
            FOREMAN_STORAGE_KEYS.DRAFT_REPORT,
          ),
          storage.get<ForemanProfile>(FOREMAN_STORAGE_KEYS.PROFILE),
        ]);

      // If no workers exist, load demo data automatically
      if (!workers || workers.length === 0) {
        console.log('No workers found, loading demo data...');
        await loadDemoDataInternal();
        return; // loadDemoDataInternal will set state
      }

      setState({
        workers: workers || [],
        sectionReports: reports || [],
        notifications: notifications || [],
        draftReport: draft || null,
      });
      setProfile(profileData || defaultProfile);
    } catch (error) {
      console.error('Error loading foreman data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper: Get today's date string
  const getTodayDate = () => new Date().toISOString().split('T')[0];

  // ==================== WORKERS ====================

  const getWorkers = (filters?: {
    section?: string;
    status?: AttendanceStatus;
    search?: string;
  }) => {
    let filtered = [...state.workers];

    if (filters?.section) {
      filtered = filtered.filter(w => w.section === filters.section);
    }

    if (filters?.status) {
      filtered = filtered.filter(
        w => (w.todayAttendance || 'not-marked') === filters.status,
      );
    }

    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        w =>
          w.name.toLowerCase().includes(searchLower) ||
          w.employeeId.toLowerCase().includes(searchLower),
      );
    }

    return filtered;
  };

  const getWorkerById = (id: string) => {
    return state.workers.find(w => w.id === id) || null;
  };

  const updateWorkerAttendance = async (
    workerId: string,
    status: AttendanceStatus,
    reason?: string,
  ) => {
    const newWorkers = state.workers.map(w =>
      w.id === workerId
        ? {
            ...w,
            todayAttendance: status,
            attendanceMarkedAt: Date.now(),
            attendanceReason: reason,
            lastActivityAt: Date.now(),
          }
        : w,
    );
    await storage.set(FOREMAN_STORAGE_KEYS.WORKERS, newWorkers);
    setState(prev => ({ ...prev, workers: newWorkers }));
  };

  const bulkUpdateAttendance = async (
    workerIds: string[],
    status: AttendanceStatus,
    reason?: string,
  ) => {
    const timestamp = Date.now();
    const newWorkers = state.workers.map(w =>
      workerIds.includes(w.id)
        ? {
            ...w,
            todayAttendance: status,
            attendanceMarkedAt: timestamp,
            attendanceReason: reason,
            lastActivityAt: timestamp,
          }
        : w,
    );
    await storage.set(FOREMAN_STORAGE_KEYS.WORKERS, newWorkers);
    setState(prev => ({ ...prev, workers: newWorkers }));
  };

  // ==================== TASKS ====================

  const createTask = async (task: Omit<TaskAssignment, 'id' | 'createdAt'>) => {
    // This would be stored in WorkerContext tasks array
    // For now, just update worker task counts
    const workerIds = task.assignedTo || [];
    const newWorkers = state.workers.map(w =>
      workerIds.includes(w.id)
        ? { ...w, openTasksCount: w.openTasksCount + 1 }
        : w,
    );
    await storage.set(FOREMAN_STORAGE_KEYS.WORKERS, newWorkers);
    setState(prev => ({ ...prev, workers: newWorkers }));

    // Create notification for each worker
    for (const workerId of workerIds) {
      const worker = state.workers.find(w => w.id === workerId);
      if (worker) {
        await addNotification({
          type: 'task',
          title: 'New Task Assigned',
          message: `${task.description}`,
          isRead: false,
          linkedEntityId: workerId,
          linkedEntityType: 'task',
          severity: 'info',
          from: profile?.name || 'Foreman',
        });
      }
    }
  };

  const assignTaskToWorkers = async (
    task: Omit<TaskAssignment, 'id' | 'createdAt'>,
    workerIds: string[],
  ) => {
    await createTask({ ...task, assignedTo: workerIds });
  };

  // ==================== REMARKS ====================

  const addRemark = async (remark: Omit<RemarkMessage, 'id' | 'createdAt'>) => {
    // Store in WorkerContext remarks array
    // For now, create notification
    if (remark.linkedWorkerId) {
      await addNotification({
        type: 'remark',
        title:
          remark.severity === 'warning' ? '⚠️ Important Remark' : 'New Remark',
        message: remark.message,
        isRead: false,
        linkedEntityId: remark.linkedWorkerId,
        linkedEntityType: 'worker',
        severity: remark.severity || 'info',
        from: profile?.name || 'Foreman',
      });
    }
  };

  // ==================== SECTION REPORTS ====================

  const validateSectionReport = (report: Partial<SectionReport>) => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Required fields
    if (!report.gasCH4) {
      errors.push('Gas CH4 reading is required');
    }
    if (!report.ventilationStatus) {
      errors.push('Ventilation status is required');
    }
    if (!report.equipment || report.equipment.length === 0) {
      warnings.push('No equipment recorded');
    }

    // Equipment validation
    const nonOperationalEquipment = (report.equipment || []).filter(
      eq => eq.condition !== 'operational',
    );
    if (nonOperationalEquipment.length > 0) {
      const missingPhotos = nonOperationalEquipment.filter(
        eq => eq.photos.length === 0,
      );
      if (missingPhotos.length > 0) {
        errors.push(
          `${missingPhotos.length} non-operational equipment item(s) missing photo evidence`,
        );
      }
    }

    // Crew summary validation
    if (
      report.totalWorkers &&
      report.presentCount !== undefined &&
      report.absentCount !== undefined
    ) {
      const total =
        report.presentCount + report.absentCount + (report.tardyCount || 0);
      if (total !== report.totalWorkers) {
        warnings.push('Attendance counts do not match total workers');
      }
    }

    const canSubmit = errors.length === 0;

    return { errors, warnings, canSubmit };
  };

  const createSectionReport = async (
    report: Omit<SectionReport, 'id' | 'createdAt' | 'updatedAt' | 'auditLog'>,
  ) => {
    const validation = validateSectionReport(report);
    const now = Date.now();
    const newReport: SectionReport = {
      ...report,
      id: `report-${now}`,
      createdAt: now,
      updatedAt: now,
      validationErrors: validation.errors,
      validationWarnings: validation.warnings,
      canSubmit: validation.canSubmit,
      auditLog: [
        {
          id: `audit-${now}`,
          action: 'create_shift',
          description: 'Section report created',
          timestamp: now,
        },
      ],
    };

    const newReports = [...state.sectionReports, newReport];
    await storage.set(FOREMAN_STORAGE_KEYS.REPORTS, newReports);
    setState(prev => ({ ...prev, sectionReports: newReports }));
    return newReport.id;
  };

  const updateSectionReport = async (
    id: string,
    updates: Partial<SectionReport>,
  ) => {
    const validation = validateSectionReport(updates);
    const newReports = state.sectionReports.map(r =>
      r.id === id
        ? {
            ...r,
            ...updates,
            updatedAt: Date.now(),
            lastSavedAt: Date.now(),
            validationErrors: validation.errors,
            validationWarnings: validation.warnings,
            canSubmit: validation.canSubmit,
          }
        : r,
    );
    await storage.set(FOREMAN_STORAGE_KEYS.REPORTS, newReports);
    setState(prev => ({ ...prev, sectionReports: newReports }));
  };

  const getSectionReportById = (id: string) => {
    return state.sectionReports.find(r => r.id === id) || null;
  };

  const saveDraftReport = async (draft: Partial<SectionReport>) => {
    const draftWithTimestamp = { ...draft, lastSavedAt: Date.now() };
    await storage.set(FOREMAN_STORAGE_KEYS.DRAFT_REPORT, draftWithTimestamp);
    setState(prev => ({ ...prev, draftReport: draftWithTimestamp }));
  };

  const clearDraftReport = async () => {
    await storage.remove(FOREMAN_STORAGE_KEYS.DRAFT_REPORT);
    setState(prev => ({ ...prev, draftReport: null }));
  };

  const submitSectionReport = async (id: string) => {
    const report = getSectionReportById(id);
    if (!report) return;

    const validation = validateSectionReport(report);
    if (!validation.canSubmit) {
      throw new Error('Cannot submit report with validation errors');
    }

    const now = Date.now();
    const auditEntry: AuditEntry = {
      id: `audit-${now}`,
      action: 'update_shift',
      description: 'Report submitted for review',
      timestamp: now,
    };

    const newReports = state.sectionReports.map(r =>
      r.id === id
        ? {
            ...r,
            status: 'pending' as const,
            submittedAt: now,
            updatedAt: now,
            auditLog: [...r.auditLog, auditEntry],
          }
        : r,
    );
    await storage.set(FOREMAN_STORAGE_KEYS.REPORTS, newReports);
    setState(prev => ({ ...prev, sectionReports: newReports }));

    // Create notification
    await addNotification({
      type: 'report-status',
      title: 'Report Submitted',
      message: `Section report for ${report.section} submitted for review`,
      isRead: false,
      linkedEntityId: id,
      linkedEntityType: 'report',
      severity: 'info',
    });
  };

  // ==================== INCIDENTS ====================

  const addIncident = async (
    incident: Omit<IncidentRecord, 'id' | 'createdAt'>,
  ) => {
    // Would integrate with WorkerContext addIncident
    // For now, just create notification
    await addNotification({
      type: 'incident',
      title: `${incident.severity.toUpperCase()} Severity Incident`,
      message: incident.description.substring(0, 100),
      isRead: false,
      linkedEntityId: incident.linkedShiftId,
      linkedEntityType: 'incident',
      severity: incident.severity === 'high' ? 'urgent' : 'warning',
      from: profile?.name || 'Foreman',
    });
  };

  const updateIncidentStatus = async (
    id: string,
    status: string,
    note?: string,
  ) => {
    // Would integrate with WorkerContext incidents
    console.log('Update incident status:', id, status, note);
  };

  // ==================== NOTIFICATIONS ====================

  const addNotification = async (
    notification: Omit<Notification, 'id' | 'createdAt'>,
  ) => {
    const newNotification: Notification = {
      ...notification,
      id: `notif-${Date.now()}-${Math.random()}`,
      createdAt: Date.now(),
    };
    const newNotifications = [...state.notifications, newNotification];
    await storage.set(FOREMAN_STORAGE_KEYS.NOTIFICATIONS, newNotifications);
    setState(prev => ({ ...prev, notifications: newNotifications }));
  };

  const markNotificationRead = async (id: string) => {
    const newNotifications = state.notifications.map(n =>
      n.id === id ? { ...n, isRead: true } : n,
    );
    await storage.set(FOREMAN_STORAGE_KEYS.NOTIFICATIONS, newNotifications);
    setState(prev => ({ ...prev, notifications: newNotifications }));
  };

  const markAllNotificationsRead = async () => {
    const newNotifications = state.notifications.map(n => ({
      ...n,
      isRead: true,
    }));
    await storage.set(FOREMAN_STORAGE_KEYS.NOTIFICATIONS, newNotifications);
    setState(prev => ({ ...prev, notifications: newNotifications }));
  };

  const getUnreadNotificationsCount = () => {
    return state.notifications.filter(n => !n.isRead).length;
  };

  // ==================== DASHBOARD KPIs ====================

  const getDashboardStats = () => {
    const totalWorkers = state.workers.length;
    const presentWorkers = state.workers.filter(
      w => w.todayAttendance === 'present',
    ).length;
    const absentWorkers = state.workers.filter(
      w => w.todayAttendance === 'absent',
    ).length;
    const attendancePercentage =
      totalWorkers > 0 ? Math.round((presentWorkers / totalWorkers) * 100) : 0;

    // Count incidents from workers
    const openIncidents = state.workers.reduce(
      (sum, w) => sum + w.recentIncidentsCount,
      0,
    );

    const pendingReports = state.sectionReports.filter(
      r => r.status === 'pending',
    ).length;
    const reopenedReports = state.sectionReports.filter(
      r => r.status === 'reopened',
    ).length;
    const unreadNotifications = getUnreadNotificationsCount();

    return {
      totalWorkers,
      presentWorkers,
      absentWorkers,
      attendancePercentage,
      openIncidents,
      pendingReports,
      reopenedReports,
      unreadNotifications,
    };
  };

  // ==================== PROFILE ====================

  const updateProfile = async (updates: Partial<ForemanProfile>) => {
    const newProfile = { ...profile!, ...updates };
    await storage.set(FOREMAN_STORAGE_KEYS.PROFILE, newProfile);
    setProfile(newProfile);
  };

  // ==================== DEMO DATA ====================

  const loadDemoDataInternal = async () => {
    const demoWorkers: Worker[] = [
      {
        id: 'worker-1',
        name: 'Ramesh Sharma',
        employeeId: 'W001',
        role: 'Drill Operator',
        section: 'Panel 5-A',
        contactNumber: '+91 98765 00001',
        todayAttendance: 'present',
        attendanceMarkedAt: Date.now() - 7200000,
        openTasksCount: 2,
        recentIncidentsCount: 0,
        lastActivityAt: Date.now() - 3600000,
      },
      {
        id: 'worker-2',
        name: 'Suresh Patel',
        employeeId: 'W002',
        role: 'Helper',
        section: 'Panel 5-A',
        todayAttendance: 'present',
        attendanceMarkedAt: Date.now() - 7200000,
        openTasksCount: 1,
        recentIncidentsCount: 0,
        lastActivityAt: Date.now() - 1800000,
      },
      {
        id: 'worker-3',
        name: 'Vijay Kumar',
        employeeId: 'W003',
        role: 'Safety Inspector',
        section: 'Panel 5-A',
        todayAttendance: 'absent',
        attendanceReason: 'Sick leave',
        openTasksCount: 0,
        recentIncidentsCount: 0,
        lastActivityAt: Date.now() - 86400000,
      },
      {
        id: 'worker-4',
        name: 'Arjun Singh',
        employeeId: 'W004',
        role: 'Electrician',
        section: 'Panel 5-A',
        todayAttendance: 'present',
        attendanceMarkedAt: Date.now() - 7200000,
        openTasksCount: 3,
        recentIncidentsCount: 1,
        lastActivityAt: Date.now() - 900000,
      },
      {
        id: 'worker-5',
        name: 'Prakash Yadav',
        employeeId: 'W005',
        role: 'Drill Operator',
        section: 'Panel 5-A',
        todayAttendance: 'present',
        attendanceMarkedAt: Date.now() - 7200000,
        openTasksCount: 1,
        recentIncidentsCount: 0,
        lastActivityAt: Date.now() - 5400000,
      },
      {
        id: 'worker-6',
        name: 'Mohan Das',
        employeeId: 'W006',
        role: 'Helper',
        section: 'Panel 5-A',
        todayAttendance: 'tardy',
        attendanceMarkedAt: Date.now() - 3600000,
        attendanceReason: 'Late arrival',
        openTasksCount: 1,
        recentIncidentsCount: 0,
        lastActivityAt: Date.now() - 3600000,
      },
      {
        id: 'worker-7',
        name: 'Rajesh Verma',
        employeeId: 'W007',
        role: 'Machine Operator',
        section: 'Panel 5-A',
        todayAttendance: 'not-marked',
        openTasksCount: 2,
        recentIncidentsCount: 0,
        lastActivityAt: Date.now() - 86400000,
      },
      {
        id: 'worker-8',
        name: 'Kiran Reddy',
        employeeId: 'W008',
        role: 'Safety Officer',
        section: 'Panel 5-A',
        todayAttendance: 'present',
        attendanceMarkedAt: Date.now() - 7200000,
        openTasksCount: 0,
        recentIncidentsCount: 0,
        lastActivityAt: Date.now() - 7200000,
      },
    ];

    const demoNotifications: Notification[] = [
      {
        id: 'notif-1',
        type: 'remark',
        title: 'Report Reopened',
        message:
          'Your section report for Panel 5-A has been reopened. Please add gas readings.',
        isRead: false,
        createdAt: Date.now() - 3600000,
        linkedEntityId: 'report-1',
        linkedEntityType: 'report',
        severity: 'warning',
        from: 'Overman Amit',
      },
      {
        id: 'notif-2',
        type: 'safety',
        title: 'Safety Alert',
        message: 'Mandatory PPE inspection scheduled for tomorrow 9 AM.',
        isRead: false,
        createdAt: Date.now() - 7200000,
        severity: 'info',
        from: 'Safety Department',
      },
      {
        id: 'notif-3',
        type: 'report-status',
        title: 'Report Acknowledged',
        message: 'Your section report for yesterday has been acknowledged.',
        isRead: true,
        createdAt: Date.now() - 86400000,
        linkedEntityId: 'report-0',
        linkedEntityType: 'report',
        severity: 'info',
        from: 'Overman Amit',
      },
    ];

    await Promise.all([
      storage.set(FOREMAN_STORAGE_KEYS.WORKERS, demoWorkers),
      storage.set(FOREMAN_STORAGE_KEYS.NOTIFICATIONS, demoNotifications),
    ]);

    setState(prev => ({
      ...prev,
      workers: demoWorkers,
      notifications: demoNotifications,
    }));
  };

  // Public function to reload demo data (can be called from screens)
  const loadDemoData = async () => {
    setIsLoading(true);
    try {
      await loadDemoDataInternal();
    } catch (error) {
      console.error('Error loading demo data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearAllData = async () => {
    await Promise.all([
      storage.remove(FOREMAN_STORAGE_KEYS.WORKERS),
      storage.remove(FOREMAN_STORAGE_KEYS.REPORTS),
      storage.remove(FOREMAN_STORAGE_KEYS.NOTIFICATIONS),
      storage.remove(FOREMAN_STORAGE_KEYS.DRAFT_REPORT),
    ]);

    setState({
      workers: [],
      sectionReports: [],
      notifications: [],
      draftReport: null,
    });
  };

  return (
    <ForemanContext.Provider
      value={{
        ...state,
        profile,
        getWorkers,
        getWorkerById,
        updateWorkerAttendance,
        bulkUpdateAttendance,
        createTask,
        assignTaskToWorkers,
        addRemark,
        createSectionReport,
        updateSectionReport,
        getSectionReportById,
        saveDraftReport,
        clearDraftReport,
        submitSectionReport,
        validateSectionReport,
        addIncident,
        updateIncidentStatus,
        addNotification,
        markNotificationRead,
        markAllNotificationsRead,
        getUnreadNotificationsCount,
        getDashboardStats,
        updateProfile,
        loadDemoData,
        clearAllData,
        isLoading,
      }}
    >
      {children}
    </ForemanContext.Provider>
  );
};

export const useForeman = () => {
  const context = useContext(ForemanContext);
  if (!context) {
    throw new Error('useForeman must be used within ForemanProvider');
  }
  return context;
};
