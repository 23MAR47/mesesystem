import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const TEMPLATES_DIR = path.join(ROOT, 'templates');
const SHOWCASES_DIR = path.join(ROOT, 'public', 'showcases');

export const SHOWCASES_META = [
  {
    slug: 'ai-creator',
    title: 'AI Creator Studio',
    category: 'Yapay Zeka & SaaS',
    sector: 'Yaratıcı araçlar',
    accent: '#22d3ee',
    bg: '#07131a',
    badge: 'Yaratıcı iş akışı konsepti',
    tagline: 'Fikirden görsel taslağa, yaratıcı bir başlangıç noktası.',
    desc: 'Metin ve görsel üretim akışlarını keşfetmek için hazırlanmış arayüz konsepti. Bu vitrinde harici bir yapay zeka servisi çalışmaz.',
    interaction: 'creator',
  },
  {
    slug: 'amble',
    title: 'Amble Studio',
    category: 'Butik zanaat & yavaş yaşam',
    sector: 'Zanaat',
    accent: '#d97706',
    bg: '#17120e',
    badge: 'Atölye seçkisi',
    tagline: 'Yavaş üretim, gündelik nesneler ve kendi ritmini bulmak.',
    desc: 'Triko, seramik ve küçük ev eşyaları için tasarlanmış butik bir katalog. Ürün görselleri paketteki yerel görsel seçkisinden gelir.',
    interaction: 'craft',
  },
  {
    slug: 'artist',
    title: 'Artist Lookbook',
    category: 'Sanat & kültür',
    sector: 'Galeri',
    accent: '#ec4899',
    bg: '#130e15',
    badge: 'Dijital galeri konsepti',
    tagline: 'Seçilmiş işler arasında gezinen sade bir dijital galeri.',
    desc: 'Sanatçı portfolyosu ve sergi seçkisi için hazırlanmış editoryal bir arayüz denemesi.',
    interaction: 'gallery',
  },
  {
    slug: 'auralis',
    title: 'Auralis Spatial Sound',
    category: 'Ses teknolojileri',
    sector: 'Ses',
    accent: '#a855f7',
    bg: '#100b1b',
    badge: 'Uzamsal ses arayüzü',
    tagline: 'Mekânı, katmanları ve sesi keşfetmek için tasarlanmış bir çalışma alanı.',
    desc: 'Uzamsal ses araçları için ürün arayüzü konsepti. Kontroller görsel bir önizlemedir; gerçek ses işleme yapılmaz.',
    interaction: 'audio',
  },
  {
    slug: 'camera',
    title: 'Camera Optical Lab',
    category: 'Sinema & teknoloji',
    sector: 'Optik',
    accent: '#38bdf8',
    bg: '#09131b',
    badge: 'Optik ürün kataloğu',
    tagline: 'Bir lens seçin, kadrajın karakterini karşılaştırın.',
    desc: 'Sinematografi ekipmanları için hazırlanmış bir ürün seçici ve katalog arayüzü.',
    interaction: 'camera',
  },
  {
    slug: 'colibri',
    title: 'Colibri Electric Mobility',
    category: 'Mobilite & tasarım',
    sector: 'Mobilite',
    accent: '#10b981',
    bg: '#071510',
    badge: 'Mobilite konsepti',
    tagline: 'Şehir içi yolculuklar için hafif ve yalın bir deneyim.',
    desc: 'Elektrikli mikromobilite ürün konsepti. Menzil kontrolü yalnızca örnek bir hesaplamadır.',
    interaction: 'mobility',
  },
  {
    slug: 'dringle',
    title: 'Dringle Beverage & Roastery',
    category: 'Kafe & içecek',
    sector: 'Kafe',
    accent: '#f59e0b',
    bg: '#171108',
    badge: 'Kafe menüsü konsepti',
    tagline: 'Kavrulmuş kahve ve mevsimlik içeceklerden küçük bir seçki.',
    desc: 'Kafe menüsü ve sipariş akışı konsepti. Sepet bu sayfada yerel olarak çalışır; ödeme alınmaz.',
    interaction: 'beverage',
  },
  {
    slug: 'halden',
    title: 'Halden Arkitektur',
    category: 'Mimarlık & konaklama',
    sector: 'Mimarlık',
    accent: '#94a3b8',
    bg: '#111519',
    badge: 'Mimari portfolyo konsepti',
    tagline: 'Malzeme, ışık ve yer duygusuyla şekillenen mekânlar.',
    desc: 'Mimarlık portfolyosu ve konaklama projeleri için hazırlanmış seçki arayüzü.',
    interaction: 'architecture',
  },
  {
    slug: 'helion',
    title: 'Helion Deep Energy',
    category: 'Enerji & veri',
    sector: 'Enerji',
    accent: '#eab308',
    bg: '#171506',
    badge: 'Örnek telemetri paneli',
    tagline: 'Enerji verisini anlaşılır bir izleme deneyimine dönüştürmek.',
    desc: 'Yenilenebilir enerji yönetimi için bir kontrol paneli konsepti. Değerler örnek veridir ve canlı bir şebekeye bağlı değildir.',
    interaction: 'energy',
  },
  {
    slug: 'keelway',
    title: 'Keelway Marine & Yachts',
    category: 'Denizcilik & tasarım',
    sector: 'Denizcilik',
    accent: '#06b6d4',
    bg: '#07141b',
    badge: 'Denizcilik konsepti',
    tagline: 'Açık deniz rotaları ve tekne tasarımını tek bir yerde keşfedin.',
    desc: 'Yat portfolyosu ve seyir rotası seçimi için tasarlanmış bir web deneyimi.',
    interaction: 'marine',
  },
  {
    slug: 'negantropy',
    title: 'Negantropy Scientific Intelligence',
    category: 'Bilimsel görselleştirme',
    sector: 'Araştırma',
    accent: '#818cf8',
    bg: '#0e1020',
    badge: 'Simülasyon arayüzü konsepti',
    tagline: 'Parametreleri değiştirin ve görselleştirmenin nasıl tepki verdiğini görün.',
    desc: 'Bilimsel hesaplama iş akışlarını anlatan bir arayüz denemesi. Sonuçlar örnek görselleştirmelerdir.',
    interaction: 'simulation',
  },
  {
    slug: 'sentinel',
    title: 'Sentinel Enterprise Security',
    category: 'Güvenlik arayüzü',
    sector: 'Güvenlik',
    accent: '#ef4444',
    bg: '#190d0e',
    badge: 'Güvenlik paneli konsepti',
    tagline: 'Olayları anlamlandırmak için sakin ve okunabilir bir görünüm.',
    desc: 'Kurumsal güvenlik operasyonlarına yönelik arayüz konsepti. Olay akışı kurgusaldır; tarama veya savunma işlemi yapılmaz.',
    interaction: 'security',
  },
  {
    slug: 'stackside',
    title: 'Stackside Cloud Infrastructure',
    category: 'Geliştirici araçları',
    sector: 'Bulut',
    accent: '#3b82f6',
    bg: '#0b1320',
    badge: 'Geliştirici paneli konsepti',
    tagline: 'Dağıtım durumunu ve servis sağlığını tek bakışta takip edin.',
    desc: 'Bulut dağıtım akışları için hazırlanmış bir geliştirici deneyimi konsepti. Dağıtım düğmesi yalnızca arayüz durumunu değiştirir.',
    interaction: 'cloud',
  },
  {
    slug: 'synapse',
    title: 'Synapse Cognitive Clinic',
    category: 'Sağlık arayüzü',
    sector: 'Sağlık',
    accent: '#14b8a6',
    bg: '#081716',
    badge: 'Sentetik sinyal önizlemesi',
    tagline: 'Biyometrik veriyi dikkatli ve anlaşılır sunmak için bir arayüz fikri.',
    desc: 'Nöroloji ve dijital sağlık temalı arayüz konsepti. Sinyal yalnızca sentetik bir görseldir; tanı veya sağlık değerlendirmesi değildir.',
    interaction: 'clinic',
  },
];

