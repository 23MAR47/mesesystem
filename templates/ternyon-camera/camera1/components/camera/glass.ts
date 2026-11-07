import * as THREE from "three";

import {
  ENV_FLOOR,
  ENV_HORIZON,
  ENV_KEY,
  ENV_SKY,
  ENV_STRIP_A,
  ENV_STRIP_B,
  ENV_STRIP_C,
} from "@/lib/theme";

/* ------------------------------------------------------------------ *
 * Shared chunks
 * ------------------------------------------------------------------ */

/**
 * Spectral core, carried over from the prismatic-ring work.
 *
 * `spectralZucconi6` is Alan Zucconi's least-squares fit of the CIE
 * visible spectrum — a normalised wavelength in, linear RGB out.
 * `diffraction` integrates the interference term across that band for a
 * given optical path difference, which is what turns a grazing edge
 * into a real spectrum with repeating orders instead of a hue rotation.
 *
 * Three things it has to get right, each of which produces a grey or
 * yellow edge when missed: the white point is accumulated per channel
 * rather than divided by a scalar (the fit is red/green heavy); the DC
 * floor of the cosine is narrowed by a power so half the signal isn't
 * unmodulated broadband light; and the result is divided by the mean
 * interference so brightness stays flat and chroma carries the
 * variation, then compressed against the peak channel so the most
 * saturated pixels don't clip to white.
 */
const SPECTRAL = /* glsl */ `
const float TAU = 6.28318530718;

vec3 bump3y(vec3 x, vec3 yoffset) {
  return clamp((1.0 - x * x) - yoffset, 0.0, 1.0);
}

vec3 spectralZucconi6(float x) {
  const vec3 c1 = vec3(3.54585104, 2.93225262, 2.41593945);
  const vec3 x1 = vec3(0.69549072, 0.49228336, 0.27699880);
  const vec3 y1 = vec3(0.02312639, 0.15225084, 0.52607955);
  const vec3 c2 = vec3(3.90307140, 3.21182957, 3.96587128);
  const vec3 x2 = vec3(0.11748627, 0.86755042, 0.66077860);
  const vec3 y2 = vec3(0.84897130, 0.88445281, 0.73949448);
  return bump3y(c1 * (x - x1), y1) + bump3y(c2 * (x - x2), y2);
}

vec3 diffraction(float d, float sharpness) {
  const int SAMPLES = 12;
  vec3 col = vec3(0.0);
  vec3 white = vec3(0.0);
  float total = 0.0;
  for (int i = 0; i < SAMPLES; i++) {
    float f = (float(i) + 0.5) / float(SAMPLES);
    float lambda = mix(0.62, 1.42, f);
    vec3 w = spectralZucconi6(f);
    float interference = pow(0.5 + 0.5 * cos(TAU * d / lambda), sharpness);
    col += interference * w;
    white += w;
    total += interference;
  }
  float mean = total / float(SAMPLES);
  vec3 c = (col / max(white, vec3(1e-4))) / max(mean, 0.12);
  float peak = max(max(c.r, c.g), c.b);
  return c * (1.5 / (1.0 + peak));
}

float luma(vec3 c) { return dot(c, vec3(0.2126, 0.7152, 0.0722)); }

float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}
`;

/**
 * The studio, as a function of direction.
 *
 * There is no HDRI here and no cube render: `envSample` *is* the
 * environment. That is a deliberate trade. A clear material samples the
 * environment four times per pixel (once reflected, three times
 * refracted for dispersion) across thirty-odd double-sided parts, and a
 * cube map at that rate costs bandwidth we would rather spend on the
 * spectral integral. It also means the lighting is authored in numbers
 * that read like a lighting plan — a key, a tall strip camera-right, a
 * kicker behind, an overhead bar — and can be re-aimed without
 * re-baking anything.
 *
 * `stripe` puts a light in the *tangent plane* of its own direction, so
 * `tightU` and `tightV` shape it independently: a softbox is a broad
 * ellipse, the barrel streak is 90:1 narrow, the overhead bar is wide
 * and razor thin. Those anisotropic shapes are the whole reason the
 * knurled rings flicker as they turn.
 */
