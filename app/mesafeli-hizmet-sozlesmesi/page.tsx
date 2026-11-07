import type { Metadata } from 'next'
import LegalPageLayout from '@/components/LegalPageLayout'
import siteConfig from '@/config/siteConfig'
import {
  FileSignature,
  Building,
  Briefcase,
  CreditCard,
  Rocket,
  ShieldCheck,
  Award,
  Lock,
  Scale,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Mesafeli Hizmet Sözleşmesi | MESE SYSTEM',
  description:
    '6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği uyarınca akdedilen dijital yazılım, web tasarımı ve danışmanlık hizmet sözleşmesi.',
  keywords: [
    'mesafeli hizmet sözleşmesi',
    'yazılım sözleşmesi',
    'web tasarım sözleşmesi',
    'MESE SYSTEM sözleşme',
    'MESE SYSTEM mesafeli sözleşme',
    '6502 sayılı kanun',
  ],
  openGraph: {
    title: 'Mesafeli Hizmet Sözleşmesi | MESE SYSTEM',
    description:
      'MESE SYSTEM ve MESE SYSTEM mesafeli hizmet sözleşmesi maddeleri, fikri mülkiyet, ödeme ve teslim şartları.',
    type: 'article',
    locale: 'tr_TR',
  },
}

export default function DistanceContractPage() {
  return (
    <LegalPageLayout
      title="Mesafeli Hizmet Sözleşmesi"
      subtitle="6502 sayılı Tüketicinin Korunması Hakkında Kanun ve 29188 sayılı Mesafeli Sözleşmeler Yönetmeliği hükümleri uyarınca düzenlenmiş tip mesafeli yazılım geliştirme ve tasarım hizmeti sözleşmesidir."
      badgeText="Mesafeli Sözleşme Metni"
      readingTime="7 dk okuma"
      currentPath="/mesafeli-hizmet-sozlesmesi"
      legislation="6502 Sayılı Kanun & 29188 Sayılı Yönetmelik"
    >
      {/* Madde 1: Taraflar */}
      <section className="rounded-2xl border border-white/10 bg-[#0d121f]/70 p-6 sm:p-8 backdrop-blur-sm">
        <div className="flex items-center gap-3 text-amber-400">
          <Building className="h-5 w-5" />
          <h2 className="text-lg font-bold text-white sm:text-xl">
            Madde 1 — Taraflar
          </h2>
        </div>
        <p className="mt-4 text-sm leading-relaxed text-stone-300">
          İşbu Mesafeli Hizmet Sözleşmesi (&quot;Sözleşme&quot;), elektronik ortamda sipariş oluşturan veya teklif onaylayan
          Alıcı (&quot;Müşteri&quot;) ile aşağıda bilgileri bulunan Hizmet Sağlayıcı arasında akdedilmiştir:
        </p>

        <div className="mt-5 grid gap-4 rounded-xl border border-white/5 bg-black/40 p-5 text-xs sm:grid-cols-2">
          <div>
            <h3 className="font-semibold text-amber-400 uppercase tracking-wider text-[11px] mb-2">
              Hizmet Sağlayıcı
            </h3>
            <p className="text-stone-300"><strong>Unvan:</strong> ŞEYHMUS MEŞE YAZILIM MÜHENDİSİ (MESE SYSTEM)</p>
            <p className="mt-1 text-stone-300"><strong>Adres:</strong> {siteConfig.contact.address || 'İstanbul, Türkiye'}</p>
            <p className="mt-1 text-stone-300"><strong>E-Posta:</strong> {siteConfig.contact.email}</p>
            <p className="mt-1 text-stone-300"><strong>Telefon / WhatsApp:</strong> {siteConfig.contact.phone}</p>
          </div>

          <div>
            <h3 className="font-semibold text-amber-400 uppercase tracking-wider text-[11px] mb-2">
              Alıcı (Müşteri)
            </h3>
            <p className="text-stone-300">
              Web sitesindeki fiyat hesaplayıcı, teklif formu veya yazılı WhatsApp/e-posta kanalı üzerinden
              iletişim kurarak hizmeti talep eden, siparişi onaylayan ve bedelini ödeyen gerçek veya tüzel kişi.
            </p>
          </div>
        </div>
      </section>

      {/* Madde 2: Sözleşmenin Konusu */}
      <section className="rounded-2xl border border-white/10 bg-[#0d121f]/70 p-6 sm:p-8 backdrop-blur-sm">
        <div className="flex items-center gap-3 text-amber-400">
          <Briefcase className="h-5 w-5" />
          <h2 className="text-lg font-bold text-white sm:text-xl">
            Madde 2 — Sözleşmenin Konusu ve Kapsamı
          </h2>
        </div>
        <p className="mt-4 text-sm leading-relaxed text-stone-300">
          İşbu Sözleşmenin konusu; Alıcı&apos;nın Hizmet Sağlayıcı&apos;ya ait web sitesi üzerinden elektronik ortamda
          siparişini verdiği, nitelikleri ve satış bedeli sipariş özetinde/teklif dökümünde belirtilen web sitesi tasarımı,
          özel web yazılımı geliştirme, mobil uygulama kodlama, API entegrasyonu veya aylık/yıllık bakım-destek aboneliği
          hizmetlerinin satışı ve ifasına ilişkin olarak 6502 sayılı Kanun ve Yönetmelik hükümleri gereğince
          tarafların karşılıklı hak ve yükümlülüklerinin belirlenmesidir.
        </p>
      </section>

      {/* Madde 3: Hizmet Bedeli ve Ödeme */}
      <section className="rounded-2xl border border-white/10 bg-[#0d121f]/70 p-6 sm:p-8 backdrop-blur-sm">
        <div className="flex items-center gap-3 text-amber-400">
          <CreditCard className="h-5 w-5" />
          <h2 className="text-lg font-bold text-white sm:text-xl">
            Madde 3 — Hizmet Bedeli ve Ödeme Şartları
          </h2>
        </div>
        <p className="mt-4 text-sm leading-relaxed text-stone-300">
          Hizmet bedeli, sipariş anında Alıcı tarafından seçilen hizmetler, proje büyüklüğü ve ek modüller
          doğrultusunda hesaplanan ve Alıcı&apos;ya yazılı olarak sunulan tutardır.
        </p>

        <ul className="mt-4 space-y-2 text-xs text-stone-300 list-disc pl-5 leading-relaxed">
          <li>
            Fiyatlar Türk Lirası (TRY) cinsinden düzenlenir ve yasal oranda KDV içerir veya KDV hariç olarak teklifte açıkça belirtilir.
          </li>
          <li>
            Ödemeler banka havalesi (EFT/FAST) veya SSL güvenlik sertifikalı sanal POS altyapısı üzerinden <strong>Mastercard ve Visa kredi/banka kartları</strong> ile tek çekim veya taksitle yapılabilir.
          </li>
          <li>
            Stüdyomuzun &quot;Önce Ücretsiz Demo&quot; prensibi uyarınca, demo onaylanana kadar Alıcı&apos;dan herhangi bir ön ödeme tahsil edilmez.
          </li>
        </ul>
      </section>

      {/* Madde 4: Hizmetin İfası ve Teslimat */}
      <section className="rounded-2xl border border-white/10 bg-[#0d121f]/70 p-6 sm:p-8 backdrop-blur-sm">
        <div className="flex items-center gap-3 text-amber-400">
          <Rocket className="h-5 w-5" />
          <h2 className="text-lg font-bold text-white sm:text-xl">
            Madde 4 — Hizmetin İfası ve Teslimat Süreci
          </h2>
        </div>
        <p className="mt-4 text-sm leading-relaxed text-stone-300">
          Hizmet Sağlayıcı, sözleşmenin yürürlüğe girmesini takiben ortalama <strong>14 (on dört) iş günü</strong> içerisinde
          projenin birinci fazını tamamlamayı taahhüt eder. Projenin kapsamına göre taraflar yazılı mutabakatla ek sprint süreleri kararlaştırabilir.
        </p>
        <p className="mt-3 text-xs leading-relaxed text-stone-400">
          Teslimat; yazılımın canlı bulut sunucuya yüklenmesi, alan adının bağlanması, kaynak kodların
          belirlenen repo üzerinden Alıcı&apos;ya aktarılması ve yönetim paneli giriş şifrelerinin iletilmesi ile hukuken tamamlanmış sayılır.
        </p>
      </section>

      {/* Madde 5: Cayma Hakkı ve İstisnalar */}
      <section className="rounded-2xl border border-white/10 bg-[#0d121f]/70 p-6 sm:p-8 backdrop-blur-sm">
        <div className="flex items-center gap-3 text-amber-400">
          <ShieldCheck className="h-5 w-5" />
          <h2 className="text-lg font-bold text-white sm:text-xl">
            Madde 5 — Cayma Hakkı ve Dijital Ürün İstisnaları
          </h2>
        </div>
        <p className="mt-4 text-sm leading-relaxed text-stone-300">
          Mesafeli Sözleşmeler Yönetmeliği&apos;nin 15. maddesi uyarınca; <em>&quot;Tüketicinin istekleri veya kişisel ihtiyaçları doğrultusunda hazırlanan mallara ilişkin sözleşmeler&quot;</em> ve <em>&quot;Elektronik ortamda anında ifa edilen hizmetler veya tüketiciye anında teslim edilen gayrimaddi mallara ilişkin sözleşmeler&quot;</em> cayma hakkının istisnaları arasında yer almaktadır.
        </p>
        <p className="mt-3 text-xs leading-relaxed text-amber-300/90 font-medium bg-amber-500/10 p-3 rounded-lg border border-amber-500/20">
          Alıcı, işbu sözleşmeyi onaylayarak kişiye ve markaya özel olarak tasarlanan/kodlanan yazılımlarda ve canlı sunucuya kurulan dijital hizmetlerde cayma hakkının bulunmadığını peşinen kabul ve beyan eder.
        </p>
      </section>

      {/* Madde 6: Fikri Mülkiyet ve Lisans */}
      <section className="rounded-2xl border border-white/10 bg-[#0d121f]/70 p-6 sm:p-8 backdrop-blur-sm">
        <div className="flex items-center gap-3 text-amber-400">
          <Award className="h-5 w-5" />
          <h2 className="text-lg font-bold text-white sm:text-xl">
            Madde 6 — Fikri Mülkiyet Hakları ve Kaynak Kod Lisansı
          </h2>
        </div>
        <p className="mt-4 text-sm leading-relaxed text-stone-300">
          5846 sayılı Fikir ve Sanat Eserleri Kanunu (&quot;FSEK&quot;) kapsamında:
        </p>
        <ul className="mt-3 space-y-2 text-xs text-stone-300 list-disc pl-5 leading-relaxed">
          <li>
            Sözleşme bedelinin tamamının ödenmesi kaydıyla, projeye özel olarak üretilen tasarım arayüzleri, CSS/HTML şablonları ve müşteriye teslim edilen özel kaynak kodlarının kullanım ve işletme hakları süresiz olarak Alıcı&apos;ya devreder.
          </li>
          <li>
            Hizmet Sağlayıcı&apos;nın önceden geliştirdiği temel kütüphaneler, framework çekirdekleri veya üçüncü taraf açık kaynak yazılımlar (MIT, Apache vb.) kendi özgün lisans koşullarına tabidir.
          </li>
          <li>
            Hizmet Sağlayıcı, teslim edilen projeyi tanıtım ve portfolyo amacıyla referans olarak gösterme hakkını saklı tutar.
          </li>
        </ul>
      </section>

      {/* Madde 7: Gizlilik ve Ticari Sır */}
      <section className="rounded-2xl border border-white/10 bg-[#0d121f]/70 p-6 sm:p-8 backdrop-blur-sm">
        <div className="flex items-center gap-3 text-amber-400">
          <Lock className="h-5 w-5" />
          <h2 className="text-lg font-bold text-white sm:text-xl">
            Madde 7 — Gizlilik ve Sır Saklama Yükümlülüğü
          </h2>
        </div>
        <p className="mt-4 text-sm leading-relaxed text-stone-300">
          Taraflar, sözleşmenin ifası sırasında birbirlerine ait edindikleri her türlü ticari, mali, teknik,
          müşteri verisi ve kaynak kod bilgisini gizli tutmayı, yasal zorunluluklar hariç üçüncü taraflarla
          paylaşmamayı taahhüt ederler. Bu yükümlülük sözleşmenin sona ermesinden sonra da 3 yıl boyunca geçerlidir.
        </p>
      </section>

      {/* Madde 8: Uyuşmazlıklar ve Yetkili Mahkeme */}
      <section className="rounded-2xl border border-white/10 bg-[#0d121f]/70 p-6 sm:p-8 backdrop-blur-sm">
        <div className="flex items-center gap-3 text-amber-400">
          <Scale className="h-5 w-5" />
          <h2 className="text-lg font-bold text-white sm:text-xl">
            Madde 8 — Uyuşmazlıkların Çözümü ve Yetkili Yargı Yeri
          </h2>
        </div>
        <p className="mt-4 text-sm leading-relaxed text-stone-300">
          İşbu Sözleşmenin uygulanmasından ve yorumlanmasından doğabilecek uyuşmazlıklarda Türk Hukuku uygulanır.
          Ticaret Bakanlığı&apos;nca her yıl ilan edilen parasal sınırlar dahilinde Alıcı&apos;nın yerleşim yerindeki veya
          tüketici işleminin yapıldığı yerdeki <strong>Tüketici Hakem Heyetleri</strong> veya <strong>Tüketici Mahkemeleri</strong>;
          ticari nitelikteki uyuşmazlıklarda ise <strong>İstanbul (Çağlayan) Mahkemeleri ve İcra Daireleri</strong> münhasıran yetkilidir.
        </p>
      </section>
    </LegalPageLayout>
  )
}
