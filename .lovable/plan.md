

## Analyse: Twee aparte problemen

Ik heb de volledige flow getest met de browser en alle API requests bekeken. Er zijn twee duidelijke problemen:

### Probleem 1: CartDrawer crasht met wit scherm (frontend bug)

De SellQo cart API retourneert items in een **ander formaat** dan wat `CartDrawer.tsx` verwacht:

```text
API format:     { unit_price: 0, product: { name: "...", image: "..." }, variant: null, line_total: 0 }
CartItem type:  { price: number, title: string, image: string, variant_title: string }
```

`CartDrawer` doet `item.price.toFixed(2)` maar `price` is `undefined` in het API-formaat (het heet `unit_price`). Dit veroorzaakt de `TypeError: Cannot read properties of undefined (reading 'toFixed')` crash en het witte scherm.

Daarnaast missen de cart-response velden `shipping`, `discount`, `tax`, `total` - die worden gebruikt in CartDrawer/CartContext maar zijn `undefined`.

**Fix**: Normaliseer cart items na het ophalen van de API. Voeg een `normalizeCartItem` functie toe die:
- `unit_price` → `price`
- `product.name` → `title`
- `product.image` → `image`
- `variant?.title` → `variant_title`
- `line_total` → bewaar als extra veld
- Default `shipping`, `discount`, `tax`, `total` naar `0` als ze ontbreken

### Probleem 2: "Insufficient stock" voor sweater (backend configuratie)

De sweater-varianten hebben `stock: null` en `in_stock: true` in de API, maar de SellQo backend geeft toch "Insufficient stock" bij add-to-cart. **Dit is een configuratieprobleem in je SellQo project** - de voorraad moet correct worden ingesteld voor de varianten (of voorraadtracking moet worden uitgeschakeld).

### Probleem 3: Cadeaukaart op €0 (backend configuratie)

De cadeaukaart wordt toegevoegd aan de winkelwagen met `unit_price: 0` omdat het product in SellQo geen varianten/bedragen heeft. **Je moet in je SellQo project varianten aanmaken** met de bedragen (€5, €10, €25, etc.) zodat het gekozen bedrag correct wordt doorgestuurd.

---

### Wat ik nu kan fixen (frontend)

**Bestanden:**
- `src/integrations/sellqo/normalizer.ts` — toevoegen van `normalizeCart` en `normalizeCartItem` functies
- `src/integrations/sellqo/hooks.ts` — cart queries/mutations normaliseren na unwrap
- `src/integrations/sellqo/CartContext.tsx` — defensieve defaults voor ontbrekende velden

De normalisatie zal ervoor zorgen dat:
1. De CartDrawer niet meer crasht (geen wit scherm meer)
2. Items correct worden weergegeven met naam, afbeelding en prijs
3. Ontbrekende velden (shipping, discount, total) defaulten naar 0

### Wat jij moet doen in SellQo

1. **Sweater stock**: Stel voorraad in voor de varianten OF schakel voorraadtracking uit
2. **Cadeaukaart varianten**: Maak varianten aan per bedrag (€5, €10, €25, etc.) zodat het bedrag bij checkout correct is

