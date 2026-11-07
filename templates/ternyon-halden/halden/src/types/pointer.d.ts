/**
 * Set by the preloader once it has finished, so anything that mounts after it
 * knows without waiting for the event — see `src/components/common/after-preload.tsx`.
 */
interface Window {
  __haldenReady?: boolean;
  /** The shutter has started to lift — the first screen may arrive now. */
  __haldenOpening?: boolean;
}
