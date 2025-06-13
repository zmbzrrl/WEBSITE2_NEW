import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import "./styles.css";
import PanelTypeSelector from "./pages/PanelType/PanelTypeSelector";
import DoublePanelSelector from "./pages/PanelType/DoublePanelSelector";
import ExtendedPanelSelector from "./pages/PanelType/ExtendedPanelSelector";
import IDPGPanelSelector from "./pages/PanelType/IDPGPanelSelector";
import TAGPanelSelector from "./pages/PanelType/TAGPanelSelector";

import SPCustomizer from "./pages/SPCustomizer";
import TAGCustomizer from "./pages/TAGCustomizer";
import DPHCustomizer from "./pages/DPHCustomizer";
import DPVCustomizer from "./pages/DPVCustomizer";
import X1HCustomizer from "./pages/X1HCustomizer";
import X2HCustomizer from "./pages/X2HCustomizer";
import X2VCustomizer from "./pages/X2VCustomizer";
import IDPGCustomizer from "./pages/IDPGCustomizer";
import IDPG_RNCustomizer from "./pages/IDPG_RNCustomizer";
import Cart from "./pages/Cart";
import { CartProvider } from "./contexts/CartContext";

const App: React.FC = () => {
  return (
    <CartProvider>
      <Router>
        <Routes>
          <Route path="/" element={<PanelTypeSelector />} />
          <Route path="/panel/double" element={<DoublePanelSelector />} />
          <Route path="/panel/extended" element={<ExtendedPanelSelector />} />
          <Route path="/panel/idpg" element={<IDPGPanelSelector />} />
          <Route path="/customizer/sp" element={<SPCustomizer />} />
          <Route path="/customizer/DPH" element={<DPHCustomizer />} />
          <Route path="/customizer/DPV" element={<DPVCustomizer />} />
          <Route path="/customizer/X1H" element={<X1HCustomizer />} />
          <Route path="/customizer/X2H" element={<X2HCustomizer />} />
          <Route path="/customizer/X2V" element={<X2VCustomizer />} />
          <Route path="/customizer/tag" element={<TAGCustomizer />} />
          <Route path="/customizer/idpg" element={<IDPGCustomizer />} />
          <Route path="/customizer/idpg_rn" element={<IDPG_RNCustomizer />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/subtypes/double" element={<DoublePanelSelector />} />
          <Route
            path="/subtypes/extended"
            element={<ExtendedPanelSelector />}
          />
          <Route path="/subtypes/IDPG" element={<IDPGPanelSelector />} />
          <Route path="/subtypes/tag" element={<TAGPanelSelector />} />
        </Routes>
      </Router>
    </CartProvider>
  );
};

export default App; 