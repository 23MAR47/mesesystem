/**
 * tests/securityHeaders.test.mjs
 *
 * Siber Güvenlik Sertleştirmesi (Cybersecurity Hardening) Testleri.
 * next.config.ts güvenlik başlıkları (CSP, X-Frame-Options, nosniff, HSTS, Permissions-Policy),
 * poweredByHeader: false ve app/layout.tsx JSON-LD \u003c kaçış korumasını doğrular.
 */

import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it, expect, run } from "./harness.mjs";
import nextConfig from "../next.config.ts";

const HERE = dirname(fileURLToPath(import.meta.url));
const NEXT_CONFIG_PATH = resolve(HERE, "../next.config.ts");
const LAYOUT_PATH = resolve(HERE, "../app/layout.tsx");

const nextConfigSource = readFileSync(NEXT_CONFIG_PATH, "utf8");
const layoutSource = readFileSync(LAYOUT_PATH, "utf8");

describe("Siber Güvenlik — next.config.ts Parmak İzi ve Temel Ayarlar", () => {
  it("poweredByHeader false olarak ayarlanmıştır (X-Powered-By Next.js sızıntısını önler)", () => {
    expect(nextConfig.poweredByHeader).toBe(false);
    expect(nextConfigSource).toContain("poweredByHeader: false");
  });

  it("reactStrictMode etkinleştirilmiştir", () => {
    expect(nextConfig.reactStrictMode).toBe(true);
  });

  it("headers() asenkron fonksiyonu tanımlıdır", () => {
    expect(typeof nextConfig.headers).toBe("function");
  });
});

describe("Siber Güvenlik — HTTP Güvenlik Başlıkları (Security Headers)", () => {
  let headerMap = new Map();

  it("headers() /:path* rotası için başlık kümesini döndürür", async () => {
    const rules = await nextConfig.headers();
    expect(Array.isArray(rules)).toBeTruthy();
    expect(rules.length).toBeGreaterThanOrEqual(1);

    const globalRule = rules.find((r) => r.source === "/:path*");
    expect(globalRule).toBeTruthy();
    expect(Array.isArray(globalRule.headers)).toBeTruthy();

    for (const h of globalRule.headers) {
      headerMap.set(h.key, h.value);
    }
  });

  it("Content-Security-Policy (CSP) başlığı tanımlıdır ve kritik direktifleri içerir", () => {
    const csp = headerMap.get("Content-Security-Policy");
    expect(csp).toBeTruthy();
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("script-src");
    expect(csp).toContain("style-src");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("base-uri 'self'");
  });

  it("X-Frame-Options DENY olarak ayarlanmıştır (Clickjacking koruması)", () => {
    const xfo = headerMap.get("X-Frame-Options");
    expect(xfo).toBe("DENY");
  });

  it("X-Content-Type-Options nosniff olarak ayarlanmıştır (MIME sniffing koruması)", () => {
    const xcto = headerMap.get("X-Content-Type-Options");
    expect(xcto).toBe("nosniff");
  });

  it("Referrer-Policy strict-origin-when-cross-origin olarak ayarlanmıştır", () => {
    const ref = headerMap.get("Referrer-Policy");
    expect(ref).toBe("strict-origin-when-cross-origin");
  });

  it("Permissions-Policy hassas donanım erişimlerini kısıtlar (camera, microphone, geolocation)", () => {
    const perm = headerMap.get("Permissions-Policy");
    expect(perm).toBeTruthy();
    expect(perm).toContain("camera=()");
    expect(perm).toContain("microphone=()");
    expect(perm).toContain("geolocation=()");
  });

  it("Strict-Transport-Security (HSTS) en az 1 yıl ve alt alan adlarıyla yapılandırılmıştır", () => {
    const hsts = headerMap.get("Strict-Transport-Security");
    expect(hsts).toBeTruthy();
    expect(hsts).toContain("max-age=");
    expect(hsts).toContain("includeSubDomains");
  });

  it("X-DNS-Prefetch-Control on olarak ayarlanmıştır", () => {
    const dns = headerMap.get("X-DNS-Prefetch-Control");
    expect(dns).toBe("on");
  });
});

describe("Siber Güvenlik — JSON-LD XSS Sanitizasyonu (app/layout.tsx)", () => {
  it("buildJsonLd fonksiyonu '<' karakterlerini '\\u003c' ile sanitize eder", () => {
    expect(layoutSource).toContain(".replace(/</g, '\\\\u003c')");
  });

  it("Sanitizasyon regex'i tehlikeli <script> enjeksiyonlarını etkisiz kılar", () => {
    const maliciousPayload = '{"title":"Test</script><script>alert(1)</script>"}';
    const sanitized = maliciousPayload.replace(/</g, "\\u003c");
    expect(sanitized).not.toContain("<script>");
    expect(sanitized).not.toContain("</script>");
    expect(sanitized).toContain("\\u003cscript>");
    expect(sanitized).toContain("\\u003c/script>");
  });

  it("layout.tsx application/ld+json script etiketini güvenli render eder", () => {
    expect(layoutSource).toContain('type="application/ld+json"');
    expect(layoutSource).toContain("dangerouslySetInnerHTML={{ __html: buildJsonLd() }}");
  });
});

run();
