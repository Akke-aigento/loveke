

## Plan: Fix 3 checkout bugs (ronde 3)

### Bug 1: "Bankoverschrijving" label hernoemen

De PaymentStep toont al "Scan QR code met je bankapp" voor `type === 'qr'`, maar de `manual` type (bankoverschrijving) wordt nog getoond met de API-naam. Aangezien de gebruiker wil dat ALLE niet-Stripe methodes (zowel `manual` als `qr`) hernoemen naar "QR code met je bankapp":

**`src/components/checkout/PaymentStep.tsx`** — Pas de label-logica aan:
- `isQR` check uitbreiden: `method.type === 'qr' || method.type === 'manual'` 
- Beide types krijgen naam "QR code met je bankapp", beschrijving "Gratis — scan de code en betaal direct", groene badge "Geen transactiekosten"
- Beide types worden gefilterd op mobile (alleen desktop)
- Icon voor `manual` ook `QrCode` maken i.p.v. `Building2`

### Bug 2: Winkelmandje badge niet leeggemaakt na succes

Het probleem: `completeCheckout` in CheckoutContext doet `localStorage.removeItem('sellqo_cart_id')`, maar invalideert de React Query cart cache NIET. De `useSellQoCart()` hook in de Navbar leest nog steeds de gecachte cart data met items.

**`src/contexts/CheckoutContext.tsx`** — Na succesvolle manual/qr betaling:
- Naast `localStorage.removeItem`, ook de React Query cache invalideren via `queryClient.invalidateQueries({ queryKey: ['sellqo-cart'] })` of `queryClient.removeQueries({ queryKey: ['sellqo-cart'] })`
- Import `useQueryClient` from `@tanstack/react-query`

**`src/pages/Bedankt.tsx`** — Na Stripe polling succes:
- Zelfde: naast localStorage remove, ook query cache clearen
- Import `useQueryClient`

### Bug 3: QR code niet getoond

De code in CheckoutContext en Bedankt.tsx ziet er correct uit — `qr_data` wordt doorgegeven via navigate state en Bedankt.tsx rendert het. Het probleem is waarschijnlijk dat de API `qr_data` **niet als nested object** teruggeeft, of dat `extractData` het verkeerd uitpakt.

**`src/contexts/CheckoutContext.tsx`** — In `completeCheckout`, log de volledige `data` response voor debugging. Zorg dat `data.qr_data` correct wordt doorgegeven (niet `undefined`).

**`src/pages/Bedankt.tsx`** — Voeg een fallback toe als `qrData` bestaat maar `image_url` ontbreekt (bijv. als de API `payload` geeft i.p.v. `image_url`, genereer dan een QR code client-side).

### Bestanden

| Bestand | Wijziging |
|---|---|
| `src/components/checkout/PaymentStep.tsx` | Manual + QR samenvoegen onder "QR code met je bankapp" label, beide desktop-only |
| `src/contexts/CheckoutContext.tsx` | React Query cache clearen bij manual/qr succes via `queryClient` |
| `src/pages/Bedankt.tsx` | React Query cache clearen bij Stripe polling succes + QR fallback rendering |

