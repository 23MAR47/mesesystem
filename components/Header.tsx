'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, ArrowUpRight, Phone, Mail } from 'lucide-react'
import siteConfig from '@/config/siteConfig'
import { buildWhatsAppContactHref } from '@/lib/whatsapp'
import { cn } from '@/lib/cn'
import BrandMark from '@/components/BrandMark'

const navItems = [
  { label: 'Çalışmalar', href: '/#referanslar' },
  { label: 'Demolar', href: '/#demolar' },
  { label: 'Hizmetler', href: '/#hizmetler' },
  { label: 'Süreç', href: '/#surec' },
  { label: 'Fiyat hesapla', href: '/#fiyat-hesapla' },
  { label: 'Sorular', href: '/#sss' },
  { label: 'İletişim', href: '/#iletisim' },
]

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  // Scroll detection for header background styling
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const closeMenu = () => {
    document.body.style.overflow = ''
    setMenuOpen(false)
  }
  useEffect(() => {
    if (menuOpen) {
      const originalOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'

      const onKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') setMenuOpen(false)
      }
      window.addEventListener('keydown', onKeyDown)

      return () => {
        document.body.style.overflow = originalOverflow
        window.removeEventListener('keydown', onKeyDown)
      }
    }
  }, [menuOpen])

  // Automatically close menu if viewport expands to desktop
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024) setMenuOpen(false)
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // Smooth scroll handler for anchor links
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    document.body.style.overflow = ''
    setMenuOpen(false)

    if (href.startsWith('/#') || href.startsWith('#')) {
      const targetId = href.replace(/^\/?#/, '')
      if (typeof window !== 'undefined' && (window.location.pathname === '/' || window.location.pathname === '')) {
        e.preventDefault()
        requestAnimationFrame(() => {
          const target = document.getElementById(targetId)
          if (target) {
            target.scrollIntoView({ behavior: 'smooth' })
            window.history.pushState(null, '', `#${targetId}`)
          }
        })
        return
      }
    }
  }

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 transition-all duration-300',
        menuOpen ? 'z-[60]' : 'z-50',
        menuOpen
          ? 'fixed inset-0 h-screen h-dvh flex flex-col bg-[#f7f4ed] border-none'
          : scrolled
            ? 'border-b border-zinc-200/90 bg-[#f6f4ef]/95 shadow-sm backdrop-blur-xl'
            : 'border-b border-transparent bg-[#f6f4ef]/80 backdrop-blur-lg'
      )}
    >
      <div className="mx-auto flex h-[76px] w-full shrink-0 max-w-7xl items-center justify-between px-5 sm:px-8 lg:h-[92px] lg:px-12">
        <a
          href="/#anasayfa"
          onClick={(e) => handleNavClick(e, '/#anasayfa')}
          className="focus-ring group flex items-center gap-3 rounded-sm"
          aria-label="MESE SYSTEM, ana sayfa"
        >
          <BrandMark className="size-9" />
          <span className="font-display text-base font-bold tracking-tight text-zinc-950 dark:text-white sm:text-lg">
            MESE SYSTEM
          </span>
        </a>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-3 lg:flex xl:gap-5" aria-label="Ana menü">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={(e) => handleNavClick(e, item.href)}
              className="focus-ring rounded-sm text-xs text-stone-600 transition-colors hover:text-[#8b5835] xl:text-[13px]"
            >
              {item.label}
            </a>
          ))}
          <a
            href="/#fiyat-hesapla"
            onClick={(e) => handleNavClick(e, '/#fiyat-hesapla')}
            className="focus-ring inline-flex items-center gap-2 rounded-full bg-stone-900 px-5 py-3 text-xs font-medium text-white transition-colors hover:bg-[#8b5835]"
          >
            Teklif al
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
          </a>
        </nav>

        {/* Mobile Menu Trigger */}
        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          className="focus-ring rounded-full p-2 text-stone-800 lg:hidden"
          aria-expanded={menuOpen}
          aria-label={menuOpen ? 'Menüyü kapat' : 'Menüyü aç'}
        >
          {menuOpen ? <X className="h-6 w-6" aria-hidden /> : <Menu className="h-6 w-6" aria-hidden />}
        </button>
      </div>

      {/* Mobile Drawer (Matches media_1794137838493_5cffb266.png) */}
      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="flex-1 w-full z-[60] overflow-y-auto overscroll-contain bg-[#f7f4ed] px-6 pb-6 pt-2 lg:hidden"
            aria-label="Mobil menü"
            role="dialog"
            aria-modal="true"
          >
            <div className="flex min-h-full flex-col justify-between">
              {/* Primary Navigation Links with Dividers */}
              <div className="flex flex-col divide-y divide-stone-200/80">
                {navItems.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={(e) => handleNavClick(e, item.href)}
                    className="flex items-center justify-between py-4 text-2xl font-bold tracking-tight text-zinc-950 transition-colors hover:text-[#8b5835] active:text-[#8b5835]"
                  >
                    <span>{item.label}</span>
                  </a>
                ))}
              </div>

              {/* Bottom Action Group */}
              <div className="mt-8 space-y-3 pt-4">
                {/* Teklif al Pill Button */}
                <a
                  href="/#fiyat-hesapla"
                  onClick={(e) => handleNavClick(e, '/#fiyat-hesapla')}
                  className="focus-ring flex h-14 w-full items-center justify-between rounded-full bg-zinc-950 px-6 text-base font-semibold text-white shadow-sm transition-all hover:bg-zinc-800 active:scale-[0.99]"
                >
                  <span>Teklif al</span>
                  <span className="flex size-9 items-center justify-center rounded-full bg-[#c5a059] text-zinc-950">
                    <ArrowUpRight className="h-4 w-4 stroke-[2.5]" aria-hidden="true" />
                  </span>
                </a>

                {/* WhatsApp ile yaz Button */}
                <a
                  href={buildWhatsAppContactHref()}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={closeMenu}
                  className="focus-ring flex h-12 w-full items-center justify-center gap-2.5 rounded-full border border-stone-300 bg-white text-sm font-semibold text-zinc-900 shadow-sm transition-all hover:bg-stone-50 active:scale-[0.99]"
                >
                  <span className="size-2 rounded-full bg-[#25D366]" aria-hidden="true" />
                  <span>WhatsApp ile yaz</span>
                </a>

                {/* 2-Column Action Grid: Ara & E-posta */}
                <div className="grid grid-cols-2 gap-3">
                  <a
                    href={`tel:${siteConfig.contact.phone.replace(/\s/g, '')}`}
                    onClick={closeMenu}
                    className="focus-ring flex flex-col items-center justify-center rounded-2xl border border-stone-200/90 bg-white/80 py-3.5 text-zinc-800 shadow-sm transition-all hover:bg-white active:scale-[0.99]"
                  >
                    <Phone className="mb-1.5 h-4 w-4 text-[#8b5835]" aria-hidden="true" />
                    <span className="text-xs font-semibold">Ara</span>
                  </a>

                  <a
                    href={`mailto:${siteConfig.contact.email}`}
                    onClick={closeMenu}
                    className="focus-ring flex flex-col items-center justify-center rounded-2xl border border-stone-200/90 bg-white/80 py-3.5 text-zinc-800 shadow-sm transition-all hover:bg-white active:scale-[0.99]"
                  >
                    <Mail className="mb-1.5 h-4 w-4 text-[#8b5835]" aria-hidden="true" />
                    <span className="text-xs font-semibold">E-posta</span>
                  </a>
                </div>
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  )
}
