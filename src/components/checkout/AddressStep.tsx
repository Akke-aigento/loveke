import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCheckout } from '@/contexts/CheckoutContext';
import type { CheckoutAddress } from '@/integrations/sellqo/checkoutTypes';
import { ArrowLeft } from 'lucide-react';

const emptyAddress: CheckoutAddress = { street: '', city: '', postal_code: '', country: 'BE', company: '' };

export default function AddressStep() {
  const { saveAddress, isLoading, fieldErrors, goBack, shippingAddress, billingAddress, billingSameAsShipping } = useCheckout();
  const [shipping, setShipping] = useState<CheckoutAddress>(shippingAddress || { ...emptyAddress });
  const [billingSame, setBillingSame] = useState(billingSameAsShipping);
  const [billing, setBilling] = useState<CheckoutAddress>(billingAddress || { ...emptyAddress });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveAddress(shipping, billingSame, billingSame ? null : billing);
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
      <div className="flex items-center gap-3 mb-2">
        <button type="button" onClick={goBack} className="p-1 hover:text-primary transition-colors">
          <ArrowLeft size={20} />
        </button>
        <h2 className="font-display text-xl">Bezorgadres</h2>
      </div>

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
        {isLoading ? 'Even geduld...' : 'Verder →'}
      </button>
    </form>
  );
}
