import type { Metadata } from 'next'
import LegalPageLayout from '@/components/LegalPageLayout'
import siteConfig from '@/config/siteConfig'
import {
  Cookie,
  Sliders,
  CheckCircle2,
  XCircle,
  Settings,
  Shield,
  Layers,
  HelpCircle,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Çerez Politikası | MESE SYSTEM',
  description:
    'MESE SYSTEM ve MESE SYSTEM çerez politikası. Zorunlu, analitik ve işlevsel çerez türleri, kullanım amaçları ve tarayıcı çerez yönetimi kılavuzu.',
  keywords: [
    'çerez politikası',
    'cookie policy',
    'MESE SYSTEM çerezler',
    'MESE SYSTEM çerez',
    'tarayıcı çerez ayarları',
    'KVKK çerez aydınlatma',
  ],
  openGraph: {
    title: 'Çerez Politikası | MESE SYSTEM',
    description:
      'Web sitemizde kullanılan çerezler, saklama süreleri ve çerez tercihlerini yönetme adımları.',
    type: 'article',
    locale: 'tr_TR',
  },
}

interface CookieEntry {
  name: string
  provider: string
  type: string
  duration: string
  purpose: string
}

const COOKIE_INVENTORY: CookieEntry[] = [
  {
    name: '__Host-session / csrf_token',
    provider: 'MESE SYSTEM (Birinci Taraf)',
    type: 'Zorunlu',
    duration: 'Oturum boyunca',
    purpose: 'Oturum güvenliği, CSRF saldırılarına karşı koruma ve form doğrulaması.',
  },
  {
    name: 'theme_preference',
    provider: 'MESE SYSTEM (Birinci Taraf)',
    type: 'İşlevsel',
    duration: '1 Yıl',
    purpose: 'Kullanıcının karanlık veya aydınlık mod tercihlerini tarayıcıda hatırlar.',
  },
  {
    name: 'cookie_consent_choice',
    provider: 'MESE SYSTEM (Birinci Taraf)',
    type: 'Zorunlu',
    duration: '6 Ay',
    purpose: 'Ziyaretçinin çerez onay bandındaki (Kabul/Reddet) seçimini saklar.',
  },
  {
    name: '_clck / _clsk (Clarity)',
    provider: 'Microsoft Corporation',
    type: 'Analitik',
    duration: '1 Yıl / 1 Gün',
    purpose: 'Kullanıcı etkileşimlerini, tıklama haritalarını ve sayfa gezinme sürelerini anonim olarak analiz eder.',
  },
  {
    name: 'quote_calculator_draft',
    provider: 'MESE SYSTEM (Birinci Taraf)',
    type: 'İşlevsel',
    duration: 'Tarayıcı Yerel Deposu (Local Storage)',
    purpose: 'Fiyat hesaplayıcıda seçilen hizmet ve ek özelliklerin sayfa yenilenmesinde kaybolmamasını sağlar.',
  },
]

