import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  Paper,
  Stack,
  FormControlLabel,
  Checkbox,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Grid
} from '@mui/material';
import BusinessIcon from '@mui/icons-material/Business';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import DashboardIcon from '@mui/icons-material/Dashboard';
import { useUser } from '../contexts/UserContext';

interface Property {
  prop_id: string;
  region: string;
  property_name: string;
  is_active: boolean;
  created_at?: string;
}

interface PropertyForm {
  propId: string;
  region: string;
  propertyName: string;
  isActive: boolean;
}

const PropertiesManagement: React.FC = () => {
  const { user: currentUser } = useUser();
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState<string | null>(null);
  const [formData, setFormData] = useState<PropertyForm>({
    propId: '',
    region: '',
    propertyName: '',
    isActive: true,
  });

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    setFetching(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:4000/admin/properties', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('[PROPERTIES_MGMT] Fetch properties response:', {
        ok: response.ok,
        status: response.status,
        statusText: response.statusText,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('[PROPERTIES_MGMT] Fetch properties failed:', {
          status: response.status,
          error: errorData,
        });
        throw new Error(errorData?.error || `Failed to fetch properties: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('[PROPERTIES_MGMT] Properties fetched successfully:', data);
      setProperties(data);
    } catch (err) {
      console.error('[PROPERTIES_MGMT] Error fetching properties:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch properties');
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (field: keyof PropertyForm) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = field === 'isActive' ? e.target.checked : e.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError(null);
    if (success) setSuccess(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const url = editingProperty
        ? `http://localhost:4000/admin/properties/${editingProperty.prop_id}`
        : 'http://localhost:4000/admin/properties';
      
      const method = editingProperty ? 'PUT' : 'POST';
      const body = editingProperty
        ? {
            region: formData.region,
            propertyName: formData.propertyName,
            isActive: formData.isActive,
          }
        : {
            propId: formData.propId,
            region: formData.region,
            propertyName: formData.propertyName,
            isActive: formData.isActive,
          };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error || `Failed to ${editingProperty ? 'update' : 'create'} property`);
      }

      setSuccess(`Property ${editingProperty ? 'updated' : 'created'} successfully!`);
      setFormData({ propId: '', region: '', propertyName: '', isActive: true });
      setEditingProperty(null);
      fetchProperties();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save property');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (property: Property) => {
    setEditingProperty(property);
    setFormData({
      propId: property.prop_id,
      region: property.region,
      propertyName: property.property_name,
      isActive: property.is_active,
    });
    setError(null);
    setSuccess(null);
  };

  const handleCancelEdit = () => {
    setEditingProperty(null);
    setFormData({ propId: '', region: '', propertyName: '', isActive: true });
  };

  const handleDeleteClick = (propId: string) => {
    setPropertyToDelete(propId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!propertyToDelete) return;

    try {
      const response = await fetch(`http://localhost:4000/admin/properties/${propertyToDelete}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error || 'Failed to delete property');
      }

      setSuccess('Property deleted successfully!');
      fetchProperties();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete property');
    } finally {
      setDeleteDialogOpen(false);
      setPropertyToDelete(null);
    }
  };

  const isAdmin = currentUser?.isAdmin === true;

  if (!isAdmin) {
    return (
      <Box sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #718096 0%, #a0aec0 100%)'
      }}>
        <Alert severity="error" sx={{ maxWidth: 400 }}>
          Access denied. Admin privileges required.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #718096 0%, #a0aec0 100%)',
      py: 4
    }}>
      <Box sx={{ maxWidth: 1400, mx: 'auto', px: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography 
            variant="h4" 
            sx={{ 
              color: 'white', 
              fontWeight: 400,
              fontFamily: '"Myriad Hebrew", "Monsal Gothic", sans-serif',
              mb: 2
            }}
          >
            Properties Management
          </Typography>
          <Button
            variant="contained"
            startIcon={<DashboardIcon />}
            onClick={() => navigate('/admin')}
            sx={{
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.3)',
                borderColor: 'rgba(255, 255, 255, 0.5)',
              },
            }}
          >
            Back to Dashboard
          </Button>
        </Box>

        <Grid container spacing={3}>
          {/* Form Section */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, backgroundColor: 'rgba(255, 255, 255, 0.95)' }}>
              <Typography variant="h5" sx={{ mb: 3, fontWeight: 500 }}>
                {editingProperty ? 'Edit Property' : 'Create New Property'}
              </Typography>

              {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
              {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

              <form onSubmit={handleSubmit}>
                <Stack spacing={2}>
                  <TextField
                    label="Property ID"
                    value={formData.propId}
                    onChange={handleChange('propId')}
                    required={!editingProperty}
                    disabled={!!editingProperty}
                    fullWidth
                    variant="outlined"
                    placeholder="PROP001"
                    helperText={editingProperty ? 'ID cannot be changed' : 'Unique property identifier'}
                  />

                  <TextField
                    label="Region"
                    value={formData.region}
                    onChange={handleChange('region')}
                    required
                    fullWidth
                    variant="outlined"
                    placeholder="Dubai"
                  />

                  <TextField
                    label="Property Name"
                    value={formData.propertyName}
                    onChange={handleChange('propertyName')}
                    required
                    fullWidth
                    variant="outlined"
                    placeholder="Marriott Palm Jumeirah"
                  />

                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.isActive}
                        onChange={handleChange('isActive')}
                      />
                    }
                    label="Property is active"
                  />

                  <Stack direction="row" spacing={2}>
                    <Button
                      type="submit"
                      variant="contained"
                      startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <BusinessIcon />}
                      disabled={loading}
                      fullWidth
                      sx={{ py: 1.5 }}
                    >
                      {loading ? 'Saving...' : editingProperty ? 'Update Property' : 'Create Property'}
                    </Button>
                    {editingProperty && (
                      <Button
                        variant="outlined"
                        onClick={handleCancelEdit}
                        fullWidth
                      >
                        Cancel
                      </Button>
                    )}
                  </Stack>
                </Stack>
              </form>
            </Paper>
          </Grid>

          {/* Properties List */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3, backgroundColor: 'rgba(255, 255, 255, 0.95)' }}>
              <Typography variant="h5" sx={{ mb: 2, fontWeight: 500 }}>
                All Properties ({properties.length})
              </Typography>

              {fetching ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell><strong>Property ID</strong></TableCell>
                        <TableCell><strong>Property Name</strong></TableCell>
                        <TableCell><strong>Region</strong></TableCell>
                        <TableCell><strong>Status</strong></TableCell>
                        <TableCell><strong>Actions</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {properties.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} align="center">
                            No properties found
                          </TableCell>
                        </TableRow>
                      ) : (
                        properties.map((property) => (
                          <TableRow key={property.prop_id}>
                            <TableCell>{property.prop_id}</TableCell>
                            <TableCell>{property.property_name}</TableCell>
                            <TableCell>{property.region}</TableCell>
                            <TableCell>
                              <Chip
                                label={property.is_active ? 'Active' : 'Inactive'}
                                color={property.is_active ? 'success' : 'default'}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              <IconButton
                                size="small"
                                onClick={() => handleEdit(property)}
                                color="primary"
                              >
                                <EditIcon />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={() => handleDeleteClick(property.prop_id)}
                                color="error"
                              >
                                <DeleteIcon />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Paper>
          </Grid>
        </Grid>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
          <DialogTitle>Delete Property</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete property <strong>{propertyToDelete}</strong>?
              This will also delete all user groups and users associated with this property. This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleDeleteConfirm} color="error" variant="contained">
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};

export default PropertiesManagement;

