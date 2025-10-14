// Backbox options mapping based on panel type and configuration

export interface BackboxOption {
  value: string;
  label: string;
}

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
  }
): BackboxOption[] => {
  switch (panelType) {
    case 'IDPG':
      if (panelConfig?.idpgConfig) {
        const { cardReader, roomNumber } = panelConfig.idpgConfig;
        
        if (cardReader || roomNumber) {
          // IDPG with card reader and/or room number
          return [{ value: 'Vimar 70004', label: 'Vimar 70004' }];
        } else if (roomNumber && !cardReader) {
          // IDPG with room number only
          return [
            { value: 'UK 3x3', label: 'UK 3x3' },
            { value: 'IT 503E', label: 'IT 503E' },
            { value: 'US Single Gang', label: 'US Single Gang' },
            { value: 'German Kaiserdose', label: 'German Kaiserdose' },
            { value: 'Australian Standard', label: 'Australian Standard' }
          ];
        } else {
          // IDPG without card reader and without room number
          return [
            { value: 'UK 3x3', label: 'UK 3x3' },
            { value: 'German Kaiserdose', label: 'German Kaiserdose' }
          ];
        }
      }
      // Default IDPG options if no config provided
      return [
        { value: 'Vimar 70004', label: 'Vimar 70004' },
        { value: 'UK 3x3', label: 'UK 3x3' },
        { value: 'IT 503E', label: 'IT 503E' },
        { value: 'US Single Gang', label: 'US Single Gang' },
        { value: 'German Kaiserdose', label: 'German Kaiserdose' },
        { value: 'Australian Standard', label: 'Australian Standard' }
      ];

    case 'SP':
      if (panelConfig?.spConfig) {
        const { dimension } = panelConfig.spConfig;
        
        switch (dimension) {
          case 'standard': // 95x95 dimensions
            return [
              { value: 'UK 3x3', label: 'UK 3x3' },
              { value: 'German Kaiserdose', label: 'German Kaiserdose' }
            ];
          case 'wide': // 130x95 dimensions
            return [
              { value: 'UK 3x3', label: 'UK 3x3' },
              { value: 'IT 503E', label: 'IT 503E' },
              { value: 'US Single Gang', label: 'US Single Gang' },
              { value: 'German Kaiserdose', label: 'German Kaiserdose' },
              { value: 'Australian Standard', label: 'Australian Standard' }
            ];
          case 'tall': // 95x130 dimensions
            return [
              { value: 'UK 3x3', label: 'UK 3x3' },
              { value: 'IT 503E', label: 'IT 503E' },
              { value: 'Australian Standard', label: 'Australian Standard' }
            ];
          default:
            // Default SP options
            return [
              { value: 'UK 3x3', label: 'UK 3x3' },
              { value: 'German Kaiserdose', label: 'German Kaiserdose' }
            ];
        }
      }
      // Default SP options if no config provided
      return [
        { value: 'UK 3x3', label: 'UK 3x3' },
        { value: 'German Kaiserdose', label: 'German Kaiserdose' }
      ];

    case 'GS':
    case 'TAG':
      // SP/TAG (95x95 dimensions) - same as SP standard
      return [
        { value: 'UK 3x3', label: 'UK 3x3' },
        { value: 'German Kaiserdose', label: 'German Kaiserdose' }
      ];

    case 'X1V':
    case 'X1H':
      return [{ value: 'UK Double 3x3', label: 'UK Double 3x3' }];

    case 'X2V':
    case 'X2H':
      return [{ value: 'UK Double 3x3', label: 'UK Double 3x3' }];

    case 'DP':
      return [{ value: 'UK Triple 3x3', label: 'UK Triple 3x3' }];

    default:
      // Fallback to generic options
      return [
        { value: 'UK 3x3', label: 'UK 3x3' },
        { value: 'IT 503E', label: 'IT 503E' },
        { value: 'US Single Gang', label: 'US Single Gang' },
        { value: 'German Kaiserdose', label: 'German Kaiserdose' },
        { value: 'Australian Standard', label: 'Australian Standard' }
      ];
  }
};
