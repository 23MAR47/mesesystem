export type PortfolioFilter =
  | 'Hizmet & Randevu'
  | 'E-Ticaret & Menü'
  | 'Teknik Servis'
  | 'Konaklama & Yapı'
  | 'Kurumsal & Danışmanlık'

export interface PortfolioProject {
  id: string
  name: string
  category: PortfolioFilter
  label: string
  subtitle: string
  description: string
  href: string
  previewImage?: string
}

export const PORTFOLIO_FILTERS: PortfolioFilter[] = [
  'Hizmet & Randevu',
  'E-Ticaret & Menü',
  'Teknik Servis',
  'Konaklama & Yapı',
  'Kurumsal & Danışmanlık',
]

export const PORTFOLIO_PROJECTS: PortfolioProject[] = [
  {
    id: 'berber',
    name: 'Keskin Hat',
    category: 'Hizmet & Randevu',
    label: 'Berber',
    subtitle: 'Berber ve Randevu Sistemi',
    description:
      'Hizmet listesi, usta seçimi, şeffaf fiyatlandırma ve anlık online randevu talebi sunan modern berber sitesi.',
    href: '/showcases/berber/index.html',
    previewImage: '/projects/berber.jpg',
  },
  {
    id: 'emlak',
    name: 'Aralık Emlak',
    category: 'Konaklama & Yapı',
    label: 'Emlak',
    subtitle: 'Emlak ve İlan Platformu',
    description:
      'Filtrelenebilir portföy, detaylı ilan sayfaları, konum haritası ve doğrudan WhatsApp üzerinden danışman iletişim akışı.',
    href: '/showcases/emlak/index.html',
    previewImage: '/projects/emlak.jpg',
  },
  {
    id: 'qr-menu',
    name: 'Yosun Restoran',
    category: 'E-Ticaret & Menü',
    label: 'Restoran',
    subtitle: 'Restoran ve Dijital QR Menü',
    description:
      'Masa başında hızlı sipariş, alerjen uyarıları, kategori filtreleri ve görsel ağırlıklı dijital restoran menüsü.',
    href: '/showcases/qr-menu/index.html',
    previewImage: '/projects/qr-menu.jpg',
  },
  {
    id: 'kuafor',
    name: 'Doku Kuaför',
    category: 'Hizmet & Randevu',
    label: 'Kuaför',
    subtitle: 'Kuaför ve Saç Tasarım Stüdyosu',
    description:
      'Saç bakım paketleri, stil seçkisi, uzman kadro profilleri ve çalışma saatlerine göre akıllı randevu takvimi.',
    href: '/showcases/kuafor/index.html',
    previewImage: '/projects/kuafor.jpg',
  },
  {
    id: 'guzellik-salonu',
    name: 'Nilüfer Oda',
    category: 'Hizmet & Randevu',
    label: 'Güzellik',
    subtitle: 'Güzellik ve Kişisel Bakım Salonu',
    description:
      'Cilt bakımı, tırnak tasarımı ve masaj hizmetleri için paket karşılaştırma ve seans rezervasyonu sağlayan vitrin.',
    href: '/showcases/guzellik-salonu/index.html',
    previewImage: '/projects/guzellik-salonu.jpg',
  },
  {
    id: 'otel',
    name: 'Yamaç Konak',
    category: 'Konaklama & Yapı',
    label: 'Otel',
    subtitle: 'Butik Otel ve Konaklama',
    description:
      'Oda türleri, manzara seçenekleri, sezonluk fiyat tablosu ve hızlı rezervasyon talebi oluşturan otel tanıtım sitesi.',
    href: '/showcases/otel/index.html',
    previewImage: '/projects/otel.jpg',
  },
  {
    id: 'oto-servis',
    name: 'Vites Atölye',
    category: 'Teknik Servis',
    label: 'Oto Servis',
    subtitle: 'Oto Servis ve Periyodik Bakım',
    description:
      'Periyodik bakım paketleri, şeffaf arıza tespit adımları ve plaka bazlı online servis randevu formu.',
    href: '/showcases/oto-servis/index.html',
    previewImage: '/projects/oto-servis.jpg',
  },
  {
    id: 'market',
    name: 'Aralık Market',
    category: 'E-Ticaret & Menü',
    label: 'Market',
    subtitle: 'Online Market ve Hızlı Teslimat',
    description:
      'Hızlı ürün arama, reyon filtreleri, sepet yönetimi ve aynı gün adrese teslimat sipariş akışı.',
    href: '/showcases/market/index.html',
    previewImage: '/projects/market.jpg',
  },
  {
    id: 'kuruyemis',
    name: 'Çıtır & Çekirdek',
    category: 'E-Ticaret & Menü',
    label: 'E-Ticaret',
    subtitle: 'Kuruyemiş ve Gurme Lezzetler',
    description:
      'Gramaj seçimi, taze kavrulmuş ürün kataloğu ve Türkiye geneli kargo entegrasyonuna hazır online sipariş sitesi.',
    href: '/showcases/kuruyemis/index.html',
    previewImage: '/projects/kuruyemis.jpg',
  },
  {
    id: 'insaat',
    name: 'Hat Çizgisi',
    category: 'Konaklama & Yapı',
    label: 'İnşaat',
    subtitle: 'Mimarlık ve İnşaat Portföyü',
    description:
      'Devam eden ve tamamlanan projeler için yüksek çözünürlüklü fotoğraf galerisi, kat planları ve kurumsal künye.',
    href: '/showcases/insaat/index.html',
    previewImage: '/projects/insaat.jpg',
  },
  {
    id: 'elektrikci',
    name: 'Akım Elektrik',
    category: 'Teknik Servis',
    label: 'Elektrik',
    subtitle: 'Elektrikçi ve Saha Hizmeti',
    description:
      '7/24 acil arıza servisi, aydınlatma ve kompanzasyon projeleri için tek tıkla doğrudan keşif çağrı akışı.',
    href: '/showcases/elektrikci/index.html',
    previewImage: '/projects/elektrikci.jpg',
  },
  {
    id: 'tesisatci',
    name: 'İyi Akış Tesisat',
    category: 'Teknik Servis',
    label: 'Tesisat',
    subtitle: 'Sıhhi Tesisat ve Servis',
    description:
      'Tıkanıklık açma, petek temizliği ve kaçak tespiti için acil servis butonları ve şeffaf işçilik garantisi.',
    href: '/showcases/tesisatci/index.html',
    previewImage: '/projects/tesisatci.jpg',
  },
  {
    id: 'rent-a-car',
    name: 'Rota Araç Kiralama',
    category: 'Hizmet & Randevu',
    label: 'Rent a Car',
    subtitle: 'Araç Kiralama ve Rezervasyon',
    description:
      'Geniş araç filosu, tarih ve lokasyon seçimi, kasko paketleri ve anında rezervasyon ön onayı sunan araç kiralama sitesi.',
    href: '/showcases/rent-a-car/index.html',
    previewImage: '/projects/rent-a-car.jpg',
  },
  {
    id: 'dis-klinigi',
    name: 'İnci Diş Polikliniği',
    category: 'Hizmet & Randevu',
    label: 'Diş Kliniği',
    subtitle: 'Diş Kliniği ve Online Randevu Sistemi',
    description:
      'Hekim kadrosu, implant/estetik diş hizmetleri ve online randevu sistemi sunan kurumsal diş sağlığı vitrini.',
    href: '/showcases/dis-klinigi/index.html',
    previewImage: '/projects/dis-klinigi.jpg',
  },
  {
    id: 'hukuk-burosu',
    name: 'Adalet Hukuk Bürosu',
    category: 'Kurumsal & Danışmanlık',
    label: 'Hukuk',
    subtitle: 'Hukuk Bürosu ve Dava Danışmanlığı',
    description:
      'Dava ve uzmanlık alanları, kurumsal danışmanlık talep formu ve mevzuat rehberi sunan saygın avukatlık vitrini.',
    href: '/showcases/hukuk-burosu/index.html',
    previewImage: '/projects/hukuk-burosu.jpg',
  },
  {
    id: 'mali-musavir',
    name: 'Denge Mali Müşavirlik',
    category: 'Kurumsal & Danışmanlık',
    label: 'Mali Müşavir',
    subtitle: 'Mali Müşavirlik ve Vergi Danışmanlığı',
    description:
      'Şirket kuruluş maliyet hesaplayıcısı, vergi takvimi ve online ön görüşme randevusu sağlayan finansal çözüm platformu.',
    href: '/showcases/mali-musavir/index.html',
    previewImage: '/projects/mali-musavir.jpg',
  },
  {
    id: 'fitness',
    name: 'Dinamik Pilates & Fitness',
    category: 'Hizmet & Randevu',
    label: 'Fitness & Pilates',
    subtitle: 'Pilates ve Kişisel Antrenman Stüdyosu',
    description:
      'Birebir reformer pilates, haftalık grup ders takvimi ve ücretsiz deneme seansı rezervasyonu içeren stüdyo sitesi.',
    href: '/showcases/fitness/index.html',
    previewImage: '/projects/fitness.jpg',
  },
  {
    id: 'temizlik',
    name: 'Pırıltı Profesyonel Temizlik',
    category: 'Teknik Servis',
    label: 'Temizlik',
    subtitle: 'Kurumsal Temizlik ve Halı Yıkama Servisi',
    description:
      'Ev/ofis temizliği, m² ve oda bazlı anlık fiyat teklif motoru ve hızlı servis talep akışı sunan temizlik sitesi.',
    href: '/showcases/temizlik/index.html',
    previewImage: '/projects/temizlik.jpg',
  },
  {
    id: 'fotografci',
    name: 'Vizyon Fotoğraf & Prodüksiyon',
    category: 'Hizmet & Randevu',
    label: 'Fotoğrafçılık',
    subtitle: 'Fotoğraf Stüdyosu ve Video Prodüksiyon',
    description:
      'Düğün, moda ve ürün çekimi, etkileşimli filtreli fotoğraf galerisi ve stüdyo rezervasyon formu sunan kreatif vitrin.',
    href: '/showcases/fotografci/index.html',
    previewImage: '/projects/fotografci.jpg',
  },
]

