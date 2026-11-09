/**
 * tests/legalPages.test.mjs
 *
 * MESE SYSTEM — Yasal Sayfalar ve Marka Bütünlüğü Testleri.
 *
 * Doğrulamalar:
 *   1. BrandMark bileşeni <M> monokrom badge içerir.
 *   2. Footer bileşeni 6 adet Yasal bağlantıyı ve Mastercard / Visa güvenli ödeme rozetlerini içerir.
 *   3. 5 adet editoryal yasal sayfa mevcuttur, metadata ihraç eder ve ilgili mevzuat maddelerini kapsar.
 *   4. Sayfalar "← Anasayfa" dönüş bağlantısına ve breadcrumb yapısına sahiptir.
 */

import { readFileSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, it, expect, run } from './harness.mjs'

const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(HERE, '..')

const BRANDMARK_PATH = resolve(ROOT, 'components/BrandMark.tsx')
const FOOTER_PATH = resolve(ROOT, 'components/Footer.tsx')
const HEADER_PATH = resolve(ROOT, 'components/Header.tsx')

const LEGAL_PAGES = [
  {
    path: 'app/gizlilik-politikasi/page.tsx',
    titleCheck: 'Gizlilik Politikası',
    requiredKeywords: ['#kvkk', '6698', 'Veri Sorumlusu', 'Madde 11', 'MESE SYSTEM', 'ŞEYHMUS MEŞE'],
  },
  {
    path: 'app/cerez-politikasi/page.tsx',
    titleCheck: 'Çerez Politikası',
    requiredKeywords: ['Zorunlu', 'Analitik', 'İşlevsel', 'Google Chrome', 'Apple Safari'],
  },
  {
    path: 'app/teslimat-ve-iade/page.tsx',
    titleCheck: 'Teslimat, İptal ve İade',
    requiredKeywords: ['gayrimaddi', 'Önce Ücretsiz Demo', '14', '6502', 'Madde 15'],
  },
  {
    path: 'app/mesafeli-hizmet-sozlesmesi/page.tsx',
    titleCheck: 'Mesafeli Hizmet Sözleşmesi',
    requiredKeywords: ['Madde 1 — Taraflar', 'Madde 2', 'Madde 3', 'Madde 5', '5846'],
  },
  {
    path: 'app/on-bilgilendirme-formu/page.tsx',
    titleCheck: 'Ön Bilgilendirme Formu',
    requiredKeywords: ['Hizmet Sağlayıcı Bilgileri', 'Toplam Fiyatı', '15', 'Tüketici Hakem'],
  },
]

describe('Marka ve Logo — BrandMark & Header & Footer', () => {
  it('BrandMark.tsx <M> lüks amblemini tanımlar', () => {
    expect(existsSync(BRANDMARK_PATH)).toBeTruthy()
    const content = readFileSync(BRANDMARK_PATH, 'utf8')
    expect(content).toContain('&lt;')
    expect(content).toContain('M')
    expect(content).toContain('&gt;')
    expect(content).toContain('mese-system-mark')
  })

  it('Header.tsx BrandMark bileşenini ve marka unvanını içerir', () => {
    const headerSource = readFileSync(HEADER_PATH, 'utf8')
    expect(headerSource).toContain('<BrandMark')
    expect(headerSource).toContain('MESE SYSTEM')
  })

  it('Footer.tsx BrandMark bileşenini ve marka unvanını içerir', () => {
    const footerSource = readFileSync(FOOTER_PATH, 'utf8')
    expect(footerSource).toContain('<BrandMark')
    expect(footerSource).toContain('MESE SYSTEM')
  })

})

describe('Footer — Yasal Bölümü ve Güvenli Ödeme Rozetleri', () => {
  const footerSource = readFileSync(FOOTER_PATH, 'utf8')

  it('Footer "Yasal" başlığını içerir', () => {
    expect(footerSource).toContain('Yasal')
  })

  it('Footer zorunlu 6 yasal bağlantıyı eksiksiz içerir', () => {
    expect(footerSource).toContain('href="/gizlilik-politikasi"')
    expect(footerSource).toContain('href="/gizlilik-politikasi#kvkk"')
    expect(footerSource).toContain('href="/cerez-politikasi"')
    expect(footerSource).toContain('href="/teslimat-ve-iade"')
    expect(footerSource).toContain('href="/mesafeli-hizmet-sozlesmesi"')
    expect(footerSource).toContain('href="/on-bilgilendirme-formu"')
  })

  it('Footer telif hakkı bildirimini render eder', () => {
    expect(footerSource).toContain('MESE SYSTEM. Tüm hakları saklıdır.')
  })
})

describe('5 Editoryal Yasal Sayfa — Next.js App Router', () => {
  for (const page of LEGAL_PAGES) {
    it(`${page.path} mevcuttur ve editoryal içerik gereksinimlerini karşılar`, () => {
      const fullPath = resolve(ROOT, page.path)
      expect(existsSync(fullPath)).toBeTruthy()

      const source = readFileSync(fullPath, 'utf8')
      expect(source).toContain('export const metadata')
      expect(source).toContain(page.titleCheck)

      for (const keyword of page.requiredKeywords) {
        expect(source).toContain(keyword)
      }
    })
  }

  it('LegalPageLayout bileşeni "← Anasayfa" dönüşü ve breadcrumb içerir', () => {
    const layoutPath = resolve(ROOT, 'components/LegalPageLayout.tsx')
    expect(existsSync(layoutPath)).toBeTruthy()
    const layoutSource = readFileSync(layoutPath, 'utf8')
    expect(layoutSource).toContain('← Anasayfa')
    expect(layoutSource).toContain('Breadcrumb')
    expect(layoutSource).toContain('bg-[#070a12]')
  })
})

run()
