---
tags: [architecture, stable]
updated: 2026-05-21
---

# Data Flow

How state, scroll position, and animation data move through the app. There is no
server data layer yet — all "data flow" here is **client-side UI state**.

## Provider hierarchy (fixed order)

The root layout (`src/app/layout.tsx`) wraps everything in this exact order.
**Do not reorder** — see [[decisions-log]].

```
<html> <body>
  <ScrollLayout>        ← Lenis smooth scroll + scroll state store
    <LazyCookie />      ← cookie consent banner + preferences modal
    {children}          ← the routed page
  </ScrollLayout>
</body> </html>
```

## Scroll state — Zustand store

The scroll store (`src/hooks/smooth-scroll/use-scroll.ts`) is one of **two**
pieces of global state — see the preloader store below. Shape:

```ts
{
  lenis: Lenis | null      // the Lenis instance
  setLenis(...)            // setter
  isEnableScroll: boolean  // is scrolling currently allowed?
  start()                  // enable scroll
  stop()                   // disable scroll (e.g. modal open)
}
```

### Flow

```
ScrollController (in ScrollLayout) mounts
   │
   ├─ new Lenis()  →  setLenis(instance)   ──► store.lenis
   │
   ├─ requestAnimationFrame loop  →  lenis.raf(time)   (continuous)
   │
   └─ watches store.isEnableScroll:
         true  → lenis.start() + native scroll on
         false → lenis.stop()  + native scroll locked (html overflow:hidden)
```

Any component reads/writes scroll state through the store:

```ts
const lenis = useScroll((s) => s.lenis)
const [start, stop] = useScroll(useShallow((s) => [s.start, s.stop]))
```

See [[smooth-scroll]] for the full API. Its `stop()` has a real caller now: the
opening curtain holds the scroll while it is up.

## Preloader handover — Zustand store

`src/hooks/preloader/use-preloader.ts`, and it carries **two** booleans on
purpose:

```ts
{
  sceneReady: boolean   // the page: the curtain may finish
  released:   boolean   // the curtain: the page may begin
}
```

They travel in opposite directions and must not be collapsed. `sceneReady` is
set when the scene's model has loaded and warmed; `released` when the curtain has
actually **left**. Anything that should play *into* the opened page — the hero's
entrance, the canvas fade — gates on `released`; anything the curtain waits for
sets `sceneReady`.

A store rather than props because the two ends sit in different subtrees: the
curtain is a sibling of the whole page and the scene is a leaf inside it. Same
reason the scroll store exists. [[decisions-log]] ADR-0114.

## Animation data flow

Animation values never live in React state — they live in **springs**.

```
Component renders with from / to props
   │
   ▼
@react-spring/web useSpring  →  animated values (outside React render cycle)
   │
   ▼
Trigger source updates the spring:
   ├─ IntersectionObserver   → <Inview>, <Spring>     (enter viewport)
   ├─ scroll position        → <SpringTrigger>        (scroll progress)
   ├─ mouse events           → <Hover>                (pointer enter/leave)
   └─ scroll position        → <TextEngine mode="progress">
   │
   ▼
animated.<tag> applies values directly to the DOM node — no re-render
```

Global animation behaviour (mobile disable, breakpoint) is read from
`src/lib/springs/config.ts` — see [[animation-system]].

## Page data flow

```
app/page.tsx  →  views/home.tsx  →  composed components
```

Per the [[component-conventions]]:
- **No hardcoded content** in components — data comes from props or hooks.
- Placeholder data → `src/data/mocks/<page>.ts`, passed via props.
- Async data → custom hook in `src/hooks/`; component handles `loading` / `error`
  / `empty` with skeleton loaders. See [[components/common]].

## Server / external data flow

External APIs are reached **only** through server code — the browser never
calls a third party directly or holds a secret.

```
Server Component         →  reads data at render time (no client request)
Client Component         →  apiFetch('/api/…')  →  app/api/**/route.ts  →  upstream
app/api/**/route.ts      →  validates (zod) → does the work → { data } | { error }
```

Secrets live in unprefixed env vars, read via `getServerEnv()` inside route
handlers. Full convention: [[api-architecture]].

## Hash-link scrolling

`ScrollController` watches `usePathname()`. If the path contains a `#hash`, it waits
300 ms then calls `scrollTo(hash, true)` so smooth scroll lands on the target.

## Related

[[system-overview]] · [[smooth-scroll]] · [[animation-system]]
