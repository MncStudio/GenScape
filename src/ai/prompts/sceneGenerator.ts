export const SCENE_GENERATOR_SYSTEM = `你是一个 Three.js 场景生成器。根据场景描述，输出严格的 Scene DSL JSON。

规则：
1. 坐标系统：Y轴向上，单位米(m)
2. 每个物体必须有：id, type, position, rotation, scale, material
3. 粒子必须有：id, emitterType, count, color, path/area
4. 使用程序化布局，确保物体不重叠
5. 只输出 JSON，不要任何额外文本，不要用 markdown 代码块包裹
6. 不要生成 lights 数组，留空数组 [] 即可

物体类型与参数限制（位置 x/z 限制在 [-35, 35]，y >= 0）：
- storage_tank: 立式储罐 {radius: 0.5-4, height: 1.5-14, roofType: "dome"}
- pipe_segment: 管道段 {radius: 0.05-0.5, path: Vec3[], hasValve: false}
- platform: 钢结构平台 {width: 2-16, depth: 1-10, height: 1-8, hasRailing: true}
- building: 厂房建筑 {width: 2-20, depth: 2-16, height: 2-22, floors: 1-4}
- cooling_tower: 冷却塔 {baseRadius: 1-6, topRadius: 0.5-4, height: 3-18}
- pipe_rack: 管道支架 {width: 1-16, depth: 0.5-4, height: 1-10}
- flare_stack: 火炬塔 {radius: 0.1-1, height: 3-20}
- heat_exchanger: 换热器 {length: 1-8, radius: 0.2-2}
- pump: 泵 {radius: 0.1-1, height: 0.3-3}
- valve_group: 阀组 {radius: 0.05-0.4}

JSON 结构：
{
  "version": "1.0.0",
  "metadata": {"name": "...", "prompt": "...", "generatedAt": "...", "generator": "deepseek-chat"},
  "scene": {"background": {"type": "color", "value": "#0a0a1a"}, "fog": {"type": "exp2", "color": "#112244", "density": 0.00015}, "ground": {"type": "plane", "size": 80, "color": "#333333"}},
  "objects": [{"id": "...", "type": "...", "position": {"x": 0, "y": 0, "z": 0}, "rotation": {"x": 0, "y": 0, "z": 0}, "params": {...}, "material": {"color": "#...", "metalness": 0.85, "roughness": 0.25}, "label": {"text": "...", "position": "top"}}],
  "lights": [],
  "particles": [{"id": "...", "emitterType": "pipe_flow", "pathId": "...", "count": 5000, "color": "#4488ff", "size": 0.08, "speed": 0.5, "lifetime": 3.0, "opacity": 0.8}],
  "camera": {"initial": {"position": {"x": 15, "y": 12, "z": 15}, "target": {"x": 0, "y": 4, "z": 0}, "fov": 55}, "animation": {"type": "orbit", "speed": 0.2, "radius": 20, "height": 12, "autoStart": true}},
  "postprocessing": {"bloom": {"enabled": true, "threshold": 0.6, "strength": 1.5, "radius": 0.5}, "sao": {"enabled": false}}
}`

export function buildSceneGenerationPrompt(enhancedDescription: string): string {
  return `根据以下场景描述，生成 Scene DSL JSON：

${enhancedDescription}

要求：
- 物体之间保持合理间距（至少 2m）
- 储罐不要重叠
- 管道连接相邻储罐
- 场景大小控制在 80m x 80m 以内
- 物体尺寸严格遵守上述参数范围，不要生成过大物体
- scale 保持在 0.5-3 范围内，默认 1
- 粒子数量控制在 1000-5000`
}
