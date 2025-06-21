// Import necessary libraries and components
import React, { useState, useEffect, useRef } from "react";
import { useCart } from "../../contexts/CartContext";
import "./Customizer.css";
import CartButton from "../../components/CartButton";
import { useNavigate } from "react-router-dom";
import logo2 from "../../assets/logo2.png";
import {
  Container,
  Typography,
  Box,
  Button,
  LinearProgress,
  useTheme,
  TextField,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { ralColors, RALColor } from '../../data/ralColors';

const ProgressContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  maxWidth: 800,
  margin: '0 auto',
  padding: theme.spacing(3),
  marginBottom: theme.spacing(6),
}));

const ProgressText = styled(Typography)(({ theme }) => ({
  color: '#1a1f2c',
  fontWeight: 400,
  marginBottom: theme.spacing(2),
  letterSpacing: '0.5px',
  fontFamily: '"Myriad Hebrew", "Monsal Gothic", sans-serif',
}));

const ProgressSteps = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.spacing(2),
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    height: '2px',
    backgroundColor: 'rgba(26, 31, 44, 0.1)',
    zIndex: 0,
  },
}));

const ProgressStep = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  position: 'relative',
  zIndex: 1,
}));

const StepNumber = styled(Box)<{ completed?: boolean; current?: boolean }>(({ theme, completed, current }) => ({
  width: '32px',
  height: '32px',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: theme.spacing(1),
  backgroundColor: completed ? '#1a1f2c' : current ? '#ffffff' : 'rgba(26, 31, 44, 0.1)',
  color: completed || current ? '#1a1f2c' : 'rgba(26, 31, 44, 0.5)',
  border: current ? '2px solid #1a1f2c' : 'none',
  fontFamily: '"Myriad Hebrew", "Monsal Gothic", sans-serif',
  fontWeight: 400,
}));

const StepLabel = styled(Typography)<{ completed?: boolean; current?: boolean }>(({ theme, completed, current }) => ({
  color: completed ? '#1a1f2c' : current ? '#1a1f2c' : 'rgba(26, 31, 44, 0.5)',
  fontSize: '14px',
  fontWeight: current ? 500 : 400,
  textAlign: 'center',
  fontFamily: '"Myriad Hebrew", "Monsal Gothic", sans-serif',
  letterSpacing: '0.5px',
}));

const StyledButton = styled(Button)(({ theme }) => ({
  textTransform: 'none',
  fontWeight: 400,
  letterSpacing: '0.5px',
  fontFamily: '"Myriad Hebrew", "Monsal Gothic", sans-serif',
  padding: '8px 24px',
  borderRadius: '4px',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
  },
}));

// Define types
interface IconOption {
  id: string;
  src: string;
  label: string;
  category: string;
}

interface PlacedIcon {
  id: number;
  iconId: string;
  src: string;
  label: string;
  position: number;
  category: string;
}

interface GridCellProps {
  index: number;
  onDrop: (index: number, iconId: string) => void;
  children: React.ReactNode;
}

interface IconTexts {
  [key: number]: string;
}

interface DesignIcon {
  iconId: string | null;
  src: string;
  label: string;
  position: number;
  text: string;
}

interface Design {
  type: string;
  icons: DesignIcon[];
  quantity: number;
}

// Component for each grid cell
const GridCell: React.FC<GridCellProps> = ({ index, onDrop, children }) => {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const iconId = e.dataTransfer.getData('text/plain');
    onDrop(index, iconId);
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      style={{
        width: "30%",
        height: "100px",
        display: "inline-block",
        textAlign: "center",
        background: "transparent",
        margin: "5px",
        position: "relative",
        boxSizing: "border-box",
        verticalAlign: "top",
        cursor: "copy",
      }}
    >
      {children}
    </div>
  );
};

// Google Fonts API key (for demo, you should use your own key for production)
const GOOGLE_FONTS_API_KEY = 'AIzaSyDQngnSe6or2muwiDaov5HV02fk-4OiZaM';

// Fallback font list if API fails
const FALLBACK_GOOGLE_FONTS = [
  'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Poppins', 'Oswald', 'Raleway', 'Merriweather', 'Nunito', 'Quicksand', 'Source Sans Pro', 'Inter',
];

