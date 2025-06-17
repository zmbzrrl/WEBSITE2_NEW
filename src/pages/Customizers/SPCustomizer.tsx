// Import necessary libraries and components
import React, { useState, useEffect } from "react";
import { useCart } from "../../contexts/CartContext";
import "./Customizer.css";
import CartButton from "../../components/CartButton";
import { useNavigate } from "react-router-dom";
import logo2 from "../../assets/logo2.png";
import {
  Container,
  Typography,
  Box,
  Button,
  LinearProgress,
  useTheme,
} from '@mui/material';
import { styled } from '@mui/material/styles';

const ProgressContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  maxWidth: 800,
  margin: '0 auto',
  padding: theme.spacing(3),
  marginBottom: theme.spacing(6),
}));

const ProgressSteps = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.spacing(2),
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    height: '2px',
    backgroundColor: 'rgba(26, 31, 44, 0.1)',
    zIndex: 0,
  },
}));

const ProgressStep = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  position: 'relative',
  zIndex: 1,
}));

const StepNumber = styled(Box)<{ completed?: boolean; current?: boolean }>(({ theme, completed, current }) => ({
  width: '32px',
  height: '32px',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: theme.spacing(1),
  backgroundColor: completed ? '#1a1f2c' : current ? '#ffffff' : 'rgba(26, 31, 44, 0.1)',
  color: completed || current ? '#1a1f2c' : 'rgba(26, 31, 44, 0.5)',
  border: current ? '2px solid #1a1f2c' : 'none',
  fontFamily: '"Myriad Hebrew", "Monsal Gothic", sans-serif',
  fontWeight: 400,
}));

const StepLabel = styled(Typography)<{ completed?: boolean; current?: boolean }>(({ theme, completed, current }) => ({
  color: completed ? '#1a1f2c' : current ? '#1a1f2c' : 'rgba(26, 31, 44, 0.5)',
  fontSize: '14px',
  fontWeight: current ? 500 : 400,
  textAlign: 'center',
  fontFamily: '"Myriad Hebrew", "Monsal Gothic", sans-serif',
  letterSpacing: '0.5px',
}));

const StyledButton = styled(Button)(({ theme }) => ({
  textTransform: 'none',
  fontWeight: 400,
  letterSpacing: '0.5px',
  fontFamily: '"Myriad Hebrew", "Monsal Gothic", sans-serif',
  padding: '8px 24px',
  borderRadius: '4px',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
  },
}));

// Define types
interface IconOption {
  id: string;
  src: string;
  label: string;
  category: string;
}

interface PlacedIcon {
  id: number;
  iconId: string;
  src: string;
  label: string;
  position: number;
  category: string;
}

interface GridCellProps {
  index: number;
  onClick: (index: number) => void;
  children: React.ReactNode;
}

interface IconTexts {
  [key: number]: string;
}

interface DesignIcon {
  iconId: string | null;
  src: string;
  label: string;
  position: number;
  text: string;
}

interface Design {
  type: string;
  icons: DesignIcon[];
  quantity: number;
}

// Component for each grid cell
const GridCell: React.FC<GridCellProps> = ({ index, onClick, children }) => (
  <div
    onClick={() => onClick(index)}
    style={{
      width: "30%",
      height: "100px",
      display: "inline-block",
      textAlign: "center",
      background: "transparent",
      margin: "5px",
      position: "relative",
      boxSizing: "border-box",
      verticalAlign: "top",
    }}
  >
    {children}
  </div>
);

