// Panel Layout Configuration
// This file defines the standard formatting and layout for each panel type
// Used by PanelPreview component to ensure consistent appearance in ProjPanels page

export interface PanelLayoutConfig {
  dimensions: {
    width: string;
    height: string;
  };
  // Support for different dimension configurations
  dimensionConfigs?: {
    [key: string]: {
      width: string;
      height: string;
      iconPositions?: Array<{ top: string; left: string; width?: string; height?: string; }>;
    };
  };
  // Absolute positions for each icon slot (optional)
  iconPositions?: Array<{ top: string; left: string; width?: string; height?: string; }>;
  gridLayout?: {
    rows: number;
    columns: number;
    gap: string;
    padding: string;
    transform?: string;
  };
  iconLayout?: {
    size: string;
    spacing: string;
    position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  };
  bigIconLayout?: {
    size: string;
    position: 'left' | 'right' | 'top' | 'bottom';
    width: string;
    height: string;
  };
  textLayout?: {
    fontSize: string;
    position: 'absolute' | 'static';
    bottom?: string;
    padding?: string;
  };
  specialLayouts?: {
    [key: string]: any;
  };
}

export const PANEL_LAYOUT_CONFIG: { [key: string]: PanelLayoutConfig } = {
  // Single Panel (SP) with absolute icon positions matching SPCustomizer layout
  SP: {
    dimensions: {
      width: '95mm',
      height: '95mm'
    },
    dimensionConfigs: {
      standard: {
        width: '95mm',
        height: '95mm',
        iconPositions: [
          { top: '51px', left: '52px' },   // +6px down, +5px right
          { top: '51px', left: '141px' },
          { top: '51px', left: '231px' },
          { top: '139px', left: '52px' },
          { top: '139px', left: '141px' },
          { top: '139px', left: '231px' },
          { top: '231px', left: '52px' },
          { top: '231px', left: '141px' },
          { top: '231px', left: '231px' },
        ]
      },
      wide: {
        width: '130mm',
        height: '88mm',
        // Use the same 3x3 grid positions as standard
        iconPositions: [
          { top: '51px', left: '52px' },
          { top: '51px', left: '141px' },
          { top: '51px', left: '231px' },
          { top: '139px', left: '52px' },
          { top: '139px', left: '141px' },
          { top: '139px', left: '231px' },
          { top: '227px', left: '52px' },
          { top: '227px', left: '141px' },
          { top: '227px', left: '231px' },
        ]
      },
      tall: {
        width: '95mm',
        height: '130mm',
        // Use the same 3x3 grid positions as standard
        iconPositions: [
          { top: '51px', left: '52px' },
          { top: '51px', left: '141px' },
          { top: '51px', left: '231px' },
          { top: '139px', left: '52px' },
          { top: '139px', left: '141px' },
          { top: '139px', left: '231px' },
          { top: '227px', left: '52px' },
          { top: '227px', left: '141px' },
          { top: '227px', left: '231px' },
        ]
      }
    },
    // Default icon positions (for backward compatibility)
    iconPositions: [
      { top: '51px', left: '52px' },
      { top: '51px', left: '141px' },
      { top: '51px', left: '231px' },
      { top: '139px', left: '52px' },
      { top: '139px', left: '141px' },
      { top: '139px', left: '231px' },
      { top: '227px', left: '52px' },
      { top: '227px', left: '141px' },
      { top: '227px', left: '231px' },
    ],
    iconLayout: {
      size: '52.16px',
      spacing: '5px',
      position: 'top'
    },
    textLayout: {
      fontSize: '12px',
      position: 'absolute',
      bottom: '13px',
      padding: '-1px'
    },
    specialLayouts: {
      PIR: {
        iconSize: '40px',
        marginTop: '0'
      },
      Bathroom: {
        iconSize: '38px' // Match standard SP icon size for consistency
      }
    }
  },

  // Thermostat (TAG) - duplicate SP behavior and dimensions feature
  TAG: {
    dimensions: {
      width: '95mm',
      height: '95mm'
    },
    dimensionConfigs: {
      standard: {
        width: '95mm',
        height: '95mm',
        iconPositions: [
          { top: '38px', left: '80px' },  // Cell 0 - raised by 15px from 53px
          { top: '38px', left: '140px' },
          { top: '38px', left: '200px' },
          { top: '123px', left: '49px' },  // Cell 3 - moved right by 13px total + 3px
          { top: '123px', left: '136px' },
          { top: '123px', left: '225px' },  // Cell 5 - moved left by 8px
          { top: '188px', left: '49px' },  // Cell 6 - moved right by 13px total + 3px
          { top: '188px', left: '136px' },  // Row 3 - moved up 30px
          { top: '188px', left: '225px' },  // Cell 8 - moved left by 8px
        ]
      },
      wide: {
        width: '130mm',
        height: '95mm',
        // Use the same 3x3 grid positions as standard
        iconPositions: [
          { top: '38px', left: '80px' },
          { top: '38px', left: '140px' },
          { top: '38px', left: '200px' },
          { top: '123px', left: '49px' },
          { top: '123px', left: '136px' },
          { top: '123px', left: '225px' },
          { top: '188px', left: '49px' },
          { top: '188px', left: '136px' },
          { top: '188px', left: '225px' },
        ]
      },
      tall: {
        width: '95mm',
        height: '130mm',
        // Use the same 3x3 grid positions as standard
        iconPositions: [
          { top: '38px', left: '80px' },
          { top: '38px', left: '140px' },
          { top: '38px', left: '200px' },
          { top: '123px', left: '49px' },
          { top: '123px', left: '136px' },
          { top: '123px', left: '225px' },
          { top: '188px', left: '49px' },
          { top: '188px', left: '136px' },
          { top: '188px', left: '225px' },
        ]
      }
    },
    // Default to 3x3 grid positions matching standard
    iconPositions: [
      { top: '38px', left: '80px' },
      { top: '38px', left: '140px' },
      { top: '38px', left: '200px' },
      { top: '123px', left: '49px' },
      { top: '123px', left: '136px' },
      { top: '123px', left: '225px' },
      { top: '188px', left: '49px' },
      { top: '188px', left: '136px' },
      { top: '188px', left: '225px' },
    ],
    iconLayout: {
      size: '32px',
      spacing: '5px',
      position: 'top'
    },
    textLayout: {
      fontSize: '12px',
      position: 'absolute',
      bottom: '13px',
      padding: '-1px'
    },
    specialLayouts: {
      PIR: {
        iconSize: '40px',
        marginTop: '0'
      },
      Bathroom: {
        iconSize: '47px' // 14mm equivalent (95mm panel = 320px, so 14mm = 47px)
      }
    }
  },

  // Double Panel Horizontal (DPH)
  DPH: {
    dimensions: {
      width: '640px', // 2x 320px SP panels
      height: '320px'
    },
    iconPositions: [
      // Left SP (first 9 slots) - matches SP standard positions exactly
      { top: '45px', left: '47px' },   // 0 - matches SP position 0
      { top: '45px', left: '136px' },  // 1 - matches SP position 1
      { top: '45px', left: '226px' },  // 2 - matches SP position 2
      { top: '133px', left: '47px' },  // 3 - matches SP position 3
      { top: '133px', left: '136px' }, // 4 - matches SP position 4
      { top: '133px', left: '226px' }, // 5 - matches SP position 5
      { top: '221px', left: '47px' },  // 6 - matches SP position 6 with consistent spacing
      { top: '221px', left: '136px' }, // 7 - matches SP position 7 with consistent spacing
      { top: '221px', left: '226px' }, // 8 - matches SP position 8 with consistent spacing
      // Right SP (next 9 slots, left + 320px) - matches SP standard positions with offset
      { top: '45px', left: '367px' },   // 9 - matches SP position 0 + 320px offset
      { top: '45px', left: '456px' },   // 10 - matches SP position 1 + 320px offset
      { top: '45px', left: '546px' },   // 11 - matches SP position 2 + 320px offset
      { top: '133px', left: '367px' },  // 12 - matches SP position 3 + 320px offset
      { top: '133px', left: '456px' },  // 13 - matches SP position 4 + 320px offset
      { top: '133px', left: '546px' },  // 14 - matches SP position 5 + 320px offset
      { top: '221px', left: '367px' },  // 15 - matches SP position 6 + 320px offset
      { top: '221px', left: '456px' },  // 16 - matches SP position 7 + 320px offset
      { top: '221px', left: '546px' },  // 17 - matches SP position 8 + 320px offset
    ],
    iconLayout: {
      size: '38px', // Match SP icon size
      spacing: '5px', // Match SP spacing
      position: 'top'
    },
    textLayout: {
      fontSize: '12px', // Match SP font size
      position: 'absolute',
      bottom: '13px', // Match SP bottom position
      padding: '-1px' // Match SP padding
    },
    specialLayouts: {
      PIR: {
        iconSize: '38px', // Match standard icon size for consistency
        marginTop: '0'
      },
      Bathroom: {
        iconSize: '38px' // Match standard icon size for consistency
      }
    }
  },

  // Double Panel Vertical (DPV)
  DPV: {
    dimensions: {
      width: '320px', // single panel width
      height: '640px' // double panel height
    },
    iconPositions: [
      // Top SP (first 9 slots) - matches SP standard positions exactly
      { top: '45px', left: '47px' },   // 0 - matches SP position 0
      { top: '45px', left: '136px' },  // 1 - matches SP position 1
      { top: '45px', left: '226px' },  // 2 - matches SP position 2
      { top: '133px', left: '47px' },  // 3 - matches SP position 3
      { top: '133px', left: '136px' }, // 4 - matches SP position 4
      { top: '133px', left: '226px' }, // 5 - matches SP position 5
      { top: '225px', left: '47px' },  // 6 - matches SP position 6
      { top: '225px', left: '136px' }, // 7 - matches SP position 7
      { top: '225px', left: '226px' }, // 8 - matches SP position 8
      // Bottom SP (next 9 slots, top + 320px) - matches SP standard positions with offset
      { top: '365px', left: '47px' },   // 9 - matches SP position 0 + 320px offset
      { top: '365px', left: '136px' },  // 10 - matches SP position 1 + 320px offset
      { top: '365px', left: '226px' },  // 11 - matches SP position 2 + 320px offset
      { top: '453px', left: '47px' },   // 12 - matches SP position 3 + 320px offset
      { top: '453px', left: '136px' },  // 13 - matches SP position 4 + 320px offset
      { top: '453px', left: '226px' },  // 14 - matches SP position 5 + 320px offset
      { top: '545px', left: '47px' },   // 15 - matches SP position 6 + 320px offset
      { top: '545px', left: '136px' },  // 16 - matches SP position 7 + 320px offset
      { top: '545px', left: '226px' },  // 17 - matches SP position 8 + 320px offset
    ],
    iconLayout: {
      size: '38px', // Match SP icon size
      spacing: '5px', // Match SP spacing
      position: 'top'
    },
    textLayout: {
      fontSize: '12px', // Match SP font size
      position: 'absolute',
      bottom: '13px', // Match SP bottom position
      padding: '-1px' // Match SP padding
    },
    specialLayouts: {
      PIR: {
        iconSize: '40px', // Match SP PIR size
        marginTop: '0'
      },
      Bathroom: {
        iconSize: '38px' // Match SP Bathroom size
      }
    }
  },

  // Extended Panel Horizontal 2 (X2H)
  X2H: {
    dimensions: {
      width: '850px',
      height: '300px'
    },
    iconPositions: [
      // Left SP (first 9 slots) - matching SP standard positions exactly
      { top: '45px', left: '47px' },   // 0 - matches SP position 0
      { top: '45px', left: '136px' },  // 1 - matches SP position 1  
      { top: '45px', left: '226px' },  // 2 - matches SP position 2
      { top: '133px', left: '47px' },  // 3 - matches SP position 3
      { top: '133px', left: '136px' }, // 4 - matches SP position 4
      { top: '133px', left: '226px' }, // 5 - matches SP position 5
      { top: '225px', left: '47px' },  // 6 - matches SP position 6
      { top: '225px', left: '136px' }, // 7 - matches SP position 7
      { top: '225px', left: '226px' }, // 8 - matches SP position 8
      // Right SP (first big icon slot, moved 40px to the left)
      { top: '43px', left: '330px' }, // 9 (moved 40px left from 370px)
      // Second big icon slot, moved 60px to the left
      { top: '43px', left: '580px' }, // 10 (moved 60px left from 640px)
    ],
    gridLayout: {
      rows: 3,
      columns: 3,
      gap: '6px',
      padding: '12px'
    },
    iconLayout: {
      size: '38px', // Match SP icon size
      spacing: '5px', // Match SP spacing
      position: 'top'
    },
    bigIconLayout: {
      size: '100px',
      position: 'right',
      width: '40%',
      height: '100%'
    },
    textLayout: {
      fontSize: '12px', // Match SP font size
      position: 'absolute',
      bottom: '13px', // Match SP bottom position
      padding: '-1px' // Match SP padding
    },
    specialLayouts: {
      PIR: {
        iconSize: '40px', // Match SP PIR size
        marginTop: '0'
      },
      Bathroom: {
        iconSize: '38px' // Match SP Bathroom size
      }
    }
  },

  // Extended Panel Vertical 2 (X2V)
  X2V: {
    dimensions: {
      width: '320px',
      height: '900px'
    },
    iconPositions: [
      // Top SP (first 9 slots) - matching SP standard positions exactly
      { top: '45px', left: '47px' },   // 0 - matches SP position 0
      { top: '45px', left: '136px' },  // 1 - matches SP position 1  
      { top: '45px', left: '226px' },  // 2 - matches SP position 2
      { top: '133px', left: '47px' },  // 3 - matches SP position 3
      { top: '133px', left: '136px' }, // 4 - matches SP position 4
      { top: '133px', left: '226px' }, // 5 - matches SP position 5
      { top: '225px', left: '47px' },  // 6 - matches SP position 6
      { top: '225px', left: '136px' }, // 7 - matches SP position 7
      { top: '225px', left: '226px' }, // 8 - matches SP position 8
      // Bottom SP (center of bottom half)
      { top: '443px', left: '160px' }, // 9 (centered horizontally: 320/2)
      // New slot in added height, centered
      { top: '800px', left: '160px' }, // 10 (centered horizontally: 320/2)
    ],
    gridLayout: {
      rows: 3,
      columns: 3,
      gap: '6px',
      padding: '12px'
    },
    iconLayout: {
      size: '35px',
      spacing: '6px',
      position: 'top'
    },
    bigIconLayout: {
      size: '100px',
      position: 'bottom',
      width: '100%',
      height: '50%'
    },
    textLayout: {
      fontSize: '11px',
      position: 'absolute',
      bottom: '10px',
      padding: '3px'
    },
    specialLayouts: {
      PIR: {
        iconSize: '35px',
        marginTop: '0'
      },
      Bathroom: {
        iconSize: '35px'
      }
    }
  },

  // Extended Panel Horizontal 1 (X1H)
  X1H: {
    dimensions: {
      width: '731px', // 217mm converted to pixels (217 * 3.37)
      height: '320px' // 95mm converted to pixels (95 * 3.37)
    },
    iconPositions: [
      // Left SP (first 9 slots) - moved up 20px from SP standard positions
      { top: '25px', left: '47px' },   // 0 - moved up 20px from SP position 0
      { top: '25px', left: '136px' },  // 1 - moved up 20px from SP position 1  
      { top: '25px', left: '226px' },  // 2 - moved up 20px from SP position 2
      { top: '113px', left: '47px' },  // 3 - moved up 20px from SP position 3
      { top: '113px', left: '136px' }, // 4 - moved up 20px from SP position 4
      { top: '113px', left: '226px' }, // 5 - moved up 20px from SP position 5
      { top: '205px', left: '47px' },  // 6 - moved up 20px from SP position 6
      { top: '205px', left: '136px' }, // 7 - moved up 20px from SP position 7
      { top: '205px', left: '226px' }, // 8 - moved up 20px from SP position 8
      // Right SP (single slot, centered)
      { top: '33px', left: '548px', width: '120px', height: '120px' }, // 9 (centered in right half: 365.5 + 182.75)
    ],
    iconLayout: {
      size: '38px',
      spacing: '5px',
      position: 'top'
    },
    textLayout: {
      fontSize: '12px',
      position: 'absolute',
      bottom: '13px',
      padding: '-1px'
    },
    bigIconLayout: {
      size: '120px',
      position: 'right',
      width: '50%',
      height: '100%'
    },
    specialLayouts: {
      PIR: {
        iconSize: '40px',
        marginTop: '0'
      },
      Bathroom: {
        iconSize: '47px'
      }
    }
  },

  // Extended Panel Vertical 1 (X1V)
  X1V: {
    dimensions: {
      width: '320px',
      height: '640px'
    },
    iconPositions: [
      // Top SP (first 9 slots) - matching SP standard positions exactly
      { top: '45px', left: '47px' },   // 0 - matches SP position 0
      { top: '45px', left: '136px' },  // 1 - matches SP position 1  
      { top: '45px', left: '226px' },  // 2 - matches SP position 2
      { top: '133px', left: '47px' },  // 3 - matches SP position 3
      { top: '133px', left: '136px' }, // 4 - matches SP position 4
      { top: '133px', left: '226px' }, // 5 - matches SP position 5
      { top: '225px', left: '47px' },  // 6 - matches SP position 6
      { top: '225px', left: '136px' }, // 7 - matches SP position 7
      { top: '225px', left: '226px' }, // 8 - matches SP position 8
      // Bottom SP (single slot, centered)
      { top: '328px', left: '160px' }, // 9 (centered horizontally: 320/2)
    ],
    iconLayout: {
      size: '40px',
      spacing: '5px',
      position: 'top'
    },
    textLayout: {
      fontSize: '12px',
      position: 'absolute',
      bottom: '13px',
      padding: '-1px'
    },
    bigIconLayout: {
      size: '120px',
      position: 'bottom',
      width: '100%',
      height: '50%'
    },
    specialLayouts: {
      PIR: {
        iconSize: '40px',
        marginTop: '0'
      },
      Bathroom: {
        iconSize: '47px'
      }
    }
  },

  // Corridor Panel (IDPG)
  IDPG: {
    dimensions: {
      width: '350px',
      height: '350px' // Default height, will be adjusted dynamically based on config
    },
    gridLayout: {
      rows: 4,
      columns: 4,
      gap: '5px',
      padding: '10px'
    },
    iconLayout: {
      size: '40px', // Match customizer default icon size
      spacing: '5px',
      position: 'center'
    },
    textLayout: {
      fontSize: '12px', // Match customizer default font size
      position: 'static',
      padding: '2px'
    }
  }
};

