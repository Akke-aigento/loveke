# Role audit

## LOVEKE-PHONE-1 (Deel C) — telefoonveld verplicht + disclaimer in Loveke checkout

Frontend sluit aan op de backend-afdwinging uit Deel A (SellQo storefront-api tenant-vlag `checkout_phone_required=true` voor Loveke).

- `src/components/checkout/CustomerAddressStep.tsx`: telefoonveld verplicht (asterisk + `required`), client-side inline validatie via `checkout.phoneRequired`, muted disclaimer via `checkout.phoneDisclaimer`.
- `src/i18n/{nl,en,fr}.json`: nieuwe `checkout.phoneRequired` en `checkout.phoneDisclaimer` keys.

## CART-HEAL-1 — self-healing bij verlopen/verwijderde storefront-cart

**Root cause:** bij een verlopen/verwijderde cart antwoordt de SellQo storefront-api correct met `{success:true, data:null}`. De cart-hooks deden `extractSingle<Cart>(result) || result`; die `|| result` viel bij `data:null` terug op de envelope, waardoor `normalizeCart` een cart met `id:''` opleverde. De dode cart-id in `localStorage` werd daardoor nooit opgeruimd en elke volgende add ging naar een dode cart → mand permanent leeg tot handmatig wissen van localStorage.

**Wijzigingen (alleen `src/integrations/sellqo/hooks.ts`):**
1. Nieuwe helper `clearStoredCartId()` naast `getStoredCartId`/`storeCartId`.
2. `useCartQuery`: respecteert `extractSingle`-null → wist de opgeslagen cart-id en toont een veilige lege mand (`normalizeCart({ id:'', items: [] })`). Geen `|| result` meer.
3. `useAddToCart`: bij `data:null` wordt de dode id gewist, een nieuwe cart aangemaakt en de add eenmalig opnieuw geprobeerd; blijft het resultaat leeg dan `CART_ADD_FAILED` i.p.v. stille lege mand. `onSuccess` slaat de (nieuwe) cart-id op en invalideert de juiste query-key.

**Niet aangeraakt:** backend/proxy (bewezen gezond via curl-test: `cart_create`, `cart_add_item` en `cart_get` geven correcte gevulde carts terug), `normalizer.ts`, `client.ts` (`extractSingle`), en de overige hooks (`useCreateCart`, `useUpdateCartItem`, `useRemoveCartItem`, `useApplyDiscount`, checkout) — die hebben al correcte invalidatie en vallen buiten scope. Geen changelog/newsletter: custom-frontend bugfix, niet tenant-zichtbare SellQo-core.
