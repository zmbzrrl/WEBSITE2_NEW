import React, { useState, useEffect } from "react";
import { useCart } from "../contexts/CartContext";
import "./Customizer.css";
import CartButton from "../components/CartButton";
import { useNavigate } from "react-router-dom";
import { 
  Button, 
  TextField, 
  Box, 
  Typography, 
  IconButton,
  Paper,
  Stack,
  Container,
  Grid
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import logo2 from "../assets/logo2.png";

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

const GridCell: React.FC<GridCellProps> = ({ index, onClick, children }) => (
  <Box
    onClick={() => onClick(index)}
    sx={{
      width: "30%",
      height: "100px",
      display: "inline-block",
      textAlign: "center",
      background: "transparent",
      margin: "5px",
      position: "relative",
      boxSizing: "border-box",
      verticalAlign: "top",
      "&:hover": {
        backgroundColor: "action.hover",
        cursor: "pointer"
      }
    }}
  >
    {children}
  </Box>
);

const IDPG_RNCustomizer: React.FC = () => {
  const cartContext = useCart();
  const navigate = useNavigate();
  const [icons, setIcons] = useState<Record<string, any>>({});
  const [iconCategories, setIconCategories] = useState<string[]>([]);

  useEffect(() => {
    import("../assets/iconLibrary").then((module) => {
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
      type: "IDPG_RN",
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
        <Box
          sx={{
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
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteIcon(icon.id);
                }}
                sx={{
                  position: "absolute",
                  top: 0,
                  right: 0,
                  color: "error.main",
                  "&:hover": {
                    backgroundColor: "error.light",
                    color: "white"
                  }
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </>
          )}
          {text && !isPIR && (
            <Typography variant="body2" sx={{ mt: 1, color: "text.primary" }}>
              {text}
            </Typography>
          )}
          {!isPIR && (
            <TextField
              size="small"
              value={text || ""}
              onChange={(e) => handleTextChange(e as React.ChangeEvent<HTMLInputElement>, index)}
              onClick={(e) => e.stopPropagation()}
              placeholder="Enter text"
              sx={{ width: "90%", mt: 1 }}
            />
          )}
        </Box>
      </GridCell>
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
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Customize your IDPG_RN Panel
        </Typography>

        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
          <Stack spacing={2}>
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", justifyContent: "center" }}>
              {iconCategories.map((category) => (
                <Button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  variant={selectedCategory === category ? "contained" : "outlined"}
                  color="primary"
                  size="small"
                >
                  {category}
                </Button>
              ))}
            </Box>

            <Box className="icon-list">
              {categoryIcons.map((icon) => (
                <Box
                  key={icon.id}
                  component="img"
                  src={icon.src}
                  alt={icon.label}
                  onClick={() => handleIconClick(icon)}
                  sx={{
                    width: "40px",
                    height: "40px",
                    cursor: "pointer",
                    border: selectedIcon?.id === icon.id ? "2px solid" : "none",
                    borderColor: "primary.main",
                    borderRadius: 1,
                    p: 0.5,
                    "&:hover": {
                      backgroundColor: "action.hover"
                    }
                  }}
                />
              ))}
            </Box>
          </Stack>
        </Paper>

        <Paper elevation={2} sx={{ p: 3, mb: 3, maxWidth: 400, mx: "auto" }}>
          <Box sx={{ display: "flex", flexWrap: "wrap" }}>
            {Array.from({ length: 9 }).map((_, index) => renderGridCell(index))}
          </Box>
        </Paper>

        <Stack direction="row" spacing={2} justifyContent="center">
          <Button
            variant="contained"
            color="primary"
            onClick={handleAddToCart}
            size="large"
          >
            Add to Cart
          </Button>

          <Button
            variant="outlined"
            color="primary"
            onClick={() => navigate("/subtypes/idpg")}
            size="large"
          >
            Back to IDPG Panels
          </Button>

          <Button
            variant="outlined"
            color="primary"
            onClick={() => navigate("/")}
            size="large"
          >
            Back to Panel Selection
          </Button>
        </Stack>
      </Container>
    </div>
  );
};

export default IDPG_RNCustomizer; 