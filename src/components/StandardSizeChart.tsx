import { useId, useMemo, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import type { ProductSizeGuide } from '@/integrations/sellqo/types';
import {
  toStandardSizeChart,
  findClosestSize,
  cmToInch,
  inchToCm,
  parseMeasure,
  MATCH_TOLERANCE_CM,
  type StandardSizeRow,
} from '@/lib/standardSizeChart';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Unit = 'cm' | 'inch';

export function hasUsableSizeGuide(guide?: ProductSizeGuide | null): guide is ProductSizeGuide {
  return !!guide && toStandardSizeChart(guide).rows.length > 0;
}

const fill = (tpl: string, vars: Record<string, string>) =>
  tpl.replace(/\{(\w+)\}/g, (_, k) => (k in vars ? vars[k] : `{${k}}`));

interface SegmentedProps<T extends string> {
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}

function Segmented<T extends string>({ label, options, value, onChange }: SegmentedProps<T>) {
  return (
    <div role="group" aria-label={label} className="inline-flex gap-1 rounded-full border-2 border-foreground p-0.5">
      {options.map(opt => (
        <button
          key={opt.value}
          type="button"
          aria-pressed={opt.value === value}
          onClick={() => onChange(opt.value)}
          className={`px-3 py-0.5 rounded-full font-body text-xs transition-colors ${
            opt.value === value ? 'bg-foreground text-background' : 'hover:bg-muted'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function Letter({ children }: { children: string }) {
  return (
    <span
      aria-hidden="true"
      className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary font-display text-[11px] leading-none text-primary-foreground"
    >
      {children}
    </span>
  );
}

/** Flat T-shirt with the measuring points A (width), B (length) and optionally C (sleeve). */
function ShirtDiagram({ showSleeve, label }: { showSleeve: boolean; label: string }) {
  const markerId = useId().replace(/:/g, '');
  const arrow = `url(#${markerId})`;
  return (
    <svg viewBox="0 0 250 216" role="img" aria-label={label} className="w-36 sm:w-44 shrink-0 h-auto">
      <defs>
        <marker id={markerId} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10 z" className="fill-primary" />
        </marker>
      </defs>
      {/* shirt */}
      <path
        d="M98 20 Q120 44 142 20 L172 30 L215 70 L195 92 L170 78 L170 200 L70 200 L70 78 L45 92 L25 70 L68 30 Z"
        className="fill-secondary stroke-foreground"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      {/* A: armpit to armpit */}
      <line x1="76" y1="86" x2="164" y2="86" className="stroke-primary" strokeWidth="4" markerStart={arrow} markerEnd={arrow} />
      <circle cx="120" cy="110" r="11" className="fill-primary" />
      <text x="120" y="115" textAnchor="middle" className="fill-primary-foreground font-display" fontSize="14">A</text>
      {/* B: highest shoulder point to hem */}
      <line x1="142" y1="20" x2="240" y2="20" className="stroke-foreground" strokeWidth="1.5" strokeDasharray="4 4" />
      <line x1="170" y1="200" x2="240" y2="200" className="stroke-foreground" strokeWidth="1.5" strokeDasharray="4 4" />
      <line x1="232" y1="25" x2="232" y2="195" className="stroke-primary" strokeWidth="4" markerStart={arrow} markerEnd={arrow} />
      <circle cx="232" cy="140" r="11" className="fill-primary" />
      <text x="232" y="145" textAnchor="middle" className="fill-primary-foreground font-display" fontSize="14">B</text>
      {showSleeve && (
        <>
          {/* C: shoulder seam to sleeve end */}
          <line x1="62" y1="21" x2="22" y2="58" className="stroke-primary" strokeWidth="4" markerStart={arrow} markerEnd={arrow} />
          <circle cx="30" cy="26" r="11" className="fill-primary" />
          <text x="30" y="31" textAnchor="middle" className="fill-primary-foreground font-display" fontSize="14">C</text>
        </>
      )}
    </svg>
  );
}

/** The one Loveke size chart (product dialog + /maatgids). Values come from product.size_guide. */
export default function StandardSizeChart({ guide }: { guide: ProductSizeGuide }) {
  const { t, locale } = useLanguage();
  const widthId = useId();
  const lengthId = useId();
  const [unit, setUnit] = useState<Unit>('cm');
  const [widthInput, setWidthInput] = useState('');
  const [lengthInput, setLengthInput] = useState('');

  const rows = useMemo(() => toStandardSizeChart(guide).rows, [guide]);
  const has = {
    width: rows.some(r => r.width !== undefined),
    length: rows.some(r => r.length !== undefined),
    sleeve: rows.some(r => r.sleeve !== undefined),
    chest: rows.some(r => r.chestMin !== undefined),
  };

  const unitLabel = unit === 'cm' ? t('product.unitCm') : t('product.unitInch');
  const num = (cm: number) =>
    unit === 'cm'
      ? String(cm)
      : cmToInch(cm).toLocaleString(locale === 'en' ? 'en-GB' : locale, { maximumFractionDigits: 1 });
  const withUnit = (cm: number) => `${num(cm)} ${unitLabel}`;
  const range = (min?: number, max?: number) =>
    min === undefined ? '–' : min === max || max === undefined ? num(min) : `${num(min)}–${num(max)}`;

  const toCm = (raw: string) => {
    const n = parseMeasure(raw);
    if (n === undefined || n <= 0) return undefined;
    return unit === 'inch' ? inchToCm(n) : n;
  };
  const yourWidth = toCm(widthInput);
  const yourLength = toCm(lengthInput);
  const match = has.width && yourWidth !== undefined ? findClosestSize(rows, yourWidth, yourLength) : undefined;

  const yours = (cm: number) =>
    unit === 'cm'
      ? `${Math.round(cm * 10) / 10} ${unitLabel}`.replace('.', locale === 'en' ? '.' : ',')
      : `${(cm / 2.54).toLocaleString(locale === 'en' ? 'en-GB' : locale, { maximumFractionDigits: 1 })} ${unitLabel}`;
  const diffText = (cm: number) =>
    unit === 'cm'
      ? `${Math.round(Math.abs(cm))} ${unitLabel}`
      : `${cmToInch(Math.abs(cm)).toLocaleString(locale === 'en' ? 'en-GB' : locale, { maximumFractionDigits: 1 })} ${unitLabel}`;

  let matchSentence = '';
  let lengthSentence = '';
  if (match && match.row.width !== undefined && yourWidth !== undefined) {
    const vars = { size: match.row.size, value: withUnit(match.row.width), yours: yours(yourWidth), diff: diffText(match.widthDiff) };
    const key =
      match.widthDiff > MATCH_TOLERANCE_CM ? 'sizeChart.matchWider'
      : match.widthDiff < -MATCH_TOLERANCE_CM ? 'sizeChart.matchNarrower'
      : 'sizeChart.matchClose';
    matchSentence = fill(t(key), vars);
    if (match.lengthDiff !== undefined && match.row.length !== undefined && yourLength !== undefined) {
      const lkey =
        match.lengthDiff > MATCH_TOLERANCE_CM ? 'sizeChart.lengthLonger'
        : match.lengthDiff < -MATCH_TOLERANCE_CM ? 'sizeChart.lengthShorter'
        : 'sizeChart.lengthSame';
      lengthSentence = fill(t(lkey), {
        size: match.row.size,
        value: withUnit(match.row.length),
        yours: yours(yourLength),
        diff: diffText(match.lengthDiff),
      });
    }
  }

  if (rows.length === 0) return null;

  const isMatch = (r: StandardSizeRow) => match?.row.size === r.size;
  const th = 'p-2 text-left font-display font-normal whitespace-nowrap border-b-2 border-foreground';
  const td = 'p-2 whitespace-nowrap border-b border-border';

  return (
    <div className="space-y-5">
      {/* How to measure */}
      <div className="flex items-center gap-4">
        <ShirtDiagram showSleeve={has.sleeve} label={t('sizeChart.diagramLabel')} />
        <dl className="space-y-2 font-body text-sm">
          {has.width && (
            <div className="flex gap-2">
              <Letter>A</Letter>
              <div>
                <dt className="font-semibold inline">{t('sizeChart.width')}: </dt>
                <dd className="inline">{t('sizeChart.widthHow')}</dd>
              </div>
            </div>
          )}
          {has.length && (
            <div className="flex gap-2">
              <Letter>B</Letter>
              <div>
                <dt className="font-semibold inline">{t('sizeChart.length')}: </dt>
                <dd className="inline">{t('sizeChart.lengthHow')}</dd>
              </div>
            </div>
          )}
          {has.sleeve && (
            <div className="flex gap-2">
              <Letter>C</Letter>
              <div>
                <dt className="font-semibold inline">{t('sizeChart.sleeve')}: </dt>
                <dd className="inline">{t('sizeChart.sleeveHow')}</dd>
              </div>
            </div>
          )}
        </dl>
      </div>

      {/* Compare with your own shirt */}
      {has.width && (
        <div className="rounded-2xl border-3 border-foreground bg-secondary p-4 shadow-sticker">
          <h3 className="font-display text-xl text-secondary-foreground">{t('sizeChart.compareTitle')}</h3>
          <p className="font-body text-sm text-secondary-foreground mb-3">{t('sizeChart.compareHow')}</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor={widthId} className="font-body text-xs text-secondary-foreground">
                {fill(t('sizeChart.widthInput'), { unit: unitLabel })}
              </Label>
              <Input
                id={widthId}
                type="text"
                inputMode="decimal"
                autoComplete="off"
                placeholder={unit === 'cm' ? '60' : '23.5'}
                value={widthInput}
                onChange={e => setWidthInput(e.target.value)}
                className="bg-background border-2 border-foreground"
              />
            </div>
            {has.length && (
              <div className="space-y-1">
                <Label htmlFor={lengthId} className="font-body text-xs text-secondary-foreground">
                  {fill(t('sizeChart.lengthInput'), { unit: unitLabel })}
                </Label>
                <Input
                  id={lengthId}
                  type="text"
                  inputMode="decimal"
                  autoComplete="off"
                  placeholder={unit === 'cm' ? '72' : '28'}
                  value={lengthInput}
                  onChange={e => setLengthInput(e.target.value)}
                  className="bg-background border-2 border-foreground"
                />
              </div>
            )}
          </div>
          <div aria-live="polite" className="font-body text-sm font-semibold text-secondary-foreground">
            {matchSentence && <p className="mt-3">👉 {matchSentence}</p>}
            {lengthSentence && <p className="mt-1 font-normal">{lengthSentence}</p>}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="space-y-2">
        <div className="flex justify-end">
          <Segmented<Unit>
            label={t('product.sizeGuideUnit')}
            value={unit}
            onChange={setUnit}
            options={[
              { value: 'cm', label: t('product.unitCm') },
              { value: 'inch', label: t('product.unitInch') },
            ]}
          />
        </div>
        <div className="max-w-full overflow-x-auto rounded-xl border-2 border-foreground bg-card">
          <table className="w-full border-collapse font-body text-sm">
            <thead>
              <tr>
                <th className={`${th} sticky left-0 z-10 bg-card`}>{t('product.size')}</th>
                {has.width && (
                  <th className={th}>
                    <span className="inline-flex items-center gap-1.5"><Letter>A</Letter>{t('sizeChart.width')}</span>
                  </th>
                )}
                {has.length && (
                  <th className={th}>
                    <span className="inline-flex items-center gap-1.5"><Letter>B</Letter>{t('sizeChart.length')}</span>
                  </th>
                )}
                {has.sleeve && (
                  <th className={th}>
                    <span className="inline-flex items-center gap-1.5"><Letter>C</Letter>{t('sizeChart.sleeve')}</span>
                  </th>
                )}
                {has.chest && <th className={th}>{t('sizeChart.chest')}</th>}
              </tr>
            </thead>
            <tbody>
              {rows.map(r => {
                const hit = isMatch(r);
                const bg = hit ? 'bg-secondary' : 'bg-card';
                return (
                  <tr key={r.size} data-match={hit || undefined} aria-current={hit ? 'true' : undefined} className={hit ? 'bg-secondary font-semibold' : ''}>
                    <td className={`${td} sticky left-0 z-10 font-display ${bg}`}>{r.size}</td>
                    {has.width && <td className={td}>{range(r.width, r.width)}</td>}
                    {has.length && <td className={td}>{range(r.length, r.length)}</td>}
                    {has.sleeve && <td className={td}>{range(r.sleeve, r.sleeve)}</td>}
                    {has.chest && <td className={td}>{range(r.chestMin, r.chestMax)}</td>}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="font-body text-xs text-muted-foreground">
          {t('sizeChart.tolerance')} {t('sizeChart.allIn')} {unitLabel}.
        </p>
      </div>
    </div>
  );
}
