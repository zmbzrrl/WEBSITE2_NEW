// 📥 NEW DATABASE IMPORTER
// Handles the new hierarchy: Property → User Groups → Users → Projects → Designs

import { supabase } from './supabaseClient';

// 📋 TYPES FOR NEW IMPORT DATA
interface ImportProperty {
  region: string;
  property_name: string;
}

interface ImportUserGroup {
  ug: string;
  prop_id: string; // Reference to property
  property_name: string; // Helper field for reference
}

interface ImportUser {
  email: string;
  // Option A: provide ug_id (e.g., "UG001") directly
  ug_id?: string;
  // Option B: omit ug_id and provide property_name; importer will assign a default UG for that property
  property_name?: string;
  // Optional helper fields
  ug?: string;
}

interface ImportIcon {
  iconId: string;
  label: string;
  position: number;
  text: string;
  color: string;
}

interface ImportDesignData {
  panelType: string;
  backgroundColor: string;
  iconColor: string;
  textColor: string;
  iconSize: string;
  icons: ImportIcon[];
  layout: {
    rows: number;
    columns: number;
    spacing: string;
  };
}

interface ImportPanelConfiguration {
  panel_index: number;
  room_type: string;
  panel_data: {
    roomName: string;
    panelPosition: string;
    customSettings: {
      brightness: number;
      autoDim: boolean;
    };
  };
}

interface ImportDesign {
  design_name?: string;
  panel_type: string;
  // Optional: if omitted, we will create a minimal shell and/or use features
  design_data?: ImportDesignData;
  // Optional feature flags or metadata to seed designs without full visuals
  features?: Record<string, any>;
  panel_configurations?: ImportPanelConfiguration[];
  // When provided, importer will auto-create the next revision of this base name within the same project
  revision_of?: string;
}

interface ImportProject {
  user_email?: string;
  project_name: string;
  project_description?: string;
  // Optional: helps associate the project to a property by name
  property_name?: string;
  designs: ImportDesign[];
}

// Minimal import shape support
interface ImportMinimalDesignItem {
  panel_type: string;
  quantity: number;
  design_name: string; // required to distinguish variants
}

interface ImportMinimalData {
  project_name: string;
  project_code?: string;
  designs: ImportMinimalDesignItem[];
}

interface ImportDataNew {
  import_metadata: {
    version: string;
    created_at: string;
    description: string;
    total_properties: number;
    total_user_groups: number;
    total_users: number;
    total_projects: number;
    total_designs: number;
  };
  properties: ImportProperty[];
  user_groups?: ImportUserGroup[];
  users?: ImportUser[];
  projects?: ImportProject[];
}

// 🔎 Detect colleague-provided proposal format
const isColleagueProposalFormat = (data: any): boolean => {
  try {
    return !!(
      data &&
      typeof data === 'object' &&
      typeof data['Property name'] === 'string' &&
      Array.isArray(data['Panel Designs'])
    );
  } catch {
    return false;
  }
};

// 🗺️ Map external panel codes to internal panel_type values
const mapPanelCodeToPanelType = (panelCode: string | undefined, panelData?: any): string => {
  const code = (panelCode || '').trim().toUpperCase();
  if (!code) return 'Unknown';
  
  // Special handling for GS codes with extended socket flags
  if (code.startsWith('GS')) {
    const extended1Socket = panelData?.['Extended 1-socket'];
    const extended2Socket = panelData?.['Extended 2-socket'];
    
    // Convert to boolean if needed
    const ext1 = extended1Socket === true || extended1Socket === 'true' || extended1Socket === 1;
    const ext2 = extended2Socket === true || extended2Socket === 'true' || extended2Socket === 1;
    
    if (ext1 && ext2) {
      // Both extended sockets - default to X2H, but user should choose
      return 'X2H_X2V'; // Special marker for user selection
    } else if (ext1) {
      // Extended 1-socket only - default to X1H, but user should choose
      return 'X1H_X1V'; // Special marker for user selection
    } else if (ext2) {
      // Extended 2-socket only - default to X2H, but user should choose
      return 'X2H_X2V'; // Special marker for user selection
    } else {
      // No extended sockets - standard SP
      return 'SP';
    }
  }
  
  // Explicit known mappings for other codes
  if (code.startsWith('IDPG')) return 'IDPG';
  if (code.startsWith('TAG')) return 'TAG';
  if (code.startsWith('X1H')) return 'X1H';
  if (code.startsWith('X1V')) return 'X1V';
  if (code.startsWith('X2H')) return 'X2H';
  if (code.startsWith('X2V')) return 'X2V';
  if (code.startsWith('DPH')) return 'DPH';
  if (code.startsWith('DPV')) return 'DPV';
  // Fallback: use the code as-is so nothing is lost
  return code;
};

