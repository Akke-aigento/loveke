

## Status Overzicht Loveke Website

De site is al behoorlijk compleet. Hier is wat ik gevonden heb na een grondige doorlichting:

### Wat al werkt
- Homepage met hero, USP marquee, story teaser, featured products, comic banner, cadeaubon teaser, social wall, newsletter
- Shop met filters, sortering, collecties
- Productdetail met varianten, reviews, gerelateerde producten
- Cadeaukaart flow
- Winkelwagen + checkout via SellQo
- Contact formulier
- Verhaal pagina, Strip pagina, Maatgids
- Bedankt-pagina met orderoverzicht
- Cookie banner, meertaligheid (NL/EN/FR), scroll-to-top
- SEO meta tags, OG images
- Lazy loading en prefetching

### Wat nog verbeterd kan worden

| # | Item | Impact |
|---|---|---|
| 1 | **Console warning fixen**: `ProductCard` krijgt een ref maar heeft geen `forwardRef` — veroorzaakt React warnings | Klein maar professioneel |
| 2 | **404 pagina upgraden**: Huidige is generic Engels tekst, terwijl er mooie vertaalde content klaarstaat in `nl.json` (`notFound.*`) die niet gebruikt wordt | Branding |
| 3 | **Social Wall met echte Instagram posts**: Nu zijn het placeholder emoji's — kan vervangen worden door echte feed of statische foto's | Visueel |
| 4 | **Favicon updaten**: Nog standaard `favicon.ico` — eigen Loveke logo/icoon plaatsen | Branding |
| 5 | **OG meta tags per pagina**: Nu alleen globaal in `index.html`, niet dynamisch per route (shop, product, verhaal) | SEO |
| 6 | **Betaalicoontjes in footer**: Nu platte tekst "Visa Mastercard Bancontact" — echte SVG-icoontjes zien er professioneler uit | Polish |
| 7 | **Mobile menu: taal-switcher positie** en animatie sluiten bij klik buiten menu | UX |
| 8 | **Performance: console.log's verwijderen** in productie code (Shop.tsx, ProductDetail.tsx) | Cleanup |

### Aanbevolen volgorde

1. **404 pagina** — snelle win, content is al vertaald
2. **ProductCard forwardRef** — fixt console warning
3. **Console.log cleanup** — productie-ready maken
4. **Betaalicoontjes** — visuele polish
5. **Social Wall** — echte foto's of Instagram embed
6. **OG meta per pagina** — SEO boost

Geen van deze is een blokker — de site is functioneel klaar om te publishen. Dit zijn polish-items om van 90% naar 100% te gaan.

