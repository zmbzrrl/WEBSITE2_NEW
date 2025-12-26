// 🏪 REAL DATABASE - This is like a REAL PANTRY for storing designs
// This uses Supabase (a real database service) to store data permanently on the internet
// Think of it like upgrading from a toy kitchen to a real restaurant kitchen

// Use the shared Supabase client to prevent multiple instances
import { supabase } from './supabaseClient';

// 🆔 Helper function to create unique IDs (same as mock database)
const generateId = () => {
  return 'design_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
};

// 📋 SAVE DESIGN FUNCTION - This is like saving a recipe to a REAL recipe book
// This function takes a user's email and design data, then saves it to Supabase
export const saveDesign = async (email: string, designData: any, location?: string, operator?: string) => {
  try {
    console.log('💾 Saving design to Supabase:', designData.projectName)

    let projectId = designData.projectId;
    const projectName = designData.projectName || 'Untitled Project';
    const panelType = designData.panelType || 'Unknown';
    const actualDesignData = {
      ...designData,
      location: location || designData.location,
      operator: operator || designData.operator
    };
    
    // Ensure user exists (satisfy FK on public.user_projects.user_email)
    try {
      await supabase
        .from('users')
        .upsert([{ email }], { onConflict: 'email' })
        .then(() => null as unknown as void, () => null as unknown as void);
    } catch (e) {
      console.warn('⚠️ Could not upsert user before project creation (continuing):', e);
    }

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
      
      // If no existing project found, try exact match then insert (no upsert needed)
      if (!projectId) {
        const { data: exactExisting, error: exactFindErr } = await supabase
          .from('user_projects')
          .select('id, project_name')
          .eq('user_email', email)
          .eq('project_name', baseProjectName)
          .maybeSingle();

        if (!exactFindErr && exactExisting && (exactExisting as any).id) {
          projectId = (exactExisting as any).id as string;
          console.log('✅ Reusing existing project:', (exactExisting as any).project_name);
        } else {
          const { data: projectData, error: projectError } = await supabase
            .from('user_projects')
            .insert([
              {
                user_email: email,
                project_name: baseProjectName,
                project_description: designData.projectDescription || 'Panel customizer project'
              }
            ])
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
    }
    
    // Extract prop_id from designData if available (projectCode is the prop_id)
    const propId = actualDesignData.projectCode || actualDesignData.prop_id || null;
    
    // Create the design record
    const insertData: any = {
      project_id: projectId,
      user_email: email,
      design_name: projectName, // Use full name with revision
      panel_type: panelType,
      design_data: actualDesignData,
      created_at: new Date().toISOString(),
      last_modified: new Date().toISOString()
    };
    
    // Add prop_id if available (required for listPropertyRevisions to find designs)
    if (propId) {
      insertData.prop_id = propId;
    }
    
    const { data, error } = await supabase
      .from('user_designs')
      .insert([insertData])
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
    
    // Fetch all designs for this user (flat). If nested select is needed, add a DB-side view.
    const { data, error } = await supabase
      .from('user_designs')
      .select('*')
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

// 📋 GET ALL DESIGNS (ADMIN) - Fetch designs across all users with optional filters
// This queries the api.designs_with_projects view to include project metadata like location/operator
export const getAllDesigns = async (filters?: {
  location?: string;
  operator?: string;
  service_partner?: string;
  projectName?: string;
  panelType?: string;
  userEmail?: string;
  search?: string; // free-text search across project/design names
  orderBy?: 'last_modified' | 'created_at';
  ascending?: boolean;
  limit?: number;
}) => {
  try {
    const {
      location,
      operator,
      service_partner,
      projectName,
      panelType,
      userEmail,
      search,
      orderBy = 'last_modified',
      ascending = false,
      limit
    } = filters || {};

    let query = supabase
      .from('designs_with_projects')
      .select('*');

    if (location && location.trim() !== '') {
      query = query.ilike('location', `%${location}%`);
    }
    if (operator && operator.trim() !== '') {
      query = query.ilike('operator', `%${operator}%`);
    }
    if (service_partner && service_partner.trim() !== '') {
      query = query.ilike('service_partner', `%${service_partner}%`);
    }
    if (projectName && projectName.trim() !== '') {
      query = query.ilike('project_name', `%${projectName}%`);
    }
    if (panelType && panelType.trim() !== '') {
      query = query.ilike('panel_type', `%${panelType}%`);
    }
    if (userEmail && userEmail.trim() !== '') {
      query = query.ilike('user_email', `%${userEmail}%`);
    }
    if (search && search.trim() !== '') {
      // Search across project and design names
      query = query.or(
        `ilike(project_name,%${search}%),ilike(design_name,%${search}%)`
      );
    }

    query = query.order(orderBy, { ascending });
    if (typeof limit === 'number' && limit > 0) {
      query = query.limit(limit);
    }

    const { data, error } = await query;
    if (!error) {
      return {
        success: true,
        designs: data || [],
        message: 'All designs retrieved successfully from Supabase!'
      };
    }

    // Fallback if the view doesn't exist: join user_designs with user_projects and filter client-side
    console.warn('⚠️ Falling back to joined query because view is missing or not accessible:', error);
    const { data: joined, error: joinError } = await supabase
      .from('user_designs')
      .select('*')
      .eq('is_active', true)
      .order('last_modified', { ascending: true });

    if (joinError) {
      console.error('❌ Error getting all designs via join fallback:', joinError);
      return {
        success: false,
        error: joinError.message,
        message: 'Failed to get all designs from Supabase'
      };
    }

    // Flatten and apply filters client-side
    let flattened = (joined || []).map((d: any) => {
      const dd = d.design_data || {};
      const ddn = dd.designData || {};
      return {
        id: d.id,
        design_name: d.design_name,
        panel_type: d.panel_type,
        design_data: d.design_data,
        created_at: d.created_at,
        last_modified: d.last_modified,
        user_email: d.user_email,
        project_name: undefined,
        project_description: undefined,
        location: dd.location ?? ddn.location ?? null,
        operator: dd.operator ?? ddn.operator ?? null,
        service_partner: dd.service_partner ?? ddn.service_partner ?? null
      };
    });

    const toLower = (s: any) => (s ? String(s).toLowerCase() : '');
    if (location && location.trim() !== '') {
      const loc = location.toLowerCase();
      flattened = flattened.filter(d => toLower(d.location).includes(loc));
    }
    if (operator && operator.trim() !== '') {
      const op = operator.toLowerCase();
      flattened = flattened.filter(d => toLower(d.operator).includes(op));
    }
    if (service_partner && service_partner.trim() !== '') {
      const sp = service_partner.toLowerCase();
      flattened = flattened.filter(d => toLower(d.service_partner).includes(sp));
    }
    if (projectName && projectName.trim() !== '') {
      const pn = projectName.toLowerCase();
      flattened = flattened.filter(d => toLower(d.project_name).includes(pn));
    }
    if (panelType && panelType.trim() !== '') {
      const pt = panelType.toLowerCase();
      flattened = flattened.filter(d => toLower(d.panel_type).includes(pt));
    }
    if (userEmail && userEmail.trim() !== '') {
      const ue = userEmail.toLowerCase();
      flattened = flattened.filter(d => toLower(d.user_email).includes(ue));
    }
    if (search && search.trim() !== '') {
      const s = search.toLowerCase();
      flattened = flattened.filter(d => toLower(d.project_name).includes(s) || toLower(d.design_name).includes(s));
    }

    flattened.sort((a: any, b: any) => {
      const key = orderBy === 'created_at' ? 'created_at' : 'last_modified';
      const av = new Date(a[key] || 0).getTime();
      const bv = new Date(b[key] || 0).getTime();
      return ascending ? av - bv : bv - av;
    });

    const limited = typeof limit === 'number' && limit > 0 ? flattened.slice(0, limit) : flattened;
    return {
      success: true,
      designs: limited,
      message: 'All designs retrieved successfully from Supabase (join fallback)'
    };
  } catch (error) {
    console.error('❌ Unexpected error getting all designs:', error);
    return {
      success: false,
      error: 'Unexpected error',
      message: 'Failed to get all designs'
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
    console.log('🔍 Supabase client created successfully');
    
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
    
    // Use the shared client instead of direct API calls
    const { data, error } = await supabase
      .from('user_projects')
      .select('count')
      .limit(1);
    
    if (error) {
      console.log('🔌 Error response:', error.message);
      return {
        success: false,
        error: error.message,
        status: 'error'
      };
    } else {
      console.log('🔌 Response data:', data);
      return {
        success: true,
        message: 'Basic connection successful',
        status: 'success'
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