// 📊 BOQ (Bill of Quantities) Page
// Displays panel types with quantities and allows distribution across designs

import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  Divider,
  Alert,
  CircularProgress,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  Print as PrintIcon
} from '@mui/icons-material';
import { supabase } from '../utils/supabaseClient';

interface BOQData {
  panelType: string;
  totalQuantity: number; // current allocated total (sum of design allocations)
  fixedTotal: number; // fixed imported total for this type (sum of max quantities)
  designs: {
    designId: string;
    designName: string;
    quantity: number; // allocated quantity (editable)
    maxQuantity: number; // max quantity (read-only)
    projectName: string;
  }[];
}

interface ImportResults {
  properties_created: number;
  user_groups_created: number;
  users_created: number;
  projects_created: number;
  designs_created: number;
  configurations_created: number;
  project_ids: string[];
}

const BOQPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [boqData, setBoqData] = useState<BOQData[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Get import results from navigation state
  const importResults = location.state?.importResults as ImportResults | undefined;
  const projectIds = location.state?.projectIds as string[] | undefined;

  useEffect(() => {
    if (projectIds && projectIds.length > 0) {
      loadBOQData(projectIds);
    } else if (importResults?.project_ids && importResults.project_ids.length > 0) {
      loadBOQData(importResults.project_ids);
    } else {
      // If no project IDs, stay on page and show message
      setLoading(false);
      setError('No project data found from import. Please ensure your JSON created projects/designs.');
    }
  }, [importResults, projectIds, navigate]);

  const loadBOQData = async (projectIds: string[]) => {
    try {
      setLoading(true);
      setError(null);

      // Fetch designs for the imported projects
      const { data: designs, error: designsError } = await supabase
        .from('user_designs')
        .select(`
          id,
          design_name,
          panel_type,
          project_id,
          design_data,
          user_projects!inner(project_name)
        `)
        .in('project_id', projectIds);

      if (designsError) {
        throw new Error(`Failed to load designs: ${designsError.message}`);
      }

      // Group designs by panel type
      const panelTypeMap = new Map<string, BOQData>();

      designs?.forEach((design: any) => {
        const panelType = design.panel_type;
        // Pull allocated and max from import if present
        const allocatedQty = (design.design_data && typeof design.design_data.allocatedQuantity !== 'undefined')
          ? Math.max(0, Number(design.design_data.allocatedQuantity) || 0)
          : ((design.design_data && typeof design.design_data.quantity !== 'undefined')
            ? Math.max(0, Number(design.design_data.quantity) || 0)
            : 0);
        const maxQty = (design.design_data && typeof design.design_data.maxQuantity !== 'undefined')
          ? Math.max(0, Number(design.design_data.maxQuantity) || 0)
          : allocatedQty; // fallback so UI stays consistent
        
        if (!panelTypeMap.has(panelType)) {
          panelTypeMap.set(panelType, {
            panelType,
            totalQuantity: 0,
            fixedTotal: 0,
            designs: []
          });
        }

        const boqItem = panelTypeMap.get(panelType)!;
        boqItem.designs.push({
          designId: design.id,
          designName: design.design_name,
          quantity: Math.min(allocatedQty, maxQty),
          maxQuantity: maxQty,
          projectName: design.user_projects.project_name
        });
        boqItem.totalQuantity += Math.min(allocatedQty, maxQty);
        boqItem.fixedTotal += maxQty;
      });

      // Convert to array and sort by panel type
      const boqArray = Array.from(panelTypeMap.values()).sort((a, b) => 
        a.panelType.localeCompare(b.panelType)
      );

      setBoqData(boqArray);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load BOQ data');
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = (panelType: string, designId: string, newQuantity: number) => {
    if (newQuantity < 0) return;

    setBoqData(prevData => 
      prevData.map(panelData => {
        if (panelData.panelType === panelType) {
          // Enforce per-design cap: allocated must not exceed that design's maxQuantity
          const currentDesign = panelData.designs.find(d => d.designId === designId);
          if (!currentDesign) return panelData;
          const clamped = Math.max(0, Math.min(newQuantity, currentDesign.maxQuantity));

          const updatedDesigns = panelData.designs.map(design => (
            design.designId === designId ? { ...design, quantity: clamped } : design
          ));

          const totalQuantity = updatedDesigns.reduce((sum, d) => sum + d.quantity, 0);

          return { ...panelData, designs: updatedDesigns, totalQuantity };
        }
        return panelData;
      })
    );
  };

  const saveBOQData = async () => {
    try {
      setSaving(true);
      setError(null);

      // Here you would typically save the BOQ data to your database
      // For now, we'll just simulate the save operation
      await new Promise(resolve => setTimeout(resolve, 1000));

      setSuccess('BOQ data saved successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save BOQ data');
    } finally {
      setSaving(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Loading BOQ data...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={() => navigate('/properties')}>
          Back to Properties
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center" gap={2}>
          <IconButton onClick={() => navigate('/properties')}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1">
            📊 Bill of Quantities (BOQ)
          </Typography>
        </Box>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            startIcon={<PrintIcon />}
            onClick={handlePrint}
          >
            Print
          </Button>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={saveBOQData}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save BOQ'}
          </Button>
        </Box>
      </Box>

      {/* Import Summary */}
      {importResults && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              📋 Import Summary
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={3}>
                <Typography variant="body2" color="text.secondary">
                  Projects Created
                </Typography>
                <Typography variant="h6">
                  {importResults.projects_created}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Typography variant="body2" color="text.secondary">
                  Designs Created
                </Typography>
                <Typography variant="h6">
                  {importResults.designs_created}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Typography variant="body2" color="text.secondary">
                  Configurations
                </Typography>
                <Typography variant="h6">
                  {importResults.configurations_created}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Typography variant="body2" color="text.secondary">
                  Panel Types
                </Typography>
                <Typography variant="h6">
                  {boqData.length}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Success Message */}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      {/* BOQ Table */}
      {boqData.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            No panel data found
          </Typography>
        </Paper>
      ) : (
        boqData.map((panelData) => (
          <Paper key={panelData.panelType} sx={{ mb: 3 }}>
            <Box sx={{ p: 2, backgroundColor: 'primary.main', color: 'white' }}>
              <Typography variant="h6">
                {panelData.panelType} Panel Type
              </Typography>
            </Box>
            
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Design Name</TableCell>
                    <TableCell>Project</TableCell>
                    <TableCell align="center">Max Quantity</TableCell>
                    <TableCell align="center" sx={{ minWidth: 220 }}>
                      <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
                        <Typography variant="subtitle2">Allocated Quantity</Typography>
                        <Chip 
                          label={`Total: ${panelData.totalQuantity} / ${panelData.fixedTotal}`} 
                          size="small" 
                          color="primary" 
                        />
                      </Box>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {panelData.designs.map((design) => (
                    <TableRow key={design.designId}>
                      <TableCell>
                        <Typography variant="body1" fontWeight="medium">
                          {design.designName}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {design.projectName}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <TextField
                          value={design.maxQuantity}
                          type="number"
                          size="small"
                          sx={{ width: 100 }}
                          inputProps={{ readOnly: true, style: { textAlign: 'center', fontWeight: 600 } }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
                          <IconButton
                            size="small"
                            onClick={() => updateQuantity(panelData.panelType, design.designId, design.quantity - 1)}
                            disabled={design.quantity <= 0}
                          >
                            <RemoveIcon />
                          </IconButton>
                          <TextField
                            value={design.quantity}
                            onChange={(e) => {
                              const value = parseInt(e.target.value) || 0;
                              updateQuantity(panelData.panelType, design.designId, value);
                            }}
                            type="number"
                            size="small"
                            sx={{ width: 100 }}
                            inputProps={{ min: 0, style: { textAlign: 'center' } }}
                          />
                          <IconButton
                            size="small"
                            onClick={() => updateQuantity(panelData.panelType, design.designId, design.quantity + 1)}
                            disabled={design.quantity >= design.maxQuantity}
                          >
                            <AddIcon />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                  
                  {/* Total Row (fixed; inputs disabled) */}
                  <TableRow sx={{ backgroundColor: 'grey.50' }}>
                    <TableCell colSpan={2}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        Totals
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <TextField
                        value={`${panelData.fixedTotal}`}
                        type="text"
                        size="small"
                        sx={{ width: 100 }}
                        inputProps={{ readOnly: true, style: { textAlign: 'center', fontWeight: 700 } }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
                        <IconButton
                          size="small"
                          disabled
                        >
                          <RemoveIcon />
                        </IconButton>
                        <TextField
                          value={`${panelData.totalQuantity}`}
                          type="text"
                          size="small"
                          sx={{ width: 140 }}
                          inputProps={{ readOnly: true, style: { textAlign: 'center', fontWeight: 'bold' } }}
                        />
                        <IconButton
                          size="small"
                          disabled
                        >
                          <AddIcon />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        ))
      )}

      {/* Instructions */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            📝 Instructions
          </Typography>
          <Typography variant="body2" paragraph>
            • <strong>Distribute quantities:</strong> Adjust individual design quantities using the +/- buttons or by typing directly
          </Typography>
          <Typography variant="body2" paragraph>
            • <strong>Set total quantity:</strong> Use the total quantity controls to automatically distribute quantities proportionally across designs
          </Typography>
          <Typography variant="body2" paragraph>
            • <strong>Save changes:</strong> Click "Save BOQ" to store your quantity distribution
          </Typography>
          <Typography variant="body2">
            • <strong>Print:</strong> Use the print button to generate a printable version of the BOQ
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default BOQPage;
