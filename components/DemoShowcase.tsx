'use client'

import { useState } from 'react'
import { ArrowUpRight, Eye, MessageCircle, Sparkles } from 'lucide-react'
import { DEMO_PROJECTS } from '@/config/referenceSite'
import { SHOWCASE_WEB_PROJECTS, type ShowcaseWebProject } from '@/config/showcaseProjects'
import ReferenceProjectImage from '@/components/ReferenceProjectImage'
import ShowcasePreview from '@/components/ShowcasePreview'
import ShowcasePreviewModal from '@/components/ShowcasePreviewModal'
import { buildWhatsAppContactHref } from '@/lib/whatsapp'

const INDUSTRY_DEMO_COUNT = 19

export default function DemoShowcase() {
  const [previewProject, setPreviewProject] = useState<ShowcaseWebProject | null>(null)
  const industryProjects = SHOWCASE_WEB_PROJECTS.slice(0, INDUSTRY_DEMO_COUNT)

  return (
    <section
      id="demolar"
      data-preserve-dark
      className="relative scroll-mt-24 overflow-hidden bg-[#050507] px-5 py-20 text-white sm:px-8 sm:py-28 lg:px-12 border-t border-b border-[#C5A059]/20"
    >
      {/* Ambient Gold Aura */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[560px] w-[1000px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(197,160,89,0.15),transparent_70%)] blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 right-0 h-[400px] w-[600px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(197,160,89,0.06),transparent_70%)] blur-3xl"
      />

      <div className="relative mx-auto max-w-7xl">
        {/* ============================================================== */}
        {/* 1. SEKTÖREL DEMO KARTLARI (ÜST KISIM / HERO SELECTION)         */}
        {/* ============================================================== */}
        <div>
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-px w-6 bg-[#C5A059]" />
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#DFBE7A]">
                  İnteraktif Vitrin · {industryProjects.length} Sektör Demosu
                </span>
              </div>
              <h2 className="mt-3 font-display text-3xl font-semibold leading-tight tracking-[-0.04em] text-white sm:text-5xl">
                İhtiyaca göre hazırlanmış canlı demo siteleri.
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400 sm:text-base">
                {industryProjects.length} farklı sektör için tasarlanan örnekleri açıp ürün, hizmet ve talep akışlarını deneyin.
                İşlemler demo amaçlıdır; gerçek sipariş veya rezervasyon oluşturulmaz.
              </p>
            </div>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {industryProjects.map((project) => (
              <div
                key={project.slug}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-b from-[#181920]/95 via-[#111217]/95 to-[#0b0c10]/95 p-1 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1.5 hover:border-[#C5A059]/60 hover:shadow-[0_20px_45px_-12px_rgba(197,160,89,0.25)]"
              >
                {/* Visual Preview Container */}
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => setPreviewProject(project)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      setPreviewProject(project)
                    }
                  }}
                  aria-label={`${project.name} canlı önizlemesini aç`}
                  className="relative aspect-[1.45/1] cursor-pointer overflow-hidden rounded-xl bg-zinc-950 focus:outline-none"
                >
                  <ShowcasePreview
                    project={project}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="h-full w-full transition-transform duration-700 ease-out group-hover:scale-105"
                  />

                  {/* Vignette Overlay */}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0e1017] via-transparent to-black/40" />

                  {/* Top Floating Badge: Sector with Live Pulse */}
                  <div className="absolute left-3 top-3">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-[#050507]/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-200 shadow-sm backdrop-blur-md">
                      <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                      </span>
                      {project.sector}
                    </span>
                  </div>

                  {/* Top Right Floating Badge */}
                  <div className="absolute right-3 top-3">
                    <span className="rounded-md border border-white/10 bg-[#050507]/90 px-2.5 py-1 text-[10px] font-medium text-zinc-300 shadow-sm backdrop-blur-md">
                      {project.badge}
                    </span>
                  </div>

                  {/* Hover Quick Preview Pill */}
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-all duration-300 group-hover:opacity-100 bg-black/40 backdrop-blur-[2px]">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-[#C5A059] bg-[#C5A059]/25 px-4 py-2 text-xs font-semibold text-white shadow-xl backdrop-blur-md transition-transform duration-300 group-hover:scale-105">
                      <Eye className="h-3.5 w-3.5 text-[#DFBE7A]" aria-hidden="true" />
                      Canlıyı Deneyin
                    </span>
                  </div>
                </div>

                {/* Card Content Body */}
                <div className="flex flex-1 flex-col justify-between p-4 sm:p-5">
                  <div>
                    <h3 className="font-display text-base font-semibold text-white transition-colors group-hover:text-[#DFBE7A]">
                      {project.name}
                    </h3>
                    <p className="mt-0.5 text-[11px] font-medium text-zinc-400">
                      {project.category}
                    </p>
                    <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-zinc-400">
                      {project.description}
                    </p>
                  </div>

                  {/* Dual Action Buttons */}
                  <div className="mt-5 flex items-center justify-between gap-2 border-t border-white/[0.08] pt-3.5">
                    <button
                      type="button"
                      onClick={() => setPreviewProject(project)}
                      aria-label={`${project.name} canlı önizlemesini aç`}
                      className="focus-ring inline-flex items-center gap-1.5 rounded-lg border border-[#C5A059]/40 bg-[#C5A059]/10 px-3 py-1.5 text-xs font-semibold text-[#DFBE7A] transition-all duration-200 hover:border-[#C5A059] hover:bg-[#C5A059]/25 hover:text-white active:scale-95"
                    >
                      <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                      Canlıyı Deneyin
                    </button>
                    <a
                      href={`/showcases/${project.slug}/index.html`}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`${project.name} sektör demosunu yeni sekmede aç`}
                      className="focus-ring inline-flex items-center gap-1 text-xs font-medium text-zinc-400 transition-colors hover:text-[#DFBE7A]"
                    >
                      Demoyu Aç
                      <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </a>
                  </div>
                </div>
              </div>
            ))}

            {/* 20. Balanced Grid Card: Sizin Sektörünüz İçin Ücretsiz Demo Alın */}
            <div className="relative flex flex-col justify-between overflow-hidden rounded-2xl border border-dashed border-[#C5A059]/50 bg-gradient-to-b from-[#181920]/95 via-[#12141a]/95 to-[#0b0c10]/95 p-6 text-left shadow-xl transition-all duration-300 hover:border-[#C5A059] hover:shadow-[0_20px_45px_-12px_rgba(197,160,89,0.25)] sm:col-span-1 lg:col-span-2 xl:col-span-1">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full border border-[#C5A059]/40 bg-[#C5A059]/15 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#DFBE7A]">
                    Size Özel Demo
                  </span>
                  <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
                    24 Saatte Hazır
                  </span>
                </div>
                <h3 className="mt-3 font-display text-lg font-semibold text-white">
                  Sizin Sektörünüz İçin Ücretsiz Demo Alın
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-zinc-400">
                  Sektörünüzü listede bulamadınız mı? İşletmenizin kurumsal kimliğine ve hizmet yapısına özel çalışan interaktif bir web demosunu 24 saat içinde ücretsiz hazırlayalım.
                </p>
              </div>
              <div className="mt-6 flex flex-col items-start gap-3 border-t border-white/[0.08] pt-4">
                <span className="text-[11px] text-zinc-400">
                  Taahhüt yok · Kredi kartı gerekmez
                </span>
                <a
                  href={buildWhatsAppContactHref(
                    'Merhaba MESE SYSTEM! Sektörüm için ücretsiz interaktif demo tasarımı talep etmek istiyorum.'
                  )}
                  target="_blank"
                  rel="noreferrer"
                  className="focus-ring inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#C5A059] to-[#DFBE7A] px-4 py-2.5 text-xs font-bold text-zinc-950 shadow-md transition-all duration-200 hover:brightness-110 active:scale-[0.98]"
                >
                  <MessageCircle className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
                  Ücretsiz Demo İste
                  <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* 2. MOBİL TELEFON MOCKUP'LARI (ALT KISIM / SECONDARY)           */}
        {/* ============================================================== */}
        <div className="mt-24 border-t border-white/[0.08] pt-16">
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

          <div className="mt-12 grid auto-cols-[72%] grid-flow-col gap-5 overflow-x-auto pb-6 snap-x snap-mandatory touch-pan-y overscroll-x-contain [scrollbar-color:#3f3f46_transparent] [scrollbar-width:thin] [-webkit-overflow-scrolling:touch] sm:auto-cols-[40%] md:grid-flow-row md:grid-cols-3 md:overflow-visible md:snap-none lg:grid-cols-5">
            {DEMO_PROJECTS.map((project) => (
              <a
                key={project.id}
                href={project.href}
                target="_blank"
                rel="noreferrer"
                aria-label={`${project.name} canlı demosunu yeni sekmede aç`}
                className="focus-ring group min-w-0 snap-start"
              >
                {/* Modernized iPhone 16 Pro Style Chassis */}
                <div className="relative mx-auto w-[min(100%,13.5rem)] overflow-hidden rounded-[2.2rem] border-[5px] border-[#23242a] bg-[#0c0d11] p-[2px] shadow-[0_20px_50px_-18px_rgba(0,0,0,0.9)] ring-1 ring-white/10 transition-all duration-300 group-hover:-translate-y-2 group-hover:border-[#C5A059]/60 group-hover:shadow-[0_25px_50px_-15px_rgba(197,160,89,0.25)]">
                  {/* Dynamic Island */}
                  <div className="pointer-events-none absolute left-1/2 top-2 z-20 h-2.5 w-12 -translate-x-1/2 rounded-full bg-black ring-1 ring-white/10 flex items-center justify-end pr-1">
                    <span className="h-1 w-1 rounded-full bg-blue-900/40" />
                  </div>
                  {/* Screen viewport */}
                  <div className="relative aspect-[9/16] overflow-hidden rounded-[1.8rem] bg-zinc-950">
                    <ReferenceProjectImage
                      project={project}
                      mobile
                      sizes="(max-width: 768px) 72vw, 14rem"
                      className="h-full w-full"
                    />
                  </div>
                  {/* Home Indicator */}
                  <div className="absolute inset-x-0 bottom-1.5 flex justify-center pointer-events-none">
                    <span className="h-1 w-12 rounded-full bg-white/40" />
                  </div>
                </div>

                <div className="mx-auto mt-4 w-[min(100%,13.5rem)] text-center sm:text-left">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#C5A059]">
                    {project.category}
                  </p>
                  <h4 className="mt-1 line-clamp-2 font-display text-sm font-semibold text-white group-hover:text-[#DFBE7A] transition-colors">
                    {project.name}
                  </h4>
                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-zinc-400">
                    {project.subtitle}
                  </p>
                  <span className="mt-3 inline-flex items-center gap-1 text-[11px] font-medium text-zinc-300 transition-colors group-hover:text-[#DFBE7A]">
                    Demoyu aç
                    <ArrowUpRight className="h-3 w-3" aria-hidden />
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* In-page Live Demo Preview Modal */}
      <ShowcasePreviewModal
        project={previewProject}
        onClose={() => setPreviewProject(null)}
      />
    </section>
  )
}
