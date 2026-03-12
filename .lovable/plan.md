

## Probleem: Twee bugs verhinderen toevoegen aan winkelwagen

### Bug 1: Cart ID wordt opgeslagen als "undefined"

De SellQo API retourneert alle responses gewrapped: `{ success: true, data: { id: "xyz", items: [], ... } }`. Maar de cart hooks verwachten het directe cart-object.

In `useCreateCart` (hooks.ts regel 151-153):
```typescript
onSuccess: (cart) => {
  storeCartId(cart.id); // cart = { success: true, data: { id: "..." } } → cart.id = undefined
}
```

Dit veroorzaakt alle `GET /cart/undefined` requests in de logs.

### Bug 2: Gift card stuurt product_id als variant_id

Het cadeaukaart-product heeft `has_variants: false` en `variants: []`. De normalizer maakt een default variant aan met `id: product.id`. Bij toevoegen aan de cart stuurt `GiftCardDetail.tsx` (regel 50):
```typescript
variant_id: product.variants?.[0]?.id || product.id  // = product ID, geen echte variant
```

De SellQo API zoekt dan naar een record in `product_variants` met dat ID en faalt: "Variant not found or inactive".

---

### Fix

#### A. Cart response unwrapping (`src/integrations/sellqo/hooks.ts`)

Alle cart mutations moeten de response unwrappen met `extractSingle`. De volgende hooks worden aangepast:
- `useCreateCart`: unwrap `onSuccess` + unwrap `mutationFn` return
- `useAddToCart`: unwrap de `createCart.mutateAsync()` return + `cartAPI.addItem` return
- `useUpdateCartItem`, `useRemoveCartItem`, `useApplyDiscount`: unwrap de response

Technisch: na elke cart API call, gebruik `extractSingle<Cart>(result) || result` om het `{ success, data }` envelope te strippen.

#### B. Gift card: geen variant_id sturen (`src/components/GiftCardDetail.tsx`)

Voor producten zonder echte varianten (zoals gift cards), stuur `variant_id` niet mee. De SellQo API accepteert dit: als `variantId` undefined is, wordt gewoon de productprijs gebruikt (regel 1109-1130 in storefront-api).

Wijzig in `handleAddToCart`:
```typescript
// Stuur geen variant_id als het product geen echte varianten heeft
variant_id: product.variants?.length > 0 ? product.variants[0].id : undefined,
```

Dit vereist ook een kleine aanpassing in de `CartContext.addItem` type om `variant_id` optioneel te maken, en in `cartAPI.addItem` om `variant_id` alleen mee te sturen als het een waarde heeft.

#### C. Cart API type aanpassen (`src/integrations/sellqo/api.ts` + `CartContext.tsx`)

- `cartAPI.addItem`: `variant_id` wordt `string | undefined` i.p.v. `string`
- Body stuurt `variant_id` alleen mee als het een waarde heeft
- `CartContextType.addItem`: `variant_id` wordt optioneel

---

### Bestanden

- **Wijzigen**: `src/integrations/sellqo/hooks.ts` (response unwrapping)
- **Wijzigen**: `src/integrations/sellqo/api.ts` (variant_id optioneel)
- **Wijzigen**: `src/integrations/sellqo/CartContext.tsx` (variant_id optioneel in type)
- **Wijzigen**: `src/components/GiftCardDetail.tsx` (geen variant_id bij gift cards)

