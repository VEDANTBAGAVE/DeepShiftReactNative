import { supabase } from './supabase';
import { EquipmentLog, EquipmentCondition } from '../types/database';

export interface CreateEquipmentLogData {
  shift_id: string;
  section_id: string;
  equipment_name: string;
  equipment_code?: string;
  condition_status: EquipmentCondition;
  issue_description?: string;
  evidence_url?: string;
  reported_by: string;
}

export interface EquipmentFilters {
  section_id?: string;
  condition_status?: EquipmentCondition;
  is_resolved?: boolean;
  equipment_name?: string;
}

export const equipmentService = {
  /**
   * Create equipment log
   */
  createEquipmentLog: async (
    data: CreateEquipmentLogData,
  ): Promise<EquipmentLog> => {
    const { data: log, error } = await supabase
      .from('equipment_logs')
      .insert(data)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create equipment log: ${error.message}`);
    }

    return log;
  },

  /**
   * Get equipment logs for a shift
   */
  getLogsForShift: async (shiftId: string): Promise<EquipmentLog[]> => {
    const { data, error } = await supabase
      .from('equipment_logs')
      .select('*')
      .eq('shift_id', shiftId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to get equipment logs: ${error.message}`);
    }

    return data || [];
  },

  /**
   * Get equipment logs with filters
   */
  getEquipmentLogs: async (
    filters?: EquipmentFilters,
  ): Promise<EquipmentLog[]> => {
    let query = supabase
      .from('equipment_logs')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters?.section_id) {
      query = query.eq('section_id', filters.section_id);
    }
    if (filters?.condition_status) {
      query = query.eq('condition_status', filters.condition_status);
    }
    if (filters?.is_resolved === true) {
      query = query.not('resolved_at', 'is', null);
    }
    if (filters?.is_resolved === false) {
      query = query.is('resolved_at', null);
    }
    if (filters?.equipment_name) {
      query = query.ilike('equipment_name', `%${filters.equipment_name}%`);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to get equipment logs: ${error.message}`);
    }

    return data || [];
  },

  /**
   * Get faulty equipment (unresolved issues)
   */
  getFaultyEquipment: async (sectionId?: string): Promise<EquipmentLog[]> => {
    let query = supabase
      .from('equipment_logs')
      .select('*')
      .eq('condition_status', 'faulty')
      .is('resolved_at', null)
      .order('created_at', { ascending: false });

    if (sectionId) {
      query = query.eq('section_id', sectionId);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to get faulty equipment: ${error.message}`);
    }

    return data || [];
  },

  /**
   * Update equipment log
   */
  updateEquipmentLog: async (
    id: string,
    updates: Partial<EquipmentLog>,
  ): Promise<EquipmentLog> => {
    const { data, error } = await supabase
      .from('equipment_logs')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update equipment log: ${error.message}`);
    }

    return data;
  },

  /**
   * Resolve equipment issue
   */
  resolveEquipmentIssue: async (
    id: string,
    resolvedBy: string,
    resolutionNotes: string,
  ): Promise<EquipmentLog> => {
    const { data, error } = await supabase
      .from('equipment_logs')
      .update({
        resolved_at: new Date().toISOString(),
        resolved_by: resolvedBy,
        resolution_notes: resolutionNotes,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to resolve equipment issue: ${error.message}`);
    }

    return data;
  },

  /**
   * Get equipment status summary for a section
   */
  getEquipmentSummary: async (sectionId: string) => {
    const { data, error } = await supabase
      .from('equipment_logs')
      .select('equipment_name, condition_status, created_at')
      .eq('section_id', sectionId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to get equipment summary: ${error.message}`);
    }

    // Group by equipment and get latest status
    type EquipmentSummaryItem = {
      equipment_name: string;
      condition_status: string;
      created_at: string;
    };
    const latestStatus = new Map<string, EquipmentSummaryItem>();
    (data as EquipmentSummaryItem[] | null)?.forEach(log => {
      if (!latestStatus.has(log.equipment_name)) {
        latestStatus.set(log.equipment_name, log);
      }
    });

    const summary = {
      total: latestStatus.size,
      ok: 0,
      faulty: 0,
      equipment: Array.from(latestStatus.values()),
    };

    latestStatus.forEach(log => {
      if (log.condition_status === 'ok') {
        summary.ok++;
      } else {
        summary.faulty++;
      }
    });

    return summary;
  },

  /**
   * Get faulty equipment count
   */
  getFaultyCount: async (sectionId?: string): Promise<number> => {
    let query = supabase
      .from('equipment_logs')
      .select('id', { count: 'exact', head: true })
      .eq('condition_status', 'faulty')
      .is('resolved_at', null);

    if (sectionId) {
      query = query.eq('section_id', sectionId);
    }

    const { count, error } = await query;

    if (error) {
      throw new Error(`Failed to get faulty count: ${error.message}`);
    }

    return count || 0;
  },
};

export default equipmentService;
