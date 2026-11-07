'use client'

import Image from 'next/image'
import { useState, useEffect } from 'react'
import type { PortfolioProject } from '@/config/referenceSite'

interface ReferenceProjectImageProps {
  project: {
    name: string
    category?: string
    label?: string
    subtitle?: string
    previewImage?: string
  }
  className?: string
  sizes?: string
  priority?: boolean
  mobile?: boolean
}

export default function ReferenceProjectImage({
  project,
  className = '',
  sizes = '100vw',
  priority = false,
  mobile = false,
}: ReferenceProjectImageProps) {
  const [imageFailed, setImageFailed] = useState(false)

  useEffect(() => {
    setImageFailed(false)
  }, [project.previewImage])

  let previewImage = project.previewImage
  if (previewImage && mobile) {
    if (previewImage.includes('desktop.jpg')) {
      previewImage = previewImage.replace('desktop.jpg', 'mobile.jpg').replace('w=640', 'w=256')
    } else if (
      previewImage.startsWith('/') &&
      previewImage.endsWith('.jpg') &&
      !previewImage.includes('-mobile')
    ) {
      previewImage = previewImage.replace(/\.jpg$/, '-mobile.jpg')
    }
  }
  const imageSrc = previewImage && !imageFailed ? previewImage : undefined

  return (
    <div
      className={`relative isolate overflow-hidden bg-zinc-900 ${className}`}
      aria-hidden="true"
    >
      {imageSrc ? (
        <Image
          src={imageSrc}
          alt=""
          fill
          sizes={sizes}
          unoptimized
          priority={priority}
          loading="eager"
          onError={() => setImageFailed(true)}
          className="object-cover object-top transition-[object-position] duration-[3500ms] ease-in-out group-hover:object-bottom"
        />
      ) : (
        <>
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                'radial-gradient(circle at 75% 28%, rgba(196, 159, 119, .48), transparent 34%), linear-gradient(145deg, #34312f, #111111 72%)',
            }}
          />
          <span className="absolute -left-2 top-1/4 font-display text-[clamp(5rem,15vw,12rem)] font-semibold leading-none text-white/10">
            {project.name.charAt(0)}
          </span>
          <div className="absolute inset-x-5 bottom-5">
            <p className="text-[9px] uppercase tracking-[0.18em] text-white/65">
              {project.label ?? project.category ?? 'Proje'}
            </p>
            <p className="mt-1 max-w-[18rem] text-lg font-semibold leading-tight text-white">
              {project.name}
            </p>
          </div>
        </>
      )}
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-white/[0.03]"
        aria-hidden="true"
      />
    </div>
  )
}
