// 🔌 SHARED SUPABASE CLIENT
// This creates a single, shared Supabase client instance to prevent multiple instances
// Think of it like having one key to the storage room instead of multiple keys

import { createClient } from '@supabase/supabase-js';

// 🔑 SUPABASE CONFIGURATION (ENVIRONMENT VARIABLES)
const defaultSupabaseUrl = 'https://mrlylobdobgchbuvyqqv.supabase.co';
const fallbackSupabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ybHlsb2Jkb2JnY2hidXZ5cXF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg1Njc4MTksImV4cCI6MjA3NDE0MzgxOX0.0DbMXqIM_Rx9vXgG_c6HapDGk0Cy1luo5LtDI1S2Tr8';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || defaultSupabaseUrl;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || fallbackSupabaseKey;

export const isUsingDefaultSupabase =
  (!import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL === defaultSupabaseUrl) &&
  supabaseUrl === defaultSupabaseUrl;

// 🏪 Create a single, shared database connection
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false
  }
});

// 🌐 Expose to window for console testing (dev only)
if (typeof window !== 'undefined') {
  (window as any).testSupabase = async () => {
    console.log('🔌 Testing Supabase connection...');
    console.log('📍 Supabase URL:', supabaseUrl);
    console.log('🔑 Using key:', supabaseKey.substring(0, 20) + '...');
    
    try {
      const { data, error } = await supabase
        .from('users')
        .select('email', { count: 'exact', head: true });
      
      if (error) {
        console.error('❌ Connection failed:', error);
        return { success: false, error: error.message };
      }
      
      console.log('✅ Connection successful!');
      return { success: true, url: supabaseUrl };
    } catch (err) {
      console.error('❌ Error:', err);
      return { success: false, error: err };
    }
  };
}

// 🧪 Test function to verify the client is working
export const testSupabaseConnection = async () => {
  try {
    console.log('🔌 Testing shared Supabase connection...');
    
    const { data, error } = await supabase
      .from('users')
      .select('email', { count: 'exact', head: true });

    if (error) {
      console.error('❌ Shared connection failed:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to connect to Supabase'
      };
    }

    console.log('✅ Shared connection successful!');
    return {
      success: true,
      message: 'Successfully connected to Supabase!'
    };
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return {
      success: false,
      error: 'Unexpected error',
      message: 'Failed to test connection'
    };
  }
};
