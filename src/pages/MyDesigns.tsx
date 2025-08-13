// 📚 MY DESIGNS PAGE - This is like a RECIPE BOOK where users see all their saved designs
// Users can view, edit, and delete their designs from this page

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  IconButton,
  Chip,
  CircularProgress,
  Alert
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  ArrowBack as ArrowBackIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';

// 🗂️ Import our database functions
import { getDesigns, deleteDesign } from '../utils/database';
import { useCart } from '../contexts/CartContext';

// 🏪 STYLED COMPONENTS - These make the page look nice
const PageContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #2c3e50 0%, #4a5568 100%)',
  padding: theme.spacing(3),
  fontFamily: 'sans-serif'
}));

const HeaderContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  marginBottom: theme.spacing(4),
  color: 'white'
}));

const DesignCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
  }
}));

const CardActions = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: theme.spacing(2),
  borderTop: '1px solid #e0e0e0'
}));

// 🎯 MAIN COMPONENT - This is the actual page
const MyDesigns: React.FC = () => {
  // 🧭 Navigation tool (like a map to move between pages)
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  // 📊 State management (like memory boxes for the page)
  const [designs, setDesigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // 📧 Get the user's email from localStorage (like remembering who's logged in)
  const userEmail = localStorage.getItem('userEmail') || 'test@example.com';
  
  // 🔄 Load designs when the page loads (like opening a recipe book)
  useEffect(() => {
    loadDesigns();
  }, []);
  
  // 📋 Load all designs for the current user
  const loadDesigns = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 🗂️ Get designs from our database
      const result = await getDesigns(userEmail);
      
      if (result.success) {
        // Transform the data to match the expected format
        const transformedDesigns = result.designs.map((design: any) => ({
          id: design.id,
          projectName: design.design_name || design.user_projects?.project_name || 'Untitled Design',
          panelType: design.panel_type,
          createdAt: design.created_at,
          lastModified: design.last_modified,
          designData: design.design_data,
          projectId: design.project_id
        }));
        
        setDesigns(transformedDesigns);
        console.log(`📚 Loaded ${transformedDesigns.length} designs for ${userEmail}`);
      } else {
        setError('Failed to load designs');
      }
    } catch (error) {
      console.error('Error loading designs:', error);
      setError('Failed to load designs');
    } finally {
      setLoading(false);
    }
  };
  
  // 🗑️ Delete a design (like throwing away a recipe)
  const handleDeleteDesign = async (designId: string) => {
    try {
      const result = await deleteDesign(userEmail, designId);
      
      if (result.success) {
        // 🗂️ Remove the design from our list
        setDesigns(designs.filter(d => d.id !== designId));
        console.log(`🗑️ Deleted design ${designId}`);
      } else {
        setError('Failed to delete design');
      }
    } catch (error) {
      console.error('Error deleting design:', error);
      setError('Failed to delete design');
    }
  };
  
  // ✏️ Edit a design (like opening a recipe to modify it)
  const handleEditDesign = (design: any) => {
    console.log('Editing design:', design); // Debug log
    
    // Extract the actual design data from the new schema
    const designData = design.designData;
    
    // 🧭 Navigate to the appropriate customizer with the design data
    if (design.panelType === 'Project') {
      // For projects, go to the cart page with the project data
      navigate('/cart', { 
        state: { 
          editMode: true,
          projectData: JSON.parse(JSON.stringify(designData)), // Deep copy
          designId: design.id
        }
      });
    } else {
      // For individual panels, we need to load them into the cart context first
      // Map panel types to their correct customizer routes
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
      
      const customizerPath = panelTypeToRoute[design.panelType];
      
      if (customizerPath) {
        console.log('Navigating to:', customizerPath, 'with data:', designData);
        
        // For individual panels, we need to add them to the cart first
        // Then navigate to the customizer with the panel index
        
        // Add the panel to cart (this will be at index 0 since cart is empty)
        addToCart(JSON.parse(JSON.stringify(designData))); // Deep copy
        
        navigate(customizerPath, { 
          state: { 
            editMode: true,
            panelData: JSON.parse(JSON.stringify(designData)), // Deep copy
            designId: design.id,
            panelIndex: 0 // Since we just added it to the cart, it's at index 0
          }
        });
      } else {
        console.error('Unknown panel type:', design.panelType);
        // Fallback to panel type selector
        navigate('/panel-type');
      }
    }
  };

  // View design (read-only mode)
  const handleViewDesign = (design: any) => {
    console.log('Viewing design:', design);
    
    // Extract the actual design data from the new schema
    const designData = design.designData;
    
    if (design.panelType === 'Project') {
      // For projects, go to the cart page in view-only mode
      navigate('/cart', { 
        state: { 
          viewMode: true, // Read-only mode
          projectData: JSON.parse(JSON.stringify(designData)), // Deep copy
          designId: design.id
        }
      });
    } else {
      // For individual panels, navigate to customizer in view-only mode
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
      
      const customizerPath = panelTypeToRoute[design.panelType];
      
      if (customizerPath) {
        // Add panel to cart for viewing
        addToCart(JSON.parse(JSON.stringify(designData))); // Deep copy
        
        navigate(customizerPath, { 
          state: { 
            viewMode: true, // Read-only mode
            panelData: JSON.parse(JSON.stringify(designData)), // Deep copy
            designId: design.id,
            panelIndex: 0
          }
        });
      } else {
        console.error('Unknown panel type:', design.panelType);
        navigate('/panel-type');
      }
    }
  };

  // Create new revision (copy existing design and create new version)
  const handleCreateNewRevision = (design: any) => {
    console.log('Creating new revision for design:', design);
    
    // Extract the actual design data from the new schema
    const designData = design.designData;
    
    if (design.panelType === 'Project') {
      // For projects, load the design and navigate to cart for new revision
      navigate('/cart', { 
        state: { 
          createNewRevision: true, // Create new revision mode
          projectData: JSON.parse(JSON.stringify(designData)), // Deep copy
          originalDesignId: design.id,
          originalProjectName: design.projectName
        }
      });
    } else {
      // For individual panels, navigate to customizer for new revision
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
      
      const customizerPath = panelTypeToRoute[design.panelType];
      
      if (customizerPath) {
        // Add panel to cart for new revision
        addToCart(JSON.parse(JSON.stringify(designData))); // Deep copy
        
        navigate(customizerPath, { 
          state: { 
            createNewRevision: true, // Create new revision mode
            panelData: JSON.parse(JSON.stringify(designData)), // Deep copy
            originalDesignId: design.id,
            originalProjectName: design.projectName
          }
        });
      } else {
        console.error('Unknown panel type:', design.panelType);
        navigate('/panel-type');
      }
    }
  };
  
  // 📅 Format date for display (like making dates look nice)
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // 🎨 Render the page
  return (
    <PageContainer>
      {/* 📋 HEADER - Page title and navigation */}
      <HeaderContainer>
        <IconButton 
          onClick={() => navigate('/')} 
          sx={{ color: 'white' }}
        >
          <ArrowBackIcon />
        </IconButton>
        
        <Typography variant="h4" sx={{ color: 'white', fontWeight: 600 }}>
          📚 My Designs
        </Typography>
        
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/panel-type')}
          sx={{ 
            marginLeft: 'auto',
            background: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #2980b9 0%, #1f5f8b 100%)'
            }
          }}
        >
          Create New Design
        </Button>
      </HeaderContainer>
      
      {/* ⚠️ ERROR MESSAGE - Show if something went wrong */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {/* 🔄 LOADING SPINNER - Show while loading designs */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress sx={{ color: 'white' }} />
        </Box>
      ) : (
        /* 📋 DESIGNS GRID - Show all the user's designs */
        <Grid container spacing={3}>
          {designs.length === 0 ? (
            // 📭 EMPTY STATE - Show when user has no designs
            <Grid item xs={12}>
              <Card sx={{ textAlign: 'center', py: 4 }}>
                <CardContent>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    📭 No designs yet
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Create your first design to see it here!
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => navigate('/panel-type')}
                    sx={{ mt: 2 }}
                  >
                    Create Your First Design
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ) : (
            // 🎨 DESIGN CARDS - Show each design as a card
            designs.map((design) => (
              <Grid item xs={12} sm={6} md={4} key={design.id}>
                <DesignCard>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" gutterBottom>
                      {design.projectName}
                    </Typography>
                    
                    <Chip 
                      label={design.panelType} 
                      size="small" 
                      sx={{ mb: 2 }}
                      color="primary"
                    />
                    
                    <Typography variant="body2" color="text.secondary">
                      Created: {formatDate(design.createdAt)}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary">
                      Modified: {formatDate(design.lastModified)}
                    </Typography>
                  </CardContent>
                  
                  <CardActions>
                    {/* View Revision Button */}
                    <Button
                      size="small"
                      startIcon={<VisibilityIcon />}
                      onClick={() => handleViewDesign(design)}
                      variant="text"
                      sx={{ 
                        color: '#3498db',
                        '&:hover': {
                          backgroundColor: 'rgba(52, 152, 219, 0.1)'
                        }
                      }}
                    >
                      View
                    </Button>
                    
                    {/* Edit This Revision Button */}
                    <Button
                      size="small"
                      startIcon={<EditIcon />}
                      onClick={() => handleEditDesign(design)}
                      variant="outlined"
                      sx={{
                        borderColor: '#27ae60',
                        color: '#27ae60',
                        '&:hover': {
                          borderColor: '#229954',
                          backgroundColor: 'rgba(39, 174, 96, 0.1)'
                        }
                      }}
                    >
                      Edit
                    </Button>
                    
                    {/* Create New Revision Button */}
                    <Button
                      size="small"
                      startIcon={<AddIcon />}
                      onClick={() => handleCreateNewRevision(design)}
                      variant="contained"
                      sx={{
                        backgroundColor: '#e67e22',
                        color: 'white',
                        '&:hover': {
                          backgroundColor: '#d35400'
                        }
                      }}
                    >
                      New Rev
                    </Button>
                    
                    {/* Delete Button */}
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteDesign(design.id)}
                      color="error"
                      sx={{
                        marginLeft: 'auto'
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </CardActions>
                </DesignCard>
              </Grid>
            ))
          )}
        </Grid>
      )}
    </PageContainer>
  );
};

export default MyDesigns; 