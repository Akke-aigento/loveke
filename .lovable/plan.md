

## Analyse: SellQo Integratie Status

Na grondige inspectie van de code, console logs en network requests concludeer ik dat **de meeste problemen al opgelost zijn** in eerdere iteraties. Hier is de status:

### Wat al werkt

| Onderdeel | Status | Bewijs |
|-----------|--------|--------|
| API data ophalen | OK | Network requests geven 200 met correcte data |
| name → title mapping | OK | `normalizer.ts` regel 63 |
| images string[] → ProductImage[] | OK | `normalizer.ts` regel 22-29 |
| in_stock → stock_status | OK | `normalizer.ts` regel 57-58 |
| Collection name/image_url mapping | OK | `normalizer.ts` regel 88-96 |
| Route `/shop/:slug` | OK | `App.tsx` regel 37, user is op die pagina nu |
| Gift card "Vanaf €5.00" | OK | `ProductCard.tsx` regel 64-65 |
| Placeholder voor lege images | OK | `ProductCard.tsx` regel 42-45 |
| Variant mapping met attribute_values | OK | `normalizer.ts` regel 33-43 |
| extractArray/extractSingle helpers | OK | `client.ts` regel 27-58 |

### Wat nog verbeterd kan worden (minor)

1. **Redundantie opruimen**: De user vraagt om een `mappers.ts` bestand, maar `normalizer.ts` doet al exact hetzelfde. Geen duplicatie nodig.

2. **Related products met `image: null`**: De related products endpoint retourneert `{ image: null }` i.p.v. een images array. De normalizer vangt dit al op (regel 19-21), maar het product zonder images toont correct de placeholder.

3. **Console.logs verwijderen**: Per instructie laten we deze staan.

### Plan

**Geen wijzigingen nodig.** De bestaande `normalizer.ts` dekt alle mapping die in het `mappers.ts` voorstel staat. Alle componenten (Shop, ProductDetail, FeaturedProducts, ProductCard) gebruiken deze normalizer al correct. De routes werken, afbeeldingen laden, prijzen kloppen, en fallbacks zijn actief.

Als je specifieke visuele of functionele problemen ziet in de preview, beschrijf dan wat je ziet (screenshot of specifieke pagina) zodat ik gericht kan debuggen.

