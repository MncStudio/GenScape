import * as THREE from 'three'
import type { SceneDSL } from '@/types/scene-dsl'

/**
 * WebGPU 渲染器工厂 — 默认使用 WebGPU，不可用时回退 WebGL
 */
export type RenderBackend = 'webgpu' | 'webgl'

export type GenScapeRenderer = THREE.WebGLRenderer | any // WebGPURenderer

export interface RendererInstance {
  renderer: GenScapeRenderer
  backend: RenderBackend
}

let cachedBackend: RenderBackend | null = null

export async function detectBackend(): Promise<RenderBackend> {
  if (cachedBackend) return cachedBackend

  if ('gpu' in navigator) {
    try {
      const adapter = await navigator.gpu.requestAdapter()
      if (adapter) {
        cachedBackend = 'webgpu'
        return 'webgpu'
      }
    } catch {
      // WebGPU 不可用
    }
  }

  cachedBackend = 'webgl'
  return 'webgl'
}

export function isWebGPUAvailable(): boolean {
  return cachedBackend === 'webgpu'
}

export async function createRenderer(
  container: HTMLElement,
): Promise<RendererInstance> {
  const backend = await detectBackend()
  const width = container.clientWidth
  const height = container.clientHeight

  if (backend === 'webgpu') {
    // 动态导入 WebGPU 渲染器
    const { WebGPURenderer } = await import('three/webgpu')
    const renderer = new WebGPURenderer({
      antialias: true,
      alpha: false,
    })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(width, height)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.5

    container.appendChild(renderer.domElement)
    return { renderer, backend: 'webgpu' }
  }

  // WebGL 回退
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: false,
  })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setSize(width, height)
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.2
  renderer.outputColorSpace = THREE.SRGBColorSpace

  container.appendChild(renderer.domElement)
  return { renderer, backend: 'webgl' }
}

export function createDefaultScene(): THREE.Scene {
  const scene = new THREE.Scene()
  scene.background = new THREE.Color('#0a0a1a')
  scene.fog = new THREE.FogExp2('#112244', 0.00015)

  // 默认主体光源 — 用户可手动调整
  const ambient = new THREE.AmbientLight('#4466aa', 0.6)
  ambient.name = 'builtin_ambient'
  scene.add(ambient)

  const keyLight = new THREE.DirectionalLight('#ffffff', 3.0)
  keyLight.position.set(20, 30, 10)
  keyLight.castShadow = true
  keyLight.shadow.mapSize.width = 2048
  keyLight.shadow.mapSize.height = 2048
  keyLight.shadow.camera.near = 0.5
  keyLight.shadow.camera.far = 200
  keyLight.shadow.camera.left = -40
  keyLight.shadow.camera.right = 40
  keyLight.shadow.camera.top = 40
  keyLight.shadow.camera.bottom = -40
  keyLight.shadow.bias = -0.0001
  keyLight.name = 'builtin_key_light'
  scene.add(keyLight)

  const fillLight = new THREE.DirectionalLight('#8899cc', 1.2)
  fillLight.position.set(-15, 10, -10)
  fillLight.name = 'builtin_fill_light'
  scene.add(fillLight)

  return scene
}

export function createDefaultCamera(
  dsl?: SceneDSL,
): THREE.PerspectiveCamera {
  const camera = new THREE.PerspectiveCamera(
    dsl?.camera.initial.fov ?? 55,
    window.innerWidth / window.innerHeight,
    0.1,
    500,
  )

  if (dsl) {
    const { position, target } = dsl.camera.initial
    camera.position.set(position.x, position.y, position.z)
    camera.lookAt(target.x, target.y, target.z)
  } else {
    camera.position.set(15, 12, 15)
    camera.lookAt(0, 4, 4)
  }

  return camera
}

export function handleResize(
  renderer: GenScapeRenderer,
  camera: THREE.PerspectiveCamera,
  container: HTMLElement,
): void {
  const width = container.clientWidth
  const height = container.clientHeight
  renderer.setSize(width, height)
  camera.aspect = width / Math.max(height, 1)
  camera.updateProjectionMatrix()
}
