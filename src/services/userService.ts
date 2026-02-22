import { supabase } from './supabase';
import { User, UserRole, Section } from '../types/database';

export interface UserFilters {
  role?: UserRole;
  section_id?: string;
  is_active?: boolean;
  search?: string;
}

export const userService = {
  /**
   * Get user by ID
   */
  getUserById: async (id: string): Promise<User | null> => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Failed to get user: ${error.message}`);
    }

    return data;
  },

  /**
   * Get user by employee code
   */
  getUserByEmployeeCode: async (employeeCode: string): Promise<User | null> => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('employee_code', employeeCode)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Failed to get user: ${error.message}`);
    }

    return data;
  },

  /**
   * Get users with filters
   */
  getUsers: async (filters?: UserFilters): Promise<User[]> => {
    let query = supabase
      .from('users')
      .select('*')
      .order('name', { ascending: true });

    if (filters?.role) {
      query = query.eq('role', filters.role);
    }
    if (filters?.section_id) {
      query = query.eq('section_id', filters.section_id);
    }
    if (filters?.is_active !== undefined) {
      query = query.eq('is_active', filters.is_active);
    }
    if (filters?.search) {
      query = query.or(
        `name.ilike.%${filters.search}%,employee_code.ilike.%${filters.search}%`,
      );
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to get users: ${error.message}`);
    }

    return data || [];
  },

  /**
   * Get workers for a section
   */
  getWorkersForSection: async (sectionId: string): Promise<User[]> => {
    return userService.getUsers({
      role: 'worker',
      section_id: sectionId,
      is_active: true,
    });
  },

  /**
   * Get foremen for a section
   */
  getForemenForSection: async (sectionId: string): Promise<User[]> => {
    return userService.getUsers({
      role: 'foreman',
      section_id: sectionId,
      is_active: true,
    });
  },

  /**
   * Get all overmen
   */
  getOvermen: async (): Promise<User[]> => {
    return userService.getUsers({
      role: 'overman',
      is_active: true,
    });
  },

  /**
   * Get all managers
   */
  getManagers: async (): Promise<User[]> => {
    return userService.getUsers({
      role: 'manager',
      is_active: true,
    });
  },

  /**
   * Update user profile
   */
  updateUser: async (id: string, updates: Partial<User>): Promise<User> => {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update user: ${error.message}`);
    }

    return data;
  },

  /**
   * Get all sections
   */
  getSections: async (): Promise<Section[]> => {
    const { data, error } = await supabase
      .from('sections')
      .select('*')
      .eq('is_active', true)
      .order('section_name', { ascending: true });

    if (error) {
      throw new Error(`Failed to get sections: ${error.message}`);
    }

    return data || [];
  },

  /**
   * Get section by ID
   */
  getSectionById: async (id: string): Promise<Section | null> => {
    const { data, error } = await supabase
      .from('sections')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Failed to get section: ${error.message}`);
    }

    return data;
  },

  /**
   * Get user count by role for a section
   */
  getUserCountByRole: async (sectionId?: string) => {
    let query = supabase.from('users').select('role').eq('is_active', true);

    if (sectionId) {
      query = query.eq('section_id', sectionId);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to get user counts: ${error.message}`);
    }

    const counts: Record<string, number> = {
      worker: 0,
      foreman: 0,
      overman: 0,
      manager: 0,
    };

    (data as Array<{ role: string }> | null)?.forEach(user => {
      if (counts[user.role] !== undefined) {
        counts[user.role]++;
      }
    });

    return counts;
  },
};

export default userService;
