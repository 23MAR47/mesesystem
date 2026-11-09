import type { MetadataRoute } from 'next'
import { PORTFOLIO_PROJECTS } from '@/config/referenceSite'

const SITE_URL = 'https://mesesystem.com'

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()

  const legalPages = [
    '/cerez-politikasi',
    '/gizlilik-politikasi',
    '/mesafeli-hizmet-sozlesmesi',
    '/on-bilgilendirme-formu',
    '/teslimat-ve-iade',
  ].map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified,
    changeFrequency: 'monthly' as const,
    priority: 0.3,
  }))

  const demoPages = PORTFOLIO_PROJECTS.map((project) => ({
    url: `${SITE_URL}${project.href}`,
    lastModified,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  return [
    {
      url: SITE_URL,
      lastModified,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/showcases/index.html`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    ...legalPages,
    ...demoPages,
  ]
}
