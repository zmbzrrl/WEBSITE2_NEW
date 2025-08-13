/// Import necessary libraries and components
import React, { useState, useEffect, useRef, useContext } from "react";
import { useCart } from '../../../contexts/CartContext';
import '../Customizer.css';
import CartButton from '../../../components/CartButton';
import { useNavigate, useLocation } from "react-router-dom";
import logo2 from '../../../assets/logo.png';
import {
  Container,
  Typography,
  Box,
  Button,
  useTheme,
  TextField,
  Grid,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { ralColors, RALColor } from '../../../data/ralColors';
import { ProjectContext } from '../../../App';
import { motion } from 'framer-motion';
import SP from '../../../assets/panels/SP.png';
import logo from '../../../assets/logo.png';

import { getPanelLayoutConfig } from '../../../data/panelLayoutConfig';
import iconLibrary from '../../../assets/iconLibrary';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

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

// Move InformationBox to the top level, before SPCustomizer
const InformationBox = ({
  backbox,
  setBackbox,
  backboxError,
  extraComments,
  setExtraComments,
  panelDesign,
  placedIcons,
  getIconColorFilter,
  ralColors
}: {
  backbox: string;
  setBackbox: (v: string) => void;
  backboxError: string;
  extraComments: string;
  setExtraComments: (v: string) => void;
  panelDesign: any;
  placedIcons: any[];
  getIconColorFilter: { [key: string]: string };
  ralColors: any[];
}) => {
  const selectedRALColor = ralColors.find(color => color.hex === panelDesign.backgroundColor);

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
                  Icons: Auto-colored
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

// --- Add this utility for DPH double grid positions ---
// Original 3x3 grid positions (left side)
const baseIconPositions = [
  { top: '23px', left: '33px' },   // 0
  { top: '23px', left: '136px' },  // 1
  { top: '23px', left: '233px' },  // 2
  { top: '123px', left: '33px' },  // 3
  { top: '123px', left: '136px' }, // 4
  { top: '123px', left: '233px' }, // 5
  { top: '218px', left: '33px' },  // 6
  { top: '218px', left: '136px' }, // 7
  { top: '218px', left: '233px' }, // 8
];
// Right side: offset left by 320px
const rightIconPositions = baseIconPositions.map(pos => ({
  ...pos,
  left: (parseInt(pos.left) + 320) + 'px',
}));
const doublePanelIconPositions = [...baseIconPositions, ...rightIconPositions];

const X1HCustomizer: React.FC = () => {
  const cartContext = useCart();
  const navigate = useNavigate();
  const location = useLocation();
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
    iconSize: string;
    backbox?: string;
    extraComments?: string;
    swapSides?: boolean;
    mirrorGrid?: boolean;
  }>({
    backgroundColor: '',
          fonts: '',
      backlight: '',
      iconColor: '#000000',
      plasticColor: '',
    textColor: '#000000',
    fontSize: '12px',
    iconSize: '40px',
  });
  const [backbox, setBackbox] = useState('');
  const [extraComments, setExtraComments] = useState('');
  const [backboxError, setBackboxError] = useState('');
  const [allGoogleFonts, setAllGoogleFonts] = useState<string[]>(FALLBACK_GOOGLE_FONTS);
  const [fontSearch, setFontSearch] = useState('');
  const [showFontDropdown, setShowFontDropdown] = useState(false);
  const [fontsLoading, setFontsLoading] = useState(false);
  const fontDropdownRef = useRef<HTMLDivElement>(null);
  // Function to determine icon color based on background
  const getIconColorFilter = (backgroundColor: string): string => {
    // Convert hex to RGB for brightness calculation
    const hex = backgroundColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    // Calculate brightness (0-255)
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    
    // Use white for dark backgrounds, dark grey for light backgrounds
    if (brightness < 128) {
      // Dark background - use white icons
      return 'brightness(0) saturate(100%) invert(1)';
    } else {
      // Light background - use dark grey icons
      return 'brightness(0) saturate(100%) invert(52%) sepia(0%) saturate(0%) hue-rotate(148deg) brightness(99%) contrast(91%)';
    }
  };
  const [iconHovered, setIconHovered] = useState<{ [index: number]: boolean }>({});
  const { projectName, projectCode } = useContext(ProjectContext);
  const [selectedFont, setSelectedFont] = useState<string>('Arial');
  const [isTextEditing, setIsTextEditing] = useState<number | null>(null);
  const [swapSides, setSwapSides] = useState(false); // NEW: swap state
  const [mirrorGrid, setMirrorGrid] = useState(false); // NEW: mirror state
  
  // Edit mode state
  const isEditMode = location.state?.editMode || false;
  const editPanelIndex = location.state?.panelIndex;
  const editPanelData = location.state?.panelData;
  
  console.log('RENDER', { backbox, extraComments });

  useEffect(() => {
    import("../../../assets/iconLibrary").then((module) => {
      setIcons(module.default);
      setIconCategories(module.iconCategories.filter(cat => cat !== 'TAG'));
    });
  }, []);

  // Load existing panel data if in edit mode
  useEffect(() => {
    if (isEditMode && editPanelData) {
      // Load panel design
      if (editPanelData.panelDesign) {
        setPanelDesign(editPanelData.panelDesign);
        setBackbox(editPanelData.panelDesign.backbox || '');
        setExtraComments(editPanelData.panelDesign.extraComments || '');
        // Load swap state
        setSwapSides(editPanelData.panelDesign.swapSides || false);
        // Load mirror state
        setMirrorGrid(editPanelData.panelDesign.mirrorGrid || false);
      }
      
      // Load placed icons
      if (editPanelData.icons) {
        const loadedIcons: PlacedIcon[] = editPanelData.icons
          .filter((icon: any) => icon.iconId)
          .map((icon: any) => ({
            id: Date.now() + Math.random(), // Generate new IDs
            iconId: icon.iconId,
            src: icon.src || '',
            label: icon.label || '',
            position: icon.position,
            category: icon.category || ''
          }));
        setPlacedIcons(loadedIcons);
        
        // Load icon texts
        const loadedTexts: IconTexts = {};
        editPanelData.icons.forEach((icon: any) => {
          if (icon.text) {
            loadedTexts[icon.position] = icon.text;
          }
        });
        setIconTexts(loadedTexts);
      }
      
      // Set current step to design step (step 3) for editing
      setCurrentStep(3);
    }
  }, [isEditMode, editPanelData]);

  if (!cartContext) {
    throw new Error("CartContext must be used within a CartProvider");
  }

  const { addToCart, updatePanel } = cartContext;

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
      // Only allow placement in bottom center cell (7 or 16)
      if (cellIndex !== 7 && cellIndex !== 16) return;
      // Check if PIR icon is already placed in this grid
      const hasPIR = placedIcons.some((icon) => icon.category === "PIR" && (icon.position === 7 || icon.position === 16));
      if (hasPIR) return;
    }

    // Check if trying to place G1 or G2 icon
    if (selectedIcon.id === "G1" || selectedIcon.id === "G2") {
      // Only allow placement in columns 1 and 2 (cells 0,1,3,4,6,7) - not in right column (cells 2,5,8)
      if (cellIndex !== 0 && cellIndex !== 1 && cellIndex !== 3 && cellIndex !== 4 && cellIndex !== 6 && cellIndex !== 7) return;
    }

    // Check if trying to place G3 icon
    if (selectedIcon.id === "G3") {
      // Only allow placement in columns 2 and 3 (cells 1,2,4,5,7,8) - not in left column (cells 0,3,6)
      if (cellIndex !== 1 && cellIndex !== 2 && cellIndex !== 4 && cellIndex !== 5 && cellIndex !== 7 && cellIndex !== 8) return;
    }

    // Check if trying to place a Socket icon
    if (selectedIcon.category === "Sockets") {
      // Only allow placement in the single slot (index 9)
      if (cellIndex !== 9) return;
      // Prevent more than one socket in the single slot
      const hasSocket = placedIcons.some((icon) => icon.category === "Sockets" && icon.position === 9);
      if (hasSocket) return;
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
    // Check if backbox details are provided
    if (!backbox.trim()) {
      setBackboxError('Please provide backbox details before adding the panel to your project.');
      return;
    }

    const design: Design & { panelDesign: typeof panelDesign & { swapSides?: boolean; mirrorGrid?: boolean } } = {
      type: "X1H",
      icons: Array.from({ length: iconPositions?.length || 0 })
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
      panelDesign: { ...panelDesign, backbox, extraComments, swapSides, mirrorGrid },
    };

    if (isEditMode && editPanelIndex !== undefined) {
      // Update existing panel
      updatePanel(editPanelIndex, design);
      navigate('/cart'); // Go back to cart after updating
    } else {
      // Add new panel
    addToCart(design);
    }
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
        // Prevent any non-socket icon from being placed in the single icon slot (index 9)
        if (cellIndex === 9 && icon.category !== "Sockets") return;

        // Check if trying to place PIR icon
        if (icon.category === "PIR") {
          if (cellIndex !== 7 && cellIndex !== 16) return;
          const hasPIR = placedIcons.some((icon) => icon.category === "PIR" && (icon.position === 7 || icon.position === 16));
          if (hasPIR) return;
        }

        // Check if trying to place G1 or G2 icon
        if (icon.id === "G1" || icon.id === "G2") {
          // Only allow placement in columns 1 and 2 (cells 0,1,3,4,6,7) - not in right column (cells 2,5,8)
          if (cellIndex !== 0 && cellIndex !== 1 && cellIndex !== 3 && cellIndex !== 4 && cellIndex !== 6 && cellIndex !== 7) return;
        }

        // Check if trying to place G3 icon
        if (icon.id === "G3") {
          // Only allow placement in columns 2 and 3 (cells 1,2,4,5,7,8) - not in left column (cells 0,3,6)
          if (cellIndex !== 1 && cellIndex !== 2 && cellIndex !== 4 && cellIndex !== 5 && cellIndex !== 7 && cellIndex !== 8) return;
        }

        // Check if trying to place a Socket icon
        if (icon.category === "Sockets") {
          if (cellIndex !== 9) return;
          const hasSocket = placedIcons.some((icon) => icon.category === "Sockets" && icon.position === 9);
          if (hasSocket) return;
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
        // Prevent swapping a non-socket icon into the single icon slot (index 9)
        if (cellIndex === 9 && sourceIcon.category !== "Sockets") return;
        if (dragData.position === 9 && targetIcon && targetIcon.category !== "Sockets") return;

        // Check PIR restrictions
        if (sourceIcon.category === "PIR") {
          if (cellIndex !== 7 && cellIndex !== 16) return;
        }
        if (targetIcon?.category === "PIR") {
          if (dragData.position !== 7 && dragData.position !== 16) return;
        }

        // Check G1/G2 restrictions
        if (sourceIcon.iconId === "G1" || sourceIcon.iconId === "G2") {
          // G1/G2 cannot be moved to column 3 (cells 2, 5, 8)
          if (cellIndex === 2 || cellIndex === 5 || cellIndex === 8) return;
        }
        if (targetIcon?.iconId === "G1" || targetIcon?.iconId === "G2") {
          // G1/G2 cannot be moved from column 3 (cells 2, 5, 8)
          if (dragData.position === 2 || dragData.position === 5 || dragData.position === 8) return;
        }

        // Check G3 restrictions
        if (sourceIcon.iconId === "G3") {
          // G3 cannot be moved to column 1 (cells 0, 3, 6)
          if (cellIndex === 0 || cellIndex === 3 || cellIndex === 6) return;
        }
        if (targetIcon?.iconId === "G3") {
          // G3 cannot be moved from column 1 (cells 0, 3, 6)
          if (dragData.position === 0 || dragData.position === 3 || dragData.position === 6) return;
        }

        // Check Socket restrictions for swapping
        if (sourceIcon.category === "Sockets") {
          if (cellIndex !== 9) return;
        }
        if (targetIcon?.category === "Sockets") {
          if (dragData.position !== 9) return;
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

  // Helper to get swapped positions for rendering
  const getCellRenderPosition = (index: number) => {
    if (!swapSides) return index;
    // For 3x3 grid (0-8) and single slot (9): swap their horizontal sides
    // The grid is on the left (0-8), slot 9 is on the right by default
    // When swapped, grid moves right, slot 9 moves left
    if (index === 9) return 10; // We'll render slot 9 at a new left position
    if (index >= 0 && index <= 8) return index + 20; // We'll render grid at new left offset
    return index;
  };

  // Define swapped positions for visual layout only
  const swappedGridOffset = 320; // Move grid to right side

  const renderAbsoluteCell = (index: number) => {
    const icon = placedIcons.find((i) => i.position === index);
    const text = iconTexts[index];
    const isPIR = icon?.category === "PIR";
    const isEditing = editingCell === index;
    const isHovered = hoveredCell === index;
    const isIconHovered = !!iconHovered[index];
    const iconSize = panelDesign.iconSize || '40px';
    // Default position
    let pos = iconPositions?.[index] || { top: '0px', left: '0px' };
    // If swapSides is true, adjust positions
    if (swapSides) {
      if (index === 9) {
        // For the single icon slot, move it to the left side (where the grid was)
        // Position it more towards the center of the left side, around 40px from left edge
        pos = { ...pos, left: '40px' };
      } else if (index >= 0 && index <= 8) {
        // Move the 3x3 grid to the right side
        pos = { ...pos, left: (parseInt(pos.left) + swappedGridOffset) + 'px' };
      }
    }
    
    // If mirrorGrid is true, mirror the 3x3 grid horizontally
    if (mirrorGrid && index >= 0 && index <= 8) {
      // Mirror the grid: columns 0,1,2 become 2,1,0
      // Original positions: 0,1,2 | 3,4,5 | 6,7,8
      // Mirrored positions: 2,1,0 | 5,4,3 | 8,7,6
      const mirrorMap = [2, 1, 0, 5, 4, 3, 8, 7, 6];
      const mirroredIndex = mirrorMap[index];
      const mirroredPos = iconPositions?.[mirroredIndex] || pos;
      pos = { ...mirroredPos };
      
      // If also swapped, apply the swap offset to the mirrored position
      if (swapSides) {
        pos = { ...pos, left: (parseInt(pos.left) + swappedGridOffset) + 'px' };
      }
    }
    
    // Calculate container size to match icon size
    const containerSize = isPIR ? '40px' : (icon?.category === 'Bathroom' ? `${parseInt(panelDesign.iconSize || '40px') + 10}px` : (index === 9 ? '240px' : panelDesign.iconSize || '40px'));
    
    return (
        <div
        key={index}
          style={{
          position: 'absolute',
          ...pos,
          width: containerSize,
          height: containerSize,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-start',
          zIndex: 2,
        }}
        onDragOver={e => { e.preventDefault(); }}
        onDrop={currentStep === 4 ? undefined : e => { e.preventDefault(); const iconId = e.dataTransfer.getData('text/plain'); handleDrop(index, iconId); }}
        >
          {icon && (
            <div
            style={{ position: 'relative', display: 'inline-block' }}
            onMouseEnter={() => setIconHovered(prev => ({ ...prev, [index]: true }))}
            onMouseLeave={() => setIconHovered(prev => ({ ...prev, [index]: false }))}
            >
              <img
                src={icon.src}
                alt={icon.label}
                draggable={currentStep !== 4}
                onDragStart={currentStep !== 4 ? (e) => handleDragStart(e, icon) : undefined}
                style={{
                width: isPIR ? '40px' : (icon?.category === 'Bathroom' ? `${parseInt(panelDesign.iconSize || '40px') + 10}px` : (index === 9 ? '240px' : panelDesign.iconSize || '40px')),
                height: isPIR ? '40px' : (icon?.category === 'Bathroom' ? `${parseInt(panelDesign.iconSize || '40px') + 10}px` : (index === 9 ? '240px' : panelDesign.iconSize || '40px')),
                objectFit: 'contain',
                marginBottom: '5px',
                position: 'relative',
                  zIndex: 1,
                marginTop: isPIR ? '20px' : '0',
                cursor: currentStep !== 4 ? 'move' : 'default',
                  filter: !isPIR && icon?.category !== 'Sockets' ? getIconColorFilter(panelDesign.backgroundColor) : undefined,
                  transition: 'filter 0.2s',
                }}
              />
              {currentStep !== 4 && (
              <button
                onClick={(e) => { e.stopPropagation(); handleDeleteIcon(icon.id); }}
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
        {/* Text field always below the icon */}
            {!isPIR && icon?.category !== 'Sockets' && (
              <div style={{ width: '100%', textAlign: 'center', marginTop: icon ? '-11px' : '15px' }}>
                {index === 9 && !icon ? (
                  <div style={{ fontSize: '18px', color: '#bbb', fontWeight: 600, padding: '16px 0' }}>
                    drop socket
                  </div>
                ) : currentStep === 4 ? (
                  text && (
                    <div style={{
                      width: '100%',
                      textAlign: 'center',
                      fontSize: panelDesign.fontSize || '12px',
                      color: panelDesign.textColor || '#000000',
                      fontFamily: panelDesign.fonts || undefined,
                      wordBreak: 'break-word',
                    }}>{text}</div>
                  )
                ) : (
                  <>
                    {isEditing ? (
                      <input
                        type="text"
                        value={text || ''}
                        onChange={e => handleTextChange(e, index)}
                        onBlur={handleTextBlur}
                        autoFocus
                        style={{ width: '100%', padding: '4px', fontSize: panelDesign.fontSize || '12px', textAlign: 'center', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '4px', outline: 'none', background: 'rgba(255, 255, 255, 0.1)', transition: 'all 0.2s ease', fontFamily: panelDesign.fonts || undefined, color: panelDesign.textColor || '#000000', marginTop: '0px', marginLeft: '-40px' }}
                      />
                    ) : (
                      <div
                        onClick={() => handleTextClick(index)}
                        style={{ fontSize: panelDesign.fontSize || '12px', color: text ? panelDesign.textColor || '#000000' : '#999999', wordBreak: 'break-word', width: '120px', textAlign: 'center', padding: '4px', cursor: 'pointer', borderRadius: '4px', backgroundColor: isHovered ? 'rgba(255, 255, 255, 0.1)' : 'transparent', transition: 'all 0.2s ease', fontFamily: panelDesign.fonts || undefined, marginLeft: '-40px' }}
                      >
                        {text || 'Add text'}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
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

  // Only destructure config once, then override iconPositions
  const config = getPanelLayoutConfig('X1H');
  console.log('X1H iconPositions length:', config.iconPositions?.length, config.iconPositions);
  const { dimensions, iconLayout, textLayout, specialLayouts, iconPositions = [] } = config;

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
                navigate('/panel/extended');
              } else {
                setCurrentStep((s) => Math.max(2, s - 1));
              }
            }}
          >
            Back
          </Button>
          {currentStep !== 4 && (
          <Button
            variant="contained"
            disabled={currentStep === 4}
            onClick={() => setCurrentStep((s) => Math.min(4, s + 1))}
          >
            Next
          </Button>
          )}
        </Box>

                {/* Icon List: Only visible on step 2 */}
        {currentStep === 2 && (
          <>
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
            {/* Layout Control Buttons */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 16, margin: '24px 0 0 0' }}>
              <Button
                variant="outlined"
                onClick={() => setSwapSides((s) => !s)}
                sx={{ minWidth: 160, display: 'flex', alignItems: 'center', gap: 1 }}
                startIcon={!swapSides ? <ArrowForwardIcon sx={{ transform: 'rotate(180deg)' }} /> : <ArrowForwardIcon />}
              >
                {!swapSides ? 'Left Side' : 'Right Side'}
              </Button>
              <Button
                variant="outlined"
                onClick={() => setMirrorGrid((m) => !m)}
                sx={{ minWidth: 160 }}
              >
                {mirrorGrid ? 'Unmirror' : 'Mirror'}
              </Button>
            </div>
          </div>
          </>
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

            {/* Icon Size Section */}
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
                Icon Size
              </div>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                {['30px', '40px', '50px'].map((size) => (
                  <button
                    key={size}
                    onClick={() => setPanelDesign(prev => ({ ...prev, iconSize: size }))}
                    style={{
                      padding: '10px 16px',
                      borderRadius: '8px',
                      border: panelDesign.iconSize === size ? '2px solid #0056b3' : '1px solid #dee2e6',
                      background: panelDesign.iconSize === size ? 'linear-gradient(145deg, #0056b3 0%, #007bff 100%)' : 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
                      color: panelDesign.iconSize === size ? '#ffffff' : '#495057',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: panelDesign.iconSize === size ? '700' : '600',
                      transition: 'all 0.2s ease',
                      minWidth: '60px',
                      textAlign: 'center',
                      boxShadow: panelDesign.iconSize === size ? '0 4px 12px rgba(0, 86, 179, 0.3), inset 0 1px 0 rgba(255,255,255,0.2)' : '0 2px 6px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.8)',
                      transform: panelDesign.iconSize === size ? 'translateY(-1px)' : 'translateY(0)',
                    }}
                  >
                    {size.replace('px', '')}
                  </button>
                ))}
              </div>
            </div>
          </div>
            </div>

            {/* Right side - Panel Template */}
            <div style={{ flex: '0 0 auto', marginTop: '100px' }}>
              <div
                style={{
              position: 'relative',
              width: '640px', // doubled from 320px
              height: '320px', // keep height unchanged
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
            <div style={{ position: 'relative', zIndex: 2, width: '100%', height: '100%' }}>
              {Array.from({ length: iconPositions ? iconPositions.length : 0 }).map((_, index) => renderAbsoluteCell(index))}
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

                  ralColors={ralColors}
                />
              </div>
              
              {/* Panel Template */}
              <div style={{ flex: '0 0 auto', marginTop: '100px' }}>
                <div
                  style={{
                    position: 'relative',
                    width: '640px', // doubled from 320px
                    height: '320px',
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
                  <div style={{ position: 'relative', zIndex: 2, width: '100%', height: '100%' }}>
                    {Array.from({ length: iconPositions ? iconPositions.length : 0 }).map((_, index) => renderAbsoluteCell(index))}
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
                    {isEditMode ? 'Update Panel' : 'Add Panel to Project'}
            </StyledButton>
        </Box>
              </div>
            </div>
          </>
        )}
        {/* Panel Template: Only visible for step 2 (step 4 has its own template) */}
        {currentStep === 2 && (
          <div style={{ marginBottom: "20px", display: 'flex', justifyContent: 'center' }}>
            <div
              style={{
                position: 'relative',
                width: '640px',
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
              <div style={{ position: 'relative', zIndex: 2, width: '100%', height: '100%' }}>
                {Array.from({ length: iconPositions ? iconPositions.length : 0 }).map((_, index) => renderAbsoluteCell(index))}
              </div>
            </div>
          </div>
        )}
      </Container>
    </Box>
  );
};

export default X1HCustomizer; 
