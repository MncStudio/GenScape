<template>
  <div class="settings-page">
    <div class="settings-header">
      <router-link to="/editor">
        <el-button text><el-icon><ArrowLeft /></el-icon> 返回</el-button>
      </router-link>
      <h2>设置</h2>
      <div />
    </div>

    <div class="settings-section">
      <h3>AI 配置</h3>
      <el-form label-position="top">
        <el-form-item label="AI 提供商">
          <el-select v-model="provider" style="width: 240px">
            <el-option label="DeepSeek" value="deepseek" />
            <el-option label="Claude" value="claude" />
          </el-select>
        </el-form-item>
        <el-form-item label="API Key (从 .env 读取)">
          <el-input :model-value="maskedKey" disabled style="width: 400px" />
        </el-form-item>
      </el-form>
    </div>

    <div class="settings-section">
      <h3>渲染</h3>
      <el-form label-position="top">
        <el-form-item label="渲染后端">
          <el-tag>{{ sceneStore.backend || '检测中...' }}</el-tag>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSceneStore } from '@/store/modules/scene.store'

const sceneStore = useSceneStore()
const provider = ref('deepseek')

const maskedKey = computed(() => {
  const key = import.meta.env.VITE_DEEPSEEK_API_KEY || ''
  if (key.length > 8) return key.slice(0, 6) + '...' + key.slice(-4)
  return '未配置'
})
</script>

<style scoped>
.settings-page {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  padding: 24px;
}

.settings-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 32px;
}

.settings-header h2 {
  font-size: 20px;
  font-weight: 600;
}

.settings-section {
  max-width: 640px;
  margin-bottom: 32px;
  padding: 20px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
}

.settings-section h3 {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 16px;
  color: var(--text-primary);
}
</style>
