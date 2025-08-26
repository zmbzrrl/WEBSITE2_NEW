// src/assets/iconLibrary2.ts

interface IconModule {
  default: string;
}

// Import all SVG icons from icons2 folder
const icons2: Record<string, IconModule> = import.meta.glob("./icons2/*.svg", { eager: true });

// Convert the imported modules to a more usable format
const processIcons = (icons: Record<string, IconModule>) => {
  return Object.entries(icons).reduce((acc, [path, module]) => {
    const name = path.split("/").pop()?.replace(".svg", "") || "";
    const id = name; // Use the filename as the ID
    
    // Create label by replacing spaces and special characters
    let label = name.replace(/([A-Z])/g, ' $1').trim(); // Add space before capital letters
    label = label.replace(/\s+/g, ' '); // Replace multiple spaces with single space
    
    // Determine category based on icon name
    let category = "General";
    if (name.toLowerCase().includes("bathroom") || name.toLowerCase().includes("shower") || name.toLowerCase().includes("bathtub")) {
      category = "Bathroom";
    } else if (name.toLowerCase().includes("light") || name.toLowerCase().includes("lamp") || name.toLowerCase().includes("chandelier")) {
      category = "Room Lights";
    } else if (name.toLowerCase().includes("curtain") || name.toLowerCase().includes("blind")) {
      category = "Curtains & Blinds";
    } else if (name.toLowerCase().includes("butler") || name.toLowerCase().includes("service") || name.toLowerCase().includes("bell")) {
      category = "Guest Services";
    } else if (name.toLowerCase().includes("scene") || name.toLowerCase().includes("bedroom") || name.toLowerCase().includes("dining")) {
      category = "Scenes";
    } else if (name.toLowerCase().includes("fan")) {
      category = "Climate";
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

// Export the icons and categories
export const iconCategories = [
  "Bathroom",
  "Room Lights", 
  "Curtains & Blinds",
  "Guest Services",
  "Scenes",
  "Climate",
  "General"
];

// Export the full icon set for customizer use
export const allIcons = {
  ...processIcons(icons2),
  // Add PIR icon
  "PIR": {
    id: "PIR",
    src: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0OCIgaGVpZ2h0PSI0OCIgdmlld0JveD0iMCAwIDQ4IDQ4Ij48Y2lyY2xlIGN4PSIyNCIgY3k9IjI0IiByPSIyMCIgZmlsbD0id2hpdGUiIHN0cm9rZT0iIzY2NiIgc3Ryb2tlLXdpZHRoPSIyIi8+PC9zdmc+",
    category: "PIR",
    label: "PIR"
  }
};

// Export the filtered user-selectable icons (same as allIcons for now)
export default allIcons;
