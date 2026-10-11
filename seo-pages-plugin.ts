// Vite-plugin (alleen bij `vite build`): schrijft per route uit src/seo/pages.ts een eigen
// HTML-bestand (dist/prijzen.html + dist/prijzen/index.html, …) met een unieke titel,
// beschrijving, canonical en og-tags, plus dist/sitemap.xml. De body blijft de SPA, dus de site
// werkt exact zoals voorheen; alleen de <head> die Google en deelplatformen zonder JavaScript
// lezen, is per pagina juist.
//
// Bewust GEEN canonical in index.html: dat bestand is ook de terugval voor onbekende routes.
// Serveert de hosting de per-route-bestanden ooit niet, dan mag niet elke pagina zich als kopie
// van de homepage aanmelden.
import fs from "node:fs";
import path from "node:path";
import type { Plugin } from "vite";
import { PAGES, SITE_URL, type PageMeta } from "./src/seo/pages";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function setMeta(html: string, attr: "name" | "property", key: string, value: string): string {
  const re = new RegExp(`<meta\\s+${attr}="${key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"[^>]*>`, "i");
  const tag = `<meta ${attr}="${key}" content="${esc(value)}" />`;
  return re.test(html) ? html.replace(re, tag) : html.replace("</head>", `    ${tag}\n  </head>`);
}

export function applyHead(html: string, page: PageMeta, withCanonical: boolean): string {
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

export function seoPages(): Plugin {
  let outDir = "dist";
  return {
    name: "loveke-seo-pages",
    apply: "build",
    configResolved(config) {
      outDir = path.resolve(config.root, config.build.outDir);
    },
    closeBundle() {
      const indexPath = path.join(outDir, "index.html");
      if (!fs.existsSync(indexPath)) return;
      const base = fs.readFileSync(indexPath, "utf8");
      for (const page of PAGES) {
        if (page.path === "/") {
          fs.writeFileSync(indexPath, applyHead(base, page, false));
          continue;
        }
        // Twee vormen: prijzen.html én prijzen/index.html. De hosting serveert /prijzen.html
        // letterlijk maar valt voor /prijzen terug op index.html; een map-index is de vorm die
        // statische hosts voor nette URL's opzoeken.
        const html = applyHead(base, page, true);
        for (const file of [
          path.join(outDir, `${page.path.slice(1)}.html`),
          path.join(outDir, page.path.slice(1), "index.html"),
        ]) {
          fs.mkdirSync(path.dirname(file), { recursive: true });
          fs.writeFileSync(file, html);
        }
      }
      fs.writeFileSync(path.join(outDir, "sitemap.xml"), sitemapXml(PAGES, new Date().toISOString().slice(0, 10)));
    },
  };
}
