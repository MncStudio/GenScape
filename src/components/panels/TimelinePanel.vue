<template>
  <div class="timeline-panel">
    <!-- 标题栏 + 播放控制 -->
    <div class="panel-header">
      <span class="panel-title">时间轴</span>
      <div class="header-controls">
        <button
          :class="['ghost-btn', 'play-btn', { playing: isPlaying }]"
          :disabled="!hasAnimations"
          :title="isPlaying ? '暂停' : '播放'"
          @click="togglePlay"
        >
          {{ isPlaying ? 'II' : '▶' }}
        </button>
        <button
          class="ghost-btn stop-btn"
          :disabled="!isPlaying"
          title="停止"
          @click="stopAnimations"
        >
          ■
        </button>
      </div>
    </div>

    <!-- 进度条 -->
    <div class="progress-area">
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
      </div>
      <div class="progress-labels">
        <span class="progress-text">{{ progressLabel }}</span>
        <span class="fps-text">{{ store.fps }} FPS</span>
      </div>
    </div>

    <!-- 无动画提示 -->
    <div v-if="!hasAnimations" class="empty-state">
      <span class="empty-icon">⏱</span>
      <p>当前场景无动画配置</p>
      <p class="empty-hint">在 AI 生成时可指定物体动画和相机动画</p>
    </div>

    <!-- 动画列表 -->
    <div v-if="hasAnimations" class="anim-list">
      <!-- 相机动画 -->
      <div v-if="cameraAnim" class="anim-section">
        <div class="section-label">相机动画</div>
        <div :class="['anim-item', { active: cameraAnimActive }]">
          <span class="anim-icon">🎥</span>
          <div class="anim-info">
            <span class="anim-name">{{ cameraAnimLabel }}</span>
            <span class="anim-meta">{{ cameraAnimMeta }}</span>
          </div>
          <span :class="['anim-badge', cameraAnimActive ? 'badge-active' : 'badge-idle']">
            {{ cameraAnimActive ? '播放中' : '待机' }}
          </span>
        </div>
      </div>

      <!-- 物体动画 -->
      <div v-if="objectAnims.length" class="anim-section">
        <div class="section-label">
          物体动画 ({{ objectAnims.length }})
        </div>
        <div
          v-for="anim in objectAnims"
          :key="anim.id"
          :class="['anim-item', { active: objectAnimActive }]"
        >
          <span class="anim-icon">{{ animTypeIcon(anim.type) }}</span>
          <div class="anim-info">
            <span class="anim-name">{{ anim.targetId }}</span>
            <span class="anim-meta">
              {{ animTypeLabel(anim.type) }}
              <template v-if="anim.duration > 0">
                · {{ anim.duration }}s{{ anim.loop ? ' 循环' : '' }}
              </template>
              <template v-else>· 无限</template>
            </span>
          </div>
          <span :class="['anim-badge', objectAnimActive ? 'badge-active' : 'badge-idle']">
            {{ objectAnimActive ? '播放中' : '待机' }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSceneStore } from '@/store/modules/scene.store'
import { useScene } from '@/composables/useScene'
import type { CameraAnimationConfig, AnimationConfig } from '@/types/scene-dsl'

const store = useSceneStore()

// ---- 动画器引用（通过 GenScapeScene 实例获取） ----
function getScene() {
  return useScene().getInstance()
}

// ---- 播放状态 ----
const isPlaying = ref(false)
const progressPercent = ref(0)
const progressLabel = ref('00:00 / --:--')

// 轮询计时器，用于更新进度条
let progressTimer: ReturnType<typeof setInterval> | null = null

// ---- 计算属性 ----
const cameraAnim = computed<CameraAnimationConfig | null>(() => {
  return store.currentDSL?.camera.animation ?? null
})

const objectAnims = computed<AnimationConfig[]>(() => {
  return store.currentDSL?.animations ?? []
})

const hasAnimations = computed(() => {
  return !!(cameraAnim.value && cameraAnim.value.type !== 'static') || objectAnims.value.length > 0
})

const cameraAnimActive = computed(() => {
  return isPlaying.value && getScene()?.cameraAnimator?.isActive === true
})

const objectAnimActive = computed(() => {
  return isPlaying.value && getScene()?.objectAnimator?.isActive === true
})

// ---- 播放控制 ----
function togglePlay() {
  const scene = getScene()
  if (!scene) return

  if (isPlaying.value) {
    pauseAnimations()
  } else {
    startAnimations()
  }
}

