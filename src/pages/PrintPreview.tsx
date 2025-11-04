import React, { useEffect, useState, useContext, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Button, Typography, Paper, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { styled } from '@mui/material/styles';
import PrintIcon from '@mui/icons-material/Print';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import InfoIcon from '@mui/icons-material/Info';
import PanelPreview from '../components/PanelPreview';
import logoImage from '../assets/logo.png';
import { getIconColorName } from '../data/iconColors';
import { ralColors } from '../data/ralColors';
import { getBackboxOptions } from '../utils/backboxOptions';
import page2Png from '../assets/pdf/2.png';
import page3Png from '../assets/pdf/3.png';
import page4Png from '../assets/pdf/4.png';
import page13Png from '../assets/pdf/13.png';
import { ProjectContext } from '../App';

// Function to determine icon color based on background (similar to customizers)
const getIconColorFromBackground = (backgroundColor: string): string => {
  if (!backgroundColor) return 'N/A';
  
  // Convert hex to RGB for brightness calculation
  const hex = backgroundColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  // Calculate brightness (0-255)
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  
  // Use white for dark backgrounds, grey for light backgrounds
  if (brightness < 150) {
    // Dark background - use white icons
    return 'White';
  } else {
    // Light background - use grey icons
    return 'Grey';
  }
};

// Map hex color to RAL code string if available
const hexToRal = (hex: string): string => {
  if (!hex) return '';
  const normalized = hex.toLowerCase();
  const match = ralColors.find((c: any) => (c.hex || '').toLowerCase() === normalized);
  if (match) {
    // Format as RAL code (e.g., RAL 9003)
    const code = match.code || match.name || normalized;
    return `RAL ${code}`;
  }
  return hex; // fallback to hex string
};

// Helper function to convert mm to px (same as PanelPreview)
const convertMmToPx = (value: string): number => {
  if (value.endsWith('mm')) {
    const mm = parseFloat(value);
    return Math.round(mm * (350 / 95)); // 95mm = 350px
  }
  return parseFloat(value);
};

// Helper function to get actual panel dimensions in pixels
const getPanelDimensions = (config: PanelConfig) => {
  const { panelDesign, type } = config;
  
  // Default dimensions for each panel type
  const defaultDimensions = {
    'SP': { width: 95, height: 95 }, // mm
    'DPH': { width: 640, height: 320 }, // px (already converted)
    'DPV': { width: 320, height: 640 }, // px (already converted)
    'IDPG': { width: 350, height: 350 }, // px (default square)
    'TAG': { width: 95, height: 95 }, // mm
    'X1H': { width: 130, height: 95 }, // mm
    'X1V': { width: 95, height: 130 }, // mm
    'X2H': { width: 224, height: 95 }, // mm
    'X2V': { width: 95, height: 224 }, // mm
  };
  
  let dimensions = defaultDimensions[type as keyof typeof defaultDimensions] || defaultDimensions['SP'];
  
  // Handle SP panel dimensions based on configuration
  if (type === 'SP' && panelDesign?.spConfig?.dimension) {
    const { dimension } = panelDesign.spConfig;
    if (dimension === 'wide') {
      dimensions = { width: 130, height: 95 };
    } else if (dimension === 'tall') {
      dimensions = { width: 95, height: 130 };
    }
  }
  
  // Handle TAG panel dimensions based on configuration
  if (type === 'TAG' && (panelDesign as any)?.tagConfig?.dimension) {
    const { dimension } = (panelDesign as any).tagConfig;
    if (dimension === 'wide') {
      dimensions = { width: 130, height: 95 };
    } else if (dimension === 'tall') {
      dimensions = { width: 95, height: 130 };
    }
  }
  
  // Handle IDPG panel dimensions based on configuration
  if (type === 'IDPG' && panelDesign?.idpgConfig) {
    const { cardReader, roomNumber } = panelDesign.idpgConfig;
    
    if (!cardReader && !roomNumber) {
      dimensions = { width: 350, height: 350 };
    } else if (!cardReader && roomNumber) {
      dimensions = { width: 350, height: 450 };
    } else if (cardReader && !roomNumber) {
      dimensions = { width: 350, height: 500 };
    } else if (cardReader && roomNumber) {
      dimensions = { width: 350, height: 600 };
    }
  }
  
  // Convert mm to px if needed
  const widthPx = type === 'DPH' || type === 'DPV' || type === 'IDPG' ? 
    dimensions.width : convertMmToPx(`${dimensions.width}mm`);
  const heightPx = type === 'DPH' || type === 'DPV' || type === 'IDPG' ? 
    dimensions.height : convertMmToPx(`${dimensions.height}mm`);
  
  return { width: widthPx, height: heightPx };
};

// Helper function to get panel details
const getPanelDetails = (config: PanelConfig) => {
  const { panelDesign, type, name } = config;
  
  // Get background color with RAL code
  const backgroundColor = panelDesign?.backgroundColor || '';
  const backgroundRal = hexToRal(backgroundColor);
  
  // Get icon color
  const iconColor = panelDesign?.iconColor || '';
  const iconColorName = iconColor ? getIconColorFromBackground(iconColor) : 'N/A';
  
  // Get plastic housing color (derived from icon color)
  const plasticColor = iconColorName === 'White' ? 'White' : 'Black';
  
  // Get fonts
  const fonts = panelDesign?.fonts || 'Default';
  
  // Get panel type
  const panelType = type || 'SP';
  
  // Get backbox based on panel type and configuration
  const backboxOptions = getBackboxOptions(panelType, panelDesign);
  const backbox = backboxOptions.length > 0 ? backboxOptions[0].label : 'Standard';
  
  return {
    panelName: name || 'Panel',
    backgroundColor: backgroundRal || backgroundColor || 'N/A',
    fonts: fonts,
    backlight: 'White LED',
    iconColor: iconColorName,
    plasticColor: plasticColor,
    panelType: panelType,
    backbox: backbox
  };
};

// Styled components for print-optimized layout
const PrintContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  padding: 0, // Remove padding to let page margins show
  backgroundColor: 'white',
  margin: 0,
  border: 'none',
  
  // Print-specific styles
  '@media print': {
    padding: 0,
    margin: 0,
    /* Remove forced white background to preserve original colors */
    minHeight: 'auto',
    height: 'auto',
    border: 'none',
    outline: 'none',
    // Hide browser default headers and footers
    '@page': {
      margin: 0, // Remove all margins
      size: 'A4',
    },
    // Additional print styles to remove browser headers/footers
    '&': {
      // These styles help remove browser default headers/footers
      '-webkit-print-color-adjust': 'exact',
      'color-adjust': 'exact',
    }
  }
}));

const PrintHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.spacing(3),
  padding: theme.spacing(2),
  backgroundColor: 'white',
  borderRadius: theme.spacing(1),
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  
  '@media print': {
    display: 'none', // Hide header in print
  }
}));

const PrintContent = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(4),
  alignItems: 'center',
  
  '@media print': {
    gap: 0,
    alignItems: 'flex-start',
    width: '100%'
  }
}));

