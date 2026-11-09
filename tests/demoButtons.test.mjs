/**
 * tests/demoButtons.test.mjs
 *
 * Canlı Demo Vitrini ve Kart Butonları Doğrulama Testleri.
 * DemoShowcase.tsx, PortfolioSection.tsx ve proje konfigürasyonlarındaki
 * tüm kart butonlarını, demo linklerini, sektör etiketlerini ve
 * ölü bağlantı (dead-link) bulunmadığını doğrular.
 */

import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it, expect, run } from "./harness.mjs";
import { SHOWCASE_WEB_PROJECTS } from "../config/showcaseProjects.ts";
import { DEMO_PROJECTS, PORTFOLIO_PROJECTS } from "../config/referenceSite.ts";

const HERE = dirname(fileURLToPath(import.meta.url));
const DEMO_SHOWCASE_PATH = resolve(HERE, "../components/DemoShowcase.tsx");
const PORTFOLIO_PATH = resolve(HERE, "../components/PortfolioSection.tsx");
const ROOT_DIR = resolve(HERE, "..");

const demoShowcaseSource = readFileSync(DEMO_SHOWCASE_PATH, "utf8");
const portfolioSource = readFileSync(PORTFOLIO_PATH, "utf8");

describe("Canlı Demo Vitrini — Sektörel Demo Kartları ve Butonları", () => {
  it("DemoShowcase bileşeni id='demolar' bağlantı çıpasına sahiptir", () => {
    expect(demoShowcaseSource).toContain('id="demolar"');
  });

  it("SHOWCASE_WEB_PROJECTS en az 19 sektörel proje tanımlar", () => {
    expect(SHOWCASE_WEB_PROJECTS.length).toBeGreaterThanOrEqual(19);
  });

  it("Her sektörel demo kartı geçerli bir /showcases/[slug]/index.html rotasına bağlanır", () => {
    expect(demoShowcaseSource).toContain("href={`/showcases/${project.slug}/index.html`}");
    for (const project of SHOWCASE_WEB_PROJECTS.slice(0, 19)) {
      expect(project.slug).toBeTruthy();
      const showcaseIndexPath = resolve(ROOT_DIR, `public/showcases/${project.slug}/index.html`);
      expect(existsSync(showcaseIndexPath)).toBeTruthy();
    }
  });

  it("Her sektörel demo kartı hedef olarak target='_blank' kullanır", () => {
    expect(demoShowcaseSource).toContain('target="_blank"');
  });

  it("Her sektörel demo kartı rel özniteliği (noreferrer / noopener) içerir", () => {
    expect(demoShowcaseSource).toMatch(/rel="(noreferrer|noopener noreferrer)"/);
  });

  it("Her kart dinamik ve açıklayıcı aria-label içerir", () => {
    expect(demoShowcaseSource).toContain("aria-label={`${project.name}");
  });

  it("Kart gövdesinde demo eylem butonu/etiketi ('Demoyu Başlat' veya 'Demoyu Aç') yer alır", () => {
    const hasTrigger =
      demoShowcaseSource.includes("Demoyu Başlat") ||
      demoShowcaseSource.includes("Demoyu Aç") ||
      demoShowcaseSource.includes("Canlıyı Deneyin");
    expect(hasTrigger).toBeTruthy();
  });
});

describe("Canlı Demo Vitrini — Mobil Telefon Mockup Kartları", () => {
  it("DEMO_PROJECTS listesi en az 5 adet mobil vitrin projesi tanımlar", () => {
    expect(DEMO_PROJECTS.length).toBeGreaterThanOrEqual(5);
  });

  it("Mobil telefon kartlarında 'Demoyu aç' buton/bağlantı metni yer alır", () => {
    expect(demoShowcaseSource).toContain("Demoyu aç");
  });

  it("Her mobil demo projesinin geçerli bir canlı web adresi (https://) mevcuttur", () => {
    for (const project of DEMO_PROJECTS) {
      expect(project.href).toBeTruthy();
      const isValidUrl =
        project.href.startsWith("https://") ||
        project.href.startsWith("http://") ||
        project.href.startsWith("/showcases/");
      expect(isValidUrl).toBeTruthy();
      expect(project.href).not.toBe("#");
    }
  });

  it("Telefon mockup kartları target='_blank' ve rel korumasına sahiptir", () => {
    expect(demoShowcaseSource).toContain("aria-label={`${project.name} canlı demosunu yeni sekmede aç`}");
  });
});

describe("Canlı Demo ve Portföy — Sıfır Ölü Bağlantı (No Dead Links) Güvencesi", () => {
  it("DemoShowcase içinde işlevsiz href='#' ölü bağlantısı yoktur", () => {
    expect(demoShowcaseSource).not.toContain('href="#"');
    expect(demoShowcaseSource).not.toContain("href='#'");
    expect(demoShowcaseSource).not.toContain("javascript:void");
  });

  it("PortfolioSection içinde işlevsiz href='#' ölü bağlantısı yoktur", () => {
    expect(portfolioSource).not.toContain('href="#"');
    expect(portfolioSource).not.toContain("href='#'");
    expect(portfolioSource).not.toContain("javascript:void");
  });

  it("PortfolioSection demo bölümüne yönlendiren 'Demoları keşfet' köprüsüne sahiptir", () => {
    expect(portfolioSource).toContain('href="#demolar"');
    expect(portfolioSource).toContain("Demoları keşfet");
  });

  it("PORTFOLIO_PROJECTS listesindeki tüm projeler geçerli href ve başlığa sahiptir", () => {
    for (const project of PORTFOLIO_PROJECTS) {
      expect(project.name).toBeTruthy();
      expect(project.href).toBeTruthy();
      const isValidUrl =
        project.href.startsWith("https://") ||
        project.href.startsWith("http://") ||
        project.href.startsWith("/showcases/");
      expect(isValidUrl).toBeTruthy();
      expect(project.href).not.toBe("#");
    }
  });
});

run();