const SPCustomizer: React.FC = () => {
  const cartContext = useCart();
  const navigate = useNavigate();
  const [icons, setIcons] = useState<Record<string, any>>({});
  const [iconCategories, setIconCategories] = useState<string[]>([]);

  useEffect(() => {
    import("../../assets/iconLibrary").then((module) => {
      setIcons(module.default);
      setIconCategories(module.iconCategories);
    });
  }, []);

  if (!cartContext) {
    throw new Error("CartContext must be used within a CartProvider");
  }

  const { addToCart } = cartContext;
  const [selectedIcon, setSelectedIcon] = useState<IconOption | null>(null);
  const [placedIcons, setPlacedIcons] = useState<PlacedIcon[]>([]);
  const [iconTexts, setIconTexts] = useState<IconTexts>({});
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  useEffect(() => {
    if (iconCategories.length > 0) {
      setSelectedCategory(iconCategories[0]);
    }
  }, [iconCategories]);

  const handlePlaceIcon = (cellIndex: number): void => {
    const isOccupied = placedIcons.some((icon) => icon.position === cellIndex);
    if (isOccupied || selectedIcon === null) return;

    // Check if trying to place PIR icon
    if (selectedIcon.category === "PIR") {
      // Only allow placement in middle cell (4) or bottom middle cell (7)
      if (cellIndex !== 4 && cellIndex !== 7) return;
      
      // Check if PIR icon is already placed
      const hasPIR = placedIcons.some((icon) => icon.category === "PIR");
      if (hasPIR) return;
    }

    const iconPosition: PlacedIcon = {
      id: Date.now(),
      iconId: selectedIcon.id,
      src: selectedIcon.src,
      label: selectedIcon.label,
      position: cellIndex,
      category: selectedIcon.category
    };

    setPlacedIcons((prev) => [...prev, iconPosition]);
    setSelectedIcon(null);
  };

  const handleIconClick = (icon: IconOption): void => {
    setSelectedIcon(icon);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>, cellIndex: number): void => {
    const newText = e.target.value;
    setIconTexts((prev) => ({
      ...prev,
      [cellIndex]: newText,
    }));
  };

  const handleDeleteIcon = (id: number): void => {
    setPlacedIcons((prev) => prev.filter((icon) => icon.id !== id));
  };

  const handleAddToCart = (): void => {
    const design: Design = {
      type: "SP",
      icons: Array.from({ length: 9 })
        .map((_, index) => {
          const icon = placedIcons.find((i) => i.position === index);
          return {
            iconId: icon?.iconId || null,
            src: icon?.src || "",
            label: icon?.label || "",
            position: index,
            text: iconTexts[index] || "",
          };
        })
        .filter((entry) => entry.iconId || entry.text),
      quantity: 1,
    };
    addToCart(design);
  };

  // Filter icons by selected category
  const categoryIcons = Object.entries(icons)
    .filter(([_, icon]) => icon.category === selectedCategory)
    .map(([id, icon]) => ({
      id,
      src: icon.src,
      label: icon.label,
      category: icon.category
    }));

  const renderGridCell = (index: number) => {
    const icon = placedIcons.find((i) => i.position === index);
    const text = iconTexts[index];
    const isPIR = icon?.category === "PIR";

    return (
      <GridCell key={index} index={index} onClick={handlePlaceIcon}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            height: "100%",
          }}
        >
          {icon && (
            <>
              <img
                src={icon.src}
                alt={icon.label}
                style={{
                  width: "40px",
                  height: "40px",
                  objectFit: "contain",
                  marginBottom: "5px",
                }}
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteIcon(icon.id);
                }}
                style={{
                  position: "absolute",
                  top: 0,
                  right: 0,
                  background: "red",
                  color: "white",
                  border: "none",
                  borderRadius: "50%",
                  width: "20px",
                  height: "20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  fontSize: "12px",
                }}
              >
                ×
              </button>
            </>
          )}
          {text && !isPIR && (
            <div style={{ 
              fontSize: "12px", 
              marginTop: "5px",
              color: "#000000",
              wordBreak: "break-word",
              maxWidth: "90%"
            }}>
              {text}
            </div>
          )}
          {!isPIR && (
            <input
              type="text"
              value={text || ""}
              onChange={(e) => handleTextChange(e, index)}
              onClick={(e) => e.stopPropagation()}
              placeholder="Enter text"
              style={{
                width: "90%",
                padding: "4px",
                fontSize: "12px",
                textAlign: "center",
                border: "1px solid #ccc",
                borderRadius: "4px",
                marginTop: "5px",
              }}
            />
          )}
        </div>
      </GridCell>
    );
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: '#ffffff',
        py: 8,
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ position: 'absolute', top: 20, right: 30, zIndex: 1 }}>
          <CartButton />
        </Box>

        <Box
          sx={{
            position: 'absolute',
            top: 20,
            left: 30,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <img 
            src={logo2} 
            alt="Logo" 
            style={{ 
              height: '40px',
              width: 'auto',
            }} 
          />
          <Typography
            variant="h6"
            component="h1"
            sx={{
              color: '#1a1f2c',
              fontWeight: 400,
              letterSpacing: '1px',
              textTransform: 'capitalize',
              fontFamily: '"Myriad Hebrew", "Monsal Gothic", sans-serif',
            }}
          >
            Design your panels
          </Typography>
        </Box>

        <ProgressContainer>
          <ProgressSteps>
            <ProgressStep>
              <StepNumber completed>1</StepNumber>
              <StepLabel completed>Select Panel Type</StepLabel>
            </ProgressStep>
            <ProgressStep>
              <StepNumber current>2</StepNumber>
              <StepLabel current>Customize Panel</StepLabel>
            </ProgressStep>
            <ProgressStep>
              <StepNumber>3</StepNumber>
              <StepLabel>Review & Add to Cart</StepLabel>
            </ProgressStep>
          </ProgressSteps>
          <LinearProgress 
            variant="determinate" 
            value={40} 
            sx={{
              height: 2,
              borderRadius: 1,
              backgroundColor: 'rgba(26, 31, 44, 0.1)',
              '& .MuiLinearProgress-bar': {
                borderRadius: 1,
                backgroundColor: '#1a1f2c',
              },
            }}
          />
        </ProgressContainer>

        <Box sx={{ mt: 4 }}>
          <Typography
            variant="h4"
            component="h2"
            sx={{
              color: '#1a1f2c',
              fontWeight: 400,
              letterSpacing: '0.5px',
              mb: 4,
              textAlign: 'center',
              fontFamily: '"Myriad Hebrew", "Monsal Gothic", sans-serif',
            }}
          >
            Customize your Single Panel
          </Typography>

          <div style={{ marginBottom: "20px" }}>
            <div style={{ display: "flex", gap: "10px", marginBottom: "20px", justifyContent: "center" }}>
              {iconCategories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  style={{
                    padding: "12px 24px",
                    background: selectedCategory === category ? "#1a1f2c" : "#ffffff",
                    color: selectedCategory === category ? "#ffffff" : "#1a1f2c",
                    border: "1px solid #1a1f2c",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontFamily: '"Myriad Hebrew", "Monsal Gothic", sans-serif',
                    fontSize: "14px",
                    letterSpacing: "0.5px",
                    transition: "all 0.3s ease",
                    minWidth: "120px",
                    '&:hover': {
                      transform: "translateY(-2px)",
                      boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                    }
                  }}
                >
                  {category}
                </button>
              ))}
            </div>

            <div style={{ 
              display: "flex", 
              gap: "16px", 
              flexWrap: "wrap", 
              justifyContent: "center",
              maxWidth: "800px",
              margin: "0 auto"
            }}>
              {categoryIcons.map((icon) => (
                <div
                  key={icon.id}
                  onClick={() => handleIconClick(icon)}
                  style={{
                    padding: "4px",
                    background: selectedIcon?.id === icon.id ? "#1a1f2c" : "#ffffff",
                    borderRadius: "6px",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    width: "24px",
                    border: "1px solid #e0e0e0",
                    transition: "all 0.3s ease",
                    '&:hover': {
                      transform: "translateY(-2px)",
                      boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                    }
                  }}
                >
                  <img
                    src={icon.src}
                    alt={icon.label}
                    style={{ width: "10px", height: "10px", objectFit: "contain" }}
                  />
                  <span style={{ 
                    fontSize: "14px", 
                    color: selectedIcon?.id === icon.id ? "#ffffff" : "#1a1f2c",
                    fontFamily: '"Myriad Hebrew", "Monsal Gothic", sans-serif',
                    letterSpacing: "0.5px"
                  }}>
                    {icon.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div
            style={{
              width: "350px",
              background: "#ffffff",
              padding: "10px",
              border: "2px solid #ccc",
              margin: "auto",
            }}
          >
            <div style={{ display: "flex", flexWrap: "wrap" }}>
              {Array.from({ length: 9 }).map((_, index) => renderGridCell(index))}
            </div>
          </div>

          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2 }}>
            <StyledButton
              variant="outlined"
              onClick={() => navigate('/panel-type')}
              sx={{
                borderColor: '#1a1f2c',
                color: '#1a1f2c',
                '&:hover': {
                  borderColor: '#2c3e50',
                  backgroundColor: 'rgba(26, 31, 44, 0.04)',
                },
              }}
            >
              Back
            </StyledButton>
            <StyledButton
              variant="contained"
              onClick={handleAddToCart}
              sx={{
                backgroundColor: '#1a1f2c',
                color: '#ffffff',
                '&:hover': {
                  backgroundColor: '#2c3e50',
                },
              }}
            >
              Add to Cart
            </StyledButton>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default SPCustomizer; 