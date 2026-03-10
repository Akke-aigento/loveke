

## Probleem

De SellQo API negeert het `collection` filter als de collectie geen producten bevat en retourneert dan **alle producten** als fallback. Dit is zichtbaar in de network requests:

- `?collection=featured` retourneert 3 producten (alle producten in de shop)
- `?collection=loveke-for-two` retourneert ook 3 producten (dezelfde)

De huidige code in `FeaturedProducts.tsx` checkt `product_count` via de collections metadata, maar het probleem is dat `featuredCollection` en `coupleCollection` mogelijk `undefined` zijn als de slugs niet matchen, waardoor `featuredEmpty` en `coupleEmpty` `false` worden en de API-producten (die eigenlijk ALLE producten zijn) worden getoond.

## Oorzaak

Regel 37-38:
```
const featuredEmpty = featuredCollection && (featuredCollection.product_count ?? 0) === 0;
```
Als `featuredCollection` is `undefined` (slug niet gevonden), dan is `featuredEmpty = undefined` (falsy), en de producten van de API worden gewoon getoond — ook al zijn het irrelevante producten.

## Fix

In `FeaturedProducts.tsx`, verander de logica zodat de collectie als leeg wordt behandeld wanneer:
1. De collectie metadata niet gevonden wordt (slug matcht niet), OF
2. De collectie `product_count === 0` heeft

Concrete wijziging op regels 37-38:

```typescript
// Treat as empty if collection not found OR product_count is 0
const featuredEmpty = !featuredCollection || (featuredCollection.product_count ?? 0) === 0;
const coupleEmpty = !coupleCollection || (coupleCollection.product_count ?? 0) === 0;
```

Dit is een 2-regel fix. De rest van de component werkt al correct: als `featuredEmpty` true is, worden de placeholder cards met het hartje getoond.

