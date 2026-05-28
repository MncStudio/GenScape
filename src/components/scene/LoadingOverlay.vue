<template>
  <div class="loading-overlay">
    <div class="hud-loader">
      <div class="hud-loader__ring" />
      <div class="hud-loader__text">{{ loadingText }}</div>
    </div>
    <p class="loading-sub">{{ promptStore.currentPrompt }}</p>
  </div>
</template>

<script setup lang="ts">
import { usePromptStore } from '@/store/modules/prompt.store'

const promptStore = usePromptStore()

const loadingTexts = [
  '正在解析场景描述...',
  '正在增强 Prompt...',
  '正在生成场景结构...',
  '正在布置灯光...',
  '正在创建粒子效果...',
  '即将完成...',
]

const loadingText = ref(loadingTexts[0])
let index = 0

const timer = setInterval(() => {
  index = (index + 1) % loadingTexts.length
  loadingText.value = loadingTexts[index]
}, 2000)

onUnmounted(() => {
  clearInterval(timer)
})
</script>

<style scoped>
.loading-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(16px);
  z-index: 10;
}

.loading-sub {
  font-size: 13px;
  color: var(--text-muted);
  max-width: 400px;
  text-align: center;
}
</style>
