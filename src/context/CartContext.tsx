import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product } from '../data/products';

interface CartItem {
  product: Product;
  quantity: number;
  weight: string;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity: number, weight: string) => void;
  removeFromCart: (productId: string, weight: string) => void;
  updateQuantity: (productId: string, weight: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  const addToCart = (product: Product, quantity: number, weight: string) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id && i.weight === weight);
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id && i.weight === weight
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      }
      return [...prev, { product, quantity, weight }];
    });
  };

  const removeFromCart = (productId: string, weight: string) => {
    setItems((prev) => prev.filter((i) => !(i.product.id === productId && i.weight === weight)));
  };

  const updateQuantity = (productId: string, weight: string, quantity: number) => {
    if (quantity < 1) return;
    setItems((prev) =>
      prev.map((i) =>
        i.product.id === productId && i.weight === weight ? { ...i, quantity } : i
      )
    );
  };

  const clearCart = () => setItems([]);

  const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, total }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
