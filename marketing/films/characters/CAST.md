# Cast — Akke & Nastya (Loveke-films en -strips)

Vastgelegd op 22-11-2026, op vraag van Akke: "heel gedetailleerd, steeds dezelfde mensen, enkel andere kleren en expressie."
Dit is de **enige bron** voor hoe de twee eruitzien. Elk beginbeeld, eindbeeld, stripvak of film gebruikt deze bladen als referentie. Gezichten en lichamen veranderen nooit, alleen kleren, kapsel-details (nat, wind) en expressie.

## Bladen (altijd meesturen als referentie)

| Bestand | Wat |
|---|---|
| `akke-nastya-sheet.jpg` | modelblad: allebei vooraan, schuin en profiel, volledig lichaam + drie hoofdstudies |
| `akke-expressies.jpg` | Akke: lachen, verliefd glimlachen, slaperig, verrast, vastberaden (lopend), ontroerd, pratend, neutraal |
| `nastya-expressies.jpg` | Nastya: lachen, verliefd glimlachen, slaperig, verrast, knipoog, ontroerd, pratend, neutraal |

Referentievolgorde in imgeditor (Nano Banana 2 Pro, 2K): 1 = het vak of beginbeeld van de scène, 2 = `akke-nastya-sheet.jpg`, 3 = het expressieblad van wie in beeld is. Hooguit 4 referenties.

## Vaste beschrijving (letterlijk in elke prompt)

**Akke (THE MAN):** long voluminous curly brown hair to the shoulders, full thick brown beard, warm brown eyes, friendly smile lines, athletic build, tanned skin.
**Nastya (THE WOMAN):** long straight blonde hair past the shoulders with a soft side part, light grey-blue eyes, round friendly face with rosy cheeks, small nose, slim.
**Stijl:** hand-drawn European comic style, clean ink outlines, soft painterly flat colors, warm natural light (zoals strip 1 en 2).
**Altijd:** "Their faces, hair, beard and proportions must match the attached CHARACTER MODEL SHEET exactly." en "Absolutely NO text anywhere." en "Never a green shirt."

## Kleerkast (enkel dit wisselt per scène)

| Naam | Akke | Nastya |
|---|---|---|
| zomer (strip 2) | black tank top, khaki cargo shorts, white sneakers | black puff-sleeve top, olive green skirt, black sneakers |
| thuis / ochtend | grey t-shirt | loose grey t-shirt |
| Loveke-merch | Loveke Classic Hoodie of Oversized Tee (productfoto als extra referentie) | idem |

Nieuwe outfit = nieuwe rij hier, met een referentiebeeld.

## Stemmen

Elk personage heeft één vaste ElevenLabs-stem (gekozen door Akke op 23-11), nooit de stem van het videomodel. Model `eleven_multilingual_v2`, `language_code: en`. Een nieuwe stem altijd eerst alleen aanroepen (anders 409).

| Personage | Stem | voice_id | Toon |
|---|---|---|---|
| Nastya | Marlena (Oekraïense moedertaal, spreekt Engels) | `W4ZBKBsXCMS1XKvLLTlU` | lief, warm, niet Amerikaans |
| Akke | Diederik (Vlaams, spreekt Engels) | `9kBSa5emtWArU7U0792v` | jong, Belgisch |
| Omroeper (luchthaven, station) | Daniel | `onwK4e9ZLuTAKqWW03F9` | neutraal, omroep |

Elke zin wordt na de montage met spraakherkenning nagekeken.

## Regels tegen drift (les van de pilot "Final call")

1. Elke shot heeft een **begin- én eindbeeld** gemaakt met deze bladen (imgeditor → Advanced Settings → End Frame).
2. **Geen inzooms of close-ups** die het model zelf moet verzinnen: een close-up maak je als eigen beginbeeld.
3. Negatieve prompt bij elke shot: `morphing face, changing face, different person, face distortion, beard changing, extra limbs, extra fingers, zoom in, text, letters, subtitles, watermark, music`.
4. Gebruik hooguit de eerste 5–6 s van een shot van 8 s, tenzij het eindbeeld vastligt.
5. Contactsheet per 1 s en de gezichten naast het modelblad leggen vóór de montage. Afwijkend = shot opnieuw.
