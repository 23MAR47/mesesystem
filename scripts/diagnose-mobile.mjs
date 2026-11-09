import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

const pages = [
  { name: 'Ana Sayfa', url: 'http://localhost:3003' },
  { name: 'Diş Kliniği', url: 'http://localhost:3003/showcases/dis-klinigi/index.html' },
  { name: 'Hukuk Bürosu', url: 'http://localhost:3003/showcases/hukuk-burosu/index.html' },
  { name: 'Mali Müşavir', url: 'http://localhost:3003/showcases/mali-musavir/index.html' },
  { name: 'Fitness & Pilates', url: 'http://localhost:3003/showcases/fitness/index.html' },
  { name: 'Temizlik', url: 'http://localhost:3003/showcases/temizlik/index.html' },
  { name: 'Fotoğrafçı', url: 'http://localhost:3003/showcases/fotografci/index.html' },
];

console.log('Testing mobile pages at 390x844...');

for (const p of pages) {
  const outPng = path.resolve(`public/mobile-test-${p.name.replace(/[^a-z0-9]/gi, '_')}.png`);
  const cmd = `"${edgePath}" --headless=new --disable-gpu --window-size=390,844 --hide-scrollbars --virtual-time-budget=2000 --screenshot="${outPng}" "${p.url}"`;
  try {
    execSync(cmd, { stdio: 'pipe' });
    console.log(`✓ ${p.name}: Screenshot saved (${fs.statSync(outPng).size} bytes)`);
  } catch (err) {
    console.error(`✗ ${p.name} failed:`, err.message);
  }
}

