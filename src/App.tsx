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
import DatabaseInspector from './pages/DatabaseInspector';
import AdminFeedbackSimple from './components/AdminFeedbackSimple';
import UserManagement from './components/UserManagement';
import AdminDashboard from './components/AdminDashboard';
import UserGroupsManagement from './components/UserGroupsManagement';
import PropertiesManagement from './components/PropertiesManagement';

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

// This component initializes user data by asking the backend who is logged in
const UserBootstrap: React.FC = () => {
  const { setUser } = useUser();
  
  useEffect(() => {
    const bootstrap = async () => {
      try {
        const response = await fetch('http://localhost:4000/auth/me', {
          method: 'GET',
          credentials: 'include',
        });

        if (!response.ok) {
          return;
        }

        const data = await response.json();
        if (data?.email) {
          setUser({ email: data.email, ugId: data.ugId, isAdmin: data.isAdmin });
        }
      } catch (err) {
        console.warn('Failed to bootstrap user from backend:', err);
      }
    };

    bootstrap();
  }, [setUser]);
  return null; // This component doesn't show anything, it just syncs data
};

//                                        ===== APP ROUTES COMPONENT =====

// This component defines all the different pages/URLs in your app
// It's like a "map" that tells the app "when someone visits this URL, show this page"
const AppRoutes = () => {
  const location = useLocation();  // Gets current URL location
  const navigate = useNavigate();  // Function to navigate to different pages

  // Auth guard: checks backend cookie directly (doesn't rely on async context updates)
  const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, setUser } = useUser();
    const [isChecking, setIsChecking] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
      const checkAuth = async () => {
        console.log('[AUTH_GUARD] Starting auth check, current user context:', user);
        
        // Fast path: if context already has user, trust it
        if (user?.email) {
          console.log('[AUTH_GUARD] User found in context, fast path:', user.email);
          setIsAuthenticated(true);
          setIsChecking(false);
          return;
        }

        console.log('[AUTH_GUARD] No user in context, checking backend cookie...');
        // Otherwise, check backend cookie directly
        try {
          const response = await fetch('http://localhost:4000/auth/me', {
            method: 'GET',
            credentials: 'include',
          });

          console.log('[AUTH_GUARD] /auth/me response:', {
            ok: response.ok,
            status: response.status,
            statusText: response.statusText
          });

          if (response.ok) {
            const data = await response.json();
            console.log('[AUTH_GUARD] /auth/me data received:', data);
            if (data?.email) {
              console.log('[AUTH_GUARD] Setting user from backend response:', data.email);
              setUser({ email: data.email, ugId: data.ugId, isAdmin: data.isAdmin });
              setIsAuthenticated(true);
            } else {
              console.log('[AUTH_GUARD] No email in response data');
              setIsAuthenticated(false);
            }
          } else {
            const errorData = await response.json().catch(() => null);
            console.log('[AUTH_GUARD] /auth/me failed:', { status: response.status, error: errorData });
            setIsAuthenticated(false);
          }
        } catch (err) {
          // Network error - assume not authenticated
          console.error('[AUTH_GUARD] Network error checking auth:', err);
          setIsAuthenticated(false);
        } finally {
          setIsChecking(false);
          console.log('[AUTH_GUARD] Auth check complete, isAuthenticated:', isAuthenticated);
        }
      };

      checkAuth();
    }, []); // Only run once on mount

    // Re-check if user context changes (e.g., after login)
    useEffect(() => {
      console.log('[AUTH_GUARD] User context changed:', { email: user?.email, isAuthenticated });
      if (user?.email && !isAuthenticated) {
        console.log('[AUTH_GUARD] User context updated, setting authenticated to true');
        setIsAuthenticated(true);
        setIsChecking(false);
      }
    }, [user?.email, isAuthenticated]);

    if (isChecking) {
      console.log('[AUTH_GUARD] Still checking authentication...');
      return null; // Loading state
    }

    if (!isAuthenticated) {
      console.log('[AUTH_GUARD] Not authenticated, redirecting to home');
      return <Navigate to="/" replace />;
    }

    console.log('[AUTH_GUARD] Authenticated, rendering protected content');

    return <>{children}</>;
  };

  const AdminGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, setUser } = useUser();
    const [isChecking, setIsChecking] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);

    console.log('[ADMIN_GUARD] Rendering, current user context:', { 
      email: user?.email, 
      isAdmin: user?.isAdmin, 
      hasUser: !!user 
    });

    useEffect(() => {
      const checkAdmin = async () => {
        console.log('[ADMIN_GUARD] Starting admin check');
        
        // Always check backend first to get the most up-to-date admin status
        // This ensures we have the latest data even if context hasn't updated yet
        try {
          console.log('[ADMIN_GUARD] Checking backend for admin status...');
          const response = await fetch('http://localhost:4000/auth/me', {
            method: 'GET',
            credentials: 'include',
          });

          if (response.ok) {
            const data = await response.json();
            console.log('[ADMIN_GUARD] Backend returned:', data);
            
            // Update user context with backend data (including isAdmin)
            if (data?.email) {
              setUser({ email: data.email, ugId: data.ugId, isAdmin: data.isAdmin });
            }
            
            // Check admin status from backend response (most reliable)
            if (data?.isAdmin === true) {
              console.log('[ADMIN_GUARD] User is admin from backend isAdmin flag');
              setIsAdmin(true);
              setIsChecking(false);
              return;
            }
            
            // Fallback: check email list if backend doesn't have isAdmin flag
            if (data?.email && isAdminEmail(data.email)) {
              console.log('[ADMIN_GUARD] User is admin from email list:', data.email);
              setIsAdmin(true);
              setIsChecking(false);
              return;
            }
            
            console.log('[ADMIN_GUARD] User is not admin');
            setIsAdmin(false);
            setIsChecking(false);
          } else {
            const errorData = await response.json().catch(() => null);
            console.log('[ADMIN_GUARD] Backend auth check failed:', { 
              status: response.status, 
              error: errorData 
            });
            setIsAdmin(false);
            setIsChecking(false);
          }
        } catch (err) {
          console.error('[ADMIN_GUARD] Error checking admin status:', err);
          // Fallback to context check if backend fails
          if (user?.isAdmin === true) {
            console.log('[ADMIN_GUARD] Fallback: Using context isAdmin flag');
            setIsAdmin(true);
          } else if (user?.email && isAdminEmail(user.email)) {
            console.log('[ADMIN_GUARD] Fallback: Using context email check');
            setIsAdmin(true);
          } else {
            setIsAdmin(false);
          }
          setIsChecking(false);
        }
      };

      checkAdmin();
    }, []); // Only run once on mount

    // Re-check if user context changes (e.g., after login updates context)
    useEffect(() => {
      if (user?.isAdmin === true) {
        console.log('[ADMIN_GUARD] User isAdmin flag changed to true in context');
        setIsAdmin(true);
        setIsChecking(false);
      } else if (user?.email && isAdminEmail(user.email)) {
        console.log('[ADMIN_GUARD] User email changed, checking email list:', user.email);
        setIsAdmin(true);
        setIsChecking(false);
      }
    }, [user?.email, user?.isAdmin]);

    if (isChecking) {
      console.log('[ADMIN_GUARD] Still checking admin status...');
      return null; // Loading state
    }

    if (!isAdmin) {
      console.log('[ADMIN_GUARD] Not admin, redirecting to home. User context:', user);
      return <Navigate to="/" replace />;
    }

    console.log('[ADMIN_GUARD] Admin verified, rendering protected content');
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
        <Route
          path="/properties"
          element={
            <AuthGuard>
              <PageTransition><Properties /></PageTransition>
            </AuthGuard>
          }
        />
        
        {/* Panel Type Selector - BOQ page for quantity distribution */}
        <Route
          path="/panel-type"
          element={
            <AuthGuard>
              <PageTransition><PanelTypeSelector /></PageTransition>
            </AuthGuard>
          }
        />
        {/* Panel category selectors */}
        <Route
          path="/panel/double"
          element={
            <AuthGuard>
              <PageTransition><DoublePanelSelector /></PageTransition>
            </AuthGuard>
          }
        />
        <Route
          path="/panel/extended"
          element={
            <AuthGuard>
              <PageTransition><ExtendedPanelSelector /></PageTransition>
            </AuthGuard>
          }
        />
        
        {/* BOQ page - shows Bill of Quantities */}
        <Route
          path="/boq"
          element={
            <AuthGuard>
              <PageTransition><BOQPage /></PageTransition>
            </AuthGuard>
          }
        />
        
        {/* User BOQ page - shows user's BOQ */}
        <Route
          path="/user-boq"
          element={
            <AuthGuard>
              <PageTransition><UserBOQPage /></PageTransition>
            </AuthGuard>
          }
        />
        
        {/* My Designs page - shows user's saved designs */}
        <Route
          path="/my-designs"
          element={
            <AuthGuard>
              <PageTransition><MyDesigns /></PageTransition>
            </AuthGuard>
          }
        />

        {/* Customizer routes */}
        <Route
          path="/customizer/sp"
          element={
            <AuthGuard>
              <PageTransition><SPCustomizer /></PageTransition>
            </AuthGuard>
          }
        />
        <Route
          path="/customizer/dph"
          element={
            <AuthGuard>
              <PageTransition><DPHCustomizer /></PageTransition>
            </AuthGuard>
          }
        />
        <Route
          path="/customizer/dpv"
          element={
            <AuthGuard>
              <PageTransition><DPVCustomizer /></PageTransition>
            </AuthGuard>
          }
        />
        <Route
          path="/customizer/x1h"
          element={
            <AuthGuard>
              <PageTransition><X1HCustomizer /></PageTransition>
            </AuthGuard>
          }
        />
        <Route
          path="/customizer/x2h"
          element={
            <AuthGuard>
              <PageTransition><X2HCustomizer /></PageTransition>
            </AuthGuard>
          }
        />
        <Route
          path="/customizer/x2v"
          element={
            <AuthGuard>
              <PageTransition><X2VCustomizer /></PageTransition>
            </AuthGuard>
          }
        />
        <Route
          path="/customizer/x1v"
          element={
            <AuthGuard>
              <PageTransition><X1VCustomizer /></PageTransition>
            </AuthGuard>
          }
        />
        <Route
          path="/customizer/tag"
          element={
            <AuthGuard>
              <PageTransition><TAGCustomizer /></PageTransition>
            </AuthGuard>
          }
        />
        <Route
          path="/customizer/idpg"
          element={
            <AuthGuard>
              <PageTransition><IDPGCustomizer /></PageTransition>
            </AuthGuard>
          }
        />
        
        {/* Layouts page - shows different panel layouts */}
        <Route
          path="/layouts"
          element={
            <AuthGuard>
              <PageTransition><Layouts /></PageTransition>
            </AuthGuard>
          }
        />
        
        {/* ProjPanels page - main panel configuration page */}
        <Route
          path="/proj-panels"
          element={
            <AuthGuard>
              <PageTransition><ProjPanels /></PageTransition>
            </AuthGuard>
          }
        />
        
        {/* Print Preview page - shows print preview */}
        <Route
          path="/print-preview"
          element={
            <AuthGuard>
              <PageTransition><PrintPreview /></PageTransition>
            </AuthGuard>
          }
        />
        
        {/* Admin pages - only accessible to admin users */}
        <Route path="/admin" element={<AdminGuard><PageTransition><AdminDashboard /></PageTransition></AdminGuard>} />
        <Route path="/admin/dashboard" element={<AdminGuard><PageTransition><AdminDashboard /></PageTransition></AdminGuard>} />
        <Route path="/admin/inspect" element={<AdminGuard><PageTransition><DatabaseInspector /></PageTransition></AdminGuard>} />
        <Route path="/admin/feedback" element={<AdminGuard><PageTransition><AdminFeedbackSimple /></PageTransition></AdminGuard>} />
        <Route path="/admin/users" element={<AdminGuard><PageTransition><UserManagement /></PageTransition></AdminGuard>} />
        <Route path="/admin/user-groups" element={<AdminGuard><PageTransition><UserGroupsManagement /></PageTransition></AdminGuard>} />
        <Route path="/admin/properties" element={<AdminGuard><PageTransition><PropertiesManagement /></PageTransition></AdminGuard>} />

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
