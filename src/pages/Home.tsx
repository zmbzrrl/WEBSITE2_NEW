import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  styled,
  TextField,
  Paper,
} from '@mui/material';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import logo from '../assets/logo2.png';
import tagPir from '../assets/panels/TAG_PIR.png';
import idpgRn from '../assets/panels/IDPG_RN.png';
import idpg from '../assets/panels/IDPG.png';
import sp from '../assets/panels/SP.png';
import x2rs from '../assets/panels/X2RS.png';
import dpRt from '../assets/panels/DP_RT.jpg';

const HomeContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  width: '100%',
  background: 'linear-gradient(135deg, #2c3e50 0%, #4a5568 100%)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  padding: theme.spacing(2),
  overflow: 'visible',
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
  maxWidth: '720px'
});

const Logo = styled('img')({
  width: '400px',
  marginBottom: '2rem',
  marginTop: '-1rem',
  animation: 'fadeIn 1.2s ease-out',
  position: 'relative',
  zIndex: 2,
  filter: 'brightness(0) invert(1)',
  '@keyframes fadeIn': {
    '0%': {
      opacity: 0,
      transform: 'translateY(-20px)'
    },
    '100%': {
      opacity: 1,
      transform: 'translateY(0)'
    }
  }
});

const AnimatedBox = styled(Box)(({ theme }) => ({
  color: 'white',
  marginBottom: theme.spacing(3),
  marginTop: '-2rem',
  textAlign: 'center',
  animation: 'fadeIn 1.2s ease-out 0.2s both',
  position: 'relative',
  zIndex: 2,
  fontFamily: 'sans-serif',
  '@keyframes fadeIn': {
    '0%': {
      opacity: 0,
      transform: 'translateY(-20px)'
    },
    '100%': {
      opacity: 1,
      transform: 'translateY(0)'
    }
  }
}));

const ButtonContainer = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
  width: '100%',
  maxWidth: '300px',
  marginTop: '-0.5rem',
  position: 'relative',
  zIndex: 2,
  fontFamily: 'sans-serif'
});

const StyledButton = styled(Button)(({ theme }) => ({
  width: '100%',
  padding: theme.spacing(1.5),
  fontSize: '1.1rem',
  animation: 'fadeIn 1.2s ease-out 0.4s both',
  fontFamily: 'sans-serif',
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  '@keyframes fadeIn': {
    '0%': {
      opacity: 0,
      transform: 'translateY(20px)'
    },
    '100%': {
      opacity: 1,
      transform: 'translateY(0)'
    }
  }
}));

const DownArrow = styled(ArrowDownwardIcon)({
  animation: 'bounce 2s infinite',
  '@keyframes bounce': {
    '0%, 20%, 50%, 80%, 100%': {
      transform: 'translateY(0)',
    },
    '40%': {
      transform: 'translateY(-10px)',
    },
    '60%': {
      transform: 'translateY(-5px)',
    }
  }
});

const FloatingImage = styled('img')({
  position: 'absolute',
  width: '200px',
  opacity: 1,
  filter: 'drop-shadow(0 10px 20px rgba(0, 0, 0, 0.3))',
  animation: 'float 6s ease-in-out infinite',
  '&::before': {
    content: '""',
    position: 'absolute',
    bottom: '-30px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '160px',
    height: '30px',
    background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0) 70%)',
    borderRadius: '50%',
    animation: 'shadowFloat 6s ease-in-out infinite',
    zIndex: -1
  },
  '@keyframes float': {
    '0%': {
      transform: 'translateY(0px) rotate(0deg)',
    },
    '50%': {
      transform: 'translateY(-20px) rotate(5deg)',
    },
    '100%': {
      transform: 'translateY(0px) rotate(0deg)',
    }
  },
  '@keyframes shadowFloat': {
    '0%': {
      transform: 'translateX(-50%) scale(1)',
      opacity: 0.4,
    },
    '50%': {
      transform: 'translateX(-50%) scale(0.7)',
      opacity: 0.2,
    },
    '100%': {
      transform: 'translateX(-50%) scale(1)',
      opacity: 0.4,
    }
  }
});

const ProjectPrompt = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  backgroundColor: 'rgba(255, 255, 255, 0.95)',
  borderRadius: '12px',
  maxWidth: '600px',
  width: '90%',
  animation: 'fadeIn 0.5s ease-out',
  '@keyframes fadeIn': {
    '0%': {
      opacity: 0,
      transform: 'translateY(20px)'
    },
    '100%': {
      opacity: 1,
      transform: 'translateY(0)'
    }
  }
}));

const PromptForm = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  gap: '1.5rem',
  marginTop: '1rem'
});

const FormRow = styled(Box)({
  display: 'flex',
  gap: '1.5rem',
  '& > *': {
    flex: 1
  }
});

const FullWidthField = styled(TextField)({
  width: '100%'
});

