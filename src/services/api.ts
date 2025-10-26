import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Create axios instance with base URL
// Replace with your actual API base URL
const api = axios.create({
  baseURL: 'https://api.deepshift.com',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for adding auth token
api.interceptors.request.use(
  async config => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error),
);

// Authentication service
export const authService = {
  login: async (email: string, password: string) => {
    try {
      const response = await api.post('/api/auth/login', { email, password });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  logout: async () => {
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user_id');
      await AsyncStorage.removeItem('user_role');
    } catch (error) {
      console.error('Error during logout:', error);
      throw error;
    }
  },

  checkAuthState: async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const userId = await AsyncStorage.getItem('user_id');
      const userRole = await AsyncStorage.getItem('user_role');

      if (token && userId && userRole) {
        return { token, userId, userRole };
      }
      return null;
    } catch (error) {
      console.error('Error checking auth state:', error);
      return null;
    }
  },
};

export default api;
