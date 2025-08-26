import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  TextField,
  InputAdornment,
  IconButton,
  Button,
  Divider,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  TableSortLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Alert
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  ExpandMore as ExpandMoreIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { getAllDesigns } from '../utils/database';
import { deleteDesign } from '../utils/database';
import { useNavigate } from 'react-router-dom';

const PageContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  backgroundColor: '#f6f8fa',
  padding: theme.spacing(3)
}));

const PanelCard = styled(Card)(({ theme }) => ({
  backgroundColor: 'rgba(255, 255, 255, 0.95)',
  borderRadius: '8px'
}));

type AdminDesign = {
  id: string;
  design_name: string;
  panel_type: string;
  design_data: any;
  created_at: string;
  last_modified: string;
  user_email: string;
  project_name: string;
  project_description?: string | null;
  location?: string | null;
  operator?: string | null;
  service_partner?: string | null;
};

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [designs, setDesigns] = useState<AdminDesign[]>([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [targetDesign, setTargetDesign] = useState<{ id: string; user_email: string; design_name: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [filters, setFilters] = useState({
    location: '',
    operator: '',
    projectName: '',
    userEmail: '',
    panelType: '',
    search: ''
  });

  const [sortBy, setSortBy] = useState<'last_modified' | 'created_at' | 'project_name' | 'design_name' | 'project_code' | 'location' | 'operator' | 'user_email'>('last_modified');
  const [ascending, setAscending] = useState<boolean>(false);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getAllDesigns({
        location: filters.location,
        operator: filters.operator,
        projectName: filters.projectName,
        userEmail: filters.userEmail,
        panelType: filters.panelType,
        search: filters.search,
        orderBy: sortBy as any,
        ascending,
        limit: undefined
      } as any);
      if (result && result.success) {
        setDesigns(result.designs as AdminDesign[]);
      } else {
        setError(result?.message || 'Failed to load designs');
      }
    } catch (e: any) {
      setError(e?.message || 'Unexpected error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const panelTypeToRoute: { [key: string]: string } = {
    'SP': '/customizer/sp',
    'DPH': '/customizer/dph',
    'DPV': '/customizer/dpv',
    'X1H': '/customizer/x1h',
    'X2H': '/customizer/x2h',
    'X2V': '/customizer/x2v',
    'X1V': '/customizer/x1v',
    'TAG': '/customizer/tag',
    'IDPG': '/customizer/idpg'
  };

  const rows = useMemo(() => {
    const list = designs.map(d => ({
      id: d.id,
      project_name: d.project_name || 'Untitled Project',
      design_name: d.design_name,
      panel_type: d.panel_type,
      location: d.location || '—',
      operator: d.operator || d.service_partner || '—',
      user_email: d.user_email,
      created_at: d.created_at,
      last_modified: d.last_modified,
      design_data: d.design_data,
      project_code: (d.design_data as any)?.projectCode || (d.design_data as any)?.designData?.projectCode || '—'
    }));
    const cmp = (a: any, b: any) => {
      let av: any = a[sortBy];
      let bv: any = b[sortBy];
      if (sortBy === 'last_modified' || sortBy === 'created_at') {
        av = new Date(av || 0).getTime();
        bv = new Date(bv || 0).getTime();
      } else {
        av = (av || '').toString().toLowerCase();
        bv = (bv || '').toString().toLowerCase();
      }
      if (av < bv) return ascending ? -1 : 1;
      if (av > bv) return ascending ? 1 : -1;
      return 0;
    };
    return list.sort(cmp);
  }, [designs, sortBy, ascending]);

  const onSort = (column: typeof sortBy) => {
    if (sortBy === column) {
      setAscending(a => !a);
    } else {
      setSortBy(column);
      setAscending(column === 'last_modified' ? false : true);
    }
  };
  
  const requestDelete = (row: any) => {
    setTargetDesign({ id: row.id, user_email: row.user_email, design_name: row.design_name });
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!targetDesign) return;
    try {
      setDeleting(true);
      setError(null);
      const result = await deleteDesign(targetDesign.user_email, targetDesign.id);
      if (result && result.success) {
        setDesigns(prev => prev.filter(d => d.id !== targetDesign.id));
        setConfirmOpen(false);
        setTargetDesign(null);
      } else {
        setError(result?.message || 'Failed to delete design');
      }
    } catch (e: any) {
      setError(e?.message || 'Failed to delete design');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <PageContainer>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h4" fontWeight={700} sx={{ color: '#1f2937' }}>Admin Designs</Typography>
          <Typography variant="body2" sx={{ color: '#6b7280', mt: 0.5 }}>
            View and filter designs across all users
          </Typography>
        </Box>
        <IconButton onClick={load} sx={{ color: '#374151' }}>
          <RefreshIcon />
        </IconButton>
      </Box>

      <Paper elevation={0} sx={{ mb: 2, p: 2, border: '1px solid #e5e7eb', borderRadius: 2, backgroundColor: 'white' }}>
        <Grid container spacing={1.5}>
          <Grid item xs={12} md={2.4 as any}>
            <TextField fullWidth size="small" label="Location" value={filters.location}
              onChange={e => setFilters(f => ({ ...f, location: e.target.value }))}
            />
          </Grid>
          <Grid item xs={12} md={2.4 as any}>
            <TextField fullWidth size="small" label="Operator" value={filters.operator}
              onChange={e => setFilters(f => ({ ...f, operator: e.target.value }))}
            />
          </Grid>
          <Grid item xs={12} md={2.4 as any}>
            <TextField fullWidth size="small" label="Project" value={filters.projectName}
              onChange={e => setFilters(f => ({ ...f, projectName: e.target.value }))}
            />
          </Grid>
          <Grid item xs={12} md={2.4 as any}>
            <TextField fullWidth size="small" label="User Email" value={filters.userEmail}
              onChange={e => setFilters(f => ({ ...f, userEmail: e.target.value }))}
            />
          </Grid>
          <Grid item xs={12} md={2.4 as any}>
            <TextField fullWidth size="small" label="Panel Type" value={filters.panelType}
              onChange={e => setFilters(f => ({ ...f, panelType: e.target.value }))}
            />
          </Grid>
          <Grid item xs={12} md={9}>
            <TextField fullWidth size="small" label="Search project/design"
              value={filters.search}
              onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                )
              }}
            />
          </Grid>
          <Grid item xs={12} md={3} sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
            <Button variant="outlined" onClick={() => setFilters({ location: '', operator: '', projectName: '', userEmail: '', panelType: '', search: '' })}>Clear</Button>
            <Button variant="contained" onClick={load}>Apply</Button>
          </Grid>
        </Grid>
      </Paper>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
          <CircularProgress />
        </Box>
      )}
      {error && (
        <PanelCard sx={{ mb: 2 }}>
          <CardContent>
            <Typography color="error">{error}</Typography>
          </CardContent>
        </PanelCard>
      )}

      {!loading && !error && rows.length === 0 && (
        <Typography sx={{ color: '#6b7280' }}>No designs found.</Typography>
      )}

      {!loading && !error && rows.length > 0 && (
        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e5e7eb', borderRadius: 2, backgroundColor: 'white' }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sortDirection={sortBy === 'project_name' ? (ascending ? 'asc' : 'desc') : false as any}>
                  <TableSortLabel active={sortBy === 'project_name'} direction={ascending ? 'asc' : 'desc'} onClick={() => onSort('project_name')}>Project</TableSortLabel>
                </TableCell>
                <TableCell sortDirection={sortBy === 'project_code' ? (ascending ? 'asc' : 'desc') : false as any}>
                  <TableSortLabel active={sortBy === 'project_code'} direction={ascending ? 'asc' : 'desc'} onClick={() => onSort('project_code')}>Project Code</TableSortLabel>
                </TableCell>
                <TableCell sortDirection={sortBy === 'design_name' ? (ascending ? 'asc' : 'desc') : false as any}>
                  <TableSortLabel active={sortBy === 'design_name'} direction={ascending ? 'asc' : 'desc'} onClick={() => onSort('design_name')}>Design</TableSortLabel>
                </TableCell>
                <TableCell sortDirection={sortBy === 'location' ? (ascending ? 'asc' : 'desc') : false as any}>
                  <TableSortLabel active={sortBy === 'location'} direction={ascending ? 'asc' : 'desc'} onClick={() => onSort('location')}>Location</TableSortLabel>
                </TableCell>
                <TableCell sortDirection={sortBy === 'operator' ? (ascending ? 'asc' : 'desc') : false as any}>
                  <TableSortLabel active={sortBy === 'operator'} direction={ascending ? 'asc' : 'desc'} onClick={() => onSort('operator')}>Operator</TableSortLabel>
                </TableCell>
                <TableCell sortDirection={sortBy === 'user_email' ? (ascending ? 'asc' : 'desc') : false as any}>
                  <TableSortLabel active={sortBy === 'user_email'} direction={ascending ? 'asc' : 'desc'} onClick={() => onSort('user_email')}>User</TableSortLabel>
                </TableCell>
                <TableCell sortDirection={sortBy === 'created_at' ? (ascending ? 'asc' : 'desc') : false as any}>
                  <TableSortLabel active={sortBy === 'created_at'} direction={ascending ? 'asc' : 'desc'} onClick={() => onSort('created_at')}>Created</TableSortLabel>
                </TableCell>
                <TableCell sortDirection={sortBy === 'last_modified' ? (ascending ? 'asc' : 'desc') : false as any}>
                  <TableSortLabel active={sortBy === 'last_modified'} direction={ascending ? 'asc' : 'desc'} onClick={() => onSort('last_modified')}>Last Modified</TableSortLabel>
                </TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map(r => {
                const normalizedType = (r.panel_type || '').toString().trim().toUpperCase();
                const customizerPath = panelTypeToRoute[normalizedType];
                const isProject = normalizedType === 'PROJECT';
                const canOpen = Boolean(customizerPath) || isProject;
                const onOpen = () => {
                  // Debug for troubleshooting
                  console.log('[AdminDashboard] View clicked:', { id: r.id, type: r.panel_type, normalizedType, hasCustomizer: !!customizerPath });
                  if (isProject) {
                    navigate('/cart', {
                      state: {
                        viewMode: true,
                        projectData: JSON.parse(JSON.stringify((r as any).design_data?.designData || (r as any).design_data)),
                        designId: r.id,
                        cameFromAdmin: true
                      }
                    });
                    return;
                  }
                  if (customizerPath) {
                    navigate(customizerPath, {
                      state: {
                        viewMode: true,
                        panelData: JSON.parse(JSON.stringify(r.design_data)),
                        designId: r.id,
                        panelIndex: 0,
                        cameFromAdmin: true
                      }
                    });
                  } else {
                    // Fallback if unknown type
                    navigate('/panel-type');
                  }
                };
                return (
                  <TableRow key={r.id} hover sx={{ cursor: canOpen ? 'pointer' : 'default' }} onClick={() => canOpen && onOpen()}>
                    <TableCell>{r.project_name}</TableCell>
                    <TableCell>{(r as any).project_code}</TableCell>
                    <TableCell>{r.design_name}</TableCell>
                    <TableCell>{r.location}</TableCell>
                    <TableCell>{r.operator}</TableCell>
                    <TableCell>{r.user_email}</TableCell>
                    <TableCell>{new Date(r.created_at).toLocaleString()}</TableCell>
                    <TableCell>{new Date(r.last_modified).toLocaleString()}</TableCell>
                    <TableCell align="right">
                      <Button size="small" variant="text" onClick={(e) => { e.stopPropagation(); onOpen(); }}>View</Button>
                      <Button size="small" variant="text" color="error" onClick={(e) => { e.stopPropagation(); requestDelete(r); }}>Delete</Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      <Dialog open={confirmOpen} onClose={() => (!deleting && setConfirmOpen(false)) || undefined}>
        <DialogTitle>Delete design?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete “{targetDesign?.design_name}”? This action cannot be undone.
          </DialogContentText>
          {error && (
            <Box sx={{ mt: 2 }}>
              <Alert severity="error">{error}</Alert>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)} disabled={deleting}>Cancel</Button>
          <Button color="error" onClick={handleConfirmDelete} disabled={deleting}>
            {deleting ? 'Deleting…' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
};

export default AdminDashboard;


