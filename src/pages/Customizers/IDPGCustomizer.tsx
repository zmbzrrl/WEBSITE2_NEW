import React, { useState, useEffect, useRef, useContext } from "react";
import { useCart } from "../../contexts/CartContext";
import "./Customizer.css";

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

const IDPGCustomizer = () => {
  const theme = useTheme();
  const location = useLocation();
  const [showPanels, setShowPanels] = useState(false);
  const [cardReader, setCardReader] = useState(false);
  const [roomNumber, setRoomNumber] = useState(false);
  const [statusMode, setStatusMode] = useState<'bar' | 'icons'>('bar');
  const [roomNumberText, setRoomNumberText] = useState("");
  const [selectedIcon1, setSelectedIcon1] = useState("G1");
  const [selectedIcon2, setSelectedIcon2] = useState("G2");
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

  // Guest Services icons mapping
  const guestServicesIcons = {
    G1: g1Icon,
    G2: g2Icon,
    G3: g3Icon,
    G18: g18Icon,
  };

  // Only allow G1 and G2 for left icon
  const leftIconOptions = ['G1', 'G2'];

  // Always use G3 for right icon
  const rightIcon = 'G3';

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
          setSelectedIcon1(config.selectedIcon1 || 'G1');
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
                  src={guestServicesIcons[selectedIcon1 as keyof typeof guestServicesIcons]} 
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
                  src={guestServicesIcons[rightIcon]} 
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
            width: "100%",
            height: "8px",
            background: "transparent",
            border: `2px solid ${getIconColorFilter(panelDesign.backgroundColor) === 'brightness(0) saturate(100%) invert(1)' ? '#FFFFFF' : '#808080'}`,
            borderRadius: "4px",
            margin: "auto 0",
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
                  color: panelDesign.textColor,
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
                  color: panelDesign.textColor,
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
                  color: panelDesign.textColor,
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
                  src={guestServicesIcons[selectedIcon1 as keyof typeof guestServicesIcons]} 
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
                  src={guestServicesIcons[rightIcon]} 
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
            width: "100%",
            height: "8px",
            background: "transparent",
            border: `2px solid ${panelDesign.iconColor}`,
            borderRadius: "4px",
            margin: "10px 0",
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
                  src={guestServicesIcons[selectedIcon1 as keyof typeof guestServicesIcons]} 
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
                  src={guestServicesIcons[rightIcon]} 
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
            width: "100%",
            height: "8px",
            background: "transparent",
            border: `2px solid ${panelDesign.iconColor}`,
            borderRadius: "4px",
            marginBottom: "20px",
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
                    color: panelDesign.textColor,
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
                    color: panelDesign.textColor,
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
                    color: panelDesign.textColor,
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
                src={guestServicesIcons[selectedIcon1 as keyof typeof guestServicesIcons]} 
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
                src={guestServicesIcons[rightIcon]} 
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
              width: "100%",
              height: "8px",
              background: "transparent",
              border: `2px solid ${panelDesign.iconColor}`,
              borderRadius: "4px",
              marginBottom: "20px",
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

    // Default fallback for other combinations
    return (
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100%",
        color: panelDesign.textColor,
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
    // Check if backbox details are provided
    if (!backbox.trim()) {
      setBackboxError('Please provide backbox details before adding the panel to your project.');
      return;
    }

    const design = {
      type: 'IDPG',
      icons: [], // Add icon logic if needed
      quantity: 1,
      panelDesign: { 
        ...panelDesign, 
        backbox, 
        extraComments,
        // Save IDPG-specific configuration
        idpgConfig: {
          cardReader,
          roomNumber,
          statusMode,
          selectedIcon1,
          roomNumberText,
        }
      },
    };

    if (isEditMode && editPanelIndex !== undefined) {
      // Update existing panel
      updatePanel(editPanelIndex, design);
    navigate('/proj-panels'); // Return to project panels after updating
    } else {
      // Add new panel with quantity prompt constrained by BOQ remaining
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

      // Auto-populate panel name and quantity
      const selectedDesignName = location.state?.selectedDesignName;
      const selectedDesignQuantity = location.state?.selectedDesignQuantity || 1;
      const enhancedDesign = {
        ...design,
        panelName: design.panelName || selectedDesignName || getPanelTypeLabel(design.type),
        quantity: selectedDesignQuantity // Use BOQ allocated quantity
      };
      loadProjectPanels([enhancedDesign as any]);
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
          
          {/* Panel Features Section */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: 4, 
            flexWrap: 'wrap', 
            alignItems: 'center',
            marginBottom: 2,
          }}>
            <StyledFormControlLabel
              control={
                <StyledCheckbox
                  checked={cardReader}
                  onChange={(e) => setCardReader(e.target.checked)}
                />
              }
              label="Card Reader"
            />
            <StyledFormControlLabel
              control={
                <StyledCheckbox
                  checked={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.checked)}
                />
              }
              label="Room Number"
            />
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
          
          {/* Guest Services Icons Section - Only show when Status Icons is selected */}
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
              
              {/* Minimal Icon Selector */}
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center',
                alignItems: 'center',
                gap: 3,
              }}>
                
                {/* Left Icon */}
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
                          src={guestServicesIcons[opt as keyof typeof guestServicesIcons]} 
                          alt={opt} 
                        style={{
                            width: "24px",
                            height: "24px",
                            filter: getIconColorFilter(panelDesign.backgroundColor),
                          }}
                        />
                      </Box>
                ))}
              </Box>
                </Box>
                
                {/* Right Icon */}
                <Box sx={{ textAlign: 'center' }}>
          <Typography
            sx={{
                      color: 'rgba(255, 255, 255, 0.5)',
                      fontSize: '12px',
                      marginBottom: '8px',
              fontFamily: '"Myriad Hebrew", "Monsal Gothic", sans-serif',
            }}
          >
                    Right (G3)
          </Typography>
                  <Box sx={{
                    width: '40px',
                  height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '6px',
                    background: 'rgba(255, 255, 255, 0.02)',
                    opacity: 0.7,
                  }}>
                    <img 
                      src={guestServicesIcons[rightIcon]} 
                      alt={rightIcon} 
                      style={{
                        width: "24px",
                        height: "24px",
                        filter: getIconColorFilter(panelDesign.backgroundColor),
                      }}
                    />
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
                        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.04)',
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
                              boxShadow: '0 2px 4px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.3)',
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
                      <option value="Backbox 1">Backbox 1</option>
                      <option value="Backbox 2">Backbox 2</option>
                      <option value="Backbox 3">Backbox 3</option>
                      <option value="Backbox 4">Backbox 4</option>
                      <option value="Backbox 5">Backbox 5</option>
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
                        transform: "perspective(1000px) rotateX(5deg)",
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
          Add Panel to Project
        </Button>
      </Box>
    </Container>
    </Box>
  );
};

export default IDPGCustomizer; 
