// Import necessary libraries and components
import React, { useState, useEffect, useRef, useContext } from "react";
import { useCart } from "../../contexts/CartContext";
import "./Customizer.css";
import CartButton from "../../components/CartButton";
import { useNavigate, useLocation } from "react-router-dom";
import logo2 from "../../assets/logo.png";
import {
  Container,
  Typography,
  Box,
  Button,
  LinearProgress,
  useTheme,
  TextField,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { ralColors, RALColor } from '../../data/ralColors';
import { ProjectContext } from '../../App';
import { motion } from 'framer-motion';
import SP from "../../assets/panels/SP.png";
import logo from "../../assets/logo.png";
import LED from "../../assets/LED.png";

import { getPanelLayoutConfig } from '../../data/panelLayoutConfig';
import PanelDimensionSelector from '../../components/PanelDimensionSelector';
import PanelModeSelector, { PanelMode } from '../../components/PanelModeSelector';

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
                  background: 'auto',
                  border: '2px solid #dee2e6',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }} />
                <Typography variant="body2" sx={{ color: '#2c3e50', fontSize: '14px', fontWeight: 500 }}>
                  Icons & Text: Auto-colored
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

const SPCustomizer: React.FC = () => {
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
  
    plasticColor: string;
    iconColor: string;
    textColor: string;
    fontSize: string;
    iconSize: string;
    backbox?: string;
    extraComments?: string;
  }>({
    backgroundColor: '',
    fonts: 'Myriad Pro',
    backlight: '',

    plasticColor: '',
    iconColor: 'auto',
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
  const [useCustomFont, setUseCustomFont] = useState(false);
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
  // Drag restriction preview state
  const [isDraggingIcon, setIsDraggingIcon] = useState<boolean>(false);
  const [restrictedCells, setRestrictedCells] = useState<number[]>([]);
  
  // Popup state for DND/MUR restrictions
  const [showRestrictionDialog, setShowRestrictionDialog] = useState(false);
  const [restrictionMessage, setRestrictionMessage] = useState('');
  
  // Popup state for selecting custom panel mode
  const [showCustomModeDialog, setShowCustomModeDialog] = useState(false);
  
  // Edit mode state
  const isEditMode = location.state?.editMode || false;
  const isViewMode = location.state?.viewMode || false;
  const isCreateNewRevision = location.state?.createNewRevision || false;
  const editPanelIndex = location.state?.panelIndex;
  const editPanelData = location.state?.panelData;
  const isAddingToExistingProject = location.state?.isAddingToExistingProject || false;
  
  // Debug logging for edit mode
  console.log('🔍 SPCustomizer Edit Mode Debug:');
  console.log('  isEditMode:', isEditMode);
  console.log('  editPanelIndex:', editPanelIndex);
  console.log('  editPanelData:', editPanelData ? 'present' : 'missing');
  console.log('  location.state:', location.state);
  

  
  console.log('RENDER', { backbox, extraComments });

  useEffect(() => {
    import("../../assets/iconLibrary").then((module) => {
      setIcons(module.default);
      // Hide PIR from the selectable categories; we control it via a dedicated toggle
      setIconCategories(module.iconCategories.filter(cat => cat !== 'Sockets' && cat !== 'TAG' && cat !== 'PIR'));
    });
  }, []);

  // Load existing panel data if in edit mode
  useEffect(() => {
    if (isEditMode && editPanelData) {
      console.log('🔍 EDIT MODE DEBUG:');
      console.log('isEditMode:', isEditMode);
      console.log('editPanelData:', editPanelData);
      console.log('editPanelData type:', typeof editPanelData);
      console.log('editPanelData keys:', Object.keys(editPanelData));
      
      // Deep copy the edit data to prevent shared references
      const deepCopiedData = JSON.parse(JSON.stringify(editPanelData));
      
      // Handle different data structures
      let panelDesignData = null;
      let iconsData = null;
      
      // Check if this is a project panel (from project structure)
      if (deepCopiedData.panelDesign) {
        console.log('📋 Found project panel structure');
        panelDesignData = deepCopiedData.panelDesign;
        iconsData = deepCopiedData.icons;
      } 
      // Check if this is an individual panel (from database structure)
      else if (deepCopiedData.designData) {
        console.log('📋 Found individual panel structure');
        // For individual panels saved in database, the structure is different
        const designData = deepCopiedData.designData;
        console.log('designData:', designData);
        console.log('designData keys:', Object.keys(designData));
        
        if (designData.panelDesign) {
          panelDesignData = designData.panelDesign;
        }
        if (designData.icons) {
          iconsData = designData.icons;
        }
      }
      // Check if this is a saved individual panel (new structure)
      else if (deepCopiedData.type === 'SP' && deepCopiedData.icons) {
        console.log('📋 Found saved individual panel structure');
        if (deepCopiedData.panelDesign) {
          panelDesignData = deepCopiedData.panelDesign;
        }
        iconsData = deepCopiedData.icons;
      }
      
      console.log('📋 Final extracted data:');
      console.log('panelDesignData:', panelDesignData);
      console.log('iconsData:', iconsData);
      
      // Load panel design
      if (panelDesignData) {
        console.log('🎨 Loading panel design:', panelDesignData);
        setPanelDesign(panelDesignData);
        setBackbox(panelDesignData.backbox || '');
        setExtraComments(panelDesignData.extraComments || '');
      } else {
        console.log('⚠️ No panel design data found');
      }
      
      // Load placed icons
      if (iconsData) {
        console.log('🎯 Loading icons data:', iconsData);
        const loadedIcons: PlacedIcon[] = iconsData
          .filter((icon: any) => icon.iconId)
          .map((icon: any) => ({
            id: Date.now() + Math.random(), // Generate new IDs
            iconId: icon.iconId,
            src: icon.src || '',
            label: icon.label || '',
            position: icon.position,
            category: icon.category || ''
          }));
        console.log('🎯 Loaded icons:', loadedIcons);
        setPlacedIcons(loadedIcons);
        
        // Load icon texts
        const loadedTexts: IconTexts = {};
        iconsData.forEach((icon: any) => {
          if (icon.text) {
            loadedTexts[icon.position] = icon.text;
          }
        });
        console.log('📝 Loaded texts:', loadedTexts);
        setIconTexts(loadedTexts);
      } else {
        console.log('⚠️ No icons data found');
      }
      
      // Set current step to design step (step 3) for editing
      setCurrentStep(3);
    }
  }, [isEditMode, editPanelData]);

  if (!cartContext) {
    throw new Error("CartContext must be used within a CartProvider");
  }

  const { addToCart, updatePanel, loadProjectPanels } = cartContext;

  useEffect(() => {
    if (iconCategories.length > 0) {
      setSelectedCategory(iconCategories[0]);
    }
  }, [iconCategories]);

  const handlePlaceIcon = (cellIndex: number): void => {
    const isOccupied = placedIcons.some((icon) => icon.position === cellIndex);
    if (isOccupied || selectedIcon === null) return;

    // Column helpers and DND/MUR detection
    const isRightCol = (idx: number) => idx === 2 || idx === 5 || idx === 8;
    const isLeftCol = (idx: number) => idx === 0 || idx === 3 || idx === 6;
    const selLabelLower = (selectedIcon.label || '').toLowerCase();
    const isDNDIcon = selLabelLower.includes('dnd') || selLabelLower.includes('privacy') || selLabelLower.includes('do not disturb');
    const isMURIcon = selLabelLower.includes('mur') || selLabelLower.includes('service') || selLabelLower.includes('make up');

    // Check if trying to place PIR icon
    if (selectedIcon.category === "PIR") {
      // Only allow placement in bottom center cell (7)
      if (cellIndex !== 7) return;
      
      // Check if PIR icon is already placed
      const hasPIR = placedIcons.some((icon) => icon.category === "PIR");
      if (hasPIR) return;
    }

    // DND cannot be placed in right column
    if (isDNDIcon && isRightCol(cellIndex)) {
      setRestrictionMessage('**DND (Do Not Disturb)** icons are designed to work with the red/white LED indicators on the left side of the panel. The right side uses green/white indicators, which is why **DND** icons can only be placed in the left and center columns.');
      setShowRestrictionDialog(true);
      return;
    }
    // MUR cannot be placed in left column
    if (isMURIcon && isLeftCol(cellIndex)) {
      setRestrictionMessage('**MUR (Make Up Room)** icons are designed to work with the green/white LED indicators on the right side of the panel. The left side uses red/white indicators, which is why **MUR** icons can only be placed in the center and right columns.');
      setShowRestrictionDialog(true);
      return;
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

    const design: Design & { panelDesign: typeof panelDesign } = {
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
            category: icon?.category || undefined,
          };
        })
        .filter((entry) => entry.iconId || entry.text),
      quantity: 1,
      panelDesign: { ...panelDesign, backbox, extraComments },
    };

    if (isEditMode) {
      // Handle edit mode - either update existing panel or add new one
      if (editPanelIndex !== undefined) {
        // Update existing panel at specific index (for project panels)
        console.log('🔧 Updating panel at index:', editPanelIndex);
        updatePanel(editPanelIndex, design);
      } else {
        // For individual panels, replace the entire cart with this panel
        console.log('🔧 Replacing cart with edited individual panel');
        // Clear existing panels and add the edited one
        loadProjectPanels([design]);
      }
      
      // Preserve the project-level edit state when navigating back
      const preservedState = location.state?.projectEditMode !== undefined ? {
        projectEditMode: location.state.projectEditMode,
        projectDesignId: location.state.projectDesignId,
        projectOriginalName: location.state.projectOriginalName,
        projectCreateNewRevision: location.state.projectCreateNewRevision
      } : {};
      
      navigate('/cart', { state: preservedState }); // Go back to cart after updating
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
    if (panelMode === 'text_only') {
      // no icons allowed
      e.preventDefault();
      return;
    }
    // Determine if the dragged icon is DND or MUR to show restricted cells
    const label = ('label' in icon ? icon.label : '') || '';
    const lower = label.toLowerCase();
    const isDND = lower.includes('dnd') || lower.includes('privacy') || lower.includes('do not disturb');
    const isMUR = lower.includes('mur') || lower.includes('service') || lower.includes('make up');
    if (isDND || isMUR) {
      // SP grid indices: left [0,3,6], center [1,4,7], right [2,5,8]
      const rightCol = [2,5,8];
      const leftCol = [0,3,6];
      setIsDraggingIcon(true);
      setRestrictedCells(isDND ? rightCol : leftCol);
    } else {
      setIsDraggingIcon(false);
      setRestrictedCells([]);
    }
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
      if (panelMode === 'text_only') return; // icons not allowed
      // Clear drag preview on drop
      setIsDraggingIcon(false);
      setRestrictedCells([]);
      
      if (dragData.type === 'new') {
        if (panelMode === 'icons_text' || panelMode === 'custom') {
        // Handle new icon placement
        const icon = categoryIcons.find(i => i.id === dragData.id);
        if (!icon) return;

        const isRightCol = (idx: number) => idx === 2 || idx === 5 || idx === 8;
        const isLeftCol = (idx: number) => idx === 0 || idx === 3 || idx === 6;
        const labelLower = (icon.label || '').toLowerCase();
        const isDNDIcon = labelLower.includes('dnd') || labelLower.includes('privacy') || labelLower.includes('do not disturb');
        const isMURIcon = labelLower.includes('mur') || labelLower.includes('service') || labelLower.includes('make up');

        // Check if trying to place PIR icon
        if (icon.category === "PIR") {
          if (cellIndex !== 7) return;
          const hasPIR = placedIcons.some((icon) => icon.category === "PIR");
          if (hasPIR) return;
        }

        // DND cannot be placed in right column
        if (isDNDIcon && isRightCol(cellIndex)) {
          setRestrictionMessage('**DND (Do Not Disturb)** icons are designed to work with the red/white LED indicators on the left side of the panel. The right side uses green/white indicators, which is why **DND** icons can only be placed in the left and center columns.');
          setShowRestrictionDialog(true);
          return;
        }
        // MUR cannot be placed in left column
        if (isMURIcon && isLeftCol(cellIndex)) {
          setRestrictionMessage('**MUR (Make Up Room)** icons are designed to work with the green/white LED indicators on the right side of the panel. The left side uses red/white indicators, which is why **MUR** icons can only be placed in the center and right columns.');
          setShowRestrictionDialog(true);
          return;
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
        }
      } else if (dragData.type === 'placed') {
        // Handle swapping placed icons
        const sourceIcon = placedIcons.find(i => i.id === dragData.id);
        const targetIcon = placedIcons.find(i => i.position === cellIndex);
        
        if (!sourceIcon) return;

        const isRightCol = (idx: number) => idx === 2 || idx === 5 || idx === 8;
        const isLeftCol = (idx: number) => idx === 0 || idx === 3 || idx === 6;
        const srcLabelLower = (sourceIcon.label || '').toLowerCase();
        const tgtLabelLower = (targetIcon?.label || '').toLowerCase();
        const srcIsDND = srcLabelLower.includes('dnd') || srcLabelLower.includes('privacy') || srcLabelLower.includes('do not disturb');
        const srcIsMUR = srcLabelLower.includes('mur') || srcLabelLower.includes('service') || srcLabelLower.includes('make up');
        const tgtIsDND = tgtLabelLower.includes('dnd') || tgtLabelLower.includes('privacy') || tgtLabelLower.includes('do not disturb');
        const tgtIsMUR = tgtLabelLower.includes('mur') || tgtLabelLower.includes('service') || tgtLabelLower.includes('make up');

        // Check PIR restrictions
        if (sourceIcon.category === "PIR") {
          if (cellIndex !== 7) return;
        }
        if (targetIcon?.category === "PIR") {
          if (dragData.position !== 7) return;
        }

        // DND cannot move into right column
        if (srcIsDND && isRightCol(cellIndex)) {
          setRestrictionMessage('**DND (Do Not Disturb)** icons are designed to work with the red/white LED indicators on the left side of the panel. The right side uses green/white indicators, which is why **DND** icons can only be placed in the left and center columns.');
          setShowRestrictionDialog(true);
          return;
        }
        // MUR cannot move into left column
        if (srcIsMUR && isLeftCol(cellIndex)) {
          setRestrictionMessage('**MUR (Make Up Room)** icons are designed to work with the green/white LED indicators on the right side of the panel. The left side uses red/white indicators, which is why **MUR** icons can only be placed in the center and right columns.');
          setShowRestrictionDialog(true);
          return;
        }
        // Also ensure the target icon's new destination is valid
        if (targetIcon) {
          if (tgtIsDND && isRightCol(dragData.position)) return;
          if (tgtIsMUR && isLeftCol(dragData.position)) return;
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
    // If text-only mode, allow text everywhere; if icons&text, only allow text when an icon exists
    if (panelMode === 'icons_text') {
      const hasIcon = placedIcons.some((i) => i.position === index);
      if (!hasIcon) return;
    }
    if (panelMode === 'custom' || panelMode === 'icons_text' || panelMode === 'text_only') {
    setEditingCell(index);
    }
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
    const pos = activeIconPositions?.[index] || { top: '0px', left: '0px' };
    const baseTop = parseInt((pos as any).top || '0', 10);
    const rowIndex = Math.floor(index / 3);
    // Apply per-row offsets only for tall: row 1 -20px, row 2 +10px, row 3 +40px
    const perRowOffset = (dimensionKey === 'tall') ? ((rowIndex === 0 ? -20 : 0) + (rowIndex === 1 ? 10 : 0) + (rowIndex === 2 ? 40 : 0)) : 0;
    const adjustedTop = `${baseTop + perRowOffset}px`;
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
        onDragOver={e => { e.preventDefault(); }}
        onDrop={currentStep === 4 ? undefined : e => { e.preventDefault(); const iconId = e.dataTransfer.getData('text/plain'); handleDrop(index, iconId); }}
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
              onDragEnd={() => { setIsDraggingIcon(false); setRestrictedCells([]); }}
              style={{
                width: isPIR ? '40px' : (icon?.category === 'Bathroom' ? `${parseInt(panelDesign.iconSize || '40px') + 10}px` : panelDesign.iconSize || '40px'),
                height: isPIR ? '40px' : (icon?.category === 'Bathroom' ? `${parseInt(panelDesign.iconSize || '40px') + 10}px` : panelDesign.iconSize || '40px'),
                objectFit: 'contain',
                marginBottom: '5px',
                position: 'relative',
                zIndex: 1,
                marginTop: isPIR ? '20px' : '0',
                cursor: currentStep !== 4 ? 'move' : 'default',
                filter: !isPIR ? getIconColorFilter(panelDesign.backgroundColor) : undefined,
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
        {/* Text field - centered when no icon, below icon when icon exists */}
        {!isPIR && (
          <div style={{ 
            width: '100%', 
            textAlign: 'center', 
            marginTop: icon ? '-11px' : '0px',
            height: icon ? 'auto' : '100%',
            display: icon ? 'block' : 'flex',
            alignItems: icon ? 'flex-start' : 'center',
            justifyContent: icon ? 'flex-start' : 'center'
          }}>
            {currentStep === 4 ? (
              text && (
                <div style={{
                  width: '100%',
                  textAlign: 'center',
                  fontSize: panelDesign.fontSize || '12px',
                  color: getAutoTextColor(panelDesign.backgroundColor),
                  fontFamily: panelDesign.fonts || undefined,
                  wordBreak: 'break-word',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: icon ? 'auto' : '100%',
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
                    onClick={() => handleTextClick(index)}
                            style={{ 
                              fontSize: panelDesign.fontSize || '12px', 
                              color: text ? getAutoTextColor(panelDesign.backgroundColor) : '#999999', 
                              wordBreak: 'break-word', 
                              width: '100%', 
                              textAlign: 'center', 
                              padding: '4px', 
                              cursor: 'pointer', 
                              borderRadius: '4px', 
                              backgroundColor: isHovered ? 'rgba(255, 255, 255, 0.1)' : 'transparent', 
                              transition: 'all 0.2s ease', 
                              fontFamily: '"Myriad Hebrew", "Monsal Gothic", sans-serif', 
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
                        style={{ fontSize: panelDesign.fontSize || '12px', color: '#999999', width: '100%', textAlign: 'center', padding: '4px', borderRadius: '4px', backgroundColor: 'transparent', fontFamily: '"Myriad Hebrew", "Monsal Gothic", sans-serif', marginTop: '0px', cursor: 'default' }}
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
    { step: 4, label: 'Review Panel\nDetails' },
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

  const config = getPanelLayoutConfig('SP');
  const { dimensions, iconPositions, iconLayout, textLayout, specialLayouts, dimensionConfigs } = config as any;
  const [dimensionKey, setDimensionKey] = useState<string>('standard');
  const [panelMode, setPanelMode] = useState<PanelMode>('custom');

  // PIR helpers (toggle-controlled motion sensor)
  const hasPIR = placedIcons.some(icon => icon.category === 'PIR');
  const getPirIndex = (): number => {
    const totalSlots = (dimensionConfigs && dimensionConfigs[dimensionKey] && dimensionConfigs[dimensionKey].iconPositions)
      ? dimensionConfigs[dimensionKey].iconPositions.length
      : (iconPositions || []).length;
    if (totalSlots >= 12 || dimensionKey === 'tall') return 10; // tall panels
    return 7; // standard/wide panels
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

  // Derive active dimensions and positions by selected key (fallback to defaults)
  const activeDimension = (dimensionConfigs && dimensionConfigs[dimensionKey]) ? dimensionConfigs[dimensionKey] : dimensions;
  const activeIconPositions = (dimensionConfigs && dimensionConfigs[dimensionKey] && dimensionConfigs[dimensionKey].iconPositions)
    ? dimensionConfigs[dimensionKey].iconPositions
    : (iconPositions || []);
  const gridOffsetX = dimensionKey === 'wide' ? 40 : (dimensionKey === 'standard' ? 20 : (dimensionKey === 'tall' ? 25 : 0));
  const gridOffsetY = dimensionKey === 'tall' ? 58 : 15;

  const getAutoTextColor = (backgroundColor: string): string => {
    const hex = (backgroundColor || '#ffffff').replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness < 128 ? '#ffffff' : '#2c2c2c';
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
                navigate('/panel-type');
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
            onClick={() => {
              const nextStep = Math.min(4, currentStep + 1);
              console.log('Current step:', currentStep, 'Next step:', nextStep);
              setCurrentStep(nextStep);
            }}
          >
            Next
          </Button>
          )}
        </Box>

        {/* Step 2: Dimension selector + Panel template + Icon list side-by-side */}
        {currentStep === 2 && (
          <div style={{ marginBottom: "20px" }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' }}>
              <PanelDimensionSelector
                options={[
                  { key: 'standard', label: '95 × 95 mm', sublabel: "3.7 × 3.7''" },
                  { key: 'wide', label: '130 × 95 mm', sublabel: "5.1 × 3.7''" },
                  { key: 'tall', label: '95 × 130 mm', sublabel: "3.7 × 5.1''" },
                ]}
                value={dimensionKey}
                onChange={setDimensionKey}
                inlineLabel={'Size:'}
              />
              <PanelModeSelector value={panelMode} onChange={(mode) => {
                setPanelMode(mode);
                if (mode === 'custom') {
                  setShowCustomModeDialog(true);
                }
              }} />
            </div>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'nowrap' }}>
              {/* Icon categories + list (left) */}
              <div style={{ flex: '0 0 50%', maxWidth: '50%', marginTop: '30px' }}>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', justifyContent: 'flex-start', flexWrap: 'wrap' }}>
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
            <div style={{ 
                  display: 'grid',
                  gridTemplateColumns: 'repeat(7, 72px)',
                  gap: '10px',
                  maxHeight: 420,
                  overflowY: 'auto',
                  paddingRight: 6
            }}>
              {categoryIcons.map((icon) => (
                <div
                  key={icon.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, icon)}
                  style={{
                        padding: '10px',
                        background: 'transparent',
                        borderRadius: '8px',
                        cursor: 'grab',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'flex-start',
                        width: '72px',
                        minHeight: '72px',
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
              </div>
              {/* Panel template (right) */}
              <div style={{ flex: '0 0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '60px' }}>
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
                  <div style={{ position: 'relative', zIndex: 2, width: '100%', height: '100%', transform: `translate(${gridOffsetX}px, ${gridOffsetY}px)` }}>
                    {Array.from({ length: 9 }).map((_, index) => renderAbsoluteCell(index))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Step 3: Panel Design */}
        {currentStep === 3 && (
          console.log('Rendering Step 3: Panel Design'),
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
                
                {/* Custom Font Checkbox */}
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  marginBottom: '12px' 
                }}>
                  <input
                    type="checkbox"
                    id="customFont"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setPanelDesign(prev => ({ ...prev, fonts: '' }));
                      } else {
                        setPanelDesign(prev => ({ ...prev, fonts: 'Myriad Pro' }));
                      }
                    }}
                    style={{
                      width: '16px',
                      height: '16px',
                      cursor: 'pointer'
                    }}
                  />
                  <label 
                    htmlFor="customFont"
                    style={{
                      fontSize: '14px',
                      color: '#495057',
                      cursor: 'pointer',
                      fontFamily: '"Myriad Hebrew", "Monsal Gothic", sans-serif'
                    }}
                  >
                    Custom Font
                  </label>
                </div>
                
                {/* Default Font Display */}
                {!useCustomFont && (
                  <div style={{
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: '1px solid #dee2e6',
                    fontSize: '14px',
                    width: '100%',
                    fontFamily: 'Myriad Pro, sans-serif',
                    background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.8)',
                    color: '#495057'
                  }}>
                    Myriad Pro
                  </div>
                )}
                
                {/* Custom Font Input - Only show when checkbox is checked */}
                {useCustomFont && (
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
                )}
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
              width: activeDimension.width || '320px',
              height: activeDimension.height || '320px',
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
            <div style={{ position: 'relative', zIndex: 2, width: '100%', height: '100%', transform: `translate(${gridOffsetX}px, ${gridOffsetY}px)` }}>
              {Array.from({ length: 9 }).map((_, index) => renderAbsoluteCell(index))}
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
                    width: '320px',
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
                  <div style={{ position: 'relative', zIndex: 2, width: '100%', height: '100%', transform: `translate(${gridOffsetX}px, ${gridOffsetY}px)` }}>
                    {Array.from({ length: 9 }).map((_, index) => renderAbsoluteCell(index))}
                  </div>
                </div>
                
                {/* Add to Project Button positioned under the panel template */}
                <Box sx={{ mt: 6, display: 'flex', justifyContent: 'center' }}>
                  {isViewMode ? (
                    /* Go Back to My Designs Button - Only visible in view mode */
                    <StyledButton
                      variant="contained"
                      onClick={() => navigate('/my-designs')}
                      sx={{
                        backgroundColor: '#3498db',
                        color: '#ffffff',
                        '&:hover': {
                          backgroundColor: '#2980b9',
                        }
                      }}
                    >
                      ← Go Back to My Designs
                    </StyledButton>
                  ) : (
                    /* Normal action button - Hidden in view mode */
            <StyledButton
              variant="contained"
              onClick={handleAddToCart}
              sx={{
                backgroundColor: '#1a1f2c',
                color: '#ffffff',
                '&:hover': {
                  backgroundColor: '#2c3e50',
                        }
              }}
            >
                      {isEditMode ? 'Update Panel' : 
                       isCreateNewRevision ? 'Create New Revision' :
                       'Add Panel to Project'}
            </StyledButton>
                  )}
        </Box>
              </div>
            </div>
          </>
        )}
        
        {/* DND/MUR Restriction Dialog */}
        <Dialog
          open={showRestrictionDialog}
          onClose={() => setShowRestrictionDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ 
            textAlign: 'center',
            fontFamily: '"Myriad Hebrew", "Monsal Gothic", sans-serif',
            fontWeight: 500,
            fontSize: '1.1rem'
          }}>
            Panel LED Layout
          </DialogTitle>
          <DialogContent>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              gap: 2,
              py: 1
            }}>
              {/* Large centered LED image */}
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center',
                mb: 1
              }}>
                <img 
                  src={LED} 
                  alt="LED Hardware Layout" 
              style={{
                    width: '160px', 
                    height: '160px',
                    objectFit: 'contain'
                  }}
                />
              </Box>
              
              <Typography sx={{ 
                fontFamily: '"Myriad Hebrew", "Monsal Gothic", sans-serif',
                lineHeight: 1.5,
                textAlign: 'center',
                fontSize: '0.95rem'
              }}>
                {restrictionMessage.split('**').map((part, index) => 
                  index % 2 === 1 ? (
                    <span key={index} style={{ fontWeight: 'bold', color: '#1a1f2c' }}>
                      {part}
                    </span>
                  ) : (
                    part
                  )
                )}
              </Typography>
              
              <Box sx={{ 
                p: 2, 
                bgcolor: '#f8f9fa', 
                borderRadius: 1.5,
                border: '1px solid #e9ecef',
                textAlign: 'center',
                maxWidth: '350px'
              }}>
                <Typography variant="body2" sx={{ 
                  fontFamily: '"Myriad Hebrew", "Monsal Gothic", sans-serif',
                  color: '#6c757d',
                  lineHeight: 1.4
                }}>
                  <strong>Panel LED Configuration:</strong><br/>
                  • Left side: <span style={{color: '#dc3545'}}>Red/White indicators</span><br/>
                  • Right side: <span style={{color: '#28a745'}}>Green/White indicators</span>
                </Typography>
              </Box>
            </Box>
          </DialogContent>
          <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
            <Button 
              onClick={() => setShowRestrictionDialog(false)}
              variant="contained"
              sx={{
                fontFamily: '"Myriad Hebrew", "Monsal Gothic", sans-serif',
                textTransform: 'none',
                px: 3,
                py: 1
              }}
            >
              Got it!
            </Button>
          </DialogActions>
        </Dialog>
        
        {/* Custom Mode Info Dialog */}
        <Dialog
          open={showCustomModeDialog}
          onClose={() => setShowCustomModeDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ 
            textAlign: 'center',
            fontFamily: '"Myriad Hebrew", "Monsal Gothic", sans-serif',
            fontWeight: 500,
            fontSize: '1.1rem'
          }}>
            Custom Panel Submission
          </DialogTitle>
          <DialogContent>
            <Typography sx={{ 
              fontFamily: '"Myriad Hebrew", "Monsal Gothic", sans-serif',
              lineHeight: 1.6,
              textAlign: 'center',
              fontSize: '0.95rem'
            }}>
              Design proposals for standard panels are available immediately. Custom panels require review and validation by our Interior Design team prior to proposal release. Estimated turnaround: 3–5 business days.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
            <Button 
              onClick={() => setShowCustomModeDialog(false)}
              variant="contained"
              sx={{
                fontFamily: '"Myriad Hebrew", "Monsal Gothic", sans-serif',
                textTransform: 'none',
                px: 3,
                py: 1
              }}
            >
              Okay
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default SPCustomizer; 