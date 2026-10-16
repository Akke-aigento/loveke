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
| `recipe.mjs` | Maakt van een post-HTML met `data-slot`-tekstvakken een recept (`.recipe.json`) voor "Tekst in beeld aanpassen" in SellQo. |
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
- **Engels enkel op aanvraag** (Akke, 15-10): standaard is alles Nederlands. Vraagt Akke een Engelse post (in de chat of via "Opnieuw maken" met taal English), dan is de caption én de tekst in het beeld Engels (internationaal, warm, kort; geen Vlaamse woorden behalve "Loveke"). Vul altijd de kolom `language` in (`nl` of `en`).

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

1. **Lees** `log.md` en de laatste week in `weeks/` (of `launch/`). Kies 3 posts (maandag, woensdag, vrijdag) uit verschillende pijlers en minstens één product. Herhaal geen beeld of caption uit het log. **Hier en daar een carousel** (Akke, 16-10): ongeveer om de week is één van de 3 posts een carousel, zie "Carousels" hieronder. Nooit meer dan één carousel per week, en noteer in het log welke post een carousel was.
2. **Haal live data** via de Lovable-connector, `query_database` op project `9932a7fe-43a1-42de-9c64-168968599600`:
   `select name, slug, short_description, (select min(price) from product_variants v where v.product_id=p.id and v.is_active) prijs from products p where tenant_id='1671a91c-31fe-42ed-8a10-41f3117ceb50' and is_active and not hide_from_storefront;`
   Nieuwe producten zonder foto in `../product-photos/`? Gebruik een strip- of typografisch beeld en meld het aan Akke.
3. **Maak** per post één HTML in `weeks/<maandag>/` (`post-ma.html`, `post-wo.html`, `post-vr.html`) en per post één story (`story-ma.html` …), naar het voorbeeld van `launch/`. Elke file begint met `<meta name="loveke-size" content="1080x1350">` (of `1080x1920`) en `<link rel="stylesheet" href="../../brand.css">`. Paden naar foto's: `../../../product-photos/…`, naar de strip: `../../../../src/assets/comic/…`.
   **Plus één reel per week** (zondag 19:00), zie "Reels" hieronder.
3b. **Tekstvakken markeren** (SOCIAL-4): geef elk tekstelement dat Akke later mag aanpassen `data-slot="<sleutel>" data-label="<Label>" data-max="<max tekens>"` (`data-multiline="true"` als er een `<br>` in mag). Enkel platte tekst in zo'n element (geen geneste opmaak); zet een vast stukje opmaak (bv. "1." of "vanaf") in een apart element ernaast. `data-max` ≈ wat nog mooi past in het ontwerp (meestal 1,4 × de huidige lengte). Geen scripts of on…-attributen.
4. **Render**: `PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node marketing/instagram/render.mjs marketing/instagram/weeks/<maandag> marketing/instagram/out/<maandag>` en bekijk elk beeld één keer (tekst niet afgesneden, niets overlapt). De reel met `reel.mjs` (zie "Reels").
4b. **Recept**: `node marketing/instagram/recipe.mjs weeks/<maandag>/post-*.html weeks/<maandag>/story-*.html` → `<naam>.recipe.json` naast elke HTML. Commit die mee.
5. **Publiceer de beelden**: kopieer de JPG's (en MP4's) uit `out/<maandag>/` naar `published/<maandag>/` met een duidelijke naam (`post-ma-<onderwerp>.jpg`, `story-ma-<onderwerp>.jpg`, `reel-<onderwerp>-muziek.mp4`, `reel-<onderwerp>-stil.mp4`, `reel-<onderwerp>-cover.jpg`). Commit en push dit naar `main` vóór stap 6: SellQo haalt de bestanden op via `https://raw.githubusercontent.com/Akke-aigento/loveke/main/marketing/instagram/published/<maandag>/<bestand>`. Controleer elke URL met `curl -sI` (200).
6. **Zet de week in SellQo** met `query_database` (zelfde project). Eén `insert` voor alle items van de week, nooit `update` of `delete` op bestaande rijen:
   ```sql
   insert into social_posts (tenant_id, platform, media_type, status, source, manual_reason, language, post_text, image_urls, scheduled_for) values
   ('1671a91c-31fe-42ed-8a10-41f3117ceb50','instagram','image','pending_approval','content_task',null,'nl','<caption>',
    array['<raw-url>'], '<JJJJ-MM-DD> 18:00 Europe/Brussels'),
   ('1671a91c-31fe-42ed-8a10-41f3117ceb50','instagram','story','manual','content_task','sticker','nl','Story: <wat Akke moet doen, welke sticker waar>',
    array['<raw-url>'], '<JJJJ-MM-DD> 18:05 Europe/Brussels');
   ```
   - Posts: `media_type` `image` (1 beeld) of `carousel` (2 tot 10 beelden, in volgorde), status `pending_approval`. **Nooit `approved`**: goedkeuren doet Akke.
   - Stories met een sticker: status `manual`, `manual_reason` `sticker`. Een story zonder sticker mag `story` + `pending_approval` (dan post SellQo hem zelf).
   - Reel: zie "Reels" voor de kolommen.
   - Recept: voeg `image_recipes` toe als `jsonb_build_array($r$<inhoud van .recipe.json>$r$::jsonb)` (één element per beeld, in dezelfde volgorde als `image_urls`; `null` voor een beeld zonder recept). Reels krijgen geen recept.
   - Caption max 2200 tekens; enkele quotes verdubbelen (`''`). Maximaal 10 beelden per carousel; meer is een losse post of handwerk.
   - Controleer daarna met een `select` dat de rijen er staan, met het juiste uur in Brussel.
