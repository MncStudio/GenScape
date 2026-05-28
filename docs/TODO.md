# GenScape 下阶段任务计划

## 一、渲染修复（紧急）

### 1.1 材质颜色不生效
- **现象**: 物体呈浅灰色，AI 指定的颜色没有正确渲染
- **原因分析**: 各 Factory 先用裸 `new THREE.MeshStandardMaterial()`（默认白色）创建 mesh，再由 `applyMaterial()` 覆盖。需排查 `applyMaterial()` 是否被正确调用，或 AI 是否输出了有效颜色值。`responseValidator.ts` 的 fallback 颜色是 `#888888`（灰色）
- **待办**:
  - [ ] 检查 AI 实际返回的 material.color 值
  - [ ] 确认 `applyMaterial()` 调用在 `create()` 方法中先于 `setTransform()`
  - [ ] 考虑将 fallback 颜色改为更明显的颜色以便调试

### 1.2 面朝向 — 背面不可见
- **现象**: 只能看到顶部轮廓，旋转到侧面/正面时物体消失
- **原因**: `BaseFactory.applyMaterial()` 未设置 `side` 属性，默认 `THREE.FrontSide`，导致背面不可见。CoolingTowerFactory 部分 ring geometry 用了 `openEnded: true` + `DoubleSide`，但其他工厂没有
- **修复方案**: 在 `applyMaterial()` 中添加 `side: THREE.DoubleSide`，或为封闭几何体保持 FrontSide 但确保 normals 方向正确
- **推荐**: 先加 DoubleSide 快速验证，后续优化

### 1.3 正对视角纯灰色画面
- **可能原因**: 相机初始位置在物体内部、fog 颜色覆盖、或缺少光源时材质无光照呈灰色
- **待办**:
  - [ ] 检查相机初始位置是否合理（默认 15,12,15 → target 0,4,0）
  - [ ] 验证内置光源生效后此问题是否改善

---

## 二、内置光源手动控制

### 2.1 内置光源需在 UI 中可见可调
- **现状**: `createDefaultScene()` 创建了 3 个内置光源（ambient/key/fill），但它们不在 DSL 的 lights 数组中，SceneGraphPanel 的光源列表显示为空，用户无法调整
- **方案**: 
  - 方案A: 在 scene store 中初始化时，将内置光源注入到 DSL.lights 中，让 SceneGraphPanel 自然展示
  - 方案B: 新增专门的"场景光源"面板，独立展示这 3 个内置光，带强度/颜色/位置滑块
- **推荐方案B**: 更直观，不影响 DSL 结构

### 2.2 可调参数
- Ambient: color, intensity
- Key Light: color, intensity, position (x/y/z), castShadow
- Fill Light: color, intensity, position (x/y/z)

---

## 三、场景编辑增强

### 3.1 物体 PBR 属性编辑
- **现状**: 编辑面板只有颜色、位置、缩放
- **待加**: metalness, roughness 滑块（0-1），emissive 颜色选择器

### 3.2 物体删除/添加
- **现状**: 只能修改已有物体，不能删除或新增
- **待加**: 删除按钮（从 DSL + 场景中移除）、新增物体入口

### 3.3 选中高亮
- **现状**: 点击物体列表项后 3D 场景中无视觉反馈
- **待加**: outline/发光效果标识选中物体

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

- WebGPU 后处理不支持（BloomComposer 仅 WebGL）
- `useScene.ts` 同时被静态和动态 import，构建 warning
- Factory 中先创建裸材质再覆盖的方式造成瞬时白色闪烁
- `responseValidator.fixObject()` 的 fallback 颜色 `#888888` 与物体 "灰色" 问题相关