const ENVIRONMENT = /* glsl */ `
uniform vec3 uEnvSky;
uniform vec3 uEnvHorizon;
uniform vec3 uEnvFloor;
uniform vec3 uKey;
uniform vec3 uStripA;
uniform vec3 uStripB;
uniform vec3 uStripC;

float stripe(vec3 d, vec3 dir, vec3 upHint, float tightU, float tightV) {
  float a = dot(d, dir);
  if (a <= 0.001) return 0.0;
  vec3 right = normalize(cross(dir, upHint));
  vec3 up = cross(right, dir);
  float x = dot(d, right) / a;
  float y = dot(d, up) / a;
  return exp(-(x * x) * tightU - (y * y) * tightV);
}

vec3 envSample(vec3 d, float rough) {
  // A rough surface widens every emitter instead of blurring a texture.
  float soft = 1.0 + rough * 7.0;

  vec3 c = mix(uEnvHorizon, uEnvSky, smoothstep(0.0, 0.8, d.y));
  c = mix(c, uEnvFloor, smoothstep(0.02, -0.5, d.y));

  c += uKey    * stripe(d, normalize(vec3(-0.50, 0.72, 0.48)), vec3(0.0, 1.0, 0.0),  1.1 / soft,   1.5 / soft);
  c += uStripA * stripe(d, normalize(vec3( 0.94, 0.16, 0.30)), vec3(0.0, 1.0, 0.0), 95.0 / soft,   1.0 / soft);
  c += uStripB * stripe(d, normalize(vec3(-0.62,-0.22,-0.76)), vec3(0.0, 1.0, 0.0),  6.0 / soft,  13.0 / soft);
  c += uStripC * stripe(d, normalize(vec3( 0.04, 0.97, 0.22)), vec3(0.0, 0.0, 1.0),  0.85 / soft, 170.0 / soft);

  return c;
}
`;

/* ------------------------------------------------------------------ *
 * Vertex
 * ------------------------------------------------------------------ */

const VERT = /* glsl */ `
varying vec3 vWorld;
varying vec3 vNormalW;
varying vec3 vObj;
varying vec3 vNormalO;

void main() {
  vObj = position;
  vNormalO = normal;
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vWorld = wp.xyz;
  // The rig only ever applies uniform scale, so the model matrix is a
  // valid normal matrix and we can skip the inverse-transpose.
  vNormalW = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`;

/* ------------------------------------------------------------------ *
 * Fragment
 * ------------------------------------------------------------------ */

