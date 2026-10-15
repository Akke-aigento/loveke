// Rendert een reel: een HTML-pagina met <meta name="loveke-reel" content="BxH" data-duration="s" data-fps="n">
// en een functie window.setT(seconden) die de pagina deterministisch op tijdstip t zet.
// Elke frame wordt een screenshot; ffmpeg maakt er een MP4 van (H.264, yuv420p, 30 fps, stil audiospoor).
// Gebruik: node marketing/instagram/reel.mjs <pad/naar/index.html> <uitvoer.mp4>
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { spawnSync } from "node:child_process";
import { pathToFileURL } from "node:url";

const pwPath = process.env.PLAYWRIGHT_MODULE ?? "/opt/node-tools/node_modules/playwright/index.mjs";
const { chromium } = await import(pwPath);

const [src, outArg] = process.argv.slice(2);
if (!src || !outArg) {
  console.error("Gebruik: node reel.mjs <index.html> <uitvoer.mp4>");
  process.exit(1);
}
const html = fs.readFileSync(src, "utf8");
const m = html.match(/name="loveke-reel" content="(\d+)x(\d+)" data-duration="([\d.]+)" data-fps="(\d+)"/);
if (!m) {
  console.error("Geen <meta name=\"loveke-reel\" content=\"BxH\" data-duration=\"s\" data-fps=\"n\"> gevonden.");
  process.exit(1);
}
const [w, h, dur, fps] = [Number(m[1]), Number(m[2]), Number(m[3]), Number(m[4])];
const frames = Math.round(dur * fps);
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "reel-"));

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
await page.goto(pathToFileURL(path.resolve(src)).href, { waitUntil: "networkidle" });
await page.evaluate(() => document.fonts.ready);
for (let i = 0; i < frames; i++) {
  await page.evaluate((t) => window.setT(t), i / fps);
  await page.screenshot({ path: path.join(tmp, `f${String(i).padStart(5, "0")}.jpg`), type: "jpeg", quality: 92 });
}
await browser.close();

const out = path.resolve(outArg);
fs.mkdirSync(path.dirname(out), { recursive: true });
const r = spawnSync("ffmpeg", [
  "-y", "-loglevel", "error",
  "-framerate", String(fps), "-i", path.join(tmp, "f%05d.jpg"),
  "-f", "lavfi", "-i", "anullsrc=channel_layout=stereo:sample_rate=44100",
  "-shortest", "-c:v", "libx264", "-preset", "slow", "-crf", "18", "-pix_fmt", "yuv420p",
  "-profile:v", "high", "-movflags", "+faststart", "-c:a", "aac", "-b:a", "128k",
  out,
], { stdio: "inherit" });
fs.rmSync(tmp, { recursive: true, force: true });
if (r.status !== 0) process.exit(r.status ?? 1);
console.log(`✓ ${outArg} (${w}x${h}, ${dur}s, ${fps} fps, ${frames} frames)`);
