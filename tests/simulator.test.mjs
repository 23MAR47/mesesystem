/**
 * MESE SYSTEM ana sayfasındaki mobil demo kartlarını ve yerel showcase bağlantılarını doğrular.
 */

import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, it, expect, run } from './harness.mjs'
import { DEMO_PROJECTS } from '../config/referenceSite.ts'

const HERE = dirname(fileURLToPath(import.meta.url))
const DEMO_SHOWCASE_PATH = resolve(HERE, '../components/DemoShowcase.tsx')
const showcaseSource = readFileSync(DEMO_SHOWCASE_PATH, 'utf8')

describe('Canlı demo koleksiyonu', () => {
  it('19 örnek proje tanımlıdır ve her birinin canlı adresi vardır', () => {
    expect(DEMO_PROJECTS.length).toBe(19)
    for (const project of DEMO_PROJECTS) {
      expect(project.href.startsWith('/showcases/')).toBeTruthy()
      expect(project.name.length > 0).toBeTruthy()
      expect(project.previewImage.length > 0).toBeTruthy()
    }
  })

  it('mobil önizlemeler yeni sekmede açılır', () => {
    expect(showcaseSource).toContain('project={project}')
    expect(showcaseSource).toContain('mobile')
    expect(showcaseSource).toContain('target="_blank"')
    expect(showcaseSource).toContain('rel="noreferrer"')
  })

  it('19 sektör sitesi demo vitrininde listelenir', () => {
    expect(showcaseSource).toContain('SHOWCASE_WEB_PROJECTS.slice(0, INDUSTRY_DEMO_COUNT)')
    expect(showcaseSource).toContain('href={`/showcases/${project.slug}/index.html`}')
    expect(showcaseSource).toContain('<ShowcasePreview')
  })

})

run()