// Helper function to get layout config for a panel type
export const getPanelLayoutConfig = (panelType: string): PanelLayoutConfig => {
  const config = PANEL_LAYOUT_CONFIG[panelType];
  if (!config) {
    console.error(`Panel type '${panelType}' not found in configuration. Available types:`, Object.keys(PANEL_LAYOUT_CONFIG));
    // Return a basic fallback configuration instead of SP to avoid cross-contamination
    return {
      dimensions: { width: '95mm', height: '95mm' },
      iconPositions: [
        { top: '50px', left: '50px' },
        { top: '50px', left: '150px' },
        { top: '50px', left: '250px' },
        { top: '150px', left: '50px' },
        { top: '150px', left: '150px' },
        { top: '150px', left: '250px' },
        { top: '250px', left: '50px' },
        { top: '250px', left: '150px' },
        { top: '250px', left: '250px' },
      ],
      iconLayout: { size: '40px', spacing: '5px', position: 'top' as const },
      textLayout: { fontSize: '12px', position: 'absolute' as const, bottom: '13px', padding: '2px' }
    };
  }
  return config;
};

// Helper function to get dimensions for a panel type
export const getPanelDimensions = (panelType: string) => {
  const config = getPanelLayoutConfig(panelType);
  return config.dimensions;
};

// Helper function to get grid layout for a panel type
export const getPanelGridLayout = (panelType: string) => {
  const config = getPanelLayoutConfig(panelType);
  return config.gridLayout;
};

// Helper function to get icon layout for a panel type
export const getPanelIconLayout = (panelType: string) => {
  const config = getPanelLayoutConfig(panelType);
  return config.iconLayout;
}; 