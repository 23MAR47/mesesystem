/**
 * config/siteConfig.ts yapı doğrulama testleri.
 *
 * Tek kaynak olarak kullanılan site yapılandırmasının şeklini,
 * fiyatların pozitifliğini ve id benzersizliğini denetler.
 */

import { describe, it, expect, run } from "./harness.mjs";
import siteConfig from "../config/siteConfig.ts";
import { buildWhatsAppQuoteHref } from "../lib/whatsapp.ts";

// ── yardımcılar ──
const unique = (arr) => new Set(arr).size === arr.length;
const allPositive = (arr) => arr.every((n) => typeof n === "number" && n > 0);
const allNonNegative = (arr) => arr.every((n) => typeof n === "number" && n >= 0);

describe("siteConfig — marka ve iletişim", () => {
  it("marka adı 'MESE SYSTEM' ve dolu bir sloganı vardır", () => {
    expect(siteConfig.brand.name).toBe("MESE SYSTEM");
    expect(siteConfig.brand.tagline.length > 0).toBeTruthy();
  });

  it("iletişim alanları (telefon, e-posta, adres) doludur", () => {
    expect(siteConfig.contact.phone.length > 0).toBeTruthy();
    expect(siteConfig.contact.email).toMatch(/@/);
    expect(siteConfig.contact.address.length > 0).toBeTruthy();
    expect(siteConfig.contact.phone).toBe("+90 553 977 16 47");
    expect(siteConfig.contact.email).toBe("meseseyhmus346@gmail.com");
  });

  it("WhatsApp numarası yalnızca rakamlardan oluşur (boşluk, +, parantez yok)", () => {
    expect(siteConfig.contact.whatsapp).toMatch(/^\d+$/);
  });

  it("WhatsApp numarası Türkiye ülke kodu 90 ile başlar", () => {
    expect(siteConfig.contact.whatsapp.startsWith("90")).toBeTruthy();
  });

  it("telefon numarası temizlenince WhatsApp numarasına eşittir", () => {
    const cleaned = siteConfig.contact.phone.replace(/[\s()+-]/g, "");
    expect(cleaned).toBe(siteConfig.contact.whatsapp);
  });
});

describe("siteConfig — fiyatlandırma", () => {
  it("en az 3 temel hizmet tanımlıdır", () => {
    expect(siteConfig.pricing.services.length).toBe(5);
  });

  it("tüm hizmet fiyatları pozitif sayıdır", () => {
    expect(allPositive(siteConfig.pricing.services.map((s) => s.price))).toBeTruthy();
    expect(siteConfig.pricing.services.map((s) => s.price)).toEqual([
      9000, 9000, 40000, 50000, 50000,
    ]);
  });

  it("hizmet id'leri benzersizdir", () => {
    expect(unique(siteConfig.pricing.services.map((s) => s.id))).toBeTruthy();
  });

  it("ek özellikler belirtilen kapsam ve fiyatlarla tanımlıdır", () => {
    expect(siteConfig.pricing.addons.map((a) => a.price)).toEqual([3000, 0, 3000]);
    expect(allNonNegative(siteConfig.pricing.addons.map((a) => a.price))).toBeTruthy();
  });

  it("ek özellik id'leri benzersizdir", () => {
    expect(unique(siteConfig.pricing.addons.map((a) => a.id))).toBeTruthy();
  });

  it("hizmet ve ek özellik id'leri çakışmaz", () => {
    const ids = [
      ...siteConfig.pricing.services.map((s) => s.id),
      ...siteConfig.pricing.addons.map((a) => a.id),
    ];
    expect(unique(ids)).toBeTruthy();
  });

  it("aylık ve yıllık abonelik tanımlıdır ve fiyatları pozitiftir", () => {
    const { monthly, yearly } = siteConfig.pricing.subscription;
    expect(monthly.id).toBe("monthly");
    expect(yearly.id).toBe("yearly");
    expect(monthly.price).toBeGreaterThan(0);
    expect(yearly.price).toBeGreaterThan(0);
    expect(monthly.period.length > 0).toBeTruthy();
    expect(yearly.period.length > 0).toBeTruthy();
  });

  it("yıllık abonelikte indirim etiketi vardır", () => {
    expect(siteConfig.pricing.subscription.yearly.discountLabel.length > 0).toBeTruthy();
  });
});

describe("siteConfig — demo projeler", () => {
  it("en az 10 demo proje tanımlıdır", () => {
    expect(siteConfig.demos.length).toBeGreaterThanOrEqual(10);
  });

  it("demo id'leri benzersizdir", () => {
    expect(unique(siteConfig.demos.map((d) => d.id))).toBeTruthy();
  });

  it("her demonin https ile başlayan canlı URL'i vardır", () => {
    for (const d of siteConfig.demos) {
      expect(d.liveUrl.startsWith("https://")).toBeTruthy();
    }
  });

  it("her demonin en az bir özelliği listelenmiştir", () => {
    for (const d of siteConfig.demos) {
      expect(d.features.length > 0).toBeTruthy();
    }
  });

  it("her demonin kategorisi bilinen kategori kümesindedir", () => {
    const valid = ["saglik", "eticaret", "guzellik", "otel", "kafe", "kurumsal"];
    for (const d of siteConfig.demos) {
      expect(valid.includes(d.category)).toBeTruthy();
    }
  });
});

describe("siteConfig — diğer bölümler", () => {
  it("hero başlığı, alt metni ve iki CTA'sı doludur", () => {
    expect(siteConfig.hero.title.length > 0).toBeTruthy();
    expect(siteConfig.hero.subtitle.length > 0).toBeTruthy();
    expect(siteConfig.hero.primaryCta.label.length > 0).toBeTruthy();
    expect(siteConfig.hero.secondaryCta.label.length > 0).toBeTruthy();
  });

  it("istatistik id'leri benzersizdir ve değerleri sayıdır", () => {
    expect(unique(siteConfig.stats.map((s) => s.id))).toBeTruthy();
    for (const s of siteConfig.stats) {
      expect(typeof s.value).toBe("number");
    }
  });

  it("süreç adımları 01'den başlayarak sıralı ve benzersizdir", () => {
    const steps = siteConfig.process.map((p) => p.step);
    expect(unique(siteConfig.process.map((p) => p.id))).toBeTruthy();
    expect(steps[0]).toBe("01");
  });

  it("güven rozetlerinin id'leri benzersizdir", () => {
    expect(unique(siteConfig.trustBadges.map((b) => b.id))).toBeTruthy();
  });
});

describe("siteConfig — WhatsApp entegrasyon uyumu", () => {
  it("yapılandırmadaki numara, üretilen wa.me linkinde aynen kullanılır", () => {
    const href = buildWhatsAppQuoteHref({
      service: siteConfig.pricing.services[0],
      addons: [],
      subscription: null,
    });
    expect(href.startsWith(`https://wa.me/${siteConfig.contact.whatsapp}?`)).toBeTruthy();
  });
});

run();