const FRAG = /* glsl */ `
precision highp float;

varying vec3 vWorld;
varying vec3 vNormalW;
varying vec3 vObj;
varying vec3 vNormalO;

uniform float uTime;
uniform vec3  uTint;
uniform float uThickness;
uniform float uIor;
uniform float uDispersion;
uniform float uRough;
uniform float uOpacity;
uniform float uEdge;
uniform float uMetal;
uniform float uLustre;
uniform float uReveal;
uniform float uScreen;
uniform vec3  uEmissive;
uniform vec2  uUvScale;

${SPECTRAL}
${ENVIRONMENT}

#if PATTERN == 1
/* Logic board. Traces are an axis-aligned walk through a hashed grid —
   cheap, and the right kind of wrong: real boards route in 45s and
   right angles, which is exactly what a grid walk produces. */
vec3 boardPattern(vec2 uv, out float mask) {
  vec2 g = uv * vec2(26.0, 18.0);
  vec2 cell = floor(g);
  vec2 f = fract(g);
  float h = hash21(cell);
  float line = 0.0;
  if (h < 0.42)      line = smoothstep(0.09, 0.0, abs(f.y - 0.5));
  else if (h < 0.72) line = smoothstep(0.09, 0.0, abs(f.x - 0.5));
  else if (h < 0.86) line = smoothstep(0.10, 0.0, abs(f.x - f.y));

  // pads
  float pad = smoothstep(0.16, 0.06, length(f - 0.5)) * step(0.9, h);

  // a few dark packages
  vec2 cg = floor(uv * vec2(6.0, 4.0));
  float chip = step(0.74, hash21(cg + 11.3));

  mask = clamp(line * 0.8 + pad, 0.0, 1.0) * (1.0 - chip * 0.85);
  return mix(vec3(0.06, 0.22, 0.2), vec3(0.16, 0.46, 0.42), pad) * mask;
}
#endif

#if PATTERN == 2
/* Rear display. Deliberately sparse: a level, a focus box, a histogram
   and one exposure readout. A busy screen at this size turns to mush
   and reads as noise rather than as an interface. */
float bar(vec2 uv, vec2 c, vec2 s) {
  vec2 d = abs(uv - c) - s;
  return 1.0 - smoothstep(0.0, 0.006, max(d.x, d.y));
}

vec3 screenPattern(vec2 uv, out float mask) {
  vec3 c = vec3(0.0);
  float m = 0.0;

  // rule-of-thirds grid
  float g = 0.0;
  g += smoothstep(0.004, 0.0, abs(fract(uv.x * 3.0) - 0.0));
  g += smoothstep(0.004, 0.0, abs(fract(uv.y * 3.0) - 0.0));
  g *= 0.16;

  // focus box, breathing
  vec2 fc = vec2(0.53 + sin(uTime * 0.6) * 0.03, 0.52);
  vec2 fs = vec2(0.14, 0.17);
  float outer = bar(uv, fc, fs);
  float inner = bar(uv, fc, fs - 0.008);
  float box = clamp(outer - inner, 0.0, 1.0);

  // corner ticks only, so it reads as an AF marker not a rectangle
  float cx = smoothstep(0.06, 0.055, abs(uv.x - fc.x));
  float cy = smoothstep(0.075, 0.07, abs(uv.y - fc.y));
  box *= 1.0 - cx * cy;

  // histogram along the bottom
  float hx = clamp((uv.x - 0.08) / 0.34, 0.0, 1.0);
  float hh = 0.10 * exp(-pow((hx - 0.45) * 3.2, 2.0)) + 0.012;
  float hist = step(uv.y - 0.07, hh) * step(0.07, uv.y) * step(0.08, uv.x) * step(uv.x, 0.42);

  // exposure strip, top right
  float strip = bar(uv, vec2(0.78, 0.9), vec2(0.14, 0.012));
  float tickPos = 0.78 + sin(uTime * 0.45) * 0.1;
  float tick = bar(uv, vec2(tickPos, 0.9), vec2(0.006, 0.026));

  m = clamp(g + box + hist * 0.55 + strip * 0.35 + tick, 0.0, 1.0);
  c += vec3(0.55, 0.86, 1.0) * (g + strip * 0.35);
  c += vec3(0.62, 0.95, 1.0) * box * 1.6;
  c += vec3(0.30, 0.80, 0.95) * hist * 0.9;
  c += vec3(1.0, 0.78, 0.45) * tick * 1.8;

  // the panel's own backlight
  float glow = smoothstep(1.02, 0.1, length((uv - 0.5) * vec2(1.0, 1.35)));
  c += vec3(0.05, 0.12, 0.2) * glow;
  m = max(m, glow * 0.5);

  mask = m;
  return c;
}
#endif

#if PATTERN == 3
/* Sensor. A colour-filter array is a diffraction grating whether it
   wants to be or not, so the sheen comes from the same integral the
   glass edges use, driven by the microlens pitch. */
vec3 sensorPattern(vec2 uv, float ndv, out float mask) {
  vec2 g = uv * vec2(150.0, 100.0);
  float grid = max(
    smoothstep(0.5, 0.0, abs(fract(g.x) - 0.5)),
    smoothstep(0.5, 0.0, abs(fract(g.y) - 0.5))
  );
  float d = 1.6 + (1.0 - ndv) * 5.5 + uv.x * 0.6;
  mask = 0.55;
  return diffraction(d, 2.0) * (0.1 + grid * 0.07);
}
#endif

void main() {
  vec3 N = normalize(vNormalW);
  if (!gl_FrontFacing) N = -N;
  vec3 V = normalize(cameraPosition - vWorld);
  float ndv = clamp(dot(N, V), 0.0, 1.0);

  // Schlick, with a floor so a face pointing straight at us still has a
  // little sheen — a perfectly clean F0 makes flat parts vanish.
  float fres = mix(0.055, 1.0, pow(1.0 - ndv, 5.0));

  vec3 R = reflect(-V, N);
  vec3 refl = envSample(R, uRough);

  // Dispersion: three refracted rays at slightly different indices.
  // Splitting only on refraction (not reflection) is physically right
  // and, more usefully, keeps the colour *inside* the part where it
  // reads as depth rather than smearing along the silhouette.
  float eta = 1.0 / uIor;
  vec3 rr = refract(-V, N, eta * (1.0 + uDispersion));
  vec3 rg = refract(-V, N, eta);
  vec3 rb = refract(-V, N, eta * (1.0 - uDispersion));
  vec3 trans = vec3(
    envSample(rr, uRough).r,
    envSample(rg, uRough).g,
    envSample(rb, uRough).b
  );

  // Beer-Lambert through a thickness that grows at grazing angles.
  float path = uThickness * (1.0 + (1.0 - ndv) * 1.8);
  trans *= exp(-uTint * path);

  /* Lustre — the colour *inside* the part.
     Three-ray dispersion only separates light where the surface is
     bending it, so on its own it colours the silhouette and leaves the
     body of a piece grey. Real optical crystal does the opposite: the
     interior is where the colour lives, because light has taken a long
     path through a medium whose index varies with wavelength.
     So the transmitted light is run through the same interference
     integral the rim uses, with the path difference driven by how far
     the ray actually travelled and which way the surface is facing —
     which makes the bands sweep across a part as it turns rather than
     sitting on it like a decal. */
  if (uLustre > 0.001) {
    float d = path * 2.6 + (1.0 - ndv) * 3.4 + dot(N, vec3(0.62, 0.44, 0.28)) * 2.1;
    trans = mix(trans, trans * diffraction(d, 1.7) * 1.5, uLustre);
  }

  vec3 emitted = mix(trans * (1.0 - fres) + refl * fres, refl * uTint, uMetal);

  // Prismatic rim. Only worth the integral where it will be visible, and
  // the branch is coherent across the silhouette so it costs nothing in
  // the middle of a part. Sharper than the interior bands so the edge
  // stays a thin spectrum rather than a coloured glow.
  float rim = pow(1.0 - ndv, 3.5);
  if (uEdge > 0.001 && rim > 0.004) {
    float d = rim * 9.0 + uThickness * 2.0;
    emitted += diffraction(d, 3.2) * uEdge * rim;
  }

  /* Coverage is deliberately tiny. A clear part is drawn twice — front
     face and back — and a dozen of them stack through the body, so the
     alpha the eye finally sees is one minus the product of all of them.
     At 0.03 a piece, twenty-odd surfaces still land near 50%; at the
     0.1 this started on, the same stack was opaque white. */
  float alpha = clamp(uOpacity + fres * 0.42, 0.0, 1.0);
  alpha = mix(alpha, 1.0, uMetal);

  vec2 uv = vObj.xy / uUvScale + 0.5;

#if PATTERN == 1
  if (abs(vNormalO.z) > 0.5) {
    float m;
    vec3 board = boardPattern(uv, m);
    emitted += board * 0.42;
    alpha = max(alpha, m * 0.5);
  }
#endif

#if PATTERN == 2
  if (vNormalO.z < -0.5) {
    float m;
    vec3 ui = screenPattern(clamp(uv, 0.0, 1.0), m);
    emitted += ui * uScreen * 1.5;
    alpha = max(alpha, m * uScreen * 0.9);
  }
#endif

#if PATTERN == 3
  if (vNormalO.z > 0.5) {
    float m;
    emitted += sensorPattern(uv, ndv, m);
    alpha = max(alpha, m);
  }
#endif

  emitted += uEmissive;

  // Premultiplied output: the rgb is light added to the frame, and the
  // alpha is only how much of the background it hides. That split is
  // what lets a specular streak blow out to white while the part it
  // sits on stays 12% opaque.
  gl_FragColor = vec4(emitted * uReveal, alpha * uReveal);
}
`;

