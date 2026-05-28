<template>
  <div class="gallery-page">
    <div class="gallery-header">
      <router-link to="/">
        <el-button text><el-icon><ArrowLeft /></el-icon> 返回</el-button>
      </router-link>
      <h2>场景画廊</h2>
      <div />
    </div>

    <div class="gallery-grid">
      <div class="gallery-card" v-for="item in galleryItems" :key="item.name">
        <div class="card-preview">
          <span class="card-placeholder">{{ item.name[0] }}</span>
        </div>
        <div class="card-info">
          <h4>{{ item.name }}</h4>
          <p>{{ item.prompt }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const galleryItems = [
  { name: '化工厂夜景', prompt: '储罐、管道、蓝色灯光、流动粒子' },
  { name: '变电站', prompt: '变压器、输电线塔、围栏、白天' },
  { name: '智慧园区', prompt: '现代建筑、绿化带、道路、路灯' },
]
</script>

<style scoped>
.gallery-page {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  padding: 24px;
}

.gallery-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 32px;
}

.gallery-header h2 {
  font-size: 20px;
  font-weight: 600;
}

.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

.gallery-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  overflow: hidden;
  cursor: pointer;
  transition: border-color 150ms;
}

.gallery-card:hover {
  border-color: var(--border-active);
}

.card-preview {
  height: 180px;
  background: var(--bg-tertiary);
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-placeholder {
  font-size: 48px;
  color: var(--text-muted);
  opacity: 0.3;
}

.card-info {
  padding: 16px;
}

.card-info h4 {
  font-size: 14px;
  margin-bottom: 4px;
}

.card-info p {
  font-size: 12px;
  color: var(--text-muted);
}
</style>
