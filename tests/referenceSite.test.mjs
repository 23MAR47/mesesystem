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
  it('29 portfolyo projesini sekiz filtre kategorisine dağıtır', () => {
    expect(PORTFOLIO_PROJECTS.length).toBe(29)
    expect(PORTFOLIO_FILTERS.length).toBe(8)
    const categoryCounts = Object.fromEntries(
      PORTFOLIO_FILTERS.map((category) => [
        category,
        PORTFOLIO_PROJECTS.filter((project) => project.category === category).length,
      ])
    )
    expect(categoryCounts).toEqual({
      Sağlık: 3,
      Fitness: 2,
      'E Ticaret': 2,
      Güzellik: 2,
      Veterinerlik: 2,
      Konaklama: 2,
      'Diş Hekimliği': 2,
      Diğer: 14,
    })
  })

  it('altı öne çıkan proje ile dokuz demo kartı için gerekli alanları sağlar', () => {
    expect(FEATURED_PROJECT_IDS.length).toBe(6)
    expect(FEATURED_PROJECT_IDS.every((id) => PORTFOLIO_PROJECTS.some((project) => project.id === id))).toBeTruthy()
    expect(FEATURED_PROJECT_IDS).toEqual([
      'pres-dis',
      'gustav',
      'sakli-cave-house',
      'diyetoloji',
      'ceren-sude',
      'zenn-studio',
    ])
    expect(
      FEATURED_PROJECT_IDS.map((id) => PORTFOLIO_PROJECTS.find((project) => project.id === id)?.href)
    ).toEqual([
      'https://presdis.vercel.app/',
      'https://gustav-murex.vercel.app/',
      'https://saklicave-house.vercel.app/',
      'https://diyetoloji.vercel.app/',
      'https://www.ptcerensude.com/',
      'https://zennstudio.vercel.app/',
    ])
    for (const id of FEATURED_PROJECT_IDS) {
      const project = PORTFOLIO_PROJECTS.find((entry) => entry.id === id)
      expect(Boolean(project?.previewImage)).toBeTruthy()
      if (project.previewImage.startsWith('/projects/')) {
        expect(fs.existsSync(path.join(ROOT, 'public', project.previewImage.slice(1)))).toBeTruthy()
      } else {
        expect(project.previewImage.startsWith('https://')).toBeTruthy()
      }
    }
    expect(DEMO_PROJECTS.length).toBe(9)
    for (const project of DEMO_PROJECTS) {
      expect(project.href.startsWith('https://')).toBeTruthy()
      expect(project.previewImage.length > 0).toBeTruthy()
    }
  })

  it('hizmet, süreç ve SSS içeriklerini tam gruplar halinde içerir', () => {
    expect(SERVICES.length).toBe(4)
    expect(PROCESS_STEPS.length).toBe(4)
    expect(PROCESS_BENEFITS.length).toBe(4)
    expect(FAQS.length).toBe(9)
  })

  it('beş proje türü, kapsam, ek hizmet ve teslimat seçeneklerini içerir', () => {
    expect(PRICING_SERVICES.map((service) => service.price)).toEqual([
      9000, 9000, 40000, 50000, 50000,
    ])
    expect(PRICING_SIZES.map((size) => size.price)).toEqual([0, 5000, 10000])
    expect(PRICING_ADDONS.map((addon) => addon.price)).toEqual([3000, 0, 0, 3000])
  })

  it('SSS fiyat açıklaması hesaplayıcıyla tutarlıdır', () => {
    expect(FAQS[0].answer).toContain('Kişisel / portfolyo sitesi 9.000 ₺')
    expect(FAQS[0].answer).toContain('Özel web yazılımı / panel 50.000 ₺')
    expect(FAQS[0].answer).toContain('Mobil uygulama (iOS + Android) 50.000 ₺')
  })
})

run()
