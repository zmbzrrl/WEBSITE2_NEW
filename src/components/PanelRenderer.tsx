import React, { useEffect } from 'react';
import { ralColors } from '../data/ralColors';
import { getIconColorName } from '../data/iconColors';
import { allIcons } from '../assets/iconLibrary';
import { allIcons as icons2 } from '../assets/iconLibrary2';
import DISPLAY from '../assets/icons/DISPLAY.png';
import FAN from '../assets/icons/FAN.png';
import { getPanelLayoutConfig, PanelLayoutConfig } from '../data/panelLayoutConfig';
import g18Icon from '../assets/icons/G-GuestServices/G18.png';
import g1Icon from '../assets/icons/G-GuestServices/G1.png';
import g2Icon from '../assets/icons/G-GuestServices/G2.png';
import g3Icon from '../assets/icons/G-GuestServices/G3.png';
import crIcon from '../assets/icons/CR.png';

// Copy hexToRgba from PanelPreview
const hexToRgba = (hex: string, alpha: number): string => {
  if (!hex) return `rgba(255, 255, 255, ${alpha})`;
  hex = hex.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};


// Guest Services icons mapping for IDPG
const guestServicesIcons = {
  G1: g1Icon,
  G2: g2Icon,
  G3: g3Icon,
  G18: g18Icon,
};

// Function to determine icon color based on background (from IDPGCustomizer)
const getIconColorFilter = (backgroundColor: string): string => {
  // Convert hex to RGB for brightness calculation
  const hex = backgroundColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  // Calculate brightness (0-255)
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  
  // Use white for dark backgrounds, dark grey for light backgrounds
  if (brightness < 150) {
    // Dark background - use white icons
    return 'brightness(0) saturate(100%) invert(1)';
  } else {
    // Light background - use dark grey icons
    return 'brightness(0) saturate(100%) invert(52%) sepia(0%) saturate(0%) hue-rotate(148deg) brightness(99%) contrast(91%)';
  }
};

interface PanelRendererIcon {
  src: string;
  label: string;
  position: number;
  text: string;
  category?: string;
  id?: string;
  iconId?: string;
}

interface PanelRendererProps {
  icons: PanelRendererIcon[];
  panelDesign: {
    backgroundColor: string;
    iconColor: string;
    textColor: string;
    fontSize: string;
    iconSize?: string;
    fonts?: string;
    isLayoutReversed?: boolean;
    swapSides?: boolean;
    mirrorGrid?: boolean;
    swapUpDown?: boolean;
    mirrorVertical?: boolean;
    idpgConfig?: {
      cardReader: boolean;
      roomNumber: boolean;
      statusMode: 'bar' | 'icons';
      selectedIcon1: string;
      roomNumberText: string;
    };
    spConfig?: {
      dimension: 'standard' | 'wide' | 'tall';
    };
  };
  iconTexts?: { [key: number]: string };
  type?: string;
}