// Compact header component
const CompactHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-start',
  padding: '5mm 20mm',
  marginBottom: theme.spacing(1),
  
  '@media print': {
    padding: '3mm 15mm',
    marginBottom: '2mm',
  }
}));

const LogoSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  flexShrink: 0, // Prevent logo from shrinking
}));

const Logo = styled('img')(({ theme }) => ({
  width: '80px',
  height: '40px',
  objectFit: 'contain',
  
  '@media print': {
    width: '70px',
    height: '35px',
  }
}));

const ProjectInfoSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
  marginLeft: theme.spacing(4),
}));

const ProjectRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(4),
  fontSize: '11px',
  
  '@media print': {
    fontSize: '10px',
    gap: theme.spacing(3),
  }
}));

const ProjectLabel = styled(Typography)(({ theme }) => ({
  fontWeight: 'bold',
  color: '#666',
  fontSize: 'inherit',
  minWidth: '70px',
  textAlign: 'left',
}));

const ProjectValue = styled(Typography)(({ theme }) => ({
  color: '#333',
  fontSize: 'inherit',
  minWidth: '70px',
  textAlign: 'left',
}));

// Cover page component
const CoverPage = styled(Paper)(({ theme }) => ({
  width: '250mm', // Increased width to match other pages
  minHeight: '297mm', // A4 height
  padding: '30mm', // Larger margins for cover
  margin: '12.7mm auto 20px auto', // 0.5 inch top margin, auto left/right, 20px bottom
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: '#f5f5f5', // Light grey background
  boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
  textAlign: 'center',
  border: 'none',
  
  '@media print': {
    boxShadow: 'none',
    margin: '0',
    padding: '0', // Remove padding since @page handles margins
    pageBreakInside: 'avoid',
    breakInside: 'avoid',
    width: '100%', // Fill entire page width
    height: '100%', // Fill entire page height
    minHeight: '100%', // Ensure it fills the page
    backgroundColor: 'white', // White background for print
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    border: 'none',
    outline: 'none'
  }
}));

const CoverTitle = styled(Typography)(({ theme }) => ({
  fontSize: '2.5rem',
  fontWeight: 'bold',
  color: '#1b92d1',
  marginBottom: theme.spacing(3),
  fontFamily: '"Myriad Hebrew", "Monsal Gothic", Arial, sans-serif',
  
  '@media print': {
    fontSize: '2rem',
  }
}));

const CoverSubtitle = styled(Typography)(({ theme }) => ({
  fontSize: '1.2rem',
  color: '#666',
  marginBottom: theme.spacing(4),
  fontFamily: '"Myriad Hebrew", "Monsal Gothic", Arial, sans-serif',
  
  '@media print': {
    fontSize: '1rem',
  }
}));

const ProjectInfo = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(4),
  padding: theme.spacing(3),
  border: '2px solid #e0e0e0',
  borderRadius: theme.spacing(1),
  backgroundColor: 'white', // White background for info box to stand out
  width: '100%',
  maxWidth: '400px',
  
  '@media print': {
    padding: theme.spacing(2),
  }
}));

const CoverFooter = styled(Box)(({ theme }) => ({
  marginTop: 'auto',
  paddingTop: theme.spacing(4),
  borderTop: '1px solid #e0e0e0',
  fontSize: '0.9rem',
  color: '#666',
  
  '@media print': {
    fontSize: '0.8rem',
  }
}));

// A4 page container - fits 2 panels per page
const A4Page = styled(Paper)(({ theme }) => ({
  width: '250mm', // Increased width for better content fitting
  minHeight: '297mm', // A4 height
  padding: '0', // Remove padding to accommodate header
  margin: '12.7mm auto 20px auto', // 0.5 inch top margin, auto left/right, 20px bottom
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: '#f5f5f5', // Light grey background
  boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
  border: 'none',
  
  '@media print': {
    boxShadow: 'none',
    margin: '0',
    padding: '0', // Remove padding since @page handles margins
    pageBreakAfter: 'always',
    pageBreakInside: 'avoid',
    breakInside: 'avoid',
    width: '100%', // Fill entire page width
    height: '100vh', // Fill entire page height
    minHeight: '100vh', // Ensure it fills the page
    backgroundColor: 'white', // White background for print
    justifyContent: 'flex-start',
    border: 'none',
    outline: 'none'
  }
}));

// Grid container for 2 panels per page (stacked vertically)
const PanelGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: '1fr', // single column (stacked)
  gap: '10mm',
  flex: 1,
  alignItems: 'start',
  padding: '0 15mm 12.7mm 15mm', // Increased side padding to match wider page
  '@media print': {
    gap: '5mm',
    padding: '12.7mm 15mm', // Increased side padding for wider page
    height: 'auto',
    minHeight: 'auto',
    alignSelf: 'flex-start'
  }
}));

// Individual panel container
const PanelContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row', // Changed to row to accommodate panel and details side by side
  alignItems: 'flex-start',
  justifyContent: 'flex-start', // Changed to flex-start for better space utilization
  minHeight: '100mm', // Reduced minimum height
  maxHeight: '200mm', // Added maximum height constraint
  padding: '3mm', // Reduced padding
  gap: '15mm', // Increased gap to better utilize wider page
  
  '@media print': {
    padding: '2mm',
    minHeight: '60mm',
    maxHeight: 'none', // Remove max height constraint for print
    height: '100%',
    gap: '8mm' // Reduced gap for print to accommodate vertical layout for extended panels
  }
}));

// Panel details container
const PanelDetailsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  justifyContent: 'flex-start',
  minWidth: '120mm',
  maxWidth: '150mm',
  padding: '5mm',
  marginLeft: '20mm',
  
  '@media print': {
    padding: '3mm',
    minWidth: '100mm',
    maxWidth: '120mm',
    marginLeft: '15mm'
  }
}));

// Panel visual container
const PanelVisualContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  flex: 1,
  minWidth: '80mm',
  
  '@media print': {
    minWidth: '70mm'
  }
}));

// Detail row component
const DetailRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  marginBottom: theme.spacing(2),
  width: '100%',
  
  '@media print': {
    marginBottom: '8px'
  }
}));

const DetailLabel = styled(Typography)(({ theme }) => ({
  fontSize: '0.7rem',
  fontWeight: 'bold',
  color: '#666',
  marginBottom: '1px',
  fontFamily: '"Myriad Hebrew", "Monsal Gothic", Arial, sans-serif',
  
  '@media print': {
    fontSize: '0.6rem'
  }
}));

const DetailValue = styled(Typography)(({ theme }) => ({
  fontSize: '0.8rem',
  color: '#333',
  fontFamily: '"Myriad Hebrew", "Monsal Gothic", Arial, sans-serif',
  
  '@media print': {
    fontSize: '0.7rem'
  }
}));

