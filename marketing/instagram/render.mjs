// Rendert elke .html in een map naar een JPG op het formaat uit <meta name="loveke-size" content="BxH">.
// Gebruik: node marketing/instagram/render.mjs marketing/instagram/launch [uitvoermap]
// Extra: met --strip worden ook de 12 strippagina's als 4:5-carrouselslides (1080x1350) gemaakt.
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const pwPath = process.env.PLAYWRIGHT_MODULE ?? "/opt/node-tools/node_modules/playwright/index.mjs";
const { chromium } = await import(pwPath);

const args = process.argv.slice(2);
const withStrip = args.includes("--strip");
const [srcDir, outDirArg] = args.filter((a) => !a.startsWith("--"));
if (!srcDir) {
  console.error("Gebruik: node render.mjs <map-met-html> [uitvoermap] [--strip]");
  process.exit(1);
}
const outDir = path.resolve(outDirArg ?? path.join(srcDir, "..", "out", path.basename(srcDir)));
fs.mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
const files = fs.readdirSync(srcDir).filter((f) => f.endsWith(".html")).sort();
for (const f of files) {
  const file = path.resolve(srcDir, f);
  const html = fs.readFileSync(file, "utf8");
  const m = html.match(/name="loveke-size" content="(\d+)x(\d+)"/);
  if (!m) { console.warn(`overgeslagen (geen loveke-size): ${f}`); continue; }
  const [w, h] = [Number(m[1]), Number(m[2])];
  const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  await page.goto(pathToFileURL(file).href, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  const out = path.join(outDir, f.replace(/\.html$/, ".jpg"));
  await page.screenshot({ path: out, type: "jpeg", quality: 92, clip: { x: 0, y: 0, width: w, height: h } });
  await page.close();
  console.log(`✓ ${path.relative(process.cwd(), out)} (${w}x${h})`);
}

if (withStrip) {
  const comicDir = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../../src/assets/comic");
  const page = await browser.newPage({ viewport: { width: 1080, height: 1350 } });
  for (let i = 1; i <= 12; i++) {
    const img = pathToFileURL(path.join(comicDir, `strip-${i}.webp`)).href;
    await page.setContent(
      `<html><body style="margin:0;width:1080px;height:1350px;background:#F4F2E5;display:flex;align-items:center;justify-content:center">` +
        `<img src="${img}" style="height:1350px;width:auto;display:block"></body></html>`,
      { waitUntil: "load" },
    );
    const out = path.join(outDir, `strip-slide-${String(i).padStart(2, "0")}.jpg`);
    await page.screenshot({ path: out, type: "jpeg", quality: 92 });
    console.log(`✓ ${path.relative(process.cwd(), out)} (1080x1350)`);
  }
  await page.close();
}
await browser.close();
