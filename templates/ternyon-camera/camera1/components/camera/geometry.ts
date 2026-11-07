import * as THREE from "three";

/**
 * Every part of the camera is generated here. There is no model file:
 * the whole thing is lathes, extrusions and boxes, which means each
 * piece can be described by the numbers that actually matter to it —
 * a lens by its curvature and edge thickness, a focus ring by its rib
 * count — and re-tuned without round-tripping through a DCC tool.
 *
 * Convention for the whole model: **the optical axis is +Z**, the front
 * of the camera faces +Z, up is +Y. Lathe profiles are therefore given
 * as `[radius, z]` pairs and revolved about Z, not about Y the way
 * three's own LatheGeometry does it.
 */

export type Profile = [number, number][];

interface RevolveOpts {
  segments?: number;
  /** Per-angle radius modulation — this is what cuts the knurling. */
  mod?: (theta: number, r: number) => number;
  /** Bake face normals instead of averaged ones. Faceted parts sparkle. */
  flat?: boolean;
}

/**
 * Revolves a `[radius, z]` polyline about the Z axis.
 *
 * Two details do real visual work here. The wrap column is indexed back
 * to column zero rather than duplicated, so a smooth-shaded lens has no
 * seam running down it; and points sitting exactly on the axis are
 * welded to a single pole vertex, so the centre of an element doesn't
 * pucker.
 */
export function revolve(profile: Profile, opts: RevolveOpts = {}) {
  const segments = opts.segments ?? 64;
  const rows = profile.length;

  const positions: number[] = [];
  const index: number[] = [];

  // grid[row][col] -> vertex id. Poles collapse to one id for the row.
  const grid: number[][] = [];

  for (let j = 0; j < rows; j++) {
    const [r0, z] = profile[j];
    const row: number[] = [];

    if (r0 <= 1e-6) {
      const id = positions.length / 3;
      positions.push(0, 0, z);
      for (let i = 0; i < segments; i++) row.push(id);
    } else {
      for (let i = 0; i < segments; i++) {
        const theta = (i / segments) * Math.PI * 2;
        const r = opts.mod ? opts.mod(theta, r0) : r0;
        positions.push(r * Math.cos(theta), r * Math.sin(theta), z);
        row.push(positions.length / 3 - 1);
      }
    }
    grid.push(row);
  }

  for (let j = 0; j < rows - 1; j++) {
    for (let i = 0; i < segments; i++) {
      const i2 = (i + 1) % segments;
      const a = grid[j][i];
      const b = grid[j][i2];
      const c = grid[j + 1][i2];
      const d = grid[j + 1][i];
      if (a !== b) index.push(a, b, d);
      if (c !== d) index.push(b, c, d);
    }
  }

  let geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geo.setIndex(index);
  if (opts.flat) geo = geo.toNonIndexed();
  geo.computeVertexNormals();
  return geo;
}

/**
 * Concatenates geometries into one buffer. Written out rather than
 * pulled from BufferGeometryUtils so the parts list has no dependency
 * on three's examples build, and so merging never silently drops the
 * hand-authored normals on a smooth element — everything is converted
 * to non-indexed and copied verbatim, with no recompute.
 */
export function mergeAll(geos: THREE.BufferGeometry[]) {
  const flat = geos.map((g) => (g.index ? g.toNonIndexed() : g));
  let total = 0;
  for (const g of flat) total += g.attributes.position.count;

  const position = new Float32Array(total * 3);
  const normal = new Float32Array(total * 3);
  let offset = 0;

  for (const g of flat) {
    if (!g.attributes.normal) g.computeVertexNormals();
    position.set(g.attributes.position.array as Float32Array, offset * 3);
    normal.set(g.attributes.normal.array as Float32Array, offset * 3);
    offset += g.attributes.position.count;
  }

  const out = new THREE.BufferGeometry();
  out.setAttribute("position", new THREE.BufferAttribute(position, 3));
  out.setAttribute("normal", new THREE.BufferAttribute(normal, 3));
  return out;
}

