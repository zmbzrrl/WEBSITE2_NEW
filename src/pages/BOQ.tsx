import React, { useContext, useMemo, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Box, Typography, Button, Checkbox, FormControlLabel, Paper, Divider, TextField } from "@mui/material";
import { styled } from '@mui/material/styles';
import { ProjectContext } from "../App";

const PageContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'linear-gradient(135deg, #2c3e50 0%, #4a5568 100%)',
  padding: theme.spacing(4),
}));

const Card = styled(Paper)(({ theme }) => ({
  width: '100%',
  maxWidth: 840,
  padding: theme.spacing(4),
  borderRadius: 16,
  background: 'rgba(255,255,255,0.96)',
  boxShadow: '0 8px 32px rgba(0,0,0,0.15)'
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontSize: '1.6rem',
  fontWeight: 700,
  color: '#2c3e50',
  marginBottom: theme.spacing(1),
}));

const SubTitle = styled(Typography)(({ theme }) => ({
  color: '#556',
  marginBottom: theme.spacing(3),
}));

const OptionsGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
  gap: theme.spacing(2),
  marginTop: theme.spacing(1),
}));

const OptionItem = styled(Box)(({ theme }) => ({
  border: '1px solid rgba(0,0,0,0.08)',
  borderRadius: 12,
  padding: theme.spacing(2),
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1.5),
  background: '#fff',
}));

type PanelKey = 'SP' | 'TAG' | 'IDPG' | 'DP' | 'X1H' | 'X1V' | 'X2H' | 'X2V';

const ALL_PANELS: { key: PanelKey; label: string; description: string }[] = [
  { key: 'SP', label: 'Single Panel', description: 'Standard single gang control panel' },
  { key: 'TAG', label: 'Thermostat', description: 'Thermostat / TAG panel' },
  { key: 'IDPG', label: 'Corridor Panel', description: 'Corridor door panel (IDPG)' },
  { key: 'DP', label: 'Double Panel', description: 'Horizontal / Vertical double panels' },
  { key: 'X1H', label: 'Extended Panel X1H', description: 'Extended, 1 socket, Horizontal' },
  { key: 'X1V', label: 'Extended Panel X1V', description: 'Extended, 1 socket, Vertical' },
  { key: 'X2H', label: 'Extended Panel X2H', description: 'Extended, 2 sockets, Horizontal' },
  { key: 'X2V', label: 'Extended Panel X2V', description: 'Extended, 2 sockets, Vertical' },
];

const BOQ: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { allowedPanelTypes, setAllowedPanelTypes, setBoqQuantities, boqQuantities, projectName, projectCode } = useContext(ProjectContext);

  const [selected, setSelected] = useState<PanelKey[]>(() => (allowedPanelTypes as PanelKey[]) || []);
  const [quantities, setQuantities] = useState<Record<PanelKey, number>>(() => {
    const initial: Record<PanelKey, number> = { SP: 0, TAG: 0, IDPG: 0, DP: 0, X1H: 0, X1V: 0, X2H: 0, X2V: 0 } as any;
    Object.keys(boqQuantities || {}).forEach((k) => {
      const key = k as PanelKey;
      initial[key] = (boqQuantities as any)[key] || 0;
    });
    return initial;
  });

  useEffect(() => {
    // If returning here with existing selection, initialize from context
    if (allowedPanelTypes.length > 0) {
      setSelected(allowedPanelTypes as PanelKey[]);
    }
  }, [allowedPanelTypes]);

  const allChecked = useMemo(() => selected.length === ALL_PANELS.length, [selected]);
  const anyChecked = useMemo(() => selected.length > 0, [selected]);

  const toggle = (key: PanelKey) => {
    setSelected(prev => {
      const next = prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key];
      setQuantities(q => {
        const nextQ = { ...q };
        if (next.includes(key)) {
          nextQ[key] = Math.max(1, nextQ[key] || 1);
        } else {
          nextQ[key] = 0;
        }
        return nextQ;
      });
      return next;
    });
  };

  const handleSelectAll = () => {
    setSelected(ALL_PANELS.map(p => p.key));
    setQuantities(p => ({
      SP: Math.max(1, (p as any).SP || 1),
      TAG: Math.max(1, (p as any).TAG || 1),
      IDPG: Math.max(1, (p as any).IDPG || 1),
      DP: Math.max(1, (p as any).DP || 1),
      X1H: Math.max(1, (p as any).X1H || 1),
      X1V: Math.max(1, (p as any).X1V || 1),
      X2H: Math.max(1, (p as any).X2H || 1),
      X2V: Math.max(1, (p as any).X2V || 1),
    } as any));
  };

  const handleClearAll = () => {
    setSelected([]);
    setQuantities({ SP: 0, TAG: 0, IDPG: 0, DP: 0, X1H: 0, X1V: 0, X2H: 0, X2V: 0 } as any);
  };

  const handleContinue = () => {
    // Gate high-level categories on the selector screen
    const allow: string[] = [];
    if (selected.includes('SP')) allow.push('SP');
    if (selected.includes('TAG')) allow.push('TAG');
    if (selected.includes('IDPG')) allow.push('IDPG');
    if (selected.includes('DP')) allow.push('DP');
    if (selected.some(k => ['X1H','X1V','X2H','X2V'].includes(k))) allow.push('EXT');
    setAllowedPanelTypes(allow);

    // Persist per-type BOQ quantities (including subtypes)
    const compact: Record<string, number> = {};
    selected.forEach(k => { compact[k] = Math.max(1, quantities[k] || 1); });
    setBoqQuantities(compact);
    navigate('/panel-type');
  };

  return (
    <PageContainer>
      <Card>
        <SectionTitle>
          Bill of Quantities
        </SectionTitle>
        <SubTitle>
          Select which panel categories are included in this project{(projectName || projectCode) ? ` for ${projectName}${projectCode ? ` - ${projectCode}` : ''}` : ''}. These will be the only options shown on the next screen.
        </SubTitle>

        <OptionsGrid>
          {ALL_PANELS.map(opt => (
            <OptionItem key={opt.key}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%', justifyContent: 'space-between' }}>
                <FormControlLabel
                  control={<Checkbox checked={selected.includes(opt.key)} onChange={() => toggle(opt.key)} />}
                  label={
                    <Box>
                      <Typography sx={{ fontWeight: 600, color: '#2c3e50' }}>{opt.label}</Typography>
                      <Typography sx={{ fontSize: 12, color: '#6b7280' }}>{opt.description}</Typography>
                    </Box>
                  }
                />
                <TextField
                  type="number"
                  label="Qty"
                  size="small"
                  inputProps={{ min: 1 }}
                  sx={{ width: 100 }}
                  disabled={!selected.includes(opt.key)}
                  value={selected.includes(opt.key) ? (quantities[opt.key] || 1) : ''}
                  onChange={(e) => {
                    const val = Math.max(1, parseInt(e.target.value || '1', 10));
                    setQuantities(q => ({ ...q, [opt.key]: val } as any));
                  }}
                />
              </Box>
            </OptionItem>
          ))}
        </OptionsGrid>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="text" onClick={() => navigate(-1)}>← Back</Button>
            <Button variant="text" onClick={handleClearAll}>Clear</Button>
            <Button variant="text" onClick={handleSelectAll}>Select All</Button>
          </Box>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="outlined" onClick={() => navigate('/')}>Cancel</Button>
            <Button variant="contained" disabled={!anyChecked} onClick={handleContinue}>Continue</Button>
          </Box>
        </Box>
      </Card>
    </PageContainer>
  );
};

export default BOQ;