---
tags: [frontend, stable]
updated: 2026-06-16
---

# Catalog — Home Page & UI Primitives

Components built for the Kai Nomura home page (ADR-0014). Split in two:
`src/components/ui/` holds reusable design-system primitives; `src/components/home/`
holds the page's section leaves. Conventions: [[component-conventions]].

Content for every component comes from `src/data/mocks/home.ts`; shared motion
presets come from `src/lib/motion.ts`. Imagery is deferred — see `Plate`.

## UI primitives — `src/components/ui/`

The first occupants of `components/ui/` (design-system primitives that don't
depend on providers).

| Component | File | Role | Client? |
|-----------|------|------|---------|
| `<Section>` | `section.tsx` | Standard section shell — `tone` (light/grey/dark), dashed top divider, reference padding, centred max-width container | no |
| `<Media>` | `media.tsx` | Ratio-locked `next/image` (fill + object-cover) for the artwork imagery (`public/assets/site/art-*.webp`). `ratio` is the one allowed inline style. | no |
| `<Eyebrow>` | `eyebrow.tsx` | Uppercase label + leading hairline above headings; `tone` for dark sections | no |
| `<Accent>` | `accent.tsx` | Playfair *italic* span — the one emphasised word in a heading. Safe inside `TextEngine`. | no |
| `<Plate>` | `plate.tsx` | Ratio-locked monochrome **placeholder** for any image-less slot (most slots now use `<Media>`). | no |
| `<Logo>` | `logo.tsx` | Lowercase italic wordmark + diamond mark; inherits `currentColor` (works in the mix-blend header and dark footer) | no |
| `<CtaButton>` | `cta-button.tsx` | Monochrome CTA link; `solid` (dark fill) / `ghost` (dashed); `tone` light/dark. Arrow slides on hover via `<Hover>`. | yes |
| `<SectionHeading>` | `section-heading.tsx` | `<Eyebrow>` + line-revealed `TextEngine` heading (Playfair serif, sentence-case; `title` is `ReactNode` for an `<Accent>`; `tone` for dark). Line length is capped **on the title element** (`max-w-[18ch]`) — see warning below | yes |

> [!note] Theme & heading language
> Monochrome **light** theme (white / grey / `#191917` dark sections, dashed
> dividers, no accent — ADR-0016). Headings are **Playfair Display serif, weight
> 400, sentence-case**, with an italic emphasis word via `<Accent>`. Satoshi is
> the body/UI face. See [[design-system]].

> [!warning] Don't put a `ch`/`em` width on a `TextEngine` heading's *wrapper*
> `ch` resolves against the **element's own** font-size. A `max-w-[20ch]` on the
> small-font wrapper `div` collapses a `text-7xl` heading into a ~5-char column,
> and the `overflow` reveal clip then slices whole words. Cap line length **on the
> heading element itself** (as `SectionHeading` now does), not the wrapper.

## Section leaves — `src/components/home/`

Each is a `"use client"` leaf (drives `TextEngine` / spring components). The view
`src/views/home.tsx` stays a Server Component that only composes them.

Section order clones the reference (ADR-0016): hero → statement → works →
**pinned CTA** → rules → about → process → acquire → **pinned CTA** →
testimonials → logos → FAQ → footer.

| Section | File | Notable motion |
|---------|------|----------------|
| `<Header>` | `header.tsx` | Fixed three-column bar (value-prop · wordmark · nav+menu), `mix-blend-difference` + white elements; nav hover dots; Menu opens `<ModalMenu>` |
| `<ModalMenu>` | `modal-menu.tsx` | Full-screen dark overlay; black panel `<Spring>` `scaleY` from top, staggered oversized links, social/contact bottom; scroll-locked via the [[smooth-scroll\|scroll store]] |
| `<Hero>` | `hero.tsx` | The page's single `<h1>` (Satoshi + `<Accent>`), line reveal; reused portrait (`<Media>`, `priority`) on the right; meta row |
| `<Statement>` | `statement.tsx` | Word-by-word editorial reveal (Playfair) |
| `<PinnedCta>` | `pinned-cta.tsx` | **Full-viewport dark CTA** — the reference's "do-it" block, used twice (one with a portrait, one centred). `<Inview>` + `TextEngine` reveals |
| `<FeaturedWorks>` | `featured-works.tsx` | Asymmetric gallery of reused photos; `<Inview>` reveal + `<SpringTrigger mode="scrub">` parallax |
| `<About>` | `about.tsx` | Bio word reveals + facts; reused photo grid (3×) with `<Hover>` scale |
| `<Principles>` | `principles.tsx` | Three-column rules card grid (grey, dashed) |
| `<Process>` | `process.tsx` | Sticky heading + stepped reveals; oversized index numerals |
| `<Acquire>` | `acquire.tsx` | Shop cards (reused photos) — editions + prices; `<Hover>` lift; enquiry CTAs |
| `<Exhibitions>` | `exhibitions.tsx` | Typographic venue grid (text names, dashed dividers, grey) — the placeholder-logo grid was removed |
| `<Testimonials>` | `testimonials.tsx` | Staggered quote grid (Playfair) |
| `<Faq>` | `faq.tsx` | Accessible accordion; measured-height `useSpring` toggle (see ADR-0014) |
| `<Footer>` | `footer.tsx` | Dark section; wordmark, nav columns, social, giant `18vw` wordmark, copyright |

> [!note] FAQ uses `useSpring` directly
> The catalog spring components cover scroll / hover / mount triggers but not a
> click toggle with measured auto-height. **`faq.tsx`** drives `useSpring`
> directly (height measured into state via `ResizeObserver`) — still within hard
> rule #1 (`@react-spring/web`) and touches no `#do-not-modify` engine file. See
> [[decisions-log]] ADR-0014.

## Related

[[component-conventions]] · [[components/animation-springs]] · [[components/common]] · [[new-page]]
