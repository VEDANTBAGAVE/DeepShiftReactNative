import { supabase } from './supabase';
import {
  Task,
  TaskAssignment,
  TaskStatus,
  TaskPriorityDB,
  TaskCategoryDB,
} from '../types/database';
import nlpRiskService from './nlpRiskService';

export interface CreateTaskInput {
  title: string;
  instructions?: string;
  category: TaskCategoryDB;
  priority: TaskPriorityDB;
  section_id: string;
  shift_id?: string;
  created_by: string;
  due_date?: string;
}

export const taskService = {
  async createTask(input: CreateTaskInput): Promise<Task> {
    const nlp = nlpRiskService.analyzeText(
      `${input.title || ''} ${input.instructions || ''}`,
    );

    const { data, error } = await supabase
      .from('tasks')
      .insert({
        title: input.title,
        instructions: input.instructions ?? null,
        category: input.category,
        priority: input.priority,
        section_id: input.section_id,
        shift_id: input.shift_id ?? null,
        created_by: input.created_by,
        due_date: input.due_date ?? null,
        status: 'pending',
        risk_score: nlp.riskScore,
        risk_category: nlp.riskCategory,
        risk_flag: nlp.riskFlag,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as Task;
  },

  async assignWorkers(taskId: string, workerIds: string[]): Promise<void> {
    if (workerIds.length === 0) return;
    const rows = workerIds.map(worker_id => ({ task_id: taskId, worker_id }));
    const { error } = await supabase.from('task_assignments').insert(rows);
    if (error) throw new Error(error.message);
  },

  async getTasksForWorker(workerId: string): Promise<Task[]> {
    const { data, error } = await supabase
      .from('task_assignments')
      .select('task_id')
      .eq('worker_id', workerId);
    if (error) throw new Error(error.message);
    if (!data || data.length === 0) return [];

    const taskIds = data.map((r: { task_id: string }) => r.task_id);
    const { data: tasks, error: taskError } = await supabase
      .from('tasks')
      .select('*')
      .in('id', taskIds)
      .order('created_at', { ascending: false });
    if (taskError) throw new Error(taskError.message);
    return (tasks ?? []) as Task[];
  },

  async getTasksForSection(sectionId: string): Promise<Task[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('section_id', sectionId)
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as Task[];
  },

  async updateTaskStatus(taskId: string, status: TaskStatus): Promise<void> {
    const { error } = await supabase
      .from('tasks')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', taskId);
    if (error) throw new Error(error.message);
  },

  async markAssignmentComplete(
    taskId: string,
    workerId: string,
  ): Promise<void> {
    const { error } = await supabase
      .from('task_assignments')
      .update({ completed_at: new Date().toISOString() })
      .match({ task_id: taskId, worker_id: workerId });
    if (error) throw new Error(error.message);
  },

  async getAssignmentsForTask(taskId: string): Promise<TaskAssignment[]> {
    const { data, error } = await supabase
      .from('task_assignments')
      .select('*')
      .eq('task_id', taskId);
    if (error) throw new Error(error.message);
    return (data ?? []) as TaskAssignment[];
  },
};
