import React, { createContext, useState, useContext, useEffect, ReactNode } from "react";

interface CartItem {
  type: string;
  icons: Array<{
    iconId: string | null;
    label: string;
    position: number;
    text: string;
  }>;
  quantity: number;
}

export interface CartContextType {
  cartItems: CartItem[];
  cartCount: number;
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
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartCount, setCartCount] = useState<number>(0);
  const [isCounting, setIsCounting] = useState<boolean>(false);

  const addToCart = (item: CartItem): void => {
    // Always treat each item as unique – no merging
    setCartItems((prev) => [...prev, item]);
    setCartCount((prev) => prev + (item.quantity || 1));
    setIsCounting(true);
  };

  const updateQuantity = (index: number, newQty: number): void => {
    const updated = [...cartItems];
    if (newQty <= 0) {
      updated.splice(index, 1);
    } else {
      updated[index].quantity = newQty;
    }
    setCartItems(updated);
    setCartCount(updated.reduce((sum, item) => sum + item.quantity, 0));
  };

  const removeFromCart = (index: number): void => {
    const removedItem = cartItems[index];
    const updated = [...cartItems];
    updated.splice(index, 1);
    setCartItems(updated);
    setCartCount((prev) => prev - (removedItem?.quantity || 1));
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
        cartItems,
        cartCount,
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