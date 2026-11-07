import { useMemo, type CSSProperties, type ReactNode } from 'react'
import { round, step, toMask, springEasing } from '../../lib/shape'
import presets, { type Skin } from './presets'
import './CardBookmark.css'

/*
  A stepped-card silhouette, typed. Geometry,
  CSS and motion are unchanged; only the presets are ours.
*/

const VB_W = 300

/**
 * The bookmark silhouette: a raised tab across the top right, and a matching
 * bite taken out of the bottom right. Both joints are the same S-step, one
 * traced left-to-right and one right-to-left.
 *
 * Every outer corner is rounded in the path itself rather than by a CSS
 * `border-radius`. The mask clips whatever the element paints, so a radius on
 * the element only rounds its rectangle — the corners the mask introduces
 * (the body's top left, and the right edge above the bite) would stay sharp.
 */
function buildShape(
  vbH: number,
  tab: number,
  tail: number,
  topNotch: number,
  bottomNotch: number,
  radius: number
) {
  const R = round(Math.min(radius * VB_W, topNotch * 0.9, vbH / 6))
  const arc = (x: number, y: number) => `A${R} ${R} 0 0 1 ${round(x)} ${round(y)}`
  const biteY = vbH - bottomNotch

  return (
    `M0 ${round(topNotch + R)}` +
    arc(R, topNotch) +
    step(VB_W * tab, topNotch, 0) +
    `H${round(VB_W - R)}` +
    arc(VB_W, R) +
    `V${round(biteY - R)}` +
    arc(VB_W - R, biteY) +
    step(VB_W * tail, biteY, vbH, { rtl: true }) +
    `H${R}` +
    arc(0, round(vbH - R)) +
    `Z`
  )
}

type Props = {
  label?: string
  image?: string
  headline?: ReactNode
  statement?: ReactNode
  dots?: number
  activeDots?: number
  preset?: keyof typeof presets
  theme?: Partial<Skin>
  aspect?: number
  tab?: number
  tail?: number
  topNotch?: number
  bottomNotch?: number
  radius?: number
  duration?: number
  bounce?: number
  easing?: string
  spring?: boolean
  lift?: number
  zoom?: number
  className?: string
  style?: CSSProperties
}

export default function CardBookmark({
  label,
  image,
  headline,
  statement,
  /* Filled dots out of `dots` — the reference uses it as a level indicator. */
  dots = 3,
  activeDots = 1,
  /* Look */
  preset = 'canopy',
  theme,
  /* Geometry */
  aspect = 0.74,
  tab = 0.26,
  tail = 0.685,
  /* Tall enough to give the tab label room to breathe. */
  topNotch = 36,
  bottomNotch = 28,
  /* Fraction of the card's width, so the corners stay in proportion at any
     size. The base type scale is 5% of the width, hence the /0.05. */
  radius = 0.088,
  /* Motion */
  duration = 620,
  bounce = 0.45,
  easing,
  spring = true,
  lift = 6,
  /* How far the artwork pushes in on hover. */
  zoom = 1.28,
  className = '',
  style,
}: Props) {
  const skin: Skin = { ...(presets[preset] || presets.canopy), ...theme }

  const { mask, vbH } = useMemo(() => {
    const h = VB_W / aspect
    return {
      vbH: h,
      mask: toMask(buildShape(h, tab, tail, topNotch, bottomNotch, radius), VB_W, h),
    }
  }, [aspect, tab, tail, topNotch, bottomNotch, radius])

  const springCurve = useMemo(() => springEasing(bounce), [bounce])

  const vars = {
    '--cb-bg': skin.background,
    '--cb-label': skin.label,
    '--cb-headline': skin.headline,
    '--cb-headline-hover': skin.headlineHover,
    '--cb-statement': skin.statement,
    '--cb-statement-hover': skin.statementHover,
    '--cb-accent': skin.accent,
    '--cb-dot': skin.dot,
    '--cb-glow': skin.glow,
    '--cb-art': skin.art,
    '--cb-aspect': aspect,
    '--cb-tab-h': `${(topNotch / vbH) * 100}%`,
    '--cb-lift': `${-lift}px`,
    '--cb-zoom': zoom,
    '--cb-dur': `${duration}ms`,
    ...(spring ? { '--cb-spring': springCurve } : null),
    ...(easing ? { '--cb-ease': easing, '--cb-slide-ease': easing } : null),
    ...style,
  } as CSSProperties

  return (
    <div className={`cb-card${className ? ` ${className}` : ''}`} style={vars}>
      {/* The mask does the silhouette, so everything inside can be plain boxes. */}
      <span className="cb-shape" style={{ maskImage: mask, WebkitMaskImage: mask }}>
        <span className="cb-glow" aria-hidden="true" />

        <span className="cb-media">
          <span
            className="cb-art"
            style={{
              background: image
                ? `url("${image}") center/cover no-repeat`
                : 'var(--cb-art)',
            }}
          />
          {headline && <span className="cb-headline">{headline}</span>}
        </span>

        <span className="cb-foot">
          {statement && <span className="cb-statement">{statement}</span>}
          {dots > 0 && (
            <span className="cb-dots" aria-hidden="true">
              {Array.from({ length: dots }, (_, i) => (
                <span key={i} className={`cb-dot${i < activeDots ? ' is-on' : ''}`} />
              ))}
            </span>
          )}
        </span>

        {label && <span className="cb-label">{label}</span>}
      </span>
    </div>
  )
}
