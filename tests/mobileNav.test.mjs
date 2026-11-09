/**
 * tests/mobileNav.test.mjs
 *
 * Mobil Gezinti Çekmecesi (Mobile Drawer) ve Header Buton Testleri.
 * Header.tsx bileşenindeki 7 menü linki, 4 mobil aksiyon butonu,
 * z-index hiyerarşisi, pürüzsüz kaydırma ve erişilebilirlik özelliklerini doğrular.
 */

import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it, expect, run } from "./harness.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const HEADER_PATH = resolve(HERE, "../components/Header.tsx");
const headerSource = readFileSync(HEADER_PATH, "utf8");

describe("Mobil Gezinti — 7 Çekirdek Menü Bağlantısı", () => {
  const expectedItems = [
    { label: "Çalışmalar", href: "/#referanslar" },
    { label: "Demolar", href: "/#demolar" },
    { label: "Hizmetler", href: "/#hizmetler" },
    { label: "Süreç", href: "/#surec" },
    { label: "Fiyat hesapla", href: "/#fiyat-hesapla" },
    { label: "Sorular", href: "/#sss" },
    { label: "İletişim", href: "/#iletisim" },
  ];

  for (const item of expectedItems) {
    it(`navItems içinde '${item.label}' -> '${item.href}' tanımlıdır`, () => {
      expect(headerSource).toContain(item.label);
      expect(headerSource).toContain(item.href);
    });
  }

  it("navItems tam olarak 7 adet navigasyon öğesi tanımlar", () => {
    const navItemsMatch = headerSource.match(/const navItems\s*=\s*\[([\s\S]*?)\]/);
    expect(navItemsMatch).toBeTruthy();
    const count = (navItemsMatch[1].match(/label:/g) || []).length;
    expect(count).toBe(7);
  });
});

describe("Mobil Gezinti — 4 Mobil Eylem Butonu", () => {
  it("'Teklif al' butonu mevcuttur ve /#fiyat-hesapla hedefine yönlendirir", () => {
    expect(headerSource).toContain("Teklif al");
    expect(headerSource).toContain('href="/#fiyat-hesapla"');
  });

  it("'WhatsApp ile yaz' butonu buildWhatsAppContactHref ile güvenli bağlanmıştır", () => {
    expect(headerSource).toContain("WhatsApp ile yaz");
    expect(headerSource).toContain("buildWhatsAppContactHref()");
    expect(headerSource).toContain('target="_blank"');
    expect(headerSource).toContain('rel="noopener noreferrer"');
  });

  it("'Ara' butonu telefon araması (tel:) protokolü ile tanımlıdır", () => {
    expect(headerSource).toContain("Ara");
    expect(headerSource).toMatch(/href=\{`tel:\$\{siteConfig\.contact\.phone/);
  });

  it("'E-posta' butonu e-posta gönderimi (mailto:) protokolü ile tanımlıdır", () => {
    expect(headerSource).toContain("E-posta");
    expect(headerSource).toMatch(/href=\{`mailto:\$\{siteConfig\.contact\.email\}`\}/);
  });
});

describe("Mobil Gezinti — Z-Index Hiyerarşisi ve Çakışma Önleme", () => {
  it("Header menü açıkken z-[60] sınıfına yükselir (FloatingWhatsApp z-50 üzerinde kalır)", () => {
    expect(headerSource).toContain("menuOpen ? 'z-[60]' : 'z-50'");
  });

  it("Mobil çekmece (motion.nav) z-[60] katmanında konumlanır", () => {
    expect(headerSource).toMatch(/motion\.nav[\s\S]*?z-\[60\]/);
  });
});

describe("Mobil Gezinti — Pürüzsüz Kaydırma (Smooth Scroll) İşleyicisi", () => {
  it("handleNavClick fonksiyonu tanımlıdır ve hash linkleri yakalar", () => {
    expect(headerSource).toContain("handleNavClick");
    expect(headerSource).toContain("e.preventDefault()");
  });

  it("scrollIntoView({ behavior: 'smooth' }) çağrısı mevcuttur", () => {
    expect(headerSource).toContain("scrollIntoView({ behavior: 'smooth' })");
  });

  it("requestAnimationFrame ile DOM render zamanlaması optimize edilmiştir", () => {
    expect(headerSource).toContain("requestAnimationFrame(");
  });

  it("Gezinti tıklandığında menü kapatılır (setMenuOpen(false))", () => {
    expect(headerSource).toContain("setMenuOpen(false)");
  });
});

describe("Mobil Gezinti — Erişilebilirlik ve Klavye/Görünüm Kontrolleri", () => {
  it("Mobil menü düğmesi aria-expanded özelliğini dinamik yansıtır", () => {
    expect(headerSource).toContain("aria-expanded={menuOpen}");
  });

  it("Mobil çekmece aria-label='Mobil menü' etiketine sahiptir", () => {
    expect(headerSource).toContain('aria-label="Mobil menü"');
  });

  it("Mobil çekmece role='dialog' ve aria-modal='true' semantiklerine sahiptir", () => {
    expect(headerSource).toContain('role="dialog"');
    expect(headerSource).toContain('aria-modal="true"');
  });

  it("Escape tuşuna basıldığında çekmeceyi kapatan klavye dinleyicisi mevcuttur", () => {
    expect(headerSource).toContain("e.key === 'Escape'");
  });

  it("Masaüstü genişliğine (>= 1024) geçildiğinde menüyü kapatan resize dinleyicisi mevcuttur", () => {
    expect(headerSource).toContain("window.innerWidth >= 1024");
  });
});

run();
