import type { SceneDSL, IndustrialObject, LightConfig } from '@/types/scene-dsl'

/**
 * 校验并修复 AI 返回的 Scene DSL JSON
 */
export function validateAndFixSceneDSL(rawJson: string, prompt: string): SceneDSL {
  let parsed: any

  // 尝试提取 JSON（AI 可能会用 markdown 代码块包裹）
  const jsonMatch = rawJson.match(/```(?:json)?\s*([\s\S]*?)```/)
  let jsonStr = jsonMatch ? jsonMatch[1].trim() : rawJson.trim()

  try {
    parsed = JSON.parse(jsonStr)
  } catch (e) {
    // 尝试修复被截断的 JSON
    const repaired = tryRepairTruncatedJSON(jsonStr)
    if (repaired) {
      try {
        parsed = JSON.parse(repaired)
        console.warn('[responseValidator] JSON 被截断，已尝试修复')
      } catch (e2) {
        throw new Error(`AI 返回的 JSON 格式无效（截断修复失败）: ${(e as Error).message}`)
      }
    } else {
      throw new Error(`AI 返回的 JSON 格式无效: ${(e as Error).message}`)
    }
  }

  // 填充默认值
  const dsl: SceneDSL = {
    version: parsed.version ?? '1.0.0',
    metadata: {
      name: parsed.metadata?.name ?? '未命名场景',
      prompt,
      generatedAt: new Date().toISOString(),
      generator: parsed.metadata?.generator ?? 'deepseek-chat',
      enhancedPrompt: parsed.metadata?.enhancedPrompt,
    },
    scene: {
      background: parsed.scene?.background ?? { type: 'color', value: '#0a0a1a' },
      fog: parsed.scene?.fog,
      ground: parsed.scene?.ground ?? { type: 'plane', size: 80, color: '#333333' },
      skybox: parsed.scene?.skybox,
    },
    objects: (parsed.objects ?? []).map((obj: any, i: number) => fixObject(obj, i)),
    lights: (parsed.lights ?? []).map((l: any, i: number) => fixLight(l, i)),
    particles: parsed.particles ?? [],
    camera: {
      initial: {
        position: parsed.camera?.initial?.position ?? { x: 15, y: 12, z: 15 },
        target: parsed.camera?.initial?.target ?? { x: 0, y: 4, z: 0 },
        fov: parsed.camera?.initial?.fov ?? 55,
      },
      animation: parsed.camera?.animation ?? {
        type: 'orbit',
        speed: 0.2,
        radius: 20,
        height: 12,
        autoStart: true,
      },
    },
    postprocessing: {
      bloom: parsed.postprocessing?.bloom ?? {
        enabled: true, threshold: 0.6, strength: 1.5, radius: 0.5,
      },
      sao: parsed.postprocessing?.sao ?? { enabled: false },
    },
  }

  return dsl
}

function fixObject(obj: any, index: number): IndustrialObject {
  return {
    id: obj.id ?? `object_${index}`,
    type: obj.type ?? 'storage_tank',
    position: { x: obj.position?.x ?? 0, y: obj.position?.y ?? 0, z: obj.position?.z ?? 0 },
    rotation: { x: obj.rotation?.x ?? 0, y: obj.rotation?.y ?? 0, z: obj.rotation?.z ?? 0 },
    scale: obj.scale,
    params: obj.params ?? {},
    material: {
      color: obj.material?.color ?? '#557799',
      metalness: obj.material?.metalness ?? 0.5,
      roughness: obj.material?.roughness ?? 0.5,
      emissive: obj.material?.emissive,
      emissiveIntensity: obj.material?.emissiveIntensity,
      side: obj.material?.side,
    },
    label: obj.label,
  }
}

/**
 * 尝试修复被 max_tokens 截断的 JSON
 */
function tryRepairTruncatedJSON(json: string): string | null {
  let result = ''
  let inString = false
  let escape = false
  const stack: Array<'object' | 'array'> = []

  for (let i = 0; i < json.length; i++) {
    const ch = json[i]
    result += ch

    if (escape) {
      escape = false
      continue
    }

    if (ch === '\\' && inString) {
      escape = true
      continue
    }

    if (ch === '"') {
      inString = !inString
      continue
    }

    if (inString) continue

    if (ch === '{') {
      stack.push('object')
    } else if (ch === '[') {
      stack.push('array')
    } else if (ch === '}') {
      if (stack[stack.length - 1] === 'object') stack.pop()
    } else if (ch === ']') {
      if (stack[stack.length - 1] === 'array') stack.pop()
    }
  }

  // 没有未闭合的结构，不需要修复
  if (stack.length === 0 && !inString) return null

  // 如果截断在字符串中间，先关闭字符串
  if (inString) result += '"'

  // 逐层关闭括号
  while (stack.length > 0) {
    const type = stack.pop()
    if (type === 'object') {
      // 检查最后一个非空白字符是不是 , 或 {
      const trimmed = result.trimEnd()
      if (trimmed.endsWith('{')) {
        result += '}'
      } else if (trimmed.endsWith(',')) {
        // 去掉末尾逗号再闭合
        result = result.substring(0, result.lastIndexOf(',')) + '}'
      } else if (trimmed.endsWith(':')) {
        result += 'null}'
      } else {
        result += '}'
      }
    } else {
      // 处理数组截断类似
      const trimmed = result.trimEnd()
      if (trimmed.endsWith('[')) {
        result += ']'
      } else if (trimmed.endsWith(',')) {
        result = result.substring(0, result.lastIndexOf(',')) + ']'
      } else if (trimmed.endsWith(':')) {
        result += 'null]'
      } else {
        result += ']'
      }
    }
  }

  return result
}

function fixLight(l: any, index: number): LightConfig {
  return {
    id: l.id ?? `light_${index}`,
    type: l.type ?? 'point',
    position: l.position,
    color: l.color ?? '#ffffff',
    intensity: l.intensity ?? 1.0,
    distance: l.distance,
    angle: l.angle,
    penumbra: l.penumbra,
    decay: l.decay ?? 2,
    castShadow: l.castShadow ?? false,
  }
}
