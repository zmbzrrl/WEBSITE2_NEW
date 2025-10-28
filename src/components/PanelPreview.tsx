import React, { useEffect } from 'react';
import { ralColors } from '../data/ralColors';
import { getIconColorName } from '../data/iconColors';
import { allIcons } from '../assets/iconLibrary';
import DISPLAY from '../assets/icons/DISPLAY.png';
import FAN from '../assets/icons/FAN.png';
import { getPanelLayoutConfig, PanelLayoutConfig } from '../data/panelLayoutConfig';
import g18Icon from '../assets/icons/G-GuestServices/G18.png';
import g1Icon from '../assets/icons/G-GuestServices/G1.png';
import g2Icon from '../assets/icons/G-GuestServices/G2.png';
import g3Icon from '../assets/icons/G-GuestServices/G3.png';
import crIcon from '../assets/icons/CR.png';

// Copy hexToRgba from SPCustomizer
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

// Function to get auto text color based on background (from SPCustomizer)
const getAutoTextColor = (backgroundColor: string): string => {
  const hex = backgroundColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  // Calculate brightness (0-255)
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  
  // Use white text for dark backgrounds, dark grey (#808080) for light to match icons
  return brightness < 150 ? '#ffffff' : '#808080';
};

// Function to get proximity indicator positioning based on panel type and dimensions
const getProximityPositioning = (panelType: string, dimensions: { width: string | number; height: string | number }) => {
  const width = typeof dimensions.width === 'string' ? parseInt(dimensions.width.replace('px', '')) : dimensions.width;
  const height = typeof dimensions.height === 'string' ? parseInt(dimensions.height.replace('px', '')) : dimensions.height;
  
  // Match customizer implementations with adjusted spacing
  let right1 = '59px';   // Left circle position (62px - 3px = 59px)
  let right2 = '34px';   // Right circle position (32px + 2px = 34px, moved 2px left)
  let bottom = '22px';   // Bottom position (18px + 4px = 22px, moved 4px higher)
  let size1 = '7.65px';  // Left circle 15% smaller (9px * 0.85 = 7.65px)
  let size2 = '9px';     // Right circle same size
  
  // Adjust positioning based on panel type - match customizer patterns
  if (panelType === 'SP') {
    // Single Panel default proximity positioning
    right1 = '59px';
    right2 = '34px';
    bottom = '22px';
    size1 = '7.65px';
    size2 = '9px';
  } else if (panelType === 'TAG') {
    // TAG panel: lower circles by 5px vs SP
    right1 = '56px';
    right2 = '38px';
    bottom = '12px';
    size1 = '7.65px';
    size2 = '9px';
  } else if (panelType === 'DPH' || panelType === 'DPV') {
    // Double panels use slightly different positioning with adjusted spacing
    right1 = '55px';  // 58px - 3px
    right2 = '30px';  // 28px + 2px (moved 2px left)
    bottom = '18px';  // 14px + 4px (moved 4px higher)
    size1 = '7.65px'; // Left circle 15% smaller
    size2 = '9px';    // Right circle same size
  } else if (panelType.startsWith('X')) {
    // Extended panels use standard positioning with adjusted spacing
    right1 = '59px';  // 62px - 3px
    right2 = '34px';  // 32px + 2px (moved 2px left)
    bottom = '22px';  // 18px + 4px (moved 4px higher)
    size1 = '7.65px'; // Left circle 15% smaller
    size2 = '9px';    // Right circle same size
  }
  
  return { right1, right2, bottom, size1, size2 };
};

interface PanelPreviewIcon {
  src: string;
  label: string;
  position: number;
  text: string;
  category?: string;
  id?: string;
  iconId?: string;
}

interface PanelPreviewProps {
  icons: PanelPreviewIcon[];
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
    swapLeftRight?: boolean;
    useTagLayout?: boolean;
    idpgConfig?: {
      cardReader: boolean;
      roomNumber: boolean;
      statusMode: 'bar' | 'icons';
      selectedIcon1: string;
      roomNumberText: string;
    };
    features?: {
      Proximity?: boolean;
    };
    Proximity?: boolean;
    spConfig?: {
      dimension: 'standard' | 'wide' | 'tall';
    };
    tagConfig?: {
      dimension: 'standard' | 'wide' | 'tall';
    };
  };
  iconTexts?: { [key: number]: string };
  type?: string;
  // New props for customizer integration
  activeDimension?: {
    width: string;
    height: string;
  };
  dimensions?: {
    width: string;
    height: string;
  };
  gridOffsetX?: number;
  gridOffsetY?: number;
  activeIconPositions?: Array<{ top: string; left: string; width?: string; height?: string }>;
  dimensionKey?: string;
  // Interactive props (optional - for customizer mode)
  editingCell?: number | null;
  hoveredCell?: number | null;
  iconHovered?: { [key: number]: boolean };
  isDraggingIcon?: boolean;
  restrictedCells?: number[];
  panelMode?: 'icons_only' | 'text_only' | 'icons_text' | 'custom';
  onTextChange?: (e: React.ChangeEvent<HTMLInputElement>, index: number) => void;
  onTextClick?: (index: number) => void;
  onTextBlur?: () => void;
  onDeleteIcon?: (iconId: string) => void;
  onDragStart?: (e: React.DragEvent, icon: PanelPreviewIcon) => void;
  onDragEnd?: () => void;
  onDrop?: (index: number, iconId: string) => void;
  onIconHover?: (index: number, hovered: boolean) => void;
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

