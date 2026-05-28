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
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 2px;
}

.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1px;
  background: rgba(240, 240, 250, 0.06);
}

.gallery-card {
  background: var(--bg-primary);
  overflow: hidden;
  cursor: pointer;
  transition: background 200ms;
}

.gallery-card:hover {
  background: rgba(240, 240, 250, 0.02);
}

.card-preview {
  height: 180px;
  background: rgba(240, 240, 250, 0.04);
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-placeholder {
  font-size: 48px;
  color: var(--text-muted);
  opacity: 0.2;
}

.card-info {
  padding: 20px;
}

.card-info h4 {
  font-size: 13px;
  font-weight: 700;
  margin-bottom: 6px;
  letter-spacing: 1px;
}

.card-info p {
  font-size: 11px;
  color: var(--text-muted);
  letter-spacing: 0.5px;
}
</style>
