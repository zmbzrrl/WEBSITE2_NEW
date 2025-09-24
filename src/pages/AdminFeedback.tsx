import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Alert,
  CircularProgress,
  Grid,
  Divider,
  Stack,
  Paper
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import RefreshIcon from '@mui/icons-material/Refresh';
import ImageIcon from '@mui/icons-material/Image';
import { supabase } from '../utils/supabaseClient';
import { isAdminEmail } from '../utils/admin';

interface FeedbackItem {
  id: number;
  message: string;
  user_email: string;
  screenshots: string[];
  timestamp: string;
  user_agent: string;
  url: string;
  status: 'new' | 'in_progress' | 'resolved';
}

const AdminFeedback: React.FC = () => {
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackItem | null>(null);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');

  const userEmail = localStorage.getItem('userEmail');

  useEffect(() => {
    if (userEmail && isAdminEmail(userEmail)) {
      fetchFeedback();
    } else {
      setError('Access denied. Admin privileges required.');
      setLoading(false);
    }
  }, [userEmail]);

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('feedback')
        .select('*')
        .order('timestamp', { ascending: false });

      if (error) {
        console.error('Database error:', error);
        // If table doesn't exist, show a helpful message
        if (error.message.includes('relation "feedback" does not exist')) {
          throw new Error('Feedback system not set up yet. Please run the database setup script (add-feedback-table.sql) in your Supabase SQL Editor.');
        }
        throw new Error(error.message);
      }

      setFeedback(data || []);
    } catch (err) {
      console.error('Error fetching feedback:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch feedback');
    } finally {
      setLoading(false);
    }
  };

  const updateFeedbackStatus = async (id: number, status: 'new' | 'in_progress' | 'resolved') => {
    try {
      const { error } = await supabase
        .from('feedback')
        .update({ status })
        .eq('id', id);

      if (error) {
        throw new Error(error.message);
      }

      setFeedback(prev => 
        prev.map(item => 
          item.id === id ? { ...item, status } : item
        )
      );
    } catch (err) {
      console.error('Error updating feedback status:', err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'error';
      case 'in_progress': return 'warning';
      case 'resolved': return 'success';
      default: return 'default';
    }
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const openImageDialog = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setImageDialogOpen(true);
  };

  if (!userEmail || !isAdminEmail(userEmail)) {
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

  if (loading) {
    return (
      <Box sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #718096 0%, #a0aec0 100%)'
      }}>
        <CircularProgress size={48} sx={{ color: '#ffffff' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #718096 0%, #a0aec0 100%)',
      py: 4
    }}>
      <Box sx={{ maxWidth: 1200, mx: 'auto', px: 3 }}>
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
            Feedback Management
          </Typography>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchFeedback}
            sx={{
              color: 'rgba(255, 255, 255, 0.9)',
              borderColor: 'rgba(255, 255, 255, 0.3)',
              '&:hover': {
                borderColor: 'rgba(255, 255, 255, 0.6)',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              },
            }}
          >
            Refresh
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Feedback List */}
        <Grid container spacing={3}>
          {feedback.map((item) => (
            <Grid item xs={12} md={6} lg={4} key={item.id}>
              <Card 
                sx={{ 
                  height: '100%',
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4
                  }
                }}
                onClick={() => setSelectedFeedback(item)}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Chip 
                      label={item.status.replace('_', ' ').toUpperCase()} 
                      color={getStatusColor(item.status) as any}
                      size="small"
                    />
                    <Typography variant="caption" color="text.secondary">
                      {formatDate(item.timestamp)}
                    </Typography>
                  </Box>

                  <Typography variant="subtitle2" gutterBottom>
                    From: {item.user_email}
                  </Typography>

                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ 
                      mb: 2,
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}
                  >
                    {item.message}
                  </Typography>

                  {item.screenshots.length > 0 && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <ImageIcon fontSize="small" color="action" />
                      <Typography variant="caption" color="text.secondary">
                        {item.screenshots.length} screenshot{item.screenshots.length !== 1 ? 's' : ''}
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {feedback.length === 0 && !loading && (
          <Paper sx={{ p: 4, textAlign: 'center', mt: 4 }}>
            <Typography variant="h6" color="text.secondary">
              No feedback submitted yet
            </Typography>
          </Paper>
        )}
      </Box>

      {/* Feedback Detail Dialog */}
      <Dialog
        open={!!selectedFeedback}
        onClose={() => setSelectedFeedback(null)}
        maxWidth="md"
        fullWidth
      >
        {selectedFeedback && (
          <>
            <DialogTitle>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h6">
                  Feedback from {selectedFeedback.user_email}
                </Typography>
                <IconButton onClick={() => setSelectedFeedback(null)}>
                  <CloseIcon />
                </IconButton>
              </Box>
            </DialogTitle>

            <DialogContent>
              <Stack spacing={3}>
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Status
                  </Typography>
                  <Chip 
                    label={selectedFeedback.status.replace('_', ' ').toUpperCase()} 
                    color={getStatusColor(selectedFeedback.status) as any}
                  />
                </Box>

                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Submitted
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {formatDate(selectedFeedback.timestamp)}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    URL
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedFeedback.url}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Message
                  </Typography>
                  <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                    <Typography variant="body2">
                      {selectedFeedback.message}
                    </Typography>
                  </Paper>
                </Box>

                {selectedFeedback.screenshots.length > 0 && (
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      Screenshots
                    </Typography>
                    <Grid container spacing={2}>
                      {selectedFeedback.screenshots.map((screenshot, index) => (
                        <Grid item xs={6} sm={4} key={index}>
                          <Box
                            component="img"
                            src={screenshot}
                            alt={`Screenshot ${index + 1}`}
                            sx={{
                              width: '100%',
                              height: 120,
                              objectFit: 'cover',
                              borderRadius: 1,
                              cursor: 'pointer',
                              border: '1px solid',
                              borderColor: 'divider',
                              '&:hover': {
                                opacity: 0.8
                              }
                            }}
                            onClick={() => openImageDialog(screenshot)}
                          />
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                )}
              </Stack>
            </DialogContent>

            <DialogActions>
              <Button
                onClick={() => updateFeedbackStatus(selectedFeedback.id, 'new')}
                color="error"
                variant={selectedFeedback.status === 'new' ? 'contained' : 'outlined'}
                size="small"
              >
                Mark as New
              </Button>
              <Button
                onClick={() => updateFeedbackStatus(selectedFeedback.id, 'in_progress')}
                color="warning"
                variant={selectedFeedback.status === 'in_progress' ? 'contained' : 'outlined'}
                size="small"
              >
                In Progress
              </Button>
              <Button
                onClick={() => updateFeedbackStatus(selectedFeedback.id, 'resolved')}
                color="success"
                variant={selectedFeedback.status === 'resolved' ? 'contained' : 'outlined'}
                size="small"
              >
                Resolved
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Image Dialog */}
      <Dialog
        open={imageDialogOpen}
        onClose={() => setImageDialogOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Screenshot</Typography>
            <IconButton onClick={() => setImageDialogOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box
            component="img"
            src={selectedImage}
            alt="Screenshot"
            sx={{
              width: '100%',
              height: 'auto',
              maxHeight: '70vh',
              objectFit: 'contain'
            }}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default AdminFeedback;
