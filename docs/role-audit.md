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

## B2B-CHECKOUT-1 — zakelijk bestellen met BTW-verlegging (Loveke frontend)

**Root cause / uitgangspunt:** greenfield. Recon toonde nul hits op
`is_b2b|vat_number|validate_vat|reverse_charge|vat_regime` in `src/` en `supabase/`:
de SellQo-backend ondersteunt B2B al (checkout_customer accepteert B2B-velden,
`checkout_validate_vat` doet VIES, cart/order-response bevat
`reverse_charge`/`vat_regime`/`vat_text`), maar de custom frontend gebruikte er niets van.

**Uitgevoerd (frontend-only, 6 stappen):**
1. `checkoutTypes.ts` — `CheckoutCustomer` uitgebreid met `is_b2b`, `company_name`,
   `vat_number`, `vat_verified`, `vat_country`, `vat_company_name`; `CheckoutState`
   met `reverseCharge`, `vatText`, `vatRegime`.
2. `checkoutApi.ts` — `validateVat()` toegevoegd.
3. `CheckoutContext.tsx` — `saveCustomerAndAddress` gooit de checkout_customer-response
   niet langer weg: netto subtotal/total + verleggingsstatus gaan naar de state.
   Stap-logica, fieldErrors en handleApiError ongewijzigd.
4. `CustomerAddressStep.tsx` — B2B-sectie als losse velden in het hoofd-form
   (NIET in `AddressFields`, dat is een in-render gedefinieerd component → focus-verlies).
   VIES-validatie **on blur**, niet per toetsaanslag (backend rate limit 10/min).
5. `OrderSummary.tsx` — bij `reverseCharge` een netto-melding + `vat_text`; geen apart btw-bedrag.
6. i18n NL/EN/FR onder de `checkout`-namespace.

**Proxy-truc:** het VIES-pad is `/checkout/validate_vat` met **underscore**. De proxy heeft
geen expliciete VAT-route; de fallback doet `segments.join('_')`, dus underscore → action
`checkout_validate_vat`. Met een streepje was dat `checkout_validate-vat` geworden.
Zo blijft de proxy ongewijzigd.

**Beleid:** `block_invalid_vat_orders = false` → een ongeldig BTW-nummer blokkeert de
bestelling niet; de klant betaalt dan gewoon inclusief btw.

**Niet aangeraakt:** SellQo-backend, `supabase/functions/sellqo-proxy`, cart-hooks
(CART-HEAL-1), normalizer, client. B2C-flow identiek: `isB2B` default false, geen extra
verplichte velden, geen extra calls.
