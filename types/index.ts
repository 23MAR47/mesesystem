import type { DemoProject, PricingItem, SubscriptionPlan, DemoCategory } from '@/config/siteConfig'

export type { DemoProject, PricingItem, SubscriptionPlan, DemoCategory }

export type SubscriptionChoice = 'monthly' | 'yearly'

export interface PricingSelection {
  serviceId: string | null
  addonIds: string[]
  subscription: SubscriptionChoice | null
}

export interface DemoFormData {
  name: string
  phone: string
  email: string
  note: string
}
