import React, { createContext, useContext, useCallback, useMemo, useState } from 'react';
import { useCartQuery, useAddToCart, useUpdateCartItem, useRemoveCartItem, useApplyDiscount, useCreateCheckout } from './hooks';
import type { Cart, CartItem } from './types';

interface CartContextType {
  cart: Cart | undefined;
  items: CartItem[];
  isLoading: boolean;
  isOpen: boolean;
  itemCount: number;
  subtotal: number;
  shipping: number;
  total: number;
  openCart: () => void;
  closeCart: () => void;
  addItem: (item: { product_id: string; variant_id: string; quantity: number; title: string; variant_title: string; price: number; image?: string }) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  applyDiscount: (code: string) => Promise<void>;
  checkout: (options?: { success_url?: string; cancel_url?: string }) => Promise<void>;
  isAddingItem: boolean;
  discountCode: string;
  setDiscountCode: (code: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | null>(null);

export function SellQoCartProvider({ children }: { children: React.ReactNode }) {
  const { data: cart, isLoading } = useCartQuery();
  const addToCartMutation = useAddToCart();
  const updateItem = useUpdateCartItem();
  const removeCartItem = useRemoveCartItem();
  const discount = useApplyDiscount();
  const createCheckout = useCreateCheckout();
  const [isOpen, setIsOpen] = useState(false);
  const [discountCode, setDiscountCode] = useState('');

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const addItem = useCallback(async (item: { product_id: string; variant_id: string; quantity: number; title: string; variant_title: string; price: number; image?: string }) => {
    try {
      await addToCartMutation.mutateAsync({
        product_id: item.product_id,
        variant_id: item.variant_id,
        quantity: item.quantity,
      });
      setIsOpen(true);
    } catch (error) {
      console.error('Add to cart failed:', error);
      const { toast } = await import('sonner');
      toast.error('Er ging iets mis bij het toevoegen aan je winkelwagen. Probeer het later opnieuw.');
    }
  }, [addToCartMutation]);

  const updateQuantity = useCallback(async (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeCartItem.mutateAsync(itemId);
    } else {
      await updateItem.mutateAsync({ itemId, quantity });
    }
  }, [updateItem, removeCartItem]);

  const removeItemFn = useCallback(async (itemId: string) => {
    await removeCartItem.mutateAsync(itemId);
  }, [removeCartItem]);

  const applyDiscountCode = useCallback(async (code: string) => {
    await discount.mutateAsync(code);
  }, [discount]);

  const doCheckout = useCallback(async (options?: { success_url?: string; cancel_url?: string }) => {
    await createCheckout.mutateAsync(options);
  }, [createCheckout]);

  const clearCart = useCallback(() => {
    // Clear localStorage cart ID
    try { localStorage.removeItem('sellqo_cart_id'); } catch { /* noop */ }
  }, []);

  const items = cart?.items || [];
  const itemCount = cart?.item_count || items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = cart?.subtotal || 0;
  const shipping = cart?.shipping || 0;
  const total = cart?.total || 0;

  const value = useMemo<CartContextType>(() => ({
    cart,
    items,
    isLoading,
    isOpen,
    itemCount,
    subtotal,
    shipping,
    total,
    openCart,
    closeCart,
    addItem,
    updateQuantity,
    removeItem: removeItemFn,
    applyDiscount: applyDiscountCode,
    checkout: doCheckout,
    isAddingItem: addToCartMutation.isPending,
    discountCode,
    setDiscountCode,
    clearCart,
  }), [cart, items, isLoading, isOpen, itemCount, subtotal, shipping, total, openCart, closeCart, addItem, updateQuantity, removeItemFn, applyDiscountCode, doCheckout, addToCartMutation.isPending, discountCode, setDiscountCode, clearCart]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useSellQoCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useSellQoCart must be used within SellQoCartProvider');
  return context;
}
