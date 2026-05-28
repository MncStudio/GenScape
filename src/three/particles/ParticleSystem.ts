import * as THREE from 'three'
import type { ParticleConfig, Vec3 } from '@/types/scene-dsl'

interface Particle {
  progress: number
  life: number
  maxLife: number
}

let cachedCircleTexture: THREE.Texture | null = null

function getCircleTexture(): THREE.Texture {
  if (cachedCircleTexture) return cachedCircleTexture

  const size = 64
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!
  const half = size / 2
  const gradient = ctx.createRadialGradient(half, half, 0, half, half, half)
  gradient.addColorStop(0, 'rgba(255,255,255,1)')
  gradient.addColorStop(0.15, 'rgba(255,255,255,0.9)')
  gradient.addColorStop(0.4, 'rgba(255,255,255,0.4)')
  gradient.addColorStop(0.7, 'rgba(255,255,255,0.05)')
  gradient.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, size, size)

  cachedCircleTexture = new THREE.CanvasTexture(canvas)
  cachedCircleTexture.needsUpdate = true
  return cachedCircleTexture
}

export class ParticleEmitter {
  readonly id: string
  readonly type: string
  points: THREE.Points
  private particles: Particle[]
  private config: ParticleConfig
  private path: THREE.CatmullRomCurve3 | null = null

  constructor(config: ParticleConfig, objectMap: Map<string, THREE.Object3D>) {
    this.id = config.id
    this.type = config.emitterType
    this.config = config
    this.particles = []

    const count = Math.min(config.count, 5000)
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)

    const baseColor = new THREE.Color(config.color)

    if (config.emitterType === 'pipe_flow' && config.pathId) {
      this.path = this.resolvePath(config.pathId, objectMap)
    }

