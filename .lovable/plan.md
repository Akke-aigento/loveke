

## Plan: Debug log toevoegen aan QR betaalpagina

### Analyse

De volledige keten is al correct geïmplementeerd:

| Stap | Code | Status |
|---|---|---|
| Proxy | Geeft raw API response door | ✅ |
| `sellqoFetch` | Returns parsed JSON | ✅ |
| `extractData` | Unwrapt `{ data: ... }` → inner object | ✅ |
| `completeCheckout` case 'qr' | Geeft `data.qr_data` + `data.bank_details` door aan navigate | ✅ |
| `QRPayment.tsx` | Leest `qrData` + `bankDetails` uit `location.state` | ✅ |

Er is geen bug in de frontend keten. De data wordt correct doorgegeven van API response → navigate state → QR pagina.

### Enige wijziging

**`src/pages/QRPayment.tsx`** — Voeg een `useEffect` debug log toe zodat bij eventuele problemen direct zichtbaar is wat de pagina ontvangt:

```typescript
useEffect(() => {
  console.log('[QR Payment] page state:', {
    orderNumber: state.orderNumber,
    total: state.total,
    currency: state.currency,
    qrData: state.qrData,
    bankDetails: state.bankDetails,
  });
}, []);
```

Dit is de enige wijziging — 1 bestand, 1 debug log. De rest van de keten is al correct.