export const INDUSTRY_DEMOS_META = [
  {
    slug: 'qr-menu',
    title: 'Yosun',
    sector: 'Restoran',
    accent: '#b85f38',
    desc: 'Kategoriler, ürün seçimi ve örnek sipariş akışı içeren dijital restoran menüsü.',
  },
  {
    slug: 'berber',
    title: 'Keskin Hat',
    sector: 'Berber',
    accent: '#b68a51',
    desc: 'Hizmetleri, fiyat listesini ve örnek randevu talebini gösteren berber sitesi.',
  },
  {
    slug: 'kuafor',
    title: 'Doku',
    sector: 'Kuaför',
    accent: '#9f6b78',
    desc: 'Saç hizmetleri, stil seçkisi ve örnek randevu akışıyla kuaför vitrini.',
  },
  {
    slug: 'guzellik-salonu',
    title: 'Nilüfer Oda',
    sector: 'Güzellik',
    accent: '#a66f78',
    desc: 'Bakım hizmetleri ve örnek randevu talebiyle tasarlanmış güzellik salonu sitesi.',
  },
  {
    slug: 'elektrikci',
    title: 'Akım',
    sector: 'Elektrik',
    accent: '#bc8a39',
    desc: 'Elektrik hizmetleri, çalışma alanları ve örnek keşif talebi akışı.',
  },
  {
    slug: 'tesisatci',
    title: 'İyi Akış',
    sector: 'Tesisat',
    accent: '#408b91',
    desc: 'Tesisat çözümleri, servis kapsamı ve örnek servis talebi formu.',
  },
  {
    slug: 'insaat',
    title: 'Hat Çizgisi',
    sector: 'İnşaat',
    accent: '#b26b4a',
    desc: 'Filtrelenebilir örnek projeleriyle yapı firması portfolyo sitesi.',
  },
  {
    slug: 'otel',
    title: 'Yamaç Konak',
    sector: 'Otel',
    accent: '#a47a54',
    desc: 'Oda seçkisi ve örnek rezervasyon talebi içeren konaklama sitesi.',
  },
  {
    slug: 'market',
    title: 'Aralık Market',
    sector: 'Market',
    accent: '#63805c',
    desc: 'Ürün arama, kategori filtreleme ve çalışan örnek sepet akışı.',
  },
  {
    slug: 'kuruyemis',
    title: 'Çıtır & Çekirdek',
    sector: 'Kuruyemiş',
    accent: '#a66d3f',
    desc: 'Ürün kataloğu, sepet ve örnek sipariş adımlarıyla kuruyemiş mağazası.',
  },
  {
    slug: 'emlak',
    title: 'Aralık',
    sector: 'Emlak',
    accent: '#657f84',
    desc: 'Filtrelenebilir örnek konut ilanları ve detay görünümü.',
  },
  {
    slug: 'oto-servis',
    title: 'Vites Atölye',
    sector: 'Otomotiv',
    accent: '#6f7a82',
    desc: 'Servis başlıkları, bakım seçenekleri ve örnek servis talep formu.',
  },
  {
    slug: 'rent-a-car',
    title: 'Rota',
    sector: 'Araç kiralama',
    accent: '#55798a',
    desc: 'Araç kataloğu, tarih seçimi ve örnek kiralama talebi.',
  },
];