7. **Herinneringen doet SellQo zelf.** Voor alles op `manual` krijgt Akke ±1 uur vooraf een melding met push (SOCIAL-3). Maak dus **geen** losse geplande herinneringstaken meer.
8. **Log en git**: voeg de week toe aan `log.md` (ook de reel en welk nummer), commit `weeks/<maandag>/`, `published/<maandag>/`, `log.md` en eventueel `../music/tracks.json` (`used`) naar `main` van `Akke-aigento/loveke` (de map `out/` niet).
9. **Meld** Akke via een SellQo-melding (die geeft ook een push) en één korte boodschap:
   ```sql
   insert into notifications (tenant_id, category, type, priority, title, message, action_url, data) values
   ('1671a91c-31fe-42ed-8a10-41f3117ceb50','marketing','social_posts_ready','medium',
    'Week van <d mmm> klaar: <n> posts','<onderwerpen, kort>. Keur ze goed in de Social planning.','/admin/marketing/social','{}'::jsonb);
   ```
   Zonder goedkeuring gaat er niets online.

## Carousels

Een carousel is een post met 2 tot 10 beelden (1080×1350, allemaal hetzelfde formaat). Ideaal 4 tot 7 slides.

- **Wanneer**: als een onderwerp meer is dan één beeld. Voorbeelden: een strip-hoofdstuk (bv. p. 9-10 met een cover ervoor), een product van dichtbij (foto, detail, maat, "zo draag je hem"), "5 dingen over Loveke", maatgids in stappen, achter de schermen (van bestelling tot pakje), Loveke for Two uitgelegd.
- **Opbouw**: slide 1 is de haak (grote titel, lees-verder-gevoel, klein pijltje "swipe" rechtsonder in Caveat). Middenslides: één idee per slide, weinig tekst. Laatste slide: afsluiter met oproep (loveke.be, "bewaar dit", "tag je Loveke"). Zelfde achtergrond- of kleurlogica over alle slides, zodat het één geheel is.
- **Bestanden**: `weeks/<maandag>/post-<dag>-1.html` … `post-<dag>-<n>.html`, gerenderd en gepubliceerd als `post-<dag>-<onderwerp>-1.jpg` … in volgorde.
- **In SellQo**: `media_type` `carousel`, `image_urls` in volgorde, `image_recipes` met één recept per slide in dezelfde volgorde. Caption verwijst naar het swipen ("Swipe →").

## Reels

Eén per week, zondag 19:00. Afwisselen tussen formats (zie het log, nooit twee keer na elkaar hetzelfde):
strip-verhaal (een hoofdstuk geanimeerd), product-drop, typografisch (zin woord per woord), slideshow op de beat,
POV/meme met strippanelen, of montage van clips die Akke doorstuurt.

