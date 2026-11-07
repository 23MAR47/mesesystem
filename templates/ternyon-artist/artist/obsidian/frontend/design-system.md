---
tags: [frontend, design-system, stable]
updated: 2026-05-22
---

# Design System — Tailwind v4

Styling uses **Tailwind CSS v4**, configured entirely in CSS. There is **no
`tailwind.config.js`**. ADR: [[decisions-log]] ADR-0004.

## Where config lives

`src/app/globals.css` is the single config file:

```css
@import "tailwindcss";

:root {
  --background: #ffffff;
  --foreground: #171717;
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-onest);
}
```

Extra CSS layers can be split into `src/style/index.css` and imported.

## Design tokens

All colours, spacing, font sizes, radii, and shadows are **tokens** declared under
`:root` (raw values) and `@theme inline` (Tailwind bindings).

Once a token is in `@theme`, it becomes a utility automatically:

| Token | Generated utilities |
|-------|--------------------|
| `--color-brand` | `bg-brand`, `text-brand`, `border-brand` |
| `--radius-card` | `rounded-card` |
| `--spacing-section` | `pt-section`, `mt-section`, … |

> [!important] The token rule
> **Never** hardcode hex values, pixel spacing, or named colours in `className` or
> inline styles. If a value doesn't exist as a token, **add it to `globals.css`
> first** — with a comment noting where it came from (e.g. a Figma frame).

## CSS layers

Every custom style goes inside a layer — never outside one:

```css
@layer base {        /* element resets & defaults: h1, p, a … */ }
@layer components {  /* pseudo-elements & 3rd-party overrides only — see below */ }
@layer utilities {   /* single-purpose helpers: .scrollbar-none … */ }
```

## Where a style goes (ADR-0012)

`globals.css` is **not** a place to park component styles — it holds tokens and
base resets and stays a few hundred lines forever. Follow this order; the first
match wins:

| Situation | Goes where |
|-----------|-----------|
| One-off styling | Tailwind utilities in `className` — nothing in CSS |
| Repeated pattern with markup / structure / props | a **React component** in `components/ui/` |
| Repeated *pure-utility* combo, no structure | a Tailwind v4 `@utility` |
| Pseudo-elements, 3rd-party DOM overrides, complex selectors | `@layer components` — the genuine exceptions |
| A new colour / spacing / radius value | a **token** in `:root` + `@theme` |

> [!important] The default answer to "this looks repeated" is a **React
> component**, not a CSS class. An eyebrow label with a `::before` dot is an
> `<Eyebrow>` component — not a `.label-eyebrow` global class. `@layer
> components` is for what utilities and components genuinely *cannot* express.

There are **no CSS Modules** in this project — utilities + components cover
every case (motion is spring-based, so there are no keyframes to co-locate).

## Current theme state

The project ships a **monochrome light** theme cloned from the reference site
(ADR-0016) — no colour accent. `:root` defines:
- **Surfaces:** `--canvas` `#ffffff` (page base), `--surface-grey` `#f3f3f3`
  (grey sections), `--surface-dark` `#191917` (dark sections).
- **Text on light:** `--ink` `#191917`, `--ink-muted` (60%), `--ink-faint` (30%).
- **Text on dark:** `--on-dark` `#fff`, `--on-dark-muted` (60%), `--on-dark-faint`
  (30%).
- **Hairlines:** `--line` / `--line-strong` (dashed-border colours on light),
  `--line-on-dark` (on dark).

All are bound under `@theme inline`, generating `bg-canvas`, `bg-surface-grey`,
`bg-surface-dark`, `text-ink(-muted/-faint)`, `text-on-dark(-muted/-faint)`,
`border-line(-strong)`, etc. `@layer utilities` adds `.rule-dashed` /
`.rule-dashed-dark` (the reference's dashed dividers — use with `border-t`).
There is **no** `prefers-color-scheme` override; the section rhythm is light /
grey / dark by composition. The `<Section tone>` and many `tone` props
(`Eyebrow`, `CtaButton`, `SectionHeading`, `PinnedCta`) switch the light/dark
token set.

> [!note] An earlier dark gallery/luxury theme (ADR-0014, gold accent,
> `canvas-raised`/`-sunken`, `.grain`) was replaced by this 1:1 reference clone.

## Typography

Two fonts (matching the reference site), loaded in `src/app/layout.tsx` and
exposed as CSS vars on `<body>`:
- **Playfair Display** → `--font-playfair` → `--font-display` — the **display
  heading** face (serif) and the `<Accent>` italic emphasis word.
- **Satoshi** → `--font-satoshi` → `--font-sans` — body / UI text, eyebrows,
  buttons, nav. Self-hosted via `next/font/local` from `src/fonts/Satoshi-*.woff2`
  (weights 400/500/700/900).

> [!warning] Hand-written CSS must use the real `next/font` vars
> `@theme inline { --font-display: … }` does **not** emit a usable
> `--font-display` / `--font-sans` custom property — the value is only inlined
> into generated *utilities* (`.font-display` works). So in `@layer base` /
> `body`, reference the actual next/font variables directly:
> `font-family: var(--font-playfair)` for headings, `var(--font-satoshi)` for
> body — **not** `var(--font-display)` (which silently resolves to the default
> sans stack).

**Heading language.** `@layer base` styles `h1`–`h3` as **Playfair Display serif,
`font-weight: 400`, mixed-case (`text-transform: none`)**, `letter-spacing:
-0.01em`, `line-height: 1.12` (roomy enough that Playfair descenders / italics
aren't clipped by the `TextEngine` `overflow` line-reveal). An italic emphasis
word is added via `<Accent>` (e.g. `Light, <Accent>written</Accent> in code.`).
Small card titles use `font-medium` (500) for a light hierarchy; very tight
per-heading `leading` overrides were loosened (≥ 1.04) for the serif.

## Styling rules

- Use utilities in JSX `className`; keep class strings short and readable.
- Extract a repeated pattern to a **React component** — not a `@layer
  components` class. See *Where a style goes* above (ADR-0012).
- Mobile-first responsive: `sm:` / `md:` / `lg:` / `xl:` prefixes.
- Dark mode: `dark:` prefix or token overrides in a `prefers-color-scheme` block.
- No inline `style` except for dynamic values (e.g. spring-animated values).

## Related

[[component-conventions]] · [[animation-system]] · [[new-page]]
