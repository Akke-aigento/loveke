
Doel: de volledige winkelwagenflow robuust maken zodat verwijderen, quantity updates, discounts en checkout consistent werken (ook bij tijdelijke netwerkproblemen).

1) Wat ik heb vastgesteld
- De huidige code kan een verwijderfout als unhandled promise laten crashen in de console (CartContext `removeItemFn`/`updateQuantity` hebben geen eigen error handling).
- `useRemoveCartItem` doet nu alleen server-call + `setQueryData` bij succes, maar geen optimistic rollback, geen recovery pad en geen `invalidateQueries`.
- In runtime testen werkt verwijderen meestal, maar jouw screenshot toont `TypeError: Failed to fetch` tijdens remove: dat moet defensief afgehandeld worden zodat de flow niet vastloopt.
- Er is een bekende UX-gap: geen pending/disabled state per item tijdens remove/update, dus dubbele clicks kunnen race conditions geven.

2) Implementatieplan
A. Mutatie-hardening in `src/integrations/sellqo/hooks.ts`
- `useRemoveCartItem` omzetten naar robuuste mutatie:
  - `onMutate`: lopende cart-query cancelen, snapshot bewaren, item optimistic uit cache verwijderen.
  - `onError`: rollback naar snapshot.
  - `onSettled`: cart-query invalideren zodat server-state altijd de bron van waarheid is.
- In `mutationFn`:
  - primaire remove via DELETE.
  - fallbackpad bij netwerkfout (`Failed to fetch`): één recovery-attempt (cart refetch en/of alternatieve remove-call), daarna duidelijke fout doorgeven.
- Zelfde consistentiepatroon toepassen op `useUpdateCartItem` (invalidate op settle + nette foutpropagatie).

B. Centrale foutafhandeling in `src/integrations/sellqo/CartContext.tsx`
- `removeItemFn` en `updateQuantity` wrappen in `try/catch`.
- Bij fouten: gebruikersvriendelijke toast tonen (NL), geen unhandled promise meer.
- Specifieke mapping:
  - netwerkfout -> “Verbinding onderbroken, probeer opnieuw.”
  - voorraad/variantfouten -> bestaande duidelijke meldingen behouden.

C. UI-stabiliteit in `src/components/CartDrawer.tsx`
- Remove/minus/plus tijdelijk disablen terwijl cart item-mutation pending is.
- Optioneel subtiele loading state op itemregel zodat user ziet dat actie verwerkt wordt.
- Resultaat: minder dubbel-click races en minder “het werkt niet”-gevoel.

D. Fetch-robuustheid in `src/integrations/sellqo/client.ts`
- `sellqoFetch` uitbreiden met expliciete handling van fetch-level errors (`TypeError`) en nette foutboodschap i.p.v. ruwe crash.
- Fouten uniform maken zodat CartContext ze correct kan mappen naar toasts.

3) Technische details
- Te wijzigen bestanden:
  - `src/integrations/sellqo/hooks.ts`
  - `src/integrations/sellqo/CartContext.tsx`
  - `src/components/CartDrawer.tsx`
  - `src/integrations/sellqo/client.ts`
- Kernpatroon voor remove:
  - optimistic remove in cache
  - rollback bij error
  - server resync via invalidate
- Dit volgt exact het veilige React Query patroon voor cart-mutaties en voorkomt inconsistente UI-state.

4) Validatie (end-to-end checklist)
- Product zonder varianten: add → quantity +/− → remove via knop.
- Product met varianten: idem, inclusief foutmelding bij onvoldoende stock.
- Cadeaukaart: add → remove → cart totals blijven correct.
- Discount flow: ongeldige code + geldige code.
- Herladen met bestaande cart-id: cart blijft consistent, geen vastgelopen state.
- Bij geforceerde netwerkfout tijdens remove: geen unhandled promise, duidelijke toast, UI herstelt correct na retry/refetch.
