<template>
  <div class="entity-panel">
    <!-- 标签切换 -->
    <div class="tab-bar">
      <button :class="['tab', { active: activeTab === 'objects' }]" @click="activeTab = 'objects'">
        物体 ({{ sceneStore.currentDSL?.objects.length ?? 0 }})
      </button>
      <button :class="['tab', { active: activeTab === 'lights' }]" @click="activeTab = 'lights'">
        光源 ({{ sceneStore.currentDSL?.lights.length ?? 0 }})
      </button>
    </div>

    <!-- 物体列表 -->
    <div v-if="activeTab === 'objects'" class="list-wrap">
      <div v-if="!sceneStore.currentDSL?.objects.length" class="empty-state">
        暂无物体
      </div>
      <div
        v-for="obj in sceneStore.currentDSL?.objects ?? []"
        :key="obj.id"
        :class="['list-item', { selected: sceneStore.selectedObjectId === obj.id }]"
        @click="selectObj(obj)"
      >
        <span class="item-icon">{{ typeIcon(obj.type) }}</span>
        <div class="item-info">
          <span class="item-name">{{ obj.label?.text ?? obj.id }}</span>
          <span class="item-meta">{{ typeLabel(obj.type) }} · {{ posStr(obj.position) }}</span>
        </div>
      </div>

      <!-- 选中物体的修改面板 -->
      <div v-if="selectedObj" class="edit-panel">
        <div class="edit-title">修改: {{ selectedObj.label?.text ?? selectedObj.id }}</div>

        <div class="edit-row">
          <label>颜色</label>
          <el-color-picker v-model="editColor" size="small" @change="applyColor" />
        </div>

        <div class="edit-row">
          <label>位置</label>
          <div class="vec3-inputs">
            <input type="number" v-model.number="editPos.x" step="0.1" @change="applyPosition" />
            <input type="number" v-model.number="editPos.y" step="0.1" @change="applyPosition" />
            <input type="number" v-model.number="editPos.z" step="0.1" @change="applyPosition" />
          </div>
        </div>

        <div class="edit-row">
          <label>缩放</label>
          <div class="vec3-inputs">
            <input type="number" v-model.number="editScale.x" step="0.1" min="0.1" @change="applyScale" />
            <input type="number" v-model.number="editScale.y" step="0.1" min="0.1" @change="applyScale" />
            <input type="number" v-model.number="editScale.z" step="0.1" min="0.1" @change="applyScale" />
          </div>
        </div>

        <div class="edit-divider">AI 修改</div>

        <div class="ai-modify">
          <el-input
            v-model="modifyInstruction"
            placeholder="如：把这个改成红色 / 整体升高2米"
            size="small"
            @keydown.enter="handleAIModify"
          />
          <el-button size="small" type="primary" :loading="modifying" @click="handleAIModify">
            改
          </el-button>
        </div>
      </div>
    </div>

    <!-- 光源列表 -->
    <div v-if="activeTab === 'lights'" class="list-wrap">
      <div v-if="!sceneStore.currentDSL?.lights.length" class="empty-state">
        暂无光源
      </div>
      <div
        v-for="light in sceneStore.currentDSL?.lights ?? []"
        :key="light.id"
        :class="['list-item', { selected: sceneStore.selectedLightId === light.id }]"
        @click="selectLight(light)"
      >
        <span class="item-icon">{{ lightIcon(light.type) }}</span>
        <div class="item-info">
          <span class="item-name">{{ light.id }}</span>
          <span class="item-meta">{{ light.type }} · {{ light.color }}</span>
        </div>
      </div>

      <!-- 选中光源的修改面板 -->
      <div v-if="selectedLight" class="edit-panel">
        <div class="edit-title">修改: {{ selectedLight.id }}</div>

        <div class="edit-row">
          <label>颜色</label>
          <el-color-picker v-model="editLightColor" size="small" @change="applyLightColor" />
        </div>

        <div class="edit-row">
          <label>强度</label>
          <input type="range" v-model.number="editLightIntensity" min="0" max="10" step="0.1"
            @change="applyLightIntensity" />
          <span class="val">{{ editLightIntensity }}</span>
        </div>

        <div v-if="selectedLight.position" class="edit-row">
          <label>位置</label>
          <div class="vec3-inputs">
            <input type="number" v-model.number="editLightPos.x" step="0.1" @change="applyLightPosition" />
            <input type="number" v-model.number="editLightPos.y" step="0.1" @change="applyLightPosition" />
            <input type="number" v-model.number="editLightPos.z" step="0.1" @change="applyLightPosition" />
          </div>
        </div>

        <div class="edit-divider">AI 修改</div>

        <div class="ai-modify">
          <el-input
            v-model="lightModifyInstruction"
            placeholder="如：亮度加倍 / 改成蓝色"
            size="small"
            @keydown.enter="handleLightAIModify"
          />
          <el-button size="small" type="primary" :loading="modifying" @click="handleLightAIModify">
            改
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSceneStore } from '@/store/modules/scene.store'
import { useAI } from '@/composables/useAI'
import { ElMessage } from 'element-plus'
import type { IndustrialObject, LightConfig } from '@/types/scene-dsl'

