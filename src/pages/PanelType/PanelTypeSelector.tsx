import React, { useState } from "react";
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
import logo from "../../assets/logo2.png";
import CartButton from "../../components/CartButton";

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
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.8,
      delayChildren: 0.3
    }
  }
};

const itemVariants = {
  hidden: { 
    opacity: 0,
    y: 40,
    scale: 0.95
  },
  visible: { 
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 1.2,
      ease: [0.22, 1, 0.36, 1]
    }
  }
};

const PanelTypeSelector = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [showPanels] = useState(true);

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

  const panelTypes = [
    {
      name: "Single Panel",
      image: SP,
      path: "/customizer/sp",
    },
    {
      name: "Thermostat",
      image: TAG,
      path: "/customizer/tag",
    },
    {
      name: "Double Panel",
      image: DP,
      path: "/panel/double",
    },
    {
      name: "Corridor Panel - IDPG",
      image: IDPG,
      path: "/panel/idpg",
    },
    {
      name: "Extended Panel",
      image: X2H,
      path: "/panel/extended",
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
            style={{ 
              height: '40px',
              width: 'auto',
              filter: 'brightness(0) invert(0.3)'
            }} 
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

        {showPanels && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            style={{ width: '100%' }}
          >
            <Grid container spacing={4} justifyContent="center">
              {panelTypes.map((panel) => (
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
                      <PanelImage
                        src={panel.image}
                        alt={panel.name}
                        className="panel-image"
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
              ))}
            </Grid>
          </motion.div>
        )}
      </Container>
    </Box>
  );
};

export default PanelTypeSelector; 