// Supabase Services Export
// This file provides a centralized export of all Supabase services

export { supabase, getCurrentUser, getSession } from './supabase';
export { authService } from './authService';
export { shiftService } from './shiftService';
export { workerLogService } from './workerLogService';
export { incidentService } from './incidentService';
export { equipmentService } from './equipmentService';
export { userService } from './userService';
export { approvalService } from './approvalService';
export { handoverService } from './handoverService';

// Re-export types
export type {
  Database,
  User,
  UserRole,
  Section,
  Shift,
  ShiftType,
  ShiftStatus,
  WorkerShiftLog,
  AttendanceStatus,
  EquipmentLog,
  EquipmentCondition,
  IncidentReport,
  IncidentType,
  SeverityLevel,
  Approval,
  ApprovalStatus,
  ApprovalEntityType,
  AuditLog,
  AuditAction,
  ShiftHandover,
  ShiftWithRelations,
  WorkerShiftLogWithRelations,
  IncidentReportWithRelations,
} from '../types/database';
