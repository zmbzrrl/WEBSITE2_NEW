// src/assets/iconLibrary.ts

interface IconModule {
  default: string;
}

// Import all SVG icons from icons2 folder
const icons2: Record<string, IconModule> = import.meta.glob("./icons2/*.svg", { eager: true });

// Import all SVG icons from TAG_icons folder
const tagIcons: Record<string, IconModule> = import.meta.glob("./TAG_icons/*.svg", { eager: true });

// Import PNG icons from non_icons folder
const nonIcons: Record<string, IconModule> = import.meta.glob("./non_icons/*.png", { eager: true });

// Import PNG icons from icons folder
const icons: Record<string, IconModule> = import.meta.glob("./icons/*.png", { eager: true });

// Convert the imported modules to a more usable format
const processIcons = (icons: Record<string, IconModule>, categoryOverride?: string) => {
  return Object.entries(icons).reduce((acc, [path, module]) => {
    const name = path.split("/").pop()?.replace(/\.(svg|png)$/, "") || "";
    const id = name; // Use the filename as the ID
    
    // Create label by replacing spaces and special characters
    let label = name.replace(/([A-Z])/g, ' $1').trim(); // Add space before capital letters
    label = label.replace(/\s+/g, ' '); // Replace multiple spaces with single space
    
    // Determine category based on icon name or override
    let category = categoryOverride || "General";
    if (!categoryOverride) {
      if (name.toLowerCase().includes("bathroom") || name.toLowerCase().includes("shower") || name.toLowerCase().includes("bathtub")) {
        category = "Bathroom";
      } else if (name.toLowerCase().includes("light") || name.toLowerCase().includes("lamp") || name.toLowerCase().includes("chandelier") || name.toLowerCase().includes("master") || name.toLowerCase().includes("bulb") || name.toLowerCase().includes("sconce")) {
        category = "Room Lights";
      } else if (name.toLowerCase().includes("curtain") || name.toLowerCase().includes("curtains") || name.toLowerCase().includes("blind") || name.toLowerCase().includes("sheer")) {
        category = "Curtains & Blinds";
      } else if (name.toLowerCase().includes("butler") || name.toLowerCase().includes("service") || name.toLowerCase().includes("bell") || name.toLowerCase().includes("dnd") || name.toLowerCase().includes("mur")) {
        category = "Guest Services";
      } else if (name.toLowerCase().includes("scene") || name.toLowerCase().includes("bedroom") || name.toLowerCase().includes("dining")) {
        category = "Scenes";
      } else if (name === "CF" || name === "C" || name === "F") {
        category = "TAG";
      } else if (name === "DISPLAY") {
        category = "General";
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

// Define limitation types
export type LimitationType = 'all' | 'icons_only' | 'text_only' | 'icons_with_text';

// Create a filtered version for user selection based on limitation type
const createUserSelectableIcons = (allIcons: Record<string, { id: string; src: string; category: string; label: string }>, limitationType: LimitationType = 'all') => {
  const userSelectableIcons = { ...allIcons };
  
  // Remove fan/climate related icons (except the new fan speed icons)
  Object.keys(userSelectableIcons).forEach(iconId => {
    if (iconId.toLowerCase().includes("fan") && !iconId.toLowerCase().includes("fanspeed")) {
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
  "PIR",
  "TAG",
  "TAG_icons"
];

// Export the full icon set for customizer use
export const allIcons = {
  ...processIcons(icons2),
  ...processIcons(tagIcons, "TAG_icons"),
  ...processIcons(nonIcons, "TAG"),
  ...processIcons(icons, "General"),
  // Add PIR icon
  "PIR": {
    id: "PIR",
    src: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0OCIgaGVpZ2h0PSI0OCIgdmlld0JveD0iMCAwIDQ4IDQ4Ij48Y2lyY2xlIGN4PSIyNCIgY3k9IjI0IiByPSIyMCIgZmlsbD0id2hpdGUiIHN0cm9rZT0iIzY2NiIgc3Ryb2tlLXdpZHRoPSIyIi8+PC9zdmc+",
    category: "PIR",
    label: "PIR"
  },

  // Add TAG icons (CF, C, F)
  "CF": {
    id: "CF",
    src: "data:image/svg+xml;base64,PHN2ZyBpZD0iSWNvbnMiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgdmlld0JveD0iMCAwIDQ4IDQ4Ij48ZGVmcz48c3R5bGU+LmNscy0xe2ZpbGw6IzY0Njg2OTt9PC9zdHlsZT48L2RlZnM+PHRpdGxlPlJlc2l6ZSBHU0JJRzwvdGl0bGU+PHJlY3QgY2xhc3M9ImNscy0xIiB4PSIxNS4yIiB5PSIyMy4zIiB3aWR0aD0iMTguNSIgaGVpZ2h0PSIxLjgiLz48cGF0aCBjbGFzcz0iY2xzLTEiIGQ9Ik0xOS42LDE0LjFhMi43LDIuNywwLDAsMCwyLC44MSwyLjcsMi43LDAsMCwwLC44My0yLDIuOCwyLjgsMCwwLDAtLjgxLTIsMy4xLDMuMSwwLDAsMC00LjMsMCwyLjgsMi44LDAsMCwwLDAsNC4wN0EyLjcsMi43LDAsMCwwLDE5LjYsMTQuMVptLTEuMy00LjFhMS44NSwxLjg1LDAsMCwxLDEuMzUtLjU1LDEuNzgsMS43OCwwLDAsMSwxLjMzLjU1LDEuOSwxLjksMCwwLDEsMCwyLjY3LDEuOTMsMS45MywwLDAsMS0yLjY5LDAsMS44NiwxLjg2LDAsMCwxLS41NC0xLjM2QTEuNzMsMS43MywwLDAsMSwxOC4zLDEwWiIvPjxwYXRoIGNsYXNzPSJjbHMtMSIgZD0iTTI5LjYsMjEuMWE2LjE1LDYuMTUsMCwwLDAsMi42LS40NkwzMi4xLDE4LjZhNS4zLDUuMywwLDAsMS0yLC4zNWMtMi4xOSwwLTMuNTktMS40Ni0zLjU5LTQuMTgsMC0yLjksMS41OS00LjI4LDMuNjEtNC4yOGE0Ljc1LDQuNzUsMCwwLDEsMS45LjM4bC40My0xLjYzYTUuMzQsNS4zNCwwLDAsMC0yLjQxLS40NWMtMy4wOSwwLTUuNjUsMi4wOC01LjY1LDYuMDlDMjMuNTgsMTguNDIsMjUuNjEsMjEuMSwyOS42LDIxLjFaIi8+PHBhdGggY2xhc3M9ImNscy0xIiBkPSJNMTcuNSwyOS4yYTIuNzYsMi43NiwwLDAsMC0uODYsMi4wNCwyLjksMi45LDAsMCwwLDIuOSwyLjkzLDIuODUsMi44NSwwLDAsMCwyLjA2LS44NSwyLjksMi45LDAsMCwwLDAtNC4xQTIuOTQsMi45NCwwLDAsMCwxNy41LDI5LjJabTMuNDEsMy40MWEyLDIsMCwwLDEtMi43NCwwLDEuODYsMS44NiwwLDAsMS0uNjgtLjY4LDEuNzgsMS43OCwwLDAsMSwuNTgtMS4zNCwyLjM5LDIuMzksMCwwLDEsMS4zOC0uNTUsMS44MywxLjgzLDAsMCwxLDEuMzUuNTUsMi4yLDIuMiwwLDAsMCwwLDMuMDdaIi8+PHBvbHlnb24gY2xhc3M9ImNscy0xIiBwb2ludHM9IjI0LjggNDAuNSAyNy4xIDQwLjUgMjcuMSAzNS4yIDMxLjEgMzUuMiAzMS4xIDMzLjkgMjcuMSAzMy45IDI3LjEgMzAuNiAzMS4yIDMwLjYgMzEuMiAyOS4xIDI0LjggMjkuMSAyNC44IDQwLjUiLz48L3N2Zz4=",
    category: "TAG",
    label: "CF"
  },

};

// Export the filtered user-selectable icons (default to 'all')
export default createUserSelectableIcons(allIcons); 

// Export the limitation function for use in customizers
export { createUserSelectableIcons }; 