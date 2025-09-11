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
  ug_id: string; // Will be auto-generated
  ug: string; // Helper field
  property_name: string; // Helper field
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
  design_name: string;
  panel_type: string;
  design_data: ImportDesignData;
  panel_configurations?: ImportPanelConfiguration[];
}

interface ImportProject {
  user_email: string;
  project_name: string;
  project_description?: string;
  designs: ImportDesign[];
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
  user_groups: ImportUserGroup[];
  users: ImportUser[];
  projects: ImportProject[];
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
  };
}> => {
  try {
    console.log('📥 Starting new database import...');
    console.log(`📊 Importing ${jsonData.properties.length} properties, ${jsonData.users.length} users`);

    const results = {
      properties_created: 0,
      user_groups_created: 0,
      users_created: 0,
      projects_created: 0,
      designs_created: 0,
      configurations_created: 0,
      errors: [] as string[]
    };

    // Create property lookup map
    const propertyMap = new Map<string, string>();

    // 1. CREATE PROPERTIES
    for (const propertyData of jsonData.properties) {
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

    // 2. CREATE USER GROUPS
    for (const ugData of jsonData.user_groups) {
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

    // 3. CREATE USERS
    for (const userData of jsonData.users) {
      try {
        const { data: user, error: userError } = await supabase
          .from('users')
          .insert([{
            email: userData.email,
            ug_id: userData.ug_id // References the 'ug' field directly
          }])
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

    // 4. CREATE PROJECTS AND DESIGNS
    for (const projectData of jsonData.projects) {
      try {
        // Create the project
        const { data: project, error: projectError } = await supabase
          .from('user_projects')
          .insert([{
            user_email: projectData.user_email,
            project_name: projectData.project_name,
            project_description: projectData.project_description
          }])
          .select()
          .single();

        if (projectError) {
          throw new Error(`Failed to create project "${projectData.project_name}": ${projectError.message}`);
        }

        console.log(`✅ Created project: ${project.project_name}`);
        results.projects_created++;

        // Create designs for this project
        for (const designData of projectData.designs) {
          try {
            const { data: design, error: designError } = await supabase
              .from('user_designs')
              .insert([{
                project_id: project.id,
                user_email: projectData.user_email,
                design_name: designData.design_name,
                panel_type: designData.panel_type,
                design_data: designData.design_data
              }])
              .select()
              .single();

            if (designError) {
              throw new Error(`Failed to create design "${designData.design_name}": ${designError.message}`);
            }

            console.log(`✅ Created design: ${design.design_name}`);
            results.designs_created++;

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

  if (!data.properties || !Array.isArray(data.properties)) {
    errors.push('Missing or invalid "properties" array');
  }

  if (!data.user_groups || !Array.isArray(data.user_groups)) {
    errors.push('Missing or invalid "user_groups" array');
  }

  if (!data.users || !Array.isArray(data.users)) {
    errors.push('Missing or invalid "users" array');
  }

  if (!data.projects || !Array.isArray(data.projects)) {
    errors.push('Missing or invalid "projects" array');
  }

  // Validate properties
  if (data.properties) {
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
  if (data.user_groups) {
    data.user_groups.forEach((ug: any, index: number) => {
      if (!ug.ug) {
        errors.push(`User Group ${index}: Missing ug`);
      }
      if (!ug.property_name) {
        errors.push(`User Group ${index}: Missing property_name`);
      }
    });
  }

  // Validate users
  if (data.users) {
    data.users.forEach((user: any, index: number) => {
      if (!user.email) {
        errors.push(`User ${index}: Missing email`);
      }
      if (!user.ug) {
        errors.push(`User ${index}: Missing ug`);
      }
      if (!user.property_name) {
        errors.push(`User ${index}: Missing property_name`);
      }
    });
  }

  // Validate projects
  if (data.projects) {
    data.projects.forEach((project: any, index: number) => {
      if (!project.user_email) {
        errors.push(`Project ${index}: Missing user_email`);
      }
      if (!project.project_name) {
        errors.push(`Project ${index}: Missing project_name`);
      }
      if (!project.designs || !Array.isArray(project.designs)) {
        errors.push(`Project ${index}: Missing or invalid designs array`);
      }

      if (project.designs) {
        project.designs.forEach((design: any, designIndex: number) => {
          if (!design.design_name) {
            errors.push(`Project ${index}, Design ${designIndex}: Missing design_name`);
          }
          if (!design.panel_type) {
            errors.push(`Project ${index}, Design ${designIndex}: Missing panel_type`);
          }
          if (!design.design_data) {
            errors.push(`Project ${index}, Design ${designIndex}: Missing design_data`);
          }
        });
      }
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
