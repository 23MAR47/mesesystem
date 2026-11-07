"use client";

import { Hover } from "@/components/animation/springs/hover";
import type { HeroFormContent } from "@/data/mocks/home";

/**
 * The frosted contact-form pill shared by the hero and the closing logo scene.
 *
 * `layout="row"` is the desktop composition's inline pill (name · email · CTA on
 * one line); `layout="stack"` is the mobile reflow (full-width fields stacked
 * over a full-width CTA). The submit button carries the spring hover (`<Hover>`,
 * auto-off on touch), so every CTA on the site lifts the same way.
 */

const HOVER = { tension: 320, friction: 22 } as const;

const FIELD_ROW =
  "w-[180px] bg-transparent font-mulish text-[16px] leading-[1.2] font-normal text-white placeholder:text-white/90";
const FIELD_STACK =
  "w-full rounded-[16px] bg-white/[0.06] px-[18px] py-[14px] font-mulish text-[16px] leading-none font-normal text-white placeholder:text-white/70 focus:bg-white/[0.1] focus:outline-none";

export interface ContactFormProps {
  form: HeroFormContent;
  layout?: "row" | "stack";
}

export const ContactForm = ({ form, layout = "row" }: ContactFormProps) => {
  const row = layout === "row";

  return (
    <form
      onSubmit={(event) => event.preventDefault()}
      className={
        row
          ? "flex items-center gap-[25px] rounded-[32px] border border-[color:var(--hero-glass-border)] bg-[var(--hero-glass)] py-[2px] pr-[2px] pl-[32px] backdrop-blur-[8px]"
          : "flex flex-col gap-[10px] rounded-[24px] border border-[color:var(--hero-glass-border)] bg-[var(--hero-glass)] p-[10px] backdrop-blur-[8px]"
      }
    >
      <input
        type="text"
        aria-label={form.name}
        placeholder={form.name}
        className={row ? FIELD_ROW : FIELD_STACK}
      />
      <input
        type="email"
        aria-label={form.email}
        placeholder={form.email}
        className={row ? FIELD_ROW : FIELD_STACK}
      />
      <Hover
        tag="div"
        from={{ scale: 1 }}
        to={{ scale: 1.03 }}
        config={HOVER}
        className={row ? "shrink-0" : "w-full"}
      >
        <button
          type="submit"
          className={
            row
              ? "flex w-full shrink-0 items-center justify-center gap-[8px] rounded-[50px] py-[2px] pr-[28px] pl-[2px]"
              : "flex w-full items-center justify-center gap-[10px] rounded-[50px] py-[6px] pr-[24px] pl-[6px]"
          }
          style={{ backgroundImage: "var(--gradient-hero-cta)" }}
        >
          <span className="relative block size-[39px] shrink-0">
            <span className="absolute top-0 left-0 size-[39px] rounded-[50px] bg-white" />
            <svg
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
              className="absolute top-1/2 left-1/2 size-[23px] -translate-x-1/2 -translate-y-1/2"
            >
              <path
                d="M9 6l6 6-6 6"
                stroke="#05060F"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <span className="font-mulish text-[16px] leading-[1.2] font-normal whitespace-nowrap text-white">
            {form.submit}
          </span>
        </button>
      </Hover>
    </form>
  );
};
