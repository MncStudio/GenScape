# GenScape — AI 驱动的数字孪生场景生成平台

<p align="center">
  <strong>输入自然语言 → 生成可交互 Three.js 3D 工业场景</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/vue-3.5-blue" />
  <img src="https://img.shields.io/badge/three-0.170-green" />
  <img src="https://img.shields.io/badge/typescript-5.6-blue" />
  <img src="https://img.shields.io/badge/license-MIT-green" />
</p>

---

## 1. 项目简介

### 1.1 项目背景

工业数字孪生正在从"定制开发"走向"智能生成"。当前数字孪生项目面临三大痛点：

- **成本高**：单个场景开发周期 2-6 个月，需要三维建模师 + 前端 + 后端团队
- **灵活性差**：场景硬编码，需求变更意味着大量返工
- **智能化弱**：场景只是静态可视化，缺乏语义理解和主动生成能力

与此同时，大语言模型（LLM）的代码生成和结构化输出能力已经具备产品级可用性。Three.js 作为 Web 3D 事实标准，拥有完善的生态和渲染能力。两者的结合将彻底改变数字孪生的生产方式。

### 1.2 为什么 AI + Three.js 有价值

| 维度 | 传统方式 | GenScape |
|------|---------|----------|
| 场景构建 | 手动建模+编码，2-6月 | 自然语言输入，秒级生成 |
| 修改成本 | 需开发介入，数天 | 对话式调整，实时生效 |
| 资产复用 | 低，项目耦合 | 高，组件化场景图谱 |
| 语义层 | 无，纯几何体 | 每个物体带有语义标签 |

Three.js 的优势在于 Web 原生、社区成熟、可渲染到 WebGL/WebGPU，天然适合作为 AI 生成的渲染目标。

### 1.3 应用场景

- **智慧工厂**：生产线、仓储、管廊的数字孪生
- **智慧园区**：建筑群、道路、绿化的可视化
- **能源行业**：变电站、风电场、光伏阵列的巡检场景
- **应急演练**：火灾、泄漏等事故场景的快速构建
- **方案汇报**：甲方沟通时实时调整场景，所见即所得
- **教育培训**：工业设备操作培训场景

### 1.4 产品目标

- **第一阶段**：单个开发者能在 30 秒内生成一个可交互的工业三维场景
- **第二阶段**：场景可导出为标准化 JSON，支持二次开发和平台集成
- **第三阶段**：成为数字孪生场景的"Midjourney 时刻"——输入描述，生成世界

---

## 2. 功能设计

### 2.1 MVP 功能（第一阶段 v0.1—v0.3）

#### 2.1.1 Prompt 输入与增强

```
用户输入："一个化工厂夜景，有储罐、管道、蓝色灯光"
↓ AI Prompt 增强器
增强输出："一个化工厂夜间场景，包含 5 个圆柱形储罐（不锈钢材质）、
复杂的管道网络（直径 0.3m）、蓝色点光源（色温 10000K）、
粒子流动效果（沿管道走向）、工业平台底座、深色夜空背景"
```

功能点：
- 自然语言输入框 + 快捷模板（"化工厂"、"变电站"、"智慧园区"）
- AI Prompt 自动增强（补充细节、规格化描述）
- 历史 Prompt 记录

#### 2.1.2 AI 解析引擎

将自然语言或增强 Prompt 转换为结构化场景 JSON（Scene DSL）。

```
自然语言 → LLM (DeepSeek / Claude) → Scene DSL JSON → Three.js 渲染器
```

核心能力：
- 物体类型识别（储罐→Cylinder, 管道→Tube, 建筑→Box）
- 空间关系推理（"储罐旁边有管道"→相对位置计算）
- 材质推断（"不锈钢"→Metalness: 0.9, Roughness: 0.3）
- 灯光参数推断（"蓝色"→color: #4488ff, intensity: 2.0）
- 特效匹配（"流动粒子"→ParticleFlowEmitter）

#### 2.1.3 Three.js 场景生成器

- 基于 Scene DSL JSON 动态创建场景图
- 工业模型组件库（储罐、管道、阀门、平台、围栏）
- 程序化生成（管道布线算法、储罐阵列布局）
- 材质系统（PBR 金属、粗糙度、环境贴图）
- 阴影系统（PCFSoftShadowMap）

#### 2.1.4 灯光系统

- 环境光 + 半球光（基础照明）
- 点光源（设备照明、氛围光）
- 聚光灯（重点区域高亮）
- 矩形光（大面积柔光）
- 支持光晕/辉光后期效果（UnrealBloomPass）
- AI 自动布光策略（三级：主光→补光→氛围光）

#### 2.1.5 粒子系统

- 流动粒子（沿管道/路径运动）
- 蒸汽/烟雾（储罐顶部、冷却塔）
- 火花/焊接光点
- 星空背景粒子
- 状态指示粒子（绿色=正常, 红色=告警）
- 基于 BufferGeometry + ShaderMaterial 的高性能实现

#### 2.1.6 标签系统

- CSS2DRenderer 驱动的 HTML 标签
- 智能避让（标签不重叠）
- 设备名称、温度、压力等数据绑定
- 标签 LOD（远处隐藏，近处显示详细信息）

#### 2.1.7 JSON 场景配置

完整 Scene DSL 规范，包含：

```json
{
  "version": "1.0",
  "metadata": { "name": "...", "prompt": "...", "created": "..." },
  "scene": { "background": "...", "fog": {...}, "environment": "..." },
  "objects": [...],
  "lights": [...],
  "particles": [...],
  "labels": [...],
  "camera": { "initial": {...}, "animation": {...} },
  "postprocessing": {...}
}
```

#### 2.1.8 场景导出

