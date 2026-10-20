import { useMemo, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import type { ProductSizeGuide, SizeGuideTable as SizeGuideTableData } from '@/integrations/sellqo/types';
import { translateMeasurementLabel, translateDescription, type SizeGuideLocale } from '@/lib/sizeGuideI18n';

type Kind = 'product_measure' | 'measure_yourself';
type Unit = 'cm' | 'inch';

const kindOf = (tb: SizeGuideTableData): Kind =>
  tb.type === 'measure_yourself' ? 'measure_yourself' : 'product_measure';
const unitOf = (tb: SizeGuideTableData): Unit =>
  (tb.unit || '').toLowerCase().includes('inch') ? 'inch' : 'cm';

function formatValue(v?: { value?: string; min_value?: string; max_value?: string }) {
  if (!v) return '–';
  if (v.value) return v.value;
  if (v.min_value && v.max_value) return `${v.min_value}–${v.max_value}`;
  return v.min_value || v.max_value || '–';
}

export function hasUsableSizeGuide(guide?: ProductSizeGuide | null): guide is ProductSizeGuide {
  return !!guide?.size_tables?.some(t => (t.measurements?.length ?? 0) > 0);
}

interface SegmentedProps<T extends string> {
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}

function Segmented<T extends string>({ label, options, value, onChange }: SegmentedProps<T>) {
  return (
    <div role="group" aria-label={label} className="inline-flex flex-wrap gap-2">
      {options.map(opt => (
        <button
          key={opt.value}
          type="button"
          aria-pressed={opt.value === value}
          onClick={() => onChange(opt.value)}
          className={`px-3 py-1 rounded-full border-2 font-body text-xs transition-colors ${
            opt.value === value
              ? 'border-foreground bg-foreground text-background'
              : 'border-border hover:border-foreground'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

/** Shared size-chart view (kind + unit choice, table, translated description). */
export default function SizeGuideTable({ guide }: { guide: ProductSizeGuide }) {
  const { t, locale } = useLanguage();
  const lang = locale as SizeGuideLocale;

  const tables = useMemo(
    () => (guide.size_tables || []).filter(tb => (tb.measurements?.length ?? 0) > 0),
    [guide]
  );
  const kinds = useMemo(() => Array.from(new Set(tables.map(kindOf))), [tables]);

  const [kind, setKind] = useState<Kind>(() =>
    kinds.includes('product_measure') ? 'product_measure' : kinds[0] ?? 'product_measure'
  );
  const [unit, setUnit] = useState<Unit>(() =>
    tables.some(tb => unitOf(tb) === 'cm') ? 'cm' : 'inch'
  );

  const unitsForKind = useMemo(
    () => Array.from(new Set(tables.filter(tb => kindOf(tb) === kind).map(unitOf))),
    [tables, kind]
  );

  const table =
    tables.find(tb => kindOf(tb) === kind && unitOf(tb) === unit) ??
    tables.find(tb => kindOf(tb) === kind) ??
    tables[0];

  const paragraphs = useMemo(() => translateDescription(table?.description, lang), [table, lang]);

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
  const activeKind = kindOf(table);
  const activeUnit = unitOf(table);
  const showKind = kinds.includes('product_measure') && kinds.includes('measure_yourself');
  const showUnit = unitsForKind.includes('cm') && unitsForKind.includes('inch');

  return (
    <div className="space-y-4">
      {(showKind || showUnit) && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          {showKind && (
            <Segmented<Kind>
              label={t('product.sizeGuideKind')}
              value={activeKind}
              onChange={setKind}
              options={[
                { value: 'product_measure', label: t('product.sizeGuideProduct') },
                { value: 'measure_yourself', label: t('product.sizeGuideBody') },
              ]}
            />
          )}
          {showUnit && (
            <Segmented<Unit>
              label={t('product.sizeGuideUnit')}
              value={activeUnit}
              onChange={setUnit}
              options={[
                { value: 'cm', label: t('product.unitCm') },
                { value: 'inch', label: t('product.unitInch') },
              ]}
            />
          )}
        </div>
      )}

      {showKind && (
        <p className="font-body text-xs text-muted-foreground">
          {activeKind === 'product_measure' ? t('product.sizeGuideProductHint') : t('product.sizeGuideBodyHint')}
        </p>
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
                  {m.type_label ? translateMeasurementLabel(m.type_label, lang) : `#${i + 1}`}
                  {' '}
                  <span className="font-body text-xs text-muted-foreground">
                    ({activeUnit === 'inch' ? t('product.unitInch') : t('product.unitCm')})
                  </span>
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

      {paragraphs.length > 0 && (
        <div className="font-body text-xs text-muted-foreground leading-relaxed space-y-1">
          {paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      )}
    </div>
  );
}