const SKIP_DIRS = new Set(['.git', '.next', 'node_modules', 'dist', 'build', 'coverage']);
const MEDIA_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.webp', '.avif', '.gif', '.mp4', '.webm']);
const SKIP_MEDIA_NAME = /(?:^|[-_.])(icon|favicon|logo|open-graph|og-image|apple-touch|android|manifest|avatar)(?:[-_.]|$)/i;

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[char]);
}

function walkFiles(directory) {
  if (!fs.existsSync(directory)) return [];
  const found = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) found.push(...walkFiles(fullPath));
    } else if (entry.isFile()) {
      found.push(fullPath);
    }
  }
  return found;
}

function findProjectRoot(templateDir) {
  const packages = walkFiles(templateDir).filter((file) => path.basename(file) === 'package.json');
  if (packages.length !== 1) {
    throw new Error(`Expected one project package.json in ${templateDir}; found ${packages.length}`);
  }
  return path.dirname(packages[0]);
}

function findMedia(projectRoot) {
  const candidates = [
    ...walkFiles(path.join(projectRoot, 'public')),
    ...walkFiles(path.join(projectRoot, 'src', 'assets')),
  ].filter((file) => {
    const name = path.basename(file);
    const extension = path.extname(file).toLowerCase();
    return MEDIA_EXTENSIONS.has(extension) && !SKIP_MEDIA_NAME.test(name) && fs.statSync(file).size <= 12_000_000;
  });
  return [...new Set(candidates)].sort((a, b) => a.localeCompare(b)).slice(0, 3);
}

function clearGeneratedOutput(directory) {
  const resolved = path.resolve(directory);
  if (resolved === path.resolve(ROOT) || !resolved.startsWith(`${path.resolve(SHOWCASES_DIR)}${path.sep}`)) {
    throw new Error(`Refusing to clear path outside showcase output: ${resolved}`);
  }
  fs.mkdirSync(resolved, { recursive: true });
  for (const entry of fs.readdirSync(resolved, { withFileTypes: true })) {
    const target = path.join(resolved, entry.name);
    if (entry.isDirectory()) fs.rmSync(target, { recursive: true, force: true });
    else fs.rmSync(target, { force: true });
  }
}

function mediaMarkup(project, media) {
  if (media.length === 0) {
    return `<div class="visual-fallback" aria-hidden="true"><span>${escapeHtml(project.title.slice(0, 1))}</span><i></i><i></i><i></i></div>`;
  }
  return media.map((file, index) => {
    const extension = path.extname(file).toLowerCase();
    const url = `/showcases/${project.slug}/media/asset-${String(index + 1).padStart(2, '0')}${extension}`;
    if (extension === '.mp4' || extension === '.webm') {
      return `<video class="project-media" src="${url}" controls muted playsinline preload="metadata" aria-label="${escapeHtml(project.title)} video preview"></video>`;
    }
    const hidden = project.interaction === 'gallery' && index > 0 ? ' hidden' : '';
    return `<img class="project-media" src="${url}" alt="${escapeHtml(project.title)} — yerel proje görseli ${index + 1}" loading="lazy"${hidden}>`;
  }).join('');
}

