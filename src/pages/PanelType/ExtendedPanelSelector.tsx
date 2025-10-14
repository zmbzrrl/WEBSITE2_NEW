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
import X1LS from "../../assets/panels/X1RS.png";
import X1RS from "../../assets/panels/X1RS.png";
import X1V from "../../assets/panels/X1V_UP.png";
import X2LS from "../../assets/panels/X2LS.png";
import X2V from "../../assets/panels/X2V_UP.png";
import logo from "../../assets/logo.png";
import logo2 from "../../assets/logo.png";
import CartButton from "../../components/CartButton";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { ProjectContext } from '../../App';
import { useCart } from '../../contexts/CartContext';
import { supabase } from '../../utils/supabaseClient';

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
  const location = useLocation();
  const theme = useTheme();
  const [showPanels, setShowPanels] = useState(false);
  const { projectName, projectCode } = useContext(ProjectContext);
  const { projPanels } = useCart();

  // BOQ data loading
  const [boqData, setBoqData] = useState<Record<string, any>>({});
  const [boqLoading, setBoqLoading] = useState(false);
  const [boqFetched, setBoqFetched] = useState(false);
  const [boqError, setBoqError] = useState<string | null>(null);

  // Get project IDs from location state or session storage
  const projectIds = location.state?.projectIds || (() => {
    try { return JSON.parse(sessionStorage.getItem('boqProjectIds') || '[]'); } catch { return []; }
  })();

  const importResults = location.state?.importResults || (() => {
    try { return JSON.parse(sessionStorage.getItem('boqImportResults') || 'null'); } catch { return undefined; }
  })();

  const hasBOQEffective = (projectIds && projectIds.length > 0) || !!importResults;

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowPanels(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Load BOQ data
  useEffect(() => {
    const loadBOQ = async () => {
      if (!hasBOQEffective || !projectIds || projectIds.length === 0) {
        setBoqFetched(true);
        return;
      }
      try {
        setBoqLoading(true);
        setBoqError(null);
        const { data, error } = await supabase
          .from('user_designs')
          .select('id, design_name, panel_type, prop_id, design_data')
          .in('prop_id', projectIds);
        if (error) throw new Error(error.message);
        
        // Group by panel type and extract allowed subtypes
        const allowedSubtypes = new Set<string>();
        (data || []).forEach((d: any) => {
          if (d.panel_type && d.panel_type.startsWith('X')) {
            allowedSubtypes.add(d.panel_type);
          }
          
          // Check if this design requires panel type selection (from import flags)
          if (d.design_data && d.design_data.requiresPanelTypeSelection) {
            if (d.design_data.availablePanelTypes) {
              // Add the special marker for ambiguous cases
              if (d.design_data.availablePanelTypes.includes('X1H') && d.design_data.availablePanelTypes.includes('X1V')) {
                allowedSubtypes.add('X1H_X1V');
              }
              if (d.design_data.availablePanelTypes.includes('X2H') && d.design_data.availablePanelTypes.includes('X2V')) {
                allowedSubtypes.add('X2H_X2V');
              }
            }
          }
        });
        
        setBoqData({ allowedSubtypes: Array.from(allowedSubtypes) });
      } catch (e: any) {
        setBoqError(e?.message || 'Failed to load BOQ data');
      } finally {
        setBoqLoading(false);
        setBoqFetched(true);
      }
    };
    loadBOQ();
  }, [hasBOQEffective, projectIds]);

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
  const remainingEXT = useMemo(() => Infinity, [usedEXT]);

  // BOQ removed: no redirects

  

	// Group by socket count instead of orientation
	const oneSocketPanels = [
		{
			name: "Horizontal, 1 Socket",
			image: X1LS,
			path: "/customizer/x1h",
			subtype: 'X1H' as const,
		},
		{
			name: "Vertical, 1 Socket",
			image: X1V,
			path: "/customizer/x1v",
			subtype: 'X1V' as const,
		},
	];
	const twoSocketPanels = [
		{
			name: "Horizontal, 2 Sockets",
			image: X2LS,
			path: "/customizer/x2h",
			subtype: 'X2H' as const,
		},
		{
			name: "Vertical, 2 Sockets",
			image: X2V,
			path: "/customizer/x2v",
			subtype: 'X2V' as const,
		},
	];

  // Get socket category from navigation state
  const socketCategory = location.state?.socketCategory;
  console.log('ExtendedPanelSelector - location.state:', location.state);
  console.log('ExtendedPanelSelector - socketCategory:', socketCategory);

  // Determine which extended subtypes are allowed from BOQ selections
  const allowedEXTSubtypes = useMemo(() => {
    if (!hasBOQEffective || !boqData.allowedSubtypes) {
      // If no BOQ data, filter based on socket category if provided
      if (socketCategory === 'EXT1') {
        return ['X1H', 'X1V']; // Only show 1-socket panels
      } else if (socketCategory === 'EXT2') {
        return ['X2H', 'X2V']; // Only show 2-socket panels
      }
      return ['X1H','X1V','X2H','X2V']; // Show all if no socket category specified
    }
    
    // Special logic: if X2H_X2V is in the data, show both X2H and X2V
    // This happens when Extended 2-socket is true
    const subtypes = new Set<string>();
    boqData.allowedSubtypes.forEach((subtype: string) => {
      if (subtype === 'X2H_X2V') {
        subtypes.add('X2H');
        subtypes.add('X2V');
      } else if (subtype === 'X1H_X1V') {
        subtypes.add('X1H');
        subtypes.add('X1V');
      } else {
        subtypes.add(subtype);
      }
    });
    
    // Filter based on socket category if provided
    if (socketCategory === 'EXT1') {
      return Array.from(subtypes).filter(subtype => subtype.startsWith('X1'));
    } else if (socketCategory === 'EXT2') {
      return Array.from(subtypes).filter(subtype => subtype.startsWith('X2'));
    }
    
    return Array.from(subtypes);
  }, [hasBOQEffective, boqData, socketCategory]);

	// Filter panels to only show selected subtypes
	const filteredOneSocket = useMemo(() => 
		oneSocketPanels.filter(panel => allowedEXTSubtypes.includes(panel.subtype)), 
		[allowedEXTSubtypes]
	);
	const filteredTwoSocket = useMemo(() => 
		twoSocketPanels.filter(panel => allowedEXTSubtypes.includes(panel.subtype)), 
		[allowedEXTSubtypes]
	);

  // Per-subtype remaining function
  const remainingForSubtype = (subtype: 'X1H' | 'X1V' | 'X2H' | 'X2V') => undefined;

  // Show loading state if BOQ data is being fetched
  if (hasBOQEffective && !boqFetched) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #718096 0%, #a0aec0 100%)' }}>
        <Box sx={{ textAlign: 'center', color: 'rgba(255,255,255,0.9)' }}>
          <LinearProgress sx={{ width: 200, mb: 2 }} />
          <Typography sx={{ letterSpacing: 0.5 }}>Loading extended panel options...</Typography>
        </Box>
      </Box>
    );
  }

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
			{/* Show message if no extended panels are available */}
			{hasBOQEffective && filteredOneSocket.length === 0 && filteredTwoSocket.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography sx={{ 
                  color: 'rgba(255,255,255,0.9)', 
                  fontSize: 18, 
                  mb: 2,
                  fontFamily: '"Myriad Hebrew", "Monsal Gothic", sans-serif'
                }}>
                  No extended panels available for this project
                </Typography>
                <Typography sx={{ 
                  color: 'rgba(255,255,255,0.7)', 
                  fontSize: 14,
                  fontFamily: '"Myriad Hebrew", "Monsal Gothic", sans-serif'
                }}>
                  Only the extended panel types specified in your import are shown
                </Typography>
              </Box>
            )}

			{filteredOneSocket.length > 0 && (
              <>
					{/* One-socket Panels Section */}
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
						Extended Panels — 1 Socket
                  </Typography>
                  <Box sx={{ width: 32, height: 2, bgcolor: '#1976d2', borderRadius: 1, mt: 0.5 }} />
                </Box>
				<Grid container spacing={4} justifyContent="center" sx={{ mb: 4 }}>
					{filteredOneSocket.map((panel) => (
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
                      onClick={() => navigate(panel.path, { 
                        state: { 
                          proximityFlag: location.state?.proximityFlag,
                          motionFlagData: location.state?.motionFlagData,
                          selectedDesignId: location.state?.selectedDesignId,
                          fromBOQ: location.state?.fromBOQ,
                          projectIds: location.state?.projectIds,
                          importResults: location.state?.importResults
                        } 
                      })}
                      sx={{
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        p: 3,
                      }}
                    >
                      {/* BOQ removed: no remaining badges */}
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
                        onClick={() => navigate(panel.path, { 
                        state: { 
                          proximityFlag: location.state?.proximityFlag,
                          motionFlagData: location.state?.motionFlagData,
                          selectedDesignId: location.state?.selectedDesignId,
                          fromBOQ: location.state?.fromBOQ,
                          projectIds: location.state?.projectIds,
                          importResults: location.state?.importResults
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
              </>
            )}

			{filteredTwoSocket.length > 0 && (
              <>
					{/* Two-socket Panels Section */}
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
						Extended Panels — 2 Sockets
                  </Typography>
                  <Box sx={{ width: 32, height: 2, bgcolor: '#1976d2', borderRadius: 1, mt: 0.5 }} />
                </Box>
					<Grid container spacing={4} justifyContent="center">
				{filteredTwoSocket.map((panel) => (
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
                      onClick={() => navigate(panel.path, { 
                        state: { 
                          proximityFlag: location.state?.proximityFlag,
                          motionFlagData: location.state?.motionFlagData,
                          selectedDesignId: location.state?.selectedDesignId,
                          fromBOQ: location.state?.fromBOQ,
                          projectIds: location.state?.projectIds,
                          importResults: location.state?.importResults
                        } 
                      })}
                      sx={{
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        p: 3,
                      }}
                    >
                      {/* BOQ removed: no remaining badges */}
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
                        onClick={() => navigate(panel.path, { 
                        state: { 
                          proximityFlag: location.state?.proximityFlag,
                          motionFlagData: location.state?.motionFlagData,
                          selectedDesignId: location.state?.selectedDesignId,
                          fromBOQ: location.state?.fromBOQ,
                          projectIds: location.state?.projectIds,
                          importResults: location.state?.importResults
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
              </>
            )}
          </motion.div>
        )}
      </Container>
    </Box>
  );
};

export default ExtendedPanelSelector; 