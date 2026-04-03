import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCheckout } from '@/contexts/CheckoutContext';
import type { CheckoutCustomer } from '@/integrations/sellqo/checkoutTypes';

export default function CustomerStep() {
  const { saveCustomer, isLoading, fieldErrors, customer } = useCheckout();
  const [form, setForm] = useState<CheckoutCustomer>({
    email: customer?.email || '',
    first_name: customer?.first_name || '',
    last_name: customer?.last_name || '',
    phone: customer?.phone || '',
  });

  const update = (key: keyof CheckoutCustomer, value: string) =>
    setForm(f => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveCustomer(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="font-display text-xl mb-2">Jouw gegevens</h2>

      <div>
        <Label htmlFor="email">E-mailadres *</Label>
        <Input
          id="email"
          type="email"
          required
          value={form.email}
          onChange={e => update('email', e.target.value)}
          placeholder="jouw@email.be"
          className={fieldErrors.email ? 'border-destructive' : ''}
        />
        {fieldErrors.email && <p className="text-xs text-destructive mt-1">{fieldErrors.email}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="first_name">Voornaam *</Label>
          <Input
            id="first_name"
            required
            value={form.first_name}
            onChange={e => update('first_name', e.target.value)}
            placeholder="Jan"
            className={fieldErrors.first_name ? 'border-destructive' : ''}
          />
          {fieldErrors.first_name && <p className="text-xs text-destructive mt-1">{fieldErrors.first_name}</p>}
        </div>
        <div>
          <Label htmlFor="last_name">Achternaam *</Label>
          <Input
            id="last_name"
            required
            value={form.last_name}
            onChange={e => update('last_name', e.target.value)}
            placeholder="Janssen"
            className={fieldErrors.last_name ? 'border-destructive' : ''}
          />
          {fieldErrors.last_name && <p className="text-xs text-destructive mt-1">{fieldErrors.last_name}</p>}
        </div>
      </div>

      <div>
        <Label htmlFor="phone">Telefoonnummer (optioneel)</Label>
        <Input
          id="phone"
          type="tel"
          value={form.phone || ''}
          onChange={e => update('phone', e.target.value)}
          placeholder="+32 4XX XX XX XX"
          className={fieldErrors.phone ? 'border-destructive' : ''}
        />
        {fieldErrors.phone && <p className="text-xs text-destructive mt-1">{fieldErrors.phone}</p>}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3 rounded-xl font-display text-lg gradient-warm text-primary-foreground shadow-sticker hover:scale-105 transition-transform disabled:opacity-50"
      >
        {isLoading ? 'Even geduld...' : 'Verder →'}
      </button>
    </form>
  );
}
