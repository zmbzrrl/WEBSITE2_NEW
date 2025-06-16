import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1b92d1', // INTEREL blue
      light: 'rgba(27,146,209,0.8)',
      dark: 'rgba(27,146,209,1)',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#666666', // Grey
      light: '#999999',
      dark: '#333333',
      contrastText: '#ffffff',
    },
    background: {
      default: '#ffffff',
      paper: '#f5f5f5',
    },
    text: {
      primary: '#333333',
      secondary: '#666666',
    },
  },
  typography: {
    fontFamily: '"Myriad Hebrew", "Monsal Gothic", Arial, sans-serif',
    h1: {
      fontFamily: '"Myriad Hebrew", "Monsal Gothic", Arial, sans-serif',
      fontWeight: 600,
    },
    h2: {
      fontFamily: '"Myriad Hebrew", "Monsal Gothic", Arial, sans-serif',
      fontWeight: 600,
    },
    h3: {
      fontFamily: '"Myriad Hebrew", "Monsal Gothic", Arial, sans-serif',
      fontWeight: 600,
    },
    h4: {
      fontFamily: '"Myriad Hebrew", "Monsal Gothic", Arial, sans-serif',
      fontWeight: 600,
    },
    h5: {
      fontFamily: '"Myriad Hebrew", "Monsal Gothic", Arial, sans-serif',
      fontWeight: 600,
    },
    h6: {
      fontFamily: '"Myriad Hebrew", "Monsal Gothic", Arial, sans-serif',
      fontWeight: 600,
    },
    button: {
      fontFamily: '"Myriad Hebrew", "Monsal Gothic", Arial, sans-serif',
      fontWeight: 600,
      textTransform: 'none',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 24px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 2px 4px rgba(0,0,0,0.1)',
          },
        },
        contained: {
          backgroundColor: '#1b92d1',
          '&:hover': {
            backgroundColor: 'rgba(27,146,209,0.9)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: '0px 2px 4px rgba(0,0,0,0.05)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
  },
});

export default theme; 