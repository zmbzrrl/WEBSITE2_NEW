import React, { useState, useEffect, useContext, useMemo } from "react";
import { useNavigate } from "react-router-dom";
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
import X1LS from "../../assets/panels/X1LS.png";
import X1RS from "../../assets/panels/X1RS.jpg";
import X1V from "../../assets/panels/X1V_UP.png";
import X2LS from "../../assets/panels/X2LS.png";
import X2RS from "../../assets/panels/X2RS.png";
import X2V from "../../assets/panels/X2V_UP.png";
import logo from "../../assets/logo.png";
import logo2 from "../../assets/logo.png";
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

const ExtendedPanelSelector = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [showPanels, setShowPanels] = useState(false);
  const { projectName, projectCode, allowedPanelTypes, boqQuantities } = useContext(ProjectContext);
  const { projPanels } = useCart();

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowPanels(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Guard: Only accessible if EXT was allowed in BOQ
    if (!allowedPanelTypes || !allowedPanelTypes.includes('EXT')) {
      navigate('/boq', { replace: true });
    }
  }, [allowedPanelTypes, navigate]);

  const usedEXT = useMemo(() => {
    return projPanels.reduce((sum, p) => {
      if (p.type && p.type.toUpperCase().startsWith('X')) {
        const qty = typeof p.quantity === 'number' && !isNaN(p.quantity) ? p.quantity : 1;
        return sum + qty;
      }
      return sum;
    }, 0);
  }, [projPanels]);

  // Compute overall Extended cap as the sum of selected subtypes
  const remainingEXT = useMemo(() => {
    const capSum = ['X1H','X1V','X2H','X2V']
      .map(k => (boqQuantities as any)?.[k] as number | undefined)
      .filter((v): v is number => typeof v === 'number')
      .reduce((a, b) => a + b, 0);
    if (!capSum || isNaN(capSum)) return Infinity;
    return Math.max(0, capSum - usedEXT);
  }, [boqQuantities, usedEXT]);

  useEffect(() => {
    // If EXT category is exhausted per BOQ, redirect back to main selector
    const cap = boqQuantities && typeof boqQuantities['EXT'] === 'number' ? boqQuantities['EXT'] : undefined;
    if (cap !== undefined && remainingEXT <= 0) {
      navigate('/panel-type', { replace: true });
    }
  }, [remainingEXT, boqQuantities, navigate]);

  

  const horizontalPanels = [
    {
      name: "Extended Panel, Horizontal, 1 Socket",
      image: X1LS,
      path: "/customizer/x1h",
      subtype: 'X1H' as const,
    },
    {
      name: "Extended 2 Horizontal",
      image: X2LS,
      path: "/customizer/x2h",
      subtype: 'X2H' as const,
    },
  ];
  const verticalPanels = [
    {
      name: "Extended 1 Vertical",
      image: X1V,
      path: "/customizer/x1v",
      subtype: 'X1V' as const,
    },
    {
      name: "Extended 2 Vertical",
      image: X2V,
      path: "/customizer/x2v",
      subtype: 'X2V' as const,
    },
  ];

  // Determine which extended subtypes are allowed from BOQ selections
  const allowedEXTSubtypes = useMemo(() => {
    return ['X1H','X1V','X2H','X2V'].filter(k => {
      const cap = (boqQuantities as any)?.[k];
      return typeof cap === 'number' && cap > 0;
    });
  }, [boqQuantities]);

  // Filter panels to only show selected subtypes
  const filteredHorizontal = useMemo(() => horizontalPanels.filter(p => (allowedEXTSubtypes as string[]).includes(p.subtype)), [horizontalPanels, allowedEXTSubtypes]);
  const filteredVertical = useMemo(() => verticalPanels.filter(p => (allowedEXTSubtypes as string[]).includes(p.subtype)), [verticalPanels, allowedEXTSubtypes]);

  // Per-subtype remaining function
  const remainingForSubtype = (subtype: 'X1H' | 'X1V' | 'X2H' | 'X2V') => {
    const cap = (boqQuantities as any)?.[subtype] as number | undefined;
    if (typeof cap !== 'number') return undefined;
    const used = projPanels.reduce((sum, p) => {
      if (String(p.type).toUpperCase() === subtype) {
        const qty = typeof p.quantity === 'number' && !isNaN(p.quantity) ? p.quantity : 1;
        return sum + qty;
      }
      return sum;
    }, 0);
    return Math.max(0, cap - used);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #718096 0%, #a0aec0 100%)',
        position: 'relative',
        overflow: 'hidden',
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
      <Box
        component={motion.div}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.25 }}
        transition={{ duration: 1.2 }}
        sx={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle at 70% 30%, #fff 0%, transparent 70%)',
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />
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
            zIndex: 2,
          }}
        >
          <img 
            src={logo2} 
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
              { step: 2, label: 'Select your icons' },
              { step: 3, label: 'Select Panel Design' },
              { step: 4, label: 'Review panel details' },
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
                      color: idx === 0 ? '#1976d2' : '#666',
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
                {idx < 3 && (
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
            {/* Horizontal Panels Section */}
            <Box sx={{ mt: 6, mb: 2 }}>
              <Typography
                variant="h5"
                sx={{
                  fontFamily: '"Myriad Hebrew", "Monsal Gothic", sans-serif',
                  color: '#2d3748',
                  fontWeight: 700,
                  fontSize: 24,
                  letterSpacing: 1,
                  textAlign: 'left',
                  mb: 0.5,
                }}
              >
                Horizontal Panels
              </Typography>
              <Box sx={{ width: 32, height: 2, bgcolor: '#1976d2', borderRadius: 1, mt: 0.5 }} />
            </Box>
            <Grid container spacing={4} justifyContent="center" sx={{ mb: 4 }}>
              {filteredHorizontal.map((panel) => (
                <Grid
                  key={panel.name}
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
                      }}
                    >
                      {typeof remainingForSubtype(panel.subtype) === 'number' && (
                        <Box
                          sx={{
                            position: 'absolute',
                            left: 12,
                            bottom: 12,
                            px: 1.25,
                            py: 0.5,
                            borderRadius: 12,
                            backgroundColor: '#ffffff',
                            color: '#111827',
                            fontSize: 12,
                            fontWeight: 700,
                            letterSpacing: 0.3,
                            border: '1px solid rgba(0,0,0,0.08)',
                            boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
                          }}
                        >
                          {remainingForSubtype(panel.subtype)} left
                        </Box>
                      )}
                      <PanelImage
                        src={panel.image}
                        alt={panel.name}
                        className="panel-image"
                      />
                      <PanelTitle
                        variant="h5"
                        className="panel-title"
                        sx={{ textAlign: 'center', mb: 2 }}
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
                        Select
                      </Button>
                    </PanelContainer>
                  </StyledPanel>
                </Grid>
              ))}
            </Grid>
            {/* Vertical Panels Section */}
            <Box sx={{ mt: 6, mb: 2 }}>
              <Typography
                variant="h5"
                sx={{
                  fontFamily: '"Myriad Hebrew", "Monsal Gothic", sans-serif',
                  color: '#2d3748',
                  fontWeight: 700,
                  fontSize: 24,
                  letterSpacing: 1,
                  textAlign: 'left',
                  mb: 0.5,
                }}
              >
                Vertical Panels
              </Typography>
              <Box sx={{ width: 32, height: 2, bgcolor: '#1976d2', borderRadius: 1, mt: 0.5 }} />
            </Box>
            <Grid container spacing={4} justifyContent="center">
              {filteredVertical.map((panel) => (
                <Grid
                  key={panel.name}
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
                      }}
                    >
                      {typeof remainingForSubtype(panel.subtype) === 'number' && (
                        <Box
                          sx={{
                            position: 'absolute',
                            left: 12,
                            bottom: 12,
                            px: 1.25,
                            py: 0.5,
                            borderRadius: 12,
                            backgroundColor: '#ffffff',
                            color: '#111827',
                            fontSize: 12,
                            fontWeight: 700,
                            letterSpacing: 0.3,
                            border: '1px solid rgba(0,0,0,0.08)',
                            boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
                          }}
                        >
                          {remainingForSubtype(panel.subtype)} left
                        </Box>
                      )}
                      <PanelImage
                        src={panel.image}
                        alt={panel.name}
                        className="panel-image"
                      />
                      <PanelTitle
                        variant="h5"
                        className="panel-title"
                        sx={{ textAlign: 'center', mb: 2 }}
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

export default ExtendedPanelSelector; 