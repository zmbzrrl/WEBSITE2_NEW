import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  IconButton,
  Alert,
  Chip,
  Stack
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { supabase } from '../utils/supabaseClient';

interface FeedbackModalProps {
  open: boolean;
  onClose: () => void;
}

const FeedbackModalSimple: React.FC<FeedbackModalProps> = ({ open, onClose }) => {
  const [message, setMessage] = useState('');
  const [screenshots, setScreenshots] = useState<File[]>([]);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newFiles = Array.from(files).slice(0, 5 - screenshots.length); // Max 5 screenshots
      setScreenshots(prev => [...prev, ...newFiles]);
    }
  };

  const removeScreenshot = (index: number) => {
    setScreenshots(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!message.trim()) {
      setErrorMessage('Please enter your feedback message.');
      return;
    }

    try {
      const userEmail = localStorage.getItem('userEmail') || 'anonymous';
      
      // Save feedback to database
      const { error: dbError } = await supabase
        .from('feedback')
        .insert({
          message: message.trim(),
          user_email: userEmail,
          screenshots: [], // For now, just save without screenshots
          timestamp: new Date().toISOString(),
          user_agent: navigator.userAgent,
          url: window.location.href,
          status: 'new'
        });

      if (dbError) {
        console.error('Database error:', dbError);
        if (dbError.message.includes('relation "feedback" does not exist')) {
          throw new Error('Feedback system not set up yet. Please run the database setup script.');
        }
        throw new Error(dbError.message);
      }
      
      setSubmitStatus('success');
      setMessage('');
      setScreenshots([]);
      
      // Close modal after 2 seconds
      setTimeout(() => {
        onClose();
        setSubmitStatus('idle');
      }, 2000);

    } catch (error) {
      console.error('Error submitting feedback:', error);
      setSubmitStatus('error');
      setErrorMessage('Failed to submit feedback. Please try again.');
    }
  };

  const handleClose = () => {
    setMessage('');
    setScreenshots([]);
    setSubmitStatus('idle');
    setErrorMessage('');
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          maxHeight: '80vh',
          width: '90vw',
          maxWidth: '500px'
        }
      }}
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" component="div">
            Send Feedback
          </Typography>
          <IconButton
            aria-label="close"
            onClick={handleClose}
            sx={{
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ pt: 1 }}>
          {submitStatus === 'success' && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Thank you for your feedback! It has been submitted successfully.
            </Alert>
          )}

          {submitStatus === 'error' && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errorMessage}
            </Alert>
          )}

          <TextField
            autoFocus
            margin="dense"
            label="Your Feedback"
            placeholder="Please describe any issues, suggestions, or comments you have..."
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            sx={{ mb: 2 }}
          />

          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Screenshots (Optional)
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Upload up to 5 screenshots
            </Typography>
            
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="screenshot-upload"
              multiple
              type="file"
              onChange={handleFileChange}
              disabled={screenshots.length >= 5}
            />
            <label htmlFor="screenshot-upload">
              <Button
                variant="outlined"
                component="span"
                startIcon={<CloudUploadIcon />}
                disabled={screenshots.length >= 5}
                size="small"
                sx={{ mb: 1 }}
              >
                Upload Screenshots
              </Button>
            </label>

            {screenshots.length > 0 && (
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {screenshots.map((file, index) => (
                  <Chip
                    key={index}
                    label={file.name}
                    onDelete={() => removeScreenshot(index)}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Stack>
            )}
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button
          onClick={handleClose}
          color="inherit"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!message.trim()}
        >
          Submit Feedback
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FeedbackModalSimple;
