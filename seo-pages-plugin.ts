// Vite-plugin (alleen bij `vite build`): schrijft per route uit src/seo/pages.ts een eigen
// HTML-bestand (dist/prijzen.html + dist/prijzen/index.html, …) met een unieke titel,
// beschrijving, canonical en og-tags, plus dist/sitemap.xml. De body blijft de SPA, dus de site
// werkt exact zoals voorheen; alleen de <head> die Google en deelplatformen zonder JavaScript
// lezen, is per pagina juist.
//
// Productpagina's (/shop/<slug>) komen bij de build uit de sellqo-proxy en krijgen elk een eigen
// bestand. Daardoor valt enkel nog wat niet geïndexeerd hoeft (checkout, bedankt, juridisch,
// onbekende adressen) terug op index.html, en mag index.html de canonical van de homepage dragen:
// zonder die canonical bleef Google loveke.lovable.app tonen i.p.v. loveke.be (12-10-2026).
// Lukt het ophalen niet, dan bouwt hij verder zonder productpagina's én zonder homepage-canonical.
import fs from "node:fs";
import path from "node:path";
import type { Plugin } from "vite";
import { fetchSeoBundle, withOverride, type SeoOverrides } from "./src/seo/insights";
import { PAGES, SITE_URL, type PageMeta } from "./src/seo/pages";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function setMeta(html: string, attr: "name" | "property", key: string, value: string): string {
  const re = new RegExp(`<meta\\s+${attr}="${key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"[^>]*>`, "i");
  const tag = `<meta ${attr}="${key}" content="${esc(value)}" />`;
  return re.test(html) ? html.replace(re, tag) : html.replace("</head>", `    ${tag}\n  </head>`);
}

export function applyHead(html: string, page: PageMeta, withCanonical: boolean, image?: string): string {
  const url = page.path === "/" ? `${SITE_URL}/` : `${SITE_URL}${page.path}`;
  let out = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${esc(page.title)}</title>`);
  out = setMeta(out, "name", "description", page.description);
  out = setMeta(out, "property", "og:title", page.title);
  out = setMeta(out, "property", "og:description", page.description);
  out = setMeta(out, "name", "twitter:title", page.title);
  out = setMeta(out, "name", "twitter:description", page.description);
  if (withCanonical) {
    out = setMeta(out, "property", "og:url", url);
    out = out.replace("</head>", `    <link rel="canonical" href="${url}" />\n  </head>`);
  }
  if (image) {
    out = setMeta(out, "property", "og:image", image);
    out = setMeta(out, "name", "twitter:image", image);
  }
  if (page.noindex) out = setMeta(out, "name", "robots", "noindex, follow");
  return out;
}

export function sitemapXml(pages: PageMeta[], lastmod: string): string {
  const urls = pages
    .filter((p) => !p.noindex)
    .map((p) => {
      const loc = p.path === "/" ? `${SITE_URL}/` : `${SITE_URL}${p.path}`;
      return `  <url><loc>${loc}</loc><lastmod>${lastmod}</lastmod><priority>${(p.priority ?? 0.5).toFixed(1)}</priority></url>`;
    });
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>\n`;
}

type ApiProduct = { name?: string; slug?: string; description?: string | null; images?: (string | { url?: string })[] };
type ProductPage = PageMeta & { image?: string };

// Sommige omschrijvingen zijn dubbel ge-escaped (&lt;p&gt;…): eerst tags weg, dan entiteiten
// ontcijferen, dan de tags die daaruit tevoorschijn komen opnieuw weg.
const decode = (s: string) =>
  s
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&");
const stripTags = (s: string) => s.replace(/<[^>]+>/g, " ");
const plain = (s: string | null | undefined) =>
  stripTags(decode(stripTags(s ?? "")))
    .replace(/\s+/g, " ")
    .trim();

function cut(s: string, max = 155): string {
  if (s.length <= max) return s;
  const t = s.slice(0, max - 1);
  return `${t.slice(0, Math.max(t.lastIndexOf(" "), 60))}…`;
}

