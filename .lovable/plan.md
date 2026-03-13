

## Plan: Pagina laadsnelheid verbeteren

### Probleem
Bij het laden worden alle pagina's en componenten in 1 bundel geladen, en er worden 7+ API calls tegelijk afgevuurd waarvan sommige dubbel zijn (bijv. `/settings` EN `/settings/social` terwijl `/settings` al social data bevat).

### Optimalisaties

**1. Code splitting met React.lazy (App.tsx)**
- Alle route-pagina's (Shop, ProductDetail, Story, Comic, SizeGuide, Contact, Bedankt, NotFound) lazy importeren
- Wrap Routes in `<Suspense>` met een minimale loading spinner
- Index pagina blijft eager (is de landingspagina)

**2. Dubbele API call elimineren (Footer.tsx + NewsletterSignup.tsx)**
- Footer en NewsletterSignup gebruiken allebei `useStorefrontSettings()` + Footer gebruikt ook `useSocialLinks()` apart
- `/settings` response bevat al `social` data -- verwijder de aparte `useSocialLinks()` call uit Footer
- Gebruik `settings.social` rechtstreeks uit de `useStorefrontSettings()` response

**3. Settings + Legal prefetchen bij app start (App.tsx)**
- Voeg `/settings` en `/legal` toe aan `AppPrefetcher`, zodat Footer data al in cache zit wanneer die rendert
- Dit voorkomt waterfall: nu wacht Footer op mount voordat het fetcht

**4. Lazy load below-the-fold componenten op Index pagina (Index.tsx)**
- `ComicBanner`, `NewsletterSignup`, `StoryTeaser` lazy importeren
- Wrap in Suspense zodat ze pas laden wanneer nodig

### Bestanden die wijzigen
- `src/App.tsx` -- lazy imports + Suspense + prefetch settings/legal
- `src/components/Footer.tsx` -- gebruik settings.social i.p.v. aparte useSocialLinks()
- `src/pages/Index.tsx` -- lazy load below-fold componenten

### Technisch detail
```text
VOOR:                          NA:
Bundle: 1 groot bestand        Bundle: main + 8 lazy chunks
API calls: 7 parallel          API calls: 5 parallel (2 dubbele weg)
Footer wacht op mount          Footer data al prefetched
```

