// 🏪 MOCK DATABASE - This is like a PRETEND PANTRY for storing designs
// This simulates a real database but stores everything in your browser's memory
// Think of it like a toy kitchen where you can pretend to store recipes

// 🗂️ THE DATABASE STRUCTURE - This is like a filing cabinet
// In a real database, this would be stored on a server (like Google Drive)
// In our mock database, this is just a JavaScript object in your browser's memory
// 
// Structure explanation:
// mockDatabase = {
//   "john@hotel.com": {           // Each email is like a customer folder
//     designs: [                   // Inside each folder is an array of designs
//       {
//         id: "design_123",        // Unique ID for this design (like a file name)
//         projectName: "Hotel Lobby", // Name of the project
//         panelType: "SP",         // Type of panel (SP, DPH, etc.)
//         designData: {            // All the design settings (colors, icons, etc.)
//           colors: ["#FF0000"],
//           icons: [...],
//           text: "Welcome"
//         },
//         createdAt: "2024-01-15", // When it was created
//         lastModified: "2024-01-16" // When it was last changed
//       }
//     ]
//   },
//   "jane@office.com": {          // Another customer's folder
//     designs: [...]
//   }
// }

const mockDatabase: {
  [email: string]: {              // Email is the key (like a folder name)
    designs: Array<{              // Array of designs (like files in the folder)
      id: string;                 // Unique identifier for each design
      projectName: string;        // Name of the project
      panelType: string;          // Type of panel (SP, DPH, etc.)
      designData: any;            // All the design settings and data
      createdAt: string;          // When the design was created
      lastModified: string;       // When the design was last modified
    }>;
  };
} = {};  // Start with an empty object (empty filing cabinet)

// 🆔 Helper function to create unique IDs (like giving each design a unique name)
const generateId = () => {
  return 'design_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
};

// 💾 SAVE DESIGN FUNCTION - This is like putting a recipe in the pantry
// This function takes a user's email and their design data, then saves it to our mock database
export const saveDesign = async (email: string, designData: any, location?: string, operator?: string) => {
  // ⏰ Simulate network delay (like walking to the pantry takes time)
  // In a real database, this would be the time it takes to send data to a server
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // 🆔 Create a unique ID for this design (like giving each recipe a unique name)
  // This ensures no two designs have the same ID, even if they have the same name
  const designId = generateId();
  
  // 📅 Get current date and time (like writing the date on a recipe card)
  const now = new Date().toISOString();
  
  // 🗂️ Create the design object (like writing down a complete recipe)
  // This is the actual data that gets stored in our "filing cabinet"
  const design = {
    id: designId,                                    // Unique identifier (like recipe #123)
    projectName: designData.projectName || 'Untitled Design',  // Name of the project
    panelType: designData.panelType || 'SP',         // Type of panel (SP, DPH, etc.)
    designData: {
      ...JSON.parse(JSON.stringify(designData)),  // Deep copy all the design settings
      location: location || designData.location,   // Add location if provided
      operator: operator || designData.operator    // Add operator if provided
    },
    createdAt: now,                                  // When this design was first created
    lastModified: now                                // When this design was last modified
  };
  
  // 🏪 DATABASE OPERATION: Check if this user has a folder yet
  // If the user doesn't exist in our database, create a new folder for them
  if (!mockDatabase[email]) {
    // Create a new customer folder (like creating a new drawer in the filing cabinet)
    mockDatabase[email] = { designs: [] };
    console.log(`📁 Created new folder for user: ${email}`);
  }
  
  // 📁 DATABASE OPERATION: Add the design to the user's folder
  // This is like putting a recipe card in the customer's folder
  console.log('🔍 SAVING NEW DESIGN:');
  console.log('  Design ID:', design.id);
  console.log('  Project Name:', design.projectName);
  console.log('  Location:', location);
  console.log('  Operator:', operator);
  console.log('  Design Data:', design.designData);
  console.log('  Design Data panels:', design.designData?.designData?.panels);
  console.log('  First panel name:', design.designData?.designData?.panels?.[0]?.panelName);
  mockDatabase[email].designs.push(design);
  
  // 📝 Log what we just did (for debugging and learning)
  console.log(`🍽️ Design saved to mock database for ${email}:`, design);
  console.log(`📊 Total designs for ${email}: ${mockDatabase[email].designs.length}`);
  
  // ✅ Return success response (like confirming the recipe was saved)
  return {
    success: true,
    designId: designId,  // Return the ID so we know which design was saved
    message: 'Design saved successfully! (Mock)'
  };
};

