import { supabase } from './supabase';

export type RemarkSeverity = 'info' | 'warning';

export interface DBRemark {
  id: string;
  foreman_id: string;
  worker_id: string;
  message: string;
  severity: RemarkSeverity;
  requires_action: boolean;
  acknowledged_at: string | null;
  created_at: string;
  foreman?: { id: string; name: string };
}

export const remarkService = {
  /**
   * Create a remark from foreman to worker
   */
  createRemark: async (
    foremanId: string,
    workerId: string,
    message: string,
    severity: RemarkSeverity = 'info',
    requiresAction: boolean = false,
  ): Promise<DBRemark> => {
    const { data, error } = await supabase
      .from('remarks')
      .insert({
        foreman_id: foremanId,
        worker_id: workerId,
        message,
        severity,
        requires_action: requiresAction,
      })
      .select('*, foreman:users!remarks_foreman_id_fkey(id, name)')
      .single();

    if (error) {
      throw new Error(`Failed to create remark: ${error.message}`);
    }

    return data;
  },

  /**
   * Get all remarks for a worker, newest first
   */
  getRemarksForWorker: async (workerId: string): Promise<DBRemark[]> => {
    const { data, error } = await supabase
      .from('remarks')
      .select('*, foreman:users!remarks_foreman_id_fkey(id, name)')
      .eq('worker_id', workerId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to get remarks: ${error.message}`);
    }

    return data || [];
  },

  /**
   * Get all remarks created by a foreman, newest first
   */
  getRemarksByForeman: async (foremanId: string): Promise<DBRemark[]> => {
    const { data, error } = await supabase
      .from('remarks')
      .select('*, foreman:users!remarks_foreman_id_fkey(id, name)')
      .eq('foreman_id', foremanId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to get remarks: ${error.message}`);
    }

    return data || [];
  },

  /**
   * Worker acknowledges a remark
   */
  acknowledge: async (remarkId: string): Promise<void> => {
    const { error } = await supabase
      .from('remarks')
      .update({ acknowledged_at: new Date().toISOString() })
      .eq('id', remarkId);

    if (error) {
      throw new Error(`Failed to acknowledge remark: ${error.message}`);
    }
  },
};