    for (let i = 0; i < count; i++) {
      const p = this.initParticle(i, count)
      this.particles.push(p)

      const pos = this.getParticlePosition(p)
      positions[i * 3] = pos[0]
      positions[i * 3 + 1] = pos[1]
      positions[i * 3 + 2] = pos[2]

      const alpha = config.opacity ?? 0.8
      colors[i * 3] = baseColor.r * alpha
      colors[i * 3 + 1] = baseColor.g * alpha
      colors[i * 3 + 2] = baseColor.b * alpha
    }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))

    const blending = config.blending === 'additive' ? THREE.AdditiveBlending : THREE.NormalBlending

    const material = new THREE.PointsMaterial({
      size: config.size * 0.15,
      map: getCircleTexture(),
      blending,
      depthWrite: false,
      transparent: true,
      vertexColors: true,
      sizeAttenuation: true,
    })

    this.points = new THREE.Points(geo, material)
    this.points.name = `emitter_${config.id}`
    this.points.renderOrder = 999
  }

  private resolvePath(pathId: string, objectMap: Map<string, THREE.Object3D>): THREE.CatmullRomCurve3 | null {
    const obj = objectMap.get(pathId)
    if (obj) {
      obj.traverse(child => {
        if (child instanceof THREE.Mesh && child.geometry.type === 'TubeGeometry') {
          const tubeGeo = child.geometry as THREE.TubeGeometry
          const path = tubeGeo.parameters?.path
          if (path) return path
        }
      })
    }

    const path = (this.config as any)._path
    if (path && Array.isArray(path)) {
      const pts = path.map((p: Vec3) => new THREE.Vector3(p.x, p.y, p.z))
      if (pts.length >= 2) return new THREE.CatmullRomCurve3(pts)
    }

    return new THREE.CatmullRomCurve3([
      new THREE.Vector3(-5, 0.5, 0),
      new THREE.Vector3(5, 0.5, 0),
    ])
  }

  private initParticle(i: number, total: number): Particle {
    return {
      progress: Math.random(),
      life: Math.random() * this.config.lifetime,
      maxLife: this.config.lifetime,
    }
  }

  private getParticlePosition(p: Particle): [number, number, number] {
    if (this.config.emitterType === 'indicator') {
      const origin = this.config.originId
        ? new THREE.Vector3(0, 2, 0)
        : new THREE.Vector3(
          this.config.offset?.x ?? 0,
          this.config.offset?.y ?? 0,
          this.config.offset?.z ?? 0,
        )
      const r = (this.config.spread ?? 1.0) * (0.5 + Math.random() * 0.5)
      const angle = p.progress * Math.PI * 2 + Math.random() * 0.5
      return [
        origin.x + Math.cos(angle) * r,
        origin.y + Math.sin(p.progress * Math.PI * 4) * r * 0.3,
        origin.z + Math.sin(angle) * r,
      ]
    }

    if (this.path) {
      const pt = this.path.getPointAt(p.progress % 1)
      const spread = (this.config.spread ?? 0.05) * (Math.random() - 0.5)
      return [pt.x + spread, pt.y + spread, pt.z + spread]
    }

    return [
      (Math.random() - 0.5) * 10,
      Math.random() * 5,
      (Math.random() - 0.5) * 10,
    ]
  }

  update(dt: number, objectMap: Map<string, THREE.Object3D>): void {
    const posArr = this.points.geometry.attributes.position.array as Float32Array
    const count = this.particles.length
    const speed = this.config.speed

    let originPos = new THREE.Vector3(0, 0, 0)
    if (this.config.emitterType === 'indicator' && this.config.originId) {
      const originObj = objectMap.get(this.config.originId)
      if (originObj) {
        originPos.copy(originObj.position)
        if (this.config.offset) {
          originPos.x += this.config.offset.x ?? 0
          originPos.y += this.config.offset.y ?? 0
          originPos.z += this.config.offset.z ?? 0
        }
      }
    }

    for (let i = 0; i < count; i++) {
      const p = this.particles[i]
      p.progress += speed * dt * (0.8 + Math.random() * 0.4)
      if (p.progress > 1) p.progress -= 1
      p.life -= dt
      if (p.life <= 0) p.life = p.maxLife

      let px: number, py: number, pz: number

      if (this.config.emitterType === 'indicator' && this.config.originId) {
        const r = (this.config.spread ?? 1.0) * (0.5 + Math.random() * 0.5)
        const angle = p.progress * Math.PI * 2
        px = originPos.x + Math.cos(angle) * r
        py = originPos.y + Math.sin(p.progress * Math.PI * 4) * r * 0.3
        pz = originPos.z + Math.sin(angle) * r
      } else if (this.path) {
        const pt = this.path.getPointAt(p.progress % 1)
        const spread = (this.config.spread ?? 0.05) * (Math.random() - 0.5)
        px = pt.x + spread
        py = pt.y + spread
        pz = pt.z + spread
      } else {
        px = (Math.random() - 0.5) * 10
        py = Math.random() * 5
        pz = (Math.random() - 0.5) * 10
      }

      posArr[i * 3] = px
      posArr[i * 3 + 1] = py
      posArr[i * 3 + 2] = pz
    }

    this.points.geometry.attributes.position.needsUpdate = true
  }

  dispose(): void {
    this.points.geometry.dispose()
    ;(this.points.material as THREE.Material).dispose()
  }
}

export class ParticleManager {
  private emitters: Map<string, ParticleEmitter> = new Map()

  createEmitter(config: ParticleConfig, objectMap: Map<string, THREE.Object3D>): ParticleEmitter | null {
    if (this.emitters.has(config.id)) return this.emitters.get(config.id)!

    const emitter = new ParticleEmitter(config, objectMap)
    this.emitters.set(config.id, emitter)
    return emitter
  }

  update(dt: number, objectMap: Map<string, THREE.Object3D>): void {
    for (const emitter of this.emitters.values()) {
      emitter.update(dt, objectMap)
    }
  }

  getEmitter(id: string): ParticleEmitter | undefined {
    return this.emitters.get(id)
  }

  clear(): void {
    for (const emitter of this.emitters.values()) {
      emitter.dispose()
    }
    this.emitters.clear()
  }

  get allEmitters(): ParticleEmitter[] {
    return [...this.emitters.values()]
  }
}
