"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

const MODEL_PATH = "/assets/hands.glb";
const DRACO_PATH = "/draco/";

/** World-space size the model is normalised to, so framing is model-agnostic.
 *  Sized so the hands crop off the panel edges, as in the mockup. */
const TARGET_SIZE = 6.6;
const CAMERA_Z = 6;
const FOV = 35;
/** Star (`Curve` mesh) spin speed — radians per second, around its vertical axis. */
const STAR_SPIN = 0.6;
/** Cursor-tilt amplitude (radians) and easing toward the target. */
const TILT_X = 0.12;
const TILT_Y = 0.2;
const TILT_EASE = 0.06;
/** Star spin axis — the diagonal running along the hands (points up-and-right),
 *  per the mockup: the star turns around this line, not the vertical. */
const STAR_AXIS = new THREE.Vector3(0.42, 0.91, 0).normalize();

interface HeroModelProps {
  className?: string;
}

/**
 * Client-only WebGL layer rendered over the panel video: the chrome hands with
 * a star that spins around its vertical axis, and the whole group tilting toward
 * the cursor. Plain three.js (no react-three-fiber) to keep the app's JSX types
 * free of fiber's global element augmentation. See decisions-log ADR-0014.
 */
export const HeroModel = ({ className = "" }: HeroModelProps) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let disposed = false;
    let frame = 0;
    let star: THREE.Mesh | null = null;
    const spinQuat = new THREE.Quaternion();
    const pointer = { x: 0, y: 0 };

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    const canvas = renderer.domElement;
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.display = "block";
    mount.appendChild(canvas);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      FOV,
      mount.clientWidth / mount.clientHeight,
      0.1,
      100,
    );
    camera.position.set(0, 0, CAMERA_Z);

    // Studio environment map → convincing chrome reflections, fully offline.
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envMap = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envMap;

    scene.add(new THREE.AmbientLight(0xffffff, 0.3));
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.1);
    keyLight.position.set(3, 4, 5);
    scene.add(keyLight);
    const rimLight = new THREE.DirectionalLight(0x8a7bff, 0.6);
    rimLight.position.set(-4, 1, -2);
    scene.add(rimLight);

    // group = cursor tilt · pivot = centred + normalised model.
    const group = new THREE.Group();
    scene.add(group);

    const onPointerMove = (event: MouseEvent) => {
      pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.y = (event.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("mousemove", onPointerMove, { passive: true });

    const chrome = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#eef1f6"),
      metalness: 1,
      roughness: 0.08,
      envMapIntensity: 1.3,
    });

    const draco = new DRACOLoader();
    draco.setDecoderPath(DRACO_PATH);
    const loader = new GLTFLoader();
    loader.setDRACOLoader(draco);

    loader.load(MODEL_PATH, (gltf) => {
      if (disposed) return;
      const model = gltf.scene;

      model.traverse((object) => {
        const mesh = object as THREE.Mesh;
        if (mesh.isMesh) mesh.material = chrome;
        if (object.name === "Curve") star = mesh;
      });

      // Recenter the star's geometry onto its centroid so it spins in place.
      if (star) {
        const starMesh = star as THREE.Mesh;
        starMesh.geometry = starMesh.geometry.clone();
        starMesh.geometry.computeBoundingBox();
        const center = new THREE.Vector3();
        starMesh.geometry.boundingBox!.getCenter(center);
        starMesh.geometry.translate(-center.x, -center.y, -center.z);
        const offset = center
          .clone()
          .multiply(starMesh.scale)
          .applyQuaternion(starMesh.quaternion);
        starMesh.position.add(offset);
      }

      // Center the whole model, then normalise it to a known world size.
      const box = new THREE.Box3().setFromObject(model);
      const size = new THREE.Vector3();
      const center = new THREE.Vector3();
      box.getSize(size);
      box.getCenter(center);
      model.position.sub(center);

      const pivot = new THREE.Group();
      pivot.add(model);
      const maxDim = Math.max(size.x, size.y, size.z) || 1;
      pivot.scale.setScalar(TARGET_SIZE / maxDim);
      group.add(pivot);
    });

    const clock = new THREE.Clock();
    const renderLoop = () => {
      frame = requestAnimationFrame(renderLoop);
      const delta = clock.getDelta();
      // Spin the star around the fixed diagonal axis (in the model's frame) so
      // it turns "along the hands" as drawn in the mockup, not around vertical.
      if (star) {
        spinQuat.setFromAxisAngle(STAR_AXIS, delta * STAR_SPIN);
        star.quaternion.premultiply(spinQuat);
      }
      group.rotation.y += (pointer.x * TILT_Y - group.rotation.y) * TILT_EASE;
      group.rotation.x += (pointer.y * TILT_X - group.rotation.x) * TILT_EASE;
      renderer.render(scene, camera);
    };

    // The scene renders continuously (spinning star + cursor tilt), so it must
    // stop when there is nothing to see: the tab is hidden, or the panel is
    // scrolled out of view (mobile). Both save a WebGL draw call every frame.
    let onScreen = true;
    let running = false;
    const shouldRun = () => onScreen && !document.hidden;
    const start = () => {
      if (running || !shouldRun()) return;
      running = true;
      clock.getDelta(); // drop the idle gap so the star doesn't jump on resume
      frame = requestAnimationFrame(renderLoop);
    };
    const stop = () => {
      if (!running) return;
      running = false;
      cancelAnimationFrame(frame);
    };
    const sync = () => (shouldRun() ? start() : stop());

    document.addEventListener("visibilitychange", sync);
    const inViewObserver = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting;
        sync();
      },
      { threshold: 0 },
    );
    inViewObserver.observe(mount);
    start();

    const resize = () => {
      const { clientWidth: w, clientHeight: h } = mount;
      if (!w || !h) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(mount);

    return () => {
      disposed = true;
      stop();
      document.removeEventListener("visibilitychange", sync);
      inViewObserver.disconnect();
      window.removeEventListener("mousemove", onPointerMove);
      observer.disconnect();
      envMap.dispose();
      pmrem.dispose();
      draco.dispose();
      chrome.dispose();
      renderer.dispose();
      canvas.remove();
    };
  }, []);

  return <div ref={mountRef} className={className} aria-hidden />;
};
