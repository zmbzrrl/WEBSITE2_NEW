import React from 'react';
import { styled } from '@mui/material/styles';

interface PageTransitionProps {
  children: React.ReactNode;
}

const TransitionWrapper = styled('div')({
  position: 'relative',
  width: '100%',
  height: '100%',
  animation: 'slideIn 1.5s cubic-bezier(0.22, 1, 0.36, 1)',
  '@keyframes slideIn': {
    '0%': {
      transform: 'translateY(30vh)',
      opacity: 0
    },
    '100%': {
      transform: 'translateY(0)',
      opacity: 1
    }
  },
  '&.exiting': {
    animation: 'slideOut 1.5s cubic-bezier(0.22, 1, 0.36, 1)',
    '@keyframes slideOut': {
      '0%': {
        transform: 'translateY(0)',
        opacity: 1
      },
      '100%': {
        transform: 'translateY(-30vh)',
        opacity: 0
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