// 🎯 Handle panel type selection for ambiguous cases
const handleAmbiguousPanelType = (panelType: string, panelData: any): string => {
  if (panelType === 'X1H_X1V') {
    // Default to X1H, but could be changed by user later
    // You could add UI logic here to prompt user for selection
    console.log('⚠️ Panel requires user selection: X1H or X1V for panel:', panelData['Panel Name']);
    return 'X1H'; // Default choice
  }
  if (panelType === 'X2H_X2V') {
    // Default to X2H, but could be changed by user later
    // You could add UI logic here to prompt user for selection
    console.log('⚠️ Panel requires user selection: X2H or X2V for panel:', panelData['Panel Name']);
    return 'X2H'; // Default choice
  }
  return panelType;
};

// 🔄 Transform colleague format → extended schema used by importer
const transformColleagueProposalToExtended = (data: any): ImportDataNew => {
  const propertyName = data['Property name'] || 'Unnamed Property';
  const projectCode = data['Property code'] || null;
  const region = data['Region'] || 'UNKNOWN';
  const panelDesigns: any[] = Array.isArray(data['Panel Designs']) ? data['Panel Designs'] : [];

  const designs = panelDesigns.map((d: any) => {
    const designName = d['Panel Name'] || d['DesignId'] || 'Unnamed Design';
    const mappedType = mapPanelCodeToPanelType(d['Panel Code'], d);
    const panelType = handleAmbiguousPanelType(mappedType, d);

    // Collect all fields to avoid data loss
    const featureFlags: Record<string, any> = {};
    Object.keys(d || {}).forEach((key) => {
      if (
        key !== 'Panel Name' &&
        key !== 'Panel Code' &&
        key !== 'DesignId' &&
        key !== 'Allocated Quantity' &&
        key !== 'Max Quantity'
      ) {
        featureFlags[key] = d[key];
      }
    });

    const allocatedQty = d['Allocated Quantity'];
    const maxQty = d['Max Quantity'];

    const design_data = {
      panelType,
      originalPanelCode: d['Panel Code'],
      allocatedQuantity: typeof allocatedQty === 'number' ? allocatedQty : Number(allocatedQty) || undefined,
      maxQuantity: typeof maxQty === 'number' ? maxQty : Number(maxQty) || undefined,
      features: featureFlags
    } as Record<string, any>;

    return {
      design_name: designName,
      panel_type: panelType,
      design_data
    } as ImportDesign;
  });

  const transformed: ImportDataNew = {
    import_metadata: {
      version: 'colleague-proposal-1.0',
      created_at: new Date().toISOString(),
      description: `Imported from colleague proposal for ${propertyName}`,
      total_properties: 1,
      total_user_groups: 0,
      total_users: 0,
      total_projects: 1,
      total_designs: designs.length
    },
    properties: [
      {
        region,
        property_name: propertyName
      }
    ],
    projects: [
      {
        project_name: propertyName,
        project_description: projectCode,
        property_name: propertyName,
        designs
      }
    ]
  };

  return transformed;
};

