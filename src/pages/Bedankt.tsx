import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, ShoppingBag, Building2, QrCode } from 'lucide-react';
import { sellqoFetch, extractSingle } from '@/integrations/sellqo/client';
import { checkoutFlowAPI } from '@/integrations/sellqo/checkoutApi';
import { normalizeCart } from '@/integrations/sellqo/normalizer';
import { Skeleton } from '@/components/ui/skeleton';
import type { Cart } from '@/integrations/sellqo/types';
import type { BankDetails, QRData } from '@/integrations/sellqo/checkoutTypes';

// Floating heart animation component
function FloatingHearts() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 12 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-primary/30"
          initial={{
            x: `${10 + Math.random() * 80}%`,
            y: '110%',
            scale: 0.5 + Math.random() * 1,
            rotate: -20 + Math.random() * 40,
          }}
          animate={{
            y: '-10%',
            opacity: [0, 1, 1, 0],
          }}
          transition={{
            duration: 4 + Math.random() * 3,
            delay: Math.random() * 3,
            repeat: Infinity,
            repeatDelay: Math.random() * 5,
            ease: 'easeOut',
          }}
        >
          <Heart size={16 + Math.random() * 24} fill="currentColor" />
        </motion.div>
      ))}
    </div>
  );
}

function OrderSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2].map(i => (
        <div key={i} className="flex gap-3 p-3 rounded-lg bg-card border border-border">
          <Skeleton className="w-16 h-16 rounded-md flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-4 w-1/4" />
          </div>
        </div>
      ))}
      <div className="space-y-2 pt-3 border-t border-border">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-6 w-full" />
      </div>
    </div>
  );
}

// Bank transfer details component
function BankTransferInfo({ bankDetails, orderNumber, total, currency }: { bankDetails: BankDetails; orderNumber: string; total: number; currency: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8 }}
      className="bg-card border border-border rounded-xl p-6 shadow-card"
    >
      <h2 className="font-display text-lg mb-4 flex items-center gap-2">
        <Building2 size={18} /> Betaling via overschrijving
      </h2>
      <p className="text-sm text-muted-foreground mb-4">
        Maak het bedrag over naar onderstaand rekeningnummer. Je bestelling wordt verwerkt zodra we de betaling ontvangen.
      </p>
      <div className="space-y-3 bg-background rounded-lg p-4 border border-border">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">IBAN</span>
          <span className="font-mono font-semibold">{bankDetails.iban}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Rekeninghouder</span>
          <span className="font-semibold">{bankDetails.account_holder}</span>
        </div>
        {bankDetails.bank_name && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Bank</span>
            <span className="font-semibold">{bankDetails.bank_name}</span>
          </div>
        )}
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Mededeling</span>
          <span className="font-mono font-semibold text-primary">{bankDetails.reference || orderNumber}</span>
        </div>
        <div className="flex justify-between text-sm border-t border-border pt-2">
          <span className="text-muted-foreground">Bedrag</span>
          <span className="font-bold text-primary text-base">€{total.toFixed(2)}</span>
        </div>
      </div>
    </motion.div>
  );
}

// QR payment component
function QRPaymentInfo({ qrData, orderNumber, total }: { qrData: QRData; orderNumber: string; total: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8 }}
      className="bg-card border border-border rounded-xl p-6 shadow-card text-center"
    >
      <h2 className="font-display text-lg mb-4 flex items-center justify-center gap-2">
        <QrCode size={18} /> Scan om te betalen
      </h2>
      {qrData.image_url && (
        <img src={qrData.image_url} alt="QR Code" className="w-48 h-48 mx-auto mb-4 rounded-lg" />
      )}
      <p className="text-sm text-muted-foreground mb-2">Scan de QR code met je bank-app</p>
      <p className="font-bold text-primary text-lg">€{total.toFixed(2)}</p>
      <p className="text-xs text-muted-foreground mt-1">Bestelling: {orderNumber}</p>
    </motion.div>
  );
}

