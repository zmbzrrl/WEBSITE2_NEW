import React, { useState, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  styled,
  TextField,
  Paper,
  Grid,
  Card,
  CardContent,
  CardMedia,
  IconButton,
  InputAdornment,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import logo from '../assets/logo.png';

// Panel images
import sp from '../assets/panels/SP.png';
import tagPir from '../assets/panels/TAG_PIR.png';
import idpgRn from '../assets/panels/IDPG_RN.png';
import dpRt from '../assets/panels/DP_RT.jpg';
import x1ls from '../assets/panels/X1LS.png';
import x1rs from '../assets/panels/X1RS.jpg';
import x1vUp from '../assets/panels/X1V_UP.png';
import x2ls from '../assets/panels/X2LS.png';
import x2rs from '../assets/panels/X2RS.png';
import x2vUp from '../assets/panels/X2V_UP.png';
import { ProjectContext } from '../App';

const BOQContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  width: '100%',
  background: 'linear-gradient(135deg, #2c3e50 0%, #4a5568 100%)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'flex-start',
  position: 'relative',
  padding: theme.spacing(2),
  overflow: 'auto',
  fontFamily: 'sans-serif'
}));

const ContentWrapper = styled(Box)({
  position: 'relative',
  zIndex: 2,
  textAlign: 'center',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '2rem',
  fontFamily: 'sans-serif',
  width: '100%',
  maxWidth: '1200px',
  marginTop: '2rem'
});

const Logo = styled('img')({
  width: '300px',
  marginBottom: '1rem',
  filter: 'brightness(0) invert(1)',
  cursor: 'pointer',
  transition: 'transform 0.2s ease',
  '&:hover': {
    transform: 'scale(1.05)'
  }
});

const Title = styled(Typography)(({ theme }) => ({
  color: 'white',
  fontWeight: 400,
  fontFamily: 'sans-serif',
  letterSpacing: '-0.02em',
  fontSize: '2.5rem',
  lineHeight: 1.2,
  marginBottom: '1rem',
  textAlign: 'center'
}));

const Subtitle = styled(Typography)(({ theme }) => ({
  color: 'rgba(255, 255, 255, 0.8)',
  fontWeight: 400,
  fontFamily: 'sans-serif',
  fontSize: '1.1rem',
  marginBottom: '2rem',
  textAlign: 'center',
  maxWidth: '600px'
}));

const PanelGrid = styled(Grid)({
  width: '100%',
  marginTop: '1rem'
});

const PanelCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  backgroundColor: 'rgba(255, 255, 255, 0.98)',
  borderRadius: '16px',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.15)',
  }
}));

const PanelImage = styled(CardMedia)({
  height: '200px',
  objectFit: 'contain',
  padding: '1rem',
  backgroundColor: '#f8f9fa'
});

const PanelTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  fontSize: '1.1rem',
  marginBottom: '0.5rem',
  color: theme.palette.text.primary,
  fontFamily: 'sans-serif'
}));

const PanelDescription = styled(Typography)(({ theme }) => ({
  fontSize: '0.9rem',
  color: theme.palette.text.secondary,
  marginBottom: '1rem',
  fontFamily: 'sans-serif'
}));

const QuantityContainer = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.5rem',
  marginTop: 'auto'
});

const QuantityButton = styled(IconButton)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: 'white',
  '&:hover': {
    backgroundColor: theme.palette.primary.dark,
  },
  '&:disabled': {
    backgroundColor: theme.palette.grey[300],
    color: theme.palette.grey[500],
  }
}));

const QuantityInput = styled(TextField)(({ theme }) => ({
  width: '80px',
  '& .MuiOutlinedInput-root': {
    borderRadius: '8px',
    '& input': {
      textAlign: 'center',
      fontSize: '1.1rem',
      fontWeight: 600,
    }
  }
}));

