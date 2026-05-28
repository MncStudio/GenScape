<template>
  <aside :class="['app-sidebar', { collapsed: uiStore.sidebarCollapsed }]">
    <nav class="sidebar-nav">
      <button
        v-for="item in navItems"
        :key="item.id"
        :class="['nav-item', { active: uiStore.activePanel === item.id && uiStore.panelVisible[item.id] }]"
        @click="uiStore.togglePanel(item.id)"
        :title="item.label"
      >
        <el-icon :size="18"><component :is="item.icon" /></el-icon>
        <span v-if="!uiStore.sidebarCollapsed" class="nav-label">{{ item.label }}</span>
      </button>
    </nav>

    <div v-if="!uiStore.sidebarCollapsed" class="sidebar-panel" v-show="activePanelContent">
      <div class="hud-panel">
        <div class="hud-panel__header">
          <span>{{ activePanelContent?.label }}</span>
          <el-button text size="small" @click="uiStore.closePanel(activePanelId!)">
            <el-icon><Close /></el-icon>
          </el-button>
        </div>
        <div class="hud-panel__body">
          <component :is="activePanelContent?.component" />
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { useUIStore, type PanelId } from '@/store/modules/ui.store'
import { markRaw } from 'vue'
import { Grid, Download, FolderOpened, Clock, VideoPlay, ChatDotRound } from '@element-plus/icons-vue'
import SceneGraphPanel from '@/components/panels/SceneGraphPanel.vue'
import ExportPanel from '@/components/panels/ExportPanel.vue'

const uiStore = useUIStore()

interface NavItem {
  id: PanelId
  label: string
  icon: any
  component?: any
}

const navItems: NavItem[] = [
  { id: 'prompt', label: '提示', icon: markRaw(ChatDotRound), component: undefined },
  { id: 'sceneGraph', label: '场景树', icon: markRaw(Grid), component: markRaw(SceneGraphPanel) },
  { id: 'export', label: '导出', icon: markRaw(Download), component: markRaw(ExportPanel) },
  { id: 'assets', label: '资产库', icon: markRaw(FolderOpened), component: undefined },
  { id: 'history', label: '历史', icon: markRaw(Clock), component: undefined },
  { id: 'timeline', label: '动画', icon: markRaw(VideoPlay), component: undefined },
]

const activePanelId = computed(() => uiStore.activePanel)

const activePanelContent = computed(() => {
  if (!activePanelId.value) return null
  return navItems.find(item => item.id === activePanelId.value) ?? null
})
</script>

<style scoped>
.app-sidebar {
  display: flex;
  flex-shrink: 0;
  height: 100%;
  background: var(--bg-secondary);
  border-right: 1px solid var(--border-default);
  transition: width 200ms ease;
  z-index: 50;
}

.app-sidebar:not(.collapsed) {
  width: 320px;
}

.app-sidebar.collapsed {
  width: 48px;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 2px;
  width: 48px;
  padding: 8px 4px;
  border-right: 1px solid var(--border-default);
}

.nav-item {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
  transition: all 150ms ease;
}

.nav-item:hover {
  background: var(--bg-tertiary);
  color: var(--text-secondary);
}

.nav-item.active {
  background: rgba(240, 240, 250, 0.08);
  color: var(--text-primary);
}

.nav-label {
  display: none;
}

.sidebar-panel {
  flex: 1;
  overflow: hidden;
  padding: 8px;
}

.sidebar-panel .hud-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.sidebar-panel .hud-panel__body {
  flex: 1;
  overflow-y: auto;
}
</style>
