

## Probleem

Er zijn twee aparte cadeaukaart-flows:

1. **`/cadeaubon`** → `GiftCards.tsx` — standalone pagina met basale bedragselectie + e-mail + `usePurchaseGiftCard` API call
2. **`/shop/cadeaukaart-*`** → `GiftCardDetail.tsx` — product-gebaseerde flow met bedragselectie + direct toevoegen aan winkelwagen

De SellQo-referentie gebruikt een **3-stappen flow**: Bedrag → Ontvanger (naam, e-mail, bericht, verzenddatum) → Bevestiging. Dit moet de standaard worden.

## Oplossing

Eén uniforme flow via het product, verrijkt met de SellQo cadeaukaart-stappen. Behoud Loveke's visuele stijl.

### Wijzigingen

#### 1. Redirect `/cadeaubon` naar het cadeaukaart-product

In `src/App.tsx`: vervang de `GiftCards` route door een redirect naar `/shop/cadeaukaart` (de slug van het cadeaukaart-product in SellQo). Dit elimineert de dubbele flow.

#### 2. Upgrade `GiftCardDetail.tsx` met 3-stappen flow

Herschrijf de component naar een multi-step flow in Loveke-stijl:

- **Stap 1 — Bedrag**: Preset bedragen (€5–€100) + custom bedrag optie (bestaande UI, behouden)
- **Stap 2 — Ontvanger**: Naam, e-mailadres, persoonlijk bericht (textarea, max 500 chars), verzenddatum (datepicker, optioneel — "Direct versturen" als default)
- **Stap 3 — Bevestiging**: Overzicht van bedrag, ontvanger, bericht + "Toevoegen aan winkelwagen" knop

Stap-indicator bovenaan (vergelijkbaar met SellQo maar in Loveke-stijl: ronde badges met nummers).

De `addItem` call stuurt de gift card metadata mee (recipient, message, sendDate) als onderdeel van de cart item.

#### 3. Saldo-checker onderaan behouden

Verplaats de balance-check UI (code invoer + saldo tonen) van `GiftCards.tsx` naar onderaan `GiftCardDetail.tsx`, onder de 3-stappen flow. Gebruik `useCheckGiftCardBalance` hook.

#### 4. Opruimen

Verwijder `src/pages/GiftCards.tsx` (niet meer nodig). Verwijder de import in `App.tsx`.

### Bestanden

- **Wijzigen**: `src/components/GiftCardDetail.tsx` (3-stappen flow + balance checker)
- **Wijzigen**: `src/App.tsx` (redirect `/cadeaubon` → `/shop/cadeaukaart`)
- **Verwijderen**: `src/pages/GiftCards.tsx`

### Flow diagram

```text
Homepage "Cadeaubon" link
        │
        ▼
  /cadeaubon ──redirect──▶ /shop/cadeaukaart
                                  │
                                  ▼
                          GiftCardDetail.tsx
                          ┌─────────────────┐
                          │ Stap 1: Bedrag  │
                          │ €5 €10 ... €100 │
                          │ [Custom bedrag]  │
                          ├─────────────────┤
                          │ Stap 2: Ontv.   │
                          │ Naam, Email,    │
                          │ Bericht, Datum  │
                          ├─────────────────┤
                          │ Stap 3: Bevestig│
                          │ Overzicht + ATC │
                          ├─────────────────┤
                          │ ── Saldo check ─│
                          │ [Code] [Check]  │
                          └─────────────────┘
```

