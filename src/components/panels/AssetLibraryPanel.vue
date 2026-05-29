<template>
  <div class="asset-panel">
    <p class="asset-desc">点击添加预配置的工业物体到当前场景中。</p>

    <div
      v-for="group in groupedTemplates"
      :key="group.category"
      class="asset-group"
    >
      <div class="section-label">{{ group.label }}</div>

      <div class="asset-cards">
        <div
          v-for="tpl in group.items"
          :key="tpl.type"
          class="asset-card"
        >
          <div class="card-body">
            <div class="card-header">
              <span class="card-name">{{ tpl.label }}</span>
              <span class="card-type">{{ typeLabel(tpl.type) }}</span>
            </div>
            <div class="card-preview">
              <span
                class="color-dot"
                :style="{ background: tpl.color }"
              ></span>
              <span class="param-hint">{{ paramHint(tpl.params) }}</span>
            </div>
          </div>
          <el-button
            class="add-btn"
            size="small"
            :disabled="!hasScene"
            @click="addToScene(tpl)"
          >
            <el-icon :size="12"><Plus /></el-icon>
            添加
          </el-button>
        </div>
      </div>
    </div>

    <div v-if="!hasScene" class="no-scene-hint">
      当前无场景，请先生成或导入场景。
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSceneStore } from '@/store/modules/scene.store'
import { useScene } from '@/composables/useScene'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import type { IndustrialObject, ObjectType } from '@/types/scene-dsl'

// ---- 预设模板 ----

interface AssetTemplate {
  type: ObjectType
  label: string
  color: string
  params: Record<string, number | string | boolean>
}

const templates: AssetTemplate[] = [
  // 储罐类
  {
    type: 'storage_tank', label: '储罐', color: '#8899aa',
    params: { radius: 2, height: 5, roofType: 'dome' as const }
  },
  // 管道类
  {
    type: 'pipe_segment', label: '管道', color: '#667788',
    params: { length: 6, diameter: 0.3, segments: 16, hasValve: false }
  },
  // 平台类：同时归入建筑结构类和设备类 → 只出现一次
  // 建筑结构类
  {
    type: 'platform', label: '平台', color: '#556677',
    params: { width: 4, depth: 4, height: 0.2, pillarHeight: 3, pillarCount: 4 }
  },
  {
    type: 'building', label: '厂房', color: '#889999',
    params: { width: 4, depth: 3, height: 5, roofType: 'gable' as const }
  },
  {
    type: 'cooling_tower', label: '冷却塔', color: '#778899',
    params: { baseRadius: 2.5, topRadius: 1.2, height: 6, segments: 24 }
  },
  // 设备类
  {
    type: 'flare_stack', label: '火炬塔', color: '#8899aa',
    params: { baseRadius: 0.4, topRadius: 0.2, height: 12, segments: 16 }
  },
  {
    type: 'heat_exchanger', label: '换热器', color: '#778899',
    params: { length: 3, radius: 0.8, tubeCount: 4 }
  },
  {
    type: 'pump', label: '泵', color: '#667788',
    params: { radius: 0.6, height: 1.2 }
  },
]

interface TemplateGroup {
  category: string
  label: string
  items: AssetTemplate[]
}

const groupedTemplates: TemplateGroup[] = [
  {
    category: 'tanks',
    label: '储罐类',
    items: templates.filter(t => t.type === 'storage_tank'),
  },
  {
    category: 'pipes',
    label: '管道类',
    items: templates.filter(t => t.type === 'pipe_segment'),
  },
  {
    category: 'structures',
    label: '建筑结构类',
    items: templates.filter(t => ['platform', 'building', 'cooling_tower'].includes(t.type)),
  },
  {
    category: 'equipment',
    label: '设备类',
    items: templates.filter(t => ['flare_stack', 'heat_exchanger', 'pump'].includes(t.type)),
  },
]

// ---- Store & Scene ----

const sceneStore = useSceneStore()

