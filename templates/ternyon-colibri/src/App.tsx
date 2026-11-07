import { useEffect, useLayoutEffect, useState } from 'react'
import { motion } from 'motion/react'
import CardBookmark from './components/CardBookmark/CardBookmark'

/*
  Colibri — an original interface built over the hero footage.

  The backdrop machinery (video -> still crossfade, plate export) is inherited
  from the reconstruction. Everything above it is ours: layout, type, palette,
  copy, logo, navigation and the spec panel.

  Design notes
  ------------
  Structure is carried by hairlines and negative space rather than by boxes and
  drop shadows, which is what separates this from the stacked-glass-card look.
  There is exactly one filled surface on the page (the spec panel) and one solid
  button; everything else is type on the ground.

  The palette is sampled from the photograph rather than invented, so the
  rose in the CTA is literally the gorget. See index.css.

  Type is Instrument Serif over Instrument Sans - a high-contrast display face
  against a precise grotesque, with the one italic word in the headline doing
  the work a second colour would otherwise have to do.
*/

const BRAND = 'COLIBRI'

const STAGE_W = 1920
const STAGE_H = 1080

/*
  Timing. Measured against the encoded clip: hummingbird-flight.mp4 runs
  6.00s, cut from a longer render (dead lead dropped, sped to land near six
  seconds) so the page is not left empty waiting for it.

  Content enters at the midpoint of the flight. The handoff has to wait for the
  clip to end, because only its final frame matches the still hero -- crossfade
  even slightly early and you see a ghost. Re-measure both constants against the
  real clip length once it exists.
*/
const REVEAL_AT = 3.00
const HANDOFF_AT = 6.05

// Snappier and tighter than the original's 2555ms drift - precision reads as
// expensive where slow drift reads as a screensaver.
const EASE = { type: 'spring', duration: 0.9, bounce: 0.06 } as const

const px = (n: number) => `${n}px`
const box = (x: number, y: number, w?: number, h?: number): React.CSSProperties => ({
  position: 'absolute',
  left: px(x),
  top: px(y),
  ...(w != null ? { width: px(w) } : null),
  ...(h != null ? { height: px(h) } : null),
})

type From = { x?: number; y?: number; fade?: boolean; delay?: number }

function Reveal({
  from,
  style,
  children,
  play,
  className,
}: {
  from: From
  style?: React.CSSProperties
  children?: React.ReactNode
  play: boolean
  className?: string
}) {
  return (
    <motion.div
      className={className}
      style={style}
      initial={{ x: from.x ?? 0, y: from.y ?? 0, opacity: from.fade ? 0 : 1 }}
      animate={play ? { x: 0, y: 0, opacity: 1 } : undefined}
      transition={{ ...EASE, delay: from.delay ?? 0 }}
    >
      {children}
    </motion.div>
  )
}

/* The mark: nested domes over a point. A canopy is cover, and the layers read
   as depth of coverage. Drawn rather than borrowed. */
function Mark({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M2.5 19.5a9.5 9.5 0 0 1 19 0" stroke="#17211f" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M7 19.5a5 5 0 0 1 10 0" stroke="#17211f" strokeWidth="1.6" strokeLinecap="round" opacity="0.55" />
      <circle cx="12" cy="19.5" r="1.7" fill="#bd235d" />
    </svg>
  )
}

const NAV = ['Platform', 'Coverage', 'Research', 'Company']

const CARDS = [
  {
    preset: 'amber' as const,
    label: 'Detection',
    image: '/assets/art-a.webp',
    headline: 'Every signal read, the moment it lands',
    statement: '12ms',
    activeDots: 3,
  },
  {
    preset: 'canopy' as const,
    label: 'Coverage',
    image: '/assets/art-b.webp',
    headline: 'Contained before a human is paged',
    statement: '99.98%',
    activeDots: 2,
  },
]

const AVATARS = ['avatar-1.webp', 'avatar-2.webp', 'avatar-3.webp', 'avatar-4.webp']

