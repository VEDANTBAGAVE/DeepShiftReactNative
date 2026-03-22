import { useState, useEffect, useCallback } from 'react';
import { shiftService } from '../services/shiftService';
import { workerLogService } from '../services/workerLogService';
import { incidentService } from '../services/incidentService';
import { equipmentService } from '../services/equipmentService';
import { userService } from '../services/userService';
import { useAuth } from '../context/AuthContext';
import {
  Shift,
  ShiftWithRelations,
  WorkerShiftLog,
  IncidentReport,
  EquipmentLog,
  User,
} from '../types/database';

interface DashboardStats {
  workersPresent: number;
  workersAbsent: number;
  totalWorkers: number;
  pendingIncidents: number;
  highSeverityIncidents: number;
  faultyEquipment: number;
  shiftsToday: number;
}

interface WorkerDashboardData {
  currentShift: Shift | null;
  workerLog: WorkerShiftLog | null;
  todayIncidents: IncidentReport[];
  isLoading: boolean;
  error: Error | null;
  refreshData: () => Promise<void>;
  checkIn: () => Promise<void>;
  checkOut: () => Promise<void>;
  submitLog: (tasksPerformed: string) => Promise<void>;
  reportIncident: (
    incident: Omit<
      IncidentReport,
      'id' | 'created_at' | 'updated_at' | 'is_resolved'
    >,
  ) => Promise<void>;
}

/**
 * Hook for Worker Dashboard data
 */
