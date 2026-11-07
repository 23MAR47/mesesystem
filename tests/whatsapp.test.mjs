/**
 * terneon/lib/whatsapp.ts birim testleri.
 *
 * `buildWhatsAppQuoteHref` saf bir fonksiyondur (window'a dokunmaz);
 * `openWhatsApp*` fonksiyonları window.open kullandığı için test edilmez.
 */

import { describe, it, expect, run } from "./harness.mjs";
import {
  buildWhatsAppContactHref,
  buildWhatsAppQuoteHref,
} from "../lib/whatsapp.ts";
import siteConfig from "../config/siteConfig.ts";

// Test verileri — siteConfig'teki gerçek öğeler
const service = siteConfig.pricing.services[0]; // Portfolyo, 9000
const addons = [siteConfig.pricing.addons[0], siteConfig.pricing.addons[3]]; // panel 3000, SEO 3000
const monthly = siteConfig.pricing.subscription.monthly;
const yearly = siteConfig.pricing.subscription.yearly;

const fullCart = { service, addons, subscription: yearly };
const emptyCart = { service: null, addons: [], subscription: null };

describe("buildWhatsAppContactHref — doğrudan iletişim", () => {
  it("yapılandırılmış numarayla hazır mesaj bağlantısı üretir", () => {
    const href = buildWhatsAppContactHref();
    expect(href.startsWith(`https://wa.me/${siteConfig.contact.whatsapp}?text=`)).toBeTruthy();
    expect(decodeURIComponent(href.split("?text=")[1])).toContain(
      "Merhaba MESE SYSTEM, projem hakkında bilgi almak istiyorum."
    );
  });

  it("özel teklif mesajını bağlantıda kodlar", () => {
    const href = buildWhatsAppContactHref("Kişisel site için teklif istiyorum: ₺9.000");
    expect(decodeURIComponent(href.split("?text=")[1])).toBe(
      "Kişisel site için teklif istiyorum: ₺9.000"
    );
  });
});

describe("buildWhatsAppQuoteHref — link formatı", () => {
  it("https://wa.me/ ile başlar", () => {
    expect(buildWhatsAppQuoteHref(fullCart).startsWith("https://wa.me/")).toBeTruthy();
  });

  it("numara ile mesajı ?text= parametresiyle ayırır", () => {
    expect(buildWhatsAppQuoteHref(fullCart)).toMatch(/^https:\/\/wa\.me\/\d+\?text=/);
  });

  it("WhatsApp numarası siteConfig'teki numarayı içerir", () => {
    expect(buildWhatsAppQuoteHref(fullCart)).toContain(`https://wa.me/${siteConfig.contact.whatsapp}?text=`);
  });
});

describe("buildWhatsAppQuoteHref — kodlama", () => {
  it("mesaj URL-encoded'dır: Türkçe 'Ö' karakteri %C3%96 olarak geçer", () => {
    const href = buildWhatsAppQuoteHref(fullCart);
    expect(href).toContain("%C3%96"); // "Ek Özellikler"
  });

  it("boşluklar %20 olarak kodlanır", () => {
    expect(buildWhatsAppQuoteHref(fullCart)).toContain("%20");
  });

  it("çözülen mesaj orijinal metni içerir (round-trip)", () => {
    const href = buildWhatsAppQuoteHref(fullCart);
    const decoded = decodeURIComponent(href.split("?text=")[1]);
    expect(decoded).toContain("Merhaba MESE SYSTEM!");
    expect(decoded).toContain("Ek Özellikler");
  });
});

describe("buildWhatsAppQuoteHref — sepet içeriği", () => {
  it("seçilen temel hizmetin adı ve fiyatı mesajda yer alır", () => {
    const decoded = decodeURIComponent(buildWhatsAppQuoteHref(fullCart).split("?text=")[1]);
    expect(decoded).toContain(`📦 Temel Hizmet: ${service.name} — TL9.000`);
  });

  it("her ek özellik adı ve fiyatı listelenir", () => {
    const decoded = decodeURIComponent(buildWhatsAppQuoteHref(fullCart).split("?text=")[1]);
    expect(decoded).toContain("➕ Ek Özellikler:");
    expect(decoded).toContain(`   • ${addons[0].name} (+TL3.000)`);
    expect(decoded).toContain(`   • ${addons[1].name} (+TL3.000)`);
  });

  it("yıllık abonelik 'Yıllık abonelik' etiketiyle geçer", () => {
    const decoded = decodeURIComponent(
      buildWhatsAppQuoteHref({ service, addons: [], subscription: yearly }).split("?text=")[1]
    );
    expect(decoded).toContain("🔄 Bakım & Sunucu: Yıllık abonelik — TL20.000/yıl");
  });

  it("aylık abonelik 'Aylık abonelik' etiketiyle geçer", () => {
    const decoded = decodeURIComponent(
      buildWhatsAppQuoteHref({ service, addons: [], subscription: monthly }).split("?text=")[1]
    );
    expect(decoded).toContain("🔄 Bakım & Sunucu: Aylık abonelik — TL2.000/ay");
  });

  it("tek seferlik toplam hizmet + ek özellikler toplamıdır (9000+3000+3000=15000)", () => {
    const decoded = decodeURIComponent(buildWhatsAppQuoteHref(fullCart).split("?text=")[1]);
    expect(decoded).toContain("💰 Tek Seferlik Toplam: TL15.000");
  });
});

describe("buildWhatsAppQuoteHref — boş sepet", () => {
  it("temel hizmet ve ek özellik satırları yer almaz", () => {
    const decoded = decodeURIComponent(buildWhatsAppQuoteHref(emptyCart).split("?text=")[1]);
    expect(decoded).not.toContain("Temel Hizmet");
    expect(decoded).not.toContain("Ek Özellikler");
    expect(decoded).not.toContain("Bakım & Sunucu");
  });

  it("toplam TL0 olarak gösterilir", () => {
    const decoded = decodeURIComponent(buildWhatsAppQuoteHref(emptyCart).split("?text=")[1]);
    expect(decoded).toContain("💰 Tek Seferlik Toplam: TL0");
  });

  it("karşılama metni yine de gönderilir", () => {
    const decoded = decodeURIComponent(buildWhatsAppQuoteHref(emptyCart).split("?text=")[1]);
    expect(decoded).toContain("Merhaba MESE SYSTEM! Web sitesi paketi için teklif almak istiyorum.");
  });
});

run();
