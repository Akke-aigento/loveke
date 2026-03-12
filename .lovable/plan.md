

## Fix: Producten verschijnen niet op homepage — verkeerde API parameter

### Oorzaak
In SellQo zijn "Fresh drops" en "Loveke for Two" **categorieën**, geen collecties. De API calls gebruiken `?collection=fresh-drops` maar moeten `?category=fresh-drops` gebruiken. Bewijs: beide API calls retourneren `{ products: [], total_count: 0 }`.

### Fix in `src/components/FeaturedProducts.tsx`

Verander de `useProducts` calls van `collection` naar `category`:

```typescript
// Was:
const { data: featuredData, isError: featuredError } = useProducts({ collection: 'fresh-drops' });
const { data: coupleData, isError: coupleError } = useProducts({ collection: 'loveke-for-two' });

// Wordt:
const { data: featuredData, isError: featuredError } = useProducts({ category: 'fresh-drops' });
const { data: coupleData, isError: coupleError } = useProducts({ category: 'loveke-for-two' });
```

De `ProductsParams` type en `productsAPI.getAll` ondersteunen al de `category` parameter — er zijn geen andere wijzigingen nodig.

### Risico
De category slugs moeten exact matchen met wat SellQo verwacht. Als het niet "fresh-drops" maar bv. "fresh_drops" is, moeten we de slug aanpassen. Na implementatie kunnen we dit verifiëren via de network response.

