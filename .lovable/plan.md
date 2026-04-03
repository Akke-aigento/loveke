

## Plan: Checkout bugs fixen — 8 fixes in 1

### Overzicht

| Bug | Fix |
|---|---|
| 1. 3 stappen → 2 | Combineer Gegevens + Adres in 1 component, stepper wordt 2 stappen |
| 2. QR volgorde/naam/device | Sort QR eerst, rename, filter op desktop-only |
| 3. QR code niet getoond | Al geïmplementeerd in Bedankt.tsx — werkt al |
| 4. Totaal €0.00 | Computed total met Number() fallbacks |
| 5. NaN in items | Fallback `Number(item.price) \|\| 0` in OrderSummary |
| 6. Success bij fout | Al correct: `handleApiError` check zit voor navigate in `completeCheckout` — extra hardening in default case |
| 7. Stripe opties badges | Toon iDEAL/Bancontact/Creditcard/Apple Pay badges bij Stripe methode |
| 8. Kortingscode UI | Al geïmplementeerd in OrderSummary.tsx — werkt al |

### Bestanden

| Bestand | Actie |
|---|---|
| `src/components/checkout/CustomerAddressStep.tsx` | **Nieuw** — gecombineerd formulier met klantgegevens + adres in 1 scroll |
| `src/components/checkout/PaymentStep.tsx` | Wijzig: QR filtering (desktop-only), sortering (QR eerst), rename, Stripe badges |
| `src/components/checkout/OrderSummary.tsx` | Wijzig: NaN fix met `Number()` fallbacks op `item.price` |
| `src/contexts/CheckoutContext.tsx` | Wijzig: `saveCustomerAndAddress` functie (2 API calls sequentieel), `getSteps` → 2 stappen, `goBack` logica, computed total |
| `src/pages/Checkout.tsx` | Wijzig: renderStep switch naar 2 stappen, import CustomerAddressStep |
| `src/components/checkout/CustomerStep.tsx` | Niet meer gebruikt (kan blijven als dead code) |
| `src/components/checkout/AddressStep.tsx` | Niet meer gebruikt (kan blijven als dead code) |

### Detail per fix

**Fix 1 — Gecombineerde stap:**
- Nieuw `CustomerAddressStep.tsx` met: email, naam (2 kolommen), telefoon, dan `<h2>Bezorgadres</h2>`, straat, postcode+gemeente (2 kolommen), land select, bedrijf, billing toggle
- Bij submit: sequentieel `saveCustomer` → `saveAddress` → auto-select shipping als 1 methode → ga naar stap 2 (betaling)
- Context `getSteps()` wordt: `[{id:1, label:"Gegevens & Adres"}, {id:2, label:"Betaling"}]`
- `currentStep` mapping: stap 1 = gegevens+adres, stap 2 = betaling (intern nog stap 4 voor de shipping auto-select logica)

**Fix 2 — QR in PaymentStep:**
- `useIsMobile` hook (al aanwezig in project) of inline check `window.innerWidth < 1024 || 'ontouchstart' in window`
- Filter: verberg `method.type === 'qr'` op mobiel
- Sort: QR (type qr) eerst, dan rest
- Rename: als `method.type === 'qr'` → naam "Scan QR code met je bankapp", beschrijving "Gratis — direct betalen via je bankapp" + groene badge "Geen transactiekosten"

**Fix 4 — Computed total:**
- In CheckoutContext: `useMemo` computed total = `Math.max(0, (Number(subtotal)||0) + (Number(shippingCost)||0) - (Number(discount?.amount)||0))`
- Gebruik API total als die beschikbaar is, anders computed

**Fix 5 — NaN items:**
- In OrderSummary: `const price = Number(item.price) || 0;`

**Fix 7 — Stripe badges:**
- In PaymentStep: als `method.type === 'redirect'` of `method.id === 'stripe'`, toon kleine badges: iDEAL, Bancontact, Creditcard, Apple Pay

### Stap-navigatie na refactor

```text
Stap 1: CustomerAddressStep
  → POST /checkout/customer
  → POST /checkout/address  
  → POST /checkout/shipping (auto als 1 methode)
  → setCurrentStep(2)

Stap 2: PaymentStep (was stap 4)
  → POST /checkout/complete
  → redirect/navigate
```

De shipping step component (`ShippingStep.tsx`) wordt alleen getoond als er >1 verzendmethodes zijn, als tussenstap voor stap 2. In de context wordt dit intern afgehandeld.

