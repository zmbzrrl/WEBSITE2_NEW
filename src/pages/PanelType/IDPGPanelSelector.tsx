import React from 'react';
import { Link, useNavigate } from "react-router-dom";
import IDPG from "../../assets/panels/IDPG.png";
import IDPG_RN from "../../assets/panels/IDPG_RN.png";
import IDPG_CR from "../../assets/panels/IDPG_CR.png";
import IDPG_RN_CR from "../../assets/panels/IDPG_RN_CR.png";
import CartButton from "../../components/CartButton";

const IDPGPanelSelector: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{ textAlign: "center", padding: "40px", position: "relative" }}>
      <div style={{ position: "absolute", top: 20, right: 30 }}>
        <CartButton />
      </div>

      <h2>Select a Corridor Panel (IDPG) Type</h2>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "40px",
          flexWrap: "wrap",
        }}
      >
        <Link to="/customizer/IDPG">
          <img
            src={IDPG}
            alt="IDPG Panel"
            style={{ width: "200px", cursor: "pointer" }}
          />
          <p>Corridor Panel</p>
        </Link>

        <Link to="/customizer/IDPG_RN">
          <img
            src={IDPG_RN}
            alt="IDPG_RN Panel"
            style={{ width: "200px", cursor: "pointer" }}
          />
          <p>Corridor Panel - Room #</p>
        </Link>

        <Link to="/customizer/IDPG_CR">
          <img
            src={IDPG_CR}
            alt="IDPG_CR Panel"
            style={{ width: "200px", cursor: "pointer" }}
          />
          <p>Corridor Panel - Reader</p>
        </Link>

        <Link to="/customizer/IDPG_RN_CR">
          <img
            src={IDPG_RN_CR}
            alt="IDPG_RN_CR Panel"
            style={{ width: "200px", cursor: "pointer" }}
          />
          <p>Corridor Panel - Room# + Reader</p>
        </Link>
      </div>
      <div style={{ marginTop: 50 }}>
        <button onClick={() => navigate("/")}>Back to Panel Selection</button>
      </div>
    </div>
  );
};

export default IDPGPanelSelector; 