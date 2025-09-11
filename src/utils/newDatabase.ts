// 🏗️ NEW DATABASE - Clean hierarchy: Property → User Groups → Users
// This replaces the old database system with your 3-table structure

import { supabase } from './supabaseClient';

// 🆔 Helper function to create unique IDs
const generateId = () => {
  return 'design_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
};

// List properties the requester can access via their UG (many-to-many)
export const getAccessibleProperties = async (userEmail: string) => {
  try {
    // Single UG only
    const usersRes = await supabase
      .from('users')
      .select('email, ug_id')
      .eq('email', userEmail)
      .limit(1);

    if (usersRes.error) return { success: false, error: 'db', properties: [] as any[] };
    const userRow = (usersRes.data && usersRes.data[0]) || null;
    if (!userRow || !(userRow as any).ug_id) return { success: true, properties: [] };

    const ugId = (userRow as any).ug_id as string;

    // 2) Get prop_ids accessible to the user's UG
    const { data: links, error: linkErr } = await supabase
      .from('ug_property_access')
      .select('prop_id')
      .eq('ug_id', ugId)
      .eq('is_active', true);
    if (linkErr) return { success: false, error: 'db', properties: [] as any[] };

    const propIdSet = new Set<string>((links || []).map((r: any) => r.prop_id).filter(Boolean));
    const propIds = Array.from(propIdSet);
    if (propIds.length === 0) return { success: true, properties: [] };

    // 3) Fetch properties by IN list
    const { data: props, error: propErr } = await supabase
      .from('property')
      .select('prop_id, property_name, region')
      .in('prop_id', propIds)
      .eq('is_active', true)
      .order('region', { ascending: true });
    if (propErr) return { success: false, error: 'db', properties: [] as any[] };

    return { success: true, properties: props || [] };
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

// 📋 SAVE LAYOUT FUNCTION - now requires explicit propId
export const saveLayout = async (userEmail: string, layoutData: any, propId: string) => {
  try {
    console.log('💾 Saving layout:', layoutData.layoutName, 'for prop:', propId);

    // Verify access to property
    const canAccess = await hasPropertyAccess(userEmail, propId);
    if (!canAccess) {
      return { success: false, error: 'forbidden', message: 'You do not have access to this property' };
    }

    const layoutRecord = {
      id: generateId(),
      user_email: userEmail,
      prop_id: propId,
      layout_name: layoutData.layoutName,
      layout_data: layoutData,
      created_at: new Date().toISOString(),
      last_modified: new Date().toISOString(),
      is_active: true
    };

    const { error } = await supabase.from('layouts').insert([layoutRecord]);
    if (error) return { success: false, error: 'db', message: 'Failed to save layout to database' };

    return { success: true, layoutId: layoutRecord.id, message: `Layout "${layoutData.layoutName}" saved successfully!` };
  } catch (error) {
    return { success: false, error: 'unexpected', message: 'Failed to save layout' };
  }
};

// 📋 GET LAYOUTS FUNCTION - by selected property
export const getLayouts = async (userEmail: string, propId: string) => {
  try {
    console.log('📋 Getting layouts for property:', propId, 'user:', userEmail);

    const canAccess = await hasPropertyAccess(userEmail, propId);
    if (!canAccess) return { success: false, error: 'forbidden', message: 'No access to property' };

    const { data, error } = await supabase
      .from('layouts')
      .select('*')
      .eq('prop_id', propId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) return { success: false, error: 'db', message: 'Failed to get layouts' };

    return { success: true, layouts: data || [], message: 'Layouts retrieved successfully!' };
  } catch (error) {
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
      .select('UG_PropID, ug, prop_id')
      .in('UG_PropID', ugIdList) : { data: [] as any[] } as any;

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
        groups: ugDetails || [],
        accessibleProperties: props || []
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

    return {
      success: true,
      properties: data || [],
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

// 🔄 LOAD LAYOUT FUNCTION - ensure layout is in selected property
export const loadLayout = async (layoutId: string, userEmail: string, propId: string) => {
  try {
    const canAccess = await hasPropertyAccess(userEmail, propId);
    if (!canAccess) return { success: false, error: 'forbidden', message: 'No access to property' };

    const { data, error } = await supabase
      .from('layouts')
      .select('*')
      .eq('id', layoutId)
      .eq('prop_id', propId)
      .eq('is_active', true)
      .single();

    if (error || !data) return { success: false, error: 'not_found', message: 'Layout not found' };

    return { success: true, layout: data, message: `Layout "${data.layout_name}" loaded successfully!` };
  } catch (error) {
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
  // requester property
  const { data: requester, error: reqErr } = await supabase
    .from('users')
    .select(`email, ug_id, ug!inner("UG_PropID", prop_id)`) 
    .eq('email', requesterEmail)
    .maybeSingle();
  if (reqErr || !requester) return { success: false, error: 'Requester not found' } as const;
  const requesterPropId = (requester as any).ug.prop_id as string;

  // layout + owner property
  const { data: layoutRow, error: layErr } = await supabase
    .from('layouts')
    .select(`id, user_email, layout_name, layout_data, is_active, users!inner(email, ug_id, ug!inner("UG_PropID", prop_id))`)
    .eq('id', layoutId)
    .eq('is_active', true)
    .single();
  if (layErr || !layoutRow) return { success: false, error: 'Layout not found' } as const;
  const ownerPropId = (layoutRow as any).users.ug.prop_id as string;
  const isOwner = (layoutRow as any).user_email === requesterEmail;
  const sameProperty = ownerPropId === requesterPropId;
  return { success: true, isOwner, sameProperty, layout: layoutRow } as const;
};

// Update layout (owner only)
export const updateLayout = async (layoutId: string, userEmail: string, updates: { layout_name?: string; layout_data?: any; }) => {
  try {
    const access = await getLayoutAccess(layoutId, userEmail);
    if (!access.success) return { success: false, error: access.error, message: 'Layout not found' };
    if (!access.isOwner) return { success: false, error: 'forbidden', message: 'Only the owner can edit this layout' };

    const payload: any = { last_modified: new Date().toISOString() };
    if (typeof updates.layout_name === 'string') payload.layout_name = updates.layout_name;
    if (typeof updates.layout_data !== 'undefined') payload.layout_data = updates.layout_data;

    const { error } = await supabase
      .from('layouts')
      .update(payload)
      .eq('id', layoutId)
      .eq('user_email', userEmail)
      .eq('is_active', true);

    if (error) return { success: false, error: 'db', message: 'Failed to update layout' };
    return { success: true, message: 'Layout updated successfully' };
  } catch (e) {
    return { success: false, error: 'unexpected', message: 'Failed to update layout' };
  }
};

// Delete layout (owner only) - soft delete
export const deleteLayout = async (layoutId: string, userEmail: string) => {
  try {
    const access = await getLayoutAccess(layoutId, userEmail);
    if (!access.success) return { success: false, error: access.error, message: 'Layout not found' };
    if (!access.isOwner) return { success: false, error: 'forbidden', message: 'Only the owner can delete this layout' };

    const { error } = await supabase
      .from('layouts')
      .update({ is_active: false, last_modified: new Date().toISOString() })
      .eq('id', layoutId)
      .eq('user_email', userEmail)
      .eq('is_active', true);

    if (error) return { success: false, error: 'db', message: 'Failed to delete layout' };
    return { success: true, message: 'Layout deleted' };
  } catch (e) {
    return { success: false, error: 'unexpected', message: 'Failed to delete layout' };
  }
};

// Update access checks to include propId in revisions
export const createRevision = async (sourceLayoutId: string, userEmail: string, propId: string, newName?: string) => {
  try {
    const canAccess = await hasPropertyAccess(userEmail, propId);
    if (!canAccess) return { success: false, error: 'forbidden', message: 'No access to property' };

    const { data: source, error: srcErr } = await supabase
      .from('layouts')
      .select('*')
      .eq('id', sourceLayoutId)
      .eq('prop_id', propId)
      .eq('is_active', true)
      .single();
    if (srcErr || !source) return { success: false, error: 'not_found', message: 'Source layout not found' };

    const srcData: any = source.layout_data || {};
    const nextRevision = (srcData.revisionNumber || 1) + 1;
    const newId = generateId();

    const cloned = {
      id: newId,
      user_email: userEmail,
      prop_id: propId,
      layout_name: newName || `${source.layout_name} (rev${nextRevision})`,
      layout_data: { ...srcData, parentLayoutId: source.id, revisionNumber: nextRevision, lastRevisedFromEmail: source.user_email },
      created_at: new Date().toISOString(),
      last_modified: new Date().toISOString(),
      is_active: true
    };

    const { error } = await supabase.from('layouts').insert([cloned]);
    if (error) return { success: false, error: 'db', message: 'Failed to create revision' };

    return { success: true, layoutId: newId, message: 'Revision created' };
  } catch (e) {
    return { success: false, error: 'unexpected', message: 'Failed to create revision' };
  }
};
