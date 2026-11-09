import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

// ── 1. Edge Executable Resolution ────────────────────────────
const candidatePaths = [
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  process.env.EDGE_PATH
].filter(Boolean);

const edgePath = candidatePaths.find(p => fs.existsSync(p));

if (!edgePath) {
  console.error('Edge executable not found in candidate paths:', candidatePaths);
  process.exit(1);
}

console.log(`[Capture] Using Edge binary: ${edgePath}`);

// ── 2. Homepage Preview Capture (Desktop 1280x900) ───────────
const homepageUrl = process.env.HOMEPAGE_URL || 'http://localhost:3003';
const mainPreviewPng = path.resolve('public/preview.png');

console.log(`[Capture] Capturing homepage preview from ${homepageUrl} -> ${mainPreviewPng}...`);

const cmdHomepage = `"${edgePath}" --headless=new --disable-gpu --window-size=1280,900 --hide-scrollbars --run-all-compositor-stages-before-draw --virtual-time-budget=3000 --screenshot="${mainPreviewPng}" "${homepageUrl}"`;

try {
  execSync(cmdHomepage, { stdio: 'pipe' });
  if (fs.existsSync(mainPreviewPng)) {
    const size = fs.statSync(mainPreviewPng).size;
    console.log(`  ✓ Homepage preview captured: public/preview.png (${size.toLocaleString('en-US')} bytes)`);
  } else {
    console.error('  ✗ Homepage preview file not created on disk.');
  }
} catch (err) {
  console.error('  ✗ Homepage preview capture failed:', err.message);
}

// ── 3. Showcase Previews Capture (Desktop 1280x900 & Mobile 390x844) ──
const targetSlugs = [
  'dis-klinigi',
  'hukuk-burosu',
  'mali-musavir',
  'fitness',
  'temizlik',
  'fotografci'
];

for (const slug of targetSlugs) {
  const htmlPath = path.resolve('public/showcases', slug, 'index.html');
  if (!fs.existsSync(htmlPath)) {
    console.error('HTML not found for:', slug);
    continue;
  }

  const fileUrl = 'file:///' + htmlPath.replace(/\\/g, '/');
  const previewPng = path.resolve('public/showcases', slug, 'preview.png');
  const projectJpg = path.resolve('public/projects', slug + '.jpg');
  const mobileJpg = path.resolve('public/projects', slug + '-mobile.jpg');

  console.log(`[Capture] Processing showcase: ${slug}...`);

  // 3a. Desktop Screenshot: 1280x900
  const cmdDesktop = `"${edgePath}" --headless=new --disable-gpu --window-size=1280,900 --hide-scrollbars --run-all-compositor-stages-before-draw --virtual-time-budget=3000 --screenshot="${previewPng}" "${fileUrl}"`;
  try {
    execSync(cmdDesktop, { stdio: 'pipe' });
    fs.copyFileSync(previewPng, projectJpg);
    const size = fs.statSync(previewPng).size;
    console.log(`  ✓ Desktop captured: ${slug} (${size.toLocaleString('en-US')} bytes) -> saved to preview.png & ${slug}.jpg`);
  } catch (err) {
    console.error(`  ✗ Desktop capture failed for ${slug}:`, err.message);
  }

  // 3b. Mobile Screenshot: 390x844
  const cmdMobile = `"${edgePath}" --headless=new --disable-gpu --window-size=390,844 --hide-scrollbars --run-all-compositor-stages-before-draw --virtual-time-budget=3000 --screenshot="${mobileJpg}" "${fileUrl}"`;
  try {
    execSync(cmdMobile, { stdio: 'pipe' });
    const size = fs.statSync(mobileJpg).size;
    console.log(`  ✓ Mobile captured: ${slug} (${size.toLocaleString('en-US')} bytes) -> saved to ${slug}-mobile.jpg`);
  } catch (err) {
    console.error(`  ✗ Mobile capture failed for ${slug}:`, err.message);
  }
}

console.log('[Capture] All showcase & homepage screenshots captured successfully.');
