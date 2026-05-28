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
    this.controls.target.set(0, 4, 0)
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

  private highlightedId: string | null = null
  private highlightBackup = new Map<string, { emissive?: string; emissiveIntensity?: number }>()

  highlightObject(id: string | null): void {
    // 恢复上一个高亮
    if (this.highlightedId) {
      const prev = this.getObject(this.highlightedId)
      if (prev) {
        const backup = this.highlightBackup.get(this.highlightedId)
        prev.traverse(child => {
          if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
            if (backup) {
              child.material.emissive.set(backup.emissive ?? '#000000')
              child.material.emissiveIntensity = backup.emissiveIntensity ?? 0
            } else {
              child.material.emissive.set('#000000')
              child.material.emissiveIntensity = 0
            }
          }
        })
      }
      this.highlightBackup.delete(this.highlightedId)
      this.highlightedId = null
    }

    if (!id) return

    const obj = this.getObject(id)
    if (!obj) return

    // 备份并应用高亮
    this.highlightedId = id
    let backup: { emissive?: string; emissiveIntensity?: number } = {}
    obj.traverse(child => {
      if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
        backup = {
          emissive: '#' + child.material.emissive.getHexString(),
          emissiveIntensity: child.material.emissiveIntensity,
        }
        child.material.emissive.set('#00d4ff')
        child.material.emissiveIntensity = 0.6
      }
    })
    this.highlightBackup.set(id, backup)
  }

  getBuiltinLights(): { ambient: THREE.AmbientLight | null; key: THREE.DirectionalLight | null; fill: THREE.DirectionalLight | null } {
    const ambient = this.scene.getObjectByName('builtin_ambient') as THREE.AmbientLight | null
    const key = this.scene.getObjectByName('builtin_key_light') as THREE.DirectionalLight | null
    const fill = this.scene.getObjectByName('builtin_fill_light') as THREE.DirectionalLight | null
    return { ambient, key, fill }
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
