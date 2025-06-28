import React, { useEffect } from 'react';
import { ralColors } from '../data/ralColors';
import { getIconColorName } from '../data/iconColors';

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

  // Determine if this is a double panel (DPH, DPV, etc)
  const isDPH = type === 'DPH';
  const isDPV = type === 'DPV';
  const isX2V = type === 'X2V';
  const isDoublePanel = isDPH || isDPV;

  if (isX2V) {
    const bigIconTop = icons.find(i => i.position === 100);
    const bigIconBottom = icons.find(i => i.position === 101);
    const isReversed = !!panelDesign.isLayoutReversed;
    const BigIconsStack = () => (
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24 }}>
        {bigIconTop && (
          <img
            src={bigIconTop.src}
            alt={bigIconTop.label}
            style={{ maxWidth: '60%', maxHeight: '120px', objectFit: 'contain', display: 'block', margin: '0 auto' }}
          />
        )}
        {bigIconBottom && (
          <img
            src={bigIconBottom.src}
            alt={bigIconBottom.label}
            style={{ maxWidth: '60%', maxHeight: '120px', objectFit: 'contain', display: 'block', margin: '0 auto' }}
          />
        )}
      </div>
    );
    const Grid = () => (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', background: 'none', position: 'relative', zIndex: 2 }}>
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
                width: '33.33%',
                height: '33.33%',
                minHeight: 0,
                minWidth: 0,
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
                bottom: hasIcon ? (icon ? '5px' : '25px') : undefined,
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
    return (
      <div
        style={{
          width: '350px',
          height: '1000px',
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
        {/* Render big icons and grid in correct order */}
        {isReversed ? (
          <>
            <div style={{ flex: '0 0 68%', height: '68%', width: '100%' }}><Grid /></div>
            <div style={{ flex: '0 0 32%', height: '32%', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><BigIconsStack /></div>
          </>
        ) : (
          <>
            <div style={{ flex: '0 0 32%', height: '32%', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><BigIconsStack /></div>
            <div style={{ flex: '0 0 68%', height: '68%', width: '100%' }}><Grid /></div>
          </>
        )}
      </div>
    );
  }

  return (
    <div
      style={{
        width: isDPV ? '350px' : isDPH ? '700px' : '350px',
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
        transform: 'perspective(1000px) rotateX(5deg)',
        transformStyle: 'preserve-3d',
        margin: '0 auto',
        fontFamily: panelDesign.fonts || undefined,
        display: 'flex',
        flexDirection: isDPH ? 'row' : isDPV ? 'column' : 'row',
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
      {/* Content with higher z-index */}
      {(isDoublePanel ? [0, 9] : [0]).map((offset, idx) => (
        <div
          key={offset}
          style={{
            width: isDPV ? '100%' : '350px',
            display: 'flex',
            flexWrap: 'wrap',
            position: 'relative',
            zIndex: 2,
            marginBottom: isDPV && idx === 0 ? '18px' : 0,
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
                  width: '33.33%',
                  minHeight: '100px',
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
                  bottom: hasIcon ? (icon ? '5px' : '25px') : undefined,
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