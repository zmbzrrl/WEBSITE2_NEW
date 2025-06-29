import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from "react";

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
  panelDesign?: {
    backgroundColor: string;
    iconColor: string;
    textColor: string;
    fontSize: string;
    fonts?: string;
    backbox?: string;
    extraComments?: string;
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
  const [projPanels, setProjPanels] = useState<CartItem[]>([]);
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
  }, []);

  // Save to localStorage whenever projPanels changes
  useEffect(() => {
    if (currentProjectCode && projPanels.length > 0) {
      saveProjectPanels(currentProjectCode, projPanels);
    }
  }, [projPanels, currentProjectCode, saveProjectPanels]);

  const addToCart = useCallback((item: CartItem): void => {
    setProjPanels((prev) => [...prev, item]);
    setIsCounting(true);
  }, []);

  const updateQuantity = useCallback((index: number, newQty: number): void => {
    setProjPanels((prev) => {
      const updated = [...prev];
      if (newQty <= 0) {
        updated.splice(index, 1);
      } else {
        updated[index].quantity = newQty;
      }
      return updated;
    });
  }, []);

  const removeFromCart = useCallback((index: number): void => {
    setProjPanels((prev) => {
      const updated = [...prev];
      updated.splice(index, 1);
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