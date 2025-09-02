import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  styled
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

// Import all images from the design_guidelines folder
import guideline1 from '../assets/design_guidelines/guideline1.png';

const designGuidelinesImages = [
  guideline1
];

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    maxWidth: '90vw',
    maxHeight: '90vh',
    width: '90vw',
    height: '90vh'
  }
}));

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.2s ease-in-out',
  '&:hover': {
    transform: 'scale(1.02)',
    boxShadow: theme.shadows[8]
  }
}));



interface DesignGuidelinesProps {
  open: boolean;
  onClose: () => void;
}

const DesignGuidelines: React.FC<DesignGuidelinesProps> = ({ open, onClose }) => {
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    // For now, we'll use placeholder images
    // In a real implementation, you might want to dynamically import images
    // or fetch them from an API
    setImages(designGuidelinesImages);
  }, []);

  return (
    <StyledDialog
      open={open}
      onClose={onClose}
      aria-labelledby="design-guidelines-dialog-title"
    >
      <DialogTitle id="design-guidelines-dialog-title">
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h5" component="div">
            INTEREL Design Guidelines
          </Typography>
          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        {images.length > 0 ? (
          <Grid container spacing={3}>
            {images.map((image, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <StyledCard>
                  <Box
                    component="img"
                    src={image}
                    alt={`Design Guideline ${index + 1}`}
                    sx={{
                      height: 200,
                      width: '100%',
                      objectFit: 'cover'
                    }}
                  />
                  <CardContent>
                    <Typography variant="body2" color="text.secondary">
                      Design Guideline {index + 1}
                    </Typography>
                  </CardContent>
                </StyledCard>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            minHeight="400px"
            textAlign="center"
          >
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No Design Guidelines Available
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Please add images to the design_guidelines folder to see them here.
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              You can add PNG, JPG, or SVG files to src/assets/design_guidelines/
            </Typography>
          </Box>
        )}
      </DialogContent>
    </StyledDialog>
  );
};

export default DesignGuidelines;
