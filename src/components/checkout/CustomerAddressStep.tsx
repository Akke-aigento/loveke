import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCheckout } from '@/contexts/CheckoutContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { checkoutFlowAPI } from '@/integrations/sellqo/checkoutApi';
import type { CheckoutCustomer, CheckoutAddress } from '@/integrations/sellqo/checkoutTypes';

const emptyAddress: CheckoutAddress = { street: '', city: '', postal_code: '', country: 'BE', company: '' };

export default function CustomerAddressStep() {
  const { t } = useLanguage();
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
  const [phoneError, setPhoneError] = useState<string | null>(null);

  // B2B state
  const [isB2B, setIsB2B] = useState<boolean>(!!customer?.is_b2b);
  const [companyName, setCompanyName] = useState(customer?.company_name || '');
  const [vatNumber, setVatNumber] = useState(customer?.vat_number || '');
  const [vatStatus, setVatStatus] = useState<'idle' | 'checking' | 'valid' | 'invalid'>(
    customer?.vat_verified ? 'valid' : 'idle',
  );
  const [vatCountry, setVatCountry] = useState(customer?.vat_country || '');
  const [vatCompanyName, setVatCompanyName] = useState(customer?.vat_company_name || '');

  const runVatValidation = async () => {
    const value = vatNumber.trim();
    if (!value) { setVatStatus('idle'); return; }
    setVatStatus('checking');
    try {
      const res: any = await checkoutFlowAPI.validateVat(value);
      const data = res?.data && typeof res.data === 'object' ? res.data : res;
      if (data?.valid === true) {
        setVatStatus('valid');
        setVatCountry(data.country_code || '');
        setVatCompanyName(data.company_name || '');
        if (!companyName.trim() && data.company_name) setCompanyName(data.company_name);
      } else {
        setVatStatus('invalid');
        setVatCountry('');
        setVatCompanyName('');
      }
    } catch {
      setVatStatus('invalid');
    }
  };

  const updateCustomer = (key: keyof CheckoutCustomer, value: string) =>
    setForm(f => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.phone || !form.phone.trim()) {
      setPhoneError(t('checkout.phoneRequired'));
      return;
    }
    setPhoneError(null);

    const customerPayload: CheckoutCustomer = isB2B
      ? {
          ...form,
          is_b2b: true,
          company_name: companyName.trim(),
          vat_number: vatNumber.trim(),
          vat_verified: vatStatus === 'valid',
          vat_country: vatCountry || undefined,
          vat_company_name: vatCompanyName || undefined,
        }
      : form;

    const shippingPayload: CheckoutAddress =
      isB2B && companyName.trim() && !(shipping.company || '').trim()
        ? { ...shipping, company: companyName.trim() }
        : shipping;

    await saveCustomerAndAddress(customerPayload, shippingPayload, billingSame, billingSame ? null : billing);
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
        <Label htmlFor="phone">Telefoonnummer *</Label>
        <Input id="phone" type="tel" required value={form.phone || ''}
          onChange={e => { updateCustomer('phone', e.target.value); if (phoneError) setPhoneError(null); }}
          placeholder="+32 4XX XX XX XX"
          className={fieldErrors.phone || phoneError ? 'border-destructive' : ''} />
        {(fieldErrors.phone || phoneError) && <p className="text-xs text-destructive mt-1">{fieldErrors.phone || phoneError}</p>}
        <p className="text-xs text-muted-foreground mt-1">{t('checkout.phoneDisclaimer')}</p>
      </div>

      {/* B2B */}
      <div className="space-y-3">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={isB2B} onChange={e => setIsB2B(e.target.checked)}
            className="w-4 h-4 rounded border-border text-primary focus:ring-primary" />
          <span className="text-sm">{t('checkout.b2bToggle')}</span>
        </label>

        {isB2B && (
          <div className="space-y-3 rounded-xl border border-border p-4">
            <div>
              <Label htmlFor="company_name">{t('checkout.companyName')} *</Label>
              <Input id="company_name" required value={companyName}
                onChange={e => setCompanyName(e.target.value)} placeholder="Loveke BV" />
            </div>
            <div>
              <Label htmlFor="vat_number">{t('checkout.vatNumber')}</Label>
              <Input id="vat_number" value={vatNumber}
                onChange={e => { setVatNumber(e.target.value); setVatStatus('idle'); }}
                onBlur={runVatValidation}
                placeholder="BE0123456789" />
              {vatStatus === 'checking' && (
                <p className="text-xs text-muted-foreground mt-1">{t('checkout.vatChecking')}</p>
              )}
              {vatStatus === 'valid' && (
                <p className="text-xs text-primary mt-1">
                  ✓ {t('checkout.vatValid')}{vatCompanyName ? ` — ${vatCompanyName}` : ''}
                </p>
              )}
              {vatStatus === 'invalid' && (
                <p className="text-xs text-destructive mt-1">✗ {t('checkout.vatInvalid')}</p>
              )}
              {vatStatus !== 'checking' && vatNumber.trim() !== '' && (
                <button type="button" onClick={runVatValidation}
                  className="text-xs underline text-muted-foreground hover:text-foreground mt-1">
                  {t('checkout.vatRecheck')}
                </button>
              )}
            </div>
          </div>
        )}
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
