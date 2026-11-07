import siteConfig from '@/config/siteConfig'
import { formatCurrencyTL } from '@/lib/format'
import type { DemoFormData, PricingItem, SubscriptionPlan } from '@/types'

export interface CartPayload {
  service: PricingItem | null
  addons: PricingItem[]
  subscription: SubscriptionPlan | null
}

export function buildQuoteMessage({ service, addons, subscription }: CartPayload): string {
  const lines: string[] = []
  lines.push('Merhaba MESE SYSTEM! Web sitesi paketi için teklif almak istiyorum.')
  lines.push('')

  if (service) {
    lines.push(`📦 Temel Hizmet: ${service.name} — ${formatCurrencyTL(service.price)}`)
  }

  if (addons.length > 0) {
    lines.push('➕ Ek Özellikler:')
    for (const addon of addons) {
      lines.push(`   • ${addon.name} (+${formatCurrencyTL(addon.price)})`)
    }
  }

  if (subscription) {
    const periodLabel =
      subscription.id === 'yearly' ? 'Yıllık abonelik' : 'Aylık abonelik'
    lines.push(
      `🔄 Bakım & Sunucu: ${periodLabel} — ${formatCurrencyTL(subscription.price)}/${subscription.period}`
    )
  }

  const oneOffTotal =
    (service?.price ?? 0) + addons.reduce((sum, a) => sum + a.price, 0)

  lines.push('')
  lines.push(`💰 Tek Seferlik Toplam: ${formatCurrencyTL(oneOffTotal)}`)

  return lines.join('\n')
}

function buildDemoRequestMessage(form: DemoFormData, cart?: CartPayload): string {
  const lines: string[] = []
  lines.push('Merhaba MESE SYSTEM! Ücretsiz demo talep ediyorum.')
  lines.push('')
  lines.push(`👤 Ad Soyad: ${form.name}`)
  if (form.phone) lines.push(`📞 Telefon: ${form.phone}`)
  if (form.email) lines.push(`✉️ E-posta: ${form.email}`)
  if (cart?.service) lines.push(`📦 İlgilendiği Paket: ${cart.service.name}`)
  if (form.note) {
    lines.push('')
    lines.push(`📝 Not: ${form.note}`)
  }
  return lines.join('\n')
}

function waLink(message: string): string {
  return `https://wa.me/${siteConfig.contact.whatsapp}?text=${encodeURIComponent(message)}`
}

export function buildWhatsAppContactHref(
  message = 'Merhaba MESE SYSTEM, projem hakkında bilgi almak istiyorum.'
): string {
  return waLink(message)
}

export function openWhatsAppQuote(cart: CartPayload): void {
  window.open(waLink(buildQuoteMessage(cart)), '_blank', 'noopener,noreferrer')
}

export function openWhatsAppDemoRequest(
  form: DemoFormData,
  cart?: CartPayload
): void {
  window.open(waLink(buildDemoRequestMessage(form, cart)), '_blank', 'noopener,noreferrer')
}

export function buildWhatsAppQuoteHref(cart: CartPayload): string {
  return waLink(buildQuoteMessage(cart))
}