// 📋 GET DESIGNS FUNCTION - This is like looking through a customer's recipe folder
// This function takes a user's email and returns all their saved designs
export const getDesigns = async (email: string) => {
  // ⏰ Simulate network delay (like walking to the filing cabinet takes time)
  // In a real database, this would be the time it takes to fetch data from a server
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // 🗂️ DATABASE OPERATION: Get the user's designs from the mock database
  // This is like opening a customer's folder and looking at all their recipe cards
  const userDesigns = mockDatabase[email]?.designs || [];
  // 
  // Explanation of this line:
  // mockDatabase[email] = Look up the user's folder by their email
  // ?.designs = If the folder exists, get the designs array (if not, don't crash)
  // || [] = If the folder doesn't exist, return an empty array instead
  
  // 📝 Log what we found (for debugging and learning)
  console.log(`📋 Retrieved ${userDesigns.length} designs for ${email}`);
  console.log(`📊 Database state for ${email}:`, mockDatabase[email]);
  
  // ✅ Return the designs (like handing the customer their recipe folder)
  // Create deep copies to prevent shared references
  const deepCopiedDesigns = userDesigns.map(design => JSON.parse(JSON.stringify(design)));
  console.log('🔍 GET DESIGNS - Returning deep copies to prevent shared references');
  console.log('  Original designs count:', userDesigns.length);
  console.log('  Deep copied designs count:', deepCopiedDesigns.length);
  
  return {
    success: true,
    designs: deepCopiedDesigns,  // Array of all the user's designs (deep copied)
    message: `Found ${deepCopiedDesigns.length} designs`
  };
};

// 📋 GET ALL DESIGNS (ADMIN) - Mock implementation across all users
export const getAllDesigns = async (filters?: {
  location?: string;
  operator?: string;
  service_partner?: string;
  projectName?: string;
  panelType?: string;
  userEmail?: string;
  search?: string;
  orderBy?: 'last_modified' | 'created_at';
  ascending?: boolean;
  limit?: number;
}) => {
  await new Promise(resolve => setTimeout(resolve, 200));
  const {
    location,
    operator,
    projectName,
    panelType,
    userEmail,
    search,
    orderBy = 'last_modified',
    ascending = false,
    limit
  } = filters || {};

  // Flatten all designs across users
  let allDesigns: any[] = [];
  Object.entries(mockDatabase).forEach(([email, data]) => {
    const userDesigns = (data as any).designs || [];
    userDesigns.forEach((d: any) => {
      allDesigns.push({
        id: d.id,
        design_name: d.projectName,
        panel_type: d.panelType,
        design_data: d.designData,
        created_at: d.createdAt,
        last_modified: d.lastModified,
        user_email: email,
        project_name: d.projectName,
        project_description: null,
        location: d.designData?.location,
        operator: d.designData?.operator,
        service_partner: null
      });
    });
  });

  // Filters
  if (userEmail && userEmail.trim() !== '') {
    allDesigns = allDesigns.filter(d => (d.user_email || '').toLowerCase().includes(userEmail.toLowerCase()));
  }
  if (location && location.trim() !== '') {
    allDesigns = allDesigns.filter(d => (d.location || '').toLowerCase().includes(location.toLowerCase()));
  }
  if (operator && operator.trim() !== '') {
    allDesigns = allDesigns.filter(d => (d.operator || '').toLowerCase().includes(operator.toLowerCase()));
  }
  if (projectName && projectName.trim() !== '') {
    allDesigns = allDesigns.filter(d => (d.project_name || '').toLowerCase().includes(projectName.toLowerCase()));
  }
  if (panelType && panelType.trim() !== '') {
    allDesigns = allDesigns.filter(d => (d.panel_type || '').toLowerCase().includes(panelType.toLowerCase()));
  }
  if (search && search.trim() !== '') {
    const s = search.toLowerCase();
    allDesigns = allDesigns.filter(d =>
      (d.project_name || '').toLowerCase().includes(s) ||
      (d.design_name || '').toLowerCase().includes(s)
    );
  }

  // Sort
  allDesigns.sort((a, b) => {
    const key = orderBy === 'created_at' ? 'created_at' : 'last_modified';
    const av = new Date(a[key] || 0).getTime();
    const bv = new Date(b[key] || 0).getTime();
    return ascending ? av - bv : bv - av;
  });

  if (typeof limit === 'number' && limit > 0) {
    allDesigns = allDesigns.slice(0, limit);
  }

  return {
    success: true,
    designs: allDesigns,
    message: `Found ${allDesigns.length} designs (mock)`
  };
};

// 🔍 Get a specific design by ID (like finding a specific recipe)
export const getDesignById = async (email: string, designId: string) => {
  // ⏰ Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 200));
  
  // 🗂️ Find the specific design in the user's folder
  const userDesigns = mockDatabase[email]?.designs || [];
  const design = userDesigns.find(d => d.id === designId);
  
  if (design) {
    console.log(`🔍 Found design ${designId} for ${email}`);
    return {
      success: true,
      design: design,
      message: 'Design found!'
    };
  } else {
    console.log(`❌ Design ${designId} not found for ${email}`);
    return {
      success: false,
      design: null,
      message: 'Design not found'
    };
  }
};

