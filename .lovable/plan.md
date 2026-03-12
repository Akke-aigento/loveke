
Doel: homepage-secties in `FeaturedProducts` uitsluitend laten filteren op categorie-slug en placeholders tonen zodra een categorie geen producten teruggeeft.

Wat ik heb geverifieerd in de code:
- `src/components/FeaturedProducts.tsx` gebruikt nu al:
  - `useProducts({ category: 'fresh-drops' })`
  - `useProducts({ category: 'loveke-for-two' })`
- Placeholder-logica is al correct:
  - Alleen echte producten tonen bij `raw.length > 0`
  - Anders bestaande placeholder cards tonen
  - Geen fallback naar andere productsets

Implementatieplan (minimaal, 1 bestand):
1. `src/components/FeaturedProducts.tsx` nalopen en exact afdwingen:
   - `collection: 'fresh-drops'` → `category: 'fresh-drops'`
   - `collection: 'loveke-for-two'` → `category: 'loveke-for-two'`
2. Bevestigen dat de bestaande placeholder-branches ongewijzigd blijven:
   - Fresh Drops: 4 placeholders bij 0 resultaten
   - Loveke for Two: 2 placeholders bij 0 resultaten
3. Geen andere code aanpassen (geen extra fallback, geen API-layer wijziging, geen backend wijziging).

Validatie na implementatie:
- Network calls op `/` moeten enkel categorie-filters gebruiken voor deze secties.
- Bij lege API-respons (`products: []`) blijven placeholders zichtbaar (verwacht gedrag).
- Als categorie-call nog steeds 0 producten geeft, is dat dataprobleem (slug/publicatie/koppeling in storefront data), niet rendering-logica.

Technische impact:
- Scope: alleen `src/components/FeaturedProducts.tsx`
- Geen migraties, geen auth/RLS-impact, geen dependency-wijzigingen.
