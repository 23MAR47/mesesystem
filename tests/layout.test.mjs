/**
 * terneon/tests/layout.test.mjs
 *
 * Terneon sayfa ve düzen (layout) semantik bütünlük testleri.
 * Duplicate Header / Footer ve iç içe <main> etiketlerinin olmadığını doğrular.
 */

import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it, expect, run } from "./harness.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const PAGE_PATH = resolve(HERE, "../app/page.tsx");
const LAYOUT_PATH = resolve(HERE, "../app/layout.tsx");

const pageSource = readFileSync(PAGE_PATH, "utf8");
const layoutSource = readFileSync(LAYOUT_PATH, "utf8");

describe("Layout Bütünlüğü — app/layout.tsx", () => {
  it("layout.tsx <Header /> bileşenini içerir", () => {
    expect(layoutSource).toContain("<Header />");
  });

  it("layout.tsx <Footer /> bileşenini içerir", () => {
    expect(layoutSource).toContain("<Footer />");
  });

  it("layout.tsx ana içerik kapsayıcısı olarak <main>{children}</main> tanımlar", () => {
    expect(layoutSource).toMatch(/<main>\s*\{children\}\s*<\/main>/);
  });
});

describe("Layout Bütünlüğü — app/page.tsx (Çift Render Koruması)", () => {
  it("page.tsx <Header /> import etmez", () => {
    expect(pageSource).not.toContain("import Header");
  });

  it("page.tsx <Footer /> import etmez", () => {
    expect(pageSource).not.toContain("import Footer");
  });

  it("page.tsx JSX içinde <Header /> render etmez", () => {
    expect(pageSource).not.toContain("<Header");
  });

  it("page.tsx JSX içinde <Footer /> render etmez", () => {
    expect(pageSource).not.toContain("<Footer");
  });

  it("page.tsx mükerrer <main> etiketi içermez (HTML5 semantik standardı)", () => {
    expect(pageSource).not.toContain("<main");
    expect(pageSource).not.toContain("</main>");
  });

  it("page.tsx ana sayfanın tüm çekirdek bölümlerini render eder", () => {
    expect(pageSource).toContain("<Hero />");
    expect(pageSource).toContain("<TrustAndStats />");
    expect(pageSource).toContain("<PortfolioSection />");
    expect(pageSource).toContain("<DemoShowcase />");
    expect(pageSource).toContain("<ServicesSection />");
    expect(pageSource).toContain("<ProcessSection />");
    expect(pageSource).toContain("<PriceCalculator />");
    expect(pageSource).toContain("<TestimonialsAndFaq />");
    expect(pageSource.indexOf("<Hero />")).toBeLessThan(pageSource.indexOf("<PortfolioSection />"));
    expect(pageSource.indexOf("<ServicesSection />")).toBeLessThan(pageSource.indexOf("<PriceCalculator />"));
  });
});

run();
