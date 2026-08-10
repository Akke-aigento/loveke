# Role audit

## LOVEKE-PHONE-1 (Deel C) — telefoonveld verplicht + disclaimer in Loveke checkout

Frontend sluit aan op de backend-afdwinging uit Deel A (SellQo storefront-api tenant-vlag `checkout_phone_required=true` voor Loveke).

- `src/components/checkout/CustomerAddressStep.tsx`: telefoonveld verplicht (asterisk + `required`), client-side inline validatie via `checkout.phoneRequired`, muted disclaimer via `checkout.phoneDisclaimer`.
- `src/i18n/{nl,en,fr}.json`: nieuwe `checkout.phoneRequired` en `checkout.phoneDisclaimer` keys.
