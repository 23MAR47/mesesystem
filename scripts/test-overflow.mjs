import { execSync } from 'node:child_process';
import http from 'node:http';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

const urls = [
  'http://localhost:3003',
  'http://localhost:3003/showcases/dis-klinigi/index.html',
  'http://localhost:3003/showcases/hukuk-burosu/index.html',
  'http://localhost:3003/showcases/mali-musavir/index.html',
  'http://localhost:3003/showcases/fitness/index.html',
  'http://localhost:3003/showcases/temizlik/index.html',
  'http://localhost:3003/showcases/fotografci/index.html',
];

const widths = [360, 375, 390];

console.log('Testing horizontal overflow...');

// We can inspect elements that have scrollWidth > clientWidth by launching Edge headless with a dump of console or evaluate
for (const u of urls) {
  console.log(`\nChecking URL: ${u}`);
  // Let's run a curl or check CSS
}

