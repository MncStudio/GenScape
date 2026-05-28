# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

GenScape — AI 驱动的数字孪生场景生成平台。用户输入自然语言描述，经 LLM 增强后生成 Scene DSL JSON，再由 Three.js 渲染为可交互的 3D 工业场景。

## 常用命令

```bash
npm run dev          # 开发服务器 (端口 5173, host: true)
npm run build        # 类型检查 + 构建
npm run preview      # 预览构建产物
npm run typecheck    # 仅类型检查 (vue-tsc --noEmit)
npm run lint         # ESLint
npm run test         # Vitest 单元测试
npm run test:e2e     # Playwright E2E 测试
```

## 技术栈

- **Vue 3.5** + **TypeScript 5.6** + **Vite 6**
- **Pinia** 状态管理, **Vue Router 4** 路由
- **Three.js 0.173** (WebGPU 优先，WebGL 回退)
- **Element Plus 2.9** UI 组件库
- **AI**: DeepSeek / Claude，通过 `openai` 和 `@anthropic-ai/sdk`

## 构建配置

- `unplugin-auto-import` 自动导入 `vue`, `vue-router`, `pinia` 方法，生成 `src/auto-imports.d.ts`
- `unplugin-vue-components` + `ElementPlusResolver()` 自动导入 Element Plus 组件，生成 `src/components.d.ts`
- `@` 别名映射到 `src/`
- `.vue` 文件中可直接使用 `ref`, `computed`, `watch` 等，无需手动 import
- `.env` 配置 AI provider 和 API key

## 架构

**两阶段 AI 生成管线**:
```
用户输入 → AIService.enhancePrompt() (增强描述, 1024 tokens)
        → AIService.generateSceneDSL() (生成 JSON, 16384 tokens)
        → responseValidator.validateAndFixSceneDSL() (校验/修复/填默认值)
        → SceneDSL (类型定义于 src/types/scene-dsl.ts)
```

**AI 模块** (`src/ai/`):
- `AIService.ts` — 统一接口，Provider 模式 (DeepSeek/Claude)
- `prompts/enhancer.ts` — Prompt 增强系统提示词
- `prompts/sceneGenerator.ts` — Scene DSL 生成系统提示词 + 输出格式规范
- `providers/` — DeepSeekProvider 和 ClaudeProvider，实现 `AIProvider` 接口
- `responseValidator.ts` — JSON 提取、截断修复、字段默认值填充

**Scene DSL** (`src/types/scene-dsl.ts`):
- 核心协议：`SceneDSL` 包含 `scene`, `objects`, `lights`, `particles`, `camera`, `postprocessing`
- 支持的物体类型: `storage_tank`, `pipe_segment`, `platform`, `building`, `cooling_tower`, `pipe_rack`, `flare_stack`, `heat_exchanger`, `pump`, `valve_group`
- 灯光类型: `ambient`, `hemisphere`, `directional`, `point`, `spot`, `rect`
- 粒子类型: `pipe_flow`, `steam`, `spark`, `indicator`, `ambient_dust`
- **设计原则**: 代码不做任何默认/fallback 处理，灯光和场景完全由 AI 返回决定

**Three.js 渲染层** (`src/three/`):
- `GenScapeScene.ts` — 主控制器，管理 scene/camera/renderer/controls 生命周期
- `RendererFactory.ts` — WebGPU/WebGL 自动检测、渲染器创建、无默认灯光场景、FogExp2 雾
- `SceneBuilder.ts` — 消费 SceneDSL，依次构建: 环境 → 灯光 → 物体 → 粒子 → 地面
- `objects/` — Factory 模式：`BaseFactory` 抽象类 → 具体工厂 (StorageTank, Pipe, Platform, Building, CoolingTower)，通过 `objects/index.ts` 注册表创建
- `lighting/LightManager.ts` — 按 DSL 创建/管理灯光，不做 fallback
- `particles/ParticleSystem.ts` — ShaderMaterial 粒子系统，支持管道路径流动等发射器
- `postprocessing/BloomComposer.ts` — WebGL Only 的 Bloom 后处理

**工厂模式** (`src/three/objects/BaseFactory.ts`):
- `applyMaterial(mesh, matDef)` 创建 `MeshStandardMaterial`，颜色来自 AI
- `setTransform(obj, spec)` 设置 position/rotation/scale
- 子 mesh 先用裸 `new THREE.MeshStandardMaterial()` 创建（默认白色），再通过 `applyMaterial()` 覆盖
- 未设置 `side` 属性，默认 `FrontSide`（背面不可见）

**状态管理** (`src/store/modules/`):
- `scene.store.ts` — DSL 数据、场景图、选中状态、FPS
- `prompt.store.ts` — 输入历史、增强状态、预设模板
- `ui.store.ts` — 主题、侧边栏、面板切换 (radio 行为: 点击活跃面板关闭，否则切换)

**Composables** (`src/composables/`):
- `useScene.ts` — GenScapeScene 单例，封装 init/loadDSL/resize/destroy
- `useAI.ts` — AIService 单例，封装 generate/modifyObject/modifyLight

**视图结构**:
- `/` → HomeView (首页)
- `/editor` → EditorView (主编辑器：Header + Sidebar + SceneViewport + StatusBar)
- `/gallery` → GalleryView
- `/settings` → SettingsView

## 关键设计约束

- 坐标系 Y 轴向上，单位米
- 场景大小 80m x 80m 以内，物体位置钳制在 [-35, 35] 范围（responseValidator 强制）
- 灯光完全由 AI 返回的 `lights` 数组决定，不做任何默认/fallback/清理
- FogExp2 默认密度 0.00015（~58% 可见度 at 60m）
- ACESFilmicToneMapping，曝光 1.2(WebGL) / 1.5(WebGPU)
- PMREMGenerator 程序化环境贴图（#8899cc 天空色），为 PBR 材质提供 IBL 反射
- 相机: near=0.1, far=500, OrbitControls minDistance=3, maxDistance=80
- 粒子数量限制 1000-5000

## UI 设计规范

- 参考 SpaceX 设计语言，完整规范见 [docs/design/spacex/](docs/design/spacex/)
  - 纯黑背景 (#000000)，Spectral White 文字 (#f0f0fa)
  - 全局 uppercase + 正 letter-spacing（1px-4px）
  - Ghost 按钮：rgba(240,240,250,0.1) 背景 + rgba(240,240,250,0.35) 边框，32px 圆角
  - 零阴影、零装饰元素，无扫描线/角标
  - 色彩变量定义在 [src/assets/styles/variables.css](src/assets/styles/variables.css)
  - Element Plus 暗色覆盖在 variables.css 末尾 (--el-* 变量)

## 用户偏好

- 始终使用中文回复
- Git 提交作者使用 Mnc
- 仅用户明确要求时才提交/推送
- 任何代码修改都要同步更新以下三个文件（如涉及）：
  - `CLAUDE.md` — 架构/约束变更
  - `package.json` — 依赖变更
  - `docs/TODO.md` — 任务完成/新增状态
