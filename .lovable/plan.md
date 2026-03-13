

## Plan: Fix cadeaukaart link (verkeerde slug)

### Probleem
De slug `cadeaukaart` bestaat niet in SellQo. Op de screenshots is te zien dat het echte product leeft op `/shop/loveke-cadeaukaart`. Alle links en de redirect wijzen nu naar de verkeerde slug.

### Oplossing
Vervang `cadeaukaart` door `loveke-cadeaukaart` op alle plekken:

| Bestand | Wat wijzigt |
|---|---|
| `src/pages/Index.tsx` | Link `to` → `/shop/loveke-cadeaukaart` |
| `src/components/Footer.tsx` | Link `to` → `/shop/loveke-cadeaukaart` |
| `src/App.tsx` | Navigate redirect → `/shop/loveke-cadeaukaart` |

Drie regels, drie bestanden. Geen andere wijzigingen nodig.

