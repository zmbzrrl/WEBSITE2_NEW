import React, { createContext, useState, useContext, useEffect, ReactNode } from "react";

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
  const [currentProjectCode, setCurrentProjectCode] = useState<string | null>(() => {
    // Try to get project code from localStorage or use default
    const stored = localStorage.getItem('currentProjectCode');
    return stored || 'default-project';
  });
  const [projPanels, setProjPanels] = useState<CartItem[]>([]);
  const [isCounting, setIsCounting] = useState<boolean>(false);

  // Calculate projCount from projPanels
  const projCount = projPanels.reduce((sum, item) => sum + item.quantity, 0);

  // Load panels for a specific project code
  const loadProjectPanels = (projectCode: string | null): CartItem[] => {
    if (!projectCode) return [];
    
    try {
      const stored = localStorage.getItem(`panels_${projectCode}`);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error(`Error loading panels for project ${projectCode}:`, error);
      return [];
    }
  };

  // Save panels for a specific project code
  const saveProjectPanels = (projectCode: string | null, panels: CartItem[]) => {
    if (!projectCode) return;
    
    try {
      localStorage.setItem(`panels_${projectCode}`, JSON.stringify(panels));
    } catch (error) {
      console.error(`Error saving panels for project ${projectCode}:`, error);
    }
  };

  // Set project code and load corresponding panels
  const setProjectCode = (projectCode: string | null) => {
    const effectiveProjectCode = projectCode || 'default-project';
    setCurrentProjectCode(effectiveProjectCode);
    
    // Save the current project code to localStorage
    localStorage.setItem('currentProjectCode', effectiveProjectCode);
    
    // Load panels for the new project code
    const projectPanels = loadProjectPanels(effectiveProjectCode);
    setProjPanels(projectPanels);
  };

  // Clear current project
  const clearProject = () => {
    setCurrentProjectCode(null);
    setProjPanels([]);
    localStorage.removeItem('currentProjectCode');
  };

  // Save to localStorage whenever projPanels changes
  useEffect(() => {
    if (currentProjectCode) {
      saveProjectPanels(currentProjectCode, projPanels);
    }
  }, [projPanels, currentProjectCode]);

  // Load panels on initial mount
  useEffect(() => {
    if (currentProjectCode) {
      const projectPanels = loadProjectPanels(currentProjectCode);
      setProjPanels(projectPanels);
    }
  }, []);

  const addToCart = (item: CartItem): void => {
    // Always treat each item as unique – no merging
    setProjPanels((prev) => [...prev, item]);
    setIsCounting(true);
  };

  const updateQuantity = (index: number, newQty: number): void => {
    const updated = [...projPanels];
    if (newQty <= 0) {
      updated.splice(index, 1);
    } else {
      updated[index].quantity = newQty;
    }
    setProjPanels(updated);
  };

  const removeFromCart = (index: number): void => {
    const updated = [...projPanels];
    updated.splice(index, 1);
    setProjPanels(updated);
  };

  const reorderPanels = (newOrder: number[]): void => {
    const reordered = newOrder.map(index => projPanels[index]);
    setProjPanels(reordered);
  };

  const updatePanel = (index: number, updatedPanel: CartItem): void => {
    const updated = [...projPanels];
    updated[index] = updatedPanel;
    setProjPanels(updated);
  };

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