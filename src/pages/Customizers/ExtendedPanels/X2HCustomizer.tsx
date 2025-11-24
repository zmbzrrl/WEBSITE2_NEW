// Import necessary libraries and components
import React, { useState, useEffect, useRef, useContext } from "react";
import { useCart } from '../../../contexts/CartContext';
import { supabase } from '../../../utils/supabaseClient';
import '../Customizer.css';
import { getBackboxOptions, isNoBackbox, NO_BACKBOX_DISCLAIMER } from '../../../utils/backboxOptions';

const getPanelTypeLabel = (type: string) => {
  switch (type) {
    case "SP": return "Single Panel";
    case "TAG": return "Thermostat";
    case "DPH": return "Horizontal Double Panel";
    case "DPV": return "Vertical Double Panel";
    case "X2V": return "Extended Panel, Vertical, 2 Sockets";
    case "X2H": return "Extended Panel, Horizontal, 2 Sockets";
    case "X1H": return "Extended Panel, Horizontal, 1 Socket";
    case "X1V": return "Extended Panel, Vertical, 1 Socket";
    case "IDPG": return "Corridor Panel";
    default: return "Panel";
  }
};

// Function to get auto text color based on background
const getAutoTextColor = (backgroundColor: string): string => {
  const hex = (backgroundColor || '#ffffff').replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  // Calculate brightness (0-255)
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  
  // Use white text for dark backgrounds, dark grey (#808080) for light to match icons
  return brightness < 150 ? '#ffffff' : '#808080';
};
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
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import FlipIcon from '@mui/icons-material/Flip';
import { styled } from '@mui/material/styles';
import { ralColors, RALColor } from '../../../data/ralColors';
import { ProjectContext } from '../../../App';
import { motion } from 'framer-motion';
import { getPanelLayoutConfig } from '../../../data/panelLayoutConfig';
import iconLibrary from '../../../assets/iconLibrary2';
import DISPLAY from '../../../assets/icons/DISPLAY.png';
import { useSocketToneGuard, SocketTone } from '../../../hooks/useSocketToneGuard';

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
  ralColors,
  currentStep
}: {
  backbox: string;
  setBackbox: (v: string) => void;
  backboxError: string;
  extraComments: string;
  setExtraComments: (v: string) => void;
  panelDesign: any;
  placedIcons: any[];
  ralColors: any[];
  currentStep: number;
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
                {getBackboxOptions('X2H').map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            {backboxError && <div style={{ color: 'red', fontSize: '12px' }}>{backboxError}</div>}
            {isNoBackbox(backbox) && (
              <div style={{
                color: '#856404',
                fontSize: '12px',
                marginTop: '8px',
                fontWeight: '500',
                backgroundColor: '#fff3cd',
                padding: '10px',
                borderRadius: '6px',
                border: '1px solid #ffc107',
              }}>
                ⚠️ {NO_BACKBOX_DISCLAIMER}
              </div>
            )}
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

const X2HCustomizer: React.FC = () => {
  const cartContext = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Icon color filter function based on background brightness
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
    customPanelRequest?: boolean;
  }>({
    backgroundColor: '',
    fonts: '',
    backlight: '',
    iconColor: 'auto',
    plasticColor: '',
    textColor: '#000000',
    fontSize: '12px',
    iconSize: '14mm',
  });
  const [backbox, setBackbox] = useState('');
  const [extraComments, setExtraComments] = useState('');
  const [backboxError, setBackboxError] = useState('');
  const [allGoogleFonts, setAllGoogleFonts] = useState<string[]>(FALLBACK_GOOGLE_FONTS);
  const [fontSearch, setFontSearch] = useState('');
  const [showFontDropdown, setShowFontDropdown] = useState(false);
  const [fontsLoading, setFontsLoading] = useState(false);
  const fontDropdownRef = useRef<HTMLDivElement>(null);
  const [socketNotice, setSocketNotice] = useState('');
  // Free design PIR toggle state
  const [pirToggle, setPirToggle] = useState<boolean>(false);
  
  // Track if panel has been added to project for button text change
  const [panelAddedToProject, setPanelAddedToProject] = useState<boolean>(false);
  
  // Custom panel component state
  const [showCustomPanelComponent, setShowCustomPanelComponent] = useState(false);
  const [showCustomPanelDialog, setShowCustomPanelDialog] = useState(false);
  
  // Add swap and mirror state
  const [swapUpDown, setSwapUpDown] = useState(false); // NEW: swap state
  const [mirrorVertical, setMirrorVertical] = useState(false); // NEW: mirror state
  const [useTagLayout, setUseTagLayout] = useState(false);
  
  // Icon size conversion function (mm to px)
  const convertIconSize = (size: string): string => {
    if (size === '14mm') return '47px'; // 14mm = 47px (95mm panel = 320px, so 14mm = 47px)
    if (size === '10mm') return '34px'; // 10mm = 34px (95mm panel = 320px, so 10mm = 34px)
    return size; // Return as-is if already in px or other format
  };
  
  // PIR helpers (toggle-controlled motion sensor)
  const hasPIR = placedIcons.some(icon => icon.category === 'PIR');
  const getPirIndex = (): number => {
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
  // Sync free-design toggle with current PIR presence
  useEffect(() => {
    if (location.state?.fromFreeDesign) {
      setPirToggle(hasPIR);
    }
  }, [location.state?.fromFreeDesign, hasPIR]);
  const [iconHovered, setIconHovered] = useState<{ [index: number]: boolean }>({});
  const { projectName, projectCode } = useContext(ProjectContext);
  const [selectedFont, setSelectedFont] = useState<string>('Arial');
  const [isTextEditing, setIsTextEditing] = useState<number | null>(null);
  const {
    socketToneMap,
    isSocketAllowed,
    requiredTone: socketToneRequirement,
    isToneReady: isSocketToneReady,
  } = useSocketToneGuard(icons, panelDesign.backgroundColor || '#ffffff');

  useEffect(() => {
    setSocketNotice('');
  }, [socketToneRequirement]);

  useEffect(() => {
    if (!socketNotice) return;
    const timeout = window.setTimeout(() => setSocketNotice(''), 6000);
    return () => window.clearTimeout(timeout);
  }, [socketNotice]);

  const remindSocketRestriction = (tone?: SocketTone) => {
    const targetTone = tone || (socketToneRequirement === 'dark' ? 'light' : 'dark');
    const toneLabel = targetTone === 'dark' ? 'dark' : 'light';
    setSocketNotice(
      `This socket uses a ${toneLabel} finish. Switch the panel background to a ${toneLabel} option to use it.`
    );
  };
  
  // Edit mode state
  const isEditMode = location.state?.editMode || false;
  const editPanelIndex = location.state?.panelIndex;
  const editPanelData = location.state?.panelData;
  
  console.log('RENDER', { backbox, extraComments });

  useEffect(() => {
    import("../../../assets/iconLibrary2").then((module) => {
      setIcons(module.default);
      setIconCategories(module.iconCategories.filter(cat => cat !== 'TAG' && cat !== 'Climate'));
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
        // Load swap states
        setSwapUpDown(editPanelData.panelDesign.swapUpDown || false);
        setMirrorVertical(editPanelData.panelDesign.mirrorVertical || false);
      }

      const customPanelRequested = Boolean(editPanelData.customPanelRequest) || Boolean(editPanelData.panelDesign?.customPanelRequest);
      setShowCustomPanelComponent(customPanelRequested);
      
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

  const { addToCart, updatePanel, projPanels, loadProjectPanels } = cartContext;

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
      if (!isSocketToneReady || !isSocketAllowed(selectedIcon.id)) {
        remindSocketRestriction(socketToneMap[selectedIcon.id]);
        return;
      }
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

    const design: Design & { 
      panelDesign: typeof panelDesign & { swapUpDown?: boolean; mirrorVertical?: boolean };
      customPanelRequest?: boolean;
    } = {
      type: "X2H",
      customPanelRequest: showCustomPanelComponent,
      icons: Array.from({ length: iconPositions.length })
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
      panelDesign: { 
        ...panelDesign, 
        backbox, 
        extraComments, 
        swapUpDown, 
        mirrorVertical,
        customPanelRequest: showCustomPanelComponent || panelDesign.customPanelRequest 
      },
    };

    const category = mapTypeToCategory(design.type);
    const cap = Infinity as number;
    const existingCount = projPanels.filter(p => mapTypeToCategory(p.type) === category).length;
    if (!(isEditMode && editPanelIndex !== undefined) && existingCount + 1 > cap) {
      // No BOQ limit
      return;
    }

    if (isEditMode && editPanelIndex !== undefined) {
      // Update existing panel
      updatePanel(editPanelIndex, design);
    navigate('/proj-panels'); // Return to project panels after updating
    } else {
      // Add new panel with quantity prompt constrained by BOQ remaining
      const category = mapTypeToCategory(design.type);

      const used = projPanels.reduce((sum, p) => sum + (mapTypeToCategory(p.type) === category ? (p.quantity || 1) : 0), 0);

      const cap = Infinity as number;
      const remaining = cap === undefined ? undefined : Math.max(0, cap - used);

      if (remaining !== undefined) {
        if (remaining <= 0) {
          // No BOQ limit
          return;
        }
        // No quantity dialog; add directly
      }

      // Auto-populate panel name and quantity
      const selectedDesignName = location.state?.selectedDesignName;
      const selectedDesignQuantity = location.state?.selectedDesignQuantity || 1;
      const selectedDesignMaxQuantity = location.state?.selectedDesignMaxQuantity;
      const selectedDesignId = location.state?.selectedDesignId;
      const enhancedDesign = {
        ...design,
        panelName: selectedDesignName || getPanelTypeLabel(design.type),
        quantity: selectedDesignQuantity, // Use BOQ allocated quantity
        maxQuantity: typeof selectedDesignMaxQuantity === 'number' ? selectedDesignMaxQuantity : undefined,
        ...(selectedDesignId ? { boqDesignId: selectedDesignId } : {})
      };
      addToCart(enhancedDesign);
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
    if (!('position' in icon) && icon.category === 'Sockets') {
      if (!isSocketToneReady || !isSocketAllowed(icon.id)) {
        e.preventDefault();
        remindSocketRestriction(socketToneMap[icon.id]);
        return;
      }
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
          if (!isSocketToneReady || !isSocketAllowed(icon.id)) {
            remindSocketRestriction(socketToneMap[icon.id]);
            return;
          }
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

  // Swap left/right logic - toggle state
  const handleSwapUpDown = () => {
    setSwapUpDown(s => !s);
  };

  // Mirror vertically logic - just toggle the state
  const handleMirrorVertical = () => {
    setMirrorVertical(m => !m);
  };

  const renderAbsoluteCell = (index: number) => {
    const icon = placedIcons.find((i) => i.position === index);
    const text = iconTexts[index];
    const isPIR = icon?.category === "PIR";
    const isEditing = editingCell === index;
    const isHovered = hoveredCell === index;
    const isIconHovered = !!iconHovered[index];
    const iconSize = convertIconSize(panelDesign.iconSize || '14mm');
    // Default position
    let pos = iconPositions[index] || { top: '0px', left: '0px' };
    if (useTagLayout && index >= 0 && index <= 8) {
      const tagConfig = getPanelLayoutConfig('TAG');
      const tagPos = tagConfig.iconPositions?.[index];
      if (tagPos) {
        pos = { ...pos, top: tagPos.top, left: tagPos.left } as any;
        const rowIdx = Math.floor(index / 3);
        if (rowIdx === 1) pos = { ...pos, top: (parseInt((pos as any).top) + 25) + 'px' } as any;
        if (rowIdx === 2) pos = { ...pos, top: (parseInt((pos as any).top) + 50) + 'px' } as any;
      }
    }
    
    // If swapUpDown (horizontal swap) is true, swap left/right: move 3x3 grid to right, big icons to left
    if (swapUpDown) {
      if (index >= 0 && index <= 8) {
        const swappedGridOffsetX = 530 // shift grid to right side, moved 20px left from 550
        pos = { ...pos, left: (parseInt(pos.left) + swappedGridOffsetX) + 'px' } as any;
      } else if (index === 9) {
        // Move first big icon to left side
        pos = { ...pos, left: '36px' } as any;
        } else if (index === 10) {
          // Move second big icon to left side with spacing, moved 50px to the right
          pos = { ...pos, left: '300px' } as any;
        }
    } else {
      // When swap is not pressed, move 3x3 grid 20px to the right
      if (index >= 0 && index <= 8) {
        pos = { ...pos, left: (parseInt(pos.left) + 20) + 'px' } as any;
      }
    }
    
    // If mirrorVertical is true, mirror the 3x3 grid horizontally (column 0<->2)
    if (mirrorVertical && index >= 0 && index <= 8) {
      const row = Math.floor(index / 3);
      const col = index % 3;
      if (col === 0) {
        // Column 0 moves to column 2 position
        const col2Pos = iconPositions?.[row * 3 + 2] || pos;
        pos = { ...col2Pos };
      } else if (col === 2) {
        // Column 2 moves to column 0 position
        const col0Pos = iconPositions?.[row * 3] || pos;
        pos = { ...col0Pos };
      }
      // Column 1 stays in place
    }
    
    // Calculate container size to match icon size
    let containerSize;
    if (index === 9 || index === 10) {
      containerSize = '150px'; // Big icon slots
    } else if (isPIR) {
      containerSize = '35px'; // PIR special size from config
    } else {
      containerSize = convertIconSize(panelDesign.iconSize || '14mm'); // Regular icons
    }
    
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
        onDrop={e => { e.preventDefault(); const data = e.dataTransfer.getData('text/plain'); handleDrop(index, data); }}
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
                draggable={true}
                onDragStart={(e) => handleDragStart(e, icon)}
                style={{
                width: containerSize,
                height: containerSize,
                objectFit: 'contain',
                marginBottom: '5px',
                position: 'relative',
                  zIndex: 1,
                marginTop: isPIR ? '5px' : '0',
                cursor: 'move',
                  filter: !isPIR && icon?.category !== 'Sockets' ? getIconColorFilter(panelDesign.backgroundColor) : undefined,
                  transition: 'filter 0.2s',
                }}
              />
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
                    {(useTagLayout && index >= 0 && index <= 2 && !!icon) ? null : (isEditing ? (
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
                    ))}
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

  // Check for Proximity flag and set state for visual indicators
  const [showProximityIndicators, setShowProximityIndicators] = useState(false);
  useEffect(() => {
    const checkProximityFlag = async () => {
      const selectedDesignId = location.state?.selectedDesignId;
      const proxFromState = location.state?.proximityFlag === true;
      if (proxFromState) {
        setShowProximityIndicators(true);
        setPanelDesign((prev: any) => ({ ...prev, features: { ...(prev?.features || {}), Proximity: true }, Proximity: true }));
        return;
      }
      if (!isEditMode && selectedDesignId) {
        try {
          const { data: designData, error } = await supabase
            .from('user_designs')
            .select('design_data')
            .eq('id', selectedDesignId)
            .single();
          if (designData && !error) {
            const proximityFlag = designData.design_data?.originalRow?.Proximity || designData.design_data?.features?.Proximity;
            if (proximityFlag === true) {
              setShowProximityIndicators(true);
              setPanelDesign((prev: any) => ({ ...prev, features: { ...(prev?.features || {}), Proximity: true }, Proximity: true }));
            } else {
              setShowProximityIndicators(false);
              setPanelDesign((prev: any) => ({ ...prev, features: { ...(prev?.features || {}), Proximity: false }, Proximity: false }));
            }
          }
        } catch (error) {
          console.error('Error checking proximity flag:', error);
        }
      } else if (!isEditMode) {
        // Fallback: sessionStorage set at navigation time
        try {
          if (selectedDesignId) {
            const stored = sessionStorage.getItem(`boqProximity:${selectedDesignId}`);
            if (stored === 'true') {
              setShowProximityIndicators(true);
              setPanelDesign((prev: any) => ({ ...prev, features: { ...(prev?.features || {}), Proximity: true }, Proximity: true }));
            }
          }
        } catch {}
      }
    };
    checkProximityFlag();
  }, [location.state?.selectedDesignId, isEditMode]);

  // Check for Motion flag and automatically place PIR icon if needed
  useEffect(() => {
    const checkMotionFlag = async () => {
      const motionFlagData = location.state?.motionFlagData;
      
      if (motionFlagData?.hasMotionFlag && !isEditMode && icons && Object.keys(icons).length > 0) {
        console.log('🔍 X2H Motion flag data received:', motionFlagData);
        
        try {
          // Get PIR icon from icon library
          const pirIcon = (icons as any)['PIR'];
          if (pirIcon && !hasPIR) {
            const pirPosition = getPirIndex();
            const newPir: PlacedIcon = {
              id: Date.now(),
              iconId: 'PIR',
              src: pirIcon.src || '',
              label: 'PIR',
              position: pirPosition,
              category: 'PIR'
            };
            setPlacedIcons(prev => [...prev, newPir]);
            console.log('✅ X2H PIR icon placed automatically due to motion flag');
          }
        } catch (error) {
          console.error('Error placing PIR icon:', error);
        }
      }
    };
    
    checkMotionFlag();
  }, [location.state?.motionFlagData, isEditMode, icons, placedIcons]);

  // Only destructure config once, then override iconPositions
  const config = getPanelLayoutConfig('X2H');
  console.log('X2H iconPositions length:', config.iconPositions?.length, config.iconPositions);
  const { dimensions, iconLayout, textLayout, specialLayouts, iconPositions = [] } = config;

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

        {/* Free Design: Motion Sensor Toggle */}
        {location.state?.fromFreeDesign && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2, gap: 24 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input
                type="checkbox"
                checked={pirToggle}
                onChange={(e) => {
                  const enabled = e.target.checked;
                  setPirToggle(enabled);
                  if (enabled) {
                    const pirIcon = (icons as any)['PIR'];
                    const pirPos = getPirIndex();
                    const exists = placedIcons.some(icon => icon.category === 'PIR');
                    const occupied = placedIcons.some(icon => icon.position === pirPos);
                    if (pirIcon && !exists && !occupied) {
                      const newPir = {
                        id: Date.now(),
                        iconId: 'PIR',
                        src: pirIcon.src || '',
                        label: 'PIR',
                        position: pirPos,
                        category: 'PIR'
                      } as any;
                      setPlacedIcons(prev => [...prev, newPir]);
                    }
                  } else {
                    setPlacedIcons(prev => prev.filter(icon => icon.category !== 'PIR'));
                    setIconTexts(prev => ({ ...prev }));
                  }
                }}
              />
              <span style={{ color: '#1a1f2c' }}>Add Motion Sensor</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input
                type="checkbox"
                checked={showProximityIndicators}
                onChange={(e) => {
                  const enabled = e.target.checked;
                  setShowProximityIndicators(enabled);
                  setPanelDesign((prev: any) => ({
                    ...prev,
                    features: { ...(prev?.features || {}), Proximity: enabled },
                    Proximity: enabled,
                  }));
                }}
              />
              <span style={{ color: '#1a1f2c' }}>Add Proximity</span>
            </label>
          </Box>
        )}

        {/* Step Navigation Buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 4 }}>
          <Button
            variant="outlined"
            onClick={() => {
              if (currentStep === 2) {
                // Prefer going back in history; fallback to BOQ-aware selector using session storage
                if (window.history.length > 1) {
                  navigate(-1);
                } else {
                  const projectIdsStr = typeof window !== 'undefined' ? sessionStorage.getItem('boqProjectIds') : null;
                  const projectIds = projectIdsStr ? JSON.parse(projectIdsStr) : [];
                  const importResultsStr = typeof window !== 'undefined' ? sessionStorage.getItem('boqImportResults') : null;
                  const importResults = importResultsStr ? JSON.parse(importResultsStr) : undefined;
                  navigate('/panel-type', { state: { projectIds, importResults } });
                }
              } else {
                setCurrentStep((s) => Math.max(2, s - 1));
              }
            }}
          >
            Back
          </Button>
          <Button
            variant="contained"
            onClick={() => setCurrentStep((s) => Math.min(3, s + 1))}
          >
            Next
          </Button>
        </Box>

        {/* Icon List: Only visible on step 2 */}
        {currentStep === 2 && (
      <div style={{ marginBottom: "20px" }}>
            <div style={{ display: "flex", gap: "8px", marginBottom: "12px", justifyContent: "flex-start", flexWrap: "wrap" }}>
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
           {/* PIR toggle intentionally removed for extended panels */}
        </div>
            {selectedCategory === 'Sockets' && (
              <>
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: '13px',
                    color: '#1a1f2c',
                    mb: 1,
                  }}
                >
                  {`Current panel background is treated as ${socketToneRequirement} — only ${socketToneRequirement} sockets are available. ${
                    socketToneRequirement === 'dark'
                      ? 'Switch to a lighter background to unlock light sockets.'
                      : 'Switch to a darker background to unlock dark sockets.'
                  }`}
                  {!isSocketToneReady && ' Checking socket finishes…'}
                </Typography>
                {socketNotice && (
                  <Typography
                    variant="body2"
                    sx={{
                      fontSize: '12px',
                      color: '#c62828',
                      mb: 1,
                    }}
                  >
                    {socketNotice}
                  </Typography>
                )}
              </>
            )}
            <div style={{ 
                  display: 'grid',
                  gridTemplateColumns: 'repeat(7, 72px)',
                  gap: '10px',
                  maxHeight: 420,
                  overflowY: 'auto',
                  paddingRight: 6
            }}>
          {categoryIcons.map((icon) => {
            const isSocket = icon.category === 'Sockets';
            const tone = socketToneMap[icon.id];
            const socketAllowed = !isSocket ? true : (isSocketToneReady && isSocketAllowed(icon.id));
            const tooltip = !isSocket
              ? icon.label
              : !tone
                ? 'Checking socket finish...'
                : socketAllowed
                  ? `Compatible with ${socketToneRequirement} backgrounds`
                  : `This socket is for ${tone} backgrounds. Switch your panel background to ${tone} to use it.`;

            return (
              <div
                key={icon.id}
                draggable={socketAllowed}
                onDragStart={(e) => handleDragStart(e, icon)}
                onClick={() => {
                  if (isSocket && !socketAllowed) {
                    remindSocketRestriction(tone);
                  }
                }}
                style={{
                  padding: '10px',
                  background: 'transparent',
                  borderRadius: '8px',
                  cursor: isSocket ? (socketAllowed ? 'grab' : 'not-allowed') : 'grab',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  width: '72px',
                  minHeight: '72px',
                  border: '1px solid transparent',
                  transition: 'border-color 0.2s ease, background 0.2s ease',
                  boxSizing: 'border-box',
                  opacity: socketAllowed ? 1 : 0.4,
                }}
                title={tooltip}
                onMouseEnter={(e) => {
                  if (!socketAllowed) return;
                  e.currentTarget.style.borderColor = '#1a1f2c33';
                  e.currentTarget.style.background = '#f7f9fc';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'transparent';
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                <img
                  src={icon.src}
                  alt={icon.label}
                  title={icon.label}
                  style={{ width: '32px', height: '32px', objectFit: 'contain' }}
                />
              </div>
            );
          })}
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

              {/* Backbox Details Section */}
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
                  Backbox Details *
                </div>
                <select
                  value={backbox}
                  onChange={e => {
                    setBackbox(e.target.value);
                    setBackboxError(''); // Clear error when user selects
                  }}
                  style={{ 
                    width: '100%', 
                    padding: '12px', 
                    border: backboxError ? '2px solid #dc3545' : '1px solid #dee2e6', 
                    borderRadius: '8px', 
                    background: '#fff',
                    fontSize: '14px',
                    color: '#495057',
                    outline: 'none',
                    transition: 'border-color 0.2s ease'
                  }}
                >
                  <option value="">Select a backbox...</option>
                  {getBackboxOptions('X2H').map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
                {backboxError && (
                  <div style={{ 
                    color: '#dc3545', 
                    fontSize: '12px', 
                    marginTop: '8px',
                    fontWeight: '500'
                  }}>
                    {backboxError}
                  </div>
                )}
                {isNoBackbox(backbox) && (
                  <div style={{
                    color: '#856404',
                    fontSize: '12px',
                    marginTop: '8px',
                    fontWeight: '500',
                    backgroundColor: '#fff3cd',
                    padding: '10px',
                    borderRadius: '6px',
                    border: '1px solid #ffc107',
                  }}>
                    ⚠️ {NO_BACKBOX_DISCLAIMER}
                  </div>
                )}
              </div>

              {/* Extra Comments Section */}
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
                  Extra Comments
                </div>
                <textarea
                  value={extraComments}
                  onChange={e => setExtraComments(e.target.value)}
                  placeholder="Add any additional comments or notes..."
                  style={{ 
                    width: '100%', 
                    padding: '12px', 
                    border: '1px solid #dee2e6', 
                    borderRadius: '8px', 
                    background: '#fff',
                    fontSize: '14px',
                    color: '#495057',
                    outline: 'none',
                    resize: 'vertical',
                    minHeight: '80px',
                    fontFamily: 'inherit',
                    transition: 'border-color 0.2s ease'
                  }}
                />
              </div>

              {/* Typography font controls removed for step 3 */}
            </div>
          {/* Right side - Panel Template */}
          <div style={{ flex: '0 0 auto', marginTop: '100px' }}>
            <div
              style={{
                position: 'relative',
                width: '850px', // updated to match new panel width
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
            {/* Proximity indicators overlay */}
            {showProximityIndicators && (
              <>
                <div
                  style={{
                    position: 'absolute',
                    bottom: '18px',
                    right: '62px',
                    width: '9px',
                    height: '9px',
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
                    bottom: '18px',
                    right: '32px',
                    width: '9px',
                    height: '9px',
                    borderRadius: '50%',
                    backgroundColor: '#ff9800',
                    filter: getIconColorFilter(panelDesign.backgroundColor),
                    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
                    zIndex: 10
                  }}
                />
              </>
            )}
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
              {/* Proximity indicators overlay */}
              {showProximityIndicators && (
                <>
                  <div style={{ position: 'absolute', bottom: '14px', right: '58px', width: '9px', height: '9px', borderRadius: '50%', backgroundColor: '#ff9800', zIndex: 3 }} />
                  <div style={{ position: 'absolute', bottom: '14px', right: '28px', width: '9px', height: '9px', borderRadius: '50%', backgroundColor: '#ff9800', zIndex: 3 }} />
                </>
              )}
              <div style={{ position: 'relative', zIndex: 2, width: '100%', height: '100%' }}>
                {useTagLayout && (
                  <img
                    src={DISPLAY}
                    alt="DISPLAY"
                    style={{
                      position: 'absolute',
                      top: '90px',
                      left: '25%',
                      transform: 'translateX(-50%)',
                      width: '220px',
                      height: '50px',
                      objectFit: 'contain',
                      filter: getIconColorFilter(panelDesign.backgroundColor),
                      pointerEvents: 'none',
                      zIndex: 3,
                    }}
                  />
                )}
                {Array.from({ length: iconPositions.length }).map((_, index) => renderAbsoluteCell(index))}
              </div>
              </div>
            </div>
          </div>
        )}
        {/* Panel Template: Only visible for step 2 */}
        {currentStep === 2 && (
          <div style={{ marginBottom: "20px", display: 'flex', justifyContent: 'center' }}>
            <div
              style={{
                    position: 'relative',
                width: '850px', // In step 2, update the width of the panel template background to 850px
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
              {/* Proximity indicators overlay */}
              {showProximityIndicators && (
                <>
                  <div style={{ position: 'absolute', bottom: '14px', right: '58px', width: '9px', height: '9px', borderRadius: '50%', backgroundColor: '#ff9800', zIndex: 3 }} />
                  <div style={{ position: 'absolute', bottom: '14px', right: '28px', width: '9px', height: '9px', borderRadius: '50%', backgroundColor: '#ff9800', zIndex: 3 }} />
                </>
              )}
              <div style={{ position: 'relative', zIndex: 2, width: '100%', height: '100%' }}>
                {Array.from({ length: iconPositions.length }).map((_, index) => renderAbsoluteCell(index))}
                </div>
            </div>
          </div>
        )}

        {/* Swap/Mirror Buttons - compact toolbar above template on step 2 */}
        {currentStep === 2 && (
          <div style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: 8, margin: '8px 0 12px 0' }}>
            <Button
              variant="outlined"
              onClick={handleSwapUpDown}
              size="small"
            >
              {!swapUpDown ? 'Swap' : 'Unswap'}
            </Button>
            <Button
              variant="outlined"
              onClick={handleMirrorVertical}
              size="small"
              startIcon={<FlipIcon sx={{ transform: 'rotate(90deg)' }} fontSize="small" />}
            >
              {mirrorVertical ? 'Unmirror' : 'Mirror'}
            </Button>
            <Button
              variant="contained"
              color={useTagLayout ? 'primary' : 'inherit'}
              onClick={() => setUseTagLayout(v => !v)}
              size="small"
            >
              {useTagLayout ? 'Use 3x3 grid' : 'Use TAG layout'}
            </Button>
          </div>
        )}

        {/* Add Panel to Project Button - Only visible on step 3 */}
        {currentStep === 3 && (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            flexDirection: 'column',
            gap: 2,
            mt: 4,
            mb: 4
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
              }}
            >
              {isEditMode ? 'Update Panel' : 
               panelAddedToProject ? 'Replace Design' :
               'Add Panel to Project'}
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
                      fontSize: '12px',
                      iconSize: '14mm',
                    fonts: 'Myriad Pro SemiBold SemiCondensed',
                    customPanelRequest: false
                    });
                    setFontSearch('Myriad Pro SemiBold SemiCondensed');
                    setExtraComments('');
                    setShowCustomPanelComponent(false);
                  } else {
                    setShowCustomPanelComponent(true);
                  setPanelDesign(prev => ({ ...prev, customPanelRequest: true }));
                  }
                }}
                style={{
                  background: 'linear-gradient(135deg, #6f42c1 0%, #8e44ad 100%)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px 24px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  letterSpacing: '0.5px',
                  fontWeight: 'bold',
                  marginTop: '-15px'
                }}
              >
                {showCustomPanelComponent ? 'Design Standard Panel' : 'Create Custom Panel'}
              </button>
            </div>
          </Box>
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
                background: 'linear-gradient(90deg, #6f42c1 0%, #8e44ad 50%, #6f42c1 100%)',
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
                gap: '24px',
                marginBottom: '32px'
              }}>
                {/* Font Selection */}
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
                      background: 'linear-gradient(180deg, #6f42c1 0%, #8e44ad 100%)',
                      borderRadius: '2px'
                    }} />
                    Font Selection
                  </div>
                  <TextField
                    fullWidth
                    value={fontSearch}
                    onChange={(e) => setFontSearch(e.target.value)}
                    placeholder="Search fonts..."
                    variant="outlined"
                    size="small"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        fontSize: '14px',
                        fontFamily: '"Myriad Hebrew", "Monsal Gothic", sans-serif'
                      }
                    }}
                  />
                </div>

                {/* Font Size Selection */}
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
                      background: 'linear-gradient(180deg, #6f42c1 0%, #8e44ad 100%)',
                      borderRadius: '2px'
                    }} />
                    Font Size
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {['8px', '9px', '10px', '11px', '12px', '14px', '16px', '18px'].map((size) => (
                      <button
                        key={size}
                        onClick={() => setPanelDesign({ ...panelDesign, fontSize: size })}
                        style={{
                          width: '60px',
                          height: '60px',
                          border: panelDesign.fontSize === size ? '2px solid #6f42c1' : '2px solid #dee2e6',
                          borderRadius: '8px',
                          background: panelDesign.fontSize === size ? '#6f42c1' : '#fff',
                          color: panelDesign.fontSize === size ? '#fff' : '#1a1f2c',
                          fontSize: '14px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: panelDesign.fontSize === size ? '0 4px 12px rgba(111,66,193,0.3)' : '0 2px 4px rgba(0,0,0,0.1)'
                        }}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Icon Size Selection */}
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
                      background: 'linear-gradient(180deg, #6f42c1 0%, #8e44ad 100%)',
                      borderRadius: '2px'
                    }} />
                    Icon Size
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {['10mm', '12mm', '14mm', '16mm', '18mm', '20mm'].map((size) => (
                      <button
                        key={size}
                        onClick={() => setPanelDesign({ ...panelDesign, iconSize: size })}
                        style={{
                          width: '60px',
                          height: '60px',
                          border: panelDesign.iconSize === size ? '2px solid #6f42c1' : '2px solid #dee2e6',
                          borderRadius: '8px',
                          background: panelDesign.iconSize === size ? '#6f42c1' : '#fff',
                          color: panelDesign.iconSize === size ? '#fff' : '#1a1f2c',
                          fontSize: '14px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: panelDesign.iconSize === size ? '0 4px 12px rgba(111,66,193,0.3)' : '0 2px 4px rgba(0,0,0,0.1)'
                        }}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Icon Upload */}
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
                      background: 'linear-gradient(180deg, #6f42c1 0%, #8e44ad 100%)',
                      borderRadius: '2px'
                    }} />
                    Custom Icon Upload
                  </div>
                  <input
                    type="file"
                    accept=".png,.jpg,.jpeg,.svg"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        console.log('Custom icon uploaded:', file.name);
                        // Handle custom icon upload
                      }
                    }}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #dee2e6',
                      borderRadius: '4px',
                      fontSize: '14px',
                      fontFamily: '"Myriad Hebrew", "Monsal Gothic", sans-serif'
                    }}
                  />
                </div>
              </div>

              {/* Submit Custom Panel Button */}
              <div style={{ textAlign: 'center', marginTop: '24px' }}>
                <button
                  type="button"
                  onClick={() => setShowCustomPanelDialog(true)}
                  style={{
                    background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '12px 32px',
                    fontSize: '16px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    letterSpacing: '0.5px',
                    fontWeight: 'bold',
                    boxShadow: '0 4px 12px rgba(40,167,69,0.3)'
                  }}
                >
                  Submit Custom Panel Request
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Custom Panel Dialog */}
        <Dialog
          open={showCustomPanelDialog}
          onClose={() => setShowCustomPanelDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ 
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
              gap: 2,
              pt: 1
            }}>
              <Typography sx={{ 
                fontFamily: '"Myriad Hebrew", "Monsal Gothic", sans-serif',
                lineHeight: 1.6,
                color: '#495057'
              }}>
                Your custom panel request has been submitted successfully! Our design team will review your specifications and get back to you within 2-3 business days.
              </Typography>
              <Typography sx={{ 
                fontFamily: '"Myriad Hebrew", "Monsal Gothic", sans-serif',
                lineHeight: 1.6,
                color: '#6c757d',
                fontSize: '0.9rem'
              }}>
                You will receive an email confirmation with your request details and a reference number for tracking.
              </Typography>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2, pt: 1 }}>
            <Button 
              onClick={() => setShowCustomPanelDialog(false)}
              variant="contained"
              sx={{
                backgroundColor: '#6f42c1',
                '&:hover': { backgroundColor: '#5a32a3' }
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

export default X2HCustomizer; 