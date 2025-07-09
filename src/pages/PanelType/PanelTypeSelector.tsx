import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Grid,
  Box,
  Button,
  useTheme,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import SP from "../../assets/panels/SP.png";
import DP from "../../assets/panels/DP.jpg";
import X2H from "../../assets/panels/X2RS.png";
import IDPG from "../../assets/panels/IDPG_RN.png";
import TAG from "../../assets/panels/TAG_PIR.png";
import logo from "../../assets/logo.png";
import CartButton from "../../components/CartButton";
import { ProjectContext } from '../../App';

const ProgressContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  maxWidth: 800,
  margin: '0 auto',
  padding: theme.spacing(3),
  marginBottom: theme.spacing(6),
}));

const ProgressText = styled(Typography)(({ theme }) => ({
  color: 'rgba(255, 255, 255, 0.9)',
  fontWeight: 400,
  marginBottom: theme.spacing(2),
  letterSpacing: '0.5px',
  fontFamily: '"Myriad Hebrew", "Monsal Gothic", sans-serif',
}));

const PanelContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-4px)',
    '& .panel-image': {
      transform: 'scale(1.02)',
    },
    '& .panel-title': {
      opacity: 1,
      transform: 'translateY(0)',
    },
    '& .panel-button': {
      opacity: 1,
      transform: 'translateY(0)',
    },
  },
}));

const PanelImage = styled('img')(({ theme }) => ({
  width: '100%',
  height: 'auto',
  maxHeight: 280,
  objectFit: 'contain',
  transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  marginBottom: theme.spacing(2),
}));

const PanelTitle = styled(Typography)(({ theme }) => ({
  color: 'rgba(255, 255, 255, 0.9)',
  fontWeight: 400,
  letterSpacing: '0.5px',
  marginTop: theme.spacing(2),
  opacity: 0.8,
  transform: 'translateY(10px)',
  transition: 'all 0.3s ease',
  fontFamily: '"Myriad Hebrew", "Monsal Gothic", sans-serif',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
}));

const StyledPanel = styled(motion.div)({
  width: '100%'
});

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.3,
      staggerChildren: 0.2,
      delayChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { 
    opacity: 0,
    y: 30,
    scale: 0.95
  },
  visible: { 
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: [0.4, 0, 0.2, 1]
    }
  }
};

