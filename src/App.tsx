// This is the MAIN APP CONTROLLER. 

//                               ===== LIBRARIES/TOOLS IMPORTS SECTION =====                             //



// These are like "bringing in tools and materials" from other files/libraries

// React core functionality - the main framework that powers everything
import React, { //tools box is REACT. Stuff inside are tools chosen to use in this project.
  useEffect,    // Run code after render (do this after that)
  useState,     // Store and update data inside a component (box with numbers/words. stores counter e.g.)
  createContext, // Set up a global/shared storage box to share data across components
  useContext,    // Access the shared global values inside any component
} from "react";





//                                           ===== PAGE IMPORTS =====                               //





// Importing all the different pages/screens/files of the Project. Getting all lego/puzzle pieces together cuz this file is where the whole project is.

// Main pages
import Home from "./pages/Home";  // Welcome page - first thing users see
import BOQ from "./pages/BOQ";    // Bill of Quantities page - project summary
import ProjPanels from "./pages/ProjPanels";  // Cart/Project panels page
import Layouts from "./pages/Layouts";        // Layout planning page

// Panel selection pages
import DoublePanelSelector from "./pages/PanelType/DoublePanelSelector";      // Choose double panels
import ExtendedPanelSelector from "./pages/PanelType/ExtendedPanelSelector";  // Choose extended panels
import PanelTypeSelector from "./pages/PanelType/PanelTypeSelector";          // Main panel type selection

// Customizer pages - where users customize different panel types
import SPCustomizer from "./pages/Customizers/SPCustomizer";           // SP panel customizer
import TAGCustomizer from "./pages/Customizers/TAGCustomizer";         // TAG panel customizer
import DPHCustomizer from "./pages/Customizers/DoublePanels/DPHCustomizer";   // Double panel horizontal customizer
import DPVCustomizer from "./pages/Customizers/DoublePanels/DPVCustomizer";   // Double panel vertical customizer
import X1HCustomizer from "./pages/Customizers/ExtendedPanels/X1HCustomizer"; // Extended panel X1 horizontal
import X2HCustomizer from "./pages/Customizers/ExtendedPanels/X2HCustomizer"; // Extended panel X2 horizontal
import X2VCustomizer from "./pages/Customizers/ExtendedPanels/X2VCustomizer"; // Extended panel X2 vertical
import X1VCustomizer from "./pages/Customizers/ExtendedPanels/X1VCustomizer"; // Extended panel X1 vertical
import IDPGCustomizer from "./pages/Customizers/IDPGCustomizer";       // IDPG panel customizer
import MyDesigns from "./pages/MyDesigns";                             // My Designs page
import PrintPreview from "./pages/PrintPreview";                       // Print Preview page
import DatabaseTest from "./pages/DatabaseTest";                       // Database test page
import AdminDashboard from "./pages/AdminDashboard";                    // Admin dashboard
import { isAdminEmail } from "./utils/admin";

// Component imports
import { CartProvider, useCart } from "./contexts/CartContext";  // Cart functionality - manages shopping cart
import PageTransition from "./components/PageTransition";        // Smooth page transition animations
import DesignGuidelines from "./components/DesignGuidelines";    // Design Guidelines dialog






//                                         ===== REACT ROUTER =====                               //





// react-router-dom : TV remote. Switch between channels without restarting TV -> apply for URL.
// React Router - handles navigation between different pages/URLs
// BrowserRouter as Router :  tracks browser’s URL bar. controls what shows.
//Routes : list/container of all possible pages the app can show.
//Route : defines one single page's URL.
//Navigate : REDIRECTS ON RENDER. automatically sends user to a different page.
//useNavigate : "REACT hook" REDIRECTS ON EVENTS. sends user to a different page in response to a user action. 
//useLocation : "REACT hook " helper -> gets current URL.

import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";

// Material-UI components - provides pre-built UI components
// ThemeProvider = applies design theme across the app
// CssBaseline = resets default browser styles
import { ThemeProvider, CssBaseline, Box, Button } from '@mui/material';

// Framer Motion - adds smooth animations and transitions to Project.
// AnimatePresence : smooth animation when things added/removed (e.g. page transition, panel appearing)
import { AnimatePresence } from 'framer-motion';