- 导出为 `.genscape.json`（完整场景配置）
- 导出为 GLTF/GLB（标准 3D 格式）
- 导出为独立 HTML 文件（自包含，可直接打开）
- 截图导出（PNG 4K）

### 2.2 第二阶段功能（v0.4—v1.0）

| 功能 | 说明 |
|------|------|
| WebGPU 渲染后端 | 渐进式迁移，检测浏览器能力自动切换 |
| AI 自动布局引擎 | LLM + 约束求解器，自动计算最优物体位置 |
| 工业模型资产库 | 100+ 标准化模型，带语义标注，支持检索匹配 |
| 实时天气联动 | 接入天气 API，场景光照/天空自动匹配真实天气 |
| 视频巡检动画 | 沿自定义路径的相机飞行，导出为视频 |
| 数字人讲解 | 3D 数字人角色，TTS 语音讲解场景 |
| 多场景联动 | 场景切换动画，区域地图 + 场景卡片 |
| 数据绑定 | 接入实时数据源（MQTT/WebSocket），驱动场景动态更新 |
| 协同编辑 | 多人同时编辑场景布局 |
| SDK 开放 | npm 包 `@genscape/core`，供第三方集成 |

---

## 3. 技术架构

### 3.1 技术选型

| 层级 | 技术 | 选型原因 |
|------|------|----------|
| 框架 | Vue 3 (Composition API) | 响应式系统天然适合驱动 3D 场景状态；生态成熟 |
| 构建 | Vite 5 | 毫秒级 HMR，原生 ESM，Three.js Tree Shaking |
| 3D 引擎 | Three.js r170+ | Web 3D 事实标准，社区最大，WebGPU 支持 |
| 3D 封装 | TresJS | Vue 3 声明式 Three.js，reactive scene graph |
| 类型 | TypeScript strict | Scene DSL 类型安全，AI JSON 输出校验 |
| AI | DeepSeek API (主) / Claude API (备) | DeepSeek 成本低适合高频调用，Claude 长上下文适合复杂场景 |
| 状态 | Pinia | Vue 3 官方推荐，DevTools 支持，模块化 |
| UI | Element Plus + 自定义 HUD | 企业级组件库 + 游戏化 HUD 覆盖层 |
| 路由 | Vue Router 4 | SPA 页面切换 |
| 国际化 | vue-i18n | 预留中英文切换 |
| 测试 | Vitest + Playwright | 单元 + E2E |
| 部署 | Docker + Nginx / Vercel | 灵活部署方案 |

### 3.2 架构图

```
┌─────────────────────────────────────────────────────────┐
│                      Browser (Client)                    │
│  ┌───────────┐  ┌───────────┐  ┌────────────────────┐  │
│  │  Vue 3 UI │  │  Pinia    │  │  Three.js Renderer │  │
│  │  (Element │  │  (State)  │  │  ┌───────────────┐ │  │
│  │   Plus)   │  │           │  │  │ TresJS Layer  │ │  │
│  │           │  │           │  │  │ (Vue ↔ Three) │ │  │
│  └─────┬─────┘  └─────┬─────┘  │  └───────┬───────┘ │  │
│        │              │         │  ┌───────┴───────┐ │  │
│  ┌─────┴──────────────┴─────┐   │  │ WebGL/WebGPU  │ │  │
│  │    Scene DSL Parser      │   │  │  Backend      │ │  │
│  │  (JSON → Scene Graph)    │◄──┤  └───────────────┘ │  │
│  └───────────┬──────────────┘   └────────────────────┘  │
│              │                                           │
│  ┌───────────┴──────────────┐                           │
│  │   AI Service (API Layer) │                           │
│  │   - Prompt Enhancer      │                           │
│  │   - Scene Generator      │                           │
│  │   - Label Generator      │                           │
│  └───────────┬──────────────┘                           │
└──────────────┼──────────────────────────────────────────┘
               │ HTTPS (SSE Stream)
┌──────────────┴──────────────────────────────────────────┐
│                   API Gateway / Edge                     │
│  ┌───────────────────┐  ┌────────────────────────────┐  │
│  │  DeepSeek API     │  │  Claude API (Anthropic)     │  │
│  │  - deepseek-chat  │  │  - claude-sonnet-4-6       │  │
│  │  - prompt enhance │  │  - complex scene generation │  │
│  └───────────────────┘  └────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Scene Cache / Asset CDN                         │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### 3.3 模块划分

```
┌────────────────────────────────────────────┐
│              App Shell                      │
│  ┌──────────┐ ┌──────────┐ ┌────────────┐  │
│  │ Prompt   │ │ Scene    │ │ Asset      │  │
│  │ Panel    │ │ Viewport │ │ Library    │  │
│  └──────────┘ └──────────┘ └────────────┘  │
│  ┌──────────┐ ┌──────────┐ ┌────────────┐  │
│  │ Timeline │ │ Property │ │ Export     │  │
│  │ Panel    │ │ Panel    │ │ Panel      │  │
│  └──────────┘ └──────────┘ └────────────┘  │
└────────────────────────────────────────────┘

核心 Pipeline:
Prompt → AI Service → Scene DSL → Scene Builder → Render Loop
                                  ↓
                            Pinia Store ← → UI Panels
```

---

## 4. Three.js 场景结构设计

### 4.1 场景核心层级

```typescript
// 场景管理器核心结构
interface GenScapeScene {
  // --- 基础 ---
  scene: THREE.Scene                    // 根场景
  camera: THREE.PerspectiveCamera       // 主相机
  renderer: THREE.WebGLRenderer         // 渲染器 (WebGL/WebGPU)
  controls: CameraControls              // 轨道控制 (MapControls)

