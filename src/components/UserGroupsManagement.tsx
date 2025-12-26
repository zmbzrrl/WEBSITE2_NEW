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
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import DashboardIcon from '@mui/icons-material/Dashboard';
import { useUser } from '../contexts/UserContext';

interface UserGroup {
  id: string;
  ug: string;
  prop_id: string;
  is_active: boolean;
  created_at?: string;
}

interface UserGroupForm {
  id: string;
  ug: string;
  propId: string;
  isActive: boolean;
}

const UserGroupsManagement: React.FC = () => {
  const { user: currentUser } = useUser();
  const navigate = useNavigate();
  const [userGroups, setUserGroups] = useState<UserGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editingGroup, setEditingGroup] = useState<UserGroup | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState<string | null>(null);
  const [formData, setFormData] = useState<UserGroupForm>({
    id: '',
    ug: '',
    propId: '',
    isActive: true,
  });

  useEffect(() => {
    fetchUserGroups();
  }, []);

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
      console.log('[USER_GROUPS_MGMT] User groups fetched successfully:', data);
      setUserGroups(data);
    } catch (err) {
      console.error('[USER_GROUPS_MGMT] Error fetching user groups:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch user groups');
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (field: keyof UserGroupForm) => (
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
      const url = editingGroup
        ? `http://localhost:4000/admin/user-groups/${editingGroup.id}`
        : 'http://localhost:4000/admin/user-groups';
      
      const method = editingGroup ? 'PUT' : 'POST';
      const body = editingGroup
        ? {
            ug: formData.ug,
            propId: formData.propId,
            isActive: formData.isActive,
          }
        : {
            id: formData.id,
            ug: formData.ug,
            propId: formData.propId,
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
        throw new Error(data?.error || `Failed to ${editingGroup ? 'update' : 'create'} user group`);
      }

      setSuccess(`User group ${editingGroup ? 'updated' : 'created'} successfully!`);
      setFormData({ id: '', ug: '', propId: '', isActive: true });
      setEditingGroup(null);
      fetchUserGroups();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save user group');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (group: UserGroup) => {
    setEditingGroup(group);
    setFormData({
      id: group.id,
      ug: group.ug,
      propId: group.prop_id,
      isActive: group.is_active,
    });
    setError(null);
    setSuccess(null);
  };

  const handleCancelEdit = () => {
    setEditingGroup(null);
    setFormData({ id: '', ug: '', propId: '', isActive: true });
  };

  const handleDeleteClick = (id: string) => {
    setGroupToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!groupToDelete) return;

    try {
      const response = await fetch(`http://localhost:4000/admin/user-groups/${groupToDelete}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error || 'Failed to delete user group');
      }

      setSuccess('User group deleted successfully!');
      fetchUserGroups();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete user group');
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

        <Grid container spacing={3}>
          {/* Form Section */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, backgroundColor: 'rgba(255, 255, 255, 0.95)' }}>
              <Typography variant="h5" sx={{ mb: 3, fontWeight: 500 }}>
                {editingGroup ? 'Edit User Group' : 'Create New User Group'}
              </Typography>

              {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
              {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

              <form onSubmit={handleSubmit}>
                <Stack spacing={2}>
                  <TextField
                    label="ID"
                    value={formData.id}
                    onChange={handleChange('id')}
                    required={!editingGroup}
                    disabled={!!editingGroup}
                    fullWidth
                    variant="outlined"
                    placeholder="UG001_PROP001"
                    helperText={editingGroup ? 'ID cannot be changed' : 'Composite ID (e.g., UG001_PROP001)'}
                  />

                  <TextField
                    label="User Group Code"
                    value={formData.ug}
                    onChange={handleChange('ug')}
                    required
                    fullWidth
                    variant="outlined"
                    placeholder="UG001"
                  />

                  <TextField
                    label="Property ID"
                    value={formData.propId}
                    onChange={handleChange('propId')}
                    required
                    fullWidth
                    variant="outlined"
                    placeholder="PROP001"
                  />

                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.isActive}
                        onChange={handleChange('isActive')}
                      />
                    }
                    label="User group is active"
                  />

                  <Stack direction="row" spacing={2}>
                    <Button
                      type="submit"
                      variant="contained"
                      startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <GroupAddIcon />}
                      disabled={loading}
                      fullWidth
                      sx={{ py: 1.5 }}
                    >
                      {loading ? 'Saving...' : editingGroup ? 'Update Group' : 'Create Group'}
                    </Button>
                    {editingGroup && (
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

          {/* Groups List */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3, backgroundColor: 'rgba(255, 255, 255, 0.95)' }}>
              <Typography variant="h5" sx={{ mb: 2, fontWeight: 500 }}>
                All User Groups ({userGroups.length})
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
                        <TableCell><strong>ID</strong></TableCell>
                        <TableCell><strong>User Group</strong></TableCell>
                        <TableCell><strong>Property ID</strong></TableCell>
                        <TableCell><strong>Status</strong></TableCell>
                        <TableCell><strong>Actions</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {userGroups.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} align="center">
                            No user groups found
                          </TableCell>
                        </TableRow>
                      ) : (
                        userGroups.map((group) => (
                          <TableRow key={group.id}>
                            <TableCell>{group.id}</TableCell>
                            <TableCell>{group.ug}</TableCell>
                            <TableCell>{group.prop_id}</TableCell>
                            <TableCell>
                              <Chip
                                label={group.is_active ? 'Active' : 'Inactive'}
                                color={group.is_active ? 'success' : 'default'}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              <IconButton
                                size="small"
                                onClick={() => handleEdit(group)}
                                color="primary"
                              >
                                <EditIcon />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={() => handleDeleteClick(group.id)}
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
          <DialogTitle>Delete User Group</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete user group <strong>{groupToDelete}</strong>?
              This will also delete all users assigned to this group. This action cannot be undone.
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

export default UserGroupsManagement;

