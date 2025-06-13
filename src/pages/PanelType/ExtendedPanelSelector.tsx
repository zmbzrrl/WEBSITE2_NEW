import React from 'react';
import { Link, useNavigate } from "react-router-dom";
import X1H from "../../assets/panels/X1RS.jpg";
import X2H from "../../assets/panels/X2RS.png";
import X2V from "../../assets/panels/X2V_UP.png";
import CartButton from "../../components/CartButton";

const ExtendedPanelSelector: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{ textAlign: "center", padding: "40px", position: "relative" }}>
      <div style={{ position: "absolute", top: 20, right: 30 }}>
        <CartButton />
      </div>

      <h2>Select an Extended Panel </h2>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "40px",
          flexWrap: "wrap",
        }}
      >
        <Link to="/customizer/X1H">
          <img
            src={X1H}
            alt="X1H Panel"
            style={{ width: "400px", cursor: "pointer" }}
          />
          <p>Extended Panel - Horizontal (1 socket) </p>
        </Link>

        <Link to="/customizer/X2H">
          <img
            src={X2H}
            alt="X2H Panel"
            style={{ width: "500px", cursor: "pointer" }}
          />
          <p>Extended Panel - Horizontal (2 sockets)</p>
        </Link>

        <Link to="/customizer/X2V">
          <img
            src={X2V}
            alt="X2V Panel"
            style={{ width: "150px", cursor: "pointer" }}
          />
          <p>Extended Panel - Vertical (2 sockets)</p>
        </Link>
      </div>
      <div style={{ marginTop: 50 }}>
        <button onClick={() => navigate("/")}>Back to Panel Selection</button>
      </div>
    </div>
  );
};

export default ExtendedPanelSelector; 