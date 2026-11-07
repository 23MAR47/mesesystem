/**
 * The frame the whole page is composed inside: thirds, a centre cross
 * and a set of corner brackets — a viewfinder overlay rather than a
 * decorative grid.
 *
 * It sits above the canvas and below the copy, so the lines pass over
 * the object the way a focusing screen passes over a scene, which is
 * what stops it reading as wallpaper.
 */

const V = [33.333, 66.667];
const H = [33.333, 66.667];

function Bracket({ x, y, sx, sy }: { x: string; y: string; sx: number; sy: number }) {
  return (
    <span
      className="reticle-bracket"
      style={{ left: x, top: y, transform: `scale(${sx}, ${sy})` }}
    />
  );
}

export default function Reticle() {
  return (
    <div aria-hidden className="reticle">
      {V.map((x) => (
        <span key={`v${x}`} className="reticle-v" style={{ left: `${x}%` }} />
      ))}
      {H.map((y) => (
        <span key={`h${y}`} className="reticle-h" style={{ top: `${y}%` }} />
      ))}

      <span className="reticle-cross" style={{ left: "50%", top: "50%" }} />

      <Bracket x="4.5%" y="12%" sx={1} sy={1} />
      <Bracket x="95.5%" y="12%" sx={-1} sy={1} />
      <Bracket x="4.5%" y="88%" sx={1} sy={-1} />
      <Bracket x="95.5%" y="88%" sx={-1} sy={-1} />
    </div>
  );
}
