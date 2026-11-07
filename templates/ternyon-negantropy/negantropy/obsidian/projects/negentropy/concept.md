---
tags: [project, concept, wip]
updated: 2026-05-28
project: negentropy
status: built-v0
---

# NEGENTROPY — Concept Doc

> **Status:** v0.16 built. Molecule now drifts toward the camera
> across §II/§III (z: 0 → +2.5) so it visibly grows in frame as the
> user scrolls. Bonds slimmed to wire-thin glints (`BOND_PARTICLES
> 200 → 60`, `BOND_TUBE_RADIUS 0.07 → 0.025`). Added a **Bloom**
> post-processing pass via `@react-three/postprocessing` so atoms,
> nebula highlights, and the red storm core glow. See
> [[changelog]] and [[tech-stack]] for new deps.

> **Status:** v0.15 built. Molecule tumbles continuously again
> (locked rotation undone), particle counts roughly tripled
> (~5.6 k → ~13 k), and each atom now has internal particle wobble
> via a `uTime`-driven shader displacement. Red Storm shrunk
> (radius 4 → 2.5) and final camera anchor pulled back so the
> storm is **seen from outside**, filling about half the vertical
> FOV instead of engulfing the camera. See [[changelog]].

> **Status:** v0.14 built. Spiral rotation now accelerates through the
> whole §I fade. Molecule bonds switched to bone-neutral and thickened
> so they actually read. Molecule rotation locked → §IV camera zooms
> into the top icosahedron atom; **Red Storm relocated to that atom's
> position, bigger (radius 4, 50 k particles)**, fades in as the
> molecule dissolves — visually, the atom *becomes* the storm. See
> [[changelog]].

> **Status:** v0.13 built. `nebula-galaxy.tsx` renamed to
> `spiral-network.tsx` (export `SpiralNetwork`) so the file name
> matches the visual it produces — a two-arm spiral *network* of
> connected strands, not a diffuse cloud. Behaviour unchanged.

> **Status:** v0.12 built. §II molecule rebuilt as an **icosahedral
> atom cage** (12 atoms + 30 bonds in particles); DNA helix retired.
> Cage is bigger (radius 3.0), brighter, and assembles **on scroll**
> — particles fly in from scattered far-away origins, atoms snap in
> first, bonds materialise between them. Same shader hosts cursor
> repulsion + assembly. See [[changelog]].

> **Status:** v0.11 built. Three-phase hand-off
> `loading → scene-revealed → ui-revealed`. Loader bg fades over 1.5 s
> while the R3F scene mounts behind it (nebula materialises through
> the fade); UI chrome + sections mount only after the loader bg is
> fully gone. See [[changelog]] iteration 11.

> **Status:** v0.10 built. Scene sequence is now **Nebula (§I hero,
> reveals on load, immersive close-up) → Molecule (§II/§III) → Red
> Storm (§IV/§V, last)**. Hourglass retired from the live scene.
> Nebula no longer appears twice — single window, instant reveal +
> scroll-driven Y-rotation. See [[changelog]] iteration 10.

> **Status:** v0.9 built. Nebula now reveals on load behind the §I
> hourglass as an atmospheric layer, recedes for §II/§III, fades back
> in for §IV–§V — single component, two opacity peaks. See
> [[changelog]] iteration 9.

> **Status:** v0.8 built. Scene sequence is now Hourglass (§I hero) →
> DNA-helix Molecule (§II) → Red Storm (§III) → Nebula (§IV–§V).
> Cell-core retired. HeadlineLines rewritten on top of the engine's
> `Spring` per-letter to fix the v0.7 "title disappears" symptom.
> See [[changelog]] iteration 8.

> **Status:** v0.7 built. (v0.5: §II hourglass regression — rolled back
> in v0.6. v0.7: `Inview` ref-wiring bug fixed in the animation engine
> per ADR-0014 — the frame, nav, brand-mark badge, hero meta, biomarker
> grid, and CTA had all been silently rendering at `opacity: 0`. Hero
> got a `[ ENTROPY × 1%/YR ]` corner badge for the bottom-left.) Route `/` (home). **§I is now a real hero**
> — corner-loaded grid (huge bottom-left headline *EVERY CELL / **is**
> FALLING / APART.* with italic `is`, bottom-right meta + body + BEGIN
> SCROLL pill, bottom-center scroll arrow), thin 1px rounded **frame
> border** as contrast carrier, top-right **nav jumplinks** to every
> section, restyled brand mark `( NEGENTROPY ) [ DON'T DIE ]`. New
> **Cell Core** WebGL centerpiece (dense particle sphere, amber-core /
> violet-rim) sits behind §I, pulses, then ruptures upward into the
> forming hourglass across the §I→§II transition. Everything on the
> page uses one font family — the system stack (Helvetica Neue) — same
> as the loader. Loader stays as v0.4. Components catalogued in
> [[components/negentropy]]. Architecture decisions in [[decisions-log]]
> ADR-0013. Pre-existing animation-engine TS errors still block
> `yarn build` — see [[changelog]] 2026-05-28.