/** Producten uit de sellqo-proxy; null als het ophalen mislukt. */
async function productPages(supabaseUrl: string | undefined): Promise<ProductPage[] | null> {
  if (!supabaseUrl) return null;
  try {
    const res = await fetch(`${supabaseUrl.replace(/\/+$/, "")}/functions/v1/sellqo-proxy/products?per_page=100`, {
      headers: { "X-Tenant-ID": "loveke", "Content-Type": "application/json" },
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { data?: { products?: ApiProduct[] } };
    const list = json.data?.products;
    if (!Array.isArray(list)) return null;
    return list
      .filter((p) => p.slug && p.name)
      .map((p) => {
        const name = p.name!.trim();
        const text = plain(p.description);
        const img = p.images?.[0];
        return {
          path: `/shop/${p.slug}`,
          title: `${name} | Loveke`,
          description: cut(
            text ? (text.startsWith(name) ? text : `${name}. ${text}`) : `${name} — Belgische streetwear van Loveke. Bekijk maten, kleuren en prijs in de shop.`,
          ),
          priority: 0.8,
          image: typeof img === "string" ? img : img?.url,
        };
      });
  } catch {
    return null;
  }
}

export function seoPages(): Plugin {
  let outDir = "dist";
  let overrides: SeoOverrides = {};
  let jsonld: Record<string, unknown> | null = null;
  let supabaseUrl: string | undefined;
  return {
    name: "loveke-seo-pages",
    apply: "build",
    // Goedgekeurde teksten uit Akke Insights ophalen; ook aan de browser meegeven.
    async config() {
      const bundle = await fetchSeoBundle();
      overrides = bundle.pages;
      jsonld = bundle.jsonld;
      console.log(`[seo-pages] ${Object.keys(overrides).length} goedgekeurde teksten uit Insights`);
      return { define: { __SEO_OVERRIDES__: JSON.stringify(overrides) } };
    },
    configResolved(config) {
      outDir = path.resolve(config.root, config.build.outDir);
      supabaseUrl = config.env["VITE_SUPABASE_URL"] ?? process.env["VITE_SUPABASE_URL"];
    },
    async closeBundle() {
      const indexPath = path.join(outDir, "index.html");
      if (!fs.existsSync(indexPath)) return;
      const base = fs.readFileSync(indexPath, "utf8");
      const products = await productPages(supabaseUrl);
      console.log(`[seo-pages] ${products ? products.length : 0} producten uit SellQo${products ? "" : " (niet opgehaald)"}`);
      const pages: ProductPage[] = [...PAGES, ...(products ?? [])].map((p) => withOverride(p, overrides));
      for (const page of pages) {
        if (page.path === "/") {
          // Homepage-canonical enkel als de productpagina's eigen bestanden kregen (zie boven).
          // Bedrijfsgegevens uit Insights (JSON-LD) enkel op de homepage.
          let home = applyHead(base, page, products !== null);
          if (jsonld)
            home = home.replace(
              "</head>",
              `    <script type="application/ld+json" data-insights="business">${JSON.stringify(jsonld).replace(/</g, "\\u003c")}</script>\n  </head>`,
            );
          fs.writeFileSync(indexPath, home);
          continue;
        }
        // Twee vormen: prijzen.html én prijzen/index.html. De hosting serveert /prijzen.html
        // letterlijk maar valt voor /prijzen terug op index.html; een map-index is de vorm die
        // statische hosts voor nette URL's opzoeken.
        const html = applyHead(base, page, true, page.image);
        for (const file of [
          path.join(outDir, `${page.path.slice(1)}.html`),
          path.join(outDir, page.path.slice(1), "index.html"),
        ]) {
          fs.mkdirSync(path.dirname(file), { recursive: true });
          fs.writeFileSync(file, html);
        }
      }
      fs.writeFileSync(path.join(outDir, "sitemap.xml"), sitemapXml(pages, new Date().toISOString().slice(0, 10)));
    },
  };
}
