import React from "react";
import { Link, useNavigate } from "react-router-dom";
import DPH from "../../assets/panels/DP.jpg";
import DPV from "../../assets/panels/DP.jpg";
import CartButton from "../../components/CartButton";

const DoublePanelSelector: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{ textAlign: "center", padding: "40px", position: "relative" }}>
      <div style={{ position: "absolute", top: 20, right: 30 }}>
        <CartButton />
      </div>

      <h2>Select a Double Panel Subtype</h2>
      <div style={{ justifyContent: "center", gap: "40px" }}>
        <Link to="/customizer/DPH">
          <img
            src={DPH}
            alt="DPH Panel"
            style={{ width: "400px", cursor: "pointer" }}
          />
          <p>Double Panel - Horizontal</p>
        </Link>

        <Link to="/customizer/DPV">
          <img
            src={DPV}
            alt="DPV Panel"
            style={{ width: "400px", cursor: "pointer" }}
          />
          <p>Double Panel - Vertical</p>
        </Link>
      </div>
      <div style={{ marginTop: 50 }}>
        <button onClick={() => navigate("/")}>Back to Panel Selection</button>
      </div>
    </div>
  );
};

export default DoublePanelSelector; 