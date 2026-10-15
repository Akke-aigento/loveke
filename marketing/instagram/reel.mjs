// Rendert een reel: een HTML-pagina met <meta name="loveke-reel" content="BxH" data-duration="s" data-fps="n">
// en een functie window.setT(seconden) die de pagina deterministisch op tijdstip t zet.
// Elke frame wordt een screenshot; ffmpeg maakt er MP4's van (H.264 yuv420p, AAC, moov vooraan).
//
// Gebruik: node marketing/instagram/reel.mjs <index.html> <uitvoer-basis> [--music <mp3/m4a/wav>] [--music-start <s>]
//   → <uitvoer-basis>-stil.mp4    altijd: stil audiospoor, voor "zelf muziek kiezen" in de Instagram-app
//   → <uitvoer-basis>-muziek.mp4  met --music: nummer vanaf --music-start, fade-in 0,3 s, fade-out 1,5 s
// Elke MP4 blijft onder 9,5 MB (SellQo-opslag aanvaardt maximaal 10 MB per bestand).
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { spawnSync } from "node:child_process";
import { pathToFileURL } from "node:url";

const pwPath = process.env.PLAYWRIGHT_MODULE ?? "/opt/node-tools/node_modules/playwright/index.mjs";
const { chromium } = await import(pwPath);

const argv = process.argv.slice(2);
const flag = (name) => { const i = argv.indexOf(name); return i >= 0 ? argv[i + 1] : undefined; };
const positional = argv.filter((a, i) => !a.startsWith("--") && !(i > 0 && argv[i - 1].startsWith("--")));
const [src, outArg] = positional;
const music = flag("--music");
const musicStart = Number(flag("--music-start") ?? 0);
if (!src || !outArg) {
  console.error("Gebruik: node reel.mjs <index.html> <uitvoer-basis> [--music <bestand>] [--music-start <s>]");
  process.exit(1);
}
if (music && !fs.existsSync(music)) {
  console.error(`Muziekbestand niet gevonden: ${music}`);
  process.exit(1);
}
const MAX_BYTES = 9.5 * 1024 * 1024;
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

const base = path.resolve(outArg.replace(/\.mp4$/, ""));
fs.mkdirSync(path.dirname(base), { recursive: true });
const video = ["-framerate", String(fps), "-i", path.join(tmp, "f%05d.jpg")];
const enc = [
  "-c:v", "libx264", "-preset", "slow", "-crf", "20", "-maxrate", "3500k", "-bufsize", "7000k",
  "-pix_fmt", "yuv420p", "-profile:v", "high", "-g", String(fps * 2), "-movflags", "+faststart",
  "-c:a", "aac", "-b:a", "128k", "-ar", "44100", "-t", String(dur),
];
function ffmpeg(args, out) {
  const r = spawnSync("ffmpeg", ["-y", "-loglevel", "error", ...args, out], { stdio: "inherit" });
  if (r.status !== 0) { fs.rmSync(tmp, { recursive: true, force: true }); process.exit(r.status ?? 1); }
  const size = fs.statSync(out).size;
  if (size > MAX_BYTES) {
    console.error(`${out} is ${(size / 1048576).toFixed(1)} MB (max 9,5 MB). Maak de reel korter of rustiger.`);
    process.exit(1);
  }
  console.log(`✓ ${path.relative(process.cwd(), out)} (${w}x${h}, ${dur}s, ${fps} fps, ${(size / 1048576).toFixed(1)} MB)`);
}
ffmpeg([...video, "-f", "lavfi", "-i", "anullsrc=channel_layout=stereo:sample_rate=44100", "-map", "0:v", "-map", "1:a", ...enc], `${base}-stil.mp4`);
if (music) {
  const fadeOut = Math.max(0, dur - 1.5);
  ffmpeg([
    ...video, "-ss", String(musicStart), "-i", music,
    "-map", "0:v", "-map", "1:a",
    "-af", `afade=t=in:st=0:d=0.3,afade=t=out:st=${fadeOut}:d=1.5,loudnorm=I=-14:TP=-1.5:LRA=11`,
    ...enc,
  ], `${base}-muziek.mp4`);
}
fs.rmSync(tmp, { recursive: true, force: true });
