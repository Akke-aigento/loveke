// Teksten die in Akke Insights met "Ja, pas aan" goedgekeurd zijn (titel en beschrijving per
// pagina). De SEO-plugin haalt ze op bij elke build en geeft ze via __SEO_OVERRIDES__ ook aan de
// browser, zodat de titel bij navigatie dezelfde blijft. Is Insights onbereikbaar, dan blijft
// alles bij de teksten in deze repo: een build mag hier nooit op falen.
export const INSIGHTS_SEO_URL = "https://insights.studioakke.com/api/seo/4w7nugeo2irt";

export type SeoOverrides = Record<string, { title?: string; description?: string }>;

declare const __SEO_OVERRIDES__: SeoOverrides | undefined;

/** In de browser: wat de build meegaf. In de plugin (Node): leeg; die gebruikt fetchSeoOverrides. */
export const SEO_OVERRIDES: SeoOverrides =
  typeof __SEO_OVERRIDES__ !== "undefined" ? __SEO_OVERRIDES__ : {};

export function normSeoPath(p: string): string {
  const clean = p.split(/[?#]/)[0] || "/";
  return clean.length > 1 ? clean.replace(/\/+$/, "") : "/";
}

export function overrideFor(path: string, overrides: SeoOverrides = SEO_OVERRIDES) {
  return overrides[normSeoPath(path)];
}

/** Past een goedgekeurde tekst toe op een pagina-object met title/description. */
export function withOverride<T extends { path: string; title: string; description: string }>(
  page: T,
  overrides: SeoOverrides = SEO_OVERRIDES,
): T {
  const o = overrideFor(page.path, overrides);
  if (!o) return page;
  return { ...page, title: o.title ?? page.title, description: o.description ?? page.description };
}

export async function fetchSeoOverrides(): Promise<SeoOverrides> {
  try {
    const res = await fetch(INSIGHTS_SEO_URL, { signal: AbortSignal.timeout(8_000) });
    if (!res.ok) return {};
    const json = (await res.json()) as { pages?: SeoOverrides };
    return json.pages && typeof json.pages === "object" ? json.pages : {};
  } catch {
    return {};
  }
}
