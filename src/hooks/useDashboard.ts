import { useState, useEffect, useCallback } from 'react';
import { shiftService } from '../services/shiftService';
import { workerLogService } from '../services/workerLogService';
import { incidentService } from '../services/incidentService';
import { equipmentService } from '../services/equipmentService';
import { userService } from '../services/userService';
import { useAuth } from '../context/AuthContext';
import {
  Shift,
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
      const shifts = await shiftService.getTodayShifts(user.section_id);
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
  allShifts: Shift[];
  pendingApprovals: Shift[];
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
  const { user } = useAuth();
  const [allShifts, setAllShifts] = useState<Shift[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<Shift[]>([]);
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
    setIsLoading(true);
    setError(null);

    try {
      // Get all shifts
      const shifts = await shiftService.getShifts();
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

      setOverallStats({
        workersPresent: 0, // Would need to aggregate from all shifts
        workersAbsent: 0,
        totalWorkers: 0,
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
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const approveShift = async (shiftId: string, remarks?: string) => {
    const { approvalService } = await import('../services/approvalService');
    await approvalService.approveShift(shiftId, user!.id, remarks);
    await refreshData();
  };

  const rejectShift = async (shiftId: string, remarks: string) => {
    const { approvalService } = await import('../services/approvalService');
    await approvalService.rejectShift(shiftId, user!.id, remarks);
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
