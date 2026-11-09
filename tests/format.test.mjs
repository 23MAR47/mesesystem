/**
 * lib/format.ts birim testleri.
 *
 * tr-TR yerel ayarlarıyla para ve sayı biçimlendirmesini doğrular.
 *
 * NOT: Bu Node/ICU sürümünde tr-TR para formatı "₺" yerine "TL" öneki
 * üretir; formatCurrencyTL bu yüzden "TL12.000" gibi önekli çıktı verir.
 * Testler gerçekleşen davranışı sabitler.
 */

import { describe, it, expect, run } from "./harness.mjs";
import { formatCurrencyTL, formatNumber } from "../lib/format.ts";

describe("formatCurrencyTL", () => {
  it("12000 → 'TL12.000'", () => {
    expect(formatCurrencyTL(12000)).toBe("TL12.000");
  });

  it("2500 → 'TL2.500'", () => {
    expect(formatCurrencyTL(2500)).toBe("TL2.500");
  });

  it("0 → 'TL0'", () => {
    expect(formatCurrencyTL(0)).toBe("TL0");
  });

  it("30000 → 'TL30.000'", () => {
    expect(formatCurrencyTL(30000)).toBe("TL30.000");
  });

  it("çıktıda ₺ sembolü bulunmaz (yerine TL geçer)", () => {
    expect(formatCurrencyTL(12000)).not.toContain("₺");
    expect(formatCurrencyTL(12000)).toContain("TL");
  });

  it("binlik ayırıcı olarak nokta kullanılır", () => {
    expect(formatCurrencyTL(1234567)).toBe("TL1.234.567");
  });

  it("çıktıda sayı, TL işaretinden sonra gelir", () => {
    expect(formatCurrencyTL(7)).toMatch(/^TL\d+$/);
  });

  it("her çağrı tutarlı (belirleyici) sonuç üretir", () => {
    expect(formatCurrencyTL(12000)).toBe(formatCurrencyTL(12000));
  });
});

describe("formatNumber", () => {
  it("12000 → '12.000'", () => {
    expect(formatNumber(12000)).toBe("12.000");
  });

  it("0 → '0'", () => {
    expect(formatNumber(0)).toBe("0");
  });

  it("1234567 → '1.234.567'", () => {
    expect(formatNumber(1234567)).toBe("1.234.567");
  });

  it("999 → '999' (ayırıcı olmadan)", () => {
    expect(formatNumber(999)).toBe("999");
  });

  it("çıktı string türündedir", () => {
    expect(typeof formatNumber(42)).toBe("string");
  });
});

run();
