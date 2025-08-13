// 🏪 REAL DATABASE - This is like a REAL PANTRY for storing designs
// This uses Supabase (a real database service) to store data permanently on the internet
// Think of it like upgrading from a toy kitchen to a real restaurant kitchen

import { createClient } from '@supabase/supabase-js';

// 🔑 SUPABASE CONFIGURATION (ENVIRONMENT VARIABLES)
// These are like the keys to your restaurant's storage room
// Get these from: Supabase Dashboard → Settings → API
// Both URL and key are FREE forever!

// Use environment variables for security (fallback to hardcoded values for development)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://pygpeqxuedvyzuocdnpt.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB5Z3BlcXh1ZWR2eXp1b2NkbnB0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4NDQ2NDEsImV4cCI6MjA3MDQyMDY0MX0.oWbvIjxuX_NcZSe9qxLGW5-zl9VIGs3ZC5z3AZpqAz8';

// 🏪 Create the database connection (like getting the keys to the storage room)
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false
  },
  db: {
    schema: 'api'  // Changed from 'public' to 'api' to match your project configuration
  }
});

// 🆔 Helper function to create unique IDs (same as mock database)
const generateId = () => {
  return 'design_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
};

// 💾 SAVE DESIGN FUNCTION - This is like putting a recipe in the REAL pantry
// This function takes a user's email and their design data, then saves it to Supabase
export const saveDesign = async (email: string, designData: any) => {
  try {
    console.log('💾 Saving design to Supabase:', designData.projectName);
    console.log('📋 Design data:', designData);
    
    // Handle different data structures
    let projectName = designData.projectName;
    let panelType = designData.panelType;
    let actualDesignData = designData.designData;
    
    // If the data is nested differently, extract it
    if (designData.designData && designData.designData.projectName) {
      projectName = designData.designData.projectName;
      actualDesignData = designData.designData;
    }
    
    // First, create or get the project
    let projectId = designData.projectId;
    
    if (!projectId) {
      // Try to find existing project with the same base name (without revision)
      const baseProjectName = projectName.replace(/\s*\(rev\d+\)$/, '');
      
      const { data: existingProjects, error: findError } = await supabase
        .from('user_projects')
        .select('id, project_name')
        .eq('user_email', email)
        .ilike('project_name', `${baseProjectName}%`);
      
      if (findError) {
        console.error('❌ Error finding existing projects:', findError);
      } else if (existingProjects && existingProjects.length > 0) {
        // Use the first existing project
        projectId = existingProjects[0].id;
        console.log('✅ Found existing project:', existingProjects[0].project_name);
      }
      
      // If no existing project found, create a new one
      if (!projectId) {
        const { data: projectData, error: projectError } = await supabase
          .from('user_projects')
          .insert([{
            user_email: email,
            project_name: baseProjectName, // Use base name without revision
            project_description: designData.projectDescription || 'Panel customizer project'
          }])
          .select()
          .single();

        if (projectError) {
          console.error('❌ Error creating project:', projectError);
          return {
            success: false,
            error: projectError.message,
            message: 'Failed to create project'
          };
        }
        
        projectId = projectData.id;
        console.log('✅ Created new project:', baseProjectName);
      }
    }
    
    // Create the design record
    const { data, error } = await supabase
      .from('user_designs')
      .insert([{
        project_id: projectId,
        user_email: email,
        design_name: projectName, // Use full name with revision
        panel_type: panelType,
        design_data: actualDesignData,
        created_at: new Date().toISOString(),
        last_modified: new Date().toISOString()
      }])
      .select();

    if (error) {
      console.error('❌ Error saving design:', error);
      console.error('❌ Error details:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      return {
        success: false,
        error: error.message,
        message: 'Failed to save design to Supabase'
      };
    }

    console.log('✅ Design saved successfully:', data);
    return {
      success: true,
      designId: data[0].id,
      projectId: projectId,
      message: 'Design saved successfully to Supabase!'
    };
  } catch (error) {
    console.error('❌ Unexpected error saving design:', error);
    return {
      success: false,
      error: 'Unexpected error',
      message: 'Failed to save design'
    };
  }
};

// 📋 GET DESIGNS FUNCTION - This is like looking through a customer's REAL recipe folder
// This function takes a user's email and returns all their saved designs from Supabase
export const getDesigns = async (email: string) => {
  try {
    console.log('📋 Getting designs from Supabase for:', email);
    
    // Get all designs for this user with project information
    const { data, error } = await supabase
      .from('user_designs')
      .select(`
        *,
        user_projects (
          id,
          project_name,
          project_description
        )
      `)
      .eq('user_email', email)
      .eq('is_active', true)
      .order('last_modified', { ascending: false });

    if (error) {
      console.error('❌ Error getting designs:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to get designs from Supabase'
      };
    }

    console.log('✅ Designs retrieved successfully:', data);
    return {
      success: true,
      designs: data || [],
      message: 'Designs retrieved successfully from Supabase!'
    };
  } catch (error) {
    console.error('❌ Unexpected error getting designs:', error);
    return {
      success: false,
      error: 'Unexpected error',
      message: 'Failed to get designs'
    };
  }
};

