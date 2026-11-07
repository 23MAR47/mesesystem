---
tags: [frontend, scroll, stable]
updated: 2026-05-21
---

# Smooth Scroll — Lenis

Smooth scrolling is provided by **Lenis** (`^1.3.19`), integrated through
`ScrollLayout` and a Zustand store.

## Components & files

| File | Role |
|------|------|
| `src/layouts/scroll-layout.tsx` | `ScrollLayout` wrapper + `ScrollController` |
| `src/hooks/smooth-scroll/use-scroll.ts` | `useScroll` Zustand store |
| `src/utils/scroll-to.ts` | `scrollTo()` programmatic scroll helper |

## ScrollLayout

Wraps the whole app (mounted in `app/layout.tsx`). It splits into:

- A **server-safe shell** — renders `{children}` so content is SSR-friendly.
- `<ScrollController>` — a client-only, render-nothing component that owns Lenis.

Before any of it, the root layout sets `history.scrollRestoration = "manual"`
in an inline `<script>` at the top of `<body>`. The browser restores a reload's
scroll position while the document is still streaming — before hydration, and
again after the reset below — and this page always opens behind a curtain at
its top. See [[decisions-log]] ADR-0122.

`ScrollController` on mount:
1. Resets scroll to top.
2. Creates `new Lenis({ smoothWheel: true, syncTouch: true })`, stores it on
   `window.lenis` and in the [[data-flow|scroll store]].
3. Subscribes `lenis.raf(time)` to the **shared ticker** at `SCROLL_PRIORITY`
   — not a loop of its own. It must run before every scroll *reader* in the
   frame, or the page trails the scroll by one frame. See
   [[animation-system]] and [[decisions-log]] ADR-0105.
4. Watches `isEnableScroll` — starts/stops Lenis and locks/unlocks native scroll
   (`html { overflow: hidden }`) accordingly.
5. Watches `pathname` for `#hash` → smooth-scrolls to the target after 300 ms.

`scrollSpeed` is an exported mutable `{ current: 1 }` — adjust to change global speed.

> [!warning] A stopped Lenis keeps a target of its own
> `lenis.stop()` freezes the animated position; a native scroll that happens
> while it is stopped is not one it knows about. Programmatic moves under a
> lock go through `lenis.scrollTo(target, { immediate: true, force: true })` as
> well as `window.scrollTo`, or the page jumps back the moment it starts.

> [!warning] `syncTouch` is on, and on this site it has to be
> Without it the OS owns momentum scrolling and `window.scrollY` arrives in
> discrete steps. That is harmless for a page of text and visible stepping for a
> scene that derives every value from that number — compounded by the mobile
> tier's 30fps frame budget. See [[optimize-3d-scene]] §10 and
> [[changelog]] (83).

## The scroll store

```ts
import { useScroll } from "@/hooks/smooth-scroll/use-scroll";
import { useShallow } from "zustand/react/shallow";

const lenis = useScroll((s) => s.lenis);
const [start, stop] = useScroll(useShallow((s) => [s.start, s.stop]));
```

| Field | Type | Purpose |
|-------|------|---------|
| `lenis` | `Lenis \| null` | the live instance |
| `setLenis` | fn | setter (used by `ScrollController`) |
| `isEnableScroll` | `boolean` | is scrolling allowed |
| `start()` / `stop()` | fn | toggle scroll (e.g. lock when a modal opens) |

## Programmatic scrolling

```ts
import { scrollTo } from "@/utils/scroll-to";

scrollTo("#section-id", true);  // smooth scroll to an element id
scrollTo(0);                    // back to top
```

`scrollTo` temporarily disables scroll state during the animation when needed.

## Related

[[data-flow]] · [[system-overview]] · [[hooks]]
