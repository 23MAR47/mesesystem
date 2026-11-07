'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Pause,
  Play,
} from 'lucide-react'
import {
  FEATURED_PROJECT_IDS,
  PORTFOLIO_PROJECTS,
} from '@/config/referenceSite'
import { SHOWCASE_WEB_PROJECTS } from '@/config/showcaseProjects'
import ReferenceProjectImage from '@/components/ReferenceProjectImage'
import { buildWhatsAppContactHref } from '@/lib/whatsapp'

/* Unified carousel item type */
interface CarouselProject {
  id: string
  name: string
  subtitle: string
  href: string
  previewImage?: string
  type: 'showcase' | 'portfolio'
  slug?: string
}

/* 13 sektörel demo projesi (indeks 0-12) */
const INDUSTRY_DEMO_COUNT = 13
const showcaseItems: CarouselProject[] = SHOWCASE_WEB_PROJECTS.slice(0, INDUSTRY_DEMO_COUNT).map((p) => ({
  id: p.slug,
  name: p.name,
  subtitle: p.category,
  href: `/showcases/${p.slug}/index.html`,
  previewImage: `/projects/${p.slug}.jpg`,
  type: 'showcase' as const,
  slug: p.slug,
}))

/* 6 öne çıkan portföy projesi (indeks 13-18) */
const portfolioItems: CarouselProject[] = FEATURED_PROJECT_IDS.map((id) => {
  const p = PORTFOLIO_PROJECTS.find((project) => project.id === id)!
  return {
    id: p.id,
    name: p.name,
    subtitle: p.subtitle,
    href: p.href,
    previewImage: p.previewImage,
    type: 'portfolio' as const,
  }
})

/* Birleşik carousel: ilk 13 eleman Sektörel Demolar, sonraki 6 eleman Portföy Referans Projeleri */
const featuredProjects: CarouselProject[] = [...showcaseItems, ...portfolioItems]

