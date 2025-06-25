import React from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../contexts/CartContext";

interface CartButtonProps {
  style?: React.CSSProperties;
  showLabel?: boolean;
}

const CartButton: React.FC<CartButtonProps> = ({ style = {}, showLabel = true }) => {
  const { projCount, isCounting } = useCart();
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate("/cart")}
      style={{ position: "relative", ...style }}
    >
      {showLabel && "View Project Panels"}
      <span
        style={{
          position: "absolute",
          top: -10,
          right: -10,
          backgroundColor: "#ff5733",
          color: "white",
          borderRadius: "50%",
          padding: "4px 8px",
          fontSize: "12px",
          fontWeight: "bold",
          transform: isCounting ? "scale(1.3)" : "scale(1)",
          opacity: isCounting ? 1 : 0.9,
          transition: "transform 0.2s ease, opacity 0.2s ease",
        }}
      >
        {projCount}
      </span>
    </button>
  );
};

export default CartButton; 