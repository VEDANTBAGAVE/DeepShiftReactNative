import { supabase } from './supabase';
import {
  WorkerShiftLog,
  AttendanceStatus,
  WorkerShiftLogWithRelations,
} from '../types/database';

export interface CreateWorkerLogData {
  shift_id: string;
  worker_id: string;
  attendance_status?: AttendanceStatus;
  tasks_performed?: string;
  safety_check_passed?: boolean;
  safety_remarks?: string;
  remarks?: string;
}

export interface UpdateWorkerLogData {
  attendance_status?: AttendanceStatus;
  check_in_time?: string;
  check_out_time?: string;
  tasks_performed?: string;
  safety_check_passed?: boolean;
  safety_remarks?: string;
  remarks?: string;
}

export const workerLogService = {
  /**
   * Create or get worker log for a shift
   */
  getOrCreateWorkerLog: async (
    shiftId: string,
    workerId: string,
  ): Promise<WorkerShiftLog> => {
    // Try to get existing log
    const { data: existing } = await supabase
      .from('worker_shift_logs')
      .select('*')
      .eq('shift_id', shiftId)
      .eq('worker_id', workerId)
      .single();

    if (existing) {
      return existing;
    }

    // Create new log
    const { data, error } = await supabase
      .from('worker_shift_logs')
      .insert({
        shift_id: shiftId,
        worker_id: workerId,
        attendance_status: 'present',
        safety_check_passed: false,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create worker log: ${error.message}`);
    }

    return data;
  },

  /**
   * Update worker shift log
   */
  updateWorkerLog: async (
    id: string,
    updates: UpdateWorkerLogData,
  ): Promise<WorkerShiftLog> => {
    const { data, error } = await supabase
      .from('worker_shift_logs')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update worker log: ${error.message}`);
    }

    return data;
  },

  /**
   * Check in worker
   */
  checkIn: async (
    shiftId: string,
    workerId: string,
  ): Promise<WorkerShiftLog> => {
    const log = await workerLogService.getOrCreateWorkerLog(shiftId, workerId);

    return workerLogService.updateWorkerLog(log.id, {
      attendance_status: 'present',
      check_in_time: new Date().toISOString(),
    });
  },

  /**
   * Check out worker
   */
  checkOut: async (logId: string): Promise<WorkerShiftLog> => {
    return workerLogService.updateWorkerLog(logId, {
      check_out_time: new Date().toISOString(),
    });
  },

  /**
   * Mark attendance for worker
   */
  markAttendance: async (
    shiftId: string,
    workerId: string,
    status: AttendanceStatus,
    remarks?: string,
  ): Promise<WorkerShiftLog> => {
    const log = await workerLogService.getOrCreateWorkerLog(shiftId, workerId);

    return workerLogService.updateWorkerLog(log.id, {
      attendance_status: status,
      remarks,
      check_in_time:
        status === 'present' ? new Date().toISOString() : undefined,
    });
  },

  /**
   * Submit worker log
   */
  submitWorkerLog: async (
    id: string,
    tasksPerformed: string,
  ): Promise<WorkerShiftLog> => {
    const { data, error } = await supabase
      .from('worker_shift_logs')
      .update({
        tasks_performed: tasksPerformed,
        submitted_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to submit worker log: ${error.message}`);
    }

    return data;
  },

  /**
   * Update safety check
   */
  updateSafetyCheck: async (
    id: string,
    passed: boolean,
    remarks?: string,
  ): Promise<WorkerShiftLog> => {
    return workerLogService.updateWorkerLog(id, {
      safety_check_passed: passed,
      safety_remarks: remarks,
    });
  },

  /**
   * Get all worker logs for a shift
   */
  getLogsForShift: async (
    shiftId: string,
  ): Promise<WorkerShiftLogWithRelations[]> => {
    const { data, error } = await supabase
      .from('worker_shift_logs')
      .select(
        `
        *,
        worker:users!worker_shift_logs_worker_id_fkey(*)
      `,
      )
      .eq('shift_id', shiftId);

    if (error) {
      throw new Error(`Failed to get worker logs: ${error.message}`);
    }

    return data as WorkerShiftLogWithRelations[];
  },

  /**
   * Get worker's logs history
   */
  getWorkerHistory: async (
    workerId: string,
    limit: number = 30,
  ): Promise<WorkerShiftLogWithRelations[]> => {
    const { data, error } = await supabase
      .from('worker_shift_logs')
      .select(
        `
        *,
        shift:shifts(*)
      `,
      )
      .eq('worker_id', workerId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to get worker history: ${error.message}`);
    }

    return data as WorkerShiftLogWithRelations[];
  },

  /**
   * Get attendance stats for a worker
   */
  getWorkerAttendanceStats: async (workerId: string, month?: string) => {
    let query = supabase
      .from('v_worker_attendance')
      .select('*')
      .eq('worker_id', workerId);

    if (month) {
      query = query.eq('month', month);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to get attendance stats: ${error.message}`);
    }

    return data;
  },

  /**
   * Bulk mark attendance
   */
  bulkMarkAttendance: async (
    shiftId: string,
    attendanceRecords: Array<{
      workerId: string;
      status: AttendanceStatus;
      remarks?: string;
    }>,
  ): Promise<void> => {
    const promises = attendanceRecords.map(record =>
      workerLogService.markAttendance(
        shiftId,
        record.workerId,
        record.status,
        record.remarks,
      ),
    );

    await Promise.all(promises);
  },
};

export default workerLogService;
