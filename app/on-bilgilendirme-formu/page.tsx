import type { Metadata } from 'next'
import LegalPageLayout from '@/components/LegalPageLayout'
import siteConfig from '@/config/siteConfig'
import {
  Info,
  Building,
  Layers,
  Banknote,
  Truck,
  AlertTriangle,
  Scale,
  Calendar,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Ön Bilgilendirme Formu | MESE SYSTEM',
  description:
    '6502 sayılı Tüketicinin Korunması Hakkında Kanun uyarınca sipariş öncesi tüketici ön bilgilendirme formu. Sağlayıcı kimliği, hizmet kapsamı, fiyatlandırma ve cayma şartları.',
  keywords: [
    'ön bilgilendirme formu',
    'tüketici bilgilendirme',
    'MESE SYSTEM ön bilgilendirme',
    'MESE SYSTEM ön bilgilendirme formu',
    'mesafeli sözleşme ön bilgi',
  ],
  openGraph: {
    title: 'Ön Bilgilendirme Formu | MESE SYSTEM',
    description:
      'Hizmet sağlayıcı kimliği, hizmetin temel nitelikleri, tüm vergiler dahil toplam fiyat ve cayma hakkı bilgilendirmesi.',
    type: 'article',
    locale: 'tr_TR',
  },
}

