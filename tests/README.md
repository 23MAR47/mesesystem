# Terneon — Birim Testleri

Sıfır bağımlılıklı (npm paketi yok) birim testleri. Node 24'ün yerleşik
TypeScript type-stripping özelliği sayesinde `.ts` kaynak dosyaları doğrudan
import edilir; derleme adımı gerekmez.

## Çalıştırma

```bash
node terneon/tests/run-tests.mjs
# yalnızca bir dosyayı çalıştırmak için:
node terneon/tests/run-tests.mjs --only format
```

Çıkış kodu `0` = tüm testler geçti, `1` = en az bir test başarısız.
Ağ erişimi gerekmez.

## Dosyalar

| Dosya | İçerik |
|---|---|
| `harness.mjs` | Mini test koşucusu (`describe`/`it`/`expect`/`run`) + `@/` takma ad çözümleyicisi |
| `whatsapp.test.mjs` | `lib/whatsapp.ts` — wa.me link formatı, URL kodlama, sepet/özet metni, boş sepet |
| `siteConfig.test.mjs` | `config/siteConfig.ts` — yapı doğruluğu, pozitif fiyatlar, benzersiz id'ler, numara uyumu |
| `format.test.mjs` | `lib/format.ts` — `formatCurrencyTL` ve `formatNumber` |
| `run-tests.mjs` | Her test dosyasını ayrı süreçte çalıştıran toplu koşucu |

## `@/` takma adı

`lib/whatsapp.ts` gibi kaynak dosyalar `@/config/siteConfig` biçiminde import
yapar (Next.js `tsconfig paths`). Test ortamında bu takma ad, `harness.mjs`
içinde Node 24'ün `module.registerHooks` API'si ile terneon kök dizinine
eşlenir. Bu yüzden test dosyalarında `harness.mjs` importu her zaman test
edilen modülün importundan **önce** gelmelidir.

## Kapsam dışı

`openWhatsAppQuote` / `openWhatsAppDemoRequest` fonksiyonları `window.open`
kullandığı için (tarayıcı gerektirdiğinden) test edilmez; saf olan
`buildWhatsAppQuoteHref` test edilir.
