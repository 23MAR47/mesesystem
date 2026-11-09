# Project: MESE SYSTEM — Platform & Industry Showcases

## Architecture
- **Framework**: Next.js 15 (App Router), React 19, TypeScript
- **Styling & UI**: Tailwind CSS 3.4, Framer Motion 11.15, Lucide React
- **Test Runner**: Node 24 native custom test runner (`tests/run-tests.mjs` + `tests/harness.mjs`)
- **Key Frontend Presentation**:
  - `components/Hero.tsx` (featured dual-mockup carousel)
  - `components/DemoShowcase.tsx` (13 sector demos grid + 9 mobile mockups horizontal scroll)
  - `components/PortfolioSection.tsx` (reference projects filter & grid)
  - `components/ShowcasePreview.tsx`, `components/ReferenceProjectImage.tsx`
- **Skills Vault & Agent Architecture**:
  - `.skills/antigravity-skills/` (cloned skills vault, 308 skills)
  - `.skills/active/` (15 curated active project skills)
  - `.agents/AGENTS_TR.md` (Turkish Agent Taxonomy, Lead Orchestrator role guide, and skill mapping)
  - `.agents/LEAD_ORCHESTRATOR.md` (Uzman Koordinatör operational handbook)

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Transition Fixes | Fix `mode="wait"` blank frame flicker and add synchronized crossfade to mobile mockup in `Hero.tsx` | M1 (DONE) | Survey 1 |
| 2 | Auto-play Race Condition Fix | Reset `setInterval` timer upon manual slide change (`showProject`) in `Hero.tsx` | M1 (DONE) | Survey 1 |
| 3 | Mobile Hover Unlock | Prevent synthetic touch `mouseenter` from freezing autoplay in `Hero.tsx` | M1 (DONE) | Survey 1 |
| 4 | Mobile Mockup Repositioning | Shift mobile phone mockup downward to `bottom-[-3.8rem] sm:bottom-[-4.5rem]` while preserving `aspect-[390/844]` and `w-[clamp(7rem,26vw,11rem)]` | M1 (DONE) | Survey 1 |
| 5 | Mobile Scrolling Fix | Add `touch-pan-y`, `overscroll-x-contain`, `snap-x snap-mandatory` to horizontal scroll strip in `DemoShowcase.tsx` and `PortfolioSection.tsx` | M1 (DONE) | Survey 1 |
| 6 | Antigravity Skills Fetch | Clone/fetch `https://github.com/rmyndharis/antigravity-skills` to `.skills/antigravity-skills` | M2 (DONE) | Survey 3 |
| 7 | Active Skills Setup | Symlink/vendor essential active skills (`nextjs-best-practices`, `react-patterns`, `tailwind-patterns`, `mobile-design`, `ui-visual-validator`, `tdd-workflow`) in `.skills/active/` | M2 (DONE) | Survey 3 |
| 8 | Turkish Agent Roles & Lead Orchestrator Guide | Create `.agents/AGENTS_TR.md` with complete Turkish taxonomy (7 roles) and orchestration guidelines for "Uzman Koordinatör / Yönetici" | M2 (DONE) | Survey 3 |
| 9 | Full Build & Test Verification | Ensure all 101 unit tests pass (`npm test`) and `npm run build` succeeds cleanly | M3 (DONE) | Survey 2 |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | Frontend Presentation & Mobile Fixes | Fix carousel transitions, phone mockup downward shift, auto-play timer, and mobile touch scroll locks in `Hero.tsx`, `DemoShowcase.tsx`, `PortfolioSection.tsx` | Survey complete | DONE |
| 2 | Skills Vault & Turkish Agents Setup | Clone skills repo to `.skills/`, set up `.skills/active/`, create `.agents/AGENTS_TR.md` with Uzman Koordinatör architecture | M1 | DONE |
| 3 | Final Verification & QA Gate | Execute `npm test`, `npm run build`, and adversarial quality checks | M1, M2 | DONE |

## Code Layout
- `components/Hero.tsx` — Desktop/mobile carousel mockups, transitions, timer, phone positioning
- `components/DemoShowcase.tsx` — Sector showcase cards and horizontal mobile mockups strip
- `components/PortfolioSection.tsx` — Reference portfolio filter row and project grid
- `.skills/antigravity-skills/` — Cloned repository vault
- `.skills/active/` — Curated active project skills
- `.agents/AGENTS_TR.md` — Turkish agent roles & Expert Lead Agent documentation
- `.agents/LEAD_ORCHESTRATOR.md` — Uzman Koordinatör operational guide
- `tests/` — Zero-dependency unit tests
