import { describe, it, expect } from 'vitest';
import type { ProductSizeGuide } from '@/integrations/sellqo/types';
import { toStandardSizeChart, findClosestSize, cmToInch, parseMeasure } from './standardSizeChart';
import fixtures from './standardSizeChart.fixtures.json';

// Real size_guide payloads from the SellQo storefront API (Printful import).
const tee = fixtures.tee as ProductSizeGuide;
const sweatshirt = fixtures.sweatshirt as ProductSizeGuide;
const hoodie = fixtures.hoodie as ProductSizeGuide;
const tanktop = fixtures.tanktop as ProductSizeGuide;
const bodysuit = fixtures.bodysuit as ProductSizeGuide;

const col = (g: ProductSizeGuide, f: 'width' | 'length' | 'sleeve' | 'chestMin' | 'chestMax') =>
  toStandardSizeChart(g).rows.map(r => r[f]);

describe('toStandardSizeChart — oversized tee', () => {
  it('takes width and length from the garment table, rounded to whole cm', () => {
    expect(toStandardSizeChart(tee).rows.map(r => r.size)).toEqual(['S', 'M', 'L', 'XL', '2XL']);
    expect(col(tee, 'width')).toEqual([63, 67, 71, 76, 81]);
    expect(col(tee, 'length')).toEqual([73, 75, 77, 80, 83]);
  });
  it('turns single body-chest values into min = max', () => {
    expect(col(tee, 'chestMin')).toEqual([99, 109, 119, 130, 140]);
    expect(col(tee, 'chestMax')).toEqual([99, 109, 119, 130, 140]);
  });
});

describe('toStandardSizeChart — sweatshirt', () => {
  it('reads "Chest Width" as width and "Body Length" as length', () => {
    expect(col(sweatshirt, 'width')).toEqual([51, 53, 56, 59, 62]);
    expect(col(sweatshirt, 'length')).toEqual([68, 72, 74, 76, 78]);
    expect(col(sweatshirt, 'sleeve')).toEqual([65, 66, 68, 69, 71]);
  });
  it('reads "Chest Circumference" ranges as chest min/max', () => {
    expect(col(sweatshirt, 'chestMin')).toEqual([84, 94, 104, 112, 119]);
    expect(col(sweatshirt, 'chestMax')).toEqual([91, 102, 109, 117, 125]);
  });
});

describe('toStandardSizeChart — hoodie', () => {
  it('rounds the inch-converted cm decimals', () => {
    expect(col(hoodie, 'width')).toEqual([57, 61, 65, 70, 75, 80]);
    expect(col(hoodie, 'length')).toEqual([68, 70, 72, 75, 77, 80]);
    expect(col(hoodie, 'sleeve')).toEqual([58, 58, 60, 60, 61, 62]);
  });
  it('has no chest circumference (only garment measurements)', () => {
    expect(col(hoodie, 'chestMin').every(v => v === undefined)).toBe(true);
  });
  it('converts an inch-only table (× 2.54) to the same cm values', () => {
    const inchOnly: ProductSizeGuide = {
      ...hoodie,
      size_tables: hoodie.size_tables!.filter(t => t.unit === 'inches'),
    };
    expect(col(inchOnly, 'width')).toEqual([57, 61, 65, 70, 75, 80]);
    expect(col(inchOnly, 'length')).toEqual([68, 70, 72, 75, 77, 80]);
  });
});

describe('toStandardSizeChart — tanktop', () => {
  it('maps width, length and chest ranges', () => {
    expect(col(tanktop, 'width')).toEqual([41, 46, 51, 56, 61, 66]);
    expect(col(tanktop, 'length')).toEqual([66, 69, 71, 74, 76, 79]);
    expect(col(tanktop, 'chestMin')).toEqual([79, 86, 97, 107, 117, 127]);
    expect(col(tanktop, 'chestMax')).toEqual([86, 94, 104, 114, 124, 135]);
    expect(col(tanktop, 'sleeve').every(v => v === undefined)).toBe(true);
  });
});

describe('toStandardSizeChart — kids bodysuit', () => {
  it('keeps the 12M/18M/24M sizes with length and width', () => {
    const rows = toStandardSizeChart(bodysuit).rows;
    expect(rows.map(r => r.size)).toEqual(['12M', '18M', '24M']);
    expect(rows.map(r => r.length)).toEqual([34, 37, 39]);
    expect(rows.map(r => r.width)).toEqual([25, 27, 30]);
  });
});

describe('toStandardSizeChart — robustness', () => {
  it('halves a garment chest circumference to get the flat width', () => {
    const g: ProductSizeGuide = {
      size_tables: [{ type: 'product_measure', unit: 'cm', measurements: [{ type_label: 'Chest Circumference', values: [{ size: 'M', value: '110' }] }] }],
    };
    expect(toStandardSizeChart(g).rows[0].width).toBe(55);
  });
  it('matches labels case-insensitively and ignores unknown labels', () => {
    const g: ProductSizeGuide = {
      size_tables: [{
        type: 'product_measure', unit: 'CM',
        measurements: [
          { type_label: '  WIDTH ', values: [{ size: 'M', value: '60' }] },
          { type_label: 'Waist', values: [{ size: 'M', value: '80' }] },
          { type_label: undefined, values: [{ size: 'M', value: 'abc' }] },
        ],
      }],
    };
    expect(toStandardSizeChart(g).rows).toEqual([{ size: 'M', width: 60 }]);
  });
  it('does not crash on empty or malformed guides', () => {
    expect(toStandardSizeChart(null).rows).toEqual([]);
    expect(toStandardSizeChart({} as ProductSizeGuide).rows).toEqual([]);
    expect(toStandardSizeChart({ size_tables: [{ type: 'product_measure' }] }).rows).toEqual([]);
  });
  it('parses inch fractions', () => {
    expect(parseMeasure('26 3/4')).toBe(26.75);
    expect(parseMeasure('16 ¼')).toBe(16.25);
    expect(parseMeasure('22,5')).toBe(22.5);
  });
});

describe('findClosestSize', () => {
  it('a 60 cm shirt matches tee size S (63 cm)', () => {
    const m = findClosestSize(toStandardSizeChart(tee).rows, 60);
    expect(m?.row.size).toBe('S');
    expect(m?.widthDiff).toBe(3);
  });
  it('picks the nearest width', () => {
    expect(findClosestSize(toStandardSizeChart(tee).rows, 70)?.row.size).toBe('L');
    expect(findClosestSize(toStandardSizeChart(hoodie).rows, 66)?.row.size).toBe('L');
  });
  it('ignores empty or invalid input', () => {
    expect(findClosestSize(toStandardSizeChart(tee).rows, 0)).toBeUndefined();
    expect(findClosestSize(toStandardSizeChart(tee).rows, NaN)).toBeUndefined();
  });
});

describe('cmToInch', () => {
  it('rounds to the nearest half inch', () => {
    expect(cmToInch(63)).toBe(25);
    expect(cmToInch(67)).toBe(26.5);
  });
});
