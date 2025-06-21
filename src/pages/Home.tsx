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

const Logo = styled('img')<{ $showPrompt?: boolean }>(({ $showPrompt }) => ({
  width: '400px',
  marginBottom: '2rem',
  marginTop: '-1rem',
  animation: $showPrompt ? 'fadeOut 0.3s ease-out 0.3s forwards' : 'fadeIn 1.2s ease-out',
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
  },
  '@keyframes fadeOut': {
    '0%': {
      opacity: 1,
      transform: 'translateY(0)'
    },
    '100%': {
      opacity: 0,
      transform: 'translateY(-20px)'
    }
  }
}));

const AnimatedBox = styled(Box)<{ $showPrompt?: boolean }>(({ theme, $showPrompt }) => ({
  color: 'white',
  marginBottom: theme.spacing(3),
  marginTop: '-2rem',
  textAlign: 'center',
  animation: $showPrompt ? 'fadeOut 0.3s ease-out 0.3s forwards' : 'fadeIn 1.2s ease-out 0.2s both',
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
  },
  '@keyframes fadeOut': {
    '0%': {
      opacity: 1,
      transform: 'translateY(0)'
    },
    '100%': {
      opacity: 0,
      transform: 'translateY(-20px)'
    }
  }
}));

const ButtonContainer = styled(Box)<{ $showPrompt?: boolean }>(({ $showPrompt }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
  width: '100%',
  maxWidth: '300px',
  marginTop: '-0.5rem',
  position: 'relative',
  zIndex: 2,
  fontFamily: 'sans-serif',
  animation: $showPrompt ? 'fadeOut 0.3s ease-out 0.3s forwards' : 'fadeIn 1.2s ease-out 0.4s both',
  '@keyframes fadeIn': {
    '0%': {
      opacity: 0,
      transform: 'translateY(20px)'
    },
    '100%': {
      opacity: 1,
      transform: 'translateY(0)'
    }
  },
  '@keyframes fadeOut': {
    '0%': {
      opacity: 1,
      transform: 'translateY(0)'
    },
    '100%': {
      opacity: 0,
      transform: 'translateY(20px)'
    }
  }
}));

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

const FloatingImage = styled('img')<{ $showPrompt?: boolean }>(({ $showPrompt }) => ({
  position: 'absolute',
  width: $showPrompt ? '300px' : '200px',
  opacity: $showPrompt ? 0.3 : 1,
  filter: 'drop-shadow(0 10px 20px rgba(0, 0, 0, 0.3))',
  animation: 'float 8s ease-in-out infinite',
  transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1), top 0.3s cubic-bezier(0.4, 0, 0.2, 1), left 0.3s cubic-bezier(0.4, 0, 0.2, 1), right 0.3s cubic-bezier(0.4, 0, 0.2, 1), bottom 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
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
    animation: 'shadowFloat 8s ease-in-out infinite',
    zIndex: -1
  },
  '@keyframes float': {
    '0%': {
      transform: 'translateY(0px) rotate(0deg)',
    },
    '50%': {
      transform: 'translateY(-15px) rotate(3deg)',
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
      transform: 'translateX(-50%) scale(0.8)',
      opacity: 0.2,
    },
    '100%': {
      transform: 'translateX(-50%) scale(1)',
      opacity: 0.4,
    }
  }
}));

const ProjectPrompt = styled(Paper)<{ $showPrompt?: boolean }>(({ theme, $showPrompt }) => ({
  padding: theme.spacing(5),
  backgroundColor: 'rgba(255, 255, 255, 0.98)',
  borderRadius: '20px',
  maxWidth: '700px',
  width: '90%',
  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)',
  animation: $showPrompt ? 'slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) both' : 'none',
  '@keyframes slideUp': {
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
  gap: '1.75rem',
  marginTop: '1.5rem'
});

const FormRow = styled(Box)({
  display: 'grid',
  gridTemplateColumns: 'repeat(2, 1fr)',
  gap: '1.5rem',
  width: '100%'
});

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor: 'rgba(0, 0, 0, 0.04)',
    },
    '&.Mui-focused': {
      backgroundColor: 'white',
      boxShadow: '0 0 0 2px rgba(25, 118, 210, 0.2)',
    }
  },
  '& .MuiInputLabel-root': {
    transform: 'translate(14px, -9px) scale(0.75)',
    backgroundColor: 'white',
    padding: '0 4px',
    color: theme.palette.text.secondary,
    fontSize: '1.1rem',
    fontWeight: 500
  },
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: 'rgba(0, 0, 0, 0.1)',
  }
}));

const FormTitle = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.primary,
  fontWeight: 600,
  fontSize: '1.75rem',
  textAlign: 'center',
  marginBottom: theme.spacing(4),
  position: 'relative',
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: '-12px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '40px',
    height: '3px',
    backgroundColor: theme.palette.primary.main,
    borderRadius: '2px'
  }
}));

const HelpText = styled('span')(({ theme }) => ({
  color: theme.palette.primary.main,
  fontSize: '0.95rem',
  cursor: 'pointer',
  padding: '4px 8px',
  fontFamily: 'sans-serif',
  letterSpacing: '-0.02em',
  fontWeight: 600,
  transition: 'all 0.2s ease',
  '&:hover': {
    opacity: 0.8,
    transform: 'translateY(-1px)'
  }
}));

