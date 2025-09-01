// 🧪 DATABASE TEST SCRIPT
// This file helps test if your Supabase connection is working properly

// Use the shared Supabase client to prevent multiple instances
import { supabase } from './supabaseClient';

// 🧪 TEST BASIC CONNECTION
export const testBasicConnection = async () => {
  try {
    console.log('🔍 Testing basic Supabase connection...');
    
    // Test if we can connect to Supabase
    const { data, error } = await supabase
      .from('user_projects')
      .select('count')
      .limit(1);

    if (error) {
      console.error('❌ Connection failed:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to connect to Supabase'
      };
    }

    console.log('✅ Basic connection successful!');
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

// 🧪 TEST TABLE STRUCTURE
export const testTableStructure = async () => {
  try {
    console.log('🔍 Testing table structure...');
    
    // Test if all required tables exist
    const tables = ['user_projects', 'user_designs', 'panel_configurations', 'design_versions'];
    const results = {};

    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);

      if (error) {
        console.error(`❌ Table ${table} not accessible:`, error);
        results[table] = { exists: false, error: error.message };
      } else {
        console.log(`✅ Table ${table} accessible`);
        results[table] = { exists: true };
      }
    }

    return {
      success: true,
      results,
      message: 'Table structure test completed'
    };
  } catch (error) {
    console.error('❌ Error testing table structure:', error);
    return {
      success: false,
      error: 'Unexpected error',
      message: 'Failed to test table structure'
    };
  }
};

// 🧪 TEST SAMPLE DATA INSERTION
export const testSampleDataInsertion = async () => {
  try {
    console.log('🔍 Testing sample data insertion...');
    
    // Create a test project
    const { data: projectData, error: projectError } = await supabase
      .from('user_projects')
      .insert([{
        user_email: 'test@example.com',
        project_name: 'Test Project - ' + new Date().toISOString(),
        project_description: 'Test project created by database test'
      }])
      .select()
      .single();

    if (projectError) {
      console.error('❌ Failed to create test project:', projectError);
      return {
        success: false,
        error: projectError.message,
        message: 'Failed to create test project'
      };
    }

    console.log('✅ Test project created:', projectData);

    // Create a test design
    const { data: designData, error: designError } = await supabase
      .from('user_designs')
      .insert([{
        project_id: projectData.id,
        user_email: 'test@example.com',
        design_name: 'Test Design',
        panel_type: 'SP',
        design_data: {
          panelType: 'SP',
          icons: [
            { iconId: 'B-1', label: 'Test Icon', position: 1, text: 'TEST' }
          ],
          design: {
            backgroundColor: '#ffffff',
            iconColor: '#1b92d1',
            textColor: '#333333'
          }
        }
      }])
      .select()
      .single();

    if (designError) {
      console.error('❌ Failed to create test design:', designError);
      return {
        success: false,
        error: designError.message,
        message: 'Failed to create test design'
      };
    }

    console.log('✅ Test design created:', designData);

    // Clean up test data
    await supabase.from('user_designs').delete().eq('id', designData.id);
    await supabase.from('user_projects').delete().eq('id', projectData.id);

    return {
      success: true,
      message: 'Sample data insertion test successful!'
    };
  } catch (error) {
    console.error('❌ Error testing sample data insertion:', error);
    return {
      success: false,
      error: 'Unexpected error',
      message: 'Failed to test sample data insertion'
    };
  }
};

// 🧪 RUN ALL TESTS
export const runAllTests = async () => {
  console.log('🚀 Starting database tests...\n');

  const tests = [
    { name: 'Basic Connection', test: testBasicConnection },
    { name: 'Table Structure', test: testTableStructure },
    { name: 'Sample Data Insertion', test: testSampleDataInsertion }
  ];

  const results = [];

  for (const { name, test } of tests) {
    console.log(`\n🧪 Running ${name} test...`);
    const result = await test();
    results.push({ name, ...result });
    
    if (result.success) {
      console.log(`✅ ${name} test passed!`);
    } else {
      console.log(`❌ ${name} test failed:`, result.message);
    }
  }

  console.log('\n📊 Test Results Summary:');
  results.forEach(({ name, success, message }) => {
    console.log(`${success ? '✅' : '❌'} ${name}: ${message}`);
  });

  const allPassed = results.every(r => r.success);
  console.log(`\n${allPassed ? '🎉 All tests passed!' : '⚠️ Some tests failed.'}`);

  return results;
};