const hasScene = computed(() => sceneStore.status === 'ready' && sceneStore.currentDSL !== null)

// ---- 工具函数 ----

function typeLabel(type: string): string {
  const labels: Record<string, string> = {
    storage_tank: 'storage_tank',
    pipe_segment: 'pipe_segment',
    platform: 'platform',
    building: 'building',
    cooling_tower: 'cooling_tower',
    flare_stack: 'flare_stack',
    heat_exchanger: 'heat_exchanger',
    pump: 'pump',
  }
  return labels[type] ?? type
}

function paramHint(params: Record<string, number | string | boolean>): string {
  if (!params) return ''

  const hints: Record<string, (v: any) => string> = {
    radius: (v: number) => `R${v}`,
    height: (v: number) => `H${v}`,
    length: (v: number) => `L${v}`,
    diameter: (v: number) => `D${v}`,
    baseRadius: (v: number) => `R${v}`,
    width: (v: number) => `W${v}`,
    depth: (v: number) => `D${v}`,
  }

  return Object.entries(params)
    .filter(([key]) => key in hints)
    .map(([key, val]) => hints[key]?.(val as number))
    .filter(Boolean)
    .join(' ')
}

function randomInRange(min: number, max: number): number {
  return +(Math.random() * (max - min) + min).toFixed(1)
}

// ---- 添加到场景 ----

function addToScene(tpl: AssetTemplate) {
  const dsl = sceneStore.currentDSL
  if (!dsl) {
    ElMessage.warning('当前没有场景数据')
    return
  }

  const newObj: IndustrialObject = {
    id: `asset_${tpl.type}_${Date.now()}`,
    type: tpl.type,
    position: {
      x: randomInRange(-15, 15),
      y: 0,
      z: randomInRange(-15, 15),
    },
    rotation: { x: 0, y: 0, z: 0 },
    params: { ...tpl.params },
    material: {
      color: tpl.color,
      metalness: 0.6,
      roughness: 0.4,
    },
    label: {
      text: tpl.label,
      position: 'top' as const,
    },
  }

  dsl.objects.push(newObj)

  // 通过 loadDSL 重建场景（内部会调用 store.setDSL）
  const scene = useScene()
  scene.loadDSL(dsl, false)

  ElMessage.success(`已添加 ${tpl.label}`)
}
</script>

<style scoped>
.asset-panel {
  font-size: 12px;
}

.asset-desc {
  color: var(--text-secondary);
  margin-bottom: 12px;
  font-size: 11px;
  line-height: 1.5;
}

.section-label {
  font-size: 10px;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 6px;
}

.asset-group {
  margin-bottom: 14px;
}

.asset-cards {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.asset-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 10px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-default);
  border-radius: 6px;
  transition: border-color 150ms ease;
}

.asset-card:hover {
  border-color: rgba(240, 240, 250, 0.2);
}

.card-body {
  flex: 1;
  min-width: 0;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.card-name {
  font-size: 12px;
  color: var(--text-primary);
  font-weight: 500;
}

.card-type {
  font-size: 10px;
  color: var(--text-muted);
  font-family: var(--font-mono, monospace);
}

.card-preview {
  display: flex;
  align-items: center;
  gap: 8px;
}

.color-dot {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
  border: 1px solid rgba(240, 240, 250, 0.15);
}

.param-hint {
  font-size: 10px;
  color: var(--text-muted);
  font-family: var(--font-mono, monospace);
}

.add-btn {
  flex-shrink: 0;
  margin-left: 10px;
  background: rgba(240, 240, 250, 0.08);
  border-color: rgba(240, 240, 250, 0.2);
  color: var(--text-secondary);
  font-size: 11px;
  padding: 4px 12px;
}

.add-btn:hover:not(:disabled) {
  border-color: rgba(240, 240, 250, 0.35);
  color: var(--text-primary);
}

.no-scene-hint {
  text-align: center;
  color: var(--text-muted);
  font-size: 11px;
  padding: 20px 0;
}
</style>