export default function App() {
  const [scale, setScale] = useState(1)   // contain: the UI artboard
  const [cover, setCover] = useState(1)   // cover: the photographic scene
  const [play, setPlay] = useState(false)
  const [run, setRun] = useState(0)
  const [word, setWord] = useState(false)

  const plateParam =
    typeof window !== 'undefined' ? new URLSearchParams(location.search).get('plate') : null
  const plate = plateParam !== null
  const plateEmpty = plateParam === 'empty'

  useLayoutEffect(() => {
    const fit = () => {
      // Width-locked: the interface is exactly as wide as the window at
      // any size. Fitting it with Math.min pillarboxed it on anything
      // that was not 16:9. The backdrop keeps its own cover scale below.
      setScale(window.innerWidth / STAGE_W)
      setCover(Math.max(window.innerWidth / STAGE_W, window.innerHeight / STAGE_H))
    }
    fit()
    window.addEventListener('resize', fit)
    return () => window.removeEventListener('resize', fit)
  }, [])

  useEffect(() => {
    setPlay(false)
    setWord(false)
    if (plate) {
      setWord(!plateEmpty)
      return
    }
    const a = setTimeout(() => setPlay(true), REVEAL_AT * 1000)
    const b = setTimeout(() => setWord(true), HANDOFF_AT * 1000)
    return () => {
      clearTimeout(a)
      clearTimeout(b)
    }
  }, [run, plate, plateEmpty])

  /* The sequence plays once when the page loads and then holds. It used to
     restart on a timer, which makes a landing page feel like a screensaver.
     A refresh is the replay. */

  return (
    <div
      className="relative w-full overflow-hidden bg-[#5c7366]"
      style={{ height: `max(calc(100vw * ${STAGE_H} / ${STAGE_W}), 100vh)` }}
    >
      {/* full-bleed layers live at the viewport, not inside the artboard —
          scaling a fixed 1920x1080 artboard to fit leaves bars on any window
          that is not 16:9 */}
      <div className="stage-bg" style={{ position: 'absolute', inset: 0 }} />

      {/* ---- the scene ---------------------------------------------------
          Ground, clip and hero share ONE coordinate system, scaled to COVER.
          They used to be split: the clip was full-bleed at the viewport while
          the hero sat inside the contain-scaled artboard. Those agree only on
          a 16:9 window -- at 1543x1063 cover is 0.98 and contain is 0.80, so
          the bird jumped 22% smaller at the handoff and the photographic
          ground was replaced by a flat gradient. Same layer, same scale, so
          the swap is invisible at any aspect ratio. The UI stays on the
          artboard below, which is what the layout was measured against. */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: px(STAGE_W),
          height: px(STAGE_H),
          transform: `translate(-50%, -50%) scale(${cover})`,
          zIndex: 1,
        }}
      >
      <img
        src="/assets/hummingbird-ground.webp"
        alt=""
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
      />
      <motion.video
        key={`bgvid-${run}`}
        autoPlay
        muted
        playsInline
        preload="auto"
        initial={{ opacity: 1 }}
        animate={{ opacity: word ? 0 : 1 }}
        transition={{ duration: 0.4, ease: 'easeIn' }}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
      >
        <source src="/assets/hummingbird-flight.webm" type="video/webm" />
        <source src="/assets/hummingbird-flight.mp4" type="video/mp4" />
      </motion.video>

        {/* ---- backdrop ------------------------------------------------- */}

        <motion.div
          className="backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: word ? 1 : 0 }}
          transition={{ duration: 0.4, ease: 'easeIn' }}
          style={{ position: 'absolute', inset: 0 }}
        >
          <div
            className="wordmark"
            style={{
              ...box(16, 259, 1888, 255),
              fontFamily: 'var(--font-wordmark)',
              fontSize: px(365),
              lineHeight: px(365),
              letterSpacing: px(-14.59),
              textAlign: 'center',
              whiteSpace: 'nowrap',
            }}
          >
            {BRAND}
          </div>
          <img
            src="/assets/haze.webp"
            alt=""
            style={{ ...box(212, -74, 1283, 1589), objectFit: 'fill', filter: 'blur(86px)' }}
          />
          <img
            src="/assets/hummingbird.webp"
            alt=""
            style={{ ...box(205, -75, 1290, 1596), objectFit: 'cover' }}
          />
        </motion.div>
      </div>


      {/* ---- masthead: fixed at the viewport edge, present from the first
           frame. The content arrives around it rather than with it. ---- */}
      <div
        style={{
          position: 'absolute',
          inset: '0 0 auto 0',
          height: 132,
          display: 'flex',
          alignItems: 'flex-start',
          paddingTop: 34,
          paddingLeft: 48,
          paddingRight: 48,
          background:
            'linear-gradient(180deg, rgba(247,250,238,0.72) 0%, rgba(247,250,238,0.34) 46%, rgba(247,250,238,0) 100%)',
          maskImage: 'linear-gradient(180deg, #000 0%, #000 44%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(180deg, #000 0%, #000 44%, transparent 100%)',
          pointerEvents: 'none',
          zIndex: 4,
        }}
      >
        <div className="flex items-center" style={{ gap: 10 }}>
          <Mark />
          <span style={{ fontSize: 19, fontWeight: 600, letterSpacing: '0.14em', color: '#17211f' }}>
            {BRAND}
          </span>
        </div>
        <div className="flex items-center" style={{ flex: 1, justifyContent: 'center', gap: 46 }}>
          {NAV.map((label, i) => (
            <span key={label} className="micro" style={{ color: i === 0 ? '#17211f' : 'rgba(22,43,13,0.66)' }}>
              {label}
            </span>
          ))}
        </div>
        <div className="flex items-center" style={{ gap: 22 }}>
          <span className="micro" style={{ color: 'rgba(22,43,13,0.72)' }}>Sign in</span>
          <span
            className="micro"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              height: 36,
              padding: '0 18px',
              borderRadius: 999,
              background: '#17211f',
              color: '#f1f4f2',
              letterSpacing: '0.12em',
            }}
          >
            Get access
          </span>
        </div>
      </div>

      <div
        className={`relative${plate ? ' plate' : ''}`}
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: px(STAGE_W),
          height: px(STAGE_H),
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          zIndex: 3,
        }}
        key={run}
      >
        <div className="scrim" style={{ position: 'absolute', inset: '-20%', pointerEvents: 'none' }} />


        {/* the masthead now lives at the viewport layer, above */}

        {/* ---- headline --------------------------------------------------- */}

        <Reveal play={play} from={{ x: -260, fade: true }} style={box(80, 560, 420, 14)}>
          <div className="flex items-center" style={{ gap: px(10) }}>
            <span style={{ width: px(18), height: px(1), background: '#bd235d' }} />
            <span className="micro" style={{ color: 'var(--hero-ink-soft)' }}>
              Response measured in milliseconds
            </span>
          </div>
        </Reveal>

        <Reveal play={play} from={{ x: -560 }} style={box(76, 592, 620, 96)}>
          <h1
            style={{
              margin: 0,
              fontFamily: 'var(--font-display)',
              fontWeight: 400,
              fontSize: px(84),
              lineHeight: px(88),
              letterSpacing: '-0.015em',
              color: 'var(--hero-ink)',
            }}
          >
            Faster than
          </h1>
        </Reveal>

        <Reveal play={play} from={{ x: -460 }} style={box(76, 676, 620, 96)}>
          <h1
            style={{
              margin: 0,
              fontFamily: 'var(--font-display)',
              fontWeight: 400,
              fontSize: px(84),
              lineHeight: px(88),
              letterSpacing: '-0.015em',
              color: 'var(--hero-ink)',
            }}
          >
            <em style={{ fontStyle: 'italic', color: 'var(--hero-em)' }}>reflex</em>
          </h1>
        </Reveal>

        <Reveal play={play} from={{ x: -360, fade: true }} style={box(80, 800, 360, 60)}>
          <p
            style={{
              margin: 0,
              fontSize: px(15.5),
              lineHeight: px(25),
              color: 'var(--hero-ink-body)',
            }}
          >
            Detection, decision and response collapse into a single beat,
            finished before anyone reads the alert.
          </p>
        </Reveal>

        <Reveal play={play} from={{ x: -280, fade: true, delay: 0.06 }} style={box(80, 900, 420, 52)}>
          <div className="flex items-center" style={{ gap: px(26) }}>
            <div
              className="flex items-center"
              style={{
                gap: px(12),
                height: px(52),
                padding: `0 ${px(26)}`,
                borderRadius: px(999),
                background: '#bd235d',
                boxShadow: '0 14px 30px -14px rgba(204,162,20,0.85)',
              }}
            >
              <span style={{ fontSize: px(15), fontWeight: 600, color: '#17211f' }}>
                Start free
              </span>
            </div>
            <div className="flex items-center" style={{ gap: px(9) }}>
              <span
                style={{
                  fontSize: px(15),
                  fontWeight: 500,
                  color: 'var(--hero-ink)',
                  borderBottom: '1px solid var(--hero-rule)',
                  paddingBottom: px(2),
                }}
              >
                Watch the system
              </span>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path
                  d="M2 10L10 2M10 2H4M10 2v6"
                  stroke="var(--hero-ink)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </Reveal>

        {/* ---- trust + cards ---------------------------------------------- */}

        <Reveal play={play} from={{ x: 300, fade: true }} style={box(1284, 528, 556, 36)}>
          <div className="flex items-center" style={{ gap: px(14) }}>
            <div className="flex">
              {AVATARS.map((a, i) => (
                <img
                  key={a}
                  src={`/assets/${a}`}
                  alt=""
                  style={{
                    width: px(30),
                    height: px(30),
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '1.5px solid rgba(245,247,238,0.92)',
                    marginLeft: i === 0 ? 0 : px(-9),
                  }}
                />
              ))}
            </div>
            <span className="micro" style={{ color: 'var(--hero-ink-soft)' }}>
              Trusted by 320+ security teams
            </span>
          </div>
        </Reveal>

        {/* Two bookmark cards in place of the spec panel. This is our own
            stepped-card silhouette shared with the spec panel, typed;
            only the presets are new. Artwork is cut from the hero image, so the
            cards and the bird share a source. */}
        <div style={box(1284, 593, 556, 360)}>
          <div className="flex h-full" style={{ gap: px(24) }}>
            {CARDS.map((c, i) => (
              <Reveal
                key={c.label}
                play={play}
                from={{ y: 240 + i * 46, fade: true, delay: i * 0.08 }}
                style={{ flex: 1 }}
              >
                <CardBookmark
                  preset={c.preset}
                  label={c.label}
                  image={c.image}
                  headline={c.headline}
                  statement={c.statement}
                  activeDots={c.activeDots}
                />
              </Reveal>
            ))}
          </div>
        </div>
      </div>

      <div className="fixed bottom-5 right-5 flex gap-2" hidden={plate}>
        <button
          onClick={() => setRun((r) => r + 1)}
          className="rounded-full bg-white/80 px-4 py-2 text-sm text-[#17211f] shadow"
        >
          replay
        </button>
      </div>
    </div>
  )
}
