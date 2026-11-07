'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUpRight, ChevronDown } from 'lucide-react'
import { FAQS } from '@/config/referenceSite'
import { buildWhatsAppContactHref } from '@/lib/whatsapp'

export default function TestimonialsAndFaq() {
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  return (
    <section
      id="sss"
      className="scroll-mt-24 bg-white px-5 py-20 text-zinc-950 sm:px-8 sm:py-24 lg:px-12"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
            Merak edilenler
          </p>
          <h2 className="mt-4 font-display text-3xl font-semibold leading-tight tracking-[-0.04em] sm:text-5xl">
            Sıkça sorulan sorular.
          </h2>
        </div>

        <div className="mx-auto mt-10 max-w-3xl divide-y divide-zinc-200 border-y border-zinc-200">
          {FAQS.map((faq, index) => {
            const isOpen = openFaq === index
            const answerId = `sss-cevap-${index + 1}`
            return (
              <article key={faq.question}>
                <h3>
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    aria-expanded={isOpen}
                    aria-controls={answerId}
                    className="focus-ring flex w-full items-center justify-between gap-6 py-5 text-left"
                  >
                    <span className="font-display text-sm font-semibold text-zinc-900 sm:text-base">
                      {faq.question}
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 text-zinc-500 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-[#8b5835]' : ''
                      }`}
                      aria-hidden
                    />
                  </button>
                </h3>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={answerId}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <p className="max-w-2xl pb-5 pr-8 text-sm leading-6 text-zinc-600">
                        {faq.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </article>
            )
          })}
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 rounded-xl bg-[#f6f4ef] p-5 sm:flex-row sm:p-6">
          <div>
            <h3 className="font-display text-lg font-semibold text-zinc-950">
              Aklınıza takılan başka bir şey mi var?
            </h3>
            <p className="mt-1 text-sm text-zinc-600">
              Projenizi konuşmak ve ihtiyaçlarınızı netleştirmek için bize ulaşın.
            </p>
          </div>
          <a
            href={buildWhatsAppContactHref()}
            target="_blank"
            rel="noreferrer"
            className="focus-ring inline-flex shrink-0 items-center gap-2 rounded-full bg-zinc-950 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-[#8b5835]"
          >
            WhatsApp'tan bize ulaşın
            <ArrowUpRight className="h-4 w-4" aria-hidden />
          </a>
        </div>
      </div>
    </section>
  )
}
