import React, { useState, useEffect, useRef, useContext } from "react";
import { useCart } from "../../contexts/CartContext";
import "./Customizer.css";
import { getBackboxOptions, isNoBackbox, NO_BACKBOX_DISCLAIMER } from "../../utils/backboxOptions";

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
import CartButton from "../../components/CartButton";
import RALColorSelector from "../../components/RALColorSelector";
// BOQ removed
import { useNavigate, useLocation } from "react-router-dom";
import logo from "../../assets/logo.png";
import g18Icon from "../../assets/icons/G-GuestServices/G18.png";
import g1Icon from "../../assets/icons/G-GuestServices/G1.png";
import g2Icon from "../../assets/icons/G-GuestServices/G2.png";
import g3Icon from "../../assets/icons/G-GuestServices/G3.png";
import crIcon from "../../assets/icons/CR.png";
import allIcons from "../../assets/iconLibrary2";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { ProjectContext } from '../../App';
import { motion } from 'framer-motion';
import {
  Container,
  Typography,
  Box,
  Button,
  LinearProgress,
  useTheme,
  TextField,
  Checkbox,
  FormControlLabel,
  Paper,
  Grid,
  ToggleButton,
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

const CheckboxContainer = styled(Box)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  borderRadius: 12,
  padding: theme.spacing(3),
  maxWidth: '600px',
  margin: '0 auto',
  marginBottom: theme.spacing(4),
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
}));

const StyledCheckbox = styled(Checkbox)(({ theme }) => ({
  color: 'rgba(255, 255, 255, 0.7)',
  '&.Mui-checked': {
    color: 'rgba(255, 255, 255, 0.9)',
  },
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
}));

const StyledFormControlLabel = styled(FormControlLabel)(({ theme }) => ({
  color: 'rgba(255, 255, 255, 0.9)',
  '& .MuiFormControlLabel-label': {
    fontSize: '16px',
    fontWeight: 500,
    letterSpacing: '0.5px',
  },
}));

const DesignContainer = styled(Paper)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  borderRadius: 12,
  padding: theme.spacing(3),
  marginBottom: theme.spacing(4),
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
}));

const ColorButton = styled(Box)(({ theme }) => ({
  width: '40px',
  height: '40px',
  borderRadius: '50%',
  cursor: 'pointer',
  border: '3px solid rgba(255, 255, 255, 0.3)',
  transition: 'all 0.2s ease',
  '&:hover': {
    transform: 'scale(1.1)',
    border: '3px solid rgba(255, 255, 255, 0.6)',
  },
}));

const hexToRgba = (hex: string, alpha: number): string => {
  if (!hex) return `rgba(255, 255, 255, ${alpha})`;
  hex = hex.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const getHueRotation = (hex: string): number => {
  if (!hex || hex === '#000000' || hex === '#FFFFFF') return 0;
  hex = hex.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  
  if (max === min) {
    h = 0; // achromatic
  } else {
    const d = max - min;
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  
  return h * 360;
};

const PanelTitle = styled(Typography)(({ theme }) => ({
  color: 'rgba(255, 255, 255, 0.9)',
  fontWeight: 400,
  letterSpacing: '0.5px',
  marginTop: theme.spacing(2),
  opacity: 0.8,
  transform: 'translateY(10px)',
  transition: 'all 0.3s ease',
  fontFamily: '"Myriad Hebrew", "Monsal Gothic", sans-serif',
}));

const StyledPanel = styled(motion.div)({
  width: '100%'
});

const containerVariants = {
  hidden: { opacity: 1 },
  visible: {
    transition: {
      staggerChildren: 0.35
    }
  }
};

const itemVariants = {
  hidden: { 
    opacity: 1,
    y: 20
  },
  visible: { 
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.4, 0, 0.2, 1]
    }
  }
};

const TemplateSelector = styled(Box)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  borderRadius: 12,
  padding: theme.spacing(3),
  marginBottom: theme.spacing(4),
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
}));

const StyledToggleButton = styled(ToggleButton)(({ theme }) => ({
  color: 'rgba(255, 255, 255, 0.8)',
  border: '1px solid rgba(255, 255, 255, 0.3)',
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
  '&.Mui-selected': {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    color: 'rgba(255, 255, 255, 1)',
    border: '1px solid rgba(255, 255, 255, 0.6)',
  },
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  fontFamily: '"Myriad Hebrew", "Monsal Gothic", sans-serif',
  fontSize: '14px',
  fontWeight: 500,
  letterSpacing: '0.5px',
}));

