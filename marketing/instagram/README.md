# Loveke Instagram — werkwijze en weekroutine

Alles om Loveke-posts te maken die er elke week hetzelfde uitzien. Een geplande taak
("Loveke IG: weekcontent") voert de **weekroutine** hieronder elke zondag uit. Een mens kan
dezelfde stappen volgen.

## Wat waar staat

| Pad | Wat |
| --- | --- |
| `brand.css` | Huisstijl: kleuren, lettertypes (lokaal, geen netwerk), `.wm` (verloop-wordmark), `.dots` (halftone), `.slot` (lege plek voor een Instagram-sticker). |
| `fonts/` | Lilita One (titels), DM Sans (tekst), Caveat (handgeschreven accenten). |
| `launch/` | De 9 posts, 7 stories en 7 highlight-covers van de launchweek (15–23 okt 2026). Gebruik ze als voorbeeld en sjabloon. |
| `weeks/<JJJJ-MM-DD>/` | Eén map per week (datum = maandag), met de HTML-bronnen van die week. |
| `out/` | Gerenderde JPG's (niet nodig in git; mag opnieuw gemaakt worden). |
| `render.mjs` | Rendert elke `.html` in een map naar JPG op het formaat uit `<meta name="loveke-size">`. |
| `log.md` | Wat er al gepost is, per week. Lees dit vóór je nieuwe content bedenkt: niets herhalen. |
| `../product-photos/` | Productfoto's (PNG met transparante achtergrond, 1000×1000), van SellQo. |
| `../../src/assets/comic/strip-1..12.webp` | De strip (Engelstalig), 896×1200. |

**Post-kit (de pagina die Akke gebruikt):** https://claude.ai/artifact/VgL27QQ5XbZc2rbLQ92enQ
Die pagina leest `kit.json` en de beelden onder `img/`. Een nieuwe week = een nieuw blok in
`kit.json` + nieuwe beelden, opnieuw gepubliceerd naar dezelfde URL. Elke dag heeft een anker
`#d-JJJJ-MM-DD` waar de reminder naartoe linkt.

## Huisstijl in het kort

- Kleuren: crème `#FFF8F0`, zwart `#1A1A1A`, oranje `#FF7033`, geel `#FFD43D`, rood `#E3404B`, roze `#FF85A1`.
- Titels in Lilita One, korte tekst in DM Sans, één handgeschreven regel in Caveat per beeld.
- Sticker-look: dikke zwarte rand (5–6 px), harde schaduw `10px 10px 0 #1A1A1A`, licht gedraaid (±2–4°).
- Formaten: post 1080×1350, story 1080×1920 (bovenaan 250 px en onderaan 340 px vrij laten), highlight 1080×1080.
- Geen emoji in de beelden (wel in captions). Icoontjes als inline SVG.
- Taal: Nederlands (Vlaams, warm, kort). De tagline "Born from Love. Worn on the Street." blijft Engels.

## Wat we wel en niet zeggen

- **Prijzen en materialen** altijd uit SellQo halen (zie stap 2), nooit uit het hoofd.
- "Biologisch katoen" enkel bij een product waarvan de omschrijving dat zegt (tee: 100%; hoodie: 80% bio + 20% gerecycleerd polyester). Nooit "duurzaam", "eco" of "groen" in het algemeen (Europese regels tegen greenwashing, sinds 27-09-2026).
- "Belgisch merk" mag; "Made in Belgium" of "gedrukt in België" niet.
- Levertijd: gemaakt op bestelling, 5 tot 20 werkdagen, gratis verzending.
- Loveke for Two: automatisch 7% vanaf 2 stuks, geen code.
- Strip-beelden met een sigaret niet gebruiken voor betaalde advertenties.

## Contentpijlers (wissel ze af)

1. **Verhaal**: een moment uit de strip of uit "Ons verhaal" (Bratislava, de trein, Mukachevo, Kyiv, de afstand).
2. **Product**: één product, echte foto, prijs en één concreet detail uit de omschrijving.
3. **Samen**: vraag, poll, "tag je Loveke", reacties of foto's van klanten (als die er zijn).
4. **Merk**: gemaakt op bestelling, maatgids, cadeaukaart, Loveke for Two, achter de schermen.

## Weekroutine (elke zondag, voor de week vanaf maandag)

1. **Lees** `log.md` en de laatste week in `weeks/` (of `launch/`). Kies 3 posts (maandag, woensdag, vrijdag) uit verschillende pijlers en minstens één product. Herhaal geen beeld of caption uit het log.
2. **Haal live data** via de Lovable-connector, `query_database` op project `9932a7fe-43a1-42de-9c64-168968599600`:
   `select name, slug, short_description, (select min(price) from product_variants v where v.product_id=p.id and v.is_active) prijs from products p where tenant_id='1671a91c-31fe-42ed-8a10-41f3117ceb50' and is_active and not hide_from_storefront;`
   Nieuwe producten zonder foto in `../product-photos/`? Gebruik een strip- of typografisch beeld en meld het aan Akke.
3. **Maak** per post één HTML in `weeks/<maandag>/` (`post-ma.html`, `post-wo.html`, `post-vr.html`) en per post één story (`story-ma.html` …), naar het voorbeeld van `launch/`. Elke file begint met `<meta name="loveke-size" content="1080x1350">` (of `1080x1920`) en `<link rel="stylesheet" href="../../brand.css">`. Paden naar foto's: `../../../product-photos/…`, naar de strip: `../../../../src/assets/comic/…`.
4. **Render**: `PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node marketing/instagram/render.mjs marketing/instagram/weeks/<maandag> marketing/instagram/out/<maandag>` en bekijk elk beeld één keer (tekst niet afgesneden, niets overlapt).
5. **Kit bijwerken**: lees de kit (`Artifact` action `read` op de URL hierboven), voeg in `kit.json` een week toe (`weeks[]`, met per dag `id: "d-JJJJ-MM-DD"`, `date`, `title`, `kind`, `images`, `caption`, `story`, `todo`), zet de JPG's onder `img/<maandag>/` en publiceer `kit.json` + de nieuwe beelden naar dezelfde URL (bestaande bestanden blijven staan).
6. **Reminders**: maak per postdag een eenmalige geplande taak om 17:45 Brussel (pushmelding aan), met de titel, het anker `…#d-JJJJ-MM-DD` en wat Akke moet doen, naar het model van de launch-reminders.
7. **Log en git**: voeg de week toe aan `log.md`, commit `weeks/<maandag>/` + `log.md` naar `main` van `Akke-aigento/loveke` (de map `out/` niet). Raak niets buiten `marketing/instagram/` aan.
8. **Meld** Akke in één korte boodschap: de 3 onderwerpen van de week en de link naar de kit.

## Volledig automatisch posten (nog niet actief)

Kan later via de Instagram Graph API (`instagram_content_publish`): Loveke-account als
professioneel account gekoppeld aan een Facebook-pagina, een Meta-app en een langlevend token in
de secrets van het Loveke-project, plus een edge function die op het geplande moment de JPG-URL +
caption publiceert. Stories met stickers (poll, link, vraag) kunnen niet via de API; die blijven
handwerk. Tot dan: Meta Business Suite plant posts gratis in, voor een hele week tegelijk.
