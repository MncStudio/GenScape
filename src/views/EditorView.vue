<template>
  <div class="editor-layout">
    <AppHeader />
    <div class="editor-body">
      <AppSidebar />
      <main class="editor-main">
        <SceneViewport />
      </main>
    </div>
    <StatusBar />
  </div>
</template>

<script setup lang="ts">
import AppHeader from '@/components/layout/AppHeader.vue'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import StatusBar from '@/components/layout/StatusBar.vue'
import SceneViewport from '@/components/scene/SceneViewport.vue'
</script>

<style scoped>
.editor-layout {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
}

.editor-body {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.editor-main {
  flex: 1;
  position: relative;
  overflow: hidden;
  background: var(--bg-primary);
}
</style>
