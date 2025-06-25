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
  addToCart: (item: CartItem) => void;
  updateQuantity: (index: number, newQty: number) => void;
  removeFromCart: (index: number) => void;
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
  const [projPanels, setProjPanels] = useState<CartItem[]>([]);
  const [projCount, setProjCount] = useState<number>(0);
  const [isCounting, setIsCounting] = useState<boolean>(false);

  const addToCart = (item: CartItem): void => {
    // Always treat each item as unique – no merging
    setProjPanels((prev) => [...prev, item]);
    setProjCount((prev) => prev + (item.quantity || 1));
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
    setProjCount(updated.reduce((sum, item) => sum + item.quantity, 0));
  };

  const removeFromCart = (index: number): void => {
    const removedItem = projPanels[index];
    const updated = [...projPanels];
    updated.splice(index, 1);
    setProjPanels(updated);
    setProjCount((prev) => prev - (removedItem?.quantity || 1));
  };

  useEffect(() => {
    if (isCounting) {
      const timer = setTimeout(() => setIsCounting(false), 500);
      return () => clearTimeout(timer);
    }
  }, [isCounting]);

  return (
    <CartContext.Provider
      value={{
        projPanels,
        projCount,
        isCounting,
        addToCart,
        updateQuantity,
        removeFromCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export { CartContext }; 