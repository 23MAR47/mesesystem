/**
 * Generate the icon set and the share card from one mark.
 *
 * **There is no logo file in this repository**, and inventing one in a raster
 * editor would put the brand somewhere nobody can edit it. So the mark is
 * *derived* — it is the design's own geometry: the accent field with a squared
 * frame on it and a dot at each corner, the shape the opening curtain carried.
 * It is the one figure in this design that is legible at sixteen pixels, which
 * a wordmark in a light display serif is not.
 *
 * Everything below is written from `MARK`, so replacing the brand later is one
 * SVG and one `node scripts/generate-brand-assets.mjs`.
 *
 * Run: `node scripts/generate-brand-assets.mjs`
 * 📖 Docs: obsidian/frontend/design-system.md
 */

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import sharp from "sharp";

const ROOT = path.join(import.meta.dirname, "..");
const PUBLIC = path.join(ROOT, "public");
const APP = path.join(ROOT, "src", "app");

/** The accent, and the ground it is drawn on — `--raw-color-electric-500`. */
const ACCENT = "#0051ff";
const INK = "#ffffff";

/**
 * The mark, at any size.
 *
 * Proportions are fractions of the viewport rather than pixels, so the same
 * source is correct at 16 and at 512. The dots are deliberately large relative
 * to the frame: at a favicon's size the frame's hairline all but disappears and
 * the four dots are what carries the shape.
 */
const mark = (size, { bleed = true } = {}) => {
  const s = size;
  const inset = s * 0.24;
  const side = s - inset * 2;
  const dot = s * 0.085;
  const stroke = Math.max(s * 0.018, 0.75);
  const corners = [
    [inset, inset],
    [s - inset, inset],
    [inset, s - inset],
    [s - inset, s - inset],
  ];
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 ${s} ${s}">
  ${bleed ? `<rect width="${s}" height="${s}" rx="${s * 0.22}" fill="${ACCENT}"/>` : ""}
  <rect x="${inset}" y="${inset}" width="${side}" height="${side}" fill="none" stroke="${INK}" stroke-width="${stroke}"/>
  ${corners.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="${dot}" fill="${INK}"/>`).join("\n  ")}
</svg>`;
};

const png = (size, options) =>
  sharp(Buffer.from(mark(size, options))).png().toBuffer();

/**
 * An ICO carrying one PNG.
 *
 * `sharp` has no ICO encoder, and the format does not need one for this: an
 * icon directory is a 6-byte header plus a 16-byte entry per image, and modern
 * Windows and every browser read a PNG payload directly. One 32×32 entry is
 * what a favicon.ico is for — the `icon.svg` beside it is what actually gets
 * used anywhere that can choose.
 */
const ico = (image, size) => {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // 1 = icon
  header.writeUInt16LE(1, 4); // one image
  const entry = Buffer.alloc(16);
  entry.writeUInt8(size, 0); // width  (0 would mean 256)
  entry.writeUInt8(size, 1); // height
  entry.writeUInt8(0, 2); // palette
  entry.writeUInt8(0, 3); // reserved
  entry.writeUInt16LE(1, 4); // colour planes
  entry.writeUInt16LE(32, 6); // bits per pixel
  entry.writeUInt32LE(image.length, 8);
  entry.writeUInt32LE(header.length + entry.length, 12);
  return Buffer.concat([header, entry, image]);
};

/**
 * The share card: the accent field, the subject, and the mark.
 *
 * **No burned-in type.** Rendering the wordmark would mean resolving Melodrama
 * at build time, and it exists here only as `woff2` — which the SVG renderer
 * cannot read, and which no font toolchain in this repo can convert. A card
 * whose typeface silently falls back to whatever the build machine happens to
 * have installed is worse than one carrying no type at all: the title and the
 * description are OG *tags*, and every platform renders them beside the image.
 */
const shareCard = async () => {
  const [w, h] = [1200, 630];
  const poster = path.join(PUBLIC, "assets", "hero", "model-poster.webp");
  // **Full-bleed, not floated.** The poster has no alpha — it is the subject on
  // the porcelain stage — so dropped onto the accent as a smaller rectangle it
  // reads as a white box someone forgot to cut out. Taken to three edges it
  // reads as what it is: the first screen's own ground, beside the accent.
  // `cover` rather than `inside` for the same reason: no letterboxing.
  const panel = Math.round(w * 0.46);
  const subject = await sharp(poster)
    .resize({ width: panel, height: h, fit: "cover", position: "top" })
    .toBuffer();
  return sharp({
    create: {
      width: w,
      height: h,
      channels: 4,
      background: ACCENT,
    },
  })
    .composite([
      { input: subject, left: w - panel, top: 0 },
      { input: await png(132, { bleed: false }), left: 80, top: 80 },
    ])
    .png()
    .toBuffer();
};

const ANDROID = [36, 48, 72, 96, 144, 192];
const MS = [70, 150, 310];

const run = async () => {
  await mkdir(PUBLIC, { recursive: true });

  // The SVG is the one any modern browser prefers, and it is the source the
  // rest are rendered from.
  await writeFile(path.join(APP, "icon.svg"), mark(64), "utf8");
  await writeFile(path.join(APP, "favicon.ico"), ico(await png(32), 32));
  await writeFile(path.join(APP, "apple-icon.png"), await png(180));
  await writeFile(path.join(APP, "opengraph-image.png"), await shareCard());

  // Nothing else under `public/`. The starter's `favicon.ico`,
  // `favicon-16x16.png`, `favicon-32x32.png` and `apple-icon-180x180.png` are
  // gone: `src/app/` owns those now through Next's file conventions, and a
  // second `public/favicon.ico` claims the same `/favicon.ico` URL — two files
  // for one path, and whichever wins is a detail of the framework rather than a
  // decision anyone made.
  for (const size of ANDROID) {
    await writeFile(
      path.join(PUBLIC, `android-icon-${size}x${size}.png`),
      await png(size),
    );
  }
  for (const size of MS) {
    await writeFile(path.join(PUBLIC, `ms-icon-${size}x${size}.png`), await png(size));
  }

  console.log("brand assets written");
};

await run();
