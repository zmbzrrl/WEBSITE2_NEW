import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from "react";

const getPanelTypeLabel = (type: string) => {
  switch (type) {
    case "SP": return "Single Panel";
    case "TAG": return "Thermostat";
    case "DPH": return "Horizontal Double Panel";
    case "DPV": return "Vertical Double Panel";
    case "X2V": return "Extended Panel, Vertical, 2 Sockets";
    case "X2H": return "Extended Panel, Horizontal, 2 Sockets";
    case "X1H": return "Extended Panel, Horizontal, 1 Socket";
    case "X1V": return "Extended Panel, Vertical, 1 Socket";
    case "IDPG": return "Corridor Panel";
    default: return "Panel";
  }
};

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
    features?: {
      Proximity?: boolean;
    };
    Proximity?: boolean;
  };
  iconTexts?: { [key: number]: string };
  customPanelRequest?: boolean;
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
  clearSession: () => void;
  loadProjectPanels: (panels: CartItem[]) => void;
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
  // Load initial state from sessionStorage (temporary session data)
  const [currentProjectCode, setCurrentProjectCode] = useState<string | null>(() => {
    const saved = sessionStorage.getItem('currentProjectCode');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [projPanels, setProjPanels] = useState<CartItem[]>(() => {
    const saved = sessionStorage.getItem('projPanels');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [isCounting, setIsCounting] = useState<boolean>(false);

  // Calculate projCount from projPanels
  const projCount = projPanels.reduce((sum, item) => sum + item.quantity, 0);

  // Save to sessionStorage whenever projPanels changes (automatic saving)
  useEffect(() => {
    sessionStorage.setItem('projPanels', JSON.stringify(projPanels));
  }, [projPanels]);

  // Save to sessionStorage whenever currentProjectCode changes
  useEffect(() => {
    if (currentProjectCode) {
      sessionStorage.setItem('currentProjectCode', JSON.stringify(currentProjectCode));
    } else {
      sessionStorage.removeItem('currentProjectCode');
    }
  }, [currentProjectCode]);

  // Set project code and load corresponding panels
  const setProjectCode = useCallback((projectCode: string | null) => {
    setCurrentProjectCode(projectCode);
    
    if (projectCode) {
      // For now, just set empty panels for new project code
      setProjPanels([]);
    } else {
      // Clear panels when no project code
      setProjPanels([]);
    }
  }, []);

  // Clear current project
  const clearProject = useCallback(() => {
    setCurrentProjectCode(null);
    setProjPanels([]);
    // Clear sessionStorage
    sessionStorage.removeItem('currentProjectCode');
    sessionStorage.removeItem('projPanels');
  }, []);

  // Clear session storage (useful for starting fresh)
  const clearSession = useCallback(() => {
    sessionStorage.removeItem('currentProjectCode');
    sessionStorage.removeItem('projPanels');
    setCurrentProjectCode(null);
    setProjPanels([]);
  }, []);

  // Create a stable string representation for deep objects with sorted keys
  const stableStringify = (value: any): string => {
    const seen = new WeakSet();
    const stringify = (val: any): any => {
      if (val === null || typeof val !== 'object') return val;
      if (seen.has(val)) return undefined;
      seen.add(val);
      if (Array.isArray(val)) return val.map(stringify);
      const keys = Object.keys(val).sort();
      const obj: Record<string, any> = {};
      for (const key of keys) {
        obj[key] = stringify(val[key]);
      }
      return obj;
    };
    return JSON.stringify(stringify(value));
  };

  // Generate a design key ignoring quantity/display-only fields
  const generateDesignKey = (item: CartItem): string => {
    const normalizedIcons = (item.icons || [])
      .slice()
      .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
      .map(icon => ({
        iconId: icon.iconId ?? null,
        label: icon.label ?? '',
        position: icon.position ?? 0,
        text: icon.text ?? '',
        category: icon.category ?? '',
        src: icon.src ?? ''
      }));

    const panelDesignNormalized = item.panelDesign
      ? {
          backgroundColor: item.panelDesign.backgroundColor ?? '',
          iconColor: item.panelDesign.iconColor ?? '',
          textColor: item.panelDesign.textColor ?? '',
          fontSize: item.panelDesign.fontSize ?? '',
          iconSize: item.panelDesign.iconSize ?? '',
          fonts: item.panelDesign.fonts ?? '',
          backbox: item.panelDesign.backbox ?? '',
          extraComments: item.panelDesign.extraComments ?? '',
          isLayoutReversed: item.panelDesign.isLayoutReversed ?? false,
        }
      : undefined;

    const keyObj = {
      type: item.type,
      icons: normalizedIcons,
      panelDesign: panelDesignNormalized,
      customPanelRequest: Boolean(item.customPanelRequest),
    };
    return stableStringify(keyObj);
  };

  const addToCart = useCallback((item: CartItem): void => {
    setProjPanels((prev) => {
      const newItemQuantity = Math.max(1, item.quantity || 1);
      
      // Auto-populate panel name if not set (prioritize existing panelName, then fallback to panel type)
      const panelName = item.panelName || getPanelTypeLabel(item.type);
      
      // Create the item with auto-populated data
      const enhancedItem = {
        ...item,
        quantity: newItemQuantity,
        panelName: panelName
      };
      
      const newKey = generateDesignKey(enhancedItem);
      for (let i = 0; i < prev.length; i++) {
        const existing = prev[i];
        if (generateDesignKey(existing) === newKey) {
          const updated = [...prev];
          const existingQty = Math.max(0, existing.quantity || 0);
          updated[i] = { ...existing, quantity: existingQty + newItemQuantity };
          return updated;
        }
      }
      return [...prev, enhancedItem];
    });
    setIsCounting(true);
  }, []);

  const updateQuantity = useCallback((index: number, newQty: number): void => {
    setProjPanels((prev) => {
      const updated = [...prev];
      if (newQty <= 0) {
        updated.splice(index, 1);
      } else {
        updated[index] = { ...updated[index], quantity: newQty };
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
      const reordered = newOrder.map(index => ({ ...prev[index] }));
      return reordered;
    });
  }, []);

  const updatePanel = useCallback((index: number, updatedPanel: CartItem): void => {
    setProjPanels((prev) => {
      const updated = [...prev];
      updated[index] = { ...updatedPanel };
      return updated;
    });
  }, []);

  const loadProjectPanels = useCallback((panels: CartItem[]): void => {
    // Clear existing panels and load new ones with deep copies
    console.log('🔍 loadProjectPanels called - clearing cart and loading new panels');
    console.log('  Input panels:', panels);
    
    // First clear the cart completely
    setProjPanels([]);
    
    // Then load new panels with deep copies and auto-populate panel names
    const copiedPanels = panels.map(panel => {
      const copied = JSON.parse(JSON.stringify(panel));
      // Auto-populate panel name if not set
      if (!copied.panelName) {
        copied.panelName = getPanelTypeLabel(copied.type);
      }
      return copied;
    });
    console.log('  Deep copied panels with auto-populated names:', copiedPanels);
    
    // Use setTimeout to ensure the clear happens before the load
    setTimeout(() => {
      setProjPanels(copiedPanels);
    }, 0);
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
        clearSession,
        loadProjectPanels,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export { CartContext }; 