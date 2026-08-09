import { useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useLanguage } from '@/contexts/LanguageContext';
import type { ProductSizeGuide, SizeGuideTable } from '@/integrations/sellqo/types';

function formatValue(v?: { value?: string; min_value?: string; max_value?: string }) {
  if (!v) return '–';
  if (v.value) return v.value;
  if (v.min_value && v.max_value) return `${v.min_value}–${v.max_value}`;
  return v.min_value || v.max_value || '–';
}

function unitLabel(table: SizeGuideTable) {
  const u = (table.unit || '').toLowerCase();
  if (u.includes('inch')) return 'inch';
  if (u.includes('cm')) return 'cm';
  return table.unit || table.type || '';
}

export function hasUsableSizeGuide(guide?: ProductSizeGuide | null): guide is ProductSizeGuide {
  return !!guide?.size_tables?.some(t => (t.measurements?.length ?? 0) > 0);
}

export default function ProductSizeGuideDialog({ guide }: { guide: ProductSizeGuide }) {
  const { t } = useLanguage();
  const tables = useMemo(
    () => (guide.size_tables || []).filter(t => (t.measurements?.length ?? 0) > 0),
    [guide]
  );
  const [activeIndex, setActiveIndex] = useState(0);
  const table = tables[activeIndex] || tables[0];

  const sizes = useMemo(() => {
    const set: string[] = [];
    table?.measurements?.forEach(m =>
      m.values?.forEach(v => {
        if (v.size && !set.includes(v.size)) set.push(v.size);
      })
    );
    if (set.length === 0 && guide.available_sizes) return guide.available_sizes;
    return set;
  }, [table, guide]);

  if (!table) return null;
  const measurements = table.measurements || [];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button type="button" className="font-body text-xs text-primary hover:underline">
          {t('product.sizeGuide')}
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl border-3 border-foreground rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">{t('product.sizeGuide')}</DialogTitle>
        </DialogHeader>

        {tables.length > 1 && (
          <div className="flex gap-2">
            {tables.map((tb, i) => (
              <button
                key={i}
                onClick={() => setActiveIndex(i)}
                className={`px-3 py-1 rounded-full border-2 font-body text-xs transition-colors ${
                  i === activeIndex
                    ? 'border-foreground bg-foreground text-background'
                    : 'border-border hover:border-foreground'
                }`}
              >
                {unitLabel(tb) || `#${i + 1}`}
              </button>
            ))}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full border-collapse font-body text-sm">
            <thead>
              <tr>
                <th className="text-left p-2 border-b-2 border-foreground font-display">
                  {t('product.size')}
                </th>
                {measurements.map((m, i) => (
                  <th key={i} className="text-left p-2 border-b-2 border-foreground font-display whitespace-nowrap">
                    {m.type_label || `#${i + 1}`}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sizes.map(size => (
                <tr key={size} className="odd:bg-muted/40">
                  <td className="p-2 font-semibold">{size}</td>
                  {measurements.map((m, i) => (
                    <td key={i} className="p-2 whitespace-nowrap">
                      {formatValue(m.values?.find(v => v.size === size))}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {table.description && (
          <div
            className="font-body text-xs text-muted-foreground leading-relaxed [&_a]:underline"
            dangerouslySetInnerHTML={{ __html: table.description }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
