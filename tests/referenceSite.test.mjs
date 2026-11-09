import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, it, expect, run } from './harness.mjs'
import {
  DEMO_PROJECTS,
  FEATURED_PROJECT_IDS,
  FAQS,
  PORTFOLIO_FILTERS,
  PORTFOLIO_PROJECTS,
  PRICING_ADDONS,
  PRICING_SERVICES,
  PRICING_SIZES,
  PROCESS_BENEFITS,
  PROCESS_STEPS,
  SERVICES,
} from '../config/referenceSite.ts'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

describe('Referans site içerik modeli', () => {
  it('19 portfolyo projesini beş filtre kategorisine dağıtır', () => {
    expect(PORTFOLIO_PROJECTS.length).toBe(19)
    expect(PORTFOLIO_FILTERS.length).toBe(5)
    const categoryCounts = Object.fromEntries(
      PORTFOLIO_FILTERS.map((category) => [
        category,
        PORTFOLIO_PROJECTS.filter((project) => project.category === category).length,
      ])
    )
    expect(categoryCounts).toEqual({
      'Hizmet & Randevu': 7,
      'E-Ticaret & Menü': 3,
      'Teknik Servis': 4,
      'Konaklama & Yapı': 3,
      'Kurumsal & Danışmanlık': 2,
    })
  })

  it('altı öne çıkan proje ile 19 demo kartı için gerekli yerel alanları sağlar', () => {
    expect(FEATURED_PROJECT_IDS.length).toBe(6)
    expect(FEATURED_PROJECT_IDS.every((id) => PORTFOLIO_PROJECTS.some((project) => project.id === id))).toBeTruthy()
    expect(FEATURED_PROJECT_IDS).toEqual([
      'berber',
      'emlak',
      'qr-menu',
      'otel',
      'kuafor',
      'market',
    ])
    for (const id of FEATURED_PROJECT_IDS) {
      const project = PORTFOLIO_PROJECTS.find((entry) => entry.id === id)
      expect(Boolean(project?.previewImage)).toBeTruthy()
      expect(fs.existsSync(path.join(ROOT, 'public', project.previewImage.slice(1)))).toBeTruthy()
    }
    expect(DEMO_PROJECTS.length).toBe(19)
    for (const project of DEMO_PROJECTS) {
      expect(project.href.startsWith('/showcases/')).toBeTruthy()
      expect(project.previewImage.length > 0).toBeTruthy()
      expect(fs.existsSync(path.join(ROOT, 'public', project.previewImage.slice(1)))).toBeTruthy()
    }
  })

  it('hizmet, süreç ve SSS içeriklerini tam gruplar halinde içerir', () => {
    expect(SERVICES.length).toBe(4)
    expect(PROCESS_STEPS.length).toBe(4)
    expect(PROCESS_BENEFITS.length).toBe(4)
    expect(FAQS.length).toBe(9)
  })

  it('SSS fiyat açıklaması hesaplayıcıyla tutarlıdır', () => {
    expect(FAQS[0].answer).toContain('Kişisel / portfolyo sitesi 9.000 ₺')
    expect(FAQS[0].answer).toContain('Özel web yazılımı / panel 50.000 ₺')
    expect(FAQS[0].answer).toContain('Mobil uygulama (iOS + Android) 50.000 ₺')
    expect(FAQS[0].answer).toContain('Çoklu dil desteği dahildir.')
    expect(FAQS[0].answer.includes('yapay zekâ')).toBeFalsy()
  })

  it('fiyatlandırma seçenekleri ve ek hizmetleri doğru modeller', () => {
    expect(PRICING_SERVICES.map((service) => service.price)).toEqual([
      9000, 9000, 40000, 50000, 50000,
    ])
    expect(PRICING_SIZES.map((size) => size.price)).toEqual([0, 5000, 10000])
    expect(PRICING_ADDONS.length).toBe(3)
    expect(PRICING_ADDONS.map((addon) => addon.price)).toEqual([3000, 0, 3000])
    expect(PRICING_ADDONS.map((addon) => addon.id)).toEqual([
      'management',
      'multilingual',
      'advanced-seo',
    ])
    expect(PRICING_ADDONS.some((addon) => addon.id === 'ai')).toBeFalsy()
  })
})

run()
