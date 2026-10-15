# Loveke-muziekbibliotheek

Nummers die Loveke-reels automatisch mogen gebruiken. Akke kiest en downloadt ze zelf;
Claude zet ze hier met de licentie erbij en kiest per reel een nummer dat past.

## Regels

- Enkel nummers die **commercieel gebruikt mogen worden, zonder naamsvermelding**
  (bv. Pixabay Music, YouTube Audio Library met de filter "geen naamsvermelding vereist").
  Elk nummer heeft een bron-URL en de licentie in `tracks.json`; zonder die twee wordt het niet gebruikt.
- Nooit commerciële hits of nummers uit de Instagram-app hier zetten: die mogen we niet zelf
  onder een video mixen. Daarvoor is de stille versie ("Ik kies zelf muziek").
- Max ±5 MB per nummer (mp3 of m4a). Bestandsnaam: `<sfeer>-<titel>.mp3`, kleine letters, koppeltekens.
- Een nummer niet twee reels na elkaar gebruiken; liefst niet vaker dan eens per maand
  (`used` in `tracks.json` houdt dat bij).

## tracks.json

```json
{
  "file": "warm-zachte-ochtend.mp3",
  "title": "Zachte Ochtend",
  "artist": "…",
  "source_url": "https://…",
  "license": "Pixabay Content License",
  "attribution_required": false,
  "mood": ["warm", "akoestisch"],
  "bpm": 96,
  "duration": 142,
  "best_start": 8.5,
  "used": ["2026-11-01 reel-strip-bratislava"]
}
```

- `bpm` en `best_start` (waar het nummer goed op gang is, in seconden) meet Claude bij het toevoegen.
- `mood` komt uit: warm, akoestisch, vrolijk, pop, funk, lo-fi, chill, energiek, emotioneel, piano.

## Gebruik in een reel

1. Kies een nummer met de juiste sfeer dat het langst niet gebruikt is.
2. Zet in de reel-HTML de scèneduur op een veelvoud van de beat: `SCENE = 4 * 60 / bpm` (4 tellen).
3. `node marketing/instagram/reel.mjs <index.html> out/<maandag>/<naam> --music marketing/music/<file> --music-start <best_start>`
4. Voeg de reel en de datum toe aan `used`.
