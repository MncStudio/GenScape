import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import type { CameraAnimationConfig } from '@/types/scene-dsl'

export class CameraAnimator {
  private camera: THREE.PerspectiveCamera
  private controls: OrbitControls
  private config: CameraAnimationConfig | null = null
  private elapsed = 0
  private active = false

  constructor(camera: THREE.PerspectiveCamera, controls: OrbitControls) {
    this.camera = camera
    this.controls = controls
  }

  setConfig(config: CameraAnimationConfig): void {
    this.config = config
    this.elapsed = 0
  }

  start(): void {
    if (!this.config || this.config.type === 'static') return
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

  get currentConfig(): CameraAnimationConfig | null {
    return this.config
  }

  update(dt: number): void {
    if (!this.active || !this.config) return
    this.elapsed += dt

    if (this.config.type === 'orbit') {
      this.updateOrbit()
    } else if (this.config.type === 'flythrough') {
      this.updateFlythrough()
    }
  }

  private updateOrbit(): void {
    const config = this.config!
    const speed = config.speed ?? 0.2
    const radius = config.radius ?? 20
    const height = config.height ?? 12
    const angle = this.elapsed * speed

    this.camera.position.x = Math.cos(angle) * radius
    this.camera.position.z = Math.sin(angle) * radius
    this.camera.position.y = height
    this.camera.lookAt(0, 4, 0)
    this.controls.target.set(0, 4, 0)
  }

  private updateFlythrough(): void {
    const config = this.config!
    const waypoints = config.waypoints ?? []
    if (waypoints.length < 2) return

    const speed = config.speed ?? 0.2
    const totalTime = (waypoints.length - 1) / speed
    const t = (this.elapsed % totalTime) / totalTime
    const floatIndex = t * (waypoints.length - 1)
    const i0 = Math.floor(floatIndex)
    const i1 = Math.min(i0 + 1, waypoints.length - 1)
    const frac = floatIndex - i0

    const p0 = waypoints[i0]
    const p1 = waypoints[i1]
    this.camera.position.set(
      p0.x + (p1.x - p0.x) * frac,
      p0.y + (p1.y - p0.y) * frac,
      p0.z + (p1.z - p0.z) * frac,
    )
    this.camera.lookAt(0, 4, 0)
    this.controls.target.set(0, 4, 0)
  }
}
