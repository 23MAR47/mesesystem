---
tags: [frontend, design-system, stable]
updated: 2026-09-02
---

# Design System — Tailwind v4

Styling uses **Tailwind CSS v4**, configured entirely in CSS. There is **no
`tailwind.config.js`**. ADR: [[decisions-log]] ADR-0004.

## Where config lives

`src/app/globals.css` is the single config file. Extra CSS layers can be split
into `src/style/index.css` and imported.

The import is scoped: `@import "tailwindcss" source("../")` limits class
detection to `src/`. Without it Tailwind v4 auto-scans the whole repo, so class
*patterns* written in documentation — `duration-[var(--duration-*)]` in the vault
and in `.claude/` — are parsed as real candidates and emit CSS build warnings.
Documentation is not a source of utilities.

## Token naming convention

> [!important] This convention is **strict and portable by design**
> It is intended to be identical in every project built from this starter, so an
> agent or developer moving between them can predict a token's name without
> reading the file. Deviating in one project defeats the point. ADR: [[decisions-log]] ADR-0015.

Tokens are organised in **three tiers**. Each tier may only reference the tier
below it, and **no tier may be skipped** — semantic tokens are what make a
re-theme or a rebrand a one-line change instead of a find-and-replace.

| Tier | Grammar | Lives in | Example | Usable in markup? |
|------|---------|----------|---------|-------------------|
| **1 — Primitive** | `--raw-<category>-<name>[-<shade>]` | `:root` | `--raw-color-neutral-950` | ❌ never |
| **2 — Semantic** | `--<role>[-<variant>][-<state>]` | `:root` | `--background`, `--action-primary-hover` | ❌ only via its Tier-2 binding |
| **3 — Component** | `--<tw-namespace>-<component>[-<property>]` | `@theme inline` | `--radius-button` | ✅ `rounded-button` |

Plus the **theme binding**, which is what actually creates the utilities:

```css
@theme inline {
  --color-background: var(--background);   /* --<tw-namespace>-<role>: var(--<role>) */
}
```

### The rules

1. **Only Tier 1 contains literals.** A hex, px, or ms value anywhere else is a bug.
2. **Tier 2 names describe purpose, never appearance.** `--action-primary`, not
   `--blue`. `--surface-raised`, not `--grey-light`. If renaming the colour would
   force renaming the token, the name is wrong.
3. **Tier 2 is the themeable layer.** Dark mode and any runtime theming override
   Tier 2 tokens — never Tier 1, never a `@theme` entry.
4. **Every `@theme inline` entry is exactly `--<namespace>-<role>: var(--<role>)`.**
   No literals, no `calc()`, no skipping to `var(--raw-*)`.
5. **kebab-case, singular, unabbreviated.** `--raw-color-neutral-950`, not
   `--raw-clr-neutrals-950`. State goes last: `--action-primary-hover`.
6. **Tier 3 is rare.** Per ADR-0012 a repeated pattern is a React component, not a
   token set. Reach for a component token only when the same value must be shared
   across components that cannot import each other.

### Why Tier 2 is separate from `@theme`

`@theme inline` **inlines** each `var()` into the generated utility. That is what
makes overriding the Tier 2 token in a `prefers-color-scheme` block cascade into
every `bg-background` on the page. Binding a literal — or a `var(--raw-*)` —
directly in `@theme` freezes the value at build time and silently breaks theming.
The indirection is load-bearing, not ceremony.

### Namespaces that generate utilities

A token only becomes a utility if its prefix is a Tailwind namespace. Verified
against `tailwindcss` v4.3.3 (the installed version):

| Namespace | Generated utilities |
|-----------|--------------------|
| `--color-*` | `bg-*`, `text-*`, `border-*`, … |
| `--spacing-*` | `p-*`, `m-*`, `gap-*`, … |
| `--radius-*` | `rounded-*` |
| `--leading-*` | `leading-*` |
| `--tracking-*` | `tracking-*` |
| `--text-*` | `text-*` (size) |
| `--font-*` | `font-*` |
| `--ease-*` | `ease-*` |
| `--shadow-*` / `--blur-*` / `--animate-*` | `shadow-*` / `blur-*` / `animate-*` |
| `--breakpoint-*` / `--container-*` | `sm:` … / `max-w-*` |

> [!warning] There is **no `--duration-*` namespace** in Tailwind v4
> `--duration-fast` in `@theme` generates nothing and is not even emitted — a
> `duration-fast` class silently does nothing. Durations therefore stay **Tier 2
> only** and are consumed as `duration-[var(--duration-fast)]`. (Guides that list
> `--duration-*` alongside `--ease-*` are wrong for v4; `--ease-*` *is* real.)

If a value's prefix is not in that table, it is not a utility — either pick the
right namespace or use it via `var()` in an arbitrary value.

