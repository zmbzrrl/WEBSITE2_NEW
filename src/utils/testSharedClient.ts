// 🧪 TEST SHARED CLIENT
// This file tests if the shared Supabase client is working correctly

import { supabase, testSupabaseConnection } from './supabaseClient';

// Test the shared client
export const testSharedClient = async () => {
  console.log('🧪 Testing shared Supabase client...');
  
  try {
    // Test 1: Basic connection
    const connectionResult = await testSupabaseConnection();
    console.log('Connection test result:', connectionResult);
    
    // Test 2: Simple query
    const { data, error } = await supabase
      .from('user_projects')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Query test failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
    
    console.log('✅ Query test successful:', data);
    return {
      success: true,
      message: 'Shared client is working correctly'
    };
  } catch (error) {
    console.error('❌ Shared client test failed:', error);
    return {
      success: false,
      error: 'Unexpected error'
    };
  }
};
