import { useState } from 'react';
import { useCheckout } from '@/contexts/CheckoutContext';
import { ArrowLeft, Truck } from 'lucide-react';

export default function ShippingStep() {
  const { availableShippingMethods, selectShipping, isLoading, selectedShippingMethod, goBack } = useCheckout();
  const [selected, setSelected] = useState(selectedShippingMethod || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    await selectShipping(selected);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <button type="button" onClick={goBack} className="p-1 hover:text-primary transition-colors">
          <ArrowLeft size={20} />
        </button>
        <h2 className="font-display text-xl">Verzendmethode</h2>
      </div>

      <div className="space-y-3">
        {availableShippingMethods.map(method => (
          <label
            key={method.id}
            className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
              selected === method.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'
            }`}
          >
            <input
              type="radio"
              name="shipping"
              value={method.id}
              checked={selected === method.id}
              onChange={() => setSelected(method.id)}
              className="sr-only"
            />
            <Truck size={20} className={selected === method.id ? 'text-primary' : 'text-muted-foreground'} />
            <div className="flex-1">
              <p className="font-semibold text-sm">{method.name}</p>
              {method.description && <p className="text-xs text-muted-foreground">{method.description}</p>}
              {method.estimated_delivery && <p className="text-xs text-muted-foreground mt-0.5">{method.estimated_delivery}</p>}
            </div>
            <span className="font-bold text-sm">
              {method.price === 0 ? <span className="text-primary">Gratis</span> : `€${method.price.toFixed(2)}`}
            </span>
          </label>
        ))}
      </div>

      <button type="submit" disabled={isLoading || !selected}
        className="w-full py-3 rounded-xl font-display text-lg gradient-warm text-primary-foreground shadow-sticker hover:scale-105 transition-transform disabled:opacity-50">
        {isLoading ? 'Even geduld...' : 'Verder →'}
      </button>
    </form>
  );
}
