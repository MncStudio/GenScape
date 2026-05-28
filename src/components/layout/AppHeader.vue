<template>
  <header class="app-header">
    <div class="header-left">
      <router-link to="/" class="logo">
        <span class="logo-icon">&#9670;</span>
        <span class="logo-text">GenScape</span>
        <span class="logo-version">v0.1</span>
      </router-link>
    </div>

    <div class="header-center">
      <PromptPanel compact />
    </div>

    <div class="header-right">
      <el-button
        :icon="uiStore.sidebarCollapsed ? 'Expand' : 'Fold'"
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
  padding: 0 16px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-default);
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
  gap: 8px;
  text-decoration: none;
  color: var(--text-primary);
}

.logo-icon {
  color: var(--accent-primary);
  font-size: 18px;
}

.logo-text {
  font-size: 16px;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.logo-version {
  font-size: 10px;
  color: var(--text-muted);
  background: var(--bg-tertiary);
  padding: 2px 6px;
  border-radius: var(--radius-sm);
}

.header-center {
  flex: 1;
  max-width: 640px;
  margin: 0 24px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 4px;
  min-width: 200px;
  justify-content: flex-end;
}

.header-btn {
  color: var(--text-secondary);
}
</style>
