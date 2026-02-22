import { supabase } from './supabase';
import {
  Approval,
  ApprovalEntityType,
  ApprovalStatus,
} from '../types/database';

export interface CreateApprovalData {
  entity_type: ApprovalEntityType;
  entity_id: string;
  approved_by: string;
  approval_status: ApprovalStatus;
  remarks?: string;
}

export const approvalService = {
  /**
   * Create an approval record
   */
  createApproval: async (data: CreateApprovalData): Promise<Approval> => {
    const { data: approval, error } = await supabase
      .from('approvals')
      .insert({
        ...data,
        approved_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create approval: ${error.message}`);
    }

    return approval;
  },

  /**
   * Approve a shift
   */
  approveShift: async (
    shiftId: string,
    approvedBy: string,
    remarks?: string,
  ): Promise<Approval> => {
    // Update the shift status
    await supabase
      .from('shifts')
      .update({
        status: 'approved',
        approved_at: new Date().toISOString(),
        approved_by: approvedBy,
      })
      .eq('id', shiftId);

    // Create approval record
    return approvalService.createApproval({
      entity_type: 'shift',
      entity_id: shiftId,
      approved_by: approvedBy,
      approval_status: 'approved',
      remarks,
    });
  },

  /**
   * Reject a shift
   */
  rejectShift: async (
    shiftId: string,
    rejectedBy: string,
    remarks: string,
  ): Promise<Approval> => {
    // Update shift status back to draft
    await supabase.from('shifts').update({ status: 'draft' }).eq('id', shiftId);

    return approvalService.createApproval({
      entity_type: 'shift',
      entity_id: shiftId,
      approved_by: rejectedBy,
      approval_status: 'rejected',
      remarks,
    });
  },

  /**
   * Approve a worker log
   */
  approveWorkerLog: async (
    logId: string,
    approvedBy: string,
    remarks?: string,
  ): Promise<Approval> => {
    return approvalService.createApproval({
      entity_type: 'worker_log',
      entity_id: logId,
      approved_by: approvedBy,
      approval_status: 'approved',
      remarks,
    });
  },

  /**
   * Get approvals for an entity
   */
  getApprovalsForEntity: async (
    entityType: ApprovalEntityType,
    entityId: string,
  ): Promise<Approval[]> => {
    const { data, error } = await supabase
      .from('approvals')
      .select('*')
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .order('approved_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to get approvals: ${error.message}`);
    }

    return data || [];
  },

  /**
   * Get pending shifts for approval (for managers)
   */
  getPendingShiftsForApproval: async () => {
    const { data, error } = await supabase
      .from('shifts')
      .select(
        `
        *,
        section:sections(*),
        overman:users!shifts_overman_id_fkey(*)
      `,
      )
      .eq('status', 'submitted')
      .order('submitted_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to get pending shifts: ${error.message}`);
    }

    return data || [];
  },

  /**
   * Get approval history by approver
   */
  getApprovalHistory: async (
    approvedBy: string,
    limit: number = 50,
  ): Promise<Approval[]> => {
    const { data, error } = await supabase
      .from('approvals')
      .select('*')
      .eq('approved_by', approvedBy)
      .order('approved_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to get approval history: ${error.message}`);
    }

    return data || [];
  },
};

export default approvalService;
