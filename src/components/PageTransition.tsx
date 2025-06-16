import React from 'react';
import { styled } from '@mui/material/styles';

interface PageTransitionProps {
  children: React.ReactNode;
}

const TransitionWrapper = styled('div')({
  position: 'relative',
  width: '100%',
  height: '100%',
  animation: 'fadeIn 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
  '@keyframes fadeIn': {
    '0%': {
      opacity: 0,
      transform: 'scale(0.98) translateY(10px)'
    },
    '100%': {
      opacity: 1,
      transform: 'scale(1) translateY(0)'
    }
  },
  '&.exiting': {
    animation: 'fadeOut 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
    '@keyframes fadeOut': {
      '0%': {
        opacity: 1,
        transform: 'scale(1) translateY(0)'
      },
      '100%': {
        opacity: 0,
        transform: 'scale(0.98) translateY(-10px)'
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