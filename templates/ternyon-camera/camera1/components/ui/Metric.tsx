"use client";

import gsap from "gsap";
import { useEffect, useRef } from "react";

interface Props {
  value: string;
  className?: string;
}

/** Splits "45.7" or "f/1.2" into the number and the decoration around it. */
function parse(value: string) {
  const match = value.match(/[\d.,]+/);
  if (!match) return null;
  const rawNum = match[0];
  const prefix = value.slice(0, match.index ?? 0);
  const suffix = value.slice((match.index ?? 0) + rawNum.length);
  const grouped = rawNum.includes(",");
  const dot = rawNum.indexOf(".");
  const decimals = dot === -1 ? 0 : rawNum.length - dot - 1;
  const target = parseFloat(rawNum.replace(/,/g, ""));
  if (Number.isNaN(target)) return null;
  return { prefix, suffix, target, decimals, grouped, digits: rawNum.length };
}

function format(n: number, decimals: number, grouped: boolean) {
  const fixed = n.toFixed(decimals);
  if (!grouped) return fixed;
  const [int, frac] = fixed.split(".");
  const withCommas = int.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return frac ? `${withCommas}.${frac}` : withCommas;
}

/**
 * Counts up on first view, with a brief digit-scramble at the start —
 * the readout settles rather than simply appearing.
 */
export default function Metric({ value, className }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const played = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const spec = parse(value);
    if (!spec) {
      el.textContent = value;
      return;
    }

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const settled =
      spec.prefix + format(spec.target, spec.decimals, spec.grouped) + spec.suffix;

    if (reduced) {
      el.textContent = settled;
      return;
    }

    el.textContent = spec.prefix + "0".repeat(spec.digits) + spec.suffix;

    const proxy = { n: 0 };
    let tween: gsap.core.Tween | null = null;

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !played.current) {
            played.current = true;
            tween = gsap.to(proxy, {
              n: spec.target,
              duration: 1.9,
              ease: "power3.out",
              onUpdate() {
                const p = tween?.progress() ?? 0;
                if (p < 0.32) {
                  // Scramble phase — same character count, random digits.
                  let s = "";
                  for (let i = 0; i < spec.digits; i++) {
                    s += Math.floor(Math.random() * 10);
                  }
                  el.textContent = spec.prefix + s + spec.suffix;
                } else {
                  el.textContent =
                    spec.prefix +
                    format(proxy.n, spec.decimals, spec.grouped) +
                    spec.suffix;
                }
              },
              onComplete() {
                el.textContent = settled;
              },
            });
          }
        }
      },
      { threshold: 0.35 }
    );

    io.observe(el);
    return () => {
      io.disconnect();
      tween?.kill();
    };
  }, [value]);

  return <span ref={ref} className={className} />;
}