const ContinueButton = styled(Button)(({ theme }) => ({
  marginTop: '2rem',
  padding: theme.spacing(1.5, 4),
  fontSize: '1.2rem',
  fontWeight: 600,
  borderRadius: '12px',
  fontFamily: 'sans-serif',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  '&:hover': {
    boxShadow: '0 6px 16px rgba(0, 0, 0, 0.2)',
    transform: 'translateY(-1px)',
  },
  transition: 'all 0.2s ease'
}));

const SummaryBox = styled(Box)(({ theme }) => ({
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  borderRadius: '12px',
  padding: theme.spacing(2),
  marginBottom: '1rem',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.2)'
}));

// Panel data structure
const panelTypes = [
  {
    id: 'sp',
    name: 'Single Panel',
    description: 'Standard single panel for basic room control',
    image: sp,
    category: 'Basic Panels'
  },
  {
    id: 'tag',
    name: 'Thermostat Panel',
    description: 'Temperature control panel with display',
    image: tagPir,
    category: 'Basic Panels'
  },
  {
    id: 'idpg',
    name: 'Corridor Panel',
    description: 'Multi-function corridor control panel',
    image: idpgRn,
    category: 'Basic Panels'
  },
  {
    id: 'dph',
    name: 'Double Panel - Horizontal',
    description: 'Horizontal double panel for expanded control',
    image: dpRt,
    category: 'Double Panels'
  },
  {
    id: 'dpv',
    name: 'Double Panel - Vertical',
    description: 'Vertical double panel for expanded control',
    image: dpRt,
    category: 'Double Panels'
  },
  {
    id: 'x1h',
    name: 'Extended Panel - H1',
    description: 'Extended horizontal panel with 1 socket',
    image: x1ls,
    category: 'Extended Panels'
  },
  {
    id: 'x2h',
    name: 'Extended Panel - H2',
    description: 'Extended horizontal panel with 2 sockets',
    image: x2ls,
    category: 'Extended Panels'
  },
  {
    id: 'x1v',
    name: 'Extended Panel - V1',
    description: 'Extended vertical panel with 1 socket',
    image: x1vUp,
    category: 'Extended Panels'
  },
  {
    id: 'x2v',
    name: 'Extended Panel - V2',
    description: 'Extended vertical panel with 2 sockets',
    image: x2vUp,
    category: 'Extended Panels'
  }
];