/* ------------------------------------------------------------------ *
 * Optics
 * ------------------------------------------------------------------ */

/** Sag of a spherical cap: how far the surface has fallen at radius r. */
function sag(R: number, r: number) {
  if (Math.abs(R) < 1e-6) return 0;
  const a = Math.abs(R);
  return Math.sign(R) * (a - Math.sqrt(Math.max(a * a - r * r, 0)));
}

interface LensOpts {
  /** semi-aperture */
  radius: number;
  /** thickness at the rim */
  edge: number;
  /** curvature radius of the front face: >0 convex, <0 concave, 0 flat */
  front: number;
  /** curvature radius of the back face, same convention */
  back: number;
  steps?: number;
  segments?: number;
}

/**
 * A real lens element: two spherical caps joined by a cylindrical rim.
 * Curvatures are given as radii, so an f/1.2 front element and a rear
 * corrector are the same call with different numbers — and because the
 * surfaces are genuinely spherical, the refraction in the shader bends
 * light the way the shape says it should.
 */
export function lensElement(o: LensOpts) {
  const steps = o.steps ?? 22;
  const half = o.edge / 2;
  const sf = sag(o.front, o.radius);
  const sb = sag(o.back, o.radius);

  const profile: Profile = [];

  // back face, pole outward
  for (let i = 0; i <= steps; i++) {
    const r = (i / steps) * o.radius;
    profile.push([r, -half - (sb - sag(o.back, r))]);
  }
  // rim
  profile.push([o.radius, half]);
  // front face, rim back to pole
  for (let i = steps; i >= 0; i--) {
    const r = (i / steps) * o.radius;
    profile.push([r, half + (sf - sag(o.front, r))]);
  }

  return revolve(profile, { segments: o.segments ?? 72 });
}

/** Flat optical disc — filters, protectors, the sensor cover glass. */
export function disc(radius: number, thickness: number, segments = 64) {
  const h = thickness / 2;
  return revolve(
    [
      [0, -h],
      [radius, -h],
      [radius, h],
      [0, h],
    ],
    { segments }
  );
}

/* ------------------------------------------------------------------ *
 * Rings and barrels
 * ------------------------------------------------------------------ */

/** Square-section ring with chamfered corners — the chamfers are what
 *  catch the strip lights, so they are never optional. */
export function ring(inner: number, outer: number, depth: number, chamfer = 0.008) {
  const h = depth / 2;
  const c = Math.min(chamfer, depth / 3, (outer - inner) / 3);
  const profile: Profile = [
    [inner + c, -h],
    [outer - c, -h],
    [outer, -h + c],
    [outer, h - c],
    [outer - c, h],
    [inner + c, h],
    [inner, h - c],
    [inner, -h + c],
    [inner + c, -h],
  ];
  return revolve(profile, { segments: 72, flat: false });
}

/**
 * Focus and zoom rings. The rib count and depth are the whole
 * character of the part: shallow and dense reads as a grip texture,
 * deep and sparse reads as machined. Faceted on purpose — each flank
 * takes the overhead bar light at a slightly different angle, which is
 * the flicker you see running around the barrel in the reference.
 */
export function knurledRing(
  inner: number,
  outer: number,
  depth: number,
  ribs = 48,
  ribDepth = 0.014
) {
  const h = depth / 2;
  const mid = (inner + outer) / 2;
  const profile: Profile = [
    [inner, -h],
    [outer, -h],
    [outer, h],
    [inner, h],
    [inner, -h],
  ];

  return revolve(profile, {
    segments: ribs * 2,
    flat: true,
    mod: (theta, r) => {
      if (r < mid) return r;
      // Triangle wave sampled exactly on its peaks and troughs, so the
      // ribs come out as a hard zigzag rather than a soft scallop.
      const t = Math.abs(((theta / (Math.PI * 2)) * ribs) % 1) * 2 - 1;
      return r - ribDepth * Math.abs(t);
    },
  });
}

