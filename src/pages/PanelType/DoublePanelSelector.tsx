import React, { useState, useEffect, useContext, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Container,
  Typography,
  Grid,
  Box,
  Button,
  LinearProgress,
  useTheme,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import DPH from "../../assets/panels/DP.png";
import DPV from "../../assets/panels/GS_Double module_224x25_vertical.png";
import logo from "../../assets/logo.png";
import CartButton from "../../components/CartButton";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { ProjectContext } from '../../App';
import { useCart } from '../../contexts/CartContext';

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
      staggerChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { 
    opacity: 0,
    y: 30
  },
  visible: { 
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.4, 0, 0.2, 1]
    }
  }
};

const DoublePanelSelector = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const incomingState = useMemo(() => (location.state || {}) as Record<string, any>, [location.state]);
  const theme = useTheme();
  const [showPanels, setShowPanels] = useState(false);
  const { projectName, projectCode } = useContext(ProjectContext);
  const { projPanels } = useCart();

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowPanels(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // BOQ removed: no gating

  const usedDP = useMemo(() => {
    return projPanels.reduce((sum, p) => {
      if (p.type === 'DPH' || p.type === 'DPV') {
        const qty = typeof p.quantity === 'number' && !isNaN(p.quantity) ? p.quantity : 1;
        return sum + qty;
      }
      return sum;
    }, 0);
  }, [projPanels]);

  const remainingDP = useMemo(() => Infinity, [usedDP]);

  // BOQ removed: no redirects

  const panelTypes = [
    {
      name: "Horizontal Double Panel",
      image: DPH,
      path: "/customizer/dph",
      subtype: 'DPH' as const,
    },
    {
      name: "Vertical Double Panel",
      image: DPV,
      path: "/customizer/dpv",
      subtype: 'DPV' as const,
    },
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #718096 0%, #a0aec0 100%)',
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
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 4, mt: 4, gap: 2 }}>
            <Button
              onClick={() => navigate('/panel-type')}
            sx={{
                minWidth: 0,
                p: 2,
                bgcolor: 'transparent',
                color: '#1976d2',
                borderRadius: '50%',
                mr: 2,
                '&:hover': {
                  bgcolor: 'rgba(25, 118, 210, 0.08)',
                  color: '#1565c0',
                },
              }}
              aria-label="Back"
            >
              <ArrowBackIcon fontSize="large" />
            </Button>
            {[
              { step: 1, label: 'Select Panel Type' },
              { step: 2, label: 'Configure Panel\nLayout' },
              { step: 3, label: 'Select Panel Design' },
            ].map((s, idx) => (
              <React.Fragment key={s.step}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 120 }}>
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      background: idx === 0 ? 'linear-gradient(90deg, #1976d2 0%, #42a5f5 100%)' : '#e0e0e0',
                      color: idx === 0 ? '#fff' : '#999',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: 18,
                      boxShadow: idx === 0 ? '0 2px 8px #1976d233' : 'none',
                      border: idx === 0 ? '2px solid #1976d2' : '2px solid #e0e0e0',
                      mb: 1,
                      transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
                    }}
                  >
                    {s.step}
                  </Box>
                  <Typography
                    sx={{
                      color: idx === 0 ? '#1976d2' : '#ffffff',
                      fontWeight: idx === 0 ? 600 : 400,
                      fontSize: 14,
                      textAlign: 'center',
                      maxWidth: 110,
                      letterSpacing: 0.2,
            }}
                  >
                    {s.label}
                  </Typography>
                </Box>
                {idx < 2 && (
                  <Box sx={{ flex: 1, height: 2, background: '#e0e0e0', mx: 1, minWidth: 24, borderRadius: 1 }} />
                )}
              </React.Fragment>
            ))}
          </Box>
        </ProgressContainer>

        {showPanels && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            style={{ width: '100%' }}
          >
            <Grid container spacing={6} justifyContent="center">
              {panelTypes.map((panel) => (
                <Grid 
                  key={panel.name}
                  item 
                  xs={12} 
                  sm={12} 
                  md={6}
                  lg={5}
                  component="div"
                >
                  <StyledPanel variants={itemVariants}>
                    <PanelContainer
                      onClick={() => navigate(panel.path, { 
                        state: { 
                          ...incomingState,
                          selectedPanelSubtype: panel.subtype
                        } 
                      })}
                      sx={{
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        p: 4,
                        minHeight: 400,
                      }}
                    >
                      {/* BOQ removed: no remaining badges */}
                      <PanelImage
                        src={panel.image}
                        alt={panel.name}
                        className="panel-image"
                        style={{
                          ...(panel.name === 'Vertical Double Panel'
                            ? { height: 234, maxHeight: 234 }
                            : { maxHeight: 220 }),
                          width: '100%',
                          objectFit: 'contain',
                        }}
                      />
                      <PanelTitle 
                        variant="h5" 
                        className="panel-title"
                        sx={{
                          textAlign: 'center',
                          mb: 2,
                        }}
                      >
                        {panel.name}
                      </PanelTitle>
                      <Button
                        variant="text"
                        size="large"
                        className="panel-button"
                        onClick={() => navigate(panel.path, { 
                          state: { 
                            ...incomingState,
                            selectedPanelSubtype: panel.subtype
                          } 
                        })}
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
                        Select
                      </Button>
                    </PanelContainer>
                  </StyledPanel>
                </Grid>
              ))}
            </Grid>
          </motion.div>
        )}
      </Container>
    </Box>
  );
};

export default DoublePanelSelector; 