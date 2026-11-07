---
paths:
  - "src/components/**/*.tsx"
  - "src/views/**/*.tsx"
  - "src/layouts/**/*.tsx"
description: Motion rules — springs only, with one narrow CSS exception
---

# Motion in this project

Full note: `obsidian/frontend/animation-system.md` · `obsidian/frontend/text-engine.md`

- **All real motion is spring-based** — `@react-spring/web` via
  `src/components/animation/springs/`. Text animates through `spring-text-engine`.
- **Banned:** `@keyframes`, `framer-motion`, GSAP, any other animation library.
- **The only CSS exception** (ADR-0014): `transition-*` utilities for simple
  discrete state changes — hover/focus colour, opacity, border, a few-px nudge.
  All three conditions must hold, or it is a spring:
  1. token-backed timing — `duration-[var(--duration-fast)] ease-entrance`
  2. `transition-*` only, never `@keyframes`
  3. lives in `className`, never in a CSS file

  `duration-fast` as a bare class does **nothing** — Tailwind v4 has no
  `--duration-*` namespace. Always `duration-[var(--duration-fast)]`.

## Picking a primitive

| Need | Component |
|------|-----------|
| Reveal on scroll-into-view | `<Inview mode="once">` |
| Continuous scroll motion (parallax, progress) | `<ProgressTrigger onChange={}>` + write the value yourself |
| Snap at a scroll point | `<ProgressTrigger>` and a threshold |
| Hover | `<Hover>` |
| A control whose label leans toward the cursor | `<Magnetic>` — **wrap the label, not the button**: it listens on its parent and moves its child. Pull is a *fraction of the offset from the control's centre*, so it scales with the control. Both its springs must repaint (ADR-0120) |
| Heading / copy reveal | `spring-text-engine` — see the text-engine note |
| Headings **over the 3D stage** | Not the engine — see the exception below |

**The exception is the pinned stage, and only it.** Text there cannot go through
the engine at all: its scroll-driven modes measure an element that never moves
while the stage is pinned, and the only mode that takes an external value is
`manual`, which is a hard rule against. Two mechanisms cover that ground, and
which one a piece of text uses is decided by one question — *does it have to sit
behind the model?*

| | |
|---|---|
| Yes | `data-scene-ink` on the element; the scene paints it (ADR-0083, ADR-0085) |
| No | `<StageReveal>`, CSS only, off the `--stage-reveal` its layer writes |

Real DOM text in a normally-scrolling section always goes through the engine.
See `obsidian/frontend/text-engine.md`.

## TextEngine traps

- **Never `mode="manual"`** — use `always` / `once` / `forward` / `progress`.
- Its container is **flex**: `text-center` alone will not centre it — pair with
  `justify-center` on the tag.
- `overflow` clips to the line-height box: keep leading ≥ 1.1 (`leading-display`).
  `leading-none` + `overflow` shaves glyphs.

**`<SpringTrigger>` is broken** — its values never reach the DOM (ADR-0029).
Use `<ProgressTrigger>`; re-apply your writes after every render, and give the
trigger element real width or its IntersectionObserver never fires.

**Never reveal a clock-driven value with a scroll-driven gate.** `elapsed * k`
behind a `progress >= x` test snaps: the reader can arrive at that gate at any
time, so the value it uncovers is arbitrary — and it snaps back every time the
condition flickers, which a scroll-driven one does constantly. **Integrate the
rate and let the condition scale it.** Two bugs in this project were this exact
shape (the model's scroll turn, ADR-0089; the accent's spin, ADR-0096), and both
looked like "it jitters when I scroll".

**`<ProgressTrigger>` only reports while its element is on screen.** Off screen
it goes quiet and the last value it saw stands. So anything that must be
switched **off** when the reader is far from it cannot use that thing's own span
as the trigger — give the trigger an element that is always in view (the
document, a pinned section) and compare the numbers yourself. A bar sized to its
own band this way froze half-open on the way back up; ADR-0092.

Every animation component takes `tag` — pass the semantic element, never `div`.
Tailwind classes go on `className` / `innerClassName`, never into spring `from`/`to`.
