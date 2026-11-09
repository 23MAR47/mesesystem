# MESE SYSTEM

Özgün dijital deneyimler ve yazılım çözümleri sunan tasarım stüdyosu sitesi +
**interaktif fiyat hesaplayıcı**. Tek sayfalık, tamamen Türkçe bir pazarlama sitesi.
Sunucu API'si yok — statik/istemci tarafı bir Next.js uygulamasıdır.

> Bu proje `saas/` paketindeki **dört bağımsız uygulamadan** biridir. Ortak npm
> workspace kullanılmaz; kendi `package.json`, kendi `node_modules`, kendi dağıtım
> hedefi vardır.

## Hızlı başlangıç

```bash
cd mesesystem
npm install
npm run dev          # → http://localhost:3003
```

Üretim derlemesi:

```bash
npm run build
npm start            # → http://localhost:3003
```

Paket kökünden (dört uygulamayı birlikte):

```bash
node scripts/dev-all.mjs                 # 3001–3004
node scripts/dev-all.mjs --only mesesystem
node scripts/build-all.mjs --only mesesystem
```

## Dizin yapısı

```
mesesystem/
├── app/
│   ├── layout.tsx          # kök yerleşim, meta
│   ├── page.tsx            # tek sayfa — tüm bölümler
│   └── globals.css
├── components/
│   ├── Header.tsx          # yapışkan üst menü
│   ├── Hero.tsx            # hero + yerel canlı proje önizlemeleri
│   ├── PortfolioSection.tsx # ZIP projelerinin filtrelenebilir vitrini
│   ├── TrustAndStats.tsx   # güven göstergeleri / sayaçlar
│   ├── DemoShowcase.tsx    # sektör simülatörü, masaüstü / mobil
│   ├── ProcessSection.tsx  # 3 adımlık süreç
│   ├── PriceCalculator.tsx # 3 adımlık fiyat hesaplayıcı
│   ├── TestimonialsAndFaq.tsx
│   └── Footer.tsx
├── config/siteConfig.ts    # marka, iletişim ve yapılandırılmış veri
├── config/referenceSite.ts # hizmetler, fiyatlar, portfolyo ve SSS
├── lib/
│   ├── whatsapp.ts         # wa.me derin bağlantısı + mesaj oluşturucu
│   ├── format.ts           # TL / sayı biçimlendirme
│   └── cn.ts               # clsx + tailwind-merge
├── Dockerfile
├── docker-compose.yml
└── package.json
```

## `config/siteConfig.ts` — tek doğruluk kaynağı

Marka adı, slogan, telefon, WhatsApp numarası, e-posta ve yapılandırılmış veri
bu dosyada tutulur. Görünen fiyat hesaplayıcısı, hizmetler ve SSS içerikleri
`config/referenceSite.ts` içindedir.

```ts
export const siteConfig = {
  brand: { name: "MESE SYSTEM", tagline: "…", logoText: "M" },
  contact: {
    phone: "+90 553 977 16 47",
    whatsapp: "905539771647",   // + ve boşluksuz — wa.me için
    email: "meseseyhmus346@gmail.com",
    address: "Türkiye genelinde",
  },
  hero: { title: "…", subtitle: "…", primaryCta: {…}, secondaryCta: {…} },
  pricing: {
    services: [ { id: "portfolio", name: "Kişisel / Portfolyo Sitesi", price: 9000, … } ],
    subscriptions: [ { id: "monthly", price: 490, … }, { id: "yearly", price: 4900, … } ],
  },
  // …
}
```

İletişim bilgilerini değiştirmek için bu dosyayı düzenleyin. Fiyatları
`config/referenceSite.ts` içinde ve yapılandırılmış veride tutarlı güncelleyin.

## Fiyat hesaplayıcı (3 adım)

1. **Proje türü** — portfolyo, kurumsal, e-ticaret, özel yazılım veya mobil uygulama.
2. **Proje kapsamı** — küçük, orta veya geniş.
3. **Ek hizmetler** — yönetim paneli, çoklu dil desteği ve ileri düzey SEO.

Toplam; proje türü, kapsam ve seçilen ek hizmetlerden hesaplanır. Standart teslimat
ek ücret oluşturmaz; tutar `Intl.NumberFormat` ile Türkçe biçimde gösterilir.

## WhatsApp derin bağlantısı

