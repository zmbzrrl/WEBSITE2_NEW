import React, { useState, useContext, useMemo, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
  const location = useLocation();
  const theme = useTheme();
  const [showPanels] = useState(true);
  const { projectName, projectCode } = useContext(ProjectContext);
  const { projPanels } = useCart();

  // Check if we're in edit mode
  const isEditMode = location.state?.editMode || false;
  const editProjectData = location.state?.projectData;
  const editDesignId = location.state?.designId;

  const customizerSteps = [
    { step: 1, label: 'Select Panel Type' },
    { step: 2, label: 'Configure Panel\nLayout' },
    { step: 3, label: 'Select Panel Design' },
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
                color: idx === activeStep ? '#fff' : '#8a8a8a',
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
                color: idx === activeStep ? '#1976d2' : '#fff',
                fontWeight: idx === activeStep ? 600 : 400,
                fontSize: 14,
                textAlign: 'center',
                maxWidth: 150,
                minHeight: 36,
                lineHeight: 1.2,
                whiteSpace: 'pre',
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

  const allPanelTypes = [
    {
      name: "Single Panel",
      image: SP,
      path: "/customizer/sp",
      key: 'SP',
    },
    {
      name: "Thermostat",
      image: TAG,
      path: "/customizer/tag",
      key: 'TAG',
    },
    {
      name: "Corridor Panel",
      image: IDPG,
      path: "/panel/idpg",
      key: 'IDPG',
    },
    {
      name: "Double Panel",
      image: DP,
      path: "/panel/double",
      key: 'DP',
    },
    {
      name: "Extended Panel",
      image: X2H,
      path: "/panel/extended",
      key: 'EXT',
    },
  ];

  const mapTypeToCategory = (t: string): 'SP' | 'TAG' | 'IDPG' | 'DP' | 'EXT' => {
    if (t === 'SP') return 'SP';
    if (t === 'TAG') return 'TAG';
    if (t === 'IDPG') return 'IDPG';
    if (t === 'DPH' || t === 'DPV') return 'DP';
    if (t && t.toUpperCase().startsWith('X')) return 'EXT';
    return 'SP';
  };

  const usedByCategory = useMemo(() => {
    const counts: Record<'SP' | 'TAG' | 'IDPG' | 'DP' | 'EXT', number> = { SP: 0, TAG: 0, IDPG: 0, DP: 0, EXT: 0 };
    for (const item of projPanels) {
      const cat = mapTypeToCategory(item.type);
      const qty = typeof item.quantity === 'number' && !isNaN(item.quantity) ? item.quantity : 1;
      counts[cat] += qty;
    }
    return counts;
  }, [projPanels]);

  const remainingByCategory = useMemo(() => ({ SP: undefined, TAG: undefined, IDPG: undefined, DP: undefined, EXT: undefined } as Record<'SP'|'TAG'|'IDPG'|'DP'|'EXT', number | undefined>), [usedByCategory]);

  // BOQ removed: no redirects or gating

  const effectiveAllowedPanelTypes: string[] = useMemo(() => [], []);

  const panelTypes = useMemo(() => {
    console.log('effectiveAllowedPanelTypes:', effectiveAllowedPanelTypes);
    console.log('remainingByCategory:', remainingByCategory);
    
    // Start with allowed list (or all if none set)
    const base = allPanelTypes;
    
    console.log('Base panelTypes after filtering:', base.map(p => p.name));
    
    // Further filter by remaining BOQ quantities if provided
    const final = base.filter(p => {
      const remaining = remainingByCategory[p.key as 'SP' | 'TAG' | 'IDPG' | 'DP' | 'EXT'];
      const shouldKeep = remaining === undefined || remaining > 0;
      console.log(`Panel ${p.name} (${p.key}): remaining=${remaining}, shouldKeep=${shouldKeep}`);
      // If no BOQ quantity specified for this category, keep it. If specified, require remaining > 0
      return shouldKeep;
    });
    
    console.log('Final panelTypes:', final.map(p => p.name));
    return final;
  }, [effectiveAllowedPanelTypes, allPanelTypes, remainingByCategory]);

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
        <Box sx={{ position: 'absolute', top: 20, right: 30, zIndex: 1, display: 'flex', gap: 2, alignItems: 'center' }}>
          <Button
            variant="outlined"
            size="small"
            onClick={() => navigate('/properties')}
            sx={{
              color: 'rgba(255, 255, 255, 0.9)',
              borderColor: 'rgba(255, 255, 255, 0.3)',
              textTransform: 'none',
              fontWeight: 400,
              letterSpacing: '0.5px',
              fontFamily: '"Myriad Hebrew", "Monsal Gothic", sans-serif',
              '&:hover': {
                borderColor: 'rgba(255, 255, 255, 0.6)',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              },
            }}
          >
            Properties
          </Button>
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
                  sm={panel.name === 'Double Panel' || panel.name === 'Extended Panel' ? 12 : 6} 
                  md={panel.name === 'Double Panel' || panel.name === 'Extended Panel' ? 6 : 4}
                  component="div"
                >
                  <StyledPanel variants={itemVariants}>
                    <PanelContainer
                      onClick={() => {
                        if (isEditMode) {
                          // If we're in edit mode, we're adding a NEW panel to an existing project
                          // Don't pass edit mode state since this is a new panel, not editing existing
                          navigate(panel.path, {
                            state: {
                              editMode: false, // This is a new panel, not editing existing
                              projectData: editProjectData,
                              designId: editDesignId,
                              isAddingToExistingProject: true, // Flag to indicate we're adding to existing project
                              // Preserve project edit context for return to /cart
                              projectEditMode: true,
                              projectDesignId: editDesignId,
                              projectOriginalName: editProjectData?.projectName,
                             }
                          });
                        } else {
                          // Normal navigation for new projects
                          navigate(panel.path);
                        }
                      }}
                      sx={{
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        p: 3,
                        marginLeft: undefined,
                      }}
                    >
                      {/* BOQ removed: no remaining badges */}
                      <PanelImage
                        src={panel.image}
                        alt={panel.name}
                        className="panel-image"
                        style={{
                          maxHeight:
                            panel.name === 'Single Panel' || panel.name === 'Thermostat'
                              ? 183  // 30% smaller: 262 * 0.7
                              : panel.name === 'Corridor Panel'
                              ? 277  // 20% smaller: 346 * 0.8
                              : panel.name === 'Double Panel'
                              ? 250
                              : panel.name === 'Extended Panel'
                              ? 276  // Another 5% bigger: 263 * 1.05
                              : 288,
                          width:
                            panel.name === 'Single Panel' || panel.name === 'Thermostat'
                              ? '75%'  // 30% smaller: 107% * 0.7
                              : panel.name === 'Corridor Panel'
                              ? '115%'  // 20% smaller: 144% * 0.8
                              : panel.name === 'Double Panel'
                              ? '87%'
                              : panel.name === 'Extended Panel'
                              ? '96%'  // Another 5% bigger: 91% * 1.05
                              : '120%',
                          marginBottom: 16,
                          marginTop: panel.name === 'Double Panel' || panel.name === 'Extended Panel' ? 0 : undefined,
                        }}
                      />
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
              ))}
            </Grid>
          </motion.div>
        )}
      </Container>
    </Box>
  );
};

export default PanelTypeSelector; 