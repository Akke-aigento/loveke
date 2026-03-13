

## Footer: juridische links + SellQo settings

### Wijzigingen in `src/components/Footer.tsx`

**1. Juridische links kolom**
- Gebruik `useLegalPages()` hook om legal pages op te halen
- Filter op `enabled: true` (of toon alles wat terugkomt, API filtert al)
- Voeg een 5e kolom "Juridisch" toe in de footer grid (grid wordt `md:grid-cols-5`)
- Links gaan naar externe URL: `https://sellqo.app/shop/loveke/legal/{slug}`
- Opent in nieuw tabblad (`target="_blank"`)

**2. Social media dynamisch uit settings**
- Gebruik `useSocialLinks()` hook
- Vervang de hardcoded Instagram links door dynamische rendering
- Toon alleen iconen waarvoor een URL bestaat (niet null/leeg)
- Ondersteunde platformen: Instagram, Facebook, TikTok (lucide icons: `Instagram`, `Facebook`, `Music` voor TikTok — of een custom SVG)

**3. Grid layout aanpassing**
- Grid van `grid-cols-2 md:grid-cols-4` naar `grid-cols-2 md:grid-cols-5` om ruimte te maken voor de juridische kolom
- Logo/social kolom blijft `col-span-2 md:col-span-1`

### Bestaande hooks die direct bruikbaar zijn
- `useLegalPages()` → `pagesAPI.getLegal()` → `GET /pages?type=legal`
- `useSocialLinks()` → `settingsAPI.getSocial()` → `GET /settings/social`

Geen nieuwe API calls, hooks of types nodig — alles bestaat al.

