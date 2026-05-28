import type { SceneDSL, IndustrialObject, LightConfig } from '@/types/scene-dsl'
import { DeepSeekProvider } from './providers/DeepSeekProvider'
import { ClaudeProvider } from './providers/ClaudeProvider'
import { PROMPT_ENHANCER_SYSTEM } from './prompts/enhancer'
import { SCENE_GENERATOR_SYSTEM, buildSceneGenerationPrompt } from './prompts/sceneGenerator'
import { validateAndFixSceneDSL } from './responseValidator'

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface ChatResponse {
  content: string
  truncated?: boolean
  usage?: {
    promptTokens: number
    completionTokens: number
  }
}

export interface AIProvider {
  readonly name: string
  chat(messages: ChatMessage[], options?: {
    temperature?: number
    maxTokens?: number
  }): Promise<ChatResponse>
  chatStream(messages: ChatMessage[], onChunk: (chunk: string) => void, options?: {
    temperature?: number
    maxTokens?: number
  }): Promise<ChatResponse>
}

export type AIProviderType = 'deepseek' | 'claude'

export class AIService {
  private provider: AIProvider

  constructor(type?: AIProviderType) {
    const t = type ?? (import.meta.env.VITE_AI_PROVIDER as AIProviderType) ?? 'deepseek'
    this.provider = t === 'claude' ? new ClaudeProvider() : new DeepSeekProvider()
  }

  setProvider(type: AIProviderType): void {
    this.provider = type === 'claude' ? new ClaudeProvider() : new DeepSeekProvider()
  }

  getProviderName(): string {
    return this.provider.name
  }

  async enhancePrompt(userPrompt: string): Promise<string> {
    const response = await this.provider.chat([
      { role: 'system', content: PROMPT_ENHANCER_SYSTEM },
      { role: 'user', content: userPrompt },
    ], { temperature: 0.7, maxTokens: 1024 })

    return response.content
  }

  async generateSceneDSL(enhancedPrompt: string): Promise<SceneDSL> {
    const userMessage = buildSceneGenerationPrompt(enhancedPrompt)

    const response = await this.provider.chat([
      { role: 'system', content: SCENE_GENERATOR_SYSTEM },
      { role: 'user', content: userMessage },
    ], { temperature: 0.5, maxTokens: 16384 })

    if (response.truncated) {
      console.warn('[AIService] AI 返回被截断 (finish_reason=length)，将尝试修复 JSON')
    }

    return validateAndFixSceneDSL(response.content, enhancedPrompt)
  }

  async modifyObject(current: IndustrialObject, instruction: string): Promise<IndustrialObject> {
    const systemPrompt = `你是一个 Three.js 3D 场景编辑器。根据用户的修改指令，修改给出的物体 JSON。
只输出修改后的完整物体 JSON 对象，不要任何额外文本，不要 markdown 包裹。

物体类型对应的参数：
- storage_tank: {radius, height, roofType: "dome"}
- pipe_segment: {radius, path: Vec3[], hasValve}
- platform: {width, depth, height, hasRailing}
- building: {width, depth, height, floors}
- cooling_tower: {baseRadius, topRadius, height}

material: {color(hex), metalness(0-1), roughness(0-1)}
position/rotation: {x, y, z}`

    const response = await this.provider.chat([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `当前物体：\n${JSON.stringify(current, null, 2)}\n\n修改指令：${instruction}` },
    ], { temperature: 0.3, maxTokens: 2048 })

    return this.parseObjectResponse(response.content, current)
  }

  async modifyLight(current: LightConfig, instruction: string): Promise<LightConfig> {
    const systemPrompt = `你是一个 Three.js 灯光编辑器。根据用户的修改指令，修改给出的灯光 JSON。
只输出修改后的完整灯光 JSON 对象，不要任何额外文本，不要 markdown 包裹。

灯光类型与参数：
- ambient: {color(hex), intensity}
- directional: {color, intensity, position: {x,y,z}, castShadow}
- point: {color, intensity, distance, decay, position: {x,y,z}}
- spot: {color, intensity, distance, angle, penumbra, position: {x,y,z}, castShadow}
- hemisphere: {color, intensity}
- rect: {color, intensity, position: {x,y,z}}`

    const response = await this.provider.chat([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `当前灯光：\n${JSON.stringify(current, null, 2)}\n\n修改指令：${instruction}` },
    ], { temperature: 0.3, maxTokens: 2048 })

    return this.parseLightResponse(response.content, current)
  }

  private parseObjectResponse(raw: string, fallback: IndustrialObject): IndustrialObject {
    try {
      const match = raw.match(/```(?:json)?\s*([\s\S]*?)```/)
      const json = match ? match[1].trim() : raw.trim()
      const parsed = JSON.parse(json)
      return {
        id: fallback.id,
        type: parsed.type ?? fallback.type,
        position: parsed.position ?? fallback.position,
        rotation: parsed.rotation ?? fallback.rotation,
        params: parsed.params ?? fallback.params,
        material: parsed.material ?? fallback.material,
        label: parsed.label ?? fallback.label,
      }
    } catch {
      console.warn('[AIService] 物体修改响应解析失败，使用原值')
      return fallback
    }
  }

  private parseLightResponse(raw: string, fallback: LightConfig): LightConfig {
    try {
      const match = raw.match(/```(?:json)?\s*([\s\S]*?)```/)
      const json = match ? match[1].trim() : raw.trim()
      return JSON.parse(json) as LightConfig
    } catch {
      console.warn('[AIService] 灯光修改响应解析失败，使用原值')
      return fallback
    }
  }

  async generateSceneStream(
    userPrompt: string,
    onStep: (step: 'enhancing' | 'generating', content: string) => void,
  ): Promise<SceneDSL> {
    // Step 1: 增强 Prompt
    onStep('enhancing', '')
    const enhanced = await this.enhancePrompt(userPrompt)
    onStep('enhancing', enhanced)

    // Step 2: 生成 Scene DSL
    onStep('generating', '')
    const dsl = await this.generateSceneDSL(enhanced)
    onStep('generating', JSON.stringify(dsl, null, 2))

    return dsl
  }
}
