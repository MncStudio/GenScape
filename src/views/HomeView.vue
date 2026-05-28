<template>
  <div class="home">
    <div class="hero">
      <div class="hero-content">
        <h1 class="hero-title">GENSCAPE</h1>
        <p class="hero-subtitle">AI 驱动的数字孪生场景生成平台</p>
        <p class="hero-desc">输入自然语言，秒级生成可交互的 Three.js 工业 3D 场景</p>

        <div class="hero-actions">
          <router-link to="/editor">
            <el-button size="large" class="cta-btn">
              开始创建场景
              <el-icon><ArrowRight /></el-icon>
            </el-button>
          </router-link>
          <router-link to="/gallery">
            <el-button size="large" class="cta-btn--secondary">浏览画廊</el-button>
          </router-link>
        </div>

        <div class="hero-example">
          <span class="example-label">试试输入：</span>
          <code>"一个化工厂夜景，有储罐、管道、蓝色灯光、流动粒子效果"</code>
        </div>
      </div>
    </div>

    <section class="features">
      <div class="feature-card" v-for="f in features" :key="f.title">
        <el-icon :size="28" class="feature-icon"><component :is="f.icon" /></el-icon>
        <h3>{{ f.title }}</h3>
        <p>{{ f.desc }}</p>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const features = [
  { icon: 'MagicStick', title: 'AI 场景生成', desc: '自然语言描述 → 结构化 Scene DSL → 实时 Three.js 渲染' },
  { icon: 'Cpu', title: 'WebGPU 驱动', desc: '基于最新 WebGPU 标准，高性能粒子渲染，支持百万级粒子' },
  { icon: 'PictureFilled', title: '工业级画质', desc: 'PBR 材质 + Bloom 辉光 + 环境光遮蔽后期处理管线' },
  { icon: 'Download', title: '多格式导出', desc: '支持 JSON / GLB / 独立 HTML / 4K 截图导出' },
  { icon: 'Connection', title: '实时数据', desc: 'MQTT / WebSocket 数据接入，驱动场景动态更新' },
  { icon: 'Monitor', title: '大屏适配', desc: '科技风 HUD 界面，适合监控中心大屏展示' },
]
</script>

<style scoped>
.home {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  background: var(--bg-primary);
}

.hero {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 48px 24px;
}

.hero-content {
  text-align: center;
  max-width: 720px;
}

.hero-title {
  font-size: 64px;
  font-weight: 700;
  letter-spacing: 4px;
  margin-bottom: 20px;
  color: var(--text-primary);
}

.hero-subtitle {
  font-size: 16px;
  color: var(--text-secondary);
  margin-bottom: 8px;
  letter-spacing: 1px;
}

.hero-desc {
  font-size: 14px;
  color: var(--text-muted);
  margin-bottom: 40px;
  letter-spacing: 0.5px;
}

.hero-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-bottom: 36px;
}

.cta-btn {
  background: rgba(240, 240, 250, 0.1) !important;
  border: 1px solid rgba(240, 240, 250, 0.35) !important;
  color: var(--text-primary) !important;
  font-weight: 700;
  letter-spacing: 1.17px;
  padding: 14px 28px !important;
  border-radius: 32px !important;
  text-transform: uppercase;
  font-size: 13px;
}

.cta-btn:hover {
  background: rgba(240, 240, 250, 0.2) !important;
}

.cta-btn--secondary {
  background: transparent !important;
  border: 1px solid rgba(240, 240, 250, 0.15) !important;
  color: var(--text-secondary) !important;
  font-weight: 700;
  letter-spacing: 1.17px;
  padding: 14px 28px !important;
  border-radius: 32px !important;
  text-transform: uppercase;
  font-size: 13px;
}

.cta-btn--secondary:hover {
  border-color: rgba(240, 240, 250, 0.35) !important;
  color: var(--text-primary) !important;
}

.hero-example {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: rgba(240, 240, 250, 0.04);
  border: 1px solid rgba(240, 240, 250, 0.08);
  border-radius: var(--radius-sm);
}

.example-label {
  font-size: 11px;
  color: var(--text-muted);
  white-space: nowrap;
  letter-spacing: 0.5px;
}

.hero-example code {
  font-family: var(--font-mono);
  font-size: 13px;
  color: var(--text-secondary);
  text-transform: none;
  letter-spacing: normal;
}

.features {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1px;
  max-width: 1080px;
  margin: 0 auto;
  padding: 64px 24px 96px;
}

.feature-card {
  padding: 32px 24px;
  background: transparent;
  border: none;
  border-top: 1px solid rgba(240, 240, 250, 0.06);
}

.feature-card:hover {
  background: rgba(240, 240, 250, 0.02);
}

.feature-icon {
  color: var(--text-secondary);
  margin-bottom: 16px;
}

.feature-card h3 {
  font-size: 13px;
  font-weight: 700;
  margin-bottom: 8px;
  letter-spacing: 1.17px;
}

.feature-card p {
  font-size: 12px;
  color: var(--text-secondary);
  line-height: 1.6;
  letter-spacing: 0.5px;
}

@media (max-width: 768px) {
  .features {
    grid-template-columns: 1fr;
  }
}
</style>
