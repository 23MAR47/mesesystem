'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Lock,
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

/* 19 sektörel demo projesi (indeks 0-18) */
const INDUSTRY_DEMO_COUNT = 19
const featuredProjects: CarouselProject[] = SHOWCASE_WEB_PROJECTS.slice(0, INDUSTRY_DEMO_COUNT).map((p) => ({
  id: p.slug,
  name: p.name,
  subtitle: p.category,
  href: `/showcases/${p.slug}/index.html`,
  previewImage: `/projects/${p.slug}.jpg`,
  type: 'showcase' as const,
  slug: p.slug,
}))

export default function Hero() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const [isHovered, setIsHovered] = useState(false)
  const current = featuredProjects[currentIndex]

  useEffect(() => {
    if (!isPlaying || isHovered) return
    const timer = window.setInterval(() => {
      setCurrentIndex((index) => (index + 1) % featuredProjects.length)
    }, 6200)
    return () => window.clearInterval(timer)
  }, [isPlaying, isHovered, currentIndex])

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
              <span>Tasarım ve yazılım stüdyosu</span>
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
                href={buildWhatsAppContactHref(
                  'Merhaba MESE SYSTEM! Web tasarımı ve yazılım projemiz için bilgi ve teklif almak istiyorum.'
                )}
                target="_blank"
                rel="noreferrer"
                className="focus-ring inline-flex h-12 items-center justify-center rounded-full border border-stone-300 bg-white/80 px-7 text-sm font-semibold text-stone-800 backdrop-blur-sm transition-all hover:border-stone-400 hover:bg-white active:scale-[0.98]"
              >
                WhatsApp ile yazın →
              </a>
            </div>

            <div className="mt-12 flex flex-wrap items-center gap-6 border-t border-stone-200/80 pt-6 text-xs text-stone-500">
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-[#8b5835]" />
                <span>Önce demo, sonra karar</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-stone-400" />
                <span>1 yıl teknik destek</span>
              </div>
            </div>
          </div>

          {/* SAĞ KOLON: Sequoia macOS Tarayıcı & iPhone 16 Pro Çerçeveli Canlı Mockup */}
          <div className="relative lg:col-span-7 xl:col-span-7">
            <div
              className="group/carousel relative"
              aria-label="Öne çıkan projeler"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              onKeyDown={(e) => {
                if (e.key === 'ArrowLeft') showProject(currentIndex - 1)
                if (e.key === 'ArrowRight') showProject(currentIndex + 1)
              }}
              onPointerDown={(e) => {
                if (e.pointerType === 'touch') {
                  setIsHovered(false)
                }
              }}
              onTouchStart={() => setIsHovered(false)}
            >
              <div className="relative rounded-2xl border border-zinc-200/90 bg-white shadow-[0_30px_90px_-40px_rgba(24,24,27,0.28)] ring-1 ring-black/[0.04]">
                {/* macOS Sequoia Safari Title Bar */}
                <div className="flex h-10 items-center justify-between rounded-t-2xl border-b border-zinc-200/80 bg-zinc-50/95 px-3.5 backdrop-blur-md sm:px-4">
                  <div className="flex shrink-0 items-center gap-2" aria-hidden="true">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57] ring-1 ring-black/10 transition-transform hover:scale-110" />
                    <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e] ring-1 ring-black/10 transition-transform hover:scale-110" />
                    <span className="h-2.5 w-2.5 rounded-full bg-[#28c840] ring-1 ring-black/10 transition-transform hover:scale-110" />
                  </div>
                  <div className="flex h-6 max-w-[280px] flex-1 items-center justify-center gap-1.5 truncate rounded-lg border border-zinc-200/70 bg-white/90 px-3 font-mono text-[10px] text-zinc-600 shadow-sm sm:max-w-[340px]">
                    <Lock className="h-2.5 w-2.5 text-emerald-600 shrink-0" aria-hidden="true" />
                    <span className="truncate">{displayUrl}</span>
                  </div>
                  <a
                    href={current.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`${current.name} sitesini yeni sekmede aç`}
                    className="text-zinc-400 hover:text-zinc-700 transition-colors"
                  >
                    <ArrowUpRight className="h-4 w-4 shrink-0" aria-hidden />
                  </a>
                </div>

                <div className="relative">
                  <div className="relative aspect-[1.32/1] overflow-hidden bg-zinc-100 sm:aspect-[1.55/1]">
                    <AnimatePresence>
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
                        transition={{ duration: 0.35, ease: 'easeInOut' }}
                      >
                        <ReferenceProjectImage
                          project={current}
                          autoScroll
                          priority={currentIndex === 0}
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 700px"
                          className="h-full w-full"
                        />
                      </motion.a>
                    </AnimatePresence>
                  </div>

                  {/* Overlapping Precision iPhone 16 Pro Dynamic Island Chassis */}
                  <div className="absolute bottom-[-3.8rem] right-3 z-10 aspect-[390/844] w-[clamp(7rem,26vw,11rem)] overflow-hidden rounded-[2.1rem] border-[5px] border-[#1d1e24] bg-[#0c0d12] p-[2px] shadow-[0_20px_45px_-12px_rgba(0,0,0,0.7)] ring-1 ring-white/10 sm:bottom-[-4.5rem] sm:right-5 sm:rounded-[2.4rem] sm:border-[5px]">
                    {/* Dynamic Island */}
                    <div className="pointer-events-none absolute left-1/2 top-1.5 z-20 h-2.5 w-10 -translate-x-1/2 rounded-full bg-black ring-1 ring-white/10 flex items-center justify-end pr-0.5">
                      <span className="h-1 w-1 rounded-full bg-blue-900/40" />
                    </div>
                    {/* Screen Viewport */}
                    <div className="relative h-full w-full overflow-hidden rounded-[1.7rem] bg-zinc-950 sm:rounded-[2rem]">
                      <AnimatePresence>
                        <motion.a
                          key={current.id}
                          href={current.href}
                          target="_blank"
                          rel="noreferrer"
                          aria-label={`${current.name} mobil sitesini aç`}
                          className="group absolute inset-0"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.35, ease: 'easeInOut' }}
                        >
                          <ReferenceProjectImage
                            project={current}
                            mobile
                            autoScroll
                            sizes="(max-width: 640px) 112px, 176px"
                            className="h-full w-full"
                          />
                        </motion.a>
                      </AnimatePresence>
                    </div>
                    {/* Home Indicator */}
                    <div className="pointer-events-none absolute inset-x-0 bottom-1 flex justify-center">
                      <span className="h-0.5 w-8 rounded-full bg-white/40" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Project Details */}
              <div className="flex min-h-[4.5rem] items-start justify-between gap-4 pr-[clamp(7.5rem,28vw,11.5rem)] pt-4 sm:min-h-[5rem]">
                <div className="min-w-0">
                  <h3 className="truncate font-display text-sm font-semibold text-zinc-950 sm:text-base">
                    {current.name}
                  </h3>
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
                <div className="flex max-w-[130px] sm:max-w-xs items-center gap-1 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden" aria-label="Proje seçimi">
                  {featuredProjects.map((project, index) => (
                    <button
                      key={project.id}
                      type="button"
                      onClick={() => showProject(index)}
                      aria-label={`${project.name} projesini göster`}
                      aria-pressed={currentIndex === index}
                      className={`h-1.5 shrink-0 rounded-full transition-all ${currentIndex === index ? 'w-5 bg-[#8b5835]' : 'w-1.5 bg-zinc-300'
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
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
