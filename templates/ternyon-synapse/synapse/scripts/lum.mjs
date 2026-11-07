/**
 * Measures how much light the canvas is actually putting on screen at a
 * given scroll position. Reads the drawing buffer, no screenshots.
 *   node scripts/lum.mjs [port] [scrollFraction]
 */
import { chromium } from "../../galaxy1/node_modules/playwright/index.mjs";
const port = process.argv[2] || "3040";
const where = Number(process.argv[3] ?? 0.42);
const browser = await chromium.launch({ args: ["--enable-unsafe-swiftshader", "--use-angle=swiftshader"] });
const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });
page.on("pageerror", (e) => console.log("pageerror:", e.message));
await page.goto(`http://localhost:${port}`, { waitUntil: "load" });
await page.waitForTimeout(7000);
await page.evaluate((f) => window.scrollTo({ top: document.documentElement.scrollHeight * f, behavior: "instant" }), where);
await page.waitForTimeout(2500);
const out = await page.evaluate(async () => {
  const canvas = document.querySelector(".webgl canvas");
  const gl = canvas.getContext("webgl2") || canvas.getContext("webgl");
  const w = canvas.width, h = canvas.height;
  const px = new Uint8Array(w * h * 4);
  await new Promise((res) => requestAnimationFrame(() => requestAnimationFrame(() => { gl.readPixels(0, 0, w, h, gl.RGBA, gl.UNSIGNED_BYTE, px); res(); })));
  let lit = 0, sum = 0, maxA = 0;
  for (let i = 0; i < px.length; i += 4) {
    const a = px[i + 3];
    if (a > 6) lit++;
    sum += px[i] + px[i + 1] + px[i + 2];
    if (a > maxA) maxA = a;
  }
  const v = window.__view;
  return {
    litFraction: +(lit / (w * h)).toFixed(4),
    meanRGB: +(sum / (w * h * 3)).toFixed(2),
    maxAlpha: maxA,
    neural: v ? { pin: +v.s.neural.pin.toFixed(3) } : null,
    cta: v ? { pin: +v.s.cta.pin.toFixed(3) } : null,
    work: v ? { pin: +v.s.work.pin.toFixed(3) } : null,
  };
});
console.log(JSON.stringify(out));
await browser.close();
