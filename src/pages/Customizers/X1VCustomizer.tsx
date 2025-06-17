import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Grid,
  Box,
  Button,
  IconButton,
  TextField,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import CartButton from "../../components/CartButton";
import { useCart } from "../../contexts/CartContext";
import { Icon } from "../../types/Icon";
import { icons } from "../../data/icons";
import logo2 from "../../assets/logo2.png";
import "./Customizer.css";

interface PlacedIcon {
  id: string;
  icon: Icon;
  position: number;
}

const X1VCustomizer: React.FC = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [placedIcons, setPlacedIcons] = useState<PlacedIcon[]>([]);
  const [iconTexts, setIconTexts] = useState<{ [key: string]: string }>({});

  const handlePlaceIcon = (icon: Icon, position: number) => {
    // Check if position is already occupied
    if (placedIcons.some((pi) => pi.position === position)) {
      return;
    }

    // Check if it's a PIR icon and if there's already a PIR icon placed
    if (icon.category === "PIR" && placedIcons.some((pi) => pi.icon.category === "PIR")) {
      return;
    }

    const newPlacedIcon: PlacedIcon = {
      id: `${icon.id}-${position}`,
      icon,
      position,
    };

    setPlacedIcons([...placedIcons, newPlacedIcon]);
  };

  const handleRemoveIcon = (position: number) => {
    setPlacedIcons(placedIcons.filter((pi) => pi.position !== position));
    // Remove the text associated with this icon
    const newIconTexts = { ...iconTexts };
    delete newIconTexts[position];
    setIconTexts(newIconTexts);
  };

  const handleTextChange = (position: number, text: string) => {
    setIconTexts({
      ...iconTexts,
      [position]: text,
    });
  };

  const handleAddToCart = () => {
    const design = {
      type: "X1V",
      icons: placedIcons.map((pi) => ({
        icon: pi.icon,
        position: pi.position,
        text: iconTexts[pi.position] || "",
      })),
    };
    addToCart(design);
    navigate("/cart");
  };

  const renderGridCell = (position: number) => {
    const placedIcon = placedIcons.find((pi) => pi.position === position);
    const text = iconTexts[position] || "";

    return (
      <Box
        sx={{
          width: "100%",
          height: "100%",
          minHeight: "100px",
          border: "1px solid #e0e0e0",
          borderRadius: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          p: 2,
        }}
      >
        {placedIcon ? (
          <>
            <img
              src={placedIcon.icon.image}
              alt={placedIcon.icon.name}
              style={{ width: "50px", height: "50px" }}
            />
            {placedIcon.icon.category !== "PIR" && (
              <TextField
                value={text}
                onChange={(e) => handleTextChange(position, e.target.value)}
                placeholder="Enter text"
                size="small"
                sx={{ mt: 1, width: "100%" }}
              />
            )}
            <IconButton
              size="small"
              onClick={() => handleRemoveIcon(position)}
              sx={{
                position: "absolute",
                top: 4,
                right: 4,
                color: "error.main",
              }}
            >
              <DeleteIcon />
            </IconButton>
          </>
        ) : (
          <Box
            sx={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {icons.map((icon) => (
              <Box
                key={icon.id}
                onClick={() => handlePlaceIcon(icon, position)}
                sx={{
                  cursor: "pointer",
                  p: 1,
                  "&:hover": {
                    backgroundColor: "rgba(0, 0, 0, 0.04)",
                    borderRadius: 1,
                  },
                }}
              >
                <img
                  src={icon.image}
                  alt={icon.name}
                  style={{ width: "30px", height: "30px" }}
                />
              </Box>
            ))}
          </Box>
        )}
      </Box>
    );
  };

  return (
    <div className="customizer-container">
      <div style={{ 
        position: 'absolute', 
        top: 20, 
        left: 30, 
        zIndex: 1,
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}>
        <img 
          src={logo2} 
          alt="Logo" 
          style={{ 
            height: '40px',
            width: 'auto',
          }} 
        />
      </div>
      <CartButton />
      <Container maxWidth="lg" sx={{ py: 4, position: "relative" }}>
        <Typography
          variant="h3"
          component="h1"
          align="center"
          gutterBottom
          sx={{
            mb: 4,
            color: "primary.main",
            fontWeight: 600,
          }}
        >
          Extended Panel - Vertical (1 socket)
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} md={8}>
            <Grid container spacing={2}>
              {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((position) => (
                <Grid item xs={4} key={position}>
                  {renderGridCell(position)}
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>

        <Box sx={{ mt: 4, display: "flex", justifyContent: "center", gap: 2 }}>
          <Button
            variant="outlined"
            onClick={() => navigate("/panel/extended")}
            sx={{ px: 4, py: 1.5, fontSize: "1.1rem" }}
          >
            Back
          </Button>
          <Button
            variant="contained"
            onClick={handleAddToCart}
            disabled={placedIcons.length === 0}
            sx={{ px: 4, py: 1.5, fontSize: "1.1rem" }}
          >
            Add to Cart
          </Button>
        </Box>
      </Container>
    </div>
  );
};

export default X1VCustomizer; 