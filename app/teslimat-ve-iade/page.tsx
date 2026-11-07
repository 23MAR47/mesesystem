import type { Metadata } from 'next'
import LegalPageLayout from '@/components/LegalPageLayout'
import siteConfig from '@/config/siteConfig'
import {
  Truck,
  RotateCcw,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Code,
  Sparkles,
  Server,
  HelpCircle,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Teslimat, İptal ve İade Koşulları | MESE SYSTEM',
  description:
    'MESE SYSTEM ve MESE SYSTEM dijital yazılım, web tasarım ve mobil uygulama hizmetleri teslimat süreçleri, ücretsiz demo modeli, iptal ve iade politikası.',
  keywords: [
    'teslimat politikası',
    'yazılım iade şartları',
    'ücretsiz demo modeli',
    'dijital hizmet teslimi',
    'MESE SYSTEM iade',
    'MESE SYSTEM teslimat',
  ],
  openGraph: {
    title: 'Teslimat, İptal ve İade Koşulları | MESE SYSTEM',
    description:
      'Özel yazılım ve dijital tasarım teslimat modeli, 14 gün ortalama teslimat, cayma hakkı istisnaları ve garanti şartları.',
    type: 'article',
    locale: 'tr_TR',
  },
}

export default function DeliveryAndRefundPage() {
  return (
    <LegalPageLayout
      title="Teslimat, İptal ve İade Koşulları"
      subtitle="Özel yazılım, dijital ürün tasarımı ve mobil uygulama geliştirme hizmetlerimizde uygulanan teslimat modeli, sprint onay süreçleri ve yasal iade/iptal kuralları."
      badgeText="Hizmet Teslimatı & İade Şartları"
      readingTime="5 dk okuma"
      currentPath="/teslimat-ve-iade"
      legislation="6502 Sayılı TKHK ve Mesafeli Sözleşmeler Yönetmeliği m.15 Uyarınca"
    >
      {/* 1. Dijital Teslimat Modeli */}
      <section className="rounded-2xl border border-white/10 bg-[#0d121f]/70 p-6 sm:p-8 backdrop-blur-sm">
        <div className="flex items-center gap-3 text-amber-400">
          <Truck className="h-5 w-5" />
          <h2 className="text-lg font-bold text-white sm:text-xl">
            1. Dijital Hizmet Teslimat Modeli
          </h2>
        </div>
        <p className="mt-4 text-sm leading-relaxed text-stone-300">
          MESE SYSTEM tarafından üretilen tüm ürünler <strong>dijital ve gayrimaddi</strong> niteliktedir.
          Şirketimiz fiziki kargo veya kutulu ürün gönderimi yapmamaktadır. Teslimat; modern bulut altyapıları,
          kaynak kod depoları ve canlı sunucu ortamları üzerinden elektronik olarak gerçekleştirilir.
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-3 text-xs">
          <div className="rounded-xl border border-white/5 bg-black/30 p-4">
            <div className="flex items-center gap-2 text-amber-400 mb-2">
              <Server className="h-4 w-4" />
              <h3 className="font-semibold text-white">Canlı Sunucu Yayını</h3>
            </div>
            <p className="text-stone-400 leading-relaxed">
              Yazılımın müşteri alan adı (domain) ve bulut sunucusuna (Vercel, AWS, Hetzner vb.) deploy edilerek SSL sertifikasıyla yayına alınması.
            </p>
          </div>

          <div className="rounded-xl border border-white/5 bg-black/30 p-4">
            <div className="flex items-center gap-2 text-amber-400 mb-2">
              <Code className="h-4 w-4" />
              <h3 className="font-semibold text-white">Kaynak Kod Devri</h3>
            </div>
            <p className="text-stone-400 leading-relaxed">
              GitHub / GitLab özel reposu daveti veya arşiv dosyası ile tam kaynak kodların müşteriye teslimi.
            </p>
          </div>

          <div className="rounded-xl border border-white/5 bg-black/30 p-4">
            <div className="flex items-center gap-2 text-amber-400 mb-2">
              <Sparkles className="h-4 w-4" />
              <h3 className="font-semibold text-white">Yönetim Paneli Erişimi</h3>
            </div>
            <p className="text-stone-400 leading-relaxed">
              İçerik yönetim paneli (CMS), API anahtarları, veritabanı kimlik bilgileri ve kullanım dokümantasyonunun teslimi.
            </p>
          </div>
        </div>
      </section>

      {/* 2. "Önce Ücretsiz Demo" ve Sprint Aşamaları */}
      <section className="rounded-2xl border-2 border-amber-500/20 bg-gradient-to-b from-[#111728] to-[#0a0f1d] p-6 sm:p-8 backdrop-blur-sm">
        <div className="flex items-center gap-3 text-amber-400">
          <Sparkles className="h-5 w-5" />
          <h2 className="text-lg font-bold text-white sm:text-xl">
            2. &quot;Önce Ücretsiz Demo, Sonra Ödeme&quot; Modeli ve Sprint Takvimi
          </h2>
        </div>
        <p className="mt-4 text-sm leading-relaxed text-stone-200">
          Müşteri güvenini en üst düzeyde tutmak amacıyla stüdyomuz sıfır riskli iş modeli benimsemiştir.
          Ortalama teslim süremiz sözleşme onayından itibaren <strong>14 (on dört) iş günüdür</strong>. Süreç 4 aşamada yürütülür:
        </p>

        <div className="mt-6 space-y-4">
          <div className="flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-xs">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-400 text-stone-950 font-bold font-mono shrink-0">
              01
            </span>
            <div>
              <h4 className="font-bold text-white text-sm">Keşif ve Ücretsiz Canlı Demo</h4>
              <p className="mt-1 text-stone-300 leading-relaxed">
                İhtiyaçlarınıza göre markanıza özel interaktif bir demo arayüzü ücretsiz olarak hazırlanır ve canlı link üzerinden incelemenize sunulur. <strong>Bu aşamada sizden hiçbir peşinat talep edilmez.</strong>
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-xl border border-white/5 bg-black/40 p-4 text-xs">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-stone-700 text-white font-bold font-mono shrink-0">
              02
            </span>
            <div>
              <h4 className="font-bold text-white text-sm">Tasarım & Mimari Onayı</h4>
              <p className="mt-1 text-stone-400 leading-relaxed">
                Demoyu beğenip projeyi başlatmaya karar verdiğinizde teknik şartname ve mesafeli hizmet sözleşmesi elektronik ortamda onaylanır.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-xl border border-white/5 bg-black/40 p-4 text-xs">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-stone-700 text-white font-bold font-mono shrink-0">
              03
            </span>
            <div>
              <h4 className="font-bold text-white text-sm">Geliştirme & Entegrasyon (Sprintler)</h4>
              <p className="mt-1 text-stone-400 leading-relaxed">
                Frontend, backend API, ödeme geçitleri (Mastercard/Visa) ve veritabanı mimarisi kodlanır; test ortamında müşteri ara kontrolleri gerçekleştirilir.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-xl border border-white/5 bg-black/40 p-4 text-xs">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-stone-700 text-white font-bold font-mono shrink-0">
              04
            </span>
            <div>
              <h4 className="font-bold text-white text-sm">Canlıya Alma, Nihai Onay & Teslim</h4>
              <p className="mt-1 text-stone-400 leading-relaxed">
                Domain DNS yönlendirmesi tamamlanır, tüm kaynak kodlar ve yetkiler müşteriye devredilerek teslim tutanağı düzenlenir.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. İptal Koşulları */}
      <section className="rounded-2xl border border-white/10 bg-[#0d121f]/70 p-6 sm:p-8 backdrop-blur-sm">
        <div className="flex items-center gap-3 text-amber-400">
          <Clock className="h-5 w-5" />
          <h2 className="text-lg font-bold text-white sm:text-xl">
            3. Sipariş İptal Koşulları
          </h2>
        </div>
        <p className="mt-4 text-sm leading-relaxed text-stone-300">
          İptal koşulları projenin bulunduğu aşamaya göre farklılık gösterir:
        </p>

        <ul className="mt-4 space-y-3 text-xs leading-relaxed text-stone-300">
          <li className="flex items-start gap-2.5">
            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0" />
            <div>
              <strong className="text-white">Demo Aşamasında İptal:</strong> Müşteri, hazırlanan canlı demoyu onaylamadan önce hiçbir gerekçe göstermeksizin ve herhangi bir bedel ödemeksizin siparişini tek taraflı olarak iptal edebilir.
            </div>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0" />
            <div>
              <strong className="text-white">Geliştirme Aşamasında İptal:</strong> Sözleşme imzalanıp geliştirme sprintlerine başlandıktan sonra müşterinin tek taraflı fesih talebinde bulunması halinde; o ana kadar tamamlanan iş paketleri ve harcanan teknik adam-saat emeği hesaplanarak mahsup edilir, varsa kalan bakiye iade edilir.
            </div>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0" />
            <div>
              <strong className="text-white">Abonelik İptalleri:</strong> Aylık veya yıllık bakım/destek abonelikleri, ilgili fatura döneminin bitiminden en az 5 gün önce bildirilmek kaydıyla cezasız olarak iptal edilebilir.
            </div>
          </li>
        </ul>
      </section>

      {/* 4. Cayma Hakkı ve Yasal İstisnalar */}
      <section className="rounded-2xl border border-white/10 bg-[#0d121f]/70 p-6 sm:p-8 backdrop-blur-sm">
        <div className="flex items-center gap-3 text-amber-400">
          <ShieldAlert className="h-5 w-5" />
          <h2 className="text-lg font-bold text-white sm:text-xl">
            4. Cayma Hakkı ve Dijital Ürün İstisnaları (Madde 15)
          </h2>
        </div>
        <p className="mt-4 text-sm leading-relaxed text-stone-300">
          6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Resmi Gazete&apos;de yayımlanan Mesafeli Sözleşmeler Yönetmeliği&apos;nin
          <strong> 15. maddesinin 1. fıkrasının (b) ve (ğ) bentleri</strong> uyarınca:
        </p>

        <div className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-xs leading-relaxed text-stone-300 space-y-2">
          <p>
            <strong>İstisna Maddesi:</strong> &quot;Tüketicinin istekleri veya kişisel ihtiyaçları doğrultusunda hazırlanan mallara ilişkin sözleşmeler&quot; ile &quot;Elektronik ortamda anında ifa edilen hizmetler veya tüketiciye anında teslim edilen gayrimaddi mallara ilişkin sözleşmelerde tüketici cayma hakkını kullanamaz.&quot;
          </p>
          <p>
            Bu yasal hüküm gereğince, müşteriye özel olarak tasarlanan, kodlanan, kaynak kodları teslim edilen veya alan adına özel lisanslanan yazılım ürünlerinde <strong>nihai teslimat sonrasında cayma ve ücret iadesi hakkı bulunmamaktadır</strong>.
          </p>
        </div>
      </section>

      {/* 5. Garanti ve Ücretsiz Hata Giderme */}
      <section className="rounded-2xl border border-white/10 bg-[#0d121f]/70 p-6 sm:p-8 backdrop-blur-sm">
        <div className="flex items-center gap-3 text-amber-400">
          <CheckCircle2 className="h-5 w-5" />
          <h2 className="text-lg font-bold text-white sm:text-xl">
            5. Garanti, Bakım ve Ücretsiz Hata Düzeltme (SLA)
          </h2>
        </div>
        <p className="mt-4 text-sm leading-relaxed text-stone-300">
          Müşteri memnuniyetini garanti altına almak için aşağıdaki güvenceler sağlanmaktadır:
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 text-xs">
          <div className="rounded-xl border border-white/5 bg-black/30 p-4">
            <h4 className="font-semibold text-white">30 Gün Ücretsiz Hata Giderme</h4>
            <p className="mt-1 text-stone-400 leading-relaxed">
              Yazılımın canlıya alınmasından sonraki 30 gün içinde tespit edilen kod hataları, görsel uyuşmazlıklar veya işlev bozuklukları stüdyomuzca ek ücret talep edilmeksizin ivedilikle giderilir.
            </p>
          </div>
          <div className="rounded-xl border border-white/5 bg-black/30 p-4">
            <h4 className="font-semibold text-white">Abonelik Kapsamında Sürekli Destek</h4>
            <p className="mt-1 text-stone-400 leading-relaxed">
              Bakım aboneliği tercih eden müşterilerimize aylık güncelleme, SSL ve sunucu izleme, güvenlik yamaları ve WhatsApp doğrudan destek hattı kesintisiz sunulur.
            </p>
          </div>
        </div>
      </section>
    </LegalPageLayout>
  )
}