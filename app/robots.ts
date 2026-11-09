import type { MetadataRoute } from 'next'

const SITE_URL = 'https://mesesystem.com'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/showcases/'],
        disallow: ['/api/'],
      },
      {
        userAgent: 'Googlebot',
        allow: ['/', '/showcases/'],
        disallow: ['/api/'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
