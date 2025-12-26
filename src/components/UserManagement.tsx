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
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import DashboardIcon from '@mui/icons-material/Dashboard';
import { useUser } from '../contexts/UserContext';

interface User {
  email: string;
  ug_id: string;
  is_active: boolean;
  is_admin: boolean;
  created_at?: string;
}

interface UserForm {
  email: string;
  password: string;
  ugId: string;
  isActive: boolean;
  isAdmin: boolean;
}

const UserManagement: React.FC = () => {
  const { user: currentUser } = useUser();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [formData, setFormData] = useState<UserForm>({
    email: '',
    password: '',
    ugId: '',
    isActive: true,
    isAdmin: false,
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setFetching(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:4000/admin/users', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('[USER_MGMT] Fetch users response:', {
        ok: response.ok,
        status: response.status,
        statusText: response.statusText,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('[USER_MGMT] Fetch users failed:', {
          status: response.status,
          error: errorData,
        });
        throw new Error(errorData?.error || `Failed to fetch users: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('[USER_MGMT] Users fetched successfully:', data);
      setUsers(data);
    } catch (err) {
      console.error('[USER_MGMT] Error fetching users:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch users');
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (field: keyof UserForm) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = field === 'isActive' || field === 'isAdmin' ? e.target.checked : e.target.value;
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
      const url = editingUser
        ? `http://localhost:4000/admin/users/${editingUser.email}`
        : 'http://localhost:4000/admin/users';
      
      const method = editingUser ? 'PUT' : 'POST';
      const body: any = {
        ugId: formData.ugId,
        isActive: formData.isActive,
        isAdmin: formData.isAdmin,
      };

      if (!editingUser) {
        body.email = formData.email;
        body.password = formData.password;
      } else if (formData.password) {
        body.password = formData.password;
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error || `Failed to ${editingUser ? 'update' : 'create'} user`);
      }

      setSuccess(`User ${editingUser ? 'updated' : 'created'} successfully!`);
      setFormData({ email: '', password: '', ugId: '', isActive: true, isAdmin: false });
      setEditingUser(null);
      fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save user');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      password: '',
      ugId: user.ug_id,
      isActive: user.is_active,
      isAdmin: user.is_admin || false,
    });
    setError(null);
    setSuccess(null);
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
    setFormData({ email: '', password: '', ugId: '', isActive: true, isAdmin: false });
  };

  const handleDeleteClick = (email: string) => {
    setUserToDelete(email);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;

    try {
      const response = await fetch(`http://localhost:4000/admin/users/${userToDelete}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error || 'Failed to delete user');
      }

      setSuccess('User deleted successfully!');
      fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete user');
    } finally {
      setDeleteDialogOpen(false);
      setUserToDelete(null);
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
            User Management
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
                {editingUser ? 'Edit User' : 'Create New User'}
              </Typography>

              {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
              {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

              <form onSubmit={handleSubmit}>
                <Stack spacing={2}>
                  <TextField
                    label="Email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange('email')}
                    required={!editingUser}
                    disabled={!!editingUser}
                    fullWidth
                    variant="outlined"
                  />

                  <TextField
                    label="Password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange('password')}
                    required={!editingUser}
                    fullWidth
                    variant="outlined"
                    helperText={editingUser ? 'Leave blank to keep current password' : 'Password will be securely hashed'}
                  />

                  <TextField
                    label="User Group ID"
                    value={formData.ugId}
                    onChange={handleChange('ugId')}
                    required
                    fullWidth
                    variant="outlined"
                    placeholder="UG001_PROP001"
                  />

                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.isActive}
                        onChange={handleChange('isActive')}
                      />
                    }
                    label="User is active"
                  />

                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.isAdmin}
                        onChange={handleChange('isAdmin')}
                      />
                    }
                    label="Admin privileges"
                  />

                  <Stack direction="row" spacing={2}>
                    <Button
                      type="submit"
                      variant="contained"
                      startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <PersonAddIcon />}
                      disabled={loading}
                      fullWidth
                      sx={{ py: 1.5 }}
                    >
                      {loading ? 'Saving...' : editingUser ? 'Update User' : 'Create User'}
                    </Button>
                    {editingUser && (
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

          {/* Users List */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3, backgroundColor: 'rgba(255, 255, 255, 0.95)' }}>
              <Typography variant="h5" sx={{ mb: 2, fontWeight: 500 }}>
                All Users ({users.length})
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
                        <TableCell><strong>Email</strong></TableCell>
                        <TableCell><strong>User Group</strong></TableCell>
                        <TableCell><strong>Status</strong></TableCell>
                        <TableCell><strong>Role</strong></TableCell>
                        <TableCell><strong>Actions</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {users.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} align="center">
                            No users found
                          </TableCell>
                        </TableRow>
                      ) : (
                        users.map((user) => (
                          <TableRow key={user.email}>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>{user.ug_id || 'N/A'}</TableCell>
                            <TableCell>
                              <Chip
                                label={user.is_active ? 'Active' : 'Inactive'}
                                color={user.is_active ? 'success' : 'default'}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              {user.is_admin && (
                                <Chip label="Admin" color="warning" size="small" />
                              )}
                            </TableCell>
                            <TableCell>
                              <IconButton
                                size="small"
                                onClick={() => handleEdit(user)}
                                color="primary"
                              >
                                <EditIcon />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={() => handleDeleteClick(user.email)}
                                color="error"
                                disabled={user.email === currentUser?.email}
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
          <DialogTitle>Delete User</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete user <strong>{userToDelete}</strong>?
              This action cannot be undone.
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

export default UserManagement;