// Custom theme file - defines colors, fonts, spacing for the entire app
import theme from './theme';

// CSS files - custom styling for the app
import "./App.css";  // Specific styles for cart icon animations
import "./styles.css"; // General app styles





//                                     ===== PROJECT CONTEXT SETUP =====                       //





// This creates a "shared storage room" (Context) for project information
// Any component in the app can access this data without passing it through every level

// ProjectContext stores project name and code that's shared across multiple pages
export const ProjectContext = createContext<{ 
  projectName: string,           // Current project name
  setProjectName: React.Dispatch<React.SetStateAction<string>>,  // Function to update project name 
  projectCode: string,           // The code/ID of the current project
  setProjectCode: React.Dispatch<React.SetStateAction<string>>,   // Function to update project code
  location: string,              // 🗺️ Project location
  setLocation: React.Dispatch<React.SetStateAction<string>>,  // Function to update location
  operator: string,              // 🏢 Project operator/service partner
  setOperator: React.Dispatch<React.SetStateAction<string>>,   // Function to update operator
  servicePartner?: string,       // Optional service partner name
  setServicePartner?: React.Dispatch<React.SetStateAction<string>>, // Update service partner
  allowedPanelTypes: string[],   // BOQ-selected allowed panel categories for selector gating
  setAllowedPanelTypes: React.Dispatch<React.SetStateAction<string[]>>, // Update allowed panel categories
  boqQuantities: Record<string, number>, // BOQ quantities per category key (SP, TAG, IDPG, DP, EXT)
  setBoqQuantities: React.Dispatch<React.SetStateAction<Record<string, number>>>
}>({ 
  // Default values - what the context starts with if nothing is set
  projectName: '', // Shows empty string if nothing is set
  setProjectName: () => {}, // Function to update project name
  projectCode: '', // Shows empty string if nothing is set
  setProjectCode: () => {}, // Function to update project code
  location: '', // 🗺️ Default location
  setLocation: () => {}, // Function to update location
  operator: '', // 🏢 Default operator
  setOperator: () => {}, // Function to update operator
  servicePartner: '',
  setServicePartner: () => {},
  allowedPanelTypes: [],
  setAllowedPanelTypes: () => {},
  boqQuantities: {},
  setBoqQuantities: () => {}
});



//                                         ===== PROJECT SYNC COMPONENT =====                      //





// This component keeps the project code synchronized between different contexts
// It's like a "messenger" that makes sure all parts of the app know about project changes

const ProjectSync: React.FC = () => {
  // Get project code from the main ProjectContext
  const { projectCode } = useContext(ProjectContext);
  
  // Get the function to update project code in the cart context
  const { setProjectCode } = useCart();

  // useEffect runs this code whenever projectCode changes
  useEffect(() => {
    // Only update if project code is not empty
    if (projectCode && projectCode.trim() !== '') {
      setProjectCode(projectCode);  // Update cart context with new project code
    }
  }, [projectCode, setProjectCode]);  // Dependencies - re-run when these change

  return null;  // This component doesn't show anything, it just syncs data
};





//                                         ===== APP ROUTES COMPONENT =====                      //





// This component defines all the different pages/URLs in your app
// It's like a "map" that tells the app "when someone visits this URL, show this page"

