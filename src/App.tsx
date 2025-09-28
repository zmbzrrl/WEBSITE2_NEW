//                                        ===== IMPORTS SECTION =====

import React, { useState, useContext, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { ThemeProvider, CssBaseline, Box, Button } from '@mui/material';

//                                        ===== COMPONENT IMPORTS =====

// Page components
import Home from './pages/Home';
import Properties from './pages/Properties';
import PanelTypeSelector from './pages/PanelType/PanelTypeSelector';
import BOQPage from './pages/BOQPage';
import UserBOQPage from './pages/UserBOQPage';
import MyDesigns from './pages/MyDesigns';
import Layouts from './pages/Layouts';
import ProjPanels from './pages/ProjPanels';
import PrintPreview from './pages/PrintPreview';
import DatabaseTest from './pages/DatabaseTest';
import AdminFeedbackSimple from './components/AdminFeedbackSimple';

// Panel selector components
import DoublePanelSelector from './pages/PanelType/DoublePanelSelector';
import ExtendedPanelSelector from './pages/PanelType/ExtendedPanelSelector';

// Customizer components
import SPCustomizer from './pages/Customizers/SPCustomizer';
import DPHCustomizer from './pages/Customizers/DoublePanels/DPHCustomizer';
import DPVCustomizer from './pages/Customizers/DoublePanels/DPVCustomizer';
import X1HCustomizer from './pages/Customizers/ExtendedPanels/X1HCustomizer';
import X2HCustomizer from './pages/Customizers/ExtendedPanels/X2HCustomizer';
import X2VCustomizer from './pages/Customizers/ExtendedPanels/X2VCustomizer';
import X1VCustomizer from './pages/Customizers/ExtendedPanels/X1VCustomizer';
import TAGCustomizer from './pages/Customizers/TAGCustomizer';
import IDPGCustomizer from './pages/Customizers/IDPGCustomizer';

// Utility components
import PageTransition from './components/PageTransition';
import FeedbackModalSimple from './components/FeedbackModalSimple';
import { CartProvider } from './contexts/CartContext';
import { UserProvider, useUser } from './contexts/UserContext';
import { isAdminEmail } from './utils/admin';
import theme from './theme';

//                                        ===== PROJECT CONTEXT =====

// This creates a "shared storage" that any component can access
// Think of it like a global variable that all components can read and write to
interface ProjectContextType {
  projectName: string;
  setProjectName: (name: string) => void;
  projectCode: string;
  setProjectCode: (code: string) => void;
  location: string;
  setLocation: (location: string) => void;
  operator: string;
  setOperator: (operator: string) => void;
  servicePartner: string;
  setServicePartner: (partner: string) => void;
  boqQuantities: any;
  setBoqQuantities: (quantities: any) => void;
  setAllowedPanelTypes: (types: any) => void;
}

// Creates the context with default values
export const ProjectContext = React.createContext<ProjectContextType>({
  projectName: '',
  setProjectName: () => {},
  projectCode: '',
  setProjectCode: () => {},
  location: '',
  setLocation: () => {},
  operator: '',
  setOperator: () => {},
  servicePartner: '',
  setServicePartner: () => {},
  boqQuantities: null,
  setBoqQuantities: () => {},
  setAllowedPanelTypes: () => {}
});

//                                        ===== PROJECT PROVIDER =====

// This component provides project context to the entire app
const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [projectName, setProjectName] = useState('');
  const [projectCode, setProjectCode] = useState('');
  const [location, setLocation] = useState('');
  const [operator, setOperator] = useState('');
  const [servicePartner, setServicePartner] = useState('');
  const [boqQuantities, setBoqQuantities] = useState(null);

  // Persist project context changes to localStorage
  useEffect(() => {
    if (projectName) localStorage.setItem('projectName', projectName);
  }, [projectName]);

  useEffect(() => {
    if (projectCode) localStorage.setItem('projectCode', projectCode);
  }, [projectCode]);

  useEffect(() => {
    if (location) localStorage.setItem('location', location);
  }, [location]);

  useEffect(() => {
    if (operator) localStorage.setItem('operator', operator);
  }, [operator]);

  const value: ProjectContextType = {
    projectName,
    setProjectName,
    projectCode,
    setProjectCode,
    location,
    setLocation,
    operator,
    setOperator,
    servicePartner,
    setServicePartner,
    boqQuantities,
    setBoqQuantities,
    setAllowedPanelTypes: () => {}
  };

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
};

//                                        ===== PROJECT SYNC COMPONENT =====

// This component keeps project data synchronized between different contexts
const ProjectSync: React.FC = () => {
  const { setProjectName, setProjectCode, setLocation, setOperator } = useContext(ProjectContext);
  
  useEffect(() => {
    // Sync project data from localStorage on app start
    try {
      const savedProjectName = localStorage.getItem('projectName');
      const savedProjectCode = localStorage.getItem('projectCode');
      const savedLocation = localStorage.getItem('location');
      const savedOperator = localStorage.getItem('operator');
      
      if (savedProjectName) setProjectName(savedProjectName);
      if (savedProjectCode) setProjectCode(savedProjectCode);
      if (savedLocation) setLocation(savedLocation);
      if (savedOperator) setOperator(savedOperator);
    } catch (error) {
      console.warn('Could not sync project data from localStorage:', error);
    }
  }, [setProjectName, setProjectCode, setLocation, setOperator]);

  return null; // This component doesn't render anything
};

//                                        ===== USER BOOTSTRAP COMPONENT =====