// 🧭 Direct import of colleague proposal format (no intermediate transformation)
const importColleagueProposalData = async (raw: any) => {
  console.log('🔍 Starting colleague proposal import...', raw);
  const results = {
    properties_created: 0,
    user_groups_created: 0,
    users_created: 0,
    projects_created: 0,
    designs_created: 0,
    configurations_created: 0,
    errors: [] as string[],
    project_ids: [] as string[]
  };

  try {
    const propertyName = raw['Property name'] || 'Unnamed Property';
    const propertyCode = raw['Property code'] || null;
    const region = raw['Region'] || 'UNKNOWN';
    const panelDesigns: any[] = Array.isArray(raw['Panel Designs']) ? raw['Panel Designs'] : [];

    // Resolve importing user email for UG assignment/visibility
    let importUserEmail: string | null = null;
    try { importUserEmail = (raw.user_email && String(raw.user_email)) || null; } catch {}
    if (!importUserEmail) {
      try { importUserEmail = (localStorage.getItem('import_user_email') || localStorage.getItem('user_email') || '').trim() || null; } catch {}
    }
    if (!importUserEmail) {
      try { importUserEmail = (import.meta as any)?.env?.VITE_IMPORT_USER_EMAIL || null; } catch {}
    }
    
    // CRITICAL: User email is required for import - fail if not available
    if (!importUserEmail) {
      throw new Error('User email is required for import. Please ensure you are logged in and the import data contains user_email field.');
    }
    
    console.log('👤 Import user email resolved:', importUserEmail);

    // Create property (try api.property first, then fallback to public.property)
    let propertyId: string | null = null;
    try {
        const now = new Date().toISOString();
        const publicPayload: any = {
          prop_id: propertyCode || `PROP_${Date.now()}`,
          property_name: propertyName,
          region,
          created_at: now,
          last_modified: now,
          is_active: true
        };
        // Check if property already exists
        const { data: existingProperty } = await supabase
          .from('property')
          .select('prop_id, property_name')
          .eq('prop_id', publicPayload.prop_id)
          .limit(1);

        const isRevision = existingProperty && existingProperty[0];

        const { data: property, error: propertyError } = await supabase
          .from('property')
          .upsert([publicPayload], { onConflict: 'prop_id' })
          .select()
          .single();
      if (propertyError) throw propertyError;
      propertyId = ((property as any).prop_id || null) as string | null;
      
      if (!isRevision) {
        results.properties_created++;
      }
    } catch (e: any) {
      results.errors.push(`Property error: ${e.message || String(e)}`);
    }

    // No need for separate project table - property acts as project container
    // Use property ID directly for designs
    const propId = propertyId;
    results.projects_created++;
    if (propId) results.project_ids.push(propId);

    // Grant the importing user's UG access to this property
    console.log('🔍 Checking UG linking conditions...', { propId, importUserEmail });
    if (propId && importUserEmail) {
      try {
        console.log('🔗 Linking property to user UG...', { propId, importUserEmail });
        
        // Get the user's current UG
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('ug_id')
          .eq('email', importUserEmail)
          .single();
        
        if (userError || !userData) {
          console.error('❌ Could not find user:', userError);
          results.errors.push(`Could not find user: ${userError?.message || 'User not found'}`);
          return results;
        }

        const userUgId = userData.ug_id;
        console.log('👤 User UG ID:', userUgId);

        // Create UG ↔ Property access link
        const { error: accessError } = await supabase
          .from('ug_property_access')
          .upsert([{ ug_id: userUgId, prop_id: propId, is_active: true }], { onConflict: 'ug_id,prop_id' });

        if (accessError) {
          console.error('❌ Could not create property access:', accessError);
          results.errors.push(`Could not create property access: ${accessError.message}`);
        } else {
          console.log('✅ Property access granted successfully');
        }

      } catch (e: any) {
        console.error('❌ User/UG assignment error:', e);
        results.errors.push(`User/UG assignment error: ${e.message || String(e)}`);
      }
    }

    // REPLACE MODE: Remove existing BOQ for this property before inserting new rows
    if (propId) {
      try {
        // Fetch existing design ids to cascade delete panel configurations first
        const { data: existing } = await supabase
          .from('user_designs')
          .select('id')
          .eq('prop_id', propId);
        const existingIds = (existing || []).map((r: any) => r.id);
        if (existingIds.length > 0) {
          // Delete related panel configurations
          try {
            await supabase
              .from('panel_configurations')
              .delete()
              .in('design_id', existingIds);
          } catch {}
          // Delete designs
          await supabase
            .from('user_designs')
            .delete()
            .eq('prop_id', propId);
        }
      } catch (e) {
        console.warn('⚠️ Failed to clear existing BOQ before import (continuing):', e);
      }
    }

    // Create designs directly from colleague rows
    if (propId) {
      for (const d of panelDesigns) {
        try {
          const designName = d['Panel Name'] || d['DesignId'] || 'Unnamed Design';
          const panelCode = d['Panel Code'];
          // Normalize to app panel categories used by BOQ (SP, TAG, IDPG, DP*, X*)
          const normalized = mapPanelCodeToPanelType(typeof panelCode === 'string' ? panelCode : '', d);
          const panelType = handleAmbiguousPanelType(normalized, d);

          const allocatedQty = d['Allocated Quantity'];
          const maxQty = d['Max Quantity'];

          const design_data: any = {
            sourceFormat: 'colleague-proposal-1.0',
            originalRow: d,
            region,
            propertyName,
            propertyCode,
            allocatedQuantity: typeof allocatedQty === 'number' ? allocatedQty : Number(allocatedQty) || undefined,
            maxQuantity: typeof maxQty === 'number' ? maxQty : Number(maxQty) || undefined
          };

          // Store ambiguous panel type information for UI selection
          if (normalized === 'X1H_X1V') {
            design_data.requiresPanelTypeSelection = true;
            design_data.availablePanelTypes = ['X1H', 'X1V'];
            design_data.defaultPanelType = 'X1H';
          } else if (normalized === 'X2H_X2V') {
            design_data.requiresPanelTypeSelection = true;
            design_data.availablePanelTypes = ['X2H', 'X2V'];
            design_data.defaultPanelType = 'X2H';
          }

          // BOQ page expects design_data.quantity for initial totals
          if (typeof allocatedQty !== 'undefined') {
            const q = typeof allocatedQty === 'number' ? allocatedQty : Number(allocatedQty);
            if (!isNaN(q)) {
              design_data.quantity = q;
            }
          }

          // Check if this property already has designs (for revision logic)
          const { data: existingDesigns } = await supabase
            .from('user_designs')
            .select('revision_number')
            .eq('prop_id', propId)
            .order('revision_number', { ascending: false })
            .limit(1);
          
          const nextRevisionNumber = existingDesigns && existingDesigns[0] 
            ? (existingDesigns[0].revision_number || 0) + 1 
            : 1;

          const { error: designError } = await supabase
            .from('user_designs')
            .insert([
              {
                prop_id: propId,
                user_email: importUserEmail || null,
                design_name: designName,
                panel_type: panelType,
                design_data,
                revision_number: nextRevisionNumber
              }
            ]);
          if (designError) {
            console.error('Design insert error:', designError);
            throw designError;
          }
          results.designs_created++;
    } catch (e: any) {
      console.error('Design creation error:', e);
      results.errors.push(`Design error: ${e.message || String(e)}`);
    }
      }
    }

    } catch (e: any) {
      console.error('Unexpected import error:', e);
      results.errors.push(`Unexpected import error: ${e.message || String(e)}`);
    }

  return results;
};

