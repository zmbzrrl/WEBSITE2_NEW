// Panel Layout Configuration
// This file defines the standard formatting and layout for each panel type
// Used by PanelPreview component to ensure consistent appearance in ProjPanels page

export interface PanelLayoutConfig {
  dimensions: {
    width: string;
    height: string;
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
      width: '320px',
      height: '320px'
    },
    iconPositions: [
      { top: '23px', left: '33px' },   // Icon 0 (top-left)
      { top: '23px', left: '136px' },  // Icon 1 (top-center)
      { top: '23px', left: '233px' },  // Icon 2 (top-right)
      { top: '123px', left: '33px' },  // Icon 3 (middle-left)
      { top: '123px', left: '136px' }, // Icon 4 (middle-center)
      { top: '123px', left: '233px' }, // Icon 5 (middle-right)
      { top: '218px', left: '33px' },  // Icon 6 (bottom-left)
      { top: '218px', left: '136px' }, // Icon 7 (bottom-center)
      { top: '218px', left: '233px' }, // Icon 8 (bottom-right)
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
    specialLayouts: {
      PIR: {
        iconSize: '40px',
        marginTop: '20px'
      },
      Bathroom: {
        iconSize: '50px' // 40px + 10px
      }
    }
  },

  // Thermostat (TAG)
  TAG: {
    dimensions: {
      width: '320px',
      height: '320px'
    },
    iconPositions: [
      { top: '15px', left: '15px' },   // Icon 0 (top-left)
      { top: '0px', left: '115px' },   // Icon 1 (top-center) - moved 15px up
      { top: '15px', left: '215px' },  // Icon 2 (top-right)
      { top: '115px', left: '15px' },  // Icon 3 (middle-left)
      { top: '115px', left: '115px' }, // Icon 4 (middle-center)
      { top: '115px', left: '215px' }, // Icon 5 (middle-right)
      { top: '215px', left: '15px' },  // Icon 6 (bottom-left)
      { top: '215px', left: '115px' }, // Icon 7 (bottom-center)
      { top: '215px', left: '215px' }, // Icon 8 (bottom-right)
      { top: '220px', left: '15px' },  // Icon 9 (fourth-left) - moved up 95px total
      { top: '220px', left: '115px' }, // Icon 10 (fourth-center) - moved up 95px total
      { top: '220px', left: '215px' }, // Icon 11 (fourth-right) - moved up 95px total
    ],
    iconLayout: {
      size: '35px',
      spacing: '8px',
      position: 'center'
    },
    textLayout: {
      fontSize: '11px',
      position: 'static',
      padding: '3px'
    }
  },

  // Double Panel Horizontal (DPH)
  DPH: {
    dimensions: {
      width: '640px', // 2x 320px SP panels
      height: '320px'
    },
    iconPositions: [
      // Left SP (first 9 slots)
      { top: '23px', left: '33px' },   // 0
      { top: '23px', left: '136px' },  // 1
      { top: '23px', left: '233px' },  // 2
      { top: '123px', left: '33px' },  // 3
      { top: '123px', left: '136px' }, // 4
      { top: '123px', left: '233px' }, // 5
      { top: '218px', left: '33px' },  // 6
      { top: '218px', left: '136px' }, // 7
      { top: '218px', left: '233px' }, // 8
      // Right SP (next 9 slots, left + 320px)
      { top: '23px', left: '353px' },   // 9
      { top: '23px', left: '456px' },   // 10
      { top: '23px', left: '553px' },   // 11
      { top: '123px', left: '353px' },  // 12
      { top: '123px', left: '456px' },  // 13
      { top: '123px', left: '553px' },  // 14
      { top: '218px', left: '353px' },  // 15
      { top: '218px', left: '456px' },  // 16
      { top: '218px', left: '553px' },  // 17
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
    }
  },