function startAnimations() {
  const scene = getScene()
  if (!scene) return

  const hasCamera = cameraAnim.value && cameraAnim.value.type !== 'static'
  const hasObject = objectAnims.value.length > 0

  if (!hasCamera && !hasObject) return

  // 重新加载动画配置（因为 DSL 可能已更新）
  if (hasCamera && cameraAnim.value) {
    scene.cameraAnimator.setConfig(cameraAnim.value)
    scene.cameraAnimator.start()
  }
  if (hasObject && objectAnims.value.length > 0) {
    scene.objectAnimator.setAnimations(objectAnims.value)
    scene.objectAnimator.start()
  }

  isPlaying.value = true
  startProgressTimer()
}

function pauseAnimations() {
  const scene = getScene()
  if (!scene) return
  scene.cameraAnimator.stop()
  scene.objectAnimator.stop()
  isPlaying.value = false
  stopProgressTimer()
}

function stopAnimations() {
  const scene = getScene()
  if (!scene) return
  scene.cameraAnimator.stop()
  scene.objectAnimator.stop()
  isPlaying.value = false
  progressPercent.value = 0
  progressLabel.value = '00:00 / --:--'
  stopProgressTimer()
}

// ---- 进度条轮询 ----
function startProgressTimer() {
  stopProgressTimer()
  progressTimer = setInterval(updateProgress, 200)
}

function stopProgressTimer() {
  if (progressTimer !== null) {
    clearInterval(progressTimer)
    progressTimer = null
  }
}

function updateProgress() {
  // 简单的时间指示器：根据动画总时长展示进度
  const maxDuration = Math.max(
    ...objectAnims.value.map(a => a.duration).filter(d => d > 0),
    0,
  )

  if (maxDuration > 0) {
    // 基于 elapsed 计算进度（约每 200ms 前进一次）
    const elapsed = progressPercent.value * maxDuration / 100 + 0.2
    if (elapsed >= maxDuration) {
      // 检查是否所有非循环动画已结束，循环动画则重置
      const hasLooping = objectAnims.value.some(a => a.loop && a.duration > 0)
      if (hasLooping) {
        progressPercent.value = 0
        progressLabel.value = formatTime(0, maxDuration)
        return
      } else {
        progressPercent.value = 100
        progressLabel.value = formatTime(maxDuration, maxDuration)
        return
      }
    }
    progressPercent.value = Math.min((elapsed / maxDuration) * 100, 100)
    const currentSec = (progressPercent.value / 100) * maxDuration
    progressLabel.value = formatTime(currentSec, maxDuration)
  } else {
    // 无限动画，显示呼吸式进度条
    progressPercent.value = 50 + Math.sin(Date.now() / 1000) * 30
    progressLabel.value = '∞'
  }
}

function formatTime(current: number, total: number): string {
  const pad = (n: number) => String(Math.floor(n)).padStart(2, '0')
  return `${pad(current / 60)}:${pad(current % 60)} / ${pad(total / 60)}:${pad(total % 60)}`
}

// ---- 清理 ----
onUnmounted(() => {
  stopProgressTimer()
})

// ---- 监听 DSL 变化，自动更新动画配置 ----
watch(
  () => store.currentDSL,
  (newDSL) => {
    if (!newDSL) {
      stopAnimations()
      return
    }
    const scene = getScene()
    if (!scene) return

    // 更新 objectAnimator 的 objectMap（场景重建后物体引用已变化）
    scene.objectAnimator.setObjectMap(scene.getObjectMap())

    // 设置相机动画
    if (newDSL.camera.animation) {
      scene.cameraAnimator.setConfig(newDSL.camera.animation)
      if (newDSL.camera.animation.autoStart) {
        scene.cameraAnimator.start()
        if (newDSL.animations?.length) {
          scene.objectAnimator.setAnimations(newDSL.animations)
          scene.objectAnimator.start()
        }
        isPlaying.value = true
        startProgressTimer()
      } else {
        // 非自动启动时停止之前的动画
        scene.cameraAnimator.stop()
        scene.objectAnimator.stop()
        isPlaying.value = false
        stopProgressTimer()
      }
    } else {
      scene.cameraAnimator.stop()
    }

    if (newDSL.animations?.length) {
      scene.objectAnimator.setAnimations(newDSL.animations)
    } else {
      scene.objectAnimator.stop()
    }

    if (!cameraAnim.value && !objectAnims.value.length) {
      isPlaying.value = false
    }
  },
)

// ---- 工具函数 ----
function animTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    rotate: '旋转',
    translate: '平移',
    scale: '缩放',
    pulse: '脉冲',
  }
  return labels[type] ?? type
}