  // --- 光照层级 ---
  lighting: {
    ambient: THREE.AmbientLight         // 环境光 (基础亮度)
    hemisphere: THREE.HemisphereLight   // 半球光 (天空/地面)
    directional: THREE.DirectionalLight // 太阳光 (阴影投射)
    points: THREE.PointLight[]          // 点光源数组
    spots: THREE.SpotLight[]            // 聚光灯数组
    rects: THREE.RectAreaLight[]        // 矩形光数组
  }

  // --- 特效 ---
  effects: {
    bloom: UnrealBloomPass              // 辉光后期
    particles: ParticleSystem           // 粒子管理器
    fog: THREE.FogExp2                  // 指数雾
  }

  // --- 场景元素 ---
  objects: Map<string, IndustrialObject>  // 所有工业物体
  labels: CSS2DRenderer                 // 标签渲染器
  raycasting: RaycasterManager          // 点击检测
}
```

### 4.2 动态场景生成流程

```
Scene DSL JSON
    │
    ▼
┌─────────────────┐
│  SceneBuilder    │   遍历 objects[]
│  .build(DSL)     │──► 匹配 ModelFactory
└─────────────────┘
    │
    ├──► StorageTankFactory    → Cylinder + PipeGroup
    ├──► PipeNetworkFactory    → CatmullRomCurve3 → TubeGeometry
    ├──► BuildingFactory       → BoxGeometry + WindowTexture
    ├──► PlatformFactory       → ExtrudeGeometry + Grid
    ├──► LightFactory          → 根据 type 创建对应光源
    ├──► ParticleFactory       → BufferGeometry + CustomShader
    └──► LabelFactory          → CSS2DObject + Sprite
```

### 4.3 工业物体工厂示例

```typescript
// 储罐生成器
class StorageTankFactory {
  static create(spec: TankSpec): THREE.Group {
    const group = new THREE.Group()

    // 罐体
    const body = new THREE.Mesh(
      new THREE.CylinderGeometry(spec.radius, spec.radius, spec.height, 64),
      new THREE.MeshStandardMaterial({
        color: spec.color,
        metalness: 0.85,
        roughness: 0.25,
      })
    )
    group.add(body)

    // 顶部穹顶
    const dome = new THREE.Mesh(
      new THREE.SphereGeometry(spec.radius * 1.02, 64, 32, 0, Math.PI * 2, 0, Math.PI / 3),
      new THREE.MeshStandardMaterial({ /* same as body */ })
    )
    dome.position.y = spec.height / 2
    group.add(dome)

    // 液位指示环
    // 连接法兰
    // 铭牌标签
    return group
  }
}
```

### 4.4 粒子系统设计

```typescript
interface ParticleEmitter {
  type: 'flow' | 'steam' | 'spark' | 'indicator' | 'ambient'
  geometry: 'pipe_path' | 'cone' | 'sphere' | 'box'
  count: number
  speed: number
  lifetime: number
  color: THREE.Color
  size: number
  texture?: string
}

class ParticleManager {
  emitters: Map<string, ParticleEmitter>

  createFlowParticles(path: THREE.Curve3, config: FlowConfig): Points
  createSteamParticles(origin: Vector3, config: SteamConfig): Points
  update(deltaTime: number): void  // 每帧更新所有发射器
}
```

粒子使用 GPU 驱动（ShaderMaterial + BufferGeometry），单个发射器承载 10,000+ 粒子在移动端仍维持 60fps。

### 4.5 后期处理管线

```
Render Target
    │
    ▼
┌──────────────┐
│ RenderPass    │  场景主渲染
└──────┬───────┘
       ▼
┌──────────────┐
│ EffectComposer│
│  ├─ BloomPass │  辉光效果 (蓝色灯光泛光)
│  ├─ SAOPass   │  环境光遮蔽 (物体立体感)
│  ├─ Afterimage│  残影效果 (动感)
│  └─ SMAAPass  │  抗锯齿
└──────┬───────┘
       ▼
    Screen
```

---

## 5. AI Prompt 设计

### 5.1 核心思路

采用 **两步生成策略**，分离"意图理解"和"场景生成"：

```
Step 1: Prompt Enhancement
  "化工厂夜景" → 增强为详细场景描述

Step 2: Scene DSL Generation
  详细描述 → 结构化 JSON (Scene DSL)
```

### 5.2 Step 1 — Prompt 增强器

**System Prompt:**

```
你是一个工业数字孪生场景设计专家。用户会描述他们想要的3D场景，你需要将简短的描述增强为详细的场景规格说明。

增强规则：
1. 补充物体数量、材质、颜色、尺寸
2. 补充灯光类型、颜色、强度、位置
3. 补充粒子效果类型和参数
4. 补充环境设置（天空、雾、地面）
5. 保持工业专业术语
6. 不要编造用户没提到的物体类型

输出格式：纯文本描述，结构清晰。
```

**示例：**

输入：`一个化工厂夜景，有储罐、管道、蓝色灯光`

输出：
```
场景类型：化工厂夜景
环境：深蓝黑色夜空，工业雾效（淡蓝色，浓度0.15），深灰色混凝土地面

物体列表：
- 5个立式圆柱储罐，直径4m高8m，不锈钢材质，呈L型排列，间距6m
- 储罐之间有DN300管道连接，带阀门节点
- 中心区域有2层钢结构平台，带围栏
- 地面有管廊桥架，高度2.5m

灯光设计：
- 蓝色点光源（#4488ff），安装在储罐顶部和平台栏杆，强度2.0，距离15m
- 暖白色点光源（#ffcc88），模拟照明灯，强度1.0，距离10m
- 环境光深蓝色（#112244），强度0.3
- 半球光，天空深蓝地面暗灰

粒子效果：
- 沿主管道蓝色流动粒子，流速中等
- 储罐顶部蒸汽逸散粒子，白色半透明
- 平台区域指示灯闪烁粒子，绿色

