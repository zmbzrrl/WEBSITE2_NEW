import React from 'react';
import { styled } from '@mui/material/styles';

interface PageTransitionProps {
  children: React.ReactNode;
}

const TransitionWrapper = styled('div')({
  position: 'relative',
  width: '100%',
  height: '100%',
  animation: 'slideIn 1.2s cubic-bezier(0.2, 0.8, 0.2, 1)',
  '@keyframes slideIn': {
    '0%': {
      transform: 'translateY(50vh)'
    },
    '100%': {
      transform: 'translateY(0)'
    }
  },
  '&.exiting': {
    animation: 'slideOut 1.2s cubic-bezier(0.2, 0.8, 0.2, 1)',
    '@keyframes slideOut': {
      '0%': {
        transform: 'translateY(0)'
      },
      '100%': {
        transform: 'translateY(-50vh)'
      }
    }
  }
});

const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
  return (
    <TransitionWrapper>
      {children}
    </TransitionWrapper>
  );
};

export default PageTransition; 