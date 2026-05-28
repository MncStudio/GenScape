<template>
  <div class="entity-panel">
    <!-- 标签切换 -->
    <div class="tab-bar">
      <button :class="['tab', { active: activeTab === 'objects' }]" @click="activeTab = 'objects'">
        物体 ({{ sceneStore.currentDSL?.objects.length ?? 0 }})
      </button>
      <button :class="['tab', { active: activeTab === 'lights' }]" @click="activeTab = 'lights'">
        光源 ({{ (sceneStore.currentDSL?.lights.length ?? 0) + 3 }})
      </button>
    </div>

    <!-- ======================== 物体列表 ======================== -->
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
        <button class="delete-btn" @click.stop="deleteObj(obj.id)" title="删除">×</button>
      </div>
    </div>

    <!-- ======================== 光源列表 ======================== -->
    <div v-if="activeTab === 'lights'" class="list-wrap">
      <!-- 内置光源 -->
      <div class="section-label">内置光源</div>
      <div
        v-for="bl in builtinLights"
        :key="bl.id"
        :class="['list-item', { selected: selectedBuiltinId === bl.id }]"
        @click="selectBuiltinLight(bl)"
      >
        <span class="item-icon">{{ lightIcon(bl.type) }}</span>
        <div class="item-info">
          <span class="item-name">{{ bl.name }}</span>
          <span class="item-meta">{{ bl.type }} · {{ bl.color }}</span>
        </div>
      </div>

      <div class="section-divider"></div>

      <!-- AI 生成光源 -->
      <div class="section-label">场景光源</div>
      <div v-if="!sceneStore.currentDSL?.lights.length" class="empty-state">
        暂无场景光源
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
    </div>

    <!-- ======================== 编辑弹窗 ======================== -->
    <Teleport to="body">
      <div v-if="dialogVisible" class="dialog-overlay">
        <div class="dialog-panel">
          <!-- 头部 -->
          <div class="dialog-header">
            <span class="dialog-title">{{ dialogTitle }}</span>
            <button class="dialog-close" @click="closeDialog">×</button>
          </div>

          <div class="dialog-body">
            <!-- 物体编辑 -->
            <template v-if="dialogMode === 'object' && selectedObj">
              <div class="edit-group">
                <div class="group-label">材质</div>
                <div class="edit-row">
                  <label>颜色</label>
                  <el-color-picker v-model="editColor" size="small" @change="applyColor" />
                </div>
                <div class="edit-row">
                  <label>金属度</label>
                  <input type="range" v-model.number="editMetalness" min="0" max="1" step="0.01" @change="applyPBR" />
                  <span class="val">{{ editMetalness.toFixed(2) }}</span>
                </div>
                <div class="edit-row">
                  <label>粗糙度</label>
                  <input type="range" v-model.number="editRoughness" min="0" max="1" step="0.01" @change="applyPBR" />
                  <span class="val">{{ editRoughness.toFixed(2) }}</span>
                </div>
                <div class="edit-row">
                  <label>自发光</label>
                  <el-color-picker v-model="editEmissive" size="small" @change="applyPBR" />
                  <button v-if="editEmissive" class="clear-btn" @click="editEmissive = ''; applyPBR()">清除</button>
                </div>
              </div>

              <div class="edit-group">
                <div class="group-label">变换</div>
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
              </div>

              <div class="edit-group">
                <div class="group-label">AI 修改</div>
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
            </template>

            <!-- 内置光源编辑 -->
            <template v-if="dialogMode === 'builtin' && selectedBuiltin">
              <div class="edit-group">
                <div class="group-label">光源属性</div>
                <div class="edit-row">
                  <label>颜色</label>
                  <el-color-picker v-model="builtinEdit.color" size="small" @change="applyBuiltin" />
                </div>
                <div class="edit-row">
                  <label>强度</label>
                  <input type="range" v-model.number="builtinEdit.intensity" min="0" max="10" step="0.1"
                    @change="applyBuiltin" />
                  <span class="val">{{ builtinEdit.intensity.toFixed(1) }}</span>
                </div>
                <div v-if="selectedBuiltin.type !== 'ambient'" class="edit-row">
                  <label>位置</label>
                  <div class="vec3-inputs">
                    <input type="number" v-model.number="builtinEdit.posX" step="0.5" @change="applyBuiltin" />
                    <input type="number" v-model.number="builtinEdit.posY" step="0.5" @change="applyBuiltin" />
                    <input type="number" v-model.number="builtinEdit.posZ" step="0.5" @change="applyBuiltin" />
                  </div>
                </div>
                <div v-if="selectedBuiltin.type === 'directional' && selectedBuiltin.id === 'builtin_key_light'" class="edit-row">
                  <label>阴影</label>
                  <input type="checkbox" v-model="builtinEdit.castShadow" @change="applyBuiltin" />
                </div>
              </div>
            </template>

            <!-- 场景光源编辑 -->
            <template v-if="dialogMode === 'dslLight' && selectedLight">
              <div class="edit-group">
                <div class="group-label">光源属性</div>
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
              </div>

              <div class="edit-group">
                <div class="group-label">AI 修改</div>
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
            </template>
          </div>
        </div>
      </div>
    </Teleport>
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

