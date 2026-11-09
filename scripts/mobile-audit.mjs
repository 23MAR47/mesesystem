import { spawn } from 'node:child_process';
import http from 'node:http';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const debuggingPort = 9222;

const urls = [
  { name: 'Ana Sayfa', url: 'http://localhost:3003' },
  { name: 'Diş Kliniği', url: 'http://localhost:3003/showcases/dis-klinigi/index.html' },
  { name: 'Hukuk Bürosu', url: 'http://localhost:3003/showcases/hukuk-burosu/index.html' },
  { name: 'Mali Müşavir', url: 'http://localhost:3003/showcases/mali-musavir/index.html' },
  { name: 'Fitness & Pilates', url: 'http://localhost:3003/showcases/fitness/index.html' },
  { name: 'Temizlik', url: 'http://localhost:3003/showcases/temizlik/index.html' },
  { name: 'Fotoğrafçı', url: 'http://localhost:3003/showcases/fotografci/index.html' },
];

const viewports = [
  { name: 'Small Phone (360x640)', width: 360, height: 640 },
  { name: 'Standard Phone (375x667)', width: 375, height: 667 },
  { name: 'Modern Phone (390x844)', width: 390, height: 844 }
];

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function getJson(endpoint) {
  return new Promise((resolve, reject) => {
    http.get(`http://127.0.0.1:${debuggingPort}${endpoint}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch(e) { reject(e); }
      });
    }).on('error', reject);
  });
}

async function run() {
  console.log('Starting Edge in headless remote debugging mode...');
  const edgeProcess = spawn(edgePath, [
    `--remote-debugging-port=${debuggingPort}`,
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--user-data-dir=C:\\Users\\HUAWEI\\AppData\\Local\\Temp\\edge_debug_profile'
  ]);

  // Wait for edge to start
  let connected = false;
  for (let i = 0; i < 20; i++) {
    try {
      await sleep(400);
      const version = await getJson('/json/version');
      if (version) { connected = true; break; }
    } catch (e) {}
  }

  if (!connected) {
    console.error('Failed to connect to Edge debugging port.');
    edgeProcess.kill();
    process.exit(1);
  }

  console.log('Connected to Edge CDP. Running mobile audits across pages...\n');

  try {
    for (const page of urls) {
      console.log(`=======================================================`);
      console.log(`AUDITING: ${page.name} (${page.url})`);
      console.log(`=======================================================`);

      for (const vp of viewports) {
        // Create new tab
        const newTab = await getJson(`/json/new?${encodeURIComponent(page.url)}`);
        const wsUrl = newTab.webSocketDebuggerUrl;

        await new Promise((resolve) => {
          const ws = new WebSocket(wsUrl);
          let id = 1;
          const pending = new Map();

          function send(method, params = {}) {
            return new Promise((res, rej) => {
              const msgId = id++;
              pending.set(msgId, { res, rej });
              ws.send(JSON.stringify({ id: msgId, method, params }));
            });
          }

          ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.id && pending.has(data.id)) {
              const { res, rej } = pending.get(data.id);
              pending.delete(data.id);
              if (data.error) rej(data.error);
              else res(data.result);
            }
          };

          ws.onopen = async () => {
            try {
              // Emulate device metrics
              await send('Emulation.setDeviceMetricsOverride', {
                width: vp.width,
                height: vp.height,
                deviceScaleFactor: 2,
                mobile: true
              });

              // Wait 1.5s for render
              await sleep(1500);

              // Evaluate scrollWidth and overflowing elements
              const evalRes = await send('Runtime.evaluate', {
                expression: `
                  (() => {
                    const docWidth = document.documentElement.offsetWidth;
                    const scrollWidth = document.documentElement.scrollWidth;
                    const innerWidth = window.innerWidth;
                    const hasHorizontalOverflow = scrollWidth > innerWidth;

                    const overflowingElements = [];
                    const all = document.querySelectorAll('*');
                    for (const el of all) {
                      const rect = el.getBoundingClientRect();
                      if (rect.right > innerWidth + 1 || rect.width > innerWidth + 1) {
                        overflowingElements.push({
                          tag: el.tagName.toLowerCase(),
                          id: el.id,
                          className: (typeof el.className === 'string' ? el.className : ''),
                          rectRight: Math.round(rect.right),
                          rectWidth: Math.round(rect.width),
                          scrollWidth: el.scrollWidth
                        });
                      }
                    }

                    // Broken images check
                    const brokenImages = [];
                    for (const img of document.querySelectorAll('img')) {
                      if (img.complete && img.naturalWidth === 0) {
                        brokenImages.push({
                          src: img.src,
                          alt: img.alt,
                          className: img.className
                        });
                      }
                    }

                    return {
                      innerWidth,
                      scrollWidth,
                      hasHorizontalOverflow,
                      overflowCount: overflowingElements.length,
                      topOverflows: overflowingElements.slice(0, 5),
                      brokenImageCount: brokenImages.length,
                      brokenImages: brokenImages.slice(0, 3)
                    };
                  })()
                `,
                returnByValue: true
              });

              const result = evalRes.result?.value;
              if (result) {
                const status = result.hasHorizontalOverflow ? '❌ OVERFLOW' : '✅ OK';
                console.log(`[${vp.name}] ${status} -> Inner: ${result.innerWidth}px, Scroll: ${result.scrollWidth}px`);
                if (result.hasHorizontalOverflow) {
                  console.log(`   Overflowing items count: ${result.overflowCount}`);
                  console.log(`   Sample overflowing elements:`, JSON.stringify(result.topOverflows, null, 2));
                }
                if (result.brokenImageCount > 0) {
                  console.log(`   ⚠️ Broken images found (${result.brokenImageCount}):`, JSON.stringify(result.brokenImages, null, 2));
                }
              }

              // Close tab
              await getJson(`/json/close/${newTab.id}`);
              ws.close();
              resolve();
            } catch (err) {
              console.error('Error during tab evaluation:', err);
              ws.close();
              resolve();
            }
          };

          ws.onerror = (e) => {
            console.error('WebSocket error:', e);
            resolve();
          };
        });
      }
    }
  } finally {
    edgeProcess.kill();
    console.log('\nEdge audit process finished.');
  }
}

run();