export default function PreInformationPage() {
  return (
    <LegalPageLayout
      title="Ön Bilgilendirme Formu"
      subtitle="Mesafeli Sözleşmeler Yönetmeliği'nin 5. maddesi uyarınca, mesafeli hizmet sözleşmesi kurulmadan önce tüketicinin aydınlatılması amacıyla hazırlanmıştır."
      badgeText="Tüketici Ön Bilgilendirme"
      readingTime="4 dk okuma"
      currentPath="/on-bilgilendirme-formu"
      legislation="29188 Sayılı Mesafeli Sözleşmeler Yönetmeliği m.5 Uyarınca"
    >
      {/* 1. Hizmet Sağlayıcı Bilgileri */}
      <section className="rounded-2xl border border-white/10 bg-[#0d121f]/70 p-6 sm:p-8 backdrop-blur-sm">
        <div className="flex items-center gap-3 text-amber-400">
          <Building className="h-5 w-5" />
          <h2 className="text-lg font-bold text-white sm:text-xl">
            1. Satıcı / Hizmet Sağlayıcı Bilgileri
          </h2>
        </div>
        <p className="mt-4 text-sm leading-relaxed text-stone-300">
          İşbu ön bilgilendirme formu kapsamında hizmet sağlayıcıya ait kurumsal bilgiler aşağıda yer almaktadır:
        </p>

        <div className="mt-5 grid gap-3 rounded-xl border border-white/5 bg-black/40 p-5 text-xs sm:grid-cols-2">
          <div>
            <span className="text-stone-400">Ticari Unvan / Veri Sorumlusu:</span>
            <p className="font-semibold text-white mt-0.5">ŞEYHMUS MEŞE YAZILIM MÜHENDİSİ (MESE SYSTEM)</p>
          </div>
          <div>
            <span className="text-stone-400">İletişim E-Posta:</span>
            <p className="font-mono text-amber-400 mt-0.5">{siteConfig.contact.email}</p>
          </div>
          <div>
            <span className="text-stone-400">Telefon / WhatsApp:</span>
            <p className="font-mono text-stone-200 mt-0.5">{siteConfig.contact.phone}</p>
          </div>
          <div>
            <span className="text-stone-400">Tebligat Adresi:</span>
            <p className="text-stone-200 mt-0.5">{siteConfig.contact.address || 'İstanbul, Türkiye'}</p>
          </div>
        </div>
      </section>

      {/* 2. Hizmetin Temel Nitelikleri */}
      <section className="rounded-2xl border border-white/10 bg-[#0d121f]/70 p-6 sm:p-8 backdrop-blur-sm">
        <div className="flex items-center gap-3 text-amber-400">
          <Layers className="h-5 w-5" />
          <h2 className="text-lg font-bold text-white sm:text-xl">
            2. Sözleşme Konusu Hizmetin Temel Nitelikleri
          </h2>
        </div>
        <p className="mt-4 text-sm leading-relaxed text-stone-300">
          Alıcı tarafından sipariş edilen hizmetin temel özellikleri, web sitesindeki fiyat hesaplayıcı veya
          taraflarca karşılıklı mutabık kalınan teknik şartnamede belirtilen kapsamdadır:
        </p>

        <ul className="mt-4 space-y-2 text-xs leading-relaxed text-stone-300 list-disc pl-5">
          <li>
            <strong>Web Sitesi & Tasarım:</strong> Kişisel portfolyo, kurumsal tanıtım sitesi, dönüşüm odaklı açılış sayfası (Landing Page).
          </li>
          <li>
            <strong>E-Ticaret Çözümleri:</strong> Ürün kataloğu, sepet mimarisi, stok yönetimi ve Mastercard/Visa ödeme geçidi entegrasyonu.
          </li>
          <li>
            <strong>Özel Web Yazılımı & Yönetim Paneli:</strong> Müşterinin iş süreçlerine özel veritabanı, REST/GraphQL API ve Next.js tabanlı panel mimarisi.
          </li>
          <li>
            <strong>Mobil Uygulama:</strong> iOS ve Android platformları için özel hibrit/native mobil uygulama geliştirme.
          </li>
          <li>
            <strong>Sürekli Destek Aboneliği:</strong> Aylık veya yıllık periyotta sunucu barındırma, SSL yenileme, güvenlik güncellemeleri ve teknik destek.
          </li>
        </ul>
      </section>

      {/* 3. Toplam Hizmet Bedeli ve Vergiler */}
      <section className="rounded-2xl border border-white/10 bg-[#0d121f]/70 p-6 sm:p-8 backdrop-blur-sm">
        <div className="flex items-center gap-3 text-amber-400">
          <Banknote className="h-5 w-5" />
          <h2 className="text-lg font-bold text-white sm:text-xl">
            3. Hizmetin Tüm Vergiler Dahil Toplam Fiyatı
          </h2>
        </div>
        <p className="mt-4 text-sm leading-relaxed text-stone-300">
          Hizmetin toplam bedeli, sipariş esnasında seçilen temel paket, seçilen proje büyüklüğü ve talep edilen ek modüller
          toplamı üzerinden Türk Lirası (TRY) olarak hesaplanır. Yasal KDV tutarı ve varsa sunucu/üçüncü parti lisans
          masrafları teklif özetinde şeffafça dökümlenir.
        </p>

        <div className="mt-4 rounded-xl border border-white/5 bg-black/40 p-4 text-xs text-stone-300">
          <span className="font-semibold text-amber-400">Şeffaf Fiyat Politikası:</span> Web sitemizdeki interaktif
          fiyat hesaplayıcı ile oluşturulan dökümler şeffaf olup, müşteriye sonradan sürpriz ek maliyet çıkarılmaz.
        </div>
      </section>

      {/* 4. Ödeme ve Teslimat Prosedürü */}
      <section className="rounded-2xl border border-white/10 bg-[#0d121f]/70 p-6 sm:p-8 backdrop-blur-sm">
        <div className="flex items-center gap-3 text-amber-400">
          <Truck className="h-5 w-5" />
          <h2 className="text-lg font-bold text-white sm:text-xl">
            4. Ödeme ve Teslimat / İfa Usulü
          </h2>
        </div>
        <p className="mt-4 text-sm leading-relaxed text-stone-300">
          Ödeme ve dijital teslimat süreci aşağıdaki şekilde yürütülür:
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 text-xs">
          <div className="rounded-xl border border-white/5 bg-black/30 p-4">
            <h4 className="font-semibold text-white">Ödeme Kanalları</h4>
            <p className="mt-1 text-stone-400 leading-relaxed">
              Banka havalesi/EFT veya Mastercard ve Visa özellikli banka/kredi kartları ile 3D Secure güvenli ödeme.
            </p>
          </div>
          <div className="rounded-xl border border-white/5 bg-black/30 p-4">
            <h4 className="font-semibold text-white">Teslimat Yöntemi ve Süresi</h4>
            <p className="mt-1 text-stone-400 leading-relaxed">
              Ortalama teslim süresi 14 iş günüdür. Teslimat bulut sunucu kurulumu, alan adı yayını ve kaynak kod devriyle dijital olarak tamamlanır.
            </p>
          </div>
        </div>
      </section>

      {/* 5. Cayma Hakkına İlişkin Bilgilendirme */}
      <section className="rounded-2xl border border-white/10 bg-[#0d121f]/70 p-6 sm:p-8 backdrop-blur-sm">
        <div className="flex items-center gap-3 text-amber-400">
          <AlertTriangle className="h-5 w-5" />
          <h2 className="text-lg font-bold text-white sm:text-xl">
            5. Cayma Hakkına İlişkin Bilgilendirme ve İstisnalar
          </h2>
        </div>
        <p className="mt-4 text-sm leading-relaxed text-stone-300">
          6502 sayılı Kanun gereğince kural olarak mesafeli sözleşmelerde 14 günlük cayma hakkı bulunmakla birlikte,
          Mesafeli Sözleşmeler Yönetmeliği&apos;nin 15. maddesinin 1. fıkrasının (b) ve (ğ) bentleri uyarınca;
          <strong> müşterinin özel istekleri doğrultusunda hazırlanan dijital içeriklerde ve anında ifa edilen gayrimaddi hizmetlerde cayma hakkı kullanılamaz</strong>.
        </p>
        <div className="mt-3 rounded-lg border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-300 leading-relaxed">
          Tüketici, canlı demoyu inceleyip siparişini onaylayarak ve mesafeli sözleşmeyi akdederek cayma hakkı istisnasına tabi olduğunu peşinen bildiğini kabul eder.
        </div>
      </section>

      {/* 6. Şikayet ve İtiraz Başvuru Yolları */}
      <section className="rounded-2xl border border-white/10 bg-[#0d121f]/70 p-6 sm:p-8 backdrop-blur-sm">
        <div className="flex items-center gap-3 text-amber-400">
          <Scale className="h-5 w-5" />
          <h2 className="text-lg font-bold text-white sm:text-xl">
            6. Şikayet ve İtiraz Başvuru Yolları
          </h2>
        </div>
        <p className="mt-4 text-sm leading-relaxed text-stone-300">
          Tüketiciler, hizmete ilişkin şikayet ve itirazlarını öncelikle <strong>{siteConfig.contact.email}</strong> üzerinden
          veya WhatsApp hattımızdan Hizmet Sağlayıcı&apos;ya iletebilirler. Çözümlenemeyen uyuşmazlıklarda, Ticaret Bakanlığı&apos;nca
          belirlenen parasal sınırlar dahilinde tüketicinin ikametgahının bulunduğu veya işlemin yapıldığı yerdeki
          <strong> İlçe veya İl Tüketici Hakem Heyetleri</strong> ya da <strong>Tüketici Mahkemeleri</strong> yetkilidir.
        </p>
      </section>

      {/* 7. Formun Geçerlilik Süresi */}
      <section className="rounded-2xl border border-white/10 bg-[#0d121f]/70 p-6 sm:p-8 backdrop-blur-sm">
        <div className="flex items-center gap-3 text-amber-400">
          <Calendar className="h-5 w-5" />
          <h2 className="text-lg font-bold text-white sm:text-xl">
            7. Ön Bilgilendirmenin Geçerlilik Süresi
          </h2>
        </div>
        <p className="mt-4 text-sm leading-relaxed text-stone-300">
          Web sitemiz üzerinden hesaplanan fiyatlar ve sunulan ön bilgiler, oluşturulduğu tarihten itibaren
          <strong> 15 (on beş) takvim günü</strong> boyunca geçerlidir. Bu sürenin ardından güncel fiyat listesi uygulanır.
        </p>
      </section>
    </LegalPageLayout>
  )
}
