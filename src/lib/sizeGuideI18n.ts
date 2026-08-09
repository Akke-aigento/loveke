export type SizeGuideLocale = 'nl' | 'en' | 'fr';

const norm = (s: string) => s.replace(/\s+/g, ' ').trim().toLowerCase();

const LABELS: Record<string, { nl: string; fr: string; en?: string }> = {
  'length': { nl: 'Lengte', fr: 'Longueur' },
  'width': { nl: 'Breedte', fr: 'Largeur' },
  'sleeve length': { nl: 'Mouwlengte', fr: 'Longueur de manche' },
  'chest': { nl: 'Borstwijdte', fr: 'Tour de poitrine' },
  'waist': { nl: 'Taille', fr: 'Tour de taille' },
  'hip': { nl: 'Heupwijdte', fr: 'Tour de hanches' },
  'hips': { nl: 'Heupwijdte', fr: 'Tour de hanches' },
  'inseam': { nl: 'Binnenbeenlengte', fr: 'Entrejambe' },
  'shoulder': { nl: 'Schouderbreedte', fr: "Largeur d'épaules" },
  'shoulder width': { nl: 'Schouderbreedte', fr: "Largeur d'épaules" },
  'neck': { nl: 'Halsomvang', fr: 'Tour de cou' },
  'hem': { nl: 'Zoom', fr: 'Ourlet' },
  'front length': { nl: 'Voorpandlengte', fr: 'Longueur avant' },
};

export function translateMeasurementLabel(label: string, locale: SizeGuideLocale): string {
  const entry = LABELS[norm(label || '')];
  if (!entry) return label;
  if (locale === 'en') return entry.en || label;
  return entry[locale] || label;
}

interface SentenceRule {
  match: string;
  nl?: string | null;
  fr?: string | null;
  en?: string | null;
}

const SENTENCES: SentenceRule[] = [
  {
    match: 'measurements are provided by our suppliers. product measurements may vary by up to 2" (5 cm).',
    nl: 'De afmetingen worden aangeleverd door onze leveranciers. Productafmetingen kunnen tot 2" (5 cm) afwijken.',
    fr: 'Les mesures sont fournies par nos fournisseurs. Les mesures du produit peuvent varier jusqu\'à 2" (5 cm).',
  },
  {
    match: 'pro tip! measure one of your products at home and compare it with the measurements you see in this guide.',
    nl: 'Pro-tip! Meet thuis een kledingstuk op dat je al hebt en vergelijk het met de maten in deze gids.',
    fr: 'Astuce ! Mesurez chez vous un vêtement que vous possédez déjà et comparez-le avec les mesures de ce guide.',
  },
  {
    match: 'us customers should order a size up as the eu sizes for this supplier correspond to a smaller size in the us market.',
    nl: null,
    fr: null,
  },
];

function stripHtml(s: string) {
  return s.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
}

/** Split an HTML description into translated plain-text paragraphs. */
export function translateDescription(html: string | undefined, locale: SizeGuideLocale): string[] {
  if (!html) return [];
  const parts = html
    .split(/<\/p>|<br\s*\/?>|\r?\n/i)
    .map(stripHtml)
    .filter(Boolean);

  const out: string[] = [];
  for (const sentence of parts) {
    const rule = SENTENCES.find(r => r.match === norm(sentence));
    if (!rule) {
      out.push(sentence);
      continue;
    }
    const value = locale === 'en' ? (rule.en ?? sentence) : rule[locale];
    if (value === null || value === undefined) continue;
    out.push(value);
  }
  return out;
}
