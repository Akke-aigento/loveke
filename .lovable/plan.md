

## Bugfix: Korting verwijderen — "cart_id and code are required"

### Oorzaak
Wanneer de × knop `applyDiscount("")` aanroept, stuurt `useApplyDiscount` een `POST /cart/{cartId}/discount` met `{ code: "" }`. De API verwacht een niet-lege code bij POST en geeft de foutmelding. Er bestaat al een `cartAPI.removeDiscount(cartId)` die `DELETE /cart/{cartId}/discount` doet — maar die wordt nergens gebruikt.

### Fix (1 bestand)

**`src/integrations/sellqo/hooks.ts` — `useApplyDiscount` mutationFn**

Pas de mutationFn aan: als `code` leeg is, roep `cartAPI.removeDiscount(cartId)` aan in plaats van `cartAPI.applyDiscount(cartId, code)`.

```typescript
mutationFn: async (code: string) => {
  const cartId = getStoredCartId();
  if (!cartId) throw new Error('No cart found');
  const result = code
    ? await cartAPI.applyDiscount(cartId, code)
    : await cartAPI.removeDiscount(cartId);
  const raw = extractSingle<Cart>(result) || result;
  return normalizeCart(raw);
},
```

Geen wijzigingen nodig in CartDrawer, CartContext of api.ts — alles is al correct opgezet.

