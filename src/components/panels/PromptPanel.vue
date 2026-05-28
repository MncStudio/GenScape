<template>
  <div :class="['prompt-panel', { 'prompt-panel--compact': compact }]">
    <div class="prompt-input-wrap">
      <el-input
        v-model="prompt"
        placeholder="描述你想要的场景，例如：一个化工厂夜景，有储罐、管道、蓝色灯光..."
        :rows="compact ? 1 : 3"
        type="textarea"
        class="prompt-input"
        @keydown.enter.ctrl="handleGenerate"
      />
      <el-button
        type="primary"
        class="generate-btn"
        :loading="sceneStore.status === 'generating'"
        @click="handleGenerate"
      >
        {{ compact ? '生成' : '生成场景' }}
      </el-button>
    </div>

    <!-- 快捷模板 -->
    <div v-if="!compact" class="preset-prompts">
      <el-tag
        v-for="(p, i) in promptStore.presetPrompts"
        :key="i"
        class="preset-tag"
        :disable-transitions="false"
        effect="dark"
        @click="prompt = p"
      >
        {{ p.slice(0, 20) }}...
      </el-tag>
    </div>
  </div>
</template>

<script setup lang="ts">
import { usePromptStore } from '@/store/modules/prompt.store'
import { useSceneStore } from '@/store/modules/scene.store'
import { useAI } from '@/composables/useAI'
import { ElMessage } from 'element-plus'

const props = withDefaults(defineProps<{ compact?: boolean }>(), { compact: false })

const promptStore = usePromptStore()
const sceneStore = useSceneStore()
const { generate } = useAI()

const prompt = ref('')

async function handleGenerate() {
  const text = prompt.value.trim()
  if (!text) {
    ElMessage.warning('请输入场景描述')
    return
  }

  try {
    await generate(text)
    ElMessage.success('场景生成完成')
  } catch (err) {
    ElMessage.error(`生成失败: ${(err as Error).message}`)
  }
}
</script>

<style scoped>
.prompt-panel {
  width: 100%;
}

.prompt-input-wrap {
  display: flex;
  gap: 8px;
}

.prompt-input :deep(.el-textarea__inner) {
  background: var(--bg-tertiary);
  border-color: var(--border-default);
  color: var(--text-primary);
  font-family: var(--font-mono);
  font-size: 13px;
}

.prompt-input :deep(.el-textarea__inner:focus) {
  border-color: var(--border-active);
}

.prompt-input :deep(.el-textarea__inner::placeholder) {
  color: var(--text-muted);
}

.generate-btn {
  background: rgba(240, 240, 250, 0.1) !important;
  border: 1px solid rgba(240, 240, 250, 0.35) !important;
  color: var(--text-primary) !important;
  font-weight: 700;
  letter-spacing: 1.17px;
  white-space: nowrap;
  border-radius: 32px !important;
}

.generate-btn:hover {
  background: rgba(240, 240, 250, 0.2) !important;
}

.preset-prompts {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 10px;
}

.preset-tag {
  cursor: pointer;
  background: transparent;
  border: 1px solid rgba(240, 240, 250, 0.1);
  color: var(--text-secondary);
  font-size: 11px;
}

.preset-tag:hover {
  border-color: rgba(240, 240, 250, 0.35);
  color: var(--text-primary);
}
</style>