// ---- 弹窗状态 ----
type DialogMode = 'object' | 'builtin' | 'dslLight' | null
const dialogMode = ref<DialogMode>(null)
const dialogVisible = computed(() => dialogMode.value !== null)

const dialogTitle = computed(() => {
  switch (dialogMode.value) {
    case 'object': return `编辑: ${selectedObj.value?.label?.text ?? selectedObj.value?.id ?? ''}`
    case 'builtin': return `编辑: ${selectedBuiltin.value?.name ?? ''}`
    case 'dslLight': return `编辑: ${selectedLight.value?.id ?? ''}`
    default: return ''
  }
})

function closeDialog() {
  dialogMode.value = null
}

// ---- 物体编辑状态 ----
const selectedObj = computed(() => sceneStore.selectedObject)

const editColor = ref('#557799')
const editMetalness = ref(0.5)
const editRoughness = ref(0.5)
const editEmissive = ref('')
const editPos = ref({ x: 0, y: 0, z: 0 })
const editScale = ref({ x: 1, y: 1, z: 1 })

watch(() => sceneStore.selectedObjectId, (newId) => {
  const obj = sceneStore.selectedObject
  if (obj) {
    editColor.value = obj.material.color
    editMetalness.value = obj.material.metalness ?? 0.5
    editRoughness.value = obj.material.roughness ?? 0.5
    editEmissive.value = obj.material.emissive ?? ''
    editPos.value = { ...obj.position }
    editScale.value = obj.scale ? { ...obj.scale } : { x: 1, y: 1, z: 1 }
    modifyInstruction.value = ''
    dialogMode.value = 'object'
  } else if (!newId) {
    dialogMode.value = null
  }
})

// ---- 光源编辑状态 ----
const selectedLight = computed(() => sceneStore.selectedLight)

const editLightColor = ref('#ffffff')
const editLightIntensity = ref(1)
const editLightPos = ref({ x: 0, y: 0, z: 0 })

watch(() => sceneStore.selectedLightId, (newId) => {
  const l = sceneStore.selectedLight
  if (l) {
    editLightColor.value = l.color
    editLightIntensity.value = l.intensity
    editLightPos.value = l.position ? { ...l.position } : { x: 0, y: 0, z: 0 }
    lightModifyInstruction.value = ''
    dialogMode.value = 'dslLight'
  } else if (!newId) {
    // 仅当不是切换到内置光源时关闭弹窗
  }
})

// ---- 内置光源状态 ----
interface BuiltinLightUI {
  id: string
  name: string
  type: string
  color: string
  intensity: number
  posX: number
  posY: number
  posZ: number
  castShadow: boolean
}

const selectedBuiltinId = ref<string | null>(null)