function animTypeIcon(type: string): string {
  const icons: Record<string, string> = {
    rotate: '🔄',
    translate: '↔',
    scale: '📐',
    pulse: '💫',
  }
  return icons[type] ?? '✨'
}

const cameraAnimLabel = computed(() => {
  if (!cameraAnim.value) return ''
  const labels: Record<string, string> = {
    orbit: '轨道环绕',
    flythrough: '飞行穿越',
    static: '静态',
  }
  return labels[cameraAnim.value.type] ?? cameraAnim.value.type
})

const cameraAnimMeta = computed(() => {
  const a = cameraAnim.value
  if (!a) return ''
  const parts: string[] = []
  if (a.type === 'orbit') {
    parts.push(`半径 ${a.radius ?? 20}m`)
    parts.push(`高度 ${a.height ?? 12}m`)
    parts.push(`速度 ${a.speed ?? 0.2}`)
  } else if (a.type === 'flythrough') {
    const wp = a.waypoints?.length ?? 0
    parts.push(`${wp} 个航点`)
    parts.push(`速度 ${a.speed ?? 0.2}`)
  }
  parts.push(a.autoStart ? '自动播放' : '手动播放')
  return parts.join(' · ')
})
</script>

<style scoped>
.timeline-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  font-size: 12px;
}

/* ---- 标题栏 ---- */
.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 8px 4px;
  border-bottom: 1px solid var(--border-default);
}

.panel-title {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-primary);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.header-controls {
  display: flex;
  gap: 4px;
}

.ghost-btn {
  width: 28px;
  height: 28px;
  border: 1px solid var(--border-active);
  border-radius: var(--radius-lg);
  background: var(--el-button-bg-color);
  color: var(--text-primary);
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 150ms ease;
}

.ghost-btn:hover:not(:disabled) {
  background: rgba(240, 240, 250, 0.2);
  border-color: rgba(240, 240, 250, 0.5);
}

.ghost-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
  border-color: rgba(240, 240, 250, 0.08);
}

.play-btn.playing {
  background: rgba(240, 240, 250, 0.15);
  border-color: rgba(240, 240, 250, 0.5);
}

/* ---- 进度条 ---- */
.progress-area {
  padding: 8px 8px 4px;
}

.progress-bar {
  height: 3px;
  background: rgba(240, 240, 250, 0.08);
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--accent-primary);
  border-radius: 2px;
  transition: width 200ms linear;
}

.progress-labels {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 4px;
}

.progress-text {
  font-size: 10px;
  color: var(--text-muted);
  font-family: var(--font-mono);
}

.fps-text {
  font-size: 10px;
  color: var(--text-muted);
  font-family: var(--font-mono);
}

/* ---- 无动画提示 ---- */
.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 24px 16px;
  color: var(--text-muted);
}

.empty-icon {
  font-size: 32px;
  margin-bottom: 12px;
  opacity: 0.3;
}

.empty-state p {
  margin: 0;
  font-size: 12px;
  line-height: 1.6;
}

.empty-hint {
  font-size: 11px !important;
  color: var(--text-muted);
  opacity: 0.6;
  margin-top: 4px !important;
  max-width: 220px;
}

/* ---- 动画列表 ---- */
.anim-list {
  flex: 1;
  overflow-y: auto;
  padding-bottom: 8px;
}

.anim-section {
  margin-top: 4px;
}

.section-label {
  font-size: 10px;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 4px 8px 2px;
}

.anim-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  border: 1px solid transparent;
  transition: all 100ms ease;
}

.anim-item:hover {
  background: var(--bg-tertiary);
}

.anim-item.active {
  background: rgba(240, 240, 250, 0.06);
  border-color: rgba(240, 240, 250, 0.2);
  color: var(--text-primary);
}

.anim-icon {
  font-size: 14px;
  flex-shrink: 0;
}

.anim-info {
  flex: 1;
  min-width: 0;
}

.anim-name {
  display: block;
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.anim-meta {
  font-size: 10px;
  color: var(--text-muted);
}

.anim-badge {
  flex-shrink: 0;
  font-size: 9px;
  padding: 1px 6px;
  border-radius: 3px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.badge-active {
  background: rgba(16, 185, 129, 0.15);
  color: var(--accent-success);
  border: 1px solid rgba(16, 185, 129, 0.25);
}

.badge-idle {
  background: transparent;
  color: var(--text-muted);
  border: 1px solid var(--border-default);
}
</style>