相机：初始位置高角度俯视，缓慢环绕动画
```

### 5.3 Step 2 — Scene DSL 生成器

**System Prompt:**

```
你是一个 Three.js 场景生成器。根据场景描述，输出严格的 Scene DSL JSON。

规则：
1. 坐标系统：Y轴向上，单位米(m)
2. 每个物体必须有：id, type, position, rotation, scale, material
3. 灯光必须有：id, type, color(hex), intensity, distance/angle
4. 粒子必须有：id, emitterType, count, color, path/area
5. 使用程序化布局，确保物体不重叠
6. 只输出JSON，不要任何额外文本

物体类型枚举：
- storage_tank: 立式储罐 {radius, height, roofType}
- horizontal_tank: 卧式储罐 {radius, length}
- pipe_segment: 管道段 {radius, path, hasValve}
- platform: 钢结构平台 {width, depth, height, hasRailing}
- building: 建筑 {width, depth, height, floors}
- pipe_rack: 管廊桥架 {width, height, length}
- flare_stack: 火炬塔 {height, tipRadius}
- cooling_tower: 冷却塔 {baseRadius, topRadius, height}
```

**JSON 输出示例：**

```json
{
  "version": "1.0.0",
  "metadata": {
    "name": "化工厂夜景",
    "prompt": "一个化工厂夜景，有储罐、管道、蓝色灯光、流动粒子效果",
    "generatedAt": "2026-01-15T10:30:00Z",
    "generator": "deepseek-chat"
  },
  "scene": {
    "background": {"type": "color", "value": "#0a0a1a"},
    "fog": {"type": "exp2", "color": "#112244", "density": 0.0008},
    "ground": {"type": "plane", "size": 80, "color": "#333333"},
    "skybox": "night_industrial"
  },
  "objects": [
    {
      "id": "tank_01",
      "type": "storage_tank",
      "position": {"x": -8, "y": 0, "z": 4},
      "rotation": {"x": 0, "y": 0, "z": 0},
      "params": {"radius": 2.0, "height": 8.0, "roofType": "dome"},
      "material": {"color": "#c0c0c0", "metalness": 0.85, "roughness": 0.25},
      "label": {"text": "T-101 原料储罐", "position": "top"}
    },
    {
      "id": "tank_02",
      "type": "storage_tank",
      "position": {"x": -2, "y": 0, "z": 4},
      "params": {"radius": 2.0, "height": 8.0, "roofType": "dome"},
      "material": {"color": "#c0c0c0", "metalness": 0.85, "roughness": 0.25},
      "label": {"text": "T-102 中间储罐", "position": "top"}
    },
    {
      "id": "tank_03",
      "type": "storage_tank",
      "position": {"x": 4, "y": 0, "z": 4},
      "params": {"radius": 2.0, "height": 8.0, "roofType": "dome"},
      "material": {"color": "#c0c0c0", "metalness": 0.85, "roughness": 0.25},
      "label": {"text": "T-103 成品储罐", "position": "top"}
    },
    {
      "id": "pipe_main_01",
      "type": "pipe_segment",
      "path": [
        {"x": -8, "y": 3, "z": 4},
        {"x": -5, "y": 3, "z": 1},
        {"x": -2, "y": 3, "z": 1},
        {"x": 1, "y": 3, "z": 1},
        {"x": 4, "y": 3, "z": 4}
      ],
      "params": {"radius": 0.15, "segments": 64, "hasValve": true},
      "material": {"color": "#8899aa", "metalness": 0.7, "roughness": 0.4}
    },
    {
      "id": "platform_01",
      "type": "platform",
      "position": {"x": -2, "y": 2.5, "z": 6},
      "params": {"width": 12, "depth": 4, "height": 2.5, "hasRailing": true},
      "material": {"color": "#555555", "metalness": 0.9, "roughness": 0.3}
    }
  ],
  "lights": [
    {
      "id": "ambient_01",
      "type": "ambient",
      "color": "#112244",
      "intensity": 0.3
    },
    {
      "id": "hemi_01",
      "type": "hemisphere",
      "skyColor": "#0a0a2e",
      "groundColor": "#1a1a1a",
      "intensity": 0.6
    },
    {
      "id": "point_blue_01",
      "type": "point",
      "position": {"x": -8, "y": 9, "z": 4},
      "color": "#4488ff",
      "intensity": 2.0,
      "distance": 15,
      "decay": 2,
      "castShadow": false
    },
    {
      "id": "point_blue_02",
      "type": "point",
      "position": {"x": -2, "y": 9, "z": 4},
      "color": "#4488ff",
      "intensity": 2.0,
      "distance": 15,
      "decay": 2
    },
    {
      "id": "point_blue_03",
      "type": "point",
      "position": {"x": 4, "y": 9, "z": 4},
      "color": "#4488ff",
      "intensity": 2.0,
      "distance": 15,
      "decay": 2
    },
    {
      "id": "point_warm_01",
      "type": "point",
      "position": {"x": -2, "y": 5.5, "z": 6},
      "color": "#ffcc88",
      "intensity": 1.0,
      "distance": 10,
      "decay": 2
    }
  ],
  "particles": [
    {
      "id": "flow_particles_01",
      "emitterType": "pipe_flow",
      "pathId": "pipe_main_01",
      "count": 5000,
      "color": "#4488ff",
      "size": 0.08,
      "speed": 0.5,
      "lifetime": 3.0,
      "opacity": 0.8
    },
    {
      "id": "steam_01",
      "emitterType": "steam",
      "originId": "tank_01",
      "offset": {"x": 0, "y": 8.5, "z": 0},
      "count": 2000,
      "color": "#ffffff",
      "size": 0.3,
      "speed": 0.2,
      "spread": 1.5,
      "lifetime": 5.0,
      "opacity": 0.15
    }
  ],
  "camera": {
    "initial": {
      "position": {"x": 15, "y": 12, "z": 15},
      "target": {"x": -2, "y": 4, "z": 4},
      "fov": 55
    },
    "animation": {
      "type": "orbit",
      "speed": 0.2,
      "radius": 20,
      "height": 12,
      "autoStart": true
    }
  },
  "postprocessing": {
    "bloom": {
      "enabled": true,
      "threshold": 0.6,
      "strength": 1.5,
      "radius": 0.5
    },
    "sao": {
      "enabled": false
    }
  }
}
```

### 5.4 Scene DSL 完整类型定义

```typescript
// types/scene-dsl.ts

