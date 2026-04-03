

## Plan: Checkout switch van order_id naar cart_id + Bedankt pagina polling

### Wat wijzigt

De SellQo API wordt aangepast zodat de checkout op de **cart** werkt i.p.v. een vroeg aangemaakte order. Alle `order_id` referenties in checkout API calls worden `cart_id`.

### Bestanden

| Bestand | Wijziging |
|---|---|
| `src/integrations/sellqo/checkoutTypes.ts` | Rename `orderId` → `cartId` in `CheckoutState`. Verwijder `order_id` uit `CheckoutStartResponse` |
| `src/integrations/sellqo/checkoutApi.ts` | Alle functies: `orderId` param → `cartId`, request body `order_id` → `cart_id`. Success URL krijgt `{CHECKOUT_SESSION_ID}` placeholder |
| `src/contexts/CheckoutContext.tsx` | `state.orderId` → `state.cartId`. Alle API calls gebruiken `cartId`. Bij `startCheckout`: sla `cartId` op (= de meegegeven cartId), geen `order_id` uit response nodig. Bij `completeCheckout`: cart alleen leegmaken bij manual/qr, NIET bij redirect (dat doet de bedankt pagina) |
| `src/pages/Checkout.tsx` | Referenties `orderId` → `cartId` |
| `src/pages/Bedankt.tsx` | Toevoegen: Stripe polling via `session_id` query param. `useEffect` pollt `/checkout/order?stripe_session_id=xxx` max 5x met 2s interval. Bij succes: toon ordergegevens + clear cart. Bij timeout: generiek bedankt-bericht |

### Detailwijzigingen

**checkoutApi.ts** — alle body's:
```typescript
// saveCustomer: { cart_id: cartId, customer }
// saveAddress:  { cart_id: cartId, shipping_address, ... }
// selectShipping: { cart_id: cartId, shipping_method_id }
// complete: { cart_id: cartId, payment_method_id, success_url, cancel_url }
// applyDiscount: { cart_id: cartId, discount_code }
// removeDiscount: { cart_id: cartId }
```

**Success URL** wordt: `` `${origin}/bedankt?session_id={CHECKOUT_SESSION_ID}` ``

**CheckoutContext** — `completeCheckout`:
- Stripe redirect: NIET cart leegmaken (bedankt pagina doet dat na polling)
- Manual/QR: WEL cart leegmaken + navigate

**Bedankt.tsx** — nieuw polling mechanisme:
```typescript
// Als session_id in URL → poll /checkout/order?stripe_session_id=xxx
// Max 5 pogingen, 2s interval
// Bij succes: setOrder + clearCart
// Bij timeout: generiek bedankt + clearCart
```

### Geen wijzigingen nodig
- `OrderSummary.tsx` — gebruikt alleen context, geen directe API calls
- `CustomerStep/AddressStep/ShippingStep/PaymentStep` — gebruiken alleen context
- `CartDrawer.tsx` — navigeert alleen naar /checkout