export const FEATURED_PROJECT_IDS = [
  'berber',
  'emlak',
  'qr-menu',
  'otel',
  'kuafor',
  'market',
]

export const DEMO_PROJECTS = PORTFOLIO_PROJECTS.map((project) => ({
  id: project.id,
  name: project.name,
  category: project.label,
  subtitle: project.subtitle,
  description: project.description,
  href: project.href,
  previewImage: `/projects/${project.id}-mobile.jpg`,
}))

export const SERVICES = [
  {
    title: 'Web sitesi',
    description:
      "İşletmenizi doğru anlatan, telefonda hızlı açılan ve Google'da bulunabilen bir site. Tasarımı markanıza göre sıfırdan yapıyoruz.",
    points: [
      'Size özel tasarım, hazır şablon yok',
      'Telefonda hızlı ve kolay kullanım',
      'Google için temel SEO kurulumu',
    ],
    message: 'İşletmem için web sitesi yaptırmak istiyorum.',
  },
  {
    title: 'E-ticaret sitesi',
    description:
      'Ürünlerinizi listeleyip kartla satış yapabileceğiniz, kendi yönettiğiniz bir mağaza.',
    points: [
      'iyzico / PayTR ile güvenli ödeme',
      'Stok, sipariş ve kargo takibi',
      'Ürünleri kendiniz ekleyip düzenleme',
    ],
    message: 'E-ticaret sitesi yaptırmak istiyorum.',
  },
  {
    title: 'Mobil uygulama',
    description:
      'Müşterilerinizin telefonuna kuracağı iOS ve Android uygulaması; randevu, sipariş ya da sadakat için.',
    points: [
      'App Store ve Google Play’de yayın',
      'Bildirim, randevu, sipariş özellikleri',
      'iOS ve Android tek seferde',
    ],
    message: 'Mobil uygulama yaptırmak istiyorum.',
  },
  {
    title: 'Özel yazılım ve yönetim paneli',
    description:
      'Randevu, müşteri takibi, teklif, stok gibi işlerinizi tek yerden yürüttüğünüz, size özel web yazılımı.',
    points: [
      'İşinize göre tasarlanan ekranlar',
      'Excel ve kâğıt yerine tek panel',
      'İsterseniz yapay zekâ destekli özellikler',
    ],
    message: 'İşletmem için özel yazılım / yönetim paneli yaptırmak istiyorum.',
  },
]

