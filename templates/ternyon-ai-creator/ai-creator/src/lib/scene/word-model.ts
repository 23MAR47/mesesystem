/**
 * The word the bust becomes — now an authored model rather than rasterised type.
 *
 * **What replaced what.** This used to build the letters itself: a glyph
 * rasterised into a 2D canvas, sampled on a grid, its boundary snapped to the
 * coverage isoline, extruded into a slab and bevelled. All of that existed to
 * manufacture a 3D object out of a font, and none of it is needed once the
 * object arrives as one. The effect it fed is unchanged — the same lattice, the
 * same junction sparks, the same journey out of the bust, the same chrome rising
 * through it — because none of that ever depended on where the geometry came
 * from.
 *
 * **The lattice is not built here.** `buildCoarseWireframe` welds it, exactly as
 * it does for the bust, which is the point: two subjects, one topology
 * treatment, and a morph between them that maps junction to junction because
 * both sets are junctions of the same kind.
 *
 * All this module does is fetch the asset, flatten it to one geometry, and put
 * it where the scene expects it: centred on the origin and scaled to the size
 * the word held. The transform is **baked into the positions** rather than left
 * on a node, so object space is the space the chrome's fill level is measured
 * in and the shader needs no extra matrix.
 *
 * 📖 Docs: obsidian/frontend/components/common.md
 */

import * as THREE from "three";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

export interface WordModelOptions {
  /** Local Draco decoder — the asset is compressed. Never a CDN. */
  dracoDecoderPath: string;
  /** Target width in world units. */
  width: number;
  /** Ceiling on the height, so a tall asset cannot outgrow the stage. */
  maxHeight: number;
}

export interface WordPart {
  /**
   * One indexed geometry, centred and scaled, with the transform baked in.
   *
   * Indexed on purpose: the weld reads the index buffer to find which triangles
   * span two cells, and without one there is no topology to coarsen.
   */
  geometry: THREE.BufferGeometry;
  /**
   * True for the mark that floats above the rest — the star over the `i`.
   *
   * It is kept **separate** rather than merged in, because it is the one piece
   * with a life of its own: it turns about its own axis. Merged, there would be
   * no axis to turn it about.
   *
   * Detected as the part whose lowest point is above every other part's — a
   * floating accent is exactly the thing that is entirely clear of the body of
   * the mark, and asking the geometry beats trusting an exporter's mesh names.
   */
  accent: boolean;
  /**
   * The axis a spin turns about — the **node's own origin**, carried through
   * the fit, not the middle of a bounding box.
   *
   * They are not the same thing and the difference is the artist's intent. A
   * pivot is placed; a bounding-box centre is merely where the extremes happen
   * to average out, so on any shape that is not symmetric about the axis — a
   * five-pointed star has one point up and two down — it sits off the visual
   * centre and the spin wobbles. Asking the node is asking the person who made
   * the asset.
   *
   * Falls back to the bounding-box centre when the origin is not inside the
   * part at all, which is what an untouched pivot looks like: geometry baked
   * out at the world origin would otherwise orbit the whole word.
   */
  pivot: THREE.Vector3;
}

export interface WordModel {
  parts: WordPart[];
  /** Vertical extent of the whole mark, for the chrome's fill to sweep. */
  minY: number;
  maxY: number;
}

/** Everything the weld and the chrome need, and nothing else — a stray
 *  attribute on one primitive and not another makes the merge refuse. */
const KEEP = new Set(["position", "normal"]);

