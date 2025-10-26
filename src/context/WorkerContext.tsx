import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { storage, STORAGE_KEYS } from '../utils/storage';
import {
  WorkerState,
  AttendanceRecord,
  ShiftRecord,
  IncidentRecord,
  RemarkRecord,
  TaskRecord,
  AppSettings,
  AuditEntry,
} from '../types/worker';

interface WorkerContextType extends WorkerState {
  // Attendance
  addAttendance: (record: AttendanceRecord) => Promise<void>;
  getTodayAttendance: () => AttendanceRecord | null;

  // Shifts
  addShift: (shift: ShiftRecord) => Promise<void>;
  updateShift: (id: string, updates: Partial<ShiftRecord>) => Promise<void>;
  getShiftById: (id: string) => ShiftRecord | null;
  saveDraft: (draft: Partial<ShiftRecord>) => Promise<void>;
  clearDraft: () => Promise<void>;

  // Incidents
  addIncident: (incident: IncidentRecord) => Promise<void>;
  getTodayIncidents: () => IncidentRecord[];

  // Remarks
  markRemarkAsRead: (id: string) => Promise<void>;
  markAllRemarksAsRead: () => Promise<void>;
  getUnreadRemarksCount: () => number;

  // Tasks
  updateTask: (id: string, updates: Partial<TaskRecord>) => Promise<void>;
  getTodayTasks: () => TaskRecord[];

  // Settings
  updateSettings: (updates: Partial<AppSettings>) => Promise<void>;
  markTooltipShown: (tooltipId: string) => Promise<void>;

  // Demo data
  loadDemoData: () => Promise<void>;
  clearAllData: () => Promise<void>;

  // UI state
  isLoading: boolean;
}

const defaultSettings: AppSettings = {
  language: 'en',
  tooltipsShown: [],
  demoMode: false,
};

const WorkerContext = createContext<WorkerContextType | undefined>(undefined);