const BOQ = () => {
  const navigate = useNavigate();
  const { projectName, projectCode } = useContext(ProjectContext);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  
  // Get project details from navigation state
  const location = useLocation();
  const projectDetails = location.state?.projectDetails;
  
  // Clear previous customized panels tracking when starting new BOQ
  React.useEffect(() => {
    if (projectDetails) {
      localStorage.removeItem('customizedPanels');
    }
  }, [projectDetails]);

  const handleQuantityChange = (panelId: string, newQuantity: number) => {
    if (newQuantity < 0) return;
    setQuantities(prev => ({
      ...prev,
      [panelId]: newQuantity
    }));
  };

  const handleIncrement = (panelId: string) => {
    handleQuantityChange(panelId, (quantities[panelId] || 0) + 1);
  };

  const handleDecrement = (panelId: string) => {
    handleQuantityChange(panelId, Math.max(0, (quantities[panelId] || 0) - 1));
  };

  const getTotalQuantity = () => {
    return Object.values(quantities).reduce((sum, qty) => sum + qty, 0);
  };

  const getSelectedPanels = () => {
    return panelTypes.filter(panel => quantities[panel.id] && quantities[panel.id] > 0);
  };

  const handleContinue = () => {
    const selectedPanels = getSelectedPanels();
    if (selectedPanels.length === 0) {
      alert('Please select at least one panel type');
      return;
    }
    
    // Store BOQ data in localStorage or context for later use
    localStorage.setItem('boqData', JSON.stringify({
      quantities,
      totalQuantity: getTotalQuantity(),
      selectedPanels: selectedPanels.map(panel => ({
        ...panel,
        quantity: quantities[panel.id]
      })),
      projectDetails: projectDetails
    }));
    
    navigate('/panel-type');
  };

  const categories = ['Basic Panels', 'Double Panels', 'Extended Panels'];

  return (
    <BOQContainer>
      <ContentWrapper>
        <Logo 
          src={logo} 
          alt="Interel Logo" 
          onClick={() => navigate('/')} 
        />
        
        <Title>
          Bill of Quantities
        </Title>
        
        <Subtitle>
          Select the panel types and quantities you need for your project
        </Subtitle>

        {projectDetails && (
          <SummaryBox>
            <Typography variant="h6" sx={{ color: 'white', fontWeight: 600, mb: 1 }}>
              Project: {projectDetails.projectName}
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', mb: 0.5 }}>
              Location: {projectDetails.location}
            </Typography>
            {projectDetails.projectCode && (
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', mb: 0.5 }}>
                Project Code: {projectDetails.projectCode}
              </Typography>
            )}
            {projectDetails.salesManager && (
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                Sales Manager: {projectDetails.salesManager}
              </Typography>
            )}
          </SummaryBox>
        )}

        {getTotalQuantity() > 0 && (
          <SummaryBox>
            <Typography variant="h6" sx={{ color: 'white', fontWeight: 600, mb: 1 }}>
              Summary: {getTotalQuantity()} panels selected
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
              {getSelectedPanels().map(panel => 
                `${panel.name}: ${quantities[panel.id]}`
              ).join(', ')}
            </Typography>
          </SummaryBox>
        )}

        {categories.map(category => {
          const categoryPanels = panelTypes.filter(panel => panel.category === category);
          const hasSelectedPanels = categoryPanels.some(panel => quantities[panel.id] && quantities[panel.id] > 0);
          
          return (
            <Box key={category} sx={{ width: '100%', mb: 4 }}>
              <Typography 
                variant="h5" 
                sx={{ 
                  color: 'white', 
                  fontWeight: 600, 
                  mb: 2, 
                  textAlign: 'left',
                  fontFamily: 'sans-serif'
                }}
              >
                {category}
              </Typography>
              
              <PanelGrid container spacing={3}>
                {categoryPanels.map((panel) => (
                  <Grid item xs={12} sm={6} md={4} key={panel.id}>
                    <PanelCard>
                      <PanelImage
                        component="img"
                        image={panel.image}
                        alt={panel.name}
                      />
                      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                        <PanelTitle>
                          {panel.name}
                        </PanelTitle>
                        <PanelDescription>
                          {panel.description}
                        </PanelDescription>
                        
                        <QuantityContainer>
                          <QuantityButton
                            onClick={() => handleDecrement(panel.id)}
                            disabled={(quantities[panel.id] || 0) <= 0}
                            size="small"
                          >
                            <RemoveIcon />
                          </QuantityButton>
                          
                          <QuantityInput
                            value={quantities[panel.id] || 0}
                            onChange={(e) => {
                              const value = parseInt(e.target.value) || 0;
                              handleQuantityChange(panel.id, value);
                            }}
                            variant="outlined"
                            size="small"
                            inputProps={{ min: 0 }}
                          />
                          
                          <QuantityButton
                            onClick={() => handleIncrement(panel.id)}
                            size="small"
                          >
                            <AddIcon />
                          </QuantityButton>
                        </QuantityContainer>
                      </CardContent>
                    </PanelCard>
                  </Grid>
                ))}
              </PanelGrid>
            </Box>
          );
        })}

        <ContinueButton
          variant="contained"
          color="primary"
          onClick={handleContinue}
          disabled={getTotalQuantity() === 0}
          startIcon={<ArrowForwardIcon />}
        >
          Continue to Customization
        </ContinueButton>
      </ContentWrapper>
    </BOQContainer>
  );
};

export default BOQ;