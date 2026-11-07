import type { Metadata } from 'next'
import LegalPageLayout from '@/components/LegalPageLayout'
import siteConfig from '@/config/siteConfig'
import {
  ShieldCheck,
  Lock,
  Database,
  UserCheck,
  Scale,
  Clock,
  Send,
  AlertCircle,
  FileText,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Gizlilik Politikası ve KVKK Aydınlatma Metni | MESE SYSTEM',
  description:
    'MESE SYSTEM kişisel verilerin korunması politikası, 6698 sayılı KVKK uyarınca aydınlatma metni, veri işleme amaçları ve ilgili kişi hakları.',
  keywords: [
    'gizlilik politikası',
    'KVKK aydınlatma metni',
    'MESE SYSTEM gizlilik',
    'MESE SYSTEM KVKK',
    'veri güvenliği',
    'kişisel verilerin korunması',
  ],
  openGraph: {
    title: 'Gizlilik Politikası ve KVKK Aydınlatma Metni | MESE SYSTEM',
    description:
      '6698 sayılı KVKK uyarınca veri sorumlusu aydınlatma metni, işleme amaçları, hukuki sebepler ve ilgili kişi hakları.',
    type: 'article',
    locale: 'tr_TR',
  },
}

export default function PrivacyAndKvkkPage() {
  return (
    <LegalPageLayout
      title="Gizlilik Politikası ve KVKK Aydınlatma Metni"
      subtitle="Kişisel verilerinizin mahremiyeti ve güvenliği temel önceliğimizdir. 6698 sayılı KVKK uyarınca veri sorumlusu sıfatıyla aydınlatma yükümlülüğümüzü eksiksiz yerine getiriyoruz."
      badgeText="KVKK & Gizlilik Bildirimi"
      readingTime="6 dk okuma"
      currentPath="/gizlilik-politikasi"
      legislation="6698 Sayılı KVKK · RG: 07.04.2016 / 29677"
    >
      {/* 1. Veri Sorumlusu Bilgilendirmesi */}
      <section className="rounded-2xl border border-white/10 bg-[#0d121f]/70 p-6 sm:p-8 backdrop-blur-sm">
        <div className="flex items-center gap-3 text-amber-400">
          <ShieldCheck className="h-5 w-5" />
          <h2 className="text-lg font-bold text-white sm:text-xl">
            1. Veri Sorumlusunun Kimliği
          </h2>
        </div>
        <p className="mt-4 text-sm leading-relaxed text-stone-300">
          6698 sayılı Kişisel Verilerin Korunması Kanunu (&quot;KVKK&quot;) ve ilgili ikincil mevzuat
          uyarınca, kişisel verileriniz veri sorumlusu sıfatıyla <strong>ŞEYHMUS MEŞE YAZILIM MÜHENDİSİ (MESE SYSTEM)</strong> (&quot;Şirket&quot;
          veya &quot;Stüdyo&quot;) tarafından aşağıda açıklanan kapsamda, hukuka ve dürüstlük kurallarına uygun şekilde işlenmektedir.
        </p>

        <div className="mt-5 grid gap-3 rounded-xl border border-white/5 bg-black/40 p-4 text-xs sm:grid-cols-2">
          <div>
            <span className="text-stone-400">Veri Sorumlusu Unvanı:</span>
            <p className="font-semibold text-white mt-0.5">ŞEYHMUS MEŞE YAZILIM MÜHENDİSİ</p>
          </div>
          <div>
            <span className="text-stone-400">İletişim E-Posta:</span>
            <p className="font-mono text-amber-400 mt-0.5">{siteConfig.contact.email}</p>
          </div>
          <div>
            <span className="text-stone-400">İletişim / WhatsApp:</span>
            <p className="font-mono text-stone-200 mt-0.5">{siteConfig.contact.phone}</p>
          </div>
          <div>
            <span className="text-stone-400">Faaliyet Merkezi:</span>
            <p className="text-stone-200 mt-0.5">{siteConfig.contact.address || 'İstanbul, Türkiye'}</p>
          </div>
        </div>
      </section>

      {/* 2. Toplanan Kişisel Veri Kategorileri */}
      <section className="rounded-2xl border border-white/10 bg-[#0d121f]/70 p-6 sm:p-8 backdrop-blur-sm">
        <div className="flex items-center gap-3 text-amber-400">
          <Database className="h-5 w-5" />
          <h2 className="text-lg font-bold text-white sm:text-xl">
            2. İşlenen Kişisel Veri Kategorileri
          </h2>
        </div>
        <p className="mt-4 text-sm leading-relaxed text-stone-300">
          Platformumuz, teklif hesaplayıcımız, WhatsApp destek hattımız veya doğrudan sözleşme ilişkisi
          aracılığıyla tarafımızca işlenen kişisel veriler aşağıdaki kategoriler altında toplanmaktadır:
        </p>

        <div className="mt-6 space-y-3">
          <div className="rounded-xl border border-white/5 bg-black/30 p-4">
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider">
              A. Kimlik Bilgileri
            </h3>
            <p className="mt-1.5 text-xs text-stone-400 leading-relaxed">
              Ad, soyad, unvan, vergi kimlik numarası veya T.C. kimlik numarası (yalnızca resmi faturalandırma ve sözleşme zorunluluğunda talep edilir).
            </p>
          </div>

          <div className="rounded-xl border border-white/5 bg-black/30 p-4">
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider">
              B. İletişim Bilgileri
            </h3>
            <p className="mt-1.5 text-xs text-stone-400 leading-relaxed">
              Telefon numarası, e-posta adresi, kurumsal veya ikamet adresi, WhatsApp kullanıcı kimliği.
            </p>
          </div>

          <div className="rounded-xl border border-white/5 bg-black/30 p-4">
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider">
              C. Müşteri İşlem ve Proje Verileri
            </h3>
            <p className="mt-1.5 text-xs text-stone-400 leading-relaxed">
              Seçilen hizmet türü (portfolyo, kurumsal web, e-ticaret, özel panel, mobil uygulama), ek özellik tercihleri,
              tahmini bütçe aralığı, proje gereksinim dokümanları, kaynak kod ve tasarım revizyon notları.
            </p>
          </div>

          <div className="rounded-xl border border-white/5 bg-black/30 p-4">
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider">
              D. İşlem Güvenliği ve Teknik Veriler
            </h3>
            <p className="mt-1.5 text-xs text-stone-400 leading-relaxed">
              IP adresi, tarayıcı bilgisi (User-Agent), sunucu erişim logları, çerez kayıtları, yönlendirici kaynak (Referrer) ve oturum verileri.
            </p>
          </div>

          <div className="rounded-xl border border-white/5 bg-black/30 p-4">
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider">
              E. Finansal ve Ödeme Bilgileri
            </h3>
            <p className="mt-1.5 text-xs text-stone-400 leading-relaxed">
              Banka havalesi dekont referansı, fatura teslim bilgileri. <strong>Kredi kartı numarası ve CVV bilgileri stüdyomuz sunucularında kesinlikle saklanmaz;</strong> tüm kart işlemleri PCI-DSS uyumlu lisanslı ödeme geçitleri (Mastercard/Visa) üzerinden uçtan uca şifreli olarak yürütülür.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Veri İşleme Amaçları ve Hukuki Sebepler */}
      <section className="rounded-2xl border border-white/10 bg-[#0d121f]/70 p-6 sm:p-8 backdrop-blur-sm">
        <div className="flex items-center gap-3 text-amber-400">
          <Scale className="h-5 w-5" />
          <h2 className="text-lg font-bold text-white sm:text-xl">
            3. Kişisel Verilerin İşlenme Amaçları ve Hukuki Sebepleri
          </h2>
        </div>
        <p className="mt-4 text-sm leading-relaxed text-stone-300">
          Kişisel verileriniz, KVKK&apos;nın 5. ve 6. maddelerinde belirtilen kişisel veri işleme şartları dahilinde,
          aşağıdaki amaç ve hukuki dayanaklarla işlenmektedir:
        </p>

        <ul className="mt-4 space-y-3 text-xs leading-relaxed text-stone-300">
          <li className="flex items-start gap-2.5">
            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0" />
            <div>
              <strong className="text-white">Sözleşmenin Kurulması ve İfası (KVKK m.5/2-c):</strong> Özel web yazılımı,
              mobil uygulama, web tasarımı ve bakım aboneliği hizmetlerinin sunulması; teklif hesaplayıcı girdilerinden teklif üretilmesi;
              canlı demo ortamlarının tahsis edilmesi.
            </div>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0" />
            <div>
              <strong className="text-white">Kanuni Yükümlülüklerin İfası (KVKK m.5/2-ç):</strong> 213 sayılı Vergi Usul Kanunu,
              6102 sayılı Türk Ticaret Kanunu, 5651 sayılı İnternet Ortamında Yapılan Yayınların Düzenlenmesi Kanunu ve
              6502 sayılı Tüketicinin Korunması Hakkında Kanun uyarınca faturalandırma ve log saklama zorunlulukları.
            </div>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0" />
            <div>
              <strong className="text-white">Meşru Menfaat (KVKK m.5/2-f):</strong> Temel hak ve özgürlüklerinize zarar vermemek
              kaydıyla, sistem altyapımızın siber güvenliğinin sağlanması, hizmet kalitesinin artırılması ve müşteri memnuniyetinin takibi.
            </div>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0" />
            <div>
              <strong className="text-white">Açık Rıza (KVKK m.5/1):</strong> Analitik çerezler (Microsoft Clarity, performans ölçümleri)
              ve isteğe bağlı pazarlama anketleri yalnızca ziyaretçinin açık rıza onayı vermesi halinde yürütülür.
            </div>
          </li>
        </ul>
      </section>

      {/* 4. Veri Aktarımı */}
      <section className="rounded-2xl border border-white/10 bg-[#0d121f]/70 p-6 sm:p-8 backdrop-blur-sm">
        <div className="flex items-center gap-3 text-amber-400">
          <Send className="h-5 w-5" />
          <h2 className="text-lg font-bold text-white sm:text-xl">
            4. Kişisel Verilerin Aktarılması
          </h2>
        </div>
        <p className="mt-4 text-sm leading-relaxed text-stone-300">
          Kişisel verileriniz üçüncü kişilere asla satılmaz veya yetkisiz şekilde paylaşılmaz. Yalnızca
          hizmetin gereği olarak ve KVKK&apos;nın 8. ve 9. maddeleri uyarınca aşağıdaki taraflara aktarılabilir:
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 text-xs">
          <div className="rounded-xl border border-white/5 bg-black/30 p-4">
            <h4 className="font-semibold text-white">Ödeme ve Finans Kuruluşları</h4>
            <p className="mt-1 text-stone-400">
              Online kartla ödeme süreçlerinde BDDK lisanslı ödeme altyapıları ve bankalar (Mastercard/Visa 3D Secure güvencesi).
            </p>
          </div>
          <div className="rounded-xl border border-white/5 bg-black/30 p-4">
            <h4 className="font-semibold text-white">Bulut ve Barındırma Sağlayıcıları</h4>
            <p className="mt-1 text-stone-400">
              Uluslararası ISO 27001 güvenlik sertifikalı güvenli bulut barındırma ve sunucu altyapıları (Vercel, AWS, Cloudflare).
            </p>
          </div>
          <div className="rounded-xl border border-white/5 bg-black/30 p-4">
            <h4 className="font-semibold text-white">Yasal ve Resmi Merciler</h4>
            <p className="mt-1 text-stone-400">
              Mahkemeler, icra daireleri, Gelir İdaresi Başkanlığı ve yetkili kamu otoritelerinin bağlayıcı yasal talepleri.
            </p>
          </div>
          <div className="rounded-xl border border-white/5 bg-black/30 p-4">
            <h4 className="font-semibold text-white">Mali ve Hukuki Danışmanlar</h4>
            <p className="mt-1 text-stone-400">
              Mali müşavirler, denetçiler ve avukatlar (sır saklama yükümlülüğü altında ve yasal zorunluluk sınırlarında).
            </p>
          </div>
        </div>
      </section>

      {/* 5. Veri Güvenliği Önlemleri */}
      <section className="rounded-2xl border border-white/10 bg-[#0d121f]/70 p-6 sm:p-8 backdrop-blur-sm">
        <div className="flex items-center gap-3 text-amber-400">
          <Lock className="h-5 w-5" />
          <h2 className="text-lg font-bold text-white sm:text-xl">
            5. Veri Güvenliği ve Koruma Tedbirleri
          </h2>
        </div>
        <p className="mt-4 text-sm leading-relaxed text-stone-300">
          MESE SYSTEM, kişisel verilerin hukuka aykırı işlenmesini, erişilmesini
          ve kaybolmasını engellemek amacıyla KVKK&apos;nın 12. maddesi kapsamında gerekli teknik ve idari tedbirleri almaktadır:
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-3 text-xs">
          <div className="rounded-xl border border-white/5 bg-black/30 p-3.5">
            <span className="font-mono text-amber-400 font-bold block mb-1">256-Bit SSL/TLS</span>
            <span className="text-stone-400">
              Tüm web trafiği modern HSTS ve TLS 1.3 şifrelemesiyle korunur.
            </span>
          </div>
          <div className="rounded-xl border border-white/5 bg-black/30 p-3.5">
            <span className="font-mono text-amber-400 font-bold block mb-1">Erişim Yetki Matrisi</span>
            <span className="text-stone-400">
              Verilere yalnızca &quot;bilmesi gereken prensibi&quot; ile yetkili teknik personel erişebilir.
            </span>
          </div>
          <div className="rounded-xl border border-white/5 bg-black/30 p-3.5">
            <span className="font-mono text-amber-400 font-bold block mb-1">Siber Güvenlik & Loglama</span>
            <span className="text-stone-400">
              DDoS koruması, web application firewall (WAF) ve denetim logları devrededir.
            </span>
          </div>
        </div>
      </section>

      {/* 6. Saklama ve İmha Süresi */}
      <section className="rounded-2xl border border-white/10 bg-[#0d121f]/70 p-6 sm:p-8 backdrop-blur-sm">
        <div className="flex items-center gap-3 text-amber-400">
          <Clock className="h-5 w-5" />
          <h2 className="text-lg font-bold text-white sm:text-xl">
            6. Saklama Süreleri ve İmha Politikası
          </h2>
        </div>
        <p className="mt-4 text-sm leading-relaxed text-stone-300">
          Kişisel verileriniz, işlenme amacının gerektirdiği süre boyunca ve ilgili yasal mevzuatta öngörülen
          zamanaşımı süreleri dahilinde saklanır:
        </p>
        <ul className="mt-3 space-y-2 text-xs text-stone-400 list-disc pl-5">
          <li>
            <strong className="text-stone-200">Sözleşme ve Finansal Kayıtlar:</strong> Türk Ticaret Kanunu ve Vergi Usul Kanunu uyarınca 10 yıl.
          </li>
          <li>
            <strong className="text-stone-200">Teklif ve Talep İletişim Verileri:</strong> Sözleşmeye dönüşmeyen teklif talepleri en geç 2 yıl içinde silinir veya anonimleştirilir.
          </li>
          <li>
            <strong className="text-stone-200">Teknik Erişim Logları:</strong> 5651 sayılı Kanun uyarınca en az 2 yıl boyunca saklanır.
          </li>
        </ul>
      </section>

      {/* 7. KVKK AYDINLATMA METNİ & MADDE 11 HAKLARI (#kvkk anchor) */}
      <section
        id="kvkk"
        className="scroll-mt-28 rounded-2xl border-2 border-amber-500/30 bg-gradient-to-b from-[#111728] to-[#0a0f1d] p-6 sm:p-8 shadow-2xl"
      >
        <div className="flex items-center justify-between gap-4 border-b border-amber-500/20 pb-4">
          <div className="flex items-center gap-3">
            <UserCheck className="h-6 w-6 text-amber-400" />
            <div>
              <span className="text-[11px] font-mono uppercase tracking-widest text-amber-400 font-semibold">
                6698 Sayılı Kanun Madde 11
              </span>
              <h2 className="text-xl font-bold text-white">KVKK Aydınlatma Metni & İlgili Kişi Hakları</h2>
            </div>
          </div>
          <span className="rounded bg-amber-500/20 px-2.5 py-1 text-[11px] font-mono text-amber-300 border border-amber-500/30">
            #kvkk
          </span>
        </div>

        <p className="mt-5 text-sm leading-relaxed text-stone-200">
          KVKK&apos;nın 11. maddesi uyarınca, kişisel veri sahipleri (&quot;İlgili Kişi&quot;) veri sorumlusu olan
          <strong> ŞEYHMUS MEŞE YAZILIM MÜHENDİSİ (MESE SYSTEM)</strong>&apos;ne başvurarak aşağıdaki haklarını kullanabilirler:
        </p>

        <div className="mt-6 grid gap-2.5 sm:grid-cols-2 text-xs">
          <div className="rounded-lg border border-white/5 bg-black/30 p-3 flex items-start gap-2">
            <span className="text-amber-400 font-bold shrink-0">a)</span>
            <span>Kişisel verilerinizin işlenip işlenmediğini öğrenme,</span>
          </div>
          <div className="rounded-lg border border-white/5 bg-black/30 p-3 flex items-start gap-2">
            <span className="text-amber-400 font-bold shrink-0">b)</span>
            <span>Kişisel verileriniz işlenmişse buna ilişkin bilgi talep etme,</span>
          </div>
          <div className="rounded-lg border border-white/5 bg-black/30 p-3 flex items-start gap-2">
            <span className="text-amber-400 font-bold shrink-0">c)</span>
            <span>Kişisel verilerin işlenme amacını ve bunların amacına uygun kullanılıp kullanılmadığını öğrenme,</span>
          </div>
          <div className="rounded-lg border border-white/5 bg-black/30 p-3 flex items-start gap-2">
            <span className="text-amber-400 font-bold shrink-0">ç)</span>
            <span>Yurt içinde veya yurt dışında kişisel verilerin aktarıldığı üçüncü kişileri bilme,</span>
          </div>
          <div className="rounded-lg border border-white/5 bg-black/30 p-3 flex items-start gap-2">
            <span className="text-amber-400 font-bold shrink-0">d)</span>
            <span>Kişisel verilerin eksik veya yanlış işlenmiş olması hâlinde bunların düzeltilmesini isteme,</span>
          </div>
          <div className="rounded-lg border border-white/5 bg-black/30 p-3 flex items-start gap-2">
            <span className="text-amber-400 font-bold shrink-0">e)</span>
            <span>KVKK 7. maddede öngörülen şartlar çerçevesinde kişisel verilerin silinmesini veya yok edilmesini isteme,</span>
          </div>
          <div className="rounded-lg border border-white/5 bg-black/30 p-3 flex items-start gap-2">
            <span className="text-amber-400 font-bold shrink-0">f)</span>
            <span>Düzeltme ve silme işlemlerinin verilerin aktarıldığı üçüncü kişilere bildirilmesini isteme,</span>
          </div>
          <div className="rounded-lg border border-white/5 bg-black/30 p-3 flex items-start gap-2">
            <span className="text-amber-400 font-bold shrink-0">g)</span>
            <span>İşlenen verilerin münhasıran otomatik sistemler vasıtasıyla analiz edilmesi suretiyle aleyhinize bir sonucun ortaya çıkmasına itiraz etme,</span>
          </div>
          <div className="rounded-lg border border-white/5 bg-black/30 p-3 flex items-start gap-2 sm:col-span-2">
            <span className="text-amber-400 font-bold shrink-0">ğ)</span>
            <span>Kişisel verilerin kanuna aykırı olarak işlenmesi sebebiyle zarara uğramanız hâlinde zararın giderilmesini talep etme.</span>
          </div>
        </div>

        {/* Başvuru Usulü */}
        <div className="mt-8 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 sm:p-5">
          <div className="flex items-center gap-2 text-amber-300 font-semibold text-xs uppercase tracking-wider">
            <AlertCircle className="h-4 w-4" />
            <span>Başvuru Usulü ve Yanıtlama</span>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-stone-300">
            Yukarıda belirtilen haklarınızı kullanmak için kimliğinizi tespit edici belgeler ile birlikte
            talebinizi içeren dilekçenizi <strong>{siteConfig.contact.email}</strong> adresine kayıtlı e-posta adresinizden
            veya güvenli elektronik imzalı olarak iletebilirsiniz. Başvurularınız, KVKK&apos;nın 13. maddesi uyarınca
            talebin niteliğine göre en kısa sürede ve en geç <strong>30 (otuz) gün içinde ücretsiz</strong> olarak sonuçlandırılacaktır.
          </p>
        </div>
      </section>
    </LegalPageLayout>
  )
}