const sceneStore = useSceneStore()
const { modifyObject, modifyLight } = useAI()

const activeTab = ref<'objects' | 'lights'>('objects')
const modifyInstruction = ref('')
const lightModifyInstruction = ref('')
const modifying = ref(false)

// ---- 物体编辑状态 ----
const selectedObj = computed(() => sceneStore.selectedObject)

const editColor = ref('#ffffff')
const editPos = ref({ x: 0, y: 0, z: 0 })
const editScale = ref({ x: 1, y: 1, z: 1 })

watch(() => sceneStore.selectedObjectId, () => {
  const obj = sceneStore.selectedObject
  if (obj) {
    editColor.value = obj.material.color
    editPos.value = { ...obj.position }
    editScale.value = obj.scale ? { ...obj.scale } : { x: 1, y: 1, z: 1 }
    modifyInstruction.value = ''
  }
})

// ---- 光源编辑状态 ----
const selectedLight = computed(() => sceneStore.selectedLight)

const editLightColor = ref('#ffffff')
const editLightIntensity = ref(1)
const editLightPos = ref({ x: 0, y: 0, z: 0 })

watch(() => sceneStore.selectedLightId, () => {
  const l = sceneStore.selectedLight
  if (l) {
    editLightColor.value = l.color
    editLightIntensity.value = l.intensity
    editLightPos.value = l.position ? { ...l.position } : { x: 0, y: 0, z: 0 }
    lightModifyInstruction.value = ''
  }
})

// ---- 物体操作 ----
function selectObj(obj: IndustrialObject) {
  sceneStore.selectObject(obj.id)
}

function rebuildFromDSL() {
  if (sceneStore.currentDSL) {
    import('@/composables/useScene').then(({ useScene }) => {
      useScene().loadDSL(sceneStore.currentDSL!)
    })
  }
}

function applyColor() {
  const obj = sceneStore.selectedObject
  if (!obj) return
  sceneStore.updateObjectInDSL(obj.id, {
    ...obj,
    material: { ...obj.material, color: editColor.value },
  })
  rebuildFromDSL()
}

function applyPosition() {
  const obj = sceneStore.selectedObject
  if (!obj) return
  sceneStore.updateObjectInDSL(obj.id, {
    ...obj,
    position: { ...editPos.value },
  })
  rebuildFromDSL()
}

function applyScale() {
  const obj = sceneStore.selectedObject
  if (!obj) return
  sceneStore.updateObjectInDSL(obj.id, {
    ...obj,
    scale: { ...editScale.value },
  })
  rebuildFromDSL()
}

async function handleAIModify() {
  const obj = sceneStore.selectedObject
  if (!obj || !modifyInstruction.value.trim()) return
  modifying.value = true
  try {
    const result = await modifyObject(obj, modifyInstruction.value.trim())
    ElMessage.success('物体已更新')
    sceneStore.selectObject(result.id)
  } catch (e) {
    ElMessage.error(`修改失败: ${(e as Error).message}`)
  } finally {
    modifying.value = false
  }
}

// ---- 光源操作 ----
function selectLight(light: LightConfig) {
  sceneStore.selectLight(light.id)
}

function applyLightColor() {
  const l = sceneStore.selectedLight
  if (!l) return
  sceneStore.updateLightInDSL(l.id, { ...l, color: editLightColor.value })
  rebuildFromDSL()
}

