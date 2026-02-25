import { X, Minus, Plus, ShoppingBag } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSellQoCart } from '@/integrations/sellqo/CartContext';
import { useCreateCheckout } from '@/integrations/sellqo/hooks';
import { motion, AnimatePresence } from 'framer-motion';

export default function CartDrawer() {
  const { t } = useLanguage();
  const { items, isOpen, closeCart, removeItem, updateQuantity, subtotal, shipping, total, itemCount } = useSellQoCart();
  const createCheckout = useCreateCheckout();

  const handleCheckout = () => {
    createCheckout.mutate({
      success_url: window.location.origin + '/bedankt',
      cancel_url: window.location.origin + '/shop',
    });
  };

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
                  {items.map(item => (
                    <div key={item.id} className="flex gap-3 p-3 rounded-lg bg-card border border-border">
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
                        <p className="text-sm font-bold text-primary mt-1">€{item.price.toFixed(2)}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-6 h-6 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-6 h-6 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors"
                          >
                            <Plus size={12} />
                          </button>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="ml-auto text-xs text-muted-foreground hover:text-destructive transition-colors"
                          >
                            {t('cart.remove')}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-border p-4 space-y-3">
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
