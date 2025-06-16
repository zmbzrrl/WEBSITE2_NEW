import React from 'react';
import { Box, Typography, styled } from '@mui/material';

interface PanelTypeCardProps {
  title: string;
  description: string;
  image: string;
  onClick: () => void;
}

const Card = styled(Box)(({ theme }) => ({
  backgroundColor: 'white',
  borderRadius: theme.spacing(1),
  padding: theme.spacing(3),
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
  }
}));

const Image = styled('img')({
  width: '100%',
  height: '200px',
  objectFit: 'cover',
  borderRadius: '4px',
  marginBottom: '16px'
});

const Title = styled(Typography)(({ theme }) => ({
  fontSize: '1.25rem',
  fontWeight: 500,
  marginBottom: theme.spacing(1),
  textAlign: 'center'
}));

const Description = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  textAlign: 'center'
}));

const PanelTypeCard: React.FC<PanelTypeCardProps> = ({
  title,
  description,
  image,
  onClick
}) => {
  return (
    <Card onClick={onClick}>
      <Image src={image} alt={title} />
      <Title variant="h6">{title}</Title>
      <Description variant="body2">{description}</Description>
    </Card>
  );
};

export default PanelTypeCard; 