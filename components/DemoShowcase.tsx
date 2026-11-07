'use client'

import { ArrowUpRight } from 'lucide-react'
import { DEMO_PROJECTS } from '@/config/referenceSite'
import { SHOWCASE_WEB_PROJECTS } from '@/config/showcaseProjects'
import ReferenceProjectImage from '@/components/ReferenceProjectImage'
import ShowcasePreview from '@/components/ShowcasePreview'

const INDUSTRY_DEMO_COUNT = 13

export default function DemoShowcase() {
  const industryProjects = SHOWCASE_WEB_PROJECTS.slice(0, INDUSTRY_DEMO_COUNT)

  return (
    <section
      id="demolar"
      data-preserve-dark
      className="relative scroll-mt-24 overflow-hidden bg-[#050507] px-5 py-20 text-white sm:px-8 sm:py-24 lg:px-12 border-t border-b border-[#C5A059]/20"
    >
      {/* Ambient Gold Aura */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[500px] w-[900px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(197,160,89,0.12),transparent_70%)] blur-3xl"
      />

      <div className="relative mx-auto max-w-7xl">
        {/* ============================================================== */}
        {/* 1. SEKTÖREL DEMO KARTLARI (ÜST KISIM / HERO SELECTION)         */}
        {/* ============================================================== */}
        <div>
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h2 className="font-display text-3xl font-semibold leading-tight tracking-[-0.04em] text-white sm:text-5xl">
                İhtiyaca göre hazırlanmış canlı demo siteleri.
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400 sm:text-base">
                {industryProjects.length} farklı sektör için tasarlanan örnekleri açıp ürün, hizmet ve talep akışlarını deneyin.
                İşlemler demo amaçlıdır; gerçek sipariş veya rezervasyon oluşturulmaz.
              </p>
            </div>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {industryProjects.map((project) => (
              <a
                key={project.slug}
                href={`/showcases/${project.slug}/index.html`}
                target="_blank"
                rel="noreferrer"
                aria-label={`${project.name} sektör demosunu yeni sekmede aç`}
                className="focus-ring group relative flex flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-[#181920]/90 backdrop-blur-md transition-all duration-300 hover:-translate-y-1.5 hover:border-[#C5A059]/60 hover:shadow-[0_16px_40px_-12px_rgba(197,160,89,0.22)]"
              >
                {/* Visual Preview Container */}
                <div className="relative aspect-[1.45/1] overflow-hidden bg-zinc-950">
                  <ShowcasePreview
                    project={project}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="h-full w-full transition-transform duration-500 group-hover:scale-105"
                  />
                  {/* Vignette Overlay */}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#181920] via-transparent to-black/30" />

                  {/* Top Floating Badge */}
                  <div className="absolute left-3 top-3">
                    <span className="rounded-full border border-white/10 bg-[#050507]/90 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-300 backdrop-blur-md">
                      {project.sector}
                    </span>
                  </div>
                </div>

                {/* Card Content Body */}
                <div className="flex flex-1 flex-col justify-between p-5">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="truncate font-display text-base font-semibold text-white transition-colors group-hover:text-[#C5A059]">
                        {project.name}
                      </h3>
                      <ArrowUpRight
                        className="h-4 w-4 shrink-0 text-[#C5A059] transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                        aria-hidden
                      />
                    </div>
                    <p className="mt-1 line-clamp-1 text-xs text-zinc-400">
                      {project.category}
                    </p>
                    <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-zinc-400">
                      {project.description}
                    </p>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-white/[0.06] pt-3">
                    <span className="rounded border border-zinc-800 bg-[#050507] px-2 py-0.5 text-[10px] font-medium text-zinc-300">
                      {project.badge}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#C5A059] transition-colors group-hover:text-[#DFBE7A]">
                      Demoyu Başlat
                      <ArrowUpRight className="h-3 w-3" aria-hidden />
                    </span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* ============================================================== */}
        {/* 2. MOBİL TELEFON MOCKUP'LARI (ALT KISIM / SECONDARY)           */}
        {/* ============================================================== */}
        <div className="mt-20 border-t border-white/[0.08] pt-16">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#C5A059]">
              Canlı demo · {DEMO_PROJECTS.length} proje
            </p>
            <h3 className="mt-3 font-display text-2xl font-semibold leading-tight tracking-[-0.03em] text-white sm:text-4xl">
              Tasarımı telefonunuzdan keşfedin.
            </h3>
            <p className="mt-3 text-sm leading-6 text-zinc-400 sm:text-base">
              Farklı sektörlere göre hazırladığımız örnekleri inceleyin; her demo yeni sekmede açılır.
            </p>
          </div>

          <div className="mt-10 grid auto-cols-[72%] grid-flow-col gap-4 overflow-x-auto pb-5 [scrollbar-color:#3f3f46_transparent] [scrollbar-width:thin] sm:auto-cols-[42%] md:grid-flow-row md:grid-cols-3 md:overflow-visible lg:grid-cols-5">
            {DEMO_PROJECTS.map((project) => (
              <a
                key={project.id}
                href={project.href}
                target="_blank"
                rel="noreferrer"
                aria-label={`${project.name} canlı demosunu yeni sekmede aç`}
                className="focus-ring group min-w-0 snap-start"
              >
                <div className="relative mx-auto w-[min(100%,13rem)] overflow-hidden rounded-[1.65rem] border-[6px] border-[#181920] bg-[#050507] shadow-[0_16px_38px_-22px_rgba(0,0,0,0.85)] transition-all duration-300 group-hover:-translate-y-1.5 group-hover:border-[#C5A059]/40 group-hover:shadow-[0_20px_40px_-15px_rgba(197,160,89,0.20)]">
                  <div className="absolute left-1/2 top-1.5 z-10 h-3 w-16 -translate-x-1/2 rounded-full bg-zinc-950 border border-zinc-800" />
                  <div className="relative aspect-[9/16] overflow-hidden rounded-[1.15rem] bg-zinc-950">
                    <ReferenceProjectImage
                      project={project}
                      mobile
                      sizes="(max-width: 768px) 72vw, 13rem"
                      className="h-full w-full"
                    />
                  </div>
                  <div className="absolute inset-x-0 bottom-0 flex h-4 items-center justify-center bg-[#181920]">
                    <span className="h-1 w-12 rounded-full bg-white/50" />
                  </div>
                </div>
                <div className="mx-auto mt-4 w-[min(100%,13rem)] text-center sm:text-left">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-[#C5A059]">
                    {project.category}
                  </p>
                  <h4 className="mt-1 truncate font-display text-sm font-semibold text-white group-hover:text-[#C5A059] transition-colors">
                    {project.name}
                  </h4>
                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-zinc-400">
                    {project.subtitle}
                  </p>
                  <span className="mt-3 inline-flex items-center gap-1 text-[11px] font-medium text-zinc-300 transition-colors group-hover:text-[#C5A059]">
                    Demoyu aç
                    <ArrowUpRight className="h-3 w-3" aria-hidden />
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
