'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowDown, ArrowUpRight } from 'lucide-react'
import {
  FEATURED_PROJECT_IDS,
  PORTFOLIO_FILTERS,
  PORTFOLIO_PROJECTS,
  type PortfolioFilter,
} from '@/config/referenceSite'
import ReferenceProjectImage from '@/components/ReferenceProjectImage'

const INITIAL_PROJECT_COUNT = 6
const featuredProjects = FEATURED_PROJECT_IDS.map((id) =>
  PORTFOLIO_PROJECTS.find((project) => project.id === id)
).filter((project) => project !== undefined)
const featuredProjectIdSet = new Set<string>(FEATURED_PROJECT_IDS)
const orderedProjects = [
  ...featuredProjects,
  ...PORTFOLIO_PROJECTS.filter((project) => !featuredProjectIdSet.has(project.id)),
]

export default function PortfolioSection() {
  const [activeCategory, setActiveCategory] = useState<PortfolioFilter | 'Tümü'>('Tümü')
  const [showAll, setShowAll] = useState(false)
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

  return (
    <section
      id="referanslar"
      className="scroll-mt-24 bg-white px-5 py-20 text-zinc-950 sm:px-8 sm:py-24 lg:px-12"
    >
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
              Seçilmiş işler · {PORTFOLIO_PROJECTS.length} proje
            </p>
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
            className="focus-ring inline-flex shrink-0 items-center gap-2 text-sm font-medium text-zinc-800 transition-colors hover:text-[#8b5835]"
          >
            Demoları keşfet
            <ArrowUpRight className="h-4 w-4" aria-hidden />
          </a>
        </div>

        <div className="mt-9 flex gap-2 overflow-x-auto pb-2" aria-label="Projeleri sektöre göre filtrele">
          {(['Tümü', ...PORTFOLIO_FILTERS] as const).map((category) => {
            const count =
              category === 'Tümü'
                ? PORTFOLIO_PROJECTS.length
                : PORTFOLIO_PROJECTS.filter((project) => project.category === category).length

            return (
              <button
                key={category}
                type="button"
                onClick={() => selectCategory(category)}
                aria-pressed={activeCategory === category}
                className={`focus-ring inline-flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-xs font-medium transition-colors ${
                  activeCategory === category
                    ? 'bg-zinc-950 text-zinc-50'
                    : 'border border-zinc-300 bg-white text-zinc-600 hover:border-zinc-500 hover:text-zinc-950'
                }`}
              >
                {category}
                <span className="text-[10px] opacity-60">{count}</span>
              </button>
            )
          })}
        </div>

        <motion.div
          layout
          className="mt-8 grid gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-3"
        >
          <AnimatePresence mode="popLayout">
            {visibleProjects.map((project) => (
              <motion.article
                key={project.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.22 }}
                className="group min-w-0"
              >
                <a
                  href={project.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`${project.name} canlı sitesini yeni sekmede aç`}
                  className="focus-ring block overflow-hidden rounded-xl border border-zinc-200 bg-white"
                >
                  <div className="flex h-8 items-center gap-2 border-b border-zinc-200 bg-zinc-50 px-3">
                    <span className="flex gap-1" aria-hidden="true">
                      <span className="h-1.5 w-1.5 rounded-full bg-zinc-300" />
                      <span className="h-1.5 w-1.5 rounded-full bg-zinc-300" />
                      <span className="h-1.5 w-1.5 rounded-full bg-zinc-300" />
                    </span>
                    <span className="truncate text-[9px] text-zinc-500">
                      {project.name}
                    </span>
                  </div>
                  <div className="relative aspect-[1.55/1] overflow-hidden bg-[#eee8de]">
                    <ReferenceProjectImage
                      project={project}
                      priority={project.id === PORTFOLIO_PROJECTS[0].id}
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="h-full w-full transition-transform duration-500 group-hover:scale-[1.025]"
                    />
                    <span className="absolute bottom-3 left-3 rounded-full bg-white/90 px-3 py-1 text-[10px] font-medium text-zinc-700 backdrop-blur">
                      {project.label}
                    </span>
                  </div>
                  <div className="flex items-start justify-between gap-3 px-4 py-4">
                    <div className="min-w-0">
                      <h3 className="font-display text-lg font-semibold tracking-tight text-zinc-950">
                        {project.name}
                      </h3>
                      <p className="mt-1 text-xs text-zinc-500">{project.subtitle}</p>
                      <p className="mt-3 line-clamp-2 text-sm leading-5 text-zinc-600">
                        {project.description}
                      </p>
                    </div>
                    <ArrowUpRight
                      className="mt-1 h-4 w-4 shrink-0 text-zinc-400 transition-colors group-hover:text-[#8b5835]"
                      aria-hidden
                    />
                  </div>
                </a>
              </motion.article>
            ))}
          </AnimatePresence>
        </motion.div>

        {filteredProjects.length > INITIAL_PROJECT_COUNT && (
          <div className="mt-10 flex justify-center">
            <button
              type="button"
              onClick={() => setShowAll((expanded) => !expanded)}
              className="focus-ring inline-flex items-center gap-2 rounded-full border border-zinc-300 px-5 py-3 text-sm font-medium text-zinc-800 transition-colors hover:border-zinc-500 hover:bg-zinc-50"
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
    </section>
  )
}