`lib/whatsapp.ts` seçimleri önceden doldurulmuş bir mesaja dönüştürür:

```ts
buildWhatsAppLink(siteConfig.contact.whatsapp, selection)
// → https://wa.me/905539771647?text=Merhaba%20MESE%20SYSTEM%2C%20…
```

Hero, hesaplayıcı ve footer'daki WhatsApp butonları bu linki `wa.me` üzerinden açar.
Numara `siteConfig.contact.whatsapp` alanından gelir (ulusal biçim, `+` ve boşluk yok).

## Sektör simülatörü

`DemoShowcase` altı sektör için etkileşimli masaüstü / mobil simülatör sunar.
Filtrelenebilir portfolyo vitrini ve hero carousel'i `config/referenceSite.ts`
üzerindeki proje listesini kullanır. Öne çıkan proje görselleri, ilgili sitelerin
ana sayfalarından alınarak `public/projects/` altında yerel tutulur. Altı sektör
simülatörü ve 14 yerel ZIP demosu ise `config/showcaseProjects.ts` üzerinden gelir.
Karekod menü, berber, kuaför, güzellik salonu, saha servisleri, inşaat, otel,
market, kuruyemiş, emlak, oto servis ve araç kiralama için hazırlanan 13 bağımsız
sektör demosu aynı listede yer alır ve ana sayfada doğrudan gösterilir. Her demo
`public/showcases/<slug>/index.html` altında kendi kendine yeterli bir örnektir;
sepet, randevu ve talep akışları tarayıcı içinde simüle edilir, gerçek işlem
göndermez. `npm run showcases:build`, 14 özgün ZIP demosunun yanında ana
`public/showcases/index.html` kataloğunu 27 bağlantıyla üretir.

### Proje vitrini demoları

`templates/` altında bulunan 14 ZIP projesi kaynak ve lisans notlarıyla korunur.
`npm run showcases:build`, her proje için Türkiye odaklı, duyarlı ve dikey
gezintili bir demo sitesi üretir. Bölüm bağlantıları sayfa içinde aşağı kaydırır;
projeye ait yerel görseller/videolar, lisans notu ve özgün etkileşimli demo
korunur. Kaynak uygulama kodları public dizine dağıtılmaz. Demo etkileşimleri
örnek arayüz durumlarıdır; gerçek servis, sağlık değerlendirmesi veya işlem
sağlamaz. `npm run dev` ve `npm run build`,
Next.js başlamadan/derlemeden önce showcase dosyalarını otomatik üretir; çalışan
bir sunucunun public dosyaları yeniden taraması için sunucuyu yeniden başlatın.

## Bağımlılıklar

| Paket | Majör | Not |
|---|---|---|
| `next` | 15 | App Router |
| `react` / `react-dom` | 19 | |
| `framer-motion` | 11 | bölüm animasyonları |
| `lucide-react` | 0 | ikonlar |
| `clsx` + `tailwind-merge` | — | `lib/cn.ts` |
| `tailwindcss` | 3 | **v3** (v4 değil) + postcss + autoprefixer |
| `typescript` | 5 | |

## Docker

```bash
docker build -t mesesystem .
docker run --rm -p 3003:3003 mesesystem
```

Veya paket kökünden dört servislik compose:

```bash
docker compose up mesesystem     # port 3003
```

## Test

MESE SYSTEM saf istemci/SSG uygulamasıdır; sunucu API gövdesi üretmediği için
`qa/contracts/` şemaları kapsamı dışındadır. Kontrol edilenler:

```bash
node qa/run-all.mjs --only mesesystem     # paket/dosya/izolelik sözleşmesi
node scripts/status.mjs                # derleme + README + tests durumu
```

Uçtan uca kontrol listesi için kök `TESTING.md`.

## Sınırlar

- Sunucu tarafı API rota **yoktur** (`app/api/` oluşturulmamalı).
- Form gönderimi yoktur — iletişim WhatsApp ve e-posta üzerindendir.
- Fiyatlar `siteConfig` içindedir; ödeme entegrasyonu bu sürümde yoktur.
- Diğer uygulamalarla (SeoRadar, KonvertLab, Parselya) **hiçbir kaynak paylaşılmaz**;
  çapraz import sözleşme denetimiyle (`qa/run-all.mjs` 7b) engellenir.