'use client'

import { useState } from 'react'
import { ArrowUpRight, Check, Copy, Sparkles } from 'lucide-react'
import {
  PRICING_ADDONS,
  PRICING_SERVICES,
  PRICING_SIZES,
} from '@/config/referenceSite'
import { buildWhatsAppContactHref } from '@/lib/whatsapp'

const formatPrice = (price: number) =>
  new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    maximumFractionDigits: 0,
  }).format(price)

export default function PriceCalculator() {
  const [serviceId, setServiceId] = useState<(typeof PRICING_SERVICES)[number]['id']>(
    PRICING_SERVICES[0].id
  )
  const [sizeId, setSizeId] = useState<(typeof PRICING_SIZES)[number]['id']>(
    PRICING_SIZES[0].id
  )
  const [selectedAddonIds, setSelectedAddonIds] = useState<string[]>([])
  const [copyStatus, setCopyStatus] = useState('')

  const service = PRICING_SERVICES.find((option) => option.id === serviceId)!
  const size = PRICING_SIZES.find((option) => option.id === sizeId)!
  const addons = PRICING_ADDONS.filter((addon) => selectedAddonIds.includes(addon.id))
  const total = service.price + size.price + addons.reduce((sum, addon) => sum + addon.price, 0)
  const quoteMessage = [
    'Merhaba, projem için WhatsApp üzerinden teklif almak istiyorum.',
    `Proje türü: ${service.title} — ${formatPrice(service.price)}`,
    `Kapsam: ${size.title} — ${formatPrice(size.price)}`,
    ...addons.map((addon) => `Ek hizmet: ${addon.title} — ${formatPrice(addon.price)}`),
    `Tahmini toplam: ${formatPrice(total)}`,
  ].join('\n')

  function toggleAddon(addonId: string) {
    setSelectedAddonIds((selected) =>
      selected.includes(addonId)
        ? selected.filter((id) => id !== addonId)
        : [...selected, addonId]
    )
  }

  async function copyEstimate() {
    if (!navigator.clipboard) {
      setCopyStatus('Bu tarayıcı panoya kopyalamayı desteklemiyor.')
      return
    }

    const estimate = [
      'MESE SYSTEM · Tahmini proje bedeli',
      `Hizmet: ${service.title} — ${formatPrice(service.price)}`,
      `Proje kapsamı: ${size.title} — ${formatPrice(size.price)}`,
      ...addons.map((addon) => `Ek hizmet: ${addon.title} — ${formatPrice(addon.price)}`),
      `Teslimat: Standart — ${formatPrice(0)}`,
      `Tahmini toplam: ${formatPrice(total)}`,
      'Nihai teklif proje kapsamı netleştikten sonra belirlenir.',
    ].join('\n')

    try {
      await navigator.clipboard.writeText(estimate)
      setCopyStatus('Tahmin panoya kopyalandı.')
    } catch (error) {
      console.error('Tahmini panoya kopyalama başarısız oldu.', error)
      setCopyStatus('Kopyalama başarısız oldu. Tarayıcı izinlerini kontrol edin.')
    }
  }

  return (
    <section
      id="fiyat-hesapla"
      className="scroll-mt-24 bg-[#f6f4ef] px-5 py-20 text-zinc-950 sm:px-8 sm:py-24 lg:px-12"
    >
      <div className="mx-auto max-w-7xl">
        <div className="max-w-2xl">
          <p className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
            <Sparkles className="h-3.5 w-3.5 text-[#8b5835]" aria-hidden />
            Fiyat hesaplayıcı
          </p>
          <h2 className="mt-4 font-display text-3xl font-semibold leading-tight tracking-[-0.04em] sm:text-5xl">
            Projenizin tahmini bütçesini hesaplayın.
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-6 text-zinc-600 sm:text-base">
            İhtiyacınızı seçin, kapsamı belirleyin ve tahmini toplamı görün. Kesin
            fiyat proje detayları netleştikten sonra belirlenir.
          </p>
        </div>

        <div className="mt-10 grid items-start gap-8 lg:grid-cols-[1.4fr_0.8fr] lg:gap-12">
          <div className="space-y-9">
            <fieldset>
              <legend className="font-display text-lg font-semibold text-zinc-950">
                1. Proje türü
              </legend>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {PRICING_SERVICES.map((option) => {
                  const selected = serviceId === option.id
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setServiceId(option.id)}
                      aria-pressed={selected}
                      className={`focus-ring flex min-h-20 items-center justify-between gap-4 rounded-xl border p-4 text-left transition-colors ${
                        selected
                          ? 'border-zinc-950 bg-white shadow-sm'
                          : 'border-zinc-200 bg-white/50 hover:border-zinc-400'
                      }`}
                    >
                      <span className="text-sm font-medium text-zinc-800">{option.title}</span>
                      <span className="shrink-0 text-xs font-semibold text-zinc-600">
                        {formatPrice(option.price)}
                      </span>
                    </button>
                  )
                })}
              </div>
            </fieldset>

            <fieldset>
              <legend className="font-display text-lg font-semibold text-zinc-950">
                2. Proje kapsamı
              </legend>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {PRICING_SIZES.map((option) => {
                  const selected = sizeId === option.id
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setSizeId(option.id)}
                      aria-pressed={selected}
                      className={`focus-ring rounded-xl border p-4 text-left transition-colors ${
                        selected
                          ? 'border-zinc-950 bg-white shadow-sm'
                          : 'border-zinc-200 bg-white/50 hover:border-zinc-400'
                      }`}
                    >
                      <span className="block text-sm font-medium text-zinc-800">
                        {option.title}
                      </span>
                      <span className="mt-1 block text-xs leading-5 text-zinc-500">
                        {option.description}
                      </span>
                      <span className="mt-3 block text-xs font-semibold text-zinc-700">
                        {option.price === 0 ? 'Dahil' : `+${formatPrice(option.price)}`}
                      </span>
                    </button>
                  )
                })}
              </div>
            </fieldset>

            <fieldset>
              <legend className="font-display text-lg font-semibold text-zinc-950">
                3. Ek hizmetler
              </legend>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {PRICING_ADDONS.map((addon) => {
                  const selected = selectedAddonIds.includes(addon.id)
                  return (
                    <button
                      key={addon.id}
                      type="button"
                      onClick={() => toggleAddon(addon.id)}
                      aria-pressed={selected}
                      className={`focus-ring flex items-start justify-between gap-4 rounded-xl border p-4 text-left transition-colors ${
                        selected
                          ? 'border-zinc-950 bg-white shadow-sm'
                          : 'border-zinc-200 bg-white/50 hover:border-zinc-400'
                      }`}
                    >
                      <span className="flex items-start gap-3">
                        <span
                          className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                            selected
                              ? 'border-zinc-950 bg-zinc-950 text-white'
                              : 'border-zinc-300 text-transparent'
                          }`}
                        >
                          <Check className="h-3 w-3" aria-hidden />
                        </span>
                        <span>
                          <span className="block text-sm font-medium text-zinc-800">
                            {addon.title}
                          </span>
                          <span className="mt-1 block text-xs leading-5 text-zinc-500">
                            {addon.description}
                          </span>
                        </span>
                      </span>
                      <span className="shrink-0 text-xs font-semibold text-zinc-600">
                        {addon.price === 0 ? 'Dahil' : `+${formatPrice(addon.price)}`}
                      </span>
                    </button>
                  )
                })}
              </div>
            </fieldset>

          </div>

          <aside className="lg:sticky lg:top-28">
            <div className="rounded-2xl bg-zinc-950 p-6 text-white sm:p-7">
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-zinc-400">
                Tahmini proje bedeli
              </p>
              <p className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                {formatPrice(total)}
              </p>
              <div className="mt-6 space-y-3 border-t border-white/15 pt-5 text-sm">
                <div className="flex items-start justify-between gap-4 text-zinc-300">
                  <span>{service.title}</span>
                  <span className="shrink-0">{formatPrice(service.price)}</span>
                </div>
                <div className="flex items-start justify-between gap-4 text-zinc-300">
                  <span>{size.title} kapsam</span>
                  <span className="shrink-0">{formatPrice(size.price)}</span>
                </div>
                {addons.map((addon) => (
                  <div
                    key={addon.id}
                    className="flex items-start justify-between gap-4 text-zinc-300"
                  >
                    <span>{addon.title}</span>
                    <span className="shrink-0">{formatPrice(addon.price)}</span>
                  </div>
                ))}
                <div className="flex items-start justify-between gap-4 text-zinc-300">
                  <span>Standart teslimat</span>
                  <span className="shrink-0">{formatPrice(0)}</span>
                </div>
              </div>
              <p className="mt-5 text-xs leading-5 text-zinc-400">
                Bu hesaplama tahminidir. Nihai fiyat proje kapsamı netleştikten sonra
                belirlenir.
              </p>
              <button
                type="button"
                onClick={copyEstimate}
                className="focus-ring mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-medium text-zinc-950 transition-colors hover:bg-zinc-200"
              >
                <Copy className="h-4 w-4" aria-hidden />
                Tahmini kopyala
              </button>
              <p role="status" aria-live="polite" className="mt-2 min-h-4 text-center text-xs text-zinc-300">
                {copyStatus}
              </p>
              <a
                href={buildWhatsAppContactHref(quoteMessage)}
                target="_blank"
                rel="noreferrer"
                className="focus-ring mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/25 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-white/10"
              >
                WhatsApp'tan bize ulaşın
                <ArrowUpRight className="h-4 w-4" aria-hidden />
              </a>
            </div>
          </aside>
        </div>
      </div>
    </section>
  )
}