// Signature section component
const SignatureSection = styled(Box)(({ theme }) => ({
  marginTop: 'auto',
  paddingTop: theme.spacing(3),
  paddingLeft: '12.7mm', // 0.5 inch left margin
  paddingRight: '12.7mm', // 0.5 inch right margin
  paddingBottom: '12.7mm', // 0.5 inch bottom margin
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-end',
  
  '@media print': {
    paddingTop: theme.spacing(2),
    paddingLeft: '10mm', // Slightly less for print
    paddingRight: '10mm', // Slightly less for print
    paddingBottom: '10mm', // Slightly less for print
  }
}));

const SignatureBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  minHeight: '60mm',
  width: '200px',
  
  '@media print': {
    minHeight: '50mm',
    width: '180px',
  }
}));

const SignatureLine = styled(Box)(({ theme }) => ({
  width: '100%',
  height: '1px',
  backgroundColor: '#000',
  marginTop: 'auto',
  marginBottom: theme.spacing(1),
  
  '@media print': {
    marginBottom: '4px',
  }
}));

const BrandingFooter = styled(Box)(({ theme }) => ({
  textAlign: 'right',
  marginTop: 'auto',
  paddingTop: theme.spacing(2),
  fontSize: '10px',
  color: '#666',
  alignSelf: 'flex-end',
  
  '@media print': {
    marginTop: 'auto',
    paddingTop: '10px',
  }
}));

const ActionButtons = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(2),
  
  '@media print': {
    display: 'none', // Hide buttons in print
  }
}));

// Text sections for static pages
const TextSection = styled(Box)(({ theme }) => ({
  position: 'absolute',
  padding: '4mm',
  fontSize: '0.7rem',
  lineHeight: '1.3',
  fontFamily: '"Myriad Hebrew", "Monsal Gothic", Arial, sans-serif',
  color: '#333',
  
  '@media print': {
    fontSize: '0.6rem',
    padding: '3mm',
  }
}));

const TopLeftText = styled(TextSection)(({ theme }) => ({
  top: '70px',
  left: '30px',
  width: '45%',
  maxWidth: '90mm',
}));

const TopRightText = styled(TextSection)(({ theme }) => ({
  top: '70px',
  right: '0',
  width: '45%',
  maxWidth: '90mm',
}));

const BottomRightText = styled(TextSection)(({ theme }) => ({
  bottom: '100px',
  right: '0',
  width: '45%',
  maxWidth: '90mm',
}));

const TextTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 'bold',
  fontSize: '0.8rem',
  marginBottom: '4mm',
  color: '#1b92d1',
  fontFamily: '"Myriad Hebrew", "Monsal Gothic", Arial, sans-serif',
  
  '@media print': {
    fontSize: '0.7rem',
    marginBottom: '3mm',
  }
}));

const TextList = styled(Box)(({ theme }) => ({
  '& ul': {
    margin: 0,
    paddingLeft: '4mm',
  },
  '& li': {
    marginBottom: '2mm',
    fontSize: 'inherit',
    fontFamily: 'inherit',
  },
  '& li:last-child': {
    marginBottom: 0,
  }
}));

interface PanelConfig {
  icons: Array<{
    src: string;
    label: string;
    position: number;
    text: string;
    category?: string;
    id?: string;
    iconId?: string;
  }>;
  panelDesign: {
    backgroundColor: string;
    iconColor: string;
    textColor: string;
    fontSize: string;
    iconSize?: string;
    fonts?: string;
    isLayoutReversed?: boolean;
    swapSides?: boolean;
    mirrorGrid?: boolean;
    swapUpDown?: boolean;
    mirrorVertical?: boolean;
    idpgConfig?: {
      cardReader: boolean;
      roomNumber: boolean;
      statusMode: 'bar' | 'icons';
      selectedIcon1: string;
      roomNumberText: string;
    };
    spConfig?: {
      dimension: 'standard' | 'wide' | 'tall';
    };
    tagConfig?: {
      dimension: 'standard' | 'wide' | 'tall';
    };
  };
  iconTexts?: { [key: number]: string };
  type?: string;
  name?: string;
}

interface PrintPreviewProps {
  // Props can be passed via router state or props
}

