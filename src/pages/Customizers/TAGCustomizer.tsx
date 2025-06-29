// Import necessary libraries and components
import React, { useState, useEffect, useRef, useContext } from "react";
import { useCart } from "../../contexts/CartContext";
import "./Customizer.css";
import CartButton from "../../components/CartButton";
import { useNavigate } from "react-router-dom";
import logo2 from "../../assets/logo.png";
import icons, { allIcons } from "../../assets/iconLibrary";
import {
  Container,
  Typography,
  Box,
  Button,
  LinearProgress,
  useTheme,
  TextField,
  Grid,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { ralColors, RALColor } from '../../data/ralColors';
import { ProjectContext } from '../../App';
import { motion } from 'framer-motion';
import TAG from "../../assets/panels/TAG_PIR.png";
import { getIconColorName } from '../../data/iconColors';

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

  // Detect if fans are on the fourth row (cells 9, 10, 11)
  // We'll need access to placedIcons here, so we'll use a workaround: window.placedIcons (set in TAGCustomizer)
  let fansOnFourthRow = false;
  if (typeof window !== 'undefined' && (window as any).placedIcons) {
    const placedIcons = (window as any).placedIcons as any[];
    fansOnFourthRow = [9, 10, 11].some(idx => {
      const icon = placedIcons.find(i => i.position === idx);
      return icon && icon.iconId === 'FAN';
    });
  }

  const isFirstRow = index >= 0 && index <= 2;
  const isSecondRow = index >= 3 && index <= 5;
  const isThirdRow = index >= 6 && index <= 8;
  const isFourthRow = index >= 9 && index <= 11;
  let cellMargin = '5px';
  if (isFourthRow) {
    cellMargin = fansOnFourthRow ? '-80px 5px 5px 5px' : '-35px 5px 5px 5px';
  } else if (isThirdRow) {
    cellMargin = '0px 5px 5px 5px';
  } else if (isFirstRow) {
    cellMargin = '-10px 5px 5px 5px';
  } else if (isSecondRow) {
    cellMargin = '-80px 5px 5px 5px';
  }

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
      margin: cellMargin,
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

// Move InformationBox to the top level, before TAGCustomizer
const InformationBox = ({
  backbox,
  setBackbox,
  backboxError,
  extraComments,
  setExtraComments,
  panelDesign,
  placedIcons,
  ICON_COLOR_FILTERS,
  ralColors
}: {
  backbox: string;
  setBackbox: (v: string) => void;
  backboxError: string;
  extraComments: string;
  setExtraComments: (v: string) => void;
  panelDesign: any;
  placedIcons: any[];
  ICON_COLOR_FILTERS: { [key: string]: string };
  ralColors: any[];
}) => {
  const selectedRALColor = ralColors.find(color => color.hex === panelDesign.backgroundColor);
  const iconColorName = Object.keys(ICON_COLOR_FILTERS).find(color => color === panelDesign.iconColor);
  return (
    <Box sx={{ 
      width: 400,
      background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
      borderRadius: 3,
      boxShadow: '0 8px 32px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.08)',
      border: '1px solid rgba(255,255,255,0.8)',
      overflow: 'hidden',
      position: 'relative'
    }}>
      {/* Header */}
      <Box sx={{ 
        background: 'linear-gradient(135deg, #1a1f2c 0%, #2c3e50 100%)', 
        color: '#ffffff', 
        p: 2.5,
        textAlign: 'center',
        position: 'relative',
        '&::after': {
          content: '""',
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '1px',
          background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)'
        }
      }}>
        <Typography variant="h6" sx={{ 
          fontWeight: 600, 
          letterSpacing: '0.5px', 
          fontSize: '18px',
          textShadow: '0 1px 2px rgba(0,0,0,0.3)'
        }}>
          Panel Configuration Summary
        </Typography>
      </Box>
      {/* Content */}
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {/* Icons Section */}
          <Box sx={{ 
            background: 'linear-gradient(145deg, #f8f9fa 0%, #ffffff 100%)',
            p: 2,
            borderRadius: 2,
            border: '1px solid #e9ecef',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
          }}>
            <Typography variant="subtitle2" sx={{ 
              fontWeight: 700, 
              mb: 1.5, 
              color: '#1a1f2c', 
              fontSize: '15px',
              display: 'flex', 
              alignItems: 'center', 
              gap: 1
            }}>
              <Box sx={{ 
                width: 8, 
                height: 8, 
                borderRadius: '50%', 
                background: '#4CAF50',
                flexShrink: 0
              }} />
              Selected Icons ({placedIcons.filter(icon => icon.label && icon.label.trim() !== '').length})
            </Typography>
            {placedIcons.filter(icon => icon.label && icon.label.trim() !== '').length > 0 ? (
              <Typography variant="body2" sx={{ 
                color: '#2c3e50', 
                fontSize: '14px', 
                fontWeight: 500,
                lineHeight: 1.4
              }}>
                {placedIcons
                  .filter(icon => icon.label && icon.label.trim() !== '')
                  .map((icon, index, filteredIcons) => (
                    <span key={icon.id}>
                      {icon.label}{index < filteredIcons.length - 1 ? ', ' : ''}
                    </span>
                  ))}
              </Typography>
            ) : (
              <Typography variant="body2" sx={{ 
                color: '#6c757d', 
                fontStyle: 'italic', 
                fontSize: '14px' 
              }}>
                No icons selected yet
              </Typography>
            )}
          </Box>
          {/* Colors Section */}
          <Box sx={{ 
            background: 'linear-gradient(145deg, #f8f9fa 0%, #ffffff 100%)',
            p: 2,
            borderRadius: 2,
            border: '1px solid #e9ecef',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
          }}>
            <Typography variant="subtitle2" sx={{ 
              fontWeight: 700, 
              mb: 1.5, 
              color: '#1a1f2c', 
              fontSize: '15px',
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}>
              <Box sx={{ 
                width: 8, 
                height: 8, 
                borderRadius: '50%', 
                background: '#FF6B35',
                flexShrink: 0
              }} />
              Color Configuration
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {/* Panel Background */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ 
                  width: 20, 
                  height: 20, 
                  borderRadius: 1.5, 
                  background: panelDesign.backgroundColor || '#ffffff',
                  border: '2px solid #dee2e6',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }} />
                <Typography variant="body2" sx={{ color: '#2c3e50', fontSize: '14px', fontWeight: 500 }}>
                  Panel: {selectedRALColor ? `RAL ${selectedRALColor.code}` : 'Default'}
                </Typography>
              </Box>
              {/* Icon Color */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ 
                  width: 20, 
                  height: 20, 
                  borderRadius: 1.5, 
                  background: panelDesign.iconColor,
                  border: '2px solid #dee2e6',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }} />
                <Typography variant="body2" sx={{ color: '#2c3e50', fontSize: '14px', fontWeight: 500 }}>
                  Icons: {getIconColorName(panelDesign.iconColor)}
                </Typography>
              </Box>
              {/* Text Color */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ 
                  width: 20, 
                  height: 20, 
                  borderRadius: 1.5, 
                  background: panelDesign.textColor,
                  border: '2px solid #dee2e6',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }} />
                <Typography variant="body2" sx={{ color: '#2c3e50', fontSize: '14px', fontWeight: 500 }}>
                  Text: {panelDesign.textColor}
                </Typography>
              </Box>
            </Box>
          </Box>
          {/* Typography Section */}
          <Box sx={{ 
            background: 'linear-gradient(145deg, #f8f9fa 0%, #ffffff 100%)',
            p: 2,
            borderRadius: 2,
            border: '1px solid #e9ecef',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
          }}>
            <Typography variant="subtitle2" sx={{ 
              fontWeight: 700, 
              mb: 1.5, 
              color: '#1a1f2c', 
              fontSize: '15px',
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}>
              <Box sx={{ 
                width: 8, 
                height: 8, 
                borderRadius: '50%', 
                background: '#9C27B0',
                flexShrink: 0
              }} />
              Typography Settings
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <Typography variant="body2" sx={{ color: '#2c3e50', fontSize: '14px', fontWeight: 500 }}>
                Font: {panelDesign.fonts || 'Default'}
              </Typography>
              <Typography variant="body2" sx={{ color: '#2c3e50', fontSize: '14px', fontWeight: 500 }}>
                Size: {panelDesign.fontSize || '12px'}
              </Typography>
            </Box>
          </Box>
          {/* Backbox and Comments fields */}
          <Box sx={{ 
            background: 'linear-gradient(145deg, #f8f9fa 0%, #ffffff 100%)',
            p: 2,
            borderRadius: 2,
            border: '1px solid #e9ecef',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            mt: 2
          }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, color: '#1a1f2c', fontSize: '15px' }}>
              Backbox Details *
            </Typography>
            <input
              type="text"
              value={backbox}
              onChange={e => {
                setBackbox(e.target.value);
              }}
              placeholder="Enter backbox details..."
              style={{ width: '100%', padding: '8px', marginBottom: '8px', border: backboxError ? '1px solid red' : '1px solid #ccc', borderRadius: '4px' }}
            />
            {backboxError && <div style={{ color: 'red', fontSize: '12px' }}>{backboxError}</div>}
          </Box>
          <Box sx={{ 
            background: 'linear-gradient(145deg, #f8f9fa 0%, #ffffff 100%)',
            p: 2,
            borderRadius: 2,
            border: '1px solid #e9ecef',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            mt: 2
          }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, color: '#1a1f2c', fontSize: '15px' }}>
              Additional Comments (Optional)
            </Typography>
            <textarea
              value={extraComments}
              onChange={e => setExtraComments(e.target.value)}
              placeholder="Enter any additional comments..."
              style={{ width: '100%', minHeight: '48px', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

const TAGCustomizer: React.FC = () => {
  // Add CSS animation for pulse effect
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes pulse {
        0% {
          transform: scale(1);
          opacity: 1;
        }
        50% {
          transform: scale(1.2);
          opacity: 0.8;
        }
        100% {
          transform: scale(1);
          opacity: 1;
        }
      }
    `;
    document.head.appendChild(style);
    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, []);

  const navigate = useNavigate();
  const cartContext = useCart();
  const [icons, setIcons] = useState<Record<string, any>>({});
  const [iconCategories, setIconCategories] = useState<string[]>([]);
  const [selectedIcon, setSelectedIcon] = useState<IconOption | null>(null);
  const [placedIcons, setPlacedIcons] = useState<PlacedIcon[]>([]);
  const [iconTexts, setIconTexts] = useState<IconTexts>({});
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [hoveredCell, setHoveredCell] = useState<number | null>(null);
  const [editingCell, setEditingCell] = useState<number | null>(null);
  const iconNames = Array.from(new Set(placedIcons.map(icon => icon.iconId)));
  const [currentStep, setCurrentStep] = useState(2); // 2, 3, or 4
  const [panelDesign, setPanelDesign] = useState<{
    backgroundColor: string;
    fonts: string;
    backlight: string;
    iconColor: string;
    plasticColor: string;
    textColor: string;
    fontSize: string;
    backbox?: string;
    extraComments?: string;
  }>({
    backgroundColor: '',
    fonts: '',
    backlight: '',
    iconColor: '#000000',
    plasticColor: '',
    textColor: '#000000',
    fontSize: '12px',
  });
  const [backbox, setBackbox] = useState('');
  const [extraComments, setExtraComments] = useState('');
  const [backboxError, setBackboxError] = useState('');
  const [allGoogleFonts, setAllGoogleFonts] = useState<string[]>(FALLBACK_GOOGLE_FONTS);
  const [fontSearch, setFontSearch] = useState('');
  const [showFontDropdown, setShowFontDropdown] = useState(false);
  const [fontsLoading, setFontsLoading] = useState(false);
  const fontDropdownRef = useRef<HTMLDivElement>(null);
  
  // Cell 1 cycling state
  const [cell1IconIndex, setCell1IconIndex] = useState(0);
  const cell1Icons = ["CF", "C", "F"]; // The 3 icons that cycle in cell 1
  
  // Get all TAG icons for cycling in cell 1
  const tagIcons = Object.values(icons).filter((icon: any) => icon.category === 'TAG');
  
  const ICON_COLOR_FILTERS: { [key: string]: string } = {
    '#000000': 'brightness(0) saturate(100%)',
    '#FFFFFF': 'brightness(0) saturate(100%) invert(1)',
    '#808080': 'brightness(0) saturate(100%) invert(52%) sepia(0%) saturate(0%) hue-rotate(148deg) brightness(99%) contrast(91%)',
    '#FF0000': 'brightness(0) saturate(100%) invert(13%) sepia(93%) saturate(7464%) hue-rotate(0deg) brightness(113%) contrast(109%)',
    '#0000FF': 'brightness(0) saturate(100%) invert(8%) sepia(100%) saturate(6495%) hue-rotate(247deg) brightness(98%) contrast(141%)',
    '#008000': 'brightness(0) saturate(100%) invert(23%) sepia(98%) saturate(3025%) hue-rotate(101deg) brightness(94%) contrast(104%)',
  };
  const [iconHovered, setIconHovered] = useState<{ [index: number]: boolean }>({});
  console.log('RENDER', { backbox, extraComments });

  // State to track if rows 3 and 4 are swapped
  const [swapRows, setSwapRows] = useState(false);

  const { projectName, projectCode } = useContext(ProjectContext);

  useEffect(() => {
    import("../../assets/iconLibrary").then((module) => {
      setIcons(module.default);
      setIconCategories(module.iconCategories.filter(cat => cat === 'PIR'));
    });
  }, []);

  if (!cartContext) {
    throw new Error("CartContext must be used within a CartProvider");
  }

  const { addToCart } = cartContext;

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
      // Only allow placement in bottom center cell (10)
      if (cellIndex !== 10) return;
      
      // Check if PIR icon is already placed
      const hasPIR = placedIcons.some((icon) => icon.category === "PIR");
      if (hasPIR) return;
    }

    // Special handling for cell 1 - allow any TAG icon and cycle through CF, C, F
    if (cellIndex === 1) {
      // Remove any existing icon in cell 1
      setPlacedIcons((prev) => prev.filter((icon) => icon.position !== 1));
      
      // Place the selected icon
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
      return;
    }

    // Prevent placing icons in cells 3, 4, 5 (covered by permanent DISPLAY)
    if ([3, 4, 5].includes(cellIndex)) {
      return;
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

  // Cell 1 cycling function - move this before renderGridCell
  const handleCell1Click = () => {
    if (currentStep === 4 || tagIcons.length === 0) return;
    
    // Find the current icon in cell 1
    const currentIcon = placedIcons.find(icon => icon.position === 1);
    const currentIndex = currentIcon ? tagIcons.findIndex(icon => icon.id === currentIcon.iconId) : -1;
    
    // Cycle to next icon
    const nextIndex = (currentIndex + 1) % tagIcons.length;
    const nextIcon = tagIcons[nextIndex];
    
    setPlacedIcons(prev => [
      ...prev.filter(icon => icon.position !== 1),
      {
        id: Date.now(),
        iconId: nextIcon.id,
        src: nextIcon.src,
        label: nextIcon.label,
        position: 1,
        category: nextIcon.category
      }
    ]);
  };

  const handleAddToCart = (): void => {
    // Check if backbox details are provided
    if (!backbox.trim()) {
      setBackboxError('Please provide backbox details before adding the panel to your project.');
      return;
    }

    const design: Design & { panelDesign: typeof panelDesign } = {
      type: "TAG",
      icons: Array.from({ length: 12 })
        .map((_, index) => {
          const icon = placedIcons.find((i) => i.position === index);
          return {
            iconId: icon?.iconId || null,
            src: icon?.src || "",
            label: icon?.label || "",
            position: index,
            text: iconTexts[index] || "",
            category: icon?.category || undefined,
          };
        })
        .filter((entry) => entry.iconId || entry.text),
      quantity: 1,
      panelDesign: { ...panelDesign, backbox, extraComments },
    };
    addToCart(design);
  };

  // Filter icons by selected category
  const categoryIcons = Object.entries(icons)
    .filter(([_, icon]) => icon.category === selectedCategory && icon.category !== 'TAG')
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
          if (cellIndex !== 10) return;
          const hasPIR = placedIcons.some((icon) => icon.category === "PIR");
          if (hasPIR) return;
        }

        // Check if trying to place G1 or G2 icons in restricted cells (2, 5, 8, 11) - right column
        if ((icon.id === "G1" || icon.id === "G2") && [2, 5, 8, 11].includes(cellIndex)) {
          console.log("DROP: BLOCKED G1/G2 icon placement in right column (cells 2, 5, 8, 11)");
          return;
        }

        // Check if trying to place G3 icon in restricted cells (0, 3, 6, 9) - left column
        if (icon.id === "G3" && [0, 3, 6, 9].includes(cellIndex)) {
          console.log("DROP: BLOCKED G3 icon placement in left column (cells 0, 3, 6, 9)");
          return;
        }

        // Special handling for cell 1 - allow any TAG icon
        if (cellIndex === 1) {
          // Remove any existing icon in cell 1
          setPlacedIcons((prev) => prev.filter((icon) => icon.position !== 1));
          
          const iconPosition: PlacedIcon = {
            id: Date.now(),
            iconId: icon.id,
            src: icon.src,
            label: icon.label,
            position: cellIndex,
            category: icon.category
          };
          
          setPlacedIcons((prev) => [...prev, iconPosition]);
          return;
        }

        // Prevent placing icons in cells 3, 4, 5 (covered by permanent DISPLAY)
        if ([3, 4, 5].includes(cellIndex)) {
          return;
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
          if (cellIndex !== 10) return;
        }
        if (targetIcon?.category === "PIR") {
          if (dragData.position !== 10) return;
        }

        // Check cell 1 restrictions for CF, C, F icons
        if (cellIndex === 1) {
          const allowedIcons = ["CF", "C", "F"];
          if (!allowedIcons.includes(sourceIcon.iconId)) return;
        }
        if (dragData.position === 1) {
          const allowedIcons = ["CF", "C", "F"];
          if (!allowedIcons.includes(targetIcon?.iconId || "")) return;
        }

        // Prevent moving icons into cells 3, 4, 5 (covered by permanent DISPLAY)
        if ([3, 4, 5].includes(cellIndex)) {
          return;
        }
        if ([3, 4, 5].includes(dragData.position)) {
          return;
        }

        // Check G1/G2 restrictions for restricted cells (2, 5, 8, 11) - right column
        if ((sourceIcon.iconId === "G1" || sourceIcon.iconId === "G2") && [2, 5, 8, 11].includes(cellIndex)) {
          console.log("DROP: BLOCKED G1/G2 icon placement in right column (cells 2, 5, 8, 11)");
          return;
        }
        if ((targetIcon?.iconId === "G1" || targetIcon?.iconId === "G2") && [2, 5, 8, 11].includes(dragData.position)) {
          console.log("DROP: BLOCKED G1/G2 icon placement in right column (cells 2, 5, 8, 11)");
          return;
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

  // Helper to get the correct cell index based on swapRows
  const getDisplayIndex = (index: number) => {
    if (!swapRows) return index;
    // Swap 3rd (6,7,8) and 4th (9,10,11) rows
    if (index >= 6 && index <= 8) return index + 3;
    if (index >= 9 && index <= 11) return index - 3;
    return index;
  };

  const renderGridCell = (index: number) => {
    const displayIndex = getDisplayIndex(index);
    const isThirdRow = displayIndex >= 6 && displayIndex <= 8;
    const isFourthRow = displayIndex >= 9 && displayIndex <= 11;
    const isFirstRow = displayIndex >= 0 && displayIndex <= 2;
    const isSecondRow = displayIndex >= 3 && displayIndex <= 5;
    const fanIcon = { iconId: 'FAN', src: (allIcons as any).FAN?.src || '', label: 'FAN', category: 'TAG' };
    const icon = placedIcons.find((i) => i.position === displayIndex);
    const text = iconTexts[displayIndex];
    const isPIR = icon?.category === "PIR";
    const isEditing = editingCell === displayIndex;
    const isHovered = hoveredCell === displayIndex;
    const isIconHovered = !!iconHovered[displayIndex];

    // Define which cells are editable (removed cell 1 and third row)
    const editableCells = [7, 8, 9, 10, 11].filter(i => i < 6 || i > 8); // Exclude 6,7,8
    const isEditable = editableCells.includes(displayIndex);

    // Check if this is a DISPLAY icon
    const isDisplay = icon?.iconId === "DISPLAY";
    const isDisplayCell = displayIndex === 3 && isDisplay;

    return (
      <GridCell key={index} index={index} onDrop={currentStep === 4 || isThirdRow ? () => {} : handleDrop}>
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
          onMouseEnter={currentStep !== 4 && !isThirdRow ? () => setIconHovered(prev => ({ ...prev, [displayIndex]: true })) : undefined}
          onMouseLeave={currentStep !== 4 && !isThirdRow ? () => setIconHovered(prev => ({ ...prev, [displayIndex]: false })) : undefined}
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
                src={(allIcons as any).DISPLAY?.src || ""}
                alt="DISPLAY"
                style={{
                  width: "240px", // Bigger size
                  height: "80px", // Bigger height
                  objectFit: "contain",
                  position: "absolute",
                  left: "-60px", // Moved to the right (was -90px)
                  zIndex: 2,
                  filter: ICON_COLOR_FILTERS[panelDesign.iconColor] || ICON_COLOR_FILTERS['#000000'], // Use selected icon color
                  transition: 'filter 0.2s',
                }}
              />
            </div>
          )}

          {/* Always show FAN icon in third row */}
          {isThirdRow ? (
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
                  filter: ICON_COLOR_FILTERS[panelDesign.iconColor] || ICON_COLOR_FILTERS['#000000'], // Use selected icon color
                  transition: 'filter 0.2s',
                  top: displayIndex === 6 ? "10px" : displayIndex === 7 ? "6px" : undefined,
                }}
              />
            </div>
          ) : icon && (
            <div
              style={{
                position: "relative",
                display: "inline-block",
              }}
            >
              {/* Special handling for cell 1 - make it clickable for cycling */}
              {displayIndex === 1 ? (
                <div
                  onClick={currentStep !== 4 ? handleCell1Click : undefined}
                  style={{
                    width: "40px",
                    height: "40px",
                    border: currentStep !== 4 ? "3px solid #1976d2" : "none",
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: currentStep !== 4 ? "pointer" : "default",
                    marginBottom: "5px",
                    transition: "all 0.3s ease",
                    backgroundColor: currentStep !== 4 ? "rgba(25, 118, 210, 0.15)" : "transparent",
                    boxShadow: currentStep !== 4 ? "0 2px 8px rgba(25, 118, 210, 0.2), 0 0 0 1px rgba(25, 118, 210, 0.1)" : "none",
                    position: "relative",
                  }}
                  onMouseEnter={currentStep !== 4 ? (e) => {
                    e.currentTarget.style.borderColor = "#1565c0";
                    e.currentTarget.style.backgroundColor = "rgba(25, 118, 210, 0.3)";
                    e.currentTarget.style.transform = "scale(1.05)";
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(25, 118, 210, 0.4), 0 0 0 2px rgba(25, 118, 210, 0.2)";
                  } : undefined}
                  onMouseLeave={currentStep !== 4 ? (e) => {
                    e.currentTarget.style.borderColor = "#1976d2";
                    e.currentTarget.style.backgroundColor = "rgba(25, 118, 210, 0.15)";
                    e.currentTarget.style.transform = "scale(1)";
                    e.currentTarget.style.boxShadow = "0 2px 8px rgba(25, 118, 210, 0.2), 0 0 0 1px rgba(25, 118, 210, 0.1)";
                  } : undefined}
                  title={currentStep !== 4 ? "Click to switch temperature unit" : undefined}
                >
                  <img
                    src={icon.src}
                    alt={icon.label}
                    style={{
                      width: "26px",
                      height: "26px",
                      objectFit: "contain",
                      filter: ICON_COLOR_FILTERS[panelDesign.iconColor] || ICON_COLOR_FILTERS['#000000'],
                      transition: 'filter 0.2s',
                    }}
                  />
                  {/* Small click indicator */}
                  {currentStep !== 4 && (
                    <div style={{
                      position: "absolute",
                      top: "-10px",
                      right: "-10px",
                      width: "18px",
                      height: "18px",
                      backgroundColor: "#1976d2",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "11px",
                      color: "white",
                      fontWeight: "bold",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                      zIndex: 10,
                      animation: "pulse 2s infinite",
                    }}>
                      ↻
                    </div>
                  )}
                </div>
              ) : (
              <img
                src={icon.src}
                alt={icon.label}
                draggable={currentStep !== 4}
                onDragStart={currentStep !== 4 ? (e) => handleDragStart(e, icon) : undefined}
                style={{
                    width: isPIR ? "40px" : isDisplay ? "180px" : "40px",
                    height: isPIR ? "40px" : isDisplay ? "60px" : "40px",
                  objectFit: "contain",
                  marginBottom: "5px",
                  position: "relative",
                  zIndex: 1,
                  marginTop: isPIR ? "20px" : "0",
                  cursor: currentStep !== 4 ? "move" : "default",
                  filter: !isPIR ? ICON_COLOR_FILTERS[panelDesign.iconColor] : undefined,
                  transition: 'filter 0.2s',
                }}
              />
              )}
              {/* Only show delete button if not in third row and not cell 1 */}
              {currentStep !== 4 && !isThirdRow && displayIndex !== 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteIcon(icon.id);
                  }}
                  style={{
                    position: "absolute",
                    top: "-8px",
                    right: "-8px",
                    background: "rgba(220, 53, 69, 0.9)",
                    color: "white",
                    border: "2px solid rgba(255, 255, 255, 0.8)",
                    borderRadius: "50%",
                    width: "20px",
                    height: "20px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    fontSize: "12px",
                    padding: 0,
                    lineHeight: 1,
                    zIndex: 3,
                    opacity: isIconHovered ? 1 : 0,
                    transform: isIconHovered ? "scale(1)" : "scale(0.8)",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
                    fontWeight: "bold",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(220, 53, 69, 1)";
                    e.currentTarget.style.transform = "scale(1.1)";
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(220, 53, 69, 0.4)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(220, 53, 69, 0.9)";
                    e.currentTarget.style.transform = "scale(1)";
                    e.currentTarget.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.2)";
                }}
                >
                  ×
                </button>
              )}
            </div>
          )}
          
          {/* Cell 1 clickable area for cycling icons - only when no icon is present */}
          {displayIndex === 1 && !icon && currentStep !== 4 && (
            <div
              onClick={handleCell1Click}
              style={{
                width: "40px",
                height: "40px",
                border: "3px solid #1976d2",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                marginBottom: "5px",
                transition: "all 0.3s ease",
                backgroundColor: "rgba(25, 118, 210, 0.1)",
                boxShadow: "0 2px 8px rgba(25, 118, 210, 0.2), 0 0 0 1px rgba(25, 118, 210, 0.1)",
                position: "relative",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#1565c0";
                e.currentTarget.style.backgroundColor = "rgba(25, 118, 210, 0.3)";
                e.currentTarget.style.transform = "scale(1.05)";
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(25, 118, 210, 0.4), 0 0 0 2px rgba(25, 118, 210, 0.2)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#1976d2";
                e.currentTarget.style.backgroundColor = "rgba(25, 118, 210, 0.1)";
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.boxShadow = "0 2px 8px rgba(25, 118, 210, 0.2), 0 0 0 1px rgba(25, 118, 210, 0.1)";
              }}
              title="Click to switch temperature unit"
            >
              <span style={{ 
                fontSize: "13px", 
                color: "#1976d2", 
                fontWeight: "bold",
                fontFamily: '"Myriad Hebrew", "Monsal Gothic", sans-serif',
              }}>
                {placedIcons.find(icon => icon.position === 1)?.label || "CF"}
              </span>
              {/* Small click indicator */}
              <div style={{
                position: "absolute",
                top: "-10px",
                right: "-10px",
                width: "18px",
                height: "18px",
                backgroundColor: "#1976d2",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "11px",
                color: "white",
                fontWeight: "bold",
                boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                zIndex: 10,
                animation: "pulse 2s infinite",
              }}>
                ↻
              </div>
            </div>
          )}
          <div style={{ 
            position: "absolute",
            bottom: icon ? "5px" : "25px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "90%",
            zIndex: 0,
          }}>
            {/* No text fields for third row */}
            {!isPIR && !isDisplay && !isThirdRow && (
              <>
                {currentStep === 4 ? (
                  // Step 4: Read-only display, no "Add text" placeholder
                  text && (
                    <div 
                      style={{ 
                        fontSize: panelDesign.fontSize || "12px", 
                        color: panelDesign.textColor || "#000000",
                        wordBreak: "break-word",
                        maxWidth: "100%",
                        textAlign: "center",
                        padding: "4px",
                        borderRadius: "4px",
                        fontFamily: panelDesign.fonts || undefined,
                      }}
                    >
              {text}
            </div>
                  )
                ) : (
                  // Other steps: Editable functionality (only for editable cells)
                  <>
                    {isEditing && isEditable ? (
          <input
            type="text"
            value={text || ""}
            onChange={(e) => handleTextChange(e, displayIndex)}
                        onBlur={handleTextBlur}
                        autoFocus
            style={{
                          width: "100%",
              padding: "4px",
                          fontSize: panelDesign.fontSize || "12px",
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
                        onClick={isEditable ? () => handleTextClick(displayIndex) : undefined}
                        style={{ 
                          fontSize: panelDesign.fontSize || "12px", 
                          color: text ? panelDesign.textColor || "#000000" : "#999999",
                          wordBreak: "break-word",
                          maxWidth: "100%",
                          textAlign: "center",
                          padding: "4px",
                          cursor: isEditable ? "pointer" : "default",
                          borderRadius: "4px",
                          backgroundColor: isHovered && isEditable ? "rgba(255, 255, 255, 0.1)" : "transparent",
                          transition: "all 0.2s ease",
                          fontFamily: panelDesign.fonts || undefined,
                        }}
                      >
                        {text || (isEditable ? "Add text" : "")}
                      </div>
                    )}
                  </>
                )}
              </>
            )}
            {/* Removed temp unit text indicator */}
          </div>
        </div>
      </GridCell>
    );
  };

  const customizerSteps = [
    { step: 1, label: 'Select Panel Type' },
    { step: 2, label: 'Select your icons' },
    { step: 3, label: 'Select Panel Design' },
    { step: 4, label: 'Review panel details' },
  ];
  const activeStep = currentStep - 1; // 0-based index

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

  // On mount and when icons or placedIcons change, ensure cell 1 always has a TAG icon (default to CF)
  useEffect(() => {
    if (!placedIcons.some(icon => icon.position === 1) && tagIcons.length > 0) {
      // Try to find CF, otherwise use the first TAG icon
      const cfIcon = tagIcons.find(icon => icon.id === 'CF') || tagIcons[0];
      setPlacedIcons(prev => [
        ...prev.filter(icon => icon.position !== 1),
        {
          id: Date.now(),
          iconId: cfIcon.id,
          src: cfIcon.src,
          label: cfIcon.label,
          position: 1,
          category: cfIcon.category
        }
      ]);
    }
    // eslint-disable-next-line
  }, [icons, placedIcons.length]);

  // Cell 1 cycling state: track which TAG icon is currently in cell 1
  const cell1TagIndex = tagIcons.findIndex(icon => icon.id === placedIcons.find(i => i.position === 1)?.iconId);

  // Make placedIcons available globally for GridCell margin logic
  if (typeof window !== 'undefined') {
    (window as any).placedIcons = placedIcons;
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: '#f6f8fa',
        py: 8,
      }}
    >
      {/* Project Name at top center */}
      {(projectName || projectCode) && (
        <Box sx={{ 
          position: 'absolute', 
          top: 20, 
          left: 0, 
          right: 0, 
          display: 'flex', 
          justifyContent: 'center', 
          pointerEvents: 'none', 
          zIndex: 1000 
        }}>
          <Typography sx={{
            fontSize: 14,
            color: '#1a1f2c',
            fontWeight: 400,
            letterSpacing: 0.5,
            fontFamily: '"Myriad Hebrew", "Monsal Gothic", sans-serif',
            opacity: 0.8,
          }}>
            {projectName}{projectCode && ` - ${projectCode}`}
          </Typography>
        </Box>
      )}
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
          style={{ height: '40px', width: 'auto', cursor: 'pointer' }}
          onClick={() => navigate('/')} 
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

        {/* Step Navigation Buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 4 }}>
          <Button
            variant="outlined"
            onClick={() => {
              if (currentStep === 2) {
                navigate('/panel-type');
              } else {
                setCurrentStep((prev) => prev - 1);
              }
            }}
            disabled={currentStep === 1}
          >
            Back
          </Button>
          <Button
            variant="contained"
            onClick={() => setCurrentStep((prev) => prev + 1)}
            disabled={currentStep === customizerSteps.length}
            sx={{ display: currentStep === 4 ? 'none' : 'inline-flex' }}
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
                    style={{ width: "32px", height: "32px", objectFit: "contain", filter: icon.category === "TAG" ? (ICON_COLOR_FILTERS[panelDesign.iconColor] || ICON_COLOR_FILTERS['#000000']) : undefined }}
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
        {/* Step 3: Panel Design */}
        {currentStep === 3 && (
          <div style={{ 
            display: 'flex', 
            gap: '80px',
            alignItems: 'flex-start',
            justifyContent: 'center',
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '0 20px'
          }}>
            {/* Left side - Panel Design Controls */}
            <div style={{ 
              flex: '0 0 480px',
              background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
              padding: '28px',
              borderRadius: '12px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.8)',
              border: '1px solid #e9ecef',
              fontFamily: '"Myriad Hebrew", "Monsal Gothic", sans-serif',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Subtle background pattern */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '3px',
                background: 'linear-gradient(90deg, #0056b3 0%, #007bff 50%, #0056b3 100%)',
                borderRadius: '12px 12px 0 0'
              }} />
              
              <h3 style={{
                margin: '0 0 24px 0',
                fontSize: '20px',
                fontWeight: '600',
                color: '#1a1f2c',
                textAlign: 'center',
                letterSpacing: '0.5px',
                textShadow: '0 1px 2px rgba(0,0,0,0.1)'
              }}>
                Panel Design
              </h3>

              {/* Background Color Section */}
              <div style={{ 
                marginBottom: '28px',
                background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
                padding: '20px',
                borderRadius: '10px',
                boxShadow: '0 2px 12px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.8)',
                border: '1px solid #e9ecef'
              }}>
                <div style={{ 
                  fontWeight: '600', 
                  marginBottom: '16px', 
                  color: '#1a1f2c',
                  fontSize: '15px',
                  letterSpacing: '0.3px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <div style={{
                    width: '4px',
                    height: '16px',
                    background: 'linear-gradient(180deg, #0056b3 0%, #007bff 100%)',
                    borderRadius: '2px'
                  }} />
                  Background Color (RAL)
                </div>
      <div
        style={{
                display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
                    gap: '10px',
                    maxHeight: '200px',
                overflowY: 'auto',
                    background: 'linear-gradient(145deg, #f8f9fa 0%, #ffffff 100%)',
                    borderRadius: '8px',
                    padding: '16px',
                    border: '1px solid #dee2e6',
                    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.04)'
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
                        border: panelDesign.backgroundColor === color.hex ? '2px solid #0056b3' : '1px solid #dee2e6',
                        borderRadius: '8px',
                        background: panelDesign.backgroundColor === color.hex ? 'linear-gradient(145deg, #e3f2fd 0%, #f0f8ff 100%)' : 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
                    cursor: 'pointer',
                        padding: '8px 6px',
                    outline: 'none',
                        boxShadow: panelDesign.backgroundColor === color.hex ? '0 0 0 3px rgba(0, 86, 179, 0.15), 0 2px 8px rgba(0,0,0,0.1)' : '0 2px 6px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.8)',
                        transition: 'all 0.2s ease',
                        transform: panelDesign.backgroundColor === color.hex ? 'translateY(-1px)' : 'translateY(0)',
                  }}
                >
                  <span
                    style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '6px',
                      background: color.hex,
                          border: '2px solid #ffffff',
                          marginBottom: '6px',
                      display: 'block',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.3)'
                    }}
                  />
                      <span style={{ fontSize: '11px', fontWeight: '600', color: '#495057' }}>{`RAL ${color.code}`}</span>
                </button>
              ))}
        </div>
      </div>

              {/* Font Selection Section */}
              <div style={{ 
                marginBottom: '28px',
                background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
                padding: '20px',
                borderRadius: '10px',
                boxShadow: '0 2px 12px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.8)',
                border: '1px solid #e9ecef'
              }}>
                <div style={{ 
                  fontWeight: '600', 
                  marginBottom: '16px', 
                  color: '#1a1f2c',
                  fontSize: '15px',
                  letterSpacing: '0.3px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <div style={{
                    width: '4px',
                    height: '16px',
                    background: 'linear-gradient(180deg, #0056b3 0%, #007bff 100%)',
                    borderRadius: '2px'
                  }} />
                  Typography Font
                </div>
                <div style={{ position: 'relative' }} ref={fontDropdownRef}>
                <input
                  type="text"
                  placeholder="Search Google Fonts..."
                  value={fontSearch || panelDesign.fonts || ''}
                  onChange={e => {
                    const newSearch = e.target.value;
                    setFontSearch(newSearch);
                    if (newSearch === '') {
                      setPanelDesign(prev => ({ ...prev, fonts: '' }));
                    }
                    setShowFontDropdown(true);
                  }}
                  onFocus={() => setShowFontDropdown(true)}
                  style={{
                      padding: '12px 16px',
                      borderRadius: '8px',
                      border: '1px solid #dee2e6',
                      fontSize: '14px',
                    width: '100%',
                    fontFamily: panelDesign.fonts || undefined,
                      background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.8)',
                      transition: 'all 0.2s ease',
                      outline: 'none'
                  }}
                />
                {showFontDropdown && (
                  <div style={{
                    position: 'absolute',
                    top: '110%',
                    left: 0,
                    right: 0,
                      background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
                      border: '1px solid #dee2e6',
                      borderRadius: '8px',
                      maxHeight: '200px',
                    overflowY: 'auto',
                    zIndex: 10,
                      boxShadow: '0 4px 16px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08)'
                  }}>
                    {fontsLoading ? (
                        <div style={{ padding: 16, textAlign: 'center', color: '#6c757d' }}>Loading fonts...</div>
                    ) : (
                      <>
                        <div
                            style={{ 
                              padding: 12, 
                              cursor: 'pointer', 
                              fontFamily: 'inherit', 
                              color: '#6c757d',
                              borderBottom: '1px solid #f8f9fa',
                              transition: 'background 0.2s ease'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = '#f8f9fa'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                          onClick={() => {
                            setPanelDesign({ ...panelDesign, fonts: '' });
                            setFontSearch('');
                            setShowFontDropdown(false);
                          }}
                        >Default</div>
                        {allGoogleFonts
                          .filter(f => f.toLowerCase().includes(fontSearch.toLowerCase()))
                            .slice(0, 20)
                          .map(font => (
                            <div
                              key={font}
                              style={{
                                  padding: 12,
                                cursor: 'pointer',
                                fontFamily: font,
                                  background: font === panelDesign.fonts ? 'linear-gradient(145deg, #e3f2fd 0%, #f0f8ff 100%)' : 'transparent',
                                  transition: 'background 0.2s ease',
                                  borderBottom: '1px solid #f8f9fa'
                              }}
                                onMouseEnter={(e) => e.currentTarget.style.background = '#f8f9fa'}
                                onMouseLeave={(e) => e.currentTarget.style.background = font === panelDesign.fonts ? 'linear-gradient(145deg, #e3f2fd 0%, #f0f8ff 100%)' : 'transparent'}
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
                            <div style={{ padding: 16, color: '#adb5bd' }}>No fonts found</div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
              
              {/* Font Size Section */}
              <div style={{ 
                marginBottom: '28px',
                background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
                padding: '20px',
                borderRadius: '10px',
                boxShadow: '0 2px 12px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.8)',
                border: '1px solid #e9ecef'
              }}>
                <div style={{ 
                  fontWeight: '600', 
                  marginBottom: '16px', 
                  color: '#1a1f2c',
                  fontSize: '15px',
                  letterSpacing: '0.3px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <div style={{
                    width: '4px',
                    height: '16px',
                    background: 'linear-gradient(180deg, #0056b3 0%, #007bff 100%)',
                    borderRadius: '2px'
                  }} />
                  Font Size
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  {['10px', '12px', '14px', '16px'].map((size) => (
        <button
                      key={size}
                      onClick={() => setPanelDesign(prev => ({ ...prev, fontSize: size }))}
          style={{
                        padding: '10px 16px',
                        borderRadius: '8px',
                        border: panelDesign.fontSize === size ? '2px solid #0056b3' : '1px solid #dee2e6',
                        background: panelDesign.fontSize === size ? 'linear-gradient(145deg, #0056b3 0%, #007bff 100%)' : 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
                        color: panelDesign.fontSize === size ? '#ffffff' : '#495057',
                        cursor: 'pointer',
                        fontSize: size,
                        fontWeight: panelDesign.fontSize === size ? '700' : '600',
                        transition: 'all 0.2s ease',
                        minWidth: '45px',
                        textAlign: 'center',
                        boxShadow: panelDesign.fontSize === size ? '0 4px 12px rgba(0, 86, 179, 0.3), inset 0 1px 0 rgba(255,255,255,0.2)' : '0 2px 6px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.8)',
                        transform: panelDesign.fontSize === size ? 'translateY(-1px)' : 'translateY(0)',
                      }}
                    >
                      {size.replace('px', '')}
        </button>
                  ))}
                </div>
              </div>
              
              {/* Colors Section */}
              <div style={{ 
                marginBottom: '28px',
                background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
                padding: '20px',
                borderRadius: '10px',
                boxShadow: '0 2px 12px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.8)',
                border: '1px solid #e9ecef'
              }}>
                <div style={{ 
                  fontWeight: '600', 
                  marginBottom: '16px', 
                  color: '#1a1f2c',
                  fontSize: '15px',
                  letterSpacing: '0.3px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <div style={{
                    width: '4px',
                    height: '16px',
                    background: 'linear-gradient(180deg, #0056b3 0%, #007bff 100%)',
                    borderRadius: '2px'
                  }} />
                  Colors
                </div>
                <div style={{ display: 'flex', gap: '28px', alignItems: 'flex-start' }}>
              <div>
                    <div style={{ 
                      fontWeight: '600', 
                      marginBottom: '12px', 
                      color: '#495057',
                      fontSize: '13px',
                      letterSpacing: '0.3px'
                    }}>
                      Icon Color
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {Object.entries(ICON_COLOR_FILTERS).map(([color]) => (
        <button
                      key={color}
                      onClick={() => setPanelDesign(prev => ({ ...prev, iconColor: color }))}
          style={{
                            width: '36px',
                            height: '36px',
                        borderRadius: '50%',
                        background: color,
                            border: panelDesign.iconColor === color ? '3px solid #0056b3' : '2px solid #dee2e6',
                        cursor: 'pointer',
                        padding: 0,
                        outline: 'none',
                            boxShadow: panelDesign.iconColor === color ? '0 0 0 3px rgba(0, 86, 179, 0.2), 0 4px 12px rgba(0,0,0,0.15)' : '0 2px 6px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.3)',
                            transition: 'all 0.2s ease',
                            transform: panelDesign.iconColor === color ? 'scale(1.1)' : 'scale(1)',
                      }}
                    />
                  ))}
                </div>
              </div>
              <div>
                    <div style={{ 
                      fontWeight: '600', 
                      marginBottom: '12px', 
                      color: '#495057',
                      fontSize: '13px',
                      letterSpacing: '0.3px'
                    }}>
                      Text Color
                    </div>
                <input
                  type="color"
                  value={panelDesign.textColor}
                  onChange={e => setPanelDesign(prev => ({ ...prev, textColor: e.target.value }))}
                  style={{
                        width: '64px',
                        height: '40px',
                        border: '2px solid #dee2e6',
                        borderRadius: '8px',
                    cursor: 'pointer',
                        padding: '2px',
                        background: '#ffffff',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.8)',
                        transition: 'all 0.2s ease'
                  }}
                />
              </div>
            </div>
          </div>
            </div>

            {/* Right side - Panel Template */}
            <div style={{ flex: '0 0 auto', marginTop: '100px' }}>
          <div
            style={{
              width: "350px",
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
                  transform: "perspective(1000px) rotateX(5deg)",
                  transformStyle: "preserve-3d",
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
                
                {/* Content with higher z-index */}
                <div style={{ 
                  display: "flex", 
                  flexWrap: "wrap",
                  position: "relative",
                  zIndex: 2,
                }}>
              {Array.from({ length: 12 }).map((_, index) => renderGridCell(index))}
      </div>
    </div>
        </div>
          </div>
        )}
        {/* Step 4: Review Panel Details */}
        {currentStep === 4 && (
          <>
            {/* Information Box and Panel Template side by side */}
            <div style={{ 
              marginTop: "60px", 
              marginBottom: "40px",
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'flex-start',
              gap: '40px',
              flexWrap: 'wrap'
            }}>
              {/* Information Box */}
              <div style={{ flex: '0 0 auto' }}>
                <InformationBox
                  backbox={backbox}
                  setBackbox={v => {
                    setBackbox(v);
                    if (backboxError) setBackboxError('');
                  }}
                  backboxError={backboxError}
                  extraComments={extraComments}
                  setExtraComments={setExtraComments}
                  panelDesign={panelDesign}
                  placedIcons={placedIcons}
                  ICON_COLOR_FILTERS={ICON_COLOR_FILTERS}
                  ralColors={ralColors}
                />
              </div>
              
              {/* Panel Template */}
              <div style={{ flex: '0 0 auto', marginTop: '100px' }}>
                <div
                  style={{
                    width: "350px",
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
                    transform: "perspective(1000px) rotateX(5deg)",
                    transformStyle: "preserve-3d",
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
                  
                  {/* Content with higher z-index */}
                  <div style={{ 
                    display: "flex", 
                    flexWrap: "wrap",
                    position: "relative",
                    zIndex: 2,
                  }}>
                    {Array.from({ length: 12 }).map((_, index) => renderGridCell(index))}
                  </div>
                </div>
                
                {/* Add to Project Button positioned under the panel template */}
                <Box sx={{ mt: 6, display: 'flex', justifyContent: 'center' }}>
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
                    Add Panel to Project
            </StyledButton>
        </Box>
              </div>
            </div>
          </>
        )}
        {/* Panel Template: Only visible for step 2 (step 4 has its own template) */}
        {currentStep === 2 && (
          <div style={{ marginBottom: "20px", display: 'flex', justifyContent: 'center', alignItems: 'flex-start', gap: 16, marginLeft: "50px" }}>
            {/* Panel Template */}
            <div
              style={{
                width: "350px",
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
                transform: "perspective(1000px) rotateX(5deg)",
                transformStyle: "preserve-3d",
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
              
              {/* Content with higher z-index */}
              <div style={{ 
                display: "flex", 
                flexWrap: "wrap",
                position: "relative",
                zIndex: 2,
              }}>
                {Array.from({ length: 12 }).map((_, index) => renderGridCell(index))}
              </div>
            </div>
            {/* Arrow Icon Button */}
            <button
              onClick={() => setSwapRows((prev) => !prev)}
              style={{
                background: '#1976d2',
                color: '#fff',
                border: 'none',
                borderRadius: '50%',
                width: 40,
                height: 40,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 24,
                cursor: 'pointer',
                boxShadow: '0 2px 8px #1976d233',
                marginLeft: 16
              }}
              title="Switch Rows 3 and 4"
            >
              ⇅
            </button>
          </div>
        )}
      </Container>
    </Box>
  );
};

export default TAGCustomizer; 