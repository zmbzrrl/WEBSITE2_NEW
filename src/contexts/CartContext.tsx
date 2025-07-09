import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from "react";
import { DEFAULT_PANELS } from '../data/defaultPanels';

interface CartItem {
  type: string;
  icons: Array<{
    iconId: string | null;
    label: string;
    position: number;
    text: string;
    src?: string;
    category?: string;
  }>;
  quantity: number;
  displayNumber?: number;
  panelName?: string;
  panelDesign?: {
    backgroundColor: string;
    iconColor: string;
    textColor: string;
    fontSize: string;
    iconSize?: string;
    fonts?: string;
    backbox?: string;
    extraComments?: string;
    isLayoutReversed?: boolean;
  };
}

export interface CartContextType {
  projPanels: CartItem[];
  projCount: number;
  isCounting: boolean;
  currentProjectCode: string | null;
  addToCart: (item: CartItem) => void;
  updateQuantity: (index: number, newQty: number) => void;
  removeFromCart: (index: number) => void;
  reorderPanels: (newOrder: number[]) => void;
  updatePanel: (index: number, updatedPanel: CartItem) => void;
  setProjectCode: (projectCode: string | null) => void;
  clearProject: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [currentProjectCode, setCurrentProjectCode] = useState<string | null>(null);
  const [projPanels, setProjPanels] = useState<CartItem[]>(() => {
    // Load panels from localStorage on initialization
    try {
      const stored = localStorage.getItem('currentPanels');
      return stored ? JSON.parse(stored) : DEFAULT_PANELS;
    } catch (error) {
      console.error('Error loading panels from localStorage:', error);
      return DEFAULT_PANELS;
    }
  });
  const [isCounting, setIsCounting] = useState<boolean>(false);

  // Calculate projCount from projPanels
  const projCount = projPanels.reduce((sum, item) => sum + item.quantity, 0);

  // Load panels for a specific project code
  const loadProjectPanels = useCallback((projectCode: string | null): CartItem[] => {
    if (!projectCode) return [];
    
    try {
      const stored = localStorage.getItem(`panels_${projectCode}`);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error(`Error loading panels for project ${projectCode}:`, error);
      return [];
    }
  }, []);

  // Save panels for a specific project code
  const saveProjectPanels = useCallback((projectCode: string | null, panels: CartItem[]) => {
    if (!projectCode) return;
    
    try {
      localStorage.setItem(`panels_${projectCode}`, JSON.stringify(panels));
    } catch (error) {
      console.error(`Error saving panels for project ${projectCode}:`, error);
    }
  }, []);

  // Set project code and load corresponding panels
  const setProjectCode = useCallback((projectCode: string | null) => {
    setCurrentProjectCode(projectCode);
    
    if (projectCode) {
      // Load panels for the new project code
      const projectPanels = loadProjectPanels(projectCode);
      setProjPanels(projectPanels);
    } else {
      // Clear panels when no project code
      setProjPanels([]);
    }
  }, [loadProjectPanels]);

  // Clear current project
  const clearProject = useCallback(() => {
    setCurrentProjectCode(null);
    setProjPanels([]);
    // Clear customized panels tracking
    localStorage.removeItem('customizedPanels');
  }, []);

  // Save current panels to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('currentPanels', JSON.stringify(projPanels));
    } catch (error) {
      console.error('Error saving panels to localStorage:', error);
    }
  }, [projPanels]);

  // Save to localStorage whenever projPanels changes (for project-specific storage)
  useEffect(() => {
    if (currentProjectCode && projPanels.length > 0) {
      saveProjectPanels(currentProjectCode, projPanels);
    }
  }, [projPanels, currentProjectCode, saveProjectPanels]);

  const addToCart = useCallback((item: CartItem): void => {
    setProjPanels((prev) => [...prev, item]);
    setIsCounting(true);
    
    // Track customized panel for BOQ management
    const panelType = item.type.toLowerCase();
    const customizedData = localStorage.getItem('customizedPanels');
    const customizedPanels = customizedData ? JSON.parse(customizedData) : {};
    
    customizedPanels[panelType] = (customizedPanels[panelType] || 0) + item.quantity;
    localStorage.setItem('customizedPanels', JSON.stringify(customizedPanels));
  }, []);

  const updateQuantity = useCallback((index: number, newQty: number): void => {
    setProjPanels((prev) => {
      const updated = [...prev];
      const oldItem = updated[index];
      
      if (newQty <= 0) {
        updated.splice(index, 1);
        
        // Update customized panel tracking when removing
        if (oldItem) {
          const panelType = oldItem.type.toLowerCase();
          const customizedData = localStorage.getItem('customizedPanels');
          const customizedPanels = customizedData ? JSON.parse(customizedData) : {};
          
          customizedPanels[panelType] = Math.max(0, (customizedPanels[panelType] || 0) - oldItem.quantity);
          localStorage.setItem('customizedPanels', JSON.stringify(customizedPanels));
        }
      } else {
        const quantityDiff = newQty - oldItem.quantity;
        updated[index].quantity = newQty;
        
        // Update customized panel tracking for quantity changes
        if (quantityDiff !== 0) {
          const panelType = oldItem.type.toLowerCase();
          const customizedData = localStorage.getItem('customizedPanels');
          const customizedPanels = customizedData ? JSON.parse(customizedData) : {};
          
          customizedPanels[panelType] = Math.max(0, (customizedPanels[panelType] || 0) + quantityDiff);
          localStorage.setItem('customizedPanels', JSON.stringify(customizedPanels));
        }
      }
      return updated;
    });
  }, []);

  const removeFromCart = useCallback((index: number): void => {
    setProjPanels((prev) => {
      const updated = [...prev];
      const removedItem = updated[index];
      updated.splice(index, 1);
      
      // Update customized panel tracking when removing from cart
      if (removedItem) {
        const panelType = removedItem.type.toLowerCase();
        const customizedData = localStorage.getItem('customizedPanels');
        const customizedPanels = customizedData ? JSON.parse(customizedData) : {};
        
        customizedPanels[panelType] = Math.max(0, (customizedPanels[panelType] || 0) - removedItem.quantity);
        localStorage.setItem('customizedPanels', JSON.stringify(customizedPanels));
      }
      
      return updated;
    });
  }, []);

  const reorderPanels = useCallback((newOrder: number[]): void => {
    setProjPanels((prev) => {
      const reordered = newOrder.map(index => prev[index]);
      return reordered;
    });
  }, []);

  const updatePanel = useCallback((index: number, updatedPanel: CartItem): void => {
    setProjPanels((prev) => {
      const updated = [...prev];
      updated[index] = updatedPanel;
      return updated;
    });
  }, []);

  useEffect(() => {
    if (isCounting) {
      const timer = setTimeout(() => setIsCounting(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isCounting]);

  return (
    <CartContext.Provider
      value={{
        projPanels,
        projCount,
        isCounting,
        currentProjectCode,
        addToCart,
        updateQuantity,
        removeFromCart,
        reorderPanels,
        updatePanel,
        setProjectCode,
        clearProject,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export { CartContext }; 