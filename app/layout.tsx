import type { Metadata, Viewport } from 'next'
import { Inter, Sora } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import FloatingWhatsApp from '@/components/FloatingWhatsApp'
import siteConfig from '@/config/siteConfig'
import { FAQS, PORTFOLIO_PROJECTS } from '@/config/referenceSite'

const SITE_URL = 'https://mesesystem.com'

const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-inter',
  display: 'swap',
})

const sora = Sora({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-sora',
  display: 'swap',
})

export const viewport: Viewport = {
  themeColor: '#f7f4ed',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'MESE SYSTEM — Web Tasarım Ajansı & Yazılım Stüdyosu',
    template: `%s | ${siteConfig.brand.name} — Web Tasarım ve Yazılım`,
  },
  description:
    'Türkiye geneli web tasarım ajansı ve yazılım stüdyosu. Kurumsal web sitesi, e-ticaret sitesi yapımı ve mobil uygulama. Önce ücretsiz demo, sonra karar!',
  keywords: [
    'web tasarım ajansı',
    'yazılım stüdyosu',
    'web sitesi yapımı',
    'e-ticaret sitesi yapımı',
    'mobil uygulama geliştirme',
    'kurumsal web sitesi',
    'özel web yazılımı',
    'yönetim paneli yazılımı',
    'QR menü sistemleri',
    'SEO uyumlu web sitesi',
    'Türkiye geneli web tasarım',
    'Türkiye web tasarım',
    'profesyonel web tasarım',
    'Mese System',
    'MESE SYSTEM Web Tasarım',
  ],
  authors: [{ name: 'Şeyhmus Meşe', url: SITE_URL }],
  creator: 'MESE SYSTEM',
  publisher: 'MESE SYSTEM',
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    url: SITE_URL,
    siteName: siteConfig.brand.name,
    title: 'MESE SYSTEM — Web Tasarım Ajansı & Yazılım Stüdyosu',
    description:
      'Türkiye geneli web tasarım ajansı ve yazılım stüdyosu. Kurumsal web sitesi, e-ticaret sitesi yapımı ve mobil uygulama. Önce ücretsiz demo, sonra karar!',
    images: [
      {
        url: '/brand/mese-system-full.png',
        width: 1200,
        height: 630,
        alt: 'MESE SYSTEM — Web Tasarım Ajansı ve Yazılım Stüdyosu',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MESE SYSTEM — Web Tasarım Ajansı & Yazılım Stüdyosu',
    description:
      'Türkiye geneli web tasarım ajansı ve yazılım stüdyosu. Kurumsal web sitesi, e-ticaret sitesi yapımı ve mobil uygulama. Önce ücretsiz demo, sonra karar!',
    images: ['/brand/mese-system-full.png'],
    creator: '@mesesystem',
  },
  icons: {
    icon: [
      { url: '/brand/mese-system-mark-64.png', sizes: '64x64', type: 'image/png' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    apple: [
      { url: '/brand/mese-system-mark-128.png', sizes: '128x128', type: 'image/png' },
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

interface JsonLdValue {
  '@type'?: string
  [key: string]: unknown
}

function buildJsonLd(): string {
  const graph: JsonLdValue[] = [
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: SITE_URL,
      name: siteConfig.brand.name,
      alternateName: 'MESE',
      description: siteConfig.brand.tagline,
      inLanguage: 'tr-TR',
      publisher: { '@id': `${SITE_URL}/#organization` },
    },
    {
      '@type': 'ProfessionalService',
      '@id': `${SITE_URL}/#organization`,
      name: siteConfig.brand.name,
      alternateName: 'MESE',
      url: SITE_URL,
      logo: `${SITE_URL}/brand/mese-system-mark-128.png`,
      image: `${SITE_URL}/brand/mese-system-full.png`,
      description:
        'Markalar ve işletmeler için modern web sitesi tasarımı, özel yazılım stüdyosu, e-ticaret altyapısı ve mobil uygulama geliştirme çözümleri.',
      email: siteConfig.contact.email,
      telephone: siteConfig.contact.phone,
      priceRange: '₺₺ (9.000 ₺ - 50.000 ₺)',
      currenciesAccepted: 'TRY',
      paymentAccepted: 'Nakit, Havale, EFT, Kredi Kartı',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'İstanbul',
        addressRegion: 'İstanbul',
        addressCountry: 'TR',
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: '41.0082',
        longitude: '28.9784',
      },
      areaServed: [
        { '@type': 'Country', name: 'Türkiye' },
        { '@type': 'AdministrativeArea', name: 'İstanbul' },
        { '@type': 'AdministrativeArea', name: 'Ankara' },
        { '@type': 'AdministrativeArea', name: 'İzmir' },
        { '@type': 'AdministrativeArea', name: 'Bursa' },
        { '@type': 'AdministrativeArea', name: 'Antalya' },
      ],
      founder: {
        '@type': 'Person',
        name: 'Şeyhmus Meşe',
        jobTitle: 'Kurucu & Baş Yazılım Mimarı',
        url: SITE_URL,
      },
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: siteConfig.contact.phone,
        contactType: 'customer support',
        email: siteConfig.contact.email,
        availableLanguage: ['Turkish', 'English'],
        areaServed: 'TR',
      },
      sameAs: [SITE_URL],
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'Tasarım ve Yazılım Hizmetleri',
        itemListElement: siteConfig.pricing.services.map((service, index) => ({
          '@type': 'OfferCatalogItem',
          position: index + 1,
          itemOffered: {
            '@id': `${SITE_URL}/#service-${service.id}`,
          },
        })),
      },
    },
    ...siteConfig.pricing.services.map((service) => ({
      '@type': 'Service',
      '@id': `${SITE_URL}/#service-${service.id}`,
      name: service.name,
      serviceType: service.name,
      description: service.description,
      provider: { '@id': `${SITE_URL}/#organization` },
      areaServed: { '@type': 'Country', name: 'Türkiye' },
      offers: {
        '@type': 'Offer',
        price: service.price,
        priceCurrency: 'TRY',
        availability: 'https://schema.org/InStock',
        priceValidUntil: '2026-12-31',
        url: `${SITE_URL}/#fiyat-hesapla`,
      },
    })),
    {
      '@type': 'FAQPage',
      '@id': `${SITE_URL}/#faq`,
      mainEntity: FAQS.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer,
        },
      })),
    },
    {
      '@type': 'ItemList',
      '@id': `${SITE_URL}/#showcases`,
      name: 'MESE SYSTEM Sektörel Demo ve Canlı Proje Vitrini',
      description: 'Türkiye pazarındaki işletmeler için geliştirilmiş 19 adet canlı web sitesi ve arayüz demosu.',
      numberOfItems: PORTFOLIO_PROJECTS.length,
      itemListElement: PORTFOLIO_PROJECTS.map((project, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'SoftwareApplication',
          name: `${project.name} — ${project.subtitle}`,
          applicationCategory: project.category,
          operatingSystem: 'All',
          url: `${SITE_URL}${project.href}`,
          description: project.description,
          image: `${SITE_URL}${project.previewImage}`,
        },
      })),
    },
  ]

  return JSON.stringify(
    { '@context': 'https://schema.org', '@graph': graph },
    null,
    0
  ).replace(/</g, '\\u003c')
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="tr" className={`${inter.variable} ${sora.variable}`} suppressHydrationWarning>
      <body className="min-h-screen bg-[#f7f4ed] font-sans text-stone-800" suppressHydrationWarning>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: buildJsonLd() }}
        />
        <Header />
        <main>{children}</main>
        <Footer />
        <FloatingWhatsApp />
      </body>
    </html>
  )
}