// 🗑️ DELETE DESIGN FUNCTION - This is like throwing away a recipe from the REAL pantry
// This function takes a user's email and a design ID, then removes that design from Supabase
export const deleteDesign = async (email: string, designId: string) => {
  try {
    console.log('🗑️ Deleting design from Supabase:', designId);
    
    // Delete the design (only if it belongs to the user)
    const { error } = await supabase
      .from('user_designs')
      .delete()
      .eq('id', designId)
      .eq('user_email', email);

    if (error) {
      console.error('❌ Error deleting design:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to delete design from Supabase'
      };
    }

    console.log('✅ Design deleted successfully');
    return {
      success: true,
      message: 'Design deleted successfully from Supabase!'
    };
  } catch (error) {
    console.error('❌ Unexpected error deleting design:', error);
    return {
      success: false,
      error: 'Unexpected error',
      message: 'Failed to delete design'
    };
  }
};

// 🔄 UPDATE DESIGN FUNCTION - This is like editing an existing recipe
// This function takes a user's email, design ID, and updated design data, then updates the existing design
export const updateDesign = async (email: string, designId: string, updatedDesignData: any) => {
  try {
    console.log('🔄 Updating design in Supabase:', designId);
    
    // Handle different data structures
    let projectName = updatedDesignData.projectName;
    let panelType = updatedDesignData.panelType;
    let actualDesignData = updatedDesignData.designData;
    
    // If the data is nested differently, extract it
    if (updatedDesignData.designData && updatedDesignData.designData.projectName) {
      projectName = updatedDesignData.designData.projectName;
      actualDesignData = updatedDesignData.designData;
    }
    
    // Update the design (only if it belongs to the user)
    const { data, error } = await supabase
      .from('user_designs')
      .update({
        design_name: projectName,
        panel_type: panelType,
        design_data: actualDesignData,
        last_modified: new Date().toISOString()
      })
      .eq('id', designId)
      .eq('user_email', email)
      .select();

    if (error) {
      console.error('❌ Error updating design:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to update design in Supabase'
      };
    }

    console.log('✅ Design updated successfully:', data);
    return {
      success: true,
      message: 'Design updated successfully in Supabase!'
    };
  } catch (error) {
    console.error('❌ Unexpected error updating design:', error);
    return {
      success: false,
      error: 'Unexpected error',
      message: 'Failed to update design'
    };
  }
};

// 🔍 DEBUG FUNCTION - This shows you exactly what's in the REAL database
// This is like opening the filing cabinet and looking at everything
export const debugDatabase = async () => {
  try {
    console.log('🔍 Debugging Supabase database...');
    
    const { data, error } = await supabase
      .from('user_designs')
      .select('*')
      .limit(10);

    if (error) {
      console.error('❌ Error debugging database:', error);
      return null;
    }

    console.log('📊 Database contents:', data);
    return data;
  } catch (error) {
    console.error('❌ Unexpected error debugging database:', error);
    return null;
  }
};

// 🧪 TEST CONNECTION FUNCTION - Simple test to verify Supabase connection
export const testConnection = async () => {
  try {
    console.log('🧪 Testing Supabase connection...');
    
    // Test 1: Try to get the Supabase client info
    console.log('🔍 Supabase URL:', supabaseUrl);
    console.log('🔍 Supabase Key length:', supabaseKey.length);
    
    // Test 2: Try a simple health check
    const { data: healthData, error: healthError } = await supabase
      .from('_supabase_migrations')
      .select('*')
      .limit(1);
    
    if (healthError) {
      console.log('⚠️ Health check failed (expected):', healthError.message);
    } else {
      console.log('✅ Health check passed');
    }
    
    // Test 3: Try to list all tables
    const { data: tablesData, error: tablesError } = await supabase
      .rpc('get_tables');
    
    if (tablesError) {
      console.log('⚠️ Tables check failed:', tablesError.message);
    } else {
      console.log('✅ Tables check passed:', tablesData);
    }
    
    // Test 4: Try the actual table query
    const { count, error } = await supabase
      .from('user_designs')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error('❌ Connection test failed:', error);
      console.error('❌ Error details:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      return {
        success: false,
        error: error.message || 'Unknown error',
        details: {
          code: error.code,
          details: error.details,
          hint: error.hint
        }
      };
    }

    console.log('✅ Connection test successful! Row count:', count);
    return {
      success: true,
      rowCount: count
    };
  } catch (error) {
    console.error('❌ Unexpected error in connection test:', error);
    return {
      success: false,
      error: 'Unexpected error: ' + (error as any).message
    };
  }
}; 

// 🔌 BASIC CONNECTION TEST - Test if we can connect to Supabase at all
export const testBasicConnection = async () => {
  try {
    console.log('🔌 Testing basic Supabase connection...');
    
    // Try to make a simple request to the Supabase API
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      method: 'GET',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('🔌 Response status:', response.status);
    console.log('🔌 Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const data = await response.text();
      console.log('🔌 Response data:', data);
      return {
        success: true,
        message: 'Basic connection successful',
        status: response.status
      };
    } else {
      const errorText = await response.text();
      console.log('🔌 Error response:', errorText);
      return {
        success: false,
        error: `HTTP ${response.status}: ${errorText}`,
        status: response.status
      };
    }
  } catch (error) {
    console.error('🔌 Basic connection test failed:', error);
    return {
      success: false,
      error: 'Connection failed: ' + (error as any).message
    };
  }
}; 