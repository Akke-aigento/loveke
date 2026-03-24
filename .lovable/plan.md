

## Plan: Strip-koop verwijderen

De strip is nu GRATIS bij de eerste kledingbestelling — de digitale/gedrukte verkoop wordt verwijderd.

### Wijzigingen

| Bestand | Wat |
|---|---|
| `src/pages/Comic.tsx` | Verwijder de hele "Purchase options" sectie (regels 56-70) met de twee CTA buttons voor digitaal/gedrukt kopen |
| `src/i18n/nl.json` | Verwijder `buyDigital` en `buyPrinted` uit de `comic` sectie (regels 132-133) |
| `src/i18n/en.json` | Hetzelfde voor Engels (regels 132-133) |
| `src/i18n/fr.json` | Hetzelfde voor Frans (regels 132-133) |

### Resultaat
- `/de-strip` pagina toont alleen de gallery en de "GRATIS bij je eerste bestelling!" banner
- Geen koopopties meer voor de strip zelf

