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
      {projCount > 0 && (
        <span
          style={{
            position: "absolute",
            top: -8,
            right: -8,
            backgroundColor: "#ff5733",
            color: "white",
            borderRadius: "50%",
            minWidth: "20px",
            height: "20px",
            fontSize: "12px",
            fontWeight: "bold",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transform: isCounting ? "scale(1.2)" : "scale(1)",
            transition: "transform 0.15s ease",
            boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
            zIndex: 10,
          }}
        >
          {projCount}
        </span>
      )}
    </button>
  );
};

export default CartButton; 