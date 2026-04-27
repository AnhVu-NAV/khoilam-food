import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product } from '../data/products';

interface CartItem {
    product: any;
    quantity: number;
    weight: string;
    price: number;
    isCombo?: boolean;
    comboId?: string;
}

interface CartContextType {
    items: CartItem[];
    addToCart: (product: any, quantity: number, weight: string, price: number, isCombo?: boolean, comboId?: string) => void;
    removeFromCart: (productId: string, weight: string) => void;
    updateQuantity: (productId: string, weight: string, quantity: number) => void;
    clearCart: () => void;
    total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CartItem[]>(() => {
        if (typeof window === 'undefined') return [];

        try {
            const saved = localStorage.getItem('cart');
            if (!saved) return [];

            const parsed = JSON.parse(saved);
            return Array.isArray(parsed) ? parsed : [];
        } catch (error) {
            console.error('Lỗi đọc giỏ hàng từ localStorage:', error);
            return [];
        }
    });

    useEffect(() => {
        if (typeof window === 'undefined') return;
        localStorage.setItem('cart', JSON.stringify(items));
    }, [items]);

    const addToCart = (product: any, quantity: number, weight: string, price: number, isCombo?: boolean, comboId?: string) => {
        const normalizedQuantity = Math.max(1, Number(quantity) || 1);
        const normalizedPrice = Math.max(0, Number(price) || 0);

        setItems((prev) => {
            const existing = prev.find(
                (item) => item.product.id === product.id && item.weight === weight && item.isCombo === isCombo
            );

            if (existing) {
                return prev.map((item) =>
                    item.product.id === product.id && item.weight === weight && item.isCombo === isCombo
                        ? {
                            ...item,
                            quantity: item.quantity + normalizedQuantity,
                            price: normalizedPrice,
                        }
                        : item
                );
            }

            return [
                ...prev,
                {
                    product,
                    quantity: normalizedQuantity,
                    weight,
                    price: normalizedPrice,
                    isCombo,
                    comboId,
                },
            ];
        });
    };

    const removeFromCart = (productId: string, weight: string) => {
        setItems((prev) =>
            prev.filter((item) => !(item.product.id === productId && item.weight === weight))
        );
    };

    const updateQuantity = (productId: string, weight: string, quantity: number) => {
        const normalizedQuantity = Number(quantity);

        if (!Number.isFinite(normalizedQuantity) || normalizedQuantity < 1) return;

        setItems((prev) =>
            prev.map((item) =>
                item.product.id === productId && item.weight === weight
                    ? { ...item, quantity: normalizedQuantity }
                    : item
            )
        );
    };

    const clearCart = () => setItems([]);

    const total = items.reduce((sum, item) => {
        return sum + item.price * item.quantity;
    }, 0);

    return (
        <CartContext.Provider
            value={{
                items,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                total,
            }}
        >
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