/** Plain barrel shell, open bore. */
export function barrel(inner: number, outer: number, depth: number) {
  return ring(inner, outer, depth, 0.012);
}

/** Tapered barrel section — the step down from the filter thread to
 *  the mount, which is what stops the lens reading as one tube. */
export function taper(
  frontInner: number,
  frontOuter: number,
  backInner: number,
  backOuter: number,
  depth: number
) {
  const h = depth / 2;
  return revolve(
    [
      [backInner, -h],
      [backOuter, -h],
      [frontOuter, h],
      [frontInner, h],
      [backInner, -h],
    ],
    { segments: 72 }
  );
}

/**
 * Bayonet flange: a ring with three locking tabs reaching inward and a
 * row of contact pins. Small, but it is the part that says "camera"
 * more than anything else in the exploded view.
 */
export function bayonet(inner: number, outer: number, depth: number, tabs = 3) {
  const parts: THREE.BufferGeometry[] = [ring(inner, outer, depth, 0.006)];

  for (let i = 0; i < tabs; i++) {
    const a = (i / tabs) * Math.PI * 2 + 0.35;
    const tab = new THREE.BoxGeometry(0.055, 0.02, depth * 0.55);
    tab.translate(inner - 0.018, 0, 0);
    tab.rotateZ(a);
    parts.push(tab);
  }

  // contact pins across the lower arc
  for (let i = 0; i < 9; i++) {
    const a = Math.PI * 1.15 + (i / 8) * 0.62;
    const pin = new THREE.BoxGeometry(0.016, 0.01, 0.012);
    pin.translate((inner + outer) / 2, 0, depth / 2);
    pin.rotateZ(a);
    parts.push(pin);
  }

  return mergeAll(parts);
}

/** Aperture blades, half closed. Purely decorative from outside, but
 *  visible straight down the bore once the front element lifts away. */
export function irisBlades(inner: number, outer: number, blades = 9, open = 0.55) {
  const parts: THREE.BufferGeometry[] = [];
  const span = outer - inner;
  for (let i = 0; i < blades; i++) {
    const a = (i / blades) * Math.PI * 2;
    const b = new THREE.BoxGeometry(span * 1.25, span * 0.9, 0.004);
    b.translate(inner + span * 0.5 + (1 - open) * span * 0.28, 0, 0);
    b.rotateZ(a + 0.5);
    parts.push(b);
  }
  return mergeAll(parts);
}

/* ------------------------------------------------------------------ *
 * Body shells
 * ------------------------------------------------------------------ */

function roundedRect(w: number, h: number, r: number) {
  const shape = new THREE.Shape();
  const x = -w / 2;
  const y = -h / 2;
  const rr = Math.min(r, w / 2, h / 2);
  shape.moveTo(x + rr, y);
  shape.lineTo(x + w - rr, y);
  shape.absarc(x + w - rr, y + rr, rr, -Math.PI / 2, 0, false);
  shape.lineTo(x + w, y + h - rr);
  shape.absarc(x + w - rr, y + h - rr, rr, 0, Math.PI / 2, false);
  shape.lineTo(x + rr, y + h);
  shape.absarc(x + rr, y + h - rr, rr, Math.PI / 2, Math.PI, false);
  shape.lineTo(x, y + rr);
  shape.absarc(x + rr, y + rr, rr, Math.PI, Math.PI * 1.5, false);
  return shape;
}

/**
 * The workhorse body primitive: a rounded rectangle extruded along Z
 * with a bevel on both faces. The bevel is the point — a slab with
 * square edges renders as a flat grey card, while a chamfer gives the
 * fresnel term somewhere to spike and the part suddenly reads as solid
 * glass.
 */