// 🗑️ DELETE DESIGN FUNCTION - This is like throwing away a recipe you don't want
// This function takes a user's email and a design ID, then removes that design from the database
export const deleteDesign = async (email: string, designId: string) => {
  // ⏰ Simulate network delay (like walking to the filing cabinet takes time)
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // 🗂️ DATABASE OPERATION: Remove the design from the user's folder
  // This is like finding a recipe card and throwing it away
  if (mockDatabase[email]) {
    // Filter out the design with the matching ID (like removing one card from a stack)
    mockDatabase[email].designs = mockDatabase[email].designs.filter(
      d => d.id !== designId  // Keep all designs EXCEPT the one we want to delete
    );
  }
  
  // 📝 Log what we just did
  console.log(`🗑️ Deleted design ${designId} for ${email}`);
  console.log(`📊 Remaining designs for ${email}: ${mockDatabase[email]?.designs.length || 0}`);
  
  return {
    success: true,
    message: 'Design deleted successfully! (Mock)'
  };
};

// 🔄 UPDATE DESIGN FUNCTION - This is like editing an existing recipe
// This function takes a user's email, design ID, and updated design data, then updates the existing design
export const updateDesign = async (email: string, designId: string, updatedDesignData: any) => {
  // ⏰ Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // 🗂️ Check if user exists in database
  if (!mockDatabase[email]) {
    console.log(`❌ User ${email} not found in mock database`);
    return { 
      success: false, 
      message: 'User not found in mock database.' 
    };
  }
  
  // 🔍 Find the design to update
  const designIndex = mockDatabase[email].designs.findIndex(d => d.id === designId);
  
  if (designIndex === -1) {
    console.log(`❌ Design ${designId} not found for ${email}`);
    return { 
      success: false, 
      message: 'Design not found in mock database.' 
    };
  }
  
  // 📅 Get current date and time
  const now = new Date().toISOString();
  
  // 🔄 Update the existing design while preserving the original ID and creation date
  // Use deep copy to prevent shared references between revisions
  const existingDesign = mockDatabase[email].designs[designIndex];
  const deepCopiedData = JSON.parse(JSON.stringify(updatedDesignData));
  console.log('🔄 UPDATING DESIGN WITH DEEP COPY:');
  console.log('Original design ID:', existingDesign.id);
  console.log('Original project name:', existingDesign.projectName);
  console.log('New project name:', deepCopiedData.projectName);
  console.log('Deep copied data:', deepCopiedData);
  
  // Create a completely new object with deep copies to prevent any shared references
  const updatedDesign = {
    id: existingDesign.id,               // Keep original ID
    projectName: deepCopiedData.projectName,
    panelType: deepCopiedData.panelType,
    designData: JSON.parse(JSON.stringify(deepCopiedData.designData)), // Deep copy design data
    createdAt: existingDesign.createdAt, // Keep original creation date
    lastModified: now                    // Update the modification timestamp
  };
  
  console.log('🔍 UPDATING DESIGN - Deep copy verification:');
  console.log('  Original design ID:', existingDesign.id);
  console.log('  Updated design ID:', updatedDesign.id);
  console.log('  Are they the same object?', existingDesign === updatedDesign);
  console.log('  Are designData the same object?', existingDesign.designData === updatedDesign.designData);
  console.log('  Original first panel name:', existingDesign.designData?.designData?.panels?.[0]?.panelName);
  console.log('  Updated first panel name:', updatedDesign.designData?.designData?.panels?.[0]?.panelName);
  
  mockDatabase[email].designs[designIndex] = updatedDesign;
  
  // 📝 Log what we just did
  console.log(`🔄 Design updated in mock database for ${email}:`, mockDatabase[email].designs[designIndex]);
  console.log(`📊 Total designs for ${email}: ${mockDatabase[email].designs.length}`);
  
  return { 
    success: true, 
    message: 'Design updated successfully! (Mock)' 
  };
};

// 🔍 DEBUG FUNCTION - This shows you exactly what's in the database
// This is like opening the filing cabinet and looking at everything
export const debugDatabase = () => {
  console.log('🔍 MOCK DATABASE CONTENTS:');
  console.log('📊 Total users:', Object.keys(mockDatabase).length);
  
  Object.keys(mockDatabase).forEach(email => {
    const userData = mockDatabase[email];
    console.log(`📧 User: ${email}`);
    console.log(`📋 Designs: ${userData.designs.length}`);
    userData.designs.forEach(design => {
      console.log(`  - ${design.projectName} (${design.panelType}) - ID: ${design.id}`);
    });
  });
  
  return mockDatabase;
}; 