function applyLightIntensity() {
  const l = sceneStore.selectedLight
  if (!l) return
  sceneStore.updateLightInDSL(l.id, { ...l, intensity: editLightIntensity.value })
  rebuildFromDSL()
}

function applyLightPosition() {
  const l = sceneStore.selectedLight
  if (!l) return
  sceneStore.updateLightInDSL(l.id, { ...l, position: { ...editLightPos.value } })
  rebuildFromDSL()
}

async function handleLightAIModify() {
  const l = sceneStore.selectedLight
  if (!l || !lightModifyInstruction.value.trim()) return
  modifying.value = true
  try {
    await modifyLight(l, lightModifyInstruction.value.trim())
    ElMessage.success('光源已更新')
  } catch (e) {
    ElMessage.error(`修改失败: ${(e as Error).message}`)
  } finally {
    modifying.value = false
  }
}

// ---- 工具函数 ----
function typeIcon(type: string): string {
  const icons: Record<string, string> = {
    storage_tank: '🛢', pipe_segment: '🔧', platform: '🏗',
    building: '🏭', cooling_tower: '🗼',
  }
  return icons[type] ?? '📦'
}

function typeLabel(type: string): string {
  const labels: Record<string, string> = {
    storage_tank: '储罐', pipe_segment: '管道', platform: '平台',
    building: '建筑', cooling_tower: '冷却塔',
  }
  return labels[type] ?? type
}

function lightIcon(type: string): string {
  const icons: Record<string, string> = {
    ambient: '🌐', hemisphere: '🌤', directional: '☀',
    point: '💡', spot: '🔦', rect: '⬜',
  }
  return icons[type] ?? '✨'
}

function posStr(pos: { x: number; y: number; z: number }): string {
  return `${pos.x.toFixed(1)}, ${pos.y.toFixed(1)}, ${pos.z.toFixed(1)}`
}
</script>

<style scoped>
.entity-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  font-size: 12px;
}

.tab-bar {
  display: flex;
  gap: 0;
  border-bottom: 1px solid var(--border-default);
  margin-bottom: 4px;
}

.tab {
  flex: 1;
  padding: 6px 0;
  border: none;
  background: transparent;
  color: var(--text-muted);
  font-size: 12px;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 150ms ease;
}

.tab:hover { color: var(--text-secondary); }
.tab.active {
  color: var(--accent-primary);
  border-bottom-color: var(--accent-primary);
}

.list-wrap {
  flex: 1;
  overflow-y: auto;
}

.empty-state {
  color: var(--text-muted);
  text-align: center;
  padding: 24px 0;
}

.list-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  color: var(--text-secondary);
  border: 1px solid transparent;
  transition: all 100ms ease;
}

.list-item:hover { background: var(--bg-tertiary); }
.list-item.selected {
  background: rgba(0, 212, 255, 0.08);
  border-color: rgba(0, 212, 255, 0.3);
  color: var(--text-primary);
}

.item-icon { font-size: 14px; flex-shrink: 0; }
.item-info { flex: 1; min-width: 0; }
.item-name { display: block; font-size: 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.item-meta { font-size: 10px; color: var(--text-muted); }

/* 编辑面板 */
.edit-panel {
  border-top: 1px solid var(--border-default);
  padding: 8px;
  margin-top: 4px;
  background: var(--bg-tertiary);
  border-radius: var(--radius-sm);
}

.edit-title {
  font-size: 12px;
  color: var(--text-accent);
  margin-bottom: 8px;
  font-weight: 600;
}

.edit-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.edit-row label {
  font-size: 11px;
  color: var(--text-muted);
  width: 32px;
  flex-shrink: 0;
}

.vec3-inputs {
  display: flex;
  gap: 4px;
  flex: 1;
}

.vec3-inputs input {
  width: 100%;
  background: var(--bg-primary);
  border: 1px solid var(--border-default);
  border-radius: 2px;
  color: var(--text-primary);
  font-size: 11px;
  padding: 2px 4px;
  font-family: var(--font-mono);
}

.vec3-inputs input:focus {
  outline: none;
  border-color: var(--border-active);
}

.edit-row .val {
  font-size: 11px;
  color: var(--text-accent);
  width: 28px;
  text-align: right;
}

.edit-divider {
  font-size: 10px;
  color: var(--text-muted);
  margin: 8px 0 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.ai-modify {
  display: flex;
  gap: 4px;
}
</style>
