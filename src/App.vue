<template>
  <div class="app-shell">
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { useUIStore } from '@/store/modules/ui.store'

const uiStore = useUIStore()
uiStore.applyTheme()
</script>

<style scoped>
.app-shell {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--bg-primary);
}
</style>
