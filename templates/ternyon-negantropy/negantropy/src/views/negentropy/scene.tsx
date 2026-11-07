"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import { Suspense, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

import { useWindowWidth } from "@/hooks/use-window-size";
import { springsConfig } from "@/lib/springs/config";

import { HourglassGalaxy } from "./hourglass-galaxy";
import { Molecule } from "./molecule";
import { RedStorm } from "./red-storm";
import { SpiralNetwork } from "./spiral-network";
import { Starfield } from "./starfield";
import { StarfieldClose } from "./starfield-close";
import type {
  CursorActivityRef,
  CursorRef,
  ScrollProgressRef,
} from "./use-scroll-progress";

interface SceneProps {
  progressRef: ScrollProgressRef;
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const ramp = (p: number, a: number, b: number) => clamp01((p - a) / (b - a));

interface CameraRigProps {
  progressRef: ScrollProgressRef;
}

// Where the Red Storm ends up at p=1.0 — world origin so the §V
// camera can look straight along -Z with matching X and Y axes.
const STORM_CENTER: readonly [number, number, number] = [0, 0, 0];

const cameraAnchors: ReadonlyArray<{
  at: number;
  pos: readonly [number, number, number];
  look: readonly [number, number, number];
}> = [
  // §I — immersive spiral close-up.
  { at: 0.0, pos: [0, 2.5, 5], look: [0, 2.5, 0] },
  // §I → §II — orbit outward as the spiral spins.
  { at: 0.15, pos: [3, 2, 6.5], look: [0, 2, 0] },
  // §II — face-on with the molecule. Look-at z = molecule centre at
  // this scroll point (`ramp(0.33, 0.18, 0.52) × 4 ≈ 1.76`) so the
  // cage projects to dead screen-centre.
  { at: 0.33, pos: [0, 0, 9], look: [0, 0, 1.8] },
  // §II/§III — molecule at its closest (z=4); look-at matches.
  { at: 0.52, pos: [0, 0, 9], look: [0, 0, 4.0] },
  // §IV — molecule has flown past; look-at slides forward toward the
  // storm's rising trajectory.
  { at: 0.65, pos: [0, 0, 8], look: [0, -1.16, 2.3] },
  // §V — straight on the Red Storm at world origin. Camera directly
  // in front, 7 units away on +Z.
  {
    at: 0.83,
    pos: [STORM_CENTER[0], STORM_CENTER[1], STORM_CENTER[2] + 7],
    look: STORM_CENTER,
  },
  // §VI — dolly forward into the explosion. Camera ends up at z=5
  // looking at the world origin (the storm's centre, now the
  // hourglass's waist). At fov 70 / distance 5 the half-scale
  // hourglass (radius 2.5, y-offset 2.5) frames vertically with a
  // tiny margin. The close starfield drifts past on either side.
  { at: 1.0, pos: [0, 0, 5], look: [0, 0, 0] },
];

// Maximum cursor-driven camera offset (in world units). Small enough to feel
// like the camera is *breathing* with the cursor, not flying around with it.
const MOUSE_PARALLAX = { x: 0.7, y: 0.45 };

const CameraRig = ({ progressRef }: CameraRigProps) => {
  const { camera } = useThree();
  const targetPos = useMemo(() => new THREE.Vector3(), []);
  const targetLook = useMemo(() => new THREE.Vector3(), []);

  const targetMouse = useRef({ x: 0, y: 0 });
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (event: MouseEvent) => {
      targetMouse.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      targetMouse.current.y =
        -((event.clientY / window.innerHeight) * 2 - 1);
    };
    const onLeave = () => {
      targetMouse.current.x = 0;
      targetMouse.current.y = 0;
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseout", onLeave, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseout", onLeave);
    };
  }, []);

  useFrame(() => {
    const p = clamp01(progressRef.current ?? 0);

    let from = cameraAnchors[0];
    let to = cameraAnchors[cameraAnchors.length - 1];
    for (let i = 0; i < cameraAnchors.length - 1; i++) {
      if (p >= cameraAnchors[i].at && p <= cameraAnchors[i + 1].at) {
        from = cameraAnchors[i];
        to = cameraAnchors[i + 1];
        break;
      }
    }
    const span = to.at - from.at || 1;
    const t = clamp01((p - from.at) / span);

    mouse.current.x = lerp(mouse.current.x, targetMouse.current.x, 0.06);
    mouse.current.y = lerp(mouse.current.y, targetMouse.current.y, 0.06);

    targetPos.set(
      lerp(from.pos[0], to.pos[0], t) + mouse.current.x * MOUSE_PARALLAX.x,
      lerp(from.pos[1], to.pos[1], t) + mouse.current.y * MOUSE_PARALLAX.y,
      lerp(from.pos[2], to.pos[2], t),
    );
    targetLook.set(
      lerp(from.look[0], to.look[0], t) - mouse.current.x * 0.15,
      lerp(from.look[1], to.look[1], t) - mouse.current.y * 0.1,
      lerp(from.look[2], to.look[2], t),
    );

    // Direct copy (no lerp) so the camera lands *exactly* on the
    // scroll-driven target every frame. The previous `lerp(target,
    // 0.08)` introduced a frame-to-frame lag that, combined with
    // rapid up-then-down scrolls, made the molecule appear visibly
    // off-centre by the time the user came back. Lenis already
    // smooths the underlying scroll progress, so we don't need a
    // second smoothing layer here.
    camera.position.copy(targetPos);
    camera.lookAt(targetLook);
  });

  return null;
};

