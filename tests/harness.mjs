/**
 * Sıfır-bağımlılık test koşucusu ve `@/` takma ad çözümleyicisi — MESE SYSTEM birim testleri.
 *
 * Kullanım:
 *   import { describe, it, expect, run } from "./harness.mjs";
 *   describe("formatCurrencyTL", () => {
 *     it("12.000 TL üretir", () => { expect(formatCurrencyTL(12000)).toBe("12.000 TL"); });
 *   });
 *   run();   // en sonda — süreci yönetir
 *
 * ÖNEMLİ: Bu modül, `@/…` importlarını çözmek için Node 24'ün
 * `module.registerHooks` API'sini kullanır. Bu yüzden test dosyalarında
 * harness importu, test edilen modülün importundan ÖNCE gelmelidir:
 *   import { run } from "./harness.mjs";              // 1. takma ad kaydı
 *   import { buildWhatsAppQuoteHref } from "../lib/whatsapp.ts"; // 2. test edilen kod
 */

import { registerHooks } from "node:module";
import { existsSync } from "node:fs";
import { dirname, resolve as resolvePath, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

// ── `@/` takma adı: proje köküne eşle (Next.js tsconfig paths karşılığı) ──
const HERE = dirname(fileURLToPath(import.meta.url));
const APP_ROOT = resolvePath(HERE, "..");
const CANDIDATES = [".ts", ".tsx", "/index.ts", "/index.tsx", ".js", ".mjs", ""];

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith("@/")) {
      const base = join(APP_ROOT, specifier.slice(2));
      for (const suffix of CANDIDATES) {
        const candidate = base + suffix;
        if (existsSync(candidate)) {
          return nextResolve(pathToFileURL(candidate).href, context);
        }
      }
    }
    return nextResolve(specifier, context);
  },
});

// ── Mini test koşucusu ──
const suites = [];
let current = null;

export function describe(name, fn) {
  current = { name, tests: [] };
  suites.push(current);
  fn();
  current = null;
}

export function it(name, fn) {
  if (!current) throw new Error("it() yalnızca describe() içinde çağrılabilir");
  current.tests.push({ name, fn });
}

export function expect(actual) {
  const matchers = {
    toBe(expected) {
      if (!Object.is(actual, expected)) {
        throw new Error(`beklenen ${format(expected)}, gelen ${format(actual)}`);
      }
    },
    toEqual(expected) {
      const a = JSON.stringify(sortKeys(actual));
      const b = JSON.stringify(sortKeys(expected));
      if (a !== b) throw new Error(`beklenen ${b}, gelen ${a}`);
    },
    toBeTruthy() {
      if (!actual) throw new Error(`doğru değer bekleniyordu, gelen ${format(actual)}`);
    },
    toBeFalsy() {
      if (actual) throw new Error(`yanlış değer bekleniyordu, gelen ${format(actual)}`);
    },
    toContain(item) {
      const ok =
        typeof actual === "string"
          ? actual.includes(item)
          : Array.isArray(actual) && actual.includes(item);
      if (!ok) throw new Error(`${format(item)} ${format(actual)} içinde bulunamadı`);
    },
    toBeGreaterThan(n) {
      if (!(actual > n)) throw new Error(`${format(actual)} > ${n} olmalı`);
    },
    toBeGreaterThanOrEqual(n) {
      if (!(actual >= n)) throw new Error(`${format(actual)} >= ${n} olmalı`);
    },
    toBeLessThan(n) {
      if (!(actual < n)) throw new Error(`${format(actual)} < ${n} olmalı`);
    },
    toBeLessThanOrEqual(n) {
      if (!(actual <= n)) throw new Error(`${format(actual)} <= ${n} olmalı`);
    },
    toMatch(re) {
      const regex = re instanceof RegExp ? re : new RegExp(re);
      if (!regex.test(String(actual))) {
        throw new Error(`${format(actual)} /${regex}/ ile eşleşmedi`);
      }
    },
    toThrow(substring) {
      let threw = false;
      let message = "";
      try {
        actual();
      } catch (err) {
        threw = true;
        message = String(err && err.message ? err.message : err);
      }
      if (!threw) throw new Error("fonksiyon hata fırlatmadı");
      if (substring && !message.includes(substring)) {
        throw new Error(`hata mesajı '${substring}' içermiyor: ${message}`);
      }
    },
  };

  // `expect(x).not.toContain(y)` gibi olumsuz doğrulamalar.
  matchers.not = {
    toBe(expected) {
      if (Object.is(actual, expected)) {
        throw new Error(`beklenmiyordu ${format(expected)}, gelen ${format(actual)}`);
      }
    },
    toEqual(expected) {
      const a = JSON.stringify(sortKeys(actual));
      const b = JSON.stringify(sortKeys(expected));
      if (a === b) throw new Error(`beklenmiyordu ${b}`);
    },
    toBeTruthy() {
      if (actual) throw new Error(`yanlış değer bekleniyordu, gelen ${format(actual)}`);
    },
    toBeFalsy() {
      if (!actual) throw new Error(`doğru değer beklenmiyordu, gelen ${format(actual)}`);
    },
    toContain(item) {
      const ok =
        typeof actual === "string"
          ? actual.includes(item)
          : Array.isArray(actual) && actual.includes(item);
      if (ok) throw new Error(`${format(item)} ${format(actual)} içinde bulundu (beklenmiyordu)`);
    },
    toMatch(re) {
      const regex = re instanceof RegExp ? re : new RegExp(re);
      if (regex.test(String(actual))) {
        throw new Error(`${format(actual)} /${regex}/ ile eşleşti (beklenmiyordu)`);
      }
    },
    toThrow() {
      try {
        actual();
      } catch {
        throw new Error("fonksiyon hata fırlattı (beklenmiyordu)");
      }
    },
  };

  return matchers;
}

function format(v) {
  try {
    return JSON.stringify(v);
  } catch {
    return String(v);
  }
}

function sortKeys(v) {
  if (Array.isArray(v)) return v.map(sortKeys);
  if (v && typeof v === "object") {
    const out = {};
    for (const k of Object.keys(v).sort()) out[k] = sortKeys(v[k]);
    return out;
  }
  return v;
}

export async function run() {
  const ANSI = {
    reset: "\x1b[0m",
    bold: "\x1b[1m",
    red: "\x1b[31m",
    green: "\x1b[32m",
    gray: "\x1b[90m",
  };
  const paint = (c, t) => `${c}${t}${ANSI.reset}`;

  let pass = 0;
  let fail = 0;
  const failures = [];

  for (const suite of suites) {
    console.log(paint(ANSI.bold, `\n  ${suite.name}`));
    for (const t of suite.tests) {
      try {
        await t.fn();
        pass += 1;
        console.log(`    ${paint(ANSI.green, "✓")} ${t.name}`);
      } catch (err) {
        fail += 1;
        failures.push({ suite: suite.name, name: t.name, err });
        console.log(`    ${paint(ANSI.red, "✗")} ${t.name}`);
        console.log(paint(ANSI.gray, `      ${err && err.message ? err.message : err}`));
      }
    }
  }

  console.log(
    `\n  ${paint(ANSI.green, `${pass} geçti`)} · ${paint(ANSI.red, `${fail} başarısız`)}\n`
  );
  if (fail > 0) {
    process.exit(1);
  }
  process.exitCode = 0;
}

