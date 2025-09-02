import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Button, Typography, Paper, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { styled } from '@mui/material/styles';
import PrintIcon from '@mui/icons-material/Print';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import InfoIcon from '@mui/icons-material/Info';
import PanelRenderer from '../components/PanelRenderer';
import logoImage from '../assets/logo.png';
import { getIconColorName } from '../data/iconColors';
import { ralColors } from '../data/ralColors';
import page2Svg from '../assets/pdf/2.svg';
import page3Svg from '../assets/pdf/3.svg';
import page4Svg from '../assets/pdf/4.svg';
import page13Svg from '../assets/pdf/13.svg';

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
  
  // Use white for dark backgrounds, dark grey for light backgrounds
  if (brightness < 128) {
    // Dark background - use white icons
    return 'White';
  } else {
    // Light background - use dark grey icons
    return 'Dark Grey';
  }
};

// Map hex color to RAL code string if available
const hexToRal = (hex: string): string => {
  if (!hex) return '';
  const normalized = hex.toLowerCase();
  const match = ralColors.find((c: any) => (c.hex || '').toLowerCase() === normalized);
  if (match) {
    // Prefer code (e.g., RAL 9003) and include name
    const code = match.code || match.name || normalized;
    return code;
  }
  return hex; // fallback to hex string
};

// Styled components for print-optimized layout
const PrintContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  padding: 0, // Remove padding to let page margins show
  backgroundColor: 'white',
  
  // Print-specific styles
  '@media print': {
    padding: 0,
    backgroundColor: 'white',
    minHeight: 'auto',
    height: 'auto',
    // Hide browser default headers and footers
    '@page': {
      margin: '12.7mm', // 0.5 inch margins
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
  width: '210mm', // A4 width
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
  
  '@media print': {
    boxShadow: 'none',
    margin: '0',
    padding: '12.7mm', // Match the page margins
    pageBreakInside: 'avoid',
    breakInside: 'avoid',
    width: '100%',
    height: '100%',
    minHeight: '100%',
    backgroundColor: 'white', // White background for print
    alignItems: 'flex-start',
    justifyContent: 'flex-start'
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
  width: '210mm', // A4 width
  minHeight: '297mm', // A4 height
  padding: '0', // Remove padding to accommodate header
  margin: '12.7mm auto 20px auto', // 0.5 inch top margin, auto left/right, 20px bottom
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: '#f5f5f5', // Light grey background
  boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
  
  '@media print': {
    boxShadow: 'none',
    margin: '0',
    padding: '12.7mm', // Match the page margins
    pageBreakAfter: 'always',
    pageBreakInside: 'avoid',
    breakInside: 'avoid',
    width: '100%',
    height: '100vh',
    minHeight: '100vh',
    backgroundColor: 'white', // White background for print
    justifyContent: 'flex-start'
  }
}));

// Grid container for 2 panels per page (stacked vertically)
const PanelGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: '1fr', // single column (stacked)
  gap: '10mm',
  flex: 1,
  alignItems: 'start',
  padding: '0 12.7mm 12.7mm 12.7mm',
  '@media print': {
    gap: '5mm',
    padding: '0',
    height: 'auto',
    minHeight: 'auto',
    alignSelf: 'flex-start'
  }
}));

// Individual panel container
const PanelContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '100mm', // Reduced minimum height
  maxHeight: '200mm', // Added maximum height constraint
  padding: '3mm', // Reduced padding
  
  '@media print': {
    padding: '2mm',
    minHeight: '60mm',
    maxHeight: 'none', // Remove max height constraint for print
    height: '100%'
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
  const [panelConfigs, setPanelConfigs] = useState<PanelConfig[]>([]);
  const [projectName, setProjectName] = useState<string>('');
  const [projectCode, setProjectCode] = useState<string>('');
  const [roomType, setRoomType] = useState<string>('');
  const [revision, setRevision] = useState<string>('A');
  const [isLoading, setIsLoading] = useState(true);
  const [showPrintInstructions, setShowPrintInstructions] = useState(false);

  useEffect(() => {
    // Add print styles to remove browser headers/footers
    const style = document.createElement('style');
    style.textContent = `
      @media print {
        @page {
          margin: 12.7mm;
          size: A4;
        }
        html, body {
          -webkit-print-color-adjust: exact;
          color-adjust: exact;
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
    
    if (state?.panelConfig) {
      // Single panel
      const projectName = state.projectName || 'Panel Design';
      setPanelConfigs([state.panelConfig]);
      setProjectName(projectName);
      setProjectCode(state.projectCode || 'PRJ-001');
      setRoomType(state.roomType || 'General');
      setRevision(state.revision || extractRevisionFromProjectName(projectName));
    } else if (state?.panelConfigs) {
      // Multiple panels
      const projectName = state.projectName || 'Project Design';
      setPanelConfigs(state.panelConfigs);
      setProjectName(projectName);
      setProjectCode(state.projectCode || 'PRJ-001');
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
          const projectName = urlParams.get('project') || 'Panel Design';
          setProjectName(projectName);
          setProjectCode(urlParams.get('projectCode') || 'PRJ-001');
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
      window.print();
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
  const staticMiddleSvgs: string[] = [page2Svg, page3Svg, page4Svg];
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
            '@media print': {
              marginTop: '0px',
              paddingTop: '40px',
              width: '100%',
              maxWidth: 'none'
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
                          if (h === '#808080' || h === '#000000' || h === '#000') return 'Dark Grey';
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
                      if (set.has('White') && set.has('Dark Grey')) return 'Black, White';
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
              padding: '10mm'
            }}>
              <img src={svgSrc} alt={`Page ${2 + idx}`} style={{ width: '100%', height: 'auto', clipPath: 'inset(12.7mm 0 12.7mm 0)', backgroundColor: 'transparent' }} />
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
              {pagePanels.map((config, panelIndex) => (
                <PanelContainer key={panelIndex}>
                  <Typography 
                    variant="subtitle2" 
                    sx={{ 
                      mb: 1, 
                      fontWeight: 'bold',
                      textAlign: 'center',
                      fontSize: '0.8rem'
                    }}
                  >
                    {config.name || `Panel ${pageIndex * 2 + panelIndex + 1}`}
                  </Typography>

                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'flex-start', 
                    alignItems: 'flex-start',
                    width: '100%',
                    transform: 'scale(0.55)',
                    transformOrigin: 'top left'
                  }}>
                    <PanelRenderer
                      icons={config.icons}
                      panelDesign={config.panelDesign}
                      iconTexts={config.iconTexts}
                      type={config.type}
                    />
                  </Box>
                </PanelContainer>
              ))}
            </PanelGrid>
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
            <img src={page13Svg} alt={`Page ${totalPages}`} style={{ width: '100%', height: 'auto', clipPath: 'inset(12.7mm 0 12.7mm 0)', backgroundColor: 'transparent' }} />
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