interface MouseTrackerProps {
  cursorRef: CursorRef;
  activityRef: CursorActivityRef;
  /** Seconds of cursor stillness before the void starts fading out. */
  idleAfterSeconds?: number;
}

/**
 * MouseTracker — projects the 2D cursor onto the z = 0 plane in scene
 * coords (the plane every scene leaf is centred on) and lerps a damped
 * `cursorRef.current` toward that target each frame. The particle
 * shaders read this position to repel themselves from the cursor —
 * the "liquid void blob" effect.
 *
 * Also writes a 0–1 *activity* value into `activityRef.current`:
 *   - 1 when the cursor has moved recently (within `idleAfterSeconds`).
 *   - 0 after the cursor has been still for `idleAfterSeconds`.
 * Lerped each frame so the void fades in/out smoothly. The particle
 * shaders multiply repel strength by this value, so an idle cursor
 * dissolves the void without snapping.
 *
 * Renders nothing. Listens for `mousemove`/`mouseout` so the void
 * recentres when the cursor leaves the window.
 */
const MouseTracker = ({
  cursorRef,
  activityRef,
  idleAfterSeconds = 3,
}: MouseTrackerProps) => {
  const { camera } = useThree();
  const ndc = useMemo(() => new THREE.Vector3(), []);
  const dir = useMemo(() => new THREE.Vector3(), []);
  const target = useMemo(() => new THREE.Vector3(), []);
  const mouse = useRef({ x: 0, y: 0, active: false });
  // Seeded in the mount effect — `performance.now()` is impure during
  // render under React Compiler rules.
  const lastMoveAt = useRef<number>(0);

  useEffect(() => {
    lastMoveAt.current = performance.now();
    const onMove = (event: MouseEvent) => {
      mouse.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -((event.clientY / window.innerHeight) * 2 - 1);
      mouse.current.active = true;
      lastMoveAt.current = performance.now();
    };
    const onLeave = () => {
      mouse.current.active = false;
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseout", onLeave, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseout", onLeave);
    };
  }, []);

  useFrame(() => {
    if (!cursorRef.current) return;

    if (mouse.current.active) {
      ndc.set(mouse.current.x, mouse.current.y, 0.5);
      ndc.unproject(camera);
      dir.copy(ndc).sub(camera.position).normalize();
      // Solve for the t where (camera + t * dir).z = 0 — the scene plane
      // every particle field is centred on.
      const denom = dir.z;
      if (Math.abs(denom) > 1e-4) {
        const t = -camera.position.z / denom;
        if (t > 0 && Number.isFinite(t)) {
          target.copy(camera.position).addScaledVector(dir, t);
        }
      }
    } else {
      // No cursor — drift the void back toward the camera's focal point.
      target.set(0, 0, 0);
    }

    cursorRef.current.lerp(target, 0.12);

    // Activity ramp: full while the cursor moved in the last
    // `idleAfterSeconds`, zero after that, lerped for smooth fade in/out.
    const idleFor = (performance.now() - lastMoveAt.current) / 1000;
    const want =
      mouse.current.active && idleFor < idleAfterSeconds ? 1 : 0;
    if (activityRef.current !== null) {
      activityRef.current = lerp(activityRef.current, want, 0.06);
    }
  });

  return null;
};

