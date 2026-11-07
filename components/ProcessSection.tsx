'use client'

import { motion } from 'framer-motion'
import { Code2, PenTool, Rocket, Search } from 'lucide-react'
import { PROCESS_BENEFITS, PROCESS_STEPS } from '@/config/referenceSite'

const stepIcons = [Search, PenTool, Code2, Rocket]

export default function ProcessSection() {
  return (
    <section
      id="surec"
      className="scroll-mt-24 bg-[#f6f4ef] px-5 py-20 text-zinc-950 sm:px-8 sm:py-24 lg:px-12"
    >
      <div className="mx-auto max-w-7xl">
        <div className="max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
            Çalışma sürecimiz
          </p>
          <h2 className="mt-4 font-display text-3xl font-semibold leading-tight tracking-[-0.04em] sm:text-5xl">
            İlk fikirden yayına, birlikte.
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-6 text-zinc-600 sm:text-base">
            Her aşamada ne yapacağımızı ve sizden neye ihtiyaç duyduğumuzu
            önceden netleştiriyoruz.
          </p>
        </div>

        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {PROCESS_STEPS.map((step, index) => {
            const Icon = stepIcons[index]
            return (
              <motion.article
                key={step.title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.35, delay: index * 0.06 }}
                className="rounded-xl border border-zinc-200 bg-white p-5 sm:p-6"
              >
                <div className="flex items-center justify-between">
                  <span className="font-display text-3xl font-semibold tracking-tight text-zinc-300">
                    0{index + 1}
                  </span>
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f6f4ef] text-[#8b5835]">
                    <Icon className="h-4 w-4" aria-hidden />
                  </span>
                </div>
                <h3 className="mt-5 font-display text-lg font-semibold text-zinc-950">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-zinc-600">
                  {step.description}
                </p>
              </motion.article>
            )
          })}
        </div>

        <div className="mt-16 border-t border-zinc-300 pt-8">
          <h3 className="font-display text-xl font-semibold text-zinc-950">
            Projenizin her aşamasında
          </h3>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {PROCESS_BENEFITS.map((benefit) => (
              <div key={benefit.title}>
                <h4 className="text-sm font-semibold text-zinc-900">
                  {benefit.title}
                </h4>
                <p className="mt-2 text-xs leading-5 text-zinc-600">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
