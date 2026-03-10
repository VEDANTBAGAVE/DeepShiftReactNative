import { createClient, SupabaseClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Fallback values for development - these will be used if react-native-config fails to load
const FALLBACK_SUPABASE_URL = 'https://qazktinpnflxccvwfehg.supabase.co';
const FALLBACK_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFhemt0aW5wbmZseGNjdndmZWhnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3MTAyMzAsImV4cCI6MjA4NTI4NjIzMH0.esDw-cis9Mn41KAmAa0jSFQ4h95nklv-yUKYwA4Ndi4';

// Try to get config from react-native-config, with fallbacks
let SUPABASE_URL = FALLBACK_SUPABASE_URL;
let SUPABASE_ANON_KEY = FALLBACK_SUPABASE_ANON_KEY;

try {
  // Dynamic import to handle cases where react-native-config may not be properly linked
  const Config = require('react-native-config').default;
  if (Config && Config.SUPABASE_URL) {
    SUPABASE_URL = Config.SUPABASE_URL;
  }
  if (Config && Config.SUPABASE_ANON_KEY) {
    SUPABASE_ANON_KEY = Config.SUPABASE_ANON_KEY;
  }
} catch (error) {
  console.warn('react-native-config not available, using fallback values');
}

// Create Supabase client with React Native AsyncStorage for session persistence
export const supabase: SupabaseClient = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  },
);

// Helper to get the current user
export const getCurrentUser = async () => {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error) {
    console.error('Error getting current user:', error);
    return null;
  }
  return user;
};

// Helper to get current session
export const getSession = async () => {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();
  if (error) {
    console.error('Error getting session:', error);
    return null;
  }
  return session;
};

export default supabase;