export const PROCESS_STEPS = [
  {
    title: 'Önce sizi dinliyoruz',
    description:
      'İşinizi, müşterilerinizi ve ihtiyacınızı konuşuyor; kapsamı, takvimi ve bütçeyi netleştiriyoruz.',
  },
  {
    title: 'Size özel demo hazırlıyoruz',
    description:
      'Sayfa yapısını ve tasarımı hazırlayıp gösteriyoruz; geri bildirimlerinizle son haline getiriyoruz.',
  },
  {
    title: 'Geliştirip test ediyoruz',
    description:
      'Onaylanan tasarımı kodluyor; telefon, tablet ve bilgisayarda formları ve akışları tek tek deniyoruz.',
  },
  {
    title: 'Yayına alıyoruz',
    description:
      'Alan adını bağlıyor, siteyi yayına alıyor ve nasıl kullanacağınızı gösteriyoruz. Sonrasında da yanınızdayız.',
  },
]

export const PROCESS_BENEFITS = [
  {
    title: 'Markanızdan başlayan tasarım',
    description: 'Renk, yazı ve sayfa akışı işinize ve müşterinize göre; hazır şablon yok.',
  },
  {
    title: 'Önce telefon',
    description:
      'Müşterilerinizin çoğu telefondan bakar; her ekranı önce telefonda düşünüyoruz.',
  },
  {
    title: "Google'da bulunmak için",
    description: 'Sayfa başlıkları, açıklamalar, site haritası ve hız teslimin parçası.',
  },
  {
    title: 'İşinize yarayan özellikler',
    description: 'Randevu, ürün kataloğu, yönetim paneli; ihtiyacı birlikte belirliyoruz.',
  },
]