export default function Bedankt() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const cartId = searchParams.get('cart_id');
  const sessionId = searchParams.get('session_id');
  const [order, setOrder] = useState<Cart | null>(null);
  const [stripeOrder, setStripeOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(!!cartId || !!sessionId);
  const [showGenericThankYou, setShowGenericThankYou] = useState(false);

  // Data from navigation state (bank transfer / QR)
  const navState = (location.state || {}) as {
    orderNumber?: string;
    total?: number;
    currency?: string;
    bankDetails?: BankDetails;
    qrData?: QRData;
    paymentType?: 'manual' | 'qr';
  };

  // Poll for Stripe order after redirect
  const pollForOrder = useCallback(async (sid: string, attempts = 0) => {
    try {
      const result = await checkoutFlowAPI.getOrderBySession(sid);
      if (result?.success && result.data) {
        setStripeOrder(result.data);
        try { localStorage.removeItem('sellqo_cart_id'); } catch { /* noop */ }
        setIsLoading(false);
        return;
      }
    } catch { /* webhook may still be processing */ }

    if (attempts < 5) {
      setTimeout(() => pollForOrder(sid, attempts + 1), 2000);
    } else {
      setShowGenericThankYou(true);
      try { localStorage.removeItem('sellqo_cart_id'); } catch { /* noop */ }
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Stripe redirect: poll for order via session_id
    if (sessionId) {
      pollForOrder(sessionId);
      return;
    }

    // Legacy: fetch cart by cart_id query param
    if (cartId) {
      try { localStorage.removeItem('sellqo_cart_id'); } catch { /* noop */ }
      sellqoFetch(`/cart/${cartId}`)
        .then(raw => {
          const cart = extractSingle<Cart>(raw) || (raw as Cart);
          setOrder(normalizeCart(cart));
        })
        .catch(err => {
          console.error('Failed to fetch order:', err);
        })
        .finally(() => setIsLoading(false));
      return;
    }

    // Manual/QR: cart already cleared by CheckoutContext
    // No-op, just show nav state data
    setIsLoading(false);
  }, [cartId, sessionId, pollForOrder]);

  const heroMessage = navState.paymentType === 'manual'
    ? 'Bedankt voor je bestelling! 🧡'
    : navState.paymentType === 'qr'
      ? 'Scan en betaal! 🧡'
      : 'Bedankt voor je bestelling! 🧡';

  const heroSubtext = navState.paymentType === 'manual'
    ? 'Maak de betaling over en we sturen je bestelling zo snel mogelijk op.'
    : sessionId
      ? 'Je betaling is ontvangen! We sturen je bestelling zo snel mogelijk op.'
      : 'Je ontvangt een bevestigingsmail. We sturen je bestelling zo snel mogelijk op.';

  return (
    <main className="min-h-screen bg-background">
      {/* Success Hero */}
      <section className="relative py-20 md:py-28 text-center overflow-hidden">
        <FloatingHearts />
        <div className="relative z-10 max-w-2xl mx-auto px-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', damping: 12, stiffness: 150, delay: 0.2 }}
            className="w-20 h-20 mx-auto mb-6 rounded-full gradient-warm flex items-center justify-center shadow-sticker"
          >
            <Heart size={36} className="text-primary-foreground" fill="currentColor" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="font-display text-3xl md:text-5xl text-foreground mb-4"
          >
            {heroMessage}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="font-body text-lg text-muted-foreground max-w-md mx-auto"
          >
            {heroSubtext}
          </motion.p>
        </div>
      </section>

      {/* Content based on payment type */}
      <section className="max-w-lg mx-auto px-4 pb-16">
        {/* Bank transfer details */}
        {navState.paymentType === 'manual' && navState.bankDetails && (
          <BankTransferInfo
            bankDetails={navState.bankDetails}
            orderNumber={navState.orderNumber || ''}
            total={navState.total || 0}
            currency={navState.currency || 'EUR'}
          />
        )}

        {/* QR payment */}
        {navState.paymentType === 'qr' && navState.qrData && (
          <QRPaymentInfo
            qrData={navState.qrData}
            orderNumber={navState.orderNumber || ''}
            total={navState.total || 0}
          />
        )}

        {/* Stripe order details (after polling) */}
        {stripeOrder && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-card border border-border rounded-xl p-6 shadow-card"
          >
            <h2 className="font-display text-lg mb-4 flex items-center gap-2">
              <ShoppingBag size={18} /> Bestellingsoverzicht
            </h2>
            {stripeOrder.order_number && (
              <p className="text-sm text-muted-foreground mb-3">Bestelnummer: <span className="font-semibold text-foreground">{stripeOrder.order_number}</span></p>
            )}
            {stripeOrder.total != null && (
              <div className="flex justify-between text-lg font-bold border-t border-border pt-3">
                <span>Totaal</span>
                <span className="text-primary">€{Number(stripeOrder.total).toFixed(2)}</span>
              </div>
            )}
          </motion.div>
        )}

        {/* Generic thank you (polling timed out) */}
        {showGenericThankYou && !stripeOrder && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-card border border-border rounded-xl p-6 shadow-card text-center"
          >
            <p className="text-sm text-muted-foreground">
              Je betaling wordt verwerkt. Je ontvangt een bevestigingsmail zodra alles in orde is.
            </p>
          </motion.div>
        )}

        {/* Order Summary from cart_id (legacy) */}
        {isLoading ? (
          <div className="bg-card border border-border rounded-xl p-6 shadow-card">
            <h2 className="font-display text-lg mb-4">Bestellingsoverzicht</h2>
            <OrderSkeleton />
          </div>
        ) : order && order.items?.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-card border border-border rounded-xl p-6 shadow-card"
          >
            <h2 className="font-display text-lg mb-4 flex items-center gap-2">
              <ShoppingBag size={18} /> Bestellingsoverzicht
            </h2>

            <div className="space-y-3 mb-4">
              {order.items.map(item => (
                <div key={item.id} className="flex gap-3 p-3 rounded-lg bg-background border border-border">
                  <div className="w-16 h-16 rounded-md bg-muted flex items-center justify-center text-2xl flex-shrink-0 overflow-hidden">
                    {item.image ? (
                      <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                    ) : '🧡'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-body font-semibold text-sm truncate">{item.title}</p>
                    {item.variant_title && <p className="text-xs text-muted-foreground">{item.variant_title}</p>}
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-muted-foreground">{item.quantity}×</span>
                      <span className="text-sm font-bold text-primary">€{((item.price ?? 0) * item.quantity).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-2 border-t border-border pt-3">
              <div className="flex justify-between text-sm">
                <span>Subtotaal</span>
                <span className="font-semibold">€{(order.subtotal ?? 0).toFixed(2)}</span>
              </div>
              {(order.discount ?? 0) > 0 && (
                <div className="flex justify-between text-sm text-primary">
                  <span>Korting {order.discount_code && `(${order.discount_code})`}</span>
                  <span className="font-semibold">-€{(order.discount ?? 0).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span>Verzending</span>
                <span className="font-semibold">
                  {(order.shipping ?? 0) === 0 ? '🎉 Gratis!' : `€${(order.shipping ?? 0).toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t border-border pt-3">
                <span>Totaal</span>
                <span className="text-primary">€{(order.total ?? 0).toFixed(2)}</span>
              </div>
            </div>
          </motion.div>
        ) : null}

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-8 text-center"
        >
          <Link
            to="/shop"
            className="inline-block px-8 py-3 rounded-xl font-display text-lg gradient-warm text-primary-foreground shadow-sticker hover:scale-105 transition-transform"
          >
            Verder shoppen →
          </Link>
        </motion.div>
      </section>
    </main>
  );
}
