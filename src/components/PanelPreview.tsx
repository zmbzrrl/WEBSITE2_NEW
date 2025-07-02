import React, { useEffect } from 'react';
import { ralColors } from '../data/ralColors';
import { getIconColorName } from '../data/iconColors';
import { allIcons } from '../assets/iconLibrary';

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

const PanelPreview: React.FC<PanelPreviewProps> = ({ icons, panelDesign, iconTexts, type }) => {
  useEffect(() => {
    if (panelDesign.fonts) {
      loadGoogleFont(panelDesign.fonts);
    }
  }, [panelDesign.fonts]);

  // Determine panel types
  const isDPH = type === 'DPH';
  const isDPV = type === 'DPV';
  const isX2V = type === 'X2V';
  const isX1H = type === 'X1H';
  const isX1V = type === 'X1V';
  const isX2H = type === 'X2H';
  const isTAG = type === 'TAG';
  const isSP = type === 'SP';
  const isDoublePanel = isDPH || isDPV;
  const isExtendedPanel = isX2V || isX1H || isX1V || isX2H;

  // Single Panel (SP) - Independent Layout
  if (isSP) {
    return (
      <div
        style={{
          width: '400px',
          height: '330px',
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
          display: 'flex',
          flexDirection: 'row',
          gap: 0,
        }}
      >
        {/* Inner glow effect */}
        <div
          style={{
            position: 'absolute',
            top: '2px',
            left: '2px',
            right: '2px',
            bottom: '2px',
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, transparent 50%, rgba(0, 0, 0, 0.05) 100%)',
            pointerEvents: 'none',
            zIndex: 1,
          }}
        />
        
        {/* SP Grid */}
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '5px',
            position: 'relative',
            zIndex: 2,
            transform: 'translate(15px, 10px)',
            padding: '10px',
          }}
        >
          {Array.from({ length: 9 }).map((_, index) => {
            const icon = icons.find((i) => i.position === index);
            const isPIR = icon?.category === 'PIR';
            const text = (iconTexts && iconTexts[index]) || icon?.text;
            const hasIcon = icon && icon.src;
            return (
              <div
                key={index}
                style={{
                  width: 'calc(30% - 3.33px)',
                  height: '33.33%',
                  minHeight: 0,
                  minWidth: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: hasIcon ? 'flex-start' : 'center',
                  position: 'relative',
                  paddingTop: hasIcon ? '10px' : 0,
                  margin: '0 -5px',
                  marginTop: (index >= 3 && index <= 5) ? '-11px' : (index >= 6 && index <= 8) ? '-15px' : '0px',
                  transform: (index % 3 === 2) ? 'translateX(30px)' : (index % 3 === 1) ? 'translateX(19px)' : 'none',
                }}
              >
                {hasIcon && (
                  <div style={{ position: 'relative', display: 'inline-block' }}>
                    <img
                      src={icon.src}
                      alt={icon.label}
                      style={{
                        width: isPIR ? '40px' : (icon?.category === 'Bathroom' ? `${parseInt(panelDesign.iconSize || '40px') + 10}px` : panelDesign.iconSize || '40px'),
                        height: isPIR ? '40px' : (icon?.category === 'Bathroom' ? `${parseInt(panelDesign.iconSize || '40px') + 10}px` : panelDesign.iconSize || '40px'),
                        objectFit: 'contain',
                        marginBottom: '5px',
                        position: 'relative',
                        zIndex: 1,
                        marginTop: isPIR ? '20px' : '0',
                        filter: !isPIR ? ICON_COLOR_FILTERS[panelDesign.iconColor] : undefined,
                        transition: 'filter 0.2s',
                      }}
                    />
                  </div>
                )}
                <div style={{
                  position: hasIcon ? 'absolute' : 'static',
                  bottom: hasIcon ? (icon ? '13px' : '33px') : undefined,
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
                        fontSize: panelDesign.fontSize || '12px',
                        color: panelDesign.textColor || '#000000',
                        wordBreak: 'break-word',
                        maxWidth: '100%',
                        textAlign: 'center',
                        padding: '4px',
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

  // Handle TAG (Thermostat) panel
  if (isTAG) {
    // Get the FAN and DISPLAY icons from the icon library
    const fanIcon = (allIcons as any).FAN || { src: '', label: 'FAN', category: 'TAG' };
    const displayIcon = (allIcons as any).DISPLAY || { src: '', label: 'DISPLAY', category: 'TAG' };

    const renderTAGGridCell = (index: number) => {
      const displayIndex = index;
      const isThirdRow = displayIndex >= 6 && displayIndex <= 8;
      const isFourthRow = displayIndex >= 9 && displayIndex <= 11;
      const isFirstRow = displayIndex >= 0 && displayIndex <= 2;
      const isSecondRow = displayIndex >= 3 && displayIndex <= 5;
      
      const icon = icons.find((i) => i.position === displayIndex);
      const text = (iconTexts && iconTexts[displayIndex]) || icon?.text;
      const isPIR = icon?.category === "PIR";
      const isDisplay = icon?.id === "DISPLAY";

      // Special margin for cells 9 and 11
      let cellMargin;
      if (displayIndex === 9 || displayIndex === 11) {
        cellMargin = '-60px 5px 5px 5px';
      } else if (isFourthRow) {
        cellMargin = '-30px 5px 5px 5px';
      } else if (isThirdRow) {
        cellMargin = '-30px 5px 5px 5px';
      } else if (isFirstRow) {
        cellMargin = '0px 5px 5px 5px';
      } else if (isSecondRow) {
        cellMargin = '-35px 5px 5px 5px';
      } else {
        cellMargin = '5px 5px 5px 5px';
      }

      return (
        <div
          key={index}
          style={{
            width: "calc(30% - 3.33px)",
            height: "100px",
            display: "inline-block",
            textAlign: "center",
            background: "transparent",
            margin: cellMargin,
            position: "relative",
            boxSizing: "border-box",
            verticalAlign: "top",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "flex-start",
              position: "relative",
              height: "100%",
              paddingTop: "10px",
            }}
          >
            {/* Permanent DISPLAY icon in cell 4 */}
            {displayIndex === 4 && (
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <img
                  src={displayIcon.src}
                  alt="DISPLAY"
                  style={{
                    width: "240px",
                    height: "80px",
                    objectFit: "contain",
                    position: "absolute",
                    left: "-60px",
                    zIndex: 2,
                    filter: ICON_COLOR_FILTERS[panelDesign.iconColor] || ICON_COLOR_FILTERS['#000000'],
                    transition: 'filter 0.2s',
                  }}
                />
              </div>
            )}

            {/* Always show FAN icon in third row */}
            {isThirdRow && fanIcon.src && (
              <div style={{ position: "relative", display: "inline-block" }}>
                <img
                  src={fanIcon.src}
                  alt="FAN"
                  style={{
                    width: displayIndex === 6 ? "45px" : displayIndex === 7 ? "58px" : "65px",
                    height: displayIndex === 6 ? "45px" : displayIndex === 7 ? "58px" : "65px",
                    objectFit: "contain",
                    marginBottom: "5px",
                    position: "relative",
                    zIndex: 1,
                    filter: ICON_COLOR_FILTERS[panelDesign.iconColor] || ICON_COLOR_FILTERS['#000000'],
                    transition: 'filter 0.2s',
                    top: displayIndex === 6 ? "10px" : displayIndex === 7 ? "6px" : undefined,
                  }}
                />
              </div>
            )}

            {/* Render other icons */}
            {!isThirdRow && icon && displayIndex !== 4 && icon.src && (
              <div style={{ position: "relative", display: "inline-block" }}>
                <img
                  src={icon.src}
                  alt={icon.label}
                  style={{
                    width: isPIR ? "40px" : isDisplay ? "180px" : "40px",
                    height: isPIR ? "40px" : isDisplay ? "60px" : "40px",
                    objectFit: "contain",
                    marginBottom: "5px",
                    position: "relative",
                    zIndex: 1,
                    marginTop: isPIR ? "20px" : "0",
                    filter: !isPIR ? ICON_COLOR_FILTERS[panelDesign.iconColor] : undefined,
                    transition: 'filter 0.2s',
                  }}
                />
              </div>
            )}

            {/* Text display */}
            <div style={{
              position: icon ? 'absolute' : 'static',
              bottom: icon ? '8px' : '28px',
              left: icon ? '50%' : undefined,
              transform: icon ? 'translateX(-50%)' : undefined,
              width: '90%',
              zIndex: 0,
              display: icon ? undefined : 'flex',
              alignItems: icon ? undefined : 'center',
              justifyContent: icon ? undefined : 'center',
              height: icon ? undefined : '100%',
            }}>
              {!isPIR && text && (
                <div
                  style={{
                    fontSize: panelDesign.fontSize || '12px',
                    color: panelDesign.textColor || '#000000',
                    wordBreak: 'break-word',
                    maxWidth: '100%',
                    textAlign: 'center',
                    padding: '4px',
                    borderRadius: '4px',
                    fontFamily: panelDesign.fonts || undefined,
                  }}
                >
                  {text}
                </div>
              )}
            </div>
          </div>
        </div>
      );
    };

    return (
      <div
        style={{
          width: '400px',
          height: '330px',
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
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 0,
          overflow: 'hidden',
        }}
      >
        {/* Inner glow effect */}
        <div
          style={{
            position: 'absolute',
            top: '2px',
            left: '2px',
            right: '2px',
            bottom: '2px',
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, transparent 50%, rgba(0, 0, 0, 0.05) 100%)',
            pointerEvents: 'none',
            zIndex: 1,
          }}
        />
        
        {/* TAG Grid */}
        <div style={{ 
          width: '100%',
          height: '100%',
          position: "relative",
          zIndex: 2,
        }}>
          {Array.from({ length: 12 }).map((_, index) => renderTAGGridCell(index))}
        </div>
      </div>
    );
  }

  // Handle extended panels (X1H, X1V, X2H, X2V) except X2V which is handled above
  if (isExtendedPanel && !isX2V) {
    const bigIcon = icons.find(i => i.position === 100);
    const bigIcon2 = icons.find(i => i.position === 101); // For X2H
    const isReversed = !!panelDesign.isLayoutReversed;
    const isVerticalPanel = isX1V; // Only X1V is vertical among extended panels

    // Debug logging
    console.log('Extended Panel Debug:', {
      type,
      bigIcon,
      bigIcon2,
      allIcons: icons,
      bigIconSrc: bigIcon?.src,
      bigIcon2Src: bigIcon2?.src,
      bigIconLabel: bigIcon?.label,
      bigIcon2Label: bigIcon2?.label,
      panelDesignIconColor: panelDesign.iconColor,
      isReversed,
      isVerticalPanel,
      fullPanelDesign: panelDesign,
      filterValue: panelDesign.iconColor && 
                   panelDesign.iconColor !== '#000000' && 
                   panelDesign.iconColor !== '#FFFFFF'
        ? ICON_COLOR_FILTERS[panelDesign.iconColor] 
        : 'none'
    });

    const getBigIconSrc = () => {
      if (!bigIcon || !bigIcon.src) return null;
      try {
        return new URL(bigIcon.src, import.meta.url).href;
      } catch (error) {
        console.error('Error creating URL for big icon:', error);
        return bigIcon.src;
      }
    };

    const getBigIcon2Src = () => {
      if (!bigIcon2 || !bigIcon2.src) return null;
      try {
        return new URL(bigIcon2.src, import.meta.url).href;
      } catch (error) {
        console.error('Error creating URL for big icon 2:', error);
        return bigIcon2.src;
      }
    };

    const bigIconSrc = getBigIconSrc();
    const bigIcon2Src = getBigIcon2Src();

    // Special BigIconContainer for X2H with two icons side by side
    const BigIconContainer = () => {
      if (isX2H) {
        // X2H has two big icons side by side
        return (
          <div style={{ 
            width: '50%', 
            height: '100%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            position: 'relative',
            zIndex: 2,
            gap: '40px',
            transform: isReversed ? 'translateX(-30px)' : 'translateX(100px)'
          }}>
            {/* First big icon */}
            {bigIcon && bigIconSrc && (
              <img
                src={bigIconSrc}
                alt={bigIcon.label || 'Big Icon 1'}
                style={{ 
                  maxWidth: '67.5%', 
                  maxHeight: '375px', 
                  objectFit: 'contain', 
                  display: 'block',
                  filter: panelDesign.iconColor && 
                         panelDesign.iconColor !== '#000000' && 
                         panelDesign.iconColor !== '#FFFFFF'
                    ? ICON_COLOR_FILTERS[panelDesign.iconColor] 
                    : 'none',
                  transition: 'filter 0.2s',
                }}
                onError={(e) => {
                  console.error('Failed to load big icon 1:', bigIconSrc, 'Original src:', bigIcon.src);
                  e.currentTarget.style.display = 'none';
                }}
                onLoad={() => {
                  console.log('Big icon 1 loaded successfully:', bigIconSrc);
                }}
              />
            )}
            {/* Second big icon */}
            {bigIcon2 && bigIcon2Src && (
              <img
                src={bigIcon2Src}
                alt={bigIcon2.label || 'Big Icon 2'}
                style={{ 
                  maxWidth: '67.5%', 
                  maxHeight: '375px', 
                  objectFit: 'contain', 
                  display: 'block',
                  filter: panelDesign.iconColor && 
                         panelDesign.iconColor !== '#000000' && 
                         panelDesign.iconColor !== '#FFFFFF'
                    ? ICON_COLOR_FILTERS[panelDesign.iconColor] 
                    : 'none',
                  transition: 'filter 0.2s',
                }}
                onError={(e) => {
                  console.error('Failed to load big icon 2:', bigIcon2Src, 'Original src:', bigIcon2.src);
                  e.currentTarget.style.display = 'none';
                }}
                onLoad={() => {
                  console.log('Big icon 2 loaded successfully:', bigIcon2Src);
                }}
              />
            )}
            {(!bigIcon || !bigIconSrc) && (!bigIcon2 || !bigIcon2Src) && (
              <div style={{
                color: '#999',
                fontSize: '14px',
                textAlign: 'center',
                fontStyle: 'italic'
              }}>
                No big icons
              </div>
            )}
          </div>
        );
      } else if (isVerticalPanel) {
        // X1V - Single big icon for vertical layout
        return (
          <div style={{ 
            width: '100%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            position: 'relative',
            zIndex: 2
          }}>
            {bigIcon && bigIconSrc && (
              <img
                src={bigIconSrc}
                alt={bigIcon.label || 'Big Icon'}
                style={{ 
                  maxWidth: '120%', 
                  maxHeight: '225px', 
                  objectFit: 'contain', 
                  display: 'block',
                  filter: panelDesign.iconColor && 
                         panelDesign.iconColor !== '#000000' && 
                         panelDesign.iconColor !== '#FFFFFF'
                    ? ICON_COLOR_FILTERS[panelDesign.iconColor] 
                    : 'none',
                  transition: 'filter 0.2s',
                }}
                onError={(e) => {
                  console.error('Failed to load big icon:', bigIconSrc, 'Original src:', bigIcon.src);
                  e.currentTarget.style.display = 'none';
                }}
                onLoad={() => {
                  console.log('Big icon loaded successfully:', bigIconSrc);
                }}
              />
            )}
            {(!bigIcon || !bigIconSrc) && (
              <div style={{
                color: '#999',
                fontSize: '14px',
                textAlign: 'center',
                fontStyle: 'italic'
              }}>
                No big icon
              </div>
            )}
          </div>
        );
      } else {
        // X1H - Single big icon for horizontal layout
        return (
          <div style={{ 
            width: '50%', 
            height: '100%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            position: 'relative',
            zIndex: 2,
            transform: 'translateX(40px)'
          }}>
            {bigIcon && bigIconSrc && (
              <img
                src={bigIconSrc}
                alt={bigIcon.label || 'Big Icon'}
                style={{ 
                  maxWidth: '80%', 
                  maxHeight: '200px', 
                  objectFit: 'contain', 
                  display: 'block',
                  filter: panelDesign.iconColor && 
                         panelDesign.iconColor !== '#000000' && 
                         panelDesign.iconColor !== '#FFFFFF'
                    ? ICON_COLOR_FILTERS[panelDesign.iconColor] 
                    : 'none',
                  transition: 'filter 0.2s',
                }}
                onError={(e) => {
                  console.error('Failed to load big icon:', bigIconSrc, 'Original src:', bigIcon.src);
                  e.currentTarget.style.display = 'none';
                }}
                onLoad={() => {
                  console.log('Big icon loaded successfully:', bigIconSrc);
                }}
              />
            )}
            {(!bigIcon || !bigIconSrc) && (
              <div style={{
                color: '#999',
                fontSize: '14px',
                textAlign: 'center',
                fontStyle: 'italic'
              }}>
                No big icon
              </div>
            )}
          </div>
        );
      }
    };

    const Grid = () => (
      <div style={{ 
        width: '100%', 
        height: '100%', 
        display: 'flex', 
        flexWrap: 'wrap', 
        alignItems: 'center', 
        justifyContent: 'center', 
        background: 'none', 
        position: 'relative', 
        zIndex: 2,
        // Move grid down by 20px for X2H panels, 30px to the right when on the right side, and 30px to the left when on the left side
        transform: isX2H ? (isReversed ? 'translate(-30px, 20px)' : 'translate(30px, 20px)') : 'none'
      }}>
        {Array.from({ length: 9 }).map((_, index) => {
          const cellIndex = index;
          const icon = icons.find((i) => i.position === cellIndex);
          const isPIR = icon?.category === 'PIR';
          const text = (iconTexts && iconTexts[cellIndex]) || icon?.text;
          const hasIcon = icon && icon.src;
          return (
            <div
              key={cellIndex}
              style={{
                width: 'calc(30% - 3.33px)',
                height: type === 'X1V' ? '2%' : '33.33%',
                minHeight: 0,
                minWidth: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: hasIcon ? 'flex-start' : 'center',
                position: 'relative',
                paddingTop: hasIcon ? '10px' : 0,
                margin: type === 'X1V' ? '0 -2.5px' : '0 -5px',
                transform:
                  isX2H
                    ? (cellIndex % 3 === 0
                        ? 'translateX(30px)'
                        : cellIndex % 3 === 1
                        ? 'translateX(20px)'
                        : 'none')
                    : (cellIndex % 3 === 2
                        ? 'translateX(30px)'
                        : cellIndex % 3 === 1
                        ? 'translateX(19px)'
                        : 'none'),
              }}
            >
              {hasIcon && (
                <div style={{ position: 'relative', display: 'inline-block' }}>
                  <img
                    src={icon.src}
                    alt={icon.label}
                    style={{
                      width: isPIR ? '40px' : (icon?.category === 'Bathroom' ? `${parseInt(panelDesign.iconSize || '40px') + 10}px` : panelDesign.iconSize || '40px'),
                      height: isPIR ? '40px' : (icon?.category === 'Bathroom' ? `${parseInt(panelDesign.iconSize || '40px') + 10}px` : panelDesign.iconSize || '40px'),
                      objectFit: 'contain',
                      marginBottom: '5px',
                      position: 'relative',
                      zIndex: 1,
                      marginTop: isPIR ? '20px' : '0',
                      filter: !isPIR ? ICON_COLOR_FILTERS[panelDesign.iconColor] : undefined,
                      transition: 'filter 0.2s',
                    }}
                  />
                </div>
              )}
              <div style={{
                position: hasIcon ? 'absolute' : 'static',
                bottom: hasIcon ? (icon ? '8px' : '28px') : undefined,
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
                      fontSize: panelDesign.fontSize || '12px',
                      color: panelDesign.textColor || '#000000',
                      wordBreak: 'break-word',
                      maxWidth: '100%',
                      textAlign: 'center',
                      padding: '4px',
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

    // Special handling for X1V - use proper vertical layout like X2V
    if (isVerticalPanel) {
      return (
        <div
          style={{
            width: '400px',
            height: '700px',
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
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 0,
            overflow: 'hidden',
          }}
        >
          {/* Inner glow effect */}
          <div
            style={{
              position: 'absolute',
              top: '2px',
              left: '2px',
              right: '2px',
              bottom: '2px',
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, transparent 50%, rgba(0, 0, 0, 0.05) 100%)',
              pointerEvents: 'none',
              zIndex: 1,
            }}
          />
          {/* Render big icon and grid in correct order */}
          {isReversed ? (
            <>
              <div style={{ flex: '0 0 60%', height: '60%', width: '100%', marginTop: type === 'X1V' ? '-30px' : '0px' }}><Grid /></div>
              <div style={{ flex: '0 0 40%', height: '40%', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: type === 'X1V' ? '-10px' : '0px' }}><BigIconContainer /></div>
            </>
          ) : (
            <>
              <div style={{ flex: '0 0 40%', height: '40%', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: type === 'X1V' ? '20px' : '0px' }}><BigIconContainer /></div>
              <div style={{ flex: '0 0 60%', height: '60%', width: '100%', marginTop: type === 'X1V' ? '-50px' : '0px' }}><Grid /></div>
            </>
          )}
        </div>
      );
    }

    return (
      <div
        style={{
          width: isX2H ? '850px' : '750px',
          height: '350px',
          background: `linear-gradient(135deg, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.1) 50%, rgba(255, 255, 255, 0.05) 100%), ${hexToRgba(panelDesign.backgroundColor, 0.9)}`,
          padding: '15px',
          border: '2px solid rgba(255, 255, 255, 0.2)',
          borderTop: '3px solid rgba(255, 255, 255, 0.4)',
          borderLeft: '3px solid rgba(255, 255, 255, 0.3)',
          boxShadow: `0 20px 40px rgba(0, 0, 0, 0.3), 0 8px 16px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.4), inset 0 -1px 0 rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.1)`,
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          transition: 'all 0.3s ease',
          position: 'relative',
          transform: 'perspective(1000px) rotateX(2deg)',
          transformStyle: 'preserve-3d',
          margin: '0 auto',
          fontFamily: panelDesign.fonts || undefined,
          display: 'flex',
          flexDirection: 'row',
          gap: 0,
        }}
      >
        {/* Inner glow effect */}
        <div
          style={{
            position: 'absolute',
            top: '2px',
            left: '2px',
            right: '2px',
            bottom: '2px',
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, transparent 50%, rgba(0, 0, 0, 0.05) 100%)',
            pointerEvents: 'none',
            zIndex: 1,
          }}
        />
        
        {/* Horizontal panel layout (X1H, X2H) - left/right */}
        {isReversed ? (
          <>
            <Grid />
            <BigIconContainer />
          </>
        ) : (
          <>
            <BigIconContainer />
            <Grid />
          </>
        )}
      </div>
    );
  }

  // Double Panel - H (DPH) - Independent Layout
  if (isDPH) {
    return (
      <div
        style={{
          width: '750px',
          height: '350px',
          background: `linear-gradient(135deg, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.1) 50%, rgba(255, 255, 255, 0.05) 100%), ${hexToRgba(panelDesign.backgroundColor, 0.9)}`,
          padding: '15px',
          border: '2px solid rgba(255, 255, 255, 0.2)',
          borderTop: '3px solid rgba(255, 255, 255, 0.4)',
          borderLeft: '3px solid rgba(255, 255, 255, 0.3)',
          boxShadow: `0 20px 40px rgba(0, 0, 0, 0.3), 0 8px 16px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.4), inset 0 -1px 0 rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.1)`,
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          transition: 'all 0.3s ease',
          position: 'relative',
          transform: 'perspective(1000px) rotateX(2deg)',
          transformStyle: 'preserve-3d',
          margin: '0 auto',
          fontFamily: panelDesign.fonts || undefined,
          display: 'flex',
          flexDirection: 'row',
          gap: '10px',
        }}
      >
        {/* Inner glow effect */}
        <div
          style={{
            position: 'absolute',
            top: '2px',
            left: '2px',
            right: '2px',
            bottom: '2px',
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, transparent 50%, rgba(0, 0, 0, 0.05) 100%)',
            pointerEvents: 'none',
            zIndex: 1,
          }}
        />
        
        {/* DPH Left Grid */}
        <div
          style={{
            width: 'calc(50% - 5px)',
            height: '100%',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '5px',
            position: 'relative',
            zIndex: 2,
            transform: 'translate(10px, 20px)',
          }}
        >
          {Array.from({ length: 9 }).map((_, index) => {
            const icon = icons.find((i) => i.position === index);
            const isPIR = icon?.category === 'PIR';
            const text = (iconTexts && iconTexts[index]) || icon?.text;
            const hasIcon = icon && icon.src;
            return (
              <div
                key={index}
                style={{
                  width: 'calc(30% - 3.33px)',
                  height: '33.33%',
                  minHeight: 0,
                  minWidth: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: hasIcon ? 'flex-start' : 'center',
                  position: 'relative',
                  paddingTop: hasIcon ? '10px' : 0,
                  margin: '0 -5px',
                  transform: (index % 3 === 2) ? 'translateX(25px)' : (index % 3 === 1) ? 'translateX(15px)' : 'none',
                }}
              >
                {hasIcon && (
                  <div style={{ position: 'relative', display: 'inline-block' }}>
                    <img
                      src={icon.src}
                      alt={icon.label}
                      style={{
                        width: isPIR ? '40px' : (icon?.category === 'Bathroom' ? `${parseInt(panelDesign.iconSize || '40px') + 10}px` : panelDesign.iconSize || '40px'),
                        height: isPIR ? '40px' : (icon?.category === 'Bathroom' ? `${parseInt(panelDesign.iconSize || '40px') + 10}px` : panelDesign.iconSize || '40px'),
                        objectFit: 'contain',
                        marginBottom: '5px',
                        position: 'relative',
                        zIndex: 1,
                        marginTop: isPIR ? '20px' : '0',
                        filter: !isPIR ? ICON_COLOR_FILTERS[panelDesign.iconColor] : undefined,
                        transition: 'filter 0.2s',
                      }}
                    />
                  </div>
                )}
                <div style={{
                  position: hasIcon ? 'absolute' : 'static',
                  bottom: hasIcon ? (icon ? '8px' : '28px') : undefined,
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
                        fontSize: panelDesign.fontSize || '12px',
                        color: panelDesign.textColor || '#000000',
                        wordBreak: 'break-word',
                        maxWidth: '100%',
                        textAlign: 'center',
                        padding: '4px',
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

        {/* DPH Right Grid */}
        <div
          style={{
            width: 'calc(50% - 5px)',
            height: '100%',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '5px',
            position: 'relative',
            zIndex: 2,
            transform: 'translate(10px, 20px)',
          }}
        >
          {Array.from({ length: 9 }).map((_, index) => {
            const icon = icons.find((i) => i.position === index + 9);
            const isPIR = icon?.category === 'PIR';
            const text = (iconTexts && iconTexts[index + 9]) || icon?.text;
            const hasIcon = icon && icon.src;
            return (
              <div
                key={index + 9}
                style={{
                  width: 'calc(30% - 3.33px)',
                  height: '33.33%',
                  minHeight: 0,
                  minWidth: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: hasIcon ? 'flex-start' : 'center',
                  position: 'relative',
                  paddingTop: hasIcon ? '10px' : 0,
                  margin: '0 -5px',
                  transform: (index % 3 === 2) ? 'translateX(25px)' : (index % 3 === 1) ? 'translateX(15px)' : 'none',
                }}
              >
                {hasIcon && (
                  <div style={{ position: 'relative', display: 'inline-block' }}>
                    <img
                      src={icon.src}
                      alt={icon.label}
                      style={{
                        width: isPIR ? '40px' : (icon?.category === 'Bathroom' ? `${parseInt(panelDesign.iconSize || '40px') + 10}px` : panelDesign.iconSize || '40px'),
                        height: isPIR ? '40px' : (icon?.category === 'Bathroom' ? `${parseInt(panelDesign.iconSize || '40px') + 10}px` : panelDesign.iconSize || '40px'),
                        objectFit: 'contain',
                        marginBottom: '5px',
                        position: 'relative',
                        zIndex: 1,
                        marginTop: isPIR ? '20px' : '0',
                        filter: !isPIR ? ICON_COLOR_FILTERS[panelDesign.iconColor] : undefined,
                        transition: 'filter 0.2s',
                      }}
                    />
                  </div>
                )}
                <div style={{
                  position: hasIcon ? 'absolute' : 'static',
                  bottom: hasIcon ? (icon ? '8px' : '28px') : undefined,
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
                        fontSize: panelDesign.fontSize || '12px',
                        color: panelDesign.textColor || '#000000',
                        wordBreak: 'break-word',
                        maxWidth: '100%',
                        textAlign: 'center',
                        padding: '4px',
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

  return (
    <div
      style={{
        width: isDPV ? '400px' : isDPH ? '750px' : '400px',
        height: isDPV ? '700px' : isDPH ? '350px' : '330px',
        background: `linear-gradient(135deg, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.1) 50%, rgba(255, 255, 255, 0.05) 100%), ${hexToRgba(panelDesign.backgroundColor, 0.9)}`,
        padding: isDPV ? '15px' : isDPH ? '15px' : '0',
        border: '2px solid rgba(255, 255, 255, 0.2)',
        borderTop: '3px solid rgba(255, 255, 255, 0.4)',
        borderLeft: '3px solid rgba(255, 255, 255, 0.3)',
        boxShadow: `0 20px 40px rgba(0, 0, 0, 0.3), 0 8px 16px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.4), inset 0 -1px 0 rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.1)`,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        transition: 'all 0.3s ease',
        position: 'relative',
        transform: !isDoublePanel ? 'translate(30px, 15px)' : isDPH ? 'translate(40px, 20px)' : isDPV ? 'translateX(15px)' : 'none',
        transformStyle: isDPV ? 'preserve-3d' : isDPH ? 'preserve-3d' : 'flat',
        margin: '0 auto',
        fontFamily: panelDesign.fonts || undefined,
        display: 'flex',
        flexDirection: isDPH ? 'row' : isDPV ? 'column' : 'row',
        gap: isDPH ? '10px' : isDPV ? '20px' : 0,
      }}
    >
      {/* Inner glow effect */}
      <div
        style={{
          position: 'absolute',
          top: '2px',
          left: '2px',
          right: '2px',
          bottom: '2px',
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, transparent 50%, rgba(0, 0, 0, 0.05) 100%)',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />
      {/* Content with higher z-index */}
      {(isDoublePanel ? [0, 9] : [0]).map((offset, idx) => (
        <div
          key={offset}
          style={{
            width: isDPV ? '100%' : isDPH ? 'calc(50% - 5px)' : '400px',
            height: isDPV ? 'calc(50% - 10px)' : undefined,
            display: 'flex',
            flexWrap: 'wrap',
            gap: '5px',
            position: 'relative',
            zIndex: 2,
            marginBottom: 0,
            // Move grid 30px to the right and 15px to the bottom for Single Panel (SP) type
            transform: !isDoublePanel ? 'translate(30px, 15px)' : isDPH ? 'translate(40px, 20px)' : isDPV ? 'translateX(15px)' : 'none',
          }}
        >
          {Array.from({ length: 9 }).map((_, index) => {
            const cellIndex = index + offset;
            const icon = icons.find((i) => i.position === cellIndex);
            const isPIR = icon?.category === 'PIR';
            const text = (iconTexts && iconTexts[cellIndex]) || icon?.text;
            const hasIcon = icon && icon.src;
            return (
              <div
                key={cellIndex}
                style={{
                  width: 'calc(30% - 3.33px)',
                  height: type === 'X1V' ? '2%' : '33.33%',
                  minHeight: 0,
                  minWidth: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: hasIcon ? 'flex-start' : 'center',
                  position: 'relative',
                  paddingTop: hasIcon ? '10px' : 0,
                  margin: type === 'X1V' ? '0 -2.5px' : '0 -5px',
                  transform: (cellIndex % 3 === 2) ? 'translateX(30px)' : (cellIndex % 3 === 1) ? 'translateX(19px)' : 'none',
                }}
              >
                {hasIcon && (
                  <div style={{ position: 'relative', display: 'inline-block' }}>
                    <img
                      src={icon.src}
                      alt={icon.label}
                      style={{
                        width: isPIR ? '40px' : (icon?.category === 'Bathroom' ? `${parseInt(panelDesign.iconSize || '40px') + 10}px` : panelDesign.iconSize || '40px'),
                        height: isPIR ? '40px' : (icon?.category === 'Bathroom' ? `${parseInt(panelDesign.iconSize || '40px') + 10}px` : panelDesign.iconSize || '40px'),
                        objectFit: 'contain',
                        marginBottom: '5px',
                        position: 'relative',
                        zIndex: 1,
                        marginTop: isPIR ? '20px' : '0',
                        filter: !isPIR ? ICON_COLOR_FILTERS[panelDesign.iconColor] : undefined,
                        transition: 'filter 0.2s',
                      }}
                    />
                  </div>
                )}
                <div style={{
                  position: hasIcon ? 'absolute' : 'static',
                  bottom: hasIcon ? (icon ? '13px' : '33px') : undefined,
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
                        fontSize: panelDesign.fontSize || '12px',
                        color: panelDesign.textColor || '#000000',
                        wordBreak: 'break-word',
                        maxWidth: '100%',
                        textAlign: 'center',
                        padding: '4px',
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
      ))}
    </div>
  );
};

export default PanelPreview; 