import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import type { CartItem } from '@/lib/sellqo';

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  discountCode: string;
}

interface CartContextType {
  items: CartItem[];
  isOpen: boolean;
  discountCode: string;
  itemCount: number;
  subtotal: number;
  shipping: number;
  total: number;
  openCart: () => void;
  closeCart: () => void;
  addItem: (item: CartItem) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  setDiscountCode: (code: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<CartState>({
    items: [],
    isOpen: false,
    discountCode: '',
  });

  const openCart = useCallback(() => setState(s => ({ ...s, isOpen: true })), []);
  const closeCart = useCallback(() => setState(s => ({ ...s, isOpen: false })), []);

  const addItem = useCallback((item: CartItem) => {
    setState(s => {
      const existing = s.items.find(i => i.variant_id === item.variant_id);
      if (existing) {
        return {
          ...s,
          isOpen: true,
          items: s.items.map(i =>
            i.variant_id === item.variant_id
              ? { ...i, quantity: i.quantity + item.quantity }
              : i
          ),
        };
      }
      return { ...s, isOpen: true, items: [...s.items, item] };
    });
  }, []);

  const removeItem = useCallback((itemId: string) => {
    setState(s => ({ ...s, items: s.items.filter(i => i.id !== itemId) }));
  }, []);

  const updateQuantity = useCallback((itemId: string, quantity: number) => {
    if (quantity <= 0) {
      setState(s => ({ ...s, items: s.items.filter(i => i.id !== itemId) }));
    } else {
      setState(s => ({
        ...s,
        items: s.items.map(i => (i.id === itemId ? { ...i, quantity } : i)),
      }));
    }
  }, []);

  const setDiscountCode = useCallback((code: string) => {
    setState(s => ({ ...s, discountCode: code }));
  }, []);

  const clearCart = useCallback(() => {
    setState({ items: [], isOpen: false, discountCode: '' });
  }, []);

  const itemCount = useMemo(() => state.items.reduce((sum, i) => sum + i.quantity, 0), [state.items]);
  const subtotal = useMemo(() => state.items.reduce((sum, i) => sum + i.price * i.quantity, 0), [state.items]);
  const shipping = subtotal >= 50 ? 0 : 4.95;
  const total = subtotal + shipping;

  const value = useMemo(() => ({
    items: state.items,
    isOpen: state.isOpen,
    discountCode: state.discountCode,
    itemCount,
    subtotal,
    shipping,
    total,
    openCart,
    closeCart,
    addItem,
    removeItem,
    updateQuantity,
    setDiscountCode,
    clearCart,
  }), [state, itemCount, subtotal, shipping, total, openCart, closeCart, addItem, removeItem, updateQuantity, setDiscountCode, clearCart]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