> [!important] The token rule
> **Never** hardcode hex values, pixel spacing, or named colours in `className` or
> inline styles. If a value doesn't exist as a token, **add it to `globals.css`
> first** — as a Tier 1 primitive plus the Tier 2 semantic token that names its
> purpose — with a comment noting where it came from (e.g. a Figma frame).

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

The starter ships a **minimal** theme on purpose — the convention is the
deliverable, not a palette. It defines:

- **Tier 1:** a small neutral ramp (`--raw-color-white`, `--raw-color-neutral-100/900/950`)
  and two durations (`--raw-duration-fast/normal`).
- **Tier 2:** `--background`, `--foreground`, `--duration-fast`, `--duration-normal`,
  with a dark-mode override via `@media (prefers-color-scheme: dark)`.
- **Bindings:** `--color-background`, `--color-foreground`, `--font-sans`,
  plus `--leading-display` (1.1 — the clip floor for [[text-engine]]) and
  `--ease-entrance`.

The starter itself ships **no brand palette**. Add one per project as
`--raw-color-brand-*` primitives plus the semantic roles that name their purpose.

> [!important] `--scene-surface` and `--stage-ground` must hold the same value
> The model dissolves *towards* the scene's ground at its foot while its alpha
> drops, so if the canvas's ground and the page's differ, the dissolve paints a
> pale smear over the page on its way out. Both are porcelain. ADR-0073.

**This project's page palette** is the `--stage-*` family, from the title
stage's design. The second screen rides a dark field, so it inverts:
`--stage-immersed-ink` (white), `--stage-pill` and `--stage-pill-ink` — a light
island on that field, its hairline border taken as `stage-pill-ink/10` rather
than a fourth token. The first screen's own roles are `--stage-ground` (porcelain — the first screen sits a shade
below paper, so the portrait's own white edges read as light rather than as the
page), `--stage-ink`, `--stage-rule`, `--stage-accent` (electric blue) and
`--stage-accent-foreground`. Like `--scene-surface`, they are deliberately **not**
overridden in the dark block: the portrait is lit for this ground.
The `@layer base/components/utilities` blocks start empty — fill them per project.

### What this project has added on top

- **Tier 1:** `--raw-color-black`, `--raw-color-electric-500` (`#0051ff`) — the
  accent, shared by `--stage-accent` and `--surface-accent` on purpose, because
  the gallery's rising plane and the screen it delivers have to be one colour
  (ADR-0077).
- **Tier 2, the 3D stage** — deliberately **not** overridden in the dark block,
  because the stage is white in both themes and its lighting, contact shadow and
  grain are all calibrated against that: `--scene-surface`,
  `--scene-surface-foreground`, `--scene-wire`, `--scene-mark`,
  `--scene-tide-*`, `--scene-wire-immersed`. See [[decisions-log]] ADR-0027,
  ADR-0028. `--scene-wire` is the accent, not black, and `--scene-mark` is what
  the pointer's mark paints — read by the model's shader and the background
  quad alike, so the shape cannot change colour at the silhouette (ADR-0078).
- **Tier 2, page surfaces:** `--surface-raised`, `--surface-accent`,
  `--surface-accent-foreground`.
- **Tier 3:** `--radius-card` — the gallery card's corner, as a token rather
  than a raw utility so the value has one home.
- **`--scene-wire-spark`** binds the junction sparks to the field's own top stop rather than to a colour of their own — they are embers on the subject (ADR-0035).
- **Tier 1 + 2, the tide ramp:** `--raw-color-kindle-*` and the `--scene-tide-*`
  stops the field walks. Unusually for Tier 2 these are **not** independently
  meaningful roles — they are one calibrated set, placed against each other and
  walked perceptually, so moving one alone turns the field to mud. Change them
  together. The chrome pair (`--scene-chrome-sheen` / `--scene-chrome-deep`) is
  the same kind of set. [[decisions-log]] ADR-0031.

- **Tier 1 → 2, the lift:** `--raw-size-lift` (`1.5rem`, so it re-bases with
  the grid) bound as `--stage-rise` — how far a block of copy rises into place
  from its layer's reveal. Read with `var()` from an inline transform
  (`stageRise`), so it needs no `@theme` binding. ADR-0122.
- **Tier 2, the phone's two placements:** `--frame-navbar` (how much room the
  floating bar wants at the foot of a screen — one plate wide, two stacked on a
  phone) and `--frame-heading-top` (where a screen's display heading sits on a
  phone: not the top edge, which in portrait strands it over empty ground).
  Both are overridden or expressed in viewport units rather than being fixed
  lengths, and `--frame-heading-top` is `lvh` because the screens are `h-lvh`.
