---
tags: [frontend, design-system, stable]
updated: 2026-07-10
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
  --font-sans: var(--font-general-sans);
}
```

> [!warning] `@theme inline` does not emit `--font-sans` as a property
> With `inline`, Tailwind substitutes the value straight into utilities (e.g.
> `.font-sans`) and never writes a `--font-sans` custom property to `:root`. So
> `font-family: var(--font-sans)` in plain CSS resolves to **empty**. `body`
> therefore references the next/font variable directly:
> `font-family: var(--font-general-sans), sans-serif`.

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

Tokens for the home hero (Figma "Ternyon" 610:557) live in `globals.css`:
`--background` (`#f0f2fa`), `--foreground` / `--ink` (`#00012f`), `--ink-strong`
(`#000`), `--violet` (`#1b0095`), `--hairline`, `--card-fill`, `--card-hairline`,
`--panel`, plus `--gradient-cta` and the radii `--radius-panel` / `--radius-card`.
The `@media (prefers-color-scheme: dark)` override was **removed** — the hero is a
fixed design, not theme-adaptive. The `@layer base` block holds the grid rule
`html { font-size: 1.111111vw }` (one 1440 base, so the desktop hero fills the
viewport *width*; the *height* is a fluid `100dvh` stage with edge-anchored
contents — no fixed-aspect letterbox — see [[decisions-log]] ADR-0017, which
supersedes the vertical half of ADR-0008; `StageFit` / `--stage-scale-y` are
gone). **Below 1024px** the hero switches to the stacked
mobile layout (ADR-0016), so the root font-size returns to `clamp(14px, 4.2vw,
20px)` and `body` becomes a scrollable block — both via `@media (max-width:
1023px)`. `components` / `utilities` stay empty.

## Typography

Font: **General Sans** (`next/font/local`) — the files are in `src/app/fonts/`
(`GeneralSans-Light.otf` = weight 300, `GeneralSans-Regular.otf` = 400). Loaded in
`src/app/layout.tsx`, exposed on `<body>` as `--font-general-sans`, and bound to
`--font-sans` via `@theme inline`. Use `font-light` / `font-normal` for the two
weights. (See the `@theme inline` warning above — `body` sets `font-family` from
`--font-general-sans` directly.)

## Styling rules

- Use utilities in JSX `className`; keep class strings short and readable.
- Extract a repeated pattern to a **React component** — not a `@layer
  components` class. See *Where a style goes* above (ADR-0012).
- Mobile-first responsive: `sm:` / `md:` / `lg:` / `xl:` prefixes.
- Dark mode: `dark:` prefix or token overrides in a `prefers-color-scheme` block.
- No inline `style` except for dynamic values (e.g. spring-animated values).

## Related

[[component-conventions]] · [[animation-system]] · [[new-page]]
