import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys
export const STORAGE_KEYS = {
  ATTENDANCE: '@deepshift_attendance',
  SHIFTS: '@deepshift_shifts',
  INCIDENTS: '@deepshift_incidents',
  REMARKS: '@deepshift_remarks',
  TASKS: '@deepshift_tasks',
  SETTINGS: '@deepshift_settings',
  DRAFT: '@deepshift_draft',
  TOOLTIPS_SHOWN: '@deepshift_tooltips',
  DEMO_MODE: '@deepshift_demo_mode',
};

// Generic storage helpers
export const storage = {
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await AsyncStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error(`Error reading ${key}:`, error);
      return null;
    }
  },

  async set<T>(key: string, value: T): Promise<boolean> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Error saving ${key}:`, error);
      return false;
    }
  },

  async remove(key: string): Promise<boolean> {
    try {
      await AsyncStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error removing ${key}:`, error);
      return false;
    }
  },

  async clear(): Promise<boolean> {
    try {
      await AsyncStorage.clear();
      return true;
    } catch (error) {
      console.error('Error clearing storage:', error);
      return false;
    }
  },
};
