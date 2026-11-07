/**
 * A readable wireframe for a mesh that is far too dense to show one.
 *
 * The scan is 101,942 triangles. Its true wireframe is ~306k segments over a
 * subject about 700px tall, which puts several edges in every pixel: it renders
 * as a dark smudge, not as topology. Turning the opacity down only makes it a
 * lighter smudge — the problem is density, not weight.
 *
 * So the edges are welded onto a spatial grid first. Every vertex is snapped to
 * a cell, cells become the coarse vertices, and an edge survives only where a
 * triangle spans two different cells. What comes out is still the model's own
 * topology — the same surface, the same silhouette, connected the same way —
 * just resolved at a density an eye can read. Cell vertices are then pushed a
 * little way along their averaged normal so the lines float clear of the
 * surface instead of being swallowed by it.
 *
 * Cheaper than a decimator, too: one pass over the index buffer, no iterative
 * edge collapse, a few milliseconds at load.
 *
 * 📖 Docs: obsidian/frontend/components/common.md
 */

import * as THREE from "three";

interface Cell {
  index: number;
  position: THREE.Vector3;
  normal: THREE.Vector3;
  count: number;
}

export interface CoarseWireframeOptions {
  /** Grid cell size in world units — smaller means a denser mesh. */
  cellSize: number;
  /** How far to lift each vertex along its normal, in world units. */
  surfaceOffset: number;
}

export interface CoarseWireframe {
  /** `LineSegments` geometry — the surviving edges, two endpoints each. */
  lines: THREE.BufferGeometry;
  /**
   * `Points` geometry — one vertex per welded cell, deduplicated.
   *
   * These are the wireframe's **junctions**: the same coordinates the line
   * endpoints are copied from, so a sprite drawn here sits exactly where edges
   * meet rather than near it. Cells whose every edge collapsed inside them are
   * dropped, or the cloud would carry points with no lines to belong to.
   */
  points: THREE.BufferGeometry;
  /** Junction positions, flat — the same data as `points`, handed back so a
   *  caller can compute per-junction values without reading the attribute. */
  junctions: Float32Array;
  /**
   * For every vertex of `lines`, the junction it was copied from.
   *
   * This is what lets an edge morph: give each junction a destination and an
   * edge follows automatically, because both of its endpoints look up the same
   * destination its junction did. Without it the two ends of a line would have
   * to be matched separately and the mesh would come apart.
   */
  lineJunction: Uint32Array;
}

export const buildCoarseWireframe = (
  source: THREE.BufferGeometry,
  { cellSize, surfaceOffset }: CoarseWireframeOptions,
): CoarseWireframe | null => {
  const positions = source.getAttribute("position");
  const normals = source.getAttribute("normal");
  const index = source.getIndex();
  if (!positions || !index) return null;

  const cells = new Map<string, Cell>();
  const cellOf = new Int32Array(positions.count).fill(-1);
  const inverse = 1 / cellSize;

  for (let i = 0; i < positions.count; i++) {
    const key =
      `${Math.round(positions.getX(i) * inverse)},` +
      `${Math.round(positions.getY(i) * inverse)},` +
      `${Math.round(positions.getZ(i) * inverse)}`;

    let cell = cells.get(key);
    if (!cell) {
      cell = {
        index: cells.size,
        position: new THREE.Vector3(),
        normal: new THREE.Vector3(),
        count: 0,
      };
      cells.set(key, cell);
    }

    cell.position.x += positions.getX(i);
    cell.position.y += positions.getY(i);
    cell.position.z += positions.getZ(i);
    if (normals) {
      cell.normal.x += normals.getX(i);
      cell.normal.y += normals.getY(i);
      cell.normal.z += normals.getZ(i);
    }
    cell.count++;
    cellOf[i] = cell.index;
  }

  // Averaged centroid, lifted along the averaged normal.
  const vertices = new Float32Array(cells.size * 3);
  for (const cell of cells.values()) {
    cell.position.divideScalar(cell.count);
    if (cell.normal.lengthSq() > 0) {
      cell.position.addScaledVector(cell.normal.normalize(), surfaceOffset);
    }
    vertices.set(
      [cell.position.x, cell.position.y, cell.position.z],
      cell.index * 3,
    );
  }

  // An edge survives only where a triangle actually crosses two cells; edges
  // that collapsed inside one cell are exactly the detail being dropped.
  const edges = new Set<number>();
  const junctions = new Set<number>();
  const cellCount = cells.size;
  for (let i = 0; i < index.count; i += 3) {
    const a = cellOf[index.getX(i)];
    const b = cellOf[index.getX(i + 1)];
    const c = cellOf[index.getX(i + 2)];
    for (const [from, to] of [
      [a, b],
      [b, c],
      [c, a],
    ]) {
      if (from === to) continue;
      const low = Math.min(from, to);
      const high = Math.max(from, to);
      edges.add(low * cellCount + high);
      junctions.add(low);
      junctions.add(high);
    }
  }

  // Junction order is fixed here, and everything downstream indexes into it.
  const junctionRank = new Map<number, number>();
  for (const cell of junctions) junctionRank.set(cell, junctionRank.size);

  const lines = new Float32Array(edges.size * 6);
  const lineJunction = new Uint32Array(edges.size * 2);
  let cursor = 0;
  let lineVertex = 0;
  for (const edge of edges) {
    const low = Math.floor(edge / cellCount);
    const high = edge % cellCount;
    lines.set(vertices.subarray(low * 3, low * 3 + 3), cursor);
    lines.set(vertices.subarray(high * 3, high * 3 + 3), cursor + 3);
    lineJunction[lineVertex] = junctionRank.get(low) ?? 0;
    lineJunction[lineVertex + 1] = junctionRank.get(high) ?? 0;
    cursor += 6;
    lineVertex += 2;
  }

  const lineGeometry = new THREE.BufferGeometry();
  lineGeometry.setAttribute("position", new THREE.BufferAttribute(lines, 3));

  // The junctions, in the same coordinates the edges were built from and in
  // the order `junctionRank` fixed above.
  const junctionPositions = new Float32Array(junctions.size * 3);
  for (const [cell, rank] of junctionRank) {
    junctionPositions.set(vertices.subarray(cell * 3, cell * 3 + 3), rank * 3);
  }
  const pointGeometry = new THREE.BufferGeometry();
  pointGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(junctionPositions, 3),
  );

  return {
    lines: lineGeometry,
    points: pointGeometry,
    junctions: junctionPositions,
    lineJunction,
  };
};
