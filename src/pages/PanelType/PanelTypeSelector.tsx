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
  const { projectName, projectCode, allowedPanelTypes, boqQuantities } = useContext(ProjectContext);
  const { projPanels } = useCart();

  // Check if we're in edit mode
  const isEditMode = location.state?.editMode || false;
  const editProjectData = location.state?.projectData;
  const editDesignId = location.state?.designId;

  const customizerSteps = [
    { step: 1, label: 'Select Panel Type' },
    { step: 2, label: 'Configure Panel\nLayout' },
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

  const remainingByCategory = useMemo(() => {
    const rem: Record<'SP' | 'TAG' | 'IDPG' | 'DP' | 'EXT', number | undefined> = { SP: undefined, TAG: undefined, IDPG: undefined, DP: undefined, EXT: undefined };
    if (!boqQuantities) return rem;

    // Sum usage across subtypes for Extended and treat cap as sum of X1H/X1V/X2H/X2V
    const extendedCap = ['X1H','X1V','X2H','X2V']
      .map(k => (boqQuantities as any)[k] as number | undefined)
      .filter((v): v is number => typeof v === 'number')
      .reduce((a, b) => a + b, 0);

    (Object.keys(rem) as Array<keyof typeof rem>).forEach((key) => {
      if (key === 'EXT') {
        const cap = extendedCap;
        if (typeof cap === 'number') {
          const used = usedByCategory.EXT || 0;
          rem[key] = Math.max(0, cap - used);
        }
        return;
      }
      const cap = boqQuantities[key as string] ?? undefined;
      if (typeof cap === 'number') {
        const used = usedByCategory[key as keyof typeof usedByCategory] || 0;
        rem[key] = Math.max(0, cap - used);
      }
    });
    return rem;
  }, [boqQuantities, usedByCategory]);

  // If BOQ not set, redirect to BOQ first
  useEffect(() => {
    // Check if we're coming from BOQ page to avoid immediate redirect
    const isComingFromBOQ = location.state?.fromBOQ;
    
    if (!allowedPanelTypes || allowedPanelTypes.length === 0) {
      // Allow bypass if we're adding to an existing project (edit flow)
      const isAddingToExistingProject = location.state?.isAddingToExistingProject;
      if (!isAddingToExistingProject && !isComingFromBOQ) {
        navigate('/boq', { replace: true });
      }
    }
  }, [allowedPanelTypes, navigate, location.state]);

  // When bypassing BOQ (adding to an existing project or new revision), derive allowed panel types
  // from existing BOQ quantities so we still gate/filter correctly.
  const effectiveAllowedPanelTypes = useMemo(() => {
    // If we have allowedPanelTypes from BOQ, use them
    if (allowedPanelTypes && allowedPanelTypes.length > 0) {
      console.log('Using allowedPanelTypes from BOQ:', allowedPanelTypes);
      return allowedPanelTypes;
    }
    
    // Only use bypass logic for adding to existing projects
    const isAddingToExistingProject = location.state?.isAddingToExistingProject;
    if (!isAddingToExistingProject) {
      console.log('No allowedPanelTypes and not adding to existing project');
      return allowedPanelTypes;
    }
    
    if (!boqQuantities || Object.keys(boqQuantities).length === 0) {
      console.log('No boqQuantities available for bypass');
      return allowedPanelTypes;
    }
    
    const allow: string[] = [];
    if (typeof (boqQuantities as any)['SP'] === 'number' && (boqQuantities as any)['SP'] > 0) allow.push('SP');
    if (typeof (boqQuantities as any)['TAG'] === 'number' && (boqQuantities as any)['TAG'] > 0) allow.push('TAG');
    if (typeof (boqQuantities as any)['IDPG'] === 'number' && (boqQuantities as any)['IDPG'] > 0) allow.push('IDPG');
    if (typeof (boqQuantities as any)['DP'] === 'number' && (boqQuantities as any)['DP'] > 0) allow.push('DP');
    // If any extended subtype has a quantity, enable EXT
    const extKeys = ['X1H','X1V','X2H','X2V'];
    if (extKeys.some(k => typeof (boqQuantities as any)[k] === 'number' && (boqQuantities as any)[k] > 0)) {
      allow.push('EXT');
    }
    console.log('Derived allowedPanelTypes from boqQuantities:', allow);
    return allow;
  }, [allowedPanelTypes, boqQuantities, location.state]);

  const panelTypes = useMemo(() => {
    console.log('effectiveAllowedPanelTypes:', effectiveAllowedPanelTypes);
    console.log('remainingByCategory:', remainingByCategory);
    
    // Start with allowed list (or all if none set)
    const base = (!effectiveAllowedPanelTypes || effectiveAllowedPanelTypes.length === 0)
      ? allPanelTypes
      : allPanelTypes.filter(p => effectiveAllowedPanelTypes.includes(p.key as any));
    
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
                      onClick={() => {
                        if (isEditMode) {
                          // If we're in edit mode, we're adding a NEW panel to an existing project
                          // Don't pass edit mode state since this is a new panel, not editing existing
                          navigate(panel.path, {
                            state: {
                              editMode: false, // This is a new panel, not editing existing
                              projectData: editProjectData,
                              designId: editDesignId,
                              isAddingToExistingProject: true // Flag to indicate we're adding to existing project
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
                        marginLeft: 
                          panel.name === 'Double Panel' 
                            ? '-158px'
                            : panel.name === 'Extended Panel'
                            ? '142px'
                            : undefined,
                      }}
                    >
                      {typeof (boqQuantities as any)?.[panel.key] === 'number' && (
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
                          {Math.max(0, (remainingByCategory as any)?.[panel.key] ?? 0)} left
                        </Box>
                      )}
                      <PanelImage
                        src={panel.image}
                        alt={panel.name}
                        className="panel-image"
                        style={{
                          maxHeight:
                            panel.name === 'Single Panel' || panel.name === 'Thermostat'
                              ? 262
                              : panel.name === 'Corridor Panel'
                              ? 346
                              : panel.name === 'Double Panel'
                              ? 250
                              : panel.name === 'Extended Panel'
                              ? 768
                              : 288,
                          width:
                            panel.name === 'Single Panel' || panel.name === 'Thermostat'
                              ? '107%'
                              : panel.name === 'Corridor Panel'
                              ? '144%'
                              : panel.name === 'Double Panel'
                              ? '87%'
                              : panel.name === 'Extended Panel'
                              ? '264%'
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