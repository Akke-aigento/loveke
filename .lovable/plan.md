

## Plan: Cart Fixes, Laadsnelheid & Kortingscode

### Drie problemen gevonden

**1. Winkelmandje: geen kortingscode-invoer**
De CartDrawer toont subtotaal, verzending en totaal, maar heeft geen invoerveld voor kortingscodes. De SellQo API ondersteunt `POST /cart/{id}/discount` met `{ code }` en de `applyDiscount` functie bestaat al in de SellQoCartProvider maar wordt nergens aangeroepen vanuit de UI.

**2. Trage laadervaring door koude edge function starts**
De edge function proxy (`sellqo-proxy`) moet elke keer opnieuw booten (~25ms boot + netwerk latency naar de SellQo API). Combineer dit met 3-4 parallelle requests bij page load en het voelt traag.

**3. Twee cart systemen actief**
Er bestaan twee CartContext bestanden: `src/contexts/CartContext.tsx` (oud, lokaal, ongebruikt) en `src/integrations/sellqo/CartContext.tsx` (actief, SellQo API). Het oude bestand kan verwijderd worden.

---

### Wijzigingen

#### A. Kortingscode in CartDrawer (`src/components/CartDrawer.tsx`)
- Voeg een invoerveld + "Toepassen" knop toe in de cart footer, boven het subtotaal
- Gebruik `applyDiscount` en `discountCode`/`setDiscountCode` uit `useSellQoCart()`
- Toon foutmelding via toast bij ongeldige code
- Toon toegepaste korting als `cart?.discount > 0` met de code en het bedrag
- Volg SellQo API flow: `POST /cart/{id}/discount` met `{ code }`

#### B. Snellere laadervaring
- **Prefetching**: Configureer de `QueryClient` met langere `staleTime` en `gcTime` defaults
- **Skeleton placeholders**: Zijn al aanwezig op Shop pagina, controleren dat homepage ook smooth laadt
- **Optimistic loading**: Toon de pagina-structuur direct met skeletons i.p.v. wachten op data

#### C. Opruimen oud cart systeem
- Verwijder `src/contexts/CartContext.tsx` (wordt nergens geïmporteerd, `App.tsx` gebruikt `SellQoCartProvider`)

---

### Technische details

**Discount flow in CartDrawer:**
```
User typt code → setDiscountCode(code) → klikt "Toepassen" → 
applyDiscount(code) → POST /cart/{id}/discount { code } → 
API valideert → cart wordt opnieuw opgehaald met discount toegepast →
CartDrawer toont: discount bedrag, aangepast totaal
```

**QueryClient optimalisatie:**
```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2,  // 2 min
      gcTime: 1000 * 60 * 10,    // 10 min
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});
```

**Bestanden:**
- Wijzigen: `src/components/CartDrawer.tsx`, `src/App.tsx`
- Verwijderen: `src/contexts/CartContext.tsx`

