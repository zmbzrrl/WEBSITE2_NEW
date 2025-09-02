// src/assets/iconLibrary.ts

interface IconModule {
  default: string;
}

// Import SVG icons from optional icons2 folder (may be empty)
const icons2: Record<string, IconModule> = import.meta.glob("./icons2/*.svg", { eager: true });
// Import general icons from icons/ subfolders (svg and png)
const generalIconsRaw: Record<string, IconModule> = {
  ...import.meta.glob("./icons/**/*.svg", { eager: true }),
  ...import.meta.glob("./icons/**/*.png", { eager: true }),
};
// Import TAG icons (svg and png)
const tagIconsRaw: Record<string, IconModule> = {
  ...import.meta.glob("./TAG_icons/*.svg", { eager: true }),
  ...import.meta.glob("./TAG_icons/*.png", { eager: true }),
};

// Convert the imported modules to a more usable format
const processIcons = (icons: Record<string, IconModule>) => {
  return Object.entries(icons).reduce((acc, [path, module]) => {
    const name = path.split("/").pop()?.replace(".svg", "") || "";
    const id = name; // Use the filename as the ID
    
    // Create label by replacing spaces and special characters
    let label = name.replace(/([A-Z])/g, ' $1').trim(); // Add space before capital letters
    label = label.replace(/\s+/g, ' '); // Replace multiple spaces with single space
    
    // Determine category based on folder name first, then fallback to filename
    let category = "General";
    const lowerPath = path.toLowerCase();
    if (lowerPath.includes("/a-bathroom/")) category = "Bathroom";
    else if (lowerPath.includes("/b-roomlights/")) category = "Room Lights";
    else if (lowerPath.includes("/c-curtains&blinds/") || lowerPath.includes("/c-curtains") || lowerPath.includes("/curtains&blinds/")) category = "Curtains & Blinds";
    else if (lowerPath.includes("/g-guestservices/")) category = "Guest Services";
    else {
      const lowerName = name.toLowerCase();
      if (lowerName.includes("bathroom") || lowerName.includes("shower") || lowerName.includes("bathtub")) {
        category = "Bathroom";
      } else if (lowerName.includes("light") || lowerName.includes("lamp") || lowerName.includes("chandelier") || lowerName.includes("master") || lowerName.includes("bulb") || lowerName.includes("sconce")) {
        category = "Room Lights";
      } else if (lowerName.includes("curtain") || lowerName.includes("curtains") || lowerName.includes("blind") || lowerName.includes("sheer")) {
        category = "Curtains & Blinds";
      } else if (
        lowerName.includes("butler") ||
        lowerName.includes("service") ||
        lowerName.includes("bell") ||
        lowerName.includes("dnd") ||
        lowerName.includes("mur") ||
        lowerName.includes("privacy") ||
        lowerName.includes("make up") ||
        lowerName.includes("makeup") ||
        lowerName.includes("do not disturb") ||
        lowerName.includes("make up room") ||
        lowerName.includes("make-up")
      ) {
        category = "Guest Services";
      } else if (lowerName.includes("scene") || lowerName.includes("bedroom") || lowerName.includes("dining")) {
        category = "Scenes";
      }
    }
    
    acc[id] = {
      id,
      src: module.default,
      category,
      label
    };
    return acc;
  }, {} as Record<string, { id: string; src: string; category: string; label: string }>);
};

// Process TAG icons with explicit TAG category
const processTagIcons = (icons: Record<string, IconModule>) => {
  return Object.entries(icons).reduce((acc, [path, module]) => {
    const name = path.split("/").pop()?.replace(/\.(svg|png)$/i, "") || "";
    const id = name;
    let label = name.replace(/([A-Z])/g, ' $1').trim();
    label = label.replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim();
    acc[id] = {
      id,
      src: module.default,
      category: "TAG",
      label
    };
    return acc;
  }, {} as Record<string, { id: string; src: string; category: string; label: string }>);
};

// Define limitation types
export type LimitationType = 'all' | 'icons_only' | 'text_only' | 'icons_with_text';

// Create a filtered version for user selection based on limitation type
const createUserSelectableIcons = (allIcons: Record<string, { id: string; src: string; category: string; label: string }>, limitationType: LimitationType = 'all') => {
  const userSelectableIcons = { ...allIcons };
  
  // Remove fan/climate related icons except for TAG category
  Object.keys(userSelectableIcons).forEach(iconId => {
    const icon = userSelectableIcons[iconId];
    if (icon && icon.category !== 'TAG' && iconId.toLowerCase().includes("fan")) {
      delete userSelectableIcons[iconId];
    }
  });

  // Apply limitation filters
  switch (limitationType) {
    case 'icons_only':
      // Remove text-only icons (icons that are primarily text-based)
      Object.keys(userSelectableIcons).forEach(iconId => {
        const icon = userSelectableIcons[iconId];
        if (icon.category === "General" && (
          iconId.toLowerCase().includes("text") || 
          iconId.toLowerCase().includes("label") ||
          iconId.toLowerCase().includes("number") ||
          iconId.toLowerCase().includes("letter")
        )) {
          delete userSelectableIcons[iconId];
        }
      });
      break;
      
    case 'text_only':
      // Keep only text-based icons
      Object.keys(userSelectableIcons).forEach(iconId => {
        const icon = userSelectableIcons[iconId];
        if (!(icon.category === "General" && (
          iconId.toLowerCase().includes("text") || 
          iconId.toLowerCase().includes("label") ||
          iconId.toLowerCase().includes("number") ||
          iconId.toLowerCase().includes("letter")
        ))) {
          delete userSelectableIcons[iconId];
        }
      });
      break;
      
    case 'icons_with_text':
      // Keep all icons (both pictorial and text-based)
      // This is the same as 'all' - no additional filtering
      break;
      
    case 'all':
    default:
      // Keep all icons - no additional filtering
      break;
  }
  
  return userSelectableIcons;
};

// Export the icons and categories
export const iconCategories = [
  "Bathroom",
  "Room Lights",
  "Curtains & Blinds",
  "Guest Services",
  "Scenes",
  "General",
  "TAG",
  "PIR"
];

// Export the full icon set for customizer use
export const allIcons = {
  ...processIcons(icons2),
  ...processIcons(generalIconsRaw),
  ...processTagIcons(tagIconsRaw),
  // Add PIR icon
  "PIR": {
    id: "PIR",
    src: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0OCIgaGVpZ2h0PSI0OCIgdmlld0JveD0iMCAwIDQ4IDQ4Ij48Y2lyY2xlIGN4PSIyNCIgY3k9IjI0IiByPSIyMCIgZmlsbD0id2hpdGUiIHN0cm9rZT0iIzY2NiIgc3Ryb2tlLXdpZHRoPSIyIi8+PC9zdmc+",
    category: "PIR",
    label: "PIR"
  }
};

// Export the filtered user-selectable icons (default to 'all')
export default createUserSelectableIcons(allIcons); 

// Export the limitation function for use in customizers
export { createUserSelectableIcons }; 