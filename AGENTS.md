# AGENTS.md

- Size charts render only through `src/components/StandardSizeChart.tsx` (used by the product dialog and /maatgids), which converts `product.size_guide` from SellQo via the pure `toStandardSizeChart` in `src/lib/standardSizeChart.ts`; never hardcode measurements — so every product shows the same format and new products appear without code changes.
- `src/lib/standardSizeChart.test.ts` runs against real Printful payloads in `standardSizeChart.fixtures.json`; refresh the fixture when SellQo's size_guide shape changes — so label matching is tested on real data.
