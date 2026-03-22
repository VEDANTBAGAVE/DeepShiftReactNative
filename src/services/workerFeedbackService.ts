import { supabase } from './supabase';
import {
  FeedbackStatusDB,
  FeedbackTypeDB,
  WorkerFeedbackReport,
} from '../types/database';

export interface CreateWorkerFeedbackInput {
  worker_id: string;
  section_id: string;
  shift_id?: string;
  feedback_type: FeedbackTypeDB;
  description: string;
}

export const workerFeedbackService = {
  async createFeedback(
    input: CreateWorkerFeedbackInput,
  ): Promise<WorkerFeedbackReport> {
    const { data, error } = await supabase
      .from('worker_feedback_reports')
      .insert({
        worker_id: input.worker_id,
        section_id: input.section_id,
        shift_id: input.shift_id ?? null,
        feedback_type: input.feedback_type,
        description: input.description,
        status: 'pending_supervisor_review',
      })
      .select('*')
      .single();

    if (error) {
      throw new Error(`Failed to submit worker feedback: ${error.message}`);
    }

    return data as WorkerFeedbackReport;
  },

  async getFeedbackForWorker(
    workerId: string,
  ): Promise<WorkerFeedbackReport[]> {
    const { data, error } = await supabase
      .from('worker_feedback_reports')
      .select('*')
      .eq('worker_id', workerId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch worker feedback: ${error.message}`);
    }

    return (data ?? []) as WorkerFeedbackReport[];
  },

  async getFeedbackForSection(
    sectionId: string,
    status?: FeedbackStatusDB,
  ): Promise<WorkerFeedbackReport[]> {
    let query = supabase
      .from('worker_feedback_reports')
      .select('*')
      .eq('section_id', sectionId)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch section feedback: ${error.message}`);
    }

    return (data ?? []) as WorkerFeedbackReport[];
  },

  async getAllFeedback(
    status?: FeedbackStatusDB,
  ): Promise<WorkerFeedbackReport[]> {
    let query = supabase
      .from('worker_feedback_reports')
      .select('*')
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch all worker feedback: ${error.message}`);
    }

    return (data ?? []) as WorkerFeedbackReport[];
  },

  async supervisorReview(
    feedbackId: string,
    reviewerId: string,
    nextStatus: 'pending_manager_verification' | 'rejected',
    notes?: string,
  ): Promise<void> {
    const { error } = await supabase
      .from('worker_feedback_reports')
      .update({
        status: nextStatus,
        supervisor_reviewer_id: reviewerId,
        supervisor_reviewed_at: new Date().toISOString(),
        supervisor_notes: notes ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', feedbackId);

    if (error) {
      throw new Error(`Failed supervisor review update: ${error.message}`);
    }
  },

  async managerVerify(
    feedbackId: string,
    verifierId: string,
    nextStatus: 'confirmed' | 'rejected',
    notes?: string,
  ): Promise<void> {
    const { error } = await supabase
      .from('worker_feedback_reports')
      .update({
        status: nextStatus,
        manager_verifier_id: verifierId,
        manager_verified_at: new Date().toISOString(),
        manager_notes: notes ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', feedbackId);

    if (error) {
      throw new Error(`Failed manager verification update: ${error.message}`);
    }
  },
};

export default workerFeedbackService;
