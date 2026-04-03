import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCheckout } from '@/contexts/CheckoutContext';
import type { CheckoutCustomer, CheckoutAddress } from '@/integrations/sellqo/checkoutTypes';

const emptyAddress: CheckoutAddress = { street: '', city: '', postal_code: '', country: 'BE', company: '' };

export default function CustomerAddressStep() {
  const {
    saveCustomerAndAddress, isLoading, fieldErrors,
    customer, shippingAddress, billingAddress, billingSameAsShipping,
  } = useCheckout();

  const [form, setForm] = useState<CheckoutCustomer>({
    email: customer?.email || '',
    first_name: customer?.first_name || '',
    last_name: customer?.last_name || '',
    phone: customer?.phone || '',
  });

  const [shipping, setShipping] = useState<CheckoutAddress>(shippingAddress || { ...emptyAddress });
  const [billingSame, setBillingSame] = useState(billingSameAsShipping);
  const [billing, setBilling] = useState<CheckoutAddress>(billingAddress || { ...emptyAddress });

  const updateCustomer = (key: keyof CheckoutCustomer, value: string) =>
    setForm(f => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveCustomerAndAddress(form, shipping, billingSame, billingSame ? null : billing);
  };

  const AddressFields = ({ prefix, addr, setAddr }: { prefix: string; addr: CheckoutAddress; setAddr: (a: CheckoutAddress) => void }) => (
    <div className="space-y-3">
      <div>
        <Label htmlFor={`${prefix}_company`}>Bedrijf (optioneel)</Label>
        <Input id={`${prefix}_company`} value={addr.company || ''} onChange={e => setAddr({ ...addr, company: e.target.value })} placeholder="Bedrijfsnaam" />
      </div>
      <div>
        <Label htmlFor={`${prefix}_street`}>Straat + huisnummer *</Label>
        <Input id={`${prefix}_street`} required value={addr.street} onChange={e => setAddr({ ...addr, street: e.target.value })} placeholder="Kerkstraat 1"
          className={fieldErrors[`${prefix}_street`] || fieldErrors.street ? 'border-destructive' : ''} />
        {(fieldErrors[`${prefix}_street`] || fieldErrors.street) && <p className="text-xs text-destructive mt-1">{fieldErrors[`${prefix}_street`] || fieldErrors.street}</p>}
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <Label htmlFor={`${prefix}_postal`}>Postcode *</Label>
          <Input id={`${prefix}_postal`} required value={addr.postal_code} onChange={e => setAddr({ ...addr, postal_code: e.target.value })} placeholder="1000"
            className={fieldErrors[`${prefix}_postal_code`] || fieldErrors.postal_code ? 'border-destructive' : ''} />
        </div>
        <div className="col-span-2">
          <Label htmlFor={`${prefix}_city`}>Gemeente *</Label>
          <Input id={`${prefix}_city`} required value={addr.city} onChange={e => setAddr({ ...addr, city: e.target.value })} placeholder="Brussel"
            className={fieldErrors[`${prefix}_city`] || fieldErrors.city ? 'border-destructive' : ''} />
        </div>
      </div>
      <div>
        <Label htmlFor={`${prefix}_country`}>Land *</Label>
        <select
          id={`${prefix}_country`}
          value={addr.country}
          onChange={e => setAddr({ ...addr, country: e.target.value })}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="BE">België</option>
          <option value="NL">Nederland</option>
          <option value="LU">Luxemburg</option>
          <option value="DE">Duitsland</option>
          <option value="FR">Frankrijk</option>
        </select>
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Customer details */}
      <h2 className="font-display text-xl">Jouw gegevens</h2>

      <div>
        <Label htmlFor="email">E-mailadres *</Label>
        <Input id="email" type="email" required value={form.email}
          onChange={e => updateCustomer('email', e.target.value)} placeholder="jouw@email.be"
          className={fieldErrors.email ? 'border-destructive' : ''} />
        {fieldErrors.email && <p className="text-xs text-destructive mt-1">{fieldErrors.email}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="first_name">Voornaam *</Label>
          <Input id="first_name" required value={form.first_name}
            onChange={e => updateCustomer('first_name', e.target.value)} placeholder="Jan"
            className={fieldErrors.first_name ? 'border-destructive' : ''} />
          {fieldErrors.first_name && <p className="text-xs text-destructive mt-1">{fieldErrors.first_name}</p>}
        </div>
        <div>
          <Label htmlFor="last_name">Achternaam *</Label>
          <Input id="last_name" required value={form.last_name}
            onChange={e => updateCustomer('last_name', e.target.value)} placeholder="Janssen"
            className={fieldErrors.last_name ? 'border-destructive' : ''} />
          {fieldErrors.last_name && <p className="text-xs text-destructive mt-1">{fieldErrors.last_name}</p>}
        </div>
      </div>

      <div>
        <Label htmlFor="phone">Telefoonnummer (optioneel)</Label>
        <Input id="phone" type="tel" value={form.phone || ''}
          onChange={e => updateCustomer('phone', e.target.value)} placeholder="+32 4XX XX XX XX"
          className={fieldErrors.phone ? 'border-destructive' : ''} />
        {fieldErrors.phone && <p className="text-xs text-destructive mt-1">{fieldErrors.phone}</p>}
      </div>

      {/* Shipping address */}
      <h2 className="font-display text-xl pt-4 border-t border-border">Bezorgadres</h2>
      <AddressFields prefix="shipping" addr={shipping} setAddr={setShipping} />

      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" checked={billingSame} onChange={e => setBillingSame(e.target.checked)}
          className="w-4 h-4 rounded border-border text-primary focus:ring-primary" />
        <span className="text-sm">Factuuradres is hetzelfde als bezorgadres</span>
      </label>

      {!billingSame && (
        <div className="pt-2 border-t border-border">
          <h3 className="font-display text-lg mb-3">Factuuradres</h3>
          <AddressFields prefix="billing" addr={billing} setAddr={setBilling} />
        </div>
      )}

      <button type="submit" disabled={isLoading}
        className="w-full py-3 rounded-xl font-display text-lg gradient-warm text-primary-foreground shadow-sticker hover:scale-105 transition-transform disabled:opacity-50">
        {isLoading ? 'Even geduld...' : 'Verder naar betaling →'}
      </button>
    </form>
  );
}
