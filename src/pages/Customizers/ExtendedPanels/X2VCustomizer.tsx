// Import necessary libraries and components
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { ralColors, RALColor } from '../../../data/ralColors';
import { ProjectContext } from '../../../App';
import { motion } from 'framer-motion';

import { getPanelLayoutConfig } from '../../../data/panelLayoutConfig';
import iconLibrary from '../../../assets/iconLibrary2';

// Fallback font list if API fails
const FALLBACK_GOOGLE_FONTS = [
  'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Poppins', 'Oswald', 'Raleway', 'Merriweather', 'Nunito', 'Quicksand', 'Source Sans Pro', 'Inter',
];

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
  maxWidth: '80px',
  minHeight: '40px',
  lineHeight: 1.2,
  whiteSpace: 'normal',
  wordBreak: 'break-word',
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
  ralColors
}: {
  backbox: string;
  setBackbox: (v: string) => void;
  backboxError: string;
  extraComments: string;
  setExtraComments: (v: string) => void;
  panelDesign: any;
  placedIcons: any[];
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
              <select
                value={backbox}
                onChange={e => {
                  setBackbox(e.target.value);
                }}
                style={{ width: '100%', padding: '8px', marginBottom: '8px', border: backboxError ? '1px solid red' : '1px solid #ccc', borderRadius: '4px', background: '#fff' }}
              >
                <option value="">Select a backbox...</option>
                <option value="Backbox 1">Backbox 1</option>
                <option value="Backbox 2">Backbox 2</option>
                <option value="Backbox 3">Backbox 3</option>
                <option value="Backbox 4">Backbox 4</option>
                <option value="Backbox 5">Backbox 5</option>
              </select>
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
              Comments
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

const X2VCustomizer: React.FC = () => {
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
  const [currentStep, setCurrentStep] = useState(2); // 2 or 3
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
  
  // PIR helpers (toggle-controlled motion sensor)
  const hasPIR = placedIcons.some(icon => icon.category === 'PIR');
  const getPirIndex = (): number => {
    // Prefer first grid bottom-center (7), else second (16)
    if (!placedIcons.some(icon => icon.position === 7)) return 7;
    return 16;
  };
  const addPir = () => {
    if (hasPIR) return;
    const pirPos = getPirIndex();
    if (placedIcons.some(icon => icon.position === pirPos)) return;
    const pirIcon = (icons as any)['PIR'];
    const newPir = {
      id: Date.now(),
      iconId: 'PIR',
      src: pirIcon?.src || '',
      label: 'PIR',
      position: pirPos,
      category: 'PIR'
    } as any;
    setPlacedIcons(prev => [...prev, newPir]);
  };
  const removePir = () => {
    setPlacedIcons(prev => prev.filter(icon => icon.category !== 'PIR'));
    setIconTexts(prev => ({ ...prev }));
  };

  const [iconHovered, setIconHovered] = useState<{ [index: number]: boolean }>({});
  const { projectName, projectCode } = useContext(ProjectContext);
  const [selectedFont, setSelectedFont] = useState<string>('Arial');
  const [isTextEditing, setIsTextEditing] = useState<number | null>(null);

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

  const getAutoTextColor = (backgroundColor: string): string => {
    const hex = (backgroundColor || '#ffffff').replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness < 128 ? '#ffffff' : '#2c2c2c';
  };

  // Custom panel component state
  const [showCustomPanelComponent, setShowCustomPanelComponent] = useState(false);
  const [showCustomPanelDialog, setShowCustomPanelDialog] = useState(false);
  const [fontSearchTerm, setFontSearchTerm] = useState('Myriad Pro SemiBold SemiCondensed');
  const [fontSearchFocused, setFontSearchFocused] = useState(false);
  
  // Google Fonts list
  const googleFonts = [
    'Arial', 'Helvetica', 'Times New Roman', 'Georgia', 'Verdana', 'Tahoma', 'Trebuchet MS', 'Arial Black', 'Impact', 'Comic Sans MS',
    'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Source Sans Pro', 'Raleway', 'PT Sans', 'Oswald', 'Lora', 'Nunito',
    'Playfair Display', 'Merriweather', 'Ubuntu', 'Crimson Text', 'Libre Baskerville', 'Droid Sans', 'Droid Serif', 'PT Serif',
    'Myriad Pro', 'Myriad Pro SemiBold SemiCondensed', 'Futura', 'Gill Sans', 'Calibri', 'Candara', 'Segoe UI', 'Consolas',
    'Courier New', 'Monaco', 'Menlo', 'Lucida Console', 'Andale Mono', 'DejaVu Sans Mono', 'Liberation Mono', 'Bitstream Vera Sans Mono'
  ];

  // Function to load Google Font
  const loadGoogleFont = (fontName: string) => {
    const link = document.createElement('link');
    link.href = `https://fonts.googleapis.com/css2?family=${fontName.replace(/\s+/g, '+')}:wght@300;400;500;600;700&display=swap`;
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  };
  
  // Edit mode state
  const isEditMode = location.state?.editMode || false;
  const editPanelIndex = location.state?.panelIndex;
  const editPanelData = location.state?.panelData;
  
  console.log('RENDER', { backbox, extraComments });

  useEffect(() => {
    import("../../../assets/iconLibrary2").then((module) => {
      setIcons(module.default);
      // Include all categories from iconLibrary2
      setIconCategories(module.iconCategories.filter(cat => cat !== 'Climate' && cat !== 'PIR'));
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

  const { addToCart, updatePanel, projPanels } = cartContext;

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
      // Only allow placement in the single slots (indices 9 and 10)
      if (cellIndex !== 9 && cellIndex !== 10) return;
      // Prevent more than one socket in the same slot
      const hasSocketInThisSlot = placedIcons.some((icon) => icon.category === "Sockets" && icon.position === cellIndex);
      if (hasSocketInThisSlot) return;
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

  const [qtyOpen, setQtyOpen] = useState(false);
  const [qtyRemaining, setQtyRemaining] = useState<number | undefined>(undefined);
  const [pendingDesign, setPendingDesign] = useState<any | null>(null);
  const [pendingCategory, setPendingCategory] = useState<'SP'|'TAG'|'IDPG'|'DP'|'EXT'>('EXT');

  const handleAddToCart = (): void => {
    // Check if backbox details are provided
    if (!backbox.trim()) {
      setBackboxError('Please provide backbox details before adding the panel to your project.');
      return;
    }

    const design: Design & { panelDesign: typeof panelDesign } = {
      type: "X2V",
      icons: Array.from({ length: 18 })
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

    if (isEditMode && editPanelIndex !== undefined) {
      // Update existing panel
      updatePanel(editPanelIndex, design);
      navigate('/cart'); // Go back to cart after updating
    } else {
      // Add new panel with quantity prompt constrained by BOQ remaining
      const category = mapTypeToCategory(design.type);

      const used = projPanels.reduce((sum, p) => sum + (mapTypeToCategory(p.type) === category ? (p.quantity || 1) : 0), 0);

      const getCategoryCap = (cat: 'SP'|'TAG'|'IDPG'|'DP'|'EXT'): number | undefined => {
        if (!boqQuantities) return undefined;
        if (cat === 'EXT') {
          const keys = ['X1H','X1V','X2H','X2V'] as const;
          const total = keys
            .map(k => undefined)
            .reduce((a,b)=>a+b,0);
          return total;
        }
        const cap = undefined as any;
        return typeof cap === 'number' ? cap : undefined;
      };

      const cap = getCategoryCap(category);
      const remaining = cap === undefined ? undefined : Math.max(0, cap - used);

      if (remaining !== undefined) {
        if (remaining <= 0) {
          alert(`You have reached the BOQ limit for ${category}.`);
          return;
        }
        setPendingDesign(design);
        setPendingCategory(category);
        setQtyRemaining(remaining);
        setQtyOpen(true);
        return;
      }

      addToCart(design);
    }
  };

  const handleQtyConfirm = (qty: number) => {
    if (!pendingDesign) return;
    const finalDesign = { ...pendingDesign, quantity: qty };
    addToCart(finalDesign);
    setPendingDesign(null);
    setQtyOpen(false);
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
        // Prevent any non-socket icon from being placed in the single icon slots (indices 9 and 10)
        if ((cellIndex === 9 || cellIndex === 10) && icon.category !== "Sockets") return;

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
          if (cellIndex !== 9 && cellIndex !== 10) return;
          // Prevent more than one socket in the same slot
          const hasSocketInThisSlot = placedIcons.some((icon) => icon.category === "Sockets" && icon.position === cellIndex);
          if (hasSocketInThisSlot) return;
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
        // Prevent swapping a non-socket icon into the single icon slots (indices 9 and 10)
        if ((cellIndex === 9 || cellIndex === 10) && sourceIcon.category !== "Sockets") return;
        if ((dragData.position === 9 || dragData.position === 10) && targetIcon && targetIcon.category !== "Sockets") return;

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
          if (cellIndex !== 9 && cellIndex !== 10) return;
        }
        if (targetIcon?.category === "Sockets") {
          if (dragData.position !== 9 && dragData.position !== 10) return;
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

  const renderAbsoluteCell = (index: number) => {
    const icon = placedIcons.find((i) => i.position === index);
    const text = iconTexts[index];
    const isPIR = icon?.category === "PIR";
    const isEditing = editingCell === index;
    const isHovered = hoveredCell === index;
    const isIconHovered = !!iconHovered[index];
    const iconSize = panelDesign.iconSize || '40px';
    const pos = iconPositions?.[index] || { top: '0px', left: '0px' };
    
    // Calculate container size to match icon size
    const containerSize = isPIR ? '40px' : (icon?.category === 'Bathroom' ? '47px' : ((index === 9 || index === 10) ? '240px' : panelDesign.iconSize || '40px'));
    
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
        onDrop={currentStep === 4 ? undefined : e => { e.preventDefault(); const data = e.dataTransfer.getData('text/plain'); handleDrop(index, data); }}
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
                width: isPIR ? '40px' : (icon?.category === 'Bathroom' ? '47px' : ((index === 9 || index === 10) ? '240px' : panelDesign.iconSize || '40px')),
                height: isPIR ? '40px' : (icon?.category === 'Bathroom' ? '47px' : ((index === 9 || index === 10) ? '240px' : panelDesign.iconSize || '40px')),
                objectFit: 'contain',
                marginBottom: '5px',
                position: 'relative',
                  zIndex: 1,
                marginTop: isPIR ? '5px' : '0',
                cursor: currentStep !== 4 ? 'move' : 'default',
                  filter: !isPIR && icon?.category !== 'Sockets' ? getIconColorFilter(panelDesign.backgroundColor) : undefined,
                  transition: 'filter 0.2s',
                }}
              />
              {(
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
                {((index === 9 || index === 10) && !icon) ? (
                  <div style={{ fontSize: '18px', color: '#bbb', fontWeight: 600, padding: '16px 0' }}>
                    drop socket
                  </div>
                ) : (
                  <>
                    {isEditing ? (
                      <input
                        type="text"
                        value={text || ''}
                        onChange={e => handleTextChange(e, index)}
                        onBlur={handleTextBlur}
                        autoFocus
                        style={{ width: '100%', padding: '4px', fontSize: panelDesign.fontSize || '12px', textAlign: 'center', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '4px', outline: 'none', background: 'rgba(255, 255, 255, 0.1)', transition: 'all 0.2s ease', fontFamily: panelDesign.fonts || undefined, color: getAutoTextColor(panelDesign.backgroundColor), marginTop: '0px', marginLeft: '-40px' }}
                      />
                    ) : (
                      <div
                        onClick={() => handleTextClick(index)}
                        style={{ fontSize: panelDesign.fontSize || '12px', color: text ? getAutoTextColor(panelDesign.backgroundColor) : '#999999', wordBreak: 'break-word', width: '120px', textAlign: 'center', padding: '4px', cursor: 'pointer', borderRadius: '4px', backgroundColor: isHovered ? 'rgba(255, 255, 255, 0.1)' : 'transparent', transition: 'all 0.2s ease', fontFamily: panelDesign.fonts || undefined, marginLeft: '-40px' }}
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
    { step: 1, label: 'Select Panel\nType' },
    { step: 2, label: 'Configure Panel\nLayout' },
    { step: 3, label: 'Select Panel\nDesign' },
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
                maxWidth: 150,
                minHeight: 36,
                lineHeight: 1.2,
                whiteSpace: 'pre',
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

  // Only destructure config once, and use iconPositions from config
  const config = getPanelLayoutConfig('X2V');
  const { dimensions, iconLayout, textLayout, specialLayouts, iconPositions } = config;

  const mapTypeToCategory = (t: string): 'SP' | 'TAG' | 'IDPG' | 'DP' | 'EXT' => {
    if (t === 'SP') return 'SP';
    if (t === 'TAG') return 'TAG';
    if (t === 'IDPG') return 'IDPG';
    if (t === 'DPH' || t === 'DPV') return 'DP';
    if (t.startsWith('X')) return 'EXT';
    return 'SP';
  };

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
          {currentStep !== 3 && (
          <Button
            variant="contained"
            disabled={currentStep === 3}
            onClick={() => setCurrentStep((s) => Math.min(3, s + 1))}
          >
            Next
          </Button>
          )}
        </Box>

        {/* Icon List: Only visible on step 2 */}
        {currentStep === 2 && (
      <div style={{ display: 'flex', flexDirection: 'row', gap: '40px', justifyContent: 'center', alignItems: 'flex-start', marginBottom: '20px' }}>
        {/* Categories column */}
        <div style={{ minWidth: 140, display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'flex-end' }}>
          {iconCategories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              style={{
                padding: '10px 18px',
                background: selectedCategory === category ? '#1a1f2c' : '#ffffff',
                color: selectedCategory === category ? '#ffffff' : '#1a1f2c',
                border: '1px solid #1a1f2c',
                borderRadius: '6px',
                cursor: 'pointer',
                fontFamily: '"Myriad Hebrew", "Monsal Gothic", sans-serif',
                fontSize: '14px',
                letterSpacing: '0.5px',
                transition: 'all 0.3s ease',
                minWidth: '120px',
                textAlign: 'right',
              }}
            >
              {category}
            </button>
          ))}
          {/* PIR toggle next to categories */}
          <button
            type="button"
            onClick={() => (hasPIR ? removePir() : addPir())}
            style={{
              padding: '10px 16px',
              borderRadius: '6px',
              border: 'none',
              background: 'transparent',
              color: '#1976d2',
              cursor: 'pointer',
              fontFamily: '"Myriad Hebrew", "Monsal Gothic", sans-serif',
              fontSize: '14px',
              letterSpacing: '0.5px',
              fontWeight: 'bold'
            }}
            title={hasPIR ? 'Remove motion sensor' : 'Add a motion sensor?'}
          >
            {hasPIR ? 'Remove motion sensor' : 'Add a motion sensor?'}
          </button>
        </div>
        {/* Icons grid column */}
        <div style={{ 
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 120px)',
                  gap: '16px',
                  padding: '16px'
        }}>
          {categoryIcons.map((icon) => (
            <div
              key={icon.id}
              draggable
              onDragStart={(e) => handleDragStart(e, icon)}
              style={{
                        padding: '16px',
                        background: 'transparent',
                        borderRadius: '8px',
                        cursor: 'grab',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'flex-start',
                        width: '120px',
                        minHeight: '100px',
                        border: '1px solid transparent',
                        transition: 'border-color 0.2s ease, background 0.2s ease',
                        boxSizing: 'border-box'
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#1a1f2c33'; e.currentTarget.style.background = '#f7f9fc'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.background = 'transparent'; }}
            >
              <img
                src={icon.src}
                alt={icon.label}
                    title={icon.label}
                        style={{ width: '32px', height: '32px', objectFit: 'contain' }}
              />
            </div>
          ))}
        </div>
        {/* Panel Preview for Step 2 (only this one should render) */}
        <div style={{ flex: '0 0 340px', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', marginTop: 0 }}>
          <div
            style={{
              position: 'relative',
              width: '320px',
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

              {/* Typography font and font size controls removed for step 3 */}
              
              {/* Backbox Section */}
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
                    background: 'linear-gradient(180deg, #28a745 0%, #20c997 100%)',
                    borderRadius: '2px'
                  }} />
                  Backbox Details *
                </div>
                <select
                  value={backbox}
                  onChange={e => {
                    setBackbox(e.target.value);
                    if (backboxError) setBackboxError('');
                  }}
                  style={{ 
                    width: '100%', 
                    padding: '12px', 
                    border: backboxError ? '1px solid red' : '1px solid #dee2e6', 
                    borderRadius: '8px', 
                    background: '#fff',
                    fontSize: '14px',
                    fontFamily: '"Myriad Hebrew", "Monsal Gothic", sans-serif'
                  }}
                >
                  <option value="">Select a backbox...</option>
                  <option value="Backbox 1">Backbox 1</option>
                  <option value="Backbox 2">Backbox 2</option>
                  <option value="Backbox 3">Backbox 3</option>
                  <option value="Backbox 4">Backbox 4</option>
                  <option value="Backbox 5">Backbox 5</option>
                </select>
                {backboxError && <div style={{ color: 'red', fontSize: '12px', marginTop: '8px' }}>{backboxError}</div>}
              </div>

          {/* Custom Panel Toggle */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: '20px', 
            marginTop: '40px',
            flexWrap: 'wrap'
          }}>
            <StyledButton
              variant="contained"
              onClick={handleAddToCart}
              sx={{
                backgroundColor: '#1a1f2c',
                color: '#ffffff',
                '&:hover': {
                  backgroundColor: '#2c3e50',
                },
                padding: '12px 32px',
                fontSize: '16px',
                fontWeight: '600'
              }}
            >
              {isEditMode ? 'Update Panel' : 'Add Panel to Project'}
            </StyledButton>
            
            <div style={{ textAlign: 'center' }}>
              {/* Custom Panel Description - Only visible when Create Custom Panel button is shown */}
              {!showCustomPanelComponent && (
                <div style={{
                  color: '#000000',
                  fontFamily: '"Myriad Hebrew", "Monsal Gothic", sans-serif',
                  fontSize: '14px',
                  letterSpacing: '0.5px',
                  fontWeight: 'bold',
                  marginTop: '30px',
                  marginBottom: '8px',
                  textAlign: 'center'
                }}>
                  Want different icons, icon sizes, font sizes, typography?
                </div>
              )}
              
              {/* Create Custom Panel Button */}
              <button
                type="button"
                onClick={() => {
                  if (showCustomPanelComponent) {
                    // Reset to default state when switching to standard panel
                    setPanelDesign({
                      ...panelDesign,
                      fontSize: '9pt',
                      iconSize: '14mm',
                      fonts: 'Myriad Pro SemiBold SemiCondensed'
                    });
                    setFontSearchTerm('Myriad Pro SemiBold SemiCondensed');
                    setExtraComments('');
                  }
                                            if (showCustomPanelComponent) {
                            setShowCustomPanelComponent(false);
                          } else {
                            setShowCustomPanelDialog(true);
                          }
                }}
                style={{
                  padding: '10px 16px',
                  borderRadius: '6px',
                  border: 'none',
                  background: 'transparent',
                  color: '#1976d2',
                  cursor: 'pointer',
                  fontFamily: '"Myriad Hebrew", "Monsal Gothic", sans-serif',
                  fontSize: '14px',
                  letterSpacing: '0.5px',
                  fontWeight: 'bold',
                  marginTop: '-15px'
                }}
              >
                {showCustomPanelComponent ? 'Design Standard Panel' : 'Create Custom Panel'}
              </button>
            </div>
          </Box>

          </div>

            {/* Right side - Panel Template */}
            <div style={{ flex: '0 0 auto', marginTop: '100px' }}>
              <div
                style={{
              position: 'relative',
              width: '320px',
              height: dimensions.height, // use config
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

        {/* Custom Panel Component - Separate Section */}
        {showCustomPanelComponent && (
          <div style={{ 
            marginTop: '40px',
            maxWidth: '1400px',
            margin: '40px auto 0 auto',
            padding: '0 40px'
          }}>
            <div style={{ 
              background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
              padding: '32px',
              borderRadius: '16px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.8)',
              border: '1px solid #e9ecef',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Subtle background pattern */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: 'linear-gradient(90deg, #007bff 0%, #0056b3 50%, #007bff 100%)',
                borderRadius: '16px 16px 0 0'
              }} />
              
              <h3 style={{
                margin: '0 0 28px 0',
                fontSize: '22px',
                fontWeight: '600',
                color: '#1a1f2c',
                textAlign: 'center',
                letterSpacing: '0.5px',
                textShadow: '0 1px 2px rgba(0,0,0,0.1)'
              }}>
                Custom Panel Options
              </h3>
              
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '24px'
              }}>
                {/* Font Size Section */}
                <div style={{ 
                  background: 'linear-gradient(145deg, #f8f9fa 0%, #ffffff 100%)',
                  padding: '20px',
                  borderRadius: '10px',
                  border: '1px solid #e9ecef',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
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
                      background: 'linear-gradient(180deg, #007bff 0%, #0056b3 100%)',
                      borderRadius: '2px'
                    }} />
                    Font Size
                  </div>
                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                    {['7pt', '9pt', '12pt'].map((size) => (
                      <button
                        key={size}
                        onClick={() => setPanelDesign({ ...panelDesign, fontSize: size })}
                        style={{
                          width: '60px',
                          height: '60px',
                          border: panelDesign.fontSize === size ? '2px solid #007bff' : '2px solid #dee2e6',
                          borderRadius: '8px',
                          background: panelDesign.fontSize === size ? '#007bff' : '#fff',
                          color: panelDesign.fontSize === size ? '#fff' : '#1a1f2c',
                          fontSize: '14px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: panelDesign.fontSize === size ? '0 4px 12px rgba(0,123,255,0.3)' : '0 2px 4px rgba(0,0,0,0.1)'
                        }}
                        onMouseEnter={(e) => {
                          if (panelDesign.fontSize !== size) {
                            e.currentTarget.style.borderColor = '#007bff';
                            e.currentTarget.style.background = '#f8f9ff';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (panelDesign.fontSize !== size) {
                            e.currentTarget.style.borderColor = '#dee2e6';
                            e.currentTarget.style.background = '#fff';
                          }
                        }}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Icon Size Section */}
                <div style={{ 
                  background: 'linear-gradient(145deg, #f8f9fa 0%, #ffffff 100%)',
                  padding: '20px',
                  borderRadius: '10px',
                  border: '1px solid #e9ecef',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
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
                      background: 'linear-gradient(180deg, #007bff 0%, #0056b3 100%)',
                      borderRadius: '2px'
                    }} />
                    Icon Size
                  </div>
                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                    {['10mm', '14mm'].map((size) => (
                      <button
                        key={size}
                        onClick={() => setPanelDesign({ ...panelDesign, iconSize: size })}
                        style={{
                          width: '60px',
                          height: '60px',
                          border: panelDesign.iconSize === size ? '2px solid #007bff' : '2px solid #dee2e6',
                          borderRadius: '8px',
                          background: panelDesign.iconSize === size ? '#007bff' : '#fff',
                          color: panelDesign.iconSize === size ? '#fff' : '#1a1f2c',
                          fontSize: '14px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: panelDesign.iconSize === size ? '0 4px 12px rgba(0,123,255,0.3)' : '0 2px 4px rgba(0,0,0,0.1)'
                        }}
                        onMouseEnter={(e) => {
                          if (panelDesign.iconSize !== size) {
                            e.currentTarget.style.borderColor = '#007bff';
                            e.currentTarget.style.background = '#f8f9ff';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (panelDesign.iconSize !== size) {
                            e.currentTarget.style.borderColor = '#dee2e6';
                            e.currentTarget.style.background = '#fff';
                          }
                        }}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Custom Icon Upload Section */}
                <div style={{ 
                  background: 'linear-gradient(145deg, #f8f9fa 0%, #ffffff 100%)',
                  padding: '20px',
                  borderRadius: '10px',
                  border: '1px solid #e9ecef',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
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
                      background: 'linear-gradient(180deg, #007bff 0%, #007bff 100%)',
                      borderRadius: '2px'
                    }} />
                    Custom Icon Upload
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        console.log('Custom icon uploaded:', file.name);
                      }
                    }}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #dee2e6',
                      borderRadius: '8px',
                      fontSize: '14px',
                      background: '#fff',
                      cursor: 'pointer',
                      borderColor: '#007bff'
                    }}
                  />
                  <div style={{ 
                    fontSize: '12px', 
                    color: '#6c757d', 
                    marginTop: '8px',
                    fontStyle: 'italic'
                  }}>
                    Supported: PNG, JPG, SVG (Max: 2MB)
                  </div>
                </div>
                
                {/* Sample Template Design Reference Section */}
                <div style={{ 
                  background: 'linear-gradient(145deg, #f8f9fa 0%, #ffffff 100%)',
                  padding: '20px',
                  borderRadius: '10px',
                  border: '1px solid #e9ecef',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
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
                      background: 'linear-gradient(180deg, #ff9800 0%, #f57c00 100%)',
                      borderRadius: '2px'
                    }} />
                    Sample Template Design Reference
                  </div>
                  <input
                    type="file"
                    accept="image/*,.pdf,.doc,.docx"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        console.log('Sample template uploaded:', file.name);
                      }
                    }}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #dee2e6',
                      borderRadius: '8px',
                      fontSize: '14px',
                      background: '#fff',
                      cursor: 'pointer',
                      borderColor: '#ff9800'
                    }}
                  />
                  <div style={{ 
                    fontSize: '12px', 
                    color: '#6c757d', 
                    marginTop: '8px',
                    fontStyle: 'italic'
                  }}>
                    Supported: PNG, JPG, SVG, PDF, DOC, DOCX (Max: 5MB)
                  </div>
                </div>
                
                {/* Font/Typography Section */}
                <div style={{ 
                  background: 'linear-gradient(145deg, #f8f9fa 0%, #ffffff 100%)',
                  padding: '20px',
                  borderRadius: '10px',
                  border: '1px solid #e9ecef',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
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
                      background: 'linear-gradient(180deg, #9c27b0 0%, #673ab7 100%)',
                      borderRadius: '2px'
                    }} />
                    Typography
                  </div>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      placeholder="Search Google Fonts..."
                      value={fontSearchTerm}
                      onChange={(e) => setFontSearchTerm(e.target.value)}
                      onFocus={() => setFontSearchFocused(true)}
                      onBlur={() => setTimeout(() => setFontSearchFocused(false), 200)}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid #dee2e6',
                        borderRadius: '8px',
                        fontSize: '14px',
                        background: '#fff',
                        borderColor: '#9c27b0'
                      }}
                    />
                    {fontSearchFocused && (
                      <div style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        background: '#fff',
                        border: '1px solid #dee2e6',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        zIndex: 1000,
                        maxHeight: '300px',
                        overflowY: 'auto'
                      }}>
                        {fontSearchTerm ? (
                          // Show filtered results when searching
                          <>
                            {googleFonts
                              .filter(font => font.toLowerCase().includes(fontSearchTerm.toLowerCase()))
                              .slice(0, 20)
                              .map((font) => (
                                <div
                                  key={font}
                                  onClick={() => {
                                    setPanelDesign({ ...panelDesign, fonts: font });
                                    setFontSearchTerm(font);
                                    loadGoogleFont(font);
                                  }}
                                  style={{
                                    padding: '10px 12px',
                                    cursor: 'pointer',
                                    borderBottom: '1px solid #f0f0f0',
                                    fontFamily: font,
                                    fontSize: '14px',
                                    transition: 'background-color 0.2s ease'
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = '#f8f9ff';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = '#fff';
                                  }}
                                >
                                  {font}
                                </div>
                              ))}
                            {googleFonts.filter(font => font.toLowerCase().includes(fontSearchTerm.toLowerCase())).length > 20 && (
                              <div style={{
                                padding: '8px 12px',
                                fontSize: '12px',
                                color: '#6c757d',
                                fontStyle: 'italic',
                                textAlign: 'center',
                                borderTop: '1px solid #f0f0f0'
                              }}>
                                Showing first 20 results. Type more to narrow search.
                              </div>
                            )}
                          </>
                        ) : (
                          // Show all fonts when not searching
                          <>
                            <div style={{
                              padding: '8px 12px',
                              fontSize: '12px',
                              color: '#6c757d',
                              fontStyle: 'italic',
                              textAlign: 'center',
                              borderBottom: '1px solid #f0f0f0',
                              backgroundColor: '#f8f9fa'
                            }}>
                              Browse all available fonts ({googleFonts.length} total)
                            </div>
                            {googleFonts.map((font) => (
                              <div
                                key={font}
                                onClick={() => {
                                  setPanelDesign({ ...panelDesign, fonts: font });
                                  setFontSearchTerm(font);
                                  loadGoogleFont(font);
                                }}
                                style={{
                                  padding: '10px 12px',
                                  cursor: 'pointer',
                                  borderBottom: '1px solid #f0f0f0',
                                  fontFamily: font,
                                  fontSize: '14px',
                                  transition: 'background-color 0.2s ease'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor = '#f8f9ff';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = '#fff';
                                }}
                              >
                                {font}
                              </div>
                            ))}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                  {panelDesign.fonts && (
                    <div style={{
                      marginTop: '12px',
                      padding: '8px 12px',
                      background: '#f8f9ff',
                      border: '1px solid #9c27b0',
                      borderRadius: '6px',
                      fontSize: '13px',
                      color: '#9c27b0',
                      fontFamily: panelDesign.fonts
                    }}>
                      Selected: {panelDesign.fonts}
                    </div>
                  )}
                </div>
                
                {/* Comments Section */}
                <div style={{ 
                  background: 'linear-gradient(145deg, #f8f9fa 0%, #ffffff 100%)',
                  padding: '20px',
                  borderRadius: '10px',
                  border: '1px solid #e9ecef',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
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
                      background: 'linear-gradient(180deg, #28a745 0%, #20c997 100%)',
                      borderRadius: '2px'
                    }} />
                    Additional Comments
                  </div>
                  <textarea
                    value={extraComments}
                    onChange={(e) => setExtraComments(e.target.value)}
                    placeholder="Describe your custom panel requirements..."
                    style={{
                      width: '100%',
                      minHeight: '80px',
                      padding: '12px',
                      border: '1px solid #dee2e6',
                      borderRadius: '8px',
                      fontSize: '14px',
                      resize: 'vertical',
                      fontFamily: '"Myriad Hebrew", "Monsal Gothic", sans-serif',
                      borderColor: '#28a745'
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

      </Container>
      
      {/* Custom Panel Approval Dialog */}
      <Dialog
        open={showCustomPanelDialog}
        onClose={() => setShowCustomPanelDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ 
          textAlign: 'center',
          fontFamily: '"Myriad Hebrew", "Monsal Gothic", sans-serif',
          fontWeight: 600,
          fontSize: '1.2rem',
          color: '#1a1f2c',
          pb: 1
        }}>
          Custom Panel Design Request
        </DialogTitle>
        <DialogContent>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            gap: 2,
            py: 2
          }}>
            <Box sx={{
              width: 60,
              height: 60,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #0056b3 0%, #007bff 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 1
            }}>
              <Typography sx={{ color: 'white', fontSize: '24px', fontWeight: 'bold' }}>
                ⚡
              </Typography>
            </Box>
            
            <Typography sx={{
              fontFamily: '"Myriad Hebrew", "Monsal Gothic", sans-serif',
              fontSize: '16px',
              color: '#2c3e50',
              textAlign: 'center',
              lineHeight: 1.6,
              mb: 1
            }}>
              Custom panel designs require special approval from our design team to ensure quality and feasibility.
            </Typography>
            
            <Typography sx={{
              fontFamily: '"Myriad Hebrew", "Monsal Gothic", sans-serif',
              fontSize: '14px',
              color: '#5a6c7d',
              textAlign: 'center',
              lineHeight: 1.5
            }}>
              Unlike standard panels that generate instant proposals, custom designs undergo a comprehensive review process to ensure they meet our quality standards and technical specifications.
            </Typography>
            
            <Box sx={{
              background: 'linear-gradient(145deg, #f8f9fa 0%, #ffffff 100%)',
              p: 2,
              borderRadius: 2,
              border: '1px solid #e9ecef',
              width: '100%',
              mt: 1
            }}>
              <Typography sx={{
                fontFamily: '"Myriad Hebrew", "Monsal Gothic", sans-serif',
                fontSize: '14px',
                fontWeight: 600,
                color: '#1a1f2c',
                textAlign: 'center',
                mb: 1
              }}>
                ⏱️ Processing Time: 3-5 Business Days
              </Typography>
              <Typography sx={{
                fontFamily: '"Myriad Hebrew", "Monsal Gothic", sans-serif',
                fontSize: '13px',
                color: '#5a6c7d',
                textAlign: 'center'
              }}>
                Our design team will review your requirements and provide a detailed proposal with pricing and specifications.
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3, px: 3 }}>
          <Button 
            onClick={() => setShowCustomPanelDialog(false)}
            variant="outlined"
            sx={{
              fontFamily: '"Myriad Hebrew", "Monsal Gothic", sans-serif',
              textTransform: 'none',
              px: 3,
              py: 1,
              mr: 1,
              borderColor: '#dee2e6',
              color: '#5a6c7d'
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={() => {
              setShowCustomPanelDialog(false);
              setShowCustomPanelComponent(true);
            }}
            variant="contained"
            sx={{
              fontFamily: '"Myriad Hebrew", "Monsal Gothic", sans-serif',
              textTransform: 'none',
              px: 3,
              py: 1,
              background: 'linear-gradient(135deg, #0056b3 0%, #007bff 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #004494 0%, #0066cc 100%)'
              }
            }}
          >
            Proceed with Custom Design
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default X2VCustomizer; 