const Home = () => {
  const navigate = useNavigate();
  const [showPrompt, setShowPrompt] = useState(false);
  const [projectDetails, setProjectDetails] = useState({
    projectName: '',
    location: '',
    projectCode: '',
    salesManager: '',
    operator: '',
    servicePartner: '',
    email: ''
  });

  const handleClick = () => {
    setShowPrompt(true);
  };

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setProjectDetails(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/panel-type', { state: { projectDetails } });
  };

  return (
    <HomeContainer>
      <FloatingImage 
        src={tagPir} 
        alt="TAG PIR" 
        style={{ 
          top: '15%', 
          left: 'calc(5% - 10px)',
          animationDelay: '0s'
        }} 
      />
      <FloatingImage 
        src={idpgRn} 
        alt="IDPG RN" 
        style={{ 
          bottom: '15%', 
          right: 'calc(5% - 10px)',
          animationDelay: '2s'
        }} 
      />
      <FloatingImage 
        src={idpg} 
        alt="IDPG" 
        style={{ 
          top: '25%', 
          right: 'calc(10% - 10px)',
          animationDelay: '1s'
        }} 
      />
      <FloatingImage 
        src={sp} 
        alt="SP" 
        style={{ 
          bottom: '25%', 
          left: 'calc(10% - 10px)',
          animationDelay: '3s'
        }} 
      />
      <FloatingImage 
        src={x2rs} 
        alt="X2RS" 
        style={{ 
          top: '40%', 
          left: 'calc(15% - 20px)',
          animationDelay: '1.5s',
          width: '320px'
        }} 
      />
      <FloatingImage 
        src={dpRt} 
        alt="DP RT" 
        style={{ 
          bottom: '40%', 
          right: 'calc(15% + 40px)',
          animationDelay: '2.5s',
          width: '320px'
        }} 
      />
      <ContentWrapper>
        {!showPrompt ? (
          <>
            <Logo src={logo} alt="Interel Logo" />
            <AnimatedBox>
              <Typography 
                variant="h3" 
                sx={{ 
                  fontWeight: 400,
                  fontFamily: 'sans-serif',
                  letterSpacing: '-0.04em',
                  fontSize: '2.5rem',
                  lineHeight: 1.05,
                  marginBottom: 0
                }}
              >
                Design Your Panels
              </Typography>
            </AnimatedBox>
            <ButtonContainer>
              <StyledButton
                variant="contained"
                color="primary"
                onClick={handleClick}
                sx={{
                  fontFamily: 'sans-serif',
                  letterSpacing: '-0.02em',
                  fontWeight: 600,
                  fontSize: '1.4rem',
                  padding: '0.6rem 0'
                }}
              >
                Get Started
                <RocketLaunchIcon sx={{ 
                  fontSize: '1.4rem',
                  ml: 1
                }} />
              </StyledButton>
            </ButtonContainer>
          </>
        ) : (
          <ProjectPrompt>
            <Typography variant="h4" sx={{ color: '#2c3e50', fontWeight: 500, mb: 3 }}>
              Project Details
            </Typography>
            <form onSubmit={handleSubmit}>
              <PromptForm>
                <FullWidthField
                  label="Project Name"
                  variant="outlined"
                  value={projectDetails.projectName}
                  onChange={handleChange('projectName')}
                  required
                />
                <FormRow>
                  <TextField
                    fullWidth
                    label="Location"
                    variant="outlined"
                    value={projectDetails.location}
                    onChange={handleChange('location')}
                    required
                  />
                  <TextField
                    fullWidth
                    label="Project Code"
                    variant="outlined"
                    value={projectDetails.projectCode}
                    onChange={handleChange('projectCode')}
                    required
                  />
                </FormRow>
                <FormRow>
                  <TextField
                    fullWidth
                    label="INTEREL Sales Manager"
                    variant="outlined"
                    value={projectDetails.salesManager}
                    onChange={handleChange('salesManager')}
                    required
                  />
                  <TextField
                    fullWidth
                    label="Operator/End Client"
                    variant="outlined"
                    value={projectDetails.operator}
                    onChange={handleChange('operator')}
                    required
                  />
                </FormRow>
                <FormRow>
                  <TextField
                    fullWidth
                    label="Service Partner"
                    variant="outlined"
                    value={projectDetails.servicePartner}
                    onChange={handleChange('servicePartner')}
                    required
                  />
                  <TextField
                    fullWidth
                    label="Your Email"
                    variant="outlined"
                    type="email"
                    value={projectDetails.email}
                    onChange={handleChange('email')}
                    required
                  />
                </FormRow>
                <StyledButton
                  type="submit"
                  variant="contained"
                  color="primary"
                  sx={{
                    fontFamily: 'sans-serif',
                    letterSpacing: '-0.02em',
                    fontWeight: 600,
                    fontSize: '1.4rem',
                    padding: '0.6rem 0',
                    mt: 2
                  }}
                >
                  Start Customizing
                  <DownArrow sx={{ fontSize: '1.4rem' }} />
                </StyledButton>
              </PromptForm>
            </form>
          </ProjectPrompt>
        )}
      </ContentWrapper>
    </HomeContainer>
  );
};

export default Home; 