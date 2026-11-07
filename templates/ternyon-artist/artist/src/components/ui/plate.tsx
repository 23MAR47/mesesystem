/**
 * Plate — a ratio-locked placeholder for any slot without a real image yet
 * (monochrome, matching the reference). Most slots now use <Media> with the
 * reused photography; Plate remains for overflow slots. `ratio` is the one
 * allowed inline style (dynamic value). Server component.
 */
interface PlateProps {
  /** CSS aspect-ratio, e.g. "4 / 5". */
  ratio: string;
  index?: string;
  label?: string;
  className?: string;
}

export const Plate = ({ ratio, index, label, className = "" }: PlateProps) => {
  return (
    <div
      className={`rule-dashed relative overflow-hidden border bg-surface-grey ${className}`}
      style={{ aspectRatio: ratio }}
    >
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center">
        {index ? (
          <span className="font-display text-sm text-ink-muted">{index}</span>
        ) : null}
        {label ? (
          <span className="font-display text-2xl italic text-ink-muted">
            {label}
          </span>
        ) : null}
        <span className="text-[0.6rem] uppercase tracking-[0.3em] text-ink-faint">
          Image forthcoming
        </span>
      </div>
    </div>
  );
};
