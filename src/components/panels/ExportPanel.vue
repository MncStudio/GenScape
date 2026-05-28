<template>
  <div class="export-panel">
    <!-- 暂存区 -->
    <div class="section-label">暂存</div>
    <p class="export-desc">保存当前场景，刷新页面后可快速恢复，无需重新生成。</p>

    <div class="stash-actions">
      <el-button class="stash-btn save" @click="handleSave" :disabled="!hasScene">
        <el-icon><FolderChecked /></el-icon>
        保存暂存
      </el-button>
      <el-button class="stash-btn load" @click="handleLoad" :disabled="!hasDraft">
        <el-icon><FolderOpened /></el-icon>
        加载暂存
      </el-button>
      <el-button class="stash-btn clear" @click="handleClear" :disabled="!hasDraft">
        <el-icon><Delete /></el-icon>
        清除暂存
      </el-button>
    </div>

    <div v-if="draftInfo" class="draft-info">
      {{ draftInfo }}
    </div>

    <div class="section-divider"></div>

    <!-- 导出 -->
    <div class="section-label">导出</div>

    <div class="export-actions">
      <el-button class="export-btn" @click="handleExport('json')" :disabled="!hasScene">
        <el-icon><Download /></el-icon>
        下载 JSON
      </el-button>
      <el-button class="export-btn" @click="triggerImport">
        <el-icon><Upload /></el-icon>
        导入 JSON
      </el-button>
      <input
        ref="fileInput"
        type="file"
        accept=".json"
        style="display:none"
        @change="handleImport"
      />
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
import { ElMessage, ElMessageBox } from 'element-plus'
import { FolderChecked, FolderOpened, Delete, Download, Upload, Monitor, PictureFilled } from '@element-plus/icons-vue'

const sceneStore = useSceneStore()
const fileInput = ref<HTMLInputElement | null>(null)

const hasScene = computed(() => sceneStore.status === 'ready')
const hasDraft = computed(() => sceneStore.hasLocalDraft())

interface DraftMeta {
  name: string
  objects: number
  lights: number
  savedAt: string
}

const draftInfo = computed(() => {
  const dsl = sceneStore.loadFromLocal()
  if (!dsl) return ''
  return `暂存: "${dsl.metadata.name}" · ${dsl.objects.length} 物体 · ${dsl.lights.length} 光源`
})

function handleSave() {
  if (sceneStore.saveToLocal()) {
    ElMessage.success('场景已暂存到浏览器')
  } else {
    ElMessage.error('暂存失败')
  }
}

async function handleLoad() {
  const dsl = sceneStore.loadFromLocal()
  if (!dsl) {
    ElMessage.warning('没有可用的暂存')
    return
  }
  try {
    await ElMessageBox.confirm(
      `加载暂存 "${dsl.metadata.name}"？当前场景将被替换。`,
      '确认加载',
      { confirmButtonText: '加载', cancelButtonText: '取消', type: 'info' },
    )
  } catch {
    return
  }

  import('@/composables/useScene').then(({ useScene }) => {
    const s = useScene()
    s.loadDSL(dsl)
    ElMessage.success('暂存已加载')
  })
}

function handleClear() {
  sceneStore.clearLocal()
  ElMessage.success('暂存已清除')
}

function triggerImport() {
  fileInput.value?.click()
}

function handleImport(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = () => {
    try {
      const dsl = JSON.parse(reader.result as string)
      import('@/composables/useScene').then(({ useScene }) => {
        useScene().loadDSL(dsl)
        ElMessage.success(`已导入: ${dsl.metadata?.name ?? '未命名'}`)
      })
    } catch {
      ElMessage.error('JSON 解析失败，请检查文件格式')
    }
  }
  reader.readAsText(file)
  input.value = ''
}

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

.section-label {
  font-size: 10px;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 6px;
}

.section-divider {
  border-top: 1px solid var(--border-default);
  margin: 14px 0 10px;
}

.export-desc {
  color: var(--text-secondary);
  margin-bottom: 10px;
  font-size: 11px;
  line-height: 1.5;
}

.stash-actions {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 8px;
}

.stash-btn {
  justify-content: flex-start;
  width: 100%;
  background: var(--bg-tertiary);
  border-color: var(--border-default);
  color: var(--text-secondary);
  font-size: 12px;
}

.stash-btn:hover:not(:disabled) {
  border-color: var(--border-active);
  color: var(--text-primary);
}

.stash-btn.save:hover:not(:disabled) {
  border-color: var(--accent-primary);
  color: var(--accent-primary);
}

.stash-btn.load:hover:not(:disabled) {
  border-color: #67c23a;
  color: #67c23a;
}

.stash-btn.clear:hover:not(:disabled) {
  border-color: #f56c6c;
  color: #f56c6c;
}

.draft-info {
  font-size: 10px;
  color: var(--text-muted);
  padding: 6px 8px;
  background: var(--bg-tertiary);
  border-radius: 4px;
  margin-bottom: 4px;
  word-break: break-all;
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
  font-size: 12px;
}

.export-btn:hover:not(:disabled) {
  border-color: var(--border-active);
  color: var(--text-primary);
}
</style>
