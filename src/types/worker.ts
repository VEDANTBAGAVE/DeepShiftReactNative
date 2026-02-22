// Worker module types

export type ShiftType = 'morning' | 'afternoon' | 'night';
export type ShiftStatus = 'draft' | 'submitted' | 'reopened' | 'acknowledged';
export type PresenceStatus = 'present' | 'absent';
export type EquipmentCondition =
  | 'operational'
  | 'needs-maintenance'
  | 'faulty'
  | 'not-present';
export type VentilationStatus = 'ok' | 'issue';
export type IncidentSeverity = 'low' | 'medium' | 'high';
export type Language = 'en' | 'hi' | 'mr';
export type ReportStatus = 'draft' | 'pending' | 'reopened' | 'acknowledged';
export type AttendanceStatus = 'present' | 'absent' | 'tardy' | 'not-marked';
export type TaskPriority = 'low' | 'normal' | 'high';
export type TaskCategory =
  | 'safety'
  | 'maintenance'
  | 'inspection'
  | 'production'
  | 'other';
export type NotificationType =
  | 'remark'
  | 'report-status'
  | 'incident'
  | 'safety'
  | 'task';

export interface Photo {
  id: string;
  uri: string;
  timestamp: number;
}

export interface AttendanceRecord {
  id: string;
  date: string; // YYYY-MM-DD
  shiftType: ShiftType;
  area: string;
  presenceStatus: PresenceStatus;
  confirmedAt?: number; // timestamp
  remarks?: string;
  createdAt: number;
}

export interface EquipmentItem {
  id: string;
  name: string;
  condition: EquipmentCondition;
  notes?: string;
  photos: Photo[];
}

export interface ShiftRecord {
  id: string;
  date: string; // YYYY-MM-DD
  shiftType: ShiftType;
  area: string;
  status: ShiftStatus;

  // Attendance
  presenceConfirmed: boolean;
  confirmedAt?: number;
  crewCount?: number;
  absenteesCount?: number;

  // Equipment
  equipment: EquipmentItem[];

  // Safety
  gasCH4: string; // percentage
  ventilationStatus: VentilationStatus;
  ppeChecklist: string[]; // helmet, mask, gloves, boots

  // Work Summary
  tasksDone: string;
  productionPercent?: string;
  problemsFaced?: string;
  problemsCategory?: string;

  // Attachments
  attachments: Photo[];

  // Linked incidents
  incidentIds: string[];

  // Metadata
  createdAt: number;
  updatedAt: number;
  submittedAt?: number;
  lastSavedAt?: number; // For draft autosave

  // Audit trail
  auditLog: AuditEntry[];

  // Reopened info
  reopenedReason?: string;
  reopenedAt?: number;
}

export interface IncidentRecord {
  id: string;
  description: string;
  severity: IncidentSeverity;
  area: string;
  photos: Photo[];
  linkedShiftId?: string;
  createdAt: number;
}

export interface RemarkRecord {
  id: string;
  from: string; // Foreman/Supervisor name
  linkedShiftId?: string;
  message: string;
  summary: string; // One-line
  isReopened: boolean;
  isRead: boolean;
  createdAt: number;
}

export interface TaskRecord {
  id: string;
  description: string;
  assignedBy: string;
  isDone: boolean;
  doneNote?: string;
  dueDate?: string;
  createdAt: number;
}

export interface AuditEntry {
  id: string;
  action:
    | 'confirm_presence'
    | 'create_shift'
    | 'update_shift'
    | 'report_incident'
    | 'reopen_shift'
    | 'acknowledge_shift';
  description: string;
  timestamp: number;
}

export interface AppSettings {
  language: Language;
  tooltipsShown: string[]; // tooltip IDs
  demoMode: boolean;
}

export interface WorkerState {
  attendance: AttendanceRecord[];
  shifts: ShiftRecord[];
  incidents: IncidentRecord[];
  remarks: RemarkRecord[];
  tasks: TaskRecord[];
  settings: AppSettings;
  draftShift: Partial<ShiftRecord> | null;
}

// ==================== FOREMAN MODULE TYPES ====================

export interface Worker {
  id: string;
  name: string;
  employeeId: string;
  role: string;
  section: string;
  contactNumber?: string;
  todayAttendance?: AttendanceStatus;
  attendanceMarkedAt?: number;
  attendanceReason?: string;
  openTasksCount: number;
  recentIncidentsCount: number;
  lastActivityAt: number;
  latestRemark?: {
    text: string;
    author: string;
    timestamp: number;
    type: string;
  };
}

export interface SectionReport {
  id: string;
  date: string; // YYYY-MM-DD
  shiftType: ShiftType;
  section: string;
  foremanName: string;
  foremanId: string;
  status: ReportStatus;

  // Section 1: Section Details
  area: string;

  // Section 2: Crew Summary
  totalWorkers: number;
  presentCount: number;
  absentCount: number;
  tardyCount: number;
  crewNotes?: string;

  // Section 3: Equipment Status
  equipment: EquipmentItem[];

  // Section 4: Safety & Environment
  gasCH4: string; // percentage (required)
  ventilationStatus: VentilationStatus; // required
  waterCondition?: string;
  roofCondition?: string;
  ppeComplianceRate?: string; // percentage
  safetyNotes?: string;

  // Section 5: Work Progress & Production
  completedWork?: string;
  plannedWork?: string;
  productionTons?: string;
  blockers?: string;

  // Section 6: Permits & Outstanding Issues
  activePermits?: string[];
  handoverNotes?: string;
  outstandingIssues?: string;

  // Validation
  validationErrors: string[];
  validationWarnings: string[];
  canSubmit: boolean;

  // Metadata
  createdAt: number;
  updatedAt: number;
  lastSavedAt?: number; // autosave
  submittedAt?: number;

  // Audit trail
  auditLog: AuditEntry[];

  // Reopened info
  reopenedReason?: string;
  reopenedAt?: number;
  overmanRemarks?: string;
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: number;
  linkedEntityId?: string; // report ID, worker ID, incident ID, etc.
  linkedEntityType?: 'report' | 'worker' | 'incident' | 'task';
  severity?: 'info' | 'warning' | 'urgent';
  from?: string; // who sent it
}

export interface TaskAssignment extends TaskRecord {
  priority: TaskPriority;
  category: TaskCategory;
  assignedTo: string[]; // worker IDs
  assignedToNames: string[]; // worker names for display
  photos: Photo[];
  instructions?: string;
}

export interface RemarkMessage extends RemarkRecord {
  linkedWorkerId?: string;
  severity?: 'info' | 'warning';
  requiresAction: boolean;
}

export interface ForemanState {
  workers: Worker[];
  sectionReports: SectionReport[];
  notifications: Notification[];
  draftReport: Partial<SectionReport> | null;
}

export interface ForemanProfile {
  id: string;
  name: string;
  employeeId: string;
  sections: string[]; // assigned sections
  contactNumber: string;
  email?: string;
}