  // Double Panel Vertical (DPV)
  DPV: {
    dimensions: {
      width: '320px', // single panel width
      height: '640px' // double panel height
    },
    iconPositions: [
      // Top SP (first 9 slots)
      { top: '23px', left: '33px' },   // 0
      { top: '23px', left: '136px' },  // 1
      { top: '23px', left: '233px' },  // 2
      { top: '123px', left: '33px' },  // 3
      { top: '123px', left: '136px' }, // 4
      { top: '123px', left: '233px' }, // 5
      { top: '218px', left: '33px' },  // 6
      { top: '218px', left: '136px' }, // 7
      { top: '218px', left: '233px' }, // 8
      // Bottom SP (next 9 slots, top + 320px)
      { top: '343px', left: '33px' },   // 9
      { top: '343px', left: '136px' },  // 10
      { top: '343px', left: '233px' },  // 11
      { top: '443px', left: '33px' },   // 12
      { top: '443px', left: '136px' },  // 13
      { top: '443px', left: '233px' },  // 14
      { top: '538px', left: '33px' },   // 15
      { top: '538px', left: '136px' },  // 16
      { top: '538px', left: '233px' },  // 17
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
    }
  },

  // Extended Panel Horizontal 2 (X2H)
  X2H: {
    dimensions: {
      width: '900px',
      height: '300px'
    },
    iconPositions: [
      // Left SP (first 9 slots)
      { top: '23px', left: '33px' },   // 0
      { top: '23px', left: '136px' },  // 1
      { top: '23px', left: '233px' },  // 2
      { top: '123px', left: '33px' },  // 3
      { top: '123px', left: '136px' }, // 4
      { top: '123px', left: '233px' }, // 5
      { top: '218px', left: '33px' },  // 6
      { top: '218px', left: '136px' }, // 7
      { top: '218px', left: '233px' }, // 8
      // Right SP (single slot, centered)
      { top: '43px', left: '356px' }, // 9 (moved 25px right)
      // New slot in added width, centered
      { top: '43px', left: '635px' }, // 10 (moved 20px right)
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
      position: 'right',
      width: '40%',
      height: '100%'
    },
    textLayout: {
      fontSize: '11px',
      position: 'absolute',
      bottom: '10px',
      padding: '3px'
    }
  },

  // Extended Panel Vertical 2 (X2V)
  X2V: {
    dimensions: {
      width: '400px',
      height: '900px'
    },
    iconPositions: [
      // Top SP (first 9 slots)
      { top: '23px', left: '33px' },   // 0
      { top: '23px', left: '136px' },  // 1
      { top: '23px', left: '233px' },  // 2
      { top: '123px', left: '33px' },  // 3
      { top: '123px', left: '136px' }, // 4
      { top: '123px', left: '233px' }, // 5
      { top: '218px', left: '33px' },  // 6
      { top: '218px', left: '136px' }, // 7
      { top: '218px', left: '233px' }, // 8
      // Bottom SP (center of bottom half)
      { top: '443px', left: '136px' }, // 9
      // New slot in added height, centered
      { top: '800px', left: '136px' }, // 10
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
    }
  },

  // Extended Panel Horizontal 1 (X1H)
  X1H: {
    dimensions: {
      width: '640px',
      height: '320px'
    },
    iconPositions: [
      // Left SP (first 9 slots)
      { top: '23px', left: '33px' },   // 0
      { top: '23px', left: '136px' },  // 1
      { top: '23px', left: '233px' },  // 2
      { top: '123px', left: '33px' },  // 3
      { top: '123px', left: '136px' }, // 4
      { top: '123px', left: '233px' }, // 5
      { top: '218px', left: '33px' },  // 6
      { top: '218px', left: '136px' }, // 7
      { top: '218px', left: '233px' }, // 8
      // Right SP (single slot, centered)
      { top: '33px', left: '341px', width: '120px', height: '120px' }, // 9 (center of right half, moved left by 20px)
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
    }
  },

  // Extended Panel Vertical 1 (X1V)
  X1V: {
    dimensions: {
      width: '320px',
      height: '640px'
    },
    iconPositions: [
      // Top SP (first 9 slots)
      { top: '23px', left: '33px' },   // 0
      { top: '23px', left: '136px' },  // 1
      { top: '23px', left: '233px' },  // 2
      { top: '123px', left: '33px' },  // 3
      { top: '123px', left: '136px' }, // 4
      { top: '123px', left: '233px' }, // 5
      { top: '218px', left: '33px' },  // 6
      { top: '218px', left: '136px' }, // 7
      { top: '218px', left: '233px' }, // 8
      // Bottom SP (single slot, centered)
      { top: '328px', left: '36px' }, // 9 (center of bottom half, moved 100px left and 115px up)
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
  return PANEL_LAYOUT_CONFIG[panelType] || PANEL_LAYOUT_CONFIG.SP;
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