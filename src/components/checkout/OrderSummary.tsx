import { useState } from 'react';
import { useCheckout } from '@/contexts/CheckoutContext';
import { Input } from '@/components/ui/input';
import { Tag, ChevronDown, ChevronUp, ShoppingBag } from 'lucide-react';

export default function OrderSummary() {
  const { items, subtotal, shippingCost, discount, total, applyDiscount, removeDiscount, currentStep } = useCheckout();
  const [discountCode, setDiscountCode] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  const [discountError, setDiscountError] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const handleApply = async () => {
    if (!discountCode.trim()) return;
    setIsApplying(true);
    setDiscountError('');
    const ok = await applyDiscount(discountCode.trim());
    if (!ok) setDiscountError('Ongeldige kortingscode');
    setIsApplying(false);
  };

  return (
    <div className="bg-card border border-border rounded-xl p-5">
      {/* Mobile toggle */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full md:hidden"
      >
        <span className="font-display text-lg flex items-center gap-2">
          <ShoppingBag size={18} /> Bestelling ({items.length})
        </span>
        <div className="flex items-center gap-2">
          <span className="font-bold text-primary">€{total.toFixed(2)}</span>
          {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
      </button>

      <h3 className="font-display text-lg mb-4 hidden md:flex items-center gap-2">
        <ShoppingBag size={18} /> Bestelling
      </h3>

      {/* Items - always visible on desktop, toggled on mobile */}
      <div className={`${isExpanded ? 'block' : 'hidden'} md:block`}>
        <div className="space-y-3 mb-4">
          {items.map(item => (
            <div key={item.id} className="flex gap-3">
              <div className="w-12 h-12 rounded-md bg-muted flex items-center justify-center text-lg flex-shrink-0 overflow-hidden relative">
                {item.image ? (
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                ) : '🧡'}
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {item.quantity}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{item.title}</p>
                {item.variant_title && <p className="text-xs text-muted-foreground">{item.variant_title}</p>}
              </div>
              <span className="text-sm font-semibold whitespace-nowrap">€{((item.price ?? 0) * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>

        {/* Discount code */}
        {!discount ? (
          <div className="mb-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={discountCode}
                  onChange={e => { setDiscountCode(e.target.value); setDiscountError(''); }}
                  placeholder="Kortingscode"
                  className="pl-9 h-9 text-sm"
                  onKeyDown={e => e.key === 'Enter' && handleApply()}
                />
              </div>
              <button onClick={handleApply} disabled={isApplying || !discountCode.trim()}
                className="px-3 h-9 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50">
                {isApplying ? '...' : 'Toepassen'}
              </button>
            </div>
            {discountError && <p className="text-xs text-destructive mt-1">{discountError}</p>}
          </div>
        ) : (
          <div className="flex items-center justify-between p-2 rounded-md bg-primary/10 border border-primary/20 mb-4">
            <span className="flex items-center gap-1.5 text-sm text-primary font-medium">
              <Tag size={14} /> ✓ "{discount.code}"
            </span>
            <button onClick={removeDiscount} className="text-muted-foreground hover:text-destructive transition-colors text-lg leading-none px-1">×</button>
          </div>
        )}

        {/* Totals */}
        <div className="space-y-2 border-t border-border pt-3">
          <div className="flex justify-between text-sm">
            <span>Subtotaal</span>
            <span>€{subtotal.toFixed(2)}</span>
          </div>

          {discount && (
            <div className="flex justify-between text-sm text-primary">
              <span>Korting</span>
              <span>-€{discount.amount.toFixed(2)}</span>
            </div>
          )}

          <div className="flex justify-between text-sm">
            <span>Verzending</span>
            <span>{currentStep < 3 ? 'Wordt berekend' : shippingCost === 0 ? '🎉 Gratis!' : `€${shippingCost.toFixed(2)}`}</span>
          </div>

          <div className="flex justify-between text-base font-bold border-t border-border pt-2">
            <span>Totaal</span>
            <span className="text-primary">€{total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
