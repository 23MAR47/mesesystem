import { ART } from "@/lib/art";
import { MOSAIC } from "@/lib/content";

/**
 * A scattered field of tiles at different depths. Depth is one number per
 * tile: it sets the drift rate, the blur and the scale, so a tile reads as
 * near or far without any per-tile tuning.
 */
export default function Mosaic() {
  return (
    <section className="stage mosaic-stage" data-stage="mosaic" id="mosaic">
      <div className="pin">
        <div className="panel mosaic-panel">
          <div className="mosaic-field">
            {MOSAIC.tiles.map((tile, i) => {
              const artwork = ART[tile.art];
              return (
                <figure
                  className={`mosaic-tile ${tile.tone}`}
                  key={`${tile.label}-${i}`}
                  data-mosaic-tile
                  data-depth={tile.depth}
                  style={{
                    left: `${tile.x}%`,
                    top: `${tile.y}%`,
                    width: `${tile.w}%`,
                    background: artwork.background,
                  }}
                >
                  <span>{tile.label}</span>
                </figure>
              );
            })}
          </div>

          <div className="mosaic-copy" data-mosaic-copy>
            <h2>{MOSAIC.title}</h2>
            <p>{MOSAIC.body}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