export const loadWordModel = async (
  url: string,
  { dracoDecoderPath, width, maxHeight }: WordModelOptions,
): Promise<WordModel | null> => {
  const draco = new DRACOLoader().setDecoderPath(dracoDecoderPath);
  const loader = new GLTFLoader().setDRACOLoader(draco);

  try {
    const gltf = await loader.loadAsync(url);
    // The asset's parts carry their own node transforms; bake them now, while
    // each part is still separate and its matrix still means something.
    gltf.scene.updateMatrixWorld(true);

    const parts: THREE.BufferGeometry[] = [];
    // Read each node's origin **before** its matrix is baked away. It is the
    // only record of where the artist put the pivot, and the geometry does not
    // carry it: once the transform is in the positions, an origin and a centre
    // of mass are indistinguishable.
    const pivots: THREE.Vector3[] = [];
    gltf.scene.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;
      const geometry = object.geometry.clone() as THREE.BufferGeometry;

      for (const name of Object.keys(geometry.attributes)) {
        if (!KEEP.has(name)) geometry.deleteAttribute(name);
      }
      if (!geometry.getAttribute("normal")) geometry.computeVertexNormals();
      if (!geometry.getIndex()) {
        // A primitive can arrive unindexed; give it the identity index so the
        // merge stays homogeneous and the weld has an index to read.
        const count = geometry.getAttribute("position").count;
        const index = new Uint32Array(count);
        for (let i = 0; i < count; i++) index[i] = i;
        geometry.setIndex(new THREE.BufferAttribute(index, 1));
      }
      pivots.push(
        new THREE.Vector3().setFromMatrixPosition(object.matrixWorld),
      );
      geometry.applyMatrix4(object.matrixWorld);
      parts.push(geometry);
    });
    if (parts.length === 0) return null;

    // Fit the mark as a whole, then apply that one transform to every part, so
    // the pieces keep their relationship to each other.
    const whole = new THREE.Box3();
    for (const part of parts) {
      part.computeBoundingBox();
      if (part.boundingBox) whole.union(part.boundingBox);
    }
    if (whole.isEmpty()) return null;

    const size = whole.getSize(new THREE.Vector3());
    const centre = whole.getCenter(new THREE.Vector3());
    // Fit to width, but never let height win the argument: the word sits on a
    // stage sized for a bust, and an asset that is tall rather than wide would
    // otherwise scale itself off the top of it.
    const scale = Math.min(
      width / Math.max(1e-6, size.x),
      maxHeight / Math.max(1e-6, size.y),
    );

    const fitted = new THREE.Box3();
    const boxes: THREE.Box3[] = [];
    parts.forEach((part, i) => {
      part.translate(-centre.x, -centre.y, -centre.z);
      part.scale(scale, scale, scale);
      // The pivot rides the same transform as the geometry it belongs to, or
      // it stops being that geometry's pivot.
      pivots[i].sub(centre).multiplyScalar(scale);
      part.computeBoundingBox();
      const box = part.boundingBox ?? new THREE.Box3();
      boxes.push(box);
      fitted.union(box);
    });

    // The accent is the part standing entirely above the others.
    let accentIndex = -1;
    if (boxes.length > 1) {
      let best = -Infinity;
      boxes.forEach((box, i) => {
        const clear = boxes.every(
          (other, j) => j === i || box.min.y >= other.max.y,
        );
        if (clear && box.min.y > best) {
          best = box.min.y;
          accentIndex = i;
        }
      });
    }

    return {
      parts: parts.map((geometry, i) => ({
        geometry,
        accent: i === accentIndex,
        pivot: boxes[i].containsPoint(pivots[i])
          ? pivots[i]
          : boxes[i].getCenter(new THREE.Vector3()),
      })),
      minY: fitted.min.y,
      maxY: fitted.max.y,
    };
  } catch {
    // A missing or broken asset costs the ending, not the hero: the caller
    // simply never builds the word and the bust keeps the stage.
    return null;
  } finally {
    // The decoder worker has done its job; keep it out of memory for the rest
    // of the session.
    draco.dispose();
  }
};

/**
 * Where each of the word's junctions starts from — a junction on the bust, so
 * the transition is a journey rather than a cross-dissolve.
 *
 * The two sets are different sizes and that is fine: a source may be reused.
 * What matters is that the mapping is **ordered**, not arbitrary. Both sides
 * are ranked by x, and within matching columns by y, so a junction on the left
 * of the word comes from the left of the bust and the cloud contracts rather
 * than shuffling. An arbitrary mapping produces the same final image and a
 * completely different, much worse, journey.
 */
export const sourceFromJunctions = (
  nodes: Float32Array,
  junctions: Float32Array,
): Float32Array => {
  const nodeCount = nodes.length / 3;
  const junctionCount = junctions.length / 3;
  const sources = new Float32Array(nodeCount * 3);
  if (junctionCount === 0) return sources;

  const rank = (source: Float32Array, count: number, axis: number): number[] =>
    Array.from({ length: count }, (_, i) => i).sort(
      (a, b) => source[a * 3 + axis] - source[b * 3 + axis],
    );

  const nodesByX = rank(nodes, nodeCount, 0);
  const junctionsByX = rank(junctions, junctionCount, 0);

  const columns = Math.max(1, Math.round(Math.sqrt(nodeCount)));
  const perNodeColumn = Math.ceil(nodeCount / columns);
  const perJunctionColumn = junctionCount / columns;

  for (let column = 0; column < columns; column++) {
    const nodeSlice = nodesByX
      .slice(column * perNodeColumn, (column + 1) * perNodeColumn)
      .sort((a, b) => nodes[a * 3 + 1] - nodes[b * 3 + 1]);
    if (nodeSlice.length === 0) continue;

    const junctionSlice = junctionsByX
      .slice(
        Math.floor(column * perJunctionColumn),
        Math.floor((column + 1) * perJunctionColumn),
      )
      .sort((a, b) => junctions[a * 3 + 1] - junctions[b * 3 + 1]);
    if (junctionSlice.length === 0) continue;

    for (let i = 0; i < nodeSlice.length; i++) {
      const node = nodeSlice[i];
      // Stretch the junction column across the node column, so the whole
      // height of the bust feeds the whole height of the word.
      const junction =
        junctionSlice[
          Math.min(
            junctionSlice.length - 1,
            Math.floor((i / nodeSlice.length) * junctionSlice.length),
          )
        ];
      sources[node * 3] = junctions[junction * 3];
      sources[node * 3 + 1] = junctions[junction * 3 + 1];
      sources[node * 3 + 2] = junctions[junction * 3 + 2];
    }
  }
  return sources;
};
