// 🏗️ NEW DATABASE - Clean hierarchy: Property → User Groups → Users
// This replaces the old database system with your 3-table structure

import { supabase } from './supabaseClient';

// 🆔 Helper function to create unique IDs
const generateId = () => {
  return 'design_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
};

// (no schema helper needed; using public tables)

// List properties the requester can access via their UG (many-to-many)
export const getAccessibleProperties = async (userEmail: string) => {
  try {
    // Get user's UG ID
    const usersRes = await supabase
      .from('users')
      .select('email, ug_id')
      .eq('email', userEmail)
      .limit(1);

    if (usersRes.error) return { success: false, error: 'db', properties: [] as any[] };
    const userRow = (usersRes.data && usersRes.data[0]) || null;
    if (!userRow) return { success: true, properties: [] };

    const ugId = (userRow as any).ug_id as string | null;
    if (!ugId) return { success: true, properties: [] };

    // Get access links for this UG
    const { data: links, error: linkErr } = await supabase
      .from('ug_property_access')
      .select('prop_id, ug_id, is_active')
      .eq('ug_id', ugId)
      .eq('is_active', true);
    if (linkErr) return { success: false, error: 'db', properties: [] as any[] };

    const propIds = (links || []).map((r: any) => String(r.prop_id)).filter(Boolean);
    if (propIds.length === 0) return { success: true, properties: [] };

    // Fetch properties by id
    const { data: props, error: propErr } = await supabase
      .from('property')
      .select('prop_id, property_name, region, is_active')
      .in('prop_id', propIds)
      .eq('is_active', true)
      .order('region', { ascending: true });
    if (propErr) return { success: false, error: 'db', properties: [] as any[] };

    const mapped = (props || []).map((p: any) => ({ prop_id: p.prop_id, property_name: p.property_name, region: p.region }));
    return { success: true, properties: mapped };
  } catch {
    return { success: false, error: 'unexpected', properties: [] as any[] };
  }
};

export const hasPropertyAccess = async (userEmail: string, propId: string) => {
  const usersRes = await supabase
    .from('users')
    .select('email, ug_id')
    .eq('email', userEmail)
    .limit(1);

  if (usersRes.error) return false;
  const userRow = (usersRes.data && usersRes.data[0]) || null;
  if (!userRow || !(userRow as any).ug_id) return false;

  const ugId = (userRow as any).ug_id as string;

  const { data: linkArr, error } = await supabase
    .from('ug_property_access')
    .select('ug_id')
    .eq('ug_id', ugId)
    .eq('prop_id', propId)
    .limit(1);
  if (error) return false;
  return !!(linkArr && linkArr[0]);
};

