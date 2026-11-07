/**
 * terneon/tests/neonCanvas.test.mjs
 *
 * NeonCanvas, DPR ölçekleme ve canlı WhatsApp teklif özeti testleri.
 */

import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it, expect, run } from "./harness.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const CANVAS_PATH = resolve(HERE, "../components/NeonCanvas.tsx");
const CANVAS_BG_PATH = resolve(HERE, "../components/NeonCanvasBackground.tsx");
const PRICE_CALC_PATH = resolve(HERE, "../components/PriceCalculator.tsx");
const HERO_PATH = resolve(HERE, "../components/Hero.tsx");
const SHOWCASE_PROJECTS_PATH = resolve(HERE, "../config/showcaseProjects.ts");
const SHOWCASE_PREVIEW_PATH = resolve(HERE, "../components/ShowcasePreview.tsx");

const canvasSource = readFileSync(CANVAS_PATH, "utf8");
const priceCalcSource = readFileSync(PRICE_CALC_PATH, "utf8");
const heroSource = readFileSync(HERO_PATH, "utf8");
const showcaseProjectsSource = readFileSync(SHOWCASE_PROJECTS_PATH, "utf8");
const showcasePreviewSource = readFileSync(SHOWCASE_PREVIEW_PATH, "utf8");

describe("NeonCanvas — Yüksek DPR (Retina/4K) Ölçekleme ve Performans", () => {
  it("NeonCanvas.tsx dosyası mevcuttur", () => {
    expect(existsSync(CANVAS_PATH)).toBeTruthy();
  });

  it("NeonCanvas hem adlandırılmış hem varsayılan dışa aktarım sağlar", () => {
    expect(canvasSource).toContain("export function NeonCanvas");
    expect(canvasSource).toContain("export default NeonCanvas");
    expect(canvasSource).toContain("export const NeonCanvasBackground = NeonCanvas");
  });

  it("Geriye dönük uyumluluk için NeonCanvasBackground.tsx NeonCanvas'ı yeniden ihraç eder", () => {
    expect(existsSync(CANVAS_BG_PATH)).toBeTruthy();
    const bgSource = readFileSync(CANVAS_BG_PATH, "utf8");
    expect(bgSource).toContain("export { NeonCanvas, NeonCanvasBackground, default } from './NeonCanvas'");
  });

  it("DPR ölçeklemesinde devicePixelRatio okunur ve 2.5 tavanı ile sınırlandırılır", () => {
    expect(canvasSource).toContain("window.devicePixelRatio");
    expect(canvasSource).toContain("Math.min(");
    expect(canvasSource).toContain("2.5");
  });

  it("Canvas genişlik ve yüksekliği DPR ile çarpılarak keskin piksel tamponu oluşturulur", () => {
    expect(canvasSource).toContain("canvas.width = Math.floor(width * dpr)");
    expect(canvasSource).toContain("canvas.height = Math.floor(height * dpr)");
  });

  it("CSS çizim koordinatları ctx.setTransform(dpr, 0, 0, dpr, 0, 0) ile ölçeklenir", () => {
    expect(canvasSource).toContain("ctx.setTransform(dpr, 0, 0, dpr, 0, 0)");
  });

  it("ResizeObserver ve matchMedia ile çözünürlük değişiklikleri dinlenir", () => {
    expect(canvasSource).toContain("ResizeObserver");
    expect(canvasSource).toContain("matchMedia");
  });

  it("Animasyon döngüsü unmount anında cancelAnimationFrame ile temizlenir", () => {
    expect(canvasSource).toContain("cancelAnimationFrame(animationFrameId)");
  });
});

describe("PriceCalculator — referans fiyat modeli", () => {
  it("toplamı yalnızca proje türü, kapsam ve ek hizmetlerden hesaplar", () => {
    expect(priceCalcSource).toContain("PRICING_SERVICES");
    expect(priceCalcSource).toContain("PRICING_SIZES");
    expect(priceCalcSource).toContain("PRICING_ADDONS");
    expect(priceCalcSource).toContain(
      "const total = service.price + size.price + addons.reduce((sum, addon) => sum + addon.price, 0)"
    );
    expect(priceCalcSource).toContain("Standart teslimat");
  });

  it("tahmin dökümünü erişilebilir durum mesajıyla panoya kopyalar", () => {
    expect(priceCalcSource).toContain("aria-live=\"polite\"");
    expect(priceCalcSource).toContain("navigator.clipboard.writeText(estimate)");
    expect(priceCalcSource).toContain("Tahmini kopyala");
    expect(priceCalcSource).toContain("Nihai fiyat proje kapsamı netleştikten sonra");
    expect(priceCalcSource).toContain("WhatsApp'tan bize ulaşın");
    expect(priceCalcSource).toContain("buildWhatsAppContactHref(quoteMessage)");
  });

  it("hizmet, kapsam ve ek hizmet seçimleri erişilebilir kontrollerdir", () => {
    expect(priceCalcSource).toContain("aria-pressed={selected}");
    expect(priceCalcSource).toContain("3. Ek hizmetler");
    expect(priceCalcSource).toContain("Tahmini proje bedeli");
  });
});

describe("Hero — öne çıkan proje vitrini", () => {
  it("seçili projeyi masaüstü ve telefon önizlemeleriyle birlikte gösterir", () => {
    expect(heroSource).toContain('aria-label="Öne çıkan projeler"');
    expect(heroSource).toContain("<ReferenceProjectImage");
    expect(heroSource).toContain("mobile");
    expect(heroSource).toContain("{current.name}");
    expect(heroSource).toContain("{current.subtitle}");
    expect(heroSource).toContain('aria-label={`${current.name} sitesini aç`}');
    expect(heroSource).toContain('aria-label={`${current.name} mobil sitesini aç`}');
  });

  it("Öne çıkan projeyi önizleme görseliyle gösterir", () => {
    expect(heroSource).toContain("<ReferenceProjectImage");
    expect(heroSource).toContain("FEATURED_PROJECT_IDS");
    expect(heroSource).not.toContain("<motion.iframe");
    expect(showcasePreviewSource).toContain("next/image");
    expect(showcasePreviewSource).toContain("project.previewImage");
  });

  it("Proje seçkisi, erişilebilir önceki/sonraki kontrolleriyle işler", () => {
    expect(heroSource).toContain("featuredProjects.length");
    expect(showcaseProjectsSource.match(/slug: '/g)?.length).toBe(27);
    expect(heroSource).toContain("aria-label=\"Önceki proje\"");
    expect(heroSource).toContain("aria-label=\"Sonraki proje\"");
    expect(heroSource).toContain("showProject(currentIndex + 1)");
  });

  it("Telefon önizlemesi oranını korur ve slider kontrolleri erişilebilirdir", () => {
    expect(heroSource).toContain("aspect-[390/844]");
    expect(heroSource).toContain("w-[clamp(7rem,26vw,11rem)]");
    expect(heroSource).toContain("aria-label=\"Proje seçimi\"");
    expect(heroSource).toContain("Otomatik geçişi başlat");
    expect(heroSource).toContain("useState(false)");
  });
});

run();
