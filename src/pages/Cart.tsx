import React from "react";
import { useCart } from "../contexts/CartContext";
import { useNavigate } from "react-router-dom";
import CartButton from "../components/CartButton";

interface CartItem {
  type: string;
  icons: Array<{
    iconId: string | null;
    label: string;
    position: number;
    text: string;
  }>;
  quantity: number;
}

const Cart: React.FC = () => {
  const { cartItems, updateQuantity, removeFromCart } = useCart();
  const navigate = useNavigate();

  const renderSPPanel = (item: CartItem) => (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "5px",
        width: "350px",
        margin: "20px auto",
        background: "#f0f0f0",
        padding: "10px",
        border: "2px solid #ccc",
      }}
    >
      {Array.from({ length: 9 }).map((_, index) => {
        const icon = item.icons.find((i) => i.position === index);
        return (
          <div
            key={index}
            style={{
              minHeight: "80px",
              border: "0px solid #ddd",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "20px",
            }}
          >
            {icon?.label}
            {icon?.text && (
              <div style={{ fontSize: "14px", marginTop: "4px" }}>
                {icon.text}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  const renderTAGPanel = (item: CartItem) => (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "5px",
        width: "350px",
        margin: "20px auto",
        background: "#f0f0f0",
        padding: "10px",
        border: "2px solid #ccc",
      }}
    >
      {Array.from({ length: 9 }).map((_, index) => {
        const icon = item.icons.find((i) => i.position === index);
        return (
          <div
            key={index}
            style={{
              minHeight: "80px",
              border: "0px solid #ddd",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "20px",
            }}
          >
            {icon?.label}
            {icon?.text && (
              <div style={{ fontSize: "14px", marginTop: "4px" }}>
                {icon.text}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  const renderDPHPanel = (item: CartItem) => (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(6, 1fr)",
        gap: "5px",
        width: "90%",
        maxWidth: "600px",
        margin: "20px auto",
        background: "#f0f0f0",
        padding: "10px",
        border: "2px solid #ccc",
      }}
    >
      {Array.from({ length: 18 }).map((_, index) => {
        const icon = item.icons.find((i) => i.position === index);
        return (
          <div
            key={index}
            style={{
              minHeight: "80px",
              border: "0px solid #ddd",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "20px",
            }}
          >
            {icon?.label}
            {icon?.text && (
              <div style={{ fontSize: "14px", marginTop: "4px" }}>
                {icon.text}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  const renderDPVPanel = (item: CartItem) => (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "5px",
        width: "95%",
        maxWidth: "350px",
        margin: "20px auto",
        background: "#f0f0f0",
        padding: "10px",
        border: "2px solid #ccc",
        borderRadius: "8px",
      }}
    >
      {Array.from({ length: 18 }).flatMap((_, index) => {
        const icon = item.icons.find((i) => i.position === index);
        const cell = (
          <div
            key={index}
            style={{
              minHeight: "80px",
              border: "0px solid #ddd",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "20px",
              backgroundColor: "#f0f0f0",
              borderRadius: "4px",
            }}
          >
            {icon?.label}
            {icon?.text && (
              <div style={{ fontSize: "14px", marginTop: "5px" }}>
                {icon.text}
              </div>
            )}
          </div>
        );

        if (index === 9) {
          return [
            <div
              key="spacer"
              style={{
                gridColumn: "1 / -1",
                height: "40px",
              }}
            />,
            cell,
          ];
        }

        return cell;
      })}
    </div>
  );

  const renderX2VPanel = (item: CartItem) => (
    <div
      style={{
        margin: "20px auto",
        width: "350px",
        background: "#f0f0f0",
        border: "2px solid #ccc",
        padding: "10px",
        borderRadius: "8px",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "5px",
          marginBottom: "10px",
        }}
      >
        {Array.from({ length: 9 }).map((_, index) => {
          const icon = item.icons.find((i) => i.position === index);
          return (
            <div
              key={index}
              style={{
                minHeight: "100px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "20px",
                backgroundColor: "transparent",
                borderRadius: "4px",
              }}
            >
              {icon?.label}
              {icon?.text && (
                <div style={{ fontSize: "12px", marginTop: "4px" }}>
                  {icon.text}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(1, 1fr)",
          gap: "5px",
        }}
      >
        {Array.from({ length: 2 }).map((_, index) => {
          const positionIndex = 9 + index;
          const icon = item.icons.find((i) => i.position === positionIndex);
          return (
            <div
              key={positionIndex}
              style={{
                minHeight: "100px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "24px",
                backgroundColor: "transparent",
                borderRadius: "4px",
              }}
            >
              {icon?.label}
              {icon?.text && (
                <div style={{ fontSize: "14px", marginTop: "4px" }}>
                  {icon.text}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderX2HPanel = (item: CartItem) => (
    <div
      style={{
        margin: "20px auto",
        width: "600px",
        background: "#f0f0f0",
        border: "2px solid #ccc",
        padding: "10px",
        borderRadius: "8px",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(6, 1fr)",
          gap: "5px",
          marginBottom: "10px",
        }}
      >
        {Array.from({ length: 18 }).map((_, index) => {
          const icon = item.icons.find((i) => i.position === index);
          return (
            <div
              key={index}
              style={{
                minHeight: "100px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "20px",
                backgroundColor: "transparent",
                borderRadius: "4px",
              }}
            >
              {icon?.label}
              {icon?.text && (
                <div style={{ fontSize: "12px", marginTop: "4px" }}>
                  {icon.text}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "5px",
        }}
      >
        {Array.from({ length: 2 }).map((_, index) => {
          const positionIndex = 18 + index;
          const icon = item.icons.find((i) => i.position === positionIndex);
          return (
            <div
              key={positionIndex}
              style={{
                minHeight: "100px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "24px",
                backgroundColor: "transparent",
                borderRadius: "4px",
              }}
            >
              {icon?.label}
              {icon?.text && (
                <div style={{ fontSize: "14px", marginTop: "4px" }}>
                  {icon.text}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderX1HPanel = (item: CartItem) => (
    <div
      style={{
        margin: "20px auto",
        width: "600px",
        background: "#f0f0f0",
        border: "2px solid #ccc",
        padding: "10px",
        borderRadius: "8px",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(6, 1fr)",
          gap: "5px",
        }}
      >
        {Array.from({ length: 12 }).map((_, index) => {
          const icon = item.icons.find((i) => i.position === index);
          return (
            <div
              key={index}
              style={{
                minHeight: "100px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "20px",
                backgroundColor: "transparent",
                borderRadius: "4px",
              }}
            >
              {icon?.label}
              {icon?.text && (
                <div style={{ fontSize: "12px", marginTop: "4px" }}>
                  {icon.text}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderPanelGrid = (item: CartItem) => {
    switch (item.type) {
      case "SP":
        return renderSPPanel(item);
      case "TAG":
        return renderTAGPanel(item);
      case "DPH":
        return renderDPHPanel(item);
      case "DPV":
        return renderDPVPanel(item);
      case "X2V":
        return renderX2VPanel(item);
      case "X2H":
        return renderX2HPanel(item);
      case "X1H":
        return renderX1HPanel(item);
      default:
        return null;
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ position: "absolute", top: 20, right: 30 }}>
        <CartButton />
      </div>

      <h2>Shopping Cart</h2>

      {cartItems.length === 0 ? (
        <div style={{ textAlign: "center", marginTop: "50px" }}>
          <p>Your cart is empty</p>
          <button
            onClick={() => navigate("/")}
            style={{
              padding: "10px 20px",
              marginTop: "20px",
              backgroundColor: "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Continue Shopping
          </button>
        </div>
      ) : (
        <div>
          {cartItems.map((item, index) => (
            <div
              key={index}
              style={{
                border: "1px solid #ddd",
                padding: "20px",
                marginBottom: "20px",
                borderRadius: "8px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3>{item.type} Panel</h3>
                <div>
                  <button
                    onClick={() => updateQuantity(index, item.quantity - 1)}
                    style={{
                      padding: "5px 10px",
                      marginRight: "10px",
                      backgroundColor: "#f44336",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    -
                  </button>
                  <span style={{ margin: "0 10px" }}>{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(index, item.quantity + 1)}
                    style={{
                      padding: "5px 10px",
                      marginRight: "10px",
                      backgroundColor: "#4CAF50",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    +
                  </button>
                  <button
                    onClick={() => removeFromCart(index)}
                    style={{
                      padding: "5px 10px",
                      backgroundColor: "#f44336",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    Remove
                  </button>
                </div>
              </div>
              {renderPanelGrid(item)}
            </div>
          ))}

          <div style={{ textAlign: "center", marginTop: "20px" }}>
            <button
              onClick={() => navigate("/")}
              style={{
                padding: "10px 20px",
                marginRight: "10px",
                backgroundColor: "#4CAF50",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Continue Shopping
            </button>
            <button
              onClick={() => {
                // Handle checkout logic here
                alert("Checkout functionality to be implemented");
              }}
              style={{
                padding: "10px 20px",
                backgroundColor: "#2196F3",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart; 