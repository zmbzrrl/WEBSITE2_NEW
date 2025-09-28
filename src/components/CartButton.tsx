import React from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../contexts/CartContext";
import { getDesigns } from "../utils/database";

interface CartButtonProps {
  style?: React.CSSProperties;
  showLabel?: boolean;
}

const CartButton: React.FC<CartButtonProps> = ({ style = {}, showLabel = true }) => {
  const { projPanels, isCounting, loadProjectPanels } = useCart();
  const navigate = useNavigate();
  
  // Calculate number of unique designs instead of total quantity
  const designCount = projPanels.length;

  const handleViewPanels = async () => {
    const userEmail = localStorage.getItem('userEmail');
    if (!userEmail) {
      navigate("/proj-panels");
      return;
    }
    const result = await getDesigns(userEmail);
    if (result.success && 'designs' in result && Array.isArray(result.designs) && result.designs.length > 0) {
      // Use the most recently modified project
      const latest = result.designs.reduce((a, b) => (a.lastModified > b.lastModified ? a : b));
      if (latest.designData && Array.isArray(latest.designData.panels)) {
        // Create deep copies to prevent shared references
        const deepCopiedPanels = latest.designData.panels.map((panel: any) => JSON.parse(JSON.stringify(panel)));
        loadProjectPanels(deepCopiedPanels);
      }
    }
    navigate("/proj-panels");
  };

  return (
    <button
      onClick={handleViewPanels}
      style={{ position: "relative", ...style }}
    >
      {showLabel && "View Project Panels"}
      {designCount > 0 && (
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
          {designCount}
        </span>
      )}
    </button>
  );
};

export default CartButton; 