interface SceneDSL {
  version: string
  metadata: SceneMetadata
  scene: SceneConfig
  objects: IndustrialObject[]
  lights: LightConfig[]
  particles: ParticleConfig[]
  labels?: LabelConfig[]
  camera: CameraConfig
  postprocessing: PostProcessingConfig
  animations?: AnimationConfig[]
}

interface SceneMetadata {
  name: string
  prompt: string
  generatedAt: string
  generator: 'deepseek-chat' | 'claude-sonnet-4-6'
  enhancedPrompt?: string
}

type ObjectType =
  | 'storage_tank'
  | 'horizontal_tank'
  | 'pipe_segment'
  | 'platform'
  | 'building'
  | 'pipe_rack'
  | 'flare_stack'
  | 'cooling_tower'
  | 'heat_exchanger'
  | 'pump'
  | 'valve_group'

interface IndustrialObject {
  id: string
  type: ObjectType
  position: Vec3
  rotation: Vec3
  scale?: Vec3
  params: Record<string, number | string | boolean>
  material: PBRMaterial
  label?: LabelConfig
  children?: IndustrialObject[]
  metadata?: Record<string, string>
}

type LightType = 'ambient' | 'hemisphere' | 'directional' | 'point' | 'spot' | 'rect'

interface LightConfig {
  id: string
  type: LightType
  position?: Vec3
  target?: Vec3
  color: string
  intensity: number
  distance?: number
  angle?: number
  penumbra?: number
  decay?: number
  castShadow?: boolean
}

type EmitterType = 'pipe_flow' | 'steam' | 'spark' | 'indicator' | 'ambient_dust'

interface ParticleConfig {
  id: string
  emitterType: EmitterType
  pathId?: string
  originId?: string
  offset?: Vec3
  count: number
  color: string
  size: number
  speed: number
  lifetime: number
  spread?: number
  opacity: number
  blending?: 'normal' | 'additive'
}

interface CameraConfig {
  initial: {
    position: Vec3
    target: Vec3
    fov: number
  }
  animation?: {
    type: 'orbit' | 'flythrough' | 'static'
    speed?: number
    radius?: number
    height?: number
    waypoints?: Vec3[]
    autoStart: boolean
  }
}

interface PostProcessingConfig {
  bloom: { enabled: boolean; threshold: number; strength: number; radius: number }
  sao: { enabled: boolean }
  fxaa?: { enabled: boolean }
  afterimage?: { enabled: boolean; damp: number }
}

interface Vec3 { x: number; y: number; z: number }

interface PBRMaterial {
  color: string
  metalness?: number
  roughness?: number
  emissive?: string
  emissiveIntensity?: number
  opacity?: number
  transparent?: boolean
  wireframe?: boolean
}