function loadGoogleFont(font: string) {
  if (!font) return;
  const fontId = font.replace(/ /g, '+');
  const id = `google-font-${fontId}`;
  if (!document.getElementById(id)) {
    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css?family=${fontId}`;
    document.head.appendChild(link);
  }
}

const PanelRenderer: React.FC<PanelRendererProps> = ({ icons, panelDesign, iconTexts, type = 'SP' }) => {
  useEffect(() => {
    if (panelDesign.fonts) {
      loadGoogleFont(panelDesign.fonts);
    }
  }, [panelDesign.fonts]);

  // Use automatic icon color based on background
  const computedIconFilter = getIconColorFilter(panelDesign.backgroundColor || '#ffffff');

  // Determine panel types for special handling
  const isDPH = type === 'DPH';
  const isDPV = type === 'DPV';
  const isX2V = type === 'X2V';
  const isX1H = type === 'X1H';
  const isX1V = type === 'X1V';
  const isX2H = type === 'X2H';
  const isTAG = type === 'TAG';
  const isSP = type === 'SP';
  const isIDPG = type === 'IDPG';

  // Get layout configuration for this panel type
  const config = getPanelLayoutConfig(type);
  const { gridLayout, iconLayout, bigIconLayout, textLayout, specialLayouts, iconPositions } = config;
  
  // Get dimension-specific icon positions for SP/TAG panels
  let dimensionIconPositions = iconPositions;
  if (isSP && panelDesign.spConfig && config.dimensionConfigs) {
    const { dimension } = panelDesign.spConfig;
    if (config.dimensionConfigs[dimension] && config.dimensionConfigs[dimension].iconPositions) {
      dimensionIconPositions = config.dimensionConfigs[dimension].iconPositions;
    }
  }
  if (isTAG && panelDesign.tagConfig && config.dimensionConfigs) {
    const { dimension } = panelDesign.tagConfig;
    if (config.dimensionConfigs[dimension] && config.dimensionConfigs[dimension].iconPositions) {
      dimensionIconPositions = config.dimensionConfigs[dimension].iconPositions;
    }
  }
  
  // For IDPG panels, calculate dimensions based on configuration
  let dimensions = config.dimensions;
  if (isIDPG && panelDesign.idpgConfig) {
    const { cardReader, roomNumber } = panelDesign.idpgConfig;
    
    // Square template (350x350) - when no card reader and no room number
    if (!cardReader && !roomNumber) {
      dimensions = { width: '350px', height: '350px' };
    }
    // Rectangle vertical template (350x450) - when room number only
    else if (!cardReader && roomNumber) {
      dimensions = { width: '350px', height: '450px' };
    }
    // Rectangle vertical template (350x500) - when card reader only
    else if (cardReader && !roomNumber) {
      dimensions = { width: '350px', height: '500px' };
    }
    // Rectangle vertical template (350x600) - when card reader and room number
    else if (cardReader && roomNumber) {
      dimensions = { width: '350px', height: '600px' };
    }
  }
  
  // For SP panels, calculate dimensions based on configuration
  if (isSP && panelDesign.spConfig) {
    const { dimension } = panelDesign.spConfig;
    if (config.dimensionConfigs && config.dimensionConfigs[dimension]) {
      dimensions = {
        width: config.dimensionConfigs[dimension].width,
        height: config.dimensionConfigs[dimension].height
      };
    }
  }
  
  // For TAG panels, calculate dimensions based on configuration
  if (isTAG && panelDesign.tagConfig) {
    const { dimension } = panelDesign.tagConfig;
    console.log('🔍 TAG Panel dimension:', dimension);
    if (config.dimensionConfigs && config.dimensionConfigs[dimension]) {
      dimensions = {
        width: config.dimensionConfigs[dimension].width,
        height: config.dimensionConfigs[dimension].height
      };
      console.log('🔍 TAG Panel using dimension config:', config.dimensionConfigs[dimension]);
    }
  }

  // Helper function to get icon size based on category
  const getIconSize = (icon: PanelRendererIcon | undefined) => {
    if (!icon) return iconLayout?.size || '40px';
    
    const isPIR = icon.category === 'PIR';
    const isBathroom = icon.category === 'Bathroom';
    
    // Check if this is a single icon slot for extended panels
    const isSingleIconSlot = (isX1H || isX1V) && icon.position === 9;
    const isX2SingleIconSlot = (isX2H || isX2V) && (icon.position === 9 || icon.position === 10);
    
    // Special handling for TAG panel
    if (isTAG) {
      if (icon?.iconId === 'DISPLAY') {
        return '240px'; // Large display icon
      }
      // C and F icons from TAG_icons folder should be 50% smaller
      if (icon && (icon.iconId === 'C' || icon.iconId === 'F')) {
        return '20px'; // 50% of base 40px size
      }
      if (icon?.iconId === 'FAN') {
        // Different sizes for different fan positions
        if (icon.position === 6) return '45px';
        if (icon.position === 7) return '58px';
        if (icon.position === 8) return '65px';
      }
    }
    
    // Special handling for IDPG panel - use the iconSize from panelDesign
    if (isIDPG) {
      return panelDesign.iconSize || '40px';
    }
    
    if (isPIR) {
      return specialLayouts?.PIR?.iconSize || '40px';
    }
    if (isBathroom) {
      return specialLayouts?.Bathroom?.iconSize || '47px';
    }
    
    // Return larger size for single icon slots
    if (isSingleIconSlot) {
      return '240px';
    }
    if (isX2SingleIconSlot) {
      return '204px'; // Match X2HCustomizer step 4 preview
    }
    
    return panelDesign.iconSize || iconLayout?.size || '40px';
  };

  // Helper function to calculate font size based on text length and container width
  const calculateFontSize = (text: string, containerWidth: number, baseFontSize: string) => {
    const baseSize = parseInt(baseFontSize);
    const textLength = text.length;
    const maxWidth = containerWidth - 8; // Account for padding
    
    // Simple heuristic: reduce font size based on text length
    if (textLength > 15) return `${Math.max(8, baseSize - 4)}px`;
    if (textLength > 10) return `${Math.max(10, baseSize - 2)}px`;
    return baseFontSize;
  };

  // Absolute layout rendering
  if (iconPositions && iconPositions.length > 0) {
    return (
      <div
        style={{
          position: 'relative',
          width: isDPH ? '640px' : dimensions.width,
          height: dimensions.height,
          background: `linear-gradient(135deg, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.1) 50%, rgba(255, 255, 255, 0.05) 100%), ${hexToRgba(panelDesign.backgroundColor, 0.9)}`,
          padding: '0',
          border: '2px solid rgba(255, 255, 255, 0.2)',
          borderTop: '3px solid rgba(255, 255, 255, 0.4)',
          borderLeft: '3px solid rgba(255, 255, 255, 0.3)',
          boxShadow: `0 20px 40px rgba(0, 0, 0, 0.3), 0 8px 16px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.4), inset 0 -1px 0 rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.1)`,
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          transition: 'all 0.3s ease',
          margin: '0 auto',
          fontFamily: panelDesign.fonts || undefined,
          // Print-specific styles
          '@media print': {
            boxShadow: 'none',
            backdropFilter: 'none',
            WebkitBackdropFilter: 'none',
            border: '1px solid #ccc',
          }
        }}
      >
        {/* TAG DISPLAY overlay - removed to avoid conflicts with forced icon logic */}
        <div style={{
            position: 'absolute',
            top: '2px',
            left: '2px',
            right: '2px',
            bottom: '2px',
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, transparent 50%, rgba(0, 0, 0, 0.05) 100%)',
            pointerEvents: 'none',
            zIndex: 1,
            '@media print': {
              background: 'none',
            }
        }} />
        {(isDPH ? Array.from({ length: 18 }) : (isTAG ? Array.from({ length: 12 }) : (dimensionIconPositions || iconPositions))).map((_, index) => {
            let pos = (dimensionIconPositions || iconPositions)[index];
            
            // Debug logging for TAG panels
            if (isTAG && index < 3) {
              console.log(`🔍 TAG Position ${index}:`, {
                pos,
                dimensionIconPositions: dimensionIconPositions?.[index],
                iconPositions: iconPositions?.[index]
              });
            }
            
            // For TAG panels, provide fallback positions for the 4th row (positions 9-11)
            if (isTAG && !pos && index >= 9) {
              if (index === 9) pos = { top: '313px', left: '33px' };
              else if (index === 10) pos = { top: '313px', left: '136px' };
              else if (index === 11) pos = { top: '313px', left: '233px' };
            }
            
            // Final fallback
            if (!pos) pos = { top: '0px', left: '0px' };
            let icon = icons.find((i) => i.position === index);
            let forceIcon = null;
            // TAG panels always have DISPLAY icon in position 0 (top-left)
            if (isTAG && index === 0) {
              forceIcon = {
                src: DISPLAY,
                label: 'DISPLAY',
                iconId: 'DISPLAY',
                category: 'TAG',
                position: index,
                text: 'DISPLAY',
              };
            }
            
            const isPIR = icon?.category === 'PIR';
            const text = (iconTexts && iconTexts[index]) || icon?.text;
            const hasIcon = (icon && icon.src) || forceIcon;
            const iconSize = getIconSize(forceIcon || icon);
            
            const baseFontSize = textLayout?.fontSize || panelDesign.fontSize || '12px';
            const adjustedFontSize = text ? calculateFontSize(text, parseInt(isDPH ? '640' : dimensions.width) / 6, baseFontSize) : baseFontSize;
            
            // Apply swap and mirror logic for X1H panels
            let adjustedPos = pos;
            
            // Apply mirror logic first (if enabled)
            if (isX1H && panelDesign.mirrorGrid && index >= 0 && index <= 8) {
              // Mirror the grid: columns 0,1,2 become 2,1,0
              const mirrorMap = [2, 1, 0, 5, 4, 3, 8, 7, 6];
              const mirroredIndex = mirrorMap[index];
              const mirroredPos = (dimensionIconPositions || iconPositions)[mirroredIndex];
              if (mirroredPos) {
                adjustedPos = { ...mirroredPos };
              }
            }
            
            // Apply swap logic (if enabled)
            if (isX1H && panelDesign.swapSides) {
              if (index === 9) {
                // Move single icon slot to left side
                adjustedPos = { ...adjustedPos, left: '40px' };
              } else if (index >= 0 && index <= 8) {
                // Move 3x3 grid to right side
                adjustedPos = { ...adjustedPos, left: (parseInt(adjustedPos.left) + 320) + 'px' };
              }
            }
            
            // Apply swap and mirror logic for X1V panels
            if (isX1V && panelDesign.mirrorVertical && index >= 0 && index <= 8) {
              // Mirror the grid horizontally: column 0<->2, column 1 stays
              const row = Math.floor(index / 3);
              const col = index % 3;
              if (col === 0) {
                // Column 0 moves to column 2 position
                const col2Pos = iconPositions[row * 3 + 2];
                if (col2Pos) {
                  adjustedPos = { ...col2Pos };
                }
              } else if (col === 2) {
                // Column 2 moves to column 0 position
                const col0Pos = iconPositions[row * 3];
                if (col0Pos) {
                  adjustedPos = { ...col0Pos };
                }
              }
              // Column 1 stays in place
            }
            
            // Apply swap logic for X1V (if enabled)
            if (isX1V && panelDesign.swapUpDown) {
              if (index >= 0 && index <= 8) {
                // Move the 3x3 grid to the bottom half
                const swappedGridOffset = 320;
                adjustedPos = { ...adjustedPos, top: (parseInt(adjustedPos.top) + swappedGridOffset) + 'px' };
              } else if (index === 9) {
                // Move the single slot to the top half, positioned more centrally
                adjustedPos = { ...adjustedPos, top: '55px' };
              }
            }
            
            // Apply per-row offsets for SP and TAG panels (same as PanelPreview)
            if (isSP || isTAG) {
              const baseTop = parseInt((adjustedPos as any).top || '0', 10);
              const rowIndex = Math.floor(index / 3);
              
              // Apply per-row offsets based on dimension
              let perRowOffset = 0;
              if (isSP && panelDesign.spConfig) {
                const { dimension } = panelDesign.spConfig;
                if (dimension === 'tall') {
                  perRowOffset = (rowIndex === 0 ? -20 : 0) + (rowIndex === 1 ? 10 : 0) + (rowIndex === 2 ? 40 : 0);
                }
                // Move rows 2 and 3 down by 10px
                const lowerRowsOffset = (rowIndex === 1 || rowIndex === 2) ? 10 : 0;
                perRowOffset += lowerRowsOffset;
              }
              
              if (isTAG && panelDesign.tagConfig) {
                // Keep TAG grid consistent across dimensions (no per-row offsets)
                const lowerRowsOffset = (rowIndex === 1 || rowIndex === 2) ? 30 : 0;
                perRowOffset += lowerRowsOffset;
              }
              
              if (perRowOffset !== 0) {
                adjustedPos = { ...adjustedPos, top: (baseTop + perRowOffset) + 'px' } as any;
              }
            }
            
            return (
              <div
                key={index}
                style={{
                position: 'absolute',
                ...adjustedPos,
                width: iconSize,
                height: iconSize,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: hasIcon ? 'flex-start' : 'center',
                zIndex: 2,
                }}
              >
                {hasIcon && (forceIcon || icon) && (
                    <img
                      src={(forceIcon || icon)!.src}
                      alt={(forceIcon || icon)!.label}
                      style={{
                    width: iconSize,
                    height: iconSize,
                        objectFit: 'contain',
                    marginBottom: iconLayout?.spacing || '5px',
                    marginTop: isPIR ? (specialLayouts?.PIR?.marginTop || '20px') : '0',
                        filter: !isPIR && (forceIcon || icon)?.category !== 'Sockets' ? computedIconFilter : undefined,
                        transition: 'filter 0.2s',
                      }}
                    />
              )}
              
              {/* TAG no longer forces permanent icons; mirrors SP */}
                  {!isPIR && text && (
                    <div
                      style={{
                        fontSize: adjustedFontSize,
                        color: panelDesign.textColor || '#000000',
                        wordBreak: 'break-word',
                        maxWidth: '100%',
                        textAlign: 'center',
                        padding: textLayout?.padding || '4px',
                        borderRadius: '4px',
                        fontFamily: panelDesign.fonts || undefined,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {text}
                    </div>
                  )}
              </div>
            );
          })}
      </div>
    );
  }

  // For panels that don't use absolute positioning, return a simple fallback
  return (
    <div
      style={{
        width: dimensions.width,
        height: dimensions.height,
        background: panelDesign.backgroundColor,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: panelDesign.textColor,
        fontSize: panelDesign.fontSize,
        fontFamily: panelDesign.fonts || undefined,
        border: '1px solid #ccc',
      }}
    >
      Panel Design
    </div>
  );
};

export default PanelRenderer;
