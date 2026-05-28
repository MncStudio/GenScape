import { AIService, type AIProviderType } from '@/ai/AIService'
import { usePromptStore } from '@/store/modules/prompt.store'
import { useSceneStore } from '@/store/modules/scene.store'
import { useScene } from './useScene'
import type { SceneDSL, IndustrialObject, LightConfig } from '@/types/scene-dsl'

let aiService: AIService | null = null

export function useAI() {
  const promptStore = usePromptStore()
  const sceneStore = useSceneStore()
  const { loadDSL } = useScene()

  function getService(): AIService {
    if (!aiService) {
      aiService = new AIService()
    }
    return aiService
  }

  function setProvider(type: AIProviderType): void {
    aiService = new AIService(type)
  }

  async function generate(userPrompt: string): Promise<SceneDSL> {
    promptStore.setPrompt(userPrompt)
    promptStore.setEnhancing(true)
    sceneStore.setStatus('generating')

    try {
      const service = getService()
      const dsl = await service.generateSceneStream(
        userPrompt,
        (step, content) => {
          if (step === 'enhancing') {
            promptStore.setEnhancedPrompt(content)
            promptStore.setEnhancing(false)
            promptStore.setGenerating(true)
          } else if (step === 'generating') {
            promptStore.setGenerating(false)
          }
        },
      )

      loadDSL(dsl)
      promptStore.addToHistory(userPrompt, promptStore.enhancedPrompt)
      return dsl
    } catch (err) {
      sceneStore.setStatus('error')
      throw err
    }
  }

  async function modifyObject(current: IndustrialObject, instruction: string): Promise<IndustrialObject> {
    const service = getService()
    const result = await service.modifyObject(current, instruction)
    sceneStore.updateObjectInDSL(current.id, result)
    // 重建场景
    if (sceneStore.currentDSL) {
      loadDSL(sceneStore.currentDSL)
    }
    return result
  }

  async function modifyLight(current: LightConfig, instruction: string): Promise<LightConfig> {
    const service = getService()
    const result = await service.modifyLight(current, instruction)
    sceneStore.updateLightInDSL(current.id, result)
    // 重建场景
    if (sceneStore.currentDSL) {
      loadDSL(sceneStore.currentDSL)
    }
    return result
  }

  return { generate, modifyObject, modifyLight, setProvider, getService }
}