export const FAQS = [
  {
    question: 'Bir web sitesi ne kadar tutar?',
    answer:
      'Başlangıç fiyatları: Kişisel / portfolyo sitesi 9.000 ₺, Kurumsal web sitesi 9.000 ₺, E-ticaret sitesi 40.000 ₺, Özel web yazılımı / panel 50.000 ₺, Mobil uygulama (iOS + Android) 50.000 ₺. Orta kapsam +5.000 ₺, geniş kapsam +10.000 ₺; yönetim paneli ve ileri düzey SEO +3.000 ₺. Çoklu dil desteği dahildir. Sayfadaki hesaplayıcı tahmini toplamı gösterir; kesin teklif proje kapsamı netleştikten sonra yazılı olarak paylaşılır.',
  },
  {
    question: 'Site ne kadar sürede hazır olur?',
    answer:
      'Süre, sayfa sayısına ve istenen özelliklere göre değişir; takvimi ilk görüşmede birlikte netleştiriyor ve teklifte yazılı olarak belirtiyoruz.',
  },
  {
    question: 'Karar vermeden önce sitemi görebilir miyim?',
    answer:
      'Evet. İşletmenizi tanıdıktan sonra size özel bir demo site hazırlıyoruz; telefonunuzdan açıp gezersiniz. Beğenirseniz birlikte geliştirip yayına alıyoruz, beğenmezseniz hiçbir yükümlülüğünüz olmaz.',
  },
  {
    question: 'Alan adı ve hosting fiyata dahil mi?',
    answer:
      'Evet. İlk yıl hızlı sunucu (hosting) ve .com ya da .com.tr alan adı tescili ücretsiz olarak bizden.',
  },
  {
    question: 'Siteyi kendim güncelleyebilir miyim?',
    answer:
      'Evet. İhtiyaca göre kod bilmeden metin, fotoğraf, ürün ve hizmet ekleyip değiştirebileceğiniz bir yönetim paneli kuruyoruz.',
  },
  {
    question: 'Teslimden sonra destek veriyor musunuz?',
    answer:
      'Teslimden sonra 1 yıl boyunca teknik hataları, yedeklemeyi ve gerekli güncellemeleri ücretsiz üstleniyoruz. Sonrası için aylık bakım anlaşması yapılabilir.',
  },
  {
    question: 'Kaynak kodları bana teslim ediliyor mu?',
    answer:
      'Evet. Size özel geliştirdiğimiz yazılımın kaynak kodları ve hakları teslimde size aittir.',
  },
  {
    question: "Site Google'da çıkar mı, telefonda hızlı açılır mı?",
    answer:
      'Siteleri arama motorlarının ölçtüğü hız ve uyumluluk kriterlerine göre kuruyoruz: sayfa başlıkları ve açıklamaları, site haritası, işletme bilgileri ve telefonda hızlı açılış teslimin parçası. Sıralamadaki yer zamana ve rekabete bağlıdır; daha kapsamlı çalışma için ileri düzey SEO hizmeti ekleyebilirsiniz.',
  },
  {
    question: 'Yalnızca Türkiye içinde mi çalışıyorsunuz?',
    answer:
      "Hayır. Türkiye'nin her yerinden ve yurt dışından işletmelerle çalışıyoruz; görüşmeler telefon ve WhatsApp üzerinden yürüyor.",
  },
]

export const PRICING_SERVICES = [
  { id: 'portfolio', title: 'Kişisel / portfolyo sitesi', price: 9000 },
  { id: 'corporate', title: 'Kurumsal web sitesi', price: 9000 },
  { id: 'ecommerce', title: 'E-ticaret sitesi', price: 40000 },
  { id: 'software', title: 'Özel web yazılımı / panel', price: 50000 },
  { id: 'mobile-app', title: 'Mobil uygulama (iOS + Android)', price: 50000 },
] as const

export const PRICING_SIZES = [
  { id: 'small', title: 'Küçük', description: 'Temel sayfa ve özellikler', price: 0 },
  { id: 'medium', title: 'Orta', description: 'Daha fazla sayfa ve içerik', price: 5000 },
  { id: 'large', title: 'Geniş', description: 'Kapsamlı sayfa ve içerik yapısı', price: 10000 },
] as const

export const PRICING_ADDONS = [
  { id: 'management', title: 'Yönetim paneli', description: 'İçeriklerinizi kendiniz güncelleyin', price: 3000 },
  { id: 'multilingual', title: 'Çoklu dil desteği', description: 'Birden fazla dilde yayın', price: 0 },
  { id: 'advanced-seo', title: 'İleri düzey SEO', description: 'Teknik SEO çalışmaları', price: 3000 },
] as const
