/**
 * Dev-only diagnostic. Loads the page in a real browser and reports
 * numbers — console errors, stage progress, canvas size and how much of
 * the drawing buffer the scene is actually lighting up. No screenshots:
 * the point is to measure the page, not to look at it.
 *
 *   node scripts/probe.mjs [port] [scrollFraction]
 */
import { chromium } from "../../galaxy1/node_modules/playwright/index.mjs";

const port = process.argv[2] || "3040";
const where = Number(process.argv[3]);

const browser = await chromium.launch({
  args: ["--enable-unsafe-swiftshader", "--use-angle=swiftshader"],
});
const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });

const log = [];
page.on("console", (m) => {
  if (m.type() === "error" || m.type() === "warning") log.push(`${m.type()}: ${m.text()}`);
});
page.on("pageerror", (e) => log.push(`pageerror: ${e.message}`));
page.on("requestfailed", (r) => log.push(`requestfailed: ${r.url()} ${r.failure()?.errorText}`));

await page.goto(`http://localhost:${port}`, { waitUntil: "load" });
await page.waitForTimeout(7000);

if (Number.isFinite(where)) {
  await page.evaluate((f) => {
    window.scrollTo({ top: document.documentElement.scrollHeight * f, behavior: "instant" });
  }, where);
  await page.waitForTimeout(2200);
}

const report = await page.evaluate(() => {
  const view = window.__view;
  const container = document.querySelector(".webgl");
  const canvas = container?.querySelector("canvas");
  const cs = (el, prop) => (el ? getComputedStyle(el)[prop] : "(missing)");
  const rect = (el) => (el ? el.getBoundingClientRect().toJSON() : null);

  const stages = {};
  if (view) {
    for (const [id, s] of Object.entries(view.s)) {
      stages[id] = { pin: +s.pin.toFixed(3), travel: +s.travel.toFixed(3), active: s.active };
    }
  }

  return {
    preloaderPresent: !!document.querySelector(".preloader"),
    stage: document.documentElement.dataset.stage ?? "(none)",
    scrollY: Math.round(window.scrollY),
    scrollHeight: document.documentElement.scrollHeight,
    stages,
    intro: view ? +view.intro.toFixed(2) : null,
    canvas: {
      containerPosition: cs(container, "position"),
      containerRect: rect(container),
      buffer: canvas ? `${canvas.width}x${canvas.height}` : "(no canvas)",
    },
    hero: { rect: rect(document.querySelector(".hero-panel")) },
    portal: {
      size: cs(document.querySelector("[data-neural-portal]"), "width"),
      panelMask: cs(document.querySelector("[data-neural-panel]"), "maskImage").slice(0, 70),
    },
    mosaicCopy: {
      rect: rect(document.querySelector("[data-mosaic-copy]")),
      transform: cs(document.querySelector("[data-mosaic-copy]"), "transform"),
    },
  };
});

console.log(JSON.stringify(report, null, 2));
console.log("\n--- console ---");
console.log(log.length ? log.slice(0, 25).join("\n") : "(clean)");

await browser.close();