function interactionMarkup(project) {
  const button = (label, action, extra = '') =>
    `<button class="button" type="button" data-action="${action}" ${extra}>${label}</button>`;

  switch (project.interaction) {
    case 'creator':
      return `<label class="field-label" for="prompt">Bir fikir yazın</label><textarea id="prompt" class="field" rows="3" placeholder="Örn. gün batımında bir sahil kitapçısı"></textarea><div class="action-row">${button('Taslak oluştur', 'generate')}<span class="status" data-result aria-live="polite">Örnek akış hazır</span></div><div class="result-card" data-output>Burada yerel bir taslak önizlemesi görünecek.</div>`;
    case 'craft':
      return `<div class="product-row"><div><strong>Yumuşak dokulu atkı</strong><small>Atölye seçkisinden · konsept ürün</small></div><span>₺1.250</span></div><div class="product-row"><div><strong>El yapımı fincan</strong><small>Seramik seçkisinden · konsept ürün</small></div><span>₺680</span></div><div class="action-row">${button('Sepete ekle', 'add-cart')}<span class="status" data-result aria-live="polite">Sepet: 0 ürün</span></div>`;
    case 'gallery':
      return `<div class="action-row">${button('← Önceki', 'gallery-prev')}<span class="status" data-result aria-live="polite">Seçki 1 / ${Math.max(1, project.mediaCount)}</span>${button('Sonraki →', 'gallery-next')}</div><p class="muted">Görseller, çıkarılmış proje paketinden seçilmiştir.</p>`;
    case 'audio':
      return `<div class="audio-visual" data-audio-visual aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div><div class="action-row">${button('Önizlemeyi başlat', 'audio')}<span class="status" data-result aria-live="polite">Ses işleme bağlı değil</span></div>`;
    case 'camera':
      return `<p class="muted">Odak uzaklığını seçin</p><div class="choice-row">${['35 mm', '50 mm', '85 mm'].map((value, index) => button(value, 'lens', `aria-pressed="${index === 0}" data-value="${value}"`)).join('')}</div><div class="result-card" data-result aria-live="polite">35 mm · geniş ve doğal bir kadraj</div>`;
    case 'mobility':
      return `<label class="field-label" for="distance">Sürüş profili: <span data-distance-label>orta</span></label><input id="distance" class="range" type="range" min="1" max="10" value="5" data-action="distance"><div class="result-card" data-result aria-live="polite">Örnek yolculuk: yaklaşık 25 km</div>`;
    case 'beverage':
      return `<div class="choice-row">${['Cold brew', 'Citrus tonic', 'Oat latte'].map((value) => button(value, 'drink', `data-value="${value}"`)).join('')}</div><div class="product-row"><div><strong data-drink>Cold brew</strong><small>Örnek menü · ödeme alınmaz</small></div><span>₺145</span></div><div class="action-row">${button('Siparişe ekle', 'add-drink')}<span class="status" data-result aria-live="polite">Sipariş: 0 ürün</span></div>`;
    case 'architecture':
      return `<p class="muted">Bir proje seçin</p><div class="choice-row">${['Orman evi', 'Kıyı evi', 'Atölye'].map((value) => button(value, 'project', `data-value="${value}"`)).join('')}</div><div class="result-card" data-result aria-live="polite">Orman evi · doğal malzeme ve yumuşak ışık</div>`;
    case 'energy':
      return `<div class="metric-row"><span>Üretim (örnek)</span><strong data-metric>4.2 MW</strong></div><div class="metric-row"><span>Depolama (örnek)</span><strong>78%</strong></div><div class="action-row">${button('Örnek veriyi yenile', 'refresh')}<span class="status" data-result aria-live="polite">Güncel değil: demo verisi</span></div>`;
    case 'marine':
      return `<p class="muted">Örnek rota seçin</p><div class="choice-row">${['Ege', 'Adriyatik', 'Balear'].map((value) => button(value, 'route', `data-value="${value}"`)).join('')}</div><div class="result-card" data-result aria-live="polite">Ege rotası · 3 durak · örnek plan</div>`;
    case 'simulation':
      return `<label class="field-label" for="iterations">Görselleştirme adımı: <span data-step>50</span></label><input id="iterations" class="range" type="range" min="10" max="100" step="10" value="50" data-action="step"><div class="chart" data-chart aria-label="Örnek simülasyon grafiği"></div><div class="action-row">${button('Örnek görselleştirmeyi güncelle', 'simulate')}<span class="status" data-result aria-live="polite">Sonuç temsili veridir</span></div>`;
    case 'security':
      return `<div class="event-row"><span class="signal-dot"></span><span>Örnek olay akışı</span><strong data-event-count>3 olay</strong></div><div class="event-list"><span>Şüpheli giriş · örnek</span><span>Politika kontrolü · örnek</span><span>Oturum denetimi · örnek</span></div><div class="action-row">${button('Olay akışını canlandır', 'security')}<span class="status" data-result aria-live="polite">Kurgusal veri · sisteme bağlı değil</span></div>`;
    case 'cloud':
      return `<label class="field-label" for="branch">Örnek branch adı</label><input id="branch" class="field" value="main" maxlength="40"><div class="action-row">${button('Dağıtım akışını önizle', 'deploy')}<span class="status" data-result aria-live="polite">Servise bağlı değil</span></div><div class="steps" data-steps><span>Kaynak</span><span>Derleme</span><span>Önizleme</span></div>`;
    case 'clinic':
      return `<div class="signal-chart" data-signal aria-hidden="true">${Array.from({ length: 28 }, (_, index) => `<i style="--i:${index};--scale:${0.25 + ((index * 23) % 70) / 100}"></i>`).join('')}</div><div class="action-row">${button('Sentetik sinyali göster', 'signal')}<span class="status" data-result aria-live="polite">Gerçek sensör verisi yok</span></div><p class="muted">Tanı veya sağlık değerlendirmesi sunmaz.</p>`;
    default:
      throw new Error(`Unknown showcase interaction: ${project.interaction}`);
  }
}

