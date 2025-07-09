import React, { useEffect } from 'react';
import { ralColors } from '../data/ralColors';
import { getIconColorName } from '../data/iconColors';
import { allIcons } from '../assets/iconLibrary';
import { getPanelLayoutConfig, PanelLayoutConfig } from '../data/panelLayoutConfig';

// Copy hexToRgba and ICON_COLOR_FILTERS from SPCustomizer
const hexToRgba = (hex: string, alpha: number): string => {
  if (!hex) return `rgba(255, 255, 255, ${alpha})`;
  hex = hex.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const ICON_COLOR_FILTERS: { [key: string]: string } = {
  '#000000': 'brightness(0) saturate(100%)',
  '#FFFFFF': 'brightness(0) saturate(100%) invert(1)',
  '#808080': 'brightness(0) saturate(100%) invert(52%) sepia(0%) saturate(0%) hue-rotate(148deg) brightness(99%) contrast(91%)',
  '#FF0000': 'brightness(0) saturate(100%) invert(13%) sepia(93%) saturate(7464%) hue-rotate(0deg) brightness(113%) contrast(109%)',
  '#0000FF': 'brightness(0) saturate(100%) invert(8%) sepia(100%) saturate(6495%) hue-rotate(247deg) brightness(98%) contrast(141%)',
  '#008000': 'brightness(0) saturate(100%) invert(23%) sepia(98%) saturate(3025%) hue-rotate(101deg) brightness(94%) contrast(104%)',
};

interface PanelPreviewIcon {
  src: string;
  label: string;
  position: number;
  text: string;
  category?: string;
  id?: string;
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

const PanelPreview: React.FC<PanelPreviewProps> = ({ icons, panelDesign, iconTexts, type = 'SP' }) => {
  useEffect(() => {
    if (panelDesign.fonts) {
      loadGoogleFont(panelDesign.fonts);
    }
  }, [panelDesign.fonts]);

  // Get layout configuration for this panel type
  const config = getPanelLayoutConfig(type);
  const { dimensions, gridLayout, iconLayout, bigIconLayout, textLayout, specialLayouts, iconPositions } = config;

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
    
    if (isPIR) {
      return specialLayouts?.PIR?.iconSize || '40px';
    }
    if (isBathroom) {
      return specialLayouts?.Bathroom?.iconSize || `${parseInt(iconLayout?.size || '40px') + 10}px`;
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
        {(isDPH ? Array.from({ length: 18 }) : iconPositions).map((_, index) => {
            const pos = iconPositions[index];
            const icon = icons.find((i) => i.position === index);
            const isPIR = icon?.category === 'PIR';
            const text = (iconTexts && iconTexts[index]) || icon?.text;
            const hasIcon = icon && icon.src;
            const iconSize = getIconSize(icon);
            const baseFontSize = textLayout?.fontSize || panelDesign.fontSize || '12px';
            const adjustedFontSize = text ? calculateFontSize(text, parseInt(isDPH ? '640' : dimensions.width) / 6, baseFontSize) : baseFontSize;
            
            // Apply swap and mirror logic for X1H panels
            let adjustedPos = pos;
            
            // Apply mirror logic first (if enabled)
            if (isX1H && panelDesign.mirrorGrid && index >= 0 && index <= 8) {
              // Mirror the grid: columns 0,1,2 become 2,1,0
              // Original positions: 0,1,2 | 3,4,5 | 6,7,8
              // Mirrored positions: 2,1,0 | 5,4,3 | 8,7,6
              const mirrorMap = [2, 1, 0, 5, 4, 3, 8, 7, 6];
              const mirroredIndex = mirrorMap[index];
              const mirroredPos = iconPositions[mirroredIndex];
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
                        filter: !isPIR && icon?.category !== 'Sockets' ? ICON_COLOR_FILTERS[panelDesign.iconColor] : undefined,
                        transition: 'filter 0.2s',
                      }}
                    />
              )}
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
        filter: ICON_COLOR_FILTERS[panelDesign.iconColor],
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
                filter: bigIcon?.category !== 'Sockets' ? ICON_COLOR_FILTERS[panelDesign.iconColor] : undefined,
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
                filter: bigIcon2?.category !== 'Sockets' ? ICON_COLOR_FILTERS[panelDesign.iconColor] : undefined,
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
                          filter: !isPIR && icon?.category !== 'Sockets' ? ICON_COLOR_FILTERS[panelDesign.iconColor] : undefined,
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
                          color: panelDesign.textColor || '#000000',
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
                          filter: !isPIR && icon?.category !== 'Sockets' ? ICON_COLOR_FILTERS[panelDesign.iconColor] : undefined,
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
                          color: panelDesign.textColor || '#000000',
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
                          filter: !isPIR && icon?.category !== 'Sockets' ? ICON_COLOR_FILTERS[panelDesign.iconColor] : undefined,
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
                          color: panelDesign.textColor || '#000000',
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
                          filter: !isPIR && icon?.category !== 'Sockets' ? ICON_COLOR_FILTERS[panelDesign.iconColor] : undefined,
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
                          color: panelDesign.textColor || '#000000',
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
                          filter: !isPIR && icon?.category !== 'Sockets' ? ICON_COLOR_FILTERS[panelDesign.iconColor] : undefined,
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
                          color: panelDesign.textColor || '#000000',
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
                          filter: !isPIR && icon?.category !== 'Sockets' ? ICON_COLOR_FILTERS[panelDesign.iconColor] : undefined,
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
                          color: panelDesign.textColor || '#000000',
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
          width: bigIconLayout ? (isVerticalPanel ? '100%' : '60%') : '100%',
          height: bigIconLayout ? (isVerticalPanel ? '50%' : '100%') : '100%',
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
                        filter: !isPIR && icon?.category !== 'Sockets' ? ICON_COLOR_FILTERS[panelDesign.iconColor] : undefined,
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
                        color: panelDesign.textColor || '#000000',
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
  const basePanelStyle = {
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
  const innerGlowStyle = {
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
  if (isSP) {
    // Single Panel - Horizontal layout
    return (
      <div
        style={{
          ...basePanelStyle,
          width: dimensions.width,
          height: dimensions.height,
          display: 'flex',
          flexDirection: 'row',
          gap: 0,
        }}
      >
        <div style={innerGlowStyle} />
        {renderGrid()}
      </div>
    );
  }

  if (isTAG) {
    // Robust lookup for DISPLAY and FAN icons
    const getIconSrc = (key: string) => {
      return (
        (allIcons as any)[key]?.src ||
        (allIcons as any)[key.toUpperCase()]?.src ||
        (allIcons as any)[key.toLowerCase()]?.src ||
        ''
      );
    };
    const displayIcon = {
      src: getIconSrc('DISPLAY'),
      label: 'DISPLAY',
      iconId: 'DISPLAY',
      category: 'TAG',
    };
    const fanIcon = {
      src: getIconSrc('FAN'),
      label: 'FAN',
      iconId: 'FAN',
      category: 'TAG',
    };
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
        {iconPositions.map((pos, index) => {
          let icon = icons.find((i) => i.position === index);
          let forceIcon = null;
          // Cell 4: always DISPLAY
          if (index === 4) forceIcon = displayIcon;
          // Cells 6,7,8: always FAN
          if (index === 6 || index === 7 || index === 8) forceIcon = fanIcon;
            const isPIR = icon?.category === 'PIR';
            const text = (iconTexts && iconTexts[index]) || icon?.text;
          const hasIcon = (icon && icon.src) || forceIcon;
          const iconSize = getIconSize(icon);
          const baseFontSize = textLayout?.fontSize || panelDesign.fontSize || '12px';
          const adjustedFontSize = text ? calculateFontSize(text, parseInt(dimensions.width) / 3, baseFontSize) : baseFontSize;
            return (
              <div
                key={index}
                style={{
                position: 'absolute',
                ...pos,
                width: pos.width || iconSize,
                height: pos.height || iconSize,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: hasIcon ? 'flex-start' : 'center',
                zIndex: 2,
                }}
              >
              {forceIcon ? (
                    <img
                  src={forceIcon.src || '/src/assets/icons/DISPLAY.png'}
                  alt={forceIcon.label}
                      style={{
                    width: iconLayout?.size || '35px',
                    height: iconLayout?.size || '35px',
                        objectFit: 'contain',
                    marginBottom: iconLayout?.spacing || '5px',
                    filter: ICON_COLOR_FILTERS[panelDesign.iconColor] || undefined,
                        transition: 'filter 0.2s',
                      }}
                    />
              ) : hasIcon && (
                    <img
                      src={icon.src}
                      alt={icon.label}
                      style={{
                    width: iconSize,
                    height: iconSize,
                        objectFit: 'contain',
                    marginBottom: iconLayout?.spacing || '5px',
                    marginTop: isPIR ? (specialLayouts?.PIR?.marginTop || '20px') : '0',
                        filter: !isPIR && icon?.category !== 'Sockets' ? ICON_COLOR_FILTERS[panelDesign.iconColor] : undefined,
                        transition: 'filter 0.2s',
                      }}
                    />
              )}
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

  if (isIDPG) {
    // Corridor Panel - 4x4 grid
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
    </div>
  );
};

export default PanelPreview; 