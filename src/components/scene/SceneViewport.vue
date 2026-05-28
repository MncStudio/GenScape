<template>
  <div ref="containerRef" class="scene-viewport">
    <LoadingOverlay v-if="sceneStore.status === 'generating'" />

    <div class="viewport-info">
      <span class="info-item">
        <span class="status-dot" :class="statusDotClass" />
        {{ backendLabel }}
      </span>
      <span class="info-item">{{ sceneStore.objectCount }} 物体</span>
      <span class="info-item">{{ sceneStore.fps }} FPS</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSceneStore } from '@/store/modules/scene.store'
import { useScene } from '@/composables/useScene'
import LoadingOverlay from './LoadingOverlay.vue'

const sceneStore = useSceneStore()
const { init, resize, getInstance } = useScene()

const containerRef = ref<HTMLElement | null>(null)

const statusDotClass = computed(() => {
  switch (sceneStore.status) {
    case 'ready': return 'status-dot--online'
    case 'generating': return 'status-dot--generating'
    case 'error': return 'status-dot--error'
    default: return ''
  }
})

const backendLabel = computed(() => {
  return sceneStore.backend === 'webgpu' ? 'WebGPU' : 'WebGL'
})

onMounted(async () => {
  if (containerRef.value) {
    await init(containerRef.value)
  }

  const observer = new ResizeObserver(() => {
    resize()
  })
  if (containerRef.value) {
    observer.observe(containerRef.value)
  }

  onUnmounted(() => {
    observer.disconnect()
  })
})
</script>

<style scoped>
.scene-viewport {
  width: 100%;
  height: 100%;
  position: relative;
}

.scene-viewport canvas {
  display: block;
}

.viewport-info {
  position: absolute;
  bottom: 12px;
  right: 16px;
  display: flex;
  gap: 16px;
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--text-muted);
  pointer-events: none;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 4px;
}
</style>
