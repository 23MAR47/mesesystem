import Image from 'next/image'
import type { ShowcaseWebProject } from '@/config/showcaseProjects'

interface ShowcasePreviewProps {
  project: ShowcaseWebProject
  className?: string
  sizes?: string
  priority?: boolean
  compact?: boolean
}

export default function ShowcasePreview({
  project,
  className = '',
  sizes = '100vw',
  priority = false,
  compact = false,
}: ShowcasePreviewProps) {
  return (
    <div
      aria-hidden="true"
      className={`relative isolate overflow-hidden bg-zinc-900 ${className}`}
      style={{ backgroundColor: project.color }}
    >
      {project.previewImage ? (
        <Image
          src={project.previewImage}
          alt={`${project.name} — ${project.category} arayüz tasarımı ve canlı demo önizlemesi`}
          fill
          sizes={sizes}
          priority={priority}
          loading={priority ? undefined : 'lazy'}
          className="object-cover object-top transition-[object-position] duration-[3500ms] ease-in-out group-hover:object-bottom"
        />
      ) : (
        <>
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 72% 34%, ${project.color}99, transparent 38%), linear-gradient(135deg, #20232a, #08090c)`,
            }}
          />
          {!compact && (
            <>
              <span className="absolute -left-2 top-1/4 font-display text-[clamp(5rem,15vw,12rem)] font-semibold leading-none text-zinc-50/10">
                {project.name.charAt(0)}
              </span>
              <div className="absolute inset-x-5 bottom-5">
                <p className="text-[9px] uppercase tracking-[0.18em] text-zinc-300">
                  {project.sector}
                </p>
                <p className="mt-1 max-w-[18rem] text-lg font-semibold leading-tight text-zinc-100">
                  {project.name}
                </p>
              </div>
            </>
          )}
        </>
      )}
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-white/[0.03]"
        aria-hidden="true"
      />
    </div>
  )
}
