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
  CircularProgress,
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

interface FeedbackData {
  message: string;
  screenshots: File[];
  userEmail: string;
  timestamp: string;
  userAgent: string;
  url: string;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ open, onClose }) => {
  const [message, setMessage] = useState('');
  const [screenshots, setScreenshots] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
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

    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      // Check if feedback table exists first
      const { data: tableCheck, error: tableError } = await supabase
        .from('feedback')
        .select('id')
        .limit(1);

      if (tableError && tableError.message.includes('relation "feedback" does not exist')) {
        throw new Error('Feedback system not set up yet. Please run the database setup script (add-feedback-table.sql) in your Supabase SQL Editor.');
      }
      const userEmail = localStorage.getItem('userEmail') || 'anonymous';
      const feedbackData: FeedbackData = {
        message: message.trim(),
        screenshots: screenshots,
        userEmail,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
      };

      // Upload screenshots to Supabase storage first
      const screenshotUrls: string[] = [];
      for (const screenshot of screenshots) {
        try {
          const fileName = `feedback-${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${screenshot.name.split('.').pop()}`;
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('feedback-screenshots')
            .upload(fileName, screenshot);

          if (uploadError) {
            console.error('Error uploading screenshot:', uploadError);
            continue;
          }

          // Get public URL
          const { data: urlData } = supabase.storage
            .from('feedback-screenshots')
            .getPublicUrl(fileName);

          if (urlData?.publicUrl) {
            screenshotUrls.push(urlData.publicUrl);
          }
        } catch (error) {
          console.error('Error processing screenshot:', error);
          continue;
        }
      }

      // Save feedback to database
      const { error: dbError } = await supabase
        .from('feedback')
        .insert({
          message: feedbackData.message,
          user_email: feedbackData.userEmail,
          screenshots: screenshotUrls,
          timestamp: feedbackData.timestamp,
          user_agent: feedbackData.userAgent,
          url: feedbackData.url,
          status: 'new'
        });

      if (dbError) {
        console.error('Database error:', dbError);
        // If table doesn't exist, show a helpful message
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
      setErrorMessage(error instanceof Error ? error.message : 'Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setMessage('');
      setScreenshots([]);
      setSubmitStatus('idle');
      setErrorMessage('');
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          minHeight: '400px'
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
            disabled={isSubmitting}
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
            rows={6}
            variant="outlined"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={isSubmitting}
            sx={{ mb: 3 }}
          />

          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Screenshots (Optional)
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Upload up to 5 screenshots to help illustrate your feedback
            </Typography>
            
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="screenshot-upload"
              multiple
              type="file"
              onChange={handleFileChange}
              disabled={isSubmitting || screenshots.length >= 5}
            />
            <label htmlFor="screenshot-upload">
              <Button
                variant="outlined"
                component="span"
                startIcon={<CloudUploadIcon />}
                disabled={isSubmitting || screenshots.length >= 5}
                sx={{ mb: 2 }}
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
                    disabled={isSubmitting}
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
          disabled={isSubmitting}
          color="inherit"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={isSubmitting || !message.trim()}
          startIcon={isSubmitting ? <CircularProgress size={16} /> : null}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FeedbackModal;
