import { MapPin, Phone, Mail, MessageCircle } from 'lucide-react'
import siteConfig from '@/config/siteConfig'
import BrandMark from '@/components/BrandMark'
import { buildWhatsAppContactHref } from '@/lib/whatsapp'

export default function Footer() {
  return (
    <footer id="iletisim" className="bg-[#050507] text-zinc-400">
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

            <p className="mt-4 max-w-xs text-[15px] leading-relaxed text-zinc-400">
              Web sitesi, mobil uygulama ve özel yazılım. İstanbul merkezli, Türkiye geneline hizmet.
            </p>
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

        {/* Bottom Bar: Copyright & Payment Badges */}
        <div className="flex flex-col-reverse items-start gap-5 border-t border-zinc-800 py-8 text-sm text-zinc-400 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} MESE SYSTEM. Tüm hakları saklıdır.</p>
          <div className="flex items-center gap-3">
            <span>Güvenli ödeme</span>
            {/* Mastercard Badge SVG */}
            <svg viewBox="0 0 38 24" className="h-8 w-auto" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Mastercard">
              <rect width="38" height="24" rx="5" fill="#111114" stroke="#27272A" strokeWidth="1" />
              <clipPath id="mc-overlap">
                <circle cx="15" cy="12" r="5.6" />
              </clipPath>
              <circle cx="15" cy="12" r="5.6" fill="#EB001B" />
              <circle cx="23" cy="12" r="5.6" fill="#F79E1B" />
              <g clipPath="url(#mc-overlap)">
                <circle cx="23" cy="12" r="5.6" fill="#FF5F00" />
              </g>
            </svg>
            {/* Visa Badge SVG */}
            <svg viewBox="0 0 38 24" className="h-8 w-auto" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Visa">
              <rect width="38" height="24" rx="5" fill="#111114" stroke="#27272A" strokeWidth="1" />
              <path d="M14.2 16.2H12.3L13.5 7.8H15.4L14.2 16.2ZM21.2 8.0C20.8 7.9 20.2 7.8 19.5 7.8C17.5 7.8 16.1 8.8 16.1 10.3C16.1 11.4 17.1 12.0 17.9 12.4C18.7 12.8 19.0 13.1 19.0 13.5C19.0 14.1 18.3 14.4 17.6 14.4C16.7 14.4 16.2 14.2 15.5 13.9L15.2 13.8L14.9 15.4C15.4 15.6 16.4 15.8 17.4 15.8C19.5 15.8 20.9 14.8 20.9 13.2C20.9 11.4 18.3 11.3 18.3 10.5C18.3 10.2 18.6 10.0 19.2 9.9C19.5 9.9 20.2 9.8 21.0 10.2L21.3 10.3L21.6 8.7L21.2 8.0ZM26.2 13.9L27.0 11.6C27.0 11.6 27.2 11.1 27.3 10.8L27.4 11.5L27.9 13.9H26.2ZM28.6 7.8H27.0C26.5 7.8 26.1 8.0 25.9 8.5L22.8 16.2H24.8L25.2 15.0H27.7L27.9 16.2H29.7L28.6 7.8ZM10.5 7.8L8.6 13.4L8.4 12.3C8.0 11.0 6.8 9.5 5.5 8.8L7.3 16.2H9.3L12.4 7.8H10.5Z" fill="#FFFFFF" />
              <path d="M7.3 8.8C6.3 8.4 5.3 8.0 4.5 7.8L4.6 7.8L6.4 15.0L8.4 12.3L7.3 8.8Z" fill="#F7B600" />
            </svg>
          </div>
        </div>
      </div>
    </footer>
  )
}