function generatePage(project) {
  const title = escapeHtml(project.title);
  const images = project.mediaMarkup || '';
  return `<!doctype html>
<html lang="tr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="${project.bg}">
  <meta name="description" content="${escapeHtml(project.desc)}">
  <title>${title} — Türkiye'den dijital proje</title>
  <style>
    :root{color-scheme:dark;--accent:${project.accent};--bg:${project.bg};--panel:color-mix(in srgb,var(--accent) 8%,#11151d);--line:color-mix(in srgb,var(--accent) 28%,#30343d);font-family:Inter,ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif;scroll-behavior:smooth}
    *{box-sizing:border-box}body{margin:0;min-height:100vh;background:radial-gradient(ellipse at 85% 12%,color-mix(in srgb,var(--accent) 18%,transparent),transparent 34%),var(--bg);color:#f4f4f5}
    a{color:inherit}.shell{max-width:1200px;margin:auto;padding:0 28px}.skip-link{position:absolute;left:12px;top:-60px;z-index:40;border-radius:999px;background:var(--accent);color:#071014;padding:10px 14px;font-size:12px;font-weight:700}.skip-link:focus{top:12px}.topbar{position:sticky;top:0;z-index:20;display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:20px;padding:14px 0;border-bottom:1px solid #ffffff1a;background:color-mix(in srgb,var(--bg) 88%,transparent);backdrop-filter:blur(18px)}
    .brand{display:flex;align-items:center;gap:11px;font-size:13px;font-weight:650;letter-spacing:.01em;text-decoration:none}.mark{width:34px;height:34px;display:grid;place-items:center;border-radius:11px;background:var(--accent);color:#071014;font-weight:800}
    .site-nav{display:flex;align-items:center;justify-content:center;gap:5px}.tab{border:1px solid transparent;border-radius:999px;padding:9px 13px;color:#c5cbd2;font-size:11px;text-decoration:none;transition:color .18s,border-color .18s,background .18s}.tab:hover,.tab:focus-visible{border-color:var(--line);background:var(--panel);color:#fff}
    .back,.license{justify-self:end;font-size:11px;text-decoration:none;color:#b9c1cb}.back:hover,.license:hover{color:var(--accent)}.eyebrow{margin:0 0 14px;color:var(--accent);font:11px ui-monospace,SFMono-Regular,Consolas,monospace;text-transform:uppercase;letter-spacing:.14em}
    main{padding:0 0 60px}.hero{display:grid;grid-template-columns:minmax(0,.92fr) minmax(0,1.08fr);align-items:center;gap:48px;padding:76px 0 72px;min-height:560px}.intro{max-width:580px}.intro h1{max-width:680px;margin:0;font-size:clamp(38px,5.5vw,70px);line-height:1.02;letter-spacing:-.052em}.intro p{max-width:560px;color:#b7c0ca;line-height:1.75;font-size:15px;margin:20px 0 0}
    .tag{display:inline-flex;margin-top:22px;border:1px solid var(--line);border-radius:999px;padding:8px 12px;color:#e3e7ec;font-size:11px}.hero-actions{display:flex;flex-wrap:wrap;gap:10px;margin-top:26px}.cta{display:inline-flex;align-items:center;justify-content:center;min-height:42px;border:1px solid var(--accent);border-radius:999px;background:var(--accent);color:#071014;padding:10px 16px;font-size:12px;font-weight:700;text-decoration:none;transition:transform .18s,filter .18s}.cta:hover{filter:brightness(1.08);transform:translateY(-2px)}.cta.secondary{background:transparent;color:#fff;border-color:#ffffff30}
    .hero-gallery,.panel{border:1px solid var(--line);border-radius:22px;background:linear-gradient(145deg,var(--panel),#ffffff04);padding:20px;box-shadow:0 28px 90px #0004}.gallery-head,.panel-head{display:flex;align-items:center;justify-content:space-between;gap:12px;padding-bottom:14px;border-bottom:1px solid #ffffff15;margin-bottom:16px}.gallery-head strong,.panel-head strong{font-size:12px}.gallery-head span,.panel-head span{font-size:9px;color:#96a1ad;font-family:ui-monospace,SFMono-Regular,Consolas,monospace;letter-spacing:.1em}
    .media-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:10px}.project-media{display:block;width:100%;height:250px;object-fit:cover;border-radius:14px;background:#ffffff0b;border:1px solid #ffffff12;transition:transform .35s,filter .35s}.project-media:hover{transform:scale(1.025);filter:saturate(1.12)}.project-media[hidden]{display:none}.media-grid video{height:auto;max-height:360px;grid-column:1/-1}
    .visual-fallback{height:250px;position:relative;overflow:hidden;border-radius:14px;background:radial-gradient(ellipse at 60% 48%,color-mix(in srgb,var(--accent) 50%,transparent),transparent 22%),linear-gradient(135deg,#ffffff06,#0005);border:1px solid #ffffff14}
    .visual-fallback span{position:absolute;left:25px;top:17px;font-size:clamp(76px,15vw,150px);font-weight:750;color:color-mix(in srgb,var(--accent) 55%,transparent);letter-spacing:-.09em}
    .visual-fallback i{position:absolute;border:1px solid color-mix(in srgb,var(--accent) 55%,transparent);border-radius:50%;width:180px;height:180px;right:9%;top:10%;box-shadow:0 0 42px color-mix(in srgb,var(--accent) 20%,transparent)}.visual-fallback i:nth-child(3){width:120px;height:120px;right:17%;top:22%}.visual-fallback i:nth-child(4){width:62px;height:62px;right:25%;top:34%;background:color-mix(in srgb,var(--accent) 25%,transparent)}
    .section{padding:64px 0;border-top:1px solid #ffffff14;scroll-margin-top:92px}.section-heading{display:flex;align-items:end;justify-content:space-between;gap:20px;margin-bottom:26px}.section-heading h2{max-width:680px;margin:0;font-size:clamp(28px,4vw,44px);line-height:1.08;letter-spacing:-.04em}.section-heading p{max-width:420px;margin:0;color:#aab3be;font-size:13px;line-height:1.65}
    .feature-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}.feature-card{min-height:160px;padding:20px;border:1px solid #ffffff16;border-radius:16px;background:linear-gradient(145deg,var(--panel),#ffffff03)}.feature-card span{display:block;color:var(--accent);font:10px ui-monospace,monospace;letter-spacing:.12em;text-transform:uppercase}.feature-card h3{margin:20px 0 8px;font-size:15px}.feature-card p{margin:0;color:#aab3be;font-size:12px;line-height:1.65}
    .workspace{max-width:840px}.panel{padding:26px}.interaction-note{margin:-3px 0 18px;color:#aab3be;font-size:12px;line-height:1.6}
    .field-label{display:block;margin:4px 0 8px;font-size:12px;color:#cad1d9}.field{width:100%;border:1px solid #ffffff20;border-radius:10px;background:#080b10;color:#f4f4f5;padding:11px 12px;font:inherit;font-size:13px;resize:vertical}.field:focus{outline:2px solid color-mix(in srgb,var(--accent) 50%,transparent);outline-offset:1px}
    .button{border:1px solid var(--line);border-radius:10px;background:color-mix(in srgb,var(--accent) 18%,#10141c);color:#fff;padding:9px 12px;cursor:pointer;font:600 12px inherit;transition:background .16s,transform .16s}.button:hover{background:color-mix(in srgb,var(--accent) 32%,#10141c)}.button:active{transform:translateY(1px)}.button[aria-pressed=true]{background:var(--accent);color:#091014}
    .action-row,.choice-row{display:flex;align-items:center;flex-wrap:wrap;gap:9px;margin-top:14px}.status,.muted{color:#9ba5b1;font-size:11px;line-height:1.55}.result-card{margin-top:14px;border:1px solid #ffffff14;border-radius:11px;background:#070a0e99;padding:13px;color:#dce3e9;font-size:12px;line-height:1.55}
    .product-row,.metric-row,.event-row{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:13px 0;border-bottom:1px solid #ffffff12;font-size:12px}.product-row strong,.metric-row strong{display:block}.product-row small{display:block;color:#9ba5b1;font-size:10px;margin-top:4px}
    .range{width:100%;accent-color:var(--accent)}.audio-visual{height:82px;display:flex;align-items:center;justify-content:center;gap:5px}.audio-visual i{width:5px;height:20%;border-radius:5px;background:var(--accent);opacity:.55}.audio-visual.is-playing i{animation:wave .65s ease-in-out infinite alternate}.audio-visual.is-playing i:nth-child(3n){animation-delay:.2s}.audio-visual.is-playing i:nth-child(2n){animation-delay:.35s}
    @keyframes wave{to{height:90%;opacity:1}}.chart{height:72px;margin-top:16px;background:linear-gradient(180deg,color-mix(in srgb,var(--accent) 22%,transparent),transparent);clip-path:polygon(0 78%,10% 62%,20% 71%,30% 34%,40% 49%,50% 19%,60% 48%,70% 27%,80% 56%,90% 31%,100% 42%,100% 100%,0 100%);border-bottom:1px solid var(--line)}
    .event-list{display:grid;gap:9px;margin:14px 0;color:#b9c1cb;font-size:11px}.signal-dot{width:8px;height:8px;border-radius:50%;background:var(--accent);box-shadow:0 0 14px var(--accent)}
    .steps{display:flex;gap:8px;margin-top:16px}.steps span{flex:1;text-align:center;border:1px solid #ffffff17;border-radius:8px;padding:8px 4px;color:#8f9aa7;font-size:10px}.steps.is-active span{border-color:var(--line);color:#f4f4f5}.signal-chart{height:78px;display:flex;align-items:center;gap:3px;overflow:hidden}.signal-chart i{flex:1;height:62%;transform:scaleY(var(--scale));background:var(--accent);opacity:.34;border-radius:4px;transform-origin:center}.signal-chart.is-live i{animation:signal .8s ease-in-out infinite alternate;animation-delay:calc(var(--i)*-24ms)}@keyframes signal{to{transform:scaleY(1.7);opacity:.9}}
    footer{display:flex;justify-content:space-between;flex-wrap:wrap;gap:12px;padding:24px 0 28px;border-top:1px solid #ffffff18;color:#8d98a4;font-size:10px}.notice{max-width:760px;line-height:1.6}
    @media(max-width:850px){.shell{padding:0 18px}.topbar{grid-template-columns:1fr auto}.site-nav{grid-column:1/-1;grid-row:2;justify-content:flex-start;overflow-x:auto}.hero{grid-template-columns:1fr;gap:28px;padding:54px 0}.intro{max-width:720px}.section-heading{display:block}.section-heading p{margin-top:12px}.project-media{height:220px}}
    @media(max-width:560px){.shell{padding:0 15px}.topbar{gap:12px}.brand{font-size:11px}.mark{width:30px;height:30px}.back{max-width:130px;text-align:right;font-size:10px}.site-nav{gap:2px}.tab{padding:8px 10px;font-size:10px}.hero{padding:42px 0}.intro h1{font-size:clamp(36px,11vw,54px)}.intro p{font-size:14px}.hero-gallery,.panel{padding:15px;border-radius:17px}.media-grid{grid-template-columns:repeat(auto-fit,minmax(100px,1fr));gap:7px}.project-media,.visual-fallback{height:175px}.section{padding:48px 0}.feature-grid{grid-template-columns:1fr}.feature-card{min-height:125px}.feature-card h3{margin-top:14px}.panel{padding:17px}}
    @media(prefers-reduced-motion:reduce){*,*::before,*::after{animation-duration:.01ms!important;animation-iteration-count:1!important;scroll-behavior:auto!important;transition-duration:.01ms!important}}
  </style>
</head>
<body>
  <a class="skip-link" href="#main">İçeriğe geç</a>
  <div class="shell">
    <header class="topbar">
      <a class="brand" href="/#anasayfa" aria-label="Terneon ana sayfa"><span class="mark">${escapeHtml(project.title.slice(0, 1))}</span><span>${title}</span></a>
      <nav class="site-nav" aria-label="Sayfa bölümleri"><a class="tab" href="#hikaye">Hikâye</a><a class="tab" href="#yaklasim">Yaklaşım</a><a class="tab" href="#deneyim">Deneyim</a></nav>
      <a class="back" href="/#referanslar">← Tüm projeler</a>
    </header>
    <main id="main">
      <section class="hero" id="hikaye">
        <div class="intro">
          <p class="eyebrow">${escapeHtml(project.category)} · ${escapeHtml(project.sector)} · Türkiye</p>
          <h1>${escapeHtml(project.tagline)}</h1>
          <p>${escapeHtml(project.desc)}</p>
          <span class="tag">${escapeHtml(project.badge)}</span>
          <div class="hero-actions"><a class="cta" href="#deneyim">Deneyimi keşfet <span aria-hidden="true">↘</span></a><a class="cta secondary" href="/#fiyat-hesapla">Projenizi konuşalım</a></div>
        </div>
        <div class="hero-gallery" aria-label="${title} proje görselleri">
          <div class="gallery-head"><strong>Proje seçkisi</strong><span>YEREL ÖNİZLEME · TÜRKİYE</span></div>
          <div class="media-grid">${images}</div>
        </div>
      </section>
      <section class="section" id="yaklasim" aria-labelledby="approach-title">
        <div class="section-heading"><h2 id="approach-title">Her ayrıntısı düşünülmüş bir dijital deneyim.</h2><p>${escapeHtml(project.desc)}</p></div>
        <div class="feature-grid">
          <article class="feature-card"><span>01 · Konsept</span><h3>${escapeHtml(project.sector)} için tasarlandı</h3><p>${escapeHtml(project.category)} odağında özgün bir görsel dil.</p></article>
          <article class="feature-card"><span>02 · Deneyim</span><h3>Her ekranda akıcı</h3><p>Masaüstü ve mobil ekranlarda rahatça gezilebilen duyarlı bir düzen.</p></article>
          <article class="feature-card"><span>03 · Etkileşim</span><h3>Keşfederek deneyin</h3><p>Sayfadaki kontroller yerel demo içinde çalışır; dış servise veri göndermez.</p></article>
        </div>
      </section>
      <section class="section" id="deneyim" aria-labelledby="experience-title">
        <div class="section-heading"><h2 id="experience-title">Arayüzü kendiniz deneyin.</h2><p>Bu bölümdeki araçlar etkileşimli birer arayüz örneğidir. Gerçek sipariş, işlem veya dış servis bağlantısı kullanılmaz.</p></div>
        <div class="workspace" aria-label="${title} etkileşimli demo">
          <div class="panel"><div class="panel-head"><strong>${escapeHtml(project.badge)}</strong><span>YEREL ETKİLEŞİM</span></div><p class="interaction-note">${escapeHtml(project.tagline)}</p>${interactionMarkup(project)}</div>
        </div>
      </section>
    </main>
    <footer><span class="notice">Bu sayfa Türkiye için hazırlanmış bağımsız bir portfolyo demosudur. Gerçek hizmet, entegrasyon veya işlem sunmaz; gösterilen değerler ve durumlar örnektir.</span><a class="license" href="/showcases/${project.slug}/LICENSE.md" target="_blank" rel="noreferrer">Kaynak paketin lisans notu</a></footer>
  </div>
  <script>
    (() => {
      const root = document;
      const result = root.querySelector('[data-result]');
      let counter = 0;
      const setResult = (message) => { if (result) result.textContent = message; };
      root.addEventListener('click', (event) => {
        const button = event.target.closest('button[data-action]');
        if (!button) return;
        const value = button.dataset.value;
        switch (button.dataset.action) {
          case 'generate': {
            const prompt = root.querySelector('#prompt').value.trim();
            root.querySelector('[data-output]').textContent = prompt ? 'Örnek görsel taslağı: “' + prompt + '” için renk paleti ve kompozisyon hazır.' : 'Önce kısa bir fikir yazın; bu önizleme harici modele bağlanmaz.';
            setResult(prompt ? 'Yerel taslak güncellendi' : 'Fikir bekleniyor');
            break;
          }
          case 'add-cart':
            counter += 1;
            setResult('Sepet: ' + counter + ' ürün · ödeme alınmaz');
            break;
          case 'gallery-prev':
          case 'gallery-next': {
            const total = ${Math.max(1, project.mediaCount)};
            counter = (counter + (button.dataset.action === 'gallery-next' ? 1 : total - 1)) % total;
            const images = [...root.querySelectorAll('.project-media:not(video)')];
            if (images.length > 1) images.forEach((image, index) => { image.hidden = index !== counter % images.length; });
            setResult('Seçki ' + (counter + 1) + ' / ' + total);
            break;
          }
          case 'audio':
            button.setAttribute('aria-pressed', button.getAttribute('aria-pressed') !== 'true');
            root.querySelector('[data-audio-visual]').classList.toggle('is-playing', button.getAttribute('aria-pressed') === 'true');
            button.textContent = button.getAttribute('aria-pressed') === 'true' ? 'Önizlemeyi durdur' : 'Önizlemeyi başlat';
            setResult(button.getAttribute('aria-pressed') === 'true' ? 'Görsel ses önizlemesi açık · ses işleme yok' : 'Önizleme durduruldu');
            break;
          case 'lens': {
            root.querySelectorAll('[data-action="lens"]').forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
            const descriptions = { '35 mm': 'geniş ve doğal', '50 mm': 'dengeli ve çok amaçlı', '85 mm': 'sıkışık ve portre odaklı' };
            setResult(value + ' · ' + descriptions[value] + ' bir kadraj');
            break;
          }
          case 'drink':
            root.querySelectorAll('[data-action="drink"]').forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
            root.querySelector('[data-drink]').textContent = value;
            break;
          case 'add-drink':
            counter += 1;
            setResult('Sipariş: ' + counter + ' ürün · ödeme alınmaz');
            break;
          case 'project':
            root.querySelectorAll('[data-action="project"]').forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
            setResult(value + ' · proje seçildi; içerik örnek amaçlıdır');
            break;
          case 'route':
            root.querySelectorAll('[data-action="route"]').forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
            setResult(value + ' rotası · örnek güzergâh, gerçek seyir verisi değil');
            break;
          case 'refresh':
            root.querySelector('[data-metric]').textContent = (3.8 + (counter++ % 5) * 0.2).toFixed(1) + ' MW';
            setResult('Örnek değer güncellendi · canlı şebeke verisi yok');
            break;
          case 'simulate':
            root.querySelector('[data-chart]').style.filter = 'hue-rotate(' + ((counter++ * 35) % 180) + 'deg)';
            setResult('Örnek görselleştirme güncellendi');
            break;
          case 'security':
            counter += 1;
            root.querySelector('[data-event-count]').textContent = (3 + counter) + ' örnek olay';
            setResult('Kurgusal olay akışı oynatıldı · güvenlik işlemi yapılmadı');
            break;
          case 'deploy': {
            const branch = root.querySelector('#branch').value.trim() || 'main';
            root.querySelector('[data-steps]').classList.add('is-active');
            setResult('“' + branch + '” için görsel dağıtım akışı tamamlandı · servise bağlı değil');
            break;
          }
          case 'signal':
            root.querySelector('[data-signal]').classList.toggle('is-live');
            setResult('Sentetik sinyal gösteriliyor · tanı veya ölçüm yapılmıyor');
            break;
        }
      });
      root.addEventListener('input', (event) => {
        if (event.target.id === 'distance') {
          const value = Number(event.target.value);
          root.querySelector('[data-distance-label]').textContent = value < 4 ? 'hafif' : value < 8 ? 'orta' : 'uzun';
          setResult('Örnek yolculuk: yaklaşık ' + (value * 5) + ' km');
        }
        if (event.target.id === 'iterations') root.querySelector('[data-step]').textContent = event.target.value;
      });
    })();
  </script>
</body>
</html>`;
}

