

## Plan: QR Betaling tusschenpagina

### Wat wijzigt

In plaats van direct naar `/bedankt` te navigeren bij QR-betaling, komt er een tussenpagina `/checkout/qr-betaling` die de QR-code toont met instructies. Pas na "Ik heb betaald" gaat de gebruiker naar `/bedankt`.

### Bestanden

| Bestand | Actie |
|---|---|
| `src/pages/QRPayment.tsx` | **Nieuw** — tussenscherm met EPC QR-code, bedrag, bestelnummer, instructies, bankgegevens fallback, en "Ik heb betaald" knop |
| `src/contexts/CheckoutContext.tsx` | Wijzig case `'qr'` (regel 263-275): navigate naar `/checkout/qr-betaling` i.p.v. `/bedankt`, met `bankDetails` toevoegen aan state |
| `src/App.tsx` | Nieuwe lazy-loaded route `/checkout/qr-betaling` → `QRPayment` |

### QRPayment.tsx inhoud

- Leest `orderNumber`, `total`, `currency`, `qrData`, `bankDetails` uit `location.state`
- Genereert EPC QR-code client-side uit `qrData.payload` (met `qrcode` npm package of canvas-based generator)
- Fallback: als `qrData.image_url` beschikbaar is, toon die als `<img>`
- Toont:
  - Grote QR-code (centraal)
  - Bedrag en bestelnummer
  - Stap-voor-stap instructies ("1. Open je bankapp → 2. Kies QR scannen → 3. Scan en bevestig")
  - Bankgegevens als fallback sectie (IBAN, rekeninghouder, mededeling)
  - "Ik heb betaald" knop → `navigate('/bedankt', { state: { paymentType: 'qr', orderNumber, ... } })`
- Redirect naar `/shop` als er geen state is (directe URL-toegang)

### Dependencies

- `qrcode` package toevoegen voor client-side QR generatie uit EPC payload string