const StarfieldDrift = ({ progressRef }: { progressRef: ScrollProgressRef }) => {
  useFrame((state) => {
    state.scene.rotation.y = state.clock.elapsedTime * 0.005;
    // Slight scroll-driven tilt — keeps the starfield from feeling static.
    state.scene.rotation.x = ramp(progressRef.current ?? 0, 0, 1) * -0.15;
  });
  return null;
};

/**
 * Three.js scene host — sticky/fixed full-viewport canvas behind the section
 * overlays. All Three.js work is contained in a single Canvas so the rest
 * of the page stays plain DOM/spring world.
 *
 * The camera follows scroll progress (5 anchors lerped) plus a small
 * damped parallax from the cursor. A separate `MouseTracker` projects
 * the cursor into 3D world space; every particle shader reads that
 * point and repels itself away — invisible "liquid void" that carves
 * a moving bubble in the particle field.
 */
export const Scene = ({ progressRef }: SceneProps) => {
  const cursorRef = useRef<THREE.Vector3>(new THREE.Vector3());
  const activityRef = useRef<number>(0);

  // Mobile performance budget: thin every particle field and drop the bloom
  // postprocessing pass. `springsConfig.mobileWidth` (768) is the project's
  // shared "mobile" cutoff. `width === 0` is the pre-measure / SSR snapshot —
  // treat that as desktop (full quality). The density scale compounds two
  // 30 % cuts (0.7 × 0.7 ≈ 0.49) — roughly half the desktop particle count.
  const width = useWindowWidth();
  const isMobile = width > 0 && width <= springsConfig.mobileWidth;
  const densityScale = isMobile ? 0.49 : 1;

  return (
    <div className="pointer-events-none fixed inset-0 z-10 bg-negentropy-void">
      <Canvas
        camera={{ position: [0, 2.5, 5], fov: 70, near: 0.1, far: 200 }}
        dpr={[1, 2]}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: "high-performance",
        }}
        onCreated={({ gl }) => gl.setClearColor("#050608", 1)}
      >
        <color attach="background" args={["#050608"]} />
        <Suspense fallback={null}>
          <CameraRig progressRef={progressRef} />
          <MouseTracker cursorRef={cursorRef} activityRef={activityRef} />
          <StarfieldDrift progressRef={progressRef} />
          <Starfield densityScale={densityScale} />
          <SpiralNetwork
            progressRef={progressRef}
            cursorRef={cursorRef}
            activityRef={activityRef}
            densityScale={densityScale}
          />
          <Molecule
            progressRef={progressRef}
            cursorRef={cursorRef}
            activityRef={activityRef}
            densityScale={densityScale}
          />
          <RedStorm
            progressRef={progressRef}
            cursorRef={cursorRef}
            activityRef={activityRef}
            densityScale={densityScale}
          />
          <HourglassGalaxy
            progressRef={progressRef}
            cursorRef={cursorRef}
            activityRef={activityRef}
            densityScale={densityScale}
          />
          <StarfieldClose
            progressRef={progressRef}
            cursorRef={cursorRef}
            activityRef={activityRef}
            densityScale={densityScale}
          />

          {/*
            Bloom — conservative settings tuned for the dense particle
            field. Previous attempts (`v0.6`–`v0.8`, see [[decisions-log]]
            ADR-0009 area) tripped `WebGLRenderer: Context Lost` and
            washed everything to white. The combination that now works:
              - `mipmapBlur: false` — classic gaussian blur, no
                mipmap chain creation per-frame (the prior crash
                vector on dense scenes).
              - `luminanceThreshold: 0.4` — only the brightest cores
                of particles bloom; alpha-blended fringes are
                ignored. The earlier 2× brightness pass on every
                shader means cores comfortably clear this floor
                without flooding the frame.
              - `intensity: 0.55` — moderate glow that *adds* to the
                particle brightness without taking the foreground.
              - `multisampling: 0` on the composer — disables MSAA
                for the postprocessing pass; cheap and stable.
            Sits at the end of the scene tree so every particle leaf
            is composited before bloom runs.

            Skipped on mobile — the postprocessing pass is the most
            expensive part of the frame, so phones render the raw
            (already-2×-bright) particle fields without bloom.
          */}
          {!isMobile ? (
            <EffectComposer multisampling={0}>
              <Bloom
                intensity={.55}
                luminanceThreshold={0.02}
                luminanceSmoothing={0.08}
                radius={1.8}
                mipmapBlur={false}
              />
            </EffectComposer>
          ) : null}
        </Suspense>
      </Canvas>
    </div>
  );
};