function generateMasterIndex() {
  const projects = [...INDUSTRY_DEMOS_META, ...SHOWCASES_META];
  const cards = projects.map((project, index) => `
    <a class="card" style="--accent:${project.accent}" href="/showcases/${project.slug}/index.html">
      <span class="number">${String(index + 1).padStart(2, '0')} · ${escapeHtml(project.sector)}</span>
      <h2>${escapeHtml(project.title)}</h2>
      <p>${escapeHtml(project.desc)}</p>
      <span class="open">Demo sayfasını aç →</span>
    </a>`).join('');
  return `<!doctype html>
<html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Terneon — Proje demoları</title>
<style>*{box-sizing:border-box}body{margin:0;background:#080b12;color:#f4f4f5;font-family:Inter,ui-sans-serif,system-ui,sans-serif}.shell{max-width:1120px;margin:auto;padding:36px 24px}.top{border-bottom:1px solid #ffffff20;padding-bottom:24px}.top a{color:#94a3b8;text-decoration:none;font-size:12px}.top p{color:#aab3be;max-width:620px;line-height:1.6}.top h1{margin:24px 0 8px;font-size:clamp(34px,6vw,56px);letter-spacing:-.04em}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:14px;margin-top:26px}.card{--accent:#22d3ee;display:flex;flex-direction:column;min-height:218px;padding:19px;border:1px solid color-mix(in srgb,var(--accent) 27%,#26303b);border-radius:16px;background:linear-gradient(145deg,color-mix(in srgb,var(--accent) 8%,#10141c),#ffffff04);color:inherit;text-decoration:none;transition:transform .16s,border-color .16s}.card:hover{border-color:var(--accent);transform:translateY(-2px)}.number{color:var(--accent);font:10px ui-monospace,monospace;text-transform:uppercase;letter-spacing:.12em}.card h2{font-size:18px;margin:16px 0 8px}.card p{color:#aab3be;font-size:12px;line-height:1.55;margin:0 0 18px}.open{margin-top:auto;color:var(--accent);font-size:12px;font-weight:650}footer{margin-top:30px;color:#8792a0;font-size:11px}@media(max-width:600px){.shell{padding:24px 16px}}</style></head>
<body><main class="shell"><header class="top"><a href="/#referanslar">← Terneon portfolyosuna dön</a><h1>Türkiye'den proje demoları</h1><p>${projects.length} farklı sektör için özgün ve etkileşimli arayüz örneklerini keşfedin. Örnek veriler ve işlemler gerçek bir hizmete bağlanmaz.</p></header><section class="grid" aria-label="Proje demoları">${cards}</section><footer>Terneon portfolyo vitrini · Etkileşimli konseptler</footer></main></body></html>`;
}

