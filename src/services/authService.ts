import { supabase } from './supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, UserRole } from '../types/database';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  session: {
    access_token: string;
    refresh_token: string;
  };
}

export const authService = {
  /**
   * Login with email and password using Supabase Auth
   */
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

    if (authError) {
      throw new Error(authError.message);
    }

    if (!authData.user || !authData.session) {
      throw new Error('Login failed: No user data returned');
    }

    // Fetch the user profile from our users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', credentials.email)
      .single();

    if (userError) {
      throw new Error('Failed to fetch user profile');
    }

    // Store user info in AsyncStorage for quick access
    await AsyncStorage.setItem('user_id', userData.id);
    await AsyncStorage.setItem('user_role', userData.role);
    await AsyncStorage.setItem('user_name', userData.name);
    await AsyncStorage.setItem('employee_code', userData.employee_code);
    if (userData.section_id) {
      await AsyncStorage.setItem('section_id', userData.section_id);
    }

    return {
      user: userData,
      session: {
        access_token: authData.session.access_token,
        refresh_token: authData.session.refresh_token,
      },
    };
  },

  /**
   * Login with employee code (alternative login method)
   */
  loginWithEmployeeCode: async (
    employeeCode: string,
    password: string,
  ): Promise<LoginResponse> => {
    // First, find the user by employee code
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('employee_code', employeeCode)
      .single();

    if (userError || !userData) {
      throw new Error('Invalid employee code');
    }

    if (!userData.email) {
      throw new Error('No email associated with this employee code');
    }

    // Now login with email
    return authService.login({ email: userData.email, password });
  },

  /**
   * Logout and clear session
   */
  logout: async (): Promise<void> => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('Error during logout:', error);
    }

    // Clear stored user data
    await AsyncStorage.multiRemove([
      'user_id',
      'user_role',
      'user_name',
      'employee_code',
      'section_id',
    ]);
  },

  /**
   * Check if user is authenticated and get current session
   */
  checkAuthState: async (): Promise<{
    isAuthenticated: boolean;
    user: User | null;
    role: UserRole | null;
  }> => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return { isAuthenticated: false, user: null, role: null };
    }

    const userId = await AsyncStorage.getItem('user_id');
    const userRole = (await AsyncStorage.getItem(
      'user_role',
    )) as UserRole | null;

    if (userId) {
      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      return {
        isAuthenticated: true,
        user: userData,
        role: userRole,
      };
    }

    return { isAuthenticated: true, user: null, role: null };
  },

  /**
   * Get current user from AsyncStorage (quick access)
   */
  getCurrentUserInfo: async (): Promise<{
    userId: string | null;
    role: UserRole | null;
    name: string | null;
    employeeCode: string | null;
    sectionId: string | null;
  }> => {
    const [userId, role, name, employeeCode, sectionId] = await Promise.all([
      AsyncStorage.getItem('user_id'),
      AsyncStorage.getItem('user_role'),
      AsyncStorage.getItem('user_name'),
      AsyncStorage.getItem('employee_code'),
      AsyncStorage.getItem('section_id'),
    ]);

    return {
      userId,
      role: role as UserRole | null,
      name,
      employeeCode,
      sectionId,
    };
  },

  /**
   * Reset password request
   */
  resetPassword: async (email: string): Promise<void> => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'deepshift://reset-password',
    });

    if (error) {
      throw new Error(error.message);
    }
  },

  /**
   * Update password
   */
  updatePassword: async (newPassword: string): Promise<void> => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      throw new Error(error.message);
    }
  },

  /**
   * Listen to auth state changes
   */
  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    return supabase.auth.onAuthStateChange(callback);
  },
};

export default authService;
