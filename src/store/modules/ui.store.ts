import { defineStore } from 'pinia'

export type PanelId = 'prompt' | 'sceneGraph' | 'properties' | 'assets' | 'timeline' | 'export' | 'history'

export const useUIStore = defineStore('ui', () => {
  const theme = ref<'dark' | 'light'>('dark')
  const sidebarCollapsed = ref(false)
  const activePanel = ref<PanelId | null>('prompt')
  const panelVisible = ref<Record<PanelId, boolean>>({
    prompt: true,
    sceneGraph: false,
    properties: false,
    assets: false,
    timeline: false,
    export: false,
    history: false,
  })

  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  function togglePanel(panel: PanelId) {
    if (activePanel.value === panel) {
      // 点击当前活跃面板 → 关闭
      panelVisible.value[panel] = false
      activePanel.value = null
    } else {
      // 切换到新面板
      panelVisible.value[panel] = true
      activePanel.value = panel
    }
  }

  function openPanel(panel: PanelId) {
    panelVisible.value[panel] = true
    activePanel.value = panel
  }

  function closePanel(panel: PanelId) {
    panelVisible.value[panel] = false
    if (activePanel.value === panel) {
      activePanel.value = null
    }
  }

  function applyTheme() {
    document.documentElement.setAttribute('data-theme', theme.value)
  }

  function toggleTheme() {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
    applyTheme()
  }

  return {
    theme, sidebarCollapsed, activePanel, panelVisible,
    toggleSidebar, togglePanel, openPanel, closePanel, applyTheme, toggleTheme,
  }
})
