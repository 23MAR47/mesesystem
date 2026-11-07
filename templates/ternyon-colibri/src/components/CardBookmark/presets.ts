/**
 * Colour presets for <CardBookmark />.
 *
 * `glow` is the gradient that blooms in behind the artwork on hover; `art` is
 * the placeholder backdrop used until you pass a real `image`.
 *
 * These cards are light. The original dark panel was built to sit on a pale
 * page; this bird's hero ground is near black, so a dark card on it lost its
 * edge and read as a smudge. Inverting keeps the contrast relationship the
 * layout was designed around -- one filled surface, clearly separate from its
 * ground -- rather than the literal colour.
 *
 * The surface is not white. Each card takes a 55% wash of its OWN accent,
 * so the two stay as distinguishable as they were when they were dark, and the
 * page keeps sampling its colour from the photograph rather than inventing a
 * neutral.
 *
 * `headline` stays light: it is set over the artwork image, not on the card
 * body. Only `label`, `statement` and `dot` follow the background.
 */
export type Skin = {
  background: string
  label: string
  headline: string
  headlineHover: string
  statement: string
  statementHover: string
  accent: string
  dot: string
  glow: string
  art: string
}

export const presets: Record<string, Skin> = {
  /* The green card — deep canopy, amber on hover. */
  canopy: {
    background: '#db86a6',
    label: '#17211f',
    headline: '#f1f4f2',
    headlineHover: '#db6190',
    statement: 'rgba(23, 33, 31, 0.58)',
    statementHover: '#17211f',
    accent: '#bd235d',
    dot: 'rgba(23, 33, 31, 0.20)',
    glow:
      'radial-gradient(125% 88% at 32% 14%, #4c755e 0%, #2c4639 34%, #16241e 66%, #080f04 100%)',
    art:
      'repeating-conic-gradient(from 196deg at 12% 2%, rgba(255,255,255,0.14) 0deg 0.9deg, transparent 0.9deg 3.2deg), ' +
      'radial-gradient(110% 120% at 12% 8%, #8cb198 0%, #4c755e 26%, #22382d 52%, #060c03 100%)',
  },

  /* The warm card — the cheek colour, leading. */
  amber: {
    background: '#eba8c2',
    label: '#17211f',
    headline: '#f1f4f2',
    headlineHover: '#e891b6',
    statement: 'rgba(23, 33, 31, 0.58)',
    statementHover: '#17211f',
    accent: '#db6190',
    dot: 'rgba(23, 33, 31, 0.20)',
    glow:
      'radial-gradient(125% 88% at 34% 14%, #d13975 0%, #971a4c 34%, #450b21 66%, #120e02 100%)',
    art:
      'repeating-conic-gradient(from 200deg at 16% 4%, rgba(255,255,255,0.16) 0deg 0.9deg, transparent 0.9deg 3.2deg), ' +
      'radial-gradient(110% 120% at 16% 10%, #f8afcf 0%, #d13975 24%, #801641 52%, #18050d 100%)',
  },
}

export default presets
