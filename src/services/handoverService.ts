import { supabase } from './supabase';
import { ShiftHandover } from '../types/database';

export interface CreateHandoverData {
  outgoing_shift_id: string;
  incoming_shift_id?: string;
  handover_notes?: string;
  pending_issues?: string;
  safety_concerns?: string;
  handed_over_by: string;
}

export const handoverService = {
  /**
   * Create a shift handover
   */
  createHandover: async (data: CreateHandoverData): Promise<ShiftHandover> => {
    const { data: handover, error } = await supabase
      .from('shift_handovers')
      .insert({
        ...data,
        handover_time: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create handover: ${error.message}`);
    }

    return handover;
  },

  /**
   * Acknowledge a handover
   */
  acknowledgeHandover: async (
    id: string,
    receivedBy: string,
  ): Promise<ShiftHandover> => {
    const { data, error } = await supabase
      .from('shift_handovers')
      .update({
        received_by: receivedBy,
        acknowledgment_time: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to acknowledge handover: ${error.message}`);
    }

    return data;
  },

  /**
   * Get handover for a shift
   */
  getHandoverForShift: async (
    shiftId: string,
  ): Promise<ShiftHandover | null> => {
    const { data, error } = await supabase
      .from('shift_handovers')
      .select('*')
      .eq('outgoing_shift_id', shiftId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Failed to get handover: ${error.message}`);
    }

    return data;
  },

  /**
   * Get pending handovers (not yet acknowledged)
   */
  getPendingHandovers: async (sectionId?: string): Promise<ShiftHandover[]> => {
    let query = supabase
      .from('shift_handovers')
      .select(
        `
        *,
        outgoing_shift:shifts!shift_handovers_outgoing_shift_id_fkey(*)
      `,
      )
      .is('acknowledgment_time', null)
      .order('handover_time', { ascending: false });

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to get pending handovers: ${error.message}`);
    }

    return data || [];
  },

  /**
   * Get recent handovers
   */
  getRecentHandovers: async (limit: number = 10): Promise<ShiftHandover[]> => {
    const { data, error } = await supabase
      .from('shift_handovers')
      .select('*')
      .order('handover_time', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to get recent handovers: ${error.message}`);
    }

    return data || [];
  },

  /**
   * Update handover notes
   */
  updateHandover: async (
    id: string,
    updates: Partial<ShiftHandover>,
  ): Promise<ShiftHandover> => {
    const { data, error } = await supabase
      .from('shift_handovers')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update handover: ${error.message}`);
    }

    return data;
  },
};

export default handoverService;
