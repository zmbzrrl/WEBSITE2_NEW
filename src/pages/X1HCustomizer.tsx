import React, { useState, useEffect } from "react";
import { useCart } from "../contexts/CartContext";
import "./Customizer.css";
import CartButton from "../components/CartButton";
import { useNavigate } from "react-router-dom";
import { Icon } from "../types/Icon";

// Define types
interface IconOption {
  id: string;
  src: string;
  label: string;
  category: string;
}

interface PlacedIcon extends Icon {
  id: string;
  position: number;
  iconId: string;
}

interface GridCellProps {
  index: number;
  onClick: (index: number) => void;
  children?: React.ReactNode;
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
const GridCell: React.FC<GridCellProps> = ({ index, onClick, children }) => {
  return (
    <div
      onClick={() => onClick(index)}
      style={{
        width: "100px",
        height: "100px",
        border: "1px solid #ccc",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        position: "relative",
      }}
    >
      {children}
    </div>
  );
};

const X1HCustomizer: React.FC = () => {
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
  const [iconTexts, setIconTexts] = useState<string[]>(Array(9).fill(""));
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  useEffect(() => {
    if (iconCategories.length > 0) {
      setSelectedCategory(iconCategories[0]);
    }
  }, [iconCategories]);

  const handlePlaceIcon = (position: number) => {
    const isOccupied = placedIcons.some((icon) => icon.position === position);
    if (isOccupied || selectedIcon === null) return;

    // Check if trying to place PIR icon
    if (selectedIcon.category === "PIR") {
      // Only allow placement in middle cell (4) or bottom middle cell (7)
      if (position !== 4 && position !== 7) return;
      
      // Check if PIR icon is already placed
      const hasPIR = placedIcons.some((icon) => icon.category === "PIR");
      if (hasPIR) return;
    }

    const iconPosition: PlacedIcon = {
      id: Date.now().toString(),
      iconId: selectedIcon.id,
      src: selectedIcon.src,
      label: selectedIcon.label,
      position: position,
      category: selectedIcon.category
    };

    setPlacedIcons((prev) => [...prev, iconPosition]);
    setSelectedIcon(null);
  };

  const handleIconClick = (icon: IconOption): void => {
    setSelectedIcon(icon);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const newTexts = [...iconTexts];
    newTexts[index] = e.target.value;
    setIconTexts(newTexts);
  };

  const handleDeleteIcon = (id: string) => {
    setPlacedIcons((prev) => prev.filter((icon) => icon.id !== id));
  };

  const handleAddToCart = (): void => {
    const design: Design = {
      type: "X1H",
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

  return (
    <div className="customizer-container">
      <div style={{ position: "absolute", top: 20, right: 30 }}>
        <CartButton />
      </div>

      <h2>Customize your Extended Panel Horizontal</h2>

      <div style={{ marginBottom: "20px" }}>
        <div style={{ display: "flex", gap: "10px", marginBottom: "10px", justifyContent: "center" }}>
          {iconCategories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              style={{
                padding: "8px 16px",
                background: selectedCategory === category ? "#4CAF50" : "#e0e0e0",
                color: selectedCategory === category ? "white" : "black",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              {category}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", justifyContent: "center" }}>
          {categoryIcons.map((icon) => (
            <div
              key={icon.id}
              onClick={() => handleIconClick(icon)}
              style={{
                padding: "10px",
                background: selectedIcon?.id === icon.id ? "#4CAF50" : "#e0e0e0",
                borderRadius: "8px",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                width: "80px",
              }}
            >
              <img
                src={icon.src}
                alt={icon.label}
                style={{ width: "40px", height: "40px", objectFit: "contain" }}
              />
              <span style={{ fontSize: "12px", marginTop: "5px" }}>{icon.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div
        style={{
          width: "350px",
          background: "#f0f0f0",
          padding: "10px",
          border: "2px solid #ccc",
          margin: "auto",
        }}
      >
        <div style={{ display: "flex", flexWrap: "wrap" }}>
          {Array.from({ length: 9 }).map((_, index) => (
            <GridCell key={index} index={index} onClick={handlePlaceIcon}>
              {(() => {
                const icon = placedIcons.find((i) => i.position === index);
                const text = iconTexts[index];
                const isPIR = icon?.category === "PIR";
                return (
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
                      <img
                        src={icon.src}
                        alt={icon.label}
                        style={{ width: "40px", height: "40px", objectFit: "contain" }}
                      />
                    )}
                    {text && !isPIR && (
                      <div style={{ fontSize: "12px", marginTop: "5px" }}>
                        {text}
                      </div>
                    )}
                    {icon && (
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
                    )}
                    {!isPIR && (
                      <input
                        type="text"
                        value={text || ""}
                        onChange={(e) => handleTextChange(e, index)}
                        onClick={(e) => e.stopPropagation()}
                        placeholder="Enter text"
                        style={{
                          width: "80%",
                          padding: "4px",
                          fontSize: "12px",
                          textAlign: "center",
                          marginTop: icon ? "5px" : "0",
                        }}
                      />
                    )}
                  </div>
                );
              })()}
            </GridCell>
          ))}
        </div>
      </div>

      <button
        onClick={handleAddToCart}
        style={{
          marginTop: "20px",
          padding: "10px 20px",
          background: "#4CAF50",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        Add to Cart
      </button>

      <button
        onClick={() => navigate("/subtypes/extended")}
        style={{
          marginTop: "20px",
          marginLeft: "10px",
          padding: "10px 20px",
          background: "#666",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        Back to Extended Panels
      </button>

      <button
        onClick={() => navigate("/")}
        style={{
          marginTop: "20px",
          marginLeft: "10px",
          padding: "10px 20px",
          background: "#666",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        Back to Panel Selection
      </button>
    </div>
  );
};

export default X1HCustomizer; 