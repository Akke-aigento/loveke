

## Plan: Multi-step Checkout Flow implementeren

### Huidige situatie
De checkout is nu een simpele redirect: "Afrekenen" knop → `POST /checkout` → redirect naar Stripe hosted page. De hele checkout (klantgegevens, adres, betaling) wordt afgehandeld op de Stripe/SellQo hosted pagina.

### Nieuwe situatie
Een complete in-app checkout flow met 4 stappen, volledig volgens het SellQo Checkout Implementation Guide.

```text
[CartDrawer "Afrekenen"] → /checkout
  Stap 1: Klantgegevens (email, naam, telefoon)
  Stap 2: Adres (verzend + optioneel apart factuuradres)
  Stap 3: Verzending (auto-skip als geen methodes)
  Stap 4: Betaling (methode kiezen → bevestigen)
    → Stripe: redirect
    → Bank: navigate naar /bedankt met bankgegevens
    → QR: navigate naar /bedankt met QR data
[/bedankt] — 3 varianten
```

### Bestanden

| Bestand | Actie |
|---|---|
| `src/integrations/sellqo/api.ts` | Nieuwe `checkoutFlowAPI` toevoegen met endpoints: `/checkout/start`, `/checkout/customer`, `/checkout/address`, `/checkout/shipping`, `/checkout/complete`, `/checkout/discount` |
| `src/integrations/sellqo/types.ts` | Types toevoegen: `CheckoutStartResponse`, `PaymentMethod`, `ShippingMethod`, `CheckoutCompleteResponse`, `BankDetails` |
| `src/contexts/CheckoutContext.tsx` | **Nieuw** — CheckoutState context met orderId, items, stap-navigatie, totalen, geselecteerde methodes |
| `src/pages/Checkout.tsx` | **Nieuw** — Multi-step checkout pagina met 4 stappen + order samenvatting sidebar |
| `src/components/checkout/CustomerStep.tsx` | **Nieuw** — Formulier: email, voornaam, achternaam, telefoon (optioneel) |
| `src/components/checkout/AddressStep.tsx` | **Nieuw** — Verzendadres + "Factuuradres hetzelfde" toggle + optioneel factuuradres |
| `src/components/checkout/ShippingStep.tsx` | **Nieuw** — Radio buttons voor verzendmethodes (of auto-skip) |
| `src/components/checkout/PaymentStep.tsx` | **Nieuw** — Betaalmethode selectie + "Bestelling plaatsen" knop |
| `src/components/checkout/OrderSummary.tsx` | **Nieuw** — Sidebar met items, subtotaal, korting, verzending, totaal + kortingscode invoer |
| `src/components/checkout/StepIndicator.tsx` | **Nieuw** — Visuele stap-indicator (1-2-3-4) |
| `src/components/CartDrawer.tsx` | Wijzig "Afrekenen" knop: navigate naar `/checkout` ipv direct API call |
| `src/pages/Bedankt.tsx` | Uitbreiden met 3 varianten: Stripe redirect (session_id), bankoverschrijving (state), QR (state) |
| `src/App.tsx` | Route `/checkout` toevoegen + lazy import |

### Checkout Flow — API calls per stap

```text
Stap 0: POST /checkout/start        { cart_id }           → order_id, items, payment_methods, shipping_methods
Stap 1: POST /checkout/customer      { order_id, customer } → ok
Stap 2: POST /checkout/address       { order_id, addresses } → ok
Stap 3: POST /checkout/shipping      { order_id, method_id } → updated totals
Stap 4: POST /checkout/complete      { order_id, payment_method_id, success_url, cancel_url }
         → { payment_type: "redirect" | "manual" | "qr", checkout_url?, bank_details?, qr_data? }
```

### Stap-navigatie logica
- Verzendstap wordt automatisch overgeslagen als `available_shipping_methods` leeg is
- Als er maar 1 verzendmethode is → auto-selecteer en ga door
- Terug-navigatie werkt op elke stap
- Loading state + disabled knoppen op elke API call

### Error handling
- Veld-specifieke validatie errors (`VALIDATION_ERROR` + `fields` object) → toon onder elk veld
- Algemene errors → toast notificatie
- Netwerk errors → "Controleer je internetverbinding" melding

### Bedankt pagina — 3 varianten
1. **Stripe redirect**: `?session_id=cs_live_...` → bevestiging "Betaling ontvangen"
2. **Bankoverschrijving**: via `location.state` → toon IBAN, rekeninghouder, referentie
3. **QR betaling**: via `location.state` → toon QR code + instructies
4. **Fallback** (huidige `?cart_id=...`): blijft werken als backward compatibility

### CartDrawer wijziging
```typescript
// HUIDIG:
createCheckout.mutate({ success_url: ..., cancel_url: ... });

// NIEUW:
closeCart();
navigate('/checkout');
```

### Styling
- Loveke huisstijl: `font-display`, `gradient-warm`, `shadow-sticker`, oranje accenten
- Desktop: 2 kolommen (formulier links, order summary rechts)
- Mobile: order summary bovenaan (inklapbaar), formulier eronder
- Stap-indicator met Loveke oranje voor actieve/voltooide stappen

### Na succesvolle betaling
- `sellqo_cart_id` verwijderen uit localStorage
- Cart query invalidaten

