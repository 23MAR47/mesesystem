interface MarkProps {
  className?: string;
  style?: React.CSSProperties;
}

/** One path, shared by every star on the page — including the SVG mask
 *  that cuts the neural section open, so the hole and the figure drawing
 *  its edge are guaranteed to be the same shape. viewBox is 0 0 24 24. */
export const STAR_PATH =
  "M12 0.6c0.9 5.6 4.9 9.9 10.8 11.4-5.9 1.5-9.9 5.8-10.8 11.4-0.9-5.6-4.9-9.9-10.8-11.4C7.1 10.5 11.1 6.2 12 0.6Z";

/** The four-point star runs through the whole page — nav, hero card, the
 *  centre of the neural field. One path, scaled by font-size. */
export function Star({ className, style }: MarkProps) {
  return (
    <svg
      className={className}
      style={style}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path d={STAR_PATH} fill="currentColor" />
    </svg>
  );
}

export function Arrow({ className, style }: MarkProps) {
  return (
    <svg
      className={className}
      style={style}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      aria-hidden="true"
    >
      <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
