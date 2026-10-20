# AGENTS.md

- Size charts render only through `src/components/SizeGuideTable.tsx` (used by the product dialog and /maatgids), fed by `product.size_guide` from SellQo; never hardcode measurements — so both views stay identical and new products appear without code changes.
