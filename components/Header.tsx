'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, ArrowUpRight } from 'lucide-react'
import siteConfig from '@/config/siteConfig'
import { cn } from '@/lib/cn'
import BrandMark from '@/components/BrandMark'

const navItems = [
  { label: 'Çalışmalar', href: '/#referanslar' },
  { label: 'Demolar', href: '/#demolar' },
  { label: 'Hizmetler', href: '/#hizmetler' },
  { label: 'Fiyatlar', href: '/#fiyat-hesapla' },
  { label: 'Süreç', href: '/#surec' },
  { label: 'SSS', href: '/#sss' },
  { label: 'İletişim', href: '/#iletisim' },
]

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 border-b transition-all duration-300',
        scrolled
          ? 'border-zinc-200/90 bg-[#f6f4ef]/95 shadow-sm backdrop-blur-xl'
          : 'border-transparent bg-[#f6f4ef]/80 backdrop-blur-lg'
      )}
    >
      <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 sm:px-8 lg:h-[92px] lg:px-12">
        <a
          href="/#anasayfa"
          className="focus-ring group flex items-center gap-3 rounded-sm"
          aria-label="MESE SYSTEM, ana sayfa"
        >
          <BrandMark className="size-9" />
          <span className="font-display text-base font-bold tracking-tight text-zinc-950 dark:text-white sm:text-lg">
            MESE SYSTEM
          </span>
        </a>

        <nav className="hidden items-center gap-3 lg:flex xl:gap-5" aria-label="Ana menü">

          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="focus-ring rounded-sm text-xs text-stone-600 transition-colors hover:text-[#8b5835] xl:text-[13px]"
            >
              {item.label}
            </a>
          ))}
          <a
            href="/#fiyat-hesapla"
            className="focus-ring inline-flex items-center gap-2 rounded-full bg-stone-900 px-5 py-3 text-xs font-medium text-white transition-colors hover:bg-[#8b5835]"
          >
            Teklif al
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
          </a>
        </nav>

        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          className="focus-ring rounded-full p-2 text-stone-800 lg:hidden"
          aria-expanded={menuOpen}
          aria-label={menuOpen ? 'Menüyü kapat' : 'Menüyü aç'}
        >
          {menuOpen ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
        </button>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-stone-200 bg-[#f6f4ef] lg:hidden"
            aria-label="Mobil menü"
          >
            <div className="space-y-1 px-5 py-4">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="focus-ring block rounded-lg px-3 py-3 text-sm text-stone-700 hover:bg-white"
                >
                  {item.label}
                </a>
              ))}
              <a
                href="/#fiyat-hesapla"
                onClick={() => setMenuOpen(false)}
                className="focus-ring mt-2 block rounded-full bg-stone-900 px-4 py-3 text-center text-sm font-medium text-white"
              >
                Teklif al
              </a>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  )
}
