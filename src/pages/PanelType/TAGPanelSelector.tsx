import React from "react";
import { Link } from "react-router-dom";
import TAG from "../../assets/panels/TAG_PIR.png";
import CartButton from "../../components/CartButton";

const TAGPanelSelector: React.FC = () => {
  return (
    <div style={{ textAlign: "center", padding: "40px", position: "relative" }}>
      <div style={{ position: "absolute", top: 20, right: 30 }}>
        <CartButton />
      </div>

      <h2>Select a Thermostat Type</h2>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "40px",
          flexWrap: "wrap",
        }}
      >
        <Link to="/customizer/tag">
          <img
            src={TAG}
            alt="TAG Panel"
            style={{ width: "200px", cursor: "pointer" }}
          />
          <p>Standard Thermostat</p>
        </Link>
      </div>
    </div>
  );
};

export default TAGPanelSelector; 