// 📋 SAVE LAYOUT FUNCTION - uses project context like panel designs
export const saveLayout = async (userEmail: string, layoutData: any, projectCode?: string) => {
  try {
    console.log('💾 Saving layout:', layoutData.layoutName, 'for project:', projectCode);

    // Ensure user exists
    try {
      await supabase
        .from('users')
        .upsert([{ email: userEmail }], { onConflict: 'email' })
        .then(() => null as unknown as void, () => null as unknown as void);
    } catch (e) {
      console.warn('⚠️ Could not upsert user before layout creation (continuing):', e);
    }

    // Find or create project (same logic as panel designs)
    let projectId = layoutData.projectId;
    const projectName = layoutData.projectName || 'Untitled Project';
    
    if (!projectId && projectCode) {
      // Try to find existing project by project code (stored in project_description)
      console.log('🔍 Looking for existing project with code:', projectCode, 'for user:', userEmail);
      const { data: existingProjects, error: findError } = await supabase
        .from('user_projects')
        .select('id, project_name, project_description')
        .eq('user_email', userEmail)
        .eq('project_description', projectCode);
      
      console.log('🔍 Project lookup result:', { existingProjects, findError });
      
      if (!findError && existingProjects && existingProjects.length > 0) {
        projectId = existingProjects[0].id;
        console.log('✅ Found existing project:', existingProjects[0].project_name, 'for code:', projectCode);
      } else {
        console.log('❌ No existing project found for code:', projectCode);
      }
    }

    if (!projectId) {
      // Create new project with project code in description
      const baseProjectName = projectName.replace(/\s*\(rev\d+\)$/, '');
      const { data: projectData, error: projectError } = await supabase
        .from('user_projects')
        .insert([
          {
            user_email: userEmail,
            project_name: baseProjectName,
            project_description: projectCode || layoutData.projectDescription || 'Layout project'
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
      console.log('✅ Created new project:', baseProjectName, 'with code:', projectCode);
    }

    // prop_id is required - use projectCode as prop_id
    const propId = projectCode || layoutData.projectCode;
    if (!propId) {
      console.error('❌ prop_id is required but projectCode is missing');
      return {
        success: false,
        error: 'Missing project code',
        message: 'Project code (prop_id) is required to save layouts. Please select a property first.'
      };
    }

    // Insert into layouts table with project context
    // Match the table structure: layout_name is a direct column, not inside layout_data
    const insertPayload: any = {
      user_email: userEmail,
      project_id: projectId,
      prop_id: propId, // prop_id is required and NOT NULL
      layout_name: layoutData.layoutName || 'Untitled Layout',
      layout_data: layoutData, // Store all layout data in JSONB
      created_at: new Date().toISOString(),
      last_modified: new Date().toISOString(),
      is_active: true
    };
    
    console.log('🔍 Inserting layout with payload:', insertPayload);
    
    const { data, error } = await supabase
      .from('layouts')
      .insert([insertPayload])
      .select('id')
      .single();
      
    console.log('🔍 Insert result:', { data, error });
      
    if (error) {
      console.error('❌ Database error:', error);
      return { success: false, error: 'db', message: 'Failed to save layout to database: ' + error.message };
    }

    return { success: true, layoutId: (data as any)?.id, message: `Layout "${layoutData.layoutName}" saved successfully!` };
  } catch (error) {
    return { success: false, error: 'unexpected', message: 'Failed to save layout' };
  }
};

// 📋 GET LAYOUTS FUNCTION - by user (project context)
export const getLayouts = async (userEmail: string, projectCode?: string) => {
  try {
    console.log('📋 Getting layouts for user:', userEmail, 'project:', projectCode);

    let projectId: string | null = null;

    // If projectCode provided, first look up the project ID
    if (projectCode) {
      console.log('🔍 Looking up project ID for code:', projectCode, 'user:', userEmail);
      const { data: existingProjects, error: findError } = await supabase
        .from('user_projects')
        .select('id, project_name, project_description')
        .eq('user_email', userEmail)
        .eq('project_description', projectCode)
        .maybeSingle();
      
      if (findError) {
        console.error('❌ Error finding project:', findError);
        return { success: false, error: 'db', message: 'Failed to find project: ' + findError.message };
      }

      if (existingProjects) {
        projectId = existingProjects.id;
        console.log('✅ Found project ID:', projectId, 'for code:', projectCode);
      } else {
        console.log('⚠️ No project found for code:', projectCode, '- returning empty layouts');
        return { success: true, layouts: [], message: 'No project found for this code' };
      }
    }

    // Query layouts - filter by project_id if we have one
    let query = supabase
      .from('layouts')
      .select('*')
      .eq('user_email', userEmail)
      .eq('is_active', true);
    
    if (projectId) {
      query = query.eq('project_id', projectId);
    }

    query = query.order('last_modified', { ascending: false });

    const { data, error } = await query;

    console.log('🔍 Get layouts result:', { data: data?.length || 0, error, projectCode, projectId });

    if (error) {
      console.error('❌ Error getting layouts:', error);
      return { success: false, error: 'db', message: 'Failed to get layouts: ' + error.message };
    }

    return { success: true, layouts: data || [], message: 'Layouts retrieved successfully!' };
  } catch (error) {
    console.error('❌ Unexpected error getting layouts:', error);
    return { success: false, error: 'unexpected', message: 'Failed to get layouts' };
  }
};

// 👤 GET USER HIERARCHY - Gets user's complete hierarchy information
export const getUserHierarchy = async (userEmail: string) => {
  try {
    console.log('👤 Getting user hierarchy for:', userEmail);

    // 1) Base user
  const { data: usersArr, error: userErr } = await supabase
    .from('users')
      .select('email, ug_id')
      .eq('email', userEmail)
      .limit(1);
    const user = (usersArr && usersArr[0]) || null;
    if (userErr || !user) {
      return { success: false, error: 'User not found', message: 'User not found in the system hierarchy' };
    }

    // 2) Single UG only
    const ugIdList = (user as any).ug_id ? [(user as any).ug_id as string] : [];

    // 3) Details for UGs
  const { data: ugDetails } = ugIdList.length > 0 ? await supabase
    .from('ug')
    .select('id, ug, prop_id')
    .in('id', ugIdList) : { data: [] as any[] } as any;

    // 4) Accessible properties via UGs
  const { data: ugProps } = ugIdList.length > 0 ? await supabase
    .from('ug_property_access')
      .select('ug_id, prop_id')
      .in('ug_id', ugIdList)
      .eq('is_active', true) : { data: [] as any[] } as any;
    const propIds = Array.from(new Set<string>((ugProps || []).map((r: any) => r.prop_id)));
  const { data: props } = propIds.length > 0 ? await supabase
    .from('property')
    .select('prop_id, property_name, region')
    .in('prop_id', propIds) : { data: [] as any[] } as any;

    return {
      success: true,
      user: {
        email: (user as any).email,
        ugIds: ugIdList,
        groups: (ugDetails || []).map((g: any) => ({ UG_PropID: g.id, ug: g.ug, prop_id: g.prop_id })),
        accessibleProperties: (props || []).map((p: any) => ({ prop_id: p.prop_id, property_name: p.property_name, region: p.region }))
      },
      message: 'User hierarchy retrieved successfully!'
    } as const;
  } catch (error) {
    console.error('❌ Error getting user hierarchy:', error);
    return { success: false, error: 'Unexpected error', message: 'Failed to get user hierarchy' };
  }
};

// 🏢 GET ALL PROPERTIES - Gets all properties for admin use
export const getAllProperties = async () => {
  try {
    const { data, error } = await supabase
      .from('property')
      .select('*')
      .eq('is_active', true)
      .order('region', { ascending: true });

    if (error) {
      console.error('❌ Error getting properties:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to get properties'
      };
    }

    const mapped = (data || []).map((p: any) => ({ prop_id: p.prop_id, property_name: p.property_name, region: p.region, is_active: p.is_active }));
    return {
      success: true,
      properties: mapped,
      message: 'Properties retrieved successfully!'
    };
  } catch (error) {
    console.error('❌ Error getting properties:', error);
    return {
      success: false,
      error: 'Unexpected error',
      message: 'Failed to get properties'
    };
  }
};

// 👥 GET USER GROUPS FOR PROPERTY - Gets all user groups for a specific property
export const getUserGroupsForProperty = async (propId: string) => {
  try {
    const { data, error } = await supabase
      .from('ug')
      .select('*')
      .eq('prop_id', propId)
      .eq('is_active', true)
      .order('ug', { ascending: true });

    if (error) {
      console.error('❌ Error getting user groups:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to get user groups'
      };
    }

    return {
      success: true,
      userGroups: data || [],
      message: 'User groups retrieved successfully!'
    };
  } catch (error) {
    console.error('❌ Error getting user groups:', error);
    return {
      success: false,
      error: 'Unexpected error',
      message: 'Failed to get user groups'
    };
  }
};

// 🔄 LOAD LAYOUT FUNCTION - load layout by user
export const loadLayout = async (layoutId: string, userEmail: string) => {
  try {
    const { data, error } = await supabase
      .from('layouts')
      .select('*')
      .eq('id', layoutId)
      .eq('user_email', userEmail)
      .eq('is_active', true)
      .single();

    if (error || !data) {
      console.error('❌ Error loading layout:', error);
      return { success: false, error: 'not_found', message: 'Layout not found' };
    }

    // Extract layout data - layout_name is a direct column, layout_data contains the rest
    const layoutData = data.layout_data || {};
    
    return { 
      success: true, 
      layout: {
        id: data.id,
        layout_name: data.layout_name,
        layout_data: layoutData,
        project_id: data.project_id,
        user_email: data.user_email,
        created_at: data.created_at,
        last_modified: data.last_modified
      }, 
      message: `Layout "${data.layout_name || 'Untitled'}" loaded successfully!` 
    };
  } catch (error) {
    console.error('❌ Unexpected error loading layout:', error);
    return { success: false, error: 'unexpected', message: 'Failed to load layout' };
  }
};

// 🏗️ CREATE PROPERTY FUNCTION - Creates a new property with project code
export const createProperty = async (userEmail: string, propertyData: {
  projectCode: string;
  propertyName: string;
  region: string;
}) => {
  try {
    console.log('🏗️ Creating new property:', propertyData.projectCode);

    // Verify user exists in hierarchy
    const { data: usersArr, error: userErr } = await supabase
      .from('users')
      .select('email, ug_id')
      .eq('email', userEmail)
      .limit(1);
    if (userErr) {
      return {
        success: false,
        error: 'db',
        message: 'Failed to look up user'
      };
    }
    const userRow = (usersArr && usersArr[0]) || null;
    if (!userRow) {
      return {
        success: false,
        error: 'User not found',
        message: 'Please contact your administrator to set up your user account'
      };
    }

    // Check if project code already exists
    const { data: existArr } = await supabase
      .from('property')
      .select('prop_id')
      .eq('prop_id', propertyData.projectCode)
      .limit(1);

    if (existArr && existArr[0]) {
      return {
        success: false,
        error: 'Project code exists',
        message: 'A property with this project code already exists'
      };
    }

    // Create new property
    const newProperty = {
      prop_id: propertyData.projectCode, // Use project code as prop_id
      property_name: propertyData.propertyName,
      region: propertyData.region,
      created_at: new Date().toISOString(),
      last_modified: new Date().toISOString(),
      is_active: true
    };

    const { error: insErr } = await supabase
      .from('property')
      .insert([newProperty]);

    if (insErr) {
      console.error('❌ Database error creating property:', insErr);
      return {
        success: false,
        error: 'Database error',
        message: 'Failed to create property'
      };
    }

    // Auto-grant access to the creator's UG
    const ugId = (userRow as any).ug_id as string;
    await supabase
      .from('ug_property_access')
      .insert([{ ug_id: ugId, prop_id: newProperty.prop_id }])
      .then(() => null as unknown as void, () => null as unknown as void);

    console.log('✅ Property created and access granted');
    return {
      success: true,
      property: newProperty,
      message: `Property "${propertyData.propertyName}" created successfully!`
    };

  } catch (error) {
    console.error('❌ Error creating property:', error);
    return {
      success: false,
      error: 'Unexpected error',
      message: 'Failed to create property'
    };
  }
};

// Helper: check property access and ownership for a layout
export const getLayoutAccess = async (layoutId: string, requesterEmail: string) => {
  // requester
  const { data: requester, error: reqErr } = await supabase
    .from('users')
    .select('email, ug_id')
    .eq('email', requesterEmail)
    .maybeSingle();
  if (reqErr || !requester) return { success: false, error: 'Requester not found' } as const;

  // layout row
  const { data: layoutRow, error: layErr } = await supabase
    .from('design')
    .select('id, user_email, prop_id, name, data, is_active')
    .eq('id', layoutId)
    .eq('is_active', true)
    .single();
  if (layErr || !layoutRow) return { success: false, error: 'Layout not found' } as const;

  const isOwner = (layoutRow as any).user_email === requesterEmail;
  // Check property access via hasPropertyAccess
  const sameProperty = await hasPropertyAccess(requesterEmail, (layoutRow as any).prop_id);
  return { success: true, isOwner, sameProperty, layout: layoutRow } as const;
};

// Update layout (owner only)
export const updateLayout = async (layoutId: string, userEmail: string, updates: { layout_name?: string; layout_data?: any; }) => {
  try {
    // Update directly in layouts table; enforce ownership by user_email
    const payload: any = {
      last_modified: new Date().toISOString()
    };
    if (typeof updates.layout_name === 'string') payload.layout_name = updates.layout_name;
    if (typeof updates.layout_data !== 'undefined') payload.layout_data = updates.layout_data;

    const { error } = await supabase
      .from('layouts')
      .update(payload)
      .eq('id', layoutId)
      .eq('user_email', userEmail);

    if (error) return { success: false, error: 'db', message: 'Failed to update layout' };
    return { success: true, message: 'Layout updated successfully' };
  } catch (e) {
    return { success: false, error: 'unexpected', message: 'Failed to update layout' };
  }
};

// Delete layout (owner only) - soft delete
export const deleteLayout = async (layoutId: string, userEmail: string) => {
  try {
    // Ownership check in layouts table
    const { data: row, error: rowErr } = await supabase
      .from('layouts')
      .select('id, user_email')
      .eq('id', layoutId)
      .maybeSingle();
    if (rowErr || !row) return { success: false, error: 'not_found', message: 'Layout not found' } as const;
    if ((row as any).user_email !== userEmail) return { success: false, error: 'forbidden', message: 'Only the owner can delete this layout' } as const;

    const { error } = await supabase
      .from('layouts')
      .delete()
      .eq('id', layoutId)
      .eq('user_email', userEmail);

    if (error) return { success: false, error: 'db', message: 'Failed to delete layout' } as const;
    return { success: true, message: 'Layout deleted' } as const;
  } catch (e) {
    return { success: false, error: 'unexpected', message: 'Failed to delete layout' } as const;
  }
};

// Update access checks to include propId in revisions
export const createRevision = async (sourceLayoutId: string, userEmail: string, propId: string, newName?: string) => {
  try {
    const canAccess = await hasPropertyAccess(userEmail, propId);
    if (!canAccess) return { success: false, error: 'forbidden', message: 'No access to property' };

    // Read from user_designs
    const { data: source, error: srcErr } = await supabase
      .from('user_designs')
      .select('*')
      .eq('id', sourceLayoutId)
      .eq('prop_id', propId)
      .single();
    if (srcErr || !source) return { success: false, error: 'not_found', message: 'Source design not found' };

    const srcData: any = (source as any).design_data || {};
    const baseName: string = (source as any).design_name || 'Project Design';
    const currentRev = typeof srcData.revisionNumber === 'number' ? srcData.revisionNumber : -1;
    const nextRevision = currentRev + 1;
    const finalName = newName || `${baseName.replace(/\s*\(rev\d+\)$/, '')} (rev${nextRevision})`;

    const cloned: any = {
      user_email: userEmail,
      prop_id: propId,
      design_name: finalName,
      panel_type: (source as any).panel_type || 'Project',
      design_data: { ...srcData, parentLayoutId: (source as any).id, revisionNumber: nextRevision, lastRevisedFromEmail: (source as any).user_email, isEdited: false }
    };

    const { data: inserted, error } = await supabase
      .from('user_designs')
      .insert([cloned])
      .select('id')
      .single();
    if (error) return { success: false, error: 'db', message: 'Failed to create revision' };

    return { success: true, layoutId: (inserted as any)?.id, message: 'Revision created' };
  } catch (e) {
    return { success: false, error: 'unexpected', message: 'Failed to create revision' };
  }
};

// 📚 LIST ALL REVISIONS IN A PROPERTY (any UG member with access can view)
export const listPropertyRevisions = async (userEmail: string, propId: string) => {
  try {
    const canAccess = await hasPropertyAccess(userEmail, propId);
    if (!canAccess) return { success: false, error: 'forbidden', message: 'No access to property' } as const;

    const { data, error } = await supabase
      .from('user_designs')
      .select('*')
      .eq('prop_id', propId)
      .eq('panel_type', 'Project')
      .order('created_at', { ascending: false });

    if (error) return { success: false, error: 'db', message: 'Failed to load revisions' } as const;
    const shaped = (data || []).map((d: any) => ({ ...d, name: d.design_name }));
    return { success: true, revisions: shaped, message: 'Revisions loaded' } as const;
  } catch (e) {
    return { success: false, error: 'unexpected', message: 'Failed to load revisions' } as const;
  }
};

// 🔎 GET A DESIGN WITH PERMISSIONS (view for UG access; edit/delete for owner)
export const getDesignWithPermissions = async (designId: string, requesterEmail: string) => {
  try {
    const { data: designRow, error } = await supabase
      .from('design')
      .select('*')
      .eq('id', designId)
      .eq('is_active', true)
      .single();
    if (error || !designRow) return { success: false, error: 'not_found', message: 'Design not found' } as const;

    const canAccess = await hasPropertyAccess(requesterEmail, (designRow as any).prop_id as string);
    if (!canAccess) return { success: false, error: 'forbidden', message: 'No access to property' } as const;

    const isOwner = (designRow as any).user_email === requesterEmail;
    return { success: true, design: designRow, permissions: { canView: true, canEdit: isOwner, canDelete: isOwner, canCreateRevision: true } } as const;
  } catch (e) {
    return { success: false, error: 'unexpected', message: 'Failed to load design' } as const;
  }
};

// 🧬 GET REVISION LINEAGE FOR A GIVEN DESIGN ID (includes original + descendants within property)
export const getRevisionLineage = async (designId: string, requesterEmail: string) => {
  try {
    const base = await getDesignWithPermissions(designId, requesterEmail);
    if (!base.success) return base as any;

    const propId = (base.design as any).prop_id as string;
    const { data: allDesigns, error } = await supabase
      .from('design')
      .select('*')
      .eq('prop_id', propId)
      .eq('is_active', true)
      .eq('design_type', 'layout');
    if (error) return { success: false, error: 'db', message: 'Failed to load lineage' } as const;

    // Build lineage set by following parentLayoutId relationships in memory
    const byId = new Map<string, any>();
    (allDesigns || []).forEach((d: any) => byId.set(d.id, d));

    // Find the root (walk up parentLayoutId if present)
    let root: any = base.design;
    const visitedUp = new Set<string>();
    while (root && (root.data as any)?.parentLayoutId && !visitedUp.has(root.id)) {
      visitedUp.add(root.id);
      const parentId = (root.data as any).parentLayoutId as string;
      const parent = byId.get(parentId);
      if (!parent) break;
      root = parent;
    }

    // Collect all descendants from root (simple BFS on parentLayoutId)
    const lineage: any[] = [];
    const queue: string[] = [root?.id || (base.design as any).id];
    const visited = new Set<string>();
    while (queue.length > 0) {
      const currentId = queue.shift() as string;
      if (visited.has(currentId)) continue;
      visited.add(currentId);
      const node = byId.get(currentId);
      if (node) lineage.push(node);
      (allDesigns || []).forEach((d: any) => {
        const parentId = (d.data as any)?.parentLayoutId;
        if (parentId === currentId) queue.push(d.id);
      });
    }

    // Sort lineage by created_at ascending to show evolution
    lineage.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    return { success: true, lineage } as const;
  } catch (e) {
    return { success: false, error: 'unexpected', message: 'Failed to load lineage' } as const;
  }
};

// 🗑️ DELETE PROPERTY FUNCTION - Deletes a property and all related data
export const deleteProperty = async (propId: string, userEmail: string) => {
  try {
    console.log('🗑️ Deleting property:', propId);

    // Verify user has access to this property
    const canAccess = await hasPropertyAccess(userEmail, propId);
    if (!canAccess) {
      return { success: false, error: 'forbidden', message: 'You do not have access to this property' };
    }

    // Get user's UG ID to check if they can delete (could be restricted to property creators)
    const { data: usersArr, error: userErr } = await supabase
      .from('users')
      .select('email, ug_id')
      .eq('email', userEmail)
      .limit(1);
    
    if (userErr || !usersArr || usersArr.length === 0) {
      return { success: false, error: 'user_not_found', message: 'User not found' };
    }

    // Start hard deletion process - PERMANENTLY remove all data
    // 1. Hard delete all designs in this property
    const { error: designErr } = await supabase
      .from('user_designs')
      .delete()
      .eq('prop_id', propId)
      .eq('is_active', true);

    if (designErr) {
      console.error('❌ Error permanently deleting designs:', designErr);
      return { success: false, error: 'db', message: 'Failed to permanently delete designs' };
    }

    // 2. Hard delete all UG access permissions for this property
    const { error: accessErr } = await supabase
      .from('ug_property_access')
      .delete()
      .eq('prop_id', propId)
      .eq('is_active', true);

    if (accessErr) {
      console.error('❌ Error permanently removing access permissions:', accessErr);
      return { success: false, error: 'db', message: 'Failed to permanently remove access permissions' };
    }

    // 3. Hard delete the property itself
    const { error: propErr } = await supabase
      .from('property')
      .delete()
      .eq('prop_id', propId)
      .eq('is_active', true);

    if (propErr) {
      console.error('❌ Error permanently deleting property:', propErr);
      return { success: false, error: 'db', message: 'Failed to permanently delete property' };
    }

    console.log('✅ Property and all related data permanently deleted');
    return { success: true, message: 'Property permanently deleted from database' };

  } catch (error) {
    console.error('❌ Unexpected error deleting property:', error);
    return { success: false, error: 'unexpected', message: 'Failed to delete property' };
  }
};
