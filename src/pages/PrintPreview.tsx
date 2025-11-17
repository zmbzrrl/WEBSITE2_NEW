import React, { useEffect, useState, useContext, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Button, Typography, Paper, Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';
import PrintIcon from '@mui/icons-material/Print';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import InfoIcon from '@mui/icons-material/Info';
import PanelPreview from '../components/PanelPreview';
import logoImage from '../assets/logo.png';
import { getIconColorName } from '../data/iconColors';
import { ralColors } from '../data/ralColors';
import { getBackboxOptions, isNoBackbox, NO_BACKBOX_DISCLAIMER } from '../utils/backboxOptions';
import { getPanelLayoutConfig } from '../data/panelLayoutConfig';
import page2Png from '../assets/pdf/2.png';
import page3Png from '../assets/pdf/3.png';
import page4Png from '../assets/pdf/4.png';
import page13Png from '../assets/pdf/13.png';
import { ProjectContext } from '../App';
import { getLayouts } from '../utils/newDatabase';

// Helper function to get panel type label
const getPanelTypeLabel = (type: string): string => {
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

const PANEL_STRIP_SPANS: Record<string, { col: number; row: number }> = {
  SP: { col: 1, row: 1 },
  TAG: { col: 1, row: 1 },
  DPH: { col: 2, row: 1 },
  DPV: { col: 1, row: 2 },
  X1H: { col: 2, row: 1 },
  X1V: { col: 1, row: 2 },
  X2H: { col: 3, row: 1 },
  X2V: { col: 1, row: 3 },
  IDPG: { col: 1, row: 1 }
};

const PANEL_LABEL_OFFSETS_PX: Record<string, number> = {
  default: 5,
  TAG: 2,
  DPH: 8,
  DPV: 8,
  X1H: 10,
  X1V: 8,
  X2H: 12,
  X2V: 12,
  IDPG: 29
};

const getPanelSpan = (type?: string) => {
  if (!type) return { col: 1, row: 1 };
  return PANEL_STRIP_SPANS[type] || { col: 1, row: 1 };
};

const getPanelLabelOffset = (type?: string) => {
  if (!type) return `${PANEL_LABEL_OFFSETS_PX.default}px`;
  const value = PANEL_LABEL_OFFSETS_PX[type] ?? PANEL_LABEL_OFFSETS_PX.default;
  return `${value}px`;
};

const buildPanelRows = (
  panels: any[] = [],
  maxUnitsPerRow = 12
): Array<Array<{ panel: any; span: { col: number; row: number } }>> => {
  const rows: Array<Array<{ panel: any; span: { col: number; row: number } }>> = [];
  let currentRow: Array<{ panel: any; span: { col: number; row: number } }> = [];
  let currentUnits = 0;

  panels.forEach((panel) => {
    const span = getPanelSpan(panel?.panelData?.type);
    const units = span.col;

    if (currentUnits + units > maxUnitsPerRow && currentRow.length > 0) {
      rows.push(currentRow);
      currentRow = [];
      currentUnits = 0;
    }

    currentRow.push({ panel, span });
    currentUnits += units;
  });

  if (currentRow.length > 0) {
    rows.push(currentRow);
  }

  return rows;
};

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

// Helper function to convert mm to px (exactly matching PanelPreview's logic)
const convertMmToPxString = (value: string): string => {
  if (value.endsWith('mm')) {
    const mm = parseFloat(value);
    const px = Math.round(mm * (350 / 95)); // 95mm = 350px
    // Apply 24.5px reduction for wide TAG panels (130mm) - matching PanelPreview
    const adjustedPx = mm === 130 ? px - 24.5 : px;
    return `${adjustedPx}px`;
  }
  return value; // Return as-is if already in px or other format
};

// Helper function to parse px string to number with validation
const parsePx = (value: string | number | undefined): number => {
  if (typeof value === 'number') {
    // Validate number is not NaN or Infinity
    if (isNaN(value) || !isFinite(value)) {
      console.warn('Invalid number value for parsePx:', value);
      return 350; // Default fallback (95mm in pixels)
    }
    return value;
  }
  
  if (!value || typeof value !== 'string') {
    console.warn('Invalid value for parsePx:', value);
    return 350; // Default fallback
  }
  
  let parsed: number;
  if (value.endsWith('px')) {
    parsed = parseFloat(value.replace('px', '').trim());
  } else if (value.endsWith('mm')) {
    // Convert mm to px if not already converted
    const mm = parseFloat(value.replace('mm', '').trim());
    parsed = Math.round(mm * (350 / 95));
  } else {
    parsed = parseFloat(value.trim());
  }
  
  // Validate parsed value
  if (isNaN(parsed) || !isFinite(parsed) || parsed <= 0) {
    console.warn('Failed to parse dimension value:', value, 'parsed as:', parsed);
    return 350; // Default fallback (95mm in pixels)
  }
  
  return parsed;
};

// Helper function to get actual panel dimensions in pixels (matching PanelPreview exactly)
const getPanelDimensions = (config: PanelConfig) => {
  try {
    const { panelDesign, type } = config;
    const panelType = type || 'SP';
    const panelConfig = getPanelLayoutConfig(panelType);
    
    // Validate panelConfig exists and has dimensions
    if (!panelConfig || !panelConfig.dimensions) {
      console.error('Invalid panel config for type:', panelType);
      return { width: 350, height: 350 }; // Default fallback
    }
    
    // Start with config dimensions and convert mm to px
    let dimensions: { width: string | number; height: string | number } = {
      width: convertMmToPxString(panelConfig.dimensions.width || '95mm'),
      height: convertMmToPxString(panelConfig.dimensions.height || '95mm')
    };
    
    // Handle TAG panels - match PanelPreview logic exactly
    if (panelType === 'TAG') {
      if (!(panelDesign as any)?.tagConfig) {
        // No tagConfig means wide dimensions
        dimensions = {
          width: convertMmToPxString('130mm'),
          height: convertMmToPxString('95mm')
        };
      } else {
        const { dimension } = (panelDesign as any).tagConfig;
        if (dimension === 'wide') {
          dimensions = {
            width: convertMmToPxString('130mm'),
            height: convertMmToPxString('95mm')
          };
        } else if (dimension === 'tall') {
          dimensions = {
            width: convertMmToPxString('95mm'),
            height: convertMmToPxString('130mm')
          };
        }
      }
    }
    
    // Handle SP panels - match PanelPreview logic
    if (panelType === 'SP' && panelDesign?.spConfig?.dimension) {
      const { dimension } = panelDesign.spConfig;
      if (dimension === 'wide') {
        dimensions = {
          width: convertMmToPxString('130mm'),
          height: convertMmToPxString('95mm')
        };
      } else if (dimension === 'tall') {
        dimensions = {
          width: convertMmToPxString('95mm'),
          height: convertMmToPxString('130mm')
        };
      }
    }
    
    // Handle IDPG panels - match PanelPreview exact pixel values
    if (panelType === 'IDPG' && panelDesign?.idpgConfig) {
      const { cardReader, roomNumber } = panelDesign.idpgConfig;
      if (!cardReader && !roomNumber) {
        dimensions = { width: '350px', height: '350px' };
      } else if (!cardReader && roomNumber) {
        dimensions = { width: '330px', height: '470px' };
      } else if (cardReader && !roomNumber) {
        dimensions = { width: '350px', height: '500px' };
      } else if (cardReader && roomNumber) {
        dimensions = { width: '350px', height: '600px' };
      }
    }
    
    // Special handling for DPV panels - increase height by 10% (matching PanelPreview)
    if (panelType === 'DPV') {
      const currentHeight = parsePx(dimensions.height);
      if (currentHeight > 0) {
        dimensions.height = `${Math.round(currentHeight * 1.1)}px`;
      }
    }
    
    // Convert to numbers for dimension lines with validation
    const widthPx = parsePx(dimensions.width);
    const heightPx = parsePx(dimensions.height);
    
    // Final validation - ensure both dimensions are valid
    if (isNaN(widthPx) || isNaN(heightPx) || widthPx <= 0 || heightPx <= 0) {
      console.error('Invalid dimensions calculated for panel type:', panelType, 'width:', widthPx, 'height:', heightPx);
      return { width: 350, height: 350 }; // Default fallback
    }
    
    return { width: widthPx, height: heightPx };
  } catch (error) {
    console.error('Error calculating panel dimensions:', error, 'config:', config);
    return { width: 350, height: 350 }; // Default fallback
  }
};

// Helper function to get panel details
const getPanelDetails = (config: PanelConfig) => {
  const { panelDesign, type, name } = config;
  
  // Get background color with RAL code
  const backgroundColor = panelDesign?.backgroundColor || '';
  const backgroundRal = hexToRal(backgroundColor);
  
  // Get icon color
  // Icon color is always calculated from background color in the rendering
  // If iconColor is 'auto' or missing, use backgroundColor to calculate
  // If iconColor is a named value like 'White' or 'Grey', use it directly
  // Otherwise, always fall back to calculating from backgroundColor
  const iconColor = panelDesign?.iconColor || '';
  let iconColorName = 'N/A';
  
  if (iconColor && (iconColor === 'White' || iconColor === 'Grey' || iconColor === 'Black')) {
    // If iconColor is already a named color, use it directly
    iconColorName = iconColor;
  } else if (backgroundColor) {
    // Always calculate from background color (this matches how rendering works)
    // This handles 'auto', hex values, empty strings, or any other case
    iconColorName = getIconColorFromBackground(backgroundColor);
  }
  
  // Get plastic housing color
  // First check if it's stored directly in panelDesign, otherwise derive from icon color
  let plasticColor = (panelDesign as any)?.plasticColor;
  if (!plasticColor || plasticColor.trim() === '') {
    // Derive from icon color: White icons = White plastic, Grey icons = Black plastic
    plasticColor = iconColorName === 'White' ? 'White' : 'Black';
  }
  
  // Get fonts - show "N/A" if no font is set
  const fonts = (panelDesign?.fonts && panelDesign.fonts.trim() !== '') ? panelDesign.fonts : 'N/A';
  
  // Get panel type
  const panelType = type || 'SP';
  
  // Format panel type for display: "TAG Flat" for TAG panels, "GS Flat" for all others
  const panelTypeDisplay = panelType === 'TAG' ? 'TAG Flat' : 'GS Flat';
  
  // Get backbox from panelDesign, or default to first option if not set
  const backboxOptions = getBackboxOptions(panelType, panelDesign);
  const backbox = (panelDesign as any)?.backbox || (backboxOptions.length > 0 ? backboxOptions[0].label : 'Standard');
  
  return {
    panelName: name || 'Panel',
    backgroundColor: backgroundRal || backgroundColor || 'N/A',
    fonts: fonts,
    backlight: 'White LED',
    iconColor: iconColorName,
    plasticColor: plasticColor,
    panelType: panelTypeDisplay,
    backbox: backbox
  };
};

// Styled components for print-optimized layout
const PrintContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  padding: 0, // Remove padding to let page margins show
  backgroundColor: '#f5f5f5',
  backgroundImage: 'none',
  margin: 0,
  border: 'none',
  
  // Print-specific styles
  '@media print': {
    padding: 0,
    margin: 0,
    backgroundColor: '#f5f5f5',
    backgroundImage: 'none',
    minHeight: 'auto',
    height: 'auto',
    border: 'none',
    outline: 'none',
    '-webkit-print-color-adjust': 'exact',
    'color-adjust': 'exact',
    'print-color-adjust': 'exact'
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
    padding: '3mm 12.7mm', // Match page padding
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
  alignItems: 'flex-start',
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
  maxWidth: '70px',
  textAlign: 'left',
  flexShrink: 0,
}));

