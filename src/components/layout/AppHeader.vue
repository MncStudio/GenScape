<template>
  <header class="app-header">
    <div class="header-left">
      <router-link to="/" class="logo">
        <span class="logo-text">GENSCAPE</span>
        <span class="logo-version">v0.1</span>
      </router-link>
    </div>

    <div class="header-center">
      <PromptPanel compact />
    </div>

    <div class="header-right">
      <el-button
        :icon="uiStore.sidebarCollapsed ? Expand : Fold"
        @click="uiStore.toggleSidebar()"
        class="header-btn"
        text
        size="small"
      />
      <router-link to="/gallery">
        <el-button class="header-btn" text size="small">画廊</el-button>
      </router-link>
      <router-link to="/settings">
        <el-button class="header-btn" text size="small">
          <el-icon><Setting /></el-icon>
        </el-button>
      </router-link>
    </div>
  </header>
</template>

<script setup lang="ts">
import { Expand, Fold, Setting } from '@element-plus/icons-vue'
import { useUIStore } from '@/store/modules/ui.store'
import PromptPanel from '@/components/panels/PromptPanel.vue'

const uiStore = useUIStore()
</script>

<style scoped>
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 52px;
  padding: 0 20px;
  background: var(--bg-secondary);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-bottom: 1px solid rgba(240, 240, 250, 0.06);
  z-index: 100;
  flex-shrink: 0;
}

.header-left {
  display: flex;
  align-items: center;
  min-width: 200px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  color: var(--text-primary);
}

.logo-text {
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 2px;
}

.logo-version {
  font-size: 10px;
  color: var(--text-muted);
  letter-spacing: 1px;
}

.header-center {
  flex: 1;
  max-width: 640px;
  margin: 0 24px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 2px;
  min-width: 200px;
  justify-content: flex-end;
}

.header-btn {
  color: var(--text-secondary) !important;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-size: 12px;
}
.header-btn:hover {
  color: var(--text-primary) !important;
}
</style>