const PrintPreview: React.FC<PrintPreviewProps> = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { projectName: contextProjectName, projectCode: contextProjectCode } = useContext(ProjectContext);
  const [panelConfigs, setPanelConfigs] = useState<PanelConfig[]>([]);
  const [projectName, setProjectName] = useState<string>('');
  const [projectCode, setProjectCode] = useState<string>('');
  const [roomType, setRoomType] = useState<string>('');
  const [revision, setRevision] = useState<string>('A');
  const [isLoading, setIsLoading] = useState(true);
  const [showPrintInstructions, setShowPrintInstructions] = useState(false);

  useEffect(() => {
    // Add comprehensive print styles to remove browser headers/footers and borders
    const style = document.createElement('style');
    style.textContent = `
      @media print {
        @page {
          margin: 12.7mm !important; /* Set proper page margins */
          size: A4;
          /* Completely hide browser headers and footers */
          @top-left { content: none !important; }
          @top-center { content: none !important; }
          @top-right { content: none !important; }
          @bottom-left { content: none !important; }
          @bottom-center { content: none !important; }
          @bottom-right { content: none !important; }
        }
        
        html, body {
          margin: 0 !important;
          padding: 0 !important;
          -webkit-print-color-adjust: exact !important;
          color-adjust: exact !important;
          /* Remove forced white background to preserve original colors */
          border: none !important;
          outline: none !important;
        }
        
        #root {
          margin: 0 !important;
          padding: 0 !important;
          border: none !important;
          outline: none !important;
        }
        
        /* Hide any browser UI elements */
        .MuiButton-root,
        .MuiDialog-root,
        .MuiDialog-paper {
          display: none !important;
        }
        
        /* Ensure no unwanted borders */
        * {
          border: none !important;
          outline: none !important;
        }
        
        /* Re-apply borders only to specific elements that need them */
        .MuiPaper-root {
          border: 1px solid #e0e0e0 !important;
        }
      }
    `;
    document.head.appendChild(style);

    // Function to extract revision from project name
    const extractRevisionFromProjectName = (projectName: string): string => {
      const revisionMatch = projectName.match(/\s*Rev\.?\s*([A-Z0-9]+)/i);
      if (revisionMatch) {
        return `Rev${revisionMatch[1]}`;
      }
      return 'Rev0'; // Default revision
    };

    // Get panel data from router state or URL params
    const state = location.state as any;
    
    console.log('🔍 PrintPreview Debug:');
    console.log('  state:', state);
    console.log('  contextProjectName:', contextProjectName);
    console.log('  contextProjectCode:', contextProjectCode);
    
    if (state?.panelConfig) {
      // Single panel
      const projectName = state.projectName || contextProjectName || 'Panel Design';
      // Use contextProjectCode if state.projectCode is not provided
      const projectCode = state.projectCode || (contextProjectCode && contextProjectCode.trim() !== '' ? contextProjectCode : 'PRJ-001');
      console.log('  Single panel - projectName:', projectName, 'projectCode:', projectCode);
      console.log('  state.projectCode:', state.projectCode, 'contextProjectCode:', contextProjectCode);
      setPanelConfigs([state.panelConfig]);
      setProjectName(projectName);
      setProjectCode(projectCode);
      setRoomType(state.roomType || 'General');
      setRevision(state.revision || extractRevisionFromProjectName(projectName));
    } else if (state?.panelConfigs) {
      // Multiple panels
      const projectName = state.projectName || contextProjectName || 'Project Design';
      // Use contextProjectCode if state.projectCode is not provided
      const projectCode = state.projectCode || (contextProjectCode && contextProjectCode.trim() !== '' ? contextProjectCode : 'PRJ-001');
      console.log('  Multiple panels - projectName:', projectName, 'projectCode:', projectCode);
      console.log('  state.projectCode:', state.projectCode, 'contextProjectCode:', contextProjectCode);
      setPanelConfigs(state.panelConfigs);
      setProjectName(projectName);
      setProjectCode(projectCode);
      setRoomType(state.roomType || 'General');
      setRevision(state.revision || extractRevisionFromProjectName(projectName));
    } else {
      // Try to get from URL params as fallback
      const urlParams = new URLSearchParams(window.location.search);
      const configParam = urlParams.get('config');
      if (configParam) {
        try {
          const config = JSON.parse(decodeURIComponent(configParam));
          setPanelConfigs(Array.isArray(config) ? config : [config]);
          const projectName = urlParams.get('project') || contextProjectName || 'Panel Design';
          const projectCode = urlParams.get('projectCode') || (contextProjectCode && contextProjectCode.trim() !== '' ? contextProjectCode : 'PRJ-001');
          console.log('  URL params - projectName:', projectName, 'projectCode:', projectCode);
          console.log('  urlParams.projectCode:', urlParams.get('projectCode'), 'contextProjectCode:', contextProjectCode);
          setProjectName(projectName);
          setProjectCode(projectCode);
          setRoomType(urlParams.get('roomType') || 'General');
          setRevision(urlParams.get('revision') || extractRevisionFromProjectName(projectName));
        } catch (error) {
          console.error('Failed to parse panel config from URL:', error);
          navigate('/');
          return;
        }
      } else {
        // No data available, redirect to home
        navigate('/');
        return;
      }
    }
    
    setIsLoading(false);
  }, [location, navigate]);

  const handlePrint = () => {
    // Show instructions first, then open print dialog
    setShowPrintInstructions(true);
  };

  const handleConfirmPrint = () => {
    setShowPrintInstructions(false);
    // Small delay to ensure dialog is closed
    setTimeout(() => {
      // Add additional print styles right before printing
      const printStyle = document.createElement('style');
      printStyle.textContent = `
        @media print {
          @page {
            margin: 12.7mm !important; /* Set proper page margins */
            size: A4;
          }
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            border: none !important;
            outline: none !important;
          }
          #root {
            margin: 0 !important;
            padding: 0 !important;
            border: none !important;
          }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `;
      document.head.appendChild(printStyle);
      
      // Trigger print
      window.print();
      
      // Remove the temporary style after printing
      setTimeout(() => {
        document.head.removeChild(printStyle);
      }, 1000);
    }, 100);
  };

  const handleBack = () => {
    navigate(-1);
  };

  // Group panels two per page (stacked vertically on a single-column grid)
  const groupPanelsIntoPages = (panels: PanelConfig[]) => {
    const pages: PanelConfig[][] = [];
    for (let i = 0; i < panels.length; i += 2) {
      pages.push(panels.slice(i, i + 2));
    }
    return pages;
  };

  if (isLoading) {
    return (
      <PrintContainer>
        <Typography>Loading print preview...</Typography>
      </PrintContainer>
    );
  }

  if (panelConfigs.length === 0) {
    return (
      <PrintContainer>
        <Typography>No panel data available for printing.</Typography>
        <Button onClick={handleBack} startIcon={<ArrowBackIcon />}>
          Go Back
        </Button>
      </PrintContainer>
    );
  }

  const panelPages = groupPanelsIntoPages(panelConfigs);
  const totalPanels = panelConfigs.length;
  const staticMiddleSvgs: string[] = [page2Png, page3Png, page4Png];
  const totalPages = 1 /* cover */ + staticMiddleSvgs.length /* pages 2-4 */ + panelPages.length /* panel pages */ + 1 /* last page 13.svg */;
  const currentDate = new Date().toLocaleDateString();

  return (
    <PrintContainer>
      <PrintHeader>
        <Typography variant="h4" component="h1">
          Print Preview: {projectName}
        </Typography>
        <ActionButtons>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={handleBack}
          >
            Back
          </Button>
          <Button
            variant="contained"
            startIcon={<PrintIcon />}
            onClick={handlePrint}
            color="primary"
          >
            Export as PDF
          </Button>
        </ActionButtons>
      </PrintHeader>

      <PrintContent>
        {/* Cover Page */}
        <CoverPage>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'flex-start', 
            width: '100%', 
            marginTop: '-100px',
            padding: '12.7mm', // Add padding for print
            '@media print': {
              marginTop: '0px',
              paddingTop: '40px',
              width: '100%',
              maxWidth: 'none',
              padding: '0' // Remove padding since @page handles margins
            }
          }}>
            {/* Logo on first line */}
            <Box
              component="img"
              src={logoImage} 
              alt="INTEREL Logo" 
              sx={{
                width: '120px',
                height: 'auto',
                objectFit: 'contain',
                marginBottom: '60px',
                '@media print': {
                  width: '100px',
                  height: 'auto',
                  marginBottom: '40px',
                  marginTop: '20px'
                }
              }}
            />
            
            {/* "Design Proposal For" on second line */}
            <Typography 
              variant="h5" 
              sx={{ 
                fontWeight: 'normal',
                color: '#666',
                fontFamily: '"Myriad Hebrew", "Monsal Gothic", Arial, sans-serif',
                marginBottom: '20px',
                textAlign: 'left',
                '@media print': {
                  fontSize: '1.2rem',
                  marginBottom: '15px'
                }
              }}
            >
              Design Proposal For
            </Typography>
            
            {/* Project name on third line */}
            <Typography 
              variant="h3" 
              sx={{ 
                fontWeight: 'bold',
                color: '#1b92d1',
                fontFamily: '"Myriad Hebrew", "Monsal Gothic", Arial, sans-serif',
                marginBottom: '60px',
                textAlign: 'left',
                '@media print': {
                  fontSize: '1.8rem',
                  marginBottom: '60px'
                }
              }}
            >
              {projectName}
            </Typography>

                    {/* Details section */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', alignItems: 'flex-start' }}>
                            {/* First row: background color & plastic */}
              <Box sx={{ display: 'flex', gap: '100px', width: '100%', justifyContent: 'flex-start', paddingLeft: '0px' }}>
                <Box sx={{ minWidth: '200px' }}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: '#666',
                      fontFamily: '"Myriad Hebrew", "Monsal Gothic", Arial, sans-serif',
                      marginBottom: '5px',
                      textAlign: 'left'
                    }}
                  >
                    Background Color
            </Typography>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: 'bold',
                      color: '#555',
                      fontFamily: '"Myriad Hebrew", "Monsal Gothic", Arial, sans-serif',
                      textAlign: 'left'
                    }}
                  >
                    {(() => {
                      // Collect background hexes
                      const colors = panelConfigs
                        .map(config => config.panelDesign?.backgroundColor)
                        .filter((c): c is string => Boolean(c && typeof c === 'string'));
                      const uniqueColors = [...new Set(colors)];
                      if (uniqueColors.length === 0) return 'N/A';
                      // Map to RAL codes when possible
                      const ralList = uniqueColors.map(hexToRal);
                      return ralList.join(', ');
                    })()}
            </Typography>
                </Box>
                <Box sx={{ minWidth: '150px' }}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: '#666',
                      fontFamily: '"Myriad Hebrew", "Monsal Gothic", Arial, sans-serif',
                      marginBottom: '5px',
                      textAlign: 'left'
                    }}
                  >
                    Plastic
            </Typography>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: 'bold',
                      color: '#555',
                      fontFamily: '"Myriad Hebrew", "Monsal Gothic", Arial, sans-serif',
                      textAlign: 'left'
                    }}
                  >
                    {(() => {
                      // Determine plastic from derived icon colors: White if icons are White, otherwise Black.
                      const explicitIconColors = panelConfigs
                        .map(c => c.panelDesign?.iconColor)
                        .filter((c): c is string => Boolean(c && typeof c === 'string'));
                      let iconColorNames: string[] = [];
                      if (explicitIconColors.length > 0) {
                        iconColorNames = explicitIconColors.map(hex => {
                          const h = hex.toLowerCase();
                          if (h === '#ffffff' || h === '#fff') return 'White';
                          if (h === '#808080' || h === '#000000' || h === '#000') return 'Grey';
                          return getIconColorFromBackground(hex);
                        });
                      } else {
                        const bgColors = panelConfigs
                          .map(c => c.panelDesign?.backgroundColor)
                          .filter((c): c is string => Boolean(c && typeof c === 'string'));
                        iconColorNames = bgColors.map(getIconColorFromBackground);
                      }
                      const set = new Set(iconColorNames);
                      if (set.size === 0) return 'N/A';
                      if (set.has('White') && set.has('Grey')) return 'Black, White';
                      return set.has('White') ? 'White' : 'Black';
                    })()}
                  </Typography>
                </Box>
              </Box>

                            {/* Second row: icons & LED backlight */}
              <Box sx={{ display: 'flex', gap: '100px', width: '100%', justifyContent: 'flex-start', paddingLeft: '0px' }}>
                <Box sx={{ minWidth: '200px' }}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: '#666',
                      fontFamily: '"Myriad Hebrew", "Monsal Gothic", Arial, sans-serif',
                      marginBottom: '5px',
                      textAlign: 'left'
                    }}
                  >
                    Icons
            </Typography>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: 'bold',
                      color: '#555',
                      fontFamily: '"Myriad Hebrew", "Monsal Gothic", Arial, sans-serif',
                      textAlign: 'left'
                    }}
                  >
                    {(() => {
                      // Get all unique background colors from all panels
                      const uniqueBackgroundColors = [...new Set(
                        panelConfigs.map(config => config.panelDesign?.backgroundColor).filter(Boolean)
                      )];
                      
                      console.log('Background colors found:', uniqueBackgroundColors); // Debug log
                      
                      if (uniqueBackgroundColors.length === 0) return 'N/A';
                      
                      // Determine icon colors based on background colors
                      const iconColors = uniqueBackgroundColors.map(bgColor => getIconColorFromBackground(bgColor));
                      
                      console.log('Calculated icon colors:', iconColors); // Debug log
                      
                      // Remove duplicates and join
                      const uniqueIconColors = [...new Set(iconColors)];
                      console.log('Final unique icon colors:', uniqueIconColors); // Debug log
                      return uniqueIconColors.join(', ');
                    })()}
            </Typography>
                </Box>
                <Box sx={{ minWidth: '150px' }}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: '#666',
                      fontFamily: '"Myriad Hebrew", "Monsal Gothic", Arial, sans-serif',
                      marginBottom: '5px',
                      textAlign: 'left'
                    }}
                  >
                    LED Backlight
            </Typography>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: 'bold',
                      color: '#555',
                      fontFamily: '"Myriad Hebrew", "Monsal Gothic", Arial, sans-serif',
                      textAlign: 'left'
                    }}
                  >
                    White
            </Typography>
                </Box>
              </Box>

                            {/* Third row: Revision & Date */}
              <Box sx={{ display: 'flex', gap: '100px', width: '100%', justifyContent: 'flex-start', paddingLeft: '0px' }}>
                <Box sx={{ minWidth: '200px' }}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: '#666',
                      fontFamily: '"Myriad Hebrew", "Monsal Gothic", Arial, sans-serif',
                      marginBottom: '5px',
                      textAlign: 'left'
                    }}
                  >
                    Revision
              </Typography>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: 'bold',
                      color: '#555',
                      fontFamily: '"Myriad Hebrew", "Monsal Gothic", Arial, sans-serif',
                      textAlign: 'left'
                    }}
                  >
                    {revision}
                  </Typography>
                </Box>
                <Box sx={{ minWidth: '150px' }}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: '#666',
                      fontFamily: '"Myriad Hebrew", "Monsal Gothic", Arial, sans-serif',
                      marginBottom: '5px',
                      textAlign: 'left'
                    }}
                  >
                    Date
                  </Typography>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: 'bold',
                      color: '#555',
                      fontFamily: '"Myriad Hebrew", "Monsal Gothic", Arial, sans-serif',
                      textAlign: 'left'
                    }}
                  >
                    {new Date().toLocaleDateString()}
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Signature and Comments Boxes */}
            <Box sx={{ 
              display: 'flex', 
              gap: '50px', 
              width: '100%', 
              justifyContent: 'flex-start', 
              marginTop: '30px'
            }}>
                            {/* Signature Box */}
              <Box sx={{ 
                minWidth: '250px',
                border: '2px solid #ccc',
                borderRadius: '8px',
                padding: '25px',
                backgroundColor: 'transparent',
                minHeight: '220px',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: '#666',
                    fontFamily: '"Myriad Hebrew", "Monsal Gothic", Arial, sans-serif',
                    marginBottom: '10px',
                    textAlign: 'left',
                    fontWeight: 'normal'
                  }}
                >
                Signature & Stamp
              </Typography>
                <Box sx={{ flex: 1, borderTop: '1px solid #ccc', paddingTop: '10px' }}>
                  {/* Empty space for signature */}
                </Box>
              </Box>

                            {/* Comments Box */}
              <Box sx={{ 
                minWidth: '250px',
                border: '2px solid #ccc',
                borderRadius: '8px',
                padding: '25px',
                backgroundColor: 'transparent',
                minHeight: '220px',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: '#666',
                    fontFamily: '"Myriad Hebrew", "Monsal Gothic", Arial, sans-serif',
                    marginBottom: '10px',
                    textAlign: 'left',
                    fontWeight: 'normal'
                  }}
                >
                  Comments
              </Typography>
                <Box sx={{ flex: 1, borderTop: '1px solid #ccc', paddingTop: '10px' }}>
                  {/* Empty space for comments */}
                </Box>
              </Box>
            </Box>
          </Box>

          {/* Project Code Section */}
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'flex-start', 
            width: '100%', 
            marginTop: '50px'
          }}>
            <Typography 
              variant="body2" 
              sx={{ 
                color: '#666',
                fontFamily: '"Myriad Hebrew", "Monsal Gothic", Arial, sans-serif',
                marginBottom: '5px',
                textAlign: 'left'
              }}
            >
              Project Code
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 'bold',
                color: '#555',
                fontFamily: '"Myriad Hebrew", "Monsal Gothic", Arial, sans-serif',
                textAlign: 'left'
              }}
            >
              {projectCode}
            </Typography>
          </Box>

          {/* Disclaimer Section */}
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'flex-start', 
            width: '100%', 
            marginTop: '40px'
          }}>
            <Typography 
              variant="body2" 
              sx={{ 
                color: '#888',
                fontFamily: '"Myriad Hebrew", "Monsal Gothic", Arial, sans-serif',
                fontSize: '0.9rem',
                textAlign: 'left',
                lineHeight: 1.4,
                fontStyle: 'italic'
              }}
            >
              <strong>Disclaimer:</strong><br />
              The colors in this document are only an approximation to the colors of the real panels
            </Typography>
          </Box>
        </CoverPage>

        {/* Static pages 2,3,4 from SVGs */}
        {staticMiddleSvgs.map((svgSrc, idx) => (
          <A4Page key={`static-${idx}`}>
            <CompactHeader>
              <LogoSection>
                <Logo src={logoImage} alt="INTEREL Logo" />
              </LogoSection>
              <ProjectInfoSection>
                <ProjectRow>
                  <ProjectLabel>Project</ProjectLabel>
                  <ProjectLabel>Code</ProjectLabel>
                  <ProjectLabel>Room</ProjectLabel>
                  <ProjectLabel>Rev</ProjectLabel>
                  <ProjectLabel>Date</ProjectLabel>
                  <ProjectLabel>Page</ProjectLabel>
                </ProjectRow>
                <ProjectRow>
                  <ProjectValue>{projectName.replace(/\s*Rev\.?\s*[A-Z0-9]+/i, '').replace(/[\[\]()]/g, '').trim()}</ProjectValue>
                  <ProjectValue>{projectCode}</ProjectValue>
                  <ProjectValue>{roomType}</ProjectValue>
                  <ProjectValue>{revision}</ProjectValue>
                  <ProjectValue>{currentDate}</ProjectValue>
                  <ProjectValue>{2 + idx} of {totalPages}</ProjectValue>
                </ProjectRow>
              </ProjectInfoSection>
            </CompactHeader>
            <Box sx={{
              width: '100%',
              height: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '10mm',
              position: 'relative'
            }}>
              <img src={svgSrc} alt={`Page ${2 + idx}`} style={{ width: '100%', height: 'auto', clipPath: 'inset(12.7mm 0 12.7mm 0)', backgroundColor: 'transparent' }} />
              
              {/* Add text overlays for page 3 (index 1) */}
              {idx === 1 && (
                <>
                  <TopLeftText>
                    <TextTitle>Serigraphic Print</TextTitle>
                    <TextList>
                      <ul>
                        <li>Handcrafted and Copyright protected Icons</li>
                        <li>Icons can depict actual FFandE</li>
                        <li>700+ RAL colors are available</li>
                        <li>Customize panel prints with patterns from FFandE</li>
                        <li>Text can be set in different languages</li>
                        <li>Font can be changed to meet brand standards</li>
                      </ul>
                    </TextList>
                  </TopLeftText>
                  
                  <TopRightText>
                    <TextTitle>Glass</TextTitle>
                    <TextList>
                      <ul>
                        <li>4mm tempered glass</li>
                        <li>resistant against scratches and breaking</li>
                        <li>extra clear - low iron content to avoid blue/green hue</li>
                        <li>chamfered edges create a more elegant look</li>
                      </ul>
                    </TextList>
                  </TopRightText>
                  
                  <BottomRightText>
                    <TextTitle>Electronics in plastic housing</TextTitle>
                    <TextList>
                      <ul>
                        <li>backlit icons to increase readability</li>
                        <li>black or white plastic housing for the electronics</li>
                        <li>LED's temperature 6000k</li>
                      </ul>
                    </TextList>
                  </BottomRightText>
                </>
              )}
            </Box>
          </A4Page>
        ))}

        {/* Panel Pages */}
        {panelPages.map((pagePanels, pageIndex) => (
          <A4Page key={pageIndex}>
            <CompactHeader>
              <LogoSection>
                <Logo src={logoImage} alt="INTEREL Logo" />
              </LogoSection>
              
              <ProjectInfoSection>
                <ProjectRow>
                  <ProjectLabel>Project</ProjectLabel>
                  <ProjectLabel>Code</ProjectLabel>
                  <ProjectLabel>Room</ProjectLabel>
                  <ProjectLabel>Rev</ProjectLabel>
                  <ProjectLabel>Date</ProjectLabel>
                  <ProjectLabel>Page</ProjectLabel>
                </ProjectRow>
                <ProjectRow>
                  <ProjectValue>{projectName.replace(/\s*Rev\.?\s*[A-Z0-9]+/i, '').replace(/[\[\]()]/g, '').trim()}</ProjectValue>
                  <ProjectValue>{projectCode}</ProjectValue>
                  <ProjectValue>{roomType}</ProjectValue>
                  <ProjectValue>{revision}</ProjectValue>
                  <ProjectValue>{currentDate}</ProjectValue>
                  <ProjectValue>{(staticMiddleSvgs.length + 2) + pageIndex} of {totalPages}</ProjectValue>
                </ProjectRow>
              </ProjectInfoSection>
            </CompactHeader>

            <PanelGrid>
              {pagePanels.map((config, panelIndex) => {
                const details = getPanelDetails(config);
                const panelDims = getPanelDimensions(config);
                const widthPx = panelDims.width;
                const heightPx = panelDims.height;
                const gapWidth = 50; // Space for dimension text
                // Dynamic padding based on panel size (minimum 35px for dimension lines)
                const dimensionPadding = Math.max(35, Math.ceil(widthPx * 0.05)); // 5% of width, min 35px
                const dimensionPaddingLeft = Math.max(35, Math.ceil(heightPx * 0.05)); // 5% of height, min 35px
                
                return (
                  <PanelContainer key={panelIndex} sx={{
                    flexDirection: config.type?.includes('X1H') || config.type?.includes('X2H') ? 'column' : 'row'
                  }}>
                    <PanelVisualContainer>
                      {/* Dimension lines and panel preview */}
                      <Box sx={{ 
                        position: 'relative',
                        display: 'flex', 
                        justifyContent: 'flex-start', 
                        alignItems: 'flex-start',
                        width: '100%',
                        paddingTop: `${dimensionPadding}px`, // Dynamic space for width dimension line
                        paddingLeft: `${dimensionPaddingLeft}px` // Dynamic space for height dimension line
                      }}>
                            {/* Width dimension line (top) - using actual panel width */}
                            <>
                              {/* Left segment */}
                              <Box sx={{
                                position: 'absolute',
                                top: '5px', // Adjusted to account for padding
                                left: `${dimensionPaddingLeft}px`, // Start after left padding
                                width: `${(widthPx - gapWidth) / 2}px`,
                                height: '2px',
                                backgroundColor: '#999'
                              }} />
                              {/* Right segment */}
                              <Box sx={{
                                position: 'absolute',
                                top: '5px', // Adjusted to account for padding
                                left: `${dimensionPaddingLeft + (widthPx + gapWidth) / 2}px`, // Adjusted for padding
                                width: `${(widthPx - gapWidth) / 2}px`,
                                height: '2px',
                                backgroundColor: '#999'
                              }} />
                              {/* Text in the gap */}
                              <Box sx={{
                                position: 'absolute',
                                top: '5px', // Adjusted to account for padding
                                left: `${dimensionPaddingLeft + widthPx / 2}px`, // Adjusted for padding
                                transform: 'translateX(-50%)',
                                fontFamily: '"Myriad Hebrew", "Monsal Gothic", Arial, sans-serif',
                                fontSize: '14px',
                                color: '#999',
                                fontWeight: 'bold',
                                backgroundColor: 'white',
                                padding: '0 4px',
                                height: '2px',
                                display: 'flex',
                                alignItems: 'center'
                              }}>
                                {config.type === 'SP' ? 
                                  (config.panelDesign?.spConfig?.dimension === 'wide' ? '130 mm' : 
                                   config.panelDesign?.spConfig?.dimension === 'tall' ? '95 mm' : '95 mm') :
                                  config.type?.includes('X2') ? '224 mm' : 
                                  config.type?.includes('X1') ? '130 mm' : 
                                  config.type === 'DPH' ? '640px' :
                                  config.type === 'DPV' ? '320px' :
                                  config.type === 'IDPG' ? '350px' : '95 mm'}
                              </Box>

                              {/* Width dimension endpoint lines (vertical lines at ends) */}
                              <Box sx={{
                                position: 'absolute',
                                top: '-2px', // Adjusted to account for padding
                                left: `${dimensionPaddingLeft}px`, // Start after left padding
                                width: '3px',
                                height: '15px',
                                backgroundColor: '#999'
                              }} />
                              <Box sx={{
                                position: 'absolute',
                                top: '-2px', // Adjusted to account for padding
                                left: `${dimensionPaddingLeft + widthPx - 3}px`, // Adjusted for padding
                                width: '3px',
                                height: '15px',
                                backgroundColor: '#999'
                              }} />

                              {/* Height dimension line (left) - using actual panel height */}
                              {/* Top segment */}
                              <Box sx={{
                                position: 'absolute',
                                top: `${dimensionPadding}px`, // Start after top padding
                                left: '5px', // Adjusted to account for padding
                                width: '2px',
                                height: `${(heightPx - gapWidth) / 2}px`,
                                backgroundColor: '#999'
                              }} />
                              {/* Bottom segment */}
                              <Box sx={{
                                position: 'absolute',
                                top: `${dimensionPadding + (heightPx + gapWidth) / 2}px`, // Adjusted for padding
                                left: '5px', // Adjusted to account for padding
                                width: '2px',
                                height: `${(heightPx - gapWidth) / 2}px`,
                                backgroundColor: '#999'
                              }} />
                              {/* Text in the gap */}
                              <Box sx={{
                                position: 'absolute',
                                top: `${dimensionPadding + heightPx / 2}px`, // Adjusted for padding
                                left: '5px', // Adjusted to account for padding
                                transform: 'translateY(-50%)',
                                fontFamily: '"Myriad Hebrew", "Monsal Gothic", Arial, sans-serif',
                                fontSize: '14px',
                                color: '#999',
                                fontWeight: 'bold',
                                backgroundColor: 'white',
                                padding: '4px 0',
                                width: '2px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                writingMode: 'vertical-rl',
                                textOrientation: 'mixed'
                              }}>
                                {config.type === 'SP' ? 
                                  (config.panelDesign?.spConfig?.dimension === 'wide' ? '95 mm' : 
                                   config.panelDesign?.spConfig?.dimension === 'tall' ? '130 mm' : '95 mm') :
                                  config.type?.includes('X2') ? '95 mm' : 
                                  config.type?.includes('X1') ? '95 mm' : 
                                  config.type === 'DPH' ? '320px' :
                                  config.type === 'DPV' ? '640px' :
                                  config.type === 'IDPG' ? (config.panelDesign?.idpgConfig?.cardReader && config.panelDesign?.idpgConfig?.roomNumber ? '600px' :
                                                           config.panelDesign?.idpgConfig?.cardReader ? '500px' :
                                                           config.panelDesign?.idpgConfig?.roomNumber ? '450px' : '350px') : '95 mm'}
                              </Box>

                              {/* Height dimension endpoint lines (horizontal lines at ends) */}
                              <Box sx={{
                                position: 'absolute',
                                top: `${dimensionPadding}px`, // Start after top padding
                                left: '-2px', // Adjusted to account for padding
                                width: '15px',
                                height: '3px',
                                backgroundColor: '#999'
                              }} />
                              <Box sx={{
                                position: 'absolute',
                                top: `${dimensionPadding + heightPx - 3}px`, // Adjusted for padding
                                left: '-2px', // Adjusted to account for padding
                                width: '15px',
                                height: '3px',
                                backgroundColor: '#999'
                              }} />
                            </>

                        <PanelPreview
                          icons={config.icons}
                          panelDesign={config.panelDesign}
                          iconTexts={config.iconTexts}
                          type={config.type}
                        />
                      </Box>
                    </PanelVisualContainer>

                    <PanelDetailsContainer sx={{
                      marginLeft: config.type?.includes('X1H') || config.type?.includes('X2H') ? '0' : '15mm',
                      marginTop: config.type?.includes('X1H') || config.type?.includes('X2H') ? '5mm' : '0',
                      width: config.type?.includes('X1H') || config.type?.includes('X2H') ? '100%' : 'auto'
                    }}>
                      <DetailRow>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <DetailValue sx={{ 
                            color: '#1b92d1', 
                            fontWeight: 700,
                            fontSize: 'inherit'
                          }}>
                            {panelIndex + 1})
                          </DetailValue>
                          <DetailValue>{details.panelName}</DetailValue>
                        </Box>
                      </DetailRow>
                      
                      <DetailRow>
                        <DetailLabel>Background Color:</DetailLabel>
                        <DetailValue>{details.backgroundColor}</DetailValue>
                      </DetailRow>
                      
                      <DetailRow>
                        <DetailLabel>Fonts:</DetailLabel>
                        <DetailValue>{details.fonts}</DetailValue>
                      </DetailRow>
                      
                      <DetailRow>
                        <DetailLabel>Backlight of the Icons:</DetailLabel>
                        <DetailValue>{details.backlight}</DetailValue>
                      </DetailRow>
                      
                      <DetailRow>
                        <DetailLabel>Color of the Icons:</DetailLabel>
                        <DetailValue>{details.iconColor}</DetailValue>
                      </DetailRow>
                      
                      <DetailRow>
                        <DetailLabel>Color of the Plastic Housing:</DetailLabel>
                        <DetailValue>{details.plasticColor}</DetailValue>
                      </DetailRow>
                      
                      <DetailRow>
                        <DetailLabel>Panel Type:</DetailLabel>
                        <DetailValue>{details.panelType}</DetailValue>
                      </DetailRow>
                      
                      <DetailRow>
                        <DetailLabel>Backbox:</DetailLabel>
                        <DetailValue>{details.backbox}</DetailValue>
                      </DetailRow>
                    </PanelDetailsContainer>
                  </PanelContainer>
                );
              })}
            </PanelGrid>

            {/* Signature & Stamp Section */}
            <Box sx={{
              marginTop: 'auto',
              paddingTop: '16px',
              paddingLeft: '12.7mm',
              paddingRight: '12.7mm',
              paddingBottom: '12.7mm',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              
              '@media print': {
                paddingTop: '8px',
                paddingLeft: '10mm',
                paddingRight: '10mm',
                paddingBottom: '10mm',
              }
            }}>
              <Typography sx={{
                fontSize: '12px',
                fontWeight: 'bold',
                color: '#666',
                fontFamily: '"Myriad Hebrew", "Monsal Gothic", Arial, sans-serif',
                marginBottom: '8px',
                
                '@media print': {
                  fontSize: '11px',
                }
              }}>
                Signature & Stamp:
              </Typography>
              
              <Box sx={{
                display: 'flex',
                width: '100%',
                gap: '40mm',
                
                '@media print': {
                  gap: '30mm',
                }
              }}>
                {/* Client Signature Line */}
                <Box sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  flex: 1,
                  minWidth: '80mm',
                }}>
                  <Box sx={{
                    borderBottom: '1px solid #ccc',
                    height: '20px',
                    marginBottom: '4px',
                    
                    '@media print': {
                      height: '15px',
                    }
                  }} />
                  <Typography sx={{
                    fontSize: '10px',
                    color: '#666',
                    fontFamily: '"Myriad Hebrew", "Monsal Gothic", Arial, sans-serif',
                    
                    '@media print': {
                      fontSize: '9px',
                    }
                  }}>
                    Client Signature
                  </Typography>
                </Box>

                {/* Design Team Signature Line */}
                <Box sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  flex: 1,
                  minWidth: '80mm',
                }}>
                  <Box sx={{
                    borderBottom: '1px solid #ccc',
                    height: '20px',
                    marginBottom: '4px',
                    
                    '@media print': {
                      height: '15px',
                    }
                  }} />
                  <Typography sx={{
                    fontSize: '10px',
                    color: '#666',
                    fontFamily: '"Myriad Hebrew", "Monsal Gothic", Arial, sans-serif',
                    
                    '@media print': {
                      fontSize: '9px',
                    }
                  }}>
                    Design Team Signature
                  </Typography>
                </Box>
              </Box>
            </Box>
          </A4Page>
        ))}

        {/* Final last page from 13.svg */}
        <A4Page>
          <CompactHeader>
            <LogoSection>
              <Logo src={logoImage} alt="INTEREL Logo" />
            </LogoSection>
            <ProjectInfoSection>
              <ProjectRow>
                <ProjectLabel>Project</ProjectLabel>
                <ProjectLabel>Code</ProjectLabel>
                <ProjectLabel>Room</ProjectLabel>
                <ProjectLabel>Rev</ProjectLabel>
                <ProjectLabel>Date</ProjectLabel>
                <ProjectLabel>Page</ProjectLabel>
              </ProjectRow>
              <ProjectRow>
                <ProjectValue>{projectName.replace(/\s*Rev\.?\s*[A-Z0-9]+/i, '').replace(/[\[\]()]/g, '').trim()}</ProjectValue>
                <ProjectValue>{projectCode}</ProjectValue>
                <ProjectValue>{roomType}</ProjectValue>
                <ProjectValue>{revision}</ProjectValue>
                <ProjectValue>{currentDate}</ProjectValue>
                <ProjectValue>{totalPages} of {totalPages}</ProjectValue>
              </ProjectRow>
            </ProjectInfoSection>
          </CompactHeader>
          <Box sx={{
            width: '100%',
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '10mm'
          }}>
            <img src={page13Png} alt={`Page ${totalPages}`} style={{ width: '100%', height: 'auto', clipPath: 'inset(12.7mm 0 0 0)', backgroundColor: 'transparent', marginTop: '-45px' }} />
          </Box>
        </A4Page>
      </PrintContent>
      
      {/* Print Instructions Dialog */}
      <Dialog
        open={showPrintInstructions}
        onClose={() => setShowPrintInstructions(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1,
          fontFamily: '"Myriad Hebrew", "Monsal Gothic", sans-serif'
        }}>
          <InfoIcon color="primary" />
          🎉 Your Panel Design is Ready!
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2, fontFamily: '"Myriad Hebrew", "Monsal Gothic", sans-serif' }}>
            Congratulations! Your panel design is complete and ready to download:
          </Typography>
          <Box component="ol" sx={{ pl: 2, fontFamily: '"Myriad Hebrew", "Monsal Gothic", sans-serif' }}>
            <li>Click <strong>"Continue"</strong> below to open the print dialog</li>
            <li>In the print dialog, click <strong>"Save"</strong></li>
            <li>Select the destination you want to download it in and you're done!</li>
          </Box>
          <Typography sx={{ 
            mt: 2, 
            p: 2, 
            bgcolor: '#f8f9fa', 
            borderRadius: 1,
            fontSize: '0.9rem',
            fontFamily: '"Myriad Hebrew", "Monsal Gothic", sans-serif'
          }}>
            💡 <strong>Tip:</strong> Once the client signs the design proposal, you can send it over to your INTEREL sales manager for production. 😊
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={() => setShowPrintInstructions(false)}
            variant="outlined"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleConfirmPrint}
            variant="contained"
            startIcon={<PrintIcon />}
          >
            Download My Design
          </Button>
        </DialogActions>
      </Dialog>
    </PrintContainer>
  );
};

export default PrintPreview;
