import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Alert,
  CircularProgress,
  Grid,
  Paper,
  Stack
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
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

const AdminFeedbackSimple: React.FC = () => {
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
      
      // Check if feedback table exists first
      const { data, error } = await supabase
        .from('feedback')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(10); // Limit to 10 items for testing

      if (error) {
        console.error('Database error:', error);
        if (error.message.includes('relation "feedback" does not exist')) {
          setError('Feedback system not set up yet. Please run the database setup script (add-feedback-table.sql) in your Supabase SQL Editor.');
        } else {
          setError('Failed to fetch feedback: ' + error.message);
        }
        setFeedback([]);
      } else {
        setFeedback(data || []);
        setError('');
      }
    } catch (err) {
      console.error('Error fetching feedback:', err);
      setError('Failed to fetch feedback. Please try again.');
      setFeedback([]);
    } finally {
      setLoading(false);
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
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4
                  }
                }}
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
                      <Typography variant="caption" color="text.secondary">
                        📷 {item.screenshots.length} screenshot{item.screenshots.length !== 1 ? 's' : ''}
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {feedback.length === 0 && !loading && !error && (
          <Paper sx={{ p: 4, textAlign: 'center', mt: 4 }}>
            <Typography variant="h6" color="text.secondary">
              No feedback submitted yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Users can submit feedback using the feedback button in the bottom right corner.
            </Typography>
          </Paper>
        )}
      </Box>
    </Box>
  );
};

export default AdminFeedbackSimple;
