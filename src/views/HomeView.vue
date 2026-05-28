<template>
  <div class="home">
    <div class="hero">
      <div class="hero-bg" />
      <div class="hero-content">
        <h1 class="hero-title">
          <span class="hero-accent">GenScape</span>
        </h1>
        <p class="hero-subtitle">AI 驱动的数字孪生场景生成平台</p>
        <p class="hero-desc">输入自然语言，秒级生成可交互的 Three.js 工业 3D 场景</p>

        <div class="hero-actions">
          <router-link to="/editor">
            <el-button type="primary" size="large" class="cta-btn">
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
}

.hero {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 48px 24px;
}

.hero-bg {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at 50% 50%, rgba(0, 212, 255, 0.06) 0%, transparent 70%),
              radial-gradient(ellipse at 80% 20%, rgba(99, 102, 241, 0.04) 0%, transparent 50%);
}

.hero-content {
  position: relative;
  text-align: center;
  max-width: 720px;
}

.hero-title {
  font-size: 56px;
  font-weight: 700;
  letter-spacing: -2px;
  margin-bottom: 16px;
}

.hero-accent {
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: 20px;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.hero-desc {
  font-size: 15px;
  color: var(--text-muted);
  margin-bottom: 36px;
}

.hero-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-bottom: 32px;
}

.cta-btn {
  background: var(--accent-primary) !important;
  border-color: var(--accent-primary) !important;
  color: #000 !important;
  font-weight: 600;
  padding: 12px 28px !important;
}

.cta-btn--secondary {
  background: transparent !important;
  border-color: var(--border-default) !important;
  color: var(--text-secondary) !important;
}

.hero-example {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
}

.example-label {
  font-size: 12px;
  color: var(--text-muted);
  white-space: nowrap;
}

.hero-example code {
  font-family: var(--font-mono);
  font-size: 13px;
  color: var(--accent-primary);
}

.features {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  max-width: 1080px;
  margin: 0 auto;
  padding: 64px 24px 96px;
}

.feature-card {
  padding: 24px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
}

.feature-card:hover {
  border-color: var(--border-active);
}

.feature-icon {
  color: var(--accent-primary);
  margin-bottom: 12px;
}

.feature-card h3 {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 6px;
}

.feature-card p {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.6;
}

@media (max-width: 768px) {
  .features {
    grid-template-columns: 1fr;
  }
}
</style>
