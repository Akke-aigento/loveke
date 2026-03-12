

## Cadeaukaart flow koppelen aan SellQo API

### Wijzigingen

**1. `src/integrations/sellqo/api.ts` — `cartAPI.addItem` uitbreiden**
- Accepteer optionele `amount` en `gift_card_metadata` parameters
- Voeg deze toe aan de request body wanneer aanwezig
- Type signature wordt: `{ product_id: string; variant_id?: string; quantity: number; amount?: number; gift_card_metadata?: object }`

**2. `src/integrations/sellqo/hooks.ts` — `useAddToCart` mutationFn uitbreiden**
- Accepteer `amount` en `gift_card_metadata` in de mutation input
- Geef deze door aan `cartAPI.addItem`

**3. `src/integrations/sellqo/CartContext.tsx` — `addItem` type updaten**
- Voeg `amount?: number` en `gift_card_metadata?: { recipient_name: string; recipient_email: string; message?: string; send_date?: string | null }` toe aan het addItem type in de interface en de callback

**4. `src/components/GiftCardDetail.tsx` — `handleAddToCart` aanpassen**
- Stuur `amount: activeAmount` en `gift_card_metadata` mee met recipient info
- Verwijder de `variant_id` (was al een workaround)

**5. `src/components/CartDrawer.tsx` — gift card metadata tonen**
- Als een cart item `gift_card_metadata` heeft, toon "🎁 Voor: [naam] ([email])" onder de productnaam

