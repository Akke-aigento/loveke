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
| `published/<JJJJ-MM-DD>/` | De JPG's die online gaan (datum = maandag; de launch staat in `published/launch/`). Wél in git: SellQo haalt ze op via de publieke raw-URL. |

**Waar Akke alles ziet en goedkeurt:** SellQo (tenant Loveke) → **Marketing → Social planning**.
Daar staan alle posts per week met beeld, tekst en uur. Akke keurt goed (los of per week);
SellQo publiceert goedgekeurde posts zelf op Instagram, elk uur op :01. Stories met een sticker
staan er als "Zelf posten" met een knop "Beeld openen" en "Gepost".

De post-kit (https://claude.ai/artifact/VgL27QQ5XbZc2rbLQ92enQ) was de werkwijze van de
launchweek en blijft staan als archief (onder meer de highlight-covers). Nieuwe weken komen
daar niet meer in.

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
5. **Publiceer de beelden**: kopieer de JPG's uit `out/<maandag>/` naar `published/<maandag>/` met een duidelijke naam (`post-ma-<onderwerp>.jpg`, `story-ma-<onderwerp>.jpg`). Commit en push dit naar `main` vóór stap 6: SellQo haalt de beelden op via `https://raw.githubusercontent.com/Akke-aigento/loveke/main/marketing/instagram/published/<maandag>/<bestand>.jpg`. Controleer één URL met `curl -sI` (200, `image/jpeg`).
6. **Zet de week in SellQo** met `query_database` (zelfde project). Eén `insert` voor alle items van de week, nooit `update` of `delete` op bestaande rijen:
   ```sql
   insert into social_posts (tenant_id, platform, media_type, status, source, post_text, image_urls, scheduled_for) values
   ('1671a91c-31fe-42ed-8a10-41f3117ceb50','instagram','image','pending_approval','content_task','<caption>',
    array['<raw-url>'], '<JJJJ-MM-DD> 18:00 Europe/Brussels'),
   ('1671a91c-31fe-42ed-8a10-41f3117ceb50','instagram','story','manual','content_task','Story: <wat Akke moet doen, welke sticker waar>',
    array['<raw-url>'], '<JJJJ-MM-DD> 18:05 Europe/Brussels');
   ```
   - Posts: `media_type` `image` (1 beeld) of `carousel` (2 tot 10 beelden, in volgorde), status `pending_approval`. **Nooit `approved`**: goedkeuren doet Akke.
   - Stories met een sticker: status `manual`. Een story zonder sticker mag `story` + `pending_approval` (dan post SellQo hem zelf).
   - Caption max 2200 tekens; enkele quotes verdubbelen (`''`). Maximaal 10 beelden per carousel; meer is een losse post of handwerk.
   - Controleer daarna met een `select` dat de rijen er staan, met het juiste uur in Brussel.
7. **Reminders**: maak per postdag een eenmalige geplande taak om 17:45 Brussel (pushmelding aan), naar het model van de launch-reminders (17–23 okt): één read-only `select status, error_message` op de post van die dag, één korte boodschap aan Akke volgens de status (gaat vanzelf online / staat online / wacht nog op goedkeuring / mislukt + reden), plus zijn deel van die dag (de story). De reminder zegt nooit "post dit zelf" voor een post die SellQo publiceert: dan staat hij dubbel online.
8. **Log en git**: voeg de week toe aan `log.md`, commit `weeks/<maandag>/` + `log.md` naar `main` van `Akke-aigento/loveke` (de map `out/` niet). Raak niets buiten `marketing/instagram/` aan.
9. **Meld** Akke in één korte boodschap: de onderwerpen van de week, dat ze klaarstaan in SellQo → Marketing → Social planning, en dat hij ze moet goedkeuren (knop "Week goedkeuren"). Zonder goedkeuring gaat er niets online.

## Wat SellQo wel en niet automatisch kan

- Automatisch: foto-posts, carousels (max 10) en stories zonder sticker, op het geplande uur. Een PNG wordt vanzelf naar JPEG omgezet.
- Handwerk: stories met poll-, link- of vraagsticker (de API kent geen stickers), highlights, reacties beantwoorden.
- Mislukt een post (bv. koppeling verlopen), dan staat hij op "Mislukt" in de Social planning en krijgt Akke een melding. De koppeling zit in SellQo Connect → Kanalen en verloopt na 60 dagen als ze niet ververst wordt; SellQo ververst ze elke nacht.