// 🚀 MAIN IMPORT FUNCTION FOR NEW STRUCTURE
export const importDatabaseDataNew = async (jsonData: ImportDataNew): Promise<{
  success: boolean;
  message: string;
  results?: {
    properties_created: number;
    user_groups_created: number;
    users_created: number;
    projects_created: number;
    designs_created: number;
    configurations_created: number;
    errors: string[];
    project_ids: string[];
  };
}> => {
  try {
    // Dedicated direct import path for colleague proposal format
    if (isColleagueProposalFormat(jsonData)) {
      const results = await importColleagueProposalData(jsonData);
      return {
        success: results.errors.length === 0,
        message: results.errors.length === 0
          ? `Import completed! Created ${results.properties_created} properties, ${results.projects_created} projects, ${results.designs_created} designs`
          : `Import completed with errors: ${results.errors.length}`,
        results
      };
    }
    console.log('📥 Starting new database import...');
    const usersCount = Array.isArray((jsonData as any).users) ? (jsonData as any).users.length : 0;
    if ((jsonData as any).properties) {
      console.log(`📊 Importing ${(jsonData as any).properties.length} properties, ${usersCount} users`);
    }

    const results = {
      properties_created: 0,
      user_groups_created: 0,
      users_created: 0,
      projects_created: 0,
      designs_created: 0,
      configurations_created: 0,
      errors: [] as string[],
      project_ids: [] as string[]
    };

    // Create property lookup map (only used for the extended schema)
    const propertyMap = new Map<string, string>();

    // 1. CREATE PROPERTIES (extended schema only)
    for (const propertyData of ((jsonData as any).properties || [])) {
      try {
        const { data: property, error: propertyError } = await supabase
          .from('property')
          .insert([{
            region: propertyData.region,
            property_name: propertyData.property_name
          }])
          .select()
          .single();

        if (propertyError) {
          throw new Error(`Failed to create property "${propertyData.property_name}": ${propertyError.message}`);
        }

        // Store property ID for later reference
        propertyMap.set(propertyData.property_name, property.id);
        console.log(`✅ Created property: ${property.property_name}`);
        results.properties_created++;

      } catch (propertyErr) {
        results.errors.push(`Property error: ${propertyErr}`);
      }
    }

    // 2. CREATE USER GROUPS (optional, extended schema only)
    if ((jsonData as any).user_groups && Array.isArray((jsonData as any).user_groups)) for (const ugData of (jsonData as any).user_groups) {
      try {
        const propertyId = propertyMap.get(ugData.property_name);
        if (!propertyId) {
          throw new Error(`Property not found: ${ugData.property_name}`);
        }

        // Create composite ID: UG + Property ID
        const compositeId = `${ugData.ug}_${propertyId.substring(0, 8)}`;

        const { data: ug, error: ugError } = await supabase
          .from('ug')
          .insert([{
            id: compositeId,
            ug: ugData.ug,
            prop_id: propertyId
          }])
          .select()
          .single();

        if (ugError) {
          throw new Error(`Failed to create user group "${ugData.ug}": ${ugError.message}`);
        }

        console.log(`✅ Created user group: ${ug.id}`);
        results.user_groups_created++;

      } catch (ugErr) {
        results.errors.push(`User group error: ${ugErr}`);
      }
    }

    // 3. CREATE USERS (optional, extended schema only)
    if ((jsonData as any).users && Array.isArray((jsonData as any).users)) for (const userData of (jsonData as any).users) {
      try {
        let resolvedUgId = userData.ug_id;

        // If ug_id not provided, but property_name is, assign to default UG for that property
        if (!resolvedUgId && userData.property_name) {
          const propertyId = propertyMap.get(userData.property_name);
          if (!propertyId) {
            throw new Error(`User ${userData.email}: Property not found for property_name "${userData.property_name}"`);
          }
          const defaultUGCode = 'UG_DEFAULT';

          // Ensure default UG exists for this property
        const { data: existingUG, error: fetchUgErr } = await supabase
            .from('ug')
            .select('id, ug')
            .eq('prop_id', propertyId)
            .eq('ug', defaultUGCode)
            .maybeSingle();

          let ensuredUgCode = defaultUGCode;
          if (fetchUgErr) {
            throw new Error(`Failed to check default UG for property ${userData.property_name}: ${fetchUgErr.message}`);
          }

          if (!existingUG) {
            const compositeId = `${defaultUGCode}_${propertyId.substring(0, 8)}`;
            const { error: createUgErr } = await supabase
              .from('ug')
              .insert([{ id: compositeId, ug: defaultUGCode, prop_id: propertyId }]);
            if (createUgErr) {
              throw new Error(`Failed to create default UG for property ${userData.property_name}: ${createUgErr.message}`);
            }
          } else {
            ensuredUgCode = (existingUG as any).ug as string;
          }

          resolvedUgId = ensuredUgCode;
        }

        // Build insert payload; allow email-only (no group assignment yet)
        const userInsert: any = { email: userData.email };
        if (resolvedUgId) {
          userInsert.ug_id = resolvedUgId;
        }

        const { data: user, error: userError } = await supabase
          .from('users')
          .insert([userInsert])
          .select()
          .single();

        if (userError) {
          throw new Error(`Failed to create user "${userData.email}": ${userError.message}`);
        }

        console.log(`✅ Created user: ${user.email}`);
        results.users_created++;

      } catch (userErr) {
        results.errors.push(`User error: ${userErr}`);
      }
    }

    // 4A. MINIMAL SCHEMA: project_name + project_code + designs[{ panel_type, quantity }]
    const isMinimal = !Array.isArray((jsonData as any).properties) && !Array.isArray((jsonData as any).users) && !Array.isArray((jsonData as any).user_groups) && Array.isArray((jsonData as any).designs) && (jsonData as any).project_name;
    if (isMinimal) {
      const minimal = jsonData as unknown as ImportMinimalData;
      try {
        const projectInsert: any = {
          user_email: null,
          project_name: minimal.project_name,
          project_description: minimal.project_code ? `code: ${minimal.project_code}` : null,
        };
        const { data: project, error: projectError } = await supabase
          .from('user_projects')
          .insert([projectInsert])
          .select()
          .single();

        if (projectError) {
          throw new Error(`Failed to create project "${minimal.project_name}": ${projectError.message}`);
        }

        results.projects_created++;
        results.project_ids.push(project.id);

        for (const d of minimal.designs) {
          try {
            const { data: design, error: designError } = await supabase
              .from('user_designs')
              .insert([{
                project_id: project.id,
                user_email: null,
                design_name: d.design_name,
                panel_type: d.panel_type,
                design_data: { panelType: d.panel_type, quantity: d.quantity }
              }])
              .select()
              .single();

            if (designError) {
              throw new Error(`Failed to create design for panel_type "${d.panel_type}": ${designError.message}`);
            }

            results.designs_created++;
          } catch (designErr) {
            results.errors.push(`Design error: ${designErr}`);
          }
        }
      } catch (projectErr) {
        results.errors.push(`Project error: ${projectErr}`);
      }

      console.log('📊 Minimal import completed!');
      return {
        success: results.errors.length === 0,
        message: results.errors.length === 0 ? `Import completed! Created ${results.projects_created} projects, ${results.designs_created} designs` : `Import completed with errors: ${results.errors.length}`,
        results
      };
    }

    // 4B. EXTENDED SCHEMA: CREATE PROJECTS AND DESIGNS (optional)
    for (const projectData of ((jsonData as any).projects || [])) {
      try {
        // Best-effort: ensure user exists if provided (optional)
        try {
          if (projectData.user_email && projectData.user_email.trim().length > 0) {
            const { error: upsertUserErr } = await supabase
              .from('users')
              .upsert([{ email: projectData.user_email }], { onConflict: 'email' });
            if (upsertUserErr) {
              throw upsertUserErr;
            }
          }
        } catch (ensureUserErr) {
          results.errors.push(`User ensure error: ${ensureUserErr}`);
        }

        // Resolve property by name if provided
        let resolvedPropId: string | undefined = undefined;
        if (projectData.property_name) {
          const pid = propertyMap.get(projectData.property_name);
          if (!pid) {
            results.errors.push(`Project property resolve error: Property not found: ${projectData.property_name}`);
          } else {
            resolvedPropId = pid;
          }
        }

        // Create the project
        const projectInsert: any = {
          user_email: projectData.user_email || null,
          project_name: projectData.project_name,
          project_description: projectData.project_description,
        };
        // If your schema has prop_id on user_projects, include it when available
        if (resolvedPropId) {
          projectInsert.prop_id = resolvedPropId;
        }
        const { data: project, error: projectError } = await supabase
          .from('user_projects')
          .insert([projectInsert])
          .select()
          .single();

        if (projectError) {
          throw new Error(`Failed to create project "${projectData.project_name}": ${projectError.message}`);
        }

        console.log(`✅ Created project: ${project.project_name}`);
        results.projects_created++;
        results.project_ids.push(project.id);

        // Load existing design names for this project to compute next revision numbers
        const existingNamesRes = await supabase
          .from('user_designs')
          .select('design_name')
          .eq('project_id', project.id);
        const existingNames: string[] = (existingNamesRes.data || []).map((r: any) => r.design_name as string);

        // Helper to compute next revision name
        const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const getNextRevisionName = (baseName: string): string => {
          const pattern = new RegExp(`^${escapeRegExp(baseName)}(?:\\s*\\(rev(\\d+)\\))?$`, 'i');
          let maxRev = -1; // base without suffix is rev0
          for (const name of existingNames) {
            const match = name.match(pattern);
            if (match) {
              if (match[1] === undefined) {
                // Found base with no suffix → rev0 exists
                if (maxRev < 0) maxRev = 0;
              } else {
                const rev = parseInt(match[1], 10);
                if (!isNaN(rev) && rev > maxRev) maxRev = rev;
              }
            }
          }
          const next = maxRev + 1; // if none matched, becomes 0
          return next === 0 ? `${baseName} (rev0)` : `${baseName} (rev${next})`;
        };

        // Create designs for this project
        for (const designData of projectData.designs) {
          try {
            // Determine final design name (supports revision_of)
            let finalDesignName = designData.design_name;
            if (designData.revision_of && designData.revision_of.trim().length > 0) {
              const base = designData.revision_of.trim();
              finalDesignName = getNextRevisionName(base);
            }

            // Compute payload for design_data: prefer provided design_data; otherwise seed minimal shell
            const seededDesignData: any = designData.design_data ? designData.design_data : {
              panelType: designData.panel_type,
              features: designData.features || {},
              status: 'seeded'
            };

            const { data: design, error: designError } = await supabase
              .from('user_designs')
              .insert([{
                project_id: project.id,
                user_email: projectData.user_email || null,
                design_name: finalDesignName,
                panel_type: designData.panel_type,
                design_data: seededDesignData
              }])
              .select()
              .single();

            if (designError) {
              throw new Error(`Failed to create design "${designData.design_name}": ${designError.message}`);
            }

            console.log(`✅ Created design: ${design.design_name}`);
            results.designs_created++;

            // Track newly created name to ensure subsequent revision_of computations include it
            existingNames.push(design.design_name as string);

            // Create panel configurations if they exist
            if (designData.panel_configurations && designData.panel_configurations.length > 0) {
              for (const configData of designData.panel_configurations) {
                try {
                  const { error: configError } = await supabase
                    .from('panel_configurations')
                    .insert([{
                      design_id: design.id,
                      panel_index: configData.panel_index,
                      room_type: configData.room_type,
                      panel_data: configData.panel_data
                    }]);

                  if (configError) {
                    throw new Error(`Failed to create panel configuration: ${configError.message}`);
                  }

                  results.configurations_created++;
                } catch (configErr) {
                  results.errors.push(`Panel config error: ${configErr}`);
                }
              }
            }

          } catch (designErr) {
            results.errors.push(`Design error: ${designErr}`);
          }
        }

      } catch (projectErr) {
        results.errors.push(`Project error: ${projectErr}`);
      }
    }

    console.log('📊 New structure import completed!');
    console.log(`✅ Properties created: ${results.properties_created}`);
    console.log(`✅ User groups created: ${results.user_groups_created}`);
    console.log(`✅ Users created: ${results.users_created}`);
    console.log(`✅ Projects created: ${results.projects_created}`);
    console.log(`✅ Designs created: ${results.designs_created}`);
    console.log(`✅ Configurations created: ${results.configurations_created}`);
    
    if (results.errors.length > 0) {
      console.log(`⚠️ Errors encountered: ${results.errors.length}`);
      results.errors.forEach(error => console.log(`  - ${error}`));
    }

    return {
      success: true,
      message: `Import completed! Created ${results.properties_created} properties, ${results.user_groups_created} user groups, ${results.users_created} users, ${results.projects_created} projects, ${results.designs_created} designs, ${results.configurations_created} configurations`,
      results
    };

  } catch (error) {
    console.error('❌ Import failed:', error);
    return {
      success: false,
      message: `Import failed: ${error}`
    };
  }
};

