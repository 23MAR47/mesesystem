---
tags: [frontend, animation, stable, do-not-modify]
updated: 2026-07-17
---

# Catalog — Spring Components

Files in `src/components/animation/springs/`. The animation engine — `#do-not-modify`.
Conceptual overview: [[animation-system]].

All components accept `tag` (semantic HTML element), `className`, and react-spring
`config`. Each is `"use client"`.

## `<Inview>` — `in-view.tsx`

Springs `from` → `to` when the element enters the viewport (IntersectionObserver).

- `mode`: `"once"` (play once, stay) · `"always"` (reverse on leave) · `"forward"`
  (only on downward scroll).
- `delayIn` / `delayOut`, `immediateOut`, `disableOnMobile`.
- `trigger` — optional external element to observe. Omit it and the component
  observes its own rendered element (the common case).
- `innerTag` / `innerClassName` — the inner animated wrapper.

## `<Spring>` — `spring.tsx`

Unconditional spring driven by mount / the `enabled` flag. Same `mode` set as
`<Inview>`. Use when motion shouldn't depend on the viewport.

## `<SpringTrigger>` — `spring-trigger.tsx`

> [!warning] Broken — do not use (ADR-0029)
> Its values never reach the DOM: `useSpringTrigger` applies them through the
> imperative `api.start()` form, the same one `spring.tsx` documents as a no-op
> in this project's react-spring build. Verified by reading an animated
> element's inline style at three scroll positions and finding it pinned to
> `from`. Use `<ProgressTrigger>` and write the values yourself — see
> [[decisions-log]] ADR-0029 for the two traps that come with that.

Scroll-progress animation between two trigger points.

- `mode`: `"scrub"` (continuously interpolate with scroll — parallax, progress bars)
  · `"toggle"` (snap between `from`/`to` at the trigger point).
- `start` / `end` — `TriggerPos` strings (see [[text-engine]]).
- `trigger` — optional external scroll-reference element.
- `onChange({ progress, interpolatedProgress })` callback.
- `frameInterval` — throttle for the scroll handler.

## `<ProgressTrigger>` — `progress-trigger.tsx`

Tracks scroll position and emits a normalised **0–1 progress** value via
`onChange` — no animation of its own. Use to drive custom logic.

## `<Hover>` — `hover.tsx`

Spring on mouse enter/leave. Disabled on mobile by default (`disableOnMobile.hover`
is always `true`). `trigger` lets a different element fire the hover.

> [!note] Not every hover needs this (ADR-0014)
> A hover that only changes **colour, opacity, or border** is plain CSS —
> `transition-colors duration-[var(--duration-fast)] ease-entrance
> hover:text-foreground` — and needs no component at all. Reach for `<Hover>`
> when the motion is physical or interruptible, animates transforms, or must be
> driven from another element via `trigger`. See
> [[design-system#Motion: springs first, CSS for trivial state]].

## `<Handle>` — `handle.tsx`

Smooth enter/exit when `children` change — caches previous content during the
transition. Configurable `from`/`to`, `delayIn`/`delayOut`, `enabled`.

## `<AnimatedVarTextTag>` — `animated-var-text-tag.tsx`

Low-level primitive: renders `animated[tag]` with a forwarded ref. Building block
for the other components — rarely used directly.

## Related

[[animation-system]] · [[hooks]] · [[components/common]]
