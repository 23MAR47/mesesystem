/**
 * Media — a ratio-locked image box wrapping `next/image` (fill + object-cover).
 * Used for the reused reference photography. `ratio` is a dynamic value, so it
 * is the one allowed inline style (see design-system styling rules).
 */
import Image from "next/image";

interface MediaProps {
  src: string;
  alt: string;
  /** CSS aspect-ratio, e.g. "675 / 945". */
  ratio: string;
  priority?: boolean;
  sizes?: string;
  className?: string;
}

export const Media = ({
  src,
  alt,
  ratio,
  priority = false,
  sizes = "100vw",
  className = "",
}: MediaProps) => {
  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{ aspectRatio: ratio }}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className="object-cover"
      />
    </div>
  );
};
