import React, { useState, useEffect } from "react";
import { GridCell } from "../components/GridCell";
import { Icon } from "../types/Icon";
import { useCart } from "../contexts/CartContext";
import "./Customizer.css";
import CartButton from "../components/CartButton";
import { useNavigate } from "react-router-dom";
import logo2 from "../assets/logo2.png";

interface PlacedIcon extends Icon {
  id: string;
  position: number;
}

const IDPVCustomizer: React.FC = () => {
  const [placedIcons, setPlacedIcons] = useState<PlacedIcon[]>([]);
  const [iconTexts, setIconTexts] = useState<string[]>(Array(9).fill(""));

  const handlePlaceIcon = (position: number) => {
    // Implementation
  };

  const handleDeleteIcon = (id: string) => {
    // Implementation
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    // Implementation
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
  );
};

export default IDPVCustomizer; 