import React, { useState, useEffect, useRef, useContext } from "react";
import { useCart } from "../../contexts/CartContext";
import "./Customizer.css";
import CartButton from "../../components/CartButton";
import { useNavigate } from "react-router-dom";
import logo2 from "../../assets/logo.png";
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
import { motion } from 'framer-motion';
import { ralColors, RALColor } from '../../data/ralColors';
import logo from "../../assets/logo.png";
import g18Icon from "../../assets/icons/G-GuestServices/G18.png";
import g1Icon from "../../assets/icons/G-GuestServices/G1.png";
import g2Icon from "../../assets/icons/G-GuestServices/G2.png";
import g3Icon from "../../assets/icons/G-GuestServices/G3.png";
import crIcon from "../../assets/icons/CR.png";
import allIcons from "../../assets/iconLibrary";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { ProjectContext } from '../../App';
import { getIconColorName } from '../../data/iconColors';

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
  fontFamily: '"Myriad Hebrew", "Monsal Gothic", sans-serif',
  fontSize: '16px',
  fontWeight: 500,
  letterSpacing: '0.5px',
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
  gridTemplateColumns: 'repeat(auto-fit, minmax(60px, 1fr))',
  gap: theme.spacing(2),
  marginTop: theme.spacing(2),
}));

const IconButton = styled(Box)(({ theme }) => ({
  width: '60px',
  height: '60px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: '2px solid rgba(255, 255, 255, 0.3)',
  borderRadius: '8px',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
  '&:hover': {
    border: '2px solid rgba(255, 255, 255, 0.6)',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  '&.selected': {
    border: '2px solid rgba(255, 255, 255, 0.8)',
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

const IDPGCustomizer = () => {
  const theme = useTheme();
  const [showPanels, setShowPanels] = useState(false);
  const [cardReader, setCardReader] = useState(false);
  const [roomNumber, setRoomNumber] = useState(false);
  const [statusIcons, setStatusIcons] = useState(false);
  const [roomNumberText, setRoomNumberText] = useState("101");
  const [selectedIcon1, setSelectedIcon1] = useState("G1");
  const [selectedIcon2, setSelectedIcon2] = useState("G2");
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
  const ICON_COLOR_FILTERS: { [key: string]: string } = {
    '#000000': 'brightness(0) saturate(100%)',
    '#FFFFFF': 'brightness(0) saturate(100%) invert(1)',
    '#808080': 'brightness(0) saturate(100%) invert(52%) sepia(0%) saturate(0%) hue-rotate(148deg) brightness(99%) contrast(91%)',
    '#FF0000': 'brightness(0) saturate(100%) invert(13%) sepia(93%) saturate(7464%) hue-rotate(0deg) brightness(113%) contrast(109%)',
    '#0000FF': 'brightness(0) saturate(100%) invert(8%) sepia(100%) saturate(6495%) hue-rotate(247deg) brightness(98%) contrast(141%)',
    '#008000': 'brightness(0) saturate(100%) invert(23%) sepia(98%) saturate(3025%) hue-rotate(101deg) brightness(94%) contrast(104%)',
  };
  const [iconHovered, setIconHovered] = useState<{ [index: number]: boolean }>({});
  const [icons, setIcons] = useState({});
  const [iconCategories, setIconCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { projectName } = useContext(ProjectContext);

  // Guest Services icons mapping
  const guestServicesIcons = {
    G1: g1Icon,
    G2: g2Icon,
    G3: g3Icon,
    G18: g18Icon,
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowPanels(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    import("../../assets/iconLibrary").then((module) => {
      setIcons(module.default);
      const filteredCategories = module.iconCategories.filter(cat => cat !== 'PIR');
      setIconCategories(filteredCategories);
      if (filteredCategories.length > 0) {
        setSelectedCategory(filteredCategories[0]);
      }
    });
  }, []);

  // Function to get panel name based on checkbox states
  const getPanelName = () => {
    let name = "IDPG";
    const features = [];
    if (cardReader) features.push("CR");
    if (roomNumber) features.push("RN");
    if (statusIcons) features.push("SI");
    if (features.length > 0) {
      name += ` ${features.join(" ")}`;
    }
    return name;
  };

  // Render panel based on checkbox combinations
  const renderPanelTemplate = () => {
    // No boxes checked - Square template
    if (!cardReader && !roomNumber && !statusIcons) {
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
            border: `2px solid ${panelDesign.iconColor}`,
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
                width: "25px",
                height: "25px",
                filter: panelDesign.iconColor === '#000000' ? 'none' : 'brightness(0) invert(1)',
              }}
            />
          </div>
        </div>
      );
    }

    // Room number only - Rectangle vertical template
    if (!cardReader && roomNumber && !statusIcons) {
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
                },
                '& .MuiInputBase-input::placeholder': {
                  color: 'rgba(255, 255, 255, 0.5)',
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
                }
              }}
            />
          </div>
          {/* Middle bar */}
          <div style={{
            width: "100%",
            height: "8px",
            background: "transparent",
            border: `2px solid ${panelDesign.iconColor}`,
            borderRadius: "4px",
            margin: "10px 0",
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
                width: "25px",
                height: "25px",
                filter: panelDesign.iconColor === '#000000' ? 'none' : 'brightness(0) invert(1)',
              }}
            />
          </div>
        </div>
      );
    }

    // Card Reader only - Rectangle vertical template
    if (cardReader && !roomNumber && !statusIcons) {
      return (
        <div style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          padding: "15px",
        }}>
          {/* Middle bar at top */}
          <div style={{
            width: "100%",
            height: "8px",
            background: "transparent",
            border: `2px solid ${panelDesign.iconColor}`,
            borderRadius: "4px",
            marginBottom: "20px",
          }} />
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
                width: "35px",
                height: "35px",
                filter: panelDesign.iconColor === '#000000' ? 'none' : 'brightness(0) invert(1)',
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
                width: "40px",
                height: "30px",
                filter: panelDesign.iconColor === '#000000' ? 'brightness(0)' : 
                       panelDesign.iconColor === '#FFFFFF' ? 'none' :
                       `brightness(0) saturate(100%) invert(1) sepia(1) saturate(10000%) hue-rotate(${getHueRotation(panelDesign.iconColor)}deg)`,
              }}
            />
          </div>
        </div>
      );
    }

    // Card Reader & Room Number - Rectangle vertical template
    if (cardReader && roomNumber && !statusIcons) {
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
                },
                '& .MuiInputBase-input::placeholder': {
                  color: 'rgba(255, 255, 255, 0.5)',
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
                }
              }}
            />
          </div>
          {/* Middle bar right below the number */}
          <div style={{
            width: "100%",
            height: "8px",
            background: "transparent",
            border: `2px solid ${panelDesign.iconColor}`,
            borderRadius: "4px",
            marginBottom: "20px",
          }} />
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
                width: "35px",
                height: "35px",
                filter: panelDesign.iconColor === '#000000' ? 'none' : 'brightness(0) invert(1)',
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
                width: "40px",
                height: "30px",
                filter: panelDesign.iconColor === '#000000' ? 'brightness(0)' : 
                       panelDesign.iconColor === '#FFFFFF' ? 'none' :
                       `brightness(0) saturate(100%) invert(1) sepia(1) saturate(10000%) hue-rotate(${getHueRotation(panelDesign.iconColor)}deg)`,
              }}
            />
          </div>
        </div>
      );
    }

    // Templates with Status Icons - Replace bar with two icon fields
    if (statusIcons) {
      return (
        <div style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          padding: "15px",
        }}>
          {/* Room number at top (if enabled) */}
          {roomNumber && (
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
                  },
                  '& .MuiInputBase-input::placeholder': {
                    color: 'rgba(255, 255, 255, 0.5)',
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
                  }
                }}
              />
            </div>
          )}
          
          {/* Two icon fields replacing the bar */}
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
                  width: "35px",
                  height: "35px",
                  filter: panelDesign.iconColor === '#000000' ? 'none' : 'brightness(0) invert(1)',
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
                src={guestServicesIcons[selectedIcon2 as keyof typeof guestServicesIcons]} 
                alt="Icon 2" 
                style={{
                  width: "35px",
                  height: "35px",
                  filter: panelDesign.iconColor === '#000000' ? 'none' : 'brightness(0) invert(1)',
                }}
              />
            </div>
          </div>

          {/* CR icon in bottom center (if card reader is enabled) */}
          {cardReader && (
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
                  width: "40px",
                  height: "30px",
                  filter: panelDesign.iconColor === '#000000' ? 'brightness(0)' : 
                         panelDesign.iconColor === '#FFFFFF' ? 'none' :
                         `brightness(0) saturate(100%) invert(1) sepia(1) saturate(10000%) hue-rotate(${getHueRotation(panelDesign.iconColor)}deg)`,
                }}
              />
            </div>
          )}

          {/* G18 icon in bottom center (if no card reader) */}
          {!cardReader && (
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
                  width: "25px",
                  height: "25px",
                  filter: panelDesign.iconColor === '#000000' ? 'none' : 'brightness(0) invert(1)',
                }}
              />
            </div>
          )}
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
  const handleAddToCart = (): void => {
    // You can add validation here if needed
    const design = {
      type: 'IDPG',
      icons: [], // Add icon logic if needed
      quantity: 1,
      panelDesign: { ...panelDesign, backbox, extraComments },
    };
    addToCart(design);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #718096 0%, #a0aec0 100%)',
        py: 8,
      }}
    >
      {/* Project Name at top center */}
      {projectName && (
        <Box sx={{ 
          position: 'absolute', 
          top: 20, 
          left: 0, 
          right: 0, 
          display: 'flex', 
          justifyContent: 'center', 
          pointerEvents: 'none', 
          zIndex: 10 
        }}>
          <Typography sx={{
            fontSize: 14,
            color: '#ffffff',
            fontWeight: 400,
            letterSpacing: 0.5,
            fontFamily: '"Myriad Hebrew", "Monsal Gothic", sans-serif',
            opacity: 0.8,
          }}>
            {projectName}
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
        
        {/* Checkbox Options */}
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
            Select Panel Features
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 4, flexWrap: 'wrap' }}>
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
            <StyledFormControlLabel
              control={
                <StyledCheckbox
                  checked={statusIcons}
                  onChange={(e) => setStatusIcons(e.target.checked)}
                />
              }
              label="Status Icons"
            />
          </Box>
        </CheckboxContainer>

        {/* Guest Services Icon Selector */}
        {statusIcons && (
          <IconSelector>
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
              Select Guest Services Icons
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Typography
                  variant="subtitle1"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.9)',
                    fontWeight: 500,
                    marginBottom: 2,
                    textAlign: 'center',
                    fontFamily: '"Myriad Hebrew", "Monsal Gothic", sans-serif',
                  }}
                >
                  Left Icon
                </Typography>
                <IconGrid>
                  {Object.entries(guestServicesIcons).map(([key, icon]) => (
                    <IconButton
                      key={key}
                      className={selectedIcon1 === key ? 'selected' : ''}
                      onClick={() => setSelectedIcon1(key)}
                    >
                      <img 
                        src={icon} 
                        alt={key} 
                        style={{
                          width: "40px",
                          height: "40px",
                          filter: panelDesign.iconColor === '#000000' ? 'none' : 'brightness(0) invert(1)',
                        }}
                      />
                    </IconButton>
                  ))}
                </IconGrid>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography
                  variant="subtitle1"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.9)',
                    fontWeight: 500,
                    marginBottom: 2,
                    textAlign: 'center',
                    fontFamily: '"Myriad Hebrew", "Monsal Gothic", sans-serif',
                  }}
                >
                  Right Icon
                </Typography>
                <IconGrid>
                  {Object.entries(guestServicesIcons).map(([key, icon]) => (
                    <IconButton
                      key={key}
                      className={selectedIcon2 === key ? 'selected' : ''}
                      onClick={() => setSelectedIcon2(key)}
                    >
                      <img 
                        src={icon} 
                        alt={key} 
                        style={{
                          width: "40px",
                          height: "40px",
                          filter: panelDesign.iconColor === '#000000' ? 'none' : 'brightness(0) invert(1)',
                        }}
                      />
                    </IconButton>
                  ))}
                </IconGrid>
              </Grid>
            </Grid>
          </IconSelector>
        )}
        
        {/* Panel Design Controls */}
        <DesignContainer>
          <Typography
            variant="h6"
            sx={{
              color: 'rgba(255, 255, 255, 0.95)',
              fontWeight: 600,
              marginBottom: 3,
              textAlign: 'center',
              fontFamily: '"Myriad Hebrew", "Monsal Gothic", sans-serif',
              letterSpacing: '0.5px',
            }}
          >
            Panel Design
          </Typography>
          <Grid container spacing={4} justifyContent="center">
            {/* Background Color */}
            <Grid item xs={12} sm={4}>
              <Typography
                variant="subtitle1"
                sx={{
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontWeight: 500,
                  marginBottom: 2,
                  textAlign: 'center',
                  fontFamily: '"Myriad Hebrew", "Monsal Gothic", sans-serif',
                }}
              >
                Background Color
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
                {ralColors.slice(0, 6).map((color) => (
                  <ColorButton
                    key={color.code}
                    onClick={() => setPanelDesign(prev => ({ ...prev, backgroundColor: color.hex }))}
                    sx={{
                      background: color.hex,
                      border: panelDesign.backgroundColor === color.hex ? '3px solid rgba(255, 255, 255, 0.8)' : '3px solid rgba(255, 255, 255, 0.3)',
                      transform: panelDesign.backgroundColor === color.hex ? 'scale(1.1)' : 'scale(1)',
                    }}
                  />
                ))}
              </Box>
            </Grid>
            {/* Icon Color */}
            <Grid item xs={12} sm={4}>
              <Typography
                variant="subtitle1"
                sx={{
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontWeight: 500,
                  marginBottom: 2,
                  textAlign: 'center',
                  fontFamily: '"Myriad Hebrew", "Monsal Gothic", sans-serif',
                }}
              >
                Icon Color
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
                {Object.entries(ICON_COLOR_FILTERS).map(([color]) => (
                  <ColorButton
                    key={color}
                    onClick={() => setPanelDesign(prev => ({ ...prev, iconColor: color }))}
                    sx={{
                      background: color,
                      border: panelDesign.iconColor === color ? '3px solid rgba(255, 255, 255, 0.8)' : '3px solid rgba(255, 255, 255, 0.3)',
                      transform: panelDesign.iconColor === color ? 'scale(1.1)' : 'scale(1)',
                    }}
                  />
                ))}
              </Box>
            </Grid>
            {/* Text Color */}
            <Grid item xs={12} sm={4}>
              <Typography
                variant="subtitle1"
                sx={{
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontWeight: 500,
                  marginBottom: 2,
                  textAlign: 'center',
                  fontFamily: '"Myriad Hebrew", "Monsal Gothic", sans-serif',
                }}
              >
                Text Color
              </Typography>
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
            </Grid>
          </Grid>
        </DesignContainer>
        
        {showPanels && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            style={{ width: '100%' }}
          >
            <Grid container spacing={4} justifyContent="center">
              <Grid 
                item 
                xs={12} 
                sm={6} 
                md={4}
                component="div"
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
                    <div
                      style={{
                        width: "350px",
                        height: roomNumber || cardReader || statusIcons ? "450px" : "350px", // Adjust height based on template
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
      </Container>
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
    </Box>
  );
};

export default IDPGCustomizer; 