> **Tagline:** *The science of refusing to fall apart.*

A particle-driven, scroll-through-the-universe site built as a tribute to
**Bryan Johnson's** longevity research and the *Don't Die* movement. The hero
visual is a particle "body" that decays, then reverses, across five short
scroll sections. Aim: a craft-heavy, ping-worthy interactive essay that Bryan
himself would amplify.

## North star

- **Audience:** longevity-curious readers, Bryan Johnson's online following,
  design/dev community (FWA / Awwwards-class craft).
- **Goal:** make Bryan retweet it. That means rigor + real Blueprint numbers
  + a tone that matches his (declarative, slightly cosmic, scientific).
- **Format:** single-page, vertical scroll, max 5 sections + loader.
- **Tech:** Three.js / particle systems on a Next.js 16 page; spring-based
  scroll-scrubbed motion via the project's animation system
  ([[animation-system]], [[smooth-scroll]]); text reveals via [[text-engine]].

## Brand

**Name:** **NEGENTROPY** — the actual scientific term for the force that
resists entropy (life itself). One word, no current brand owner, rigorous
enough for the audience, encodes the entire thesis.

**Tagline:** *The science of refusing to fall apart.*

**Voice:** declarative, short sentences, no hedge words. Borrowed cadence
from Bryan's manifestos. Examples: *"Entropy is optional." / "Don't die."*

## Loader — "Initializing."

Green curl-flow shader plays full-bleed. Five animated text beats fade
through (~1 s each). Final line holds while the shader dissolves into the
starfield of Section 1.

**Reference shader (to be reused):**

![Loader curl-flow shader — green vector field on black](./assets/loader-curl-flow.png)

> **Open decision — palette:** keep green (deliberate "biological" color
> before the cosmic palette takes over) or retint to amber/violet so the
> loader transitions seamlessly into Section 1.

**Loader text sequence:**

1. *"Every cell is falling apart."*
2. *"Until one refused."*
3. *"Measure. Reverse. Persist."*
4. *"Entropy is optional."*
5. *"Don't die."*

Arc: observation → rupture → method → thesis → command.

## Section 1 — The Void

Cosmic starfield with ambient violet particle drift. The hourglass particle
figure begins forming top-down — sand falling.

**Reference visual (to be reused):**

![Hourglass particle figure — protagonist, entropy state](./assets/hourglass-figure.png)

**Copy:**
> *"Every cell in your body is trying to fall apart. This is not a metaphor."*

## Section 2 — Entropy

Hourglass at full flow — particles streaming down, the upper figure dissolving
into the lower pile. Time is running. Scroll velocity controls fall rate so
the user feels the decay.

**Copy:**
> *"1% lost per year after 30. The body's default is decay."*

## Section 3 — The Refusal

Scroll triggers reversal. Sand reverses direction — particles flow *up*. The
figure reconstitutes. Biomarker numbers flicker briefly around it — pulled
from Bryan's open Blueprint protocol.

**Suggested live numbers (verify before launch):**
- 1,977 daily biomarkers tracked
- −5.1 years biological age reversal
- VO₂ max in the 99th percentile

**Copy:**
> *"Bryan Johnson refused. The most measured human in history."*

> **Open decision — biomarkers:** show real Blueprint numbers (more
> credibility, more "ping-worthy") or keep the section purely poetic.

## Section 4 — The Body as Universe

Hourglass dissolves outward into a diffuse nebula figure (morph from
hourglass → nebula reference). Particles orbit in stable, luminous patterns.
Zoom out implied — the body *is* the cosmos.

**Reference visual (to be reused):**

![Cosmic nebula figure — peak vitality state](./assets/nebula-figure.png)

**Copy:**
> *"You are a measurable universe. Don't die."*

## Section 5 — The Choice

Figure stands, particles settle into a slow ambient drift — calm, alive. CTA
appears.

**Copy:**
> *"The first generation that doesn't die has to choose to. Choose."*

**CTA:** Read the Blueprint → (links to `blueprint.bryanjohnson.com`).

## Asset map

| Asset | File | Used in |
|------|------|---------|
| Loader curl-flow shader | `assets/loader-curl-flow.png` | Loader |
| Hourglass particle figure | `assets/hourglass-figure.png` | Sections 1 – 3 |
| Cosmic nebula figure | `assets/nebula-figure.png` | Section 4 – 5 |

## Open decisions

- **Loader palette** — keep green or retint to amber/violet.
- **Section 3 biomarkers** — real Blueprint numbers or purely poetic.
- **Outreach copy** — what we say in the post that pings Bryan.

## Related

[[animation-system]] · [[text-engine]] · [[smooth-scroll]] ·
[[component-conventions]] · [[new-page]]

---

> [!note] Action required — drop assets in
> The three reference screenshots need to be saved into
> `obsidian/projects/negentropy/assets/` with these exact filenames:
> - `hourglass-figure.png`
> - `nebula-figure.png`
> - `loader-curl-flow.png`
>
> (Originals were in `/var/folders/.../TemporaryItems/...` which macOS
> auto-cleaned before they could be copied in.)