export function useWorkerDashboard(): WorkerDashboardData {
  const { user } = useAuth();
  const [currentShift, setCurrentShift] = useState<Shift | null>(null);
  const [workerLog, setWorkerLog] = useState<WorkerShiftLog | null>(null);
  const [todayIncidents, setTodayIncidents] = useState<IncidentReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refreshData = useCallback(async () => {
    if (!user?.section_id) return;

    setIsLoading(true);
    setError(null);

    try {
      // Get current shift for the worker's section
      const shift = await shiftService.getCurrentShift(
        user.id,
        user.section_id,
      );
      setCurrentShift(shift);

      if (shift) {
        // Get or create worker log for this shift
        const log = await workerLogService.getOrCreateWorkerLog(
          shift.id,
          user.id,
        );
        setWorkerLog(log);

        // Get today's incidents
        const incidents = await incidentService.getIncidentsForShift(shift.id);
        setTodayIncidents(incidents);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load data'));
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const checkIn = async () => {
    if (!currentShift || !user) return;
    const log = await workerLogService.checkIn(currentShift.id, user.id);
    setWorkerLog(log);
  };

  const checkOut = async () => {
    if (!workerLog) return;
    const log = await workerLogService.checkOut(workerLog.id);
    setWorkerLog(log);
  };

  const submitLog = async (tasksPerformed: string) => {
    if (!workerLog) return;
    const log = await workerLogService.submitWorkerLog(
      workerLog.id,
      tasksPerformed,
    );
    setWorkerLog(log);
  };

  const reportIncident = async (incidentData: any) => {
    if (!currentShift || !user) return;
    await incidentService.createIncident({
      ...incidentData,
      shift_id: currentShift.id,
      section_id: user.section_id!,
      reported_by: user.id,
    });
    await refreshData();
  };

  return {
    currentShift,
    workerLog,
    todayIncidents,
    isLoading,
    error,
    refreshData,
    checkIn,
    checkOut,
    submitLog,
    reportIncident,
  };
}

interface ForemanDashboardData {
  currentShift: Shift | null;
  workers: User[];
  workerLogs: WorkerShiftLog[];
  incidents: IncidentReport[];
  equipment: EquipmentLog[];
  stats: DashboardStats;
  isLoading: boolean;
  error: Error | null;
  refreshData: () => Promise<void>;
  markAttendance: (
    workerId: string,
    status: 'present' | 'absent',
    remarks?: string,
  ) => Promise<void>;
  bulkMarkAttendance: (
    records: Array<{
      workerId: string;
      status: 'present' | 'absent';
      remarks?: string;
    }>,
  ) => Promise<void>;
}

/**
 * Hook for Foreman Dashboard data
 */
export function useForemanDashboard(): ForemanDashboardData {
  const { user } = useAuth();
  const [currentShift, setCurrentShift] = useState<Shift | null>(null);
  const [workers, setWorkers] = useState<User[]>([]);
  const [workerLogs, setWorkerLogs] = useState<WorkerShiftLog[]>([]);
  const [incidents, setIncidents] = useState<IncidentReport[]>([]);
  const [equipment, setEquipment] = useState<EquipmentLog[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    workersPresent: 0,
    workersAbsent: 0,
    totalWorkers: 0,
    pendingIncidents: 0,
    highSeverityIncidents: 0,
    faultyEquipment: 0,
    shiftsToday: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refreshData = useCallback(async () => {
    if (!user?.section_id) return;

    setIsLoading(true);
    setError(null);

    try {
      // Get today's shifts for the section
      let shifts = await shiftService.getTodayShifts(user.section_id);

      if (shifts.length === 0) {
        // Bootstrap today's shift for section workflows (attendance/reporting)
        const sectionOvermen = await userService.getUsers({
          role: 'overman',
          section_id: user.section_id,
          is_active: true,
        });

        const nowHour = new Date().getHours();
        const inferredShiftType =
          nowHour >= 6 && nowHour < 14
            ? 'morning'
            : nowHour >= 14 && nowHour < 22
            ? 'evening'
            : 'night';

        await shiftService.createShift({
          shift_date: new Date().toISOString().split('T')[0],
          shift_type: inferredShiftType,
          section_id: user.section_id,
          overman_id: sectionOvermen[0]?.id ?? user.id,
          handover_notes: 'Auto-initialized for attendance workflow',
        });

        shifts = await shiftService.getTodayShifts(user.section_id);
      }

      const currentShift = shifts[0] || null;
      setCurrentShift(currentShift);

      // Get workers for the section
      const sectionWorkers = await userService.getWorkersForSection(
        user.section_id,
      );
      setWorkers(sectionWorkers);

      if (currentShift) {
        // Get worker logs for this shift
        const logs = await workerLogService.getLogsForShift(currentShift.id);
        setWorkerLogs(logs);

        // Get equipment logs
        const equipmentLogs = await equipmentService.getLogsForShift(
          currentShift.id,
        );
        setEquipment(equipmentLogs);

        // Get incidents
        const shiftIncidents = await incidentService.getIncidentsForShift(
          currentShift.id,
        );
        setIncidents(shiftIncidents);

        // Calculate stats
        const present = logs.filter(
          l => l.attendance_status === 'present',
        ).length;
        const absent = logs.filter(
          l => l.attendance_status === 'absent',
        ).length;
        const faulty = equipmentLogs.filter(
          e => e.condition_status === 'faulty' && !e.resolved_at,
        ).length;
        const pending = shiftIncidents.filter(i => !i.is_resolved).length;
        const highSeverity = shiftIncidents.filter(
          i => i.severity_level === 'high' && !i.is_resolved,
        ).length;

        setStats({
          workersPresent: present,
          workersAbsent: absent,
          totalWorkers: sectionWorkers.length,
          pendingIncidents: pending,
          highSeverityIncidents: highSeverity,
          faultyEquipment: faulty,
          shiftsToday: shifts.length,
        });
      } else {
        // No active shift yet: keep worker roster visible and counts consistent
        setWorkerLogs([]);
        setIncidents([]);
        setEquipment([]);
        setStats({
          workersPresent: 0,
          workersAbsent: 0,
          totalWorkers: sectionWorkers.length,
          pendingIncidents: 0,
          highSeverityIncidents: 0,
          faultyEquipment: 0,
          shiftsToday: shifts.length,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load data'));
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const markAttendance = async (
    workerId: string,
    status: 'present' | 'absent',
    remarks?: string,
  ) => {
    if (!currentShift) return;
    await workerLogService.markAttendance(
      currentShift.id,
      workerId,
      status,
      remarks,
    );
    await refreshData();
  };

  const bulkMarkAttendance = async (
    records: Array<{
      workerId: string;
      status: 'present' | 'absent';
      remarks?: string;
    }>,
  ) => {
    if (!currentShift) return;
    await workerLogService.bulkMarkAttendance(currentShift.id, records);
    await refreshData();
  };

  return {
    currentShift,
    workers,
    workerLogs,
    incidents,
    equipment,
    stats,
    isLoading,
    error,
    refreshData,
    markAttendance,
    bulkMarkAttendance,
  };
}

interface OvermanDashboardData {
  shifts: Shift[];
  pendingShifts: Shift[];
  sectionStats: Map<string, DashboardStats>;
  isLoading: boolean;
  error: Error | null;
  refreshData: () => Promise<void>;
  createShift: (data: any) => Promise<Shift>;
  submitShift: (shiftId: string) => Promise<void>;
}

/**
 * Hook for Overman Dashboard data
 */
export function useOvermanDashboard(): OvermanDashboardData {
  const { user } = useAuth();
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [pendingShifts, setPendingShifts] = useState<Shift[]>([]);
  const [sectionStats, setSectionStats] = useState<Map<string, DashboardStats>>(
    new Map(),
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refreshData = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      // Get shifts for this overman
      const overmanShifts = await shiftService.getShifts({
        overman_id: user.id,
      });
      setShifts(overmanShifts);

      // Get pending (draft) shifts
      const drafts = overmanShifts.filter(s => s.status === 'draft');
      setPendingShifts(drafts);

      // Get shift summaries
      const summary = await shiftService.getShiftSummary();
      // Process into section stats...
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load data'));
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const createShift = async (data: any): Promise<Shift> => {
    const shift = await shiftService.createShift({
      ...data,
      overman_id: user!.id,
    });
    await refreshData();
    return shift;
  };

  const submitShift = async (shiftId: string) => {
    await shiftService.updateShiftStatus(shiftId, 'submitted');
    await refreshData();
  };

  return {
    shifts,
    pendingShifts,
    sectionStats,
    isLoading,
    error,
    refreshData,
    createShift,
    submitShift,
  };
}

interface ManagerDashboardData {
  allShifts: ShiftWithRelations[];
  pendingApprovals: ShiftWithRelations[];
  incidentSummary: any[];
  overallStats: DashboardStats;
  isLoading: boolean;
  error: Error | null;
  refreshData: () => Promise<void>;
  approveShift: (shiftId: string, remarks?: string) => Promise<void>;
  rejectShift: (shiftId: string, remarks: string) => Promise<void>;
}

/**
 * Hook for Manager Dashboard data
 */
export function useManagerDashboard(): ManagerDashboardData {
  const { user, role } = useAuth();
  const isManager = role === 'manager';
  const [allShifts, setAllShifts] = useState<ShiftWithRelations[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<
    ShiftWithRelations[]
  >([]);
  const [incidentSummary, setIncidentSummary] = useState<any[]>([]);
  const [overallStats, setOverallStats] = useState<DashboardStats>({
    workersPresent: 0,
    workersAbsent: 0,
    totalWorkers: 0,
    pendingIncidents: 0,
    highSeverityIncidents: 0,
    faultyEquipment: 0,
    shiftsToday: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refreshData = useCallback(async () => {
    if (!isManager) {
      setAllShifts([]);
      setPendingApprovals([]);
      setIncidentSummary([]);
      setOverallStats({
        workersPresent: 0,
        workersAbsent: 0,
        totalWorkers: 0,
        pendingIncidents: 0,
        highSeverityIncidents: 0,
        faultyEquipment: 0,
        shiftsToday: 0,
      });
      setError(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Get all shifts with worker logs, equipment, incidents joined
      const shifts = await shiftService.getShiftsWithRelations();
      setAllShifts(shifts);

      // Get pending approvals
      const pending = shifts.filter(s => s.status === 'submitted');
      setPendingApprovals(pending);

      // Get incident analytics
      const analytics = await incidentService.getIncidentAnalytics();
      setIncidentSummary(analytics);

      // Get today's shifts for stats
      const todayShifts = await shiftService.getTodayShifts();
      const faultyCount = await equipmentService.getFaultyCount();
      const highSeverityCount = await incidentService.getHighSeverityCount();
      const unresolvedIncidents =
        await incidentService.getUnresolvedIncidents();

      // Aggregate worker counts from today's shift worker_logs
      const todayShiftIds = new Set(todayShifts.map(s => s.id));
      const todayShiftsWithLogs = shifts.filter(s => todayShiftIds.has(s.id));
      let totalPresent = 0;
      let totalAbsent = 0;
      let workerIdSet = new Set<string>();
      for (const s of todayShiftsWithLogs) {
        for (const log of s.worker_logs ?? []) {
          workerIdSet.add(log.worker_id);
          if (log.attendance_status === 'present') totalPresent++;
          else totalAbsent++;
        }
      }

      setOverallStats({
        workersPresent: totalPresent,
        workersAbsent: totalAbsent,
        totalWorkers: workerIdSet.size || totalPresent + totalAbsent,
        pendingIncidents: unresolvedIncidents.length,
        highSeverityIncidents: highSeverityCount,
        faultyEquipment: faultyCount,
        shiftsToday: todayShifts.length,
      });
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load data'));
    } finally {
      setIsLoading(false);
    }
  }, [isManager]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const approveShift = async (shiftId: string, remarks?: string) => {
    if (!user?.id) return;
    const { approvalService } = await import('../services/approvalService');
    await approvalService.approveShift(shiftId, user.id, remarks);
    await refreshData();
  };

  const rejectShift = async (shiftId: string, remarks: string) => {
    if (!user?.id) return;
    const { approvalService } = await import('../services/approvalService');
    await approvalService.rejectShift(shiftId, user.id, remarks);
    await refreshData();
  };

  return {
    allShifts,
    pendingApprovals,
    incidentSummary,
    overallStats,
    isLoading,
    error,
    refreshData,
    approveShift,
    rejectShift,
  };
}