function main() {
  fs.mkdirSync(SHOWCASES_DIR, { recursive: true });
  const slugs = new Set();
  for (const project of INDUSTRY_DEMOS_META) {
    if (!/^[a-z0-9-]+$/.test(project.slug) || slugs.has(project.slug)) {
      throw new Error(`Invalid or duplicate showcase slug: ${project.slug}`);
    }
    slugs.add(project.slug);
    const pagePath = path.join(SHOWCASES_DIR, project.slug, 'index.html');
    if (!fs.existsSync(pagePath)) throw new Error(`Missing industry demo page: ${pagePath}`);
  }
  for (const project of SHOWCASES_META) {
    if (!/^[a-z0-9-]+$/.test(project.slug) || slugs.has(project.slug)) {
      throw new Error(`Invalid or duplicate showcase slug: ${project.slug}`);
    }
    slugs.add(project.slug);

    const templateDir = path.join(TEMPLATES_DIR, `ternyon-${project.slug}`);
    if (!fs.existsSync(templateDir)) throw new Error(`Missing extracted project: ${templateDir}`);
    const projectRoot = findProjectRoot(templateDir);
    const license = walkFiles(projectRoot).find((file) => /^license(?:\.md)?$/i.test(path.basename(file)));
    if (!license) throw new Error(`Missing original project license: ${templateDir}`);

    const outputDir = path.join(SHOWCASES_DIR, project.slug);
    clearGeneratedOutput(outputDir);
    fs.copyFileSync(license, path.join(outputDir, 'LICENSE.md'));

    const assets = findMedia(projectRoot);
    const mediaDir = path.join(outputDir, 'media');
    project.mediaCount = assets.length;
    project.mediaMarkup = '';
    if (assets.length) {
      fs.mkdirSync(mediaDir, { recursive: true });
      project.mediaMarkup = mediaMarkup(project, assets);
      assets.forEach((asset, index) => {
        const extension = path.extname(asset).toLowerCase();
        fs.copyFileSync(asset, path.join(mediaDir, `asset-${String(index + 1).padStart(2, '0')}${extension}`));
      });
    } else {
      project.mediaMarkup = mediaMarkup(project, []);
    }

    fs.writeFileSync(path.join(outputDir, 'index.html'), generatePage(project), 'utf8');
    console.log(`Generated ${project.slug}`);
  }
  fs.writeFileSync(path.join(SHOWCASES_DIR, 'index.html'), generateMasterIndex(), 'utf8');
  console.log(`Generated ${SHOWCASES_META.length} original showcase demos.`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main();
}