const PanelPreview: React.FC<PanelPreviewProps> = ({ 
  icons, 
  panelDesign, 
  iconTexts, 
  type = 'SP',
  activeDimension,
  dimensions: propDimensions,
  gridOffsetX = 0,
  gridOffsetY = 0,
  activeIconPositions,
  dimensionKey,
  editingCell,
  hoveredCell,
  iconHovered = {},
  isDraggingIcon = false,
  restrictedCells = [],
  panelMode = 'icons_text',
  onTextChange,
  onTextClick,
  onTextBlur,
  onDeleteIcon,
  onDragStart,
  onDragEnd,
  onDrop,
  onIconHover
}) => {
  useEffect(() => {
    if (panelDesign.fonts) {
      loadGoogleFont(panelDesign.fonts);
    }
  }, [panelDesign.fonts]);

  // Use automatic icon color based on background
  const computedIconFilter = getIconColorFilter(panelDesign.backgroundColor || '#ffffff');

  // Customizer-specific renderAbsoluteCell function (copied from SPCustomizer)
  const renderAbsoluteCell = (index: number) => {
    const icon = icons.find((i) => i.position === index);
    const text = iconTexts?.[index];
    const isPIR = icon?.category === "PIR";
    const isEditing = editingCell === index;
    const isHovered = hoveredCell === index;
    const isIconHovered = !!iconHovered[index];
    const iconSize = panelDesign.iconSize || iconLayout?.size || '47px';
    const pos = activeIconPositions?.[index] || { top: '0px', left: '0px' };
    const baseTop = parseInt((pos as any).top || '0', 10);
    const rowIndex = Math.floor(index / 3);
    // Apply TAG-specific first-row offset in preview
    let adjustedTopPx = baseTop;
    if (type === 'TAG' && rowIndex === 0) {
      adjustedTopPx += 25;
    }
    const adjustedTop = `${adjustedTopPx}px`;
    
    return (
      <div
        key={index}
        style={{
          position: 'absolute',
          ...pos,
          width: (pos as any).width || iconSize,
          height: (pos as any).height || iconSize,
          top: adjustedTop,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-start',
          zIndex: 2,
        }}
        onDragOver={onDrop ? (e) => { e.preventDefault(); } : undefined}
        onDrop={onDrop ? (e) => { e.preventDefault(); const iconId = e.dataTransfer.getData('text/plain'); onDrop(index, iconId); } : undefined}
      >
        {/* Restricted overlay during drag of DND/MUR */}
        {isDraggingIcon && restrictedCells.includes(index) && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(220, 53, 69, 0.18)',
              border: '2px dashed rgba(220, 53, 69, 0.8)',
              borderRadius: '6px',
              pointerEvents: 'none',
              zIndex: 0,
            }}
          />
        )}
        {icon && panelMode !== 'text_only' && (
          <div 
            style={{ position: 'relative', display: 'inline-block' }}
            onMouseEnter={onIconHover ? () => onIconHover(index, true) : undefined}
            onMouseLeave={onIconHover ? () => onIconHover(index, false) : undefined}
          >
            <img
              src={icon.src}
              alt={icon.label}
              draggable={onDragStart ? true : false}
              onDragStart={onDragStart ? (e) => onDragStart(e, icon) : undefined}
              onDragEnd={onDragEnd ? onDragEnd : undefined}
              style={{
                width: isPIR ? '40px' : (icon?.category === 'Bathroom' ? '38px' : panelDesign.iconSize || iconLayout?.size || '47px'),
                height: isPIR ? '40px' : (icon?.category === 'Bathroom' ? '38px' : panelDesign.iconSize || iconLayout?.size || '47px'),
                objectFit: 'contain',
                marginBottom: '5px',
                position: 'relative',
                zIndex: 1,
                marginTop: isPIR ? '5px' : '0',
                cursor: onDragStart ? 'move' : 'default',
                filter: !isPIR ? getIconColorFilter(panelDesign.backgroundColor) : undefined,
                transition: 'filter 0.2s',
              }}
            />
            {onDeleteIcon && (
              <button
                onClick={(e) => { e.stopPropagation(); onDeleteIcon(icon.id || ''); }}
                style={{
                  position: 'absolute',
                  top: '-8px',
                  right: '-8px',
                  background: 'rgba(220, 53, 69, 0.9)',
                  color: 'white',
                  border: '2px solid rgba(255, 255, 255, 0.8)',
                  borderRadius: '50%',
                  width: '20px',
                  height: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: '12px',
                  padding: 0,
                  lineHeight: 1,
                  zIndex: 3,
                  opacity: isIconHovered ? 1 : 0,
                  transform: isIconHovered ? 'scale(1)' : 'scale(0.8)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
                  fontWeight: 'bold',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(220, 53, 69, 1)'; e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(220, 53, 69, 0.4)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(220, 53, 69, 0.9)'; e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.2)'; }}
              >
                ×
              </button>
            )}
          </div>
        )}
        {/* Text field - centered when no icon, below icon when icon exists */}
        {!isPIR && (type !== 'TAG' || rowIndex > 0) && (
          <div style={{ 
            width: '100%', 
            textAlign: 'center', 
            marginTop: icon ? '-11px' : '0px',
            height: icon ? 'auto' : '100%',
            display: icon ? 'block' : 'flex',
            alignItems: icon ? 'flex-start' : 'center',
            justifyContent: icon ? 'flex-start' : 'center'
          }}>
            {isEditing ? (
              <input
                type="text"
                value={text || ''}
                onChange={onTextChange ? (e) => onTextChange(e, index) : undefined}
                onBlur={onTextBlur}
                autoFocus
                style={{ 
                  width: '100%', 
                  padding: '4px', 
                  fontSize: panelDesign.fontSize || '12px', 
                  textAlign: 'center', 
                  border: '1px solid rgba(255, 255, 255, 0.2)', 
                  borderRadius: '4px', 
                  outline: 'none', 
                  background: 'rgba(255, 255, 255, 0.1)', 
                  transition: 'all 0.2s ease', 
                  fontFamily: panelDesign.fonts || undefined, 
                  color: getAutoTextColor(panelDesign.backgroundColor), 
                  marginTop: '0px',
                  height: icon ? 'auto' : '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              />
            ) : (
              (() => {
                const textAllowed = panelMode === 'custom' || panelMode === 'text_only' || (panelMode === 'icons_text' && !!icon);
                if (textAllowed) {
                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                      {(panelMode === 'custom' && !icon) && (
                        <div
                          title="Add icon"
                          style={{
                            width: '36px',
                            height: '36px',
                            margin: '0 auto 6px auto',
                            border: '1px dashed #cbd5e1',
                            borderRadius: '50%',
                            color: '#94a3b8',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '18px',
                            lineHeight: 1,
                            opacity: 0.7,
                            transition: 'opacity 0.2s ease-in-out'
                          }}
                          onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.opacity = '1'; }}
                          onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.opacity = '0.7'; }}
                        >
                          +
                        </div>
                      )}
                      <div
                        onClick={onTextClick ? () => onTextClick(index) : undefined}
                        style={{ 
                          fontSize: panelDesign.fontSize || '12px', 
                          color: text ? getAutoTextColor(panelDesign.backgroundColor) : '#999999', 
                          wordBreak: 'break-word', 
                          width: '100%', 
                          textAlign: 'center', 
                          padding: '4px', 
                          cursor: onTextClick ? 'pointer' : 'default', 
                          borderRadius: '4px', 
                          backgroundColor: isHovered ? 'rgba(255, 255, 255, 0.1)' : 'transparent', 
                          transition: 'all 0.2s ease', 
                          fontFamily: panelDesign.fonts || undefined, 
                          marginTop: '0px', 
                          whiteSpace: 'nowrap', 
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          height: icon ? 'auto' : '100%',
                          ...(text ? { overflow: 'hidden', textOverflow: 'ellipsis' } : { overflow: 'visible', textOverflow: 'clip' }) 
                        }}
                      >
                        {text || 'Add text'}
                      </div>
                    </div>
                  );
                }
                // Text is not allowed here → show icon indicator instead
                return (
                  <div
                    style={{ fontSize: panelDesign.fontSize || '12px', color: '#999999', width: '100%', textAlign: 'center', padding: '4px', borderRadius: '4px', backgroundColor: 'transparent', fontFamily: panelDesign.fonts || undefined, marginTop: '0px', cursor: 'default' }}
                  >
                    <div
                      title="Add icon"
                      style={{
                        width: '36px',
                        height: '36px',
                        margin: '0 auto',
                        border: '1px dashed #cbd5e1',
                        borderRadius: '50%',
                        color: '#94a3b8',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '18px',
                        lineHeight: 1,
                        opacity: 0.7,
                        transition: 'opacity 0.2s ease-in-out'
                      }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.opacity = '1'; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.opacity = '0.7'; }}
                    >
                      +
                    </div>
                  </div>
                );
              })()
            )}
          </div>
        )}
      </div>
    );
  };

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

  // Helper functions defined early to avoid hoisting issues
  // Helper function to convert mm to px (95mm panel = 320px, so 1mm ≈ 3.37px)
  // Making panels slightly wider by increasing the conversion ratio
  const convertMmToPx = (value: string): string => {
    if (value.endsWith('mm')) {
      const mm = parseFloat(value);
      const px = Math.round(mm * (350 / 95)); // 95mm = 350px (wider than 320px)
      return `${px}px`;
    }
    return value; // Return as-is if already in px or other format
  };

  // Helper function to scale icon positions to match the new panel dimensions
  const scaleIconPosition = (pos: { top: string; left: string; width?: string; height?: string }): { top: string; left: string; width?: string; height?: string } => {
    const scaleFactor = 350 / 320; // Scale factor from 320px to 350px width
    return {
      top: `${Math.round(parseFloat(pos.top) * scaleFactor)}px`,
      left: `${Math.round(parseFloat(pos.left) * scaleFactor)}px`,
      width: pos.width ? `${Math.round(parseFloat(pos.width) * scaleFactor)}px` : undefined,
      height: pos.height ? `${Math.round(parseFloat(pos.height) * scaleFactor)}px` : undefined
    };
  };

  // Global feature flags (persisted in panelDesign by customizers)

  // Get layout configuration for this panel type
  const config = getPanelLayoutConfig(type);
  const { gridLayout, iconLayout, bigIconLayout, textLayout, specialLayouts, iconPositions: rawIconPositions } = config;
  
  // Scale the default icon positions to match the new panel dimensions
  const iconPositions = rawIconPositions?.map(scaleIconPosition);
  
  // Get dimension-specific icon positions for SP panels
  let dimensionIconPositions = iconPositions;
  if (isSP && panelDesign.spConfig && config.dimensionConfigs) {
    const { dimension } = panelDesign.spConfig;
    if (config.dimensionConfigs[dimension] && config.dimensionConfigs[dimension].iconPositions) {
      dimensionIconPositions = config.dimensionConfigs[dimension].iconPositions;
    }
  }
  
  // For IDPG panels, calculate dimensions based on configuration
  let dimensions = {
    width: convertMmToPx(config.dimensions.width),
    height: convertMmToPx(config.dimensions.height)
  };
  if (isIDPG && panelDesign.idpgConfig) {
    const { cardReader, roomNumber } = panelDesign.idpgConfig;
    
    // Square template (350x350) - when no card reader and no room number
    if (!cardReader && !roomNumber) {
      dimensions = { width: '350px', height: '350px' };
    }
    // Rectangle vertical template (330x470) - when room number only
    else if (!cardReader && roomNumber) {
      dimensions = { width: '330px', height: '470px' };
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
  
  // Special handling for DPV panels - increase height by 10%
  if (isDPV) {
    const currentHeight = typeof dimensions.height === 'string' ? parseInt(dimensions.height.replace('px', '')) : dimensions.height;
    dimensions.height = `${Math.round(currentHeight * 1.1)}px`;
  }
  
  // Calculate grid offsets for SP and TAG panels (use prop values or calculate defaults)
  let calculatedGridOffsetX = gridOffsetX || 0;
  let calculatedGridOffsetY = gridOffsetY || 0;
  
  // For SP panels, calculate dimensions and grid offsets based on configuration
  if (isSP && panelDesign.spConfig) {
    const { dimension } = panelDesign.spConfig;
    if (config.dimensionConfigs && config.dimensionConfigs[dimension]) {
      dimensions = {
        width: convertMmToPx(config.dimensionConfigs[dimension].width),
        height: convertMmToPx(config.dimensionConfigs[dimension].height)
      };
      // Also update the icon positions for the selected dimension (scaled to match new panel size)
      dimensionIconPositions = config.dimensionConfigs[dimension].iconPositions?.map(scaleIconPosition);
    }
    // Keep base offsets consistent across dimensions; apply requested SP shifts
    if (!gridOffsetX && !gridOffsetY) {
      let offsetX = 20;
      let offsetY = 15;
      // For SP wide: shift grid 60px right
      if (dimension === 'wide') offsetX += 60;
      // For SP tall: shift grid 50px down
      if (dimension === 'tall') offsetY += 50;
      calculatedGridOffsetX = offsetX;
      calculatedGridOffsetY = offsetY;
    }
  } else if (isSP && !gridOffsetX && !gridOffsetY) {
    // Default SP grid offsets when no config is provided
    calculatedGridOffsetX = 20; // standard dimension default
    calculatedGridOffsetY = 15;
  }
  
  // For TAG panels, calculate dimensions and grid offsets based on configuration
  if (isTAG && panelDesign.tagConfig) {
    const { dimension } = panelDesign.tagConfig;
    if (config.dimensionConfigs && config.dimensionConfigs[dimension]) {
      dimensions = {
        width: convertMmToPx(config.dimensionConfigs[dimension].width),
        height: convertMmToPx(config.dimensionConfigs[dimension].height)
      };
      // Also update the icon positions for the selected dimension (scaled to match new panel size)
      dimensionIconPositions = config.dimensionConfigs[dimension].iconPositions?.map(scaleIconPosition);
    }
    // Keep base offsets consistent across dimensions; apply requested TAG shifts
    if (!gridOffsetX && !gridOffsetY) {
      let offsetX = 20;
      let offsetY = 15;
      // For TAG wide: shift grid 60px right
      if (dimension === 'wide') offsetX += 60;
      // For TAG tall: shift grid 50px down
      if (dimension === 'tall') offsetY += 50;
      calculatedGridOffsetX = offsetX;
      calculatedGridOffsetY = offsetY;
    }
  } else if (isTAG && !gridOffsetX && !gridOffsetY) {
    // Default TAG grid offsets when no config is provided
    calculatedGridOffsetX = 20; // standard dimension default
    calculatedGridOffsetY = 15;
  }
  const isDoublePanel = isDPH || isDPV;
  const isExtendedPanel = isX2V || isX1H || isX1V || isX2H;
  const isVerticalPanel = isDPV || isX2V || isX1V;

  // Helper function to get icon size based on category
  const getIconSize = (icon: PanelPreviewIcon | undefined) => {
    if (!icon) return iconLayout?.size || '40px';
    
    const isPIR = icon.category === 'PIR';
    const isBathroom = icon.category === 'Bathroom';
    
    // Check if this is a single icon slot for extended panels
    const isSingleIconSlot = (isX1H || isX1V) && icon.position === 9;
    const isX2SingleIconSlot = (isX2H || isX2V) && (icon.position === 9 || icon.position === 10);
    
    // Special handling for TAG panel - use special sizes for DISPLAY and FAN icons
    if (isTAG) {
      if (icon?.iconId === 'DISPLAY') {
        return '237px'; // Large display icon - made 3% bigger
      }
      // C and F icons from TAG_icons folder should be 50% smaller
      if (icon && (icon.iconId === 'C' || icon.iconId === 'F')) {
        const baseSize = 40; // Base size for TAG icons
        return `${Math.round(baseSize * 0.5)}px`; // 20px
      }
      // First row icons (positions 0, 1, 2) are 35px
      if (icon && (icon.position === 0 || icon.position === 1 || icon.position === 2)) {
        return '35px';
      }
      // Rows 2 and 3 icons (positions 3, 4, 5, 6, 7, 8) are 45px
      if (icon && (icon.position === 3 || icon.position === 4 || icon.position === 5 ||
                   icon.position === 6 || icon.position === 7 || icon.position === 8)) {
        return '45px';
      }
      if (icon?.iconId === 'FAN') {
        // All FAN icons now 40px
        return '40px';
      }
      // Make all other TAG grid icons 40px
      return '40px';
    }
    
    // Special handling for IDPG panel - use the iconSize from panelDesign
    if (isIDPG) {
      return convertMmToPx(panelDesign.iconSize || '40px');
    }
    
    if (isPIR) {
      return specialLayouts?.PIR?.iconSize || '40px';
    }
    if (isBathroom) {
      return specialLayouts?.Bathroom?.iconSize || '47px';
    }
    
    // Return larger size for single icon slots
    if (isSingleIconSlot) {
      return '220px';
    }
    if (isX2SingleIconSlot) {
      return '204px'; // Match X2HCustomizer step 4 preview
    }
    
    return convertMmToPx(panelDesign.iconSize || iconLayout?.size || '40px');
  };

  // Helper function to get grid cell count
  const getGridCellCount = () => {
    if (isIDPG) return 16; // 4x4 grid
    if (isDPH) return 18; // Always 18 for DPH
    if (isDPV) return 18;
    return 9; // 3x3 grid for most panels
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
          width: isDPH ? '704px' : dimensions.width,
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
        }}
      >
        {/* TAG DISPLAY overlay */}
        {isTAG && (
          <img
            src={DISPLAY}
            alt="DISPLAY"
            style={{
              position: 'absolute',
              top: (panelDesign.tagConfig?.dimension === 'tall') ? '140px' : '90px',
              left: 'calc(45% + 15px)',
              transform: 'translateX(-50%)',
              width: '237px',
              height: '54px',
              objectFit: 'contain',
              filter: computedIconFilter,
              pointerEvents: 'none',
              zIndex: 2,
            }}
          />
        )}
        
        {/* Proximity indicators overlay */}
        {(panelDesign.features?.Proximity || panelDesign.Proximity) && (() => {
          const positioning = getProximityPositioning(type, dimensions);
          return (
            <>
              <div
                style={{
                  position: 'absolute',
                  bottom: positioning.bottom,
                  right: positioning.right1,
                  width: positioning.size1,
                  height: positioning.size1,
                  borderRadius: '50%',
                  backgroundColor: '#ff9800',
                  filter: getIconColorFilter(panelDesign.backgroundColor),
                  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
                  zIndex: 10
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  bottom: positioning.bottom,
                  right: positioning.right2,
                  width: positioning.size2,
                  height: positioning.size2,
                  borderRadius: '50%',
                  backgroundColor: '#ff9800',
                  filter: getIconColorFilter(panelDesign.backgroundColor),
                  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
                  zIndex: 10
                }}
              />
            </>
          );
        })()}
        <div style={{
            position: 'absolute',
            top: '2px',
            left: '2px',
            right: '2px',
            bottom: '2px',
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, transparent 50%, rgba(0, 0, 0, 0.05) 100%)',
            pointerEvents: 'none',
            zIndex: 1,
        }} />
        {(isDPH ? Array.from({ length: 18 }) : (dimensionIconPositions || iconPositions)).map((_, index) => {
            const pos = (dimensionIconPositions || iconPositions)[index];
            const icon = icons.find((i) => i.position === index);
            const isPIR = icon?.category === 'PIR';
            const text = (iconTexts && iconTexts[index]) || icon?.text;
            const hasIcon = icon && icon.src;
            const iconSize = getIconSize(icon);
            const baseFontSize = textLayout?.fontSize || panelDesign.fontSize || '12px';
            const adjustedFontSize = text ? calculateFontSize(text, parseInt(isDPH ? '704' : dimensions.width) / 6, baseFontSize) : baseFontSize;
            
            // Apply swap and mirror logic for X1H panels
            let adjustedPos = pos;
            
            // Apply mirror logic first (if enabled)
            if (isX1H && panelDesign.mirrorVertical && index >= 0 && index <= 8) {
              // Mirror the grid horizontally: column 0<->2, column 1 stays
              const row = Math.floor(index / 3);
              const col = index % 3;
              if (col === 0) {
                // Column 0 moves to column 2 position
                const col2Pos = (dimensionIconPositions || iconPositions)[row * 3 + 2];
                if (col2Pos) {
                  adjustedPos = { ...col2Pos };
                }
              } else if (col === 2) {
                // Column 2 moves to column 0 position
                const col0Pos = (dimensionIconPositions || iconPositions)[row * 3];
                if (col0Pos) {
                  adjustedPos = { ...col0Pos };
                }
              }
              // Column 1 stays in place
            }
            
            // Apply position adjustments based on swapLeftRight state
            if (isX1H) {
              const swapLeftRight = (panelDesign as any).swapLeftRight || false;
              if (swapLeftRight) {
                // If swapLeftRight is true, swap left 3x3 grid with right single slot
                if (index >= 0 && index <= 8) {
                  // Move the left 3x3 grid to the right side
                  // Panel is 731px wide, so move grid to right half (around 340px offset)
                  const swappedGridOffset = 340;
                  adjustedPos = { ...adjustedPos, left: (parseInt(adjustedPos.left) + swappedGridOffset) + 'px' };
                } else if (index === 9) {
                  // Move the right single slot to the left side, positioned more centrally
                  // Original position is left: '341px', move it to left side (around 53px from left, moved up 60px total)
                  adjustedPos = { ...adjustedPos, left: '53px', top: '63px' }; // Center it vertically on the left, moved up 60px total and right 20px
                }
              } else {
                // When right button is NOT pressed, apply default offsets
                if (index >= 0 && index <= 8) {
                  // Move 3x3 grid 20px to the right
                  const gridOffset = 20;
                  adjustedPos = { ...adjustedPos, left: (parseInt(adjustedPos.left) + gridOffset) + 'px' };
                } else if (index === 9) {
                  // Move big icon 160px to the left
                  const iconOffset = -160;
                  adjustedPos = { ...adjustedPos, left: (parseInt(adjustedPos.left) + iconOffset) + 'px' };
                }
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
                // Panel is 640px tall, so move grid to bottom half (320px offset)
                // Also move 7px to the left and 50px to the top (30px + 20px)
                const swappedGridOffset = 320;
                adjustedPos = { 
                  ...adjustedPos, 
                  top: (parseInt(adjustedPos.top) + swappedGridOffset - 50) + 'px',
                  left: (parseInt(adjustedPos.left) - 7) + 'px'
                };
              } else if (index === 9) {
                // Move the single slot to the top half, positioned more centrally
                // Original position is 328px top, 36px left
                // Move it to center of top half (around 55px from top) and 130px to the left (110px + 20px)
                adjustedPos = { ...adjustedPos, top: '55px', left: (parseInt(adjustedPos.left) - 130) + 'px' };
              }
            } else if (isX1V) {
              if (index === 9) {
                // When big icon is at the bottom (swapUpDown is false), move it 125px to the left (110px + 15px)
                adjustedPos = { ...adjustedPos, left: (parseInt(adjustedPos.left) - 125) + 'px' };
              } else if (index >= 0 && index <= 8) {
                // Move the 3x3 grid 7px to the left when big icon is at the bottom
                adjustedPos = { ...adjustedPos, left: (parseInt(adjustedPos.left) - 7) + 'px' };
              }
            }
            
            // TAG: lower rows 2 and 3 (indices 3-8) by 30px, and move rows 3 and 4 down by additional 8px
            if (isTAG && adjustedPos && adjustedPos.top && index >= 3 && index <= 8) {
              const topValue = parseInt(adjustedPos.top);
              let offset = 30; // Base offset for rows 2 and 3
              // Add 8px for rows 3 and 4 (indices 6-8 and 9-11 if they exist)
              if (index >= 6) {
                offset += 8;
              }
              adjustedPos = { ...adjustedPos, top: (topValue + offset) + 'px' } as any;
            }

            // SP: apply dimension-specific overall grid shift for absolute rendering
            if (isSP && panelDesign.spConfig && adjustedPos) {
              const { dimension } = panelDesign.spConfig;
              const baseLeft = parseInt((adjustedPos as any).left || '0', 10);
              const baseTop = parseInt((adjustedPos as any).top || '0', 10);
              const dx = dimension === 'wide' ? 60 : 0;
              const dy = dimension === 'tall' ? 50 : 0;
              adjustedPos = { ...adjustedPos, left: (baseLeft + dx) + 'px', top: (baseTop + dy) + 'px' } as any;
            }

            // TAG: apply dimension-specific overall grid shift for absolute rendering
            if (isTAG && panelDesign.tagConfig && adjustedPos) {
              const { dimension } = panelDesign.tagConfig;
              const baseLeft = parseInt((adjustedPos as any).left || '0', 10);
              const baseTop = parseInt((adjustedPos as any).top || '0', 10);
              const dx = dimension === 'wide' ? 60 : 0;
              const dy = dimension === 'tall' ? 50 : 0;
              adjustedPos = { ...adjustedPos, left: (baseLeft + dx) + 'px', top: (baseTop + dy) + 'px' } as any;
            }
            
            // X2V: apply big icon positioning logic to match customizer
            if (isX2V && (index === 9 || index === 10)) {
              const swapUpDown = (panelDesign as any).swapUpDown || false;
              // Move both big icons to the left by 40px in all states
              adjustedPos = { ...adjustedPos, left: (parseInt(adjustedPos.left) - 40) + 'px' };
              
              // Apply vertical positioning adjustments
              if (!swapUpDown) {
                // Move middle big icon up by 120px (90px + 30px) and outer big icon up by 215px (165px + 50px)
                if (index === 9) {
                  adjustedPos = { ...adjustedPos, top: (parseInt(adjustedPos.top) - 120) + 'px' };
                } else if (index === 10) {
                  adjustedPos = { ...adjustedPos, top: (parseInt(adjustedPos.top) - 215) + 'px' };
                }
              }
              
              // If swapUpDown is true, apply swap logic
              if (swapUpDown) {
                if (index === 9) {
                  // Move the middle big icon up by 120px when swap is active
                  adjustedPos = { ...adjustedPos, top: (parseInt(adjustedPos.top) - 120) + 'px' };
                } else if (index === 10) {
                  // Move the first big icon to the top half, positioned more centrally
                  adjustedPos = { ...adjustedPos, top: '55px' };
                }
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
                  justifyContent: 'flex-start',
                zIndex: 2,
                }}
              >
                {hasIcon && (
                    <img
                      src={icon.src}
                      alt={icon.label}
                      style={{
                    width: iconSize,
                    height: iconSize,
                        objectFit: 'contain',
                    marginBottom: iconLayout?.spacing || '5px',
                    marginTop: isPIR ? (specialLayouts?.PIR?.marginTop || '20px') : '0',
                        filter: !isPIR && icon?.category !== 'Sockets' ? computedIconFilter : undefined,
                        transition: 'filter 0.2s',
                      }}
                    />
              )}
              

                  {!isPIR && text && (
                    <div
                      style={{
                        fontSize: adjustedFontSize,
                        color: getAutoTextColor(panelDesign.backgroundColor),
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

  // Helper function to get big icon source
    const getBigIconSrc = () => {
    // Different panel types use different positions for big icons
    let bigIconPosition = 9; // Default for most panels
    
    if (isX1H || isX1V) {
      bigIconPosition = 100; // X1 panels use position 100
    } else if (isX2H || isX2V) {
      bigIconPosition = 9; // X2 panels use position 9
    }
    
    const bigIcon = icons.find(icon => icon.position === bigIconPosition);
    
    // Debug: Only log for X1H to avoid spam
    if (isX1H) {
      console.log('X1H Big Icon Debug:', {
        bigIconPosition,
        bigIcon,
        iconColor: panelDesign.iconColor,
        filter: computedIconFilter,
        allIcons: icons.map(i => ({ position: i.position, src: i.src }))
      });
    }
    
    return bigIcon?.src || '';
  };

  // Helper function to get second big icon source (for X2 panels)
    const getBigIcon2Src = () => {
    const bigIcon2 = icons.find(icon => icon.position === 10);
    return bigIcon2?.src || '';
  };

  // Helper function to render big icon container
  const getBigIconContainer = (isReversed = false) => {
    if (!bigIconLayout) return null;

    const bigIconSrc = getBigIconSrc();
    const bigIcon2Src = getBigIcon2Src();
    const isX2Panel = isX2H || isX2V;



        return (
      <div
        style={{
          width: bigIconLayout.width,
          height: bigIconLayout.height,
            display: 'flex', 
          flexDirection: isVerticalPanel ? 'column' : 'row',
            alignItems: 'center', 
            justifyContent: 'center',
          gap: '10px',
            position: 'relative',
            zIndex: 2,
        }}
      >
                {bigIconSrc && (
          <div style={{ position: 'relative', display: 'inline-block' }}>
              <img
                src={bigIconSrc}
              alt="Big Icon"
                style={{ 
                width: bigIconLayout.size,
                height: bigIconLayout.size,
                  objectFit: 'contain', 
                filter: getBigIconSrc() && icons.find(icon => icon.position === ((isX1H || isX1V) ? 100 : 9))?.category !== 'Sockets' ? computedIconFilter : undefined,
                  transition: 'filter 0.2s',
                }}
            />
              </div>
            )}
        {isX2Panel && bigIcon2Src && (
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <img
              src={bigIcon2Src}
              alt="Big Icon 2"
                style={{ 
                width: bigIconLayout.size,
                height: bigIconLayout.size,
                  objectFit: 'contain', 
                filter: getBigIcon2Src() && icons.find(icon => icon.position === 10)?.category !== 'Sockets' ? computedIconFilter : undefined,
                  transition: 'filter 0.2s',
                }}

            />
              </div>
            )}
          </div>
        );
  };

  // Helper function to render grid
  const renderGrid = () => {
    // Special handling for DPH - render two 3x3 grids side by side
    if (isDPH) {
      return (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'row',
            gap: 0,
            position: 'relative',
            zIndex: 2,
          }}
        >
          {/* Left 3x3 grid (positions 0-8) */}
          <div
            style={{
              width: '50%',
              height: '100%',
              display: 'flex',
              flexWrap: 'wrap',
              gap: gridLayout?.gap || '5px',
              padding: gridLayout?.padding || '10px',
            }}
          >
            {Array.from({ length: 9 }).map((_, index) => {
              const icon = icons.find((i) => i.position === index);
              const isPIR = icon?.category === 'PIR';
              const text = (iconTexts && iconTexts[index]) || icon?.text;
              const hasIcon = icon && icon.src;
              const iconSize = getIconSize(icon);
              return (
                <div
                  key={index}
                  style={{
                    width: `calc(${100 / 3}% - ${gridLayout?.gap || '5px'})`,
                    height: `calc(${100 / 3}% - ${gridLayout?.gap || '5px'})`,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: hasIcon ? 'flex-start' : 'center',
                    position: 'relative',
                    paddingTop: hasIcon ? '10px' : 0,
                  }}
                >
                  {hasIcon && (
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                      <img
                        src={icon.src}
                        alt={icon.label}
                        style={{
                          width: iconSize,
                          height: iconSize,
                          objectFit: 'contain',
                          marginBottom: iconLayout?.spacing || '5px',
                          position: 'relative',
                          zIndex: 1,
                          marginTop: isPIR ? (specialLayouts?.PIR?.marginTop || '20px') : '0',
                          filter: !isPIR && icon?.category !== 'Sockets' ? computedIconFilter : undefined,
                          transition: 'filter 0.2s',
                        }}
                      />
                    </div>
                  )}
                  <div style={{
                    position: hasIcon ? (textLayout?.position || 'absolute') : 'static',
                    bottom: hasIcon ? (textLayout?.bottom || '13px') : undefined,
                    left: hasIcon ? '50%' : undefined,
                    transform: hasIcon ? 'translateX(-50%)' : undefined,
                    width: '90%',
                    zIndex: 0,
                    display: hasIcon ? undefined : 'flex',
                    alignItems: hasIcon ? undefined : 'center',
                    justifyContent: hasIcon ? undefined : 'center',
                    height: hasIcon ? undefined : '100%',
                  }}>
                    {!isPIR && text && (
                      <div
                        style={{
                          fontSize: textLayout?.fontSize || panelDesign.fontSize || '12px',
                          color: getAutoTextColor(panelDesign.backgroundColor),
                          wordBreak: 'break-word',
                          maxWidth: '100%',
                          textAlign: 'center',
                          padding: textLayout?.padding || '4px',
                          borderRadius: '4px',
                          fontFamily: panelDesign.fonts || undefined,
                        }}
                      >
                        {text}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Right 3x3 grid (positions 9-17) */}
          <div
            style={{
              width: '50%',
              height: '100%',
              display: 'flex',
              flexWrap: 'wrap',
              gap: gridLayout?.gap || '5px',
              padding: gridLayout?.padding || '10px',
            }}
          >
            {Array.from({ length: 9 }).map((_, index) => {
              const actualIndex = index + 9; // Positions 9-17
              const icon = icons.find((i) => i.position === actualIndex);
              const isPIR = icon?.category === 'PIR';
              const text = (iconTexts && iconTexts[actualIndex]) || icon?.text;
              const hasIcon = icon && icon.src;
              const iconSize = getIconSize(icon);
              return (
                <div
                  key={actualIndex}
                  style={{
                    width: `calc(${100 / 3}% - ${gridLayout?.gap || '5px'})`,
                    height: `calc(${100 / 3}% - ${gridLayout?.gap || '5px'})`,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: hasIcon ? 'flex-start' : 'center',
                    position: 'relative',
                    paddingTop: hasIcon ? '10px' : 0,
                  }}
                >
                  {hasIcon && (
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                      <img
                        src={icon.src}
                        alt={icon.label}
                        style={{
                          width: iconSize,
                          height: iconSize,
                          objectFit: 'contain',
                          marginBottom: iconLayout?.spacing || '5px',
                          position: 'relative',
                          zIndex: 1,
                          marginTop: isPIR ? (specialLayouts?.PIR?.marginTop || '20px') : '0',
                          filter: !isPIR && icon?.category !== 'Sockets' ? computedIconFilter : undefined,
                          transition: 'filter 0.2s',
                        }}
                      />
                    </div>
                  )}
                  <div style={{
                    position: hasIcon ? (textLayout?.position || 'absolute') : 'static',
                    bottom: hasIcon ? (textLayout?.bottom || '13px') : undefined,
                    left: hasIcon ? '50%' : undefined,
                    transform: hasIcon ? 'translateX(-50%)' : undefined,
                    width: '90%',
                    zIndex: 0,
                    display: hasIcon ? undefined : 'flex',
                    alignItems: hasIcon ? undefined : 'center',
                    justifyContent: hasIcon ? undefined : 'center',
                    height: hasIcon ? undefined : '100%',
                  }}>
                    {!isPIR && text && (
                      <div
                        style={{
                          fontSize: textLayout?.fontSize || panelDesign.fontSize || '12px',
                          color: getAutoTextColor(panelDesign.backgroundColor),
                          wordBreak: 'break-word',
                          maxWidth: '100%',
                          textAlign: 'center',
                          padding: textLayout?.padding || '4px',
                          borderRadius: '4px',
                          fontFamily: panelDesign.fonts || undefined,
                        }}
                      >
                        {text}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    // Special handling for DPV - render two 3x3 grids stacked vertically
    } else if (isDPV) {
      return (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: 0,
            position: 'relative',
            zIndex: 2,
          }}
        >
          {/* Top 3x3 grid (positions 0-8) */}
          <div
            style={{
              width: '100%',
              height: '50%',
              display: 'flex',
              flexWrap: 'wrap',
              gap: gridLayout?.gap || '5px',
              padding: gridLayout?.padding || '10px',
            }}
          >
            {Array.from({ length: 9 }).map((_, index) => {
              const icon = icons.find((i) => i.position === index);
              const isPIR = icon?.category === 'PIR';
              const text = (iconTexts && iconTexts[index]) || icon?.text;
              const hasIcon = icon && icon.src;
              const iconSize = getIconSize(icon);
              return (
                <div
                  key={index}
                  style={{
                    width: `calc(${100 / 3}% - ${gridLayout?.gap || '5px'})`,
                    height: `calc(${100 / 3}% - ${gridLayout?.gap || '5px'})`,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: hasIcon ? 'flex-start' : 'center',
                    position: 'relative',
                    paddingTop: hasIcon ? '10px' : 0,
                  }}
                >
                  {hasIcon && (
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                      <img
                        src={icon.src}
                        alt={icon.label}
                        style={{
                          width: iconSize,
                          height: iconSize,
                          objectFit: 'contain',
                          marginBottom: iconLayout?.spacing || '5px',
                          position: 'relative',
                          zIndex: 1,
                          marginTop: isPIR ? (specialLayouts?.PIR?.marginTop || '20px') : '0',
                          filter: !isPIR && icon?.category !== 'Sockets' ? computedIconFilter : undefined,
                          transition: 'filter 0.2s',
                        }}
                      />
                    </div>
                  )}
                  <div style={{
                    position: hasIcon ? (textLayout?.position || 'absolute') : 'static',
                    bottom: hasIcon ? (textLayout?.bottom || '13px') : undefined,
                    left: hasIcon ? '50%' : undefined,
                    transform: hasIcon ? 'translateX(-50%)' : undefined,
                    width: '90%',
                    zIndex: 0,
                    display: hasIcon ? undefined : 'flex',
                    alignItems: hasIcon ? undefined : 'center',
                    justifyContent: hasIcon ? undefined : 'center',
                    height: hasIcon ? undefined : '100%',
                  }}>
                    {!isPIR && text && (
                      <div
                        style={{
                          fontSize: textLayout?.fontSize || panelDesign.fontSize || '12px',
                          color: getAutoTextColor(panelDesign.backgroundColor),
                          wordBreak: 'break-word',
                          maxWidth: '100%',
                          textAlign: 'center',
                          padding: textLayout?.padding || '4px',
                          borderRadius: '4px',
                          fontFamily: panelDesign.fonts || undefined,
                        }}
                      >
                        {text}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Bottom 3x3 grid (positions 9-17) */}
          <div
            style={{
              width: '100%',
              height: '50%',
              display: 'flex',
              flexWrap: 'wrap',
              gap: gridLayout?.gap || '5px',
              padding: gridLayout?.padding || '10px',
            }}
          >
            {Array.from({ length: 9 }).map((_, index) => {
              const actualIndex = index + 9; // Positions 9-17
              const icon = icons.find((i) => i.position === actualIndex);
              const isPIR = icon?.category === 'PIR';
              const text = (iconTexts && iconTexts[actualIndex]) || icon?.text;
              const hasIcon = icon && icon.src;
              const iconSize = getIconSize(icon);
              return (
                <div
                  key={actualIndex}
                  style={{
                    width: `calc(${100 / 3}% - ${gridLayout?.gap || '5px'})`,
                    height: `calc(${100 / 3}% - ${gridLayout?.gap || '5px'})`,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: hasIcon ? 'flex-start' : 'center',
                    position: 'relative',
                    paddingTop: hasIcon ? '10px' : 0,
                  }}
                >
                  {hasIcon && (
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                      <img
                        src={icon.src}
                        alt={icon.label}
                        style={{
                          width: iconSize,
                          height: iconSize,
                          objectFit: 'contain',
                          marginBottom: iconLayout?.spacing || '5px',
                          position: 'relative',
                          zIndex: 1,
                          marginTop: isPIR ? (specialLayouts?.PIR?.marginTop || '20px') : '0',
                          filter: !isPIR && icon?.category !== 'Sockets' ? computedIconFilter : undefined,
                          transition: 'filter 0.2s',
                        }}
                      />
                    </div>
                  )}
                  <div style={{
                    position: hasIcon ? (textLayout?.position || 'absolute') : 'static',
                    bottom: hasIcon ? (textLayout?.bottom || '13px') : undefined,
                    left: hasIcon ? '50%' : undefined,
                    transform: hasIcon ? 'translateX(-50%)' : undefined,
                    width: '90%',
                    zIndex: 0,
                    display: hasIcon ? undefined : 'flex',
                    alignItems: hasIcon ? undefined : 'center',
                    justifyContent: hasIcon ? undefined : 'center',
                    height: hasIcon ? undefined : '100%',
                  }}>
                    {!isPIR && text && (
                      <div
                        style={{
                          fontSize: textLayout?.fontSize || panelDesign.fontSize || '12px',
                          color: getAutoTextColor(panelDesign.backgroundColor),
                          wordBreak: 'break-word',
                          maxWidth: '100%',
                          textAlign: 'center',
                          padding: textLayout?.padding || '4px',
                          borderRadius: '4px',
                          fontFamily: panelDesign.fonts || undefined,
                        }}
                      >
                        {text}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
                 </div>
       );
      return (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'row',
            gap: 0,
            position: 'relative',
            zIndex: 2,
          }}
        >
          {/* Left 3x3 grid (positions 0-8) */}
          <div
            style={{
              width: '50%',
              height: '100%',
              display: 'flex',
              flexWrap: 'wrap',
              gap: gridLayout?.gap || '5px',
              padding: gridLayout?.padding || '10px',
            }}
          >
            {Array.from({ length: 9 }).map((_, index) => {
              const icon = icons.find((i) => i.position === index);
              const isPIR = icon?.category === 'PIR';
              const text = (iconTexts && iconTexts[index]) || icon?.text;
              const hasIcon = icon && icon.src;
              const iconSize = getIconSize(icon);
              return (
                <div
                  key={index}
                  style={{
                    width: `calc(${100 / 3}% - ${gridLayout?.gap || '5px'})`,
                    height: `calc(${100 / 3}% - ${gridLayout?.gap || '5px'})`,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: hasIcon ? 'flex-start' : 'center',
                    position: 'relative',
                    paddingTop: hasIcon ? '10px' : 0,
                  }}
                >
                  {hasIcon && (
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                      <img
                        src={icon.src}
                        alt={icon.label}
                        style={{
                          width: iconSize,
                          height: iconSize,
                          objectFit: 'contain',
                          marginBottom: iconLayout?.spacing || '5px',
                          position: 'relative',
                          zIndex: 1,
                          marginTop: isPIR ? (specialLayouts?.PIR?.marginTop || '20px') : '0',
                          filter: !isPIR && icon?.category !== 'Sockets' ? computedIconFilter : undefined,
                          transition: 'filter 0.2s',
                        }}
                      />
                    </div>
                  )}
                  <div style={{
                    position: hasIcon ? (textLayout?.position || 'absolute') : 'static',
                    bottom: hasIcon ? (textLayout?.bottom || '13px') : undefined,
                    left: hasIcon ? '50%' : undefined,
                    transform: hasIcon ? 'translateX(-50%)' : undefined,
                    width: '90%',
                    zIndex: 0,
                    display: hasIcon ? undefined : 'flex',
                    alignItems: hasIcon ? undefined : 'center',
                    justifyContent: hasIcon ? undefined : 'center',
                    height: hasIcon ? undefined : '100%',
                  }}>
                    {!isPIR && text && (
                      <div
                        style={{
                          fontSize: textLayout?.fontSize || panelDesign.fontSize || '12px',
                          color: getAutoTextColor(panelDesign.backgroundColor),
                          wordBreak: 'break-word',
                          maxWidth: '100%',
                          textAlign: 'center',
                          padding: textLayout?.padding || '4px',
                          borderRadius: '4px',
                          fontFamily: panelDesign.fonts || undefined,
                        }}
                      >
                        {text}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Right 3x3 grid (positions 9-17) */}
          <div
            style={{
              width: '50%',
              height: '100%',
              display: 'flex',
              flexWrap: 'wrap',
              gap: gridLayout?.gap || '5px',
              padding: gridLayout?.padding || '10px',
            }}
          >
            {Array.from({ length: 9 }).map((_, index) => {
              const actualIndex = index + 9; // Positions 9-17
              const icon = icons.find((i) => i.position === actualIndex);
              const isPIR = icon?.category === 'PIR';
              const text = (iconTexts && iconTexts[actualIndex]) || icon?.text;
              const hasIcon = icon && icon.src;
              const iconSize = getIconSize(icon);
              return (
                <div
                  key={actualIndex}
                  style={{
                    width: `calc(${100 / 3}% - ${gridLayout?.gap || '5px'})`,
                    height: `calc(${100 / 3}% - ${gridLayout?.gap || '5px'})`,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: hasIcon ? 'flex-start' : 'center',
                    position: 'relative',
                    paddingTop: hasIcon ? '10px' : 0,
                  }}
                >
                  {hasIcon && (
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                      <img
                        src={icon.src}
                        alt={icon.label}
                        style={{
                          width: iconSize,
                          height: iconSize,
                          objectFit: 'contain',
                          marginBottom: iconLayout?.spacing || '5px',
                          position: 'relative',
                          zIndex: 1,
                          marginTop: isPIR ? (specialLayouts?.PIR?.marginTop || '20px') : '0',
                          filter: !isPIR && icon?.category !== 'Sockets' ? computedIconFilter : undefined,
                          transition: 'filter 0.2s',
                        }}
                      />
                    </div>
                  )}
                  <div style={{
                    position: hasIcon ? (textLayout?.position || 'absolute') : 'static',
                    bottom: hasIcon ? (textLayout?.bottom || '13px') : undefined,
                    left: hasIcon ? '50%' : undefined,
                    transform: hasIcon ? 'translateX(-50%)' : undefined,
                    width: '90%',
                    zIndex: 0,
                    display: hasIcon ? undefined : 'flex',
                    alignItems: hasIcon ? undefined : 'center',
                    justifyContent: hasIcon ? undefined : 'center',
                    height: hasIcon ? undefined : '100%',
                  }}>
                    {!isPIR && text && (
                      <div
                        style={{
                          fontSize: textLayout?.fontSize || panelDesign.fontSize || '12px',
                          color: getAutoTextColor(panelDesign.backgroundColor),
                          wordBreak: 'break-word',
                          maxWidth: '100%',
                          textAlign: 'center',
                          padding: textLayout?.padding || '4px',
                          borderRadius: '4px',
                          fontFamily: panelDesign.fonts || undefined,
                        }}
                      >
                        {text}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    // Default grid rendering for other panels
    return (
      <div
        style={{
          width: bigIconLayout ? (isVerticalPanel ? '100%' : `calc(100% - ${bigIconLayout.width})`) : '100%',
          height: bigIconLayout ? (isVerticalPanel ? `calc(100% - ${bigIconLayout.height})` : '100%') : '100%',
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: gridLayout?.gap || '5px',
          position: 'relative', 
          zIndex: 2,
          transform: gridLayout?.transform || undefined,
          padding: gridLayout?.padding || '10px',
        }}
      >
        {Array.from({ length: getGridCellCount() }).map((_, index) => {
          const icon = icons.find((i) => i.position === index);
            const isPIR = icon?.category === 'PIR';
          const text = (iconTexts && iconTexts[index]) || icon?.text;
            const hasIcon = icon && icon.src;
          const iconSize = getIconSize(icon);
            return (
              <div
              key={index}
                style={{
                width: `calc(${100 / 3}% - ${gridLayout?.gap || '5px'})`,
                height: `calc(${100 / 3}% - ${gridLayout?.gap || '5px'})`,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: hasIcon ? 'flex-start' : 'center',
                  position: 'relative',
                  paddingTop: hasIcon ? '10px' : 0,
                }}
              >
                {hasIcon && (
                  <div style={{ position: 'relative', display: 'inline-block' }}>
                    <img
                      src={icon.src}
                      alt={icon.label}
                      style={{
                      width: iconSize,
                      height: iconSize,
                        objectFit: 'contain',
                      marginBottom: iconLayout?.spacing || '5px',
                        position: 'relative',
                        zIndex: 1,
                      marginTop: isPIR ? (specialLayouts?.PIR?.marginTop || '20px') : '0',
                        filter: !isPIR && icon?.category !== 'Sockets' ? computedIconFilter : undefined,
                        transition: 'filter 0.2s',
                      }}
                    />
                  </div>
                )}
                <div style={{
                position: hasIcon ? (textLayout?.position || 'absolute') : 'static',
                bottom: hasIcon ? (textLayout?.bottom || '13px') : undefined,
                  left: hasIcon ? '50%' : undefined,
                  transform: hasIcon ? 'translateX(-50%)' : undefined,
                  width: '90%',
                  zIndex: 0,
                  display: hasIcon ? undefined : 'flex',
                  alignItems: hasIcon ? undefined : 'center',
                  justifyContent: hasIcon ? undefined : 'center',
                  height: hasIcon ? undefined : '100%',
                }}>
                  {!isPIR && text && (
                    <div
                      style={{
                      fontSize: textLayout?.fontSize || panelDesign.fontSize || '12px',
                        color: getAutoTextColor(panelDesign.backgroundColor),
                        wordBreak: 'break-word',
                        maxWidth: '100%',
                        textAlign: 'center',
                      padding: textLayout?.padding || '4px',
                        borderRadius: '4px',
                        fontFamily: panelDesign.fonts || undefined,
                      }}
                    >
                      {text}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      );
  };

  // Base panel container style
  const basePanelStyle: React.CSSProperties = {
            background: `linear-gradient(135deg, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.1) 50%, rgba(255, 255, 255, 0.05) 100%), ${hexToRgba(panelDesign.backgroundColor, 0.9)}`,
            padding: '0',
            border: '2px solid rgba(255, 255, 255, 0.2)',
            borderTop: '3px solid rgba(255, 255, 255, 0.4)',
            borderLeft: '3px solid rgba(255, 255, 255, 0.3)',
            boxShadow: `0 20px 40px rgba(0, 0, 0, 0.3), 0 8px 16px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.4), inset 0 -1px 0 rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.1)`,
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            transition: 'all 0.3s ease',
            position: 'relative',
            margin: '0 auto',
            fontFamily: panelDesign.fonts || undefined,
  };

  // Inner glow effect
  const innerGlowStyle: React.CSSProperties = {
              position: 'absolute',
              top: '2px',
              left: '2px',
              right: '2px',
              bottom: '2px',
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, transparent 50%, rgba(0, 0, 0, 0.05) 100%)',
              pointerEvents: 'none',
              zIndex: 1,
  };

  // Render different panel layouts based on type
    if (isSP || isTAG) {
    // SP and TAG Panels - Use customizer rendering if props are provided, otherwise use standard rendering
    const useCustomizerRendering = activeDimension && activeIconPositions;
    
    if (useCustomizerRendering) {
      // Use customizer-specific rendering (copied from SPCustomizer)
      return (
        <div
          style={{
            position: 'relative',
            width: activeDimension.width || dimensions.width,
            height: activeDimension.height || dimensions.height,
            background: `linear-gradient(135deg, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.1) 50%, rgba(255, 255, 255, 0.05) 100%), ${hexToRgba(panelDesign.backgroundColor, 0.9)}`,
            padding: '0',
            border: '2px solid rgba(255, 255, 255, 0.2)',
            borderTop: '3px solid rgba(255, 255, 255, 0.4)',
            borderLeft: '3px solid rgba(255, 255, 255, 0.3)',
            boxShadow: `0 20px 40px rgba(0, 0, 0, 0.3), 0 8px 16px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.4), inset 0 -1px 0 rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.1)`,
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            transition: 'all 0.3s ease',
            margin: 0,
            fontFamily: panelDesign.fonts || undefined,
          }}
        >
          
          <div style={{ 
            position: 'absolute',
            top: '2px',
            left: '2px',
            right: '2px',
            bottom: '2px',
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, transparent 50%, rgba(0, 0, 0, 0.05) 100%)',
            pointerEvents: 'none',
            zIndex: 1,
          }} />
          <div style={{ position: 'relative', zIndex: 2, width: '100%', height: '100%', transform: `translate(${calculatedGridOffsetX}px, ${calculatedGridOffsetY}px)` }}>
            {Array.from({ length: 9 }).map((_, index) => renderAbsoluteCell(index))}
          </div>
        </div>
      );
    } else {
      // Use customizer-style rendering for standard mode (ProjPanels) to match customizer appearance
      return (
        <div
          style={{
            position: 'relative',
            width: dimensions.width,
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
          }}
        >
          {/* Inner glow effect */}
          <div style={{ 
            position: 'absolute',
            top: '2px',
            left: '2px',
            right: '2px',
            bottom: '2px',
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, transparent 50%, rgba(0, 0, 0, 0.05) 100%)',
            pointerEvents: 'none',
            zIndex: 1,
          }} />
          
          <div style={{ 
            position: 'relative', 
            zIndex: 2, 
            width: '100%', 
            height: '100%', 
            transform: `translate(${calculatedGridOffsetX}px, ${calculatedGridOffsetY}px)` 
          }}>
            {/* X2V TAG layout DISPLAY image - render separately like in customizer */}
            {isX2V && (panelDesign.useTagLayout || (panelDesign as any).useTagLayout) && (() => {
              console.log('X2V TAG layout rendering:', { isX2V, useTagLayout: panelDesign.useTagLayout, swapUpDown: panelDesign.swapUpDown });
              return true;
            })() && (
              <img
                src={DISPLAY}
                alt="DISPLAY"
                style={{
                  position: 'absolute',
                  // Follow grid swap: move with grid when up button pressed
                  top: panelDesign.swapUpDown ? '630px' : '80px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '220px',
                  height: '50px',
                  objectFit: 'contain',
                  filter: computedIconFilter,
                  pointerEvents: 'none',
                  zIndex: 10,
                }}
              />
            )}
            {(isTAG ? Array.from({ length: 9 }) : (dimensionIconPositions || iconPositions || [])).map((_, index) => {
              let pos = (dimensionIconPositions || iconPositions || [])[index];
              
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
              // X2V panels with TAG layout also have DISPLAY icon in position 0 (top-left)
              if (isX2V && panelDesign.useTagLayout && index === 0) {
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
              const adjustedFontSize = text ? calculateFontSize(text, parseInt(dimensions.width) / 6, baseFontSize) : baseFontSize;
              
              // Keep SP/TAG absolute positions consistent across dimensions (no per-row offsets)
              let adjustedPos = pos;
              if (isSP || isTAG) {
                const baseTop = parseInt((pos as any).top || '0', 10);
                const adjustedTop = `${baseTop}px`;
                adjustedPos = { ...pos, top: adjustedTop };
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
                  {!isPIR && text && (
                    <div
                      style={{
                        fontSize: adjustedFontSize,
                        color: getAutoTextColor(panelDesign.backgroundColor),
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
        </div>
      );
    }
  }

  if (isIDPG) {
    // IDPG Corridor Panel - Complex layout with 8 possible combinations
    const idpgConfig = panelDesign.idpgConfig;
    
    if (!idpgConfig) {
      // Fallback if no config - show basic panel
      return (
        <div
          style={{
            ...basePanelStyle,
            width: "350px",
            height: "350px",
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div style={innerGlowStyle} />
          <div style={{
            color: getAutoTextColor(panelDesign.backgroundColor),
            fontSize: panelDesign.fontSize,
            fontFamily: panelDesign.fonts || undefined,
            fontWeight: "500",
          }}>
            IDPG Panel
          </div>
        </div>
      );
    }

    const { cardReader, roomNumber, statusMode, selectedIcon1, roomNumberText } = idpgConfig;
    const rightIcon = 'G3'; // Always use G3 for right icon

    // Calculate panel height based on configuration (same as customizer)
    let panelHeight = "350px"; // Default
    if (!cardReader && !roomNumber) panelHeight = "350px"; // Basic template
    else if (!cardReader && roomNumber) panelHeight = "470px"; // Room Number only
    else if (cardReader && !roomNumber) panelHeight = "500px"; // Card Reader only
    else if (cardReader && roomNumber) panelHeight = "600px"; // Card Reader + Room Number

    // Render the appropriate layout based on configuration
    const renderIDPGLayout = () => {
      // No card reader and no room number - Square template with status
      if (!cardReader && !roomNumber) {
        if (statusMode === 'icons') {
          return (
            <div style={{
              display: "flex",
              flexDirection: "column",
              width: "100%",
              height: "100%",
              padding: "15px",
            }}>
              {/* Two icon fields */}
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                height: "60px",
                margin: "10px 0",
                gap: "20px",
              }}>
                {/* Left icon */}
                <div style={{
                  flex: "1",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "rgba(255, 255, 255, 0.05)",
                  borderRadius: "8px",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  height: "100%",
                }}>
                  <img 
                    src={guestServicesIcons[selectedIcon1 as keyof typeof guestServicesIcons]} 
                    alt="Icon 1" 
                    style={{
                      width: panelDesign.iconSize,
                      height: panelDesign.iconSize,
                      filter: getIconColorFilter(panelDesign.backgroundColor),
                    }}
                  />
                </div>
                {/* Right icon */}
                <div style={{
                  flex: "1",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "rgba(255, 255, 255, 0.05)",
                  borderRadius: "8px",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  height: "100%",
                }}>
                  <img 
                    src={guestServicesIcons[rightIcon]} 
                    alt="Icon 2" 
                    style={{
                      width: panelDesign.iconSize,
                      height: panelDesign.iconSize,
                      filter: getIconColorFilter(panelDesign.backgroundColor),
                    }}
                  />
                </div>
              </div>

              {/* G18 icon in bottom center */}
              <div style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                marginTop: "auto",
                paddingBottom: "10px",
              }}>
                <img 
                  src={g18Icon} 
                  alt="G18 Icon" 
                  style={{
                    width: panelDesign.iconSize,
                    height: panelDesign.iconSize,
                    filter: getIconColorFilter(panelDesign.backgroundColor),
                  }}
                />
              </div>
            </div>
          );
        } else {
          // Status bar mode
          return (
            <div style={{
              display: "flex",
              flexDirection: "column",
              width: "100%",
              height: "100%",
              padding: "15px",
            }}>
              {/* Middle bar */}
              <div style={{
                width: "20%",
                height: "2px",
                background: `${getIconColorFilter(panelDesign.backgroundColor) === 'brightness(0) saturate(100%) invert(1)' ? '#FFFFFF' : '#808080'}`,
                borderRadius: "1px",
                margin: "auto",
                marginTop: "calc(50% - 98px)",
                transform: "translateY(-50%)",
              }} />
              {/* G18 icon in bottom center */}
              <div style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                marginTop: "auto",
                paddingBottom: "10px",
                marginBottom: "100px",
              }}>
                <img 
                  src={g18Icon} 
                  alt="G18 Icon" 
                  style={{
                    width: `calc(${panelDesign.iconSize} * 0.9775)`, // 15% smaller (1.15 * 0.85 = 0.9775)
                    height: `calc(${panelDesign.iconSize} * 0.9775)`, // 15% smaller (1.15 * 0.85 = 0.9775)
                    objectFit: "contain",
                    filter: getIconColorFilter(panelDesign.backgroundColor),
                  }}
                />
              </div>
            </div>
          );
        }
      }

      // Room number only - Rectangle vertical template
      if (!cardReader && roomNumber) {
        return (
          <div style={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            height: "100%",
            padding: "15px",
          }}>
            {/* Room number at top */}
            <div style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              padding: "10px",
            marginBottom: "10px",
            marginTop: "-18px",
            }}>
              <div style={{
                color: getAutoTextColor(panelDesign.backgroundColor),
                fontSize: "97.92px", // 20% bigger (81.6px * 1.2 = 97.92px)
                fontWeight: 'bold',
                fontFamily: panelDesign.fonts || undefined,
                textAlign: 'center',
              }}>
                {roomNumberText || "0000"}
              </div>
            </div>
            
            {statusMode === 'icons' ? (
              /* Two icon fields replacing the bar */
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                height: "60px",
                margin: "10px 0",
                gap: "20px",
              }}>
                {/* Left icon */}
                <div style={{
                  flex: "1",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "rgba(255, 255, 255, 0.05)",
                  borderRadius: "8px",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  height: "100%",
                }}>
                  <img 
                    src={guestServicesIcons[selectedIcon1 as keyof typeof guestServicesIcons]} 
                    alt="Icon 1" 
                    style={{
                      width: panelDesign.iconSize,
                      height: panelDesign.iconSize,
                      filter: getIconColorFilter(panelDesign.backgroundColor),
                    }}
                  />
                </div>
                {/* Right icon */}
                <div style={{
                  flex: "1",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "rgba(255, 255, 255, 0.05)",
                  borderRadius: "8px",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  height: "100%",
                }}>
                  <img 
                    src={guestServicesIcons[rightIcon]} 
                    alt="Icon 2" 
                    style={{
                      width: panelDesign.iconSize,
                      height: panelDesign.iconSize,
                      filter: getIconColorFilter(panelDesign.backgroundColor),
                    }}
                  />
                </div>
              </div>
            ) : (
              /* Status bar */
              <div style={{
                width: "15%", // Reduced from 20% to 15% (5px shorter)
                height: "2px",
                background: `${getIconColorFilter(panelDesign.backgroundColor) === 'brightness(0) saturate(100%) invert(1)' ? '#FFFFFF' : '#808080'}`,
                borderRadius: "1px",
                margin: "10px auto",
                marginTop: "54px", // Brought up by 26px (80px - 26px = 54px)
              }} />
            )}
            
            {/* G18 icon in bottom center */}
            <div style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              marginTop: "auto",
              paddingBottom: "10px",
              marginBottom: "50px", // Brought up by 20px (30px + 20px = 50px)
            }}>
              <img 
                src={g18Icon} 
                alt="G18 Icon" 
                style={{
                  width: `calc(${panelDesign.iconSize} * 0.9775)`, // 15% smaller (1.15 * 0.85 = 0.9775)
                  height: `calc(${panelDesign.iconSize} * 0.9775)`, // 15% smaller (1.15 * 0.85 = 0.9775)
                  objectFit: "contain",
                  filter: getIconColorFilter(panelDesign.backgroundColor),
                }}
              />
            </div>
          </div>
        );
      }

      // Card Reader only - Rectangle vertical template
      if (cardReader && !roomNumber) {
        return (
          <div style={{
            position: "relative",
            width: "100%",
            height: "100%",
            padding: "15px",
            // CSS custom properties for flexible positioning
            '--status-top': '25px',
            '--status-width': '15%',
            '--bell-top': 'calc(50% - 120px)',
            '--bell-size': '0.87975',
            '--cr-bottom': '60px',
            '--cr-size': '1.8975',
          } as React.CSSProperties}>
            {statusMode === 'icons' ? (
              /* Two icon fields at top */
              <div style={{
                position: "absolute",
                top: "var(--status-top)",
                left: "50%",
                transform: "translateX(-50%)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                height: "60px",
                width: "calc(100% - 30px)",
                gap: "20px",
              }}>
                {/* Left icon */}
                <div style={{
                  flex: "1",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "rgba(255, 255, 255, 0.05)",
                  borderRadius: "8px",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  height: "100%",
                }}>
                  <img 
                    src={guestServicesIcons[selectedIcon1 as keyof typeof guestServicesIcons]} 
                    alt="Icon 1" 
                    style={{
                      width: panelDesign.iconSize,
                      height: panelDesign.iconSize,
                      filter: getIconColorFilter(panelDesign.backgroundColor),
                    }}
                  />
                </div>
                {/* Right icon */}
                <div style={{
                  flex: "1",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "rgba(255, 255, 255, 0.05)",
                  borderRadius: "8px",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  height: "100%",
                }}>
                  <img 
                    src={guestServicesIcons[rightIcon]} 
                    alt="Icon 2" 
                    style={{
                      width: panelDesign.iconSize,
                      height: panelDesign.iconSize,
                      filter: getIconColorFilter(panelDesign.backgroundColor),
                    }}
                  />
                </div>
              </div>
            ) : (
              /* Status bar at top */
              <div style={{
                position: "absolute",
                top: "var(--status-top)",
                left: "50%",
                transform: "translateX(-50%)",
                width: "var(--status-width)",
                height: "2px",
                background: `${getIconColorFilter(panelDesign.backgroundColor) === 'brightness(0) saturate(100%) invert(1)' ? '#FFFFFF' : '#808080'}`,
                borderRadius: "1px",
              }} />
            )}
            
            {/* G18 icon in center */}
            <div style={{
              position: "absolute",
              top: "var(--bell-top)",
              left: "50%",
              transform: "translate(-50%, -50%)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}>
              <img 
                src={g18Icon} 
                alt="G18 Icon" 
                style={{
                  width: `calc(${panelDesign.iconSize} * var(--bell-size))`,
                  height: `calc(${panelDesign.iconSize} * var(--bell-size))`,
                  objectFit: "contain",
                  filter: getIconColorFilter(panelDesign.backgroundColor),
                }}
              />
            </div>
            
            {/* CR icon in bottom center */}
            <div style={{
              position: "absolute",
              bottom: "var(--cr-bottom)",
              left: "50%",
              transform: "translateX(-50%)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}>
              <img 
                src={crIcon} 
                alt="CR Icon" 
                style={{
                  width: `calc(${panelDesign.iconSize} * var(--cr-size))`,
                  height: `calc(${panelDesign.iconSize} * var(--cr-size))`,
                  objectFit: "contain",
                  filter: getIconColorFilter(panelDesign.backgroundColor),
                }}
              />
            </div>
          </div>
        );
      }

      // Card Reader & Room Number - Rectangle vertical template
      if (cardReader && roomNumber) {
        return (
          <div style={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            height: "100%",
            padding: "15px",
          }}>
            {/* Room number at top */}
            <div style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              padding: "10px",
              marginBottom: "10px",
            }}>
              <div style={{
                color: getAutoTextColor(panelDesign.backgroundColor),
                fontSize: "81.6px",
                fontWeight: 'bold',
                fontFamily: panelDesign.fonts || undefined,
                textAlign: 'center',
              }}>
                {roomNumberText || "0000"}
              </div>
            </div>
            
            {statusMode === 'icons' ? (
              /* Two icon fields replacing the bar */
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                height: "60px",
                margin: "10px 0",
                gap: "20px",
              }}>
                {/* Left icon */}
                <div style={{
                  flex: "1",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "rgba(255, 255, 255, 0.05)",
                  borderRadius: "8px",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  height: "100%",
                }}>
                  <img 
                    src={guestServicesIcons[selectedIcon1 as keyof typeof guestServicesIcons]} 
                    alt="Icon 1" 
                    style={{
                      width: panelDesign.iconSize,
                      height: panelDesign.iconSize,
                      filter: getIconColorFilter(panelDesign.backgroundColor),
                    }}
                  />
                </div>
                {/* Right icon */}
                <div style={{
                  flex: "1",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "rgba(255, 255, 255, 0.05)",
                  borderRadius: "8px",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  height: "100%",
                }}>
                  <img 
                    src={guestServicesIcons[rightIcon]} 
                    alt="Icon 2" 
                    style={{
                      width: panelDesign.iconSize,
                      height: panelDesign.iconSize,
                      filter: getIconColorFilter(panelDesign.backgroundColor),
                    }}
                  />
                </div>
              </div>
            ) : (
            /* Status bar right below the number */
            <div style={{
              width: "calc(20% - 8px)",
              height: "2px",
              background: `${getIconColorFilter(panelDesign.backgroundColor) === 'brightness(0) saturate(100%) invert(1)' ? '#FFFFFF' : '#808080'}`,
              borderRadius: "1px",
              margin: "43.5px auto 10px",
            }} />
            )}
            
            {/* G18 icon in center */}
            <div style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flex: "1",
              marginBottom: "112px",
            }}>
              <img 
                src={g18Icon} 
                alt="G18 Icon" 
                style={{
                width: `calc(${panelDesign.iconSize} * 0.805)`,
                height: `calc(${panelDesign.iconSize} * 0.805)`,
                  objectFit: "contain",
                  filter: getIconColorFilter(panelDesign.backgroundColor),
                }}
              />
            </div>
            {/* CR icon in bottom center */}
            <div style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              paddingBottom: "25px",
            }}>
              <img 
                src={crIcon} 
                alt="CR Icon" 
                style={{
                  width: `calc(${panelDesign.iconSize} * 1.656)`,
                  height: `calc(${panelDesign.iconSize} * 1.656)`,
                  objectFit: "contain",
                  filter: getIconColorFilter(panelDesign.backgroundColor),
                }}
              />
            </div>
          </div>
        );
      }

      // Default fallback
      return (
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          color: getAutoTextColor(panelDesign.backgroundColor),
          fontSize: panelDesign.fontSize,
          fontFamily: panelDesign.fonts || undefined,
          fontWeight: "500",
        }}>
          IDPG Panel
        </div>
      );
    };

    return (
      <div
        style={{
          width: "295px",
          height: panelHeight,
          background: `linear-gradient(135deg, 
            rgba(255, 255, 255, 0.3) 0%, 
            rgba(255, 255, 255, 0.1) 50%, 
            rgba(255, 255, 255, 0.05) 100%), 
            ${hexToRgba(panelDesign.backgroundColor, 0.9)}`,
          padding: "15px",
          border: "2px solid rgba(255, 255, 255, 0.2)",
          borderTop: "3px solid rgba(255, 255, 255, 0.4)",
          borderLeft: "3px solid rgba(255, 255, 255, 0.3)",
          boxShadow: `
            0 20px 40px rgba(0, 0, 0, 0.3),
            0 8px 16px rgba(0, 0, 0, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.4),
            inset 0 -1px 0 rgba(0, 0, 0, 0.1),
            0 0 0 1px rgba(255, 255, 255, 0.1)
          `,
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          transition: "all 0.3s ease",
          position: "relative",
          transformStyle: "preserve-3d",
          margin: "0 auto",
          fontFamily: panelDesign.fonts || undefined,
        }}
      >
        {/* Inner glow effect */}
        <div
          style={{
            position: "absolute",
            top: "2px",
            left: "2px",
            right: "2px",
            bottom: "2px",
            background: `linear-gradient(135deg, 
              rgba(255, 255, 255, 0.1) 0%, 
              transparent 50%, 
              rgba(0, 0, 0, 0.05) 100%)`,
            pointerEvents: "none",
            zIndex: 1,
          }}
        />
        {/* Dynamic Panel Template */}
        <div style={{ 
          display: "flex", 
          flexWrap: "wrap",
          position: "relative",
          zIndex: 2,
          width: "100%",
          height: "100%",
          padding: "10px",
        }}>
          {renderIDPGLayout()}
        </div>
      </div>
    );
  }

  if (isDoublePanel || isExtendedPanel) {
    // Double and Extended Panels - Grid + Big Icon layout
    const isReversed = panelDesign.isLayoutReversed;
    
            return (
      <div
        style={{
          ...basePanelStyle,
          width: dimensions.width,
          height: dimensions.height,
            display: 'flex',
          flexDirection: isVerticalPanel ? 'column' : 'row',
                  alignItems: 'center',
          justifyContent: 'center',
          gap: 0,
        }}
      >
        <div style={innerGlowStyle} />
        
        {isReversed ? (
          // Reversed layout: Big icon first, then grid
          <>
            {getBigIconContainer(true)}
            {renderGrid()}
          </>
        ) : (
          // Default layout: Grid first, then big icon
          <>
            {renderGrid()}
            {getBigIconContainer(false)}
          </>
        )}
        
        {/*replace_all Proximity indicators overlay */}
        {(panelDesign.features?.Proximity || panelDesign.Proximity) && (() => {
          const positioning = getProximityPositioning(type, dimensions);
          return (
            <>
              <div
                style={{
                  position: 'absolute',
                  bottom: positioning.bottom,
                  right: positioning.right1,
                  width: positioning.size1,
                  height: positioning.size1,
                  borderRadius: '50%',
                  backgroundColor: '#ff9800',
                  filter: getIconColorFilter(panelDesign.backgroundColor),
                  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
                  zIndex: 10
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  bottom: positioning.bottom,
                  right: positioning.right2,
                  width: positioning.size2,
                  height: positioning.size2,
                  borderRadius: '50%',
                  backgroundColor: '#ff9800',
                  filter: getIconColorFilter(panelDesign.backgroundColor),
                  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
                  zIndex: 10
                }}
              />
            </>
          );
        })()}
      </div>
    );
  }

  // Default fallback for unknown panel types
            return (
              <div
                style={{
        ...basePanelStyle,
        width: dimensions.width,
        height: dimensions.height,
                  display: 'flex',
                  alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div style={innerGlowStyle} />
      {renderGrid()}
      
      {/* Proximity indicators overlay */}
      {(panelDesign.features?.Proximity || panelDesign.Proximity) && (() => {
        const positioning = getProximityPositioning(type, dimensions);
        return (
          <>
            <div
              style={{
                position: 'absolute',
                bottom: positioning.bottom,
                right: positioning.right1,
                width: positioning.size1,
                height: positioning.size1,
                borderRadius: '50%',
                backgroundColor: '#ff9800',
                filter: getIconColorFilter(panelDesign.backgroundColor),
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
                zIndex: 10
              }}
            />
            <div
              style={{
                position: 'absolute',
                bottom: positioning.bottom,
                right: positioning.right2,
                width: positioning.size2,
                height: positioning.size2,
                borderRadius: '50%',
                backgroundColor: '#ff9800',
                filter: getIconColorFilter(panelDesign.backgroundColor),
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
                zIndex: 10
              }}
            />
          </>
        );
      })()}
    </div>
  );
};

export default PanelPreview; 