// Database types generated from Supabase schema
// These types match the schema1.sql structure

export type UserRole = 'worker' | 'foreman' | 'overman' | 'manager';
export type ShiftType = 'morning' | 'evening' | 'night';
export type ShiftStatus = 'draft' | 'submitted' | 'approved' | 'archived';
export type AttendanceStatus = 'present' | 'absent';
export type EquipmentCondition = 'ok' | 'faulty';
export type IncidentType =
  | 'PPE'
  | 'equipment'
  | 'gas'
  | 'temperature'
  | 'other';
export type SeverityLevel = 'low' | 'medium' | 'high';
export type ApprovalEntityType = 'worker_log' | 'section_report' | 'shift';
export type ApprovalStatus = 'approved' | 'rejected';
export type AuditAction = 'created' | 'updated' | 'approved' | 'rejected';

// Table interfaces
export interface Section {
  id: string;
  section_name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  name: string;
  employee_code: string;
  role: UserRole;
  section_id: string | null;
  is_active: boolean;
  phone: string | null;
  email: string | null;
  created_at: string;
  updated_at: string;
}

export interface Shift {
  id: string;
  shift_date: string;
  shift_type: ShiftType;
  section_id: string;
  overman_id: string;
  status: ShiftStatus;
  handover_notes: string | null;
  created_at: string;
  updated_at: string;
  submitted_at: string | null;
  approved_at: string | null;
  approved_by: string | null;
}

export interface WorkerShiftLog {
  id: string;
  shift_id: string;
  worker_id: string;
  attendance_status: AttendanceStatus;
  check_in_time: string | null;
  check_out_time: string | null;
  tasks_performed: string | null;
  safety_check_passed: boolean;
  safety_remarks: string | null;
  remarks: string | null;
  submitted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface EquipmentLog {
  id: string;
  shift_id: string;
  section_id: string;
  equipment_name: string;
  equipment_code: string | null;
  condition_status: EquipmentCondition;
  issue_description: string | null;
  evidence_url: string | null;
  reported_by: string;
  resolved_at: string | null;
  resolved_by: string | null;
  resolution_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface IncidentReport {
  id: string;
  shift_id: string;
  section_id: string;
  incident_type: IncidentType;
  severity_level: SeverityLevel;
  title: string;
  description: string;
  location_details: string | null;
  evidence_url: string | null;
  reported_by: string;
  witnesses: string[] | null;
  immediate_action_taken: string | null;
  is_resolved: boolean;
  resolved_at: string | null;
  resolved_by: string | null;
  resolution_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Approval {
  id: string;
  entity_type: ApprovalEntityType;
  entity_id: string;
  approved_by: string;
  approval_status: ApprovalStatus;
  remarks: string | null;
  approved_at: string;
  created_at: string;
}

export interface AuditLog {
  id: string;
  entity_type: string;
  entity_id: string;
  action: AuditAction;
  performed_by: string | null;
  old_data: Record<string, any> | null;
  new_data: Record<string, any> | null;
  ip_address: string | null;
  user_agent: string | null;
  timestamp: string;
}

export interface ShiftHandover {
  id: string;
  outgoing_shift_id: string;
  incoming_shift_id: string | null;
  handover_notes: string | null;
  pending_issues: string | null;
  safety_concerns: string | null;
  handed_over_by: string;
  received_by: string | null;
  handover_time: string;
  acknowledgment_time: string | null;
  created_at: string;
}

// Database schema type for Supabase client
export interface Database {
  public: {
    Tables: {
      sections: {
        Row: Section;
        Insert: Omit<Section, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Section, 'id'>>;
      };
      users: {
        Row: User;
        Insert: Omit<User, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<User, 'id'>>;
      };
      shifts: {
        Row: Shift;
        Insert: Omit<Shift, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Shift, 'id'>>;
      };
      worker_shift_logs: {
        Row: WorkerShiftLog;
        Insert: Omit<WorkerShiftLog, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<WorkerShiftLog, 'id'>>;
      };
      equipment_logs: {
        Row: EquipmentLog;
        Insert: Omit<EquipmentLog, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<EquipmentLog, 'id'>>;
      };
      incident_reports: {
        Row: IncidentReport;
        Insert: Omit<IncidentReport, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<IncidentReport, 'id'>>;
      };
      approvals: {
        Row: Approval;
        Insert: Omit<Approval, 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<Approval, 'id'>>;
      };
      audit_logs: {
        Row: AuditLog;
        Insert: Omit<AuditLog, 'id' | 'timestamp'> & {
          id?: string;
          timestamp?: string;
        };
        Update: never; // Audit logs should be immutable
      };
      shift_handovers: {
        Row: ShiftHandover;
        Insert: Omit<ShiftHandover, 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<ShiftHandover, 'id'>>;
      };
    };
    Views: {
      v_daily_shift_summary: {
        Row: {
          shift_date: string;
          shift_type: ShiftType;
          section_name: string;
          status: ShiftStatus;
          overman_name: string;
          workers_present: number;
          workers_absent: number;
          safety_checks_passed: number;
          equipment_issues: number;
          incidents_reported: number;
          high_severity_incidents: number;
        };
      };
      v_incident_analytics: {
        Row: {
          month: string;
          section_name: string;
          incident_type: IncidentType;
          severity_level: SeverityLevel;
          incident_count: number;
          resolved_count: number;
        };
      };
      v_worker_attendance: {
        Row: {
          worker_id: string;
          worker_name: string;
          employee_code: string;
          section_name: string;
          month: string;
          days_present: number;
          days_absent: number;
          attendance_percentage: number;
        };
      };
    };
    Enums: {
      user_role: UserRole;
      shift_type: ShiftType;
      shift_status: ShiftStatus;
      attendance_status: AttendanceStatus;
      equipment_condition: EquipmentCondition;
      incident_type: IncidentType;
      severity_level: SeverityLevel;
      approval_entity_type: ApprovalEntityType;
      approval_status: ApprovalStatus;
      audit_action: AuditAction;
    };
  };
}

// Extended types with relations
export interface ShiftWithRelations extends Shift {
  section?: Section;
  overman?: User;
  worker_logs?: WorkerShiftLog[];
  equipment_logs?: EquipmentLog[];
  incidents?: IncidentReport[];
}

export interface WorkerShiftLogWithRelations extends WorkerShiftLog {
  shift?: Shift;
  worker?: User;
}

export interface IncidentReportWithRelations extends IncidentReport {
  shift?: Shift;
  section?: Section;
  reporter?: User;
  resolver?: User;
}
