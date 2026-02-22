import { supabase } from './supabase';
import {
  Shift,
  ShiftStatus,
  ShiftType,
  ShiftWithRelations,
} from '../types/database';

export interface CreateShiftData {
  shift_date: string;
  shift_type: ShiftType;
  section_id: string;
  overman_id: string;
  handover_notes?: string;
}

export interface ShiftFilters {
  section_id?: string;
  overman_id?: string;
  status?: ShiftStatus;
  start_date?: string;
  end_date?: string;
}

export const shiftService = {
  /**
   * Create a new shift
   */
  createShift: async (data: CreateShiftData): Promise<Shift> => {
    const { data: shift, error } = await supabase
      .from('shifts')
      .insert({
        shift_date: data.shift_date,
        shift_type: data.shift_type,
        section_id: data.section_id,
        overman_id: data.overman_id,
        handover_notes: data.handover_notes,
        status: 'draft',
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create shift: ${error.message}`);
    }

    return shift;
  },

  /**
   * Get shift by ID with related data
   */
  getShiftById: async (id: string): Promise<ShiftWithRelations | null> => {
    const { data, error } = await supabase
      .from('shifts')
      .select(
        `
        *,
        section:sections(*),
        overman:users!shifts_overman_id_fkey(*),
        worker_logs:worker_shift_logs(*),
        equipment_logs:equipment_logs(*),
        incidents:incident_reports(*)
      `,
      )
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw new Error(`Failed to get shift: ${error.message}`);
    }

    return data as ShiftWithRelations;
  },

  /**
   * Get shifts with filters
   */
  getShifts: async (filters?: ShiftFilters): Promise<Shift[]> => {
    let query = supabase
      .from('shifts')
      .select('*')
      .order('shift_date', { ascending: false });

    if (filters?.section_id) {
      query = query.eq('section_id', filters.section_id);
    }
    if (filters?.overman_id) {
      query = query.eq('overman_id', filters.overman_id);
    }
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.start_date) {
      query = query.gte('shift_date', filters.start_date);
    }
    if (filters?.end_date) {
      query = query.lte('shift_date', filters.end_date);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to get shifts: ${error.message}`);
    }

    return data || [];
  },

  /**
   * Get today's shifts for a section
   */
  getTodayShifts: async (sectionId?: string): Promise<Shift[]> => {
    const today = new Date().toISOString().split('T')[0];

    let query = supabase.from('shifts').select('*').eq('shift_date', today);

    if (sectionId) {
      query = query.eq('section_id', sectionId);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to get today's shifts: ${error.message}`);
    }

    return data || [];
  },

  /**
   * Get current active shift for a user
   */
  getCurrentShift: async (
    userId: string,
    sectionId: string,
  ): Promise<Shift | null> => {
    const today = new Date().toISOString().split('T')[0];
    const currentHour = new Date().getHours();

    // Determine current shift type based on time
    let shiftType: ShiftType;
    if (currentHour >= 6 && currentHour < 14) {
      shiftType = 'morning';
    } else if (currentHour >= 14 && currentHour < 22) {
      shiftType = 'evening';
    } else {
      shiftType = 'night';
    }

    const { data, error } = await supabase
      .from('shifts')
      .select('*')
      .eq('shift_date', today)
      .eq('section_id', sectionId)
      .eq('shift_type', shiftType)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw new Error(`Failed to get current shift: ${error.message}`);
    }

    return data;
  },

  /**
   * Update shift status
   */
  updateShiftStatus: async (
    id: string,
    status: ShiftStatus,
    approvedBy?: string,
  ): Promise<Shift> => {
    const updates: Partial<Shift> = { status };

    if (status === 'submitted') {
      updates.submitted_at = new Date().toISOString();
    }
    if (status === 'approved' && approvedBy) {
      updates.approved_at = new Date().toISOString();
      updates.approved_by = approvedBy;
    }

    const { data, error } = await supabase
      .from('shifts')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update shift status: ${error.message}`);
    }

    return data;
  },

  /**
   * Update shift handover notes
   */
  updateHandoverNotes: async (id: string, notes: string): Promise<Shift> => {
    const { data, error } = await supabase
      .from('shifts')
      .update({ handover_notes: notes })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update handover notes: ${error.message}`);
    }

    return data;
  },

  /**
   * Get shift summary view (analytics)
   */
  getShiftSummary: async (startDate?: string, endDate?: string) => {
    let query = supabase.from('v_daily_shift_summary').select('*');

    if (startDate) {
      query = query.gte('shift_date', startDate);
    }
    if (endDate) {
      query = query.lte('shift_date', endDate);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to get shift summary: ${error.message}`);
    }

    return data;
  },

  /**
   * Subscribe to shift changes (real-time)
   */
  subscribeToShiftChanges: (
    sectionId: string,
    callback: (payload: any) => void,
  ) => {
    return supabase
      .channel(`shifts:section_id=eq.${sectionId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'shifts',
          filter: `section_id=eq.${sectionId}`,
        },
        callback,
      )
      .subscribe();
  },
};

export default shiftService;
