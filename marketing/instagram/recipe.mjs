// SOCIAL-4 — maakt van een post-HTML een "recept": één zelfstandig HTML-document dat SellQo in
// de browser opnieuw kan tekenen nadat Akke de tekst heeft aangepast ("Tekst in beeld aanpassen").
//
// Wat het doet:
//   - <link rel="stylesheet" href="…brand.css"> → inline <style>, met de lettertypes als absolute
//     raw.githubusercontent.com-URL's (CORS: *), zodat de browser ze kan ophalen.
//   - relatieve <img src> en url(…) → absolute raw-URL's in deze repo.
//   - <script> en on…-attributen worden geweigerd (SellQo tekent zonder scripts).
//   - Tekstvakken die je mag aanpassen, staan in de HTML gemarkeerd met
//       data-slot="titel" data-label="Titel" data-max="28"   (optioneel data-multiline="true")
//     Zonder data-slot is er niets aan te passen; dan maakt dit script geen recept.
//
// Gebruik: node marketing/instagram/recipe.mjs <post.html> [<post2.html> …]
//   → schrijft per bestand <naam>.recipe.json naast de HTML: {"version":1,"width","height","html"}
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const RAW = "https://raw.githubusercontent.com/Akke-aigento/loveke/main/";
const repoRoot = execSync("git rev-parse --show-toplevel", { cwd: path.dirname(path.resolve(process.argv[2] ?? ".")) }).toString().trim();

function rawUrlFor(absPath) {
  const rel = path.relative(repoRoot, absPath).split(path.sep).join("/");
  if (rel.startsWith("..")) throw new Error(`Bestand buiten de repo: ${absPath}`);
  return RAW + rel.split("/").map(encodeURIComponent).join("/");
}

function absolutize(url, baseDir) {
  if (/^(https?:|data:|#)/i.test(url)) return url;
  return rawUrlFor(path.resolve(baseDir, url));
}

function makeRecipe(file) {
  const abs = path.resolve(file);
  const dir = path.dirname(abs);
  let html = fs.readFileSync(abs, "utf8");

  if (/<script\b/i.test(html) || /\son[a-z]+\s*=/i.test(html)) {
    throw new Error(`${file}: scripts of on…-attributen horen niet in een post-template.`);
  }
  const size = html.match(/name="loveke-size" content="(\d+)x(\d+)"/);
  if (!size) throw new Error(`${file}: <meta name="loveke-size"> ontbreekt.`);
  const slots = [...html.matchAll(/data-slot="([a-z0-9_-]+)"/g)].map((m) => m[1]);
  if (slots.length === 0) return null;
  if (new Set(slots).size !== slots.length) throw new Error(`${file}: dubbele data-slot.`);

  // Stylesheets inline zetten, met absolute URL's voor lettertypes en beelden.
  html = html.replace(/<link\s+rel="stylesheet"\s+href="([^"]+)"\s*\/?>/g, (_m, href) => {
    const cssPath = path.resolve(dir, href);
    const cssDir = path.dirname(cssPath);
    const css = fs.readFileSync(cssPath, "utf8")
      .replace(/url\(\s*['"]?([^'")]+)['"]?\s*\)/g, (_u, u) => `url("${absolutize(u, cssDir)}")`);
    return `<style>${css}</style>`;
  });
  html = html.replace(/\ssrc="([^"]+)"/g, (_m, src) => ` src="${absolutize(src, dir)}"`);
  html = html.replace(/url\(\s*['"]?([^'")]+)['"]?\s*\)/g, (m, u) => (/^(https?:|data:)/.test(u) ? m : `url("${absolutize(u, dir)}")`));

  return { version: 1, width: Number(size[1]), height: Number(size[2]), html };
}

const files = process.argv.slice(2);
if (files.length === 0) {
  console.error("Gebruik: node recipe.mjs <post.html> [<post2.html> …]");
  process.exit(1);
}
for (const f of files) {
  const recipe = makeRecipe(f);
  if (!recipe) {
    console.log(`– ${f}: geen data-slot, geen recept`);
    continue;
  }
  const out = f.replace(/\.html$/, ".recipe.json");
  fs.writeFileSync(out, JSON.stringify(recipe));
  console.log(`✓ ${out} (${recipe.width}x${recipe.height}, ${(recipe.html.length / 1024).toFixed(1)} kB)`);
}
