import * as THREE from 'three'
import type { ParticleConfig, Vec3 } from '@/types/scene-dsl'

interface Particle {
  progress: number
  life: number
  maxLife: number
}

export class ParticleEmitter {
  readonly id: string
  readonly type: string
  points: THREE.Points
  private particles: Particle[]
  private config: ParticleConfig
  private material: THREE.ShaderMaterial
  private path: THREE.CatmullRomCurve3 | null = null

  constructor(config: ParticleConfig, objectMap: Map<string, THREE.Object3D>) {
    this.id = config.id
    this.type = config.emitterType
    this.config = config
    this.particles = []

    const count = Math.min(config.count, 5000)
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    const sizes = new Float32Array(count)

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

      sizes[i] = config.size * (0.5 + Math.random())
    }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1))

    const blending = config.blending === 'additive' ? THREE.AdditiveBlending : THREE.NormalBlending

    this.material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
      },
      vertexShader: /* glsl */ `
        attribute float size;
        varying vec3 vColor;
        void main() {
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = size * (200.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
          vColor = color;
        }
      `,
      fragmentShader: /* glsl */ `
        varying vec3 vColor;
        void main() {
          float d = length(gl_PointCoord - 0.5) * 2.0;
          float alpha = 1.0 - smoothstep(0.0, 1.0, d);
          if (alpha < 0.02) discard;
          gl_FragColor = vec4(vColor, alpha);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending,
      vertexColors: true,
    })

    this.points = new THREE.Points(geo, this.material)
    this.points.name = `emitter_${config.id}`
    this.points.renderOrder = 999
  }

  private resolvePath(pathId: string, objectMap: Map<string, THREE.Object3D>): THREE.CatmullRomCurve3 | null {
    // 尝试从已知管道对象获取路径
    const obj = objectMap.get(pathId)
    if (obj) {
      // 管道路径可以从 userData 或子 mesh 推断
      const positions: THREE.Vector3[] = []
      obj.traverse(child => {
        if (child instanceof THREE.Mesh && child.geometry.type === 'TubeGeometry') {
          const tubeGeo = child.geometry as THREE.TubeGeometry
          const path = tubeGeo.parameters?.path
          if (path) return path
        }
      })
    }

    // 从 config 的 path 点位构建
    const path = (this.config as any)._path
    if (path && Array.isArray(path)) {
      const pts = path.map((p: Vec3) => new THREE.Vector3(p.x, p.y, p.z))
      if (pts.length >= 2) return new THREE.CatmullRomCurve3(pts)
    }

    // 默认：直线
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

    // 默认：随机散布
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

    // 如果有 originId，动态跟踪物体位置
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
    this.material.uniforms.uTime.value += dt
  }

  dispose(): void {
    this.points.geometry.dispose()
    this.material.dispose()
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