const builtinLights = ref<BuiltinLightUI[]>([
  { id: 'builtin_ambient', name: '环境光', type: 'ambient', color: '#4466aa', intensity: 0.6, posX: 0, posY: 0, posZ: 0, castShadow: false },
  { id: 'builtin_key_light', name: '主光源', type: 'directional', color: '#ffffff', intensity: 3.0, posX: 20, posY: 30, posZ: 10, castShadow: true },
  { id: 'builtin_fill_light', name: '补光源', type: 'directional', color: '#8899cc', intensity: 1.2, posX: -15, posY: 10, posZ: -10, castShadow: false },
])

const selectedBuiltin = computed(() => builtinLights.value.find(l => l.id === selectedBuiltinId.value) ?? null)

const builtinEdit = ref({ color: '#ffffff', intensity: 1, posX: 0, posY: 0, posZ: 0, castShadow: false })

watch(selectedBuiltinId, (newId) => {
  const bl = selectedBuiltin.value
  if (bl) {
    builtinEdit.value = { color: bl.color, intensity: bl.intensity, posX: bl.posX, posY: bl.posY, posZ: bl.posZ, castShadow: bl.castShadow }
    sceneStore.selectLight(null)
    sceneStore.selectObject(null)
    dialogMode.value = 'builtin'
  } else if (!newId) {
    // 仅当不是切换到其他类型时关闭弹窗
  }
})

function syncBuiltinFromScene() {
  import('@/composables/useScene').then(({ useScene }) => {
    const scene = useScene().getInstance()
    if (!scene) return
    const lights = scene.getBuiltinLights()
    const bl = builtinLights.value

    if (lights.ambient) {
      bl[0].color = '#' + lights.ambient.color.getHexString()
      bl[0].intensity = lights.ambient.intensity
    }
    if (lights.key) {
      bl[1].color = '#' + lights.key.color.getHexString()
      bl[1].intensity = lights.key.intensity
      bl[1].posX = lights.key.position.x
      bl[1].posY = lights.key.position.y
      bl[1].posZ = lights.key.position.z
      bl[1].castShadow = lights.key.castShadow
    }
    if (lights.fill) {
      bl[2].color = '#' + lights.fill.color.getHexString()
      bl[2].intensity = lights.fill.intensity
      bl[2].posX = lights.fill.position.x
      bl[2].posY = lights.fill.position.y
      bl[2].posZ = lights.fill.position.z
    }
  })
}

onMounted(() => {
  syncBuiltinFromScene()
})

function selectBuiltinLight(bl: BuiltinLightUI) {
  selectedBuiltinId.value = bl.id
}

function applyBuiltin() {
  const bl = selectedBuiltin.value
  if (!bl) return

  bl.color = builtinEdit.value.color
  bl.intensity = builtinEdit.value.intensity
  bl.posX = builtinEdit.value.posX
  bl.posY = builtinEdit.value.posY
  bl.posZ = builtinEdit.value.posZ
  bl.castShadow = builtinEdit.value.castShadow

  import('@/composables/useScene').then(({ useScene }) => {
    const scene = useScene().getInstance()
    if (!scene) return
    const lights = scene.getBuiltinLights()
    const target = bl.id === 'builtin_ambient' ? lights.ambient
      : bl.id === 'builtin_key_light' ? lights.key
      : lights.fill

    if (target) {
      target.color.set(builtinEdit.value.color)
      target.intensity = builtinEdit.value.intensity
      if ('position' in target) {
        target.position.set(builtinEdit.value.posX, builtinEdit.value.posY, builtinEdit.value.posZ)
      }
      if ('castShadow' in target) {
        ;(target as any).castShadow = builtinEdit.value.castShadow
      }
    }
  })
}

// ---- 物体操作 ----
function selectObj(obj: IndustrialObject) {
  sceneStore.selectObject(obj.id)
  selectedBuiltinId.value = null
  import('@/composables/useScene').then(({ useScene }) => {
    useScene().getInstance()?.highlightObject(obj.id)
  })
}

