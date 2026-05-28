// ============================================================
// GenScape Scene DSL — AI 与 Three.js 之间的场景描述协议
// ============================================================

export interface SceneDSL {
  version: string
  metadata: SceneMetadata
  scene: SceneConfig
  objects: IndustrialObject[]
  lights: LightConfig[]
  particles: ParticleConfig[]
  labels?: LabelConfig[]
  camera: CameraConfig
  postprocessing: PostProcessingConfig
  animations?: AnimationConfig[]
}

export interface SceneMetadata {
  name: string
  prompt: string
  generatedAt: string
  generator: 'deepseek-chat' | 'claude-sonnet-4-6'
  enhancedPrompt?: string
}

// ---- 场景环境 ----
export interface SceneConfig {
  background: { type: 'color' | 'sky'; value: string }
  fog?: FogConfig
  ground?: GroundConfig
  skybox?: string
}

export interface FogConfig {
  type: 'exp2' | 'linear'
  color: string
  density?: number
  near?: number
  far?: number
}

export interface GroundConfig {
  type: 'plane' | 'grid'
  size: number
  color: string
}

// ---- 工业物体 ----
export type ObjectType =
  | 'storage_tank'
  | 'horizontal_tank'
  | 'pipe_segment'
  | 'platform'
  | 'building'
  | 'pipe_rack'
  | 'flare_stack'
  | 'cooling_tower'
  | 'heat_exchanger'
  | 'pump'
  | 'valve_group'

export interface IndustrialObject {
  id: string
  type: ObjectType
  position: Vec3
  rotation: Vec3
  scale?: Vec3
  params: Record<string, number | string | boolean>
  material: PBRMaterial
  label?: LabelConfig
  children?: IndustrialObject[]
  metadata?: Record<string, string>
}

// ---- 材质 ----
export interface PBRMaterial {
  color: string
  metalness?: number
  roughness?: number
  emissive?: string
  emissiveIntensity?: number
  opacity?: number
  transparent?: boolean
  wireframe?: boolean
  side?: number  // THREE.FrontSide=0, BackSide=1, DoubleSide=2
}

// ---- 灯光 ----
export type LightType = 'ambient' | 'hemisphere' | 'directional' | 'point' | 'spot' | 'rect'

export interface LightConfig {
  id: string
  type: LightType
  position?: Vec3
  target?: Vec3
  color: string
  intensity: number
  distance?: number
  angle?: number
  penumbra?: number
  decay?: number
  castShadow?: boolean
  shadowMapSize?: number
}

// ---- 粒子 ----
export type EmitterType = 'pipe_flow' | 'steam' | 'spark' | 'indicator' | 'ambient_dust'

export interface ParticleConfig {
  id: string
  emitterType: EmitterType
  pathId?: string
  originId?: string
  offset?: Vec3
  count: number
  color: string
  size: number
  speed: number
  lifetime: number
  spread?: number
  opacity: number
  blending?: 'normal' | 'additive'
}

// ---- 标签 ----
export interface LabelConfig {
  text: string
  position: 'top' | 'center' | 'custom'
  offset?: Vec3
  fontSize?: number
  color?: string
  backgroundColor?: string
}

// ---- 相机 ----
export interface CameraConfig {
  initial: {
    position: Vec3
    target: Vec3
    fov: number
  }
  animation?: CameraAnimationConfig
}

export interface CameraAnimationConfig {
  type: 'orbit' | 'flythrough' | 'static'
  speed?: number
  radius?: number
  height?: number
  waypoints?: Vec3[]
  autoStart: boolean
}

// ---- 后期处理 ----
export interface PostProcessingConfig {
  bloom: { enabled: boolean; threshold: number; strength: number; radius: number }
  sao: { enabled: boolean }
  fxaa?: { enabled: boolean }
  afterimage?: { enabled: boolean; damp: number }
}

// ---- 动画 ----
export interface AnimationConfig {
  id: string
  targetId: string
  type: 'rotate' | 'translate' | 'scale' | 'pulse'
  params: Record<string, number>
  duration: number
  loop: boolean
}

// ---- 基础类型 ----
export interface Vec3 {
  x: number
  y: number
  z: number
}

// ---- 场景图节点（用于 UI 展示） ----
export interface SceneGraphNode {
  id: string
  name: string
  type: string
  children: SceneGraphNode[]
  visible: boolean
  locked: boolean
}
