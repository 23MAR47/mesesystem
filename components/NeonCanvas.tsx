'use client'

import { useEffect, useRef } from 'react'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  color: string
  alpha: number
  pulseSpeed: number
  pulsePhase: number
}

/**
 * NeonCanvas
 * High-performance cyberpunk particle & grid canvas background.
 * Optimized with dynamic Device Pixel Ratio (DPR) scaling for Retina & 4K displays
 * without blurriness or performance drop.
 */
export function NeonCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const mouseRef = useRef<{
    x: number
    y: number
    targetX: number
    targetY: number
    active: boolean
    parallaxX: number
    parallaxY: number
  }>({
    x: -9999,
    y: -9999,
    targetX: 0,
    targetY: 0,
    active: false,
    parallaxX: 0,
    parallaxY: 0,
  })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    let animationFrameId: number
    let dpr = 1
    let width = 0
    let height = 0
    let particles: Particle[] = []

    const initParticles = (w: number, h: number) => {
      // Bound particle count to guarantee 60fps on 4K and mobile alike
      const count = Math.min(80, Math.max(35, Math.floor((w * h) / 16000)))
      const colors = ['#22d3ee', '#818cf8', '#a855f7', '#38bdf8', '#06b6d4']
      const list: Particle[] = []

      for (let i = 0; i < count; i++) {
        list.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          radius: Math.random() * 2 + 1,
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: Math.random() * 0.5 + 0.3,
          pulseSpeed: 0.02 + Math.random() * 0.03,
          pulsePhase: Math.random() * Math.PI * 2,
        })
      }
      return list
    }

    const setCanvasSize = () => {
      if (!canvas || !ctx) return
      // DPR clamp: 1 to 2.5 ensures crystal-sharp Retina/4K rendering without GPU fill-rate lag
      const rawDpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1
      dpr = Math.min(Math.max(rawDpr, 1), 2.5)

      const parent = canvas.parentElement
      const newWidth = parent?.clientWidth ?? window.innerWidth
      const newHeight = parent?.clientHeight ?? window.innerHeight

      if (newWidth === width && newHeight === height && canvas.width === Math.floor(newWidth * dpr)) {
        return
      }

      width = newWidth
      height = newHeight

      // Backing buffer scaled by DPR for sharp pixels
      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)

      // CSS display size
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`

      // Coordinate transformation so all draw calls use logical CSS pixels
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      // Re-seed particles proportionally
      particles = initParticles(width, height)
    }

    setCanvasSize()

    // Listen for window resize
    const handleResize = () => {
      setCanvasSize()
    }
    window.addEventListener('resize', handleResize)

    // Listen for display resolution changes (e.g., dragged to Retina / 4K external display)
    let mediaQueryList: MediaQueryList | null = null
    const handleDprChange = () => {
      setCanvasSize()
    }

    try {
      if (typeof window !== 'undefined' && window.matchMedia) {
        mediaQueryList = window.matchMedia(`(resolution: ${window.devicePixelRatio || 1}dppx)`)
        mediaQueryList.addEventListener('change', handleDprChange)
      }
    } catch {
      // Fallback for older browsers
    }

    // ResizeObserver for parent container changes
    let resizeObserver: ResizeObserver | null = null
    if (typeof ResizeObserver !== 'undefined' && canvas.parentElement) {
      resizeObserver = new ResizeObserver(() => {
        setCanvasSize()
      })
      resizeObserver.observe(canvas.parentElement)
    }

    // Mouse tracking with parallax
    const handleMouseMove = (e: MouseEvent) => {
      if (!canvas) return
      const rect = canvas.getBoundingClientRect()
      const clientX = e.clientX - rect.left
      const clientY = e.clientY - rect.top
      mouseRef.current.x = clientX
      mouseRef.current.y = clientY
      mouseRef.current.active = true

      const centerX = width / 2
      const centerY = height / 2
      mouseRef.current.targetX = (clientX - centerX) / (centerX || 1)
      mouseRef.current.targetY = (clientY - centerY) / (centerY || 1)
    }

    const handleMouseLeave = () => {
      mouseRef.current.active = false
      mouseRef.current.targetX = 0
      mouseRef.current.targetY = 0
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    window.addEventListener('mouseleave', handleMouseLeave)

    let scanlineY = 0

    // High performance render loop
    const render = () => {
      ctx.clearRect(0, 0, width, height)

      // Mouse parallax easing
      const mouse = mouseRef.current
      mouse.parallaxX += (mouse.targetX * 24 - mouse.parallaxX) * 0.04
      mouse.parallaxY += (mouse.targetY * 24 - mouse.parallaxY) * 0.04

      const px = mouse.parallaxX
      const py = mouse.parallaxY

      // ── 1. Cyber-Grid with DPR & Parallax ──
      const gridSize = 64
      const offsetX = ((px * 0.4) % gridSize + gridSize) % gridSize
      const offsetY = ((py * 0.4) % gridSize + gridSize) % gridSize

      ctx.save()
      ctx.lineWidth = 0.5
      ctx.strokeStyle = 'rgba(34, 211, 238, 0.06)' // neon cyan

      // Vertical lines
      for (let x = offsetX - gridSize; x < width + gridSize; x += gridSize) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, height)
        ctx.stroke()
      }

      // Horizontal lines
      for (let y = offsetY - gridSize; y < height + gridSize; y += gridSize) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(width, y)
        ctx.stroke()
      }

      // Dynamic subtle horizon scanning beam
      scanlineY = (scanlineY + 0.8) % (height || 1)
      const scanGrad = ctx.createLinearGradient(0, scanlineY - 40, 0, scanlineY + 40)
      scanGrad.addColorStop(0, 'rgba(168, 85, 247, 0)')
      scanGrad.addColorStop(0.5, 'rgba(34, 211, 238, 0.08)')
      scanGrad.addColorStop(1, 'rgba(168, 85, 247, 0)')
      ctx.fillStyle = scanGrad
      ctx.fillRect(0, scanlineY - 40, width, 80)
      ctx.restore()

      // ── 2. Connecting Lines Between Proximity Particles ──
      const maxDistance = 120
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dist = Math.hypot(dx, dy)

          if (dist < maxDistance) {
            const lineAlpha = (1 - dist / maxDistance) * 0.22
            ctx.save()
            ctx.strokeStyle = `rgba(34, 211, 238, ${lineAlpha})`
            ctx.lineWidth = 0.8
            ctx.beginPath()
            ctx.moveTo(particles[i].x + px * 0.2, particles[i].y + py * 0.2)
            ctx.lineTo(particles[j].x + px * 0.2, particles[j].y + py * 0.2)
            ctx.stroke()
            ctx.restore()
          }
        }
      }

      // ── 3. Dynamic Neon Cyber Particles ──
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]

        if (mouse.active) {
          const mdx = mouse.x - (p.x + px * 0.2)
          const mdy = mouse.y - (p.y + py * 0.2)
          const mdist = Math.hypot(mdx, mdy)
          if (mdist < 140 && mdist > 0.1) {
            const force = (1 - mdist / 140) * 0.7
            p.vx -= (mdx / mdist) * force * 0.4
            p.vy -= (mdy / mdist) * force * 0.4
          }
        }

        p.x += p.vx
        p.y += p.vy

        if (p.x < 0) {
          p.x = 0
          p.vx *= -1
        } else if (p.x > width) {
          p.x = width
          p.vx *= -1
        }

        if (p.y < 0) {
          p.y = 0
          p.vy *= -1
        } else if (p.y > height) {
          p.y = height
          p.vy *= -1
        }

        p.vx *= 0.99
        p.vy *= 0.99
        if (Math.abs(p.vx) < 0.15) p.vx += (Math.random() - 0.5) * 0.08
        if (Math.abs(p.vy) < 0.15) p.vy += (Math.random() - 0.5) * 0.08

        p.pulsePhase += p.pulseSpeed
        const currentAlpha = Math.max(0.15, p.alpha + Math.sin(p.pulsePhase) * 0.2)

        const drawX = p.x + px * 0.2
        const drawY = p.y + py * 0.2

        ctx.save()
        ctx.shadowColor = p.color
        ctx.shadowBlur = 10
        ctx.fillStyle = p.color
        ctx.globalAlpha = currentAlpha
        ctx.beginPath()
        ctx.arc(drawX, drawY, p.radius, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      }

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseleave', handleMouseLeave)
      if (mediaQueryList) {
        try {
          mediaQueryList.removeEventListener('change', handleDprChange)
        } catch {
          // ignore
        }
      }
      if (resizeObserver) {
        resizeObserver.disconnect()
      }
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 z-0 h-full w-full opacity-70"
      aria-hidden="true"
    />
  )
}

export const NeonCanvasBackground = NeonCanvas
export default NeonCanvas
