// src/assets/iconLibrary.ts

interface IconModule {
  default: string;
}

// Import all icons from each category
const bathroomIcons: Record<string, IconModule> = import.meta.glob("./icons/A-Bathroom/*.png", { eager: true });
const roomlightIcons: Record<string, IconModule> = import.meta.glob("./icons/B-Roomlights/*.png", { eager: true });
const curtainIcons: Record<string, IconModule> = import.meta.glob("./icons/C-Curtains&Blinds/*.png", { eager: true });
const guestServicesIcons: Record<string, IconModule> = import.meta.glob("./icons/G-GuestServices/*.png", { eager: true });
const generalIconsForLighting: Record<string, IconModule> = import.meta.glob("./icons/D-GeneralIconsForLighting/*.png", { eager: true });
const socketsIcons: Record<string, IconModule> = import.meta.glob("./sockets/*.png", { eager: true });
// Import new icons from the root of icons folder
const rootIcons: Record<string, IconModule> = import.meta.glob("./icons/*.png", { eager: true });

// Convert the imported modules to a more usable format
const processIcons = (icons: Record<string, IconModule>, category: string) => {
  return Object.entries(icons).reduce((acc, [path, module]) => {
    const name = path.split("/").pop()?.replace(".png", "") || "";
    const id = name; // Use the filename as the ID
    
    // Create label by replacing hyphens with spaces, then removing spaces between letters and numbers
    let label = name.replace(/-/g, " ").toUpperCase();
    // Remove spaces between letters and numbers (e.g., "A 17" -> "A17")
    label = label.replace(/([A-Z])\s+(\d+)/g, "$1$2");
    
    acc[id] = {
      id,
      src: module.default,
      category,
      label
    };
    return acc;
  }, {} as Record<string, { id: string; src: string; category: string; label: string }>);
};

// Create a filtered version for user selection (excludes DISPLAY, CR, FAN from TAG)
const createUserSelectableIcons = (allIcons: Record<string, { id: string; src: string; category: string; label: string }>) => {
  const userSelectableIcons = { ...allIcons };
  
  // Remove DISPLAY, CR, and FAN from TAG category for user selection
  ["DISPLAY", "CR", "FAN"].forEach(iconName => {
    if (userSelectableIcons[iconName] && userSelectableIcons[iconName].category === "TAG") {
      delete userSelectableIcons[iconName];
    }
  });
  
  return userSelectableIcons;
};

// Export the icons and categories
export const iconCategories = [
  "Bathroom",
  "Room Lights",
  "Curtains & Blinds",
  "Guest Services",
  "General Icons for Lighting",
  "TAG",
  "Sockets",
  "PIR"
];

// Export the full icon set for customizer use
export const allIcons = {
  ...processIcons(bathroomIcons, "Bathroom"),
  ...processIcons(roomlightIcons, "Room Lights"),
  ...processIcons(curtainIcons, "Curtains & Blinds"),
  ...processIcons(guestServicesIcons, "Guest Services"),
  ...processIcons(generalIconsForLighting, "General Icons for Lighting"),
  ...processIcons(socketsIcons, "Sockets"),
  ...processIcons(rootIcons, "TAG"),
  // Add PIR icon
  "PIR": {
    id: "PIR",
    src: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0OCIgaGVpZ2h0PSI0OCIgdmlld0JveD0iMCAwIDQ4IDQ4Ij48Y2lyY2xlIGN4PSIyNCIgY3k9IjI0IiByPSIyMCIgZmlsbD0id2hpdGUiIHN0cm9rZT0iIzY2NiIgc3Ryb2tlLXdpZHRoPSIyIi8+PC9zdmc+",
    category: "PIR",
    label: "PIR"
  }
};

// Export the filtered user-selectable icons
export default createUserSelectableIcons(allIcons); 