- **Tier 2 + 3, the stage frame's scale:** `--frame-lead`, `--frame-body`,
  `--frame-figure`, `--frame-nav`, `--frame-control`, `--frame-gutter`, bound as
  `--text-frame-*` / `--spacing-frame-*`. Each is `max(floor, design)` — the
  design's own `vw` wherever there is room for it, a readable rem where there is
  not. They are lengths rather than colours, so they name their role at Tier 2
  directly: the `vw` term **is** the primitive, and hiding it in a `--raw-*`
  would put the design's own number one indirection away from the comment
  explaining it. `--frame-navbar` is the odd one — it is the only token in the
  file overridden in a width media query, because the floating bar is one plate
  wide and two on a phone. [[decisions-log]] ADR-0109.

> [!danger] Frame floors are in `px`, and the stacking rule is an **aspect**
> A floor written in `rem` is not a floor here — `GRID_BREAKPOINTS` re-bases the
> root font-size, so at 834px wide the root is 13.03px and every `rem` floor
> silently delivers 81%. And the design's bottom band is a *landscape* shape, so
> what decides whether it can be laid out is
> `(max-width: 1179px) and (max-aspect-ratio: 1/1)` — the `stacked:` variant —
> not a width, and deliberately not `deviceTier()`'s 768. ADR-0113.

> [!warning] Positions stay in `vw`; type and controls take the frame scale
> The composition is meant to scale with the window — that is what ADR-0072
> bought. What must not scale is anything with a floor: body copy, nav labels,
> and anything a thumb has to hit (46px). Those floors are in **`px`** — in
> `rem` they are not floors at all, because the adaptive grid re-bases the root
> font-size and they shrink exactly where they are needed (ADR-0113). Reaching
> for that grid outright on a stage screen is the other failure mode, and
> ADR-0072 is about why.

> [!warning] `--foreground` inverts with the OS theme. A fixed-colour surface must not use it.
> Both the 3D stage and the work gallery sit on permanent white, so
> `text-foreground` renders near-white on white in dark mode — a real bug that
> shipped once. Anything on those surfaces uses `--scene-surface-foreground`.

## Motion: springs first, CSS for trivial state

Hard rule #1 stands — **all real motion is spring-based** ([[animation-system]]).
There is one narrow exception, added because wiring a spring for a colour fade on
hover costs a client component and a hook for no benefit. ADR: [[decisions-log]] ADR-0014.

**CSS transitions are allowed only for simple, discrete state changes:**

| Allowed (CSS) | Not allowed (use a spring) |
|---------------|---------------------------|
| `hover:` / `focus-visible:` / `active:` colour, `opacity`, `border-color`, underline | anything scroll-driven |
| Small decorative nudges (an arrow shifting a few px on hover) | enter/reveal animations → `<Inview>` |
| | text animation → [[text-engine]] |
| | layout/size changes, orchestrated or staggered sequences |
| | anything that must be interruptible or physical |

Conditions — all three, or it is a spring:

1. **Token-backed timing.** Duration and easing come from tokens — never raw
   values: `transition-colors duration-[var(--duration-fast)] ease-entrance`.
2. **`transition-*` only.** `@keyframes` remain **banned** outright — an
   animation long enough to need keyframes is long enough to deserve a spring.
3. **Utilities only.** The transition lives in `className`, not in a CSS file.

```tsx
<a className="text-foreground/70 transition-colors duration-[var(--duration-fast)]
              ease-entrance hover:text-foreground">
  Contact
</a>
```

If you are reaching past this list, you want `<Hover>` — see
[[components/animation-springs]].

## Typography

Three faces, three jobs — all loaded in `src/app/layout.tsx` and exposed as
variables on `<body>`:

| Binding | Face | Where | Job |
|---|---|---|---|
| `--font-display` | **Melodrama** Light | Fontshare, committed woff2 | The name on the title stage, and nothing else |
| `--font-serif` | **Instrument Serif** | `next/font/google` | The lines that speak — the claim, the button, the link |
| `--font-sans` | **Mulish** | `next/font/google` | Body and small print |

> [!note] Melodrama is loaded with `next/font/local`, not `next/font/google`
> `next/font/google` cannot reach Fontshare, so the woff2 is committed under
> `src/assets/fonts/`. Same benefit either way: no third-party request on the
> critical path and no swap flash. To change the weight, pull the new file from
> the Fontshare CSS API and replace it — do not add a runtime `<link>`.

`--font-sans` was the starter's **Onest** until the first screen was drawn; the
design names Mulish, and the design is the source of truth. Onest is no longer
loaded.

## Styling rules

- Use utilities in JSX `className`; keep class strings short and readable.
- Extract a repeated pattern to a **React component** — not a `@layer
  components` class. See *Where a style goes* above (ADR-0012).
- Mobile-first responsive: `sm:` / `md:` / `lg:` / `xl:` prefixes.
- Dark mode: `dark:` prefix or token overrides in a `prefers-color-scheme` block.
- No inline `style` except for dynamic values (e.g. spring-animated values).
- Motion is spring-based; CSS `transition-*` only for the narrow hover/focus case
  above — never `@keyframes`.

## Related

[[component-conventions]] · [[animation-system]] · [[new-page]]
