import { ArrowUpRight, Code2, MonitorPlay, ShoppingBag, Smartphone } from 'lucide-react'
import { SERVICES } from '@/config/referenceSite'

const serviceIcons = [MonitorPlay, ShoppingBag, Smartphone, Code2]

export default function ServicesSection() {
  return (
    <section
      id="hizmetler"
      className="scroll-mt-24 bg-white px-5 py-20 text-zinc-950 sm:px-8 sm:py-24 lg:px-12"
    >
      <div className="mx-auto max-w-7xl">
        <div className="max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
            Hizmetler
          </p>
          <h2 className="mt-4 font-display text-3xl font-semibold leading-tight tracking-[-0.04em] sm:text-5xl">
            Fikrinize uygun dijital çözüm.
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-6 text-zinc-600 sm:text-base">
            İhtiyacınızı ve hedefinizi dinliyor, size gerçekten gereken ürünü
            birlikte belirliyoruz.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {SERVICES.map((service, index) => {
            const Icon = serviceIcons[index]
            return (
              <article
                key={service.title}
                className="flex flex-col rounded-xl border border-zinc-200 bg-[#f6f4ef] p-5 transition-colors hover:border-zinc-300 hover:bg-white sm:p-6"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#8b5835]">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <h3 className="mt-5 font-display text-lg font-semibold leading-snug text-zinc-950">
                  {service.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-zinc-600">
                  {service.description}
                </p>
                <ul className="mt-5 space-y-2 border-t border-zinc-200 pt-4">
                  {service.points.map((point) => (
                    <li key={point} className="flex gap-2 text-xs leading-5 text-zinc-600">
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[#a66c43]" />
                      {point}
                    </li>
                  ))}
                </ul>
                <a
                  href="#fiyat-hesapla"
                  className="focus-ring mt-6 inline-flex items-center gap-1 self-start text-xs font-medium text-zinc-800 transition-colors hover:text-[#8b5835]"
                >
                  Fiyatı hesapla
                  <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
                </a>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
