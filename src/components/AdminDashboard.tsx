import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Stack
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import GroupIcon from '@mui/icons-material/Group';
import BusinessIcon from '@mui/icons-material/Business';
import FeedbackIcon from '@mui/icons-material/Feedback';
import HomeIcon from '@mui/icons-material/Home';
import DashboardIcon from '@mui/icons-material/Dashboard';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();

  const menuItems = [
    {
      title: 'User Management',
      description: 'Create, view, edit, and delete users',
      icon: <PeopleIcon sx={{ fontSize: 48 }} />,
      path: '/admin/users',
      color: '#4a5568'
    },
    {
      title: 'User Groups',
      description: 'Manage user groups (UG) and their assignments',
      icon: <GroupIcon sx={{ fontSize: 48 }} />,
      path: '/admin/user-groups',
      color: '#2d3748'
    },
    {
      title: 'Properties',
      description: 'Manage properties and regions',
      icon: <BusinessIcon sx={{ fontSize: 48 }} />,
      path: '/admin/properties',
      color: '#1a202c'
    },
    {
      title: 'Feedback',
      description: 'View and manage user feedback',
      icon: <FeedbackIcon sx={{ fontSize: 48 }} />,
      path: '/admin/feedback',
      color: '#718096'
    }
  ];

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
            variant="h3" 
            sx={{ 
              color: 'white', 
              fontWeight: 400,
              fontFamily: '"Myriad Hebrew", "Monsal Gothic", sans-serif',
              mb: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2
            }}
          >
            <DashboardIcon sx={{ fontSize: 40 }} />
            Admin Dashboard
          </Typography>
          <Stack direction="row" spacing={2} justifyContent="center" flexWrap="wrap">
            <Button
              variant="contained"
              startIcon={<HomeIcon />}
              onClick={() => navigate('/properties')}
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
              Go to Properties
            </Button>
          </Stack>
        </Box>

        {/* Menu Cards */}
        <Grid container spacing={3}>
          {menuItems.map((item) => (
            <Grid item xs={12} sm={6} md={3} key={item.path}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 6,
                  },
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                }}
                onClick={() => navigate(item.path)}
              >
                <CardContent sx={{ flexGrow: 1, textAlign: 'center', pt: 3 }}>
                  <Box sx={{ color: item.color, mb: 2 }}>
                    {item.icon}
                  </Box>
                  <Typography variant="h5" component="h2" sx={{ mb: 1, fontWeight: 500 }}>
                    {item.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {item.description}
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
                  <Button
                    size="small"
                    variant="contained"
                    sx={{
                      backgroundColor: item.color,
                      '&:hover': {
                        backgroundColor: item.color,
                        opacity: 0.9,
                      },
                    }}
                  >
                    Manage
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
};

export default AdminDashboard;