const Home = () => {
  const navigate = useNavigate();
  const [showPrompt, setShowPrompt] = useState(false);
  const [showSalesManager, setShowSalesManager] = useState(false);
  const [showError, setShowError] = useState(false);
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
    // Clear error when user starts typing in either field
    if (field === 'operator' || field === 'servicePartner') {
      setShowError(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectDetails.operator && !projectDetails.servicePartner) {
      setShowError(true);
      return;
    }
    navigate('/panel-type', { state: { projectDetails } });
  };

  const handleHelpClick = () => {
    setShowSalesManager(!showSalesManager);
  };

  const handleGetStarted = () => {
    setShowPrompt(true);
    setTimeout(() => {
      setShowPrompt(false);
    }, 800);
  };

  return (
    <HomeContainer>
      <FloatingImage 
        src={tagPir} 
        alt="TAG PIR" 
        $showPrompt={showPrompt}
        style={{ 
          top: showPrompt ? '5%' : '15%', 
          left: showPrompt ? 'calc(20% - 10px)' : 'calc(5% - 10px)',
          animationDelay: '0s'
        }} 
      />
      <FloatingImage 
        src={idpgRn} 
        alt="IDPG RN" 
        $showPrompt={showPrompt}
        style={{ 
          bottom: showPrompt ? '0%' : '15%', 
          right: showPrompt ? 'calc(20% - 10px)' : 'calc(5% - 10px)',
          animationDelay: '2s'
        }} 
      />
      <FloatingImage 
        src={idpg} 
        alt="IDPG" 
        $showPrompt={showPrompt}
        style={{ 
          top: showPrompt ? '10%' : '25%', 
          right: showPrompt ? 'calc(15% - 10px)' : 'calc(10% - 10px)',
          animationDelay: '1s'
        }} 
      />
      <FloatingImage 
        src={sp} 
        alt="SP" 
        $showPrompt={showPrompt}
        style={{ 
          bottom: showPrompt ? '10%' : '25%', 
          left: showPrompt ? 'calc(20% - 10px)' : 'calc(10% - 10px)',
          animationDelay: '3s'
        }} 
      />
      <FloatingImage 
        src={x2rs} 
        alt="X2RS" 
        $showPrompt={showPrompt}
        style={{ 
          top: showPrompt ? '35%' : '40%', 
          left: showPrompt ? 'calc(15% - 20px)' : 'calc(15% - 20px)',
          animationDelay: '1.5s',
          width: showPrompt ? '480px' : '320px'
        }} 
      />
      <FloatingImage 
        src={dpRt} 
        alt="DP RT" 
        $showPrompt={showPrompt}
        style={{ 
          bottom: showPrompt ? '40%' : '40%', 
          right: showPrompt ? 'calc(15% + 40px)' : 'calc(15% + 40px)',
          animationDelay: '2.5s',
          width: showPrompt ? '480px' : '320px'
        }} 
      />
      <ContentWrapper>
        {!showPrompt ? (
          <>
            <Logo src={logo} alt="Interel Logo" $showPrompt={showPrompt} />
            <AnimatedBox $showPrompt={showPrompt}>
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
            <ButtonContainer $showPrompt={showPrompt}>
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
          <ProjectPrompt $showPrompt={showPrompt}>
            <FormTitle>
              Project Details
            </FormTitle>
            <form onSubmit={handleSubmit}>
              <PromptForm>
                <FormRow>
                  <StyledTextField
                  label="Project Name"
                  variant="outlined"
                  value={projectDetails.projectName}
                  onChange={handleChange('projectName')}
                  required
                />
                  <StyledTextField
                    label="Location"
                    variant="outlined"
                    value={projectDetails.location}
                    onChange={handleChange('location')}
                    required
                  />
                </FormRow>
                <FormRow>
                  {!showSalesManager ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <StyledTextField
                    label="Project Code"
                    variant="outlined"
                    value={projectDetails.projectCode}
                    onChange={handleChange('projectCode')}
                    required
                      />
                      <HelpText onClick={handleHelpClick}>
                        Don't know the project code?
                      </HelpText>
                    </Box>
                  ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <StyledTextField
                    label="INTEREL Sales Manager"
                    variant="outlined"
                    value={projectDetails.salesManager}
                    onChange={handleChange('salesManager')}
                    required
                      />
                      <HelpText onClick={handleHelpClick}>
                        I have the project code
                      </HelpText>
                    </Box>
                  )}
                  <StyledTextField
                    label="Your Email"
                    variant="outlined"
                    type="email"
                    value={projectDetails.email}
                    onChange={handleChange('email')}
                    required
                  />
                </FormRow>
                <FormRow>
                  <StyledTextField
                    label="Operator/End Client"
                    variant="outlined"
                    value={projectDetails.operator}
                    onChange={handleChange('operator')}
                  />
                  <StyledTextField
                    label="Service Partner"
                    variant="outlined"
                    value={projectDetails.servicePartner}
                    onChange={handleChange('servicePartner')}
                  />
                </FormRow>
                {showError && (
                  <Typography 
                    color="error" 
                    sx={{ 
                      fontSize: '0.875rem',
                      mt: -1,
                      mb: 1
                    }}
                  >
                    Please fill in at least one of these fields
                  </Typography>
                )}
                <StyledButton
                  type="submit"
                  variant="contained"
                  color="primary"
                  sx={{
                    fontFamily: 'sans-serif',
                    letterSpacing: '-0.02em',
                    fontWeight: 500,
                    fontSize: '1.2rem',
                    padding: '0.8rem 0',
                    mt: 2,
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                    '&:hover': {
                      boxShadow: '0 6px 16px rgba(0, 0, 0, 0.12)',
                      transform: 'translateY(-1px)',
                    },
                    transition: 'all 0.2s ease'
                  }}
                >
                  Start Customizing
                  <DownArrow sx={{ fontSize: '1.2rem', ml: 1 }} />
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