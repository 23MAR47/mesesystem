import * as THREE from "three";

/**
 * The four-point star, generated rather than modelled.
 *
 * Convention: the star lies in XY and is inflated along Z. The silhouette
 * is a superellipse with an exponent below 1, which is what makes the
 * waist pull in between the four tips:
 *
 *   r(t) = 1 / (|cos t|^p + |sin t|^p)^(1/p),   p < 1
 *
 * Two details do the visual work: the wrap column is indexed back to
 * column zero rather than duplicated (otherwise a smooth-shaded body has a
 * seam down one side), and both poles are welded to a single vertex
 * (otherwise the centre puckers).
 */
export interface StarOptions {
  segU?: number;
  segV?: number;
  power?: number;
  radius?: number;
  thickness?: number;
  /** how square-edged the slab is: lower keeps the silhouette full for
   *  longer before it rounds off into the face */
  shoulder?: number;
}

export function starGeometry({
  segU = 256,
  segV = 72,
  power = 0.55,
  radius = 1,
  thickness = 0.34,
  shoulder = 0.4,
}: StarOptions = {}) {
  const interiorRows = segV - 1;
  const vertexCount = interiorRows * segU + 2;
  const positions = new Float32Array(vertexCount * 3);

  const poleA = 0;
  const poleB = vertexCount - 1;
  const idx = (row: number, col: number) => 1 + (row - 1) * segU + (col % segU);

  const profile = (theta: number) => {
    const c = Math.abs(Math.cos(theta));
    const s = Math.abs(Math.sin(theta));
    return 1 / Math.pow(Math.pow(c, power) + Math.pow(s, power), 1 / power);
  };

  positions[poleA * 3 + 2] = -thickness;
  positions[poleB * 3 + 2] = thickness;

  for (let row = 1; row <= interiorRows; row++) {
    const v = -Math.PI / 2 + (row / segV) * Math.PI;
    const cv = Math.cos(v);
    const sv = Math.sin(v);
    const planar = Math.pow(Math.max(cv, 0), shoulder);
    for (let col = 0; col < segU; col++) {
      const theta = (col / segU) * Math.PI * 2;
      const r = profile(theta) * radius;
      // the tips are thinner than the body, but the taper is faded out
      // toward the poles so both of them weld to a flat z
      const taper = 1 + (Math.pow(r / radius, 0.8) - 1) * cv;
      const i = idx(row, col);
      positions[i * 3] = r * Math.cos(theta) * planar;
      positions[i * 3 + 1] = r * Math.sin(theta) * planar;
      positions[i * 3 + 2] = sv * thickness * taper;
    }
  }

  const indices: number[] = [];
  for (let col = 0; col < segU; col++) {
    indices.push(poleA, idx(1, col + 1), idx(1, col));
  }
  for (let row = 1; row < interiorRows; row++) {
    for (let col = 0; col < segU; col++) {
      const a = idx(row, col);
      const b = idx(row, col + 1);
      const c = idx(row + 1, col + 1);
      const d = idx(row + 1, col);
      indices.push(a, b, c, a, c, d);
    }
  }
  for (let col = 0; col < segU; col++) {
    indices.push(poleB, idx(interiorRows, col), idx(interiorRows, col + 1));
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();
  return geometry;
}