/* ------------------------------------------------------------------ *
 * Material factory
 * ------------------------------------------------------------------ */

export type Pattern = 0 | 1 | 2 | 3;

export interface GlassOpts {
  /** Absorption coefficient. Near zero is water-clear crystal. */
  tint?: [number, number, number];
  thickness?: number;
  ior?: number;
  dispersion?: number;
  roughness?: number;
  /** Base coverage before fresnel. Low keeps the part see-through. */
  opacity?: number;
  /** Gain on the prismatic rim. */
  edge?: number;
  metal?: number;
  /** How strongly the interior is coloured by interference. */
  lustre?: number;
  emissive?: [number, number, number];
  pattern?: Pattern;
  /** Object-space extent used to build the pattern UV. */
  uvScale?: [number, number];
}

export function makeGlass(o: GlassOpts = {}) {
  const mat = new THREE.ShaderMaterial({
    vertexShader: VERT,
    fragmentShader: FRAG,
    defines: { PATTERN: o.pattern ?? 0 },
    uniforms: {
      uTime: { value: 0 },
      uTint: { value: new THREE.Vector3(...(o.tint ?? [0.06, 0.04, 0.03])) },
      uThickness: { value: o.thickness ?? 1.0 },
      uIor: { value: o.ior ?? 1.52 },
      uDispersion: { value: o.dispersion ?? 0.022 },
      uRough: { value: o.roughness ?? 0.04 },
      uOpacity: { value: o.opacity ?? 0.1 },
      uEdge: { value: o.edge ?? 0.55 },
      uMetal: { value: o.metal ?? 0 },
      uLustre: { value: o.lustre ?? 0 },
      uReveal: { value: 1 },
      uScreen: { value: 0 },
      uEmissive: {
        value: new THREE.Vector3(...(o.emissive ?? [0, 0, 0])),
      },
      uUvScale: { value: new THREE.Vector2(...(o.uvScale ?? [1, 1])) },

      uEnvSky: { value: new THREE.Vector3(...ENV_SKY) },
      uEnvHorizon: { value: new THREE.Vector3(...ENV_HORIZON) },
      uEnvFloor: { value: new THREE.Vector3(...ENV_FLOOR) },
      uKey: { value: new THREE.Vector3(...ENV_KEY) },
      uStripA: { value: new THREE.Vector3(...ENV_STRIP_A) },
      uStripB: { value: new THREE.Vector3(...ENV_STRIP_B) },
      uStripC: { value: new THREE.Vector3(...ENV_STRIP_C) },
    },
    transparent: true,
    // Both faces, and no depth write. A crystal part has to show its own
    // back wall through its front wall; writing depth would let whichever
    // face drew first cull the other and flatten the piece into a shell.
    side: THREE.DoubleSide,
    depthWrite: false,
    depthTest: true,
  });

  mat.premultipliedAlpha = true;
  return mat;
}

