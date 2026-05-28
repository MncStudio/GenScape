<template>
  <footer class="status-bar">
    <div class="status-left">
      <span class="status-item">
        <span class="status-dot" :class="statusDotClass" />
        {{ sceneStore.status === 'idle' ? '就绪' : sceneStore.status === 'generating' ? '生成中' : sceneStore.status === 'ready' ? '运行中' : '错误' }}
      </span>
      <span class="status-item">{{ sceneStore.backend.toUpperCase() }}</span>
    </div>

    <div class="status-center">
      <span v-if="sceneStore.currentDSL" class="status-item">
        {{ sceneStore.currentDSL.metadata.name }}
      </span>
    </div>

    <div class="status-right">
      <span class="status-item">物体: {{ sceneStore.objectCount }}</span>
      <span class="status-item">顶点: {{ formatNumber(sceneStore.vertexCount) }}</span>
      <span class="status-item">{{ sceneStore.fps }} FPS</span>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { useSceneStore } from '@/store/modules/scene.store'

const sceneStore = useSceneStore()

const statusDotClass = computed(() => {
  switch (sceneStore.status) {
    case 'ready': return 'status-dot--online'
    case 'generating': return 'status-dot--generating'
    case 'error': return 'status-dot--error'
    default: return ''
  }
})

function formatNumber(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
  return String(n)
}
</script>

<style scoped>
.status-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 28px;
  padding: 0 12px;
  background: var(--bg-secondary);
  border-top: 1px solid var(--border-default);
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--text-muted);
  flex-shrink: 0;
  z-index: 100;
}

.status-left, .status-center, .status-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 4px;
}
</style>