// This component initializes user data from localStorage
const UserBootstrap: React.FC = () => {
  const { setUser } = useUser();
  
  useEffect(() => {
    try {
      const email = localStorage.getItem('userEmail');
      const ugId = localStorage.getItem('userUgId');
      if (email) setUser({ email, ugId });
    } catch {}
  }, [setUser]);
  return null; // This component doesn't show anything, it just syncs data
};

//                                        ===== APP ROUTES COMPONENT =====

// This component defines all the different pages/URLs in your app
// It's like a "map" that tells the app "when someone visits this URL, show this page"
const AppRoutes = () => {
  const location = useLocation();  // Gets current URL location
  const navigate = useNavigate();  // Function to navigate to different pages

  const AdminGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const email = typeof window !== 'undefined' ? localStorage.getItem('userEmail') : null;
    if (!isAdminEmail(email)) {
      return <Navigate to="/" replace />;
    }
    return <>{children}</>;
  };

  return ( 
    // AnimatePresence adds smooth animations when switching between pages
    <AnimatePresence mode="wait">
      {/* Routes defines all the different pages in your app */}
      <Routes location={location} key={location.pathname}>
        {/* Each Route defines one page */}
        {/* path="/" = URL path, element = which component to show */}
        
        {/* Home page - the main landing page */}
        <Route path="/" element={<PageTransition><Home /></PageTransition>} />

        {/* Properties page - shows all properties user has access to */}
        <Route path="/properties" element={<PageTransition><Properties /></PageTransition>} />
        
        {/* Panel Type Selector - BOQ page for quantity distribution */}
        <Route path="/panel-type" element={<PageTransition><PanelTypeSelector /></PageTransition>} />
        {/* Panel category selectors */}
        <Route path="/panel/double" element={<PageTransition><DoublePanelSelector /></PageTransition>} />
        <Route path="/panel/extended" element={<PageTransition><ExtendedPanelSelector /></PageTransition>} />
        
        {/* BOQ page - shows Bill of Quantities */}
        <Route path="/boq" element={<PageTransition><BOQPage /></PageTransition>} />
        
        {/* User BOQ page - shows user's BOQ */}
        <Route path="/user-boq" element={<PageTransition><UserBOQPage /></PageTransition>} />
        
        {/* My Designs page - shows user's saved designs */}
        <Route path="/my-designs" element={<PageTransition><MyDesigns /></PageTransition>} />

        {/* Customizer routes */}
        <Route path="/customizer/sp" element={<PageTransition><SPCustomizer /></PageTransition>} />
        <Route path="/customizer/dph" element={<PageTransition><DPHCustomizer /></PageTransition>} />
        <Route path="/customizer/dpv" element={<PageTransition><DPVCustomizer /></PageTransition>} />
        <Route path="/customizer/x1h" element={<PageTransition><X1HCustomizer /></PageTransition>} />
        <Route path="/customizer/x2h" element={<PageTransition><X2HCustomizer /></PageTransition>} />
        <Route path="/customizer/x2v" element={<PageTransition><X2VCustomizer /></PageTransition>} />
        <Route path="/customizer/x1v" element={<PageTransition><X1VCustomizer /></PageTransition>} />
        <Route path="/customizer/tag" element={<PageTransition><TAGCustomizer /></PageTransition>} />
        <Route path="/customizer/idpg" element={<PageTransition><IDPGCustomizer /></PageTransition>} />
        
        {/* Layouts page - shows different panel layouts */}
        <Route path="/layouts" element={<PageTransition><Layouts /></PageTransition>} />
        
        {/* ProjPanels page - main panel configuration page */}
        <Route path="/proj-panels" element={<PageTransition><ProjPanels /></PageTransition>} />
        
        {/* Print Preview page - shows print preview */}
        <Route path="/print-preview" element={<PageTransition><PrintPreview /></PageTransition>} />
        
        {/* Admin pages - only accessible to admin users */}
        <Route path="/admin" element={<AdminGuard><PageTransition><DatabaseTest /></PageTransition></AdminGuard>} />
        <Route path="/admin/feedback" element={<AdminGuard><PageTransition><AdminFeedbackSimple /></PageTransition></AdminGuard>} />

        {/* Catch-all route - redirects to home if URL doesn't match any route */}
        <Route path="*" element={<Navigate to="/" replace />} />
        
      </Routes>
    </AnimatePresence> // adds smooth animations when switching between pages
  );
};

// Global feedback button. Hidden on /print-preview
const FeedbackButton: React.FC = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  
  // Hide the button on print preview page
  if (location.pathname === '/print-preview') {
    return null;
  }
  
  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        zIndex: 1000,
      }}
    >
      <Button
        variant="contained"
        color="primary"
        onClick={() => setOpen(true)}
        sx={{
          borderRadius: '50%',
          width: 56,
          height: 56,
          minWidth: 56,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        }}
      >
        <span style={{ fontSize: '28px', color: 'white', fontWeight: 'bold' }}>📋</span>
      </Button>
      <FeedbackModalSimple open={open} onClose={() => setOpen(false)} />
    </Box>
  );
};

// Main App component - the root of your entire application
const App: React.FC = () => {
  return (
    <UserProvider>
      <UserBootstrap />
      <ProjectProvider>
        <ProjectSync />
        <CartProvider>
    <ThemeProvider theme={theme}>
      <CssBaseline />
          <Router>
            <AppRoutes />
              <FeedbackButton />
          </Router>
          </ThemeProvider>
      </CartProvider>
      </ProjectProvider>
    </UserProvider>
  );
};

// Export the App component so it can be used in index.tsx
export default App; 