const PanelTypeSelector = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [showPanels] = useState(true);
  const { projectName, projectCode } = useContext(ProjectContext);
  
  // Get BOQ data if it exists
  const boqData = localStorage.getItem('boqData');
  const boqInfo = boqData ? JSON.parse(boqData) : null;
  
  // Get customized panels data
  const customizedData = localStorage.getItem('customizedPanels');
  const customizedPanels = customizedData ? JSON.parse(customizedData) : {};
  
  // If no BOQ data, redirect to home
  React.useEffect(() => {
    if (!boqInfo) {
      navigate('/');
    }
  }, [boqInfo, navigate]);

  const customizerSteps = [
    { step: 1, label: 'Select Panel Type' },
    { step: 2, label: 'Select your icons' },
    { step: 3, label: 'Select Panel Design' },
    { step: 4, label: 'Review panel details' },
  ];
  const activeStep = 0; // Step 1 is active on this page

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
                color: idx === activeStep ? '#fff' : '#999',
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
                color: idx === activeStep ? '#1976d2' : '#666',
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

  // Panel type mapping from BOQ IDs to display info
  const panelTypeMapping = {
    'sp': {
      name: "Single Panel",
      image: SP,
      path: "/customizer/sp",
      category: "Basic Panels"
    },
    'tag': {
      name: "Thermostat Panel",
      image: TAG,
      path: "/customizer/tag",
      category: "Basic Panels"
    },
    'idpg': {
      name: "Corridor Panel",
      image: IDPG,
      path: "/customizer/idpg",
      category: "Basic Panels"
    },
    'dph': {
      name: "Double Panel - Horizontal",
      image: DP,
      path: "/customizer/dph",
      category: "Double Panels"
    },
    'dpv': {
      name: "Double Panel - Vertical",
      image: DP,
      path: "/customizer/dpv",
      category: "Double Panels"
    },
    'x1h': {
      name: "Extended Panel - H1",
      image: X2H,
      path: "/customizer/x1h",
      category: "Extended Panels"
    },
    'x2h': {
      name: "Extended Panel - H2",
      image: X2H,
      path: "/customizer/x2h",
      category: "Extended Panels"
    },
    'x1v': {
      name: "Extended Panel - V1",
      image: X2H,
      path: "/customizer/x1v",
      category: "Extended Panels"
    },
    'x2v': {
      name: "Extended Panel - V2",
      image: X2H,
      path: "/customizer/x2v",
      category: "Extended Panels"
    }
  };

  // Filter panels based on BOQ selection and customization status
  const getAvailablePanels = () => {
    if (!boqInfo) return [];
    
    const availablePanels = [];
    
    boqInfo.selectedPanels.forEach((boqPanel: any) => {
      const panelId = boqPanel.id;
      const panelInfo = panelTypeMapping[panelId as keyof typeof panelTypeMapping];
      
      if (panelInfo) {
        const customizedCount = customizedPanels[panelId] || 0;
        const remainingQuantity = boqPanel.quantity - customizedCount;
        
        if (remainingQuantity > 0) {
          availablePanels.push({
            ...panelInfo,
            id: panelId,
            remainingQuantity,
            totalQuantity: boqPanel.quantity
          });
        }
      }
    });
    
    return availablePanels;
  };

  const availablePanels = getAvailablePanels();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #718096 0%, #a0aec0 100%)',
        py: 8,
      }}
    >
      {(projectName || projectCode) && (
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
            style={{ height: '40px', width: 'auto', cursor: 'pointer', filter: 'brightness(0) invert(0.3)' }}
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
          <ProgressBar />
        </ProgressContainer>
        
        {boqInfo && (
          <Box sx={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.1)', 
            borderRadius: '12px', 
            padding: 2, 
            mb: 4,
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <Typography sx={{ 
              color: 'white', 
              fontWeight: 600, 
              mb: 1,
              fontFamily: '"Myriad Hebrew", "Monsal Gothic", sans-serif',
            }}>
              BOQ Summary: {boqInfo.totalQuantity} panels selected
            </Typography>
            <Typography sx={{ 
              color: 'rgba(255, 255, 255, 0.8)', 
              fontSize: '0.9rem',
              fontFamily: '"Myriad Hebrew", "Monsal Gothic", sans-serif',
            }}>
              {boqInfo.selectedPanels.map((panel: any) => 
                `${panel.name}: ${panel.quantity}`
              ).join(', ')}
            </Typography>
          </Box>
        )}

        {showPanels && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            style={{ width: '100%' }}
          >
            <Grid container spacing={4} justifyContent="center">
              {availablePanels.length === 0 ? (
                <Grid item xs={12}>
                  <Box sx={{ 
                    textAlign: 'center', 
                    color: 'white', 
                    py: 8,
                    fontFamily: '"Myriad Hebrew", "Monsal Gothic", sans-serif',
                  }}>
                    <Typography variant="h5" sx={{ mb: 2 }}>
                      All panels have been customized!
                    </Typography>
                    <Typography variant="body1" sx={{ opacity: 0.8 }}>
                      You can review your customized panels in the cart.
                    </Typography>
                  </Box>
                </Grid>
              ) : (
                availablePanels.map((panel) => (
                  <Grid 
                    key={panel.id}
                    item 
                    xs={12} 
                    sm={6} 
                    md={4}
                    component="div"
                  >
                    <StyledPanel variants={itemVariants}>
                      <PanelContainer
                        onClick={() => navigate(panel.path)}
                        sx={{
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          p: 3,
                          position: 'relative',
                        }}
                      >
                      <PanelImage
                        src={panel.image}
                        alt={panel.name}
                        className="panel-image"
                        style={{
                          maxHeight: 280,
                          width: '100%',
                          marginBottom: 16,
                        }}
                      />
                      
                      {/* Quantity Badge */}
                      <Box sx={{
                        position: 'absolute',
                        top: 16,
                        right: 16,
                        backgroundColor: 'rgba(25, 118, 210, 0.9)',
                        color: 'white',
                        borderRadius: '12px',
                        px: 1.5,
                        py: 0.5,
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        fontFamily: '"Myriad Hebrew", "Monsal Gothic", sans-serif',
                      }}>
                        {panel.remainingQuantity} of {panel.totalQuantity}
                      </Box>
                      
                      <PanelTitle 
                        variant="h5" 
                        className="panel-title"
                        sx={{
                          textAlign: 'center',
                          mb: 2,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                        }}
                      >
                        {panel.name}
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
                                              >
                          Select Panel
                        </Button>
                      </PanelContainer>
                    </StyledPanel>
                  </Grid>
                ))
              )}
            </Grid>
          </motion.div>
        )}
      </Container>
    </Box>
  );
};

export default PanelTypeSelector; 