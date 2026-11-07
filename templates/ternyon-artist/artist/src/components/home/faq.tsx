/**
 * FAQ — an accessible accordion. The catalog spring components cover scroll /
 * hover / mount triggers but not a click toggle, so each row drives a measured
 * height + icon spring via `useSpring` directly (still @react-spring/web — the
 * sanctioned motion library; hard rule #1). Client leaf.
 */
"use client";

import { animated, useSpring } from "@react-spring/web";
import { useEffect, useId, useRef, useState } from "react";
import { Inview } from "@/components/animation/springs/in-view";
import { SectionHeading } from "@/components/ui/section-heading";
import { reveal } from "@/lib/motion";
import { faq, type FaqItem } from "@/data/mocks/home";

const FaqRow = ({ item }: { item: FaqItem }) => {
  const [open, setOpen] = useState(false);
  const [contentHeight, setContentHeight] = useState(0);
  const innerRef = useRef<HTMLDivElement>(null);
  const baseId = useId();
  const panelId = `${baseId}-panel`;
  const buttonId = `${baseId}-button`;

  useEffect(() => {
    const el = innerRef.current;
    if (!el) return;
    const update = () => setContentHeight(el.offsetHeight);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const panel = useSpring({
    height: open ? contentHeight : 0,
    opacity: open ? 1 : 0,
    config: { tension: 240, friction: 32 },
  });
  const icon = useSpring({
    rotate: open ? 45 : 0,
    config: { tension: 300, friction: 22 },
  });

  return (
    <div className="rule-dashed border-t">
      <h3>
        <button
          type="button"
          id={buttonId}
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center justify-between gap-8 py-8 text-left"
        >
          <span className="text-xl font-medium normal-case tracking-normal text-ink lg:text-2xl">
            {item.question}
          </span>
          <animated.span
            style={{ rotate: icon.rotate }}
            className="shrink-0 text-2xl text-ink"
            aria-hidden="true"
          >
            +
          </animated.span>
        </button>
      </h3>
      <animated.div
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        style={{ height: panel.height, opacity: panel.opacity }}
        className="overflow-hidden"
      >
        <div ref={innerRef} className="pb-10">
          <p className="max-w-[60ch] text-lg leading-relaxed text-ink-muted">
            {item.answer}
          </p>
        </div>
      </animated.div>
    </div>
  );
};

export const Faq = () => {
  return (
    <section className="rule-dashed border-t bg-canvas px-6 py-24 lg:px-12 lg:py-32">
      <div className="mx-auto grid max-w-[120rem] grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-4">
          <SectionHeading eyebrow={faq.eyebrow} title={faq.title} />
        </div>
        <div className="lg:col-span-8">
          {faq.items.map((item, i) => (
            <Inview
              key={item.question}
              from={reveal.fade.from}
              to={reveal.fade.to}
              config={reveal.fade.config}
              mode="once"
              delayIn={i * 80}
            >
              <FaqRow item={item} />
            </Inview>
          ))}
        </div>
      </div>
    </section>
  );
};
