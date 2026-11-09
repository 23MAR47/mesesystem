import { MapPin, Phone, Mail, MessageCircle } from 'lucide-react'
import siteConfig from '@/config/siteConfig'
import BrandMark from '@/components/BrandMark'
import { buildWhatsAppContactHref } from '@/lib/whatsapp'

export default function Footer() {
  return (
    <footer id="iletisim" className="scroll-mt-24 bg-[#050507] text-zinc-400">
      <div className="mx-auto max-w-7xl px-6">
        {/* Top CTA Row */}
        <div className="flex flex-col gap-6 border-b border-zinc-800 py-14 md:flex-row md:items-center md:justify-between md:py-16">
          <div className="max-w-xl">
            <h2 className="text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl">
              Projenizi konuşalım.
            </h2>
            <p className="mt-3 text-base leading-relaxed text-zinc-400">
              Size özel demo sitenizi hazırlayalım; beğenirseniz birlikte yayına alalım.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <a
              href={buildWhatsAppContactHref()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#c5a059] px-6 text-[15px] font-semibold text-zinc-950 transition-colors hover:bg-[#d5b681]"
            >
              <MessageCircle className="size-4" aria-hidden="true" />
              WhatsApp&apos;tan yazın
            </a>
            <a
              href="/#fiyat-hesapla"
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-zinc-700 px-6 text-[15px] font-semibold text-white transition-colors hover:border-zinc-400"
            >
              Fiyat hesaplayın
            </a>
          </div>
        </div>

        {/* 4-Column Navigation Grid */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 py-12 md:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          {/* Brand Info */}
          <div className="col-span-2 md:col-span-1">
            <a href="/" className="inline-flex items-center gap-2.5 text-white">
              <BrandMark className="size-8" />
              <span className="text-[15px] font-semibold tracking-tight leading-none">
                MESE SYSTEM
              </span>
            </a>
          </div>

          {/* Site Nav */}
          <nav aria-label="Site bölümleri">
            <h3 className="mb-2 text-sm font-semibold text-white">Site</h3>
            <ul>
              <li>
                <a className="inline-flex min-h-10 items-center text-[15px] text-zinc-300 transition-colors hover:text-white" href="/#referanslar">
                  Çalışmalar
                </a>
              </li>
              <li>
                <a className="inline-flex min-h-10 items-center text-[15px] text-zinc-300 transition-colors hover:text-white" href="/#demolar">
                  Demolar
                </a>
              </li>
              <li>
                <a className="inline-flex min-h-10 items-center text-[15px] text-zinc-300 transition-colors hover:text-white" href="/#hizmetler">
                  Hizmetler
                </a>
              </li>
              <li>
                <a className="inline-flex min-h-10 items-center text-[15px] text-zinc-300 transition-colors hover:text-white" href="/#surec">
                  Nasıl çalışıyoruz
                </a>
              </li>
              <li>
                <a className="inline-flex min-h-10 items-center text-[15px] text-zinc-300 transition-colors hover:text-white" href="/#fiyat-hesapla">
                  Fiyat hesaplayıcı
                </a>
              </li>
              <li>
                <a className="inline-flex min-h-10 items-center text-[15px] text-zinc-300 transition-colors hover:text-white" href="/#sss">
                  Sık sorulanlar
                </a>
              </li>
              <li>
                <a className="inline-flex min-h-10 items-center text-[15px] text-zinc-300 transition-colors hover:text-white" href="/#iletisim">
                  İletişim
                </a>
              </li>
            </ul>
          </nav>

          {/* Yasal Nav (Directly matches user screenshot media_1794049406049_8100c858.png) */}
          <nav aria-label="Yasal">
            <h3 className="mb-2 text-sm font-semibold text-white">Yasal</h3>
            <ul>
              <li>
                <a
                  hrefLang="tr"
                  className="inline-flex min-h-10 items-center text-[15px] text-zinc-300 transition-colors hover:text-white"
                  href="/gizlilik-politikasi"
                >
                  Gizlilik politikası
                </a>
              </li>
              <li>
                <a
                  hrefLang="tr"
                  className="inline-flex min-h-10 items-center text-[15px] text-zinc-300 transition-colors hover:text-white"
                  href="/gizlilik-politikasi#kvkk"
                >
                  KVKK aydınlatma metni
                </a>
              </li>
              <li>
                <a
                  hrefLang="tr"
                  className="inline-flex min-h-10 items-center text-[15px] text-zinc-300 transition-colors hover:text-white"
                  href="/cerez-politikasi"
                >
                  Çerez politikası
                </a>
              </li>
              <li>
                <a
                  hrefLang="tr"
                  className="inline-flex min-h-10 items-center text-[15px] text-zinc-300 transition-colors hover:text-white"
                  href="/teslimat-ve-iade"
                >
                  Teslimat, iptal ve iade
                </a>
              </li>
              <li>
                <a
                  hrefLang="tr"
                  className="inline-flex min-h-10 items-center text-[15px] text-zinc-300 transition-colors hover:text-white"
                  href="/mesafeli-hizmet-sozlesmesi"
                >
                  Mesafeli hizmet sözleşmesi
                </a>
              </li>
              <li>
                <a
                  hrefLang="tr"
                  className="inline-flex min-h-10 items-center text-[15px] text-zinc-300 transition-colors hover:text-white"
                  href="/on-bilgilendirme-formu"
                >
                  Ön bilgilendirme formu
                </a>
              </li>
            </ul>
          </nav>

          {/* Contact Address */}
          <address className="col-span-2 not-italic md:col-span-1">
            <h3 className="mb-2 text-sm font-semibold text-white">İletişim</h3>
            <ul className="grid gap-1">
              <li className="flex min-h-10 items-center gap-2.5 text-[15px] text-zinc-300">
                <MapPin className="size-4 shrink-0 text-[#c5a059]" aria-hidden="true" />
                {siteConfig.contact.address || 'İstanbul, Türkiye'}
              </li>
              <li>
                <a
                  href={`tel:${siteConfig.contact.phone.replace(/\s/g, '')}`}
                  className="inline-flex min-h-10 items-center gap-2.5 text-[15px] text-zinc-300 transition-colors hover:text-white font-mono"
                >
                  <Phone className="size-4 shrink-0 text-[#c5a059]" aria-hidden="true" />
                  {siteConfig.contact.phone}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${siteConfig.contact.email}`}
                  className="inline-flex min-h-10 items-center gap-2.5 text-[15px] text-zinc-300 transition-colors hover:text-white break-all"
                >
                  <Mail className="size-4 shrink-0 text-[#c5a059]" aria-hidden="true" />
                  {siteConfig.contact.email}
                </a>
              </li>
            </ul>
          </address>
        </div>

        {/* Bottom Bar: Copyright */}
        <div className="flex flex-col items-center justify-between gap-5 border-t border-zinc-800 py-8 text-sm text-zinc-400 sm:flex-row">
          <p suppressHydrationWarning>© {new Date().getFullYear()} MESE SYSTEM. Tüm hakları saklıdır.</p>
        </div>
      </div>
    </footer>
  )
}
