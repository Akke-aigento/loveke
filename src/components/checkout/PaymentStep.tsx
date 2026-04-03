import { useState } from 'react';
import { useCheckout } from '@/contexts/CheckoutContext';
import { ArrowLeft, CreditCard, Building2, QrCode } from 'lucide-react';

const iconMap: Record<string, React.ReactNode> = {
  redirect: <CreditCard size={20} />,
  manual: <Building2 size={20} />,
  qr: <QrCode size={20} />,
};

export default function PaymentStep() {
  const { availablePaymentMethods, completeCheckout, isLoading, selectedPaymentMethod, goBack, total, currency } = useCheckout();
  const [selected, setSelected] = useState(selectedPaymentMethod || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    await completeCheckout(selected);
  };

  const formatTotal = `€${total.toFixed(2)}`;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <button type="button" onClick={goBack} className="p-1 hover:text-primary transition-colors">
          <ArrowLeft size={20} />
        </button>
        <h2 className="font-display text-xl">Betaling</h2>
      </div>

      <div className="space-y-3">
        {availablePaymentMethods.map(method => (
          <label
            key={method.id}
            className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
              selected === method.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'
            }`}
          >
            <input type="radio" name="payment" value={method.id} checked={selected === method.id}
              onChange={() => setSelected(method.id)} className="sr-only" />
            <span className={selected === method.id ? 'text-primary' : 'text-muted-foreground'}>
              {iconMap[method.type] || <CreditCard size={20} />}
            </span>
            <div className="flex-1">
              <p className="font-semibold text-sm">{method.name}</p>
              {method.description && <p className="text-xs text-muted-foreground">{method.description}</p>}
            </div>
          </label>
        ))}
      </div>

      <button type="submit" disabled={isLoading || !selected}
        className="w-full py-3 rounded-xl font-display text-lg gradient-warm text-primary-foreground shadow-sticker hover:scale-105 transition-transform disabled:opacity-50">
        {isLoading ? 'Bestelling verwerken...' : `Bestelling plaatsen — ${formatTotal}`}
      </button>

      <p className="text-xs text-center text-muted-foreground">
        Door je bestelling te plaatsen ga je akkoord met onze algemene voorwaarden.
      </p>
    </form>
  );
}
