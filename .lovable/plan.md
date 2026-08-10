# SHIP-GEO-FE-1 — Dynamische verzendlandenlijst in de checkout

De adresstap toont nu een vaste lijst (BE/NL/LU/DE/FR) in `CustomerAddressStep.tsx`.
Die verdwijnt; de toegestane landen komen voortaan uit de SellQo storefront-api.

## Wat de klant merkt

- De landen-dropdown toont alleen landen waar deze winkel echt naar verzendt.
- Bij precies één toegestaan land: geen dropdown maar een vaste regel ("Verzending naar: België").
- Wordt er tijdelijk nergens naartoe verzonden: duidelijke melding en geen "Verder"-knop.
- Landnamen in de actieve taal (NL/EN/FR), gesorteerd op die naam.
- Een eerder ingevuld land dat niet meer mag, springt automatisch naar het standaardland.

## Technische uitwerking

**1. API-call** — `src/integrations/sellqo/checkoutApi.ts`: `getShippingCountries()` via
het underscore-pad `/get_shipping_countries` (de proxy doet `segments.join('_')` →
action `get_shipping_countries`), POST, geen cart en geen auth. Response:
`{ countries: string[], unrestricted: boolean, default_country: string | null }`.

**2. Hook** — nieuwe `src/integrations/sellqo/useShippingCountries.ts` met react-query,
`staleTime` 5 minuten, één call bij mount van de adresstap. Levert
`{ countries, unrestricted, defaultCountry, isLoading, isError }`.

**3. Landnamen** — nieuwe helper `src/lib/shippingRegions.ts`:
`localizedCountryOptions(codes, locale)` gebruikt `Intl.DisplayNames(locale, { type: 'region' })`
met Nederlandse naam als fallback, sorteert op de gelokaliseerde naam en geeft
`{ code, name }` terug. Hier staat ook de volledige eigen landenlijst voor het
`unrestricted`-geval — één centrale bron, niet in de checkout-componenten.

**4. UI** — `CustomerAddressStep.tsx`, in `AddressFields`, de hardcoded `<option>`-lijst
vervangen:
- `unrestricted: true` → volledige lijst uit `shippingRegions.ts`.
- `unrestricted: false` → uitsluitend `countries`.
- Staat `addr.country` niet in de lijst → automatisch op `default_country` zetten
  (voor verzend- én factuuradres).
- Precies één land → vast label i.p.v. select.
- Lege lijst met `unrestricted: false` → melding en submit-knop verborgen.
- Faalt de call (netwerk) → de volledige fallbacklijst tonen zodat de checkout niet
  vastloopt; de server valideert alsnog.

**5. Geen eigen validatie** — er wordt niets extra geblokkeerd; fouten van
`checkout_shipping` gaan ongewijzigd via de bestaande `handleApiError` naar de klant.

**6. Opruimen** — de dode componenten `src/components/checkout/AddressStep.tsx` en
`src/components/checkout/CustomerStep.tsx` worden verwijderd: nergens geïmporteerd
(`Checkout.tsx` gebruikt alleen `CustomerAddressStep`) en ze bevatten nog een
hardcoded landenlijst.

**7. i18n** — nieuwe keys in `nl/en/fr.json`: `checkout.countryLabel`,
`checkout.shippingTo`, `checkout.noShippingAvailable`, `checkout.loadingCountries`.

**Slottaak** — role-audit entry `SHIP-GEO-FE-1`; typecheck groen. Geen backend- of
edge-function-wijziging nodig (de proxy-fallback dekt de nieuwe action al).

