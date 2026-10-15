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

const ldScript = (data: unknown) =>
  `    <script type="application/ld+json">${JSON.stringify(data).replace(/</g, "\\u003c")}</script>\n  </head>`;

// LOVEKE-LAUNCH-1: bedrijfsgegevens op de homepage als Insights (nog) geen JSON-LD levert.
const ORGANIZATION_LD = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Loveke",
  url: `${SITE_URL}/`,
  logo: `${SITE_URL}/favicon.png`,
  email: "info@loveke.be",
  sameAs: ["https://www.instagram.com/loveke.shop/"],
  parentOrganization: { "@type": "Organization", name: "Nomadix BV", vatID: "BE1017500207" },
};

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
    // De afmetingen in index.html horen bij og-image.png, niet bij een productfoto.
    out = out.replace(/\s*<meta property="og:image:(width|height)"[^>]*>/g, "");
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

type ApiProduct = {
  name?: string;
  slug?: string;
  description?: string | null;
  images?: (string | { url?: string })[];
  price?: number | string | null;
  price_range?: { min?: number } | null;
  variants?: { price?: number | string | null }[];
  in_stock?: boolean;
};
type ProductPage = PageMeta & { image?: string; ld?: Record<string, unknown>[] };

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
        const imageUrl = typeof img === "string" ? img : img?.url;
        const prices = [p.price_range?.min, ...(p.variants ?? []).map((v) => v.price), p.price]
          .map((v) => (v === null || v === undefined ? NaN : Number(v)))
          .filter((v) => Number.isFinite(v) && v > 0);
        const price = prices.length ? Math.min(...prices) : null;
        const url = `${SITE_URL}/shop/${p.slug}`;
        const ld: Record<string, unknown>[] = [
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
              { "@type": "ListItem", position: 2, name: "Shop", item: `${SITE_URL}/shop` },
              { "@type": "ListItem", position: 3, name, item: url },
            ],
          },
        ];
        if (price !== null) {
          ld.push({
            "@context": "https://schema.org",
            "@type": "Product",
            name,
            description: cut(text || name, 300),
            image: imageUrl ? [imageUrl] : undefined,
            brand: { "@type": "Brand", name: "Loveke" },
            url,
            offers: {
              "@type": "Offer",
              url,
              priceCurrency: "EUR",
              price: price.toFixed(2),
              availability: "https://schema.org/InStock",
              itemCondition: "https://schema.org/NewCondition",
              shippingDetails: {
                "@type": "OfferShippingDetails",
                shippingRate: { "@type": "MonetaryAmount", value: "0", currency: "EUR" },
                deliveryTime: {
                  "@type": "ShippingDeliveryTime",
                  handlingTime: { "@type": "QuantitativeValue", minValue: 2, maxValue: 5, unitCode: "DAY" },
                  transitTime: { "@type": "QuantitativeValue", minValue: 3, maxValue: 15, unitCode: "DAY" },
                },
              },
            },
          });
        }
        return {
          ld,
          path: `/shop/${p.slug}`,
          title: `${name} | Loveke`,
          description: cut(
            text ? (text.startsWith(name) ? text : `${name}. ${text}`) : `${name} — Belgische streetwear van Loveke. Bekijk maten, kleuren en prijs in de shop.`,
          ),
          priority: 0.8,
          image: imageUrl,
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
          home = jsonld
            ? home.replace(
                "</head>",
                `    <script type="application/ld+json" data-insights="business">${JSON.stringify(jsonld).replace(/</g, "\\u003c")}</script>\n  </head>`,
              )
            : home.replace("</head>", ldScript(ORGANIZATION_LD));
          fs.writeFileSync(indexPath, home);
          continue;
        }
        // Twee vormen: prijzen.html én prijzen/index.html. De hosting serveert /prijzen.html
        // letterlijk maar valt voor /prijzen terug op index.html; een map-index is de vorm die
        // statische hosts voor nette URL's opzoeken.
        let html = applyHead(base, page, true, page.image);
        if (page.path.startsWith("/shop/")) {
          html = html.replace(/<meta property="og:type" content="website" \/>/, '<meta property="og:type" content="product" />');
          for (const block of page.ld ?? []) html = html.replace("</head>", ldScript(block));
        }
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
