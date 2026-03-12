

## Probleem: Homepage toont altijd placeholders ondanks beschikbare producten

Ik snap wat je bedoelt. Het probleem zit in twee dingen:

### 1. Verkeerde collection slug voor "Fresh Drops"
De code zoekt naar een collectie met slug `featured`, maar in de API heet die collectie `fresh-drops`. Daardoor vindt `collections.find(c => c.slug === 'featured')` niets, `featuredEmpty` wordt `true`, en je ziet altijd placeholders.

### 2. Dubbele check blokkeert producten
Zelfs als de products API wél producten teruggeeft (wat het doet — 3 producten via `/products?collection=featured`), worden die genegeerd omdat de `product_count` check in de collection metadata faalt. De component vertrouwt op `product_count` uit de collections endpoint, maar die is 0 voor zowel `fresh-drops` als `loveke-for-two`.

### Fix in `src/components/FeaturedProducts.tsx`

**Verwijder de dubbele product_count check.** Gebruik gewoon de daadwerkelijke producten die de API teruggeeft:

- Verwijder de `collectionsData` fetch en de `featuredEmpty`/`coupleEmpty` logica
- Baseer het tonen van producten vs placeholders puur op of `featuredRaw.length > 0` en `coupleRaw.length > 0`
- Update de collection slug van `featured` naar `fresh-drops` zodat het matcht met de echte collectie in SellQo

Dit betekent: als de API producten teruggeeft voor een collectie, worden ze getoond. Zo niet, zie je placeholders. Simpel en betrouwbaar.

