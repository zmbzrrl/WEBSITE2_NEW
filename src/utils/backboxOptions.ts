// Backbox options mapping based on panel type and configuration

export interface BackboxOption {
  value: string;
  label: string;
}

// Constant for "No backbox" option
export const NO_BACKBOX_OPTION: BackboxOption = { value: 'No backbox', label: 'No backbox' };

// Helper function to add "No backbox" option to any backbox options array
const addNoBackboxOption = (options: BackboxOption[]): BackboxOption[] => {
  return [...options, NO_BACKBOX_OPTION];
};

// Helper function to check if backbox is "No backbox"
export const isNoBackbox = (backbox: string): boolean => {
  return backbox === 'No backbox';
};

// Disclaimer text for when "No backbox" is selected
export const NO_BACKBOX_DISCLAIMER = 'Production will be subject to technical evaluation of the INTEREL design team';

export const getBackboxOptions = (
  panelType: string,
  panelConfig?: {
    idpgConfig?: {
      cardReader: boolean;
      roomNumber: boolean;
    };
    spConfig?: {
      dimension: 'standard' | 'wide' | 'tall';
    };
    tagConfig?: {
      dimension: 'standard' | 'wide' | 'tall';
    };
  }
): BackboxOption[] => {
  switch (panelType) {
    case 'IDPG':
      if (panelConfig?.idpgConfig) {
        const { cardReader, roomNumber } = panelConfig.idpgConfig;
        
        // IDPG with card reader (with or without room number): Vimar 70004
        if (cardReader) {
          return addNoBackboxOption([{ value: 'Vimar 70004', label: 'Vimar 70004' }]);
        }
        // IDPG with room number only (no card reader): UK 3x3, IT 503E, US Single Gang, German Kaiserdose, Australian Standard
        if (roomNumber) {
          return addNoBackboxOption([
            { value: 'UK 3x3', label: 'UK 3x3' },
            { value: 'IT 503E', label: 'IT 503E' },
            { value: 'US Single Gang', label: 'US Single Gang' },
            { value: 'German Kaiserdose', label: 'German Kaiserdose' },
            { value: 'Australian Standard', label: 'Australian Standard' }
          ]);
        }
        // IDPG without card reader and without room number: UK 3x3, German Kaiserdose
        return addNoBackboxOption([
          { value: 'UK 3x3', label: 'UK 3x3' },
          { value: 'German Kaiserdose', label: 'German Kaiserdose' }
        ]);
      }
      // Default IDPG options if no config provided
      return addNoBackboxOption([
        { value: 'Vimar 70004', label: 'Vimar 70004' },
        { value: 'UK 3x3', label: 'UK 3x3' },
        { value: 'IT 503E', label: 'IT 503E' },
        { value: 'US Single Gang', label: 'US Single Gang' },
        { value: 'German Kaiserdose', label: 'German Kaiserdose' },
        { value: 'Australian Standard', label: 'Australian Standard' }
      ]);

    case 'SP':
      if (panelConfig?.spConfig) {
        const { dimension } = panelConfig.spConfig;
        
        switch (dimension) {
          case 'standard': // SP/TAG (standard dimensions): UK 3x3, German Kaiserdose
            return addNoBackboxOption([
              { value: 'UK 3x3', label: 'UK 3x3' },
              { value: 'German Kaiserdose', label: 'German Kaiserdose' }
            ]);
          case 'wide': // SP/TAG (WIDE dimensions): UK 3x3, IT 503E, US Single Gang, German Kaiserdose, Australian Standard
            return addNoBackboxOption([
              { value: 'UK 3x3', label: 'UK 3x3' },
              { value: 'IT 503E', label: 'IT 503E' },
              { value: 'US Single Gang', label: 'US Single Gang' },
              { value: 'German Kaiserdose', label: 'German Kaiserdose' },
              { value: 'Australian Standard', label: 'Australian Standard' }
            ]);
          case 'tall': // SP/TAG (TALL dimensions): UK 3x3, IT 503E, Australian Standard
            return addNoBackboxOption([
              { value: 'UK 3x3', label: 'UK 3x3' },
              { value: 'IT 503E', label: 'IT 503E' },
              { value: 'Australian Standard', label: 'Australian Standard' }
            ]);
          default:
            // Default SP options
            return addNoBackboxOption([
              { value: 'UK 3x3', label: 'UK 3x3' },
              { value: 'German Kaiserdose', label: 'German Kaiserdose' }
            ]);
        }
      }
      // Default SP options if no config provided
      return addNoBackboxOption([
        { value: 'UK 3x3', label: 'UK 3x3' },
        { value: 'German Kaiserdose', label: 'German Kaiserdose' }
      ]);

    case 'GS':
    case 'TAG':
      // Handle TAG dimensions similar to SP
      if (panelConfig?.tagConfig) {
        const { dimension } = panelConfig.tagConfig;
        
        switch (dimension) {
          case 'standard': // SP/TAG (standard dimensions): UK 3x3, German Kaiserdose
            return addNoBackboxOption([
              { value: 'UK 3x3', label: 'UK 3x3' },
              { value: 'German Kaiserdose', label: 'German Kaiserdose' }
            ]);
          case 'wide': // SP/TAG (WIDE dimensions): UK 3x3, IT 503E, US Single Gang, German Kaiserdose, Australian Standard
            return addNoBackboxOption([
              { value: 'UK 3x3', label: 'UK 3x3' },
              { value: 'IT 503E', label: 'IT 503E' },
              { value: 'US Single Gang', label: 'US Single Gang' },
              { value: 'German Kaiserdose', label: 'German Kaiserdose' },
              { value: 'Australian Standard', label: 'Australian Standard' }
            ]);
          case 'tall': // SP/TAG (TALL dimensions): UK 3x3, IT 503E, Australian Standard
            return addNoBackboxOption([
              { value: 'UK 3x3', label: 'UK 3x3' },
              { value: 'IT 503E', label: 'IT 503E' },
              { value: 'Australian Standard', label: 'Australian Standard' }
            ]);
          default:
            // Default TAG options (standard)
            return addNoBackboxOption([
              { value: 'UK 3x3', label: 'UK 3x3' },
              { value: 'German Kaiserdose', label: 'German Kaiserdose' }
            ]);
        }
      }
      // Default TAG options if no config provided (standard dimensions)
      return addNoBackboxOption([
        { value: 'UK 3x3', label: 'UK 3x3' },
        { value: 'German Kaiserdose', label: 'German Kaiserdose' }
      ]);

    case 'X1V':
    case 'X1H':
      // X1V and X1H: UK Double 3x3
      return addNoBackboxOption([{ value: 'UK Double 3x3', label: 'UK Double 3x3' }]);

    case 'X2V':
    case 'X2H':
      // X2V and X2H: UK Double 3x3
      return addNoBackboxOption([{ value: 'UK Double 3x3', label: 'UK Double 3x3' }]);

    case 'DP':
    case 'DPH':
    case 'DPV':
      // DPH/DPV: UK Triple 3x3
      return addNoBackboxOption([{ value: 'UK Triple 3x3', label: 'UK Triple 3x3' }]);

    default:
      // Fallback to generic options
      return addNoBackboxOption([
        { value: 'UK 3x3', label: 'UK 3x3' },
        { value: 'IT 503E', label: 'IT 503E' },
        { value: 'US Single Gang', label: 'US Single Gang' },
        { value: 'German Kaiserdose', label: 'German Kaiserdose' },
        { value: 'Australian Standard', label: 'Australian Standard' }
      ]);
  }
};
