import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { BloomPass } from 'three/examples/jsm/postprocessing/BloomPass.js'
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js'
import type { PostProcessingConfig } from '@/types/scene-dsl'
import type { RenderBackend } from '../RendererFactory'

export class BloomComposer {
  private composer: EffectComposer | null = null
  private bloomPass: BloomPass | null = null
  private enabled = false

  init(
    renderer: THREE.WebGLRenderer,
    scene: THREE.Scene,
    camera: THREE.PerspectiveCamera,
    backend: RenderBackend,
  ): void {
    if (backend !== 'webgl') {
      console.warn('[BloomComposer] WebGPU 后端暂不支持后处理，Bloom 已禁用')
      return
    }

    const size = new THREE.Vector2(renderer.domElement.width, renderer.domElement.height)

    this.composer = new EffectComposer(renderer)
    this.composer.addPass(new RenderPass(scene, camera))

    this.bloomPass = new BloomPass()
    this.bloomPass.renderTargetX = new THREE.WebGLRenderTarget(size.x, size.y)
    this.bloomPass.renderTargetY = new THREE.WebGLRenderTarget(size.x, size.y)
    this.composer.addPass(this.bloomPass)

    const outputPass = new OutputPass()
    this.composer.addPass(outputPass)

    this.enabled = true
  }

  configure(config: PostProcessingConfig['bloom']): void {
    if (!this.bloomPass) return
    this.enabled = config.enabled

    const bp = this.bloomPass as any
    bp.combineUniforms.strength.value = config.strength

    // radius 映射到 blur kernel 的增量
    const increment = config.radius / 256
    bp.convolutionUniforms.uImageIncrement.value.set(increment, increment)
  }

  render(): void {
    if (this.composer && this.enabled) {
      this.composer.render()
    }
  }

  setSize(width: number, height: number): void {
    this.composer?.setSize(width, height)
  }

  dispose(): void {
    this.composer?.dispose()
  }

  get isActive(): boolean {
    return this.enabled && this.composer !== null
  }
}
