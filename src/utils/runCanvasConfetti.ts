import { MOTION } from './motionTokens'

const PARTICLE_COUNT = 150
const DURATION_MS = MOTION.maxDuration * 1000
const GRAVITY = 0.2
const COLORS = ['#4F46E5', '#16A34A', '#F59E0B'] as const

interface Particle {
  x: number
  y: number
  width: number
  height: number
  vx: number
  vy: number
  rotation: number
  rotationSpeed: number
  color: string
}

function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min)
}

function createParticles(): Particle[] {
  const particles: Particle[] = []
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push({
      x: randomBetween(0, window.innerWidth),
      y: randomBetween(-50, -10),
      width: randomBetween(6, 12),
      height: randomBetween(6, 12),
      vx: randomBetween(-2, 2),
      vy: randomBetween(1, 4),
      rotation: randomBetween(0, Math.PI * 2),
      rotationSpeed: randomBetween(-0.1, 0.1),
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    })
  }
  return particles
}

export function runCanvasConfetti(
  canvas: HTMLCanvasElement,
  onComplete?: () => void
): () => void {
  const ctx = canvas.getContext('2d')
  if (!ctx) return () => {}

  const particles = createParticles()
  let animationFrameId = 0
  let startTime: number | null = null
  let prevTimestamp: number | null = null

  const resize = () => {
    const dpr = window.devicePixelRatio || 1
    canvas.width = window.innerWidth * dpr
    canvas.height = window.innerHeight * dpr
  }

  resize()
  window.addEventListener('resize', resize)

  const frame = (timestamp: number) => {
    if (startTime === null) startTime = timestamp
    const elapsed = timestamp - startTime

    if (elapsed >= DURATION_MS) {
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      onComplete?.()
      return
    }

    const deltaMs = prevTimestamp === null ? 16.67 : timestamp - prevTimestamp
    prevTimestamp = timestamp
    const dt = deltaMs / 16.67

    for (const particle of particles) {
      particle.vy += GRAVITY * dt
      particle.x += particle.vx * dt
      particle.y += particle.vy * dt
      particle.rotation += particle.rotationSpeed * dt
    }

    const dpr = window.devicePixelRatio || 1
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    const opacity = 1 - elapsed / DURATION_MS
    ctx.globalAlpha = opacity

    for (const particle of particles) {
      ctx.save()
      ctx.translate(
        particle.x + particle.width / 2,
        particle.y + particle.height / 2
      )
      ctx.rotate(particle.rotation)
      ctx.fillStyle = particle.color
      ctx.fillRect(
        -particle.width / 2,
        -particle.height / 2,
        particle.width,
        particle.height
      )
      ctx.restore()
    }

    ctx.globalAlpha = 1
    animationFrameId = requestAnimationFrame(frame)
  }

  animationFrameId = requestAnimationFrame(frame)

  return () => {
    cancelAnimationFrame(animationFrameId)
    window.removeEventListener('resize', resize)
  }
}
