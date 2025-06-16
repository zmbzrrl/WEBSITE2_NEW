import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  styled,
} from '@mui/material';
import homeBg from '../assets/home.png';
import logo from '../assets/logo.png';

const HomeContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  width: '100%',
  backgroundImage: `url(${homeBg})`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  padding: theme.spacing(2),
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    zIndex: 1
  }
}));

const ContentWrapper = styled(Box)({
  position: 'relative',
  zIndex: 2,
  textAlign: 'center',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '2rem'
});

const Logo = styled('img')({
  width: '300px',
  marginBottom: '2rem',
  marginTop: '-1rem',
  animation: 'fadeIn 1.2s ease-out',
  position: 'relative',
  zIndex: 2,
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
  zIndex: 2
});

const StyledButton = styled(Button)(({ theme }) => ({
  width: '100%',
  padding: theme.spacing(1.5),
  fontSize: '1.1rem',
  animation: 'fadeIn 1.2s ease-out 0.4s both',
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

const Home = () => {
  const navigate = useNavigate();

  return (
    <HomeContainer>
      <ContentWrapper>
        <Logo src={logo} alt="Interel Logo" />
        <AnimatedBox>
          <Typography variant="h3" sx={{ fontWeight: 500 }}>
            Design Your Panels
          </Typography>
        </AnimatedBox>
        <ButtonContainer>
          <StyledButton
            variant="contained"
            color="primary"
            onClick={() => navigate('/panel-type')}
          >
            Start Customizing
          </StyledButton>
        </ButtonContainer>
      </ContentWrapper>
    </HomeContainer>
  );
};

export default Home; 