export const WorkerProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [state, setState] = useState<WorkerState>({
    attendance: [],
    shifts: [],
    incidents: [],
    remarks: [],
    tasks: [],
    settings: defaultSettings,
    draftShift: null,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Load all data on mount
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      const [attendance, shifts, incidents, remarks, tasks, settings, draft] =
        await Promise.all([
          storage.get<AttendanceRecord[]>(STORAGE_KEYS.ATTENDANCE),
          storage.get<ShiftRecord[]>(STORAGE_KEYS.SHIFTS),
          storage.get<IncidentRecord[]>(STORAGE_KEYS.INCIDENTS),
          storage.get<RemarkRecord[]>(STORAGE_KEYS.REMARKS),
          storage.get<TaskRecord[]>(STORAGE_KEYS.TASKS),
          storage.get<AppSettings>(STORAGE_KEYS.SETTINGS),
          storage.get<Partial<ShiftRecord>>(STORAGE_KEYS.DRAFT),
        ]);

      setState({
        attendance: attendance || [],
        shifts: shifts || [],
        incidents: incidents || [],
        remarks: remarks || [],
        tasks: tasks || [],
        settings: settings || defaultSettings,
        draftShift: draft || null,
      });
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper: Get today's date string
  const getTodayDate = () => new Date().toISOString().split('T')[0];

  // Attendance methods
  const addAttendance = async (record: AttendanceRecord) => {
    const newAttendance = [...state.attendance, record];
    await storage.set(STORAGE_KEYS.ATTENDANCE, newAttendance);
    setState(prev => ({ ...prev, attendance: newAttendance }));
  };

  const getTodayAttendance = () => {
    const today = getTodayDate();
    return state.attendance.find(a => a.date === today) || null;
  };

  // Shift methods
  const addShift = async (shift: ShiftRecord) => {
    const newShifts = [...state.shifts, shift];
    await storage.set(STORAGE_KEYS.SHIFTS, newShifts);
    setState(prev => ({ ...prev, shifts: newShifts }));
  };

  const updateShift = async (id: string, updates: Partial<ShiftRecord>) => {
    const newShifts = state.shifts.map(s =>
      s.id === id ? { ...s, ...updates, updatedAt: Date.now() } : s,
    );
    await storage.set(STORAGE_KEYS.SHIFTS, newShifts);
    setState(prev => ({ ...prev, shifts: newShifts }));
  };

  const getShiftById = (id: string) => {
    return state.shifts.find(s => s.id === id) || null;
  };

  const saveDraft = async (draft: Partial<ShiftRecord>) => {
    const draftWithTimestamp = { ...draft, lastSavedAt: Date.now() };
    await storage.set(STORAGE_KEYS.DRAFT, draftWithTimestamp);
    setState(prev => ({ ...prev, draftShift: draftWithTimestamp }));
  };

  const clearDraft = async () => {
    await storage.remove(STORAGE_KEYS.DRAFT);
    setState(prev => ({ ...prev, draftShift: null }));
  };

  // Incident methods
  const addIncident = async (incident: IncidentRecord) => {
    const newIncidents = [...state.incidents, incident];
    await storage.set(STORAGE_KEYS.INCIDENTS, newIncidents);
    setState(prev => ({ ...prev, incidents: newIncidents }));

    // If linked to shift, update shift's incident list
    if (incident.linkedShiftId) {
      const shift = state.shifts.find(s => s.id === incident.linkedShiftId);
      if (shift) {
        await updateShift(shift.id, {
          incidentIds: [...shift.incidentIds, incident.id],
        });
      }
    }
  };

  const getTodayIncidents = () => {
    const today = getTodayDate();
    return state.incidents.filter(i => {
      const incidentDate = new Date(i.createdAt).toISOString().split('T')[0];
      return incidentDate === today;
    });
  };

  // Remark methods
  const markRemarkAsRead = async (id: string) => {
    const newRemarks = state.remarks.map(r =>
      r.id === id ? { ...r, isRead: true } : r,
    );
    await storage.set(STORAGE_KEYS.REMARKS, newRemarks);
    setState(prev => ({ ...prev, remarks: newRemarks }));
  };

  const markAllRemarksAsRead = async () => {
    const newRemarks = state.remarks.map(r => ({ ...r, isRead: true }));
    await storage.set(STORAGE_KEYS.REMARKS, newRemarks);
    setState(prev => ({ ...prev, remarks: newRemarks }));
  };

  const getUnreadRemarksCount = () => {
    return state.remarks.filter(r => !r.isRead).length;
  };

  // Task methods
  const updateTask = async (id: string, updates: Partial<TaskRecord>) => {
    const newTasks = state.tasks.map(t =>
      t.id === id ? { ...t, ...updates } : t,
    );
    await storage.set(STORAGE_KEYS.TASKS, newTasks);
    setState(prev => ({ ...prev, tasks: newTasks }));
  };

  const getTodayTasks = () => {
    const today = getTodayDate();
    return state.tasks.filter(t => t.dueDate === today || !t.dueDate);
  };

  // Settings methods
  const updateSettings = async (updates: Partial<AppSettings>) => {
    const newSettings = { ...state.settings, ...updates };
    await storage.set(STORAGE_KEYS.SETTINGS, newSettings);
    setState(prev => ({ ...prev, settings: newSettings }));
  };

  const markTooltipShown = async (tooltipId: string) => {
    const newTooltips = [...state.settings.tooltipsShown, tooltipId];
    await updateSettings({ tooltipsShown: newTooltips });
  };

  // Demo data
  const loadDemoData = async () => {
    const today = getTodayDate();
    const yesterday = new Date(Date.now() - 86400000)
      .toISOString()
      .split('T')[0];

    const demoAttendance: AttendanceRecord[] = [
      {
        id: 'att-1',
        date: today,
        shiftType: 'morning',
        area: 'Panel 5',
        presenceStatus: 'present',
        confirmedAt: Date.now() - 3600000,
        createdAt: Date.now() - 3600000,
      },
    ];

    const demoShifts: ShiftRecord[] = [
      {
        id: 'shift-1',
        date: yesterday,
        shiftType: 'morning',
        area: 'Panel 5',
        status: 'submitted',
        presenceConfirmed: true,
        confirmedAt: Date.now() - 90000000,
        equipment: [
          {
            id: 'eq-1',
            name: 'Drill Machine #5',
            condition: 'operational',
            photos: [],
          },
        ],
        gasCH4: '0.5',
        ventilationStatus: 'ok',
        ppeChecklist: ['helmet', 'boots', 'gloves'],
        tasksDone: 'Drilling section A-12 completed',
        productionPercent: '95',
        attachments: [],
        incidentIds: [],
        createdAt: Date.now() - 90000000,
        updatedAt: Date.now() - 90000000,
        submittedAt: Date.now() - 86400000,
        auditLog: [
          {
            id: 'audit-1',
            action: 'create_shift',
            description: 'Shift log created',
            timestamp: Date.now() - 90000000,
          },
          {
            id: 'audit-2',
            action: 'confirm_presence',
            description: 'Presence confirmed',
            timestamp: Date.now() - 90000000,
          },
        ],
      },
    ];

    const demoRemarks: RemarkRecord[] = [
      {
        id: 'remark-1',
        from: 'Rajesh Kumar (Foreman)',
        linkedShiftId: 'shift-1',
        message:
          "Good work on yesterday's shift. Please ensure equipment photos are clear.",
        summary: 'Equipment photo quality note',
        isReopened: false,
        isRead: false,
        createdAt: Date.now() - 7200000,
      },
      {
        id: 'remark-2',
        from: 'Amit Singh (Foreman)',
        message: 'Safety briefing tomorrow at 8 AM. Please be on time.',
        summary: 'Safety briefing reminder',
        isReopened: false,
        isRead: false,
        createdAt: Date.now() - 3600000,
      },
    ];

    const demoTasks: TaskRecord[] = [
      {
        id: 'task-1',
        description: 'Inspect drill bits before starting',
        assignedBy: 'Rajesh Kumar',
        isDone: true,
        doneNote: 'Inspected and all good',
        dueDate: today,
        createdAt: Date.now() - 7200000,
      },
      {
        id: 'task-2',
        description: 'Check ventilation in section B-3',
        assignedBy: 'Rajesh Kumar',
        isDone: false,
        dueDate: today,
        createdAt: Date.now() - 7200000,
      },
      {
        id: 'task-3',
        description: 'Report any PPE damages',
        assignedBy: 'Safety Officer',
        isDone: false,
        dueDate: today,
        createdAt: Date.now() - 7200000,
      },
    ];

    await Promise.all([
      storage.set(STORAGE_KEYS.ATTENDANCE, demoAttendance),
      storage.set(STORAGE_KEYS.SHIFTS, demoShifts),
      storage.set(STORAGE_KEYS.REMARKS, demoRemarks),
      storage.set(STORAGE_KEYS.TASKS, demoTasks),
      updateSettings({ demoMode: true }),
    ]);

    setState(prev => ({
      ...prev,
      attendance: demoAttendance,
      shifts: demoShifts,
      remarks: demoRemarks,
      tasks: demoTasks,
    }));
  };

  const clearAllData = async () => {
    await Promise.all([
      storage.remove(STORAGE_KEYS.ATTENDANCE),
      storage.remove(STORAGE_KEYS.SHIFTS),
      storage.remove(STORAGE_KEYS.INCIDENTS),
      storage.remove(STORAGE_KEYS.REMARKS),
      storage.remove(STORAGE_KEYS.TASKS),
      storage.remove(STORAGE_KEYS.DRAFT),
    ]);

    setState(prev => ({
      ...prev,
      attendance: [],
      shifts: [],
      incidents: [],
      remarks: [],
      tasks: [],
      draftShift: null,
    }));

    await updateSettings({ demoMode: false });
  };

  return (
    <WorkerContext.Provider
      value={{
        ...state,
        addAttendance,
        getTodayAttendance,
        addShift,
        updateShift,
        getShiftById,
        saveDraft,
        clearDraft,
        addIncident,
        getTodayIncidents,
        markRemarkAsRead,
        markAllRemarksAsRead,
        getUnreadRemarksCount,
        updateTask,
        getTodayTasks,
        updateSettings,
        markTooltipShown,
        loadDemoData,
        clearAllData,
        isLoading,
      }}
    >
      {children}
    </WorkerContext.Provider>
  );
};

export const useWorker = () => {
  const context = useContext(WorkerContext);
  if (!context) {
    throw new Error('useWorker must be used within WorkerProvider');
  }
  return context;
};
