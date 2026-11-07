/**
 * Chrome star. No HDRI: the environment is a function — three ambient
 * tiers plus a few anisotropic emitters — so it can be re-aimed by moving
 * a number instead of re-baking a cube map.
 */
export const starVertex = /* glsl */ `
precision highp float;

varying vec3 vNormalW;
varying vec3 vViewW;
varying vec3 vLocal;

void main() {
  vec4 world = modelMatrix * vec4(position, 1.0);
  vNormalW = normalize(mat3(modelMatrix) * normal);
  vViewW = normalize(cameraPosition - world.xyz);
  vLocal = position;
  gl_Position = projectionMatrix * viewMatrix * world;
}
`;

export const starFragment = /* glsl */ `
precision highp float;

uniform vec3 uSky;
uniform vec3 uHorizon;
uniform vec3 uFloor;
uniform vec3 uKey;
uniform vec3 uStripA;
uniform vec3 uStripB;
uniform vec3 uTint;
uniform float uRough;
uniform float uTime;
uniform float uAlpha;

varying vec3 vNormalW;
varying vec3 vViewW;
varying vec3 vLocal;

// an emitter placed in the tangent plane of its own direction, so it can be
// shaped independently along two axes: a softbox is a broad ellipse, a
// barrel streak is 90:1 narrow
float stripe(vec3 d, vec3 dir, vec3 upHint, float tightU, float tightV) {
  vec3 u = normalize(cross(upHint, dir));
  vec3 v = normalize(cross(dir, u));
  float along = dot(d, dir);
  if (along <= 0.0) return 0.0;
  float du = dot(d, u) * tightU;
  float dv = dot(d, v) * tightV;
  float f = exp(-(du * du + dv * dv) * 2.2);
  return f * pow(along, 2.0);
}

vec3 envSample(vec3 d, float rough) {
  float soft = 1.0 + rough * 7.0;
  vec3 c = mix(uHorizon, uSky, smoothstep(0.0, 0.8, d.y));
  c = mix(c, uFloor, smoothstep(0.05, -0.55, d.y));
  c += uKey    * stripe(d, normalize(vec3(-0.45, 0.76, 0.47)), vec3(0.0, 1.0, 0.0), 1.2 / soft, 1.7 / soft);
  c += uStripA * stripe(d, normalize(vec3( 0.92, 0.24, 0.32)), vec3(0.0, 1.0, 0.0), 42.0 / soft, 1.1 / soft);
  c += uStripB * stripe(d, normalize(vec3(-0.15,-0.55,-0.82)), vec3(0.0, 0.0, 1.0), 3.4 / soft, 9.0 / soft);
  return c;
}

// ACES, fitted — the emitters are far above 1.0 and would clip flat white
vec3 aces(vec3 x) {
  const float a = 2.51, b = 0.03, c = 2.43, d = 0.59, e = 0.14;
  return clamp((x * (a * x + b)) / (x * (c * x + d) + e), 0.0, 1.0);
}

void main() {
  vec3 N = normalize(vNormalW);
  vec3 V = normalize(vViewW);
  if (!gl_FrontFacing) N = -N;

  vec3 R = reflect(-V, N);
  vec3 refl = envSample(R, uRough);

  float fres = pow(1.0 - clamp(dot(N, V), 0.0, 1.0), 4.0);

  // metal: no diffuse term, the tint multiplies the reflection. The violet
  // ground the panel is painted in leaks back in at grazing angles.
  vec3 col = refl * mix(uTint, vec3(1.0), 0.55 + fres * 0.45);
  col += uTint * fres * 0.55;

  // a slow sheen crawling across the body keeps a still frame alive
  float sheen = 0.5 + 0.5 * sin(vLocal.x * 2.4 + vLocal.y * 1.6 + uTime * 0.35);
  col *= 0.92 + sheen * 0.16;

  gl_FragColor = vec4(pow(aces(col), vec3(1.0 / 2.2)), uAlpha);
}
`;
