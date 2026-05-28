# GenScape 下阶段任务计划

## 一、渲染修复（紧急）

### 1.1 材质颜色不生效 ✅
- **现象**: 物体呈浅灰色，AI 指定的颜色没有正确渲染
- **修复内容**:
  - `responseValidator.fixObject()` fallback 颜色从 `#888888` 改为 `#557799`（工业蓝灰色）
  - 补充 emissive/emissiveIntensity/side 字段的 fallback
  - `BaseFactory.applyMaterial()` 添加 `side: THREE.DoubleSide` 默认值
  - `PBRMaterial` 类型添加 `side?: number` 字段

### 1.2 面朝向 — 背面不可见 ✅
- **修复**: `BaseFactory.applyMaterial()` 默认 `side: THREE.DoubleSide`
- 同时保留通过 DSL material.side 字段手动控制的能力

### 1.3 正对视角纯灰色画面 ✅
- **修复**: 相机 lookAt 和 controls target 统一为 (0, 4, 0)
- 环境光默认强度 0.6，漫反射色 #557799 应使物体明显可见

---

## 二、内置光源手动控制 ✅

### 2.1 内置光源可在 UI 中调整
- 在光源列表中新增"内置光源"分区，显示 3 个内置光
- 支持颜色、强度、位置（非 ambient）、阴影开关（key light）的实时调节
- 直接操作 Three.js 光源对象，不修改 DSL

### 2.2 可调参数
- Ambient: color, intensity ✅
- Key Light: color, intensity, position (x/y/z), castShadow ✅
- Fill Light: color, intensity, position (x/y/z) ✅

---

## 三、场景编辑增强 ✅

### 3.1 物体 PBR 属性编辑 ✅
- 新增 metalness 滑块 (0-1)
- 新增 roughness 滑块 (0-1)
- 新增 emissive 自发光颜色选择器（支持清除）

### 3.2 物体删除 ✅
- 每个物体列表项右侧添加 × 删除按钮
- 点击从 DSL + 3D 场景中移除

### 3.3 选中高亮 ✅
- `GenScapeScene.highlightObject()` 方法：设置选中物体 emissive 为 #00d4ff 高亮
- 切换选中时自动恢复上一物体的原始 emissive
- 场景重建后自动重新应用高亮

---

## 四、待开发面板

### 4.1 提示面板 (PromptPanel) — 已存在，待确认
- 输入框 + 预设模板 + 增强/生成状态展示

### 4.2 资产库面板 — 未实现
- 预制模型库，拖拽添加到场景

### 4.3 历史面板 — 未实现
- 历史生成的场景记录，可回溯加载

### 4.4 动画/时间轴面板 — 未实现
- 相机动画、物体动画的时间轴编辑

---

## 五、已知技术债务

- UI 全面 SpaceX 风格：纯黑背景、Spectral White 文字、Ghost 按钮、零阴影、零装饰 ✅
- Element Plus 组件已统一 SpaceX 风格：扩展 --el-* CSS 变量 + 组件类名级别覆盖（uppercase、去 focus shadow 等）
- 暂存改为手动模式：仅点击"暂存"按钮保存，刷新后需手动"加载暂存"恢复
- scene.environment 已通过 PMREMGenerator 程序化生成（#8899cc 天空色），WebGL only
- 场景大小限制：responseValidator 钳制物体 x/z 到 [-35, 35]
- WebGPU 后处理不支持（BloomComposer 仅 WebGL）
- `useScene.ts` 同时被静态和动态 import，构建 warning
- Factory 中先创建裸材质再覆盖的方式造成瞬时白色闪烁（已缓解：fallback 颜色改为可见色）
