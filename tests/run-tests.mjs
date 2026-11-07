#!/usr/bin/env node
/**
 * Terneon birim testleri — toplu koşucu.
 *
 * tests/ altındaki her `*.test.mjs` dosyasını ayrı süreçte çalıştırır
 * (izolasyon: bir dosyadaki hata veya global durum diğerlerini etkilemesin).
 *
 * Kullanım:
 *   node terneon/tests/run-tests.mjs
 *   node terneon/tests/run-tests.mjs --only format
 *
 * Çıkış kodu: 0 = hepsi geçti, 1 = en az bir başarısız.
 * Ağ erişimi gerekmez; npm paketi gerekmez.
 */

import { readdirSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const ANSI = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  gray: "\x1b[90m",
};
const paint = (c, t) => `${c}${t}${ANSI.reset}`;

const argv = process.argv.slice(2);
const onlyIdx = argv.indexOf("--only");
const only = onlyIdx >= 0 ? argv[onlyIdx + 1] : null;

const files = readdirSync(__dirname)
  .filter((f) => f.endsWith(".test.mjs"))
  .filter((f) => !only || f.includes(only))
  .sort();

if (files.length === 0) {
  console.error(paint(ANSI.red, `Hiç test dosyası bulunamadı${only ? ` (--only ${only})` : ""}`));
  process.exit(2);
}

console.log(
  paint(ANSI.bold, "\n  Terneon — Birim Testleri\n") +
    paint(ANSI.gray, `  ${files.length} dosya · Node ${process.version}\n`)
);

const results = [];
const t0 = Date.now();

for (const file of files) {
  const label = file.replace(/\.test\.mjs$/, "");
  process.stdout.write(`  ${paint(ANSI.gray, "▶")} ${label} … `);
  const started = Date.now();
  // harness.mjs'i --import ile önden yükle: `@/` takma ad çözümleyicisi,
  // test dosyasındaki statik importlar çözümlenmeden önce kayıtlı olsun.
  const harnessUrl = pathToFileURL(join(__dirname, "harness.mjs")).href;
  const res = spawnSync(process.execPath, ["--import", harnessUrl, join(__dirname, file)], {
    encoding: "utf8",
    env: { ...process.env, NODE_NO_WARNINGS: "1" },
  });
  const ms = Date.now() - started;
  const code = res.status ?? 1;
  const out = `${res.stdout ?? ""}${res.stderr ?? ""}`;

  if (code === 0) {
    // son "N geçti · M başarısız" özet satırını bul
    const summaryLine = out
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.includes("geçti") && l.includes("başarısız"))
      .pop();
    console.log(
      paint(ANSI.green, "GEÇTİ") +
        paint(ANSI.gray, ` ${ms} ms${summaryLine ? ` · ${summaryLine}` : ""}`)
    );
  } else {
    console.log(paint(ANSI.red, "KALDI") + paint(ANSI.gray, ` ${ms} ms (status: ${res.status}, error: ${res.error?.message}, signal: ${res.signal})`));
    for (const line of out.split("\n")) {

      if (
        line.includes("✗") ||
        line.includes("başarısız") ||
        line.includes("Error") ||
        line.includes("beklenen")
      ) {
        console.log(paint(ANSI.gray, `      ${line.trim()}`));
      }
    }
  }

  results.push({ label, code, ms });
}

const failed = results.filter((r) => r.code !== 0);
const totalMs = Date.now() - t0;

console.log(`\n${paint(ANSI.bold, "  ──── ÖZET ────")}`);
for (const r of results) {
  console.log(
    `    ${r.code === 0 ? paint(ANSI.green, "GEÇTİ") : paint(ANSI.red, "KALDI ")}  ${r.label.padEnd(14)} ${String(r.ms).padStart(5)} ms`
  );
}
console.log(
  `\n  ${paint(ANSI.green, `${results.length - failed.length} dosya geçti`)} · ${paint(ANSI.red, `${failed.length} dosya kaldı`)} · ${paint(ANSI.gray, `${totalMs} ms`)}\n`
);

process.exit(failed.length > 0 ? 1 : 0);
