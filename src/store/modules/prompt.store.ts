import { defineStore } from 'pinia'

export const usePromptStore = defineStore('prompt', () => {
  const currentPrompt = ref('')
  const enhancedPrompt = ref('')
  const history = ref<Array<{ prompt: string; enhanced: string; timestamp: string }>>([])
  const isEnhancing = ref(false)
  const isGenerating = ref(false)

  const presetPrompts = [
    '一个化工厂夜景，有储罐、管道、蓝色灯光、流动粒子效果',
    '一个白天的变电站场景，有变压器、输电线塔、围栏',
    '一个智慧园区，有现代建筑、绿化带、道路和路灯',
    '一个炼油厂，有蒸馏塔、换热器、管道网络、蒸汽',
    '一个港口码头，有集装箱、龙门吊、货轮、海水',
  ]

  function setPrompt(p: string) {
    currentPrompt.value = p
  }

  function setEnhancedPrompt(p: string) {
    enhancedPrompt.value = p
  }

  function addToHistory(prompt: string, enhanced: string) {
    history.value.unshift({
      prompt,
      enhanced,
      timestamp: new Date().toISOString(),
    })
    // 保留最近 20 条
    if (history.value.length > 20) {
      history.value.pop()
    }
  }

  function setEnhancing(v: boolean) {
    isEnhancing.value = v
  }

  function setGenerating(v: boolean) {
    isGenerating.value = v
  }

  function reset() {
    currentPrompt.value = ''
    enhancedPrompt.value = ''
    isEnhancing.value = false
    isGenerating.value = false
  }

  return {
    currentPrompt, enhancedPrompt, history, isEnhancing, isGenerating, presetPrompts,
    setPrompt, setEnhancedPrompt, addToHistory, setEnhancing, setGenerating, reset,
  }
})