export function slab(
  w: number,
  h: number,
  d: number,
  corner = 0.06,
  bevel = 0.012
) {
  const b = Math.min(bevel, d / 2.5);
  const geo = new THREE.ExtrudeGeometry(roundedRect(w, h, corner), {
    depth: Math.max(d - 2 * b, 0.001),
    bevelEnabled: true,
    bevelSize: b,
    bevelThickness: b,
    bevelSegments: 2,
    curveSegments: 6,
  });
  geo.translate(0, 0, -(d - 2 * b) / 2);
  geo.computeVertexNormals();
  return geo;
}

/**
 * Body plate with the lens bore cut through it. Worth the extra call
 * over a solid plate: the bore is the one place you can see straight
 * into the camera, and in a clear material an *implied* hole reads as
 * a smear where a real one reads as depth.
 */
export function slabBore(
  w: number,
  h: number,
  d: number,
  bore: number,
  corner = 0.06,
  bevel = 0.012
) {
  const shape = roundedRect(w, h, corner);
  const hole = new THREE.Path();
  hole.absarc(0, 0, bore, 0, Math.PI * 2, true);
  shape.holes.push(hole);

  const b = Math.min(bevel, d / 2.5);
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: Math.max(d - 2 * b, 0.001),
    bevelEnabled: true,
    bevelSize: b,
    bevelThickness: b,
    bevelSegments: 2,
    curveSegments: 12,
  });
  geo.translate(0, 0, -(d - 2 * b) / 2);
  geo.computeVertexNormals();
  return geo;
}

/** Hollow rectangular frame — sensor surround, screen bezel. */
export function frame(w: number, h: number, d: number, wall: number) {
  const parts = [
    slab(w, wall, d, wall / 2, 0.005),
    slab(w, wall, d, wall / 2, 0.005),
    slab(wall, h - wall * 2, d, wall / 2, 0.005),
    slab(wall, h - wall * 2, d, wall / 2, 0.005),
  ];
  parts[0].translate(0, h / 2 - wall / 2, 0);
  parts[1].translate(0, -h / 2 + wall / 2, 0);
  parts[2].translate(w / 2 - wall / 2, 0, 0);
  parts[3].translate(-w / 2 + wall / 2, 0, 0);
  return mergeAll(parts);
}

/**
 * The viewfinder hump. Drawn as its side silhouette — flat bottom,
 * tall back, sloped front — then extruded across the body. It is the
 * one shape that makes the whole assembly read as a camera from any
 * angle, which is why it is worth building properly rather than
 * dropping a box on top.
 */
export function pentaprism(width: number, height: number, depth: number) {
  const s = new THREE.Shape();
  const d = depth / 2;
  s.moveTo(-d, 0);
  s.lineTo(d, 0);
  s.lineTo(d * 0.86, height * 0.62);
  s.lineTo(-d * 0.1, height);
  s.lineTo(-d * 0.94, height * 0.74);
  s.lineTo(-d, height * 0.2);
  s.closePath();

  const geo = new THREE.ExtrudeGeometry(s, {
    depth: width * 0.9,
    bevelEnabled: true,
    bevelSize: 0.012,
    bevelThickness: 0.012,
    bevelSegments: 1,
    curveSegments: 2,
  });
  geo.translate(0, 0, -width * 0.45);
  // shape x-axis is the camera's depth axis; swing it into place
  geo.rotateY(Math.PI / 2);
  geo.computeVertexNormals();
  return geo;
}

/**
 * Hand grip: the plan-view section — a belly swelling away from the
 * body — extruded vertically.
 *
 * The section is drawn in the shape's XY with x as the belly and y as
 * the camera's depth, then a single quarter turn about X sends the
 * extrusion to the vertical and the depth axis to Z. It is one rotation
 * on purpose: chaining two would swap the belly and depth axes, and the
 * grip would come out as a wide flat fin across the front of the body.
 *
 * The belly is built toward +X, so the left-hand grip is placed with a
 * half turn rather than a mirrored profile — negating the section would
 * reverse its winding, and every normal with it.
 */
