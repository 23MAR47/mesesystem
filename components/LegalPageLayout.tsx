import React from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  ShieldCheck,
  FileText,
  Cookie,
  RefreshCw,
  FileSignature,
  Info,
  Mail,
  Phone,
  MessageCircle,
} from 'lucide-react'
import siteConfig from '@/config/siteConfig'
import BrandMark from '@/components/BrandMark'
import { buildWhatsAppContactHref } from '@/lib/whatsapp'

export interface LegalLinkItem {
  title: string
  href: string
  description: string
  icon: 'shield' | 'cookie' | 'refresh' | 'contract' | 'info'
}

export const LEGAL_PAGES: LegalLinkItem[] = [
  {
    title: 'Gizlilik Politikası & KVKK',
    href: '/gizlilik-politikasi',
    description: 'Kişisel verilerin işlenmesi, KVKK 11. madde hakları ve veri güvenliği ilkeleri.',
    icon: 'shield',
  },
  {
    title: 'Çerez Politikası',
    href: '/cerez-politikasi',
    description: 'Zorunlu, analitik ve işlevsel çerez türleri ile tarayıcı tercih yönetimi.',
    icon: 'cookie',
  },
  {
    title: 'Teslimat, İptal ve İade',
    href: '/teslimat-ve-iade',
    description: 'Sprint teslimat modeli, ücretsiz demo güvencesi ve dijital iade şartları.',
    icon: 'refresh',
  },
  {
    title: 'Mesafeli Hizmet Sözleşmesi',
    href: '/mesafeli-hizmet-sozlesmesi',
    description: '6502 sayılı kanuna uygun dijital yazılım ve tasarım hizmeti sözleşmesi.',
    icon: 'contract',
  },
  {
    title: 'Ön Bilgilendirme Formu',
    href: '/on-bilgilendirme-formu',
    description: 'Hizmet sağlayıcı kimliği, kapsam, toplam fiyat ve cayma istisnaları bildirimi.',
    icon: 'info',
  },
]

interface LegalPageLayoutProps {
  title: string
  subtitle?: string
  badgeText?: string
  readingTime?: string
  currentPath: string
  legislation?: string
  children: React.ReactNode
}

function getIconComponent(icon: LegalLinkItem['icon']) {
  switch (icon) {
    case 'shield':
      return ShieldCheck
    case 'cookie':
      return Cookie
    case 'refresh':
      return RefreshCw
    case 'contract':
      return FileSignature
    case 'info':
    default:
      return Info
  }
}