export default function CookiePolicyPage() {
  return (
    <LegalPageLayout
      title="Çerez Politikası (Cookie Policy)"
      subtitle="Web sitemizi ziyaretiniz sırasında kullanıcı deneyiminizi geliştirmek, site güvenliğini sağlamak ve hizmetlerimizi optimize etmek amacıyla çerezlerden faydalanmaktayız."
      badgeText="Çerez Tercihleri ve Politikası"
      readingTime="5 dk okuma"
      currentPath="/cerez-politikasi"
      legislation="KVKK m.5 ve e-Privacy İlkeleri Uyarınca"
    >
      {/* 1. Çerez Nedir? */}
      <section className="rounded-2xl border border-white/10 bg-[#0d121f]/70 p-6 sm:p-8 backdrop-blur-sm">
        <div className="flex items-center gap-3 text-amber-400">
          <Cookie className="h-5 w-5" />
          <h2 className="text-lg font-bold text-white sm:text-xl">
            1. Çerez (Cookie) Nedir ve Nasıl Çalışır?
          </h2>
        </div>
        <p className="mt-4 text-sm leading-relaxed text-stone-300">
          Çerezler, bir web sitesini ziyaret ettiğinizde tarayıcınız aracılığıyla bilgisayarınıza, tabletinize
          veya akıllı telefonunuza kaydedilen küçük boyutlu metin dosyalarıdır. Çerezler web sitesinin
          daha verimli çalışmasını sağlar, oturumunuzu açık tutar, tercihlerinizi hatırlar ve site sahibine
          analitik bilgiler sunar.
        </p>
        <p className="mt-3 text-xs leading-relaxed text-stone-400">
          Çerezler cihazınızdaki dosyalara veya özel bilgilerinize erişemez; yalnızca ilgili web sitesine
          gönderilen anonim veya takma adlı (pseudonymized) tanımlayıcılar içerir.
        </p>
      </section>

      {/* 2. Kullanılan Çerez Türleri */}
      <section className="rounded-2xl border border-white/10 bg-[#0d121f]/70 p-6 sm:p-8 backdrop-blur-sm">
        <div className="flex items-center gap-3 text-amber-400">
          <Layers className="h-5 w-5" />
          <h2 className="text-lg font-bold text-white sm:text-xl">
            2. Platformumuzda Kullanılan Çerez Kategorileri
          </h2>
        </div>
        <p className="mt-4 text-sm leading-relaxed text-stone-300">
          MESE SYSTEM web platformunda işlevlerine ve saklama sürelerine göre
          aşağıdaki çerez kategorileri kullanılmaktadır:
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {/* Zorunlu */}
          <div className="rounded-xl border border-amber-500/20 bg-black/40 p-5">
            <div className="flex items-center gap-2 text-amber-400">
              <Shield className="h-4 w-4" />
              <h3 className="text-sm font-bold text-white">A. Zorunlu / Teknik Çerezler</h3>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-stone-400">
              Web sitesinin temel fonksiyonlarının çalışması, güvenli gezinme ve CSRF saldırılarına karşı
              korunma için kesinlikle gereklidir. Bu çerezler kapatılamaz; reddedilmeleri halinde sitenin
              teklif formu veya navigasyonu çalışmayabilir.
            </p>
            <span className="mt-3 inline-block rounded bg-amber-500/10 px-2 py-0.5 text-[10px] font-mono text-amber-300">
              Hukuki Dayanak: KVKK m.5/2-c (Sözleşmenin İfası)
            </span>
          </div>

          {/* Analitik */}
          <div className="rounded-xl border border-white/10 bg-black/40 p-5">
            <div className="flex items-center gap-2 text-amber-400">
              <Sliders className="h-4 w-4" />
              <h3 className="text-sm font-bold text-white">B. Analitik ve Performans Çerezleri</h3>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-stone-400">
              Ziyaretçilerin siteyi nasıl kullandığını (en çok incelenen demo projeler, sayfa kalış süresi,
              hata bildirimleri) anlamamıza yardımcı olur. Veriler tamamen anonimleştirilmiş ve kümelenmiş olarak toplanır.
            </p>
            <span className="mt-3 inline-block rounded bg-white/10 px-2 py-0.5 text-[10px] font-mono text-stone-300">
              Hukuki Dayanak: Açık Rıza Onayı
            </span>
          </div>

          {/* İşlevsel */}
          <div className="rounded-xl border border-white/10 bg-black/40 p-5">
            <div className="flex items-center gap-2 text-amber-400">
              <Settings className="h-4 w-4" />
              <h3 className="text-sm font-bold text-white">C. İşlevsel / Tercih Çerezleri</h3>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-stone-400">
              Web sitemizi yeniden ziyaret ettiğinizde dil tercihiniz, tema modunuz veya teklif hesaplayıcıdaki
              taslak seçimlerinizin hatırlanmasını sağlayarak kişiselleştirilmiş bir deneyim sunar.
            </p>
            <span className="mt-3 inline-block rounded bg-white/10 px-2 py-0.5 text-[10px] font-mono text-stone-300">
              Hukuki Dayanak: Meşru Menfaat / Açık Rıza
            </span>
          </div>

          {/* Hedefleme / Reklam */}
          <div className="rounded-xl border border-white/10 bg-black/40 p-5">
            <div className="flex items-center gap-2 text-amber-400">
              <Cookie className="h-4 w-4" />
              <h3 className="text-sm font-bold text-white">D. Hedefleme ve Reklam Çerezleri</h3>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-stone-400">
              İlgi alanlarınıza uygun hizmet duyuruları sunmak amacıyla kullanılır. <strong>MESE SYSTEM sitesinde üçüncü taraf reklam ağlarına ait çerezler bulunmamaktadır;</strong> yalnızca şirketimizin kendi duyuruları için sınırlı pikseller kullanılabilir.
            </p>
            <span className="mt-3 inline-block rounded bg-white/10 px-2 py-0.5 text-[10px] font-mono text-stone-300">
              Hukuki Dayanak: Açık Rıza Onayı
            </span>
          </div>
        </div>
      </section>

      {/* 3. Kullanılan Çerezlerin Envanteri (Tablo) */}
      <section className="rounded-2xl border border-white/10 bg-[#0d121f]/70 p-6 sm:p-8 backdrop-blur-sm">
        <div className="flex items-center gap-3 text-amber-400">
          <HelpCircle className="h-5 w-5" />
          <h2 className="text-lg font-bold text-white sm:text-xl">
            3. Web Sitemizde Aktif Olarak Kullanılan Çerezler
          </h2>
        </div>
        <p className="mt-3 text-xs text-stone-400">
          Aşağıdaki tabloda sitemizde kullanılan birinci ve üçüncü taraf çerezlerin dökümü yer almaktadır:
        </p>

        <div className="mt-5 overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-white/10 bg-white/5 font-mono text-[11px] text-amber-400 uppercase">
              <tr>
                <th className="p-3">Çerez Adı</th>
                <th className="p-3">Sağlayıcı</th>
                <th className="p-3">Tür</th>
                <th className="p-3">Süre</th>
                <th className="p-3">Kullanım Amacı</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-light text-stone-300">
              {COOKIE_INVENTORY.map((c) => (
                <tr key={c.name} className="hover:bg-white/5 transition-colors">
                  <td className="p-3 font-mono font-medium text-white">{c.name}</td>
                  <td className="p-3 text-stone-400">{c.provider}</td>
                  <td className="p-3">
                    <span className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-mono text-amber-300">
                      {c.type}
                    </span>
                  </td>
                  <td className="p-3 font-mono text-stone-400">{c.duration}</td>
                  <td className="p-3 leading-relaxed text-stone-300">{c.purpose}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 4. Tarayıcı Üzerinden Çerez Yönetimi */}
      <section className="rounded-2xl border border-white/10 bg-[#0d121f]/70 p-6 sm:p-8 backdrop-blur-sm">
        <div className="flex items-center gap-3 text-amber-400">
          <Settings className="h-5 w-5" />
          <h2 className="text-lg font-bold text-white sm:text-xl">
            4. Tarayıcınızdan Çerezleri Nasıl Yönetebilirsiniz?
          </h2>
        </div>
        <p className="mt-4 text-sm leading-relaxed text-stone-300">
          Çerez tercihlerinizi dilediğiniz an değiştirebilir veya tarayıcınızın ayarlarından mevcut çerezleri
          silebilir ya da engelleyebilirsiniz. Popüler tarayıcılarda çerez yönetimi adımları aşağıda özetlenmiştir:
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 text-xs">
          <div className="rounded-xl border border-white/5 bg-black/30 p-4">
            <h4 className="font-semibold text-white">Google Chrome</h4>
            <p className="mt-1 text-stone-400 leading-relaxed">
              Ayarlar → Gizlilik ve Güvenlik → Üçüncü taraf çerezleri bölümünden çerezleri engelleyebilir, silebilir veya istisna siteler tanımlayabilirsiniz.
            </p>
          </div>
          <div className="rounded-xl border border-white/5 bg-black/30 p-4">
            <h4 className="font-semibold text-white">Apple Safari</h4>
            <p className="mt-1 text-stone-400 leading-relaxed">
              Tercihler → Gizlilik sekmesinde &quot;Tüm Çerezleri Engelle&quot; seçeneğini işaretleyebilir veya web sitesi verilerini tek tek yönetebilirsiniz.
            </p>
          </div>
          <div className="rounded-xl border border-white/5 bg-black/30 p-4">
            <h4 className="font-semibold text-white">Mozilla Firefox</h4>
            <p className="mt-1 text-stone-400 leading-relaxed">
              Seçenekler → Gizlilik ve Güvenlik → Çerezler ve Site Verileri sekmesinden geçmişi temizleyebilir ve özel koruma seviyeleri belirleyebilirsiniz.
            </p>
          </div>
          <div className="rounded-xl border border-white/5 bg-black/30 p-4">
            <h4 className="font-semibold text-white">Microsoft Edge</h4>
            <p className="mt-1 text-stone-400 leading-relaxed">
              Ayarlar → Çerezler ve Site İzinleri → Çerezleri ve Site Verilerini Yönet ve Sil adımlarını izleyebilirsiniz.
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-xs text-stone-300">
          <strong className="text-amber-400">Önemli Not:</strong> Zorunlu teknik çerezlerin tarayıcıdan engellenmesi,
          web sitemizdeki bazı dinamik işlevlerin (örneğin interaktif fiyat hesaplayıcı veya güvenli teklif gönderimi)
          beklendiği gibi çalışmamasına yol açabilir.
        </div>
      </section>
    </LegalPageLayout>
  )
}
