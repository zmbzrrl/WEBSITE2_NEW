import React, { useState, useEffect } from "react";
import { useCart } from "../../contexts/CartContext";
import "./Customizer.css";
import CartButton from "../../components/CartButton";
import { useNavigate } from "react-router-dom";
import logo2 from "../../assets/logo2.png";

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

const X2HCustomizer: React.FC = () => {
  const cartContext = useCart();
  const navigate = useNavigate();
  const [icons, setIcons] = useState<Record<string, any>>({});
  const [iconCategories, setIconCategories] = useState<string[]>([]);
  const [selectedIcon, setSelectedIcon] = useState<IconOption | null>(null);
  const [placedIcons, setPlacedIcons] = useState<PlacedIcon[]>([]);
  const [iconTexts, setIconTexts] = useState<IconTexts>({});
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [fontSize, setFontSize] = useState<string>("12px");

  useEffect(() => {
    import("../../assets/iconLibrary").then((module) => {
      setIcons(module.default);
      setIconCategories(module.iconCategories);
    });
  }, []);

  useEffect(() => {
    if (iconCategories.length > 0) {
      setSelectedCategory(iconCategories[0]);
    }
  }, [iconCategories]);

  if (!cartContext) {
    throw new Error("CartContext must be used within a CartProvider");
  }

  const { addToCart } = cartContext;

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
      type: "X2H",
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
              fontSize: fontSize, 
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
                fontSize: fontSize,
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
      <h1>X2H Customizer</h1>
      <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
        <div style={{ display: "flex", flexWrap: "wrap" }}>
          {Array.from({ length: 9 }).map((_, index) => renderGridCell(index))}
        </div>
      </div>
      <div className="icon-options">
        <div style={{ marginBottom: "10px" }}>
          {iconCategories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              style={{
                margin: "0 5px",
                backgroundColor: selectedCategory === category ? "#4caf50" : "#ccc",
              }}
            >
              {category}
            </button>
          ))}
        </div>
        <div className="icon-list">
          {categoryIcons.map((icon) => (
            <img
              key={icon.id}
              src={icon.src}
              alt={icon.label}
              className="icon-option"
              onClick={() => handleIconClick(icon)}
              style={{
                border: selectedIcon?.id === icon.id ? "2px solid #4caf50" : "none",
              }}
            />
          ))}
        </div>
      </div>

      <div style={{ marginBottom: "20px", textAlign: "center" }}>
        <div style={{ marginBottom: "10px", fontWeight: "bold" }}>Font Size:</div>
        <div style={{ display: "flex", gap: "8px", justifyContent: "center", flexWrap: "wrap" }}>
          {["10px", "12px", "14px", "16px"].map((size) => (
            <button
              key={size}
              onClick={() => setFontSize(size)}
              style={{
                padding: '6px 12px',
                borderRadius: '4px',
                border: fontSize === size ? '2px solid #4caf50' : '1px solid #ccc',
                background: fontSize === size ? '#e8f5e8' : '#fff',
                color: fontSize === size ? '#4caf50' : '#333',
                cursor: 'pointer',
                fontSize: size,
                fontWeight: fontSize === size ? '600' : '400',
                transition: 'all 0.2s ease',
                minWidth: '40px',
                textAlign: 'center',
              }}
            >
              {size.replace('px', '')}
            </button>
          ))}
        </div>
      </div>

      <button onClick={handleAddToCart}>Add to Project</button>
      <CartButton />
    </div>
  );
};

export default X2HCustomizer; 