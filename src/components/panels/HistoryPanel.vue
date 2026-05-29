<template>
  <div class="history-panel">
    <!-- 空状态 -->
    <div v-if="promptStore.history.length === 0" class="history-empty">
      <el-icon :size="32" class="empty-icon"><Clock /></el-icon>
      <p class="empty-text">暂无历史记录</p>
      <p class="empty-hint">生成场景后会自动保存到此处</p>
    </div>

    <!-- 历史列表 -->
    <div v-else class="history-list">
      <span class="section-label">生成历史</span>

      <div
        v-for="(item, index) in promptStore.history"
        :key="item.timestamp"
        :class="['history-item', { 'has-dsl': item.dsl, 'no-dsl': !item.dsl }]"
      >
        <div class="item-index">{{ promptStore.history.length - index }}</div>
        <div class="item-body">
          <div class="item-prompt" :title="item.prompt">
            {{ truncate(item.prompt, 30) }}
          </div>
          <div class="item-meta">
            <template v-if="item.dsl">
              <span class="item-scene-name">{{ item.dsl.metadata.name }}</span>
              <span class="item-object-count">{{ item.dsl.objects.length }} 个物体</span>
            </template>
            <template v-else>
              <span class="item-no-dsl">无场景数据</span>
            </template>
            <span class="item-divider">|</span>
            <span class="item-time">{{ formatRelativeTime(item.timestamp) }}</span>
          </div>
        </div>
        <div v-if="item.dsl" class="item-actions">
          <button class="load-btn" title="加载此场景" @click="handleLoad(item)">
            <el-icon :size="14"><RefreshRight /></el-icon>
          </button>
        </div>
      </div>
    </div>

    <!-- 底部清除按钮 -->
    <div v-if="promptStore.history.length > 0" class="history-footer">
      <button class="clear-btn" @click="handleClear">
        <el-icon :size="14"><Delete /></el-icon>
        <span>清除全部历史</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { usePromptStore, type HistoryItem } from '@/store/modules/prompt.store'
import { useScene } from '@/composables/useScene'
import { ElMessageBox, ElMessage } from 'element-plus'
import { Clock, Delete, RefreshRight } from '@element-plus/icons-vue'

const promptStore = usePromptStore()
const { loadDSL } = useScene()

function truncate(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text
  return text.slice(0, maxLen) + '...'
}

function formatRelativeTime(isoString: string): string {
  const now = Date.now()
  const then = new Date(isoString).getTime()
  const diffMs = now - then
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)
  const diffWeek = Math.floor(diffDay / 7)

  if (diffSec < 60) return '刚刚'
  if (diffMin < 60) return `${diffMin}分钟前`
  if (diffHour < 24) return `${diffHour}小时前`
  if (diffDay < 7) return `${diffDay}天前`
  if (diffWeek < 4) return `${diffWeek}周前`

  const date = new Date(isoString)
  const month = date.getMonth() + 1
  const day = date.getDate()
  return `${month}月${day}日`
}

async function handleLoad(item: HistoryItem) {
  if (!item.dsl) return

  try {
    await ElMessageBox.confirm(
      `确定要加载场景「${item.dsl.metadata.name}」吗？当前场景将被替换。`,
      '加载历史场景',
      {
        confirmButtonText: '确定加载',
        cancelButtonText: '取消',
        type: 'warning',
      },
    )
    loadDSL(item.dsl)
    ElMessage.success(`已加载场景「${item.dsl.metadata.name}」`)
  } catch {
    // 用户取消
  }
}

async function handleClear() {
  try {
    await ElMessageBox.confirm(
      '确定要清除全部历史记录吗？此操作不可撤销。',
      '清除历史记录',
      {
        confirmButtonText: '确定清除',
        cancelButtonText: '取消',
        type: 'warning',
      },
    )
    promptStore.clearHistory()
    ElMessage.success('历史记录已清除')
  } catch {
    // 用户取消
  }
}
</script>

<style scoped>
.history-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
}

/* ---- 空状态 ---- */
.history-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 24px;
}

.empty-icon {
  color: var(--text-muted);
}

.empty-text {
  color: var(--text-secondary);
  font-size: 13px;
  margin: 0;
}

.empty-hint {
  color: var(--text-muted);
  font-size: 11px;
  margin: 0;
}

/* ---- 标签 ---- */
.section-label {
  display: block;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--text-muted);
  padding: 0 0 8px 0;
}

/* ---- 列表 ---- */
.history-list {
  flex: 1;
  overflow-y: auto;
  padding-bottom: 8px;
}

.history-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 12px;
  margin-bottom: 6px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-sm);
  transition: background 150ms ease;
}

.history-item:hover {
  background: var(--bg-elevated);
}

.history-item.no-dsl {
  opacity: 0.45;
}

.item-index {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 700;
  color: var(--text-muted);
  border: 1px solid var(--border-default);
  border-radius: 2px;
  margin-top: 1px;
}

.item-body {
  flex: 1;
  min-width: 0;
}

.item-prompt {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.4;
}

.item-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 4px;
  font-size: 10px;
  line-height: 1.3;
}

.item-scene-name {
  color: var(--accent-primary);
  font-weight: 600;
}

.item-object-count {
  color: var(--text-secondary);
}

.item-no-dsl {
  color: var(--text-muted);
  font-style: italic;
}

.item-divider {
  color: var(--border-default);
  user-select: none;
}

.item-time {
  color: var(--text-muted);
}

.item-actions {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  margin-top: 1px;
}

.load-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: 1px solid rgba(240, 240, 250, 0.35);
  border-radius: 32px;
  background: rgba(240, 240, 250, 0.1);
  color: var(--text-primary);
  cursor: pointer;
  transition: background 150ms ease;
}

.load-btn:hover {
  background: rgba(240, 240, 250, 0.2);
}

/* ---- 底部清除按钮 ---- */
.history-footer {
  flex-shrink: 0;
  padding-top: 8px;
  border-top: 1px solid var(--border-default);
}

.clear-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  padding: 8px 0;
  border: 1px solid var(--border-default);
  border-radius: 32px;
  background: transparent;
  color: var(--accent-danger);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.5px;
  cursor: pointer;
  transition: background 150ms ease;
}

.clear-btn:hover {
  background: rgba(239, 68, 68, 0.1);
}
</style>
