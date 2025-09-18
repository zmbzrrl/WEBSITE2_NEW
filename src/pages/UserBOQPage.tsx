// 📊 User BOQ (Bill of Quantities) Page
// For regular users to distribute quantities across their panel designs

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  Print as PrintIcon,
  PlayArrow as PlayArrowIcon
} from '@mui/icons-material';
import { ProjectContext } from '../App';

interface BOQData {
  panelType: string;
  totalQuantity: number;
  designs: {
    designId: string;
    designName: string;
    quantity: number;
    projectName: string;
  }[];
}

const UserBOQPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { projectName, projectCode, location: projectLocation, operator } = React.useContext(ProjectContext);
  
  const [boqData, setBoqData] = useState<BOQData[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Mock data for demonstration - in real app this would come from user's project
  const mockPanelTypes = [
    { type: 'SP', name: 'Single Panel', defaultQuantity: 10 },
    { type: 'IDPG', name: 'IDPG Panel', defaultQuantity: 5 },
    { type: 'TAG', name: 'TAG Panel', defaultQuantity: 8 },
    { type: 'DPH', name: 'Double Panel Horizontal', defaultQuantity: 3 },
    { type: 'DPV', name: 'Double Panel Vertical', defaultQuantity: 2 },
    { type: 'X1H', name: 'Extended Panel X1 Horizontal', defaultQuantity: 4 },
    { type: 'X2H', name: 'Extended Panel X2 Horizontal', defaultQuantity: 3 },
    { type: 'X1V', name: 'Extended Panel X1 Vertical', defaultQuantity: 2 },
    { type: 'X2V', name: 'Extended Panel X2 Vertical', defaultQuantity: 1 }
  ];

  useEffect(() => {
    // Initialize BOQ data with mock panel types
    const initialBOQData: BOQData[] = mockPanelTypes.map(panelType => ({
      panelType: panelType.type,
      totalQuantity: panelType.defaultQuantity,
      designs: [
        {
          designId: `${panelType.type}_design_1`,
          designName: `${panelType.name} - Design 1`,
          quantity: Math.floor(panelType.defaultQuantity / 2),
          projectName: projectName || 'New Project'
        },
        {
          designId: `${panelType.type}_design_2`,
          designName: `${panelType.name} - Design 2`,
          quantity: Math.ceil(panelType.defaultQuantity / 2),
          projectName: projectName || 'New Project'
        }
      ]
    }));

    setBoqData(initialBOQData);
  }, [projectName]);

  const updateQuantity = (panelType: string, designId: string, newQuantity: number) => {
    if (newQuantity < 0) return;

    setBoqData(prevData => 
      prevData.map(panelData => {
        if (panelData.panelType === panelType) {
          const updatedDesigns = panelData.designs.map(design => 
            design.designId === designId 
              ? { ...design, quantity: newQuantity }
              : design
          );

          // Recalculate total quantity
          const totalQuantity = updatedDesigns.reduce((sum, design) => sum + design.quantity, 0);

          return {
            ...panelData,
            designs: updatedDesigns,
            totalQuantity
          };
        }
        return panelData;
      })
    );
  };

  const updateTotalQuantity = (panelType: string, newTotal: number) => {
    if (newTotal < 0) return;

    setBoqData(prevData => 
      prevData.map(panelData => {
        if (panelData.panelType === panelType) {
          // Distribute the new total proportionally across designs
          const designs = panelData.designs;
          const currentTotal = designs.reduce((sum, design) => sum + design.quantity, 0);
          
          if (currentTotal === 0) {
            // If current total is 0, distribute evenly
            const quantityPerDesign = Math.floor(newTotal / designs.length);
            const remainder = newTotal % designs.length;
            
            const updatedDesigns = designs.map((design, index) => ({
              ...design,
              quantity: quantityPerDesign + (index < remainder ? 1 : 0)
            }));

            return {
              ...panelData,
              designs: updatedDesigns,
              totalQuantity: newTotal
            };
          } else {
            // Distribute proportionally
            const updatedDesigns = designs.map(design => ({
              ...design,
              quantity: Math.round((design.quantity / currentTotal) * newTotal)
            }));

            // Adjust for rounding errors
            const actualTotal = updatedDesigns.reduce((sum, design) => sum + design.quantity, 0);
            const difference = newTotal - actualTotal;
            
            if (difference !== 0 && updatedDesigns.length > 0) {
              updatedDesigns[0].quantity += difference;
            }

            return {
              ...panelData,
              designs: updatedDesigns,
              totalQuantity: newTotal
            };
          }
        }
        return panelData;
      })
    );
  };

  const saveBOQData = async () => {
    try {
      setSaving(true);
      setError(null);

      // Here you would save the BOQ data to your database
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

  const handleContinueToDesign = () => {
    navigate('/panel-type');
  };

  const totalPanels = boqData.reduce((sum, panel) => sum + panel.totalQuantity, 0);

  return (
    <Box sx={{ p: 3, maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center" gap={2}>
          <IconButton onClick={() => navigate('/my-designs')}>
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
          <Button
            variant="contained"
            color="success"
            startIcon={<PlayArrowIcon />}
            onClick={handleContinueToDesign}
          >
            Continue to Design
          </Button>
        </Box>
      </Box>

      {/* Project Summary */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            📋 Project Summary
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={3}>
              <Typography variant="body2" color="text.secondary">
                Project Name
              </Typography>
              <Typography variant="h6">
                {projectName || 'New Project'}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Typography variant="body2" color="text.secondary">
                Project Code
              </Typography>
              <Typography variant="h6">
                {projectCode || 'TBD'}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Typography variant="body2" color="text.secondary">
                Location
              </Typography>
              <Typography variant="h6">
                {projectLocation || 'TBD'}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Typography variant="body2" color="text.secondary">
                Total Panels
              </Typography>
              <Typography variant="h6">
                {totalPanels}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Success Message */}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      {/* BOQ Table */}
      {boqData.map((panelData) => (
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
                  <TableCell align="center" sx={{ minWidth: 200 }}>
                    <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
                      <Typography variant="subtitle2">Quantity</Typography>
                      <Chip 
                        label={`Total: ${panelData.totalQuantity}`} 
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
                          sx={{ width: 80 }}
                          inputProps={{ min: 0, style: { textAlign: 'center' } }}
                        />
                        <IconButton
                          size="small"
                          onClick={() => updateQuantity(panelData.panelType, design.designId, design.quantity + 1)}
                        >
                          <AddIcon />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
                
                {/* Total Row */}
                <TableRow sx={{ backgroundColor: 'grey.50' }}>
                  <TableCell colSpan={2}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      Total Quantity
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
                      <IconButton
                        size="small"
                        onClick={() => updateTotalQuantity(panelData.panelType, panelData.totalQuantity - 1)}
                        disabled={panelData.totalQuantity <= 0}
                      >
                        <RemoveIcon />
                      </IconButton>
                      <TextField
                        value={panelData.totalQuantity}
                        onChange={(e) => {
                          const value = parseInt(e.target.value) || 0;
                          updateTotalQuantity(panelData.panelType, value);
                        }}
                        type="number"
                        size="small"
                        sx={{ width: 80 }}
                        inputProps={{ min: 0, style: { textAlign: 'center', fontWeight: 'bold' } }}
                      />
                      <IconButton
                        size="small"
                        onClick={() => updateTotalQuantity(panelData.panelType, panelData.totalQuantity + 1)}
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
      ))}

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
          <Typography variant="body2" paragraph>
            • <strong>Continue designing:</strong> Click "Continue to Design" to proceed with creating your panel designs
          </Typography>
          <Typography variant="body2">
            • <strong>Print:</strong> Use the print button to generate a printable version of the BOQ
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default UserBOQPage;
