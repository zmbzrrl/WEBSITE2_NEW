import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
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
    right1 = '52px'; // 54px -> 52px (another 2px to the right)
    right2 = '33px'; // 35px -> 33px (another 2px to the right)
    bottom = '8px';  // 11px -> 8px (3px down)
    size1 = '7.27px'; // 7.65px reduced by ~5%
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
  const location = useLocation();
  const isProjPanelsPage = location.pathname === '/proj-panels' || location.pathname.startsWith('/proj-panels') || location.pathname === '/print-preview' || location.pathname.startsWith('/print-preview');
  const isPrintPreviewPage = location.pathname === '/print-preview' || location.pathname.startsWith('/print-preview');
  if (type === 'X1H') {
    console.log('🔍 PanelPreview X1H - pathname:', location.pathname, 'isProjPanelsPage:', isProjPanelsPage, 'type:', type);
  }
  
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
    const baseLeft = parseInt((pos as any).left || '0', 10);
    const rowIndex = Math.floor(index / 3);
    // Apply TAG-specific first-row offset in preview
    let adjustedTopPx = baseTop;
    if (type === 'TAG' && rowIndex === 0) {
      adjustedTopPx += 25;
    }
    const adjustedTop = `${adjustedTopPx}px`;
    
    const adjustedLeftStr = `${baseLeft}px`;
    
    return (
      <div
        key={index}
        style={{
          position: 'absolute',
          ...pos,
          width: (pos as any).width || iconSize,
          height: (pos as any).height || iconSize,
          top: adjustedTop,
          left: adjustedLeftStr,
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
      // For wide TAG panels, reduce width by 35px (130mm → 444px instead of 479px)
      const px = Math.round(mm * (350 / 95)); // 95mm = 350px (wider than 320px)
      // Apply 35px reduction for wide TAG panels (130mm)
      const adjustedPx = mm === 130 ? px - 24.5 : px; // Back to original -24.5px
      if (mm === 130) {
        console.log('🔍 Converting 130mm to px:', { original: px, adjusted: adjustedPx, reduction: px - adjustedPx });
      }
      return `${adjustedPx}px`;
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
  
  // Debug: Log bigIconLayout for X1H
  if (isX1H) {
    console.log('🔍 X1H bigIconLayout check:', { 
      bigIconLayout, 
      hasBigIconLayout: !!bigIconLayout, 
      size: bigIconLayout?.size
    });
  }
  
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
  
  // For TAG panels without tagConfig, use wide dimensions
  if (isTAG && !panelDesign.tagConfig) {
    console.log('🔍 TAG panel without tagConfig - using wide dimensions');
    dimensions = {
      width: convertMmToPx('130mm'), // wide TAG
      height: convertMmToPx('95mm')
    };
    console.log('🔍 TAG dimensions set to:', dimensions);
  }
  
  // Debug: log final dimensions for TAG panels
  if (isTAG) {
    console.log('🔍 Final TAG dimensions:', dimensions);
    console.log('🔍 TAG panelDesign.tagConfig:', panelDesign.tagConfig);
  }
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
  
  // Special handling for DPH panels on ProjPanels page - reduce height by 20px and increase width by 5px
  if (isDPH && isProjPanelsPage) {
    const currentHeight = typeof dimensions.height === 'string' ? parseInt(dimensions.height.replace('px', '')) : dimensions.height;
    dimensions.height = `${currentHeight - 20}px`;
    const currentWidth = typeof dimensions.width === 'string' ? parseInt(dimensions.width.replace('px', '')) : dimensions.width;
    dimensions.width = `${currentWidth + 5}px`;
  }
  
  // Calculate grid offsets for SP and TAG panels (use prop values or calculate defaults)
  let calculatedGridOffsetX = gridOffsetX !== undefined ? gridOffsetX : (gridOffsetY !== undefined ? 0 : undefined);
  let calculatedGridOffsetY = gridOffsetY !== undefined ? gridOffsetY : undefined;
  
  // Determine if SP panel is wide by checking dimensions or spConfig
  let isSPWide = false;
  if (isSP) {
    if (panelDesign.spConfig?.dimension === 'wide') {
      isSPWide = true;
    } else if (!panelDesign.spConfig && dimensions.width) {
      // Fallback: check if width indicates wide (130mm or ~491px)
      const widthPx = typeof dimensions.width === 'string' 
        ? parseFloat(dimensions.width.replace('px', '').replace('mm', '')) 
        : dimensions.width;
      if (widthPx > 400) { // Wide panels are 130mm = ~491px, standard are 95mm = ~359px
        isSPWide = true;
      }
    }
  }
  
  console.log('🔍 PanelPreview debug:', {
    type,
    isSP,
    isProjPanelsPage,
    hasSpConfig: !!panelDesign.spConfig,
    spConfigDimension: panelDesign.spConfig?.dimension,
    isSPWide,
    gridOffsetX,
    gridOffsetY,
    calculatedGridOffsetX,
    calculatedGridOffsetY,
    dimensions
  });
  
  // For SP panels, calculate dimensions and grid offsets based on configuration
  if (isSP && panelDesign.spConfig) {
    const { dimension } = panelDesign.spConfig;
    if (config.dimensionConfigs && config.dimensionConfigs[dimension]) {
      dimensions = {
        width: convertMmToPx(config.dimensionConfigs[dimension].width),
        height: convertMmToPx(config.dimensionConfigs[dimension].height)
      };
      // For SP wide in PanelPreview, increase height by 3px
      if (dimension === 'wide' && typeof dimensions.height === 'string') {
        const h = parseInt(dimensions.height.replace('px', ''), 10);
        dimensions.height = `${h + 3}px`;
      }
      // For SP wide on ProjPanels page, reduce width by 8px
      if (dimension === 'wide' && isProjPanelsPage && typeof dimensions.width === 'string') {
        const w = parseInt(dimensions.width.replace('px', ''), 10);
        dimensions.width = `${w - 8}px`;
      }
      // For SP tall on ProjPanels page, reduce width by 20px
      if (dimension === 'tall' && isProjPanelsPage && typeof dimensions.width === 'string') {
        const w = parseInt(dimensions.width.replace('px', ''), 10);
        dimensions.width = `${w - 20}px`;
      }
      // Also update the icon positions for the selected dimension (scaled to match new panel size)
      dimensionIconPositions = config.dimensionConfigs[dimension].iconPositions?.map(scaleIconPosition);
    }
    // Keep base offsets consistent across dimensions; apply requested SP shifts
    if (calculatedGridOffsetX === undefined && calculatedGridOffsetY === undefined) {
      let offsetX = 20;
      let offsetY = 15;
      // For SP wide: shift grid 60px right
      if (dimension === 'wide') {
        offsetX += 60;
        // For ProjPanels page, move columns 10px to the left
        if (isProjPanelsPage) {
          console.log('🔍 SP wide on ProjPanels - adjusting offset from', offsetX, 'to', offsetX - 10);
          offsetX -= 10;
        }
      }
      // For SP tall: shift grid 50px down
      if (dimension === 'tall') offsetY += 50;
      calculatedGridOffsetX = offsetX;
      calculatedGridOffsetY = offsetY;
    }
  } else if (isSP) {
    // SP panel without spConfig - use dimension detection
    if (calculatedGridOffsetX === undefined && calculatedGridOffsetY === undefined) {
      let offsetX = 20;
      let offsetY = 15;
      if (isSPWide) {
        offsetX += 60;
        // For ProjPanels page, move columns 10px to the left
        if (isProjPanelsPage) {
          console.log('🔍 SP wide (detected) on ProjPanels - adjusting offset from', offsetX, 'to', offsetX - 10);
          offsetX -= 10;
        }
      }
      calculatedGridOffsetX = offsetX;
      calculatedGridOffsetY = offsetY;
    } else {
      // If offsets were provided but we're on ProjPanels with wide SP, still adjust
      if (isSPWide && isProjPanelsPage && calculatedGridOffsetX !== undefined) {
        calculatedGridOffsetX = calculatedGridOffsetX - 10;
        console.log('🔍 SP wide on ProjPanels - adjusting provided offset by -10px to', calculatedGridOffsetX);
      }
    }
  }
  
  // Ensure we have default values
  if (calculatedGridOffsetX === undefined) calculatedGridOffsetX = 0;
  if (calculatedGridOffsetY === undefined) calculatedGridOffsetY = 0;
  
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
      // For TAG wide: shift grid 60px right, plus 20px extra; and 7px down
      if (dimension === 'wide') {
        console.log('🔍 TAG wide dimension detected - applying offsets');
        offsetX = 30; // Set to exactly 30px right
        offsetY = 15;  // Keep original Y
        console.log('🔍 TAG wide offsets applied:', { offsetX, offsetY });
      }
      // For TAG tall: shift grid 50px down
      if (dimension === 'tall') offsetY += 50;
      calculatedGridOffsetX = offsetX;
      calculatedGridOffsetY = offsetY;
    }
  } else if (isTAG && !gridOffsetX && !gridOffsetY) {
    // Default TAG grid offsets when no config is provided - treat as wide
    console.log('🔍 TAG panel using default wide offsets');
    calculatedGridOffsetX = 100; // 20 + 80 for wide TAG
    calculatedGridOffsetY = 22;  // 15 + 7 for wide TAG
    console.log('🔍 TAG grid offsets set to:', calculatedGridOffsetX, calculatedGridOffsetY);
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
    
    // Special handling for DPH panels on ProjPanels page - use bathroom icon size for all icons
    if (isDPH && isProjPanelsPage) {
      return specialLayouts?.Bathroom?.iconSize || '38px';
    }
    
    // Special handling for DPV panels on ProjPanels page - reduce all icon sizes by 10%, except bathroom icons get only one 10% reduction
    if (isDPV && isProjPanelsPage) {
      // Calculate base size first
      let baseSize = '40px';
      if (isPIR) {
        baseSize = specialLayouts?.PIR?.iconSize || '40px';
      } else if (isBathroom) {
        baseSize = specialLayouts?.Bathroom?.iconSize || '47px';
      } else {
        baseSize = convertMmToPx(panelDesign.iconSize || iconLayout?.size || '40px');
      }
      // Reduce by 10% (multiply by 0.9)
      const sizeValue = typeof baseSize === 'string' ? parseInt(baseSize.replace('px', '')) : baseSize;
      const firstReduction = Math.round(sizeValue * 0.9);
      // For non-bathroom icons, apply another 10% reduction, then another 3.5% reduction
      let finalSize = firstReduction;
      if (!isBathroom) {
        const secondReduction = Math.round(firstReduction * 0.9);
        // Apply another 3.5% reduction (multiply by 0.965)
        finalSize = Math.round(secondReduction * 0.965);
      }
      // Apply final 3% reduction to all icons (multiply by 0.97), then another 3.5% reduction (multiply by 0.965)
      const afterThreePercent = Math.round(finalSize * 0.97);
      return `${Math.round(afterThreePercent * 0.965)}px`;
    }
    
    // Special handling for X1H panels on ProjPanels page - reduce bathroom icons by 10%
    if (isX1H && isProjPanelsPage && isBathroom) {
      const baseSize = specialLayouts?.Bathroom?.iconSize || '47px';
      const sizeStr = baseSize.toString();
      const sizeValue = parseInt(sizeStr.replace('px', '').trim());
      if (!isNaN(sizeValue)) {
        const reducedSize = `${Math.round(sizeValue * 0.9)}px`;
        console.log('🔍 X1H ProjPanels - Bathroom icon size reduced:', { original: sizeStr, reduced: reducedSize, category: icon?.category });
        return reducedSize;
      }
    }
    
    // Special handling for X1V panels on ProjPanels page - reduce bathroom icons to match regular icons (40px)
    if (isX1V && isProjPanelsPage && isBathroom) {
      return iconLayout?.size || '40px';
    }
    
    // Return larger size for single icon slots (check BEFORE category checks to ensure big icon slots get correct size)
    if (isSingleIconSlot) {
      // X1H and X1V use 150px
      return '150px';
    }
    if (isX2SingleIconSlot) {
      // X2H big icon slots use 140px
      if (isX2H) {
        return '140px';
      }
      // X2V big icon slots: use 150px on ProjPanels page, 204px elsewhere
      if (isX2V) {
        return isProjPanelsPage ? '150px' : '204px';
      }
      return '204px'; // Match X2HCustomizer step 4 preview
    }
    
    // Special handling for TAG panel and X1H with TAG layout - use special sizes for DISPLAY and FAN icons
    if (isTAG || (isX1H && panelDesign.useTagLayout && icon?.iconId === 'DISPLAY')) {
      if (icon?.iconId === 'DISPLAY') {
        return '237px'; // Large display icon - made 3% bigger
      }
      // C and F icons from TAG_icons folder should be 50% smaller
      if (icon && (icon.iconId === 'C' || icon.iconId === 'F')) {
        const baseSize = 40; // Base size for TAG icons
        return `${Math.round(baseSize * 0.5)}px`; // 20px
      }
      // Special handling for TAG tall on ProjPanels page
      const isTAGTallOnProjPanels = isTAG && panelDesign.tagConfig?.dimension === 'tall' && isProjPanelsPage;
      
      // First row icons (positions 0, 1, 2) - make 5% smaller on ProjPanels for tall TAG
      if (icon && (icon.position === 0 || icon.position === 1 || icon.position === 2)) {
        if (isTAGTallOnProjPanels) {
          return `${Math.round(35 * 0.95)}px`; // 5% smaller: 33.25px ≈ 33px
        }
        return '35px';
      }
      // Last row icons (positions 6, 7, 8) - 33px
      if (icon && (icon.position === 6 || icon.position === 7 || icon.position === 8)) {
        return '33px';
      }
      // Rows 2 icons (positions 3, 4, 5) are 33px
      if (icon && (icon.position === 3 || icon.position === 4 || icon.position === 5)) {
        return '33px';
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
    
    // Special handling for X2H panels - make all regular grid icons match bathroom icon size (47px)
    if (isX2H) {
      return specialLayouts?.Bathroom?.iconSize || '47px';
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
    // Calculate width for DPV on ProjPanels page (reduce by 17px)
    let finalWidth = dimensions.width;
    if (isDPV && isProjPanelsPage) {
      const currentWidth = typeof dimensions.width === 'string' ? parseInt(dimensions.width.replace('px', '')) : dimensions.width;
      finalWidth = `${currentWidth - 17}px`;
    }
    // Calculate width for X2H on ProjPanels page (increase by 100px)
    if (isX2H && isProjPanelsPage) {
      const currentWidth = typeof dimensions.width === 'string' ? parseInt(dimensions.width.replace('px', '')) : dimensions.width;
      finalWidth = `${currentWidth + 100}px`;
    }
    // Calculate width for X2V on ProjPanels page (reduce by 15px)
    if (isX2V && isProjPanelsPage) {
      const currentWidth = typeof dimensions.width === 'string' ? parseInt(dimensions.width.replace('px', '')) : dimensions.width;
      finalWidth = `${currentWidth - 15}px`;
    }
    
    // Calculate height adjustments for ProjPanels page
    let finalHeight = dimensions.height;
    if (isX1V && isProjPanelsPage) {
      const h = typeof dimensions.height === 'string' ? parseInt((dimensions.height as string).replace('px','')) : (dimensions.height as number);
      finalHeight = `${h + 100}px`;
    } else if (isX2V && isProjPanelsPage) {
      const h = typeof dimensions.height === 'string' ? parseInt((dimensions.height as string).replace('px','')) : (dimensions.height as number);
      finalHeight = `${h + 75}px`;
    }
    
    return (
      <div
        style={{
          position: 'relative',
          width: isDPH ? (isProjPanelsPage ? '709px' : '704px') : finalWidth,
          height: finalHeight,
          background: `linear-gradient(135deg, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.1) 50%, rgba(255, 255, 255, 0.05) 100%), ${hexToRgba(panelDesign.backgroundColor, 0.9)}`,
          padding: '0',
          border: '2px solid rgba(255, 255, 255, 0.2)',
          borderTop: '3px solid rgba(255, 255, 255, 0.4)',
          borderLeft: '3px solid rgba(255, 255, 255, 0.3)',
          boxShadow: `0 20px 40px rgba(0, 0, 0, 0.3), 0 8px 16px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.4), inset 0 -1px 0 rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.1)`,
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          transition: 'all 0.3s ease',
          margin: isPrintPreviewPage ? '0' : '0 auto',
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
              top: (panelDesign.tagConfig?.dimension === 'tall') 
                ? (isProjPanelsPage ? '145px' : '140px') 
                : (panelDesign.tagConfig?.dimension === 'wide') ? '93px' : '90px',
              left: (panelDesign.tagConfig?.dimension === 'wide') ? 'calc(45% + 23px)' : 'calc(45% + 15px)',
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
          // Base values
          let bottomPx = parseInt(positioning.bottom.replace('px', ''));
          let right1Px = parseInt(positioning.right1.replace('px', ''));
          let right2Px = parseInt(positioning.right2.replace('px', ''));
          // SP tall adjustments (ProjPanels): up 63px, right by 2px
          if (isSP && panelDesign.spConfig?.dimension === 'tall' && isProjPanelsPage) {
            bottomPx += 63;
            right1Px -= 2;
            right2Px -= 2;
          }
          // SP wide adjustments (ProjPanels): net 0px vertical, left by 57px
          if (isSP && panelDesign.spConfig?.dimension === 'wide' && isProjPanelsPage) {
            // bottom unchanged overall after latest request
            right1Px += 57;
            right2Px += 57;
          }
          const adjustedBottom = `${bottomPx}px`;
          const adjustedRight1 = `${right1Px}px`;
          const adjustedRight2 = `${right2Px}px`;
          return (
            <>
              <div
                style={{
                  position: 'absolute',
                  bottom: adjustedBottom,
                  right: adjustedRight1,
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
                  bottom: adjustedBottom,
                  right: adjustedRight2,
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
            const adjustedFontSize = text ? calculateFontSize(text, parseInt(isDPH ? (isProjPanelsPage ? '709' : '704') : dimensions.width) / 6, baseFontSize) : baseFontSize;
            
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
                  
                  // On ProjPanels page, apply column and row-specific offsets when grid is on right
                  let columnOffset = 0;
                  let rowOffset = 0;
                  if (isProjPanelsPage) {
                    const col = index % 3; // 0 = column 1, 1 = column 2, 2 = column 3
                    if (col === 0) {
                      // Column 1: move 5px + 2.5px to the right
                      columnOffset = 7.5;
                    } else if (col === 2) {
                      // Column 3: move 5px + 4px to the left, then 2px to the right
                      columnOffset = -7;
                    }
                    // Column 2 stays in place
                    
                    const row = Math.floor(index / 3); // 0 = row 1, 1 = row 2, 2 = row 3
                    if (row === 0) {
                      // Row 1: move 7px + 5px + 2px + 2px to the bottom
                      rowOffset = 16;
                    } else if (row === 1) {
                      // Row 2: move 5px + 5px + 2px to the bottom
                      rowOffset = 12;
                    } else if (row === 2) {
                      // Row 3: move 2.5px to the bottom
                      rowOffset = 2.5;
                    }
                  }
                  
                  adjustedPos = { 
                    ...adjustedPos, 
                    left: (parseInt(adjustedPos.left) + swappedGridOffset + columnOffset) + 'px',
                    top: (parseInt(adjustedPos.top) + rowOffset) + 'px'
                  };
                } else if (index === 9) {
                  // Move the right single slot to the left side, positioned more centrally, then move right 35px + 45px and down 10px + 25px, then left 5px and up 13px
                  // Original position is left: '341px', move it to left side (around 53px from left, moved up 60px total), then adjust
                  adjustedPos = { ...adjustedPos, left: '128px', top: '85px' }; // Center it vertically on the left, moved up 60px total and right 20px, then right 35px + 45px and down 10px + 25px, then left 5px and up 13px
                }
              } else {
                // When right button is NOT pressed, apply default offsets
                if (index >= 0 && index <= 8) {
                  // Move 3x3 grid 20px to the right
                  const gridOffset = 20;
                  // On ProjPanels page, apply column-specific offsets
                  let additionalOffset = 0;
                  let rowOffset = 0;
                  if (isProjPanelsPage) {
                    const col = index % 3; // 0 = column 1, 1 = column 2, 2 = column 3
                    if (col === 0) {
                      // Column 1: 15px base + 15px additional + 5px = 35px total
                      additionalOffset = 35;
                    } else if (col === 1) {
                      // Column 2: 15px base + 7px additional + 5px = 27px total
                      additionalOffset = 27;
                    } else if (col === 2) {
                      // Column 3: 15px base + 3px additional = 18px total
                      additionalOffset = 18;
                    }
                    // Apply row-specific vertical offsets
                    const row = Math.floor(index / 3); // 0 = row 1, 1 = row 2, 2 = row 3
                    if (row === 0) {
                      // Row 1: lower by 20px
                      rowOffset = 20;
                    } else if (row === 1) {
                      // Row 2: lower by 15px, then move up by 2.5px = 12.5px
                      rowOffset = 12.5;
                    } else if (row === 2) {
                      // Row 3: lower by 5px, then move up by 2.5px = 2.5px
                      rowOffset = 2.5;
                    }
                  }
                  adjustedPos = { 
                    ...adjustedPos, 
                    left: (parseInt(adjustedPos.left) + gridOffset + additionalOffset) + 'px',
                    top: (parseInt(adjustedPos.top) + rowOffset) + 'px'
                  };
                } else if (index === 9) {
                  // Move big icon 160px to the left (base) + 30px more = 190px total
                  const iconOffset = -190;
                  // On ProjPanels page, adjust big icon position when grid is on left
                  if (isProjPanelsPage) {
                    adjustedPos = { ...adjustedPos, left: (parseInt(adjustedPos.left) + iconOffset + 35) + 'px', top: (parseInt(adjustedPos.top) + 45) + 'px' };
                  } else {
                    adjustedPos = { ...adjustedPos, left: (parseInt(adjustedPos.left) + iconOffset) + 'px' };
                  }
                }
              }
            }
            
            // Apply column and row adjustments for X2H panels
            if (isX2H && index >= 0 && index <= 8) {
              const swapUpDown = (panelDesign as any).swapUpDown || false;
              // When grid is on the left (swapUpDown is false), adjust columns and rows
              if (!swapUpDown) {
                const col = index % 3; // 0 = column 1, 1 = column 2, 2 = column 3
                let columnOffset = 15; // Base offset: move all columns 15px to the right
                if (col === 0) {
                  // Column 1 (positions 0, 3, 6): move 48px to the right (15px base + 30px + 3px additional)
                  columnOffset = 15 + 30 + 3;
                } else if (col === 1) {
                  // Column 2 (positions 1, 4, 7): move 37px to the right (15px base + 20px + 2px additional)
                  columnOffset = 15 + 20 + 2;
                } else if (col === 2) {
                  // Column 3 (positions 2, 5, 8): move 25px to the right (15px base + 15px - 3px - 2px)
                  columnOffset = 15 + 15 - 3 - 2;
                }
                if (columnOffset > 0 && adjustedPos && adjustedPos.left) {
                  const currentLeft = parseFloat(adjustedPos.left.replace('px', ''));
                  adjustedPos = { ...adjustedPos, left: (currentLeft + columnOffset) + 'px' };
                }
                
                // Row adjustments: move rows up (negative top offset)
                const row = Math.floor(index / 3); // 0 = row 1, 1 = row 2, 2 = row 3
                let rowOffset = 0;
                if (row === 0) {
                  // Row 1 (positions 0, 1, 2): move 5px to the top
                  rowOffset = -5;
                } else if (row === 1) {
                  // Row 2 (positions 3, 4, 5): move 15px to the top (10px + 5px additional)
                  rowOffset = -15;
                } else if (row === 2) {
                  // Row 3 (positions 6, 7, 8): move 30px to the top (25px + 5px additional)
                  rowOffset = -30;
                }
                if (rowOffset !== 0 && adjustedPos && adjustedPos.top) {
                  const currentTop = parseFloat(adjustedPos.top.replace('px', ''));
                  adjustedPos = { ...adjustedPos, top: (currentTop + rowOffset) + 'px' };
                }
              } else {
                // When swapUpDown is true, grid moves to the right side (big icons on left)
                // Move grid 530px to the right (matching customizer logic)
                const swappedGridOffsetX = 530;
                if (adjustedPos && adjustedPos.left) {
                  const currentLeft = parseFloat(adjustedPos.left.replace('px', ''));
                  adjustedPos = { ...adjustedPos, left: (currentLeft + swappedGridOffsetX) + 'px' };
                }
                
                // Additional column adjustments for ProjPanels page when grid is on the right
                const col = index % 3; // 0 = column 1, 1 = column 2, 2 = column 3
                let columnOffset = 0;
                if (col === 0) {
                  // Column 1 (positions 0, 3, 6): move 58px to the right (50px + 8px)
                  columnOffset = 58;
                } else if (col === 1) {
                  // Column 2 (positions 1, 4, 7): move 45px to the right (30px + 15px)
                  columnOffset = 45;
                } else if (col === 2) {
                  // Column 3 (positions 2, 5, 8): move 30.5px to the right (28px + 2.5px)
                  columnOffset = 30.5;
                }
                if (columnOffset > 0 && adjustedPos && adjustedPos.left) {
                  const currentLeft = parseFloat(adjustedPos.left.replace('px', ''));
                  adjustedPos = { ...adjustedPos, left: (currentLeft + columnOffset) + 'px' };
                }
                
                // Row adjustments for ProjPanels page when grid is on the right
                const row = Math.floor(index / 3); // 0 = row 1, 1 = row 2, 2 = row 3
                let rowOffset = 0;
                if (row === 0) {
                  // Row 1 (positions 0, 1, 2): move 3.5px to the top
                  rowOffset = -3.5;
                } else if (row === 1) {
                  // Row 2 (positions 3, 4, 5): move 15px to the top
                  rowOffset = -15;
                } else if (row === 2) {
                  // Row 3 (positions 6, 7, 8): move 32px to the top (29px + 3px)
                  rowOffset = -32;
                }
                if (rowOffset !== 0 && adjustedPos && adjustedPos.top) {
                  const currentTop = parseFloat(adjustedPos.top.replace('px', ''));
                  adjustedPos = { ...adjustedPos, top: (currentTop + rowOffset) + 'px' };
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
                // On ProjPanels, push rows further down, then apply per-row and per-column tweaks
                if (isProjPanelsPage) {
                  // Base extra 80px down (previous 50px + additional 30px)
                  adjustedPos = { ...adjustedPos, top: (parseInt(adjustedPos.top) + 80) + 'px' };
                  // Row-specific upward adjustments
                  const row = Math.floor(index / 3); // 0,1,2
                  let rowUpAdjust = 0;
                  if (row === 0) rowUpAdjust = 3;      // row 1: 3px up
                  else if (row === 1) rowUpAdjust = 10; // row 2: 10px up
                  else if (row === 2) rowUpAdjust = 15; // row 3: 15px up
                  // Additional request: move row 3 another 3px to the top
                  if (row === 2) rowUpAdjust += 3; // total 18px up for row 3
                  adjustedPos = { ...adjustedPos, top: (parseInt(adjustedPos.top) - rowUpAdjust) + 'px' };
                  
                  // Column-specific horizontal adjustments
                  const col = index % 3; // 0,1,2
                  let colDeltaX = 0; // positive = move right, negative = move left
                  if (col === 0) colDeltaX = 3;      // column 1: 3px right
                  else if (col === 1) colDeltaX = -5;   // column 2: 5px left
                  else if (col === 2) colDeltaX = -13;  // column 3: 13px left (8px + 5px)
                  if (colDeltaX !== 0) {
                    const currentLeft = parseFloat(adjustedPos.left.replace('px',''));
                    adjustedPos = { ...adjustedPos, left: (currentLeft + colDeltaX) + 'px' };
                  }
                }
              } else if (index === 9) {
                // Move the single slot to the top half, positioned more centrally
                // Original position is 328px top, 36px left
                // Move it to center of top half (around 55px from top) and 130px to the left (110px + 20px)
                adjustedPos = { ...adjustedPos, top: '55px', left: (parseInt(adjustedPos.left) - 130) + 'px' };
                // On ProjPanels, push big icon further down and to the right, with extra fine-tuning
                if (isProjPanelsPage) {
                  // Previously +80px down and +30px right; add +5px right and -5px up => net +75px down, +35px right
                  adjustedPos = { 
                    ...adjustedPos, 
                    top: (parseInt(adjustedPos.top) + 75) + 'px',
                    left: (parseInt(adjustedPos.left) + 38) + 'px'
                  };
                }
              }
            } else if (isX1V) {
              if (index === 9) {
                // When big icon is at the bottom (swapUpDown is false), move it 125px to the left (110px + 15px)
                adjustedPos = { ...adjustedPos, left: (parseInt(adjustedPos.left) - 125) + 'px' };
                // On ProjPanels, also nudge 30px to the right and move down by 95px (65px + 30px)
                if (isProjPanelsPage) {
                  adjustedPos = { ...adjustedPos, left: (parseInt(adjustedPos.left) + 30) + 'px', top: (parseInt(adjustedPos.top) + 95) + 'px' };
                }
              } else if (index >= 0 && index <= 8) {
                // Move the 3x3 grid 7px to the left when big icon is at the bottom
                adjustedPos = { ...adjustedPos, left: (parseInt(adjustedPos.left) - 7) + 'px' };
                // On ProjPanels, shift rows down with row-specific adjustments
                if (isProjPanelsPage) {
                  const row = Math.floor(index / 3); // 0=row1, 1=row2, 2=row3
                  let rowDownAdjust = 45; // Base 45px down
                  if (row === 0) rowDownAdjust += 5;   // row 1: +5px more (total 50px down)
                  else if (row === 2) rowDownAdjust -= 8; // row 3: -8px (total 37px down)
                  adjustedPos = { ...adjustedPos, top: (parseInt(adjustedPos.top) + rowDownAdjust) + 'px' };
                  
                  // Column-specific horizontal adjustments
                  const col = index % 3; // 0=col1, 1=col2, 2=col3
                  let colDeltaX = 0; // positive = move right, negative = move left
                  if (col === 0) colDeltaX = 5.5;  // column 1: 5.5px right (3.5px + 2px)
                  else if (col === 2) colDeltaX = -8; // column 3: 8px left (5px + 3px)
                  if (colDeltaX !== 0) {
                    const currentLeft = parseFloat(adjustedPos.left.replace('px',''));
                    adjustedPos = { ...adjustedPos, left: (currentLeft + colDeltaX) + 'px' };
                  }
                }
              }
            }
            
            // DPH: Adjust left panel columns on ProjPanels page
            if (isDPH && isProjPanelsPage && index >= 0 && index <= 8) {
              const col = index % 3; // Column within left panel: 0=col1, 1=col2, 2=col3
              let columnOffset = 0;
              if (col === 0) {
                // Left column 1 (positions 0, 3, 6): move 50.5px right (53px - 2.5px)
                columnOffset = 50.5;
              } else if (col === 1) {
                // Left column 2 (positions 1, 4, 7): move 38.7px right (35px + 3.7px)
                columnOffset = 38.7;
              } else if (col === 2) {
                // Left column 3 (positions 2, 5, 8): move 24.5px right (23px + 1.5px)
                columnOffset = 24.5;
              }
              if (columnOffset > 0 && adjustedPos && adjustedPos.left) {
                const currentLeft = parseFloat(adjustedPos.left.replace('px', ''));
                adjustedPos = { ...adjustedPos, left: (currentLeft + columnOffset) + 'px' };
              }
            }
            
            // DPH: Adjust right panel columns on ProjPanels page
            if (isDPH && isProjPanelsPage && index >= 9 && index <= 17) {
              const col = (index - 9) % 3; // Column within right panel: 0=col1, 1=col2, 2=col3
              let columnOffset = 0;
              if (col === 0) {
                // Right column 1 (positions 9, 12, 15): move 3px left
                columnOffset = -3;
              } else if (col === 1) {
                // Right column 2 (positions 10, 13, 16): move 15.5px left (18px - 2.5px)
                columnOffset = -15.5;
              } else if (col === 2) {
                // Right column 3 (positions 11, 14, 17): move 27px left
                columnOffset = -27;
              }
              if (columnOffset !== 0 && adjustedPos && adjustedPos.left) {
                const currentLeft = parseFloat(adjustedPos.left.replace('px', ''));
                adjustedPos = { ...adjustedPos, left: (currentLeft + columnOffset) + 'px' };
              }
            }
            
            // DPH: Adjust rows (both left and right panels) on ProjPanels page
            if (isDPH && isProjPanelsPage && index >= 0 && index <= 17) {
              let row = 0;
              if (index >= 0 && index <= 8) {
                // Left panel: Row 1 = 0-2, Row 2 = 3-5, Row 3 = 6-8
                row = Math.floor(index / 3);
              } else if (index >= 9 && index <= 17) {
                // Right panel: Row 1 = 9-11, Row 2 = 12-14, Row 3 = 15-17
                row = Math.floor((index - 9) / 3);
              }
              
              let rowOffset = 0;
              if (row === 0) {
                // Row 1: move 5px to the top (reduce top value)
                rowOffset = -5;
              } else if (row === 1) {
                // Row 2: move 15px to the top
                rowOffset = -15;
              } else if (row === 2) {
                // Row 3: move 30px to the top (25px + 5px)
                rowOffset = -30;
              }
              
              if (rowOffset !== 0 && adjustedPos && adjustedPos.top) {
                const currentTop = parseFloat(adjustedPos.top.replace('px', ''));
                adjustedPos = { ...adjustedPos, top: (currentTop + rowOffset) + 'px' };
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
              
              // For SP tall on ProjPanels page, move first column (indices 0, 3, 6) 6.5px to the left (3.5px to the right from the previous -10px)
              if (dimension === 'tall' && isProjPanelsPage && (index === 0 || index === 3 || index === 6)) {
                const currentLeft = parseInt((adjustedPos as any).left || '0', 10);
                adjustedPos = { ...adjustedPos, left: (currentLeft - 6.5) + 'px' } as any;
              }
              // For SP tall on ProjPanels page, move second column (indices 1, 4, 7) 10px to the left
              if (dimension === 'tall' && isProjPanelsPage && (index === 1 || index === 4 || index === 7)) {
                const currentLeft = parseInt((adjustedPos as any).left || '0', 10);
                adjustedPos = { ...adjustedPos, left: (currentLeft - 10) + 'px' } as any;
              }
              // For SP tall on ProjPanels page, move third column (indices 2, 5, 8) 15px to the left
              if (dimension === 'tall' && isProjPanelsPage && (index === 2 || index === 5 || index === 8)) {
                const currentLeft = parseInt((adjustedPos as any).left || '0', 10);
                adjustedPos = { ...adjustedPos, left: (currentLeft - 15) + 'px' } as any;
              }
              // For SP wide on ProjPanels page, move first column (indices 0, 3, 6) 8px to the left
              if (dimension === 'wide' && isProjPanelsPage && (index === 0 || index === 3 || index === 6)) {
                const currentLeft = parseInt((adjustedPos as any).left || '0', 10);
                adjustedPos = { ...adjustedPos, left: (currentLeft - 8) + 'px' } as any;
              }
              // For SP wide on ProjPanels page, move second column (indices 1, 4, 7) 13px to the left
              if (dimension === 'wide' && isProjPanelsPage && (index === 1 || index === 4 || index === 7)) {
                const currentLeft = parseInt((adjustedPos as any).left || '0', 10);
                adjustedPos = { ...adjustedPos, left: (currentLeft - 13) + 'px' } as any;
              }
              // For SP wide on ProjPanels page, move third column (indices 2, 5, 8) 20px to the left
              if (dimension === 'wide' && isProjPanelsPage && (index === 2 || index === 5 || index === 8)) {
                const currentLeft = parseInt((adjustedPos as any).left || '0', 10);
                adjustedPos = { ...adjustedPos, left: (currentLeft - 20) + 'px' } as any;
              }
              // For SP wide on ProjPanels page, bring first row (indices 0, 1, 2) up by 5px
              if (dimension === 'wide' && isProjPanelsPage && (index === 0 || index === 1 || index === 2)) {
                const currentTop = parseInt((adjustedPos as any).top || '0', 10);
                adjustedPos = { ...adjustedPos, top: (currentTop - 5) + 'px' } as any;
              }
              // For SP wide on ProjPanels page, bring second row (indices 3, 4, 5) up by 10px
              if (dimension === 'wide' && isProjPanelsPage && (index === 3 || index === 4 || index === 5)) {
                const currentTop = parseInt((adjustedPos as any).top || '0', 10);
                adjustedPos = { ...adjustedPos, top: (currentTop - 10) + 'px' } as any;
              }
              // For SP wide on ProjPanels page, bring third row (indices 6, 7, 8) up by 5px
              if (dimension === 'wide' && isProjPanelsPage && (index === 6 || index === 7 || index === 8)) {
                const currentTop = parseInt((adjustedPos as any).top || '0', 10);
                adjustedPos = { ...adjustedPos, top: (currentTop - 15) + 'px' } as any;
              }
              // For SP tall on ProjPanels page, lower first row (indices 0, 1, 2) by 5.5px (3.5px + 2px)
              if (dimension === 'tall' && isProjPanelsPage && (index === 0 || index === 1 || index === 2)) {
                const currentTop = parseInt((adjustedPos as any).top || '0', 10);
                adjustedPos = { ...adjustedPos, top: (currentTop + 5.5) + 'px' } as any;
              }
              // For SP tall on ProjPanels page, lower second row (indices 3, 4, 5) by 2px
              if (dimension === 'tall' && isProjPanelsPage && (index === 3 || index === 4 || index === 5)) {
                const currentTop = parseInt((adjustedPos as any).top || '0', 10);
                adjustedPos = { ...adjustedPos, top: (currentTop + 2) + 'px' } as any;
              }
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
            
            // DPV: Adjust columns (both top and bottom panels) on ProjPanels page
            if (isDPV && isProjPanelsPage && adjustedPos && adjustedPos.left) {
              const col = index % 3; // Column: 0=col1, 1=col2, 2=col3
              let columnOffset = 0;
              if (col === 0) {
                // Column 1 (positions 0, 3, 6 for top and 9, 12, 15 for bottom): move 5px left
                columnOffset = -5;
              } else if (col === 1) {
                // Column 2 (positions 1, 4, 7 for top and 10, 13, 16 for bottom): move 18px left (15px + 3px additional)
                columnOffset = -18;
              } else if (col === 2) {
                // Column 3 (positions 2, 5, 8 for top and 11, 14, 17 for bottom): move 33px left (23px + 10px additional)
                columnOffset = -33;
              }
              if (columnOffset !== 0) {
                const currentLeft = parseFloat(adjustedPos.left.replace('px', ''));
                adjustedPos = { ...adjustedPos, left: (currentLeft + columnOffset) + 'px' };
              }
            }

            // X2V: Adjust grid columns on ProjPanels page (positions 0-8)
            if (isX2V && isProjPanelsPage && adjustedPos && adjustedPos.left && index >= 0 && index <= 8) {
              const col = index % 3; // 0=col1, 1=col2, 2=col3
              let columnOffset = 0;
              if (col === 0) {
                // Column 1: move 5px left
                columnOffset = -5;
              } else if (col === 1) {
                // Column 2: move 17px left (3px to the right from -20px)
                columnOffset = -17;
              } else if (col === 2) {
                // Column 3: move 30px left (additional 20px)
                columnOffset = -30;
              }
              if (columnOffset !== 0) {
                const currentLeft = parseFloat(adjustedPos.left.replace('px', ''));
                adjustedPos = { ...adjustedPos, left: (currentLeft + columnOffset) + 'px' };
              }
            }

            // X2V: If grid is on bottom (swapUpDown === true), drop entire grid (indices 0-8) by 550px on ProjPanels
            if (isX2V && isProjPanelsPage && index >= 0 && index <= 8) {
              const swapUpDown = (panelDesign as any).swapUpDown || false;
              if (swapUpDown && adjustedPos && adjustedPos.top) {
                const currentTop = parseFloat(adjustedPos.top.replace('px', ''));
                adjustedPos = { ...adjustedPos, top: (currentTop + 550) + 'px' };
              }
            }

            // X2V: Adjust grid rows on ProjPanels page (positions 0-8)
            if (isX2V && isProjPanelsPage && adjustedPos && adjustedPos.top && index >= 0 && index <= 8) {
              const row = Math.floor(index / 3); // 0=row1, 1=row2, 2=row3
              let rowOffset = 0;
              if (row === 0) {
                // Row 1: move 56px down (+3px)
                rowOffset = 56;
              } else if (row === 1) {
                // Row 2: move 48px down (2px up from 50)
                rowOffset = 48;
              } else if (row === 2) {
                // Row 3: move 34px down (2px up from 36)
                rowOffset = 34;
              }
              if (rowOffset !== 0) {
                const currentTop = parseFloat(adjustedPos.top.replace('px', ''));
                adjustedPos = { ...adjustedPos, top: (currentTop + rowOffset) + 'px' };
              }
            }
            
            // DPV: Adjust rows (top and bottom panels) on ProjPanels page
            if (isDPV && isProjPanelsPage && adjustedPos && adjustedPos.top) {
              let rowOffset = 0;
              
              // Top panel (positions 0-8)
              if (index >= 0 && index <= 8) {
                const row = Math.floor(index / 3); // Row within top panel: 0=row1, 1=row2, 2=row3
                if (row === 0) {
                  // Top row 1 (positions 0, 1, 2): move 55px down (40px + 15px additional)
                  rowOffset = 55;
                } else if (row === 1) {
                  // Top row 2 (positions 3, 4, 5): move 40px down (25px + 15px additional)
                  rowOffset = 40;
                } else if (row === 2) {
                  // Top row 3 (positions 6, 7, 8): move 22px down (20px + 2px additional)
                  rowOffset = 22;
                }
              }
              // Bottom panel (positions 9-17)
              else if (index >= 9 && index <= 17) {
                const row = Math.floor((index - 9) / 3); // Row within bottom panel: 0=row1, 1=row2, 2=row3
                if (row === 0) {
                  // Bottom row 1 (positions 9, 10, 11): move 2.5px up (decrease top value)
                  rowOffset = -2.5;
                } else if (row === 1) {
                  // Bottom row 2 (positions 12, 13, 14): move 15px up (decrease top value)
                  rowOffset = -15;
                } else if (row === 2) {
                  // Bottom row 3 (positions 15, 16, 17): move 30px up (25px + 5px additional)
                  rowOffset = -30;
                }
              }
              
              if (rowOffset !== 0) {
                const currentTop = parseFloat(adjustedPos.top.replace('px', ''));
                adjustedPos = { ...adjustedPos, top: (currentTop + rowOffset) + 'px' };
              }
            }
            
            // X2H: apply big icon positioning logic based on swap state
            if (isX2H && (index === 9 || index === 10)) {
              const swapUpDown = (panelDesign as any).swapUpDown || false;
              if (swapUpDown) {
                // When swap is true, big icons are on the left side (matching customizer logic)
                // For ProjPanels: move big icons 85px to the right (60px + 25px) from their base positions
                if (index === 9) {
                  // First big icon: base position 36px, then add 85px for ProjPanels = 121px
                  adjustedPos = { ...adjustedPos, left: '121px' };
                } else if (index === 10) {
                  // Second big icon: base position 300px, then add 85px for ProjPanels = 385px
                  adjustedPos = { ...adjustedPos, left: '385px' };
                }
                // Move big icons 30px to the bottom (add to top value)
                if (adjustedPos.top) {
                  const currentTop = parseFloat(adjustedPos.top.replace('px', ''));
                  adjustedPos = { ...adjustedPos, top: (currentTop + 30) + 'px' };
                }
              } else {
                // When swap is false, big icons are on the right side
                // Move both big icons 60px to the right (65px - 5px) and 32px down (40px - 8px)
              adjustedPos = { ...adjustedPos, left: (parseInt(adjustedPos.left) + 60) + 'px' };
              if (adjustedPos.top) {
                adjustedPos = { ...adjustedPos, top: (parseInt(adjustedPos.top) + 32) + 'px' };
                }
              }
            }
            
            // X2V: apply big icon positioning logic to match customizer
            if (isX2V && (index === 9 || index === 10)) {
              const swapUpDown = (panelDesign as any).swapUpDown || false;
              // Move big icons left; when grid is on top (swapUpDown=false) on ProjPanels, use 100px (140px - 40px to move right), otherwise 100px
              {
                const baseLeft = parseInt(adjustedPos.left as string);
                const shiftLeft = (isProjPanelsPage && !swapUpDown) ? 100 : 100;
                adjustedPos = { ...adjustedPos, left: (baseLeft - shiftLeft) + 'px' };
              }
              
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

              // On ProjPanels page: push big icons vertically
              // When grid is on top (swapUpDown=false): center icon down by 30px more (+60 total), bottom icon up by 30px (+35 total)
              if (isProjPanelsPage) {
                const currentTop = parseInt(adjustedPos.top as string);
                if (!isNaN(currentTop)) {
                  if (!swapUpDown) {
                    // Grid on top: center icon down 30px more, bottom icon up 30px
                    if (index === 9) {
                      // Center big icon: +60px down (30px more than before)
                      adjustedPos = { ...adjustedPos, top: (currentTop + 60) + 'px' };
                    } else if (index === 10) {
                      // Bottom big icon: +35px down (30px less than before, effectively up 30px)
                      adjustedPos = { ...adjustedPos, top: (currentTop + 35) + 'px' };
                    }
                  } else {
                    // Grid on bottom: original logic
                    if (index === 9) {
                      // Middle big icon: +30px down
                      adjustedPos = { ...adjustedPos, top: (currentTop + 30) + 'px' };
                    } else if (index === 10) {
                      // Top/bottom big icon: +65px down
                      adjustedPos = { ...adjustedPos, top: (currentTop + 65) + 'px' };
                    }
                  }
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
    
    // All panels use position 9 for big icons
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
    if (isX1H) {
      console.log('🔍 getBigIconContainer ENTRY for X1H:', { isProjPanelsPage, hasBigIconLayout: !!bigIconLayout, bigIconLayoutSize: bigIconLayout?.size, isReversed });
    }
    
    if (!bigIconLayout) {
      if (isX1H) {
        console.log('🔍 getBigIconContainer RETURNING NULL for X1H - no bigIconLayout');
      }
      return null;
    }

    if (isX1H) {
      console.log('🔍 getBigIconContainer CONTINUING for X1H:', { isProjPanelsPage, bigIconLayoutSize: bigIconLayout?.size });
    }

    const bigIconSrc = getBigIconSrc();
    const bigIcon2Src = getBigIcon2Src();
    const isX2Panel = isX2H || isX2V;

    // Calculate big icon size - fixed 150px for X1H, 140px for X2H everywhere
    const getBigIconSize = () => {
      if (isX1H) {
        return '150px';
      }
      if (isX2H) {
        return '140px';
      }
      return bigIconLayout?.size || '120px';
    };
    const bigIconSize = getBigIconSize();
    
    if (isX1H) {
      console.log('🔍 getBigIconContainer - final bigIconSize:', bigIconSize, 'for rendering');
    }

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
                width: bigIconSize,
                height: bigIconSize,
                  objectFit: 'contain', 
                filter: getBigIconSrc() && icons.find(icon => icon.position === 9)?.category !== 'Sockets' ? computedIconFilter : undefined,
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
                width: bigIconSize,
                height: bigIconSize,
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
  console.log('🔍 Using default grid rendering for:', type);
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
          let forceIcon = null;
          // X1H panels with TAG layout: DISPLAY icon is rendered as overlay, not in grid cells
          // So we don't force it here
            const isPIR = (forceIcon || icon)?.category === 'PIR';
          const text = (iconTexts && iconTexts[index]) || icon?.text;
            const hasIcon = (icon && icon.src) || forceIcon;
          const iconSize = getIconSize(forceIcon || icon);
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
                      src={(forceIcon || icon)!.src}
                      alt={(forceIcon || icon)!.label}
                      style={{
                      width: iconSize,
                      height: iconSize,
                        objectFit: 'contain',
                      marginBottom: iconLayout?.spacing || '5px',
                        position: 'relative',
                        zIndex: 1,
                      marginTop: isPIR ? (specialLayouts?.PIR?.marginTop || '20px') : '0',
                        filter: !isPIR && (forceIcon || icon)?.category !== 'Sockets' ? computedIconFilter : undefined,
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
  console.log('🔍 Panel type check:', { isSP, isTAG, type, activeDimension, activeIconPositions });
    if (isSP || isTAG) {
    // SP and TAG Panels - Use customizer rendering if props are provided, otherwise use standard rendering
    const useCustomizerRendering = activeDimension && activeIconPositions;
    
    if (useCustomizerRendering) {
      console.log('🔍 Using customizer rendering path');
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
      console.log('🔍 Using standard rendering path for ProjPanels');
      if (isX1H) {
        console.log('🔍 X1H in standard path - checking for big icon:', { 
          hasIcons: icons.length > 0, 
          bigIconAt9: icons.find(icon => icon.position === 9),
          hasBigIconLayout: !!bigIconLayout 
        });
      }
      console.log('🔍 calculatedGridOffsetX:', calculatedGridOffsetX, 'calculatedGridOffsetY:', calculatedGridOffsetY);
      // Calculate width and height adjustments for ProjPanels page
      let finalWidthStandard = dimensions.width;
      if (isX2V && isProjPanelsPage) {
        const currentWidth = typeof dimensions.width === 'string' ? parseInt(dimensions.width.replace('px', '')) : dimensions.width;
        finalWidthStandard = `${currentWidth - 15}px`;
      }
      
      let finalHeightStandard = dimensions.height;
      if (isX1V && isProjPanelsPage) {
        const h = typeof dimensions.height === 'string' ? parseInt((dimensions.height as string).replace('px','')) : (dimensions.height as number);
        finalHeightStandard = `${h + 100}px`;
      } else if (isX2V && isProjPanelsPage) {
        const h = typeof dimensions.height === 'string' ? parseInt((dimensions.height as string).replace('px','')) : (dimensions.height as number);
        finalHeightStandard = `${h + 75}px`;
      }
      
      // Use customizer-style rendering for standard mode (ProjPanels) to match customizer appearance
      return (
        <div
          style={{
            position: 'relative',
            width: finalWidthStandard,
            height: finalHeightStandard,
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
            transform: `translate(${calculatedGridOffsetX}px, ${calculatedGridOffsetY}px)`,
            backgroundColor: 'rgba(255, 0, 0, 0.3)' // TEMPORARY: Make it red to see if this div is visible
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
              // TAG panels: Force DISPLAY icon at position 0 (Note: position 0 is actually one of the 3 icons above the separately-rendered DISPLAY icon)
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
              // X2V panels with TAG layout: Force DISPLAY icon at position 0 (Note: position 0 is actually one of the 3 icons above the separately-rendered DISPLAY icon)
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
                let adjustedTopPx = baseTop;
                const baseLeft = parseInt((pos as any).left || '0', 10);
                const rowIndex = Math.floor(index / 3);
                
                // Lower first row by 40px for TAG tall on ProjPanels page
                if (isTAG && panelDesign.tagConfig?.dimension === 'tall' && isProjPanelsPage && rowIndex === 0) {
                  adjustedTopPx += 40;
                }
                // Lower second row by 70px for TAG tall on ProjPanels page
                if (isTAG && panelDesign.tagConfig?.dimension === 'tall' && isProjPanelsPage && rowIndex === 1) {
                  adjustedTopPx += 70;
                }
                // Bring first row up by 5px for SP wide on ProjPanels page
                if (isSP && panelDesign.spConfig?.dimension === 'wide' && isProjPanelsPage && rowIndex === 0) {
                  adjustedTopPx -= 5;
                }
                // Bring second row up by 10px for SP wide on ProjPanels page
                if (isSP && panelDesign.spConfig?.dimension === 'wide' && isProjPanelsPage && rowIndex === 1) {
                  adjustedTopPx -= 10;
                }
                // Bring third row up by 5px for SP wide on ProjPanels page
                if (isSP && panelDesign.spConfig?.dimension === 'wide' && isProjPanelsPage && rowIndex === 2) {
                  adjustedTopPx -= 5;
                }
                const adjustedTop = `${adjustedTopPx}px`;
                
                // Move TAG wide first row 5px to the left
                let adjustedLeft = baseLeft;
                if (isTAG && (panelDesign.tagConfig?.dimension === 'wide' || !panelDesign.tagConfig) && rowIndex === 0) {
                  adjustedLeft -= 5;
                }
                // Move first column 8px to the left for SP wide on ProjPanels page
                if (isSP && panelDesign.spConfig?.dimension === 'wide' && isProjPanelsPage && (index === 0 || index === 3 || index === 6)) {
                  adjustedLeft -= 8;
                }
                // Move second column 13px to the left for SP wide on ProjPanels page
                if (isSP && panelDesign.spConfig?.dimension === 'wide' && isProjPanelsPage && (index === 1 || index === 4 || index === 7)) {
                  adjustedLeft -= 13;
                }
                // Move third column 20px to the left for SP wide on ProjPanels page
                if (isSP && panelDesign.spConfig?.dimension === 'wide' && isProjPanelsPage && (index === 2 || index === 5 || index === 8)) {
                  adjustedLeft -= 20;
                }
                
                adjustedPos = { ...pos, top: adjustedTop, left: `${adjustedLeft}px` };
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
            
            {/* Render big icon for X1H/X1V panels in standard rendering path */}
            {(isX1H || isX1V) && (() => {
              if (isX1H) {
                console.log('🔍 X1H big icon rendering check:', { 
                  isX1H, 
                  isX1V, 
                  hasIcons: icons.length > 0,
                  allIconPositions: icons.map(i => i.position)
                });
              }
              const bigIcon = icons.find(icon => icon.position === 9);
              if (isX1H) {
                console.log('🔍 X1H big icon found:', { bigIcon, hasSrc: !!bigIcon?.src });
              }
              if (!bigIcon || !bigIcon.src) {
                if (isX1H) {
                  console.log('🔍 X1H big icon NOT rendering - no icon or src');
                }
                return null;
              }
              
              // Calculate big icon size - fixed 150px for X1H/X1V, 140px for X2H everywhere
              let bigIconSize = bigIconLayout?.size || '120px';
              if (isX1H || isX1V) {
                bigIconSize = '150px';
              } else if (isX2H) {
                bigIconSize = '140px';
              }
              
              // Get position from bigIconLayout or use default
              const bigIconPos = bigIconLayout?.position === 'right' 
                ? { right: '0', top: '50%', transform: 'translateY(-50%)' }
                : bigIconLayout?.position === 'left'
                ? { left: '0', top: '50%', transform: 'translateY(-50%)' }
                : bigIconLayout?.position === 'top'
                ? { top: '0', left: '50%', transform: 'translateX(-50%)' }
                : bigIconLayout?.position === 'bottom'
                ? { bottom: '0', left: '50%', transform: 'translateX(-50%)' }
                : { right: '0', top: '50%', transform: 'translateY(-50%)' };
              
              // For X1V on ProjPanels, nudge big icon 20px to the right for top/bottom aligned variants
              const finalBigIconPos = (isX1V && isProjPanelsPage)
                ? (bigIconLayout?.position === 'bottom' || bigIconLayout?.position === 'top'
                    ? { ...(bigIconPos as any), left: 'calc(50% + 30px)' }
                    : bigIconPos)
                : bigIconPos;

              // Fine-tune for X1V on ProjPanels: adjust based on swapUpDown state
              const finalBigIconPosWithSwap = (isX1V && isProjPanelsPage)
                ? (() => {
                    const pos: any = { ...finalBigIconPos };
                    const swapUpDown = (panelDesign as any).swapUpDown;
                    
                    if (swapUpDown) {
                      // Grid at bottom (swapUpDown = true): +5px right and -5px up
                      if (pos.left && typeof pos.left === 'string' && pos.left.includes('calc(50% +')) {
                        pos.left = 'calc(50% + 38px)';
                      }
                      // Move 5px toward top depending on anchor
                      if (pos.bottom !== undefined) {
                        pos.bottom = '5px';
                      } else if (pos.top !== undefined) {
                        // move 5px up from top 0
                        const currentTop = typeof pos.top === 'string' && pos.top.endsWith('px') ? parseInt(pos.top) : 0;
                        pos.top = (currentTop - 5) + 'px';
                      }
                    } else {
                      // Grid at top (swapUpDown = false): move big icon down by 95px (65px + 30px)
                      if (pos.bottom !== undefined) {
                        // Convert bottom to top for easier adjustment
                        const currentBottom = typeof pos.bottom === 'string' && pos.bottom.endsWith('px') ? parseInt(pos.bottom) : 0;
                        pos.top = `calc(100% - ${currentBottom + 95}px)`;
                        delete pos.bottom;
                        delete pos.transform;
                      } else if (pos.top !== undefined) {
                        const currentTop = typeof pos.top === 'string' && pos.top.endsWith('px') ? parseInt(pos.top) : 0;
                        pos.top = (currentTop + 95) + 'px';
                      }
                    }
                    return pos;
                  })()
                : finalBigIconPos;
              
              return (
                <div
                  key="big-icon"
                  style={{
                    position: 'absolute',
                    ...finalBigIconPosWithSwap,
                    zIndex: 3,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: bigIconLayout?.width || '50%',
                    height: bigIconLayout?.height || '100%',
                  }}
                >
                  <img
                    src={bigIcon.src}
                    alt={bigIcon.label}
                    style={{
                      width: bigIconSize,
                      height: bigIconSize,
                      objectFit: 'contain',
                      filter: bigIcon.category !== 'Sockets' ? computedIconFilter : undefined,
                      transition: 'filter 0.2s',
                    }}
                  />
                </div>
              );
            })()}
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

    const panelWidth = typeof dimensions.width === 'string' ? dimensions.width : `${dimensions.width}px`;

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
          width: panelWidth,
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
          margin: isPrintPreviewPage ? '0' : '0 auto',
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
    if (isX1H) {
      console.log('🔍 X1H using extended panel path:', { isDoublePanel, isExtendedPanel, hasBigIconLayout: !!bigIconLayout });
    }
    const isReversed = panelDesign.isLayoutReversed;
    
    // Calculate width for X2H on ProjPanels page (increase by 100px)
    let finalWidthExtended = dimensions.width;
    if (isX2H && isProjPanelsPage) {
      const currentWidth = typeof dimensions.width === 'string' ? parseInt(dimensions.width.replace('px', '')) : dimensions.width;
      finalWidthExtended = `${currentWidth + 100}px`;
    }
    // Calculate width for X2V on ProjPanels page (reduce by 15px)
    if (isX2V && isProjPanelsPage) {
      const currentWidth = typeof dimensions.width === 'string' ? parseInt(dimensions.width.replace('px', '')) : dimensions.width;
      finalWidthExtended = `${currentWidth - 15}px`;
    }
    
    // Calculate height adjustments for ProjPanels page
    let finalHeightExtended = dimensions.height;
    if (isX1V && isProjPanelsPage) {
      const h = typeof dimensions.height === 'string' ? parseInt((dimensions.height as string).replace('px','')) : (dimensions.height as number);
      finalHeightExtended = `${h + 100}px`;
    } else if (isX2V && isProjPanelsPage) {
      const h = typeof dimensions.height === 'string' ? parseInt((dimensions.height as string).replace('px','')) : (dimensions.height as number);
      finalHeightExtended = `${h + 75}px`;
    }
    
            return (
      <div
        style={{
          ...basePanelStyle,
          width: finalWidthExtended,
          height: finalHeightExtended,
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
        
        {/* X1H TAG layout DISPLAY image - render as overlay when useTagLayout is enabled */}
        {isX1H && (panelDesign.useTagLayout || (panelDesign as any).useTagLayout) && (() => {
          const hasIconsInTopRow = icons.some(icon => icon.position >= 0 && icon.position <= 2);
          if (isX1H && panelDesign.useTagLayout) {
            console.log('🔍 X1H TAG layout DISPLAY check:', { 
              useTagLayout: panelDesign.useTagLayout, 
              hasIconsInTopRow,
              icons: icons.map(i => ({ pos: i.position, id: i.iconId }))
            });
          }
          return hasIconsInTopRow;
        })() && (
          <img
            src={DISPLAY}
            alt="DISPLAY"
            style={{
              position: 'absolute',
              top: '90px',
              left: '45%',
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
        
        {/*replace_all Proximity indicators overlay */}
        {(panelDesign.features?.Proximity || panelDesign.Proximity) && (() => {
          const positioning = getProximityPositioning(type, dimensions);
          // Base values
          let bottomPx = parseInt(positioning.bottom.replace('px', ''));
          let right1Px = parseInt(positioning.right1.replace('px', ''));
          let right2Px = parseInt(positioning.right2.replace('px', ''));
          // SP tall adjustments (ProjPanels): up 63px, right by 2px
          if (isSP && panelDesign.spConfig?.dimension === 'tall' && isProjPanelsPage) {
            bottomPx += 63;
            right1Px -= 2;
            right2Px -= 2;
          }
          // SP wide adjustments (ProjPanels): net 0px vertical, left by 57px
          if (isSP && panelDesign.spConfig?.dimension === 'wide' && isProjPanelsPage) {
            // bottom unchanged overall after latest request
            right1Px += 57;
            right2Px += 57;
          }
          const adjustedBottom = `${bottomPx}px`;
          const adjustedRight1 = `${right1Px}px`;
          const adjustedRight2 = `${right2Px}px`;
          return (
            <>
              <div
                style={{
                  position: 'absolute',
                  bottom: adjustedBottom,
                  right: adjustedRight1,
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
                  bottom: adjustedBottom,
                  right: adjustedRight2,
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
    // Calculate width for X2H on ProjPanels page (increase by 100px)
    let finalWidthDefault = dimensions.width;
    if (isX2H && isProjPanelsPage) {
      const currentWidth = typeof dimensions.width === 'string' ? parseInt(dimensions.width.replace('px', '')) : dimensions.width;
      finalWidthDefault = `${currentWidth + 100}px`;
    }
    
            return (
              <div
                style={{
        ...basePanelStyle,
        width: finalWidthDefault,
        height: (isX1V && isProjPanelsPage)
          ? (() => {
              const h = typeof dimensions.height === 'string' ? parseInt((dimensions.height as string).replace('px','')) : (dimensions.height as number);
              return `${h + 100}px`;
            })()
          : dimensions.height,
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
        // Base values
        let bottomPx = parseInt(positioning.bottom.replace('px', ''));
        let right1Px = parseInt(positioning.right1.replace('px', ''));
        let right2Px = parseInt(positioning.right2.replace('px', ''));
        // SP tall adjustments (ProjPanels): up 63px, right by 2px
        if (isSP && panelDesign.spConfig?.dimension === 'tall' && isProjPanelsPage) {
          bottomPx += 63;
          right1Px -= 2;
          right2Px -= 2;
        }
        // SP wide adjustments (ProjPanels): net 0px vertical, left by 57px
        if (isSP && panelDesign.spConfig?.dimension === 'wide' && isProjPanelsPage) {
          // bottom unchanged overall after latest request
          right1Px += 57;
          right2Px += 57;
        }
        const adjustedBottom = `${bottomPx}px`;
        const adjustedRight1 = `${right1Px}px`;
        const adjustedRight2 = `${right2Px}px`;
        return (
          <>
            <div
              style={{
                position: 'absolute',
                bottom: adjustedBottom,
                right: adjustedRight1,
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
                bottom: adjustedBottom,
                right: adjustedRight2,
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