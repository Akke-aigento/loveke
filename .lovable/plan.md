

## Fix: FeaturedProducts toon X echte producten + rest als placeholders

### Doel
Fresh Drops en Loveke for Two secties moeten altijd een vast aantal slots tonen (4 en 2), waarbij beschikbare producten worden aangevuld met placeholders.

### Huidige situatie
- Code toont OF alleen producten (als er producten zijn)
- OF alleen placeholders (als er geen producten zijn)
- Geen mix mogelijk

### Gewenste situatie
- Fresh Drops: altijd 4 items (producten + placeholders)
- Loveke for Two: altijd 2 items (producten + placeholders)

### Implementatie in `src/components/FeaturedProducts.tsx`

1. Voeg slot constanten toe:
   ```typescript
   const FRESH_DROPS_SLOTS = 4;
   const COUPLE_SLOTS = 2;
   ```

2. Maak mixed arrays die producten + placeholders combineren:
   ```typescript
   const freshDropsItems = [
     ...featuredProducts.slice(0, FRESH_DROPS_SLOTS),
     ...Array(Math.max(0, FRESH_DROPS_SLOTS - featuredProducts.length)).fill(null)
   ];
   ```

3. Update render logica om null-check te doen:
   ```typescript
   {freshDropsItems.map((product, i) => 
     product 
       ? <ProductCard key={product.id} product={product} index={i} />
       : <CollectionPlaceholder key={`placeholder-${i}`} title="Fresh Drops" />
   )}
   ```

4. Zelfde logica toepassen voor Loveke for Two sectie

### Scope
Alleen `src/components/FeaturedProducts.tsx`, 1 bestand.