export function grip(depth: number, height: number, bulge: number) {
  const s = new THREE.Shape();
  s.moveTo(0, -depth / 2);
  s.quadraticCurveTo(bulge * 1.35, -depth * 0.18, bulge, depth * 0.1);
  s.quadraticCurveTo(bulge * 0.72, depth * 0.42, 0, depth / 2);
  s.lineTo(-0.02, depth / 2);
  s.lineTo(-0.02, -depth / 2);
  s.closePath();

  const geo = new THREE.ExtrudeGeometry(s, {
    depth: height,
    bevelEnabled: true,
    bevelSize: 0.018,
    bevelThickness: 0.018,
    bevelSegments: 2,
    curveSegments: 10,
  });
  geo.translate(0, 0, -height / 2);
  geo.rotateX(Math.PI / 2);
  geo.computeVertexNormals();
  return geo;
}

/* ------------------------------------------------------------------ *
 * Controls and hardware
 * ------------------------------------------------------------------ */

/** Machined dial: knurled skirt, chamfered cap. Axis along Z. */
export function dial(radius: number, height: number, notches = 26) {
  const skirt = knurledRing(radius * 0.55, radius, height, notches, radius * 0.06);
  const cap = revolve(
    [
      [0, height / 2],
      [radius * 0.94, height / 2],
      [radius * 0.94, height / 2 + height * 0.16],
      [0, height / 2 + height * 0.16],
    ],
    { segments: notches * 2 }
  );
  const hub = disc(radius * 0.56, height * 0.98, 32);
  return mergeAll([skirt, cap, hub]);
}

/** Simple round button with a domed top. */
export function button(radius: number, height: number) {
  return revolve(
    [
      [0, -height / 2],
      [radius, -height / 2],
      [radius, height * 0.2],
      [radius * 0.8, height / 2],
      [0, height * 0.62],
    ],
    { segments: 28 }
  );
}

/** Eight-way selector: outer collar plus centre pad. */
export function selector(radius: number, depth: number) {
  return mergeAll([
    ring(radius * 0.42, radius, depth, 0.006),
    disc(radius * 0.34, depth * 1.2, 24),
  ]);
}

/** Rubber-lipped eyecup around the finder window. */
export function eyecup(inner: number, outer: number, depth: number) {
  return revolve(
    [
      [inner, -depth / 2],
      [outer * 0.86, -depth / 2],
      [outer, depth * 0.1],
      [outer * 0.9, depth / 2],
      [inner * 1.05, depth / 2],
      [inner, depth * 0.1],
      [inner, -depth / 2],
    ],
    { segments: 40 }
  );
}

/** Hot shoe: a bracket with two rails. */
export function hotShoe(w: number, d: number, h: number) {
  const base = slab(w, d, h * 0.4, 0.006, 0.004);
  base.rotateX(Math.PI / 2);
  const railL = slab(0.014, d, h, 0.004, 0.003);
  railL.rotateX(Math.PI / 2);
  railL.translate(-w / 2 + 0.007, h * 0.3, 0);
  const railR = railL.clone();
  railR.translate(w - 0.014, 0, 0);
  return mergeAll([base, railL, railR]);
}

/** Countersunk screw, slotted. Scattered through the exploded view to
 *  give the eye something small to measure the big parts against. */
export function screw(radius: number, height: number) {
  const head = revolve(
    [
      [0, height / 2],
      [radius, height / 2],
      [radius * 0.72, height / 2 - height * 0.3],
      [radius * 0.72, -height / 2],
      [0, -height / 2],
    ],
    { segments: 16, flat: true }
  );
  const slot = new THREE.BoxGeometry(radius * 1.7, radius * 0.24, height * 0.2);
  slot.translate(0, 0, height / 2);
  return mergeAll([head, slot]);
}

/** Short cylinder along Z — pins, ports, the tripod boss. */
export function post(radius: number, length: number, segments = 20) {
  return disc(radius, length, segments);
}