function rebuildFromDSL() {
  if (sceneStore.currentDSL) {
    import('@/composables/useScene').then(({ useScene }) => {
      useScene().loadDSL(sceneStore.currentDSL!, false)
      if (sceneStore.selectedObjectId) {
        useScene().getInstance()?.highlightObject(sceneStore.selectedObjectId)
      }
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

function applyPBR() {
  const obj = sceneStore.selectedObject
  if (!obj) return
  sceneStore.updateObjectInDSL(obj.id, {
    ...obj,
    material: {
      ...obj.material,
      metalness: editMetalness.value,
      roughness: editRoughness.value,
      emissive: editEmissive.value || undefined,
    },
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

function deleteObj(id: string) {
  if (!sceneStore.currentDSL) return
  if (sceneStore.selectedObjectId === id) {
    sceneStore.selectObject(null)
    dialogMode.value = null
    import('@/composables/useScene').then(({ useScene }) => {
      useScene().getInstance()?.highlightObject(null)
    })
  }
  const dsl = sceneStore.currentDSL
  dsl.objects = dsl.objects.filter(o => o.id !== id)
  sceneStore.setDSL({ ...dsl })
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
  selectedBuiltinId.value = null
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

.section-label {
  font-size: 10px;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 4px 8px 2px;
}

.section-divider {
  border-top: 1px solid var(--border-default);
  margin: 6px 0;
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

.delete-btn {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  border: 1px solid transparent;
  border-radius: 3px;
  background: transparent;
  color: var(--text-muted);
  font-size: 14px;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 100ms ease;
}
.delete-btn:hover {
  color: #ff4444;
  border-color: rgba(255, 68, 68, 0.3);
  background: rgba(255, 68, 68, 0.1);
}

/* ======================== 弹窗 ======================== */
.dialog-overlay {
  position: fixed;
  top: 56px;
  right: 16px;
  z-index: 2000;
  pointer-events: none;
}

.dialog-panel {
  background: var(--bg-secondary);
  border: 1px solid var(--border-default);
  border-radius: 8px;
  width: 340px;
  max-height: calc(100vh - 80px);
  display: flex;
  flex-direction: column;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.45);
  pointer-events: auto;
  animation: slideIn 150ms ease;
}

@keyframes slideIn {
  from { transform: translateX(20px); opacity: 0.7; }
  to { transform: translateX(0); opacity: 1; }
}

.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-bottom: 1px solid var(--border-default);
}

.dialog-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
}

.dialog-close {
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: var(--text-muted);
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 100ms ease;
}

.dialog-close:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.dialog-body {
  padding: 12px 16px 16px;
  overflow-y: auto;
}

.edit-group {
  margin-bottom: 14px;
}

.edit-group:last-child {
  margin-bottom: 0;
}

.group-label {
  font-size: 10px;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
  padding-bottom: 4px;
  border-bottom: 1px solid var(--border-default);
}

.edit-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.edit-row:last-child {
  margin-bottom: 0;
}

.edit-row label {
  font-size: 11px;
  color: var(--text-muted);
  width: 48px;
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
  border-radius: 4px;
  color: var(--text-primary);
  font-size: 12px;
  padding: 4px 6px;
  font-family: var(--font-mono);
}

.vec3-inputs input:focus {
  outline: none;
  border-color: var(--border-active);
}

.edit-row .val {
  font-size: 12px;
  color: var(--text-accent);
  width: 36px;
  text-align: right;
  font-family: var(--font-mono);
}

.clear-btn {
  font-size: 10px;
  padding: 2px 8px;
  border: 1px solid var(--border-default);
  border-radius: 4px;
  background: var(--bg-primary);
  color: var(--text-muted);
  cursor: pointer;
  transition: all 100ms ease;
}

.clear-btn:hover {
  border-color: var(--border-active);
  color: var(--text-secondary);
}

.ai-modify {
  display: flex;
  gap: 6px;
}
</style>