interface LabelConfig {
  text: string
  position: 'top' | 'center' | 'custom'
  offset?: Vec3
  fontSize?: number
  color?: string
  backgroundColor?: string
}
```

---

## 6. 项目目录结构

```
genscape/
├── public/
│   ├── textures/                    # 贴图资源
│   │   ├── environment/             # HDRI 环境贴图
│   │   ├── ground/                  # 地面纹理
│   │   ├── decals/                  # 贴花（锈迹、油污等）
│   │   └── particles/               # 粒子贴图
│   ├── models/                      # 静态模型 (GLTF/GLB)
│   │   ├── industrial/              # 工业设备模型
│   │   └── props/                   # 道具模型
│   └── favicon.ico
│
├── src/
│   ├── App.vue                      # 根组件
│   ├── main.ts                      # 入口
│   ├── router/
│   │   └── index.ts                 # Vue Router 配置
│   │
│   ├── views/                       # 页面
│   │   ├── HomeView.vue             # 首页/Hero
│   │   ├── EditorView.vue           # 主编辑器（核心页面）
│   │   ├── GalleryView.vue          # 场景画廊
│   │   ├── DocsView.vue             # 文档/API
│   │   └── SettingsView.vue         # 设置
│   │
│   ├── components/                  # Vue 组件
│   │   ├── layout/                  # 布局组件
│   │   │   ├── AppHeader.vue        # 顶部导航
│   │   │   ├── AppSidebar.vue       # 侧边栏
│   │   │   ├── PanelContainer.vue   # 可拖拽面板容器
│   │   │   └── StatusBar.vue        # 底部状态栏
│   │   │
│   │   ├── panels/                  # 功能面板
│   │   │   ├── PromptPanel.vue      # Prompt 输入面板
│   │   │   ├── SceneGraphPanel.vue  # 场景树面板
│   │   │   ├── PropertiesPanel.vue  # 属性编辑面板
│   │   │   ├── AssetLibrary.vue     # 资产库面板
│   │   │   ├── TimelinePanel.vue    # 动画时间线
│   │   │   ├── ExportPanel.vue      # 导出面板
│   │   │   └── HistoryPanel.vue     # 生成历史
│   │   │
│   │   ├── scene/                   # 场景相关 UI
│   │   │   ├── SceneViewport.vue    # 3D 视口容器
│   │   │   ├── LoadingOverlay.vue   # 生成加载动画
│   │   │   ├── MiniMap.vue          # 小地图
│   │   │   └── Toolbar.vue          # 3D 工具栏
│   │   │
│   │   └── shared/                  # 共享 UI 组件
│   │       ├── CodeEditor.vue       # JSON 代码编辑器
│   │       ├── ColorPicker.vue      # 颜色选择器
│   │       ├── Vec3Input.vue        # 三维向量输入
│   │       └── StreamText.vue       # 流式文本显示
│   │
│   ├── three/                       # Three.js 核心层
│   │   ├── GenScapeScene.ts         # 场景管理器（主入口）
│   │   ├── SceneBuilder.ts          # DSL → Three.js 转换器
│   │   ├── SceneExporter.ts         # 场景导出（JSON/GLB/HTML）
│   │   │
│   │   ├── renderer/
│   │   │   ├── RendererFactory.ts   # 渲染器工厂 (WebGL/WebGPU)
│   │   │   └── WebGPUBackend.ts     # WebGPU 后端 (实验性)
│   │   │
│   │   ├── objects/                 # 工业物体工厂
│   │   │   ├── BaseFactory.ts       # 工厂基类
│   │   │   ├── StorageTankFactory.ts
│   │   │   ├── HorizontalTankFactory.ts
│   │   │   ├── PipeFactory.ts       # 管道生成（含 CatmullRom 路径）
│   │   │   ├── PlatformFactory.ts
│   │   │   ├── BuildingFactory.ts
│   │   │   ├── PipeRackFactory.ts
│   │   │   ├── FlareStackFactory.ts
│   │   │   ├── CoolingTowerFactory.ts
│   │   │   └── index.ts             # 工厂注册表
│   │   │
│   │   ├── lighting/
│   │   │   ├── LightManager.ts      # 灯光管理器
│   │   │   └── LightPresets.ts      # 灯光预设
│   │   │
│   │   ├── particles/
│   │   │   ├── ParticleSystem.ts    # 粒子系统管理器
│   │   │   ├── emitters/
│   │   │   │   ├── FlowEmitter.ts   # 管道流动粒子
│   │   │   │   ├── SteamEmitter.ts  # 蒸汽粒子
│   │   │   │   ├── SparkEmitter.ts  # 火花粒子
│   │   │   │   └── AmbientEmitter.ts # 环境粒子
│   │   │   └── shaders/
│   │   │       ├── particle.vert    # 粒子顶点着色器
│   │   │       └── particle.frag    # 粒子片元着色器
│   │   │
│   │   ├── postprocessing/
│   │   │   ├── EffectComposer.ts    # 后期合成器
│   │   │   └── presets/
│   │   │       ├── nightIndustrial.ts  # 夜景工业预设
│   │   │       └── daylightClean.ts    # 白天干净预设
│   │   │
│   │   ├── labels/
│   │   │   ├── LabelManager.ts      # 标签管理器
│   │   │   └── LabelBillboard.ts    # 公告牌标签
│   │   │
│   │   ├── camera/
│   │   │   ├── CameraController.ts  # 相机控制器
│   │   │   └── CameraAnimations.ts  # 预设动画路径
│   │   │
│   │   ├── controls/
│   │   │   ├── OrbitControlSetup.ts # 轨道控制配置
│   │   │   └── InteractionManager.ts # 交互管理（拾取、高亮）
│   │   │
│   │   └── utils/
│   │       ├── GridHelper.ts        # 自定义网格
│   │       ├── ShadowSetup.ts       # 阴影配置
│   │       └── Performance.ts       # 性能监控
│   │
│   ├── ai/                          # AI 服务层
│   │   ├── AIService.ts             # AI 服务基类
│   │   ├── providers/
│   │   │   ├── DeepSeekProvider.ts  # DeepSeek API
│   │   │   └── ClaudeProvider.ts    # Claude API
│   │   ├── prompts/
│   │   │   ├── enhancer.ts          # Prompt 增强 System Prompt
│   │   │   ├── sceneGenerator.ts    # Scene DSL 生成 System Prompt
│   │   │   ├── labelGenerator.ts    # 标签生成 Prompt
│   │   │   └── layoutOptimizer.ts   # 布局优化 Prompt
│   │   ├── streamParser.ts          # SSE 流式解析
│   │   └── responseValidator.ts     # AI 输出 JSON 校验
│   │
│   ├── store/                       # Pinia 状态管理
│   │   ├── index.ts                 # Pinia 实例
│   │   ├── modules/
│   │   │   ├── scene.store.ts       # 场景状态
│   │   │   ├── prompt.store.ts      # Prompt 状态
│   │   │   ├── ui.store.ts          # UI 状态（面板显隐、主题）
│   │   │   ├── assets.store.ts      # 资产库状态
│   │   │   └── history.store.ts     # 生成历史状态
│   │   └── types.ts                 # Store 类型定义
│   │
│   ├── composables/                 # Vue Composables
│   │   ├── useScene.ts              # 场景操作组合式函数
│   │   ├── useAI.ts                 # AI 调用组合式函数
│   │   ├── useCamera.ts             # 相机操作
│   │   ├── useExport.ts             # 导出功能
│   │   ├── useHotkey.ts             # 快捷键
│   │   ├── useRaycasting.ts         # 拾取交互
│   │   └── usePerformance.ts        # 性能监控
│   │
│   ├── types/                       # TypeScript 类型
│   │   ├── scene-dsl.ts             # Scene DSL 完整类型
│   │   ├── industrial.ts            # 工业对象类型
│   │   ├── material.ts              # 材质类型
│   │   └── api.ts                   # API 请求/响应类型
│   │
│   ├── utils/                       # 工具函数
│   │   ├── math.ts                  # 数学工具
│   │   ├── color.ts                 # 颜色转换
│   │   ├── id.ts                    # ID 生成
│   │   ├── debounce.ts              # 防抖
│   │   └── download.ts              # 文件下载
│   │
│   └── assets/                      # 前端静态资源
│       ├── styles/
│       │   ├── variables.css         # CSS 变量（主题色等）
│       │   ├── global.css            # 全局样式
│       │   └── hud.css               # HUD 风格样式
│       └── icons/                    # SVG 图标
│
├── tests/
│   ├── unit/
│   │   ├── ai/
│   │   │   └── responseValidator.test.ts
│   │   ├── three/
│   │   │   ├── SceneBuilder.test.ts
│   │   │   └── StorageTankFactory.test.ts
│   │   └── store/
│   │       └── scene.store.test.ts
│   ├── e2e/
│   │   └── editor.spec.ts
│   └── fixtures/
│       └── sample-scenes/            # 测试用 Scene DSL 样本
│           ├── chemical-plant-night.json
│           └── warehouse-day.json
│
├── docs/
│   ├── scene-dsl-spec.md            # Scene DSL 规范文档
│   ├── api-reference.md             # API 参考
│   ├── contributing.md              # 贡献指南
│   └── examples/                    # 示例截图/GIF
│
├── scripts/
│   ├── dev.sh                       # 开发启动脚本
│   └── build.sh                     # 构建脚本
│
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── .env.example                     # API Key 模板
├── .eslintrc.cjs
├── .prettierrc
├── Dockerfile
├── docker-compose.yml
├── nginx.conf
└── README.md
```

---

## 7. 开发路线

### 第一周：基础设施 + MVP 核心管线

**目标：跑通 Prompt → JSON → Scene 的完整链路**

| 天 | 任务 | 产出 |
|----|------|------|
| Day 1 | 项目脚手架：Vite + Vue3 + TS + TresJS + Element Plus + Pinia + Router | 可运行空项目 |
| Day 2 | Scene DSL 类型定义 + JSON Schema 校验 + 样本数据 | `types/scene-dsl.ts` + 3 个测试样本 |
| Day 3 | Three.js 核心层：GenScapeScene + SceneBuilder + RendererFactory | 能根据 JSON 渲染基本几何体 |
| Day 4 | 工业物体工厂：StorageTank + Pipe + Platform | 三个带 PBR 材质的物体 |
| Day 5 | DeepSeek API 接入 + Prompt Enhancer + Scene Generator | AI 返回合法 Scene DSL JSON |
| Day 6 | 核心 UI：PromptPanel + SceneViewport + LoadingOverlay | 输入文字 → 看到场景 |
| Day 7 | 联调、测试、修 Bug、录制 Demo GIF | 可演示的 MVP |

### 第二周：完善 + 品质提升

| 天 | 任务 | 产出 |
|----|------|------|
| Day 8 | 灯光系统：LightManager + LightPresets + 所有光源类型 | 完整灯光 |
| Day 9 | 粒子系统：ParticleSystem + Flow/Steam/Spark Emitter | 流动粒子 + 蒸汽 |
| Day 10 | 标签系统：LabelManager + CSS2DRenderer + 智能避让 | 场景标签 |
| Day 11 | 后期处理：Bloom + SAO + SMAA + 预设切换 | 画质提升 |
| Day 12 | 相机控制 + 动画：OrbitControl + 自动环绕 + 预设视角 | 相机动画 |
| Day 13 | 场景导出：JSON 导出 + 截图 + 独立 HTML 导出 | 3 种导出方式 |
| Day 14 | UI 完善：侧边栏 + 场景图面板 + 属性面板 + 深色主题 | 完整编辑器 UI |

### 第三周：打磨 + 文档 + 发布

| 天 | 任务 | 产出 |
|----|------|------|
| Day 15 | 错误处理：AI 超时重试、JSON 校验修复、网络异常 | 健壮性 |
| Day 16 | 性能优化：LOD、实例化渲染、阴影优化 | 60fps 保证 |
| Day 17 | 响应式布局 + 移动端适配（只读模式） | 多端支持 |
| Day 18 | 资产库面板 + 快捷模板（5 个预设场景） | 模板系统 |
| Day 19 | 单元测试 + E2E 测试 + CI 配置 | 测试覆盖 |
| Day 20 | 文档：README + Scene DSL 规范 + API 文档 + 示例 | 完整文档 |
| Day 21 | Docker 部署配置 + Vercel 部署 + 发布 v0.1.0 | 上线 |

---

## 8. UI 风格设计

### 8.1 整体风格定位

**科技工业风 + 深色 HUD 风格**

参考：
- 钢铁侠 Jarvis 界面
- Tesla 中控大屏
- 工业 DCS/SCADA 监控系统
- Blender 暗色主题

### 8.2 配色方案

```css
:root {
  /* 背景 */
  --bg-primary: #0a0e17;       /* 最深背景 */
  --bg-secondary: #111827;     /* 面板背景 */
  --bg-tertiary: #1a2235;      /* 卡片/输入框背景 */
  --bg-elevated: #1e293b;      /* 悬浮层 */

  /* 品牌色 */
  --accent-primary: #00d4ff;   /* 主强调色（电光蓝） */
  --accent-secondary: #6366f1; /* 次要强调色（靛蓝紫） */
  --accent-success: #10b981;   /* 成功/正常（翠绿） */
  --accent-warning: #f59e0b;   /* 警告（琥珀） */
  --accent-danger: #ef4444;    /* 危险/告警（红） */

  /* 文字 */
  --text-primary: #e2e8f0;     /* 主文字 */
  --text-secondary: #94a3b8;   /* 次要文字 */
  --text-muted: #64748b;       /* 弱化文字 */
  --text-accent: #00d4ff;      /* 高亮文字 */

  /* 边框 */
  --border-default: #1e293b;   /* 默认边框 */
  --border-active: #00d4ff;    /* 激活边框 */
  --border-subtle: rgba(0, 212, 255, 0.15); /* 发光边框 */

  /* 特效 */
  --glow-primary: 0 0 15px rgba(0, 212, 255, 0.3);
  --glow-strong: 0 0 30px rgba(0, 212, 255, 0.5);
}
```

### 8.3 排版

- 字体：`Inter`（英文/数字）+ `HarmonyOS Sans`（中文）
- 等宽字体：`JetBrains Mono`（代码/Prompt 输入）
- 字号层级：10px / 12px / 14px / 16px / 20px / 28px
- 行高：1.5（正文）/ 1.2（标题）

### 8.4 动效设计

| 场景 | 动效 | 时长 | 缓动 |
|------|------|------|------|
| 面板展开 | 从右滑入 + 淡入 | 250ms | cubic-bezier(0.16, 1, 0.3, 1) |
| 面板收起 | 向右滑出 + 淡出 | 200ms | ease-in |
| 按钮 hover | 边框发光 + 微放大 1.02x | 150ms | ease-out |
| 场景加载 | 环形扫描线旋转 | 循环 | linear |
| 数据刷新 | 数字跳变 + 行高亮闪烁 | 300ms | ease-out |
| 标签出现 | 向上浮入 + 淡入 | 400ms | ease-out |
| Prompt 流式输出 | 逐字出现 + 光标闪烁 | 实时 | — |
| 3D 物体选中 | 轮廓发光 + 外描边 | 200ms | ease-out |
| 场景切换 | 全屏暗幕过渡 + 新场景淡入 | 600ms | ease-in-out |

### 8.5 HUD 风格组件规范

**Panel 面板：**
- 背景：`rgba(17, 24, 39, 0.85)` + `backdrop-filter: blur(12px)`
- 边框：1px solid `--border-subtle`
- 圆角：8px
- 顶部有一条 2px 渐变装饰线（从左到右：transparent → accent → transparent）

**按钮：**
- Primary：实心电光蓝背景 + 白色文字 + hover 发光
- Secondary：透明 + 1px 边框 + hover 背景微亮
- Ghost：纯文字 + hover 下划线

**输入框：**
- 深色背景 + 底部单线边框
- Focus 时底部线变为电光蓝 + 发光

**3D 视口：**
- 无边框，占据主区域
- 四角有微妙的扫描线角标装饰
- 右下角显示 FPS 和物体数量（小号等宽字体, 半透明）

---

## 9. 后期扩展方向

### 9.1 数字孪生平台化（v1.0+）

从"场景生成工具"进化为"数字孪生操作系统"：

- 多场景管理：场景列表、分组、标签
- 实时数据接入：MQTT / WebSocket / OPC UA 连接器
- 数据可视化：热力图、流向图、仪表盘叠加
- 告警联动：数据异常 → 场景高亮 → 通知推送
- 历史回放：场景状态快照 + 时间轴回放

### 9.2 AI 运维助手（v1.5+）

- 自然语言查询："显示所有温度超过 60 度的储罐"
- AI 异常检测：自动识别场景中的数据异常模式
- AI 根因分析：结合设备拓扑图推理故障原因
- 语音交互：语音指令控制场景导航

### 9.3 AI 巡检（v1.5+）

- 自动规划巡检路线（最短路径覆盖所有关键设备）
- 巡检过程视频录制 + AI 异常标注
- 巡检报告自动生成（Markdown/PDF）
- 巡检历史对比（两次巡检场景差异高亮）

### 9.4 工业元宇宙（v2.0+）

- 多人协同：WebRTC 多人同时浏览和标注
- VR/AR 支持：WebXR API 集成
- 数字人讲解：3D 虚拟导游 + LipSync + TTS
- 空间音频：基于位置的 3D 音效
- 物理模拟：流体、爆炸、结构应力模拟

### 9.5 WebGPU 全面迁移（v2.0+）

- 延迟渲染管线：支持大量动态光源
- GPU 粒子：百万级粒子实时模拟
- 光线追踪：实时反射、折射、软阴影
- 计算着色器：流体模拟、烟雾扩散

### 9.6 BIM/GIS 集成（v2.5+）

- BIM 模型导入：IFC 格式解析
- GIS 底图叠加：Cesium/Mapbox 集成
- 室内外无缝切换：从城市地图缩放到建筑内部
- 倾斜摄影模型加载：3D Tiles 支持

### 9.7 开放生态

- 插件系统：第三方可开发模型工厂、特效、数据连接器
- npm 包 `@genscape/core`：独立的场景渲染库
- 社区资产市场：上传/下载工业模型和场景模板
- REST API：场景生成 API 服务

---

## 10. 快速开始

### 前置要求

- Node.js >= 20
- pnpm >= 9

### 安装

```bash
# 克隆仓库
git clone https://github.com/your-org/genscape.git
cd genscape

# 安装依赖
pnpm install

# 配置 API Key
cp .env.example .env
# 编辑 .env，填入你的 DeepSeek 或 Claude API Key
# VITE_DEEPSEEK_API_KEY=sk-xxx
# VITE_CLAUDE_API_KEY=sk-ant-xxx

# 启动开发服务器
pnpm dev
```

打开 http://localhost:5173

### Docker 部署

```bash
docker-compose up -d
```

---

## License

MIT © 2026 GenScape

---

<p align="center">
  <sub>Built with ❤️ by GenScape Team</sub>
</p>
