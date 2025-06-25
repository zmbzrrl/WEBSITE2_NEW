import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { ThemeProvider, CssBaseline } from '@mui/material';
import { AnimatePresence } from 'framer-motion';
import theme from './theme';
import "./App.css";
import "./styles.css";

import Home from "./pages/Home";
import PanelTypeSelector from "./pages/PanelType/PanelTypeSelector";
import DoublePanelSelector from "./pages/PanelType/DoublePanelSelector";
import ExtendedPanelSelector from "./pages/PanelType/ExtendedPanelSelector";
import SPCustomizer from "./pages/Customizers/SPCustomizer";
import TAGCustomizer from "./pages/Customizers/TAGCustomizer";
import DPHCustomizer from "./pages/Customizers/DoublePanels/DPHCustomizer";
import DPVCustomizer from "./pages/Customizers/DoublePanels/DPVCustomizer";
import X1HCustomizer from "./pages/Customizers/ExtendedPanels/X1HCustomizer";
import X2HCustomizer from "./pages/Customizers/ExtendedPanels/X2HCustomizer";
import X2VCustomizer from "./pages/Customizers/ExtendedPanels/X2VCustomizer";
import X1VCustomizer from "./pages/Customizers/ExtendedPanels/X1VCustomizer";
import IDPGCustomizer from "./pages/Customizers/IDPGCustomizer";
import ProjPanels from "./pages/ProjPanels";
import { CartProvider } from "./contexts/CartContext";
import PageTransition from "./components/PageTransition";

const AppRoutes = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Home /></PageTransition>} />
        <Route path="/panel-type" element={<PageTransition><PanelTypeSelector /></PageTransition>} />
        <Route path="/panel/double" element={<PageTransition><DoublePanelSelector /></PageTransition>} />
        <Route path="/panel/extended" element={<PageTransition><ExtendedPanelSelector /></PageTransition>} />
        <Route path="/panel/idpg" element={<PageTransition><IDPGCustomizer /></PageTransition>} />
        <Route path="/customizer/sp" element={<PageTransition><SPCustomizer /></PageTransition>} />
        <Route path="/customizer/dph" element={<PageTransition><DPHCustomizer /></PageTransition>} />
        <Route path="/customizer/dpv" element={<PageTransition><DPVCustomizer /></PageTransition>} />
        <Route path="/customizer/x1h" element={<PageTransition><X1HCustomizer /></PageTransition>} />
        <Route path="/customizer/x2h" element={<PageTransition><X2HCustomizer /></PageTransition>} />
        <Route path="/customizer/x2v" element={<PageTransition><X2VCustomizer /></PageTransition>} />
        <Route path="/customizer/x1v" element={<PageTransition><X1VCustomizer /></PageTransition>} />
        <Route path="/customizer/tag" element={<PageTransition><TAGCustomizer /></PageTransition>} />
        <Route path="/customizer/idpg" element={<PageTransition><IDPGCustomizer /></PageTransition>} />
        <Route path="/cart" element={<PageTransition><ProjPanels /></PageTransition>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <CartProvider>
        <Router>
          <AppRoutes />
        </Router>
      </CartProvider>
    </ThemeProvider>
  );
};

export default App; 