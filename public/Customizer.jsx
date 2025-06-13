import React, { useContext, useState } from "react";
import { CartContext } from "../contexts/CartContext";
import "./Customizer.css";
import panelData from "../data/panelData";
import CartButton from "../components/CartButton";
import { useNavigate, useParams } from "react-router-dom";

const iconOptions = [
  { id: "ac", label: "❄️ AC" },
  { id: "fan", label: "🌀 Fan" },
  { id: "light", label: "💡 Light" },
  { id: "tv", label: "📺 TV" },
];

const GridCell = ({ index, onClick, children }) => (
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

function Customizer() {
  const { addToCart } = useContext(CartContext);
  const [selectedIcon, setSelectedIcon] = useState(null);
  const [placedIcons, setPlacedIcons] = useState([]);
  const [iconTexts, setIconTexts] = useState({});
  const navigate = useNavigate();
  const { panelType } = useParams();

  const panel = panelData.find((p) => p.type === panelType);

  const handlePlaceIcon = (cellIndex) => {
    const isOccupied = placedIcons.some((icon) => icon.position === cellIndex);
    if (isOccupied || selectedIcon === null) return;

    const iconPosition = {
      id: Date.now(),
      iconId: selectedIcon.id,
      label: selectedIcon.label,
      position: cellIndex,
    };

    setPlacedIcons((prev) => [...prev, iconPosition]);
    setSelectedIcon(null);
  };

  const handleIconClick = (icon) => {
    setSelectedIcon(icon);
  };

  const handleTextChange = (e, cellIndex) => {
    const newText = e.target.value;
    setIconTexts((prev) => ({
      ...prev,
      [cellIndex]: newText,
    }));
  };

  const handleDeleteIcon = (id) => {
    setPlacedIcons((prev) => prev.filter((icon) => icon.id !== id));
  };

  const handleAddToCart = () => {
    const design = {
      type: panelType,
      icons: Array.from({ length: 9 })
        .map((_, index) => {
          const icon = placedIcons.find((i) => i.position === index);
          return {
            iconId: icon?.iconId || null,
            label: icon?.label || "",
            position: index,
            text: iconTexts[index] || "",
          };
        })
        .filter((entry) => entry.iconId || entry.text), // only include non-empty cells

      quantity: 1,
    };
    addToCart(design);
    // No redirect
  };

  return (
    <div className="customizer-container">
      <div style={{ position: "absolute", top: 20, right: 30 }}>
        <CartButton />
      </div>

      <h2>Customize your {panelType} panel</h2>

      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        {iconOptions.map((icon) => (
          <div
            key={icon.id}
            onClick={() => handleIconClick(icon)}
            style={{
              padding: "10px",
              background: "#e0e0e0",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            {icon.label}
          </div>
        ))}
      </div>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          width: "350px",
          height: "350px",
          background: "#f0f0f0",
          position: "relative",
          border: "2px solid #ccc",
        }}
      >
        {Array.from({ length: 9 }).map((_, index) => (
          <GridCell key={index} index={index} onClick={handlePlaceIcon}>
            {(() => {
              const icon = placedIcons.find((i) => i.position === index);
              const text = iconTexts[index];

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
                  {icon && <div style={{ fontSize: "24px" }}>{icon.label}</div>}
                  {text && (
                    <div style={{ fontSize: "12px", marginTop: "5px" }}>
                      {text}
                    </div>
                  )}
                  {icon && (
                  <button
                  onClick={() => handleDeleteIcon(icon.id)}
                  style={{
                    position: "absolute",
                    top: "-5px",
                    right: "-5px",
                    width: "20px",
                    height: "20px",
                    borderRadius: "50%",
                    backgroundColor: "red",
                    color: "white",
                    fontSize: "14px",
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 0,
                  }}

                    >
                      −
                    </button>
                  )}
                </div>
              );
            })()}

            <input
              type="text"
              value={iconTexts[index] || ""}
              onChange={(e) => handleTextChange(e, index)}
              placeholder="Add text"
              style={{
                position: "absolute",
                bottom: "5px",
                left: "5px",
                width: "90%",
                fontSize: "12px",
                textAlign: "center",
              }}
            />
          </GridCell>
        ))}
      </div>

      <div style={{ marginTop: 20 }}>
        <button onClick={() => navigate("/")}>Back to Panel Selection</button>
        <button
          onClick={handleAddToCart}
          style={{ marginLeft: 10, cursor: "pointer" }}
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}

export default Customizer;
