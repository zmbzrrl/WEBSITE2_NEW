import React, { useState, useContext, useMemo, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Container,
  Typography,
  Grid,
  Box,
  Button,
  useTheme,
  Chip,
  IconButton,
  TextField,
  CircularProgress,
  Tooltip,
  Switch,
  FormControlLabel,
  Paper,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import SP from "../../assets/panels/SP.png";
import DP from "../../assets/panels/DP.png";
import X2H from "../../assets/panels/X2LS.png";
import X1H from "../../assets/panels/X1RS.png";
import IDPG from "../../assets/panels/IDPG_RN.png";
import TAG from "../../assets/panels/TAG.png";
import logo from "../../assets/logo.png";
import CartButton from "../../components/CartButton";
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
  maxHeight: 250,
  objectFit: 'contain',
  transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  marginBottom: theme.spacing(2),
  '&.extended-panel': {
    maxHeight: '250px !important',
  },
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
  const [isFreeDesignMode, setIsFreeDesignMode] = useState(false);
  const { projectName, projectCode } = useContext(ProjectContext);
  const { projPanels } = useCart();

  // Persist Free Design toggle across navigation/reloads
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('freeDesignMode');
      if (saved === 'true') setIsFreeDesignMode(true);
      if (saved === 'false') setIsFreeDesignMode(false);
    } catch {}
  }, []);

  // BOQ-integrated state
  const importResults = (location.state?.importResults as { project_ids?: string[] } | undefined) || (() => {
    try { return JSON.parse(sessionStorage.getItem('boqImportResults') || 'null'); } catch { return undefined; }
  })();
  const projectIds = (location.state?.projectIds as string[] | undefined) 
    || (importResults?.project_ids as string[] | undefined)
    || (() => { try { return JSON.parse(sessionStorage.getItem('boqProjectIds') || '[]'); } catch { return []; } })();

  // Check if we're in BOQ mode or standalone mode
  const hasBOQ = Array.isArray(projectIds) && projectIds.length > 0;
  const hasProjectCode = !!projectCode; // Check if we have a project code from context
  // Use BOQ mode only when not in free design mode and BOQ data exists
  const hasBOQEffective = hasBOQ && !isFreeDesignMode;
  
  console.log('PanelTypeSelector - hasBOQ:', hasBOQ);
  console.log('PanelTypeSelector - hasProjectCode:', hasProjectCode);
  console.log('PanelTypeSelector - projectIds:', projectIds);
  console.log('PanelTypeSelector - projectCode:', projectCode);

  // Do not redirect away; allow user to enable Free Design Mode from this page
  // Keep a minimal redirecting state for future use if needed
  const [redirecting] = useState(false);
  const [boqLoading, setBoqLoading] = useState(false);
  const [boqFetched, setBoqFetched] = useState(false);
  const [boqError, setBoqError] = useState<string | null>(null);
  const [boqData, setBoqData] = useState<Record<string, {
    fixedTotal: number;
    totalQuantity: number;
    designs: { id: string; name: string; qty: number; projectName: string; panelType: string; maxQty?: number }[];
  }>>({});
  const [adjustedBoqData, setAdjustedBoqData] = useState<typeof boqData>({});
  const [motionFlags, setMotionFlags] = useState<Record<string, boolean>>({});
  const [proximityFlags, setProximityFlags] = useState<Record<string, boolean>>({});
  const [roomNumberFlags, setRoomNumberFlags] = useState<Record<string, boolean>>({});
  const [cardReaderFlags, setCardReaderFlags] = useState<Record<string, boolean>>({});

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
      path: "/customizer/idpg",
      key: 'IDPG',
    },
    {
      name: "Double Panel",
      image: DP,
      path: "/panel/double",
      key: 'DP',
    },
    {
      name: "Extended Panels — 1 Socket",
      image: X1H,
      path: "/panel/extended",
      key: 'EXT1',
    },
    {
      name: "Extended Panels — 2 Sockets",
      image: X2H,
      path: "/panel/extended",
      key: 'EXT2',
    },
  ];

  const mapTypeToCategory = (t: string): 'SP' | 'TAG' | 'IDPG' | 'DP' | 'EXT1' | 'EXT2' => {
    if (t === 'SP') return 'SP';
    if (t === 'TAG') return 'TAG';
    if (t === 'IDPG') return 'IDPG';
    if (t === 'DPH' || t === 'DPV') return 'DP';
    if (t && t.toUpperCase().startsWith('X1')) return 'EXT1';
    if (t && t.toUpperCase().startsWith('X2')) return 'EXT2';
    return 'SP';
  };

  // Load BOQ designs for provided projectIds (only in BOQ mode)
  useEffect(() => {
    const loadBOQ = async () => {
      if (!hasBOQEffective || !projectIds || projectIds.length === 0) {
        setBoqFetched(true); // Mark as fetched even if no BOQ data
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
        const grouped: Record<string, {
          fixedTotal: number;
          totalQuantity: number;
          designs: { id: string; name: string; qty: number; projectName: string; panelType: string; maxQty?: number }[];
        }> = {};
        (data || []).forEach((d: any) => {
          const key = mapTypeToCategory(d.panel_type);
          const qty = (d.design_data && typeof d.design_data.quantity !== 'undefined') ? (Number(d.design_data.quantity) || 0) : 0;
          const maxQty = (d.design_data && typeof d.design_data.maxQuantity !== 'undefined') ? (Number(d.design_data.maxQuantity) || undefined) : undefined;
          if (!grouped[key]) grouped[key] = { fixedTotal: 0, totalQuantity: 0, designs: [] };
          grouped[key].designs.push({ id: d.id, name: d.design_name, qty, projectName: '', panelType: d.panel_type, maxQty });
          grouped[key].fixedTotal += qty;
          grouped[key].totalQuantity += qty;
        });
        setBoqData(grouped);
      } catch (e: any) {
        setBoqError(e?.message || 'Failed to load BOQ data');
      } finally {
        setBoqLoading(false);
        setBoqFetched(true);
      }
    };
    loadBOQ();
  }, [hasBOQEffective, projectIds]);

  // Subtract already designed panels (from current project cart) from BOQ allocations per design
  useEffect(() => {
    if (!hasBOQEffective) { setAdjustedBoqData(boqData); return; }
    const lower = (s: any) => (typeof s === 'string' ? s.trim().toLowerCase() : '');
    const countsByCategoryAndName: Record<'SP'|'TAG'|'IDPG'|'DP'|'EXT1'|'EXT2', Record<string, number>> = {
      SP: {}, TAG: {}, IDPG: {}, DP: {}, EXT1: {}, EXT2: {}
    };
    // Tally used quantities from current projPanels by category and panelName (best-available key)
    for (const panel of projPanels) {
      const cat = mapTypeToCategory(panel.type);
      const nameKey = lower((panel as any).panelName || '');
      const qty = (typeof panel.quantity === 'number' && !isNaN(panel.quantity)) ? panel.quantity : 1;
      if (!nameKey) continue;
      countsByCategoryAndName[cat][nameKey] = (countsByCategoryAndName[cat][nameKey] || 0) + qty;
    }
    // Build adjusted BOQ data with per-design remaining quantities
    const next: typeof boqData = {};
    for (const [catKey, entry] of Object.entries(boqData)) {
      const cat = catKey as 'SP'|'TAG'|'IDPG'|'DP'|'EXT1'|'EXT2';
      const usedMap = countsByCategoryAndName[cat] || {};
      const designs = (entry.designs || []).map(d => {
        const used = usedMap[lower(d.name)] || 0;
        const remaining = Math.max(0, (typeof d.qty === 'number' ? d.qty : 0) - used);
        return { ...d, qty: remaining };
      }).filter(d => d.qty > 0); // hide fully completed designs
      const totalQuantity = designs.reduce((s, d) => s + d.qty, 0);
      next[cat] = { fixedTotal: entry.fixedTotal, totalQuantity, designs };
    }
    setAdjustedBoqData(next);
  }, [boqData, projPanels, hasBOQEffective]);

  // Allocation update (fixed totals)
  const updateAlloc = (cat: 'SP'|'TAG'|'IDPG'|'DP'|'EXT1'|'EXT2', designId: string, newQty: number) => {
    if (newQty < 0) return;
    setBoqData(prev => {
      const current = { ...(prev[cat] || { fixedTotal: 0, totalQuantity: 0, designs: [] }) } as typeof prev[typeof cat];
      const target = (current.designs || []).find(d => d.id === designId);
      const perDesignMax = typeof target?.maxQty === 'number' && !isNaN(target.maxQty) ? target.maxQty : Number.POSITIVE_INFINITY;
      const sumOther = current.designs.reduce((s, d) => s + (d.id === designId ? 0 : d.qty), 0);
      const remaining = Math.max(0, current.fixedTotal - sumOther);
      const clamped = Math.max(0, Math.min(newQty, remaining, perDesignMax));
      current.designs = current.designs.map(d => d.id === designId ? { ...d, qty: clamped } : d);
      current.totalQuantity = current.designs.reduce((s, d) => s + d.qty, 0);
      return { ...prev, [cat]: current };
    });
  };

  const usedByCategory = useMemo(() => {
    const counts: Record<'SP' | 'TAG' | 'IDPG' | 'DP' | 'EXT1' | 'EXT2', number> = { SP: 0, TAG: 0, IDPG: 0, DP: 0, EXT1: 0, EXT2: 0 };
    for (const item of projPanels) {
      const cat = mapTypeToCategory(item.type);
      const qty = typeof item.quantity === 'number' && !isNaN(item.quantity) ? item.quantity : 1;
      counts[cat] += qty;
    }
    return counts;
  }, [projPanels]);

  // Load Motion/Proximity/IDPG flags for all designs
  useEffect(() => {
    const loadFlags = async () => {
      if (!hasBOQEffective || !projectIds || projectIds.length === 0) {
        return;
      }

      try {
        const { data: designs, error } = await supabase
          .from('user_designs')
          .select('id, design_data')
          .in('prop_id', projectIds);

        if (error) throw error;

        const motionFlagsMap: Record<string, boolean> = {};
        const proximityFlagsMap: Record<string, boolean> = {};
        const roomNumberFlagsMap: Record<string, boolean> = {};
        const cardReaderFlagsMap: Record<string, boolean> = {};
        const toBool = (v: any): boolean => {
          if (typeof v === 'boolean') return v;
          if (typeof v === 'string') {
            const s = v.trim().toLowerCase();
            return s === 'true' || s === 'yes' || s === 'y' || s === '1';
          }
          if (typeof v === 'number') return v === 1;
          return false;
        };

        designs?.forEach((design: any) => {
          const or = design.design_data?.originalRow || {};
          const feat = design.design_data?.features || {};
          const pd = design.design_data?.panelDesign || {};

          const motionFlag = toBool(or.Motion) || toBool(feat.Motion);
          const proximityFlag = toBool(or.Proximity) || toBool(feat.Proximity);
          const roomNumberFlag = (
            toBool(or.RoomNumber) ||
            toBool(or['Room Number']) ||
            toBool(feat.RoomNumber) ||
            toBool(feat['Room Number']) ||
            toBool(pd?.idpgConfig?.roomNumber)
          );
          const cardReaderFlag = (
            toBool(or.CardReader) ||
            toBool(or['Card reader']) ||
            toBool(or['Card Reader']) ||
            toBool(feat.CardReader) ||
            toBool(feat['Card reader']) ||
            toBool(feat['Card Reader']) ||
            toBool(pd?.idpgConfig?.cardReader)
          );
          
          if (motionFlag === true) {
            motionFlagsMap[design.id] = true;
          }
          if (proximityFlag === true) {
            proximityFlagsMap[design.id] = true;
          }
          if (roomNumberFlag === true) {
            roomNumberFlagsMap[design.id] = true;
          }
          if (cardReaderFlag === true) {
            cardReaderFlagsMap[design.id] = true;
          }
        });

        setMotionFlags(motionFlagsMap);
        setProximityFlags(proximityFlagsMap);
        setRoomNumberFlags(roomNumberFlagsMap);
        setCardReaderFlags(cardReaderFlagsMap);
        console.log('🔍 Loaded motion flags:', motionFlagsMap);
        console.log('🔍 Loaded proximity flags:', proximityFlagsMap);
        console.log('🔍 Loaded room number flags:', roomNumberFlagsMap);
        console.log('🔍 Loaded card reader flags:', cardReaderFlagsMap);
      } catch (error) {
        console.error('Error loading motion flags:', error);
      }
    };

    loadFlags();
  }, [hasBOQEffective, projectIds]);

  const remainingByCategory = useMemo(() => ({ SP: undefined, TAG: undefined, IDPG: undefined, DP: undefined, EXT1: undefined, EXT2: undefined } as Record<'SP'|'TAG'|'IDPG'|'DP'|'EXT1'|'EXT2', number | undefined>), [usedByCategory]);

  // BOQ removed: no redirects or gating

  const effectiveAllowedPanelTypes: string[] = useMemo(() => [], []);

  const panelTypes = useMemo(() => {
    console.log('effectiveAllowedPanelTypes:', effectiveAllowedPanelTypes);
    console.log('remainingByCategory:', remainingByCategory);
    console.log('boqData keys:', Object.keys(boqData));
    console.log('adjustedBoqData keys:', Object.keys(adjustedBoqData));
    console.log('isFreeDesignMode:', isFreeDesignMode);
    
    // If in free design mode, show all panel types
    if (isFreeDesignMode) {
      console.log('Free design mode - showing all panel types');
      return allPanelTypes;
    }
    
    // If BOQ mode is active, only show categories present in BOQ; else show all
    const presentKeys = new Set(Object.keys(adjustedBoqData));
    const base = hasBOQEffective
      ? (presentKeys.size > 0 ? allPanelTypes.filter(p => presentKeys.has(p.key)) : [])
      : allPanelTypes;
    
    console.log('Base panelTypes after filtering:', base.map(p => p.name));
    
    // Further filter by remaining BOQ quantities if provided
    const final = base.filter(p => {
      const remaining = remainingByCategory[p.key as 'SP' | 'TAG' | 'IDPG' | 'DP' | 'EXT1' | 'EXT2'];
      const shouldKeep = remaining === undefined || remaining > 0;
      console.log(`Panel ${p.name} (${p.key}): remaining=${remaining}, shouldKeep=${shouldKeep}`);
      // If no BOQ quantity specified for this category, keep it. If specified, require remaining > 0
      return shouldKeep;
    });
    
    console.log('Final panelTypes:', final.map(p => p.name));
    return final;
  }, [effectiveAllowedPanelTypes, allPanelTypes, remainingByCategory, hasBOQEffective, adjustedBoqData, isFreeDesignMode]);

  // If BOQ not fetched yet, show loading state (prevents plain selector flash)
  // Only show loading if we're in BOQ mode and haven't fetched BOQ data yet
  if (redirecting) {
    return null;
  }
  if (hasBOQEffective && !boqFetched) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #718096 0%, #a0aec0 100%)' }}>
        <Box sx={{ textAlign: 'center', color: 'rgba(255,255,255,0.9)' }}>
          <CircularProgress thickness={4} size={48} sx={{ color: '#ffffff', mb: 2 }} />
          <Typography sx={{ letterSpacing: 0.5 }}>Loading project panels...</Typography>
        </Box>
      </Box>
    );
  }

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

        {/* Design Mode Toggle */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          mb: 4,
          mt: 2
        }}>
          <Paper sx={{ 
            p: 2, 
            backgroundColor: 'rgba(255, 255, 255, 0.1)', 
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: 2
          }}>
            <FormControlLabel
              control={
                <Switch
                  checked={isFreeDesignMode}
                  onChange={(e) => {
                    const val = e.target.checked;
                    setIsFreeDesignMode(val);
                    try { sessionStorage.setItem('freeDesignMode', String(val)); } catch {}
                  }}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: '#1976d2',
                      '& + .MuiSwitch-track': {
                        backgroundColor: '#1976d2',
                      },
                    },
                    '& .MuiSwitch-track': {
                      backgroundColor: 'rgba(255, 255, 255, 0.3)',
                    },
                  }}
                />
              }
              label={
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                  <Typography sx={{ 
                    color: 'rgba(255, 255, 255, 0.9)', 
                    fontWeight: 600,
                    fontSize: '14px',
                    fontFamily: '"Myriad Hebrew", "Monsal Gothic", sans-serif'
                  }}>
                    {isFreeDesignMode ? 'Free Design Mode' : 'Import-Based Design'}
                  </Typography>
                  <Typography sx={{ 
                    color: 'rgba(255, 255, 255, 0.7)', 
                    fontSize: '12px',
                    fontFamily: '"Myriad Hebrew", "Monsal Gothic", sans-serif',
                    textAlign: 'center'
                  }}>
                    {isFreeDesignMode 
                      ? 'Design freely with all panel options available' 
                      : 'Design based on imported BOQ specifications'
                    }
                  </Typography>
                </Box>
              }
              sx={{ 
                margin: 0,
                '& .MuiFormControlLabel-label': {
                  marginLeft: 2
                }
              }}
            />
          </Paper>
        </Box>

        {(showPanels && panelTypes.length > 0) && (
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
                  sm={panel.name === 'Double Panel' || panel.name.startsWith('Extended Panels') ? 12 : 6} 
                  md={panel.name === 'Double Panel' || panel.name.startsWith('Extended Panels') ? 6 : 4}
                  component="div"
                >
                  <StyledPanel variants={itemVariants}>
                    <PanelContainer
                      sx={{
                        cursor: 'default',
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
                        className={`panel-image ${panel.name.startsWith('Extended Panels') ? 'extended-panel' : ''}`}
                        style={{
                          maxHeight:
                            panel.name === 'Single Panel' || panel.name === 'Thermostat'
                              ? 183
                              : panel.name === 'Corridor Panel'
                              ? 277
                              : panel.name === 'Double Panel'
                              ? 250
                              : panel.name.startsWith('Extended Panels')
                              ? 250
                              : 288,
                          width:
                            panel.name === 'Single Panel' || panel.name === 'Thermostat'
                              ? '75%'
                              : panel.name === 'Corridor Panel'
                              ? '115%'
                              : panel.name === 'Double Panel'
                              ? '87%'
                              : panel.name.startsWith('Extended Panels')
                              ? '96%'
                              : '120%',
                          marginBottom: 16,
                          marginTop: panel.name === 'Double Panel' || panel.name.startsWith('Extended Panels') ? 0 : undefined,
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
                        disabled={!isFreeDesignMode}
                        onClick={() => {
                          if (isFreeDesignMode) {
                            // Navigate to customizer in free design mode
                            navigate(panel.path, { 
                              state: { 
                                fromFreeDesign: true,
                                projectName,
                                projectCode,
                                socketCategory: panel.key // Pass the socket category for free design mode too
                              } 
                            });
                          }
                        }}
                        sx={{
                          color: isFreeDesignMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.3)',
                          textTransform: 'none',
                          fontWeight: 400,
                          letterSpacing: '0.5px',
                          opacity: isFreeDesignMode ? 1 : 0,
                          transform: isFreeDesignMode ? 'translateY(0)' : 'translateY(10px)',
                          transition: 'all 0.3s ease',
                          fontFamily: '"Myriad Hebrew", "Monsal Gothic", sans-serif',
                          cursor: isFreeDesignMode ? 'pointer' : 'not-allowed',
                          '&:hover': {
                            color: isFreeDesignMode ? '#ffffff' : 'rgba(255, 255, 255, 0.3)',
                            backgroundColor: isFreeDesignMode ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                          },
                          '&.Mui-disabled': {
                            color: 'rgba(255, 255, 255, 0.3)',
                          },
                        }}
                      >
                        {isFreeDesignMode ? 'Design Panel' : 'Select Panel'}
                      </Button>
                      {/* BOQ allocation for this category if available - only show when not in free design mode */}
                      {!isFreeDesignMode && hasBOQEffective && adjustedBoqData[panel.key as 'SP'|'TAG'|'IDPG'|'DP'|'EXT'] && (
                        <Box sx={{ mt: 2, width: '100%', maxWidth: 520 }} onClick={(e) => e.stopPropagation()}>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 1 }}>
                            <Typography variant="subtitle2" sx={{ color: 'rgba(255,255,255,0.9)' }}>Quantity</Typography>
                            <Chip label={`${adjustedBoqData[panel.key as any].totalQuantity} / ${adjustedBoqData[panel.key as any].fixedTotal}`} size="small" color="primary" />
                          </Box>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            {adjustedBoqData[panel.key as any].designs.map(d => {
                              const atMax = typeof d.maxQty === 'number' && d.qty >= d.maxQty;
                              return (
                                <Box
                                  key={d.id}
                                  sx={{
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    alignItems: 'center',
                                    gap: 1.5,
                                    background: 'rgba(255,255,255,0.06)',
                                    p: 1,
                                    borderRadius: 1
                                  }}
                                >
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1, minWidth: 160 }}>
                                    <Typography
                                      variant="body2" 
                                      sx={{ 
                                        color: 'rgba(255,255,255,0.9)', 
                                        flex: 1,
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap'
                                      }}
                                    >
                                      {d.name}
                                    </Typography>
                                    {motionFlags[d.id] && (
                                      <Tooltip title="Motion sensor will be automatically added">
                                        <Box
                                          sx={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            width: 28,
                                            height: 28,
                                            borderRadius: '50%',
                                            backgroundColor: '#4caf50',
                                            color: 'white',
                                            fontSize: '11px',
                                            fontWeight: 'bold',
                                            flexShrink: 0
                                          }}
                                        >
                                          PIR
                                        </Box>
                                      </Tooltip>
                                    )}
                                    {proximityFlags[d.id] && (
                                      <Tooltip title="Proximity sensor will be automatically added">
                                        <Box
                                          sx={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            width: 28,
                                            height: 28,
                                            borderRadius: '50%',
                                            backgroundColor: '#ff9800',
                                            color: 'white',
                                            fontSize: '11px',
                                            fontWeight: 'bold',
                                            flexShrink: 0
                                          }}
                                        >
                                          PROX
                                        </Box>
                                      </Tooltip>
                                    )}
                                    {roomNumberFlags[d.id] && (
                                      <Tooltip title="Room Number configured">
                                        <Box
                                          sx={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            width: 28,
                                            height: 28,
                                            borderRadius: '50%',
                                            backgroundColor: '#2196f3',
                                            color: 'white',
                                            fontSize: '11px',
                                            fontWeight: 'bold',
                                            flexShrink: 0
                                          }}
                                        >
                                          RN
                                        </Box>
                                      </Tooltip>
                                    )}
                                    {cardReaderFlags[d.id] && (
                                      <Tooltip title="Card reader configured">
                                        <Box
                                          sx={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            width: 28,
                                            height: 28,
                                            borderRadius: '50%',
                                            backgroundColor: '#9c27b0',
                                            color: 'white',
                                            fontSize: '11px',
                                            fontWeight: 'bold',
                                            flexShrink: 0
                                          }}
                                        >
                                          CR
                                        </Box>
                                      </Tooltip>
                                    )}
                                  </Box>
                                  <Chip
                                    label={`Max: ${typeof d.maxQty === 'number' ? d.maxQty : '-'}`}
                                    size="small"
                                    variant="outlined"
                                    sx={{ color: 'rgba(255,255,255,0.9)', borderColor: 'rgba(255,255,255,0.3)' }}
                                  />
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <IconButton size="small" onClick={() => updateAlloc(panel.key as any, d.id, d.qty - 1)} disabled={d.qty <= 0}>
                                  <span style={{ color: 'white' }}>-</span>
                                </IconButton>
                                <TextField 
                                  value={d.qty}
                                      onChange={(e) => {
                                        const v = parseInt(e.target.value);
                                        updateAlloc(panel.key as any, d.id, isNaN(v) ? 0 : v);
                                      }}
                                  type="number"
                                  size="small"
                                      sx={{ 
                                        width: 80,
                                        '& input': { 
                                          textAlign: 'center', 
                                          padding: '6px 10px',
                                          color: 'white',
                                        },
                                        '& input[type=number]': { MozAppearance: 'textfield' },
                                        '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': { WebkitAppearance: 'none', margin: 0 }
                                      }}
                                      inputProps={{ 
                                        min: 0, 
                                        max: typeof d.maxQty === 'number' ? d.maxQty : undefined
                                      }}
                                    />
                                    <IconButton size="small" onClick={() => updateAlloc(panel.key as any, d.id, d.qty + 1)} disabled={atMax}>
                                      <span style={{ color: atMax ? 'rgba(255,255,255,0.4)' : 'white' }}>+</span>
                                </IconButton>
                                  </Box>
                                  <Button 
                                    variant="outlined" 
                                    size="small" 
                                    onClick={async () => {
                                      // Check Motion/Proximity flags and prepare state for downstream customizers
                                      let motionFlagData = null;
                                      let proximityFlag = false;
                                      try {
                                        const { data: designData, error } = await supabase
                                          .from('user_designs')
                                          .select('design_data')
                                          .eq('id', d.id)
                                          .single();
                                        
                                        if (designData && !error) {
                                          const motionFlag = designData.design_data?.originalRow?.Motion || designData.design_data?.features?.Motion;
                                          const proxFlag = designData.design_data?.originalRow?.Proximity || designData.design_data?.features?.Proximity;
                                          console.log('🔍 Motion flag check for design:', d.name, 'Motion:', motionFlag);
                                          console.log('🔍 Proximity flag check for design:', d.name, 'Proximity:', proxFlag);
                                          
                                          if (motionFlag === true) {
                                            motionFlagData = {
                                              hasMotionFlag: true,
                                              designId: d.id,
                                              panelType: panel.key
                                            };
                                            console.log('✅ Motion flag is true - will place PIR icon automatically');
                                          }
                                          if (proxFlag === true) {
                                            proximityFlag = true;
                                            try { sessionStorage.setItem(`boqProximity:${d.id}`, 'true'); } catch {}
                                            console.log('✅ Proximity flag is true - will show proximity indicators');
                                          } else {
                                            try { sessionStorage.removeItem(`boqProximity:${d.id}`); } catch {}
                                          }
                                        }
                                      } catch (error) {
                                        console.error('Error checking Motion flag:', error);
                                      }
                                      
                                      navigate(panel.path, { 
                                        state: { 
                                          fromBOQ: true, 
                                          projectIds, 
                                          importResults, 
                                          selectedDesignId: d.id, 
                                          selectedDesignName: d.name, 
                                          selectedDesignQuantity: d.qty,
                                          selectedDesignMaxQuantity: typeof d.maxQty === 'number' ? d.maxQty : undefined,
                                          motionFlagData,
                                          proximityFlag,
                                          roomNumberFlag: !!roomNumberFlags[d.id],
                                          cardReaderFlag: !!cardReaderFlags[d.id],
                                          socketCategory: panel.key // Pass the socket category (EXT1 or EXT2)
                                        } 
                                      });
                                    }}
                                    sx={{ 
                                      ml: 'auto',
                                      color: '#0d47a1',
                                      borderColor: '#0d47a1',
                                      '&:hover': { color: '#0b3c91', borderColor: '#0b3c91', backgroundColor: 'transparent' }
                                    }}
                                  >
                                  Design
                                </Button>
                              </Box>
                              );
                            })}
                          </Box>
                        </Box>
                      )}
                    </PanelContainer>
                  </StyledPanel>
                </Grid>
              ))}
            </Grid>
          </motion.div>
        )}
        {!isFreeDesignMode && hasBOQEffective && boqFetched && panelTypes.length === 0 && (
          <Box sx={{ textAlign: 'center', color: 'rgba(255,255,255,0.9)', mt: 6 }}>
            <Typography>No panel designs were found in the imported JSON for this selection.</Typography>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default PanelTypeSelector; 
