import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import type { SceneDSL } from '@/types/scene-dsl'
import {
  createRenderer,
  createDefaultScene,
  createDefaultCamera,
  handleResize,
  type RenderBackend,
  type GenScapeRenderer,
} from './RendererFactory'
import { SceneBuilder } from './SceneBuilder'
import { BloomComposer } from './postprocessing/BloomComposer'

export class GenScapeScene {
  scene!: THREE.Scene
  camera!: THREE.PerspectiveCamera
  renderer!: GenScapeRenderer
  controls!: OrbitControls
  backend!: RenderBackend

  private builder!: SceneBuilder
  private bloomComposer!: BloomComposer
  private container!: HTMLElement
  private animationId = 0
  private clock = new THREE.Clock()
  private onRenderCallbacks: Array<(dt: number) => void> = []
  private namedCallbacks = new Map<string, (dt: number) => void>()

  async init(container: HTMLElement): Promise<void> {
    this.container = container

    const { renderer, backend } = await createRenderer(container)
    this.renderer = renderer
    this.backend = backend

    this.scene = createDefaultScene()
    this.builder = new SceneBuilder(this.scene)

    this.camera = createDefaultCamera()

    this.bloomComposer = new BloomComposer()
    this.bloomComposer.init(this.renderer, this.scene, this.camera, backend)

    this.setupControls()
    this.startLoop()
  }

  private setupControls(): void {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    this.controls.enableDamping = true
    this.controls.dampingFactor = 0.08
    this.controls.minDistance = 3
    this.controls.maxDistance = 80
    this.controls.maxPolarAngle = Math.PI / 2 + 0.3
    this.controls.target.set(0, 4, 4)
    this.controls.update()
  }

  loadDSL(dsl: SceneDSL): void {
    this.builder.build(dsl)

    if (dsl.postprocessing?.bloom) {
      this.bloomComposer.configure(dsl.postprocessing.bloom)
    }

    // 粒子更新回调
    this.namedCallbacks.delete('particles')
    if (dsl.particles?.length) {
      const pm = this.builder.getParticleManager()
      this.namedCallbacks.set('particles', (dt) => {
        pm.update(dt, this.builder.getObjectMap())
      })
    }

    const { position, target, fov } = dsl.camera.initial
    this.camera.position.set(position.x, position.y, position.z)
    this.camera.fov = fov
    this.camera.updateProjectionMatrix()
    this.controls.target.set(target.x, target.y, target.z)
    this.controls.update()
  }

  getObject(id: string): THREE.Object3D | undefined {
    return this.builder.getObject(id)
  }

  getObjectMap(): Map<string, THREE.Object3D> {
    return this.builder.getObjectMap()
  }

  onRender(cb: (dt: number) => void): void {
    this.onRenderCallbacks.push(cb)
  }

  private startLoop(): void {
    const animate = () => {
      this.animationId = requestAnimationFrame(animate)

      const dt = Math.min(this.clock.getDelta(), 0.1)
      this.controls.update()

      for (const cb of this.onRenderCallbacks) {
        cb(dt)
      }
      for (const cb of this.namedCallbacks.values()) {
        cb(dt)
      }

      if (this.bloomComposer.isActive) {
        this.bloomComposer.render()
      } else {
        this.renderer.render(this.scene, this.camera)
      }
    }
    animate()
  }

  resize(): void {
    handleResize(this.renderer, this.camera, this.container)
    this.bloomComposer.setSize(this.container.clientWidth, this.container.clientHeight)
  }

  destroy(): void {
    cancelAnimationFrame(this.animationId)
    this.bloomComposer.dispose()
    this.builder.clear()
    this.controls.dispose()
    this.renderer.dispose()
    if (this.renderer.domElement.parentElement) {
      this.renderer.domElement.parentElement.removeChild(this.renderer.domElement)
    }
    this.onRenderCallbacks.length = 0
    this.namedCallbacks.clear()
  }
}
