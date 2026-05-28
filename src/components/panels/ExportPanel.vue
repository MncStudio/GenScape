<template>
  <div class="export-panel">
    <p class="export-desc">将当前场景导出为以下格式：</p>

    <div class="export-actions">
      <el-button class="export-btn" @click="handleExport('json')" :disabled="!hasScene">
        <el-icon><Document /></el-icon>
        JSON 配置
      </el-button>
      <el-button class="export-btn" @click="handleExport('html')" :disabled="!hasScene">
        <el-icon><Monitor /></el-icon>
        独立 HTML
      </el-button>
      <el-button class="export-btn" @click="handleExport('png')" :disabled="!hasScene">
        <el-icon><PictureFilled /></el-icon>
        截图 PNG
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSceneStore } from '@/store/modules/scene.store'
import { ElMessage } from 'element-plus'

const sceneStore = useSceneStore()

const hasScene = computed(() => sceneStore.status === 'ready')

function handleExport(format: string) {
  if (format === 'json' && sceneStore.currentDSL) {
    const blob = new Blob([JSON.stringify(sceneStore.currentDSL, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${sceneStore.currentDSL.metadata.name}.genscape.json`
    a.click()
    URL.revokeObjectURL(url)
    ElMessage.success('JSON 已导出')
  } else {
    ElMessage.info(`${format} 导出功能开发中`)
  }
}
</script>

<style scoped>
.export-panel {
  font-size: 12px;
}

.export-desc {
  color: var(--text-secondary);
  margin-bottom: 12px;
}

.export-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.export-btn {
  justify-content: flex-start;
  width: 100%;
  background: var(--bg-tertiary);
  border-color: var(--border-default);
  color: var(--text-secondary);
}

.export-btn:hover:not(:disabled) {
  border-color: var(--border-active);
  color: var(--text-primary);
}
</style>
