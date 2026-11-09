'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowDown, ArrowUpRight, Eye, MessageCircle } from 'lucide-react'
import {
  FEATURED_PROJECT_IDS,
  PORTFOLIO_FILTERS,
  PORTFOLIO_PROJECTS,
  type PortfolioFilter,
  type PortfolioProject,
} from '@/config/referenceSite'
import { SHOWCASE_WEB_PROJECTS, type ShowcaseWebProject } from '@/config/showcaseProjects'
import ReferenceProjectImage from '@/components/ReferenceProjectImage'
import ShowcasePreviewModal from '@/components/ShowcasePreviewModal'
import { buildWhatsAppContactHref } from '@/lib/whatsapp'

const INITIAL_PROJECT_COUNT = 6
const featuredProjects = FEATURED_PROJECT_IDS.map((id) =>
  PORTFOLIO_PROJECTS.find((project) => project.id === id)
).filter((project): project is PortfolioProject => project !== undefined)
const featuredProjectIdSet = new Set<string>(FEATURED_PROJECT_IDS)
const orderedProjects = [
  ...featuredProjects,
  ...PORTFOLIO_PROJECTS.filter((project) => !featuredProjectIdSet.has(project.id)),
]

export default function PortfolioSection() {
  const [activeCategory, setActiveCategory] = useState<PortfolioFilter | 'Tümü'>('Tümü')
  const [showAll, setShowAll] = useState(false)
  const [previewProject, setPreviewProject] = useState<ShowcaseWebProject | null>(null)

  const filteredProjects = orderedProjects.filter(
    (project) => activeCategory === 'Tümü' || project.category === activeCategory
  )
  const visibleProjects = showAll
    ? filteredProjects
    : filteredProjects.slice(0, INITIAL_PROJECT_COUNT)
  const hiddenProjectCount = filteredProjects.length - visibleProjects.length

  function selectCategory(category: PortfolioFilter | 'Tümü') {
    setActiveCategory(category)
    setShowAll(false)
  }

  function handleOpenPreview(project: PortfolioProject) {
    const matchingShowcase = SHOWCASE_WEB_PROJECTS.find((s) => s.slug === project.id)
    if (matchingShowcase) {
      setPreviewProject(matchingShowcase)
    } else {
      setPreviewProject({
        slug: project.id,
        name: project.name,
        category: project.subtitle,
        description: project.description,
        badge: project.label,
        sector: project.category,
        color: '#b85f38',
        previewImage: project.previewImage,
      })
    }
  }

  return (
    <section
      id="referanslar"
      className="scroll-mt-24 bg-white px-5 py-20 text-zinc-950 sm:px-8 sm:py-28 lg:px-12"
    >
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="h-px w-6 bg-[#C5A059]" />
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
                Seçilmiş İşler · {PORTFOLIO_PROJECTS.length} Proje
              </p>
            </div>
            <h2 className="mt-4 font-display text-3xl font-semibold leading-tight tracking-[-0.04em] sm:text-5xl">
              Farklı sektörler için tasarladıklarımız.
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-6 text-zinc-600 sm:text-base">
              Her projeyi kendi ihtiyacına göre tasarladık. Canlı önizlemeleri inceleyin,
              beğendiğiniz işi yeni sekmede açın.
            </p>
          </div>
          <a
            href="#demolar"
            className="focus-ring inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-zinc-800 transition-colors hover:text-[#8b5835]"
          >
            Demoları keşfet
            <ArrowUpRight className="h-4 w-4" aria-hidden />
          </a>
        </div>

        {/* 5-Category Filter Tabs */}
        <div
          className="mt-10 flex gap-2 overflow-x-auto pb-2 touch-pan-y overscroll-x-contain [-webkit-overflow-scrolling:touch]"
          aria-label="Projeleri sektöre göre filtrele"
        >
          {(['Tümü', ...PORTFOLIO_FILTERS] as const).map((category) => {
            const count =
              category === 'Tümü'
                ? PORTFOLIO_PROJECTS.length
                : PORTFOLIO_PROJECTS.filter((project) => project.category === category).length

            const isActive = activeCategory === category

            return (
              <button
                key={category}
                type="button"
                onClick={() => selectCategory(category)}
                aria-pressed={isActive}
                className={`focus-ring relative inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-xs font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-zinc-950 text-white shadow-md'
                    : 'border border-zinc-200 bg-white text-zinc-600 hover:border-zinc-400 hover:text-zinc-950'
                }`}
              >
                {category}
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                    isActive ? 'bg-white/20 text-white' : 'bg-zinc-100 text-zinc-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        {/* Portfolio Cards Grid */}
        <motion.div
          layout
          className="mt-10 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3"
        >
          <AnimatePresence mode="popLayout">
            {visibleProjects.map((project) => (
              <motion.article
                key={project.id}
                layout
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.25 }}
                className="group min-w-0"
              >
                <div className="focus-ring flex h-full flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-[#C5A059]/60 hover:shadow-[0_20px_45px_-12px_rgba(197,160,89,0.22)]">
                  {/* Browser Window Top Bar */}
                  <div className="flex h-9 items-center justify-between border-b border-zinc-200/80 bg-zinc-50/90 px-3.5 backdrop-blur-sm">
                    <div className="flex items-center gap-2">
                      <span className="flex gap-1.5" aria-hidden="true">
                        <span className="h-2 w-2 rounded-full bg-zinc-300 transition-colors group-hover:bg-[#ff5f57]" />
                        <span className="h-2 w-2 rounded-full bg-zinc-300 transition-colors group-hover:bg-[#febc2e]" />
                        <span className="h-2 w-2 rounded-full bg-zinc-300 transition-colors group-hover:bg-[#28c840]" />
                      </span>
                      <span className="truncate text-[10px] font-mono text-zinc-500">
                        {project.name.toLowerCase().replace(/\s+/g, '')}.com.tr
                      </span>
                    </div>
                    <span className="rounded-full bg-zinc-200/80 px-2 py-0.5 text-[9px] font-medium text-zinc-700">
                      {project.category}
                    </span>
                  </div>

                  {/* Thumbnail Image Container with Quick Preview */}
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => handleOpenPreview(project)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        handleOpenPreview(project)
                      }
                    }}
                    aria-label={`${project.name} canlı önizlemesini aç`}
                    className="group/img relative aspect-[1.55/1] cursor-pointer overflow-hidden bg-[#eee8de] block focus:outline-none"
                  >
                    <ReferenceProjectImage
                      project={project}
                      priority={project.id === PORTFOLIO_PROJECTS[0].id}
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="h-full w-full transition-transform duration-700 ease-out group-hover/img:scale-105"
                    />
                    <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
                      <span className="rounded-full bg-white/95 px-2.5 py-0.5 text-[10px] font-semibold text-zinc-800 shadow-sm backdrop-blur">
                        {project.label}
                      </span>
                      <span className="rounded-full bg-zinc-900/85 px-2 py-0.5 text-[10px] font-medium text-zinc-100 backdrop-blur">
                        Canlı Proje
                      </span>
                    </div>
                    {/* Hover Quick Preview Pill */}
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover/img:opacity-100 bg-black/35 backdrop-blur-[2px]">
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-white/40 bg-white/90 px-3.5 py-1.5 text-xs font-semibold text-zinc-950 shadow-lg backdrop-blur">
                        <Eye className="h-3.5 w-3.5 text-[#8b5835]" aria-hidden="true" />
                        Canlı İncele
                      </span>
                    </div>
                  </div>

                  {/* Card Content & Action Row */}
                  <div className="flex flex-1 flex-col justify-between p-5">
                    <div>
                      <div className="min-w-0">
                        <h3 className="font-display text-lg font-semibold tracking-tight text-zinc-950 transition-colors group-hover:text-[#8b5835]">
                          {project.name}
                        </h3>
                        <p className="mt-1 text-xs font-medium text-zinc-500">{project.subtitle}</p>
                      </div>
                      <p className="mt-3 line-clamp-2 text-xs leading-5 text-zinc-600">
                        {project.description}
                      </p>
                    </div>

                    {/* Action Buttons Row */}
                    <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-zinc-100 pt-3.5">
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenPreview(project)}
                          aria-label={`${project.name} canlı önizlemesini aç`}
                          className="focus-ring inline-flex items-center gap-1 rounded-lg border border-zinc-200 bg-zinc-50 px-2 sm:px-2.5 py-1.5 text-xs font-semibold text-zinc-700 transition-colors hover:border-zinc-400 hover:bg-zinc-100 hover:text-zinc-950"
                        >
                          <Eye className="h-3 w-3 text-zinc-500" aria-hidden="true" />
                          İncele
                        </button>
                        <a
                          href={project.href}
                          target="_blank"
                          rel="noreferrer"
                          aria-label={`${project.name} canlı sitesini yeni sekmede aç`}
                          className="focus-ring inline-flex items-center gap-1 rounded-lg border border-zinc-200 bg-white px-2 sm:px-2.5 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:border-zinc-400 hover:bg-zinc-50 hover:text-zinc-950"
                        >
                          Canlı Siteyi Aç
                          <ArrowUpRight className="h-3 w-3 text-zinc-500" aria-hidden="true" />
                        </a>
                      </div>
                      <a
                        href={buildWhatsAppContactHref(
                          `Merhaba MESE SYSTEM! "${project.name}" (${project.category}) referans sitenizi inceledim. Benzer bir web sitesi tasarımı için teklif almak istiyorum.`
                        )}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`${project.name} benzeri proje için teklif al`}
                        className="focus-ring inline-flex items-center gap-1.5 rounded-lg border border-[#C5A059]/40 bg-[#C5A059]/10 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-[#8b5835] transition-all duration-200 hover:border-[#C5A059] hover:bg-[#C5A059]/25 hover:text-[#724627]"
                      >
                        <MessageCircle className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
                        Teklif Al
                      </a>
                    </div>
                  </div>
                </div>
              </motion.article>
            ))}
          </AnimatePresence>
        </motion.div>

        {filteredProjects.length > INITIAL_PROJECT_COUNT && (
          <div className="mt-12 flex justify-center">
            <button
              type="button"
              onClick={() => setShowAll((expanded) => !expanded)}
              className="focus-ring inline-flex items-center gap-2 rounded-full border border-zinc-300 px-6 py-3 text-sm font-medium text-zinc-800 transition-colors hover:border-zinc-500 hover:bg-zinc-50"
            >
              {showAll ? 'Daha az göster' : `${hiddenProjectCount} projenin tümünü gör`}
              <ArrowDown
                className={`h-4 w-4 transition-transform ${showAll ? 'rotate-180' : ''}`}
                aria-hidden
              />
            </button>
          </div>
        )}
      </div>

      {/* In-page Live Demo Preview Modal */}
      <ShowcasePreviewModal
        project={previewProject}
        onClose={() => setPreviewProject(null)}
      />
    </section>
  )
}
