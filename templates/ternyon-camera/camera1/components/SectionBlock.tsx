"use client";

import gsap from "gsap";
import { useEffect, useRef } from "react";

import type { SectionContent } from "@/lib/content";
import { view } from "@/lib/state";
import MagneticButton from "./ui/MagneticButton";
import Metric from "./ui/Metric";

interface Props {
  section: SectionContent;
  index: number;
}

/**
 * Title split to the word. The reveal sweeps left to right, each word
 * resolving out of a blur — which survives line wrapping far better
 * than a per-line clip mask.
 */
function Lines({ lines }: { lines: string[] }) {
  return (
    <>
      {lines.map((line, li) => (
        <span className="title-line" key={li}>
          {line.split(" ").map((word, wi, all) => (
            <span className="word" key={wi}>
              {word}
              {wi < all.length - 1 ? " " : ""}
            </span>
          ))}
        </span>
      ))}
    </>
  );
}

function Eyebrow({ index, text }: { index: string; text: string }) {
  return (
    <span className="eyebrow" data-fade>
      <b>{index}</b>
      <i />
      {text}
    </span>
  );
}

function Stats({ stats }: { stats: NonNullable<SectionContent["stats"]> }) {
  return (
    <div className="stat-row" data-fade>
      {stats.map((s) => (
        <div key={s.label} className="stat">
          <Metric value={s.value} className="metric" />
          <span className="mono-label">{s.label}</span>
        </div>
      ))}
    </div>
  );
}

function Ctas({ ctas }: { ctas: NonNullable<SectionContent["ctas"]> }) {
  return (
    <div className="cta-row" data-fade>
      {ctas.map((c) => (
        <MagneticButton
          key={c.label}
          label={c.label}
          variant={c.variant}
          arrow={c.variant === "primary"}
        />
      ))}
    </div>
  );
}

export default function SectionBlock({ section, index }: Props) {
  const panel = useRef<HTMLDivElement>(null);

  /* The reveal is driven by the scroll engine's active-section event so
     it fires exactly when the copy starts fading in — an
     IntersectionObserver would fire far too early on 200vh sections. */
  useEffect(() => {
    const el = panel.current;
    if (!el) return;

    const words = el.querySelectorAll<HTMLElement>(".word");
    const fades = el.querySelectorAll<HTMLElement>("[data-fade]");

    if (view.reduced) {
      gsap.set(words, { opacity: 1, filter: "blur(0px)", y: 0 });
      gsap.set(fades, { y: 0, opacity: 1 });
      return;
    }

    const reset = () => {
      gsap.killTweensOf(words);
      gsap.killTweensOf(fades);
      gsap.set(words, { opacity: 0, filter: "blur(13px)", y: 14 });
      gsap.set(fades, { y: 16, opacity: 0 });
    };

    const play = () => {
      gsap.killTweensOf(words);
      gsap.killTweensOf(fades);
      gsap.to(words, {
        opacity: 1,
        filter: "blur(0px)",
        y: 0,
        duration: 1.15,
        ease: "power2.out",
        stagger: 0.048,
      });
      gsap.to(fades, {
        y: 0,
        opacity: 1,
        duration: 1.05,
        ease: "power3.out",
        stagger: 0.07,
        delay: 0.12,
      });
    };

    reset();

    const onSection = (e: Event) => {
      const active = (e as CustomEvent<number>).detail;
      if (active === index) play();
      else reset();
    };

    document.addEventListener("aperture:section", onSection);
    return () => {
      document.removeEventListener("aperture:section", onSection);
      gsap.killTweensOf(words);
      gsap.killTweensOf(fades);
    };
  }, [index]);

  const Heading = index === 0 ? "h1" : "h2";
  const hero = index === 0;

  const aside = (
    <>
      <span className="rule" data-fade />
      <p className="lede" data-fade>
        {section.body}
      </p>
      {section.note && (
        <span className="mono-label note" data-fade>
          {section.note}
        </span>
      )}
      {section.stats && <Stats stats={section.stats} />}
      {section.ctas && <Ctas ctas={section.ctas} />}
    </>
  );

  return (
    <section className="stage-section" aria-label={section.eyebrow}>
      <div className="stage-pin">
        <div
          ref={panel}
          data-panel
          className={`panel panel--${section.layout} relative w-full`}
        >
          <div className="scrim" />

          {section.layout === "flank" ? (
            <div className="flank">
              <div className="flank__side flank__left">
                <Eyebrow index={section.index} text={section.eyebrow} />
                <Heading className={hero ? "display" : "display display-sm"}>
                  <Lines lines={section.title} />
                </Heading>
              </div>

              {/* The object lives in this gutter. */}
              <div className="flank__gutter" aria-hidden />

              <div className="flank__side flank__right">{aside}</div>
            </div>
          ) : (
            <div className="offset">
              <div className="offset__body">
                <Eyebrow index={section.index} text={section.eyebrow} />
                <Heading className={hero ? "display" : "display display-sm"}>
                  <Lines lines={section.title} />
                </Heading>
                {aside}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
