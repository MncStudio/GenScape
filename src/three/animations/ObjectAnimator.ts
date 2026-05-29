import * as THREE from 'three'
import type { AnimationConfig } from '@/types/scene-dsl'

export class ObjectAnimator {
  private configs: AnimationConfig[] = []
  private objectMap: Map<string, THREE.Object3D> = new Map()
  private elapsed = 0
  private active = false

  setAnimations(anims: AnimationConfig[]): void {
    this.configs = anims
    this.elapsed = 0
  }

  setObjectMap(map: Map<string, THREE.Object3D>): void {
    this.objectMap = map
  }

  start(): void {
    if (this.configs.length === 0) return
    this.active = true
  }

  stop(): void {
    this.active = false
  }

  toggle(): void {
    if (this.active) {
      this.stop()
    } else {
      this.start()
    }
  }

  get isActive(): boolean {
    return this.active
  }

  get animationConfigs(): AnimationConfig[] {
    return this.configs
  }

  update(dt: number): void {
    if (!this.active) return
    this.elapsed += dt

    for (const anim of this.configs) {
      // 检查 duration（0 或 undefined 表示无限循环）
      if (anim.duration > 0 && this.elapsed > anim.duration) {
        if (!anim.loop) continue
        // 循环：重置 elapsed 对当前动画的影响
      }

      const obj = this.objectMap.get(anim.targetId)
      if (!obj) continue

      const p = anim.params

      switch (anim.type) {
        case 'rotate': {
          const ax = p.ax ?? p.axisX ?? p.axis_x ?? 0
          const ay = p.ay ?? p.axisY ?? p.axis_y ?? 1
          const az = p.az ?? p.axisZ ?? p.axis_z ?? 0
          const speed = p.speed ?? 0.5
          obj.rotation.x += ax * speed * dt
          obj.rotation.y += ay * speed * dt
          obj.rotation.z += az * speed * dt
          break
        }
        case 'translate': {
          const dx = p.dx ?? p.dirX ?? p.direction_x ?? 0
          const dy = p.dy ?? p.dirY ?? p.direction_y ?? 1
          const dz = p.dz ?? p.dirZ ?? p.direction_z ?? 0
          const distance = p.distance ?? 1
          const freq = p.frequency ?? p.speed ?? 1.0
          const offset = Math.sin(this.elapsed * freq * Math.PI * 2) * distance

          const baseKey = `_animBase_${anim.id}`
          if (!obj.userData[baseKey]) {
            obj.userData[baseKey] = obj.position.clone()
          }
          const base = obj.userData[baseKey] as THREE.Vector3
          obj.position.x = base.x + dx * offset
          obj.position.y = base.y + dy * offset
          obj.position.z = base.z + dz * offset
          break
        }
        case 'scale': {
          const sx = p.sx ?? p.scaleX ?? p.scale_x ?? 1
          const sy = p.sy ?? p.scaleY ?? p.scale_y ?? 1
          const sz = p.sz ?? p.scaleZ ?? p.scale_z ?? 1
          const freq = p.frequency ?? p.speed ?? 1.0
          const t = (Math.sin(this.elapsed * freq * Math.PI * 2) + 1) / 2 // 0..1
          obj.scale.x = 1 + (sx - 1) * t
          obj.scale.y = 1 + (sy - 1) * t
          obj.scale.z = 1 + (sz - 1) * t
          break
        }
        case 'pulse': {
          const intensity = p.intensity ?? 0.1
          const freq = p.frequency ?? p.speed ?? 2.0
          const s = 1 + Math.sin(this.elapsed * freq * Math.PI * 2) * intensity
          obj.scale.setScalar(s)
          break
        }
      }
    }

    // 对循环动画统一处理：如果 elapsed 超过最大 duration，重置
    const maxDuration = Math.max(...this.configs.map(a => a.duration).filter(d => d > 0), 0)
    if (maxDuration > 0 && this.elapsed > maxDuration) {
      const hasLooping = this.configs.some(a => a.duration > 0 && a.loop)
      if (hasLooping) {
        this.elapsed = this.elapsed % maxDuration
      }
    }
  }
}