// 🧪 VALIDATE NEW IMPORT DATA
export const validateImportDataNew = (data: any): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Accept colleague proposal by converting on-the-fly for validation only
  if (isColleagueProposalFormat(data)) {
    try {
      data = transformColleagueProposalToExtended(data);
    } catch (e) {
      errors.push('Failed to transform colleague proposal format');
      return { valid: false, errors };
    }
  }

  // Minimal schema support: allow { project_name, project_code?, designs:[{panel_type, quantity}] }
  const looksMinimal = !!data && typeof data === 'object' && data.project_name && Array.isArray(data.designs) && data.designs.every((d: any) => d && d.panel_type && typeof d.quantity === 'number' && d.design_name);

  if (!looksMinimal) {
    if (typeof data.properties === 'undefined' || !Array.isArray(data.properties)) {
    errors.push('Missing or invalid "properties" array');
    }
  }

  // user_groups and users are optional now
  if (typeof data.user_groups !== 'undefined' && !Array.isArray(data.user_groups)) {
    errors.push('Invalid "user_groups" array');
  }
  if (typeof data.users !== 'undefined' && !Array.isArray(data.users)) {
    errors.push('Invalid "users" array');
  }

  if (typeof data.projects !== 'undefined' && !Array.isArray(data.projects)) {
    errors.push('Invalid "projects" array');
  }

  // Validate properties
  if (!looksMinimal && data.properties) {
    data.properties.forEach((property: any, index: number) => {
      if (!property.region) {
        errors.push(`Property ${index}: Missing region`);
      }
      if (!property.property_name) {
        errors.push(`Property ${index}: Missing property_name`);
      }
    });
  }

  // Validate user groups
  if (!looksMinimal && data.user_groups) {
    data.user_groups.forEach((ug: any, index: number) => {
      if (!ug.ug) {
        errors.push(`User Group ${index}: Missing ug`);
      }
      if (!ug.property_name) {
        errors.push(`User Group ${index}: Missing property_name`);
      }
    });
  }

  // Validate users (email-only allowed)
  if (!looksMinimal && data.users) {
    data.users.forEach((user: any, index: number) => {
      if (!user.email) {
        errors.push(`User ${index}: Missing email`);
      }
    });
  }

  // Validate projects
  if (!looksMinimal && data.projects) {
    data.projects.forEach((project: any, index: number) => {
      // user_email is optional
      if (!project.project_name) {
        errors.push(`Project ${index}: Missing project_name`);
      }
      if (!project.designs || !Array.isArray(project.designs)) {
        errors.push(`Project ${index}: Missing or invalid designs array`);
      }

      if (project.designs) {
        project.designs.forEach((design: any, designIndex: number) => {
          // Allow either explicit design_name or revision_of (to auto-name)
          if (!design.design_name && !design.revision_of) {
            errors.push(`Project ${index}, Design ${designIndex}: Missing design_name or revision_of`);
          }
          if (!design.panel_type) {
            errors.push(`Project ${index}, Design ${designIndex}: Missing panel_type`);
          }
          // design_data is optional now; features can be provided instead. No error if both missing.
        });
      }
    });
  }

  // Minimal validations
  if (looksMinimal) {
    if (!data.project_name) errors.push('Missing project_name');
    if (!Array.isArray(data.designs) || data.designs.length === 0) errors.push('Missing designs array');
    data.designs.forEach((d: any, i: number) => {
      if (!d.panel_type) errors.push(`Design ${i}: Missing panel_type`);
      if (typeof d.quantity !== 'number' || d.quantity <= 0) errors.push(`Design ${i}: Invalid quantity`);
      if (!d.design_name) errors.push(`Design ${i}: Missing design_name`);
    });
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

// 📁 LOAD JSON FROM FILE (same as before)
export const loadJsonFromFile = async (file: File): Promise<ImportDataNew> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const jsonData = JSON.parse(e.target?.result as string);
        resolve(jsonData);
      } catch (error) {
        reject(new Error(`Invalid JSON file: ${error}`));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsText(file);
  });
};
