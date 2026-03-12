
Probleem bevestigd. Ik heb runtime-logs en requests nagekeken en er zijn 3 aparte oorzaken:

1) Cadeaukaart en producten zonder varianten sturen nog steeds een `variant_id` mee (namelijk de `product_id`)  
→ request faalt met `Variant not found or inactive`.

2) Sommige sessies gebruiken nog `sellqo_cart_id = "undefined"` in localStorage  
→ requests gaan naar `/cart/undefined` en flow blijft stuk.

3) Producten mét echte varianten (zoals sweater) geven `Insufficient stock` vanuit de backend  
→ frontend kan dit beter communiceren, maar stock moet in Sellqo correct staan.

Implementatieplan:

1. Cart-id herstel en hardening
- In `src/integrations/sellqo/hooks.ts`:
  - `getStoredCartId()` valideren (UUID + blocklist: `"undefined"`, `"null"`, leeg).
  - Ongeldige waarde direct verwijderen uit localStorage.
  - `useCartQuery()` response unwrappen met `extractSingle` (nu ontbreekt dat nog).
  - In `useCreateCart()` guard toevoegen: alleen opslaan als `cart.id` echt bestaat.

2. Variant-logica corrigeren (kernfix)
- In `src/integrations/sellqo/normalizer.ts`:
  - Stoppen met kunstmatige default-variant (`id = product.id`) voor producten zonder varianten.
- In `src/pages/ProductDetail.tsx`:
  - `handleAddToCart` aanpassen zodat `variant_id` alleen meegaat als er een echte variant is.
  - Geen early return meer op `!variant`; non-variant producten moeten ook kunnen toevoegen.
- In `src/components/GiftCardDetail.tsx`:
  - Voor cadeaukaart altijd zonder `variant_id` toevoegen.

3. Duidelijke foutfeedback voor “gewone producten”
- In `src/integrations/sellqo/CartContext.tsx`:
  - Error-message mappen:
    - `Insufficient stock` → “Deze maat is momenteel niet op voorraad.”
    - `Variant not found or inactive` → “Productconfiguratie klopt niet, probeer opnieuw.”
  - Zo weten users of het een voorraadprobleem of technische mismatch is.

4. Validatie na implementatie
- E2E testcases:
  - Cadeaukaart toevoegen (3-stappen flow) → moet slagen.
  - Product zonder varianten toevoegen → moet slagen.
  - Product met varianten toevoegen:
    - bij voldoende stock: slagen
    - bij geen stock: nette voorraadmelding.
  - Herlaad pagina met oude/stale cart key → moet zichzelf herstellen (geen `/cart/undefined`).

Wat jij in Sellqo nog moet nakijken (backend-config):
- Voor varianten die verkoopbaar moeten zijn: stock-instellingen effectief invullen of voorraadtracking correct zetten.
- `in_stock: true` met `stock: null` geeft nu in praktijk vaak `Insufficient stock` bij add-to-cart.

Technische details
- Verwachte add-to-cart body:
```text
Non-variant / gift card:
{ product_id, quantity }

Variant product:
{ product_id, quantity, variant_id }
```
- Bestanden die ik zal aanpassen:
  - `src/integrations/sellqo/hooks.ts`
  - `src/integrations/sellqo/normalizer.ts`
  - `src/pages/ProductDetail.tsx`
  - `src/components/GiftCardDetail.tsx`
  - `src/integrations/sellqo/CartContext.tsx`
