

## Homepage collecties koppelen aan SellQo

### Probleem
`FeaturedProducts` gebruikt `useProducts({ collection: 'featured' })` wat `/products?collection=featured` aanroept. De SellQo API verwacht echter dat collectie-producten via `/collections/{slug}/products` worden opgehaald. Er bestaat al een `useCollectionProducts` hook die precies dit doet, maar die wordt niet gebruikt op de homepage.

Daarnaast controleert de huidige code `product_count` uit de collectie-metadata om te bepalen of producten getoond worden. Als de collectie-lijst nog aan het laden is of `product_count` niet correct wordt teruggegeven, worden producten geblokkeerd ook al zijn ze er wel.

### Wijziging (1 bestand)

**`src/components/FeaturedProducts.tsx`**

1. Vervang `useProducts({ collection: 'featured' })` door `useCollectionProducts('featured')`
2. Vervang `useProducts({ collection: 'loveke-for-two' })` door `useCollectionProducts('loveke-for-two')`
3. Verwijder de `useCollections()` call en de `product_count` checks — laat de daadwerkelijke API-response bepalen of er producten zijn (als de array leeg is, toon placeholders)
4. Update imports: voeg `useCollectionProducts` toe, verwijder `useCollections`

De logica wordt simpeler:
```
const { data: featuredData } = useCollectionProducts('featured');
const featuredProducts = normalizeProducts(extractArray(featuredData));
// Als featuredProducts.length > 0 → toon producten, anders placeholders
```

Geen wijzigingen nodig in hooks, API of normalizer — alles bestaat al.

