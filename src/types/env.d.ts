// Type declarations for react-native-config
declare module 'react-native-config' {
  export interface NativeConfig {
    // Supabase
    SUPABASE_URL: string;
    SUPABASE_ANON_KEY: string;

    // Firebase (future)
    FIREBASE_API_KEY?: string;
    FIREBASE_AUTH_DOMAIN?: string;
    FIREBASE_PROJECT_ID?: string;
    FIREBASE_STORAGE_BUCKET?: string;
    FIREBASE_MESSAGING_SENDER_ID?: string;
    FIREBASE_APP_ID?: string;

    // Google Maps (future)
    GOOGLE_MAPS_API_KEY?: string;

    // App
    APP_ENV?: 'development' | 'staging' | 'production';
  }

  export const Config: NativeConfig;
  export default Config;
}
