export type PortfolioFilter =
  | 'Sağlık'
  | 'Fitness'
  | 'E Ticaret'
  | 'Güzellik'
  | 'Veterinerlik'
  | 'Konaklama'
  | 'Diş Hekimliği'
  | 'Diğer'

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
  'Sağlık',
  'Fitness',
  'E Ticaret',
  'Güzellik',
  'Veterinerlik',
  'Konaklama',
  'Diş Hekimliği',
  'Diğer',
]

const preview = (id: string) =>
  `https://www.eraslansoftware.com/_next/image?url=https%3A%2F%2Fthyhjlexsbldbexmgmzs.supabase.co%2Fstorage%2Fv1%2Fobject%2Fpublic%2Fportfolio-previews%2F${id}%2Fdesktop.jpg&w=640&q=75`

export const PORTFOLIO_PROJECTS: PortfolioProject[] = [
  {
    id: 'pres-dis',
    name: 'Pres Diş',
    category: 'Sağlık',
    label: 'Sağlık',
    subtitle: 'Ağız & Diş Sağlığı',
    description:
      "Pres Diş için tasarlanan bu modern web sitesi, Bursa'daki iki şubesinde ağız ve diş sağlığı hizmetleri sunarak ücretsiz ilk muayene imkanı sağlar.",
    href: 'https://presdis.vercel.app/',
    previewImage: '/projects/pres-dis.jpg',
  },
  {
    id: 'gustav',
    name: 'Gustav',
    category: 'Diğer',
    label: 'Kafe',
    subtitle: 'Kafe & Tatlıcı',
    description:
      "Gustav Coffee & Dessert için tasarlanan bu modern web sitesi, Milas'ta kahve, waffle ve tatlı çeşitleri sunarak online sipariş ve mekan bilgilerini kolayca erişilebilir kılar.",
    href: 'https://gustav-murex.vercel.app/',
    previewImage: '/projects/gustav.jpg',
  },
  {
    id: 'sakli-cave-house',
    name: 'Saklı Cave House',
    category: 'Konaklama',
    label: 'Otelcilik',
    subtitle: 'Kapadokya Mağara Oteli',
    description:
      "Saklı Cave House için tasarlanan bu demo, Kapadokya'daki mağara ve taş odaları tanıtırken, interaktif bir oda seçimi ve filtreleme aracı sunar.",
    href: 'https://saklicave-house.vercel.app/',
    previewImage: '/projects/sakli-cave-house.jpg',
  },
  {
    id: 'diyetoloji',
    name: 'Diyetoloji',
    category: 'Diğer',
    label: 'Beslenme',
    subtitle: 'Günlük Diyet Teslimatı',
    description:
      'Diyetoloji için tasarlanan bu demo, çeşitli diyet ve detoks paketlerini sunarken, kullanıcının ihtiyacına uygun paketi bulmasını sağlayan interaktif bir sihirbaz içerir.',
    href: 'https://diyetoloji.vercel.app/',
    previewImage: '/projects/diyetoloji.jpg',
  },
  {
    id: 'ceren-sude',
    name: 'Ceren Sude',
    category: 'Fitness',
    label: 'Fitness',
    subtitle: 'Personal Trainer & Koçluk',
    description:
      'Ceren Sude için tasarlanan bu modern web sitesi, birebir ve online koçluk hizmetleri sunarak kişiselleştirilmiş antrenman programları ve beslenme rehberliği sağlar.',
    href: 'https://www.ptcerensude.com/',
    previewImage: '/projects/ceren-sude.jpg',
  },
  {
    id: 'zenn-studio',
    name: 'Zenn Studio',
    category: 'Fitness',
    label: 'Fitness',
    subtitle: 'Pilates & Fitness Stüdyosu, İstanbul',
    description:
      'Zenn Studio için tasarlanan bu demo, çeşitli fitness branşlarını ve kişiselleştirilmiş ders önerisi sunan interaktif bir aracı içerir.',
    href: 'https://zennstudio.vercel.app/',
    previewImage: '/projects/zenn-studio.jpg',
  },
  {
    id: 'ciftlik-kasabi',
    name: 'Çiftlik Kasabı',
    category: 'Diğer',
    label: 'Et Ürünleri',
    subtitle: 'Et Ürünleri & Online Sipariş',
    description:
      'Çiftlik Kasabı için tasarlanan bu web sitesi, Kızılcahamam ve Karabük şubelerinde kuzu, dana eti ve kendi üretimleri şarküteri ürünlerini sunarken, online sipariş ve mangal hesabı aracıyla alışverişi kolaylaştırır.',
    href: 'https://ciftlikkasabi.com/',
    previewImage: preview('207d487f-e602-4bf6-8291-7977685d7f1c'),
  },
  {
    id: 'nisa-atelier',
    name: 'Nisa Atelier',
    category: 'E Ticaret',
    label: 'E Ticaret',
    subtitle: 'Moda & Butik',
    description:
      "Nisa Atelier için tasarlanan bu zarif web sitesi, Nişantaşı'ndaki butiğinde özenle seçilmiş kumaşlardan, sınırlı sayıda üretilen zamansız kadın giyim koleksiyonlarını sunar.",
    href: 'https://eraslan-landingler.vercel.app/',
    previewImage: '/projects/nisa-atelier.jpg',
  },
  {
    id: 'saye-beauty-atelier',
    name: 'Saye Beauty Atelier',
    category: 'Güzellik',
    label: 'Güzellik',
    subtitle: 'Güzellik & Bakım Atölyesi',
    description:
      "Saye Beauty Atelier için tasarlanan bu zarif web sitesi, Suadiye'de saç, cilt, tırnak ve kirpik için kişiye özel güzellik hizmetleri sunuyor.",
    href: 'https://eraslan-landingler-xlt3-eta.vercel.app/',
    previewImage: '/projects/saye-beauty-atelier.jpg',
  },
  {
    id: 'meltem-yachts',
    name: 'Meltem Yachts',
    category: 'Diğer',
    label: 'Denizcilik',
    subtitle: 'Yat Üretimi & Tasarım',
    description:
      "Meltem Yachts için tasarlanan bu prestijli web sitesi, Bodrum Turgutreis'teki atölyesinde 38-60 ft yelkenli yat modellerini sunar.",
    href: 'https://meltem-yachts.vercel.app/',
    previewImage: '/projects/meltem-yachts.jpg',
  },
  {
    id: 'baygun-veteriner',
    name: 'Baygün Veteriner Kliniği',
    category: 'Veterinerlik',
    label: 'Veterinerlik',
    subtitle: 'Veterinerlik & Hayvan Sağlığı',
    description:
      "Baygün Veteriner Kliniği için tasarlanan bu modern web sitesi, Eskişehir'de 7/24 acil servis dahil kapsamlı veterinerlik hizmetleri sunuyor.",
    href: 'https://eraslan-landingler-ui2z.vercel.app/',
    previewImage: '/projects/baygun-veteriner.jpg',
  },
  {
    id: 'ece-pilates-yoga',
    name: 'Ece Pilates & Yoga',
    category: 'Diğer',
    label: 'Spor',
    subtitle: 'Pilates & Yoga Stüdyosu',
    description:
      "Ece Pilates & Yoga için tasarlanan bu modern web sitesi, 4. Levent'te butik pilates ve yoga derslerini kişiye özel programlar ve online randevu sistemiyle sunar.",
    href: 'https://ece-pilates-yoga.vercel.app/',
    previewImage:
      'https://www.eraslansoftware.com/_next/image?url=%2Fportfolio%2Fece-pilates-yoga-vercel-app.jpg&w=640&q=75&dpl=dpl_49zUrZ48hMS5o6UsJF9rzED9hy5q',
  },
  {
    id: 'dr-leyla-sarigul',
    name: 'Dr. Leyla Sarıgül',
    category: 'Sağlık',
    label: 'Sağlık',
    subtitle: 'Psikiyatri & Ruh Sağlığı',
    description:
      'Dr. Leyla Sarıgül için tasarlanan bu zarif web sitesi, erişkin psikiyatrisi alanında depresyon, anksiyete ve uyku sorunlarına yönelik profesyonel destek sunuyor.',
    href: 'https://psikiyatri-zeta.vercel.app/',
    previewImage: '/projects/dr-leyla-sarigul.jpg',
  },
  {
    id: 'aura-reformer',
    name: 'Aura Reformer',
    category: 'Diğer',
    label: 'Wellness',
    subtitle: 'Pilates & Wellness',
    description:
      'Aura Reformer Studio için tasarlanan bu lüks web sitesi, zarafet ve gücü birleştiren butik reformer pilates deneyimini sunuyor.',
    href: 'https://pilates-demo-woad.vercel.app/',
    previewImage:
      'https://www.eraslansoftware.com/_next/image?url=%2Fportfolio%2Fpilates-demo-woad-vercel-app.jpg&w=640&q=75&dpl=dpl_49zUrZ48hMS5o6UsJF9rzED9hy5q',
  },
  {
    id: 'cinar-veteriner',
    name: 'Çınar Veteriner Kliniği',
    category: 'Veterinerlik',
    label: 'Veterinerlik',
    subtitle: 'Veterinerlik & Hayvan Sağlığı',
    description:
      'Çınar Veteriner Kliniği için tasarlanan bu zarif web sitesi, kedi, köpek ve egzotik hayvanlar için muayeneden cerrahiye kadar kapsamlı veterinerlik hizmetleri sunuyor.',
    href: 'https://veterinerlik-coral.vercel.app/',
    previewImage: '/projects/cinar-veteriner.jpg',
  },
  {
    id: 'asya-demo-klinik',
    name: 'Asya Demo Klinik',
    category: 'Sağlık',
    label: 'Sağlık',
    subtitle: 'Estetik Diş Hekimliği & Klinik',
    description:
      'Dr. Asya Türker için tasarlanan bu modern klinik portalı, estetik diş hekimliği hizmetlerini ve uluslararası hasta deneyimini zarifçe sunuyor.',
    href: 'https://asya-turker-demo.vercel.app/tr',
    previewImage: '/projects/asya-demo-klinik.jpg',
  },
  {
    id: 'gloss-club',
    name: 'Gloss Club',
    category: 'Güzellik',
    label: 'Güzellik',
    subtitle: 'Tırnak & Kirpik Bakımı',
    description:
      "Gloss Club için tasarlanan bu zarif web sitesi, Moda'daki nail & lash barın kalıcı oje, ipek kirpik gibi hizmetlerini online tırnak tasarlama ve randevu alma kolaylığıyla sunar.",
    href: 'https://glos-club.vercel.app/',
    previewImage: '/projects/gloss-club.jpg',
  },
  {
    id: 'maison-elysee',
    name: 'Maison Elysée',
    category: 'Konaklama',
    label: 'Konaklama',
    subtitle: 'Butik Otel & Termal Spa',
    description:
      'Maison Elysée için tasarlanan bu lüks butik otel web sitesi, Fransız zarafeti ile şifalı termal suları harmanlayan eşsiz bir konaklama deneyimi sunuyor.',
    href: 'https://hotel-demo-three-livid.vercel.app/',
    previewImage: '/projects/maison-elysee.jpg',
  },
  {
    id: 'orsa-yachts',
    name: 'ORSA Yachts',
    category: 'Diğer',
    label: 'Yat Üretimi',
    subtitle: 'Yat Üretimi & Tasarım',
    description:
      "ORSA Yachts için tasarlanan bu prestijli web sitesi, Antalya Serbest Bölge'de üretilen 19-37 metre motoryat ve explorer modellerini sunar.",
    href: 'https://orsa-yachts.vercel.app/',
    previewImage: '/projects/orsa-yachts.jpg',
  },
  {
    id: 'pearl-dental',
    name: 'Pearl Dental',
    category: 'Diş Hekimliği',
    label: 'Diş Hekimliği',
    subtitle: 'Diş Hekimliği & Gülüş Tasarımı',
    description:
      'Pearl Dental için tasarlanan bu zarif web sitesi, modern teknolojiyle acısız diş tedavisi ve estetik gülüş tasarımını bir araya getirerek kusursuz bir deneyim sunuyor.',
    href: 'https://demo-dis-klinigi.vercel.app/',
    previewImage: '/projects/pearl-dental.jpg',
  },
  {
    id: 'collina',
    name: 'Collina',
    category: 'Diğer',
    label: 'Tekstil',
    subtitle: 'Spor Giyim & Üretim',
    description:
      "Collina için tasarlanan bu modern web sitesi, Bursa'daki tesisinde kendi markası ve dünya markaları için eşofman takımı, ceket ve kapüşonlu gibi spor giyim ürünleri üretiyor.",
    href: 'https://collina-one.vercel.app/',
    previewImage: '/projects/collina.jpg',
  },
  {
    id: 'alsa-dental-studio',
    name: 'Alsa Dental Studio',
    category: 'Diş Hekimliği',
    label: 'Diş Hekimliği',
    subtitle: 'Estetik & Dijital Diş Hekimliği',
    description:
      "Alsa Dental Studio için tasarlanan bu modern web sitesi, Alsancak'ta dijital planlamalı diş hekimliği hizmetlerini ve online tedavi planlayıcısını zarifçe sunuyor.",
    href: 'https://eraslan-landingler-ga4e.vercel.app/',
    previewImage: '/projects/alsa-dental-studio.jpg',
  },
  {
    id: 'kraft-studio',
    name: 'KRAFT Studio',
    category: 'Diğer',
    label: 'Mimarlık',
    subtitle: 'Brütalist Mimarlık & Tasarım',
    description:
      'KRAFT Studio için tasarlanan bu modern web sitesi, brütalist mimari ve iç mekan tasarım felsefesini dürüst malzemelerle sunuyor.',
    href: 'https://eraslan-landingler-1ntf.vercel.app/',
    previewImage: '/projects/kraft-studio.jpg',
  },
  {
    id: 'projemax',
    name: 'Projemax',
    category: 'Diğer',
    label: 'Kurumsal',
    subtitle: 'Kurumsal Portal & SaaS',
    description:
      'Büyük ölçekli projeler için geliştirilmiş, kurumsal kimliği ve portfolyoyu sunan iş takipli kurumsal web portalı.',
    href: 'https://www.projemax.net/',
    previewImage: '/projects/projemax.jpg',
  },
  {
    id: 'aura-clinic',
    name: 'Aura Clinic & Medispa',
    category: 'Diğer',
    label: 'Estetik',
    subtitle: 'Medispa & Estetik Cerrahi',
    description:
      'Aura Clinic & Medispa için tasarlanan bu lüks klinik portalı, estetik cerrahi ve medikal estetik hizmetlerini uluslararası standartlarda sunuyor.',
    href: 'https://estetik-demo.vercel.app/',
    previewImage: '/projects/aura-clinic.jpg',
  },
  {
    id: 'fortis-film',
    name: 'Fortis Film',
    category: 'Diğer',
    label: 'Prodüksiyon',
    subtitle: 'Prodüksiyon Portfolyo',
    description:
      'Medya ve kreatif film stüdyoları için hazırlanmış, video-galeri öncelikli portfolyo sitesi.',
    href: 'https://fortisfilm.com/',
    previewImage: '/projects/fortis-film.jpg',
  },
  {
    id: 'bi-dua',
    name: 'Bi Dua',
    category: 'Diğer',
    label: 'Mobil Uygulama',
    subtitle: 'Mobil Tanıtım & Landing',
    description:
      'Bi Dua mobil uygulaması için kurgulanan, market yönlendirmeli ve kullanıcı edinim odaklı modern tanıtım sitesi.',
    href: 'https://bidualanding.vercel.app/',
    previewImage: '/projects/bi-dua.jpg',
  },
  {
    id: 'ck-cosmeticks',
    name: 'CK Cosmeticks',
    category: 'Diğer',
    label: 'Kozmetik',
    subtitle: 'Makyaj & Parfüm',
    description:
      'CK Cosmeticks için tasarlanan bu modern web sitesi, ithal makyaj ve parfüm setlerini Türkiye geneline indirimli fiyatlarla ve güvenli online ödeme seçenekleriyle sunar.',
    href: 'https://ck-cosmeticks.vercel.app/',
    previewImage: '/projects/ck-cosmeticks.jpg',
  },
  {
    id: 'maison',
    name: 'MAISON',
    category: 'E Ticaret',
    label: 'E Ticaret',
    subtitle: 'Giyim & Stil',
    description:
      'MAISON için tasarlanan bu zarif butik web sitesi, zamansız parçalar ve zahmetsiz şıklık sunarak kadınların kendi stillerini keşfetmelerini sağlıyor.',
    href: 'https://maison-butik.vercel.app/',
    previewImage: '/projects/maison.jpg',
  },
]

