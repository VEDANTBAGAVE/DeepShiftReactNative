import { supabase } from './supabase';
import {
  IncidentReport,
  IncidentType,
  SeverityLevel,
  IncidentReportWithRelations,
} from '../types/database';

export interface CreateIncidentData {
  shift_id: string;
  section_id: string;
  incident_type: IncidentType;
  severity_level: SeverityLevel;
  title: string;
  description: string;
  location_details?: string;
  evidence_url?: string;
  reported_by: string;
  witnesses?: string[];
  immediate_action_taken?: string;
}

export interface IncidentFilters {
  section_id?: string;
  incident_type?: IncidentType;
  severity_level?: SeverityLevel;
  is_resolved?: boolean;
  start_date?: string;
  end_date?: string;
}

export const incidentService = {
  /**
   * Create a new incident report
   */
  createIncident: async (data: CreateIncidentData): Promise<IncidentReport> => {
    const { data: incident, error } = await supabase
      .from('incident_reports')
      .insert({
        ...data,
        is_resolved: false,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create incident: ${error.message}`);
    }

    return incident;
  },

  /**
   * Get incident by ID with relations
   */
  getIncidentById: async (
    id: string,
  ): Promise<IncidentReportWithRelations | null> => {
    const { data, error } = await supabase
      .from('incident_reports')
      .select(
        `
        *,
        shift:shifts(*),
        section:sections(*),
        reporter:users!incident_reports_reported_by_fkey(*),
        resolver:users!incident_reports_resolved_by_fkey(*)
      `,
      )
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Failed to get incident: ${error.message}`);
    }

    return data as IncidentReportWithRelations;
  },

  /**
   * Get incidents with filters
   */
  getIncidents: async (
    filters?: IncidentFilters,
  ): Promise<IncidentReport[]> => {
    let query = supabase
      .from('incident_reports')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters?.section_id) {
      query = query.eq('section_id', filters.section_id);
    }
    if (filters?.incident_type) {
      query = query.eq('incident_type', filters.incident_type);
    }
    if (filters?.severity_level) {
      query = query.eq('severity_level', filters.severity_level);
    }
    if (filters?.is_resolved !== undefined) {
      query = query.eq('is_resolved', filters.is_resolved);
    }
    if (filters?.start_date) {
      query = query.gte('created_at', filters.start_date);
    }
    if (filters?.end_date) {
      query = query.lte('created_at', filters.end_date);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to get incidents: ${error.message}`);
    }

    return data || [];
  },

  /**
   * Get incidents for a shift
   */
  getIncidentsForShift: async (shiftId: string): Promise<IncidentReport[]> => {
    const { data, error } = await supabase
      .from('incident_reports')
      .select('*')
      .eq('shift_id', shiftId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to get shift incidents: ${error.message}`);
    }

    return data || [];
  },

  /**
   * Get unresolved incidents for a section
   */
  getUnresolvedIncidents: async (
    sectionId?: string,
  ): Promise<IncidentReport[]> => {
    let query = supabase
      .from('incident_reports')
      .select('*')
      .eq('is_resolved', false)
      .order('severity_level', { ascending: false }) // High severity first
      .order('created_at', { ascending: false });

    if (sectionId) {
      query = query.eq('section_id', sectionId);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to get unresolved incidents: ${error.message}`);
    }

    return data || [];
  },

  /**
   * Resolve an incident
   */
  resolveIncident: async (
    id: string,
    resolvedBy: string,
    resolutionNotes: string,
  ): Promise<IncidentReport> => {
    const { data, error } = await supabase
      .from('incident_reports')
      .update({
        is_resolved: true,
        resolved_at: new Date().toISOString(),
        resolved_by: resolvedBy,
        resolution_notes: resolutionNotes,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to resolve incident: ${error.message}`);
    }

    return data;
  },

  /**
   * Update incident
   */
  updateIncident: async (
    id: string,
    updates: Partial<IncidentReport>,
  ): Promise<IncidentReport> => {
    const { data, error } = await supabase
      .from('incident_reports')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update incident: ${error.message}`);
    }

    return data;
  },

  /**
   * Get incident analytics
   */
  getIncidentAnalytics: async (
    sectionId?: string,
    startDate?: string,
    endDate?: string,
  ) => {
    let query = supabase.from('v_incident_analytics').select('*');

    if (sectionId) {
      // Need to join with sections to filter
      query = query.eq('section_name', sectionId);
    }
    if (startDate) {
      query = query.gte('month', startDate);
    }
    if (endDate) {
      query = query.lte('month', endDate);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to get incident analytics: ${error.message}`);
    }

    return data;
  },

  /**
   * Get high severity incidents count
   */
  getHighSeverityCount: async (sectionId?: string): Promise<number> => {
    let query = supabase
      .from('incident_reports')
      .select('id', { count: 'exact', head: true })
      .eq('severity_level', 'high')
      .eq('is_resolved', false);

    if (sectionId) {
      query = query.eq('section_id', sectionId);
    }

    const { count, error } = await query;

    if (error) {
      throw new Error(`Failed to get high severity count: ${error.message}`);
    }

    return count || 0;
  },

  /**
   * Subscribe to incident changes (real-time)
   */
  subscribeToIncidents: (
    sectionId: string,
    callback: (payload: any) => void,
  ) => {
    return supabase
      .channel(`incidents:section_id=eq.${sectionId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'incident_reports',
          filter: `section_id=eq.${sectionId}`,
        },
        callback,
      )
      .subscribe();
  },
};

export default incidentService;
