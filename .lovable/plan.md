

## Performance — Smooth browsing zonder laadvertragingen

### Wat verandert er

**1. `src/App.tsx` — Cache verlengen + prefetch bij app start**
- `staleTime`: 2 min → 5 min
- `gcTime`: 10 min → 30 min
- `refetchOnMount: false` toevoegen
- App component omzetten van arrow-expression naar functie-component zodat we `useEffect` kunnen gebruiken voor prefetching
- Bij mount: prefetch producten (`productsAPI.getAll`) en collecties (`collectionsAPI.getAll`) met correcte query keys uit `sellqoKeys`

**2. `src/components/ProductCard.tsx` — Prefetch product detail bij hover**
- `useQueryClient` importeren
- `onMouseEnter` handler op de buitenste `motion.div` die `queryClient.prefetchQuery` aanroept voor het product detail (`productsAPI.getBySlug(product.slug)`)
- Gebruikt `sellqoKeys.products.detail(slug)` als query key zodat het matcht met `useProduct()` op de detail pagina

**3. `src/integrations/sellqo/hooks.ts` — Per-hook staleTime verwijderen**
- Individuele `staleTime` overrides in hooks (zoals `useProducts`, `useCollections`) verwijderen zodat ze de globale 5 min default erven — voorkomt conflicten

### Resultaat
- Homepage → Shop: data staat al in cache, geen loader
- Hover op product → klik: detail data al geladen, instant
- Terugnavigeren: altijd instant uit cache (30 min)

