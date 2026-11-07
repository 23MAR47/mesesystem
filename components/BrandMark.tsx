import { cn } from '@/lib/cn'

export default function BrandMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'relative inline-flex size-9 shrink-0 items-center justify-center select-none transition-transform duration-200 hover:scale-105',
        className
      )}
      aria-hidden="true"
    >
      <span className="sr-only">&lt;M&gt; MESE SYSTEM</span>
      <img
        src="/brand/mese-system-mark-128.png"
        alt="MESE SYSTEM Logo"
        width={36}
        height={36}
        className="h-full w-full object-contain drop-shadow-[0_2px_8px_rgba(197,160,89,0.18)]"
        loading="eager"
      />
    </span>
  )
}
