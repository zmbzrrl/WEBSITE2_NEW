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
          .schema('api')
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
          .schema('api')
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
            .schema('api')
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
              .schema('api')
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
          .schema('api')
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
          .schema('api')
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
              .schema('api')
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
              .schema('api')
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
          .schema('api')
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
          .schema('api')
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
              .schema('api')
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
                    .schema('api')
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
