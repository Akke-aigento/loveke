# Loveke-muziekbibliotheek

Nummers die Loveke-reels automatisch gebruiken. Sinds 28 okt 2026 maakt Akke ze zelf in
**ElevenLabs Music** (betaald plan, commercieel gebruik op social media, geen naamsvermelding).
Gedeelde regels, prompts en het toevoegscript: `Akke-aigento/nomadix-socials`, `shared/MUZIEK.md`
(sectie Loveke) en `shared/music-add.mjs`:

```
node shared/music-add.mjs <pad-naar-loveke>/marketing/music <bestand> --title "<titel>" --mood warm,akoestisch --bpm 96 --prompt "<prompt>"
```

Doel: een reel met een nummer uit deze map gaat na "Week goedkeuren" vanzelf online, zoals een post.

## Regels

- Instrumentaal, ±30 s, nooit een artiest of bestaand nummer in de prompt.
- Andere bronnen mogen enkel als ze commercieel gebruik zonder naamsvermelding toelaten (bron-URL + licentie in `tracks.json`).
- Nooit commerciële hits of nummers uit de Instagram-app: die mogen we niet zelf onder een video mixen. Daarvoor is de stille versie ("Ik kies zelf muziek").
- Max 5 MB per nummer (het script controleert dat). Bestandsnaam: `<sfeer>-<titel>.mp3`.
- Een nummer niet twee reels na elkaar gebruiken; liefst niet vaker dan eens per maand
  (`used` in `tracks.json` houdt dat bij).
- Deze repo is publiek: de nummers zijn te downloaden. Aanvaard (28 okt), de reels zelf staan ook publiek.

## tracks.json

```json
{
  "file": "warm-zachte-ochtend.mp3",
  "title": "Zachte Ochtend",
  "artist": "ElevenLabs Music (gegenereerd voor Nomadix BV)",
  "source_url": "https://elevenlabs.io/music",
  "license": "ElevenLabs Music, betaald plan: commercieel gebruik incl. social media",
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
