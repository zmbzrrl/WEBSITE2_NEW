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
  CircularProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction
} from '@mui/material';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import DeleteIcon from '@mui/icons-material/Delete';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AddIcon from '@mui/icons-material/Add';
import { useUser } from '../contexts/UserContext';

interface UserGroup {
  id: string;
  ug: string;
  prop_id: string;
  is_active: boolean;
  created_at?: string;
}

interface GroupedUserGroup {
  ug: string;
  properties: UserGroup[];
}

const UserGroupsManagement: React.FC = () => {
  const { user: currentUser } = useUser();
  const navigate = useNavigate();
  const [userGroups, setUserGroups] = useState<UserGroup[]>([]);
  const [groupedGroups, setGroupedGroups] = useState<GroupedUserGroup[]>([]);
  const [properties, setProperties] = useState<Array<{ prop_id: string; property_name: string; region: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [fetchingProperties, setFetchingProperties] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState<{ id: string; ug: string } | null>(null);
  const [newGroupCode, setNewGroupCode] = useState('');
  const [newGroupProperty, setNewGroupProperty] = useState('');
  const [addingPropertyToGroup, setAddingPropertyToGroup] = useState<{ [ug: string]: string }>({});

  useEffect(() => {
    fetchUserGroups();
    fetchProperties();
  }, []);

  useEffect(() => {
    try {
      // Group user groups by ug code
      const grouped = (userGroups || []).reduce((acc, group) => {
        if (!group || !group.ug) return acc;

        const existingGroup = acc.find(g => g.ug === group.ug);
        if (existingGroup) {
          existingGroup.properties.push(group);
        } else {
          acc.push({ ug: group.ug, properties: [group] });
        }
        return acc;
      }, [] as GroupedUserGroup[]);

      // Sort properties within each group
      grouped.forEach(g => {
        if (g.properties) {
          g.properties.sort((a, b) => (a.prop_id || '').localeCompare(b.prop_id || ''));
        }
      });

      // Sort groups by ug code
      grouped.sort((a, b) => (a.ug || '').localeCompare(b.ug || ''));

      setGroupedGroups(grouped);
    } catch (err) {
      console.error('[USER_GROUPS] Error grouping data:', err);
      setError('Error processing user groups data');
    }
  }, [userGroups]);

  const fetchProperties = async () => {
    setFetchingProperties(true);
    try {
      const response = await fetch('http://localhost:4000/admin/properties', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProperties(data || []);
      } else {
        console.error('[USER_GROUPS_MGMT] Failed to fetch properties');
      }
    } catch (err) {
      console.error('[USER_GROUPS_MGMT] Error fetching properties:', err);
    } finally {
      setFetchingProperties(false);
    }
  };

  const fetchUserGroups = async () => {
    setFetching(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:4000/admin/user-groups', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('[USER_GROUPS_MGMT] Fetch user groups response:', {
        ok: response.ok,
        status: response.status,
        statusText: response.statusText,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('[USER_GROUPS_MGMT] Fetch user groups failed:', {
          status: response.status,
          error: errorData,
        });
        throw new Error(errorData?.error || `Failed to fetch user groups: ${response.statusText}`);
      }

      const data = await response.json();
      setUserGroups(data || []);
    } catch (err) {
      console.error('[USER_GROUPS_MGMT] Error fetching user groups:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch user groups');
    } finally {
      setFetching(false);
    }
  };

  const handleCreateNewGroupWithProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupCode.trim() || !newGroupProperty) {
      setError('Please enter both a user group code and select a property');
      return;
    }

    await handleAddPropertyToGroup(newGroupCode.trim().toUpperCase(), newGroupProperty);
    if (!error) {
      setNewGroupCode('');
      setNewGroupProperty('');
    }
  };

  const handleAddPropertyToGroup = async (ug: string, propId: string) => {
    if (!ug || !propId) {
      setError('Group code and property are required');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const id = `${ug}_${propId}`;
      const body = {
        id,
        ug,
        propId,
        isActive: true,
      };

      const response = await fetch('http://localhost:4000/admin/user-groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error || 'Failed to add property to group');
      }

      const responseData = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(responseData?.error || `Failed to add property to group (${response.status})`);
      }

      setSuccess(`Property added to group ${ug} successfully!`);
      fetchUserGroups();
    } catch (err) {
      console.error('Error adding property:', err);
      setError(err instanceof Error ? err.message : 'Failed to add property to group');
    } finally {
      setLoading(false);
    }
  };

  const getAvailablePropertiesForGroup = (ug: string) => {
    const group = groupedGroups.find(g => g.ug === ug);
    const assignedPropIds = group?.properties.map(p => p.prop_id) || [];
    return (properties || []).filter(p => p && p.prop_id && !assignedPropIds.includes(p.prop_id));
  };

  const handleDeleteProperty = (id: string, ug: string) => {
    setGroupToDelete({ id, ug });
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!groupToDelete) return;

    try {
      const response = await fetch(`http://localhost:4000/admin/user-groups/${groupToDelete.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error || 'Failed to remove property from group');
      }

      setSuccess('Property removed from group successfully!');
      fetchUserGroups();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove property from group');
    } finally {
      setDeleteDialogOpen(false);
      setGroupToDelete(null);
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
            User Groups Management
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

        {/* Global Messages */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        )}

        {/* Create New Group with Property Form */}
        <Paper sx={{ p: 3, mb: 3, backgroundColor: 'rgba(255, 255, 255, 0.95)' }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 500 }}>
            Create New User Group with Property
          </Typography>
          <form onSubmit={handleCreateNewGroupWithProperty}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="flex-end">
              <TextField
                label="User Group Code"
                value={newGroupCode}
                onChange={(e) => setNewGroupCode(e.target.value.toUpperCase())}
                required
                fullWidth
                variant="outlined"
                placeholder="UG001"
                helperText="Enter a new group code (e.g., UG001, ADMIN, etc.)"
              />
              <FormControl fullWidth required>
                <InputLabel>Property</InputLabel>
                <Select
                  value={newGroupProperty}
                  onChange={(e) => setNewGroupProperty(e.target.value)}
                  label="Property"
                  disabled={fetchingProperties}
                >
                  <MenuItem value="">
                    <em>Select a property...</em>
                  </MenuItem>
                  {properties && properties.map((property) => {
                    if (!property || !property.prop_id) return null;

                    const trimmedCode = newGroupCode.trim().toUpperCase();
                    const existingGroup = trimmedCode ? groupedGroups.find(g => g.ug === trimmedCode) : null;
                    const isAssignedToThisGroup = existingGroup?.properties?.some(p => p.prop_id === property.prop_id);
                    // Show all properties, but we'll handle duplicates in the backend
                    return (
                      <MenuItem key={property.prop_id} value={property.prop_id} disabled={isAssignedToThisGroup}>
                        {property.property_name || 'Unknown'} — {property.region || 'Unknown'} ({property.prop_id})
                        {isAssignedToThisGroup && ' (already assigned)'}
                      </MenuItem>
                    );
                  })}
                </Select>
                {fetchingProperties && (
                  <Typography variant="caption" sx={{ mt: 0.5, color: 'text.secondary' }}>
                    Loading properties...
                  </Typography>
                )}
              </FormControl>
              <Button
                type="submit"
                variant="contained"
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <GroupAddIcon />}
                disabled={loading || !newGroupCode.trim() || !newGroupProperty}
                sx={{ py: 1.5, minWidth: 150 }}
              >
                {loading ? 'Creating...' : 'Create Group'}
              </Button>
            </Stack>
          </form>
        </Paper>


        {/* User Groups Sections */}
        {fetching ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : !groupedGroups || groupedGroups.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center', backgroundColor: 'rgba(255, 255, 255, 0.95)' }}>
            <Typography variant="h6" color="text.secondary">
              No user groups found. Create a new group code above to get started.
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {groupedGroups.map((grouped) => {
              const availableProperties = getAvailablePropertiesForGroup(grouped.ug) || [];

              return (
                <Grid item xs={12} key={grouped.ug}>
                  <Card sx={{ backgroundColor: 'rgba(255, 255, 255, 0.95)' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h5" sx={{ fontWeight: 600 }}>
                          {grouped.ug}
                        </Typography>
                        <Chip
                          label={`${grouped.properties?.length || 0} ${grouped.properties?.length === 1 ? 'property' : 'properties'}`}
                          color="primary"
                          variant="outlined"
                        />
                      </Box>

                      <Divider sx={{ mb: 2 }} />

                      {/* Add Property Section */}
                      {availableProperties.length > 0 && (
                        <Box sx={{ mb: 3, p: 2, backgroundColor: 'rgba(0, 0, 0, 0.02)', borderRadius: 1 }}>
                          <Stack direction="row" spacing={2} alignItems="center">
                            <FormControl sx={{ minWidth: 300, flexGrow: 1 }}>
                              <InputLabel>Add Property to {grouped.ug}</InputLabel>
                              <Select
                                value={addingPropertyToGroup[grouped.ug] || ''}
                                onChange={(e) => setAddingPropertyToGroup(prev => ({ ...prev, [grouped.ug]: e.target.value }))}
                                label={`Add Property to ${grouped.ug}`}
                                disabled={fetchingProperties || loading}
                              >
                                <MenuItem value="">
                                  <em>Select a property...</em>
                                </MenuItem>
                                {availableProperties.map((property) => (
                                  property && property.prop_id ? (
                                    <MenuItem key={property.prop_id} value={property.prop_id}>
                                      {property.property_name || 'Unknown'} — {property.region || 'Unknown'} ({property.prop_id})
                                    </MenuItem>
                                  ) : null
                                ))}
                              </Select>
                            </FormControl>
                            <Button
                              variant="contained"
                              startIcon={<AddIcon />}
                              onClick={() => handleAddPropertyToGroup(grouped.ug, addingPropertyToGroup[grouped.ug] || '')}
                              disabled={!addingPropertyToGroup[grouped.ug] || loading}
                              sx={{ minWidth: 150 }}
                            >
                              Add Property
                            </Button>
                          </Stack>
                        </Box>
                      )}

                      {/* Properties List */}
                      {!grouped.properties || grouped.properties.length === 0 ? (
                        <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                          No properties assigned to this group yet. Use the dropdown above to add properties.
                        </Typography>
                      ) : (
                        <List>
                          {grouped.properties.map((property, index) => {
                            const propertyInfo = properties.find(p => p.prop_id === property.prop_id);
                            const generatedId = `${grouped.ug}_${property.prop_id}`;

                            return (
                              <React.Fragment key={property.id || index}>
                                <ListItem>
                                  <ListItemText
                                    primary={
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                                          {propertyInfo?.property_name || property.prop_id || 'Unknown'}
                                        </Typography>
                                        <Chip
                                          label={property.is_active ? 'Active' : 'Inactive'}
                                          color={property.is_active ? 'success' : 'default'}
                                          size="small"
                                        />
                                      </Box>
                                    }
                                    secondary={
                                      <Box sx={{ mt: 0.5 }}>
                                        <Typography variant="body2" color="text.secondary">
                                          Property ID: {property.prop_id || 'Unknown'}
                                          {propertyInfo?.region && ` • Region: ${propertyInfo.region}`}
                                        </Typography>
                                        <Typography variant="body2" sx={{ mt: 0.5, fontFamily: 'monospace', color: 'primary.main' }}>
                                          Generated ID: {generatedId}
                                        </Typography>
                                      </Box>
                                    }
                                  />
                                  <ListItemSecondaryAction>
                                    <IconButton
                                      edge="end"
                                      onClick={() => handleDeleteProperty(property.id, grouped.ug)}
                                      color="error"
                                      size="small"
                                      disabled={!property.id}
                                    >
                                      <DeleteIcon />
                                    </IconButton>
                                  </ListItemSecondaryAction>
                                </ListItem>
                                {index < grouped.properties.length - 1 && <Divider />}
                              </React.Fragment>
                            );
                          })}
                        </List>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
          <DialogTitle>Remove Property from Group</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to remove this property from group <strong>{groupToDelete?.ug}</strong>?
              This will delete the user group assignment (ID: <strong>{groupToDelete?.id}</strong>). 
              This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleDeleteConfirm} color="error" variant="contained">
              Remove
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};

export default UserGroupsManagement;

