import { useState, useEffect, useMemo } from 'react';
import { useCheckout } from '@/contexts/CheckoutContext';
import { ArrowLeft, CreditCard, Building2, QrCode } from 'lucide-react';

const iconMap: Record<string, React.ReactNode> = {
  redirect: <CreditCard size={20} />,
  manual: <QrCode size={20} />,
  qr: <QrCode size={20} />,
};

const SORT_ORDER: Record<string, number> = { qr: 0, manual: 1, redirect: 2 };

export default function PaymentStep() {
  const { availablePaymentMethods, completeCheckout, isLoading, selectedPaymentMethod, goBack, total } = useCheckout();
  const [selected, setSelected] = useState(selectedPaymentMethod || '');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => {
      const touch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const small = window.innerWidth < 1024;
      setIsMobile(touch || small);
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const visibleMethods = useMemo(() =>
    availablePaymentMethods
      .filter(m => !((m.type === 'qr' || m.type === 'manual') && isMobile))
      .sort((a, b) => (SORT_ORDER[a.type] ?? 99) - (SORT_ORDER[b.type] ?? 99)),
    [availablePaymentMethods, isMobile]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    await completeCheckout(selected);
  };

  const displayTotal = Number(total) || 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <button type="button" onClick={goBack} className="p-1 hover:text-primary transition-colors">
          <ArrowLeft size={20} />
        </button>
        <h2 className="font-display text-xl">Betaling</h2>
      </div>

      <div className="space-y-3">
        {visibleMethods.map(method => {
          const isQR = method.type === 'qr' || method.type === 'manual';
          const isStripe = method.type === 'redirect';
          const name = isQR ? 'Scan QR code met je bankapp' : method.name;
          const description = isQR ? 'Gratis — scan de code en betaal direct' : method.description;

          return (
            <label
              key={method.id}
              className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                selected === method.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'
              }`}
            >
              <input type="radio" name="payment" value={method.id} checked={selected === method.id}
                onChange={() => setSelected(method.id)} className="sr-only" />
              <span className={`mt-0.5 ${selected === method.id ? 'text-primary' : 'text-muted-foreground'}`}>
                {iconMap[method.type] || <CreditCard size={20} />}
              </span>
              <div className="flex-1">
                <p className="font-semibold text-sm">{name}</p>
                {description && <p className="text-xs text-muted-foreground">{description}</p>}
                {isQR && (
                  <span className="inline-block mt-1 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full font-medium">
                    Geen transactiekosten
                  </span>
                )}
                {isStripe && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {['iDEAL', 'Bancontact', 'Creditcard', 'Apple Pay'].map(label => (
                      <span key={label} className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{label}</span>
                    ))}
                  </div>
                )}
              </div>
            </label>
          );
        })}
      </div>

      <button type="submit" disabled={isLoading || !selected}
        className="w-full py-3 rounded-xl font-display text-lg gradient-warm text-primary-foreground shadow-sticker hover:scale-105 transition-transform disabled:opacity-50">
        {isLoading ? 'Bestelling verwerken...' : `Bestelling plaatsen — €${displayTotal.toFixed(2)}`}
      </button>

      <p className="text-xs text-center text-muted-foreground">
        Door je bestelling te plaatsen ga je akkoord met onze algemene voorwaarden.
      </p>
    </form>
  );
}
