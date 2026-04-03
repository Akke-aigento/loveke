import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Minus, Plus, ShoppingBag, Tag } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSellQoCart } from '@/integrations/sellqo/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function CartDrawer() {
  const { t } = useLanguage();
  const { items, isOpen, closeCart, removeItem, updateQuantity, subtotal, shipping, total, itemCount, applyDiscount, discountCode, setDiscountCode, cart, isAddingItem } = useSellQoCart();
  const navigate = useNavigate();
  const [isApplyingDiscount, setIsApplyingDiscount] = useState(false);
  const [pendingItemIds, setPendingItemIds] = useState<Set<string>>(new Set());

  const handleUpdateQuantity = async (itemId: string, quantity: number) => {
    setPendingItemIds(prev => new Set(prev).add(itemId));
    try {
      await updateQuantity(itemId, quantity);
    } finally {
      setPendingItemIds(prev => { const next = new Set(prev); next.delete(itemId); return next; });
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    setPendingItemIds(prev => new Set(prev).add(itemId));
    try {
      await removeItem(itemId);
    } finally {
      setPendingItemIds(prev => { const next = new Set(prev); next.delete(itemId); return next; });
    }
  };

  const handleCheckout = () => {
    closeCart();
    navigate('/checkout');
  };

  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) return;
    setIsApplyingDiscount(true);
    try {
      await applyDiscount(discountCode.trim());
      toast.success('Kortingscode toegepast!');
    } catch {
      toast.error('Ongeldige kortingscode. Probeer een andere.');
    } finally {
      setIsApplyingDiscount(false);
    }
  };

  const discount = cart?.discount ?? 0;
  const activeDiscountCode = cart?.discount_code || '';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm"
          />
          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-background border-l border-border shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="font-display text-xl">{t('cart.title')} ({itemCount})</h2>
              <button onClick={closeCart} className="p-1 hover:text-primary transition-colors">
                <X size={24} />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center gap-4">
                  <ShoppingBag size={48} className="text-muted-foreground" />
                  <p className="font-handwritten text-xl text-muted-foreground">{t('cart.empty')}</p>
                </div>
              ) : (
                <div className="space-y-4">
                    {items.map(item => {
                    const isPending = pendingItemIds.has(item.id);
                    return (
                    <div key={item.id} className={`flex gap-3 p-3 rounded-lg bg-card border border-border transition-opacity ${isPending ? 'opacity-50 pointer-events-none' : ''}`}>
                      <div className="w-16 h-16 rounded-md bg-muted flex items-center justify-center text-2xl flex-shrink-0 overflow-hidden">
                        {item.image ? (
                          <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                        ) : (
                          '🧡'
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-body font-semibold text-sm truncate">{item.title}</p>
                        <p className="text-xs text-muted-foreground">{item.variant_title}</p>
                        {(item as any).gift_card_metadata?.recipient_name && (
                          <p className="text-xs text-muted-foreground">🎁 Voor: {(item as any).gift_card_metadata.recipient_name} ({(item as any).gift_card_metadata.recipient_email})</p>
                        )}
                        <p className="text-sm font-bold text-primary mt-1">€{(item.price ?? 0).toFixed(2)}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                            disabled={isPending}
                            className="w-6 h-6 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-50"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                          <button
                            onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                            disabled={isPending}
                            className="w-6 h-6 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-50"
                          >
                            <Plus size={12} />
                          </button>
                          <button
                            onClick={() => handleRemoveItem(item.id)}
                            disabled={isPending}
                            className="ml-auto text-xs text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
                          >
                            {isPending ? '...' : t('cart.remove')}
                          </button>
                        </div>
                      </div>
                    </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-border p-4 space-y-3">
                {/* Discount code input or active badge */}
                {activeDiscountCode ? (
                  <div className="flex items-center justify-between p-2 rounded-md bg-primary/10 border border-primary/20">
                    <span className="flex items-center gap-1.5 text-sm text-primary font-medium">
                      <Tag size={14} /> ✓ "{activeDiscountCode}" toegepast
                    </span>
                    <button
                      onClick={async () => { setIsApplyingDiscount(true); try { await applyDiscount(''); setDiscountCode(''); } catch { /* noop */ } finally { setIsApplyingDiscount(false); } }}
                      disabled={isApplyingDiscount}
                      className="text-muted-foreground hover:text-destructive transition-colors text-lg leading-none px-1 disabled:opacity-50"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        value={discountCode}
                        onChange={e => setDiscountCode(e.target.value)}
                        placeholder="Kortingscode"
                        className="pl-9 h-9 text-sm"
                        onKeyDown={e => e.key === 'Enter' && handleApplyDiscount()}
                      />
                    </div>
                    <button
                      onClick={handleApplyDiscount}
                      disabled={isApplyingDiscount || !discountCode.trim()}
                      className="px-4 h-9 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
                    >
                      {isApplyingDiscount ? '...' : 'Toepassen'}
                    </button>
                  </div>
                )}

                {/* Applied discount line */}
                {discount > 0 && (
                  <div className="flex justify-between text-sm text-primary">
                    <span className="flex items-center gap-1">
                      <Tag size={14} /> Korting {activeDiscountCode && `(${activeDiscountCode})`}
                    </span>
                    <span className="font-semibold">-€{discount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between text-sm">
                  <span>{t('cart.subtotal')}</span>
                  <span className="font-semibold">€{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>{t('cart.shipping')}</span>
                  <span className="font-semibold">{shipping === 0 ? '🎉 Gratis!' : `€${shipping.toFixed(2)}`}</span>
                </div>
                {subtotal < 50 && (
                  <p className="text-xs text-muted-foreground">{t('cart.freeShipping')}</p>
                )}
                <div className="flex justify-between text-lg font-bold border-t border-border pt-3">
                  <span>{t('cart.total')}</span>
                  <span className="text-primary">€{total.toFixed(2)}</span>
                </div>
                <button
                  onClick={handleCheckout}
                  disabled={createCheckout.isPending}
                  className="w-full py-3 rounded-xl font-display text-lg gradient-warm text-primary-foreground shadow-sticker hover:scale-105 transition-transform disabled:opacity-50"
                >
                  {createCheckout.isPending ? '...' : `${t('cart.checkout')} →`}
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
