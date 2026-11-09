'use client'

import { useState, useEffect, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  X,
  Monitor,
  Smartphone,
  ExternalLink,
  MessageCircle,
  Sparkles,
} from 'lucide-react'
import type { ShowcaseWebProject } from '@/config/showcaseProjects'
import { buildWhatsAppContactHref } from '@/lib/whatsapp'

interface ShowcasePreviewModalProps {
  project: ShowcaseWebProject | null
  onClose: () => void
}

export default function ShowcasePreviewModal({
  project,
  onClose,
}: ShowcasePreviewModalProps) {
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop')

  // Screen size aware device default
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setDevice('mobile')
    }
  }, [project])

  // Handle ESC key to close modal
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    },
    [onClose]
  )

  useEffect(() => {
    if (project) {
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', handleKeyDown)
      return () => {
        document.body.style.overflow = ''
        window.removeEventListener('keydown', handleKeyDown)
      }
    }
  }, [project, handleKeyDown])

  return (
    <AnimatePresence>
      {project && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="showcase-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/85 backdrop-blur-md"
            aria-hidden="true"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 12 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 12 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
            className="relative z-10 flex h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#101116] shadow-2xl shadow-black/80"
          >
            {/* Modal Header */}
            <div className="flex shrink-0 items-center justify-between border-b border-white/[0.08] bg-[#14161e] px-4 py-3 sm:px-6">
              {/* Left: Live Indicator & Project Title */}
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="relative flex h-2.5 w-2.5 shrink-0">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                </span>
                <span className="hidden text-[11px] font-semibold uppercase tracking-wider text-emerald-400 sm:inline-block">
                  Canlı
                </span>
                <span className="hidden h-3.5 w-px bg-white/15 sm:inline-block" />
                <h3
                  id="showcase-modal-title"
                  className="truncate font-display text-sm font-semibold text-white sm:text-base"
                >
                  {project.name}
                </h3>
                <span className="hidden rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[10px] font-medium text-zinc-300 md:inline-block">
                  {project.sector}
                </span>
              </div>

              {/* Center: Device Viewport Switcher */}
              <div className="flex items-center rounded-lg border border-white/10 bg-[#0a0b0e] p-1 shadow-inner">
                <button
                  type="button"
                  onClick={() => setDevice('desktop')}
                  aria-pressed={device === 'desktop'}
                  aria-label="Masaüstü görünümü"
                  className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                    device === 'desktop'
                      ? 'bg-[#C5A059] font-semibold text-zinc-950 shadow-sm'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <Monitor className="h-3.5 w-3.5" aria-hidden="true" />
                  <span className="hidden sm:inline">Masaüstü</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDevice('mobile')}
                  aria-pressed={device === 'mobile'}
                  aria-label="Mobil görünüm"
                  className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                    device === 'mobile'
                      ? 'bg-[#C5A059] font-semibold text-zinc-950 shadow-sm'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <Smartphone className="h-3.5 w-3.5" aria-hidden="true" />
                  <span className="hidden sm:inline">Mobil</span>
                </button>
              </div>

              {/* Right: Fullscreen Link & Close */}
              <div className="flex items-center gap-2">
                <a
                  href={`/showcases/${project.slug}/index.html`}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`${project.name} demosunu yeni sekmede aç`}
                  className="focus-ring inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:border-[#C5A059]/40 hover:bg-[#C5A059]/10 hover:text-[#DFBE7A]"
                >
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                  <span className="hidden md:inline">Yeni Sekmede Aç</span>
                </a>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Önizlemeyi kapat"
                  className="focus-ring flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-zinc-400 transition-colors hover:border-white/20 hover:bg-white/10 hover:text-white"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>

            {/* Modal Body / Live Iframe Embed Area */}
            <div className="relative flex flex-1 items-center justify-center overflow-hidden bg-[#090a0d] p-2 sm:p-4">
              {device === 'desktop' ? (
                /* Desktop Viewport */
                <div className="h-full w-full overflow-hidden rounded-xl border border-white/10 bg-white shadow-lg">
                  <iframe
                    src={`/showcases/${project.slug}/index.html`}
                    title={`${project.name} - ${project.category} Canlı Demo Önizlemesi`}
                    className="h-full w-full border-0 bg-white"
                    sandbox="allow-scripts allow-same-origin allow-forms"
                    loading="lazy"
                    referrerPolicy="strict-origin-when-cross-origin"
                  />
                </div>
              ) : (
                /* Mobile Phone Frame Viewport */
                <div className="relative flex h-full max-h-[720px] w-full max-w-[340px] xs:max-w-[375px] flex-col overflow-hidden rounded-[1.8rem] sm:rounded-[2.5rem] border-4 sm:border-[8px] border-zinc-800 bg-[#050507] shadow-2xl">
                  {/* Phone Notch / Speaker */}
                  <div className="relative z-10 flex h-5 sm:h-6 w-full shrink-0 items-center justify-center bg-zinc-900 border-b border-zinc-800">
                    <div className="h-2.5 sm:h-3 w-16 sm:w-20 rounded-full bg-zinc-950 border border-zinc-800" />
                  </div>
                  {/* Phone Screen with Iframe */}
                  <div className="relative flex-1 w-full overflow-hidden bg-white">
                    <iframe
                      src={`/showcases/${project.slug}/index.html`}
                      title={`${project.name} - ${project.category} Canlı Demo Mobil Önizlemesi`}
                      className="h-full w-full border-0 bg-white"
                      sandbox="allow-scripts allow-same-origin allow-forms"
                      loading="lazy"
                      referrerPolicy="strict-origin-when-cross-origin"
                    />
                  </div>
                  {/* Phone Home Bar */}
                  <div className="relative z-10 flex h-3.5 sm:h-4 w-full shrink-0 items-center justify-center bg-zinc-900">
                    <span className="h-1 w-20 sm:w-24 rounded-full bg-white/40" />
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer / WhatsApp Conversion CTA */}
            <div className="flex shrink-0 flex-col items-center justify-between gap-3 border-t border-white/[0.08] bg-[#14161e] px-4 py-3 sm:flex-row sm:px-6">
              <div className="flex items-center gap-2 text-center sm:text-left">
                <Sparkles
                  className="hidden h-4 w-4 shrink-0 text-[#C5A059] sm:block"
                  aria-hidden="true"
                />
                <p className="text-xs text-zinc-300">
                  <span className="font-semibold text-white">Bu tasarımı beğendiniz mi?</span>{' '}
                  İşletmenizin kurumsal kimliğine ve menü/hizmet akışına özel 24 saatte uyarlayalım.
                </p>
              </div>
              <a
                href={buildWhatsAppContactHref(
                  `Merhaba MESE SYSTEM! "${project.name}" (${project.sector}) canlı demo sitesini inceledim. Kendi işletmem için benzer bir web sitesi veya demo hazırlatmak istiyorum.`
                )}
                target="_blank"
                rel="noreferrer"
                className="focus-ring inline-flex shrink-0 items-center gap-2 rounded-xl bg-gradient-to-r from-[#C5A059] to-[#DFBE7A] px-4 py-2 text-xs font-bold text-zinc-950 shadow-md transition-all duration-200 hover:brightness-110 active:scale-[0.98]"
              >
                <MessageCircle className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
                WhatsApp ile Bu Demoyu İste
              </a>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
