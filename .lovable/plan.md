

## KRITIEKE BUGFIX: CORS Headers voor DELETE/PATCH

**Probleem**: De `sellqo-proxy` edge function mist `Access-Control-Allow-Methods` in CORS headers. Hierdoor falen DELETE (verwijderen item) en PATCH (quantity update) requests in de winkelwagen met CORS preflight errors.

**Fix**: Voeg `Access-Control-Allow-Methods` toe aan `corsHeaders` in `supabase/functions/sellqo-proxy/index.ts`:

```typescript
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, accept-language, x-tenant-id, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS", // ← NIEUW
};
```

De OPTIONS handler op regel 9-11 returnt al correct `{ headers: corsHeaders }`, dus na toevoegding van het Methods header zal de preflight correct reageren.

**Bestand**: `supabase/functions/sellqo-proxy/index.ts` (regel 1-4)

**Actie na fix**: Edge function deployen zodat de winkelwagen "Verwijderen" en "+/-" knoppen gaan werken.