const ProjectValue = styled(Typography)(({ theme }) => ({
  color: '#333',
  fontSize: 'inherit',
  minWidth: '70px',
  maxWidth: '70px',
  textAlign: 'left',
  wordWrap: 'break-word',
  overflowWrap: 'break-word',
  whiteSpace: 'normal',
  flexShrink: 0,
}));

// Cover page component
const CoverPage = styled(Paper)(({ theme }) => ({
  width: '100%',
  maxWidth: '250mm', // Increased width to match other pages on screen
  minHeight: '297mm', // A4 height
  padding: '30mm', // Larger margins for cover
  margin: '12.7mm auto 20px auto', // 0.5 inch top margin, auto left/right, 20px bottom
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: '#f5f5f5', // Light grey background
  backgroundImage: 'none',
  boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
  textAlign: 'center',
  border: 'none',
  
  '@media print': {
    boxShadow: 'none',
    margin: '0',
    maxWidth: 'none',
    padding: '12.7mm', // Internal padding for content
    pageBreakInside: 'avoid',
    breakInside: 'avoid',
    height: '100vh', // Fill entire viewport height
    minHeight: '100vh', // Ensure it fills the page
    backgroundColor: '#f5f5f5', // Match preview background
    backgroundImage: 'none',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    border: 'none',
    outline: 'none',
    pageBreakAfter: 'always',
    boxSizing: 'border-box'
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
  width: '100%',
  maxWidth: '250mm', // Increased width for better content fitting on screen
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
    maxWidth: 'none',
    padding: '0', // No padding - content padding handled by PanelGrid
    pageBreakAfter: 'always',
    pageBreakInside: 'avoid',
    breakInside: 'avoid',
    height: '100vh', // Fill entire viewport height
    minHeight: '100vh', // Ensure it fills the page
    backgroundColor: '#f5f5f5', // Match preview background
    backgroundImage: 'none',
    justifyContent: 'flex-start',
    border: 'none',
    outline: 'none',
    boxSizing: 'border-box'
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
    padding: '12.7mm', // Padding on all sides since @page margins are removed
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
    height: 'auto', // Use auto instead of 100%
    gap: '8mm', // Reduced gap for print to accommodate vertical layout for extended panels
    pageBreakInside: 'avoid', // Prevent panel from being split across pages
    breakInside: 'avoid'
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
  const [isLoadingLayouts, setIsLoadingLayouts] = useState(true);
  const [showPrintInstructions, setShowPrintInstructions] = useState(false);
  const [measuredPanels, setMeasuredPanels] = useState<Record<string, { width: number; height: number }>>({});
  const [layouts, setLayouts] = useState<Array<{
    id: string;
    name: string;
    imageUrl: string | null;
    imageScale: number;
    imagePosition: { x: number; y: number };
    imageFit: string;
    placedPanels: any[];
    placedDevices: any[];
    panelSizes: { [key: string]: number };
    deviceSizes: { [key: string]: number };
    canvasWidth?: number;
    canvasHeight?: number;
  }>>([]);

  useEffect(() => {
    // Add comprehensive print styles to remove browser headers/footers and borders
    const style = document.createElement('style');
    style.textContent = `
      @media print {
        @page {
          margin: 0 !important; /* Remove margins so background extends to edges */
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
          print-color-adjust: exact !important;
          background-color: #f5f5f5 !important;
          background: #f5f5f5 !important;
          background-image: none !important;
          width: 100% !important;
          min-height: 100% !important;
        }
        
        #root {
          margin: 0 !important;
          padding: 0 !important;
          background-color: #f5f5f5 !important;
          background: #f5f5f5 !important;
          background-image: none !important;
          width: 100% !important;
          min-height: 100% !important;
        }
        
        /* Hide any browser UI elements */
        .MuiButton-root,
        .MuiDialog-root,
        .MuiDialog-paper {
          display: none !important;
        }
        
        /* Preserve all colors and backgrounds */
        * {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          color-adjust: exact !important;
        }
        
        /* Remove borders from root elements only */
        html, body, #root {
          border: none !important;
          outline: none !important;
        }
        
        /* Remove borders from Paper components in print */
        .MuiPaper-root {
          border: none !important;
          box-shadow: none !important;
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
    
    // Load layouts from database if coming from projpanels (has projectCode)
    const loadLayoutsFromDatabase = async () => {
      const userEmail = localStorage.getItem('userEmail');
      // Get projectCode from state or context (projectCode state variable will be set after this)
      let finalProjectCode = state?.projectCode;
      if (!finalProjectCode) {
        finalProjectCode = contextProjectCode && contextProjectCode.trim() !== '' ? contextProjectCode : undefined;
      }
      // Try URL params as fallback
      if (!finalProjectCode) {
        const urlParams = new URLSearchParams(window.location.search);
        finalProjectCode = urlParams.get('projectCode') || undefined;
      }
      
      setIsLoadingLayouts(true);
      
      if (userEmail && finalProjectCode) {
        try {
          console.log('Loading layouts for print preview:', { userEmail, projectCode: finalProjectCode });
          const result = await getLayouts(userEmail, finalProjectCode);
          
          if (result.success && result.layouts && result.layouts.length > 0) {
            console.log('Loaded', result.layouts.length, 'layouts for print preview');
            
            // Transform database layouts to component format
            const transformedLayouts = result.layouts.map((dbLayout: any) => {
              const layoutData = dbLayout.layout_data || {};
              return {
                id: dbLayout.id,
                name: dbLayout.layout_name || 'Untitled Layout',
                imageUrl: layoutData.imageUrl || null,
                imageScale: layoutData.imageScale || 1,
                imagePosition: layoutData.imagePosition || { x: 0, y: 0 },
                imageFit: layoutData.imageFit || 'contain',
                placedPanels: layoutData.placedPanels || [],
                placedDevices: layoutData.placedDevices || [],
                panelSizes: layoutData.panelSizes || {},
                deviceSizes: layoutData.deviceSizes || {},
                canvasWidth: layoutData.canvasWidth || layoutData.canvas_width || 1000,
                canvasHeight: layoutData.canvasHeight || layoutData.canvas_height || 700
              };
            });
            
            setLayouts(transformedLayouts);
          } else {
            console.log('No layouts found for print preview');
            setLayouts([]);
          }
        } catch (error) {
          console.error('Error loading layouts for print preview:', error);
          setLayouts([]);
        } finally {
          setIsLoadingLayouts(false);
        }
      } else {
        setLayouts([]);
        setIsLoadingLayouts(false);
      }
    };
    
    loadLayoutsFromDatabase();
    setIsLoading(false);
  }, [location, navigate, contextProjectCode]);

  const setPanelMeasureRef = useCallback(
    (key: string) => (node: HTMLDivElement | null) => {
      if (!node) {
        return;
      }
      const width = Math.round(node.offsetWidth);
      const height = Math.round(node.offsetHeight);
      if (!width || !height) {
        return;
      }
      setMeasuredPanels((prev) => {
        const existing = prev[key];
        if (existing && existing.width === width && existing.height === height) {
          return prev;
        }
        return { ...prev, [key]: { width, height } };
      });
    },
    [setMeasuredPanels]
  );

  const handlePrint = () => {
    // Show instructions first, then open print dialog
    setShowPrintInstructions(true);
  };

  const handleConfirmPrint = () => {
    setShowPrintInstructions(false);
    
    // Validate all panel dimensions before printing
    try {
      const invalidPanels = panelConfigs.filter(config => {
        try {
          const dims = getPanelDimensions(config);
          return isNaN(dims.width) || isNaN(dims.height) || dims.width <= 0 || dims.height <= 0;
        } catch (error) {
          console.error('Error validating panel dimensions:', error, config);
          return true;
        }
      });
      
      if (invalidPanels.length > 0) {
        console.error('Cannot print: Some panels have invalid dimensions', invalidPanels);
        alert('Cannot print: Some panels have invalid dimensions. Please check the console for details.');
        return;
      }
    } catch (error) {
      console.error('Error validating panels before print:', error);
      alert('Error validating panels before print. Please check the console.');
      return;
    }
    
    // Small delay to ensure dialog is closed and DOM is ready
    setTimeout(() => {
      // Wait for next frame to ensure all rendering is complete
      requestAnimationFrame(() => {
        // Add additional print styles right before printing
        const printStyle = document.createElement('style');
        printStyle.id = 'print-preview-styles';
        printStyle.textContent = `
          @media print {
            @page {
              margin: 0 !important; /* Remove margins so background extends to edges */
              size: A4;
            }
            html, body {
              margin: 0 !important;
              padding: 0 !important;
              border: none !important;
              outline: none !important;
              background-color: #f5f5f5 !important;
              background: #f5f5f5 !important;
              background-image: none !important;
              width: 100% !important;
              min-height: 100% !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              color-adjust: exact !important;
            }
            #root {
              margin: 0 !important;
              padding: 0 !important;
              border: none !important;
              background-color: #f5f5f5 !important;
              background: #f5f5f5 !important;
              background-image: none !important;
              width: 100% !important;
              min-height: 100% !important;
            }
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              color-adjust: exact !important;
            }
            .MuiPaper-root {
              border: none !important;
              box-shadow: none !important;
            }
          }
        `;
        
        // Remove existing print style if present
        const existingStyle = document.getElementById('print-preview-styles');
        if (existingStyle) {
          document.head.removeChild(existingStyle);
        }
        
        document.head.appendChild(printStyle);
        
        // Small delay to ensure styles are applied
        setTimeout(() => {
          try {
            // Trigger print
            window.print();
          } catch (error) {
            console.error('Error triggering print:', error);
            alert('Error opening print dialog. Please try again.');
          }
        }, 50);
      });
    }, 200);
  };

  const handleBack = () => {
    navigate(-1);
  };

  // Group panels two per page (stacked vertically on a single-column grid)
  // X2V panels get their own separate page
  const groupPanelsIntoPages = (panels: PanelConfig[]) => {
    const pages: PanelConfig[][] = [];
    let i = 0;
    
    while (i < panels.length) {
      const currentPanel = panels[i];
      
      // X2V panels get their own page
      if (currentPanel.type === 'X2V') {
        pages.push([currentPanel]);
        i += 1;
      } else {
        // For non-X2V panels, try to group 2 per page
        // But if the next panel is X2V, only take the current one
        if (i + 1 < panels.length && panels[i + 1].type !== 'X2V') {
          pages.push(panels.slice(i, i + 2));
          i += 2;
        } else {
          // Only one panel left or next is X2V, put current one alone
          pages.push([currentPanel]);
          i += 1;
        }
      }
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
  const totalPages = 1 /* cover */ + staticMiddleSvgs.length /* pages 2-4 */ + panelPages.length /* panel pages */ + layouts.length /* layout pages */ + 1 /* last page 13.svg */;
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
              paddingTop: '0px',
              width: '100%',
              maxWidth: 'none',
              padding: '12.7mm' // Use same padding as @page margin
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

        {/* Layout Pages - one page per layout */}
        {isLoadingLayouts ? (
          <A4Page key="loading-layouts">
            <CompactHeader>
              <LogoSection>
                <Logo src={logoImage} alt="INTEREL Logo" />
              </LogoSection>
              
              <ProjectInfoSection>
                <ProjectRow>
                  <ProjectLabel>Project</ProjectLabel>
                  <ProjectLabel>Code</ProjectLabel>
                  <ProjectLabel>Date</ProjectLabel>
                  <ProjectLabel>Page</ProjectLabel>
                </ProjectRow>
                <ProjectRow>
                  <ProjectValue>{projectName.replace(/\s*Rev\.?\s*[A-Z0-9]+/i, '').replace(/[\[\]()]/g, '').trim()}</ProjectValue>
                  <ProjectValue>{projectCode}</ProjectValue>
                  <ProjectValue>{currentDate}</ProjectValue>
                  <ProjectValue>...</ProjectValue>
                </ProjectRow>
              </ProjectInfoSection>
            </CompactHeader>

            {/* Loading Indicator */}
            <Box sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '60px 20px',
              gap: 16,
              minHeight: '400px'
            }}>
              <CircularProgress size={40} sx={{ color: '#1b92d1' }} />
              <Typography sx={{
                color: '#666',
                fontSize: '14px',
                fontFamily: '"Myriad Hebrew", "Monsal Gothic", Arial, sans-serif',
                letterSpacing: '0.5px'
              }}>
                Loading layouts...
              </Typography>
            </Box>
          </A4Page>
        ) : (
          layouts.map((layout, layoutIndex) => {
          const layoutPageNumber = 2 /* pages start after cover+static */ + staticMiddleSvgs.length + layoutIndex;
          const canvasWidth = layout.canvasWidth || 1000;
          const canvasHeight = layout.canvasHeight || 700;
          const aspectRatioValue = canvasWidth > 0 && canvasHeight > 0 ? `${canvasWidth} / ${canvasHeight}` : '4 / 3';
          const panelSizeMap = layout.panelSizes || {};
          const deviceSizeMap = layout.deviceSizes || {};
          const sortedPlacedPanels = (layout.placedPanels || []).slice().sort((a: any, b: any) => {
            const aIdx = typeof a?.panelIndex === 'number' ? a.panelIndex : 0;
            const bIdx = typeof b?.panelIndex === 'number' ? b.panelIndex : 0;
            return aIdx - bIdx;
          });
          const uniquePlacedPanels: any[] = [];
          const seenPanelIndices = new Set<number>();
          sortedPlacedPanels.forEach((panel: any) => {
            const idx = typeof panel?.panelIndex === 'number' ? panel.panelIndex : null;
            if (idx !== null) {
              if (seenPanelIndices.has(idx)) return;
              seenPanelIndices.add(idx);
            }
            uniquePlacedPanels.push(panel);
          });

          const panelCount = uniquePlacedPanels.length;
          const layoutStripWidthPx = 720; // approx 90% of an A4 page width
          const PANEL_STRIP_UNITS = 6; // Ensures 3 DPH/X1H or 2 X2H per row
          const defaultPanelThumbWidth = panelCount > 12 ? 110 : 140;
          const reducedThumbnailWidth = Math.max(90, defaultPanelThumbWidth - 10);
          const panelThumbWidth = Math.min(reducedThumbnailWidth, Math.floor(layoutStripWidthPx / PANEL_STRIP_UNITS));
          const panelThumbHeight = panelCount > 12 ? 130 : 150;
          const maxUnitsPerRow = PANEL_STRIP_UNITS;
          const panelRows = buildPanelRows(uniquePlacedPanels, maxUnitsPerRow);
          const panelStripItems = panelRows.flat();

          return (
            <A4Page key={layout.id}>
              <CompactHeader>
                <LogoSection>
                  <Logo src={logoImage} alt="INTEREL Logo" />
                </LogoSection>
                
                <ProjectInfoSection>
                  <ProjectRow>
                    <ProjectLabel>Project</ProjectLabel>
                    <ProjectLabel>Code</ProjectLabel>
                    <ProjectLabel>Layout</ProjectLabel>
                    <ProjectLabel>Date</ProjectLabel>
                    <ProjectLabel>Page</ProjectLabel>
                  </ProjectRow>
                  <ProjectRow>
                    <ProjectValue>{projectName.replace(/\s*Rev\.?\s*[A-Z0-9]+/i, '').replace(/[\[\]()]/g, '').trim()}</ProjectValue>
                    <ProjectValue>{projectCode}</ProjectValue>
                    <ProjectValue>{layout.name}</ProjectValue>
                    <ProjectValue>{currentDate}</ProjectValue>
                    <ProjectValue>{layoutPageNumber} of {totalPages}</ProjectValue>
                  </ProjectRow>
                </ProjectInfoSection>
              </CompactHeader>

              {/* Panel Previews - Show actual panel designs first */}
              {uniquePlacedPanels.length > 0 && (
                <Box
                  sx={{
                    width: '90%',
                    maxWidth: '900px',
                    margin: '20px auto 0 auto',
                    padding: '10px 0',
                    display: 'grid',
                    gridTemplateColumns: `repeat(${maxUnitsPerRow}, ${panelThumbWidth}px)`,
                    gridAutoRows: `${panelThumbHeight}px`,
                    columnGap: '24px',
                    rowGap: '26px',
                    justifyContent: 'flex-start',
                    alignContent: 'flex-start',
                    gridAutoFlow: 'dense'
                  }}
                >
                  {panelStripItems.map(({ panel: placedPanel, span }) => {
                    if (!placedPanel?.panelData) return null;
                    const panelData = placedPanel.panelData;
                    const width = panelThumbWidth * span.col;
                    const height = panelThumbHeight * span.row;

                    return (
                      <Box
                        key={placedPanel.id}
                        sx={{
                          position: 'relative',
                          width: '100%',
                          height: '100%',
                          minWidth: 0,
                          gridColumn: `span ${span.col}`,
                          gridRow: `span ${span.row}`
                        }}
                      >
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 0,
                            left: '50%',
                            transform: 'translateX(-50%) scale(0.3)',
                            transformOrigin: 'top center'
                          }}
                        >
                          <PanelPreview
                            icons={
                              panelData.icons?.map((icon: any) => ({
                                src: icon.src || '',
                                label: icon.label || '',
                                position: icon.position || 0,
                                text: icon.text || '',
                                category: icon.category || '',
                                id: icon.iconId || undefined,
                                iconId: icon.iconId || undefined
                              })) || []
                            }
                            panelDesign={
                              panelData.panelDesign || {
                                backgroundColor: '#ffffff',
                                iconColor: '#000000',
                                textColor: '#000000',
                                fontSize: '12px'
                              }
                            }
                            type={panelData.type || 'SP'}
                          />
                        </Box>
                        <Box
                          sx={{
                            position: 'absolute',
                            bottom: getPanelLabelOffset(panelData.type),
                            left: '50%',
                            transform: 'translateX(-50%)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            justifyContent: 'center',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          <Typography
                            sx={{
                              fontSize: '0.8rem',
                              color: '#1b92d1',
                              fontWeight: 700,
                              fontFamily: '"Myriad Hebrew", "Monsal Gothic", Arial, sans-serif',
                              '@media print': {
                                fontSize: '0.7rem'
                              }
                            }}
                          >
                            {placedPanel.panelIndex + 1})
                          </Typography>
                          <Typography
                            sx={{
                              fontSize: '0.8rem',
                              color: '#333',
                              fontWeight: 700,
                              fontFamily: '"Myriad Hebrew", "Monsal Gothic", Arial, sans-serif',
                              '@media print': {
                                fontSize: '0.7rem'
                              }
                            }}
                          >
                            {getPanelTypeLabel(panelData.type || 'SP')}
                          </Typography>
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              )}

              {/* Layout Content Area - Render exactly like Layouts page (half page size) - Below panel previews */}
              <Box sx={{
                position: 'relative',
                width: '90%',
                maxWidth: 900,
                aspectRatio: aspectRatioValue,
                maxHeight: 420,
                margin: '20px auto',
                border: 'none',
                borderRadius: '14px',
                background: 'transparent',
                overflow: 'hidden',
                flexShrink: 0
              }}>
                {/* Layout Image - Full opacity, not greyed out */}
                {layout.imageUrl && (
                  <img
                    src={layout.imageUrl}
                    alt={layout.name}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: (['contain', 'cover', 'fill'].includes(layout.imageFit) ? layout.imageFit : 'contain') as 'contain' | 'cover' | 'fill',
                      transform: `scale(${layout.imageScale || 1}) translate(${layout.imagePosition?.x || 0}px, ${layout.imagePosition?.y || 0}px)`,
                      transformOrigin: 'center center',
                      opacity: 1
                    }}
                  />
                )}

                {/* Placed Panels - Render as numbered circles */}
                {layout.placedPanels && layout.placedPanels.map((panel: any) => {
                  const panelSize = panelSizeMap[panel.id] || 36;
                  const leftPercent = (panel.x / canvasWidth) * 100;
                  const topPercent = (panel.y / canvasHeight) * 100;
                  const panelWidthPercent = (panelSize / canvasWidth) * 100;
                  const panelHeightPercent = (panelSize / canvasHeight) * 100;
                  return (
                    <Box
                      key={panel.id}
                      sx={{
                        position: 'absolute',
                        left: `${leftPercent}%`,
                        top: `${topPercent}%`,
                        width: `${panelWidthPercent}%`,
                        height: `${panelHeightPercent}%`,
                        transform: 'translate(-50%, -50%)',
                        zIndex: 10
                      }}
                    >
                      {/* Panel Number Circle */}
                      <Box
                        sx={{
                          background: '#1b92d1',
                          color: '#fff',
                          borderRadius: '8px',
                          fontWeight: 700,
                          fontSize: Math.max(12, Math.min(24, panelSize * 0.5)),
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 1px 4px rgba(27,146,209,0.10)',
                          border: 'none',
                          userSelect: 'none'
                        }}
                      >
                        {panel.panelIndex + 1}
                      </Box>
                    </Box>
                  );
                })}

                {/* Placed Devices - Render as colored circles */}
                {layout.placedDevices && layout.placedDevices.map((device: any) => {
                  const DEVICE_TYPES = {
                    doorContact: { name: 'Door Contact', color: '#4CAF50' },
                    pirSensor: { name: 'PIR Sensor', color: '#FF9800' },
                    windowContact: { name: 'Window Contact', color: '#9C27B0' },
                    inbuiltPir: { name: 'In-built PIR', color: '#F44336' }
                  };
                  const deviceSize = deviceSizeMap[device.id] || 24;
                  const deviceType = DEVICE_TYPES[device.type as keyof typeof DEVICE_TYPES];
                  const leftPercent = (device.x / canvasWidth) * 100;
                  const topPercent = (device.y / canvasHeight) * 100;
                  const deviceWidthPercent = (deviceSize / canvasWidth) * 100;
                  const deviceHeightPercent = (deviceSize / canvasHeight) * 100;
                  return (
                    <Box
                      key={device.id}
                      sx={{
                        position: 'absolute',
                        left: `${leftPercent}%`,
                        top: `${topPercent}%`,
                        width: `${deviceWidthPercent}%`,
                        height: `${deviceHeightPercent}%`,
                        transform: 'translate(-50%, -50%)',
                        zIndex: 10
                      }}
                    >
                      {/* Device Circle */}
                      <Box
                        sx={{
                          width: '100%',
                          height: '100%',
                          borderRadius: '50%',
                          background: deviceType?.color || '#666',
                          border: '2px solid #fff',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                          userSelect: 'none'
                        }}
                      />
                    </Box>
                  );
                })}
              </Box>
            </A4Page>
          );
          })
        )}

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
                  <ProjectValue>{(staticMiddleSvgs.length + layouts.length + 2) + pageIndex} of {totalPages}</ProjectValue>
                </ProjectRow>
              </ProjectInfoSection>
            </CompactHeader>

            <PanelGrid>
              {pagePanels.map((config, panelIndex) => {
                try {
                  const details = getPanelDetails(config);
                  const panelDims = getPanelDimensions(config);
                  // Ensure dimensions are valid numbers, fallback to defaults if not
                  const baseWidthPx = (typeof panelDims.width === 'number' && !isNaN(panelDims.width) && isFinite(panelDims.width) && panelDims.width > 0) 
                    ? panelDims.width 
                    : 350;
                  const baseHeightPx = (typeof panelDims.height === 'number' && !isNaN(panelDims.height) && isFinite(panelDims.height) && panelDims.height > 0) 
                    ? panelDims.height 
                    : 350;
                  
                  // Validate dimensions are safe for calculations
                  if (!isFinite(baseWidthPx) || !isFinite(baseHeightPx) || baseWidthPx <= 0 || baseHeightPx <= 0) {
                    console.error('Invalid panel dimensions for panel', panelIndex, 'type:', config.type, 'width:', baseWidthPx, 'height:', baseHeightPx);
                    return null; // Skip rendering this panel if dimensions are invalid
                  }
                  const panelKey = `${pageIndex}-${panelIndex}`;
                  const isStackedLayout =
                    config.type === 'DPH' ||
                    config.type?.includes('X1H') ||
                    config.type?.includes('X2H');
                  const measured = measuredPanels[panelKey];
                  const effectiveWidthPx = Math.max(0, measured?.width ?? baseWidthPx);
                  const effectiveHeightPx = Math.max(0, measured?.height ?? baseHeightPx);
                  
                  const gapWidth = 50; // Space for dimension text
                  // Dynamic padding based on panel size - reduced to minimize gap
                  // Use smaller percentage (2%) with a reasonable minimum (25px) and maximum (35px)
                  const dimensionPadding = Math.min(35, Math.max(25, Math.ceil(Math.max(0, effectiveWidthPx) * 0.02))); // 2% of width, clamped between 25-35px
                  const dimensionPaddingLeft = Math.min(35, Math.max(25, Math.ceil(Math.max(0, effectiveHeightPx) * 0.02))); // 2% of height, clamped between 25-35px
                  
                  // Calculate dimension line widths with validation to prevent negative values
                  // Use Math.round to ensure integer pixel values for better browser compatibility
                  const widthSegmentLeft = Math.max(0, Math.round((effectiveWidthPx - gapWidth) / 2));
                  const widthSegmentRight = Math.max(0, Math.round((effectiveWidthPx - gapWidth) / 2));
                  const heightSegmentTop = Math.max(0, Math.round((effectiveHeightPx - gapWidth) / 2));
                  const heightSegmentBottom = Math.max(0, Math.round((effectiveHeightPx - gapWidth) / 2));
                  
                  // Calculate positions as integers to avoid decimal precision issues in print
                  const centerLeft = Math.round(dimensionPaddingLeft + effectiveWidthPx / 2);
                  const rightSegmentLeft = Math.round(dimensionPaddingLeft + effectiveWidthPx / 2 + gapWidth / 2);
                  const rightEdgeLeft = Math.round(dimensionPaddingLeft + Math.max(0, effectiveWidthPx - 3));
                  const centerTop = Math.round(dimensionPadding + effectiveHeightPx / 2);
                  const bottomSegmentTop = Math.round(dimensionPadding + effectiveHeightPx / 2 + gapWidth / 2);
                  const bottomEdgeTop = Math.round(dimensionPadding + Math.max(0, effectiveHeightPx - 3));
                  
                  // Ensure all calculated values are valid numbers and positive
                  if (!isFinite(dimensionPadding) || !isFinite(dimensionPaddingLeft) || 
                      !isFinite(widthSegmentLeft) || !isFinite(widthSegmentRight) ||
                      !isFinite(heightSegmentTop) || !isFinite(heightSegmentBottom) ||
                      !isFinite(centerLeft) || !isFinite(rightSegmentLeft) || !isFinite(rightEdgeLeft) ||
                      !isFinite(centerTop) || !isFinite(bottomSegmentTop) || !isFinite(bottomEdgeTop) ||
                      dimensionPadding < 0 || dimensionPaddingLeft < 0 ||
                      widthSegmentLeft < 0 || widthSegmentRight < 0 ||
                      heightSegmentTop < 0 || heightSegmentBottom < 0) {
                    console.error('Invalid calculated dimensions for panel', panelIndex, {
                      dimensionPadding, dimensionPaddingLeft,
                      widthSegmentLeft, widthSegmentRight,
                      heightSegmentTop, heightSegmentBottom
                    });
                    return null;
                  }
                
                return (
                  <PanelContainer key={panelIndex} sx={{
                    flexDirection: isStackedLayout ? 'column' : 'row',
                    alignItems: config.type === 'X2H' ? 'flex-start' : 'flex-start',
                    gap: isStackedLayout ? '10px' : undefined,
                    padding: isStackedLayout ? '0' : undefined
                  }}>
                    <PanelVisualContainer sx={{
                      alignItems: config.type === 'X2H' ? 'flex-start' : 'center',
                      marginLeft: config.type === 'X2H' ? '-20px' : '0',
                      '@media print': {
                        marginLeft: config.type === 'X2H' ? '-20px' : '0'
                      }
                    }}>
                      {/* Dimension lines and panel preview */}
                      <Box sx={{ 
                        position: 'relative',
                        display: 'flex', 
                        justifyContent: 'flex-start', 
                        alignItems: 'flex-start',
                        width: '100%',
                        paddingTop: `${dimensionPadding}px`, // Dynamic space for width dimension line
                        paddingLeft: `${dimensionPaddingLeft}px`, // Dynamic space for height dimension line
                        transform: 'scale(0.85)', // Scale all panels 15% smaller
                        transformOrigin: 'top left' // Scale from top-left to maintain positioning
                      }}>
                            {/* Width dimension line (top) - extends exactly to panel edges */}
                            <>
                              {/* Left segment - extends from panel's left edge to center gap */}
                              <Box sx={{
                                position: 'absolute',
                                top: '5px',
                                left: `${dimensionPaddingLeft}px`,
                                width: `${widthSegmentLeft}px`,
                                height: '2px',
                                backgroundColor: '#999'
                              }} />
                              {/* Right segment - extends from center gap to panel's right edge */}
                              <Box sx={{
                                position: 'absolute',
                                top: '5px',
                                left: `${rightSegmentLeft}px`,
                                width: `${widthSegmentRight}px`,
                                height: '2px',
                                backgroundColor: '#999'
                              }} />
                              {/* Text in the gap */}
                              <Box sx={{
                                position: 'absolute',
                                top: '5px',
                                left: `${centerLeft}px`,
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
                                  config.type === 'TAG' ?
                                  ((config.panelDesign as any)?.tagConfig?.dimension === 'wide' ? '130 mm' :
                                   (config.panelDesign as any)?.tagConfig?.dimension === 'tall' ? '95 mm' : '95 mm') :
                                  config.type === 'X2H' ? '303 mm' :
                                  config.type === 'X2V' ? '95 mm' :
                                  config.type === 'X1H' ? '217 mm' :
                                  config.type === 'X1V' ? '95 mm' :
                                  config.type === 'DPH' ? '224 mm' :
                                  config.type === 'DPV' ? '95 mm' :
                                  config.type === 'IDPG' ? (config.panelDesign?.idpgConfig?.cardReader || config.panelDesign?.idpgConfig?.roomNumber ? '130 mm' : '95 mm') : '95 mm'}
                              </Box>

                              {/* Width dimension endpoint lines (vertical lines at panel edges) */}
                              <Box sx={{
                                position: 'absolute',
                                top: '-2px',
                                left: `${dimensionPaddingLeft}px`,
                                width: '3px',
                                height: '15px',
                                backgroundColor: '#999'
                              }} />
                              <Box sx={{
                                position: 'absolute',
                                top: '-2px',
                                left: `${rightEdgeLeft}px`,
                                width: '3px',
                                height: '15px',
                                backgroundColor: '#999'
                              }} />

                              {/* Height dimension line (left) - extends exactly to panel edges */}
                              {/* Top segment - extends from panel's top edge to center gap */}
                              <Box sx={{
                                position: 'absolute',
                                top: `${dimensionPadding}px`,
                                left: '5px',
                                width: '2px',
                                height: `${heightSegmentTop}px`,
                                backgroundColor: '#999'
                              }} />
                              {/* Bottom segment - extends from center gap to panel's bottom edge */}
                              <Box sx={{
                                position: 'absolute',
                                top: `${bottomSegmentTop}px`,
                                left: '5px',
                                width: '2px',
                                height: `${heightSegmentBottom}px`,
                                backgroundColor: '#999'
                              }} />
                              {/* Text in the gap */}
                              <Box sx={{
                                position: 'absolute',
                                top: `${centerTop}px`,
                                left: '5px',
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
                                  config.type === 'TAG' ?
                                  ((config.panelDesign as any)?.tagConfig?.dimension === 'wide' ? '95 mm' :
                                   (config.panelDesign as any)?.tagConfig?.dimension === 'tall' ? '130 mm' : '95 mm') :
                                  config.type === 'X2H' ? '95 mm' :
                                  config.type === 'X2V' ? '303 mm' :
                                  config.type === 'X1H' ? '95 mm' :
                                  config.type === 'X1V' ? '217 mm' :
                                  config.type === 'DPH' ? '95 mm' :
                                  config.type === 'DPV' ? '224 mm' :
                                  config.type === 'IDPG' ? (config.panelDesign?.idpgConfig?.cardReader && config.panelDesign?.idpgConfig?.roomNumber ? '263 mm' :
                                                           config.panelDesign?.idpgConfig?.cardReader ? '180 mm' :
                                                           config.panelDesign?.idpgConfig?.roomNumber ? '180 mm' : '95 mm') : '95 mm'}
                              </Box>

                              {/* Height dimension endpoint lines (horizontal lines at panel edges) */}
                              <Box sx={{
                                position: 'absolute',
                                top: `${dimensionPadding}px`,
                                left: '-2px',
                                width: '15px',
                                height: '3px',
                                backgroundColor: '#999'
                              }} />
                              <Box sx={{
                                position: 'absolute',
                                top: `${bottomEdgeTop}px`,
                                left: '-2px',
                                width: '15px',
                                height: '3px',
                                backgroundColor: '#999'
                              }} />
                            </>

                        <Box
                          ref={setPanelMeasureRef(panelKey)}
                          sx={{
                            position: 'relative',
                            display: 'inline-block',
                            margin: 0,
                            padding: 0,
                          }}
                        >
                          <PanelPreview
                            icons={config.icons}
                            panelDesign={config.panelDesign}
                            iconTexts={config.iconTexts}
                            type={config.type}
                          />
                        </Box>
                      </Box>
                    </PanelVisualContainer>

                    <PanelDetailsContainer sx={{
                      marginLeft: isStackedLayout ? '0' : '15mm',
                      marginTop: isStackedLayout ? '0' : '0',
                      width: isStackedLayout ? '100%' : 'auto',
                      paddingTop: isStackedLayout ? '10px' : undefined
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
                      {isNoBackbox(details.backbox) && (
                        <DetailRow style={{ 
                          marginTop: '8px',
                          padding: '10px',
                          backgroundColor: '#fff3cd',
                          borderRadius: '6px',
                          border: '1px solid #ffc107'
                        }}>
                          <DetailValue style={{ 
                            color: '#856404',
                            fontSize: '12px',
                            fontWeight: '500',
                            width: '100%'
                          }}>
                            ⚠️ {NO_BACKBOX_DISCLAIMER}
                          </DetailValue>
                        </DetailRow>
                      )}
                    </PanelDetailsContainer>
                  </PanelContainer>
                );
                } catch (error) {
                  console.error('Error rendering panel', panelIndex, ':', error, config);
                  // Return a placeholder or skip this panel
                  return (
                    <PanelContainer key={panelIndex}>
                      <Typography color="error">
                        Error rendering panel {panelIndex + 1}: {error instanceof Error ? error.message : 'Unknown error'}
                      </Typography>
                    </PanelContainer>
                  );
                }
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