const IconSelector = styled(Box)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  borderRadius: 12,
  padding: theme.spacing(3),
  marginBottom: theme.spacing(4),
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
}));

const IconGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(45px, 1fr))',
  gap: theme.spacing(1),
  marginTop: theme.spacing(1),
}));

const IconButton = styled(Box)(({ theme }) => ({
  width: '45px',
  height: '45px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: '1px solid rgba(255, 255, 255, 0.3)',
  borderRadius: '6px',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
  '&:hover': {
    border: '1px solid rgba(255, 255, 255, 0.6)',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  '&.selected': {
    border: '1px solid rgba(255, 255, 255, 0.8)',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
}));

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
  if (brightness < 150) {
    // Dark background - use white icons
    return 'brightness(0) saturate(100%) invert(1)';
  } else {
    // Light background - use dark grey icons
    return 'brightness(0) saturate(100%) invert(52%) sepia(0%) saturate(0%) hue-rotate(148deg) brightness(99%) contrast(91%)';
  }
};

// Determine text color based on background using the same brightness logic
const getTextColorFromBackground = (backgroundColor: string): string => {
  const hex = (backgroundColor || '').replace('#', '');
  if (!hex) return '#333333';
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  // Match icon contrast: white on dark, dark grey (#808080) on light
  return brightness < 150 ? '#FFFFFF' : '#808080';
};

const IDPGCustomizer = () => {
  const theme = useTheme();
  const location = useLocation();
  const [showPanels, setShowPanels] = useState(false);
  const [cardReader, setCardReader] = useState(false);
  const [roomNumber, setRoomNumber] = useState(false);
  const [statusMode, setStatusMode] = useState<'bar' | 'icons'>('bar');
  const [roomNumberText, setRoomNumberText] = useState("");
  const [selectedIcon1, setSelectedIcon1] = useState("DND Privacy");
  const [selectedIcon2, setSelectedIcon2] = useState("MUR Service");
  const [backbox, setBackbox] = useState('');
  const [extraComments, setExtraComments] = useState('');
  const [backboxError, setBackboxError] = useState('');
  const [allGoogleFonts, setAllGoogleFonts] = useState<string[]>(FALLBACK_GOOGLE_FONTS);
  const [fontSearch, setFontSearch] = useState('');
  const [showFontDropdown, setShowFontDropdown] = useState(false);
  const [fontsLoading, setFontsLoading] = useState(false);
  const fontDropdownRef = useRef<HTMLDivElement>(null);
  const [iconHovered, setIconHovered] = useState<{ [index: number]: boolean }>({});
  const [icons, setIcons] = useState({});
  const [iconCategories, setIconCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const navigate = useNavigate();
  const { addToCart, updatePanel, projPanels, loadProjectPanels } = useCart();
  const { projectName, projectCode } = useContext(ProjectContext);
  const [selectedFont, setSelectedFont] = useState<string>('Arial');
  const [isTextEditing, setIsTextEditing] = useState<number | null>(null);
  
  // Track if panel has been added to project for button text change
  const [panelAddedToProject, setPanelAddedToProject] = useState<boolean>(false);
  const [panelDesign, setPanelDesign] = useState({
    backgroundColor: '#FFFFFF',
    iconColor: 'auto',
    textColor: '#000000',
    fontSize: '12px',
    fonts: '',
    iconSize: '40px',
  });

  // Edit mode state
  const isEditMode = location.state?.editMode || false;
  const editPanelIndex = location.state?.panelIndex;
  const editPanelData = location.state?.panelData;
  const isFreeDesignMode = location.state?.fromFreeDesign || false;

  // Guest Services icons mapping
  const guestServicesIcons = {
    G1: g1Icon,
    G2: g2Icon,
    G3: g3Icon,
    G18: g18Icon,
  };

  // DND Privacy icons for left side
  const leftIconOptions = ['DND Privacy', 'DND Privacy Alternative 1', 'DND Privacy Alternative 2'];

  // MUR Service icons for right side
  const rightIconOptions = ['MUR Service', 'MUR Service Alternative 1', 'MUR Service Alternative 2', 'MUR Service Alternative 3', 'MUR Service Alternative 4', 'MUR Service Alternative 5'];

  // Default panel design values
  const defaultPanelDesign = {
    backgroundColor: '#FFFFFF',
    textColor: '#000000',
    fontSize: '12px',
    fonts: undefined,
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowPanels(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    import("../../assets/iconLibrary2").then((module) => {
      setIcons(module.default);
      const filteredCategories = module.iconCategories.filter(cat => cat !== 'PIR' && cat !== 'Climate');
      setIconCategories(filteredCategories);
      if (filteredCategories.length > 0) {
        setSelectedCategory(filteredCategories[0]);
      }
    });
  }, []);


  // Initialize from flags passed via navigation (override UI checkboxes)
  useEffect(() => {
    const rn = location.state?.roomNumberFlag;
    const cr = location.state?.cardReaderFlag;
    if (typeof rn === 'boolean') setRoomNumber(rn);
    if (typeof cr === 'boolean') setCardReader(cr);
  }, [location.state?.roomNumberFlag, location.state?.cardReaderFlag]);

  // Load existing panel data if in edit mode
  useEffect(() => {
    if (isEditMode && editPanelData) {
      // Deep copy the edit data to prevent shared references
      const deepCopiedData = JSON.parse(JSON.stringify(editPanelData));
      
      if (deepCopiedData.panelDesign) {
        setPanelDesign(deepCopiedData.panelDesign);
        setBackbox(deepCopiedData.panelDesign.backbox || '');
        setExtraComments(deepCopiedData.panelDesign.extraComments || '');
        
        // Load IDPG-specific configuration
        if (deepCopiedData.panelDesign.idpgConfig) {
          const config = deepCopiedData.panelDesign.idpgConfig;
          setCardReader(config.cardReader || false);
          setRoomNumber(config.roomNumber || false);
          setStatusMode(config.statusMode || 'bar');
          setSelectedIcon1(config.selectedIcon1 || 'DND Privacy');
          setSelectedIcon2(config.selectedIcon2 || 'MUR Service');
          setRoomNumberText(config.roomNumberText || '');
        }
      }
    }
  }, [isEditMode, editPanelData]);

  // Function to get panel name based on checkbox states
  const getPanelName = () => {
    let name = "IDPG";
    const features = [];
    if (cardReader) features.push("CR");
    if (roomNumber) features.push("RN");
    features.push(statusMode === 'icons' ? "SI" : "SB");
    if (features.length > 0) {
      name += ` ${features.join(" ")}`;
    }
    return name;
  };

  // Render panel based on checkbox combinations
  const renderPanelTemplate = () => {
    const computedTextColor = getTextColorFromBackground(panelDesign.backgroundColor);
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
                  src={icons[selectedIcon1]?.src || ''} 
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
                  src={icons[selectedIcon2]?.src || ''} 
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
                src={icons['Bell']?.src || g18Icon} 
                alt="Bell Icon" 
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
            height: "8px",
            background: `${getTextColorFromBackground(panelDesign.backgroundColor) === '#FFFFFF' ? '#FFFFFF' : '#808080'}`,
            border: `2px solid ${getTextColorFromBackground(panelDesign.backgroundColor) === '#FFFFFF' ? '#FFFFFF' : '#808080'}`,
            borderRadius: "4px",
            margin: "auto",
          }} />
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
          }}>
            <TextField
              value={roomNumberText}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                setRoomNumberText(value);
              }}
              placeholder="Type room number"
              variant="standard"
              size="small"
              sx={{
                '& .MuiInput-root': {
                  color: computedTextColor,
                  fontSize: '48px',
                  fontWeight: 'bold',
                  fontFamily: panelDesign.fonts || undefined,
                  backgroundColor: 'transparent',
                  border: 'none',
                  '&:before': {
                    borderBottom: 'none',
                  },
                  '&:after': {
                    borderBottom: 'none',
                  },
                  '&:hover:not(.Mui-disabled):before': {
                    borderBottom: 'none',
                  },
                },
                '& .MuiInputBase-input': {
                  textAlign: 'center',
                  padding: '12px 16px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: computedTextColor,
                },
                '& .MuiInputBase-input::placeholder': {
                  color: 'rgba(120, 120, 120, 0.85)',
                  opacity: 1,
                  fontSize: '24px',
                  fontWeight: 'normal',
                },
              }}
              inputProps={{
                style: {
                  textAlign: 'center',
                  fontSize: '48px',
                  fontWeight: 'bold',
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: computedTextColor,
                }
              }}
            />
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
                  src={icons[selectedIcon1]?.src || ''} 
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
                  src={icons[selectedIcon2]?.src || ''} 
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
            width: "20%",
            height: "8px",
            background: `${getTextColorFromBackground(panelDesign.backgroundColor) === '#FFFFFF' ? '#FFFFFF' : '#808080'}`,
            border: `2px solid ${getTextColorFromBackground(panelDesign.backgroundColor) === '#FFFFFF' ? '#FFFFFF' : '#808080'}`,
            borderRadius: "4px",
            margin: "10px auto",
          }} />
          )}
          
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
    }

    // Card Reader only - Rectangle vertical template
    if (cardReader && !roomNumber) {
      return (
        <div style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          padding: "15px",
        }}>
          {statusMode === 'icons' ? (
            /* Two icon fields at top */
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
                  src={icons[selectedIcon1]?.src || ''} 
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
                  src={icons[selectedIcon2]?.src || ''} 
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
            width: "20%",
            height: "8px",
            background: `${getTextColorFromBackground(panelDesign.backgroundColor) === '#FFFFFF' ? '#FFFFFF' : '#808080'}`,
            border: `2px solid ${getTextColorFromBackground(panelDesign.backgroundColor) === '#FFFFFF' ? '#FFFFFF' : '#808080'}`,
            borderRadius: "4px",
            margin: "0 auto 20px auto",
          }} />
          )}
          
          {/* G18 icon in center */}
            <div style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            flex: "1",
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
          {/* CR icon in bottom center */}
            <div style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              paddingBottom: "10px",
            }}>
              <img 
              src={crIcon} 
              alt="CR Icon" 
                style={{
                width: panelDesign.iconSize,
                height: panelDesign.iconSize,
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
              <TextField
                value={roomNumberText}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                  setRoomNumberText(value);
                }}
                placeholder="Type room number"
                variant="standard"
                size="small"
                sx={{
                  '& .MuiInput-root': {
                    color: computedTextColor,
                    fontSize: '48px',
                    fontWeight: 'bold',
                    fontFamily: panelDesign.fonts || undefined,
                    backgroundColor: 'transparent',
                    border: 'none',
                    '&:before': {
                      borderBottom: 'none',
                    },
                    '&:after': {
                      borderBottom: 'none',
                    },
                    '&:hover': {
                      borderBottom: 'none',
                    },
                  },
                  '& .MuiInputBase-input': {
                    textAlign: 'center',
                    padding: '12px 16px',
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: computedTextColor,
                  },
                  '& .MuiInputBase-input::placeholder': {
                    color: 'rgba(120, 120, 120, 0.85)',
                    opacity: 1,
                    fontSize: '24px',
                    fontWeight: 'normal',
                  },
                }}
                inputProps={{
                  style: {
                    textAlign: 'center',
                    fontSize: '48px',
                    fontWeight: 'bold',
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: computedTextColor,
                  }
                }}
              />
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
                  src={icons[selectedIcon1]?.src || ''} 
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
                  src={icons[selectedIcon2]?.src || ''} 
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
              width: "20%",
              height: "8px",
              background: `${getTextColorFromBackground(panelDesign.backgroundColor) === '#FFFFFF' ? '#FFFFFF' : '#808080'}`,
              border: `2px solid ${getTextColorFromBackground(panelDesign.backgroundColor) === '#FFFFFF' ? '#FFFFFF' : '#808080'}`,
              borderRadius: "4px",
              margin: "10px auto",
            }} />
          )}
          
          {/* G18 icon in center */}
            <div style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            flex: "1",
            }}>
              <img 
                src={icons['Bell']?.src || g18Icon} 
                alt="Bell Icon" 
                style={{
                  width: panelDesign.iconSize,
                  height: panelDesign.iconSize,
                  filter: getIconColorFilter(panelDesign.backgroundColor),
                }}
              />
            </div>
          {/* CR icon in bottom center */}
            <div style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              paddingBottom: "10px",
            }}>
              <img 
                src={crIcon} 
                alt="CR Icon" 
                style={{
                  width: panelDesign.iconSize,
                  height: panelDesign.iconSize,
                  filter: getIconColorFilter(panelDesign.backgroundColor),
                }}
              />
            </div>
        </div>
      );
    }

    // Default fallback for other combinations
    return (
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100%",
        color: computedTextColor,
        fontSize: panelDesign.fontSize,
        fontFamily: panelDesign.fonts || undefined,
        fontWeight: "500",
      }}>
        IDPG Panel
      </div>
    );
  };

  // Filter icons by selected category
  const categoryIcons = selectedCategory
    ? Object.entries(icons || {})
        .filter(([_, icon]) => (icon as any).category === selectedCategory && (icon as any).category !== 'PIR')
        .map(([id, icon]) => ({
          id,
          src: (icon as any).src,
          label: (icon as any).label,
          category: (icon as any).category
        }))
    : [];

  // Add Panel to Project handler
  const [qtyOpen, setQtyOpen] = useState(false);
  const [qtyRemaining, setQtyRemaining] = useState<number | undefined>(undefined);
  const [pendingDesign, setPendingDesign] = useState<any | null>(null);
  const [pendingCategory, setPendingCategory] = useState<'SP'|'TAG'|'IDPG'|'DP'|'EXT'>('IDPG');

  const handleAddToCart = (): void => {
    // Check if backbox details are provided (allow "No backbox" as valid selection)
    if (!backbox.trim()) {
      setBackboxError('Please select a backbox option before adding the panel to your project.');
      return;
    }

    // Create icons array based on IDPG configuration
    const iconsArray = [];
    
    // Add Card Reader icon if enabled
    if (cardReader) {
      iconsArray.push({
        iconId: 'CR',
        src: icons['Card Reader']?.src || '',
        label: 'Card Reader',
        position: 0,
        text: '',
        category: 'Card Reader',
      });
    }
    
    // Add Room Number if enabled
    if (roomNumber) {
      iconsArray.push({
        iconId: 'RN',
        src: '', // Room number is text-based, no icon
        label: 'Room Number',
        position: 1,
        text: roomNumberText,
        category: 'Room Number',
      });
    }
    
    // Add status icons based on mode
    if (statusMode === 'icons') {
      // Add selected icon 1
      if (selectedIcon1 && icons[selectedIcon1]) {
        iconsArray.push({
          iconId: selectedIcon1.replace(/\s+/g, '_'),
          src: icons[selectedIcon1].src || '',
          label: selectedIcon1,
          position: 2,
          text: '',
          category: 'Status',
        });
      }
      
      // Add selected icon 2
      if (selectedIcon2 && icons[selectedIcon2]) {
        iconsArray.push({
          iconId: selectedIcon2.replace(/\s+/g, '_'),
          src: icons[selectedIcon2].src || '',
          label: selectedIcon2,
          position: 3,
          text: '',
          category: 'Status',
        });
      }
    } else {
      // Status bar mode - add a generic status bar icon
      iconsArray.push({
        iconId: 'STATUS_BAR',
        src: '',
        label: 'Status Bar',
        position: 2,
        text: 'Status Bar',
        category: 'Status',
      });
    }

    const design = {
      type: 'IDPG',
      icons: iconsArray,
      quantity: 1,
      panelDesign: { 
        ...panelDesign, 
        iconColor: panelDesign.iconColor || 'auto', // Ensure iconColor is included
        backbox, 
        extraComments,
        // Save IDPG-specific configuration
        idpgConfig: {
          cardReader,
          roomNumber,
          statusMode,
          selectedIcon1,
          selectedIcon2,
          roomNumberText,
        }
      },
    };

    if (isEditMode && editPanelIndex !== undefined) {
      // Update existing panel
      updatePanel(editPanelIndex, design);
      setPanelAddedToProject(true); // Mark panel as added/updated in project
      navigate('/proj-panels'); // Return to project panels after updating
    } else {
      // Auto-populate panel name and quantity
      const selectedDesignName = location.state?.selectedDesignName;
      const selectedDesignQuantity = location.state?.selectedDesignQuantity || 1;
      const selectedDesignMaxQuantity = location.state?.selectedDesignMaxQuantity;
      
      // In free design mode, use default values instead of BOQ values
      const enhancedDesign = {
        ...design,
        panelName: isFreeDesignMode ? getPanelTypeLabel(design.type) : (selectedDesignName || getPanelTypeLabel(design.type)),
        quantity: isFreeDesignMode ? 1 : selectedDesignQuantity, // Use 1 for free design, BOQ quantity for import mode
        maxQuantity: isFreeDesignMode ? undefined : (typeof selectedDesignMaxQuantity === 'number' ? selectedDesignMaxQuantity : undefined)
      };

      if (panelAddedToProject) {
        // Replace existing panel with same name
        const existingPanelIndex = projPanels.findIndex(panel => panel.panelName === enhancedDesign.panelName);
        if (existingPanelIndex !== -1) {
          // Replace the existing panel
          updatePanel(existingPanelIndex, enhancedDesign as any);
        } else {
          // If no existing panel found, add as new
          addToCart(enhancedDesign as any);
        }
      } else {
        // Add new panel with quantity prompt constrained by BOQ remaining (only in BOQ mode)
        if (!isFreeDesignMode) {
          const category = mapTypeToCategory(design.type);

          const used = projPanels.reduce((sum, p) => sum + (mapTypeToCategory(p.type) === category ? (p.quantity || 1) : 0), 0);

          const getCategoryCap = (cat: 'SP'|'TAG'|'IDPG'|'DP'|'EXT'): number | undefined => {
            return undefined;
          };

          const cap = getCategoryCap(category);
          const remaining = cap === undefined ? undefined : Math.max(0, cap - used);

          if (remaining !== undefined) {
            if (remaining <= 0) {
              // BOQ removed
              return;
            }
            setPendingDesign(design as any);
            setPendingCategory(category);
            setQtyRemaining(remaining);
            setQtyOpen(true);
            return;
          }

          addToCart(enhancedDesign as any);
        } else {
          // Free design mode - add directly without BOQ constraints
          addToCart(enhancedDesign as any);
        }
        setPanelAddedToProject(true); // Mark panel as added to project
      }
    }
  };

  const handleQtyConfirm = (qty: number) => {
    if (!pendingDesign) return;
    const finalDesign = { ...(pendingDesign as any), quantity: qty };
    loadProjectPanels([finalDesign]);
    setPendingDesign(null);
    setQtyOpen(false);
  };

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
        background: 'linear-gradient(135deg, #b8c5d7 0%, #d1dce8 100%)',
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
            src={logo} 
            alt="Logo" 
            style={{ height: '40px', width: 'auto', cursor: 'pointer' }}
            onClick={() => navigate('/')} 
          />
          <Typography
            variant="h6"
            component="h1"
            sx={{
              color: 'rgba(255, 255, 255, 0.95)',
              fontWeight: 400,
              letterSpacing: '1px',
              textTransform: 'capitalize',
              fontFamily: '"Myriad Hebrew", "Monsal Gothic", sans-serif',
            }}
          >
            Design your panels
          </Typography>
        </Box>
        <ProgressContainer>
          <Typography
            variant="h4"
            sx={{
              color: 'rgba(255, 255, 255, 0.95)',
              fontWeight: 600,
              textAlign: 'center',
              marginBottom: 1,
              letterSpacing: '1px',
              fontFamily: '"Myriad Hebrew", "Monsal Gothic", sans-serif',
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
              fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
            }}
          >
            Customize Your Corridor Panel
          </Typography>
        </ProgressContainer>
        
        <CheckboxContainer>
          <Typography
            variant="h6"
            sx={{
              color: 'rgba(255, 255, 255, 0.95)',
              fontWeight: 600,
              marginBottom: 2,
              textAlign: 'center',
              fontFamily: '"Myriad Hebrew", "Monsal Gothic", sans-serif',
              letterSpacing: '0.5px',
            }}
          >
            Panel Configuration
          </Typography>

          {/* Only Status Type remains interactive; CR and RN are driven by flags */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: 4, 
            flexWrap: 'wrap', 
            alignItems: 'center',
            marginBottom: 2,
          }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
              <Typography
                variant="subtitle2"
                sx={{
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontWeight: 500,
                  fontFamily: '"Myriad Hebrew", "Monsal Gothic", sans-serif',
                  fontSize: '14px',
                }}
              >
                Status Type
              </Typography>
              <button
                onClick={() => {
                  setStatusMode(statusMode === 'bar' ? 'icons' : 'bar');
                }}
                style={{
                  background: 'rgba(25, 118, 210, 0.9)',
                  color: 'white',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
                  fontFamily: '"Myriad Hebrew", "Monsal Gothic", sans-serif',
                  minWidth: '120px',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(25, 118, 210, 1)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(25, 118, 210, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(25, 118, 210, 0.9)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.2)';
                }}
              >
                {statusMode === 'bar' ? 'Status Icons' : 'Status Bar'}
              </button>
            </Box>
          </Box>

          {/* Guest Services Icons only shown for Status Icons */}
          {statusMode === 'icons' && (
            <Box sx={{
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              paddingTop: 2,
              marginTop: 2,
            }}>
              <Typography
                variant="subtitle1"
                sx={{
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontWeight: 500,
                  marginBottom: 1,
                  textAlign: 'center',
                  fontFamily: '"Myriad Hebrew", "Monsal Gothic", sans-serif',
                  fontSize: '14px',
                }}
              >
                Guest Services Icons
              </Typography>

              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center',
                alignItems: 'center',
                gap: 3,
              }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography
                    sx={{
                      color: 'rgba(255, 255, 255, 0.7)',
                      fontSize: '12px',
                      marginBottom: '8px',
                      fontFamily: '"Myriad Hebrew", "Monsal Gothic", sans-serif',
                    }}
                  >
                    Left
                  </Typography>
                  <Box sx={{
                    display: 'flex',
                    gap: 1,
                  }}>
                    {leftIconOptions.map((opt) => (
                      <Box
                        key={opt}
                        onClick={() => setSelectedIcon1(opt)}
                        sx={{
                          width: '40px',
                          height: '40px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: selectedIcon1 === opt ? '2px solid rgba(255, 255, 255, 0.8)' : '1px solid rgba(255, 255, 255, 0.3)',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          background: selectedIcon1 === opt ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            border: '2px solid rgba(255, 255, 255, 0.6)',
                            background: 'rgba(255, 255, 255, 0.05)',
                          }
                        }}
                      >
                        <img 
                          src={icons[opt]?.src || ''} 
                          alt={opt} 
                          style={{
                            width: '24px',
                            height: '24px',
                            filter: getIconColorFilter(panelDesign.backgroundColor),
                          }}
                        />
                      </Box>
                    ))}
                  </Box>
                </Box>

                <Box sx={{ textAlign: 'center' }}>
                  <Typography
                    sx={{
                      color: 'rgba(255, 255, 255, 0.7)',
                      fontSize: '12px',
                      marginBottom: '8px',
                      fontFamily: '"Myriad Hebrew", "Monsal Gothic", sans-serif',
                    }}
                  >
                    Right
                  </Typography>
                  <Box sx={{
                    display: 'flex',
                    gap: 1,
                  }}>
                    {rightIconOptions.map((opt) => (
                      <Box
                        key={opt}
                        onClick={() => setSelectedIcon2(opt)}
                        sx={{
                          width: '40px',
                          height: '40px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: selectedIcon2 === opt ? '2px solid rgba(255, 255, 255, 0.8)' : '1px solid rgba(255, 255, 255, 0.3)',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          background: selectedIcon2 === opt ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            border: '2px solid rgba(255, 255, 255, 0.6)',
                            background: 'rgba(255, 255, 255, 0.05)',
                          }
                        }}
                      >
                        <img 
                          src={icons[opt]?.src || ''} 
                          alt={opt} 
                          style={{
                            width: '24px',
                            height: '24px',
                            filter: getIconColorFilter(panelDesign.backgroundColor),
                          }}
                        />
                      </Box>
                    ))}
                  </Box>
                </Box>
              </Box>
            </Box>
          )}
        </CheckboxContainer>
        
        {showPanels && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            style={{ width: '100%' }}
          >
          <Grid container spacing={4} justifyContent="center">
              {/* Panel Design Component - Left Side */}
              <Grid 
                item 
                xs={12} 
                md={5}
                component="div"
              >
                <div style={{
                  background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
                  padding: '28px',
                  borderRadius: '12px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.8)',
                  border: '1px solid #e9ecef',
                  fontFamily: '"Myriad Hebrew", "Monsal Gothic", sans-serif',
                  position: 'relative',
                  overflow: 'hidden',
                  height: 'fit-content',
                }}>
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '3px',
                    background: 'linear-gradient(90deg, #0056b3 0%, #007bff 50%, #0056b3 100%)',
                    borderRadius: '12px 12px 0 0',
                  }} />
                  <h3 style={{
                    margin: '0 0 24px 0',
                    fontSize: '20px',
                    fontWeight: '600',
                    color: '#1a1f2c',
                    textAlign: 'center',
                    letterSpacing: '0.5px',
                    textShadow: '0 1px 2px rgba(0,0,0,0.1)',
                  }}>
                    Panel Design
                  </h3>
                  {/* Background Color Section */}
                  <RALColorSelector
                    selectedColor={panelDesign.backgroundColor}
                    onColorSelect={(hex) => setPanelDesign({ ...panelDesign, backgroundColor: hex })}
                  />


                  
                  {/* Backbox Details Section */}
                  <div style={{
                    marginBottom: '28px',
                    background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
                    padding: '20px',
                    borderRadius: '10px',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.8)',
                    border: '1px solid #e9ecef',
                  }}>
                    <div style={{
                      fontWeight: '600',
                      marginBottom: '16px',
                      color: '#1a1f2c',
                      fontSize: '15px',
                      letterSpacing: '0.3px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}>
                      <div style={{
                        width: '4px',
                        height: '16px',
                        background: 'linear-gradient(180deg, #0056b3 0%, #007bff 100%)',
                        borderRadius: '2px',
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
                        padding: '12px 16px',
                        border: backboxError ? '2px solid #dc3545' : '1px solid #dee2e6',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontFamily: '"Myriad Hebrew", "Monsal Gothic", sans-serif',
                        background: '#ffffff',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.8)',
                        transition: 'all 0.2s ease',
                        outline: 'none',
                      }}
                    >
                      <option value="">Select a backbox...</option>
                      {getBackboxOptions('IDPG', { idpgConfig: { cardReader, roomNumber } }).map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                    {backboxError && (
                      <div style={{
                        color: '#dc3545',
                        fontSize: '12px',
                        marginTop: '8px',
                        fontWeight: '500',
                        fontFamily: '"Myriad Hebrew", "Monsal Gothic", sans-serif',
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
                        fontFamily: '"Myriad Hebrew", "Monsal Gothic", sans-serif',
                        backgroundColor: '#fff3cd',
                        padding: '10px',
                        borderRadius: '6px',
                        border: '1px solid #ffc107',
                      }}>
                        ⚠️ {NO_BACKBOX_DISCLAIMER}
                      </div>
                    )}
                  </div>
                  

                </div>
            </Grid>
              
              {/* Panel Template Component - Right Side */}
              <Grid 
                item 
                xs={12} 
                md={7}
                component="div"
                sx={{ marginTop: '50px' }}
              >
                <StyledPanel variants={itemVariants}>
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      p: 3,
                    }}
                  >
                    {/* Live Panel Preview */}
                    {(() => {
                      let panelHeight = "350px"; // Default
                      if (!cardReader && !roomNumber) panelHeight = "350px"; // Basic template
                      else if (!cardReader && roomNumber) panelHeight = "450px"; // Room Number only
                      else if (cardReader && !roomNumber) panelHeight = "500px"; // Card Reader only
                      else if (cardReader && roomNumber) panelHeight = "600px"; // Card Reader + Room Number
                      
                      return (
                    <div
                      style={{
                        width: "350px",
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
                        marginBottom: "20px",
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
                        {renderPanelTemplate()}
                      </div>
                    </div>
                      );
                    })()}
                    <PanelTitle 
                      variant="h5" 
                      className="panel-title"
                      sx={{
                        textAlign: 'center',
                        mb: 2,
                      }}
                    >
                      {getPanelName()}
                    </PanelTitle>
                    <Button
                      variant="text"
                      size="large"
                      className="panel-button"
                      sx={{
                        color: 'rgba(255, 255, 255, 0.7)',
                        textTransform: 'none',
                        fontWeight: 400,
                        letterSpacing: '0.5px',
                        opacity: 0,
                        transform: 'translateY(10px)',
                        transition: 'all 0.3s ease',
                        fontFamily: '"Myriad Hebrew", "Monsal Gothic", sans-serif',
                        '&:hover': {
                          color: 'rgba(255, 255, 255, 1)',
                          backgroundColor: 'transparent',
                        },
                      }}
                      disabled
                    >
                      Select
                    </Button>
                  </Box>
                </StyledPanel>
              </Grid>
            </Grid>
          </motion.div>
        )}
      {/* BOQ removed: QuantityDialog */}
      {/* Add Panel to Project and Back Button */}
      <Box sx={{ mt: 6, display: 'flex', justifyContent: 'center', gap: 2 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/panel-type')}
          sx={{ color: '#1a1f2c', borderColor: '#1a1f2c', background: 'white', '&:hover': { background: '#f0f0f0' } }}
        >
          Back
        </Button>
        <Button
          variant="contained"
          onClick={handleAddToCart}
          sx={{ backgroundColor: '#1a1f2c', color: '#ffffff', '&:hover': { backgroundColor: '#2c3e50' } }}
        >
          {panelAddedToProject ? 'Replace Design' : 'Add Panel to Project'}
        </Button>
      </Box>
    </Container>
    </Box>
  );
};

export default IDPGCustomizer; 
