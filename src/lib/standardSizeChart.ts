import type { ProductSizeGuide, SizeGuideTable, SizeGuideValue } from '@/integrations/sellqo/types';

/** One size in the Loveke standard format. All values in whole cm. */
export interface StandardSizeRow {
  size: string;
  /** A — flat width, armpit to armpit. */
  width?: number;
  /** B — highest point of the shoulder to the hem. */
  length?: number;
  sleeve?: number;
  /** Body chest circumference this size fits. */
  chestMin?: number;
  chestMax?: number;
}

export interface StandardSizeChart {
  rows: StandardSizeRow[];
}

const CM_PER_INCH = 2.54;

const norm = (s?: string) => (s || '').replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim().toLowerCase();

const isInch = (tb: SizeGuideTable) => /^(in|inch|inches|")$/.test(norm(tb.unit)) || norm(tb.unit).includes('inch');
const isProductMeasure = (tb: SizeGuideTable) => norm(tb.type) !== 'measure yourself';

const FRACTIONS: Record<string, string> = { '¼': ' 1/4', '½': ' 1/2', '¾': ' 3/4', '⅛': ' 1/8', '⅜': ' 3/8', '⅝': ' 5/8', '⅞': ' 7/8' };

/** Parse "63", "82.5", "22,5", "26 3/4", "16 ¼", " 83.8 " → number. */
export function parseMeasure(raw?: string | number | null): number | undefined {
  if (raw === null || raw === undefined) return undefined;
  if (typeof raw === 'number') return Number.isFinite(raw) ? raw : undefined;
  let s = String(raw).trim();
  for (const [ch, rep] of Object.entries(FRACTIONS)) s = s.split(ch).join(rep);
  s = s.replace(',', '.').replace(/\s+/g, ' ').trim();
  const m = s.match(/^(\d+(?:\.\d+)?)?(?:\s*(\d+)\/(\d+))?$/);
  if (!m || (!m[1] && !m[2])) return undefined;
  const whole = m[1] ? parseFloat(m[1]) : 0;
  const frac = m[2] && m[3] && Number(m[3]) !== 0 ? Number(m[2]) / Number(m[3]) : 0;
  const n = whole + frac;
  return Number.isFinite(n) ? n : undefined;
}

/** Returns [min, max] for a value cell; single values give min = max. */
function parseCell(v?: SizeGuideValue): [number, number] | undefined {
  if (!v) return undefined;
  if (v.value !== undefined && v.value !== null && String(v.value).trim() !== '') {
    const parts = String(v.value).split(/\s*[–—-]\s*/).filter(Boolean);
    if (parts.length === 2) {
      const a = parseMeasure(parts[0]);
      const b = parseMeasure(parts[1]);
      if (a !== undefined && b !== undefined) return [Math.min(a, b), Math.max(a, b)];
    }
    const n = parseMeasure(v.value);
    return n === undefined ? undefined : [n, n];
  }
  const min = parseMeasure(v.min_value);
  const max = parseMeasure(v.max_value);
  if (min !== undefined && max !== undefined) return [Math.min(min, max), Math.max(min, max)];
  const one = min ?? max;
  return one === undefined ? undefined : [one, one];
}

type ProductField = 'width' | 'length' | 'sleeve';

/** Classify a product_measure label; `half` = the value is a circumference and must be halved. */
function classifyProductLabel(label?: string): { field: ProductField; half: boolean } | undefined {
  const l = norm(label);
  if (!l) return undefined;
  if (l.includes('sleeve')) return { field: 'sleeve', half: false };
  if (/^(body |total |garment |back )?length$/.test(l)) return { field: 'length', half: false };
  const circumference = /circumference|girth|\(around\)/.test(l);
  if (/^(chest|bust|body)?\s*(width|circumference|girth)?(\s*\(.*\))?$/.test(l) && /(chest|bust|width)/.test(l) && !/(waist|hip|shoulder|neck|hem)/.test(l)) {
    return { field: 'width', half: circumference };
  }
  return undefined;
}

const isBodyChestLabel = (label?: string) => {
  const l = norm(label);
  return /^(chest|bust)(\s*(circumference|girth))?(\s*\(.*\))?$/.test(l);
};

/** Pick the cm table of a kind, or the inch table converted to cm. */
function pickTable(tables: SizeGuideTable[], productMeasure: boolean): { table: SizeGuideTable; factor: number } | undefined {
  const ofKind = tables.filter(tb => isProductMeasure(tb) === productMeasure && (tb.measurements?.length ?? 0) > 0);
  const cm = ofKind.find(tb => !isInch(tb));
  if (cm) return { table: cm, factor: 1 };
  const inch = ofKind.find(isInch);
  if (inch) return { table: inch, factor: CM_PER_INCH };
  return undefined;
}

/** Convert any Printful size guide into the Loveke standard chart (whole cm). */
export function toStandardSizeChart(guide?: ProductSizeGuide | null): StandardSizeChart {
  const tables = Array.isArray(guide?.size_tables) ? guide!.size_tables! : [];
  const order: string[] = [];
  const rows = new Map<string, StandardSizeRow>();
  const rowFor = (size: string) => {
    let r = rows.get(size);
    if (!r) {
      r = { size };
      rows.set(size, r);
      order.push(size);
    }
    return r;
  };

  (guide?.available_sizes || []).forEach(s => s && rowFor(String(s)));

  const product = pickTable(tables, true);
  if (product) {
    const seen = new Set<ProductField>();
    for (const m of product.table.measurements || []) {
      const cls = classifyProductLabel(m.type_label);
      if (!cls || seen.has(cls.field)) continue;
      seen.add(cls.field);
      for (const v of m.values || []) {
        if (!v?.size) continue;
        const cell = parseCell(v);
        if (!cell) continue;
        const cmValue = ((cell[0] + cell[1]) / 2) * product.factor * (cls.half ? 0.5 : 1);
        rowFor(String(v.size))[cls.field] = Math.round(cmValue);
      }
    }
  }

  const body = pickTable(tables, false);
  if (body) {
    const chest = (body.table.measurements || []).find(m => isBodyChestLabel(m.type_label));
    for (const v of chest?.values || []) {
      if (!v?.size) continue;
      const cell = parseCell(v);
      if (!cell) continue;
      const r = rowFor(String(v.size));
      r.chestMin = Math.round(cell[0] * body.factor);
      r.chestMax = Math.round(cell[1] * body.factor);
    }
  }

  return {
    rows: order
      .map(s => rows.get(s)!)
      .filter(r => r.width !== undefined || r.length !== undefined || r.sleeve !== undefined || r.chestMin !== undefined),
  };
}

/** cm → inch, rounded to 0.5. */
export const cmToInch = (cm: number) => Math.round((cm / CM_PER_INCH) * 2) / 2;
export const inchToCm = (inch: number) => inch * CM_PER_INCH;

export interface SizeMatch {
  row: StandardSizeRow;
  /** size width − your width, in cm (positive = the size is wider). */
  widthDiff: number;
  /** size length − your length, in cm, when both are known. */
  lengthDiff?: number;
}

/** Further than this (cm) and we tell the customer the size runs wider/narrower. */
export const MATCH_TOLERANCE_CM = 3;

/** Closest size by flat width; an entered length breaks ties. */
export function findClosestSize(rows: StandardSizeRow[], widthCm: number, lengthCm?: number): SizeMatch | undefined {
  if (!Number.isFinite(widthCm) || widthCm <= 0) return undefined;
  let best: SizeMatch | undefined;
  for (const row of rows) {
    if (row.width === undefined) continue;
    const widthDiff = row.width - widthCm;
    const lengthDiff = lengthCm && lengthCm > 0 && row.length !== undefined ? row.length - lengthCm : undefined;
    if (!best) {
      best = { row, widthDiff, lengthDiff };
      continue;
    }
    const a = Math.abs(widthDiff);
    const b = Math.abs(best.widthDiff);
    if (a < b || (a === b && lengthDiff !== undefined && best.lengthDiff !== undefined && Math.abs(lengthDiff) < Math.abs(best.lengthDiff))) {
      best = { row, widthDiff, lengthDiff };
    }
  }
  return best;
}