/* ------------------------------------------------------------------ *
 * Presets
 *
 * The reference is optical crystal on black: absorption is almost nil,
 * and everything you read is a specular streak or a refracted one. So
 * the tints below are tiny by design — the moment they climb, the parts
 * turn to smoked acrylic and the whole thing goes cheap.
 * ------------------------------------------------------------------ */

export const PRESETS: Record<string, GlassOpts> = {
  /** Body shells, rings, barrels. */
  crystal: {
    tint: [0.1, 0.07, 0.05],
    thickness: 0.7,
    ior: 1.5,
    dispersion: 0.03,
    opacity: 0.03,
    edge: 0.3,
    lustre: 0.55,
  },
  /** Lens elements — denser, far more dispersive, and clearer. */
  optic: {
    tint: [0.05, 0.035, 0.024],
    thickness: 1.4,
    ior: 1.76,
    dispersion: 0.052,
    opacity: 0.025,
    edge: 0.5,
    lustre: 0.95,
  },
  /** Thin flats: filters, cover glass. */
  flat: {
    tint: [0.03, 0.025, 0.02],
    thickness: 0.3,
    ior: 1.46,
    dispersion: 0.022,
    opacity: 0.02,
    edge: 0.55,
    lustre: 0.4,
  },
  /** Grip, eyecup, seals — the only parts that aren't clear, so they
   *  carry most of the object's silhouette. Milky, and rough enough
   *  that the emitters smear across them instead of pinning. */
  frosted: {
    tint: [0.9, 0.84, 0.74],
    thickness: 1.2,
    ior: 1.44,
    dispersion: 0.012,
    roughness: 0.42,
    opacity: 0.14,
    edge: 0.14,
    lustre: 0.12,
  },
  /** Bayonet, hot shoe, screws, contacts. */
  metal: {
    tint: [0.6, 0.66, 0.8],
    metal: 1,
    roughness: 0.12,
    opacity: 1,
    edge: 0.12,
  },
  /** Accent ring at the front of the lens. */
  accent: {
    tint: [0.1, 0.46, 0.85],
    metal: 1,
    roughness: 0.18,
    opacity: 1,
    edge: 0.45,
    emissive: [0.006, 0.04, 0.08],
  },
};
