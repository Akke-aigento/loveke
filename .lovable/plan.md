

## Plan: Fix "Geef een cadeau" knop

### Probleem
De knop op de homepage linkt naar `/cadeaubon`, wat een `<Navigate>` redirect doet naar `/shop/cadeaukaart`. Dit veroorzaakt een zichtbare redirect (URL verandert twee keer, mogelijk flash).

### Oplossing
Verander de `<Link to="/cadeaubon">` in `src/pages/Index.tsx` naar `<Link to="/shop/cadeaukaart">` zodat de navigatie direct is zonder redirect.

Doe hetzelfde voor de footer link in `src/components/Footer.tsx`.

De `/cadeaubon` route in `App.tsx` kan blijven bestaan als fallback voor externe links/bookmarks.

### Bestanden
- `src/pages/Index.tsx` — wijzig Link to van `/cadeaubon` naar `/shop/cadeaukaart`
- `src/components/Footer.tsx` — idem

