import React from 'react';
import { Link, useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Grid,
  Box,
  Card,
  CardMedia,
  CardActionArea,
  Button,
  Paper,
  useTheme,
} from '@mui/material';
import X1H from "../../assets/panels/X1RS.jpg";
import X2H from "../../assets/panels/X2RS.png";
import X2V from "../../assets/panels/X2V_UP.png";
import X1V from "../../assets/panels/X1V_UP.png";
import CartButton from "../../components/CartButton";

const horizontalPanels = [
  {
    name: "Extended Panel - Horizontal (1 socket)",
    image: X1H,
    path: "/customizer/X1H",
    width: 400,
  },
  {
    name: "Extended Panel - Horizontal (2 sockets)",
    image: X2H,
    path: "/customizer/X2H",
    width: 500,
  },
];

const verticalPanels = [
  {
    name: "Extended Panel - Vertical (1 socket)",
    image: X1V,
    path: "/customizer/X1V",
    width: 200,
  },
  {
    name: "Extended Panel - Vertical (2 sockets)",
    image: X2V,
    path: "/customizer/X2V",
    width: 200,
  },
];

const ExtendedPanelSelector: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  const renderPanelSection = (title: string, panels: typeof horizontalPanels) => (
    <Paper 
      elevation={0}
      sx={{ 
        p: 4,
        mb: 4,
        borderRadius: 4,
        background: 'linear-gradient(145deg, #ffffff 0%, #f5f5f5 100%)',
        border: '1px solid rgba(27,146,209,0.1)',
      }}
    >
      <Typography 
        variant="h4" 
        component="h2" 
        align="center" 
        gutterBottom
        sx={{ 
          mb: 4,
          color: 'primary.main',
          fontWeight: 600,
          position: 'relative',
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: -8,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 60,
            height: 3,
            backgroundColor: 'primary.main',
            borderRadius: 2,
          }
        }}
      >
        {title}
      </Typography>
      <Grid container spacing={4} justifyContent="center">
        {panels.map((panel) => (
          <Grid item xs={12} sm={6} md={4} key={panel.name}>
            <Box sx={{ textAlign: 'center' }}>
              <Card 
                sx={{ 
                  width: panel.width,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 20px rgba(27,146,209,0.15)',
                  },
                  mb: 2,
                  borderRadius: 3,
                  overflow: 'hidden',
                  background: 'white',
                }}
              >
                <CardActionArea component={Link} to={panel.path}>
                  <CardMedia
                    component="img"
                    image={panel.image}
                    alt={panel.name}
                    sx={{
                      width: '100%',
                      height: 'auto',
                      objectFit: 'contain',
                      p: 2,
                    }}
                  />
                </CardActionArea>
              </Card>
              <Typography 
                variant="h6" 
                component="div"
                sx={{ 
                  color: 'primary.main',
                  fontWeight: 600,
                  mt: 2,
                  fontSize: '1.1rem',
                  letterSpacing: '0.5px',
                }}
              >
                {panel.name}
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Paper>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 6, position: 'relative' }}>
      <Box sx={{ position: 'absolute', top: 20, right: 30, zIndex: 1 }}>
        <CartButton />
      </Box>

      <Typography 
        variant="h3" 
        component="h1" 
        align="center" 
        gutterBottom
        sx={{ 
          mb: 6,
          color: 'primary.main',
          fontWeight: 600,
          position: 'relative',
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: -12,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 80,
            height: 4,
            backgroundColor: 'primary.main',
            borderRadius: 2,
          }
        }}
      >
        Select an Extended Panel
      </Typography>

      {renderPanelSection("Horizontal Panels", horizontalPanels)}
      {renderPanelSection("Vertical Panels", verticalPanels)}

      <Box sx={{ mt: 6, textAlign: 'center' }}>
        <Button
          variant="contained"
          onClick={() => navigate("/")}
          sx={{
            px: 6,
            py: 1.5,
            fontSize: '1.1rem',
            borderRadius: 3,
            background: 'linear-gradient(145deg, #1b92d1 0%, #1679b3 100%)',
            boxShadow: '0 4px 12px rgba(27,146,209,0.2)',
            '&:hover': {
              background: 'linear-gradient(145deg, #1679b3 0%, #1b92d1 100%)',
              boxShadow: '0 6px 16px rgba(27,146,209,0.3)',
            },
          }}
        >
          Back to Panel Selection
        </Button>
      </Box>
    </Container>
  );
};

export default ExtendedPanelSelector; 