export const FEATURED_PROJECT_IDS = [
  'pres-dis',
  'gustav',
  'sakli-cave-house',
  'diyetoloji',
  'ceren-sude',
  'zenn-studio',
]

export const DEMO_PROJECTS = [
  {
    id: 'dedeli-konak',
    name: 'Dedeli Konak',
    category: 'Otelcilik',
    subtitle: 'Ürgüp Mağara Oteli',
    description:
      "Dedeli Konak için tasarlanan bu demo, Kapadokya'daki mağara oteli deneyimini ve interaktif paket oluşturma aracını sunar.",
    href: 'https://dedelikonak.vercel.app/',
    previewImage:
      'https://www.eraslansoftware.com/_next/image?url=https%3A%2F%2Fthyhjlexsbldbexmgmzs.supabase.co%2Fstorage%2Fv1%2Fobject%2Fpublic%2Fportfolio-previews%2F67a65274-5555-462c-a1ce-a4717542ae26%2Fmobile.jpg&w=256&q=75',
  },
  {
    id: 'berfin-yavuz',
    name: 'Berfin Yavuz',
    category: 'İç Mimarlık',
    subtitle: 'İç Mimarlık Stüdyosu',
    description:
      'Berfin Yavuz için tasarlanan bu demo, modern iç mimarlık projelerini tanıtır ve interaktif bir proje teklif sihirbazı sunar.',
    href: 'https://berfin-yavuz.vercel.app/',
    previewImage:
      'https://www.eraslansoftware.com/_next/image?url=https%3A%2F%2Fthyhjlexsbldbexmgmzs.supabase.co%2Fstorage%2Fv1%2Fobject%2Fpublic%2Fportfolio-previews%2F1ad3cff3-4121-4fd8-af55-526b2ab940b6%2Fmobile.jpg&w=256&q=75',
  },
  {
    id: 'evante',
    name: 'Evante',
    category: 'İç Giyim',
    subtitle: 'İç Giyim ve Pijama',
    description:
      'Evante için tasarlanan bu demo, iç giyim ve pijama koleksiyonlarını sergilerken, interaktif bir sütyen beden rehberi sunar.',
    href: 'https://avante-umber.vercel.app/',
    previewImage:
      'https://www.eraslansoftware.com/_next/image?url=https%3A%2F%2Fthyhjlexsbldbexmgmzs.supabase.co%2Fstorage%2Fv1%2Fobject%2Fpublic%2Fportfolio-previews%2F17a2e5cd-177b-4b6b-a129-297160a7ee63%2Fmobile.jpg&w=256&q=75',
  },
  {
    id: 'ren-kuyumculuk',
    name: 'Ren Kuyumculuk',
    category: 'Kuyumculuk',
    subtitle: 'Duisburg Kuyumcu Atölyesi',
    description:
      'Ren Kuyumculuk için tasarlanan bu demo, özel tasarım takıları sergiler ve interaktif bir isim kolye tasarlama aracı sunar.',
    href: 'https://ren-henna.vercel.app/',
    previewImage:
      'https://www.eraslansoftware.com/_next/image?url=https%3A%2F%2Fthyhjlexsbldbexmgmzs.supabase.co%2Fstorage%2Fv1%2Fobject%2Fpublic%2Fportfolio-previews%2Fd439b88e-6db7-4e65-a502-f21a2378e9c6%2Fmobile.jpg&w=256&q=75',
  },
  {
    id: 'defne-akin',
    name: 'Defne Akın',
    category: 'Sağlık',
    subtitle: 'Diyetisyenlik & Beslenme',
    description:
      'Dyt. Defne Akın için tasarlanan bu demo, kişiye özel beslenme programlarını, mevsimsel tarifleri ve online randevu alma imkanını sunar.',
    href: 'https://defne-diyetisyen.vercel.app/',
    previewImage:
      'https://www.eraslansoftware.com/_next/image?url=https%3A%2F%2Fthyhjlexsbldbexmgmzs.supabase.co%2Fstorage%2Fv1%2Fobject%2Fpublic%2Fportfolio-previews%2F8b60c0ad-c322-45cd-ac7b-2ee64f32bd1f%2Fmobile.jpg&w=256&q=75',
  },
  {
    id: 'zeynep-aksoy',
    name: 'Dyt. Zeynep Aksoy',
    category: 'Beslenme',
    subtitle: 'Diyetisyenlik & Beslenme Takibi',
    description:
      'Dyt. Zeynep Aksoy için tasarlanan bu demo, kişiye özel diyet programlarını, günlük öğün takibini ve diyetisyenle anlık iletişimi interaktif bir mobil uygulama üzerinden sunar.',
    href: 'https://diyetisyen-zeynep.vercel.app/',
    previewImage:
      'https://www.eraslansoftware.com/_next/image?url=https%3A%2F%2Fthyhjlexsbldbexmgmzs.supabase.co%2Fstorage%2Fv1%2Fobject%2Fpublic%2Fportfolio-previews%2F2d71d92e-2da5-4804-b85c-7aa693173ac2%2Fmobile.jpg&w=256&q=75',
  },
  {
    id: 'umutlu-kent-psikoloji',
    name: 'Umutlu Kent Psikoloji',
    category: 'Psikoloji',
    subtitle: 'Psikolojik Danışmanlık & Terapi',
    description:
      'Umutlu Kent Psikolojik Danışmanlık için tasarlanan bu platform, yetişkin, çift, çocuk ve ergenlere uzman klinik psikologlarla yüz yüze ve online terapi imkanı sunar.',
    href: 'https://umutlukentpsikoloji.vercel.app/',
    previewImage:
      'https://www.eraslansoftware.com/_next/image?url=https%3A%2F%2Fumutlukentpsikoloji.vercel.app%2Fimg%2Fhero-yatay.jpg&w=256&q=75',
  },
  {
    id: 'umutlu-psikoloji',
    name: 'Umutlu Kent Psikoloji',
    category: 'Psikoloji',
    subtitle: 'Psikoloji & Online Terapi',
    description:
      'Umutlu Kent Psikoloji için tasarlanan bu platform, yetişkin, çift, çocuk ve ergen terapisi sunarak online randevu ve takip imkanı sağlar.',
    href: 'https://umutlupsikoloji.vercel.app/',
    previewImage:
      'https://www.eraslansoftware.com/_next/image?url=https%3A%2F%2Fthyhjlexsbldbexmgmzs.supabase.co%2Fstorage%2Fv1%2Fobject%2Fpublic%2Fportfolio-previews%2F7f7de579-2ef3-445c-82c7-43cd8fc0abd1%2Fmobile.jpg&w=256&q=75',
  },
  {
    id: 'nox',
    name: 'NOX',
    category: 'Nitelikli Kahve',
    subtitle: 'Nitelikli Kahve Kavurucusu',
    description:
      'NOX için tasarlanan bu demo, mikrolot kahve çekirdeklerini detaylı sunar ve damak zevkine göre çekirdek seçimi ile demleme tercihlerini interaktif olarak yapılandırma imkanı sunar.',
    href: 'https://nox-coffee-gold.vercel.app/',
    previewImage:
      'https://www.eraslansoftware.com/_next/image?url=https%3A%2F%2Fthyhjlexsbldbexmgmzs.supabase.co%2Fstorage%2Fv1%2Fobject%2Fpublic%2Fportfolio-previews%2Fe547f38c-3c7f-40c3-9edc-fa899a6837d0%2Fmobile.jpg&w=256&q=75',
  },
]

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
      'Başlangıç fiyatları: Kişisel / portfolyo sitesi 9.000 ₺, Kurumsal web sitesi 9.000 ₺, E-ticaret sitesi 40.000 ₺, Özel web yazılımı / panel 50.000 ₺, Mobil uygulama (iOS + Android) 50.000 ₺. Orta kapsam +5.000 ₺, geniş kapsam +10.000 ₺; yönetim paneli ve ileri düzey SEO +3.000 ₺. Çoklu dil ve yapay zekâ özellikleri dahildir. Sayfadaki hesaplayıcı tahmini toplamı gösterir; kesin teklif proje kapsamı netleştikten sonra yazılı olarak paylaşılır.',
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
  { id: 'ai', title: 'Yapay zekâ özelliği', description: 'İhtiyaca uygun yapay zekâ entegrasyonu', price: 0 },
  { id: 'advanced-seo', title: 'İleri düzey SEO', description: 'Teknik SEO çalışmaları', price: 3000 },
] as const