// Helper to load Google Font dynamically
function loadGoogleFont(font: string) {
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

const hexToRgba = (hex: string, alpha: number): string => {
  if (!hex) return `rgba(255, 255, 255, ${alpha})`;
  hex = hex.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const SPCustomizer: React.FC = () => {
  const cartContext = useCart();
  const navigate = useNavigate();
  const [icons, setIcons] = useState<Record<string, any>>({});
  const [iconCategories, setIconCategories] = useState<string[]>([]);

  useEffect(() => {
    import("../../assets/iconLibrary").then((module) => {
      setIcons(module.default);
      setIconCategories(module.iconCategories);
    });
  }, []);

  if (!cartContext) {
    throw new Error("CartContext must be used within a CartProvider");
  }

  const { addToCart } = cartContext;
  const [selectedIcon, setSelectedIcon] = useState<IconOption | null>(null);
  const [placedIcons, setPlacedIcons] = useState<PlacedIcon[]>([]);
  const [iconTexts, setIconTexts] = useState<IconTexts>({});
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [hoveredCell, setHoveredCell] = useState<number | null>(null);
  const [editingCell, setEditingCell] = useState<number | null>(null);
  const iconNames = Array.from(new Set(placedIcons.map(icon => icon.iconId)));
  const [currentStep, setCurrentStep] = useState(2); // 2, 3, or 4

  const ICON_COLOR_FILTERS: { [key: string]: string } = {
    '#000000': 'brightness(0) saturate(100%)',
    '#FFFFFF': 'brightness(0) saturate(100%) invert(1)',
    '#808080': 'brightness(0) saturate(100%) invert(52%) sepia(0%) saturate(0%) hue-rotate(148deg) brightness(99%) contrast(91%)',
    '#FF0000': 'brightness(0) saturate(100%) invert(13%) sepia(93%) saturate(7464%) hue-rotate(0deg) brightness(113%) contrast(109%)',
    '#0000FF': 'brightness(0) saturate(100%) invert(8%) sepia(100%) saturate(6495%) hue-rotate(247deg) brightness(98%) contrast(141%)',
    '#008000': 'brightness(0) saturate(100%) invert(23%) sepia(98%) saturate(3025%) hue-rotate(101deg) brightness(94%) contrast(104%)',
  };

  useEffect(() => {
    if (iconCategories.length > 0) {
      setSelectedCategory(iconCategories[0]);
    }
  }, [iconCategories]);

  const handlePlaceIcon = (cellIndex: number): void => {
    const isOccupied = placedIcons.some((icon) => icon.position === cellIndex);
    if (isOccupied || selectedIcon === null) return;

    // Check if trying to place PIR icon
    if (selectedIcon.category === "PIR") {
      // Only allow placement in middle cell (4) or bottom middle cell (7)
      if (cellIndex !== 4 && cellIndex !== 7) return;
      
      // Check if PIR icon is already placed
      const hasPIR = placedIcons.some((icon) => icon.category === "PIR");
      if (hasPIR) return;
    }

    const iconPosition: PlacedIcon = {
      id: Date.now(),
      iconId: selectedIcon.id,
      src: selectedIcon.src,
      label: selectedIcon.label,
      position: cellIndex,
      category: selectedIcon.category
    };

    setPlacedIcons((prev) => [...prev, iconPosition]);
    setSelectedIcon(null);
  };

  const handleIconClick = (icon: IconOption): void => {
    setSelectedIcon(icon);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>, cellIndex: number): void => {
    const newText = e.target.value;
    setIconTexts((prev) => ({
      ...prev,
      [cellIndex]: newText,
    }));
  };

  const handleDeleteIcon = (id: number): void => {
    setPlacedIcons((prev) => prev.filter((icon) => icon.id !== id));
  };

  const handleAddToCart = (): void => {
    const design: Design = {
      type: "SP",
      icons: Array.from({ length: 9 })
        .map((_, index) => {
          const icon = placedIcons.find((i) => i.position === index);
          return {
            iconId: icon?.iconId || null,
            src: icon?.src || "",
            label: icon?.label || "",
            position: index,
            text: iconTexts[index] || "",
          };
        })
        .filter((entry) => entry.iconId || entry.text),
      quantity: 1,
    };
    addToCart(design);
  };

  // Filter icons by selected category
  const categoryIcons = Object.entries(icons)
    .filter(([_, icon]) => icon.category === selectedCategory)
    .map(([id, icon]) => ({
      id,
      src: icon.src,
      label: icon.label,
      category: icon.category
    }));

  const handleDragStart = (e: React.DragEvent, icon: IconOption | PlacedIcon) => {
    if ('position' in icon) {
      // This is a placed icon
      e.dataTransfer.setData('text/plain', JSON.stringify({
        type: 'placed',
        id: icon.id,
        position: icon.position
      }));
    } else {
      // This is a new icon from the selection
      e.dataTransfer.setData('text/plain', JSON.stringify({
        type: 'new',
        id: icon.id
      }));
    }
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDrop = (cellIndex: number, data: string) => {
    try {
      const dragData = JSON.parse(data);
      
      if (dragData.type === 'new') {
        // Handle new icon placement
        const icon = categoryIcons.find(i => i.id === dragData.id);
        if (!icon) return;

        // Check if trying to place PIR icon
        if (icon.category === "PIR") {
          if (cellIndex !== 4 && cellIndex !== 7) return;
          const hasPIR = placedIcons.some((icon) => icon.category === "PIR");
          if (hasPIR) return;
        }

        const isOccupied = placedIcons.some((icon) => icon.position === cellIndex);
        if (isOccupied) return;

        const iconPosition: PlacedIcon = {
          id: Date.now(),
          iconId: icon.id,
          src: icon.src,
          label: icon.label,
          position: cellIndex,
          category: icon.category
        };

        setPlacedIcons((prev) => [...prev, iconPosition]);
      } else if (dragData.type === 'placed') {
        // Handle swapping placed icons
        const sourceIcon = placedIcons.find(i => i.id === dragData.id);
        const targetIcon = placedIcons.find(i => i.position === cellIndex);
        
        if (!sourceIcon) return;

        // Check PIR restrictions
        if (sourceIcon.category === "PIR") {
          if (cellIndex !== 4 && cellIndex !== 7) return;
        }
        if (targetIcon?.category === "PIR") {
          if (dragData.position !== 4 && dragData.position !== 7) return;
        }

        // Swap icon positions
        setPlacedIcons(prev => prev.map(icon => {
          if (icon.id === sourceIcon.id) {
            return { ...icon, position: cellIndex };
          }
          if (icon.position === cellIndex) {
            return { ...icon, position: dragData.position };
          }
          return icon;
        }));

        // Swap text between positions
        setIconTexts(prev => {
          const newTexts = { ...prev };
          const sourceText = prev[dragData.position];
          const targetText = prev[cellIndex];
          
          if (sourceText !== undefined) {
            newTexts[cellIndex] = sourceText;
          } else {
            delete newTexts[cellIndex];
          }
          
          if (targetText !== undefined) {
            newTexts[dragData.position] = targetText;
          } else {
            delete newTexts[dragData.position];
          }
          
          return newTexts;
        });
      }
    } catch (error) {
      console.error('Error handling drop:', error);
    }
  };

  const handleTextClick = (index: number) => {
    setEditingCell(index);
  };

  const handleTextBlur = () => {
    setEditingCell(null);
  };

  const renderGridCell = (index: number) => {
    const icon = placedIcons.find((i) => i.position === index);
    const text = iconTexts[index];
    const isPIR = icon?.category === "PIR";
    const isEditing = editingCell === index;
    const isHovered = hoveredCell === index;

    return (
      <GridCell key={index} index={index} onDrop={handleDrop}>
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
          onMouseEnter={() => setHoveredCell(index)}
          onMouseLeave={() => setHoveredCell(null)}
        >
          {icon && (
            <>
              <img
                src={icon.src}
                alt={icon.label}
                draggable
                onDragStart={(e) => handleDragStart(e, icon)}
                style={{
                  width: isPIR ? "40px" : "60px",
                  height: isPIR ? "40px" : "60px",
                  objectFit: "contain",
                  marginBottom: "5px",
                  position: "relative",
                  zIndex: 1,
                  marginTop: isPIR ? "20px" : "0",
                  cursor: "move",
                  filter: !isPIR ? ICON_COLOR_FILTERS[panelDesign.iconColor] : undefined,
                  transition: 'filter 0.2s',
                }}
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteIcon(icon.id);
                }}
                style={{
                  position: "absolute",
                  top: 0,
                  right: 0,
                  background: "red",
                  color: "white",
                  border: "none",
                  borderRadius: "50%",
                  width: "16px",
                  height: "16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  fontSize: "10px",
                  padding: 0,
                  lineHeight: 1,
                  transform: "translate(50%, -50%)",
                  zIndex: 2,
                }}
              >
                ×
              </button>
            </>
          )}
          <div style={{ 
            position: "absolute",
            bottom: icon ? "5px" : "25px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "90%",
            zIndex: 0,
          }}>
            {!isPIR && (
              <>
                {isEditing ? (
                  <input
                    type="text"
                    value={text || ""}
                    onChange={(e) => handleTextChange(e, index)}
                    onBlur={handleTextBlur}
                    autoFocus
                    style={{
                      width: "100%",
                      padding: "4px",
                      fontSize: "12px",
                      textAlign: "center",
                      border: "1px solid rgba(255, 255, 255, 0.2)",
                      borderRadius: "4px",
                      outline: "none",
                      background: "rgba(255, 255, 255, 0.1)",
                      transition: "all 0.2s ease",
                      fontFamily: panelDesign.fonts || undefined,
                      color: panelDesign.textColor || '#000000',
                    }}
                  />
                ) : (
                  <div 
                    onClick={() => handleTextClick(index)}
                    style={{ 
                      fontSize: "12px", 
                      color: text ? panelDesign.textColor || "#000000" : "#999999",
                      wordBreak: "break-word",
                      maxWidth: "100%",
                      textAlign: "center",
                      padding: "4px",
                      cursor: "pointer",
                      borderRadius: "4px",
                      backgroundColor: isHovered ? "rgba(255, 255, 255, 0.1)" : "transparent",
                      transition: "all 0.2s ease",
                      fontFamily: panelDesign.fonts || undefined,
                    }}
                  >
                    {text || "Add text"}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </GridCell>
    );
  };

  const customizerSteps = [
    { step: 2, label: 'Select your icons' },
    { step: 3, label: 'Select Panel Design' },
    { step: 4, label: 'Backbox details' },
  ];
  const activeStep = currentStep - 2; // 0-based index

  const ProgressBar = () => (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 4, mt: 4 }}>
      {customizerSteps.map((s, idx) => (
        <React.Fragment key={s.step}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 120 }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: idx === activeStep ? 'linear-gradient(90deg, #1976d2 0%, #42a5f5 100%)' : '#e0e0e0',
                color: idx === activeStep ? '#fff' : '#888',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: 18,
                boxShadow: idx === activeStep ? '0 2px 8px #1976d233' : 'none',
                border: idx === activeStep ? '2px solid #1976d2' : '2px solid #e0e0e0',
                mb: 1,
                transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
              }}
            >
              {s.step}
            </Box>
            <Typography
              sx={{
                color: idx === activeStep ? '#1976d2' : '#888',
                fontWeight: idx === activeStep ? 600 : 400,
                fontSize: 14,
                textAlign: 'center',
                maxWidth: 110,
                letterSpacing: 0.2,
              }}
            >
              {s.label}
            </Typography>
          </Box>
          {idx < customizerSteps.length - 1 && (
            <Box sx={{ flex: 1, height: 2, background: '#e0e0e0', mx: 1, minWidth: 24, borderRadius: 1 }} />
          )}
        </React.Fragment>
      ))}
    </Box>
  );

  // Information Box Component
  const InformationBox = () => {
    const selectedRALColor = ralColors.find(color => color.hex === panelDesign.backgroundColor);
    const iconColorName = Object.keys(ICON_COLOR_FILTERS).find(color => color === panelDesign.iconColor);
    
    return (
      <Box sx={{ 
        maxWidth: 600, 
        mx: 'auto', 
        mb: 4, 
        background: '#ffffff', 
        borderRadius: 2, 
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)', 
        border: '1px solid #e0e0e0',
        overflow: 'hidden'
      }}>
        <Box sx={{ 
          background: 'linear-gradient(135deg, #1a1f2c 0%, #2c3e50 100%)', 
          color: '#ffffff', 
          p: 2,
          textAlign: 'center'
        }}>
          <Typography variant="h6" sx={{ fontWeight: 500, letterSpacing: '0.5px' }}>
            Selected Customization Details
          </Typography>
        </Box>
        
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 2 }}>
            
            {/* Icons Section */}
            <Box sx={{ 
              background: '#f8f9fa', 
              p: 2, 
              borderRadius: 1, 
              border: '1px solid #e9ecef'
            }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: '#495057' }}>
                Selected Icons ({placedIcons.length})
              </Typography>
              {placedIcons.length > 0 ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {placedIcons.map((icon, index) => (
                    <Box key={icon.id} sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 1,
                      p: 1,
                      background: '#ffffff',
                      borderRadius: 1,
                      border: '1px solid #dee2e6'
                    }}>
                      <img 
                        src={icon.src} 
                        alt={icon.label} 
                        style={{ 
                          width: '20px', 
                          height: '20px', 
                          objectFit: 'contain',
                          filter: icon.category !== "PIR" ? ICON_COLOR_FILTERS[panelDesign.iconColor] : undefined
                        }} 
                      />
                      <Typography variant="body2" sx={{ fontWeight: 500, color: '#212529' }}>
                        {icon.label}
                      </Typography>
                      {iconTexts[icon.position] && (
                        <Typography variant="body2" sx={{ color: '#6c757d', fontStyle: 'italic' }}>
                          "{iconTexts[icon.position]}"
                        </Typography>
                      )}
                    </Box>
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" sx={{ color: '#6c757d', fontStyle: 'italic' }}>
                  No icons selected yet
                </Typography>
              )}
            </Box>

            {/* Colors Section */}
            <Box sx={{ 
              background: '#f8f9fa', 
              p: 2, 
              borderRadius: 1, 
              border: '1px solid #e9ecef'
            }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: '#495057' }}>
                Color Settings
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {/* Panel Background */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ 
                    width: 20, 
                    height: 20, 
                    borderRadius: 1, 
                    background: panelDesign.backgroundColor || '#ffffff',
                    border: '1px solid #dee2e6'
                  }} />
                  <Typography variant="body2" sx={{ color: '#212529' }}>
                    Panel: {selectedRALColor ? `RAL ${selectedRALColor.code} (${selectedRALColor.name})` : 'Default'}
                  </Typography>
                </Box>

                {/* Icon Color */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ 
                    width: 20, 
                    height: 20, 
                    borderRadius: 1, 
                    background: panelDesign.iconColor,
                    border: '1px solid #dee2e6'
                  }} />
                  <Typography variant="body2" sx={{ color: '#212529' }}>
                    Icons: {iconColorName || panelDesign.iconColor}
                  </Typography>
                </Box>

                {/* Text Color */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ 
                    width: 20, 
                    height: 20, 
                    borderRadius: 1, 
                    background: panelDesign.textColor,
                    border: '1px solid #dee2e6'
                  }} />
                  <Typography variant="body2" sx={{ color: '#212529' }}>
                    Text: {panelDesign.textColor}
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Typography Section */}
            <Box sx={{ 
              background: '#f8f9fa', 
              p: 2, 
              borderRadius: 1, 
              border: '1px solid #e9ecef'
            }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: '#495057' }}>
                Typography
              </Typography>
              <Typography variant="body2" sx={{ color: '#212529' }}>
                Font: {panelDesign.fonts || 'Default'}
              </Typography>
            </Box>

            {/* Additional Details Section */}
            {(backbox || extraComments) && (
              <Box sx={{ 
                background: '#f8f9fa', 
                p: 2, 
                borderRadius: 1, 
                border: '1px solid #e9ecef'
              }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: '#495057' }}>
                  Additional Details
                </Typography>
                {backbox && (
                  <Typography variant="body2" sx={{ color: '#212529', mb: 1 }}>
                    Backbox: {backbox}
                  </Typography>
                )}
                {extraComments && (
                  <Typography variant="body2" sx={{ color: '#212529' }}>
                    Comments: {extraComments}
                  </Typography>
                )}
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    );
  };

  // Fields for step 3
  const [panelDesign, setPanelDesign] = useState({
    backgroundColor: '',
    fonts: '',
    backlight: '',
    iconColor: '#000000',
    plasticColor: '',
    textColor: '#000000',
  });
  // Fields for step 4
  const [backbox, setBackbox] = useState('');
  const [extraComments, setExtraComments] = useState('');
  const [allGoogleFonts, setAllGoogleFonts] = useState<string[]>(FALLBACK_GOOGLE_FONTS);
  const [fontSearch, setFontSearch] = useState('');
  const [showFontDropdown, setShowFontDropdown] = useState(false);
  const [fontsLoading, setFontsLoading] = useState(false);
  const fontDropdownRef = useRef<HTMLDivElement>(null);

  // Fetch Google Fonts list on mount
  useEffect(() => {
    if (!GOOGLE_FONTS_API_KEY) return; // skip if no key
    setFontsLoading(true);
    fetch(`https://www.googleapis.com/webfonts/v1/webfonts?key=${GOOGLE_FONTS_API_KEY}`)
      .then(res => res.json())
      .then(data => {
        if (data.items) {
          setAllGoogleFonts(data.items.map((item: any) => item.family));
          console.log('Total Google Fonts loaded:', data.items.length);
        }
      })
      .catch(() => {})
      .finally(() => setFontsLoading(false));
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (fontDropdownRef.current && !fontDropdownRef.current.contains(e.target as Node)) {
        setShowFontDropdown(false);
      }
    }
    if (showFontDropdown) {
      document.addEventListener('mousedown', handleClick);
    }
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showFontDropdown]);

  useEffect(() => {
    if (panelDesign.fonts) {
      loadGoogleFont(panelDesign.fonts);
    }
  }, [panelDesign.fonts]);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: '#f6f8fa',
        py: 8,
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ position: 'absolute', top: 20, right: 30, zIndex: 1 }}>
          <CartButton />
        </Box>

        <Box
          sx={{
            position: 'absolute',
            top: 20,
            left: 30,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <img 
            src={logo2} 
            alt="Logo" 
            style={{ 
              height: '40px',
              width: 'auto',
            }} 
          />
          <Typography
            variant="h6"
            component="h1"
            sx={{
              color: '#1a1f2c',
              fontWeight: 400,
              letterSpacing: '1px',
              textTransform: 'capitalize',
              fontFamily: '"Myriad Hebrew", "Monsal Gothic", sans-serif',
            }}
          >
            Design your panels
          </Typography>
        </Box>

        <ProgressBar />

        {/* Information Box */}
        <InformationBox />

        {/* Step Navigation Buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 4 }}>
          <Button
            variant="outlined"
            disabled={currentStep === 2}
            onClick={() => setCurrentStep((s) => Math.max(2, s - 1))}
          >
            Back
          </Button>
          <Button
            variant="contained"
            disabled={currentStep === 4}
            onClick={() => setCurrentStep((s) => Math.min(4, s + 1))}
          >
            Next
          </Button>
        </Box>

        {/* Icon List: Only visible on step 2 */}
        {currentStep === 2 && (
          <div style={{ marginBottom: "20px" }}>
            <div style={{ display: "flex", gap: "10px", marginBottom: "20px", justifyContent: "center" }}>
              {iconCategories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  style={{
                    padding: "12px 24px",
                    background: selectedCategory === category ? "#1a1f2c" : "#ffffff",
                    color: selectedCategory === category ? "#ffffff" : "#1a1f2c",
                    border: "1px solid #1a1f2c",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontFamily: '"Myriad Hebrew", "Monsal Gothic", sans-serif',
                    fontSize: "14px",
                    letterSpacing: "0.5px",
                    transition: "all 0.3s ease",
                    minWidth: "120px",
                  }}
                >
                  {category}
                </button>
              ))}
            </div>
            <div style={{ 
              display: "flex", 
              gap: "16px", 
              flexWrap: "wrap", 
              justifyContent: "center",
              maxWidth: "800px",
              margin: "0 auto"
            }}>
              {categoryIcons.map((icon) => (
                <div
                  key={icon.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, icon)}
                  style={{
                    padding: "12px",
                    background: selectedIcon?.id === icon.id ? "#1a1f2c" : "#ffffff",
                    borderRadius: "6px",
                    cursor: "grab",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    width: "60px",
                    border: "1px solid #e0e0e0",
                    transition: "all 0.3s ease",
                  }}
                >
                  <img
                    src={icon.src}
                    alt={icon.label}
                    style={{ width: "32px", height: "32px", objectFit: "contain" }}
                  />
                  <span style={{ 
                    fontSize: "14px", 
                    color: selectedIcon?.id === icon.id ? "#ffffff" : "#1a1f2c",
                    fontFamily: '"Myriad Hebrew", "Monsal Gothic", sans-serif',
                    letterSpacing: "0.5px"
                  }}>
                    {icon.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* Step 3: Panel Design Fields */}
        {currentStep === 3 && (
          <div style={{ margin: '24px 0' }}>
            <div style={{ fontWeight: 500, marginBottom: 8 }}>Select Panel Background Color (RAL):</div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))',
                gap: 12,
                maxHeight: 300,
                overflowY: 'auto',
                background: '#f7f7f7',
                borderRadius: 8,
                padding: 12,
                border: '1px solid #e0e0e0',
              }}
            >
              {ralColors.map((color: RALColor) => (
                <button
                  key={color.code}
                  type="button"
                  onClick={() => setPanelDesign({ ...panelDesign, backgroundColor: color.hex })}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    border: panelDesign.backgroundColor === color.hex ? '2px solid #1976d2' : '1px solid #ccc',
                    borderRadius: 6,
                    background: '#fff',
                    cursor: 'pointer',
                    padding: 6,
                    outline: 'none',
                    boxShadow: panelDesign.backgroundColor === color.hex ? '0 0 0 2px #90caf9' : 'none',
                    transition: 'border 0.2s, box-shadow 0.2s',
                  }}
                >
                  <span
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 4,
                      background: color.hex,
                      border: '1px solid #bbb',
                      marginBottom: 4,
                      display: 'block',
                    }}
                  />
                  <span style={{ fontSize: 12, fontWeight: 500 }}>{`RAL ${color.code}`}</span>
                  <span style={{ fontSize: 11, color: '#555', textAlign: 'center' }}>{color.name}</span>
                </button>
              ))}
            </div>
            <div style={{ marginTop: 24 }}>
              <div style={{ fontWeight: 500, marginBottom: 8 }}>Choose Font (Google Fonts):</div>
              <div style={{ position: 'relative', maxWidth: 320 }} ref={fontDropdownRef}>
                <input
                  type="text"
                  placeholder="Search Google Fonts..."
                  value={fontSearch || panelDesign.fonts || ''}
                  onChange={e => {
                    const newSearch = e.target.value;
                    setFontSearch(newSearch);
                    // If user clears the input, also clear the selected font
                    if (newSearch === '') {
                      setPanelDesign(prev => ({ ...prev, fonts: '' }));
                    }
                    setShowFontDropdown(true);
                  }}
                  onFocus={() => setShowFontDropdown(true)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 6,
                    border: '1px solid #ccc',
                    fontSize: 15,
                    minWidth: 180,
                    width: '100%',
                    fontFamily: panelDesign.fonts || undefined,
                  }}
                />
                {showFontDropdown && (
                  <div style={{
                    position: 'absolute',
                    top: '110%',
                    left: 0,
                    right: 0,
                    background: '#fff',
                    border: '1px solid #ccc',
                    borderRadius: 6,
                    maxHeight: 220,
                    overflowY: 'auto',
                    zIndex: 10,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                  }}>
                    {fontsLoading ? (
                      <div style={{ padding: 12, textAlign: 'center', color: '#888' }}>Loading fonts...</div>
                    ) : (
                      <>
                        <div
                          style={{ padding: 8, cursor: 'pointer', fontFamily: 'inherit', color: '#888' }}
                          onClick={() => {
                            setPanelDesign({ ...panelDesign, fonts: '' });
                            setFontSearch('');
                            setShowFontDropdown(false);
                          }}
                        >Default</div>
                        {allGoogleFonts
                          .filter(f => f.toLowerCase().includes(fontSearch.toLowerCase()))
                          .slice(0, 30)
                          .map(font => (
                            <div
                              key={font}
                              style={{
                                padding: 8,
                                cursor: 'pointer',
                                fontFamily: font,
                                background: font === panelDesign.fonts ? '#f0f4ff' : undefined,
                              }}
                              onClick={() => {
                                setPanelDesign({ ...panelDesign, fonts: font });
                                setFontSearch(font);
                                setShowFontDropdown(false);
                              }}
                            >
                              {font}
                            </div>
                          ))}
                        {allGoogleFonts.filter(f => f.toLowerCase().includes(fontSearch.toLowerCase())).length === 0 && !fontsLoading && (
                          <div style={{ padding: 8, color: '#aaa' }}>No fonts found</div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 32, marginTop: 24 }}>
              <div>
                <div style={{ fontWeight: 500, marginBottom: 8 }}>Icon Color:</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {Object.entries(ICON_COLOR_FILTERS).map(([color]) => (
                    <button
                      key={color}
                      onClick={() => setPanelDesign(prev => ({ ...prev, iconColor: color }))}
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        background: color,
                        border: panelDesign.iconColor === color ? '3px solid #1976d2' : '1px solid #ccc',
                        cursor: 'pointer',
                        padding: 0,
                        outline: 'none',
                        boxShadow: panelDesign.iconColor === color ? '0 0 0 2px #90caf9' : 'none',
                      }}
                    />
                  ))}
                </div>
              </div>
              <div>
                <div style={{ fontWeight: 500, marginBottom: 8 }}>Text Color:</div>
                <input
                  type="color"
                  value={panelDesign.textColor}
                  onChange={e => setPanelDesign(prev => ({ ...prev, textColor: e.target.value }))}
                  style={{
                    width: 70,
                    height: 36,
                    border: '1px solid #ccc',
                    borderRadius: 6,
                    cursor: 'pointer',
                    padding: '2px 4px',
                  }}
                />
              </div>
            </div>
          </div>
        )}
        {/* Step 4: Backbox and Comments Fields */}
        {currentStep === 4 && (
          <Box sx={{ maxWidth: 400, mx: 'auto', background: '#fff', p: 3, borderRadius: 2, boxShadow: '0 2px 8px #1976d211', mb: 4 }}>
            <Typography variant="h6" sx={{ mb: 2, color: '#1976d2' }}>Backbox Details</Typography>
            <TextField label="Backbox" fullWidth sx={{ mb: 2 }} value={backbox} onChange={e => setBackbox(e.target.value)} />
            <TextField label="Any extra comments?" fullWidth multiline minRows={2} sx={{ mb: 2 }} value={extraComments} onChange={e => setExtraComments(e.target.value)} />
          </Box>
        )}
        {/* Panel Template: Always visible and positioned below */}
        <div style={{ marginBottom: "20px" }}>
          <div
            style={{
              width: "350px",
              background: `linear-gradient(to bottom right, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0)), ${hexToRgba(panelDesign.backgroundColor, 0.95)}`,
              padding: "10px",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "16px",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 1px rgba(255, 255, 255, 0.2)",
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
              margin: "auto",
              transition: "background 0.3s ease",
            }}
          >
            <div style={{ display: "flex", flexWrap: "wrap" }}>
              {Array.from({ length: 9 }).map((_, index) => renderGridCell(index))}
            </div>
          </div>
        </div>
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2 }}>
            <StyledButton
              variant="outlined"
              onClick={() => navigate('/panel-type')}
              sx={{
                borderColor: '#1a1f2c',
                color: '#1a1f2c',
                '&:hover': {
                  borderColor: '#2c3e50',
                  backgroundColor: 'rgba(26, 31, 44, 0.04)',
                },
              }}
            >
              Back
            </StyledButton>
            <StyledButton
              variant="contained"
              onClick={handleAddToCart}
              sx={{
                backgroundColor: '#1a1f2c',
                color: '#ffffff',
                '&:hover': {
                  backgroundColor: '#2c3e50',
                },
              }}
            >
              Add to Cart
            </StyledButton>
        </Box>
      </Container>
    </Box>
  );
};

export default SPCustomizer; 