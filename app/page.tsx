import Hero from '@/components/Hero'
import PortfolioSection from '@/components/PortfolioSection'
import TrustAndStats from '@/components/TrustAndStats'
import DemoShowcase from '@/components/DemoShowcase'
import ServicesSection from '@/components/ServicesSection'
import ProcessSection from '@/components/ProcessSection'
import PriceCalculator from '@/components/PriceCalculator'
import TestimonialsAndFaq from '@/components/TestimonialsAndFaq'

export default function TerneonPage() {
  return (
    <div className="editorial-theme flex flex-col bg-[#f7f4ed] text-slate-900">
      <Hero />
      <DemoShowcase />
      <TrustAndStats />
      <PortfolioSection />
      <ServicesSection />
      <ProcessSection />
      <PriceCalculator />
      <TestimonialsAndFaq />
    </div>
  )
}
