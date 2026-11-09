export type DemoCategory =
  | 'saglik'
  | 'eticaret'
  | 'guzellik'
  | 'otel'
  | 'kafe'
  | 'kurumsal'

export interface DemoProject {
  id: string
  title: string
  category: DemoCategory
  categoryLabel: string
  description: string
  image: string
  liveUrl: string
  features: string[]
}

export interface PricingItem {
  id: string
  name: string
  description: string
  price: number
  icon: string
}

export interface SubscriptionPlan {
  id: 'monthly' | 'yearly'
  price: number
  period: string
  features: string[]
  discountLabel?: string
}

export const siteConfig = {
  brand: {
    name: 'MESE SYSTEM',
    tagline: 'Tasarım ve yazılım stüdyosu',
    logoText: 'M',
  },
  contact: {
    phone: '+90 553 977 16 47',
    whatsapp: '905539771647',
    email: 'meseseyhmus346@gmail.com',
    address: 'Türkiye genelinde',
  },
  hero: {
    tag: 'Tasarım ve yazılım stüdyosu, Türkiye',
    title: 'İşletmenize özel. Her ayrıntısıyla.',
    subtitle:
      'İyi düşünülmüş dijital deneyimler ve yazılımlar tasarlıyoruz. İlk fikirden yayına, birlikte.',
    primaryCta: { label: 'Projeleri incele ↓', href: '#referanslar' },
    secondaryCta: { label: 'Fiyat hesapla ↗', href: '#fiyat-hesapla' },
    trustBadges: [
      'Size özel tasarım',
      'Önce ücretsiz demo',
      'Doğrudan iletişim',
    ],
  },
  pricing: {
    services: [
      {
        id: 'portfolio',
        name: 'Kişisel / Portfolyo Sitesi',
        description: 'Kişisel markanız veya çalışmalarınız için sade ve özgün bir web sitesi.',
        price: 9000,
        icon: 'UserRound',
      },
      {
        id: 'kurumsal',
        name: 'Kurumsal Web Sitesi',
        description:
          'Şirketiniz için kapsamlı, hızlı ve SEO uyumlu kurumsal tanıtım sitesi.',
        price: 9000,
        icon: 'Building2',
      },
      {
        id: 'eticaret',
        name: 'E-ticaret sitesi',
        description:
          'Ürün yönetimi, ödeme entegrasyonları ve sepet sistemi ile tam kapsamlı e-ticaret altyapısı.',
        price: 40000,
        icon: 'ShoppingCart',
      },
      {
        id: 'ozel',
        name: 'Özel web yazılımı / panel',
        description:
          'İş süreçlerinize tamamen özel geliştirilmiş, panel destekli web uygulaması.',
        price: 50000,
        icon: 'Code2',
      },
      {
        id: 'mobil',
        name: 'Mobil uygulama (iOS + Android)',
        description: 'iOS ve Android için işletmenize özel mobil uygulama.',
        price: 50000,
        icon: 'Smartphone',
      },
    ] as PricingItem[],
    addons: [
      {
        id: 'panel',
        name: 'Yönetim Paneli',
        description: 'İçerik ve ürünlerinizi kendiniz yönetebileceğiniz kullanışlı panel.',
        price: 3000,
        icon: 'LayoutDashboard',
      },
      {
        id: 'coklu-dil',
        name: 'Çoklu dil desteği',
        description: 'Birden fazla dilde yayın.',
        price: 0,
        icon: 'Languages',
      },
      {
        id: 'seo',
        name: 'İleri düzey SEO',
        description: 'Teknik SEO çalışmaları.',
        price: 3000,
        icon: 'TrendingUp',
      },
    ] as PricingItem[],
    subscription: {
      monthly: {
        id: 'monthly',
        price: 2000,
        period: 'ay',
        features: [
          'Aylık güncelleme ve içerik desteği',
          'SSL, yedekleme ve sunucu barındırma',
          'Hata giderme ve teknik destek',
        ],
      },
      yearly: {
        id: 'yearly',
        price: 20000,
        period: 'yıl',
        features: [
          'Tüm aylık plan özellikleri',
          'Öncelikli destek hattı',
          'Performans ve güvenlik raporları',
        ],
        discountLabel: '2 ay hediye',
      },
    } satisfies Record<'monthly' | 'yearly', SubscriptionPlan>,
  },
  demos: [
    {
      id: 'vita-dental',
      title: 'Vita Dental Klinik',
      category: 'saglik',
      categoryLabel: 'Sağlık & Klinik',
      description:
        'Randevu sistemi ve doktor profilleri ile modern diş kliniği sitesi.',
      image: 'vita-dental',
      liveUrl: 'https://demo.mesesystem.com/vita-dental',
      features: ['Online randevu', 'Doktor profilleri', 'Blog'],
    },
    {
      id: 'deva-saglik',
      title: 'Deva Sağlık Merkezi',
      category: 'saglik',
      categoryLabel: 'Sağlık & Klinik',
      description: 'Çoklu dil desteği ve tahlil sonuç sorgulama ile hastane sitesi.',
      image: 'medicana-health',
      liveUrl: 'https://demo.mesesystem.com/deva-saglik',
      features: ['Tahlil sorgulama', 'Çoklu dil', 'E-randevu'],
    },
    {
      id: 'novashop',
      title: 'NovaShop',
      category: 'eticaret',
      categoryLabel: 'E-Ticaret',
      description: 'Kategori filtreleri, sepet ve hızlı ödeme akışı ile moda mağazası.',
      image: 'novashop',
      liveUrl: 'https://demo.mesesystem.com/novashop',
      features: ['Sepet & ödeme', 'Kategori filtreleri', 'Ürün arama'],
    },
    {
      id: 'teknohub',
      title: 'TeknoHub',
      category: 'eticaret',
      categoryLabel: 'E-Ticaret',
      description: 'Teknoloji ürünleri için karşılaştırma ve taksit seçenekli e-ticaret.',
      image: 'teknohub',
      liveUrl: 'https://demo.mesesystem.com/teknohub',
      features: ['Ürün karşılaştırma', 'Taksit seçenekleri', 'Kargo takibi'],
    },
    {
      id: 'lumiere-beauty',
      title: 'Lumière Güzellik',
      category: 'guzellik',
      categoryLabel: 'Güzellik Merkezi',
      description: 'Önce/sonra galerisi ve paket fiyat listesi ile güzellik merkezi.',
      image: 'lumiere-beauty',
      liveUrl: 'https://demo.mesesystem.com/lumiere-beauty',
      features: ['Önce/sonra galerisi', 'Paket fiyatları', 'Online rezervasyon'],
    },
    {
      id: 'aura-spa',
      title: 'Aura Spa & Wellness',
      category: 'guzellik',
      categoryLabel: 'Güzellik Merkezi',
      description: 'Huzurlu tasarımı ve hediye kartı sistemi ile spa merkezi sitesi.',
      image: 'aura-spa',
      liveUrl: 'https://demo.mesesystem.com/aura-spa',
      features: ['Hediye kartı', 'Terapi listesi', 'Online rezervasyon'],
    },
    {
      id: 'azure-hotel',
      title: 'Azure Otel',
      category: 'otel',
      categoryLabel: 'Otel & Konaklama',
      description: 'Rezervasyon motoru ve oda turu ile butik otel sitesi.',
      image: 'azure-hotel',
      liveUrl: 'https://demo.mesesystem.com/azure-hotel',
      features: ['Rezervasyon motoru', '360° oda turu', 'Misafir yorumları'],
    },
    {
      id: 'sunset-bay',
      title: 'Sunset Bay Resort',
      category: 'otel',
      categoryLabel: 'Otel & Konaklama',
      description: 'Çoklu dil ve aktivite takvimi ile sahil resortu sitesi.',
      image: 'sunset-bay',
      liveUrl: 'https://demo.mesesystem.com/sunset-bay',
      features: ['Aktivite takvimi', 'Çoklu dil', 'Promosyon kodları'],
    },
    {
      id: 'sakli-cave-house',
      title: 'Saklı Cave House',
      category: 'otel',
      categoryLabel: 'Otel & Konaklama',
      description: 'Kapadokya mağara oteli için özel taş mimari görsel vitrini, 360° süit turu ve canlı rezervasyon.',
      image: 'sakli-cave-house',
      liveUrl: 'https://demo.mesesystem.com/sakli-cave-house',
      features: ['Mağara süit turu', 'Canlı rezervasyon', 'VIP transfer'],
    },
    {
      id: 'brew-lab',
      title: 'Brew Lab Kahve',
      category: 'kafe',
      categoryLabel: 'Kafe & Restoran',
      description: 'İnteraktif menü ve masa QR siparişi ile üçüncü nesil kahveci.',
      image: 'brew-lab',
      liveUrl: 'https://demo.mesesystem.com/brew-lab',
      features: ['QR menü', 'Masa siparişi', 'Sadakat programı'],
    },
    {
      id: 'mangal-evi',
      title: 'Mangal Evi',
      category: 'kafe',
      categoryLabel: 'Kafe & Restoran',
      description: 'Online rezervasyon ve şube haritası ile restoran zinciri sitesi.',
      image: 'mangal-evi',
      liveUrl: 'https://demo.mesesystem.com/mangal-evi',
      features: ['Online rezervasyon', 'Şube haritası', 'Menü yönetimi'],
    },
    {
      id: 'atlas-holding',
      title: 'Atlas Holding',
      category: 'kurumsal',
      categoryLabel: 'Kurumsal',
      description: 'Yatırımcı ilişkileri ve kurumsal kimlik sunumu ile holding sitesi.',
      image: 'atlas-holding',
      liveUrl: 'https://demo.mesesystem.com/atlas-holding',
      features: ['Yatırımcı ilişkileri', 'Basın odası', 'Kariyer sayfası'],
    },
    {
      id: 'vertex-danismanlik',
      title: 'Vertex Danışmanlık',
      category: 'kurumsal',
      categoryLabel: 'Kurumsal',
      description: 'Vaka çalışmaları ve danışman formları ile B2B danışmanlık sitesi.',
      image: 'vertex-danismanlik',
      liveUrl: 'https://demo.mesesystem.com/vertex-danismanlik',
      features: ['Vaka çalışmaları', 'Teklif formu', 'E-bülten'],
    },
  ] as DemoProject[],
  stats: [
    { id: 'stat-1', value: 120, suffix: '+', label: 'Tamamlanan Proje' },
    { id: 'stat-2', value: 98, suffix: '%', label: 'Müşteri Memnuniyeti' },
    { id: 'stat-3', value: 7, suffix: ' Yıl', label: 'Sektör Deneyimi' },
    { id: 'stat-4', value: 40, suffix: '+', label: 'Aktif Abonelik' },
  ],
  process: [
    {
      id: 'kesif',
      step: '01',
      title: 'Keşif',
      description:
        'İhtiyaçlarınızı dinliyor, sektörünüzü analiz ediyor ve hedeflerinizi netleştiriyoruz.',
      icon: 'Search',
    },
    {
      id: 'tasarim',
      step: '02',
      title: 'Tasarım',
      description:
        'Markanıza özel, modern dokunuşlu ve dönüşüm odaklı tasarım konseptleri sunuyoruz.',
      icon: 'PenTool',
    },
    {
      id: 'gelistirme',
      step: '03',
      title: 'Geliştirme',
      description:
        'Modern teknolojilerle hızlı, güvenli ve mobil uyumlu sitenizi geliştiriyoruz.',
      icon: 'Code2',
    },
    {
      id: 'yayin',
      step: '04',
      title: 'Yayın & Bakım',
      description:
        'Sitenizi yayına alıyor, abonelik ile sürekli güncelliyor ve destek veriyoruz.',
      icon: 'Rocket',
    },
  ],
  trustBadges: [
    {
      id: 'badge-demo',
      icon: 'MonitorPlay',
      title: 'Önce Ücretsiz Demo, Sonra Ödeme',
      description:
        'Projeniz yayına girmeden önce canlı demoyu inceleyin, memnun kalırsanız ödeme yapın.',
    },
    {
      id: 'badge-teslim',
      icon: 'Rocket',
      title: 'Hızlı Teslimat',
      description: 'Onaylanan tasarımlar en kısa sürede yayında.',
    },
    {
      id: 'badge-destek',
      icon: 'Headphones',
      title: '7/24 Destek',
      description: 'Abonelik paketlerimize sınırsız teknik destek dahil.',
    },
    {
      id: 'badge-performans',
      icon: 'Gauge',
      title: '%95+ Performans Skoru',
      description: 'Her site Core Web Vitals ölçümleriyle optimize edilir.',
    },
  ],
} as const

export default siteConfig