- **Bron**: `weeks/<maandag>/reel-<onderwerp>/index.html` met `<meta name="loveke-reel" content="1080x1920" data-duration="<s>" data-fps="30">` en een `window.setT(t)` die alles deterministisch op tijdstip t zet (voorbeeld: `weeks/2026-10-19/reel-kyiv/`). 12 tot 25 seconden; tekst binnen de veilige zone (boven 220 px en onder 380 px vrij laten).
- **Muziek**: kies een nummer uit `../music/` (zie de README daar) en zet de scèneduur op de beat. Is de bibliotheek nog leeg, dan enkel de stille versie.
- **Render**: `PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node marketing/instagram/reel.mjs <index.html> out/<maandag>/reel-<onderwerp> --music ../music/<file> --music-start <best_start>` → `-stil.mp4` en `-muziek.mp4` (elk < 9,5 MB). Cover: `ffmpeg -ss <s> -i <stil.mp4> -frames:v 1 -q:v 2 reel-<onderwerp>-cover.jpg` (een sterk beeld met de titel).
- **Bekijk** vóór je verdergaat 6 tot 8 stills (begin, elke scène, eindkaart): niets afgesneden, tekst leesbaar.
- **In SellQo**:
  ```sql
  insert into social_posts (tenant_id, platform, media_type, status, source, language, post_text, image_urls, video_url, video_silent_url, music_hint, scheduled_for) values
  ('1671a91c-31fe-42ed-8a10-41f3117ceb50','instagram','reel','pending_approval','content_task','nl','<caption>',
   array['<raw-url cover.jpg>'], '<raw-url -muziek.mp4>', '<raw-url -stil.mp4>',
   '{"songs":[{"title":"<titel>","artist":"<artiest>","note":"<waarom / vanaf waar>"},{"title":"…","artist":"…"},{"title":"…","artist":"…"}],"mood":"warm, akoestisch","bpm":100,"tip":"Laat het refrein starten bij het perron (0:09).","track":{"title":"<bibliotheeknummer>","license":"<licentie>"}}'::jsonb,
   '<zondag> 19:00 Europe/Brussels');
  ```
  **Songvoorstellen (verplicht, 3 concrete nummers):** zoek elke week met WebSearch naar de actuele trending audio voor Instagram Reels (bv. "trending Instagram Reels songs <maand> <jaar>") en lees één of twee lijsten van deze week. Kies 3 nummers die bij de sfeer van de reel passen, met titel én artiest, plus in `note` waarom en vanaf waar. Voorkeur voor nummers die de bron als bruikbaar voor zakelijke accounts noemt of voor "original audio"; commerciële hits zijn voor zakelijke accounts vaak niet beschikbaar. Verzin nooit een titel: enkel nummers die je in een bron van deze week of met zekerheid kent. Noteer de bron-URL in het log.
  Zonder bibliotheeknummer: `video_url` null, status `manual`, `manual_reason` `music`. Akke kiest in de planning "Goedkeuren (automatisch)" (met het bibliotheeknummer) of "Ik kies zelf muziek" (stille versie + herinnering).
  `search_terms` (optioneel) blijft bruikbaar als extra zoekwoorden naast de 3 songs.

## Opnieuw maken (verzoeken uit de Social planning)

Akke kan bij elke post "Opnieuw maken" kiezen, met een optionele opmerking. De post krijgt dan
status `regenerate_requested` (met `regenerate_note` en `regenerate_from`). De geplande taak
"Social: opnieuw maken" pikt die elk uur (8–22 u) op:
- Zelfde dag en uur, zelfde soort (post/story/reel), tenzij de opmerking iets anders vraagt.
- Taal: `regenerate_language` als dat ingevuld is (bv. `en` = caption én beeldtekst in het Engels), anders de huidige `language`. Zet `language` op de taal van de nieuwe versie.
- Heeft Akke de tekst in het beeld al aangepast (het recept in `image_recipes` verschilt van de `.recipe.json` in de repo), vertrek dan van de teksten in het recept uit SellQo.
- Houd rekening met de opmerking en met het log (geen dubbels), maak het nieuwe beeld, push het naar `published/<maandag>/` met een nieuwe naam (`…-v2.jpg`).
- Werk **die ene rij** bij (dit is de enige `update` die mag): nieuwe `post_text`, `image_urls`/video-kolommen, `music_hint`, `image_recipes` (nieuw recept); `status` = `regenerate_from` als dat `manual` was, anders `pending_approval`; `regenerate_note`, `regenerate_requested_at`, `regenerate_from`, `regenerate_language`, `reminded_at`, `approved_at`, `approved_by` en `error_message` op null; `publish_attempts` 0.
- Pas het log aan en stuur een melding `social_posts_ready` ("Nieuwe versie klaar: <onderwerp>").

## Wat SellQo wel en niet automatisch kan

- Automatisch: foto-posts, carousels (max 10), stories zonder sticker en reels (MP4 tot 10 MB, met bibliotheekmuziek), op het geplande uur. Een PNG wordt vanzelf naar JPEG omgezet; video's worden naar de SellQo-opslag gekopieerd.
- Handwerk: stories met poll-, link- of vraagsticker (de API kent geen stickers), reels met een nummer uit de Instagram-app, highlights, reacties beantwoorden. SellQo stuurt een herinnering ±1 uur vooraf.
- Mislukt een post (bv. koppeling verlopen), dan staat hij op "Mislukt" in de Social planning en krijgt Akke een melding. De koppeling zit in SellQo Connect → Kanalen en verloopt na 60 dagen als ze niet ververst wordt; SellQo ververst ze elke nacht.
