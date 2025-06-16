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
import IDPGPanelSelector from "./pages/PanelType/IDPGPanelSelector";
import TAGPanelSelector from "./pages/PanelType/TAGPanelSelector";
import SPCustomizer from "./pages/SPCustomizer";
import TAGCustomizer from "./pages/TAGCustomizer";
import DPHCustomizer from "./pages/DPHCustomizer";
import DPVCustomizer from "./pages/DPVCustomizer";
import X1HCustomizer from "./pages/X1HCustomizer";
import X2HCustomizer from "./pages/X2HCustomizer";
import X2VCustomizer from "./pages/X2VCustomizer";
import X1VCustomizer from "./pages/X1VCustomizer";
import IDPGCustomizer from "./pages/IDPGCustomizer";
import IDPG_RNCustomizer from "./pages/IDPG_RNCustomizer";
import Cart from "./pages/Cart";
import { CartProvider } from "./contexts/CartContext";
import PageTransition from "./components/PageTransition";

const AppRoutes = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Only redirect on actual page refresh
    const handleBeforeUnload = () => {
      sessionStorage.setItem('wasRefreshed', 'true');
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    const wasRefreshed = sessionStorage.getItem('wasRefreshed') === 'true';
    if (wasRefreshed && location.pathname !== '/') {
      sessionStorage.removeItem('wasRefreshed');
      navigate('/', { replace: true });
    }

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [location.pathname, navigate]);

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Home /></PageTransition>} />
        <Route path="/panel-type" element={<PageTransition><PanelTypeSelector /></PageTransition>} />
        <Route path="/panel/double" element={<PageTransition><DoublePanelSelector /></PageTransition>} />
        <Route path="/panel/extended" element={<PageTransition><ExtendedPanelSelector /></PageTransition>} />
        <Route path="/panel/idpg" element={<PageTransition><IDPGPanelSelector /></PageTransition>} />
        <Route path="/panel/tag" element={<PageTransition><TAGPanelSelector /></PageTransition>} />
        <Route path="/customizer/sp" element={<PageTransition><SPCustomizer /></PageTransition>} />
        <Route path="/customizer/dph" element={<PageTransition><DPHCustomizer /></PageTransition>} />
        <Route path="/customizer/dpv" element={<PageTransition><DPVCustomizer /></PageTransition>} />
        <Route path="/customizer/x1h" element={<PageTransition><X1HCustomizer /></PageTransition>} />
        <Route path="/customizer/x2h" element={<PageTransition><X2HCustomizer /></PageTransition>} />
        <Route path="/customizer/x2v" element={<PageTransition><X2VCustomizer /></PageTransition>} />
        <Route path="/customizer/x1v" element={<PageTransition><X1VCustomizer /></PageTransition>} />
        <Route path="/customizer/tag" element={<PageTransition><TAGCustomizer /></PageTransition>} />
        <Route path="/customizer/idpg" element={<PageTransition><IDPGCustomizer /></PageTransition>} />
        <Route path="/customizer/idpg_rn" element={<PageTransition><IDPG_RNCustomizer /></PageTransition>} />
        <Route path="/cart" element={<PageTransition><Cart /></PageTransition>} />
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