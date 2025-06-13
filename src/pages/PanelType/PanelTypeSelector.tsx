import React from "react";
import { Link } from "react-router-dom";
import SP from "../../assets/panels/SP.png";
import DP from "../../assets/panels/DP.jpg";
import X2V from "../../assets/panels/X2V_UP.png";
import X2H from "../../assets/panels/X2RS.png";
import IDPG from "../../assets/panels/IDPG_RN.png";
import TAG from "../../assets/panels/TAG_PIR.png";
import CartButton from "../../components/CartButton";

const PanelTypeSelector: React.FC = () => {
  return (
    <div style={{ textAlign: "center", padding: "40px", position: "relative" }}>
      <div style={{ position: "absolute", top: 20, right: 30 }}>
        <CartButton />
      </div>

      <h2>Select a Panel Type</h2>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "40px",
          flexWrap: "wrap",
        }}
      >
        <Link to="/customizer/sp">
          <img
            src={SP}
            alt="SP Panel"
            style={{ width: "200px", cursor: "pointer" }}
          />
          <p>Single Panel</p>
        </Link>

        <Link to="/customizer/tag">
          <img
            src={TAG}
            alt="TAG Panel"
            style={{ width: "200px", cursor: "pointer" }}
          />
          <p>Thermostat</p>
        </Link>

        <Link to="/panel/idpg">
          <img
            src={IDPG}
            alt="IDPG Panel"
            style={{ width: "200px", cursor: "pointer" }}
          />
          <p>Corridor Panel - IDPG</p>
        </Link>

        <Link to="/panel/double">
          <img
            src={DP}
            alt="Double Panel"
            style={{ width: "400px", cursor: "pointer" }}
          />
          <p>Double Panel</p>
        </Link>

        <Link to="/panel/extended">
          <img
            src={X2H}
            alt="Extended Panel"
            style={{ width: "400px", cursor: "pointer" }}
          />
          <p>Extended Panel</p>
        </Link>

        <Link to="/customizer/x2v">
          <img
            src={X2V}
            alt="X2V Panel"
            style={{ width: "400px", cursor: "pointer" }}
          />
          <p>X2V Panel</p>
        </Link>
      </div>
    </div>
  );
};

export default PanelTypeSelector; 