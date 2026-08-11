import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useLegalPages, usePage } from '@/integrations/sellqo/hooks';

type LegalRecord = Record<string, unknown> & { page_type?: string };

function pick(record: LegalRecord | undefined, base: string, lang: string): string {
  if (!record) return '';
  const localized = record[`${base}_${lang}`];
  if (typeof localized === 'string' && localized.trim() !== '') return localized;
  const dutch = record[`${base}_nl`];
  if (typeof dutch === 'string' && dutch.trim() !== '') return dutch;
  const plain = record[base];
  return typeof plain === 'string' ? plain : '';
}

// LEGAL-DATE-1 — de "laatst bijgewerkt"-datum in de SellQo-content stond nog op
// 17 mei 2024 (voor Loveke bestond). Tot de bron is bijgewerkt, tonen we hier
// de correcte, gelokaliseerde datum.
const LEGAL_LAST_UPDATED = new Date('2026-08-10T00:00:00Z');
const DATE_LOCALES: Record<string, string> = { nl: 'nl-BE', en: 'en-GB', fr: 'fr-BE' };

function withCurrentDate(html: string, locale: string): string {
  if (!html) return html;
  const formatted = LEGAL_LAST_UPDATED.toLocaleDateString(DATE_LOCALES[locale] ?? 'nl-BE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
  return html.replace(
    /(Laatst bijgewerkt|Last updated|Derni[eè]re mise à jour|Zuletzt aktualisiert)(\s*:\s*)([^<\n]*)/gi,
    (_m, label, sep) => `${label}${sep}${formatted}`
  );
}

export default function LegalPage() {
  const { slug } = useParams<{ slug: string }>();
  const { locale } = useLanguage();
  const { data: legalPages, isLoading, isError } = useLegalPages();
  const { data: detailData, isLoading: detailLoading } = usePage(slug ?? '');

  const pages: LegalRecord[] = Array.isArray(legalPages)
    ? (legalPages as LegalRecord[])
    : Array.isArray((legalPages as any)?.data)
      ? ((legalPages as any).data as LegalRecord[])
      : [];

  const indexRecord = pages.find(p => (p.page_type ?? (p as any).slug) === slug);
  const detail = ((detailData as any)?.data ?? detailData) as LegalRecord | undefined;
  const page = detail && Object.keys(detail).length > 0 ? detail : indexRecord;

  const title = pick(page, 'title', locale) || pick(indexRecord, 'title', locale);
  const content = withCurrentDate(pick(page, 'content', locale), locale);
  const metaTitle = pick(page, 'meta_title', locale) || title;

  useEffect(() => {
    if (metaTitle) document.title = metaTitle;
  }, [metaTitle]);

  if (isLoading || detailLoading) {
    return (
      <main className="min-h-[60vh] flex items-center justify-center pt-24 pb-16 overflow-x-hidden">
        <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  if (isError || !page || (!title && !content)) {
    return (
      <main className="min-h-[60vh] flex items-center justify-center px-4 pt-24 pb-16 overflow-x-hidden">
        <div className="text-center max-w-md">
          <h1 className="font-display text-5xl gradient-text mb-4">404</h1>
          <p className="font-body text-muted-foreground mb-8">
            Deze pagina konden we niet vinden.
          </p>
          <Link
            to="/"
            className="inline-flex items-center justify-center px-6 py-3 rounded-xl font-display gradient-warm text-primary-foreground shadow-sticker hover:scale-105 transition-transform"
          >
            Terug naar home
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-24 pb-16 px-4 overflow-x-hidden">
      <article className="container mx-auto max-w-3xl">
        <h1 className="font-display text-4xl md:text-5xl gradient-text mb-8">{title}</h1>
        <div
          className="prose prose-neutral max-w-none font-body text-foreground prose-headings:font-display prose-headings:text-foreground prose-a:text-primary prose-strong:text-foreground"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </article>
    </main>
  );
}