export default function LegalPageLayout({
  title,
  subtitle,
  badgeText = 'Yasal Bilgilendirme & Sözleşme',
  readingTime = '4 dk okuma',
  currentPath,
  legislation,
  children,
}: LegalPageLayoutProps) {
  const otherPages = LEGAL_PAGES.filter((item) => item.href !== currentPath)

  return (
    <div className="relative min-h-screen bg-[#070a12] text-stone-300 selection:bg-amber-500/20 selection:text-amber-300">
      {/* Ambient background glow */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[480px] opacity-25"
        style={{
          background:
            'radial-gradient(circle at 50% 0%, rgba(217, 119, 6, 0.18), rgba(99, 102, 241, 0.08) 45%, transparent 70%)',
        }}
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-4xl px-5 pt-28 pb-20 sm:px-8 sm:pt-36 sm:pb-28">
        {/* Top Breadcrumb & Back Link */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6 text-xs">
          <Link
            href="/"
            className="group inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 font-medium text-stone-300 transition-all hover:border-white/20 hover:bg-white/10 hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
            <span>← Anasayfa</span>
          </Link>

          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-stone-500">
            <Link href="/" className="hover:text-stone-300 transition-colors">
              Anasayfa
            </Link>
            <span>/</span>
            <span className="text-stone-400">Yasal</span>
            <span>/</span>
            <span className="text-amber-400 font-medium truncate max-w-[200px] sm:max-w-none">
              {title}
            </span>
          </nav>
        </div>

        {/* Page Header */}
        <header className="mt-8 border-b border-white/10 pb-10">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-[11px] font-mono font-medium text-amber-400 uppercase tracking-wider">
              <BrandMark className="h-4 w-4 rounded-md text-[8px]" />
              {badgeText}
            </span>
            {legislation && (
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-mono text-stone-400">
                {legislation}
              </span>
            )}
            <span className="text-xs text-stone-500">·</span>
            <span className="text-xs text-stone-400">{readingTime}</span>
          </div>

          <h1 className="mt-4 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            {title}
          </h1>

          {subtitle && (
            <p className="mt-4 text-base leading-relaxed text-stone-400 max-w-2xl font-light">
              {subtitle}
            </p>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-stone-500">
            <div>
              <span className="text-stone-400 font-medium">Veri Sorumlusu & Sağlayıcı:</span>{' '}
              <span className="text-stone-300">ŞEYHMUS MEŞE YAZILIM MÜHENDİSİ (MESE SYSTEM)</span>
            </div>
            <div>
              <span className="text-stone-400 font-medium">Son Güncelleme:</span>{' '}
              <span className="text-stone-300" suppressHydrationWarning>
                {new Date().toLocaleDateString('tr-TR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
            </div>
            <div>
              <span className="text-stone-400 font-medium">Sürüm:</span>{' '}
              <span className="font-mono text-stone-300">v2026.1</span>
            </div>
          </div>
        </header>

        {/* Main Editorial Content Body */}
        <div className="mt-10 space-y-10">{children}</div>

        {/* Other Legal Pages Navigation */}
        <section className="mt-16 border-t border-white/10 pt-12">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-amber-400" />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-white">
              Diğer Yasal Metinler ve Politikalar
            </h2>
          </div>
          <p className="mt-2 text-xs text-stone-400">
            Şeffaflık, veri güvenliği ve tüketici hakları politikalarımızın tamamını inceleyebilirsiniz.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {otherPages.map((item) => {
              const IconComp = getIconComponent(item.icon)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group flex flex-col justify-between rounded-xl border border-white/10 bg-[#0d121f]/70 p-4 transition-all hover:border-amber-500/30 hover:bg-[#111728]"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-stone-300 group-hover:border-amber-500/30 group-hover:text-amber-400 transition-colors">
                      <IconComp className="h-3.5 w-3.5" />
                    </div>
                    <span className="text-xs font-semibold text-white group-hover:text-amber-300 transition-colors">
                      {item.title}
                    </span>
                  </div>
                  <p className="mt-2 text-[11px] leading-relaxed text-stone-400">
                    {item.description}
                  </p>
                </Link>
              )
            })}
          </div>
        </section>

        {/* Contact & Legal Notices Box */}
        <section className="mt-12 rounded-2xl border border-white/10 bg-gradient-to-br from-[#0e1424] to-[#090d18] p-6 sm:p-8 shadow-xl shadow-black/40">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-widest text-amber-400">
                Hukuki Danışma ve Başvuru
              </span>
              <h3 className="mt-1 text-base font-bold text-white">
                Sorularınız veya Yasal Bildirimleriniz mi Var?
              </h3>
              <p className="mt-2 text-xs text-stone-400 max-w-xl leading-relaxed">
                KVKK kapsamındaki talepleriniz, mesafeli sözleşme sorularınız veya faturalandırma ile ilgili
                her türlü yasal bildirimi doğrudan veri sorumlusu iletişim kanallarımıza iletebilirsiniz.
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-4 text-xs">
                <a
                  href={`mailto:${siteConfig.contact.email}`}
                  className="inline-flex items-center gap-1.5 text-stone-300 hover:text-white transition-colors"
                >
                  <Mail className="h-3.5 w-3.5 text-amber-400" />
                  <span>{siteConfig.contact.email}</span>
                </a>
                <a
                  href={`tel:${siteConfig.contact.phone.replace(/\s/g, '')}`}
                  className="inline-flex items-center gap-1.5 font-mono text-stone-300 hover:text-white transition-colors"
                >
                  <Phone className="h-3.5 w-3.5 text-amber-400" />
                  <span>{siteConfig.contact.phone}</span>
                </a>
              </div>
            </div>

            <div className="shrink-0">
              <a
                href={buildWhatsAppContactHref()}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-amber-500/10 px-4 py-2.5 text-xs font-semibold text-amber-300 border border-amber-500/25 hover:bg-amber-500/20 hover:border-amber-500/40 transition-all shadow-lg shadow-amber-500/5"
              >
                <MessageCircle className="h-4 w-4" />
                <span>Doğrudan İletişim</span>
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