export default function Hero() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const [isHovered, setIsHovered] = useState(false)
  const current = featuredProjects[currentIndex]

  useEffect(() => {
    if (!isPlaying || isHovered) return
    const timer = window.setInterval(() => {
      setCurrentIndex((index) => (index + 1) % featuredProjects.length)
    }, 5000)
    return () => window.clearInterval(timer)
  }, [isPlaying, isHovered])

  function showProject(index: number) {
    setCurrentIndex((index + featuredProjects.length) % featuredProjects.length)
  }

  if (!current) return null

  const displayUrl =
    current.type === 'showcase'
      ? `mesesystem.com/demolar/${current.id}`
      : current.href.replace(/^https?:\/\//, '').replace(/\/$/, '')

  return (
    <section
      id="anasayfa"
      className="relative overflow-hidden bg-[#f6f4ef] px-5 pb-16 pt-28 text-zinc-950 sm:px-8 sm:pb-20 sm:pt-32 lg:px-12 lg:pb-24 lg:pt-36"
    >
      <div className="relative mx-auto max-w-7xl">
        {/* Ambient Glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -inset-x-8 bottom-12 top-4 rounded-[50%] bg-[#ded6ca]/40 blur-3xl"
        />

        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-8 xl:gap-12">
          {/* SOL KOLON: Manşet, Açıklama, CTA Butonları ve Güven Rozetleri */}
          <div className="flex flex-col items-start text-left lg:col-span-5 xl:col-span-5">
            <div className="flex items-center gap-2 text-xs font-medium text-stone-500">
              <span className="h-px w-6 bg-stone-400" />
              <span>Tasarım ve yazılım stüdyosu, İstanbul</span>
            </div>

            <h1 className="mt-4 font-display text-4xl font-extrabold tracking-tight text-zinc-950 sm:text-5xl lg:text-5xl xl:text-6xl">
              İşletmenize özel.<br />
              <span className="text-[#8b5835]">Her ayrıntısıyla.</span>
            </h1>

            <p className="mt-5 max-w-lg text-base leading-relaxed text-stone-600 sm:text-lg">
              Web siteleri, mobil uygulamalar ve işinizi kolaylaştıran yazılımlar geliştiriyoruz. İlk fikirden yayına, birlikte.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a
                href="#demolar"
                data-preserve-dark
                style={{ color: '#ffffff' }}
                className="focus-ring inline-flex h-12 items-center justify-center rounded-full bg-zinc-950 px-7 text-sm font-semibold !text-white shadow-md transition-all hover:bg-black hover:scale-[1.02] active:scale-[0.98]"
              >
                Projeleri incele ↓
              </a>
              <a
                href="/#fiyat-hesapla"
                className="focus-ring inline-flex h-12 items-center justify-center gap-1.5 rounded-full border border-stone-300 bg-white/80 px-7 text-sm font-semibold text-stone-900 shadow-sm transition-colors hover:border-stone-500 hover:bg-white"
              >
                Fiyat hesapla ↗
              </a>
              <a
                href={buildWhatsAppContactHref()}
                target="_blank"
                rel="noreferrer"
                className="focus-ring inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#20bd5a] hover:scale-[1.02] active:scale-[0.98]"
              >
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                </svg>
                WhatsApp ile Yazın
              </a>
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-5 text-xs text-stone-600 sm:gap-6">
              <span className="flex items-center gap-1.5 font-medium">
                <svg className="h-4 w-4 text-[#8b5835]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                </svg>
                Size özel tasarım
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <svg className="h-4 w-4 text-[#8b5835]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                </svg>
                Önce ücretsiz demo
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <svg className="h-4 w-4 text-[#8b5835]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                </svg>
                Doğrudan iletişim
              </span>
            </div>
          </div>

          {/* SAĞ KOLON: Safari Tarayıcı Mockup'ı + iPhone Mockup'ı + Sayfalama */}
          <div className="w-full lg:col-span-7 xl:col-span-7">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
              className="relative"
              role="region"
              aria-label="Öne çıkan projeler"
              aria-roledescription="carousel"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <div className="relative rounded-2xl border border-zinc-200 bg-white shadow-[0_30px_90px_-40px_rgba(24,24,27,0.28)]">
                {/* Safari Header */}
                <div className="flex h-9 items-center gap-2.5 rounded-t-2xl border-b border-zinc-200 bg-white px-3 sm:h-10 sm:gap-3 sm:px-4">
                  <div className="flex shrink-0 gap-1.5" aria-hidden="true">
                    <span className="h-2 w-2 rounded-full bg-[#ff5f57]" />
                    <span className="h-2 w-2 rounded-full bg-[#febc2e]" />
                    <span className="h-2 w-2 rounded-full bg-[#28c840]" />
                  </div>
                  <span className="flex h-6 min-w-0 flex-1 items-center justify-center truncate rounded-md border border-zinc-100 bg-zinc-50 px-3 font-mono text-[10px] text-zinc-500">
                    {displayUrl}
                  </span>
                  <a
                    href={current.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`${current.name} sitesini yeni sekmede aç`}
                    className="text-zinc-400 hover:text-zinc-700 transition-colors"
                  >
                    <ArrowUpRight className="h-3.5 w-3.5 shrink-0" aria-hidden />
                  </a>
                </div>

                <div className="relative">
                  <div className="relative aspect-[1.32/1] overflow-hidden bg-zinc-100 sm:aspect-[1.55/1]">
                    <AnimatePresence mode="wait">
                      <motion.a
                        key={current.id}
                        href={current.href}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`${current.name} sitesini aç`}
                        className="group absolute inset-0"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4 }}
                      >
                        <ReferenceProjectImage
                          project={current}
                          priority={currentIndex === 0}
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 700px"
                          className="h-full w-full"
                        />
                      </motion.a>
                    </AnimatePresence>
                  </div>

                  {/* Overlapping iPhone Mockup */}
                  <div className="absolute bottom-[-2.8rem] right-3 z-10 aspect-[390/844] w-[clamp(7rem,26vw,11rem)] overflow-hidden rounded-[1.45rem] border-[4px] border-zinc-900 bg-zinc-950 p-[2px] shadow-[0_14px_34px_-12px_rgba(24,24,27,0.45)] sm:bottom-[-3.2rem] sm:right-5 sm:rounded-[1.7rem] sm:border-[5px]">
                    <div className="relative h-full w-full overflow-hidden rounded-[1.15rem] bg-zinc-100 sm:rounded-[1.35rem]">
                      <a
                        href={current.href}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`${current.name} mobil sitesini aç`}
                        className="group absolute inset-0"
                      >
                        <ReferenceProjectImage
                          key={current.id}
                          project={current}
                          mobile
                          sizes="(max-width: 640px) 112px, 176px"
                          className="h-full w-full"
                        />
                      </a>
                      <div
                        aria-hidden="true"
                        className="pointer-events-none absolute left-1/2 top-1 z-10 h-2 w-7 -translate-x-1/2 rounded-full bg-zinc-950 sm:h-2.5 sm:w-9"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Project Details */}
              <div className="flex min-h-[4.5rem] items-start justify-between gap-4 pr-[clamp(7.5rem,28vw,11.5rem)] pt-4 sm:min-h-[5rem]">
                <div className="min-w-0">
                  <h2 className="truncate font-display text-sm font-semibold text-zinc-950 sm:text-base">
                    {current.name}
                  </h2>
                  <p className="mt-0.5 truncate text-xs text-zinc-600 sm:text-sm">
                    {current.subtitle}
                  </p>
                </div>
                <a
                  href={current.href}
                  target="_blank"
                  rel="noreferrer"
                  className="focus-ring hidden shrink-0 items-center gap-1 pt-1 text-xs font-medium text-zinc-700 hover:text-[#8b5835] sm:inline-flex"
                >
                  Siteyi aç
                  <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
                </a>
              </div>

              {/* Dots and Navigation Controls */}
              <div className="mt-2 flex items-center justify-between gap-3 px-1 text-[10px] text-zinc-600 sm:mt-3">
                <div className="flex items-center gap-1.5 overflow-hidden" aria-label="Proje seçimi">
                  {featuredProjects.map((project, index) => (
                    <button
                      key={project.id}
                      type="button"
                      onClick={() => showProject(index)}
                      aria-label={`${project.name} projesini göster`}
                      aria-pressed={currentIndex === index}
                      className={`h-1.5 shrink-0 rounded-full transition-all ${
                        currentIndex === index ? 'w-5 bg-[#8b5835]' : 'w-1.5 bg-zinc-300'
                      }`}
                    />
                  ))}
                </div>

                <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
                  <span className="mr-1 tabular-nums font-mono text-zinc-600">
                    {String(currentIndex + 1).padStart(2, '0')} /{' '}
                    {String(featuredProjects.length).padStart(2, '0')}
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsPlaying((playing) => !playing)}
                    aria-label={isPlaying ? 'Otomatik geçişi durdur' : 'Otomatik geçişi başlat'}
                    className="focus-ring flex h-8 w-8 items-center justify-center rounded-full border border-zinc-300 text-zinc-700 transition-colors hover:bg-white"
                  >
                    {isPlaying ? (
                      <Pause className="h-3 w-3" aria-hidden />
                    ) : (
                      <Play className="h-3 w-3" aria-hidden />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => showProject(currentIndex - 1)}
                    aria-label="Önceki proje"
                    className="focus-ring flex h-8 w-8 items-center justify-center rounded-full border border-zinc-300 text-zinc-700 transition-colors hover:bg-white"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
                  </button>
                  <button
                    type="button"
                    onClick={() => showProject(currentIndex + 1)}
                    aria-label="Sonraki proje"
                    className="focus-ring flex h-8 w-8 items-center justify-center rounded-full border border-zinc-300 text-zinc-700 transition-colors hover:bg-white"
                  >
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