const AppRoutes = () => { // defines all the different pages/URLs
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
        
        {/* BOQ page - Bill of Quantities */}
        <Route path="/boq" element={<PageTransition><BOQ /></PageTransition>} />
        
        {/* Panel type selection pages */}
        <Route path="/panel-type" element={<PageTransition><PanelTypeSelector /></PageTransition>} />
        <Route path="/panel/double" element={<PageTransition><DoublePanelSelector /></PageTransition>} />
        <Route path="/panel/extended" element={<PageTransition><ExtendedPanelSelector /></PageTransition>} />
        <Route path="/panel/idpg" element={<PageTransition><IDPGCustomizer /></PageTransition>} />
        
        {/* Customizer pages - where users customize panels */}
        <Route path="/customizer/sp" element={<PageTransition><SPCustomizer /></PageTransition>} />
        <Route path="/customizer/dph" element={<PageTransition><DPHCustomizer /></PageTransition>} />
        <Route path="/customizer/dpv" element={<PageTransition><DPVCustomizer /></PageTransition>} />
        <Route path="/customizer/x1h" element={<PageTransition><X1HCustomizer /></PageTransition>} />
        <Route path="/customizer/x2h" element={<PageTransition><X2HCustomizer /></PageTransition>} />
        <Route path="/customizer/x2v" element={<PageTransition><X2VCustomizer /></PageTransition>} />
        <Route path="/customizer/x1v" element={<PageTransition><X1VCustomizer /></PageTransition>} />
        <Route path="/customizer/tag" element={<PageTransition><TAGCustomizer /></PageTransition>} />
        <Route path="/customizer/idpg" element={<PageTransition><IDPGCustomizer /></PageTransition>} />
        
        {/* Cart/Project panels page */}
        <Route path="/cart" element={<PageTransition><ProjPanels /></PageTransition>} />
        
        {/* Layouts page */}
        <Route path="/layouts" element={<PageTransition><Layouts /></PageTransition>} />
        
        {/* My Designs page */}
        <Route path="/my-designs" element={<PageTransition><MyDesigns /></PageTransition>} />
        
        {/* Print Preview page */}
        <Route path="/print-preview" element={<PageTransition><PrintPreview /></PageTransition>} />
        
        {/* Admin dashboard */}
        <Route path="/admin" element={<PageTransition><AdminGuard><AdminDashboard /></AdminGuard></PageTransition>} />

        {/* Database test page */}
        <Route path="/database-test" element={<PageTransition><DatabaseTest /></PageTransition>} />
        
        {/* Catch-all route - if someone visits an unknown URL, redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence> // adds smooth animations when switching between pages
  );
};

// Global button that opens the Design Guidelines dialog. Hidden on /print-preview
const GlobalGuidelinesButton: React.FC<{ onOpen: () => void }> = ({ onOpen }) => {
  const location = useLocation();
  const isPrintPreview = location.pathname === '/print-preview';
  if (isPrintPreview) return null;
  return (
    <Box position="fixed" bottom={24} right={24} zIndex={1300}>
      <Button variant="contained" color="primary" onClick={onOpen}>
        Read INTEREL's Design Guidelines
      </Button>
    </Box>
  );
};



//                                         ===== MAIN APP COMPONENT =====                      //







// This is the main component that wraps everything together. It's like the "foundation" of the entire app

const App: React.FC = () => {
  // State for project information - these values can change and will update the UI
  const [projectName, setProjectName] = useState('');  // Current project name
  const [projectCode, setProjectCode] = useState('');  // Current project code
  const [location, setLocation] = useState('');        // 🗺️ Project location
  const [operator, setOperator] = useState('');        // 🏢 Project operator/service partner
  const [servicePartner, setServicePartner] = useState(''); // Service partner name
  const [allowedPanelTypes, setAllowedPanelTypes] = useState<string[]>([]); // BOQ-selected panel categories
  const [boqQuantities, setBoqQuantities] = useState<Record<string, number>>({}); // BOQ quantities per category
  const [isGuidelinesOpen, setIsGuidelinesOpen] = useState(false);

  return (
    // ThemeProvider applies the Material-UI theme (colors, fonts, spacing) to the entire app
    <ThemeProvider theme={theme}>
      {/* CssBaseline resets default browser styles for consistent appearance */}
      <CssBaseline />
      
      {/* CartProvider provides cart functionality to all child components */}
      <CartProvider>
        {/* ProjectContext.Provider makes project data available to all child components */}
        <ProjectContext.Provider value={{ 
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
          allowedPanelTypes,
          setAllowedPanelTypes,
          boqQuantities,
          setBoqQuantities
        }}>
          {/* ProjectSync keeps project data synchronized between contexts */}
          <ProjectSync />
          
          {/* Router enables navigation between different pages */}
          <Router>
            {/* Global button & dialog launcher */}
            <GlobalGuidelinesButton onOpen={() => setIsGuidelinesOpen(true)} />
            <DesignGuidelines open={isGuidelinesOpen} onClose={() => setIsGuidelinesOpen(false)} />

            {/* AppRoutes defines all the pages and their URLs */}
            <AppRoutes />
          </Router>
        </ProjectContext.Provider>
      </CartProvider>
    </ThemeProvider>
  );
};

// Export the App component so it can be used in index.tsx
export default App; 
