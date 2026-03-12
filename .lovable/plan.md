

## Bugfix: Kortingscode en kortingsbedrag tonen in CartDrawer

### Probleem
De API geeft `discount_code`, `discount_amount` en `total` correct terug, maar:
1. `normalizeCart` mapt `discount_amount` niet — het leest alleen `raw.discount` (altijd 0)
2. CartDrawer toont geen kortingscode badge en geen verwijderknop
3. Het discount inputveld verdwijnt pas bij `discount > 0`, maar die is altijd 0

### Wijzigingen

**1. `src/integrations/sellqo/normalizer.ts` — `normalizeCart`**
- Map `discount` uit `raw.discount_amount || raw.discount || 0` zodat het API-veld `discount_amount` correct opgepikt wordt

**2. `src/components/CartDrawer.tsx` — 3 aanpassingen**
- Lees `discount` uit `cart?.discount ?? 0` en `cart?.discount_code` (al beschikbaar in types)
- Wanneer `cart.discount_code` aanwezig is: toon badge met code + ×-knop (roept `applyDiscount("")` aan), verberg het inputveld
- Wanneer `cart.discount_code` niet aanwezig: toon het inputveld (huidige gedrag)
- Kortingsregel: toon `Korting ({code}): -€{discount}` tussen subtotaal en verzending
- Totaal: gebruikt al `cart.total` via context — dat is correct

Geen type-wijzigingen nodig: `Cart.discount_code` en `Cart.discount` bestaan al in types.ts.

